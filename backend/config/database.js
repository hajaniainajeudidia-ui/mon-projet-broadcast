// CONNEXION À LA BASE DE DONNÉES

// Importation de Mongoose
const mongoose = require('mongoose');

// Fonction responsable de connecter l'application à MongoDB
const connectDB = async () => {
  try {
    // Tentative de connexion à MongoDB (variabe dans .env)
    await mongoose.connect(process.env.MONGO_URI);

    // Si la connexion réussit, on affiche un message de confirmation
    console.log('MongoDB connecté avec succès');
  } catch (err) {
    // Si la connexion échoue
    console.error('Erreur MongoDB :', err.message);

    // Arrête immédiatement le serveur Node.js
    process.exit(1);
  }
};

// Rend la fonction disponible pour les autres fichiers
module.exports = connectDB;