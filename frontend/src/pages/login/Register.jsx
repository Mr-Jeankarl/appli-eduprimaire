import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, User, Lock, ArrowLeft } from 'lucide-react'
import { create } from '../../services/api'
import { ecole } from '../../data/mockData'
import { LogoMark } from '../../components/ui'

export default function Register() {
  const [form, setForm] = useState({ email: '', prenom: '', nom: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        email: form.email,
        prenom: form.prenom,
        nom: form.nom,
        password: form.password,
        password_confirm: form.password,
      }
      await create('/auth/register/', payload)
      // après création, rediriger vers login
      navigate('/login')
    } catch (err) { 
      setError(err.message || String(err)) 
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-beige flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogoMark src={ecole.logoUrl} initials={ecole.logoInitiales} size="xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-navy">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Inscrivez-vous pour configurer ou rejoindre votre école
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-beige-dark">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy">
                  Prénom
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.prenom}
                    onChange={set('prenom')}
                    className="focus:ring-amber focus:border-amber block w-full pl-9 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                    placeholder="Jean"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy">
                  Nom
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.nom}
                    onChange={set('nom')}
                    className="focus:ring-amber focus:border-amber block w-full pl-9 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                    placeholder="Dupont"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">
                Adresse email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate" />
                </div>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  className="focus:ring-amber focus:border-amber block w-full pl-9 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate" />
                </div>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  className="focus:ring-amber focus:border-amber block w-full pl-9 sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light"
                  placeholder="•••••••• (min. 8 caractères)"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-navy hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber transition-colors disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Création...' : 'Créer mon compte'}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 text-sm">
              <span className="text-slate">Déjà un compte ?</span>
              <Link to="/login" className="font-semibold text-amber hover:text-amber-dark">
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
