// Importation de jsonwebtoken
const jwt = require('jsonwebtoken');

// Importation du modèle User
const User = require('../models/User');

//MIDDLEWARE DE PROTECTION (AUTHENTIFICATION)

// Middleware qui vérifie si l'utilisateur est authentifié via un token JWT
// Il est utilisé pour protéger les routes qui nécessitent une connexion
const protect = async (req, res, next) => {
  let token;

  // Vérifie si le header Authorization existe et commence par "Bearer "
  if (req.headers.authorization?.startsWith('Bearer')) {
    // Extrait le token en enlevant le mot "Bearer " 
    token = req.headers.authorization.split(' ')[1];
  }

  // Si aucun token n'est trouvé, on renvoie une erreur
  if (!token) return res.status(401).json({ message: 'Non autorisé' });

  try {
    // Vérifie la validité du token en utilisant la clé secrète
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupèration des informations de l'utilisateur depuis la base de données
    // Exclut le mot de passe pour des raisons de sécurité
    req.user = await User.findById(decoded.id).select('-password');

    // Si tout est OK, on passe au middleware ou à la route suivante
    next();
  } catch (err) {
    // En cas d'erreur
    res.status(401).json({ message: 'Token invalide' });
  }
};

// MIDDLEWARE POUR RESTREINDRE AUX ADMINISTRATEURS ======================

// Middleware qui vérifie si l'utilisateur connecté est un administrateur
const adminOnly = (req, res, next) => {
  // Vérifie si l'utilisateur existe et si son rôle est "ADMIN"
  if (req.user?.role === 'ADMIN') return next();

  // Sinon, on renvoie une erreur 403 (Accès interdit)
  res.status(403).json({ message: 'Réservé aux administrateurs' });
};

// Exporte les middlewares
module.exports = { protect, adminOnly };