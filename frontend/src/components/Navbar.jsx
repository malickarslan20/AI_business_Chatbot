import { useAuth } from '../context/AuthContext'
import { Bell } from 'lucide-react'

export default function Navbar({ title }) {
  const { user } = useAuth()

  return (
    <header className="navbar">
      <h1 className="navbar-title">{title}</h1>
      <div className="navbar-right">
        <button className="navbar-icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="navbar-avatar" title={user?.email}>
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
