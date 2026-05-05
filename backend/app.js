
// Chargerment des variables d'environnement dans .env
require('dotenv').config();

// Importation d'express pour créer le serveur web
const express = require('express');


// Importation de socket.IO pour la communication en temps réel
const { Server } = require('socket.io');

// Importation de jsonwebtoken pour vérifier les tokens
const jwt = require('jsonwebtoken');

// Création de l'application Express
const app = express();

// Importation de CORS pour autoriser les requêtes depuis le frontend
const cors = require('cors');

// Configuration de CORS
var corsOptions = {
  origin: '*',                    // Autorise toutes les origines
  optionsSuccessStatus: 200       // Pour compatibilité avec certains anciens navigateurs
}
app.use(cors(corsOptions));


// Parser les données JSON dans req.body
app.use(express.json());



// Parser les données de formulaires (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// CONNEXION À LA BASE DE DONNÉES

// Importation de MongoDB
const connectDB = require('./config/database');
// Connexion à MongoDB
connectDB();

// ====================== ROUTES ======================

// Route pour l'authentification (login, register)
app.use('/api/auth', require('./routes/auth'));

// Route pour les messages
app.use('/api/messages', require('./routes/message'));

// Route pour la gestion des utilisateurs
app.use('/api/users', require('./routes/user'));

// DÉMARRAGE DU SERVEUR

// Démarrage du serveur HTTP sur le port défini dans .env ou 5000 par défaut
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Serveur démarré sur http://localhost:${process.env.PORT || 5000}`);
});

// DÉMARRAGE DU SOCKET.IO
// Création du serveur Socket.IO en l'attachant au serveur HTTP
const io = new Server(server, { 
  cors: { origin: "*" }     // Autorise les connexions WebSocket depuis toutes les origines
});

// GESTION DES CONNEXIONS SOCKET.IO

// Événement déclenché à chaque nouvelle connexion d'un client
io.on('connection', (socket) => {
  console.log('Client connecté :', socket.id);

  // L'utilisateur envoie son token pour s'authentifier
  socket.on('authenticate', (token) => {
    try {
      // Vérification du token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Chaque utilisateur rejoint une room privée portant son ID
      socket.join(decoded.id);
      socket.userId = decoded.id;

      // L'utilisateur rejoint la room générale des utilisateurs connectés
      socket.join('online-users');

      // Informe tous les utilisateurs connectés qu'un nouvel utilisateur est en ligne
      io.to('online-users').emit('userOnline', { userId: decoded.id });

      console.log(`Utilisateur ${decoded.id} authentifié sur socket`);
    } catch (err) {
      // Si le token est invalide, on déconnecte le socket
      socket.disconnect();
    }
  });

  // Événement déclenché quand un client se déconnecte
  socket.on('disconnect', () => {
    console.log('Client déconnecté');
  });
});

// INJECTION DE SOCKET.IO DANS LE CONTRÔLEUR

// Importe le contrôleur des messages et lui injecte l'instance Socket.IO
const messageController = require('./controllers/messageController');
messageController.setSocketIO(io);

// Message de confirmation dans la console
console.log('Socket.IO prêt pour les messages en temps réel');