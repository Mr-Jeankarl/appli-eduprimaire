import { useEffect, useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, History, FileText } from 'lucide-react'
import { Badge, Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { create, list, remove, update } from '../../services/api'

const TYPES = ['Scolarité T1', 'Scolarité T2', 'Scolarité T3', 'Cantine Mensuelle', 'Transport Annuel', 'Fournitures', 'Autre']
const TYPES_SCOLARITE = ['Scolarité T1', 'Scolarité T2', 'Scolarité T3']
const fmt = n => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'

// Historique de traçabilité (mock)
const historiqueActions = [
  { id: 'h-1', date: '2024-05-22 14:30', action: 'Paiement reçu', detail: 'Mme Koné — 150 000 FCFA (Scolarité T1)', user: 'Fatou Ouédraogo' },
  { id: 'h-2', date: '2024-05-20 09:15', action: 'Relance envoyée', detail: 'LAWSON Saliou — Scolarité T1 impayé', user: 'Fatou Ouédraogo' },
  { id: 'h-3', date: '2024-05-18 16:45', action: 'Modification', detail: 'Montant ajusté — TRAORÉ Aïcha (75 000 → partiel)', user: 'Jean Dupont' },
  { id: 'h-4', date: '2024-05-15 11:00', action: 'Paiement reçu', detail: 'Pierre Souza — 85 000 FCFA (Transport)', user: 'Fatou Ouédraogo' },
]

function PaiForm({ initial = {}, onSubmit, onCancel, elevesOptions = eleves }) {
  const [form, setForm] = useState({ eleveId: '', type: TYPES[0], montantDu: '', montantPaye: '', statut: 'EN_ATTENTE', date: new Date().toISOString().split('T')[0], ...initial })
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate">Élève *</label>
        <select required className="input-base mt-1" value={form.eleveId} onChange={set('eleveId')}>
          <option value="">Sélectionner un élève...</option>
          {elevesOptions.filter(e => e.statut !== 'ARCHIVE').map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom} — {e.matricule}</option>)}
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
  const isDirecteur = user?.role === 'DIRECTEUR'
  const isComptable = user?.role === 'COMPTABLE'
  const isReadOnly = isParent || isDirecteur

  // Filtrer les paiements selon le rôle
  const initialListe = useMemo(() => {
    return [] // On part d'une liste vide, l'API remplira
  }, [])

  const [liste, setListe]   = useState(initialListe)
  const [elevesApi, setElevesApi] = useState([])
  const [scolarites, setScolarites] = useState([])
  const [search, setSearch] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(null)
  const [modalSimulateur, setModalSimulateur] = useState(false)
  const [simuMontant, setSimuMontant] = useState('')
  const [simuMethode, setSimuMethode] = useState('orange')
  const [simuConfirme, setSimuConfirme] = useState(false)

  useEffect(() => {
    let mounted = true
    Promise.all([list('/comptabilite/'), list('/comptabilite/scolarites/'), list('/eleves/')])
      .then(([paiementsApi, scolaritesApi, elevesList]) => {
        if (!mounted) return
        const uiEleves = elevesList.map(e => ({
          id: String(e.id),
          nom: e.nom,
          prenom: e.prenom,
          matricule: e.matricule,
          parentNom: e.parent_detail ? `${e.parent_detail.prenom} ${e.parent_detail.nom}` : '',
        }))
        const uiScolarites = scolaritesApi.map(s => ({ id: s.id, eleveId: String(s.eleve), montantDu: Number(s.montant_total), montantPaye: Number(s.montant_paye), statut: s.statut }))
        const uiPaiements = paiementsApi.map(p => {
          const scol = uiScolarites.find(s => s.id === p.scolarite)
          return {
            id: String(p.id),
            apiId: p.id,
            scolariteId: p.scolarite,
            eleveId: String(p.eleve || scol?.eleveId || ''),
            type: 'Scolarité',
            montantDu: scol?.montantDu || Number(p.montant),
            montantPaye: Number(p.montant),
            statut: scol?.statut === 'COMPLET' ? 'PAYE' : scol?.statut || 'PARTIEL',
            date: p.date_paiement,
            reference: p.reference,
            modePaiement: p.mode_paiement,
          }
        })
        setElevesApi(uiEleves)
        setScolarites(uiScolarites)
        setListe(uiPaiements)
      })
      .catch(error => console.error('Chargement paiements API impossible:', error))
    return () => { mounted = false }
  }, [])

  const getEleve = id => elevesApi.find(e => e.id === String(id))
  const filtered = useMemo(() => liste.filter(p => {
    const el = getEleve(p.eleveId)
    const q = search.toLowerCase()
    return (!q || el?.nom.toLowerCase().includes(q) || el?.prenom.toLowerCase().includes(q)) &&
           (!filtreStatut || p.statut === filtreStatut)
  }), [liste, search, filtreStatut])

  const totalEnc = liste.filter(p => p.statut === 'PAYE').reduce((s, p) => s + p.montantPaye, 0)
  const totalAtt = liste.reduce((s, p) => s + p.montantDu, 0)
  const taux     = totalAtt > 0 ? Math.round((totalEnc / totalAtt) * 100) : 0

  const toApi = data => {
    const scolarite = data.scolariteId || scolarites.find(s => s.eleveId === String(data.eleveId))?.id
    return {
      scolarite,
      montant: Number(data.montantPaye || data.montantDu),
      mode_paiement: data.modePaiement || 'ESPECES',
      reference: data.reference || `REF-${Date.now()}`,
      date_paiement: data.date || new Date().toISOString().split('T')[0],
      observations: data.type || '',
    }
  }
  const toUi = (saved, source = {}) => ({
    ...source,
    id: String(saved.id),
    apiId: saved.id,
    scolariteId: saved.scolarite,
    eleveId: String(saved.eleve || source.eleveId || ''),
    montantPaye: Number(saved.montant),
    montantDu: Number(source.montantDu || saved.montant),
    statut: source.statut || 'PAYE',
    date: saved.date_paiement,
    reference: saved.reference,
  })
  const handleAjout = async data => {
    const saved = await create('/comptabilite/', toApi(data))
    setListe(v => [...v, toUi(saved, data)])
    setModalAjout(false)
  }
  const handleEdit = async data => {
    const saved = await update(`/comptabilite/${data.apiId || data.id}/`, toApi(data))
    setListe(v => v.map(p => p.id === String(data.id) ? toUi(saved, data) : p))
    setModalEdit(null)
  }
  const handleDel = async id => {
    const item = liste.find(p => p.id === String(id))
    await remove(`/comptabilite/${item?.apiId || id}/`)
    setListe(v => v.filter(p => p.id !== id))
  }

  return (
    <div className="p-6 space-y-5 page-enter">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">
            {isParent ? 'Mes Paiements' : isDirecteur ? 'Suivi Scolarité' : 'Paiements'}
          </h1>
          <p className="text-slate text-sm">{isParent ? 'Historique des règlements' : isDirecteur ? `${liste.length} paiements de scolarité` : `${liste.length} transactions`}</p>
        </div>
        {!isReadOnly && (
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

      {isDirecteur && (
        <div className="flex gap-2 items-center text-xs text-slate bg-beige/60 border border-beige-dark rounded-xl px-4 py-2.5">
          <FileText size={14} className="text-amber-dark" />
          <span>Mode consultation — Seuls les paiements de <strong className="text-navy">scolarité</strong> sont affichés. Les modifications sont gérées par la Comptabilité.</span>
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
              {['Élève', 'Type', 'Montant dû', 'Montant payé', 'Reste à payer', 'Statut', 'Date', !isReadOnly && 'Actions'].filter(Boolean).map(h => (
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
                  <td className="px-4 py-3 font-bold text-coral">{fmt(p.montantDu - p.montantPaye)}</td>
                  <td className="px-4 py-3"><Badge statut={p.statut} /></td>
                  <td className="px-4 py-3 text-slate text-xs">{p.date}</td>
                  {!isReadOnly && (
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
          <button onClick={() => setModalSimulateur(true)} className="relative z-10 min-w-[200px] py-2 px-8 rounded-full border border-amber/30 bg-amber/10 text-amber-dark font-semibold text-sm tracking-wide backdrop-blur-md hover:bg-amber/20 hover:border-amber/50 transition-all duration-300 shadow-sm active:scale-95">
            Payer maintenant
          </button>
        </div>
      )}

      {isDirecteur && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2">
            <History size={16} className="text-amber-dark" />
            <h2 className="font-display font-bold text-navy text-lg">Traçabilité des opérations</h2>
          </div>
          <div className="divide-y divide-beige-dark/60">
            {historiqueActions.map(h => (
              <div key={h.id} className="flex items-start gap-3 py-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${h.action.includes('reçu') ? 'bg-sage' : h.action.includes('Relance') ? 'bg-amber' : 'bg-slate/40'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-navy">{h.action}</p>
                    <span className="text-[10px] text-slate/60 flex-shrink-0">{h.date}</span>
                  </div>
                  <p className="text-xs text-slate mt-0.5">{h.detail}</p>
                  <p className="text-[10px] text-slate/50 mt-0.5">Par {h.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalAjout} onClose={() => setModalAjout(false)} title="Enregistrer un paiement" size="md">
        <PaiForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} elevesOptions={elevesApi} />
      </Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)} title="Modifier le paiement" size="md">
        {modalEdit && <PaiForm initial={modalEdit} onSubmit={handleEdit} onCancel={() => setModalEdit(null)} elevesOptions={elevesApi} />}
      </Modal>

      {/* Simulateur de paiement parent */}
      <Modal open={modalSimulateur} onClose={() => { setModalSimulateur(false); setSimuConfirme(false); setSimuMontant('') }} title="Simulateur de paiement" size="md">
        {!simuConfirme ? (
          <div className="space-y-5">
            <div className="bg-beige/50 rounded-xl border border-beige-dark p-4">
              <p className="text-xs text-slate">Simulez votre paiement avant de procéder. Les frais de transaction seront affichés.</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Montant à payer (FCFA) *</label>
              <input type="number" className="input-base" placeholder="Ex: 150000" value={simuMontant} onChange={e => setSimuMontant(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-2">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSimuMethode('orange')}
                  className={`card p-4 text-center transition ${simuMethode === 'orange' ? 'ring-2 ring-amber border-amber/40' : 'hover:border-amber/20'}`}
                >
                  <p className="text-2xl mb-1">🟠</p>
                  <p className="text-sm font-semibold text-navy">Orange Money</p>
                  <p className="text-[10px] text-slate">Frais: 1%</p>
                </button>
                <button
                  onClick={() => setSimuMethode('moov')}
                  className={`card p-4 text-center transition ${simuMethode === 'moov' ? 'ring-2 ring-sage border-sage/40' : 'hover:border-sage/20'}`}
                >
                  <p className="text-2xl mb-1">🟢</p>
                  <p className="text-sm font-semibold text-navy">Moov Money</p>
                  <p className="text-[10px] text-slate">Frais: 0.5%</p>
                </button>
              </div>
            </div>
            {simuMontant && Number(simuMontant) > 0 && (
              <div className="card bg-navy text-white p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-white/60">Montant</span><span className="font-bold">{fmt(Number(simuMontant))}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/60">Frais ({simuMethode === 'orange' ? '1%' : '0.5%'})</span><span>{fmt(Math.round(Number(simuMontant) * (simuMethode === 'orange' ? 0.01 : 0.005)))}</span></div>
                <div className="border-t border-white/20 pt-2 flex justify-between text-sm"><span className="text-white/60 font-semibold">Total</span><span className="font-bold text-amber">{fmt(Math.round(Number(simuMontant) * (1 + (simuMethode === 'orange' ? 0.01 : 0.005))))}</span></div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setModalSimulateur(false); setSimuMontant('') }} className="btn-ghost">Annuler</button>
              <button
                onClick={() => setSimuConfirme(true)}
                disabled={!simuMontant || Number(simuMontant) <= 0}
                className={`btn-primary ${!simuMontant || Number(simuMontant) <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Simuler le paiement
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✅</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-navy text-xl">Simulation réussie !</h3>
              <p className="text-sm text-slate mt-2">Votre paiement de <strong className="text-navy">{fmt(Math.round(Number(simuMontant) * (1 + (simuMethode === 'orange' ? 0.01 : 0.005))))}</strong> via <strong className="text-navy">{simuMethode === 'orange' ? 'Orange Money' : 'Moov Money'}</strong> serait effectué.</p>
              <p className="text-xs text-slate/60 mt-2">Ceci est une simulation. Pour procéder au paiement réel, veuillez contacter l'administration de l'école.</p>
            </div>
            <button onClick={() => { setModalSimulateur(false); setSimuConfirme(false); setSimuMontant('') }} className="btn-primary px-8">Fermer</button>
          </div>
        )}
      </Modal>
    </div>
  )
}
