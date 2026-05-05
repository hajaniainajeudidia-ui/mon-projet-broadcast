// Import des hooks React nécessaires
import { useEffect, useRef } from 'react'

// Import de la bibliothèque Socket.IO
import { io } from 'socket.io-client'

// Définition de l'URL du serveur Socket.IO
const SOCKET_URL = 'http://localhost:5000'

// Gère la connexion WebSocket en temps réel
export default function useSocket() {
  const socketRef = useRef(null)

  
  useEffect(() => {

    // Recupération du token JWT depuis localStorage
    const token = localStorage.getItem('token')

    // Si pas de token, on ne fait rien (utilisateur non connecté)
    if (!token) return

    //Création de la connexion Socket.IO
    //On passe le token dans l'auth pour que le backend puisse vérifier l'utilisateur
    socketRef.current = io(SOCKET_URL, {
      auth: { token },                    
      reconnection: true,                 // Active la reconnexion automatique
      reconnectionAttempts: 5,            // Nombre maximum de tentatives
      reconnectionDelay: 1000,            // Délai entre chaque tentative (1 seconde)
    })

    // Événement déclenché quand la connexion est établie avec succès
    socketRef.current.on('connect', () => {
      console.log('Socket connecté')
    })

    // Événement déclenché en cas d'erreur de connexion
    socketRef.current.on('connect_error', (err) => {
      console.error('Erreur socket:', err.message)
    })

    // Fonction de nettoyage
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()   // Déconnexion propre du socket
        socketRef.current = null         // Réinitialisation de la référence
      }
    }
  }, [])

  // Retourne la reference du socket pour pouvoir l'utiliser dans le composant
  return socketRef.current
}