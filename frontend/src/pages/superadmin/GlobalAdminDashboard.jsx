import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { Shield, RefreshCw } from 'lucide-react'

export default function GlobalAdminDashboard() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest('/ecole/liste/')
      setSchools(data)
    } catch (err) {
      setError(err.message || 'Impossible de récupérer la liste des écoles.')
    } finally {
      setLoading(false)
    }
  }

  const handleImpersonate = (schoolId) => {
    if (!schoolId) {
      localStorage.removeItem('impersonated_school_id')
    } else {
      localStorage.setItem('impersonated_school_id', schoolId)
    }
    // Recharger la page pour appliquer l'impersonation dans toutes les requêtes API
    window.location.reload()
  }

  const activeImpersonation = localStorage.getItem('impersonated_school_id')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-beige-dark shadow-sm">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-navy">Administration Globale</h1>
          <p className="text-slate text-sm">Supervision de l'ensemble du réseau des écoles EduPrimaire.</p>
        </div>
        <button
          onClick={fetchSchools}
          className="p-2 text-slate hover:text-navy hover:bg-beige-light rounded-lg transition-colors border border-beige-dark/30"
          title="Rafraîchir"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => {
            const isImpersonatingThis = activeImpersonation === String(school.id)
            return (
              <div 
                key={school.id} 
                className={`bg-white p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                  isImpersonatingThis 
                    ? 'border-amber ring-2 ring-amber/20 shadow-md' 
                    : 'border-beige-dark shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-bold text-lg text-navy line-clamp-1">{school.nom}</h3>
                    {school.is_demo && (
                      <span className="bg-amber/10 text-amber text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Démo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate mt-1 line-clamp-2">{school.description || 'Aucune description'}</p>
                  
                  <div className="text-xs text-slate space-y-1 mt-4 pt-3 border-t border-beige-dark/50">
                    <p><strong>Code :</strong> {school.code}</p>
                    <p><strong>Adresse :</strong> {school.adresse || 'N/A'}</p>
                    <p><strong>Année :</strong> {school.annee_scolaire}</p>
                  </div>
                </div>

                <div className="pt-2">
                  {isImpersonatingThis ? (
                    <button
                      onClick={() => handleImpersonate(null)}
                      className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-lg transition-colors border border-red-100 flex items-center justify-center gap-2"
                    >
                      Quitter l'accès
                    </button>
                  ) : (
                    <button
                      onClick={() => handleImpersonate(school.id)}
                      className="w-full py-2 px-3 bg-navy hover:bg-navy-light text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Shield size={14} />
                      Accéder à l'école
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
