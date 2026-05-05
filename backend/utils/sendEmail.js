const nodemailer = require('nodemailer');

// Fonction principale d'envoi d'email
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Configuration du transporteur SMTP 
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,        // Adresse du serveur SMTP
      port: process.env.EMAIL_PORT,        // Port
      secure: process.env.EMAIL_SECURE === 'true',   // Mode sécurisé
      auth: {
        user: process.env.EMAIL_USER,      // Email de l'expéditeur
        pass: process.env.EMAIL_PASS       // Mot de passe d'application
      }
    });

    // Envoi réel de l'email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,        // Expéditeur
      to,                                  // Destinataire
      subject,                             // Sujet
      text,                                // Version texte
      html: html || text                   // Version HTML
    });

    console.log('Email envoyé → ID:', info.messageId);
    return true;                           // Succès
  } catch (error) {
    console.error('Erreur envoi email:', error.message);
    if (error.response) {
      console.error('Réponse SMTP complète:', error.response);
    }
    return false;                          // Échec
  }
};

//Export
module.exports = sendEmail;