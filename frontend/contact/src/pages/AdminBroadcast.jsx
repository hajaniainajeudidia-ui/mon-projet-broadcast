import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiUsers } from 'react-icons/fi';
import API_BASE_URL from '../config';

export default function AdminBroadcast() {
  // Liste de tous les utilisateurs récupérés depuis le backend
  const [users, setUsers] = useState([])

  // Tableau contenant les IDs des utilisateurs sélectionnés pour l'envoi
  const [selectedIds, setSelectedIds] = useState([])

  // Contenu du message texte que l'admin veut envoyer
  const [content, setContent] = useState('')

  // Fichier sélectionné par l'admin (image, PDF, etc.)
  const [file, setFile] = useState(null)

  // État de chargement pendant l'envoi du message
  const [loading, setLoading] = useState(false)

  // Permet de rediriger vers d'autres pages
  const navigate = useNavigate()

  // État qui contrôle l'affichage du modal de confirmation de déconnexion
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  
  // Fonction pour ouvrir le modal de confirmation de déconnexion
  const openLogoutModal = () => {
    setShowLogoutModal(true)     // Change l'état pour afficher le modal
  }

  // Fonction pour confirmer la déconnexion
  const confirmLogout = () => {
    // Supprime le token JWT du localStorage
    localStorage.removeItem('token')
    
    // Supprime les informations de l'utilisateur du localStorage
    localStorage.removeItem('user')
    
    // Redirige l'utilisateur vers la page de connexion
    window.location.href = '/auth'
  }

  
  useEffect(() => {

    // Fonction qui récupère la liste des utilisateurs
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')   // Récupère le token de connexion

        // Requête vers le backend pour obtenir tous les utilisateurs
        const res = await fetch(`${API_BASE_URL}/messages/users`, {
          headers: { Authorization: `Bearer ${token}` }
        })

        const data = await res.json()

        if (res.ok) {
          // Met à jour la liste des utilisateurs
          setUsers(data)                    
        } else {
          toast.error('Erreur chargement utilisateurs')
        }
      } catch {
        // Erreur de connexion ou serveur inaccessible
        toast.error('Erreur réseau')        
      }
    }

    fetchUsers()   // Appel de la fonction

  }, [])


  // Fonction qui permet de cocher/décocher un utilisateur dans la liste
  const toggleUser = id => {
    setSelectedIds(prev =>
      prev.includes(id)                   //si selectionné 
        ? prev.filter(x => x !== id)     // Désélectionner
        : [...prev, id]                  // Sélectionner
    )
  }

  // Fonction pour sélectionner ou désélectionner TOUS les utilisateurs en un clic
  const selectAll = () => {
    setSelectedIds(prev =>
      prev.length === users.length 
        ? []                              // Tout désélectionner
        : users.map(u => u._id)           // Tout sélectionner
    )
  }

  // FONCTION D'ENVOI DU MESSAGE
  const handleSend = async e => {

    
    e.preventDefault()

    // Verifier si l'admin à sélectionné au moins un destinataire
    if (selectedIds.length === 0) 
      return toast.error('Sélectionnez au moins un destinataire')

    // Verifié si un message texte ou un fichier est vide
    if (!content.trim() && !file) 
      return toast.error('Ajoutez un message ou un fichier')

    // Active l'état de chargement
    setLoading(true)

    // Création d'un objet FormData pour envoyer à la fois du texte et un fichier
    const formData = new FormData()
    
    // Ajout du contenu du message
    formData.append('content', content.trim())
    
    // Ajout de la liste des destinataires
    formData.append('recipientIds', JSON.stringify(selectedIds))
    
    // Si un fichier a été sélectionné, on l'ajoute au FormData
    if (file) formData.append('file', file)

    try {
      // Récupération du token JWT stocké lors de la connexion
      const token = localStorage.getItem('token')

      // Envoi de la requête POST vers le backend
      const res = await fetch(`${API_BASE_URL}/messages/send`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`   
        },
        body: formData                       // Envoi des données
      })

      // Conversion de la réponse en JSON
      const data = await res.json()

      // Si la réponse n'est pas OK
      if (!res.ok) throw new Error(data.message || 'Erreur')

      // Message de succès
      toast.success(`Envoyé à ${selectedIds.length} utilisateur(s) !`)

      // Réinitialisation des champs après envoi réussi
      setContent('')        
      setFile(null)         // Supprime le fichier sélectionné
      setSelectedIds([])    // Désélectionne tous les utilisateurs

    } catch (err) {
      // En cas d'erreur
      toast.error(err.message)
    } finally {
      // On désactive l'état de chargement
      setLoading(false)
    }
  }

 


  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header*/}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Diffusion Admin
          </h1>

          <div className="text-sm text-gray-400 hidden sm:block">
            {selectedIds.length} / {users.length} sélectionné(s)
          </div>

          <div className="flex items-center gap-3">
            {/* Bouton Gestion Utilisateurs avec icône de la librairie */}
              <button
                onClick={() => navigate('/admin/users')}
                className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-medium rounded-lg border border-gray-600 transition-all shadow-sm flex items-center gap-2"
              >
                <FiUsers size={18} />   {/* ← Icône moderne et claire */}
                <span className="hidden sm:inline">Gestion utilisateurs</span>
              </button>

            {/* Bouton Déconnexion avec icône de la librairie */}
            <button
              onClick={openLogoutModal}
              className="px-5 py-2.5 bg-red-600/90 hover:bg-red-700 text-white font-medium rounded-lg border border-red-700/50 transition-all shadow-sm flex items-center gap-2"
            >
              <FiLogOut size={18} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto">
        {/* Colonne gauche : Liste utilisateurs (scrollable) */}
        <div className="w-full lg:w-2/5 lg:border-r lg:border-gray-800 bg-gray-900/50 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 sticky top-0 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Destinataires</h2>
              <button
                onClick={selectAll}
                className="text-sm text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
              >
                {selectedIds.length === users.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            </div>
          </div>

          {users.length === 0 ? (
            <p className="text-center py-12 text-gray-500">Aucun utilisateur trouvé</p>
          ) : (
            <div className="space-y-2 p-4 sm:p-6 lg:p-8">
              {users.map(user => (
                <label
                  key={user._id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer group ${
                    selectedIds.includes(user._id)
                      ? 'bg-blue-950/40 border-blue-600/50'
                      : 'border-gray-800 hover:bg-gray-800/50 hover:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user._id)}
                    onChange={() => toggleUser(user._id)}
                    className="h-5 w-5 accent-blue-600 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.username}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                  {user.role === 'ADMIN' && (
                    <span className="text-xs px-2 py-1 bg-blue-950/50 text-blue-400 rounded-full">
                      Admin
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Colonne droite : Formulaire */}
        <div className="w-full lg:w-3/5 bg-gray-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <form onSubmit={handleSend} className="space-y-6 max-w-2xl mx-auto">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Votre message ici..."
                rows={8}
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fichier (optionnel)
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={e => setFile(e.target.files[0])}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-4 text-gray-300 file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30 transition cursor-pointer"
                />
                {file && (
                  <p className="mt-3 text-sm text-blue-400 truncate">
                    {file.name}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (selectedIds.length === 0 && !content.trim() && !file)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                  Envoi...
                </>
              ) : (
                'Envoyer maintenant'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE DÉCONNEXION */}
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