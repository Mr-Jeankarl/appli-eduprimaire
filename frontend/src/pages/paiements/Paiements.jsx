import { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { paiements as initPaiements, eleves } from '../../data/mockData'
import { Badge, Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'

const TYPES = ['Scolarité T1', 'Scolarité T2', 'Scolarité T3', 'Cantine Mensuelle', 'Transport Annuel', 'Fournitures', 'Autre']
const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

function PaiForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ eleveId: '', type: TYPES[0], montantDu: '', montantPaye: '', statut: 'EN_ATTENTE', date: new Date().toISOString().split('T')[0], ...initial })
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate">Type</label>
          <select className="input-base mt-1" value={form.type} onChange={set('type')}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Date</label>
          <input type="date" className="input-base mt-1" value={form.date} onChange={set('date')} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Montant dû (FCFA) *</label>
          <input type="number" required className="input-base mt-1" placeholder="150000" value={form.montantDu} onChange={set('montantDu')} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate">Montant payé (FCFA) *</label>
          <input type="number" required className="input-base mt-1" placeholder="150000" value={form.montantPaye} onChange={set('montantPaye')} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-semibold text-slate">Statut</label>
          <select className="input-base mt-1" value={form.statut} onChange={set('statut')}>
            <option value="PAYE">Payé</option>
            <option value="PARTIEL">Partiel</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">{initial.id ? 'Modifier' : 'Enregistrer'}</button>
      </div>
    </form>
  )
}

export default function Paiements() {
  const { user } = useAuth()
  const isParent = user?.role === 'PARENT'

  // Filtrer les paiements pour les parents
  const initialListe = useMemo(() => {
    if (isParent) {
      const mesEnfantsIds = eleves.filter(e => e.parentNom.includes(user.nom)).map(e => e.id)
      return initPaiements.filter(p => mesEnfantsIds.includes(p.eleveId))
    }
    return initPaiements
  }, [user, isParent])

  const [liste, setListe]   = useState(initialListe)
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(null)

  const getEleve = id => eleves.find(e => e.id === id)
  const filtered = useMemo(() => liste.filter(p => {
    const el = getEleve(p.eleveId)
    const q = search.toLowerCase()
    return (!q || el?.nom.toLowerCase().includes(q) || el?.prenom.toLowerCase().includes(q)) &&
           (!filtreStatut || p.statut === filtreStatut)
  }), [liste, search, filtreStatut])

  const totalEnc = liste.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montantPaye, 0)
  const totalAtt = liste.reduce((s, p) => s + p.montantDu, 0)
  const taux     = totalAtt > 0 ? Math.round((totalEnc / totalAtt) * 100) : 0

  const handleAjout = data => { setListe(v => [...v, { ...data, id: `pay-${Date.now()}`, reference: `REF-${Date.now()}`, montantDu: Number(data.montantDu), montantPaye: Number(data.montantPaye) }]); setModalAjout(false) }
  const handleEdit  = data => { setListe(v => v.map(p => p.id === data.id ? { ...data, montantDu: Number(data.montantDu), montantPaye: Number(data.montantPaye) } : p)); setModalEdit(null) }
  const handleDel   = id  => setListe(v => v.filter(p => p.id !== id))

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            {isParent ? 'Mes Paiements' : 'Paiements'}
          </h1>
          <p className="text-slate text-sm">{isParent ? 'Historique des règlements' : `${liste.length} transactions`}</p>
        </div>
        {!isParent && (
          <button onClick={() => setModalAjout(true)} className="btn-primary">
            <Plus size={16} /> Nouveau Paiement
          </button>
        )}
      </div>

      {!isParent && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card bg-navy text-white p-5">
            <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Total encaissé</p>
            <p className="font-display font-bold text-2xl">{fmt(totalEnc)}</p>
          </div>
          <div className="card p-5">
            <p className="text-slate text-[10px] uppercase tracking-wider mb-1">Montant attendu</p>
            <p className="font-display font-bold text-2xl text-navy">{fmt(totalAtt)}</p>
          </div>
          <div className="card p-5">
            <p className="text-slate text-[10px] uppercase tracking-wider mb-1">Taux de recouvrement</p>
            <p className="font-display font-bold text-2xl text-navy">{taux}%</p>
            <div className="mt-2 h-1.5 bg-beige-dark rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full" style={{ width: taux + '%' }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-44">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input className="input-base pl-9" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['', 'PAYE', 'PARTIEL', 'EN_ATTENTE'].map(s => (
          <button key={s} onClick={() => setFiltreStatut(s)} className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${filtreStatut === s ? 'bg-navy text-white border-navy' : 'bg-beige-card border-beige-dark text-slate hover:border-navy/30'}`}>
            {s === '' ? 'Tous' : s === 'PAYE' ? 'Payé' : s === 'PARTIEL' ? 'Partiel' : 'Impayé'}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-beige border-b border-beige-dark">
              {['Élève', 'Type', 'Montant dû', 'Montant payé', 'Statut', 'Date', !isParent && 'Actions'].filter(Boolean).map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const el = getEleve(p.eleveId)
              return (
                <tr key={p.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                  <td className="px-4 py-3">
                    {el && <div className="flex items-center gap-2"><Avatar prenom={el.prenom} nom={el.nom} size="sm" /><div><p className="font-semibold text-navy text-sm">{el.nom} {el.prenom}</p><p className="text-[11px] text-slate">{el.matricule}</p></div></div>}
                  </td>
                  <td className="px-4 py-3 text-slate">{p.type}</td>
                  <td className="px-4 py-3 font-semibold text-navy">{fmt(p.montantDu)}</td>
                  <td className={`px-4 py-3 font-semibold ${p.montantPaye === 0 ? 'text-coral' : p.montantPaye < p.montantDu ? 'text-amber-dark' : 'text-sage'}`}>{fmt(p.montantPaye)}</td>
                  <td className="px-4 py-3"><Badge statut={p.statut} /></td>
                  <td className="px-4 py-3 text-slate text-xs">{p.date}</td>
                  {!isParent && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setModalEdit(p)} className="text-slate hover:text-navy p-1 rounded transition"><Edit2 size={14} /></button>
                        <button onClick={() => handleDel(p.id)} className="text-slate hover:text-coral p-1 rounded transition"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="px-4 py-3 text-xs text-slate bg-beige border-t border-beige-dark">{filtered.length} sur {liste.length} transactions</p>
      </div>

      {isParent && (
        <div className="card p-6 bg-beige/40 border-beige-dark/50 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display font-bold text-navy text-xl">Règlement des frais</h2>
            <p className="text-sm text-slate mt-1 max-w-md">Sécurisez la scolarité de votre enfant en effectuant vos paiements via Orange Money ou Moov Money.</p>
          </div>
          <button className="relative z-10 min-w-[200px] py-2 px-8 rounded-full border border-amber/30 bg-amber/10 text-amber-dark font-semibold text-sm tracking-wide backdrop-blur-md hover:bg-amber/20 hover:border-amber/50 transition-all duration-300 shadow-sm active:scale-95">
            Payer maintenant
          </button>
        </div>
      )}

      <Modal open={modalAjout} onClose={() => setModalAjout(false)} title="Enregistrer un paiement" size="md">
        <PaiForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} />
      </Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Modifier le paiement" size="md">
        {modalEdit && <PaiForm initial={modalEdit} onSubmit={handleEdit} onCancel={() => setModalEdit(null)} />}
      </Modal>
    </div>
  )
}
