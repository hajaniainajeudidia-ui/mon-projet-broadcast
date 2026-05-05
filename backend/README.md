```markdown
# Système de Messagerie Broadcast - Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Application backend **Node.js + Express + MongoDB** permettant à un administrateur authentifié d’envoyer des **messages texte** ou des **fichiers** à plusieurs utilisateurs en une seule opération, avec réception en **temps réel** via Socket.IO.

Les utilisateurs peuvent consulter leurs messages, télécharger les fichiers joints et recevoir des notifications (temps réel + email optionnel).

---

## Fonctionnalités

- Authentification JWT (Register + Login) avec rôles **ADMIN** et **UTILISATEUR**
- Envoi de message texte à plusieurs utilisateurs (broadcast)
- Envoi de fichier (image, PDF, document…) à plusieurs utilisateurs
- Réception des messages en temps réel avec Socket.IO
- Consultation des messages reçus avec statut « lu »
- Téléchargement sécurisé des fichiers joints
- Notifications email pour les utilisateurs déconnectés
- Gestion complète des utilisateurs (CRUD réservé aux administrateurs)

--- 

## Technologies utilisées

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Socket.IO** (temps réel)
- **JWT** pour l’authentification
- **Multer** pour l’upload de fichiers
- **Nodemailer** pour l’envoi d’emails
- **bcryptjs** pour le hachage des mots de passe

---

## Installation

1. Clone le dépôt :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/nom-du-repo.git
   cd nom-du-repo
   ```

2. Installe les dépendances :
   ```bash
   npm install
   ```

3. Crée un fichier `.env` à la racine et configure les variables :

   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/auth_broadcast
   JWT_SECRET=super_secret_key_2026_changez_moi_en_prod

   # Configuration email (exemple avec Gmail App Password)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=tonemail@gmail.com
   EMAIL_PASS=ton_app_password_16_caracteres
   EMAIL_FROM="Broadcast App <tonemail@gmail.com>"
   ```

4. Lance le serveur en mode développement :
   ```bash
   npm run dev
   ```

Le serveur sera accessible sur `http://localhost:5000`

---

## Endpoints principaux

### Authentification
- `POST /api/auth/register` → Inscription d’un utilisateur
- `POST /api/auth/login` → Connexion et obtention du token JWT

### Messages (Admin)
- `POST /api/messages/send` → Envoi de message texte à plusieurs utilisateurs
- `POST /api/messages/send-file` → Envoi de message avec fichier joint

### Messages (Utilisateur)
- `GET /api/messages/my-messages` → Récupérer ses messages reçus
- `GET /api/messages/download/:messageId` → Télécharger un fichier joint

### Gestion des Utilisateurs (Admin uniquement)
- `GET /api/users` → Liste des utilisateurs (avec recherche et filtre par rôle)
- `GET /api/users/:id` → Détail d’un utilisateur
- `PATCH /api/users/:id` → Modifier un utilisateur
- `DELETE /api/users/:id` → Supprimer un utilisateur

---

## Temps réel (Socket.IO)

Les utilisateurs connectés reçoivent automatiquement les nouveaux messages via l’événement **`newMessage`**.

---

## Licence

Ce projet est distribué sous licence **MIT**.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Fait avec ❤️ en 2026
```

---

