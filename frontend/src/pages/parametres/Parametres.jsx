import { useState } from 'react'
import { Save, Plus, Edit2, Trash2, Eye, EyeOff, Shield, School, Users } from 'lucide-react'
import { ecole as initEcole, utilisateurs as initUsers } from '../../data/mockData'
import { Avatar } from '../../components/ui/index'
import Modal from '../../components/ui/Modal'

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
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'roles', label: 'Rôles et Droits', icon: Shield },
]

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
  const [tab, setTab]       = useState('ecole')
  const [ecole, setEcole]   = useState(initEcole)
  const [saved, setSaved]   = useState(false)
  const [users, setUsers]   = useState(initUsers)
  const [filtreRole, setFiltreRole] = useState('')
  const [modalAjout, setModalAjout] = useState(false)
  const [modalEdit, setModalEdit]   = useState(null)
  const [modalDel, setModalDel]     = useState(null)

  const setE = k => e => setEcole(v => ({ ...v, [k]: e.target.value }))
  const handleSave  = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  const handleAjout = data => { setUsers(v => [...v, { ...data, id: `u-${Date.now()}`, actif: true }]); setModalAjout(false) }
  const handleEdit  = data => { setUsers(v => v.map(u => u.id === data.id ? data : u)); setModalEdit(null) }
  const handleDel   = ()   => { setUsers(v => v.filter(u => u.id !== modalDel.id)); setModalDel(null) }
  const toggleActif = id  => setUsers(v => v.map(u => u.id === id ? { ...u, actif: !u.actif } : u))

  const filteredUsers = users.filter(u => !filtreRole || u.role === filtreRole)

  return (
    <div className="p-6 space-y-5 page-enter">
      <div><h1 className="font-display text-2xl font-bold text-navy">Paramètres</h1><p className="text-slate text-sm mt-0.5">Configuration générale de l'application</p></div>

      <div className="flex gap-1 bg-beige-dark/40 p-1 rounded-xl w-fit">
        {TABS.map(t => {
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
            <div className="w-12 h-12 rounded-xl bg-amber flex items-center justify-center font-display font-bold text-navy text-sm flex-shrink-0">{ecole.logoInitiales}</div>
            <div><p className="font-display font-bold text-navy">{ecole.nom}</p><p className="text-xs text-slate">{ecole.ville}, {ecole.pays} · {ecole.anneeScolaire}</p></div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className={saved ? 'btn-amber' : 'btn-primary'}><Save size={15} /> {saved ? 'Enregistré' : 'Sauvegarder'}</button>
          </div>
        </div>
      )}

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
          {ROLES.map(r => (
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

      <Modal open={modalAjout}  onClose={() => setModalAjout(false)} title="Créer un compte" size="md"><UserForm onSubmit={handleAjout} onCancel={() => setModalAjout(false)} /></Modal>
      <Modal open={!!modalEdit} onClose={() => setModalEdit(null)}   title="Modifier le compte" size="md">{modalEdit && <UserForm initial={modalEdit} onSubmit={handleEdit} onCancel={() => setModalEdit(null)} />}</Modal>
      <Modal open={!!modalDel}  onClose={() => setModalDel(null)}    title="Supprimer le compte" size="sm">
        {modalDel && <div className="space-y-4"><p className="text-sm text-slate">Supprimer le compte de <strong className="text-navy">{modalDel.prenom} {modalDel.nom}</strong> ? Action irréversible.</p><div className="flex justify-end gap-3"><button onClick={() => setModalDel(null)} className="btn-ghost">Annuler</button><button onClick={handleDel} className="btn-danger">Supprimer</button></div></div>}
      </Modal>
    </div>
  )
}
