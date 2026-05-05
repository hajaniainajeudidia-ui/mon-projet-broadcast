import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import API_BASE_URL from '../config';

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10   // Nombre d'utilisateurs par page

 // Modal Modification
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'UTILISATEUR' })

  // Modal Confirmation Suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)


// Fonction qui récupère la liste des utilisateurs depuis le backend
  const fetchUsers = async () => {
    try {
      // Récupère le token JWT stocké lors de la connexion de l'admin
      const token = localStorage.getItem('token')
      // currentPage = numéro de la page actuelle
      // itemsPerPage = nombre d'utilisateurs par page
      let url = `${API_BASE_URL}/users?page=${currentPage}&limit=${itemsPerPage}`

      // Création d'un objet pour gérer les paramètres de filtre et recherche
      const params = new URLSearchParams()

      // Si un filtre par rôle est sélectionné, on l'ajoute à l'URL
      if (roleFilter) params.append('role', roleFilter)

      // Si une recherche est saisie, on l'ajoute à l'URL
      if (search) params.append('search', search)

      // Si des paramètres existent, on les ajoute à l'URL
      if (params.toString()) url += '&' + params.toString()

      // Envoi de la requête GET au backend avec le token d'authentification
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Conversion de la réponse en format JSON
      const data = await res.json()

      // Mise à jour de la liste des utilisateurs
      setUsers(data.users || data)

      // Calcul du nombre total de pages pour la pagination
      setTotalPages(data.totalPages || Math.ceil((data.length || 0) / itemsPerPage))

    } catch (err) {
      // En cas d'erreur
      toast.error('Erreur chargement des utilisateurs')
    } finally {
      // Désactiver l'état de chargement
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, currentPage])

  // Réinitialiser la page à 1 quand on change de filtre ou recherche
  useEffect(() => {
    setCurrentPage(1)
  }, [search, roleFilter])


  // Fonction qui ouvre le modal de modification (ou création) d'utilisateur
  const openEditModal = (user = null) => {

    if (user) {
      // remplir le formulaire avec les données de l'utilisateur existant
      // Stocke l'utilisateur en cours de modification
      setEditingUser(user)                    
      setForm({
        username: user.username,             
        email: user.email,                    
        password: '',                         
        role: user.role                       
      })
    } else {
      // Réinitialise le formulaire pour un nouvel utilisateur
      setEditingUser(null)                    
      setForm({ 
        username: '', 
        email: '', 
        password: '', 
        role: 'UTILISATEUR'                   // Rôle par défaut
      })
    }

    // Ouvre le modal de modification/création
    setShowEditModal(true)
  }

  // Fonction qui ouvre le modal de confirmation de suppression
  const openDeleteModal = (user) => {
    // Stocke l'utilisateur que l'on veut supprimer
    setUserToDelete(user) 
     // Affiche le modal de confirmation         
    setShowDeleteModal(true)       
  }

  // Confirmer la suppression

  const confirmDelete = async () => {

    // Si aucun utilisateur n'est sélectionné pour suppression, on ne fait rien
    if (!userToDelete) return

    try {
      // Récupère le token JWT de l'utilisateur connecté (admin)
      const token = localStorage.getItem('token')

      // Envoie une requête DELETE au backend pour supprimer l'utilisateur
      const res = await fetch(`${API_BASE_URL}/users/${userToDelete._id}`, {
        method: 'DELETE',                                   
        headers: { Authorization: `Bearer ${token}` }       
      })

      // Si la suppression a réussi
      if (res.ok) {
        // Message de succès
        toast.success('Utilisateur supprimé avec succès')  
        // Recharge la liste des utilisateurs
        fetchUsers()                                        
      } else {
        // Serveur renvoie une erreur
        toast.error('Erreur lors de la suppression')
      }
    } catch (err) {
      // En cas d'erreur technique
      toast.error('Erreur serveur')
    } finally {
      // Ferme le modal de confirmation
      setShowDeleteModal(false)  
      // Réinitialise la variable qui contenait l'utilisateur à supprimer   
      setUserToDelete(null)         
    }
  }


// Sauvegarder (Create ou Update)

  const handleSave = async (e) => {
    
    // Empêche le rechargement de la page par défaut du formulaire
    e.preventDefault()

    try {
      // Récupère le token JWT de l'admin connecté
      const token = localStorage.getItem('token')
      const method = editingUser ? 'PATCH' : 'POST'
      const url = editingUser 
        ? `${API_BASE_URL}/users/${editingUser._id}` 
        : `${API_BASE_URL}/users`

      // Envoi de la requête au backend
      const res = await fetch(url, {
        method,                                           
        headers: {
          'Content-Type': 'application/json',             
          Authorization: `Bearer ${token}`                
        },
        body: JSON.stringify(form)                        
      })

      // Si la requête a réussi
      if (res.ok) {
        // Creer ou modifier l'utilisateur
        toast.success(editingUser ? 'Utilisateur mis à jour' : 'Utilisateur créé avec succès')
        
        // Ferme le modal
        setShowEditModal(false)     
        // Recharge la liste des utilisateurs
        fetchUsers()                
      } else {
        // Si le serveur renvoie une erreur
        const data = await res.json()
        toast.error(data.message || 'Erreur')
      }
    } catch (err) {
      // Erreur réseau ou problème serveur
      toast.error('Erreur serveur')
    }
  }

  // Supprimer un utilisateur
  const handleDelete = async (id) => {

    // Demande une confirmation avant de supprimer (sécurité)
    if (!window.confirm('Supprimer cet utilisateur ?')) return

    try {
      // Récupère le token JWT de l'admin connecté
      const token = localStorage.getItem('token')

      // Envoi de la requête DELETE au backend
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        // Message de succès
        toast.success('Utilisateur supprimé')  
        // Recharge la liste pour voir la mise à jour 
        fetchUsers()                            
      } else {
        toast.error('Erreur suppression')
      }
    } catch (err) {
      // Erreur réseau ou serveur
        toast.error('Erreur serveur')
      }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
          <div className="flex gap-3">
            <button
              onClick={() => openEditModal()}           
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-medium"
            >
              + Ajouter utilisateur
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-5 py-3 text-white placeholder-gray-500 focus:border-blue-600"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-5 py-3 text-white focus:border-blue-600 w-full sm:w-56"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateur</option>
            <option value="UTILISATEUR">Utilisateur</option>
          </select>
        </div>

        {/* Tableau */}
        {loading ? (
          <p className="text-center py-12 text-gray-500">Chargement...</p>
        ) : (
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-4">Username</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Rôle</th>
                    <th className="text-center p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-800/50">
                      <td className="p-4 font-medium">{user.username}</td>
                      <td className="p-4 text-gray-400">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-4 py-1 text-xs rounded-full ${
                          user.role === 'ADMIN' ? 'bg-blue-900 text-blue-400' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-center space-x-4">
                        <div className="flex items-center justify-center gap-6">
                          {/* Bouton Modifier */}
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-400 hover:text-blue-300 transition p-2 hover:bg-blue-950/30 rounded-lg"
                            title="Modifier"
                          >
                            <FiEdit2 size={20} />
                          </button>

                          {/* Bouton Supprimer */}
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-400 hover:text-red-500 transition p-2 hover:bg-red-950/30 rounded-lg"
                            title="Supprimer"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <p className="text-center py-12 text-gray-500">Aucun utilisateur trouvé</p>
            )}
          </div>
        )}
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition"
            >
              Précédent
            </button>

            <span className="px-4 py-2 text-sm text-gray-400">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 rounded-lg transition"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal Création / Modification */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-6">
              {editingUser ? 'Modifier utilisateur' : 'Ajouter un utilisateur'}
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>

              {!editingUser && (   
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Mot de passe</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="UTILISATEUR">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {editingUser ? 'Enregistrer' : 'Créer utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nouveau Modal de Confirmation Suppression */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Confirmer la suppression</h2>
            <p className="text-gray-300 mb-6">
              Voulez-vous vraiment supprimer l'utilisateur <strong>{userToDelete.username}</strong> ?
              <br />
              Cette action est irréversible.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}