const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  // Nom d'utilisateur unique
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Email unique
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // Mot de passe
  password: { 
    type: String, 
    required: true 
  },

  // Rôle de l'utilisateur avec restriction de valeurs
  role: {
    type: String,
    enum: ['ADMIN', 'UTILISATEUR'],  
    default: 'UTILISATEUR'            // Valeur par défaut pour un nouvel utilisateur
  }

}, { 
  timestamps: true 
});


// Permet de hacher automatiquement le mot de passe avant de l'enregistrer
userSchema.pre('save', async function(next) {
  // Si le mot de passe n'a pas changé, on passe à la suite
  if (!this.isModified('password')) return next();

  // Hachage sécurisé du mot de passe
  this.password = await bcrypt.hash(this.password, 10);
});

// Méthode pour vérifier le mot de passe lors de la connexion
userSchema.methods.authenticate = async function(enteredPassword) {
  // Compare le mot de passe saisi avec le hash stocké
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exports
module.exports = mongoose.model('User', userSchema);