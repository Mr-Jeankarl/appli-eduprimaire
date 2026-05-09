import { useState, useMemo } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { eleves, classes, matieres, notes as initNotes } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

const PERIODES = [
  { value: 'TRIMESTRE_1', label: 'Trimestre 1' },
  { value: 'TRIMESTRE_2', label: 'Trimestre 2' },
  { value: 'TRIMESTRE_3', label: 'Trimestre 3' },
]

function noteColor(v) {
  if (v === '' || v === null || v === undefined) return 'bg-beige border-beige-dark text-slate'
  const n = parseFloat(v)
  if (isNaN(n)) return 'bg-beige border-beige-dark text-slate'
  if (n >= 15) return 'bg-sage/10 border-sage/30 text-sage font-bold'
  if (n >= 10) return 'bg-amber/10 border-amber/30 text-amber-dark font-bold'
  return 'bg-coral/10 border-coral/30 text-coral font-bold'
}

export default function Notes() {
  const { user } = useAuth()
  const isParent  = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'

  // Classe de l'enseignant
  const maClasseId = useMemo(() => {
    if (!isTeacher) return null
    return classes.find(c => c.enseignantId === user.id)?.id || classes[0].id
  }, [isTeacher, user])

  // Seul l'enseignant voit sa classe; les autres voient toutes
  const classesDisponibles = useMemo(() => {
    if (isTeacher && maClasseId) return classes.filter(c => c.id === maClasseId)
    return classes
  }, [isTeacher, maClasseId])

  // Si parent, on cible directement son enfant
  const monEnfant = useMemo(() => {
    if (!isParent || !user) return null
    return eleves.find(e => e.parentNom && user.nom && e.parentNom.includes(user.nom)) || eleves[0]
  }, [isParent, user])

  const childId     = monEnfant?.id || ''
  const childPrenom = monEnfant?.prenom || 'votre enfant'
  const childNom    = monEnfant?.nom || ''

  const [classeId,  setClasseId]  = useState(
    isParent && monEnfant ? monEnfant.classeId :
    isTeacher && maClasseId ? maClasseId :
    classes[4].id
  )
  const [matiereId, setMatiereId] = useState(matieres[0].id)
  const [periode,   setPeriode]   = useState('TRIMESTRE_1')
  const [notesList, setNotesList] = useState(initNotes)
  const [saved, setSaved]         = useState(false)
  const [modalDetail, setModalDetail] = useState(null)

  const elevesClasse = useMemo(
    () => {
      if (isParent) return monEnfant ? [monEnfant] : []
      return eleves.filter(e => e.classeId === classeId && e.statut !== 'ARCHIVE')
    },
    [classeId, isParent, monEnfant]
  )

  const getNote = eleveId => notesList.find(n => n.eleveId === eleveId && n.matiereId === matiereId && n.periode === periode)

  const updateNote = (eleveId, field, val) => {
    setSaved(false)
    setNotesList(prev => {
      const idx = prev.findIndex(n => n.eleveId === eleveId && n.matiereId === matiereId && n.periode === periode)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], [field]: val }
        return copy
      }
      return [...prev, { id: `n-${Date.now()}-${eleveId}`, eleveId, matiereId, periode, valeur: '', appreciation: '', [field]: val }]
    })
  }

  const nbSaisies = elevesClasse.filter(e => {
    const n = getNote(e.id)
    return n && n.valeur !== '' && n.valeur !== undefined
  }).length

  const progression = elevesClasse.length > 0 ? Math.round((nbSaisies / elevesClasse.length) * 100) : 0

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            {isParent ? `Bulletins — ${childPrenom}` : 'Saisie des Notes'}
          </h1>
          <p className="text-slate text-sm">
            {isParent ? 'Consultez les notes et appréciations' : 'Saisissez les notes sur 20 pour chaque étudiant'}
          </p>
        </div>
        {!isParent && (
          <button onClick={() => setSaved(true)} className={saved ? 'btn-amber' : 'btn-primary'}>
            <Save size={15} /> {saved ? 'Enregistré' : 'Enregistrer'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 items-end">
        {!isParent && (
          <>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Classe</label>
              <select className="input-base w-auto" value={classeId} onChange={e => setClasseId(e.target.value)}>
                {classesDisponibles.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Matière</label>
              <select className="input-base w-auto" value={matiereId} onChange={e => setMatiereId(e.target.value)}>
                {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
          </>
        )}
        <div>
          <label className="text-xs font-semibold text-slate block mb-1">Période</label>
          <select className="input-base w-auto" value={periode} onChange={e => setPeriode(e.target.value)}>
            {PERIODES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {!isParent && (
          <div className="ml-auto card bg-navy text-white p-4 flex items-center gap-4 min-w-48">
            <div>
              <p className="text-white/60 text-[10px] uppercase">Progression</p>
              <p className="font-display font-bold text-2xl">{nbSaisies} / {elevesClasse.length}</p>
            </div>
            <div className="flex-1">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-amber rounded-full transition-all" style={{ width: progression + '%' }} />
              </div>
              <p className="text-xs text-white/50 mt-1 text-right">{progression}%</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-coral inline-block" /> &lt;10 Insuffisant</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber inline-block" /> 10–14 Moyen</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sage inline-block" /> 15+ Excellent</span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige border-b border-beige-dark">
              {isParent ? (
                <>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Matière</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Moyenne / 20</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Élève</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Dernière note</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Note / 20</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Commentaire</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isParent ? (
              matieres.map(m => {
                const note = childId ? notesList.find(n => n.eleveId === childId && n.matiereId === m.id && n.periode === periode) : null
                const val  = note?.valeur ?? '—'
                return (
                  <tr key={m.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-5 py-3 font-semibold text-navy">{m.nom}</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm border ${noteColor(val)}`}>
                        {val}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button 
                        onClick={() => setModalDetail({ matiere: m, note })}
                        className="btn-ghost text-xs text-amber-dark border-amber-dark/20 hover:bg-amber/10"
                      >
                        Voir plus
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
              elevesClasse.map(eleve => {
                if (!eleve) return null;
                const note = getNote(eleve.id)
                const val  = note?.valeur ?? ''
                const appr = note?.appreciation ?? ''
                const ancienne = initNotes.find(n => n.eleveId === eleve.id && n.matiereId === matiereId)
                return (
                  <tr key={eleve.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-5 py-3 font-mono text-xs text-slate">{eleve.matricule}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                        <span className="font-semibold text-navy">{eleve.nom} {eleve.prenom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate">{ancienne ? ancienne.valeur : '—'}</td>
                    <td className="px-5 py-3">
                      <input
                        type="number" min={0} max={20} step={0.5}
                        placeholder="—"
                        value={val}
                        disabled={isParent}
                        onChange={e => updateNote(eleve.id, 'valeur', e.target.value)}
                        className={`w-24 text-center rounded-lg border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-amber/40 ${noteColor(val)} ${isParent ? 'cursor-default' : ''}`}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="text"
                        placeholder={isParent ? 'Pas de remarque' : 'Ajouter une remarque...'}
                        value={appr}
                        disabled={isParent}
                        onChange={e => updateNote(eleve.id, 'appreciation', e.target.value)}
                        className={`input-base text-xs ${isParent ? 'bg-transparent border-none cursor-default' : ''}`}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!modalDetail} onClose={() => setModalDetail(null)} title={`Détails — ${modalDetail?.matiere.nom}`} size="md">
        {modalDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-beige/50 rounded-xl border border-beige-dark">
              <Avatar prenom={childPrenom} nom={childNom} size="md" />
              <div>
                <h3 className="font-display font-bold text-navy text-lg">{childNom} {childPrenom}</h3>
                <p className="text-xs text-slate">{monEnfant?.matricule} — {classes.find(c => c.id === monEnfant?.classeId)?.nom}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-navy uppercase tracking-wider">Historique des notes ({PERIODES.find(p => p.value === periode)?.label})</h4>
              <div className="space-y-3">
                {[
                  { date: '12/03/2024', type: 'Contrôle continu', note: modalDetail.note?.valeur || '14', comment: modalDetail.note?.appreciation || 'Bon travail, continuez ainsi.' },
                  { date: '25/03/2024', type: 'Examen de période', note: (parseFloat(modalDetail.note?.valeur || '14') - 1).toString(), comment: 'Attention à la rédaction.' }
                ].map((n, i) => (
                  <div key={i} className="card p-4 flex items-start justify-between gap-4 border-l-4 border-l-amber">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate uppercase">{n.type}</span>
                        <span className="text-[10px] text-slate/60">·</span>
                        <span className="text-[10px] text-slate/60">{n.date}</span>
                      </div>
                      <p className="text-sm text-navy font-medium italic">"{n.comment}"</p>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border text-lg font-bold ${noteColor(n.note)}`}>
                      {n.note}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setModalDetail(null)} className="btn-primary px-8">Fermer</button>
            </div>
          </div>
        )}
      </Modal>

      {!isParent && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber rounded-full inline-block" /> Modifications enregistrées localement.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setNotesList(initNotes); setSaved(false) }} className="btn-ghost text-xs"><RotateCcw size={13} /> Annuler</button>
            <button onClick={() => setSaved(true)} className="btn-primary text-xs"><Save size={13} /> Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  )
}
