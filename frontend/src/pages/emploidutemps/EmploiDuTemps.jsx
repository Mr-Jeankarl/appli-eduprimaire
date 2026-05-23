import { useEffect, useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { emploiDuTemps as initEDT, enseignants, matieres, classes, eleves } from '../../data/mockData'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { create, list, remove, update } from '../../services/api'

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const HEURES = ['07:30', '08:30', '09:30', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00']

function CreneauForm({ initial = {}, onSubmit, onCancel, edt, classeIdDefault, classesOptions = classes, matieresOptions = matieres, enseignantsOptions = enseignants }) {
  const [form, setForm] = useState({ classeId: classeIdDefault || '', matiereId: '', enseignantId: '', jour: 1, heureDebut: '07:30', heureFin: '08:30', salle: '', ...initial })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  const conflit = useMemo(() => edt.some(e =>
    e.id !== form.id && e.classeId === form.classeId && Number(e.jour) === Number(form.jour) && e.heureDebut === form.heureDebut
  ), [form, edt])
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate">Classe *</label>
          <select required className="input-base mt-1" value={form.classeId} onChange={set('classeId')}>
            <option value="">Sélectionner...</option>
            {classesOptions.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Matière *</label>
          <select required className="input-base mt-1" value={form.matiereId} onChange={set('matiereId')}>
            <option value="">Sélectionner...</option>
            {matieresOptions.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Enseignant</label>
          <select className="input-base mt-1" value={form.enseignantId} onChange={set('enseignantId')}>
            <option value="">—</option>
            {enseignantsOptions.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Salle</label>
          <input className="input-base mt-1" value={form.salle} onChange={set('salle')} placeholder="Salle 3" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Jour *</label>
          <select required className="input-base mt-1" value={form.jour} onChange={set('jour')}>
            {JOURS.map((j, i) => <option key={i} value={i + 1}>{j}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-semibold text-slate">Début</label><input type="time" className="input-base mt-1" value={form.heureDebut} onChange={set('heureDebut')} /></div>
          <div><label className="text-xs font-semibold text-slate">Fin</label><input type="time" className="input-base mt-1" value={form.heureFin} onChange={set('heureFin')} /></div>
        </div>
      </div>
      {conflit && (
        <div className="flex items-center gap-2 bg-coral/10 border border-coral/25 rounded-lg px-4 py-3 text-sm text-coral">
          <AlertCircle size={15} /> Conflit — un créneau existe déjà à cette heure pour cette classe.
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" disabled={conflit} className={"btn-primary " + (conflit ? 'opacity-50 cursor-not-allowed' : '')}>{initial.id ? 'Modifier' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

export default function EmploiDuTemps() {
  const { user } = useAuth()
  const isParent = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'
  const isDirecteur = user?.role === 'DIRECTEUR'
  const isReadOnly = isParent || isDirecteur

  // Si parent, on trouve la classe de son enfant
  const monEnfant = useMemo(() => {
    if (!isParent) return null
    return eleves.find(e => e.parentNom.includes(user?.nom)) || eleves[0]
  }, [isParent, user])

  // Si enseignant, on trouve sa classe
  const maClasseId = useMemo(() => {
    if (!isTeacher) return null
    return classes.find(c => c.enseignantId === user.id)?.id || classes[0].id
  }, [isTeacher, user])

  const [edt, setEdt]     = useState(initEDT)
  const [classesData, setClassesData] = useState(classes)
  const [matieresData, setMatieresData] = useState(matieres)
  const [enseignantsData, setEnseignantsData] = useState(enseignants)
  const [classeId, setClasseId] = useState(
    isParent && monEnfant ? monEnfant.classeId :
    isTeacher && maClasseId ? maClasseId :
    classes[4].id
  )
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(null)
  const [modalDel, setModalDel]     = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([list('/emploi-du-temps/'), list('/ecole/classes/'), list('/ecole/matieres/'), list('/enseignants/')])
      .then(([edtApi, classesApi, matieresApi, enseignantsApi]) => {
        if (!mounted) return
        const nextClasses = classesApi.map(c => ({ id: String(c.id), nom: c.nom, niveau: c.niveau }))
        const nextMatieres = matieresApi.map(m => ({ id: String(m.id), nom: m.nom, couleur: '#1E3A5F' }))
        const nextEns = enseignantsApi.map(e => ({ id: String(e.id), prenom: e.prenom || e.user_detail?.prenom || '', nom: e.nom || e.user_detail?.nom || '' }))
        setClassesData(nextClasses)
        setMatieresData(nextMatieres)
        setEnseignantsData(nextEns)
        setEdt(edtApi.map(e => ({ id: String(e.id), apiId: e.id, classeId: String(e.classe), matiereId: String(e.matiere), enseignantId: e.enseignant ? String(e.enseignant) : '', jour: e.jour, heureDebut: e.heure_debut?.slice(0, 5), heureFin: e.heure_fin?.slice(0, 5), salle: e.salle })))
        setClasseId(v => v || nextClasses[0]?.id || '')
      })
      .catch(error => console.error('Chargement emploi du temps API impossible:', error))
    return () => { mounted = false }
  }, [])

  const edtClasse = useMemo(() => edt.filter(e => e.classeId === classeId), [edt, classeId])
  const getCell   = (jour, heure) => edtClasse.find(e => Number(e.jour) === jour && e.heureDebut === heure)
  const getMatiere = id => matieresData.find(m => m.id === id)
  const getEns     = id => enseignantsData.find(e => e.id === id)

  const payload = data => ({ classe: Number(data.classeId), matiere: Number(data.matiereId), enseignant: data.enseignantId ? Number(data.enseignantId) : null, jour: Number(data.jour), heure_debut: data.heureDebut, heure_fin: data.heureFin, salle: data.salle })
  const mapSaved = e => ({ id: String(e.id), apiId: e.id, classeId: String(e.classe), matiereId: String(e.matiere), enseignantId: e.enseignant ? String(e.enseignant) : '', jour: e.jour, heureDebut: e.heure_debut?.slice(0, 5), heureFin: e.heure_fin?.slice(0, 5), salle: e.salle })
  const handleAjout = async data => { const saved = await create('/emploi-du-temps/', payload(data)); setEdt(v => [...v, mapSaved(saved)]); setModalAjout(false) }
  const handleEdit  = async data => { const saved = await update(`/emploi-du-temps/${data.apiId || data.id}/`, payload(data)); setEdt(v => v.map(e => e.id === data.id ? mapSaved(saved) : e)); setModalEdit(null) }
  const handleDel   = async () => { await remove(`/emploi-du-temps/${modalDel.apiId || modalDel.id}/`); setEdt(v => v.filter(e => e.id !== modalDel.id)); setModalDel(null) }

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            {isTeacher ? 'Mon Emploi du Temps' : 'Emploi du Temps'}
          </h1>
          <p className="text-slate text-sm">
            {isTeacher ? `${classes.find(c => c.id === classeId)?.nom || ''} — ${edtClasse.length} créneaux` : `${edtClasse.length} créneaux`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn-ghost">
            📄 Exporter en PDF
          </button>
          {!isParent && !isTeacher && (
            <select className="input-base w-auto" value={classeId} onChange={e => setClasseId(e.target.value)}>
              {classesData.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          )}
          {!isReadOnly && (
            <button onClick={() => setModalAjout(true)} className="btn-primary"><Plus size={16} /> Ajouter un créneau</button>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm border-collapse">
          <thead>
            <tr className="bg-beige">
              <th className="px-3 py-3 text-left text-xs font-bold text-slate uppercase tracking-wider w-20 border-b border-beige-dark">Heure</th>
              {JOURS.map(j => <th key={j} className="px-3 py-3 text-center text-xs font-bold text-slate uppercase tracking-wider border-b border-l border-beige-dark">{j}</th>)}
            </tr>
          </thead>
          <tbody>
            {HEURES.map(heure => (
              <tr key={heure} className="border-b border-beige-dark/50">
                <td className="px-3 py-2 text-xs font-mono text-slate bg-beige/50 border-r border-beige-dark">{heure}</td>
                {JOURS.map((_, ji) => {
                  const cr  = getCell(ji + 1, heure)
                  const mat = cr ? getMatiere(cr.matiereId) : null
                  const ens = cr ? getEns(cr.enseignantId) : null
                  return (
                    <td key={ji} className="px-2 py-1.5 border-l border-beige-dark/50 min-h-14 align-top">
                      {cr && mat ? (
                        <div className="rounded-lg px-2.5 py-2 group relative cursor-pointer hover:opacity-90 transition" style={{ background: mat.couleur + '18', borderLeft: '3px solid ' + mat.couleur }}>
                          <p className="text-xs font-bold truncate" style={{ color: mat.couleur }}>{mat.nom}</p>
                          {ens && <p className="text-[10px] text-slate truncate">{ens.prenom} {ens.nom}</p>}
                          {cr.salle && <p className="text-[10px] text-slate/60">{cr.salle}</p>}
                          {!isReadOnly && (
                            <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                              <button onClick={() => setModalEdit(cr)} className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm hover:bg-beige"><Edit2 size={10} /></button>
                              <button onClick={() => setModalDel(cr)} className="w-5 h-5 bg-white rounded flex items-center justify-center shadow-sm hover:bg-coral/10"><Trash2 size={10} className="text-coral" /></button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        {matieres.map(m => (
          <span key={m.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: m.couleur + '15', color: m.couleur }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: m.couleur }} />{m.nom}
          </span>
        ))}
      </div>

      <Modal open={modalAjout}  onClose={() => setModalAjout(false)}  title="Ajouter un créneau" size="md"><CreneauForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} edt={edt} classeIdDefault={classeId} classesOptions={classesData} matieresOptions={matieresData} enseignantsOptions={enseignantsData} /></Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Modifier le créneau" size="md">{modalEdit && <CreneauForm initial={modalEdit} onSubmit={handleEdit} onCancel={() => setModalEdit(null)} edt={edt} classeIdDefault={classeId} classesOptions={classesData} matieresOptions={matieresData} enseignantsOptions={enseignantsData} />}</Modal>
      <Modal open={!!modalDel}  onClose={() => setModalDel(null)}  title="Supprimer" size="sm">
        {modalDel && (
          <div className="space-y-4">
            <p className="text-sm text-slate">Supprimer ce créneau de <strong className="text-navy">{getMatiere(modalDel.matiereId)?.nom}</strong> ({JOURS[modalDel.jour - 1]} {modalDel.heureDebut}) ?</p>
            <div className="flex justify-end gap-3"><button onClick={() => setModalDel(null)} className="btn-ghost">Annuler</button><button onClick={handleDel} className="btn-danger">Supprimer</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
