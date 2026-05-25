import { useEffect, useState, useMemo } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { create, list, update, downloadFile } from '../../services/api'

const PERIODES = [
  { value: 'TRIMESTRE_1', label: 'Trimestre 1' },
  { value: 'TRIMESTRE_2', label: 'Trimestre 2' },
  { value: 'TRIMESTRE_3', label: 'Trimestre 3' },
]
const toApiPeriode = p => p === 'TRIMESTRE_1' ? 'T1' : p === 'TRIMESTRE_2' ? 'T2' : 'T3'
const toUiPeriode = p => p === 'T1' ? 'TRIMESTRE_1' : p === 'T2' ? 'TRIMESTRE_2' : 'TRIMESTRE_3'
const mapEleve = e => ({ id: String(e.id), nom: e.nom, prenom: e.prenom, matricule: e.matricule, classeId: e.classe ? String(e.classe) : '', statut: e.statut === 'INACTIF' ? 'ARCHIVE' : 'INSCRIT' })
const mapClasse = c => ({ id: String(c.id), nom: c.nom, niveau: c.niveau })
const mapMatiere = m => ({ id: String(m.id), nom: m.nom, couleur: '#1E3A5F', note_sur: m.note_sur || 20 })
const mapNote = n => ({ id: String(n.id), apiId: n.id, eleveId: String(n.eleve), matiereId: String(n.matiere), periode: toUiPeriode(n.trimestre), valeur: Number(n.note), appreciation: n.observations || '' })

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
  const isDirecteur = user?.role === 'DIRECTEUR'
  const [elevesData, setElevesData] = useState([])
  const [classesData, setClassesData] = useState([])
  const [matieresData, setMatieresData] = useState([])

  // Classe de l'enseignant
  const maClasseId = useMemo(() => {
    if (!isTeacher) return null
    return classesData.find(c => c.enseignantId === user?.id)?.id || classesData[0]?.id
  }, [isTeacher, user, classesData])

  // Seul l'enseignant voit sa classe; les autres voient toutes
  const classesDisponibles = useMemo(() => {
    if (isTeacher && maClasseId) return classesData.filter(c => c.id === maClasseId)
    return classesData
  }, [isTeacher, maClasseId, classesData])

  // Si parent, on cible directement son enfant
  const monEnfant = useMemo(() => {
    if (!isParent || !user) return null
    return elevesData.find(e => e.parentNom && user.nom && e.parentNom.includes(user.nom)) || elevesData[0]
  }, [isParent, user, elevesData])

  const childId     = monEnfant?.id || ''
  const childPrenom = monEnfant?.prenom || 'votre enfant'
  const childNom    = monEnfant?.nom || ''

  const [classeId,  setClasseId]  = useState('')
  const [matiereId, setMatiereId] = useState('')
  const [periode,   setPeriode]   = useState('TRIMESTRE_1')
  const [baseNote,  setBaseNote]  = useState(20)
  const [notesList, setNotesList] = useState([])
  const [saved, setSaved]         = useState(false)
  const [modalDetail, setModalDetail] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([list('/notes/'), list('/eleves/'), list('/ecole/classes/'), list('/ecole/matieres/')])
      .then(([notesApi, elevesApi, classesApi, matieresApi]) => {
        if (!mounted) return
        const nextClasses = classesApi.map(mapClasse)
        const nextMatieres = matieresApi.map(mapMatiere)
        setNotesList(notesApi.map(mapNote))
        setElevesData(elevesApi.map(mapEleve))
        setClassesData(nextClasses)
        setMatieresData(nextMatieres)
        setClasseId(v => v || nextClasses[0]?.id || '')
        setMatiereId(v => v || nextMatieres[0]?.id || '')
      })
      .catch(error => console.error('Chargement notes API impossible:', error))
    return () => { mounted = false }
  }, [])

  const elevesClasse = useMemo(
    () => {
      if (isParent) return monEnfant ? [monEnfant] : []
      return elevesData.filter(e => e.classeId === classeId && e.statut !== 'ARCHIVE')
    },
    [classeId, isParent, monEnfant, elevesData]
  )

  const getNote = eleveId => notesList.find(n => n.eleveId === eleveId && n.matiereId === matiereId && n.periode === periode)

  const updateNote = async (eleveId, field, val) => {
    setSaved(false)
    const existing = getNote(eleveId)
    const next = { ...(existing || {}), eleveId, matiereId, periode, valeur: '', appreciation: '', [field]: val }
    setNotesList(prev => {
      const idx = prev.findIndex(n => n.eleveId === eleveId && n.matiereId === matiereId && n.periode === periode)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], [field]: val }
        return copy
      }
      return [...prev, { id: `n-${Date.now()}-${eleveId}`, eleveId, matiereId, periode, valeur: '', appreciation: '', [field]: val }]
    })
    if (field === 'valeur' && val !== '') {
      const selectedMatiere = matieresData.find(m => m.id === matiereId)
      const maxScore = selectedMatiere?.note_sur || 20
      const body = { eleve: Number(eleveId), matiere: Number(matiereId), trimestre: toApiPeriode(periode), type_evaluation: 'DEVOIR', note: Number(next.valeur || val), note_sur: maxScore, annee_scolaire: '2024-2025', date_evaluation: new Date().toISOString().split('T')[0], observations: next.appreciation || '' }
      const saved = existing?.apiId ? await update(`/notes/${existing.apiId}/`, body) : await create('/notes/', body)
      const mapped = mapNote(saved)
      setNotesList(prev => prev.map(n => n.id === next.id || (n.eleveId === eleveId && n.matiereId === matiereId && n.periode === periode) ? mapped : n))
    }
  }

  const nbSaisies = elevesClasse.filter(e => {
    const n = getNote(e.id)
    return n && n.valeur !== '' && n.valeur !== undefined
  }).length

  const progression = elevesClasse.length > 0 ? Math.round((nbSaisies / elevesClasse.length) * 100) : 0
  
  const [bulletinsList, setBulletinsList] = useState([])
  
  useEffect(() => {
    list('/notes/bulletins/').then(setBulletinsList)
  }, [periode])

  const handleDownloadBulletin = async (eleveId) => {
    try {
      // On cherche si un bulletin existe déjà
      const apiPeriode = toApiPeriode(periode)
      let bulletin = bulletinsList.find(b => b.eleve === Number(eleveId) && b.trimestre === apiPeriode)
      
      if (!bulletin) {
        // On le crée s'il n'existe pas
        bulletin = await create('/notes/bulletins/', {
          eleve: Number(eleveId),
          trimestre: apiPeriode,
          annee_scolaire: '2024-2025'
        })
        setBulletinsList(prev => [...prev, bulletin])
      }
      
      await downloadFile(`/notes/bulletins/${bulletin.id}/pdf/`, `Bulletin_${eleveId}_${apiPeriode}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Erreur lors du téléchargement du bulletin')
    }
  }

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
        {isParent && (
          <button onClick={() => handleDownloadBulletin(childId)} className="btn-primary flex items-center gap-2">
            <Save size={18} /> Télécharger Bulletin (PDF)
          </button>
        )}
        {!isParent && !isDirecteur && (
          <button onClick={() => setSaved(true)} className={saved ? 'btn-amber' : 'btn-primary'}>
            {saved ? '✅ Enregistré' : '👍 Valider'}
          </button>
        )}
        {isDirecteur && (
          <button className="btn-primary" onClick={() => alert('Sélectionnez un élève pour exporter son bulletin')}>
            Exporter en PDF
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
            {!isDirecteur && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate block mb-1">Matière</label>
                  <select className="input-base w-auto" value={matiereId} onChange={e => setMatiereId(e.target.value)}>
                    {matieresData.map(m => <option key={m.id} value={m.id}>{m.nom} (sur {m.note_sur || 20})</option>)}
                  </select>
                </div>
              </>
            )}
          </>
        )}
        <div>
          <label className="text-xs font-semibold text-slate block mb-1">Période</label>
          <select className="input-base w-auto" value={periode} onChange={e => setPeriode(e.target.value)}>
            {PERIODES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {!isParent && !isDirecteur && (
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

      <div className="card overflow-hidden table-responsive">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-beige border-b border-beige-dark">
              {isParent ? (
                <>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Matière</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Moyenne / 20</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Actions</th>
                </>
              ) : isDirecteur ? (
                <>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Élève</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Actions</th>
                </>
              ) : (
                <>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Élève</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Dernière note</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Note / {matieresData.find(m => m.id === matiereId)?.note_sur || 20}</th>
                  <th className="text-left px-5 py-3 text-xs font-bold text-slate uppercase tracking-wider">Commentaire</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isParent ? (
              matieresData.map(m => {
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
            ) : isDirecteur ? (
              elevesClasse.map(eleve => {
                if (!eleve) return null;
                return (
                  <tr key={eleve.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-5 py-3 font-mono text-xs text-slate">{eleve.matricule}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                        <span className="font-semibold text-navy">{eleve.nom} {eleve.prenom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setModalDetail({ eleve })}
                          className="btn-ghost text-xs text-amber-dark border-amber-dark/20 hover:bg-amber/10"
                        >
                          Voir les notes
                        </button>
                        <button 
                          onClick={() => handleDownloadBulletin(eleve.id)}
                          className="btn-ghost text-xs text-navy border-navy/20 hover:bg-navy/5"
                        >
                          Bulletin PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              elevesClasse.map(eleve => {
                if (!eleve) return null
                const note = getNote(eleve.id)
                const val  = note?.valeur ?? ''
                const appr = note?.appreciation ?? ''
                return (
                  <tr key={eleve.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-5 py-3 font-mono text-xs text-slate">{eleve.matricule}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" />
                        <span className="font-semibold text-navy">{eleve.nom} {eleve.prenom}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate">—</td>
                    <td className="px-5 py-3">
                      <input
                        type="number" min={0} max={matieresData.find(m => m.id === matiereId)?.note_sur || 20} step={0.5}
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

      <Modal open={!!modalDetail} onClose={() => setModalDetail(null)} title={modalDetail?.eleve ? `Notes de ${modalDetail.eleve.nom}` : `Détails — ${modalDetail?.matiere?.nom}`} size="md">
        {modalDetail && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-beige/50 rounded-xl border border-beige-dark">
              <Avatar prenom={modalDetail.eleve ? modalDetail.eleve.prenom : childPrenom} nom={modalDetail.eleve ? modalDetail.eleve.nom : childNom} size="md" />
              <div>
                <h3 className="font-display font-bold text-navy text-lg">{modalDetail.eleve ? `${modalDetail.eleve.nom} ${modalDetail.eleve.prenom}` : `${childNom} ${childPrenom}`}</h3>
                <p className="text-xs text-slate">{modalDetail.eleve ? modalDetail.eleve.matricule : monEnfant?.matricule} — {classesData.find(c => c.id === (modalDetail.eleve ? modalDetail.eleve.classeId : monEnfant?.classeId))?.nom}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-navy uppercase tracking-wider">
                {modalDetail.eleve ? `Notes par matière (${PERIODES.find(p => p.value === periode)?.label})` : `Historique des notes (${PERIODES.find(p => p.value === periode)?.label})`}
              </h4>
              <div className="space-y-3">
                {modalDetail.eleve ? (
                  matieresData.map(m => {
                    const note = notesList.find(n => n.eleveId === modalDetail.eleve.id && n.matiereId === m.id && n.periode === periode)
                    const val = note?.valeur ?? '—'
                    return (
                      <div key={m.id} className="flex justify-between items-center py-2 border-b border-beige-dark/60">
                        <span className="text-sm text-navy font-semibold">{m.nom}</span>
                        <span className={`px-3 py-1 rounded-full text-sm border ${noteColor(val)}`}>{val} / {baseNote}</span>
                      </div>
                    )
                  })
                ) : (
                  [
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
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setModalDetail(null)} className="btn-primary px-8">Fermer</button>
            </div>
          </div>
        )}
      </Modal>

      {!isParent && !isDirecteur && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber rounded-full inline-block" /> Modifications enregistrées localement.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { window.location.reload() }} className="btn-ghost text-xs"><RotateCcw size={13} /> Recharger</button>
            <button onClick={() => setSaved(true)} className="btn-primary text-xs">{saved ? '✅ Enregistré' : '👍 Valider'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
