import { createContext, useContext, useState, useEffect } from 'react'
import { utilisateurs } from '../data/mockData'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier s'il y a un utilisateur dans le localStorage
    const storedUser = localStorage.getItem('eduprimaire_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    // Simulation basique : n'importe quel mot de passe fonctionne pour les emails existants dans la mockData
    const foundUser = utilisateurs.find(u => u.email === email)
    if (foundUser) {
      // Formater l'utilisateur pour correspondre à la structure attendue
      const loggedUser = {
        id: foundUser.id,
        nom: foundUser.nom,
        prenom: foundUser.prenom,
        email: foundUser.email,
        role: foundUser.role,
        roleLabel: foundUser.role.charAt(0) + foundUser.role.slice(1).toLowerCase(),
        initiales: `${foundUser.prenom.charAt(0)}${foundUser.nom.charAt(0)}`.toUpperCase()
      }
      setUser(loggedUser)
      localStorage.setItem('eduprimaire_user', JSON.stringify(loggedUser))
      return { success: true }
    }
    return { success: false, message: "Email incorrect ou introuvable." }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('eduprimaire_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
