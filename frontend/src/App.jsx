import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout      from './layouts/AppLayout'
import Login          from './pages/login/Login'
import ForgotPassword from './pages/login/ForgotPassword'
import Dashboard      from './pages/dashboard/Dashboard'
import Eleves         from './pages/eleves/Eleves'
import Enseignants    from './pages/enseignants/Enseignants'
import Notes          from './pages/notes/Notes'
import Presences      from './pages/presences/Presences'
import EmploiDuTemps  from './pages/emploidutemps/EmploiDuTemps'
import Paiements      from './pages/paiements/Paiements'
import Messages       from './pages/messages/Messages'
import Bibliotheque   from './pages/bibliotheque/Bibliotheque'
import Parametres     from './pages/parametres/Parametres'
import PortailParent  from './pages/parent/PortailParent'

// Composant de protection des routes
function ProtectedRoute() {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-beige font-display text-navy">Chargement...</div>
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"      element={<Dashboard />} />
              <Route path="/eleves"         element={<Eleves />} />
              <Route path="/enseignants"    element={<Enseignants />} />
              <Route path="/notes"          element={<Notes />} />
              <Route path="/presences"      element={<Presences />} />
              <Route path="/emploidutemps"  element={<EmploiDuTemps />} />
              <Route path="/paiements"      element={<Paiements />} />
              <Route path="/messages"       element={<Messages />} />
              <Route path="/bibliotheque"   element={<Bibliotheque />} />
              <Route path="/parametres"     element={<Parametres />} />
              <Route path="/portail-parent" element={<PortailParent />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
