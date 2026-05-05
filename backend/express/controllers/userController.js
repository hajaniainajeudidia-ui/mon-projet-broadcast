const User = require('../models/User');

// LISTE, FILTRAGE, RECHERCHE, PAGINATION
const getUsers = async (req, res) => {
  try {
    // Récupération des paramètres de requête
    const { role, search, page = 1, limit = 10 } = req.query;

    // Objet qui contiendra les critères de filtrage pour MongoDB
    let filter = {};

    // Si un rôle est spécifié dans l'URL, on l'ajoute au filtre
    if (role) filter.role = role.toUpperCase();

    // Si une recherche est demandée, on cherche dans username OU email
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calcul du nombre de documents à sauter pour la pagination
    const skip = (page - 1) * limit;

    // Récuperation des utilisateurs selon le filtre
    const users = await User.find(filter)
      .select('-password')                    // exclut le mot de passe 
      .sort({ createdAt: -1 })                // Tri du plus récent au plus ancien
      .skip(skip)                             // Saut pour la pagination
      .limit(parseInt(limit));                // Limitation du nombre de résultats par page

    // Compte le nombre total d'utilisateurs correspondant au filtre
    const total = await User.countDocuments(filter);

    // Envoie la Réponse JSON envoyée au frontend
    res.json({
      users,                                  // Liste des utilisateurs de la page actuelle
      totalPages: Math.ceil(total / limit),   // Nombre total de pages
      currentPage: parseInt(page),            // Page actuelle
      total                                   // Nombre total d'utilisateurs
    });
  } catch (err) {
    // En cas d'erreur serveur
    res.status(500).json({ message: err.message });
  }
};

//RÉCUPÉRATION D'UN SEUL UTILISATEUR

const getUserById = async (req, res) => {
  try {
    // Recherche l'utilisateur par son ID et exclut le mot de passe
    const user = await User.findById(req.params.id).select('-password');

    // Si l'utilisateur n'existe pas
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Envoyer la réponse au frontend
    res.json(user);
  } catch (err) {
    //en cas d'erreur
    res.status(500).json({ message: err.message });
  }
};

//MISE À JOUR D'UN UTILISATEUR
const updateUser = async (req, res) => {
  try {
    // Récupère les nouvelles données envoyées dans le body de la requête
    const { username, email, role } = req.body;

    // Recherche l'utilisateur à modifier
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Mise à jour si l'un des champs n'est pas vide
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role.toUpperCase();

    // Sauvegarde les modifications dans la base de données
    await user.save();

    // Envoyer le Réponse au frontend
    res.json({
      message: 'Utilisateur mis à jour',
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
const deleteUser = async (req, res) => {
  try {
    //Récuperation d'un Utilisateur à supprimer
    const user = await User.findById(req.params.id);
    //Si l'utiisateur n'existe pas
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    //Supprimer dans la base de donnés
    await user.deleteOne();

    //Envoyer la reponse en cas de success
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    //En cas d'erreur
    res.status(500).json({ message: err.message });
  }
};

// CREATE (Ajouter utilisateur)
const createUser = async (req, res) => {
  try {
    //Recuperation des champs entrés par les utilisateurs
    const { username, email, password, role } = req.body;

    //Vérification des champs
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    //Verification si l'email ou username existe
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'Username ou email déjà utilisé' });
    }

    //ajouter à la base de donnée
    const user = await User.create({
      username,
      email,
      password,
      role: role === 'ADMIN' ? 'ADMIN' : 'UTILISATEUR'
    });

    //Envoie la reponse au frontend
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    //en cas d'erreur
    res.status(500).json({ message: err.message });
  }
}

//Export
module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser
};