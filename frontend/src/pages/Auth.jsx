import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API_BASE_URL from '../config';

export default function Auth() {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'UTILISATEUR'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  //FONCTIONS DU FORMULAIRE D'AUTHENTIFICATION
  const handleChange = e => {
    // Met à jour le formulaire en gardant les anciennes valeurs
    setForm({ ...form, [e.target.name]: e.target.value })

    // Réinitialise le message d'erreur à chaque saisie pour une meilleure UX
    setError('')
  }

  // Récupère la fonction "login" du contexte d'authentification
  const { login } = useAuth()

  // Fonction principale appelée quand l'utilisateur clique sur "Se connecter" ou "Créer compte"
  const handleSubmit = async e => {

    // Empêche le rechargement de la page par défaut du formulaire
    e.preventDefault()

    // Active l'état de chargement
    setLoading(true)

    // Réinitialise le message d'erreur avant chaque tentative
    setError('')
    const url = `${API_BASE_URL}/auth${isLogin ? '/login' : '/register'}`

    // Prépare les données à envoyer
    const payload = isLogin ? { email: form.email, password: form.password } : form 

    try {
      // Envoi de la requête POST vers le backend
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },   
        body: JSON.stringify(payload),                      
      })

      // Conversion de la réponse du serveur en JSON
      const data = await res.json()

      // Si le serveur renvoie une erreur
      if (!res.ok) {
        throw new Error(data.message || 'Erreur serveur')
      }

      // Si c'est une connexion Login
      if (isLogin) {
        // Met à jour l'état global d'authentification via le contexte
        login(data.token, data.user)

        // Redirige selon le rôle de l'utilisateur :
        navigate(user.role === 'ADMIN' ? '/admin/broadcast' : '/messages')
      } else {
        // Si c'est une inscription Register
        alert('Compte créé avec succès ! Connectez-vous maintenant.')
        
        // Passe automatiquement en mode connexion après inscription réussie
        setIsLogin(true)
        
        // Réinitialise le formulaire mais garde l'email saisi (pratique pour la connexion)
        setForm({
          username: '',
          email: form.email,           
          password: '',
          role: 'UTILISATEUR'
        })
      }
    } catch (err) {
      // En cas d'erreur
      setError(err.message)
    } finally {
      // On désactive l'état de chargement
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-xl border border-gray-800 p-6 sm:p-8 shadow-2xl">
        {/* Logo minimal */}
        <div className="text-center mb-8">
          <div className="mx-auto w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            B
          </div>
        </div>

        {/* connexion / inscription */}
        <div className="flex justify-center gap-6 mb-8 text-sm">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`font-medium ${isLogin ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`font-medium ${!isLogin ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
          >
            Inscription
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <>
              <input
                name="username"
                type="text"
                required
                value={form.username}
                onChange={handleChange}
                placeholder="Nom d'utilisateur"
                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              />

              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
              >
                <option value="UTILISATEUR">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </>
          )}

          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />

          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            placeholder="Mot de passe"
            className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
          />

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-950/30 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading 
              ? 'Connexion...' 
              : isLogin 
                ? 'Se connecter' 
                : 'Créer le compte'}
          </button>
        </form>

        

        <p className="text-center text-xs text-gray-500 mt-6">
          En continuant, vous acceptez nos conditions
        </p>
      </div>
    </div>
  )
}