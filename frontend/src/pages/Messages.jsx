import { useState, useEffect } from 'react'
import useSocket from '../hooks/useSocket'
import toast from 'react-hot-toast'
import { FiLogOut } from 'react-icons/fi';
import API_BASE_URL from '../config';

export default function Messages() {
  const socket = useSocket()
  const [messages, setMessages] = useState([])

  // Récupérer l'utilisateur connecté
  const user = JSON.parse(localStorage.getItem('user') || '{}')


  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Fonction pour ouvrir le modal
  const openLogoutModal = () => {
    setShowLogoutModal(true)
  }

  // Fonction pour confirmer la déconnexion
  const confirmLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth'
  }

  // Charger les messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/messages/my-messages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (res.ok) setMessages(data.messages || [])
      } catch (err) {
        toast.error('Erreur lors du chargement des messages')
      }
    }
    fetchMessages()
  }, [])

  // Réception en temps réel
  useEffect(() => {
    if (!socket) return

    socket.on('newMessage', (msg) => {
      setMessages(prev => [msg, ...prev])
      toast.success(`Nouveau message de ${msg.sender}`)
    })

    return () => socket.off('newMessage')
  }, [socket])

  // Fonction Déconnexion
  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/auth'
    }
  }

  // Fonction qui gère le téléchargement sécurisé d'un fichier joint
  const handleDownload = async (messageId, fileName) => {

    try {
      const token = localStorage.getItem('token')

      // Requête vers le backend pour télécharger le fichier
      // La route /download vérifie que l'utilisateur a bien le droit d'accéder à ce fichier
      const response = await fetch(`${API_BASE_URL}/messages/download/${messageId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })

      // Si le serveur renvoie une erreur (ex: accès refusé ou fichier inexistant)
      if (!response.ok) throw new Error('Erreur de téléchargement')

      // Récupère le contenu du fichier sous forme de blob (données binaires)
      const blob = await response.blob()

      // Crée une URL temporaire pour ce blob
      const url = window.URL.createObjectURL(blob)

      // Crée un lien temporaire pour lancer le téléchargement
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'fichier'     // Utilise le nom original du fichier
      document.body.appendChild(link)
      link.click()                              // Déclenche le téléchargement
      link.remove()                             // Nettoie le DOM
      window.URL.revokeObjectURL(url)           // Libère la mémoire

      toast.success('Téléchargement démarré')
    } catch (err) {
      // Gestion des erreurs (accès refusé, fichier supprimé, problème réseau...)
      toast.error('Impossible de télécharger le fichier')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header Fixe */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 py-5 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Mes Messages</h1>
            <p className="text-gray-400 text-sm sm:text-base">Communications reçues de l'administrateur</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Nom de l'utilisateur connecté */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user.username || 'Utilisateur'}</span>
              <span className="text-xs text-gray-500">{user.role}</span>
            </div>

            {/* Bouton Déconnexion avec icône de la librairie */}
            <button
              onClick={openLogoutModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600/90 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-sm"
            >
              <FiLogOut size={20} />                    {/* ← Icône moderne et claire */}
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-10 pt-8">
        {messages.length === 0 ? (
          <div className="text-center py-24">
            <div className="mx-auto w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center mb-6">
              <span className="text-6xl opacity-40">📭</span>
            </div>
            <h3 className="text-2xl font-medium text-gray-300 mb-3">Aucun message pour le moment</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Les messages envoyés par l'administrateur apparaîtront ici automatiquement.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <div
                key={msg.messageId || i}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-7 shadow-2xl hover:border-blue-900/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 font-semibold text-lg">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-white">{msg.sender}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pl-14">
                  <p className="text-gray-200 leading-relaxed text-[15.8px]">
                    {msg.content || '(Message sans contenu texte)'}
                  </p>

                  {msg.hasFile && (
                    <button
                      onClick={() => handleDownload(msg.messageId, msg.fileName)}
                      className="mt-6 flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-2xl px-6 py-4 text-blue-400 hover:text-blue-300 transition-all group w-full sm:w-auto"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="font-medium">Télécharger {msg.fileName || 'le fichier'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ====================== MODAL DE CONFIRMATION DÉCONNEXION ====================== */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-sm p-6 sm:p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
              <FiLogOut size={32} className="text-red-400" />
            </div>

            <h2 className="text-2xl font-semibold mb-2">Déconnexion</h2>
            <p className="text-gray-400 mb-8">
              Voulez-vous vraiment vous déconnecter ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl transition font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl transition font-medium"
              >
                Oui, me déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}