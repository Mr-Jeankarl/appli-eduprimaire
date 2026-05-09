import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarCheck, Clock, CreditCard, MessageSquare,
  Library, Settings, Bell, Menu, X, LogOut, KeyRound, ChevronUp
} from 'lucide-react'
import { ecole } from '../data/mockData'
import { useAuth } from '../context/AuthContext'

// Définition des accès par rôle
const TOUS = ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT']
const ADMIN_DIR = ['ADMIN', 'DIRECTEUR']
const PEDAGOGIE = ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT']

const NAV = [
  { to: '/dashboard',     label: 'Tableau de Bord',   icon: LayoutDashboard, roles: TOUS },
  { divider: true, label: 'Scolarité', roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'] },
  { to: '/eleves',        label: 'Mon Enfant',         icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT'] },
  { to: '/enseignants',   label: 'Enseignants',        icon: GraduationCap, roles: ADMIN_DIR },
  { to: '/notes',         label: 'Notes & Bulletins',  icon: BookOpen, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'] },
  { to: '/presences',     label: 'Présences',          icon: CalendarCheck, roles: PEDAGOGIE },
  { to: '/emploidutemps', label: 'Emploi du Temps',    icon: Clock, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'] },
  { divider: true, label: 'Administration', roles: ['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'PARENT'] },
  { to: '/paiements',     label: 'Paiements',          icon: CreditCard, roles: ['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'PARENT'] },
  { to: '/messages',      label: 'Messages',           icon: MessageSquare, roles: TOUS },
  { to: '/bibliotheque',  label: 'Bibliothèque',       icon: Library, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT'] },
  { to: '/parametres',    label: 'Paramètres',         icon: Settings, roles: ADMIN_DIR },
]

export default function AppLayout() {
  const [open, setOpen] = useState(true)
  const [notif, setNotif] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const { user: utilisateurConnecte, logout } = useAuth()
  
  const profileMenuRef = useRef(null)

  // Fermer le menu profil si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filtrer les éléments de navigation en fonction du rôle
  const filteredNav = NAV.filter(item => {
    if (!utilisateurConnecte) return false;
    if (item.roles && !item.roles.includes(utilisateurConnecte.role)) return false;
    return true;
  }).map(item => {
    // Adapter les libellés pour le parent / enseignant
    if (item.to === '/eleves') {
      const label = utilisateurConnecte.role === 'PARENT' ? 'Mon Enfant' 
                  : utilisateurConnecte.role === 'ENSEIGNANT' ? 'Mes Élèves' 
                  : 'Élèves'
      return { ...item, label }
    }
    return item;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-beige font-body">
      {/* SIDEBAR */}
      <aside className={`flex flex-col bg-navy text-white transition-all duration-300 flex-shrink-0 ${open ? 'w-60' : 'w-16'} relative`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center font-display font-bold text-navy text-xs flex-shrink-0">
            {ecole.logoInitiales}
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-sm leading-tight truncate">{ecole.nom}</p>
              <p className="text-white/50 text-xs">{ecole.soustitre}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
          {filteredNav.map((item, i) => {
            if (item.divider) {
              return open
                ? <p key={i} className="text-white/30 text-[10px] font-semibold uppercase tracking-widest px-3 pt-5 pb-2">{item.label}</p>
                : <div key={i} className="my-3 border-t border-white/10" />
            }
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-amber text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {open && <span className="truncate">{item.label}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* PROFILE MENU POPOVER */}
        {showProfileMenu && (
          <div 
            ref={profileMenuRef}
            className={`absolute bottom-[72px] left-3 bg-white text-navy rounded-xl shadow-modal border border-beige-dark py-2 z-50 ${open ? 'w-[216px]' : 'w-48 ml-12 bottom-4'}`}
          >
            <div className="px-4 py-2 border-b border-beige-dark/50">
              <p className="text-sm font-bold truncate">{utilisateurConnecte?.prenom} {utilisateurConnecte?.nom}</p>
              <p className="text-xs text-slate truncate">{utilisateurConnecte?.email}</p>
            </div>
            <div className="py-1">
              <button className="w-full text-left px-4 py-2 text-sm text-slate hover:bg-beige hover:text-navy transition flex items-center gap-2">
                <KeyRound size={14} /> Changer mot de passe
              </button>
            </div>
            <div className="border-t border-beige-dark/50 py-1">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2 font-medium"
              >
                <LogOut size={14} /> Se déconnecter
              </button>
            </div>
          </div>
        )}

        <div className={`p-3 border-t border-white/10 ${open ? '' : 'flex justify-center'}`}>
          {open ? (
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition group ${showProfileMenu ? 'bg-white/10' : 'hover:bg-white/10'}`}
            >
              <div className="w-8 h-8 rounded-full bg-amber/20 border border-amber/30 flex items-center justify-center text-amber font-bold text-xs flex-shrink-0">
                {utilisateurConnecte?.initiales}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{utilisateurConnecte?.prenom} {utilisateurConnecte?.nom}</p>
                <p className="text-white/40 text-[10px] uppercase">{utilisateurConnecte?.roleLabel}</p>
              </div>
              <ChevronUp size={16} className={`text-white/30 flex-shrink-0 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
          ) : (
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className={`w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-amber font-bold text-xs transition ${showProfileMenu ? 'ring-2 ring-amber' : 'hover:bg-amber/30'}`}
            >
              {utilisateurConnecte?.initiales}
            </button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-beige-card border-b border-beige-dark flex items-center px-5 gap-4 flex-shrink-0 shadow-sm">
          <button onClick={() => setOpen(v => !v)} className="text-slate hover:text-navy p-1 rounded-lg hover:bg-beige transition">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => setNotif(v => !v)} className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-beige transition text-slate">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full" />
            </button>
            {notif && (
              <div className="absolute right-0 top-11 w-72 card z-50 py-2 shadow-modal">
                <p className="text-xs font-semibold text-slate uppercase tracking-wider px-4 py-2">Notifications</p>
                {(utilisateurConnecte?.role === 'PARENT' 
                  ? ['Bulletin CM2 T1 disponible', 'Message de M. Traoré (Directeur)', 'Cantine : Menu de la semaine']
                  : utilisateurConnecte?.role === 'ENSEIGNANT'
                  ? ['Réunion pédagogique — Vendredi 16h', 'Absence signalée — Lamine Ouédraogo', 'Message d\'un parent — Mme Koné']
                  : utilisateurConnecte?.role === 'COMPTABLE'
                  ? ['Paiement reçu — Mme Koné (150 000 FCFA)', '3 impayés à relancer — CM1', 'Rapport mensuel prêt']
                  : utilisateurConnecte?.role === 'DIRECTEUR'
                  ? ['Taux présence CE2 en baisse — 85%', 'Demande de congé — M. Sankara', 'Conseil pédagogique — Vendredi 14h']
                  : ['Paiement reçu — Seydou Koné', 'Appel manqué — CE2', 'Réunion pédagogique demain']
                ).map((n, i) => (
                  <button key={i} className="w-full text-left px-4 py-3 hover:bg-beige transition">
                    <p className="text-sm text-navy">{n}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-beige border border-beige-dark rounded-lg px-3 py-1.5">
            <Clock size={13} className="text-amber" />
            <span className="text-xs font-semibold text-navy">{ecole.anneeScolaire}</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
