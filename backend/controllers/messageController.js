// controllers/messageController.js
const Message = require('../models/Message');
const MessageRecipient = require('../models/MessageRecipient');
const User = require('../models/User');
const path = require('path');
const sendEmail = require('../utils/sendEmail');

let ioInstance = null;

// CONFIGURATION DE SOCKET.IO

// Fonction qui permet d'injecter l'instance de Socket.IO dans le contrôleur
const setSocketIO = (io) => {
  
  // Stocke l'instance de Socket.IO dans une variable globale (ioInstance)
  ioInstance = io;
};

// ENVOI TEXTE SEUL
// Fonction qui gère l'envoi d'un message (texte seul ou avec fichier)
const sendBroadcast = async (req, res) => {
  try {
    // Récupération des données envoyées par le frontend via FormData
    let { content = '', recipientIds } = req.body;

    // Conversion de recipientIds (qui arrive en string JSON) en tableau JavaScript
    if (typeof recipientIds === 'string') {
      try {
        recipientIds = JSON.parse(recipientIds);
      } catch {
        return res.status(400).json({ message: 'recipientIds invalide (doit être un tableau JSON)' });
      }
    }

    // Validation des données obligatoires
    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res.status(400).json({ message: 'Sélectionnez au moins un destinataire' });
    }

    if (!content.trim() && !req.file) {
      return res.status(400).json({ message: 'Ajoutez un message ou un fichier' });
    }

    // Préparation des informations du fichier si un fichier a été joint
    const fileData = req.file ? {
      fileName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype
    } : {};

    // Création du message dans la collection "messages"
    const message = await Message.create({
      sender: req.user._id,
      content: content.trim(),
      ...fileData
    });

    // Création des relations "Message, destinataire" pour chaque utilisateur sélectionné
    const recipientsData = recipientIds.map(id => ({
      message: message._id,
      user: id
    }));

    await MessageRecipient.insertMany(recipientsData);

    // Envoi de la notification en temps réel via Socket.IO à chaque destinataire
    if (ioInstance) {
      recipientIds.forEach(userId => {
        ioInstance.to(userId.toString()).emit('newMessage', {
          messageId: message._id.toString(),
          sender: req.user.username,
          content: message.content || '(Fichier joint)',
          fileName: message.fileName || null,
          fileUrl: message.filePath ? `http://localhost:${process.env.PORT || 5000}${message.filePath}` : null,
          hasFile: !!message.filePath,
          timestamp: message.createdAt
        });
      });
    }

    // Envoi d'un email aux utilisateurs qui ne sont pas connectés
    await notifyOfflineUsers(recipientIds, {
      sender: req.user.username,
      content: message.content || '(Fichier joint)',
      fileName: message.fileName,
      fileUrl: message.filePath ? `http://localhost:${process.env.PORT || 5000}${message.filePath}` : null
    });

    // Envoie les reponses en json
    res.status(201).json({
      success: true,
      message: `Message envoyé à ${recipientIds.length} utilisateur(s)`,
      hasFile: !!req.file
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



//CONSULTER SES MESSAGES ET FICHIERS
//RÉCUPÉRATION DES MESSAGES DE L'UTILISATEUR

// Fonction qui retourne tous les messages destinés à l'utilisateur connecté
const getMyMessages = async (req, res) => {
  try {
    // Message correspondent à l'utilisateur actuellement connecté (req.user._id)
    const recipients = await MessageRecipient.find({ user: req.user._id })
      // Jointure avec la collection "messages" pour récupérer les détails du message
      .populate({
        path: 'message',                    // Nom du champ à peupler
        populate: { 
          path: 'sender',                   // récupérer les infos de l'expéditeur
          select: 'username email'          // On ne récupère que username et email
        }
      })
      // Trie les messages du plus récent au plus ancien
      .sort({ 'message.createdAt': -1 });

    // Transformation des données pour renvoyer un format plus propre au frontend
    const messages = recipients.map(rec => {
      const msg = rec.message;   // Raccourci pour accéder au message peuplé

      return {
        messageId: msg._id.toString(),           
        sender: msg.sender.username,             
        senderEmail: msg.sender.email,           
        content: msg.content || '',              
        hasFile: !!msg.filePath,                 
        fileName: msg.fileName || null,          
        fileUrl: msg.filePath ? `http://localhost:${process.env.PORT || 5000}${msg.filePath}` : null,
        mimeType: msg.mimeType || null,          
        isRead: rec.isRead,                      
        createdAt: msg.createdAt                 
      };
    });

    // Envoie la Réponse json au frontend
    res.json({
      success: true,
      count: messages.length,        // Nombre total de messages retournés
      messages                       // Tableau des messages formatés
    });
  } catch (err) {
    // En cas d'erreur
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

//MARQUER COMME LU
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;

    const recipient = await MessageRecipient.findOne({
      message: messageId,
      user: req.user._id
    });

    if (!recipient) {
      return res.status(404).json({ message: 'Message non trouvé ou non destiné à vous' });
    }

    await recipient.markAsRead();   // Utilise la méthode du modèle

    res.json({ success: true, message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//TÉLÉCHARGEMENT FICHIER
const downloadFile = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message || !message.filePath) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    //recuperation de tous les messages envoyés de l'utilisateur connectés 
    const recipient = await MessageRecipient.findOne({
      message: messageId,
      user: req.user._id
    });

    if (!recipient) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Marquer automatiquement comme lu lors du téléchargement
    await recipient.markAsRead();

    //recuperer le fichier
    const filePath = path.join(__dirname, '..', message.filePath);
    //Telecharger le fichier
    res.download(filePath, message.fileName || 'fichier');
  } catch (err) {
    //en cas d'erreur de telechargement
    res.status(500).json({ message: err.message });
  }
};

//RÉCUPÉRATION DE LA LISTE DE TOUS LES UTILISATEURS
const getAllUsers = async (req, res) => {

  // Récupère tous les utilisateurs de la base de données
  const users = await User.find().select('_id username email role');

  // Envoie la liste des utilisateurs au frontend en format JSON
  res.json(users);
};

//NOTIFICATION EMAIL POUR UTILISATEURS DÉCONNECTÉS

// Fonction qui envoie un email aux utilisateurs qui ne sont pas connectés en temps réel
const notifyOfflineUsers = async (recipientIds, messageData) => {
  try {
    // Récupère les informations (email et username) de tous les destinataires
    const users = await User.find({ _id: { $in: recipientIds } })
      .select('email username');

    // Filtre les utilisateurs
    
    const offlineUsers = users.filter(user => {
      
      return true;
    });

    // Si aucun utilisateur à notifier, on arrête la fonction
    if (offlineUsers.length === 0) return;

    // Déstructure les données du message pour plus de lisibilité
    const { sender, content, fileName, fileUrl } = messageData;

    // Version texte de l'email
    const text = `Nouveau message de ${sender}\n\n${content || '(Fichier joint)'}\n${fileName ? `\nFichier : ${fileName}` : ''}`;

    // Version HTML de l'email 
    const html = `
      <h2>Nouveau message de ${sender}</h2>
      <p>${content || '(Fichier joint)'}</p>
      ${fileName ? `<p><strong>Fichier joint :</strong> <a href="${fileUrl}">${fileName}</a></p>` : ''}
      <p><small>Connectez-vous pour voir tous vos messages.</small></p>
    `;

    // Envoi des emails en parallèle pour plus de performance
    
    await Promise.allSettled(
      offlineUsers.map(user =>
        sendEmail({
          to: user.email,
          subject: `Nouveau message de ${sender}`,
          text,
          html
        })
      )
    );
    console.log(`Emails envoyés à ${offlineUsers.length} utilisateurs`);
  } catch (err) {
    // En cas d'erreur
    console.error('Erreur notification email:', err);
  }
};

//EXPORTS
module.exports = {
  sendBroadcast,
  getMyMessages,
  markAsRead,
  downloadFile,
  getAllUsers,
  setSocketIO
};