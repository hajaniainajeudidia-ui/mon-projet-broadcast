// Modèle qui représente la relation entre un message et un utilisateur destinataire

const mongoose = require('mongoose');

const recipientSchema = new mongoose.Schema({

  // Message qui a été envoyé
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',           // Référence vers le modèle Message
    required: true
  },

  // Destinataire
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Etat (lu ou non lu)
  isRead: {
    type: Boolean,
    default: false            // Par defaut
  }

}, { 
  timestamps: true            
});

// Index pour optimiser les recherches fréquentes
recipientSchema.index({ message: 1, user: 1 });

// Méthode pour marquer un message comme lu
recipientSchema.methods.markAsRead = async function() {
  this.isRead = true;
  await this.save();
};

// Export
module.exports = mongoose.model('MessageRecipient', recipientSchema);