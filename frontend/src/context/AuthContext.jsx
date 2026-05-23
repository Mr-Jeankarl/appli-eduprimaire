import { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest, clearTokens, getAccessToken, loginApi, logoutApi } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('eduprimaire_user')
    if (!getAccessToken()) {
      setLoading(false)
      return
    }
    apiRequest('/auth/me/')
      .then(profile => {
        const cached = storedUser ? JSON.parse(storedUser) : null
        setUser(formatUser(profile || cached))
      })
      .catch(() => {
        clearTokens()
        localStorage.removeItem('eduprimaire_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const formatUser = data => ({
    id: data.id,
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    role: data.role,
    roleLabel: data.role?.charAt(0) + data.role?.slice(1).toLowerCase(),
    initiales: `${data.prenom?.charAt(0) || ''}${data.nom?.charAt(0) || ''}`.toUpperCase(),
    peutGererModules: data.peut_gerer_modules,
    ecoleId: data.ecole_id,
    ecoleNom: data.ecole_nom,
  })

  const login = async (email, password) => {
    try {
      const result = await loginApi(email, password)
      const loggedUser = formatUser(result.user)
      setUser(loggedUser)
      localStorage.setItem('eduprimaire_user', JSON.stringify(loggedUser))
      return { success: true }
    } catch (error) {
      return { success: false, message: error.message || "Email ou mot de passe incorrect." }
    }
  }

  const logout = async () => {
    await logoutApi()
    setUser(null)
    localStorage.removeItem('eduprimaire_user')
  }

  const updateUserData = (newData) => {
    const updated = formatUser(newData)
    setUser(updated)
    localStorage.setItem('eduprimaire_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserData, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
