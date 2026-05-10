import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Landing   from './pages/Landing'
import Emails    from './pages/Emails'
import Invoices  from './pages/Invoices'
import Tasks     from './pages/Tasks'
import Chat      from './pages/Chat'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<AuthRoute />} />
          <Route path="/emails"   element={<ProtectedRoute><Emails /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
          <Route path="/tasks"    element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/chat"     element={<ProtectedRoute><Chat /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function AuthRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="auth-loading"><div className="spinner"></div></div>
  return user ? <Dashboard /> : <Landing />
}
