import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ecole } from '../../data/mockData'
import { useAuth } from '../../context/AuthContext'
import { Lock, Mail } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await login(email, password)
    setSubmitting(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-beige flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber flex items-center justify-center font-display font-bold text-navy text-2xl shadow-lg">
            {ecole.logoInitiales}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-navy">
          {ecole.nom}
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Connectez-vous pour accéder à votre espace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-beige-dark">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy">
                Adresse email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:ring-amber focus:border-amber block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                  placeholder="admin@etoiles.bf"
                />
              </div>
              <p className="mt-1 text-xs text-slate">
                Comptes démo (Mot de passe: <strong>password123</strong>)<br/>
                admin@etoiles.bf, directeur@etoiles.bf, comptable@etoiles.bf, parent1@gmail.com
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:ring-amber focus:border-amber block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber focus:ring-amber border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" title="Réinitialiser mon mot de passe" className="font-medium text-amber hover:text-amber-dark">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber transition-colors"
              >
                {submitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </div>
            <div className="mt-4 text-center text-sm">
              <Link to="/register" className="font-medium text-amber hover:text-amber-dark">Créer un compte</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
