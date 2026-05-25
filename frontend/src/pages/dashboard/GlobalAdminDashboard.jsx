import { useState, useEffect } from 'react'
import { list, apiRequest } from '../../services/api'
import { School, Users, GraduationCap, Building2, Search, ArrowRight, ShieldAlert } from 'lucide-react'

export default function GlobalAdminDashboard() {
  const [ecoles, setEcoles] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    list('/ecole/')
      .then(data => {
        setEcoles(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message || "Erreur de chargement des établissements.")
        setLoading(false)
      })
  }, [])

  const startImpersonating = (schoolId) => {
    localStorage.setItem('eduprimaire_impersonate_school_id', schoolId)
    // Forcer le rechargement de la page pour réinitialiser les routes et le contexte utilisateur
    window.location.href = '/dashboard'
  }

  const filteredEcoles = ecoles.filter(ecole => 
    ecole.nom.toLowerCase().includes(search.toLowerCase()) ||
    (ecole.code && ecole.code.toLowerCase().includes(search.toLowerCase())) ||
    (ecole.adresse && ecole.adresse.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-navy">Console Administrateur Général</h1>
          <p className="text-slate text-sm">Supervisez l'intégralité du parc d'établissements scolaires et configurez l'impersonation.</p>
        </div>
        <div className="flex items-center gap-2 bg-amber/10 border border-amber/30 text-navy px-4 py-2 rounded-xl text-sm font-semibold">
          <ShieldAlert size={18} className="text-amber" />
          <span>Accès Super-Administrateur</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 bg-white">
          <div className="p-4 rounded-xl bg-navy/10 text-navy">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy font-display">{ecoles.length}</p>
            <p className="text-xs text-slate uppercase font-semibold tracking-wider">Écoles Enregistrées</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 bg-white">
          <div className="p-4 rounded-xl bg-amber/15 text-amber-dark">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy font-display">
              {ecoles.reduce((acc, curr) => acc + (curr.nombre_eleves || 0), 0)}
            </p>
            <p className="text-xs text-slate uppercase font-semibold tracking-wider">Total Élèves</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 bg-white">
          <div className="p-4 rounded-xl bg-sage/10 text-sage">
            <GraduationCap size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-navy font-display">Active</p>
            <p className="text-xs text-slate uppercase font-semibold tracking-wider">Statut Plateforme</p>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-beige">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-light" size={18} />
          <input
            type="text"
            placeholder="Rechercher une école par nom, code ou adresse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-beige-light border border-beige-dark/50 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber/40 focus:border-amber transition"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {/* Schools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEcoles.map((ecole) => (
          <div key={ecole.id} className="card p-6 flex flex-col justify-between bg-white hover:shadow-xl transition-all duration-300">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-lg bg-navy/5 text-navy flex items-center justify-center font-bold text-lg border border-navy/10">
                  {ecole.nom.substring(0, 2).toUpperCase()}
                </div>
                <span className="badge-slate font-mono text-[10px] tracking-wider uppercase bg-beige/30">
                  {ecole.code || `ID: ${ecole.id}`}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-navy line-clamp-1">{ecole.nom}</h3>
                <p className="text-xs text-slate-light line-clamp-1 mt-0.5">{ecole.adresse || 'Aucune adresse enregistrée'}</p>
              </div>
              <p className="text-xs text-slate line-clamp-2 min-h-[2rem]">
                {ecole.description || "Aucune description fournie par l'établissement."}
              </p>
            </div>

            <div className="border-t border-beige/40 pt-4 mt-4 flex items-center justify-between">
              <span className="text-xs text-slate font-medium">
                Devise: <strong>{ecole.devise || 'FCFA'}</strong>
              </span>
              
              <button
                onClick={() => startImpersonating(ecole.id)}
                className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-amber hover:text-navy hover:shadow-md transition-all cursor-pointer"
              >
                <span>Inspecter</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEcoles.length === 0 && (
        <div className="text-center py-12 text-slate bg-white rounded-xl border border-beige">
          <School className="mx-auto text-slate-light mb-3" size={40} />
          <p className="font-medium">Aucune école ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  )
}
