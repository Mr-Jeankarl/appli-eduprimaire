import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Key, Shield, Calendar, AlertCircle } from 'lucide-react'
import { list, create } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import CopyBadge from './CopyBadge'

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  TEACHER: 'Enseignant',
  ACCOUNTANT: 'Comptable',
  STUDENT: 'Élève'
}

export default function InvitationPanel() {
  const { user } = useAuth()
  const isAdminOrDirecteur = user?.role === 'ADMIN' || user?.role === 'DIRECTEUR'

  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form states for manual invitation creation
  const [role, setRole] = useState('STUDENT')
  const [manualCode, setManualCode] = useState('')
  const [expiryDays, setExpiryDays] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchInvitations = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await list('/ecole/invitations/')
      setInvitations(data)
    } catch (err) {
      setError("Impossible de charger les codes d'invitations.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const handleRegenerate = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir régénérer les codes d'invitations par défaut ? Les codes non utilisés seront supprimés.")) {
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Call reset endpoint
      await create('/ecole/invitations/?reset=true', {})
      setSuccess('Les codes d\'invitations par défaut ont été régénérés avec succès.')
      await fetchInvitations()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError("Erreur lors de la régénération des codes.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateManual = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      const payload = { role }
      if (manualCode) {
        payload.code = manualCode.toUpperCase().trim()
      }
      if (expiryDays) {
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays))
        payload.expire_le = expiryDate.toISOString()
      }

      await create('/ecole/invitations/', payload)
      setSuccess("L'invitation manuelle a été créée avec succès.")
      setManualCode('')
      setExpiryDays('')
      await fetchInvitations()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err?.message || "Erreur lors de la création de l'invitation.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Filter default vs manual invitations (standard roles: no custom email or expiry, not used yet)
  const defaultRoles = ['ADMIN', 'TEACHER', 'ACCOUNTANT', 'STUDENT']
  
  // Group standard active invitations
  const defaultInvs = defaultRoles.map(r => {
    // Find the latest unused invitation for this standard role
    return invitations
      .filter(inv => inv.role === r && !inv.utilise && !inv.expire_le)
      .sort((a, b) => new Date(b.cree_le) - new Date(a.cree_le))[0]
  }).filter(Boolean)

  const manualInvs = invitations.filter(inv => 
    !defaultInvs.some(di => di.id === inv.id)
  )

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-coral/5 border border-coral/20 text-coral text-xs">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-sage/5 border border-sage/20 text-sage text-xs">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Grid of 4 Default Codes */}
      <div className="card p-6 bg-white/40 dark:bg-navy-dark/40 border border-beige-dark/50 dark:border-slate/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="font-display font-bold text-navy dark:text-white text-lg flex items-center gap-2">
              <Key size={18} className="text-amber" /> Codes d'invitation par défaut
            </h3>
            <p className="text-xs text-slate dark:text-white/60 mt-0.5">Ces codes permanents permettent aux nouveaux membres de s'inscrire directement avec le bon rôle.</p>
          </div>
          {isAdminOrDirecteur && (
            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5 border border-beige-dark hover:border-navy/10 dark:border-slate/10 dark:hover:border-white/10"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Régénérer
            </button>
          )}
        </div>

        {loading && invitations.length === 0 ? (
          <div className="flex justify-center p-6">
            <RefreshCw size={24} className="animate-spin text-navy" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {defaultRoles.map(r => {
              const inv = defaultInvs.find(i => i.role === r)
              return (
                <div key={r} className="p-1">
                  {inv ? (
                    <CopyBadge text={inv.code} label={ROLE_LABELS[r]} />
                  ) : (
                    <div className="p-3.5 rounded-xl border border-dashed border-beige-dark text-center text-xs text-slate/50">
                      Non généré
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Manual and Admin creation section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form to create a new manual code */}
        {isAdminOrDirecteur && (
          <div className="card p-6 bg-white/40 dark:bg-navy-dark/40 border border-beige-dark/50 dark:border-slate/10 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-navy dark:text-white text-lg flex items-center gap-2">
              <Shield size={18} className="text-amber" /> Créer un code manuel
            </h3>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate dark:text-white/80">Rôle ciblé *</label>
                <select 
                  className="input-base mt-1" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  {Object.entries(ROLE_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate dark:text-white/80">Code d'accès <span className="text-slate/50 font-normal">(optionnel, 8 caractères max)</span></label>
                <input 
                  className="input-base mt-1 font-mono uppercase" 
                  placeholder="EX: CLASSE26"
                  maxLength={8}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate dark:text-white/80">Durée de validité <span className="text-slate/50 font-normal">(jours optionnel)</span></label>
                <div className="relative mt-1">
                  <input 
                    type="number" 
                    min={1} 
                    className="input-base pr-10" 
                    placeholder="Expire après X jours"
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate/50" />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting} 
                className="w-full btn-primary flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Plus size={16} />
                {submitting ? 'Création...' : 'Générer le code'}
              </button>
            </form>
          </div>
        )}

        {/* List of active/used manual codes */}
        <div className="card p-6 bg-white/40 dark:bg-navy-dark/40 border border-beige-dark/50 dark:border-slate/10 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-navy dark:text-white text-lg flex items-center gap-2">
            <Key size={18} className="text-navy dark:text-amber" /> Codes complémentaires
          </h3>
          
          <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
            {manualInvs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate/50">
                Aucun code d'invitation complémentaire actif.
              </div>
            ) : (
              manualInvs.map(inv => (
                <div key={inv.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-beige-dark/50 bg-white/50 dark:bg-navy-dark/60 dark:border-slate/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate/60 dark:text-white/50">{ROLE_LABELS[inv.role] || inv.role}</span>
                    <code className="font-mono text-sm font-bold text-navy dark:text-amber mt-0.5">{inv.code}</code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.utilise 
                        ? 'bg-sage/10 text-sage' 
                        : inv.expire_le && new Date(inv.expire_le) < new Date()
                          ? 'bg-coral/10 text-coral'
                          : 'bg-amber/10 text-amber-dark'
                    }`}>
                      {inv.utilise 
                        ? 'Utilisé' 
                        : inv.expire_le && new Date(inv.expire_le) < new Date()
                          ? 'Expiré'
                          : 'Actif'}
                    </span>
                    <CopyBadge text={inv.code} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
