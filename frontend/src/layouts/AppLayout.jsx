import { useState, useRef, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  CalendarCheck, Clock, CreditCard, MessageSquare,
  Library, Settings, Bell, Menu, X, LogOut, KeyRound, ChevronUp
} from 'lucide-react'
import { ecole } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import { list, update } from '../services/api'

// Définition des accès par rôle
const TOUS = ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT']
const ADMIN_DIR = ['ADMIN', 'DIRECTEUR']
const PEDAGOGIE = ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT']

const NAV = [
  { to: '/dashboard',     label: 'Tableau de Bord',   icon: LayoutDashboard, roles: TOUS },
  { divider: true, label: 'Scolarité', roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'] },
  { to: '/eleves',        label: 'Mon Enfant',         icon: Users, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'COMPTABLE', 'PARENT'] },
  { to: '/enseignants',   label: 'Enseignants',        icon: GraduationCap, roles: ADMIN_DIR },
  { to: '/notes',         label: 'Notes & Bulletins',  icon: BookOpen, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'], module: 'NOTES' },
  { to: '/presences',     label: 'Présences',          icon: CalendarCheck, roles: PEDAGOGIE, module: 'PRESENCES' },
  { to: '/emploidutemps', label: 'Emploi du Temps',    icon: Clock, roles: ['ADMIN', 'DIRECTEUR', 'ENSEIGNANT', 'PARENT'], module: 'EMPLOI_DU_TEMPS' },
  { divider: true, label: 'Administration', roles: ['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'PARENT'] },
  { to: '/paiements',     label: 'Paiements',          icon: CreditCard, roles: ['ADMIN', 'DIRECTEUR', 'COMPTABLE', 'PARENT'], module: 'COMPTABILITE' },
  { to: '/messages',      label: 'Messages',           icon: MessageSquare, roles: TOUS, module: 'MESSAGERIE' },
  { to: '/bibliotheque',  label: 'Bibliothèque',       icon: Library, roles: ADMIN_DIR, module: 'BIBLIOTHEQUE' },
  { to: '/parametres',    label: 'Paramètres',         icon: Settings, roles: ADMIN_DIR },
]

export default function AppLayout() {
  const [open, setOpen] = useState(true)
  const [notif, setNotif] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const navigate = useNavigate()
  const { user: utilisateurConnecte, logout } = useAuth()
  const [activeModules, setActiveModules] = useState({})
  
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

  // Charger le statut des modules
  useEffect(() => {
    const fetchModules = () => {
      if (utilisateurConnecte) {
        list('/ecole/modules/')
          .then(res => {
            const mapping = {}
            res.forEach(m => {
              mapping[m.module] = m.actif
            })
            setActiveModules(mapping)
          })
          .catch(err => console.error("Erreur lors de la récupération des modules:", err))
      }
    }
    fetchModules()
    window.addEventListener('module-toggled', fetchModules)

    // Écouter les modifications via localStorage pour propager entre onglets
    const onStorage = (e) => {
      if (e.key === 'module-toggled') {
        fetchModules()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('module-toggled', fetchModules)
      window.removeEventListener('storage', onStorage)
    }
  }, [utilisateurConnecte])

  // Charger les notifications
  useEffect(() => {
    let mounted = true
    const fetchNotifs = () => {
      if (!utilisateurConnecte) return
      list('/notifications/notifications/')
        .then(data => {
          if (!mounted) return
          setNotifications(data)
        })
        .catch(err => console.error('Erreur lors de la récupération des notifications:', err))
    }

    fetchNotifs()

    // Re-fetch when dropdown is toggled open
    if (notif) fetchNotifs()

    return () => { mounted = false }
  }, [utilisateurConnecte, notif])

  // WebSocket pour les notifications en temps réel
  useEffect(() => {
    if (!utilisateurConnecte) return
    const token = localStorage.getItem('eduprimaire_access')
    if (!token) return

    const apiBase = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
    const wsBase = apiBase.replace(/^http/, 'ws').replace('/api', '')
    const socket = new WebSocket(`${wsBase}/ws/notifications/?token=${token}`)

    socket.addEventListener('message', (ev) => {
      try {
        const data = JSON.parse(ev.data)
        // prepend
        setNotifications(prev => [data, ...prev])
      } catch (e) {
        console.error('WS message parse error', e)
      }
    })

    socket.addEventListener('open', () => console.debug('WS notifications connected'))
    socket.addEventListener('close', () => console.debug('WS notifications closed'))

    return () => {
      try { socket.close() } catch {}
    }
  }, [utilisateurConnecte])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Filtrer les éléments de navigation en fonction du rôle et des modules activés
  const filteredNav = NAV.filter(item => {
    if (!utilisateurConnecte) return false;
    if (item.roles && !item.roles.includes(utilisateurConnecte.role)) return false;
    if (item.module && activeModules[item.module] === false) return false;
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
      {/* SIDEBAR - Hidden on mobile, overlay on small screens if forced open */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-navy text-white transition-all duration-300 transform lg:relative lg:translate-x-0 ${open ? 'translate-x-0 w-60' : '-translate-x-full lg:translate-x-0 w-16'} flex-shrink-0`}>
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center font-display font-bold text-navy text-xs flex-shrink-0">
            {ecole.logoInitiales}
          </div>
          {(open || window.innerWidth < 1024) && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-sm leading-tight truncate">{ecole.nom}</p>
              <p className="text-white/50 text-xs">{ecole.soustitre}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5 custom-scrollbar">
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
                onClick={() => window.innerWidth < 1024 && setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive ? 'bg-amber text-white shadow-lg shadow-amber/20' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon size={18} className="flex-shrink-0" />
                {(open || window.innerWidth < 1024) && <span className="truncate">{item.label}</span>}
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
                <KeyRound size={14} /> Sécurité
              </button>
            </div>
            <div className="border-t border-beige-dark/50 py-1">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2 font-medium"
              >
                <LogOut size={14} /> Déconnexion
              </button>
            </div>
          </div>
        )}

        <div className={`p-3 border-t border-white/10 ${open ? '' : 'lg:flex lg:justify-center'}`}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)} 
            className={`flex items-center gap-3 w-full p-2 rounded-lg transition group ${showProfileMenu ? 'bg-white/10' : 'hover:bg-white/10'}`}
          >
            <div className="w-8 h-8 rounded-full bg-amber/20 border border-amber/30 flex items-center justify-center text-amber font-bold text-xs flex-shrink-0">
              {utilisateurConnecte?.initiales}
            </div>
            {(open || window.innerWidth < 1024) && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{utilisateurConnecte?.prenom} {utilisateurConnecte?.nom}</p>
                <p className="text-white/40 text-[10px] uppercase">{utilisateurConnecte?.roleLabel}</p>
              </div>
            )}
            <ChevronUp size={16} className={`text-white/30 flex-shrink-0 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* OVERLAY for mobile sidebar */}
      {open && <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 bg-beige-card border-b border-beige-dark flex items-center px-4 lg:px-5 gap-4 flex-shrink-0 z-30">
          <button onClick={() => setOpen(v => !v)} className="text-slate hover:text-navy p-2 rounded-lg hover:bg-beige transition">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex-1 flex items-center lg:hidden">
            <span className="font-display font-bold text-navy truncate">{ecole.nom}</span>
          </div>
          
          <div className="hidden lg:flex flex-1" />

          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setNotif(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-beige transition text-slate">
                  <Bell size={18} />
                  {notifications.filter(n => !n.lu).length > 0 && (
                    <span className="absolute top-2 right-2 min-w-[18px] h-4 bg-amber text-navy text-[10px] font-bold leading-4 rounded-full flex items-center justify-center px-1 ring-2 ring-beige-card">{notifications.filter(n => !n.lu).length}</span>
                  )}
                </button>
              {notif && (
                <div className="absolute right-0 top-11 w-72 bg-white rounded-2xl z-50 py-2 shadow-xl border border-beige-dark overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[10px] font-bold text-slate uppercase tracking-widest px-4 py-2 border-b border-beige-dark/50">Notifications</p>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {notifications.length === 0 && (
                        <p className="px-4 py-3 text-sm text-slate">Aucune notification</p>
                      )}
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => {
                            // mark as read optimistically
                            update(`/notifications/notifications/${n.id}/`, { lu: true })
                              .then(() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, lu: true } : x)))
                              .catch(() => {})
                            // optionally navigate to related resource
                            if (n.data?.message_id) navigate(`/messages/${n.data.message_id}`)
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-beige transition border-b border-beige-dark/30 last:border-0 ${n.lu ? 'opacity-60' : ''}`}
                        >
                          <p className="text-sm text-navy font-medium leading-tight">{n.titre}</p>
                          <p className="text-[10px] text-slate/50 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden sm:flex items-center gap-2 bg-beige border border-beige-dark rounded-lg px-3 py-1.5">
              <Clock size={13} className="text-amber" />
              <span className="text-xs font-semibold text-navy">{ecole.anneeScolaire}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
        </main>

        {/* BOTTOM NAVIGATION FOR MOBILE */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-beige-dark flex items-center justify-around px-2 z-40 safe-area-bottom">
          {filteredNav.filter(item => !item.divider).slice(0, 5).map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
                    isActive ? 'text-amber' : 'text-slate'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
