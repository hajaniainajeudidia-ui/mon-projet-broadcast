# Système de Messagerie Broadcast

Application complète de messagerie broadcast (Admin → Utilisateurs) avec temps réel.

---

## Structure du projet

- **`backend/`** → API Node.js + Express + MongoDB + Socket.IO
- **`frontend/`** → Interface React + Vite + Tailwind CSS

---

## Installation

1. Cloner le projet
    ```bash
    git clone https://github.com/VOTRE_USERNAME/mon-projet-broadcast.git
    cd mon-projet-broadcast
    ```


2. Installer les dépendances
### Backend:
    ```bash
    cd backend
    npm install
    cp .env.example .env     # Configure ton .env
    npm run dev
    ```


### Frontend:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```


---

## Accès

- Frontend : http://localhost:5173
- Backend : http://localhost:5000


---


## Fonctionnalités

Authentification (Login / Register)
Envoi de messages texte et fichiers (Admin)
Réception en temps réel (Socket.IO)
Gestion des utilisateurs (CRUD Admin)
Téléchargement sécurisé des fichiers

---

## Licence
Ce projet est sous licence MIT. Voir le fichier LICENSE.

Fait avec ❤️ en 2026"# mon-projet-broadcast" 

---
