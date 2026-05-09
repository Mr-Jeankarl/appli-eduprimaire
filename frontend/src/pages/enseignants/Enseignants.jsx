import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Phone, Mail } from 'lucide-react'
import { enseignants as initEns, classes, matieres } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'

const INIT = { nom: '', prenom: '', email: '', telephone: '', specialite: '', classeId: '', matricule: '', dateEmbauche: '', matieres: [] }

function EnsForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ ...INIT, ...initial })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  const toggleMat = id => setForm(v => ({ ...v, matieres: v.matieres.includes(id) ? v.matieres.filter(m => m !== id) : [...v.matieres, id] }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-semibold text-slate">Nom *</label><input required className="input-base mt-1" value={form.nom} onChange={set('nom')} placeholder="DIALLO" /></div>
        <div><label className="text-xs font-semibold text-slate">Prénom *</label><input required className="input-base mt-1" value={form.prenom} onChange={set('prenom')} placeholder="Mariam" /></div>
        <div><label className="text-xs font-semibold text-slate">Email *</label><input required type="email" className="input-base mt-1" value={form.email} onChange={set('email')} /></div>
        <div><label className="text-xs font-semibold text-slate">Téléphone</label><input className="input-base mt-1" value={form.telephone} onChange={set('telephone')} /></div>
        <div><label className="text-xs font-semibold text-slate">Matricule</label><input className="input-base mt-1" value={form.matricule} onChange={set('matricule')} /></div>
        <div><label className="text-xs font-semibold text-slate">Date embauche</label><input type="date" className="input-base mt-1" value={form.dateEmbauche} onChange={set('dateEmbauche')} /></div>
        <div>
          <label className="text-xs font-semibold text-slate">Classe titulaire</label>
          <select className="input-base mt-1" value={form.classeId} onChange={set('classeId')}>
            <option value="">Aucune</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
        </div>
        <div><label className="text-xs font-semibold text-slate">Spécialité</label><input className="input-base mt-1" value={form.specialite} onChange={set('specialite')} /></div>
      </div>
      <div className="border-t border-beige-dark pt-4">
        <p className="text-xs font-bold text-slate uppercase tracking-wider mb-3">Matières enseignées</p>
        <div className="flex flex-wrap gap-2">
          {matieres.map(m => (
            <button type="button" key={m.id} onClick={() => toggleMat(m.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${form.matieres.includes(m.id) ? 'bg-navy text-white border-navy' : 'bg-beige border-beige-dark text-slate hover:border-navy/40'}`}>
              {m.nom}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">{initial.id ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </form>
  )
}

export default function Enseignants() {
  const [liste, setListe]   = useState(initEns)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(initEns[0])
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(false)
  const [modalDel, setModalDel]     = useState(false)

  const filtered = useMemo(() => liste.filter(e => {
    const q = search.toLowerCase()
    return !q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
  }), [liste, search])

  const getClasse   = id  => classes.find(c => c.id === id)
  const getMatieres = ids => matieres.filter(m => (ids || []).includes(m.id))

  const handleAjout = data => { const n = { ...data, id: `ens-${Date.now()}` }; setListe(v => [...v, n]); setSelected(n); setModalAjout(false) }
  const handleEdit  = data => { setListe(v => v.map(e => e.id === data.id ? data : e)); setSelected(data); setModalEdit(false) }
  const handleDel   = ()   => { setListe(v => v.filter(e => e.id !== selected.id)); setSelected(liste.find(e => e.id !== selected.id) || null); setModalDel(false) }

  return (
    <div className="flex h-full page-enter">
      <div className="flex-1 flex flex-col overflow-hidden p-6 pr-3">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div><h1 className="font-display text-2xl font-bold text-navy">Enseignants</h1><p className="text-slate text-sm">{liste.length} membres du personnel</p></div>
          <button onClick={() => setModalAjout(true)} className="btn-primary flex-shrink-0"><Plus size={16} /> Ajouter</button>
        </div>
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input className="input-base pl-9" placeholder="Nom, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="card overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige border-b border-beige-dark">
                {['Enseignant', 'Classe', 'Matières', 'Contact', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} className={`border-b border-beige-dark/60 cursor-pointer hover:bg-beige/60 transition ${selected?.id === e.id ? 'bg-amber/5 border-l-2 border-l-amber' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3"><Avatar prenom={e.prenom} nom={e.nom} size="sm" /><div><p className="font-semibold text-navy">{e.nom} {e.prenom}</p><p className="text-[11px] text-slate">{e.matricule}</p></div></div>
                  </td>
                  <td className="px-4 py-3">{getClasse(e.classeId) ? <span className="badge-navy text-[11px]">{getClasse(e.classeId).niveau}</span> : <span className="text-slate text-xs">—</span>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {getMatieres(e.matieres).slice(0, 2).map(m => (
                        <span key={m.id} className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: m.couleur + '20', color: m.couleur }}>{m.code}</span>
                      ))}
                      {(e.matieres || []).length > 2 && <span className="text-[10px] text-slate">+{e.matieres.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">{e.telephone}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={ev => { ev.stopPropagation(); setSelected(e); setModalEdit(true) }} className="text-slate hover:text-navy p-1 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={ev => { ev.stopPropagation(); setSelected(e); setModalDel(true) }}  className="text-slate hover:text-coral p-1 rounded transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-72 flex-shrink-0 border-l border-beige-dark overflow-y-auto bg-beige-card p-5 space-y-5">
          <div className="text-center pt-2">
            <Avatar prenom={selected.prenom} nom={selected.nom} size="lg" />
            <h2 className="font-display font-bold text-navy text-lg mt-3">{selected.nom} {selected.prenom}</h2>
            <p className="text-xs text-slate">{selected.matricule}</p>
          </div>
          <div className="space-y-2">
            {selected.email && <a href={"mailto:" + selected.email} className="flex items-center gap-2 text-xs text-slate hover:text-navy transition"><Mail size={13} className="text-amber-dark" /> {selected.email}</a>}
            {selected.telephone && <a href={"tel:" + selected.telephone} className="flex items-center gap-2 text-xs text-slate hover:text-navy transition"><Phone size={13} className="text-amber-dark" /> {selected.telephone}</a>}
          </div>
          <div className="border-t border-beige-dark pt-4 space-y-2">
            <p className="text-[10px] font-bold text-slate uppercase tracking-widest">Affectation</p>
            <div className="flex justify-between text-sm"><span className="text-slate text-xs">Classe</span><span className="font-semibold text-navy text-xs">{getClasse(selected.classeId)?.nom || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate text-xs">Spécialité</span><span className="font-semibold text-navy text-xs">{selected.specialite || '—'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate text-xs">Embauche</span><span className="font-semibold text-navy text-xs">{selected.dateEmbauche || '—'}</span></div>
          </div>
          <div className="border-t border-beige-dark pt-4">
            <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-2">Matières</p>
            <div className="flex flex-wrap gap-1.5">
              {getMatieres(selected.matieres).map(m => (
                <span key={m.id} className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: m.couleur + '18', color: m.couleur }}>{m.nom}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setModalEdit(true)} className="btn-ghost flex-1 justify-center text-xs py-1.5"><Edit2 size={13} /> Modifier</button>
            <button onClick={() => setModalDel(true)}  className="btn-danger flex-1 justify-center text-xs py-1.5"><Trash2 size={13} /> Retirer</button>
          </div>
        </div>
      )}

      <Modal open={modalAjout} onClose={() => setModalAjout(false)} title="Ajouter un enseignant" size="lg"><EnsForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} /></Modal>
      <Modal open={modalEdit}  onClose={() => setModalEdit(false)}  title="Modifier" size="lg">{selected && <EnsForm initial={selected} onSubmit={handleEdit} onCancel={() => setModalEdit(false)} />}</Modal>
      <Modal open={modalDel}   onClose={() => setModalDel(false)}   title="Retirer" size="sm">
        <p className="text-sm text-slate mb-6">Supprimer <strong className="text-navy">{selected?.prenom} {selected?.nom}</strong> ?</p>
        <div className="flex justify-end gap-3"><button onClick={() => setModalDel(false)} className="btn-ghost">Annuler</button><button onClick={handleDel} className="btn-danger">Supprimer</button></div>
      </Modal>
    </div>
  )
}
