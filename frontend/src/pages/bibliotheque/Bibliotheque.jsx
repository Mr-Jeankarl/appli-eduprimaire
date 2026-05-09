import { useState, useMemo } from 'react'
import { Plus, Search, BookOpen, RotateCcw, Edit2, Trash2, AlertTriangle } from 'lucide-react'
import { livres as initLivres, emprunts as initEmprunts, eleves } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'

const CATS = ['Manuels', 'Littérature', 'Jeunesse', 'Histoire', 'Sciences', 'Autre']
const statutClass = s => s === 'EN_COURS' ? 'badge-green' : s === 'EN_RETARD' ? 'badge-red' : 'badge-slate'
const statutLabel = s => s === 'EN_COURS' ? 'En cours' : s === 'EN_RETARD' ? 'En retard' : 'Rendu'

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

function EmpruntForm({ livres, onSubmit, onCancel }) {
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
  const [onglet, setOnglet]     = useState('catalogue')
  const [livres, setLivres]     = useState(initLivres)
  const [emprunts, setEmprunts] = useState(initEmprunts)
  const [search, setSearch]     = useState('')
  const [filtreCat, setFiltreCat] = useState('')
  const [modalLivre, setModalLivre]   = useState(false)
  const [modalEdit, setModalEdit]     = useState(null)
  const [modalEmprunt, setModalEmprunt] = useState(false)
  const [modalDel, setModalDel]       = useState(null)

  const getEleve = id => eleves.find(e => e.id === id)
  const getLivre = id => livres.find(l => l.id === id)
  const enRetard = emprunts.filter(e => e.statut === 'EN_RETARD')

  const filteredLivres = useMemo(() => livres.filter(l => {
    const q = search.toLowerCase()
    return (!q || l.titre.toLowerCase().includes(q) || (l.auteur || '').toLowerCase().includes(q)) && (!filtreCat || l.categorie === filtreCat)
  }), [livres, search, filtreCat])

  const handleAjoutLivre   = data => { setLivres(v => [...v, { ...data, id: `liv-${Date.now()}`, stockTotal: Number(data.stockTotal), stockDispo: Number(data.stockDispo) }]); setModalLivre(false) }
  const handleEditLivre    = data => { setLivres(v => v.map(l => l.id === data.id ? { ...data, stockTotal: Number(data.stockTotal), stockDispo: Number(data.stockDispo) } : l)); setModalEdit(null) }
  const handleDelLivre     = ()   => { setLivres(v => v.filter(l => l.id !== modalDel.id)); setModalDel(null) }
  const handleAjoutEmprunt = data => {
    setEmprunts(v => [...v, { ...data, id: `emp-${Date.now()}`, statut: 'EN_COURS', dateRetourReelle: null }])
    setLivres(v => v.map(l => l.id === data.livreId ? { ...l, stockDispo: l.stockDispo - 1 } : l))
    setModalEmprunt(false)
  }
  const handleRetour = id => {
    const emp = emprunts.find(e => e.id === id)
    setEmprunts(v => v.map(e => e.id === id ? { ...e, statut: 'RENDU', dateRetourReelle: new Date().toISOString().split('T')[0] } : e))
    if (emp) setLivres(v => v.map(l => l.id === emp.livreId ? { ...l, stockDispo: l.stockDispo + 1 } : l))
  }

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div><h1 className="font-display text-2xl font-bold text-navy">Bibliothèque</h1><p className="text-slate text-sm">{livres.length} ouvrages · {emprunts.filter(e => e.statut !== 'RENDU').length} emprunts en cours</p></div>
        <div className="flex gap-2">
          <button onClick={() => setModalEmprunt(true)} className="btn-ghost"><BookOpen size={15} /> Nouvel emprunt</button>
          <button onClick={() => setModalLivre(true)}   className="btn-primary"><Plus size={15} /> Ajouter un livre</button>
        </div>
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
                <div className="flex gap-1.5 justify-end">
                  <button onClick={() => setModalEdit(livre)} className="text-slate hover:text-navy p-1 rounded transition"><Edit2 size={13} /></button>
                  <button onClick={() => setModalDel(livre)}  className="text-slate hover:text-coral p-1 rounded transition"><Trash2 size={13} /></button>
                </div>
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
                      {emp.statut !== 'RENDU' && (
                        <button onClick={() => handleRetour(emp.id)} className="flex items-center gap-1.5 text-xs font-semibold text-sage hover:underline">
                          <RotateCcw size={12} /> Retour
                        </button>
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
      <Modal open={modalEmprunt}  onClose={() => setModalEmprunt(false)}  title="Nouvel emprunt"      size="md"><EmpruntForm livres={livres} onSubmit={handleAjoutEmprunt} onCancel={() => setModalEmprunt(false)} /></Modal>
      <Modal open={!!modalDel}    onClose={() => setModalDel(null)}    title="Supprimer le livre"  size="sm">
        {modalDel && <div className="space-y-4"><p className="text-sm text-slate">Supprimer <strong className="text-navy">"{modalDel.titre}"</strong> ?</p><div className="flex justify-end gap-3"><button onClick={() => setModalDel(null)} className="btn-ghost">Annuler</button><button onClick={handleDelLivre} className="btn-danger">Supprimer</button></div></div>}
      </Modal>
    </div>
  )
}
