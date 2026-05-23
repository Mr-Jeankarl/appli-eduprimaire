import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, BookOpen, RotateCcw, Edit2, Trash2, AlertTriangle, Eye } from 'lucide-react'
import { livres as initLivres, emprunts as initEmprunts, eleves } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { create, list, remove, update } from '../../services/api'

const CATS = ['Manuels', 'Littérature', 'Jeunesse', 'Histoire', 'Sciences', 'Autre']
const statutClass = s => s === 'EN_COURS' ? 'badge-green' : s === 'EN_RETARD' ? 'badge-red' : 'badge-slate'
const statutLabel = s => s === 'EN_COURS' ? 'En cours' : s === 'EN_RETARD' ? 'En retard' : 'Rendu'
const mapLivre = l => ({ id: String(l.id), apiId: l.id, titre: l.titre, auteur: l.auteur, isbn: l.isbn, editeur: l.editeur, annee: l.annee, categorie: l.categorie, stockTotal: l.stock_total, stockDispo: l.stock_dispo })
const mapEmprunt = e => ({ id: String(e.id), apiId: e.id, livreId: String(e.livre), eleveId: String(e.eleve), dateEmprunt: e.date_emprunt, dateRetourPrevue: e.date_retour_prevue, dateRetourReelle: e.date_retour_reelle, statut: e.statut })

function LivreForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ titre: '', auteur: '', isbn: '', editeur: '', annee: '', categorie: 'Manuels', stockTotal: 1, stockDispo: 1, ...initial })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><label className="text-xs font-semibold text-slate">Titre *</label><input required className="input-base mt-1" value={form.titre} onChange={set('titre')} /></div>
        <div><label className="text-xs font-semibold text-slate">Auteur</label><input className="input-base mt-1" value={form.auteur} onChange={set('auteur')} /></div>
        <div><label className="text-xs font-semibold text-slate">Éditeur</label><input className="input-base mt-1" value={form.editeur} onChange={set('editeur')} /></div>
        <div><label className="text-xs font-semibold text-slate">ISBN</label><input className="input-base mt-1" value={form.isbn} onChange={set('isbn')} /></div>
        <div><label className="text-xs font-semibold text-slate">Année</label><input type="number" className="input-base mt-1" value={form.annee} onChange={set('annee')} /></div>
        <div><label className="text-xs font-semibold text-slate">Catégorie</label><select className="input-base mt-1" value={form.categorie} onChange={set('categorie')}>{CATS.map(c => <option key={c}>{c}</option>)}</select></div>
        <div><label className="text-xs font-semibold text-slate">Stock total</label><input type="number" min={1} className="input-base mt-1" value={form.stockTotal} onChange={set('stockTotal')} /></div>
        <div><label className="text-xs font-semibold text-slate">Stock disponible</label><input type="number" min={0} className="input-base mt-1" value={form.stockDispo} onChange={set('stockDispo')} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">{initial.id ? 'Modifier' : 'Ajouter au catalogue'}</button>
      </div>
    </form>
  )
}

function EmpruntForm({ livres, elevesOptions = eleves, onSubmit, onCancel }) {
  const eleves = elevesOptions
  const [form, setForm] = useState({ livreId: '', eleveId: '', dateEmprunt: new Date().toISOString().split('T')[0], dateRetourPrevue: '' })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate">Élève *</label>
        <select required className="input-base mt-1" value={form.eleveId} onChange={set('eleveId')}>
          <option value="">Sélectionner un élève...</option>
          {eleves.filter(e => e.statut !== 'ARCHIVE').map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.matricule}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate">Livre *</label>
        <select required className="input-base mt-1" value={form.livreId} onChange={set('livreId')}>
          <option value="">Sélectionner un livre...</option>
          {livres.filter(l => l.stockDispo > 0).map(l => <option key={l.id} value={l.id}>{l.titre} ({l.stockDispo} dispo)</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-semibold text-slate">Date emprunt</label><input type="date" className="input-base mt-1" value={form.dateEmprunt} onChange={set('dateEmprunt')} /></div>
        <div><label className="text-xs font-semibold text-slate">Retour prévu *</label><input required type="date" className="input-base mt-1" value={form.dateRetourPrevue} onChange={set('dateRetourPrevue')} /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </div>
    </form>
  )
}

export default function Bibliotheque() {
  const { user } = useAuth()
  const isDirecteur = user?.role === 'DIRECTEUR'
  const isReadOnly = isDirecteur

  const [onglet, setOnglet]     = useState('catalogue')
  const [livres, setLivres]     = useState(initLivres)
  const [emprunts, setEmprunts] = useState(initEmprunts)
  const [elevesOptions, setElevesOptions] = useState(eleves)
  const [search, setSearch]     = useState('')
  const [filtreCat, setFiltreCat] = useState('')
  const [modalLivre, setModalLivre]   = useState(false)
  const [modalEdit, setModalEdit]     = useState(null)
  const [modalEmprunt, setModalEmprunt] = useState(false)
  const [modalDel, setModalDel]       = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([list('/bibliotheque/livres/'), list('/bibliotheque/emprunts/'), list('/eleves/')])
      .then(([livresApi, empruntsApi, elevesApi]) => {
        if (!mounted) return
        setLivres(livresApi.map(mapLivre))
        setEmprunts(empruntsApi.map(mapEmprunt))
        setElevesOptions(elevesApi.map(e => ({ id: String(e.id), nom: e.nom, prenom: e.prenom, matricule: e.matricule, statut: e.statut === 'INACTIF' ? 'ARCHIVE' : 'INSCRIT' })))
      })
      .catch(error => console.error('Chargement bibliothèque API impossible:', error))
    return () => { mounted = false }
  }, [])

  const getEleve = id => eleves.find(e => e.id === id)
  const getLivre = id => livres.find(l => l.id === id)
  const enRetard = emprunts.filter(e => e.statut === 'EN_RETARD')

  const filteredLivres = useMemo(() => livres.filter(l => {
    const q = search.toLowerCase()
    return (!q || l.titre.toLowerCase().includes(q) || (l.auteur || '').toLowerCase().includes(q)) && (!filtreCat || l.categorie === filtreCat)
  }), [livres, search, filtreCat])

  const livrePayload = data => ({ titre: data.titre, auteur: data.auteur, isbn: data.isbn, editeur: data.editeur, annee: data.annee ? Number(data.annee) : null, categorie: data.categorie, stock_total: Number(data.stockTotal), stock_dispo: Number(data.stockDispo) })
  const handleAjoutLivre = async data => {
    const saved = await create('/bibliotheque/livres/', livrePayload(data))
    setLivres(v => [...v, mapLivre(saved)])
    setModalLivre(false)
  }
  const handleEditLivre = async data => {
    const saved = await update(`/bibliotheque/livres/${data.apiId || data.id}/`, livrePayload(data))
    setLivres(v => v.map(l => l.id === data.id ? mapLivre(saved) : l))
    setModalEdit(null)
  }
  const handleDelLivre = async () => {
    await remove(`/bibliotheque/livres/${modalDel.apiId || modalDel.id}/`)
    setLivres(v => v.filter(l => l.id !== modalDel.id))
    setModalDel(null)
  }
  const handleAjoutEmprunt = async data => {
    const saved = await create('/bibliotheque/emprunts/', { livre: Number(data.livreId), eleve: Number(data.eleveId), date_emprunt: data.dateEmprunt, date_retour_prevue: data.dateRetourPrevue, statut: 'EN_COURS' })
    setEmprunts(v => [...v, mapEmprunt(saved)])
    setLivres(v => v.map(l => l.id === data.livreId ? { ...l, stockDispo: l.stockDispo - 1 } : l))
    setModalEmprunt(false)
  }
  const handleRetour = async id => {
    const emp = emprunts.find(e => e.id === id)
    const retour = new Date().toISOString().split('T')[0]
    await update(`/bibliotheque/emprunts/${emp.apiId || id}/`, { statut: 'RENDU', date_retour_reelle: retour })
    setEmprunts(v => v.map(e => e.id === id ? { ...e, statut: 'RENDU', dateRetourReelle: retour } : e))
    if (emp) setLivres(v => v.map(l => l.id === emp.livreId ? { ...l, stockDispo: l.stockDispo + 1 } : l))
  }

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="font-display text-2xl font-bold text-navy">Bibliothèque</h1><p className="text-slate text-sm">{livres.length} ouvrages · {emprunts.filter(e => e.statut !== 'RENDU').length} emprunts en cours</p></div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button onClick={() => setModalEmprunt(true)} className="btn-ghost"><BookOpen size={15} /> Nouvel emprunt</button>
            <button onClick={() => setModalLivre(true)}   className="btn-primary"><Plus size={15} /> Ajouter un livre</button>
          </div>
        )}
        {isReadOnly && (
          <div className="flex items-center gap-2 text-xs text-slate bg-beige/60 border border-beige-dark rounded-lg px-3 py-2">
            <Eye size={14} className="text-amber-dark" /> Mode consultation
          </div>
        )}
      </div>

      {enRetard.length > 0 && (
        <div className="flex items-center gap-3 bg-coral/8 border border-coral/20 rounded-xl px-4 py-3 text-sm text-coral">
          <AlertTriangle size={16} className="flex-shrink-0" />
          <span><strong>{enRetard.length}</strong> emprunt(s) en retard — pensez à relancer les familles.</span>
        </div>
      )}

      <div className="flex gap-1 bg-beige-dark/40 p-1 rounded-xl w-fit">
        {[{ id: 'catalogue', label: 'Catalogue' }, { id: 'emprunts', label: "Emprunts (" + emprunts.filter(e => e.statut !== 'RENDU').length + ")" }].map(t => (
          <button key={t.id} onClick={() => setOnglet(t.id)} className={"px-4 py-2 rounded-lg text-sm font-semibold transition " + (onglet === t.id ? 'bg-beige-card shadow-card text-navy' : 'text-slate hover:text-navy')}>{t.label}</button>
        ))}
      </div>

      {onglet === 'catalogue' && (
        <>
          <div className="flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
              <input className="input-base pl-9" placeholder="Titre, auteur..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-base w-auto" value={filtreCat} onChange={e => setFiltreCat(e.target.value)}>
              <option value="">Toutes catégories</option>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLivres.map(livre => (
              <div key={livre.id} className="card p-4 flex flex-col gap-3 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-12 bg-navy/8 rounded-lg flex items-center justify-center flex-shrink-0"><BookOpen size={18} className="text-navy/40" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy text-sm leading-tight line-clamp-2">{livre.titre}</p>
                    <p className="text-xs text-slate mt-0.5">{livre.auteur || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="badge-navy">{livre.categorie}</span>
                  <span className={"font-semibold " + (livre.stockDispo === 0 ? 'text-coral' : livre.stockDispo <= 3 ? 'text-amber-dark' : 'text-sage')}>{livre.stockDispo}/{livre.stockTotal} dispo</span>
                </div>
                <div className="h-1 bg-beige-dark rounded-full overflow-hidden">
                  <div className="h-full bg-amber rounded-full" style={{ width: (livre.stockDispo / livre.stockTotal * 100) + '%' }} />
                </div>
                {!isReadOnly && (
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => setModalEdit(livre)} className="text-slate hover:text-navy p-1 rounded transition"><Edit2 size={13} /></button>
                    <button onClick={() => setModalDel(livre)}  className="text-slate hover:text-coral p-1 rounded transition"><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {onglet === 'emprunts' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige border-b border-beige-dark">
                {['Élève', 'Livre', 'Emprunt', 'Retour prévu', 'Statut', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {emprunts.map(emp => {
                const eleve = getEleve(emp.eleveId)
                const livre = getLivre(emp.livreId)
                return (
                  <tr key={emp.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-4 py-3">{eleve && <div className="flex items-center gap-2"><Avatar prenom={eleve.prenom} nom={eleve.nom} size="sm" /><span className="font-semibold text-navy text-sm">{eleve.nom} {eleve.prenom}</span></div>}</td>
                    <td className="px-4 py-3 text-navy font-medium text-sm line-clamp-1">{livre?.titre || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate">{emp.dateEmprunt}</td>
                    <td className="px-4 py-3 text-xs text-slate">{emp.dateRetourPrevue}</td>
                    <td className="px-4 py-3"><span className={statutClass(emp.statut) + ' text-[11px]'}>{statutLabel(emp.statut)}</span></td>
                    <td className="px-4 py-3">
                      {emp.statut !== 'RENDU' && !isReadOnly && (
                        <button onClick={() => handleRetour(emp.id)} className="flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline">
                          <RotateCcw size={12} /> Retour
                        </button>
                      )}
                      {emp.statut !== 'RENDU' && isReadOnly && (
                        <span className="text-xs text-amber-dark font-semibold">En cours</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalLivre}    onClose={() => setModalLivre(false)}    title="Ajouter un livre"    size="md"><LivreForm onSubmit={handleAjoutLivre} onCancel={() => setModalLivre(false)} /></Modal>
      <Modal open={!!modalEdit}   onClose={() => setModalEdit(null)}   title="Modifier le livre"   size="md">{modalEdit && <LivreForm initial={modalEdit} onSubmit={handleEditLivre} onCancel={() => setModalEdit(null)} />}</Modal>
      <Modal open={modalEmprunt}  onClose={() => setModalEmprunt(false)}  title="Nouvel emprunt"      size="md"><EmpruntForm livres={livres} elevesOptions={elevesOptions} onSubmit={handleAjoutEmprunt} onCancel={() => setModalEmprunt(false)} /></Modal>
      <Modal open={!!modalDel}    onClose={() => setModalDel(null)}    title="Supprimer le livre"  size="sm">
        {modalDel && <div className="space-y-4"><p className="text-sm text-slate">Supprimer <strong className="text-navy">"{modalDel.titre}"</strong> ?</p><div className="flex justify-end gap-3"><button onClick={() => setModalDel(null)} className="btn-ghost">Annuler</button><button onClick={handleDelLivre} className="btn-danger">Supprimer</button></div></div>}
      </Modal>
    </div>
  )
}
