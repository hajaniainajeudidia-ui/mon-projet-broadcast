// Importation de la bibliothèque Mongoose
const mongoose = require('mongoose');

// Définition du schéma d'un message
const messageSchema = new mongoose.Schema({

  // Champ qui référence l'utilisateur qui a envoyé le message
  sender: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: 'User',                            
    required: true                          
  },

  // Contenu texte du message
  content: {
    type: String,
    trim: true,          // Supprime automatiquement les espaces au début et à la fin
    default: ''          // Valeur par défaut si aucun contenu n'est fourni
  },

  // Nom original du fichier joint
  fileName: {
    type: String,
    default: null        // null = pas de fichier joint
  },

  // Chemin où le fichier est stocké sur le serveur
  filePath: {
    type: String,
    default: null
  },

  // Type MIME du fichier 
  mimeType: {
    type: String,
    default: null
  }

}, { 
  timestamps: true     // Ajoute automatiquement createdAt et updatedAt
});

// Exports le modèle
module.exports = mongoose.model('Message', messageSchema);