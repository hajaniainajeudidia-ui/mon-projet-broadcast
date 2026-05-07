# Système de Messagerie Broadcast - Frontend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Interface utilisateur moderne en **React + Vite + Tailwind CSS** pour le système de messagerie broadcast.

Permet aux administrateurs d’envoyer des messages texte ou fichiers à plusieurs utilisateurs, et aux utilisateurs de consulter leurs messages en temps réel.

---

## Fonctionnalités

### Pour les Administrateurs
- Authentification sécurisée (Login / Register)
- Envoi de messages texte à plusieurs utilisateurs
- Envoi de fichiers (images, PDF, documents…) à plusieurs utilisateurs
- Sélection multiple des destinataires avec cases à cocher
- Interface de diffusion claire et intuitive

### Pour les Utilisateurs
- Consultation des messages reçus
- Téléchargement sécurisé des fichiers joints
- Réception en temps réel des nouveaux messages (Socket.IO)
- Indicateur visuel pour les messages non lus

### Général
- Design sombre moderne et minimaliste
- Responsive (Mobile, Tablette, Desktop)
- Navigation protégée avec React Router
- Gestion d’état d’authentification via contexte

---

## Technologies utilisées

- **React 18** + **Vite**
- **Tailwind CSS** (v4)
- **React Router DOM** (navigation)
- **Socket.IO Client** (temps réel)
- **Axios** (requêtes HTTP)
- **React Hot Toast** (notifications)
- **React Icons** (icônes)

---

## Captures d'écran

### 1. Page de Connexion / Inscription
![Login Page](assets/screenshots/login.png)
![Register Page](assets/screenshots/register.png)

### 2. Interface d'envoi pour Administrateur (Diffusion)
![Admin Broadcast](assets/screenshots/admin-broadcast.png)

### 3. Page de réception des messages (Utilisateur)
![Messages Page](assets/screenshots/messages.png)

### 4. Gestion des Utilisateurs (CRUD Admin)
![Admin Users](assets/screenshots/admin-users.png)

### 5. Modal de formulaire de l'insertion de Utilisateurs
![Admin Create Users](assets/screenshots/admin-create-users.png)

### 6. Modal de confirmation de suppression
![Delete Modal](assets/screenshots/delete-modal.png)


---

## Installation

1. Clone le dépôt frontend :
   ```bash
   git clone https://github.com/VOTRE_USERNAME/frontend-broadcast.git
   cd frontend-broadcast
   ```

2. Installe les dépendances :

   ```bash
   npm install
   ```

3. Lance l’application en mode développement :
   ```bash
   npm run dev
   ```

L’application sera accessible sur `http://localhost:5173`

---

## Structure du projet

```
src/
├── components/          
├── context/             # AuthContext
├── hooks/               # useSocket
├── pages/
│   ├── Auth.jsx
│   ├── AdminBroadcast.jsx
│   ├── Messages.jsx
│   └── AdminUsers.jsx
├── config.js
└── App.jsx
```

---

## Licence

Ce projet est distribué sous licence **MIT**.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Fait avec ❤️ en 2026