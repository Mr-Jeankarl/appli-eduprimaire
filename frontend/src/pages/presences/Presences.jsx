import { useEffect, useState, useMemo } from 'react'
import { Save, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Avatar } from '../../components/ui/index'
import { useAuth } from '../../context/AuthContext'
import { create, list, update } from '../../services/api'

const STATUTS = [
  { key: 'PRESENT',             label: 'Présent',     icon: CheckCircle2, active: 'bg-sage text-white border-sage',     base: 'bg-sage/8 border-sage/20 text-sage' },
  { key: 'ABSENT_JUSTIFIE',     label: 'Absent (J)',  icon: AlertCircle,  active: 'bg-amber text-white border-amber',   base: 'bg-amber/8 border-amber/20 text-amber-dark' },
  { key: 'ABSENT_NON_JUSTIFIE', label: 'Absent (NJ)', icon: XCircle,      active: 'bg-coral text-white border-coral',   base: 'bg-coral/8 border-coral/20 text-coral' },
  { key: 'RETARD',              label: 'Retard',       icon: Clock,        active: 'bg-slate text-white border-slate',   base: 'bg-slate/8 border-slate/20 text-slate' },
]
const toApiStatut = s => s === 'ABSENT_NON_JUSTIFIE' ? 'ABSENT' : s === 'ABSENT_JUSTIFIE' ? 'EXCUSE' : s
const toUiStatut = s => s === 'ABSENT' ? 'ABSENT_NON_JUSTIFIE' : s === 'EXCUSE' ? 'ABSENT_JUSTIFIE' : s
const mapEleve = e => ({ id: String(e.id), apiId: e.id, nom: e.nom, prenom: e.prenom, matricule: e.matricule, classeId: e.classe ? String(e.classe) : '', statut: e.statut === 'INACTIF' ? 'ARCHIVE' : 'INSCRIT' })
const mapClasse = c => ({ id: String(c.id), nom: c.nom, niveau: c.niveau })

export default function Presences() {
  const { user } = useAuth()
  const isTeacher = user?.role === 'ENSEIGNANT'
  const isDirecteur = user?.role === 'DIRECTEUR'

  const statutsAffiches = isTeacher ? [
    { key: 'PRESENT', label: 'Présent', icon: CheckCircle2, active: 'bg-sage text-white border-sage', base: 'bg-sage/8 border-sage/20 text-sage' },
    { key: 'ABSENT_NON_JUSTIFIE', label: 'Absent', icon: XCircle, active: 'bg-coral text-white border-coral', base: 'bg-coral/8 border-coral/20 text-coral' }
  ] : STATUTS;

  // Si c'est un enseignant, on trouve sa classe par défaut
  const [classesData, setClassesData] = useState([])
  const [elevesData, setElevesData] = useState([])
  const [presenceRows, setPresenceRows] = useState([])

  const maClasseId = useMemo(() => {
    if (!isTeacher) return classesData[0]?.id || ''
    return classesData.find(c => c.enseignantId === user?.id)?.id || classesData[0]?.id || ''
  }, [isTeacher, user, classesData])

  const [classeId, setClasseId] = useState(maClasseId)
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [appel, setAppel]       = useState({})
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([list('/eleves/'), list('/ecole/classes/'), list('/presences/')])
      .then(([elevesApi, classesApi, presencesApi]) => {
        if (!mounted) return
        setElevesData(elevesApi.map(mapEleve))
        const nextClasses = classesApi.map(mapClasse)
        setClassesData(nextClasses)
        setClasseId(v => v || nextClasses[0]?.id || '')
        setPresenceRows(presencesApi.map(p => ({ id: p.id, eleveId: String(p.eleve), date: p.date, statut: toUiStatut(p.statut), motif: p.motif })))
      })
      .catch(error => console.error('Chargement présences API impossible:', error))
    return () => { mounted = false }
  }, [])

  const presenceInit = useMemo(() => {
    const map = {}
    presenceRows.filter(p => p.date === date).forEach(p => { 
      map[p.eleveId] = { statut: p.statut, motif: p.motif || '' } 
    })
    return map
  }, [presenceRows, date])

  const elevesClasse = useMemo(
    () => elevesData.filter(e => e.classeId === classeId && e.statut !== 'ARCHIVE'),
    [classeId, elevesData]
  )

  const getStatut = id => appel[id]?.statut || presenceInit[id]?.statut || null
  const getMotif = id => appel[id]?.motif || presenceInit[id]?.motif || ''
  
  const setStatut = (id, statut) => { 
    setAppel(v => ({ ...v, [id]: { ...(v[id] || { motif: getMotif(id) }), statut } })); 
    setConfirmed(false) 
  }
  
  const saveAppel = async () => {
    const entries = Object.entries(appel)
    for (const [eleveId, data] of entries) {
      const existing = presenceRows.find(p => p.eleveId === String(eleveId) && p.date === date)
      const body = { 
        eleve: Number(eleveId), 
        date, 
        statut: toApiStatut(data.statut),
        motif: data.motif || ''
      }
      const saved = existing ? await update(`/presences/${existing.id}/`, body) : await create('/presences/', body)
      setPresenceRows(rows => {
        const mapped = { 
          id: saved.id, 
          eleveId: String(saved.eleve), 
          date: saved.date, 
          statut: toUiStatut(saved.statut),
          motif: saved.motif 
        }
        return existing ? rows.map(r => r.id === existing.id ? mapped : r) : [...rows, mapped]
      })
    }
    setConfirmed(true)
  }

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
        {!isTeacher && (
          <select className="input-base w-auto" value={classeId} onChange={e => { setClasseId(e.target.value); setAppel({}) }}>
            {classesData.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        )}
        <input type="date" className="input-base w-auto" value={date} onChange={e => setDate(e.target.value)} />
        {!isDirecteur && (
          <div className="ml-auto flex gap-2">
            <button onClick={markAllPresent} className="btn-amber text-xs">
              <CheckCircle2 size={14} /> Tout le monde est présent
            </button>
            <button onClick={saveAppel} className={confirmed ? 'btn-amber' : 'btn-primary'}>
              {confirmed ? '✅ Confirmé' : "👍 Valider l'appel"}
            </button>
          </div>
        )}
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
                    {statut && statut !== 'PRESENT' && !isDirecteur && (
                      <input 
                        className="input-base text-[10px] py-1 mt-1 h-6" 
                        placeholder="Motif (ex: Certificat médical...)" 
                        value={getMotif(eleve.id)} 
                        onChange={e => setAppel(v => ({ ...v, [eleve.id]: { ...(v[eleve.id] || { statut }), motif: e.target.value } }))}
                      />
                    )}
                    {statut && statut !== 'PRESENT' && isDirecteur && getMotif(eleve.id) && (
                       <p className="text-[10px] text-coral font-medium mt-1 italic">Motif: {getMotif(eleve.id)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  {isDirecteur ? (
                    (() => {
                      const s = STATUTS.find(st => st.key === statut)
                      if (!s) return <span className="text-slate text-xs italic">Non renseigné</span>
                      return (
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${s.active}`}>
                          <s.icon size={13} />
                          <span className="hidden sm:inline">{s.label}</span>
                        </div>
                      )
                    })()
                  ) : (
                    statutsAffiches.map(s => (
                      <button
                        key={s.key}
                        onClick={() => setStatut(eleve.id, s.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${statut === s.key ? s.active : s.base + ' hover:opacity-80'}`}
                      >
                        <s.icon size={13} />
                        <span className="hidden sm:inline">{s.label}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {!isDirecteur && (
        <div className="flex items-center justify-between bg-navy/5 rounded-xl px-5 py-3">
          <div className="flex gap-5 text-sm">
            <span className="flex items-center gap-1.5 text-sage font-semibold"><span className="w-2 h-2 bg-sage rounded-full" /> {stats.presents} Présents</span>
            <span className="flex items-center gap-1.5 text-coral font-semibold"><span className="w-2 h-2 bg-coral rounded-full" /> {stats.absents} Absents</span>
            {!isTeacher && <span className="flex items-center gap-1.5 text-amber-dark font-semibold"><span className="w-2 h-2 bg-amber rounded-full" /> {stats.retards} Retard</span>}
          </div>
          <button onClick={saveAppel} className="btn-primary text-xs">
            {confirmed ? '✅ Confirmé' : "👍 Valider l'appel"}
          </button>
        </div>
      )}
    </div>
  )
}
