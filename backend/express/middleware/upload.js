// Importation de la bibliothèque Multer pour gérer l'upload de fichiers
const multer = require('multer');

// Importation du module path pour manipuler les chemins de fichiers
const path = require('path');

//CONFIGURATION DU STOCKAGE

// Configuration du stockage des fichiers sur le disque
const storage = multer.diskStorage({

  // Définit le dossier où les fichiers seront sauvegardés
  destination: (req, file, cb) => {
    cb(null, 'uploads/');        // Les fichiers seront stockés dans le dossier "uploads"
  },

  // Définit le nom du fichier sauvegardé
  filename: (req, file, cb) => {
    // Crée un suffixe unique pour éviter les collisions de noms
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    
    // Récupère l'extension originale du fichier
    const ext = path.extname(file.originalname);
    
    // Génère un nom de fichier unique : fieldname-timestamp-random.ext
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

//FILTRE DES TYPES DE FICHIERS

// Fonction qui filtre les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'image/gif',
    'application/pdf',
    'text/plain',
    'application/msword',           // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];

  // Si le type de fichier est dans la liste autorisée
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);                 // Accepte le fichier
  } else {
    cb(new Error('Type de fichier non autorisé'), false);  // Refuse le fichier
  }
};

// CONFIGURATION FINALE DE MULTER

// Création de l'instance Multer avec la configuration
const upload = multer({
  storage,                          // Utilise le stockage défini ci-dessus
  limits: { fileSize: 10 * 1024 * 1024 },   // Limite la taille maximale à 10 Mo
  fileFilter                        // Applique le filtre de types de fichiers
});

// Exporte l'instance upload
module.exports = upload;