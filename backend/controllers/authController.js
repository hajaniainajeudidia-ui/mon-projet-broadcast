const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Vérification simple
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    //vérifié si l'utiisateur existe deja
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    //Creation d'utilisateur
    const user = await User.create({
      username,
      email,
      password,
      role: role === 'ADMIN' ? 'ADMIN' : 'UTILISATEUR'   // sécurité minimale pour le démo
    });

    //Envoie la reponse en json
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    //affiche le message d'erreur si il y a une erreur de 
    res.status(500).json({ message: err.message });
    console.log(err.message);
  }
};

// Login
  // Fonction qui gère la connexion d'un utilisateur
  exports.login = async (req, res) => {
    try {
      // Récupère les identifiants envoyés par le formulaire de login
      const { email, password } = req.body;

      // Cherche l'utilisateur dans MongoDB en utilisant son adresse email
      const user = await User.findOne({ email });

      // Si aucun utilisateur ne correspond à cet email
      if (!user) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Vérifie si le mot de passe saisi correspond au mot de passe hashé en base
      
      const isMatch = await user.authenticate(password);

      // Si le mot de passe est incorrect
      if (!isMatch) {
        return res.status(401).json({ message: 'Identifiants incorrects' });
      }

      // Création d'un token JWT sécurisé
      const token = jwt.sign(
        { id: user._id, role: user.role },     // Informations stockées dans le token
        process.env.JWT_SECRET,                // Clé secrète pour signer le token
        { expiresIn: '7d' }                    // Le token expire après 7 jours
      );

      // Réponse envoyée au frontend en cas de succès
      res.json({
        message: 'Connexion réussie',
        token,                                 
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      // Gestion des erreurs serveur
      res.status(500).json({ message: err.message });
    }
  };

//LOGOUT
exports.logout = (req, res) => {
  try {
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};