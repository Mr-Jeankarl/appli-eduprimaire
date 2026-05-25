import { useEffect, useState } from 'react'
import { Save, Plus, Edit2, Trash2, Eye, EyeOff, Shield, School, Users, ToggleLeft, ToggleRight, Moon, Sun, Palette, Building2, Copy, RefreshCw, CheckCircle2, Clock, XCircle, BookOpen } from 'lucide-react'
import { ecole as initEcole, utilisateurs as initUsers } from '../../data/mockData'
import { LogoMark, InvitationPanel } from '../../components/ui'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { apiRequest, create, list, remove, update } from '../../services/api'

const ROLES = [
  { value: 'ADMIN',      label: 'Administrateur', badge: 'badge-red',   desc: 'Accès total au système' },
  { value: 'DIRECTEUR',  label: 'Directeur',       badge: 'badge-navy',  desc: 'Vue globale, validation pédagogique' },
  { value: 'ENSEIGNANT', label: 'Enseignant',       badge: 'badge-green', desc: 'Ses classes uniquement' },
  { value: 'COMPTABLE',  label: 'Comptable',        badge: 'badge-amber', desc: 'Module paiements uniquement' },
  { value: 'PARENT',     label: 'Parent',           badge: 'badge-slate', desc: 'Portail lecture seule de son enfant' },
]

const PERMS = {
  ADMIN:      ['Tout configurer', 'Gérer les comptes', 'Accès complet à tous les modules', 'Supprimer des données'],
  DIRECTEUR:  ['Voir tous les modules', 'Valider les bulletins', 'Envoyer des annonces', 'Consulter les paiements'],
  ENSEIGNANT: ['Saisir et modifier ses notes', 'Faire appel de ses classes', 'Voir son emploi du temps'],
  COMPTABLE:  ['Créer et modifier les paiements', 'Voir la liste des élèves', 'Exporter les rapports financiers'],
  PARENT:     ['Voir les infos de son enfant', 'Consulter les bulletins', 'Voir les absences', 'Contacter enseignant'],
}

const TABS = [
  { id: 'ecole', label: 'École', icon: School },
  { id: 'matieres', label: 'Matières', icon: BookOpen },
  { id: 'modules', label: 'Modules', icon: ToggleRight },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'invitations', label: 'Invitations', icon: Copy },
  { id: 'roles', label: 'Rôles et Droits', icon: Shield },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'saas', label: 'Multi-Écoles', icon: Building2, adminOnly: true },
]
const MODULE_API_CODES = {
  notes: 'NOTES',
  presences: 'PRESENCES',
  emploidutemps: 'EMPLOI_DU_TEMPS',
  paiements: 'COMPTABILITE',
  messages: 'MESSAGERIE',
  bibliotheque: 'BIBLIOTHEQUE',
}

// Mock données SaaS — écoles enregistrées
const ecolesReseau = [
  { id: 's-1', nom: 'École Les Étoiles',      ville: 'Bobo-Dioulasso', pays: 'BF', code: 'EDU-BF-2024-001', statut: 'ACTIF',    eleves: 312, plan: 'Pro' },
  { id: 's-2', nom: 'École Horizon',           ville: 'Ouagadougou',   pays: 'BF', code: 'EDU-BF-2024-002', statut: 'ACTIF',    eleves: 178, plan: 'Starter' },
  { id: 's-3', nom: 'Groupe Scolaire Lumière', ville: 'Abidjan',       pays: 'CI', code: 'EDU-CI-2024-003', statut: 'EN_ESSAI', eleves: 94,  plan: 'Trial' },
  { id: 's-4', nom: 'Académie du Savoir',      ville: 'Dakar',         pays: 'SN', code: 'EDU-SN-2024-004', statut: 'SUSPENDU', eleves: 0,   plan: 'Starter' },
]

function MatieresPanel() {
  const [matieres, setMatieres] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ nom: '', code: '', coefficient: 1, note_sur: 20 })

  useEffect(() => {
    fetchMatieres()
  }, [])

  const fetchMatieres = async () => {
    setLoading(true)
    try {
      const data = await list('/ecole/matieres/')
      setMatieres(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        nom: form.nom,
        code: form.code,
        coefficient: Number(form.coefficient),
        note_sur: Number(form.note_sur)
      }
      if (editing) {
        await update(`/ecole/matieres/${editing.id}/`, payload)
      } else {
        await create('/ecole/matieres/', payload)
      }
      setModalOpen(false)
      setEditing(null)
      setForm({ nom: '', code: '', coefficient: 1, note_sur: 20 })
      fetchMatieres()
    } catch (err) {
      alert(err.message || "Une erreur est survenue.")
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette matière ?")) return
    try {
      await remove(`/ecole/matieres/${id}/`)
      fetchMatieres()
    } catch (err) {
      alert(err.message || "Erreur de suppression.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-display font-bold text-navy text-lg">Matières de l'école</h2>
        <button
          onClick={() => {
            setEditing(null)
            setForm({ nom: '', code: '', coefficient: 1, note_sur: 20 })
            setModalOpen(true)
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Nouvelle matière
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-beige border-b border-beige-dark">
                <th className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">Matière</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">Coefficient</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">Notation</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map((m) => (
                <tr key={m.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                  <td className="px-4 py-3 font-semibold text-navy">{m.nom}</td>
                  <td className="px-4 py-3 text-slate font-mono text-xs">{m.code}</td>
                  <td className="px-4 py-3 text-navy font-semibold">{m.coefficient}</td>
                  <td className="px-4 py-3 text-slate">Sur {m.note_sur || 20}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(m)
                          setForm({ nom: m.nom, code: m.code, coefficient: m.coefficient, note_sur: m.note_sur || 20 })
                          setModalOpen(true)
                        }}
                        className="text-slate hover:text-navy p-1 transition"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="text-slate hover:text-coral p-1 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier la matière" : "Nouvelle matière"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate block mb-1">Nom de la matière *</label>
            <input
              required
              type="text"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="input-base"
              placeholder="ex: Mathématiques"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate block mb-1">Code *</label>
            <input
              required
              type="text"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="input-base"
              placeholder="ex: MATH"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Coefficient *</label>
              <input
                required
                type="number"
                min={1}
                value={form.coefficient}
                onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })}
                className="input-base"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate block mb-1">Noté sur *</label>
              <select
                value={form.note_sur}
                onChange={(e) => setForm({ ...form, note_sur: Number(e.target.value) })}
                className="input-base"
              >
                <option value={20}>Sur 20</option>
                <option value={10}>Sur 10</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


function UserForm({ initial = {}, onSubmit, onCancel }) {
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', role: 'ENSEIGNANT', motDePasse: '', ...initial })
  const [showPwd, setShowPwd] = useState(false)
  const set = k => e => setForm(v => ({ ...v, [k]: e.target.value }))
  const roleInfo = ROLES.find(r => r.value === form.role)
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-semibold text-slate">Nom *</label><input required className="input-base mt-1" value={form.nom} onChange={set('nom')} /></div>
        <div><label className="text-xs font-semibold text-slate">Prénom *</label><input required className="input-base mt-1" value={form.prenom} onChange={set('prenom')} /></div>
        <div className="col-span-2"><label className="text-xs font-semibold text-slate">Email *</label><input required type="email" className="input-base mt-1" value={form.email} onChange={set('email')} /></div>
        <div><label className="text-xs font-semibold text-slate">Téléphone</label><input className="input-base mt-1" value={form.telephone} onChange={set('telephone')} /></div>
        <div>
          <label className="text-xs font-semibold text-slate">Rôle *</label>
          <select required className="input-base mt-1" value={form.role} onChange={set('role')}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        {!initial.id && (
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate">Mot de passe *</label>
            <div className="relative mt-1">
              <input required type={showPwd ? 'text' : 'password'} className="input-base pr-10" placeholder="Minimum 8 caractères" value={form.motDePasse} onChange={set('motDePasse')} />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        )}
      </div>
      {roleInfo && (
        <div className="bg-beige rounded-xl border border-beige-dark p-3">
          <p className="text-xs font-bold text-slate mb-2">Permissions de ce rôle</p>
          <ul className="space-y-1">
            {(PERMS[form.role] || []).map(p => (
              <li key={p} className="text-xs text-navy flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber rounded-full flex-shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Annuler</button>
        <button type="submit" className="btn-primary">{initial.id ? 'Enregistrer' : 'Créer le compte'}</button>
      </div>
    </form>
  )
}

export default function Parametres() {
  const { user } = useAuth()
  const isDirecteur = user?.role === 'DIRECTEUR'

  const [tab, setTab]       = useState('ecole')
  const [ecole, setEcole]   = useState(initEcole)
  const [saved, setSaved]   = useState(false)
  const [users, setUsers]   = useState(initUsers)
  const [filtreRole, setFiltreRole] = useState('')
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(null)
  const [modalDel, setModalDel]     = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([apiRequest('/ecole/'), list('/auth/utilisateurs/'), list('/ecole/modules/')])
      .then(([ecoleApi, usersApi, modulesApi]) => {
        if (!mounted) return
        setEcole({
          nom: ecoleApi.nom || '',
          ville: ecoleApi.adresse || '',
          pays: 'Burkina Faso',
          telephone: ecoleApi.telephone || '',
          email: ecoleApi.email || '',
          anneeScolaire: ecoleApi.annee_scolaire || '',
          logoInitiales: (ecoleApi.nom || 'EP').slice(0, 2).toUpperCase(),
        })
        setUsers(usersApi.map(u => ({ id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone, role: u.role, actif: u.is_active })))
        setModules(v => ({
          ...v,
          ...Object.fromEntries(Object.entries(MODULE_API_CODES).map(([key, code]) => [key, modulesApi.find(m => m.module === code)?.actif ?? v[key]])),
        }))
      })
      .catch(error => console.error('Chargement paramètres API impossible:', error))
    return () => { mounted = false }
  }, [])

  const setE = k => e => setEcole(v => ({ ...v, [k]: e.target.value }))
  const handleSave  = async () => {
    await update('/ecole/', { nom: ecole.nom, adresse: ecole.ville, telephone: ecole.telephone, email: ecole.email, annee_scolaire: ecole.anneeScolaire })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  const userBody = data => ({ nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone || '', role: data.role, password: data.motDePasse, password_confirm: data.motDePasse })
  const handleAjout = async data => { const saved = await create('/auth/utilisateurs/', userBody(data)); setUsers(v => [...v, { id: saved.id, nom: saved.nom, prenom: saved.prenom, email: saved.email, telephone: saved.telephone, role: saved.role, actif: saved.is_active }]); setModalAjout(false) }
  const handleEdit  = async data => { const saved = await update(`/auth/utilisateurs/${data.id}/`, { nom: data.nom, prenom: data.prenom, email: data.email, telephone: data.telephone || '', role: data.role, is_active: data.actif }); setUsers(v => v.map(u => u.id === data.id ? { id: saved.id, nom: saved.nom, prenom: saved.prenom, email: saved.email, telephone: saved.telephone, role: saved.role, actif: saved.is_active } : u)); setModalEdit(null) }
  const handleDel   = async () => { await remove(`/auth/utilisateurs/${modalDel.id}/`); setUsers(v => v.filter(u => u.id !== modalDel.id)); setModalDel(null) }
  const toggleActif = async id => {
    const current = users.find(u => u.id === id)
    if (!current) return
    const saved = await update(`/auth/utilisateurs/${id}/`, { is_active: !current.actif })
    setUsers(v => v.map(u => u.id === id ? { ...u, actif: saved.is_active } : u))
  }

  const filteredUsers = users.filter(u => !filtreRole || u.role === filtreRole)

  // Modules activés/désactivés
  const [modules, setModules] = useState({
    notes: true, presences: true, emploidutemps: true,
    paiements: true, messages: true, bibliotheque: true,
  })
  const toggleModule = async key => {
    const moduleCode = MODULE_API_CODES[key] || key.toUpperCase()
    const saved = await update(`/ecole/modules/${moduleCode}/toggle/`, { actif: !modules[key] })
    setModules(v => ({ ...v, [key]: saved.actif }))
    // Notifier l'application: événement pour l'onglet courant et stockage pour autres onglets
    window.dispatchEvent(new Event('module-toggled'))
    try {
      localStorage.setItem('module-toggled', String(Date.now()))
    } catch (e) {
      // ignore (some browsers may block localStorage)
    }
  }

  // Apparence
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(v => !v)

  // État SaaS
  const [codesInvit, setCodesInvit] = useState([
    { id: 'ci-1', code: 'INVITE-XK92P', cible: 'Nouvelle école partenaire',  statut: 'EN_ATTENTE', cree: '2024-05-10', expire: '2024-06-10' },
    { id: 'ci-2', code: 'INVITE-LM44T', cible: 'École Les Colibris',         statut: 'UTILISE',    cree: '2024-04-01', expire: '2024-05-01' },
  ])
  const [copie, setCopie] = useState(null)

  const genererCode = () => {
    // Request backend to create an invitation for the current user's school
    create('/ecole/invitations/', {})
      .then(saved => {
        const now = new Date(saved.cree_le)
        setCodesInvit(v => [{ id: saved.id, code: saved.code, cible: saved.ecole_nom || 'Nouvelle école', statut: saved.utilise ? 'UTILISE' : 'EN_ATTENTE', cree: now.toISOString().split('T')[0], expire: saved.expire_le ? saved.expire_le.split('T')[0] : '' }, ...v])
      })
      .catch(() => {
        // fallback to client-side generation if API fails
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const code = 'INVITE-' + Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        const now = new Date()
        const expire = new Date(now); expire.setMonth(expire.getMonth() + 1)
        setCodesInvit(v => [{ id: `ci-${Date.now()}`, code, cible: 'Nouvelle école', statut: 'EN_ATTENTE', cree: now.toISOString().split('T')[0], expire: expire.toISOString().split('T')[0] }, ...v])
      })
  }

  const copierCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {})
    setCopie(code)
    setTimeout(() => setCopie(null), 2000)
  }

  // Tabs accessibles au directeur
  const isAdmin = user?.role === 'ADMIN'
  const visibleTabs = isDirecteur
    ? TABS.filter(t => ['ecole', 'matieres', 'modules', 'invitations', 'roles', 'apparence'].includes(t.id))
    : isAdmin ? TABS : TABS.filter(t => !t.adminOnly)

  return (
    <div className="p-6 space-y-5 page-enter">
      <div><h1 className="font-display text-2xl font-bold text-navy">Paramètres</h1><p className="text-slate text-sm mt-0.5">Configuration générale de l'application</p></div>

      <div className="flex gap-1 bg-beige-dark/40 p-1 rounded-xl w-fit flex-wrap">
        {visibleTabs.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition " + (tab === t.id ? 'bg-beige-card shadow-card text-navy' : 'text-slate hover:text-navy')}>
              <Icon size={15} /> {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'ecole' && (
        <div className="card p-6 max-w-2xl space-y-5">
          <h2 className="font-display font-bold text-navy text-lg">Informations de l'école</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-semibold text-slate">Nom de l'école *</label><input className="input-base mt-1" value={ecole.nom} onChange={setE('nom')} /></div>
            <div><label className="text-xs font-semibold text-slate">Ville</label><input className="input-base mt-1" value={ecole.ville} onChange={setE('ville')} /></div>
            <div><label className="text-xs font-semibold text-slate">Pays</label><input className="input-base mt-1" value={ecole.pays} onChange={setE('pays')} /></div>
            <div><label className="text-xs font-semibold text-slate">Téléphone</label><input className="input-base mt-1" value={ecole.telephone} onChange={setE('telephone')} /></div>
            <div><label className="text-xs font-semibold text-slate">Email</label><input type="email" className="input-base mt-1" value={ecole.email} onChange={setE('email')} /></div>
            <div><label className="text-xs font-semibold text-slate">Année scolaire</label><input className="input-base mt-1" value={ecole.anneeScolaire} onChange={setE('anneeScolaire')} /></div>
            <div><label className="text-xs font-semibold text-slate">Initiales logo (2-3 lettres)</label><input className="input-base mt-1" maxLength={3} value={ecole.logoInitiales} onChange={setE('logoInitiales')} /></div>
          </div>
          <div className="bg-beige border border-beige-dark rounded-xl p-4 flex items-center gap-4">
            <LogoMark src={ecole.logoUrl || initEcole.logoUrl} initials={ecole.logoInitiales} size="md" />
            <div><p className="font-display font-bold text-navy">{ecole.nom}</p><p className="text-xs text-slate">{ecole.ville}, {ecole.pays} · {ecole.anneeScolaire}</p></div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className={saved ? 'btn-amber' : 'btn-primary'}><Save size={15} /> {saved ? 'Enregistré' : 'Sauvegarder'}</button>
          </div>
        </div>
      )}

      {tab === 'matieres' && <MatieresPanel />}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 flex-wrap">
              {['', ...ROLES.map(r => r.value)].map(r => (
                <button key={r} onClick={() => setFiltreRole(r)} className={"px-3 py-1.5 rounded-lg border text-xs font-semibold transition " + (filtreRole === r ? 'bg-navy text-white border-navy' : 'bg-beige-card border-beige-dark text-slate hover:border-navy/30')}>
                  {r === '' ? 'Tous' : ROLES.find(x => x.value === r)?.label}
                </button>
              ))}
            </div>
            <button onClick={() => setModalAjout(true)} className="btn-primary"><Plus size={15} /> Nouveau compte</button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-beige border-b border-beige-dark">
                  {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const role = ROLES.find(r => r.value === u.role)
                  return (
                    <tr key={u.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3"><Avatar prenom={u.prenom} nom={u.nom} size="sm" /><span className="font-semibold text-navy">{u.prenom} {u.nom}</span></div>
                      </td>
                      <td className="px-4 py-3 text-slate text-xs">{u.email}</td>
                      <td className="px-4 py-3 text-slate text-xs">{u.telephone || '—'}</td>
                      <td className="px-4 py-3"><span className={(role?.badge || 'badge-slate') + ' text-[11px]'}>{role?.label || u.role}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActif(u.id)} className={"text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition " + (u.actif ? 'bg-sage/10 text-sage border-sage/30 hover:bg-sage/20' : 'bg-slate/10 text-slate border-slate/20')}>
                          {u.actif ? 'Actif' : 'Désactivé'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setModalEdit(u)} className="text-slate hover:text-navy p-1 rounded transition"><Edit2 size={14} /></button>
                          <button onClick={() => setModalDel(u)}  className="text-slate hover:text-coral p-1 rounded transition"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="px-4 py-3 text-xs text-slate bg-beige border-t border-beige-dark">{filteredUsers.length} compte(s) sur {users.length} total</p>
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ROLES.filter(r => !isDirecteur || r.value !== 'ADMIN').map(r => (
            <div key={r.value} className="card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={r.badge + ' text-xs'}>{r.label}</span>
                <span className="text-xs text-slate">{users.filter(u => u.role === r.value).length} compte(s)</span>
              </div>
              <p className="text-xs text-slate italic">{r.desc}</p>
              <div className="border-t border-beige-dark pt-3 space-y-1.5">
                {(PERMS[r.value] || []).map(p => (
                  <div key={p} className="flex items-center gap-2 text-xs text-navy">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />{p}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'modules' && (
        <div className="card p-6 max-w-2xl space-y-5">
          <h2 className="font-display font-bold text-navy text-lg">Modules actifs</h2>
          <p className="text-xs text-slate">Activez ou désactivez les modules pour tous les utilisateurs de l'école.</p>
          <div className="space-y-3">
            {[
              { key: 'notes', label: 'Notes & Bulletins', desc: 'Saisie et consultation des notes' },
              { key: 'presences', label: 'Présences & Appel', desc: 'Suivi de l\'assiduité quotidienne' },
              { key: 'emploidutemps', label: 'Emploi du Temps', desc: 'Planning hebdomadaire des classes' },
              { key: 'paiements', label: 'Paiements', desc: 'Gestion financière et recouvrement' },
              { key: 'messages', label: 'Messages', desc: 'Communication interne' },
              { key: 'bibliotheque', label: 'Bibliothèque', desc: 'Catalogue et emprunts de livres' },
            ].map(m => (
              <div key={m.key} className="flex items-center justify-between py-3 px-4 rounded-xl border border-beige-dark hover:bg-beige/40 transition">
                <div>
                  <p className="text-sm font-semibold text-navy">{m.label}</p>
                  <p className="text-xs text-slate">{m.desc}</p>
                </div>
                <button onClick={() => toggleModule(m.key)} className="flex-shrink-0">
                  {modules[m.key]
                    ? <ToggleRight size={28} className="text-sage" />
                    : <ToggleLeft size={28} className="text-slate/40" />
                  }
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'apparence' && (
        <div className="card p-6 max-w-2xl space-y-5">
          <h2 className="font-display font-bold text-navy text-lg">Apparence</h2>
          <div className="flex items-center justify-between py-4 px-4 rounded-xl border border-beige-dark">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-navy" /> : <Sun size={20} className="text-amber" />}
              <div>
                <p className="text-sm font-semibold text-navy">Thème sombre</p>
                <p className="text-xs text-slate">Passer l'interface en mode nuit</p>
              </div>
            </div>
            <button onClick={toggleDarkMode} className="flex-shrink-0">
              {darkMode
                ? <ToggleRight size={28} className="text-sage" />
                : <ToggleLeft size={28} className="text-slate-400" />
              }
            </button>
          </div>
          <div className="bg-beige border border-beige-dark rounded-xl p-4">
            <p className="text-xs text-slate">Le thème sombre est désormais actif sur toute l'interface. Votre préférence est sauvegardée dans ce navigateur.</p>
          </div>
        </div>
      )}

      {tab === 'invitations' && (
        <InvitationPanel />
      )}

      {tab === 'saas' && isAdmin && (
        <div className="space-y-6">
          {/* Header */}
          <div className="card p-5 bg-navy text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><Building2 size={20} className="text-amber" /> Architecture Multi-Écoles</h2>
              <p className="text-white/60 text-sm mt-1">{ecolesReseau.length} établissements enregistrés · SaaS EduPrimaire v2.0</p>
            </div>
            <div className="flex gap-3">
              <button onClick={genererCode} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber text-navy font-semibold text-sm hover:bg-amber/90 transition">
                <RefreshCw size={15} /> Générer un code
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Écoles actives',  val: ecolesReseau.filter(e => e.statut === 'ACTIF').length,    color: 'text-sage' },
              { label: 'En essai',        val: ecolesReseau.filter(e => e.statut === 'EN_ESSAI').length,  color: 'text-amber-dark' },
              { label: 'Suspendues',      val: ecolesReseau.filter(e => e.statut === 'SUSPENDU').length,  color: 'text-coral' },
              { label: 'Total élèves',    val: ecolesReseau.reduce((s, e) => s + e.eleves, 0),            color: 'text-navy' },
            ].map(s => (
              <div key={s.label} className="card p-4 text-center">
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.val}</p>
                <p className="text-xs text-slate mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Liste des écoles */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 bg-beige border-b border-beige-dark">
              <h3 className="text-xs font-bold text-slate uppercase tracking-wider">Établissements enregistrés</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-beige-dark/60">
                  {['École', 'Localisation', 'Plan', 'Élèves', 'Code accès', 'Statut'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ecolesReseau.map(e => (
                  <tr key={e.id} className="border-b border-beige-dark/60 hover:bg-beige/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-navy/8 flex items-center justify-center flex-shrink-0">
                          <Building2 size={13} className="text-navy/40" />
                        </div>
                        <span className="font-semibold text-navy text-sm">{e.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate">{e.ville}, {e.pays}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        e.plan === 'Pro' ? 'bg-amber/10 text-amber-dark border-amber/30' :
                        e.plan === 'Trial' ? 'bg-slate/10 text-slate border-slate/20' :
                        'bg-navy/8 text-navy border-navy/20'
                      }`}>{e.plan}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-navy">{e.eleves}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-beige px-2 py-0.5 rounded font-mono text-slate">{e.code}</code>
                        <button onClick={() => copierCode(e.code)} className="text-slate hover:text-navy transition" title="Copier">
                          {copie === e.code ? <CheckCircle2 size={13} className="text-sage" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        e.statut === 'ACTIF' ? 'bg-sage/10 text-sage' :
                        e.statut === 'EN_ESSAI' ? 'bg-amber/10 text-amber-dark' :
                        'bg-coral/10 text-coral'
                      }`}>
                        {e.statut === 'ACTIF' ? '● Actif' : e.statut === 'EN_ESSAI' ? '◐ Essai' : '○ Suspendu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Codes d'invitation */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-navy text-lg">Codes d'invitation</h3>
              <button onClick={genererCode} className="btn-primary text-xs px-3 py-1.5">
                <Plus size={13} /> Nouveau code
              </button>
            </div>
            <p className="text-xs text-slate">Partagez ces codes avec les directeurs d'établissements pour leur permettre de rejoindre le réseau EduPrimaire.</p>
            <div className="space-y-2">
              {codesInvit.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl border border-beige-dark bg-beige/30 hover:bg-beige/60 transition">
                  <div className={`flex-shrink-0 ${
                    c.statut === 'UTILISE' ? 'text-sage' : c.statut === 'EN_ATTENTE' ? 'text-amber-dark' : 'text-coral'
                  }`}>
                    {c.statut === 'UTILISE' ? <CheckCircle2 size={16} /> : c.statut === 'EN_ATTENTE' ? <Clock size={16} /> : <XCircle size={16} />}
                  </div>
                  <code className="font-mono text-sm font-bold text-navy flex-1">{c.code}</code>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate">{c.cible}</p>
                    <p className="text-[10px] text-slate/50">Expire le {c.expire}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    c.statut === 'UTILISE' ? 'bg-sage/10 text-sage' : c.statut === 'EN_ATTENTE' ? 'bg-amber/10 text-amber-dark' : 'bg-coral/10 text-coral'
                  }`}>
                    {c.statut === 'UTILISE' ? 'Utilisé' : c.statut === 'EN_ATTENTE' ? 'En attente' : 'Expiré'}
                  </span>
                  {c.statut === 'EN_ATTENTE' && (
                    <button onClick={() => copierCode(c.code)} className="text-slate hover:text-navy transition flex-shrink-0" title="Copier">
                      {copie === c.code ? <CheckCircle2 size={15} className="text-sage" /> : <Copy size={15} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal open={modalAjout}  onClose={() => setModalAjout(false)} title="Créer un compte" size="md"><UserForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} /></Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)}   title="Modifier le compte" size="md">{modalEdit && <UserForm initial={modalEdit} onSubmit={handleEdit} onCancel={() => setModalEdit(null)} />}</Modal>
      <Modal open={!!modalDel}  onClose={() => setModalDel(null)}    title="Supprimer le compte" size="sm">
        {modalDel && <div className="space-y-4"><p className="text-sm text-slate">Supprimer le compte de <strong className="text-navy">{modalDel.prenom} {modalDel.nom}</strong> ? Action irréversible.</p><div className="flex justify-end gap-3"><button onClick={() => setModalDel(null)} className="btn-ghost">Annuler</button><button onClick={handleDel} className="btn-danger">Supprimer</button></div></div>}
      </Modal>
    </div>
  )
}
