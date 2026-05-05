//Import des hooks nécessaires de React
import { createContext, useContext, useState, useEffect } from 'react'

//Création du contexte

const AuthContext = createContext()

//Création du Provider 
export function AuthProvider({ children }) {
  
  //État qui contient les informations de l'utilisateur connecté
  const [user, setUser] = useState(null)

  //Vérifier si l'utilisateur est déjà connecté via localStorage
  useEffect(() => {
    // Récupérer le token et les données utilisateur depuis le localStorage
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    // Si on trouve un token et des données utilisateur,on les charge dans l'état
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      // Sinon on s'assure que l'utilisateur est considéré comme déconnecté
      setUser(null)
    }
  }, [])

  // Fonction pour connecter un utilisateur et sauvegarder les données dans localStorage et met à jour l'état
  const login = (token, userData) => {
    localStorage.setItem('token', token)                    
    localStorage.setItem('user', JSON.stringify(userData))  
    setUser(userData)                                       
  }

  // Fonction pour déconnecter l'utilisateur et supprime les données du localStorage et remet l'état à null
  const logout = () => {
    localStorage.removeItem('token')      
    localStorage.removeItem('user')       
    setUser(null)                        
  }

  // Fourniture des valeurs (user, login, logout) à tous les composants enfants
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser facilement le contexte dans n'importe quel composant
export const useAuth = () => useContext(AuthContext)