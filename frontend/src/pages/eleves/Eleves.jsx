import { useState, useMemo } from 'react'
import { Search, Plus, Edit2, Trash2, Phone, Mail, ChevronRight } from 'lucide-react'
import { eleves as initEleves, classes, notes, paiements } from '../../data/mockData'
import { Badge, Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import EleveForm from './EleveForm'
import { useAuth } from '../../context/AuthContext'

export default function Eleves() {
  const { user } = useAuth()
  const isParent  = user?.role === 'PARENT'
  const isTeacher = user?.role === 'ENSEIGNANT'
  const isComptable = user?.role === 'COMPTABLE'
  const isDirecteur = user?.role === 'DIRECTEUR'

  // Classe de l'enseignant
  const maClasseId = useMemo(() => {
    if (!isTeacher) return null
    return classes.find(c => c.enseignantId === user.id)?.id || null
  }, [isTeacher, user])
  
  const initialListe = useMemo(() => {
    if (isParent)   return initEleves.filter(e => e.parentNom.includes(user.nom))
    return initEleves
  }, [user, isParent])

  const [liste, setListe]   = useState(initialListe)
  const [search, setSearch] = useState('')
  // Enseignant voit sa classe par défaut
  const [filtreClasse, setFiltreClasse] = useState(isTeacher && maClasseId ? maClasseId : '')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [selected, setSelected] = useState(initialListe[0])
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(false)
  const [modalDel, setModalDel]     = useState(false)

  const filtered = useMemo(() => liste.filter(e => {
    const q = search.toLowerCase()
    return (
      (!q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || (e.matricule || '').toLowerCase().includes(q)) &&
      (!filtreClasse || e.classeId === filtreClasse) &&
      (!filtreStatut || e.statut === filtreStatut)
    )
  }), [liste, search, filtreClasse, filtreStatut])

  const getClasse = id => classes.find(c => c.id === id)
  const getNotes  = id => notes.filter(n => n.eleveId === id).slice(0, 3)
  const getPaie   = id => paiements.filter(p => p.eleveId === id)

  const handleAjout = data => { const n = { ...data, id: `e-${Date.now()}` }; setListe(v => [...v, n]); setSelected(n); setModalAjout(false) }
  const handleEdit  = data => { setListe(v => v.map(e => e.id === data.id ? data : e)); setSelected(data); setModalEdit(false) }
  const handleDel   = ()   => { setListe(v => v.filter(e => e.id !== selected.id)); setSelected(liste.find(e => e.id !== selected.id) || null); setModalDel(false) }

  const moy = id => {
    const ns = getNotes(id)
    return ns.length ? (ns.reduce((s, n) => s + n.valeur, 0) / ns.length).toFixed(1) : null
  }

  return (
    <div className="flex h-full page-enter">
      <div className="flex-1 flex flex-col overflow-hidden p-6 pr-3">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">
              {isParent ? 'Mon Enfant' : isTeacher ? 'Mes Élèves' : 'Élèves'}
            </h1>
            <p className="text-slate text-sm">
              {isParent ? 'Détails de scolarité' : isTeacher ? `${liste.filter(e => e.classeId === maClasseId && e.statut === 'INSCRIT').length} élèves dans ma classe` : `${liste.filter(e => e.statut === 'INSCRIT').length} élèves inscrits`}
            </p>
          </div>
          {!isParent && !isTeacher && !isComptable && (
            <button onClick={() => setModalAjout(true)} className="btn-primary flex-shrink-0">
              <Plus size={16} /> Inscrire un élève
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-44">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input className="input-base pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {!isParent && (
            <>
              <select className="input-base w-auto" value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)}>
                {isTeacher ? (
                  // Enseignant : sa classe en priorité, + autres en lecture seule
                  <>
                    <option value={maClasseId || ''}>{classes.find(c => c.id === maClasseId)?.nom || 'Ma classe'}</option>
                    <option disabled>──────────────</option>
                    {classes.filter(c => c.id !== maClasseId).map(c => <option key={c.id} value={c.id}>{c.nom} (consultation)</option>)}
                  </>
                ) : (
                  <>
                    <option value="">Toutes les classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </>
                )}
              </select>
              {!isTeacher && (
                <select className="input-base w-auto" value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)}>
                  <option value="">Tous les statuts</option>
                  <option value="INSCRIT">Actif</option>
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="ARCHIVE">Archivé</option>
                </select>
              )}
            </>
          )}
        </div>

        <div className="card overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige border-b border-beige-dark">
                {['Élève', 'Matricule', 'Classe', 'Parent', 'Statut', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} onClick={() => setSelected(e)} className={`border-b border-beige-dark/60 cursor-pointer hover:bg-beige/60 transition ${selected?.id === e.id ? 'bg-amber/5 border-l-2 border-l-amber' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar prenom={e.prenom} nom={e.nom} size="sm" />
                      <div>
                        <p className="font-semibold text-navy">{e.nom} {e.prenom}</p>
                        <p className="text-[11px] text-slate">{e.dateNaissance}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-slate">{e.matricule}</td>
                  <td className="px-4 py-3">{getClasse(e.classeId) && <span className="badge-navy text-[11px]">{getClasse(e.classeId).niveau}</span>}</td>
                  <td className="px-4 py-3 text-xs text-slate hidden xl:table-cell">{e.parentNom || '—'}</td>
                  <td className="px-4 py-3"><Badge statut={e.statut} /></td>
                  <td className="px-4 py-3"><ChevronRight size={16} className="text-slate" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-slate">Aucun élève trouvé</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="w-72 xl:w-80 flex-shrink-0 border-l border-beige-dark overflow-y-auto bg-beige-card p-5 space-y-5">
          <div className="text-center pt-2">
            <Avatar prenom={selected.prenom} nom={selected.nom} size="lg" />
            <h2 className="font-display font-bold text-navy text-lg mt-3">{selected.nom} {selected.prenom}</h2>
            <p className="text-xs text-slate">{selected.matricule}</p>
            <div className="mt-2"><Badge statut={selected.statut} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-beige rounded-xl p-3 text-center border border-beige-dark">
              <p className="text-xs text-slate">Moyenne</p>
              <p className="font-display font-bold text-navy text-xl">{moy(selected.id) ? moy(selected.id) + '/20' : '—'}</p>
            </div>
            <div className="bg-beige rounded-xl p-3 text-center border border-beige-dark">
              <p className="text-xs text-slate">Assiduité</p>
              <p className="font-display font-bold text-navy text-xl">98%</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-2">Informations</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-slate text-xs">Classe</span><span className="font-semibold text-navy text-xs">{getClasse(selected.classeId)?.nom || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate text-xs">Naissance</span><span className="font-semibold text-navy text-xs">{selected.dateNaissance || '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate text-xs">Sexe</span><span className="font-semibold text-navy text-xs">{selected.sexe === 'M' ? 'Masculin' : 'Féminin'}</span></div>
            </div>
          </div>

          {selected.parentNom && (
            <div>
              <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-2">Contact Parent</p>
              <div className="bg-beige border border-beige-dark rounded-xl p-3 space-y-2">
                <p className="font-semibold text-navy text-sm">{selected.parentNom}</p>
                {selected.parentTel && <div className="flex items-center gap-2 text-xs text-slate"><Phone size={12} className="text-amber-dark" />{selected.parentTel}</div>}
                {selected.parentEmail && <div className="flex items-center gap-2 text-xs text-slate"><Mail size={12} className="text-amber-dark" />{selected.parentEmail}</div>}
              </div>
            </div>
          )}

          {getNotes(selected.id).length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate uppercase tracking-widest mb-2">Notes récentes</p>
              {getNotes(selected.id).map(n => (
                <div key={n.id} className="flex justify-between items-center py-1">
                  <span className="text-xs text-slate">Matière</span>
                  <span className={`font-bold text-sm ${n.valeur >= 15 ? 'text-sage' : n.valeur >= 10 ? 'text-amber-dark' : 'text-coral'}`}>{n.valeur}/20</span>
                </div>
              ))}
            </div>
          )}

          {/* Modification : seulement si c'est sa classe (ou admin/directeur) */}
          {!isParent && !isComptable && (!isTeacher || selected?.classeId === maClasseId) && (
            <div className="flex gap-2 pt-1">
              <button onClick={() => setModalEdit(true)} className="btn-ghost flex-1 justify-center text-xs py-1.5"><Edit2 size={13} /> Modifier</button>
              <button onClick={() => setModalDel(true)}  className="btn-danger flex-1 justify-center text-xs py-1.5"><Trash2 size={13} /> Archiver</button>
            </div>
          )}
          {(isTeacher && selected?.classeId !== maClasseId || isComptable) && (
            <div className="mt-2 text-center">
              <span className="text-xs text-slate/60 italic">Consultation uniquement</span>
            </div>
          )}
        </div>
      )}

      <Modal open={modalAjout} onClose={() => setModalAjout(false)} title="Inscrire un élève" size="lg">
        <EleveForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} />
      </Modal>
      <Modal open={modalEdit} onClose={() => setModalEdit(false)} title="Modifier l'élève" size="lg">
        {selected && <EleveForm initial={selected} onSubmit={handleEdit} onCancel={() => setModalEdit(false)} />}
      </Modal>
      <Modal open={modalDel} onClose={() => setModalDel(false)} title="Archiver l'élève" size="sm">
        <p className="text-sm text-slate mb-6">Archiver <strong className="text-navy">{selected?.prenom} {selected?.nom}</strong> ?</p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setModalDel(false)} className="btn-ghost">Annuler</button>
          <button onClick={handleDel} className="btn-danger">Confirmer</button>
        </div>
      </Modal>
    </div>
  )
}
