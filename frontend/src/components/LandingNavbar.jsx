import { Link } from 'react-router-dom'
import { Bot, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LandingNavbar() {
  const { signInWithGoogle } = useAuth()

  return (
    <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(8, 9, 15, 0.8)', backdropFilter: 'blur(12px)' }}>
      <Link to="/" className="sidebar-logo" style={{ paddingBottom: 0 }}>
        <Bot size={28} className="sidebar-logo-icon" />
        <span>AI Business Assistant</span>
      </Link>

      <div className="navbar-right">
        <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
        <button
          onClick={signInWithGoogle}
          className="btn btn-primary btn-sm"
        >
          <Mail size={16} />
          Continue with Google
        </button>
      </div>
    </nav>
  )
}
