import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ecole } from '../../data/mockData'
import { LogoMark } from '../../components/ui'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simuler l'envoi d'un mail
    console.log('Réinitialisation demandée pour:', email)
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-beige flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <LogoMark src={ecole.logoUrl} initials={ecole.logoInitiales} size="xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-display font-extrabold text-navy">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-slate">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-beige-dark">
          {!submitted ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber transition-colors"
                >
                  Envoyer le lien
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-navy">Email envoyé !</h3>
              <p className="mt-2 text-sm text-slate">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation sous peu.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setEmail('')
                }}
                className="mt-6 text-sm text-amber hover:text-amber-dark font-medium"
              >
                Essayer une autre adresse
              </button>
            </div>
          )}

          <div className="mt-6 border-t border-beige-dark pt-6">
            <Link 
              to="/login" 
              className="flex items-center justify-center text-sm font-medium text-slate hover:text-navy transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
