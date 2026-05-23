import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout      from './layouts/AppLayout'

// Chargement paresseux des pages
const Login          = lazy(() => import('./pages/login/Login'))
const Register       = lazy(() => import('./pages/login/Register'))
const ForgotPassword = lazy(() => import('./pages/login/ForgotPassword'))
const Dashboard      = lazy(() => import('./pages/dashboard/Dashboard'))
const Eleves         = lazy(() => import('./pages/eleves/Eleves'))
const Enseignants    = lazy(() => import('./pages/enseignants/Enseignants'))
const Notes          = lazy(() => import('./pages/notes/Notes'))
const Presences      = lazy(() => import('./pages/presences/Presences'))
const EmploiDuTemps  = lazy(() => import('./pages/emploidutemps/EmploiDuTemps'))
const Paiements      = lazy(() => import('./pages/paiements/Paiements'))
const Messages       = lazy(() => import('./pages/messages/Messages'))
const Bibliotheque   = lazy(() => import('./pages/bibliotheque/Bibliotheque'))
const Parametres     = lazy(() => import('./pages/parametres/Parametres'))
const PortailParent  = lazy(() => import('./pages/parent/PortailParent'))
const Onboarding     = lazy(() => import('./pages/login/Onboarding'))

const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-beige font-display text-navy">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
  </div>
)

// Composant de protection des routes
function ProtectedRoute() {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-beige font-display text-navy">Chargement...</div>
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Rediriger vers l'onboarding si l'utilisateur n'a pas d'école
  if (!user.ecoleId) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

// Route spécifique d'onboarding
function OnboardingRoute() {
  const { user, loading } = useAuth()
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-beige font-display text-navy">Chargement...</div>
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Onboarding />
}

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/onboarding" element={<OnboardingRoute />} />
            
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
