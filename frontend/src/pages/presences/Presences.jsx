import { useState, useMemo } from 'react'
import { Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { eleves, classes, presences as initPresences } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'

const STATUTS = [
  { key: 'PRESENT',             label: 'Présent',     icon: CheckCircle2, active: 'bg-sage text-white border-sage',     base: 'bg-sage/8 border-sage/20 text-sage' },
  { key: 'ABSENT_JUSTIFIE',     label: 'Absent (J)',  icon: AlertCircle,  active: 'bg-amber text-white border-amber',   base: 'bg-amber/8 border-amber/20 text-amber-dark' },
  { key: 'ABSENT_NON_JUSTIFIE', label: 'Absent (NJ)', icon: XCircle,      active: 'bg-coral text-white border-coral',   base: 'bg-coral/8 border-coral/20 text-coral' },
  { key: 'RETARD',              label: 'Retard',       icon: Clock,        active: 'bg-slate text-white border-slate',   base: 'bg-slate/8 border-slate/20 text-slate' },
]

export default function Presences() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'ENSEIGNANT'

  // Si c'est un enseignant, on trouve sa classe par défaut
  const maClasseId = useMemo(() => {
    if (!isTeacher) return classes[0].id
    return classes.find(c => c.enseignantId === user.id)?.id || classes[0].id
  }, [isTeacher, user])

  const [classeId, setClasseId] = useState(maClasseId)
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [appel, setAppel]       = useState({})
  const [confirmed, setConfirmed] = useState(false)

  const presenceInit = useMemo(() => {
    const map = {}
    initPresences.filter(p => p.classeId === classeId).forEach(p => { map[p.eleveId] = p.statut })
    return map
  }, [classeId])

  const elevesClasse = useMemo(
    () => eleves.filter(e => e.classeId === classeId && e.statut !== 'ARCHIVE'),
    [classeId]
  )

  const getStatut = id => appel[id] || presenceInit[id] || null
  const setStatut = (id, statut) => { setAppel(v => ({ ...v, [id]: statut })); setConfirmed(false) }

  const markAllPresent = () => {
    const newAppel = {}
    elevesClasse.forEach(e => {
      newAppel[e.id] = 'PRESENT'
    })
    setAppel(newAppel)
    setConfirmed(false)
  }

  const stats = useMemo(() => {
    const all = elevesClasse.map(e => getStatut(e.id))
    return {
      presents: all.filter(s => s === 'PRESENT').length,
      absents:  all.filter(s => s === 'ABSENT_NON_JUSTIFIE' || s === 'ABSENT_JUSTIFIE').length,
      retards:  all.filter(s => s === 'RETARD').length,
    }
  }, [appel, presenceInit, elevesClasse])

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">Présences et Appel</h1>
        </div>
        <select className="input-base w-auto" value={classeId} onChange={e => { setClasseId(e.target.value); setAppel({}) }}>
          {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <input type="date" className="input-base w-auto" value={date} onChange={e => setDate(e.target.value)} />
        <div className="ml-auto flex gap-2">
          <button onClick={markAllPresent} className="btn-amber text-xs">
            <CheckCircle2 size={14} /> Tout le monde est présent
          </button>
          <button onClick={() => setConfirmed(true)} className={confirmed ? 'btn-amber' : 'btn-primary'}>
            <Save size={15} /> {confirmed ? 'Appel confirmé' : "Confirmer l'appel"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 bg-navy text-white text-center">
          <p className="font-display font-bold text-3xl">{elevesClasse.length}</p>
          <p className="text-white/60 text-xs mt-1">Total élèves</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display font-bold text-3xl text-sage">{stats.presents}</p>
          <p className="text-slate text-xs mt-1">Présents</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display font-bold text-3xl text-coral">{stats.absents}</p>
          <p className="text-slate text-xs mt-1">Absents</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display font-bold text-3xl text-amber-dark">{stats.retards}</p>
          <p className="text-slate text-xs mt-1">En retard</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-3 bg-beige border-b border-beige-dark flex items-center">
          <p className="text-xs font-bold text-slate uppercase tracking-wider flex-1">Élève</p>
          <p className="text-xs font-bold text-slate uppercase tracking-wider">Statut</p>
        </div>
        <div className="divide-y divide-beige-dark">
          {elevesClasse.map(eleve => {
            const statut = getStatut(eleve.id)
            return (
              <div key={eleve.id} className={`flex items-center gap-4 px-5 py-3.5 transition ${statut === 'PRESENT' ? 'bg-sage/3' : statut === 'ABSENT_NON_JUSTIFIE' ? 'bg-coral/3' : statut === 'RETARD' ? 'bg-amber/3' : ''}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                  <div>
                    <p className="font-semibold text-navy text-sm">{eleve.nom} {eleve.prenom}</p>
                    <p className="text-xs text-slate">{eleve.matricule}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {STATUTS.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setStatut(eleve.id, s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${statut === s.key ? s.active : s.base + ' hover:opacity-80'}`}
                    >
                      <s.icon size={13} />
                      <span className="hidden sm:inline">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between bg-navy/5 rounded-xl px-5 py-3">
        <div className="flex gap-5 text-sm">
          <span className="flex items-center gap-1.5 text-sage font-semibold"><span className="w-2 h-2 bg-sage rounded-full" /> {stats.presents} Présents</span>
          <span className="flex items-center gap-1.5 text-coral font-semibold"><span className="w-2 h-2 bg-coral rounded-full" /> {stats.absents} Absents</span>
          <span className="flex items-center gap-1.5 text-amber-dark font-semibold"><span className="w-2 h-2 bg-amber rounded-full" /> {stats.retards} Retard</span>
        </div>
        <button onClick={() => setConfirmed(true)} className="btn-primary text-xs">
          <Save size={13} /> {confirmed ? 'Confirmé' : "Confirmer l'appel"}
        </button>
      </div>
    </div>
  )
}
