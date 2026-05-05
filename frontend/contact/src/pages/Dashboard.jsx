export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth'
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="max-w-4xl lg:max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Bienvenue{user.username ? `, ${user.username}` : ''}
          </h1>

          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition w-full sm:w-auto text-base sm:text-lg"
          >
            Déconnexion
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-200">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 lg:mb-6 text-slate-900">
            {user.role === 'ADMIN' ? 'Espace Administrateur' : 'Espace Utilisateur'}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {user.role === 'ADMIN'
              ? 'Vous pouvez maintenant envoyer des messages texte ou fichiers à plusieurs utilisateurs simultanément.'
              : 'Vous pouvez consulter vos messages reçus et télécharger les fichiers joints.'}
          </p>
        </div>
      </div>
    </div>
  )
}