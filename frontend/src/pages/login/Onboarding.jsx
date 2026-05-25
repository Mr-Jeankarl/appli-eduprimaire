import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiRequest } from '../../services/api'
import { ecole } from '../../data/mockData'
import { LogoMark } from '../../components/ui'
import Modal from '../../components/ui/Modal'
import { School, UserPlus, ArrowLeft, Loader2, LogOut, CheckCircle, HelpCircle } from 'lucide-react'

export default function Onboarding() {
  const { user, updateUserData, logout } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState('choice') // 'choice', 'create', 'join', 'success'
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form states
  const [schoolForm, setSchoolForm] = useState({ nom: '', adresse: '', description: '' })
  const [telephones, setTelephones] = useState([''])
  const [emails, setEmails] = useState([''])
  const [selectedClasses, setSelectedClasses] = useState([])
  const [inviteCode, setInviteCode] = useState('')

  const classesOptions = [
    { value: 'CP1', label: 'CP1' },
    { value: 'CP2', label: 'CP2' },
    { value: 'CP', label: 'CP (Combiné)' },
    { value: 'CE1', label: 'CE1' },
    { value: 'CE2', label: 'CE2' },
    { value: 'CE', label: 'CE (Combiné)' },
    { value: 'CM1', label: 'CM1' },
    { value: 'CM2', label: 'CM2' },
    { value: 'CM', label: 'CM (Combiné)' },
  ]

  const handleClassToggle = (val) => {
    if (selectedClasses.includes(val)) {
      setSelectedClasses(selectedClasses.filter(c => c !== val))
    } else {
      setSelectedClasses([...selectedClasses, val])
    }
  }

  // Redirect if they already have a school
  if (user && user.ecoleId) {
    return <Navigate to="/dashboard" replace />
  }

  const handleCreateSchool = async (e) => {
    e.preventDefault()
    if (!schoolForm.nom.trim()) {
      setError("Le nom de l'école est requis.")
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await apiRequest('/auth/setup-school/', {
        method: 'POST',
        body: {
          action: 'create',
          nom: schoolForm.nom,
          adresse: schoolForm.adresse,
          description: schoolForm.description,
          telephones: telephones.filter(t => t.trim() !== ''),
          emails: emails.filter(m => m.trim() !== ''),
          classes: selectedClasses,
        }
      })
      setSuccessMsg("Votre école a été créée avec succès ! Préparation de votre tableau de bord...")
      setStep('success')
      setTimeout(() => {
        updateUserData(res.user)
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors de la création.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoinSchool = async (e) => {
    e.preventDefault()
    if (!inviteCode.trim()) {
      setError("Le code d'invitation est requis.")
      return
    }
    setError('')
    setSubmitting(true)
    try {
      const res = await apiRequest('/auth/setup-school/', {
        method: 'POST',
        body: {
          action: 'join',
          code: inviteCode.trim(),
        }
      })
      setSuccessMsg("Félicitations ! Vous avez rejoint l'école avec succès.")
      setStep('success')
      setTimeout(() => {
        updateUserData(res.user)
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError(err.message || "Code invalide ou expiré.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-light via-beige to-beige-dark flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-body">
      
      {/* Header bar */}
      <div className="w-full max-w-5xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LogoMark src={ecole.logoUrl} initials={ecole.logoInitiales} size="md" />
          <span className="font-display font-extrabold text-navy text-lg tracking-wide hidden sm:inline">
            EduPrimaire
          </span>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate hover:text-red-600 hover:bg-red-50 transition-all font-medium text-sm border border-slate/10 bg-white shadow-sm"
        >
          <LogOut size={16} />
          <span>Se déconnecter</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto my-auto py-8">
        
        {step !== 'success' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-3">
              <h1 className="text-4xl font-display font-extrabold text-navy sm:text-5xl">
                Bienvenue, {user?.prenom} ! ✨
              </h1>
              <p className="text-lg text-slate max-w-2xl mx-auto">
                Pour commencer à utiliser la plateforme, vous devez soit créer l'espace de votre école, soit rejoindre une école existante.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-6">
              
              {/* Card 1: Create School */}
              <button
                onClick={() => { setError(''); setStep('create'); }}
                className="group text-left bg-white p-8 rounded-2xl border-2 border-beige-dark/40 hover:border-amber hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber/5 rounded-bl-full group-hover:bg-amber/10 transition-colors" />
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-amber/10 text-amber flex items-center justify-center group-hover:scale-110 transition-transform">
                    <School size={28} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-navy">
                    Créer une nouvelle école
                  </h3>
                  <p className="text-slate text-sm leading-relaxed">
                    Vous êtes le directeur ou le fondateur. Créez un nouvel établissement, gérez le personnel, les classes, et configurez vos modules sur-mesure.
                  </p>
                </div>
                <div className="font-semibold text-amber flex items-center gap-2 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Commencer la création</span>
                  <span>→</span>
                </div>
              </button>

              {/* Card 2: Join School */}
              <button
                onClick={() => { setError(''); setStep('join'); }}
                className="group text-left bg-white p-8 rounded-2xl border-2 border-beige-dark/40 hover:border-navy hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-navy/5 rounded-bl-full group-hover:bg-navy/10 transition-colors" />
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-navy/10 text-navy flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus size={28} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-navy">
                    Rejoindre une école
                  </h3>
                  <p className="text-slate text-sm leading-relaxed">
                    Vous êtes enseignant, secrétaire, comptable ou parent d'élève. Renseignez le code d'invitation fourni par la direction de votre école.
                  </p>
                </div>
                <div className="font-semibold text-navy flex items-center gap-2 group-hover:translate-x-1 transition-transform pt-2">
                  <span>Saisir mon code d'invitation</span>
                  <span>→</span>
                </div>
              </button>

            </div>
          </div>
        )}

        {/* Modal: Create School */}
        <Modal
          open={step === 'create'}
          onClose={() => { setStep('choice'); setError(''); }}
          title="Créer votre établissement"
          size="lg"
        >
          <div className="space-y-1 mb-6">
            <p className="text-slate text-sm">Définissez les paramètres de base et la configuration de votre nouvelle école.</p>
          </div>

          <form onSubmit={handleCreateSchool} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-navy mb-1">Nom de l'école *</label>
              <input
                required
                type="text"
                placeholder="ex: École Primaire Les Étoiles"
                value={schoolForm.nom}
                onChange={(e) => setSchoolForm({ ...schoolForm, nom: e.target.value })}
                className="w-full focus:ring-amber focus:border-amber sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light/50 focus:bg-white transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-1">Description / Slogan</label>
              <textarea
                placeholder="Décrivez votre école ou renseignez votre slogan..."
                value={schoolForm.description}
                onChange={(e) => setSchoolForm({ ...schoolForm, description: e.target.value })}
                className="w-full focus:ring-amber focus:border-amber sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light/50 focus:bg-white transition-all outline-none h-20"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-navy mb-1">Adresse physique</label>
              <input
                type="text"
                placeholder="ex: Avenue de la Liberté, Ouagadougou"
                value={schoolForm.adresse}
                onChange={(e) => setSchoolForm({ ...schoolForm, adresse: e.target.value })}
                className="w-full focus:ring-amber focus:border-amber sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light/50 focus:bg-white transition-all outline-none"
              />
            </div>

            {/* Téléphones multiples (jusqu'à 5) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">Numéros de téléphone (max. 5)</label>
              {telephones.map((tel, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder={`Téléphone ${idx + 1}`}
                    value={tel}
                    onChange={(e) => {
                      const newTels = [...telephones]
                      newTels[idx] = e.target.value
                      setTelephones(newTels)
                    }}
                    className="flex-1 focus:ring-amber focus:border-amber sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light/50 focus:bg-white transition-all outline-none"
                  />
                  {telephones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setTelephones(telephones.filter((_, i) => i !== idx))}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
              {telephones.length < 5 && (
                <button
                  type="button"
                  onClick={() => setTelephones([...telephones, ''])}
                  className="text-sm font-bold text-amber hover:text-amber-dark flex items-center gap-1"
                >
                  + Ajouter un numéro de téléphone
                </button>
              )}
            </div>

            {/* Emails multiples (jusqu'à 5) */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">Adresses email de contact (max. 5)</label>
              {emails.map((mail, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="email"
                    placeholder={`Email ${idx + 1}`}
                    value={mail}
                    onChange={(e) => {
                      const newEmails = [...emails]
                      newEmails[idx] = e.target.value
                      setEmails(newEmails)
                    }}
                    className="flex-1 focus:ring-amber focus:border-amber sm:text-sm border-gray-300 rounded-lg p-3 border bg-beige-light/50 focus:bg-white transition-all outline-none"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEmails(emails.filter((_, i) => i !== idx))}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              ))}
              {emails.length < 5 && (
                <button
                  type="button"
                  onClick={() => setEmails([...emails, ''])}
                  className="text-sm font-bold text-amber hover:text-amber-dark flex items-center gap-1"
                >
                  + Ajouter un email
                </button>
              )}
            </div>

            {/* Choix des Niveaux de classe */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-navy">Niveaux de classes présents dans votre école</label>
              <div className="grid grid-cols-3 gap-3">
                {classesOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleClassToggle(opt.value)}
                    className={`p-3 border rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      selectedClasses.includes(opt.value)
                        ? 'border-amber bg-amber/10 text-navy'
                        : 'border-beige-dark/50 hover:bg-beige-light/30 text-slate'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('choice'); setError(''); }}
                className="w-1/3 py-3 px-4 border border-beige-dark rounded-lg text-sm font-bold text-slate hover:bg-beige-light hover:text-navy transition-all flex items-center justify-center cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-amber hover:bg-amber-dark transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Création de l'école...</span>
                  </>
                ) : (
                  <span>Valider et créer</span>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal: Join School */}
        <Modal
          open={step === 'join'}
          onClose={() => { setStep('choice'); setError(''); }}
          title="Rejoindre une école"
          size="md"
        >
          <div className="space-y-1 mb-6">
            <p className="text-slate text-sm">Entrez le code d'invitation secret fourni par votre école.</p>
          </div>

          <form onSubmit={handleJoinSchool} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-navy mb-1">Code d'invitation *</label>
              <input
                required
                type="text"
                placeholder="ex: INVITE-XXXXXX"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full focus:ring-navy focus:border-navy sm:text-sm border-gray-300 rounded-lg p-4 border bg-beige-light/50 focus:bg-white font-mono text-center text-lg tracking-widest outline-none uppercase transition-all"
              />
            </div>

            <div className="bg-beige-light/40 border border-beige-dark/30 rounded-xl p-4 flex gap-3 text-slate text-sm">
              <HelpCircle className="text-slate shrink-0" size={18} />
              <p className="leading-relaxed">
                Chaque code d'invitation est unique, confidentiel et à usage unique. Il associera votre compte au rôle prédéfini par l'administrateur.
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('choice'); setError(''); }}
                className="w-1/3 py-3 px-4 border border-beige-dark rounded-lg text-sm font-bold text-slate hover:bg-beige-light hover:text-navy transition-all flex items-center justify-center cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-navy hover:bg-navy-light transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Validation du code...</span>
                  </>
                ) : (
                  <span>Valider et rejoindre</span>
                )}
              </button>
            </div>
          </form>
        </Modal>

        {/* Step: Success */}
        {step === 'success' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-beige-dark/60 shadow-xl p-8 sm:p-12 text-center space-y-6 animate-scale-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-display font-extrabold text-navy">Succès !</h2>
              <p className="text-slate leading-relaxed">
                {successMsg}
              </p>
            </div>
            <div className="flex justify-center pt-2">
              <Loader2 className="animate-spin text-navy" size={24} />
            </div>
          </div>
        )}

      </div>

      {/* Footer bar */}
      <div className="w-full max-w-5xl mx-auto text-center text-xs text-slate/50">
        &copy; {new Date().getFullYear()} EduPrimaire. Tous droits réservés.
      </div>

    </div>
  )
}
