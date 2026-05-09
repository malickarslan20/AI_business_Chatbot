import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Mail, FileText, CheckSquare, MessageSquare, LogOut, Bot } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/emails',   icon: Mail,            label: 'Emails'    },
  { to: '/invoices', icon: FileText,        label: 'Invoices'  },
  { to: '/tasks',    icon: CheckSquare,     label: 'Tasks'     },
  { to: '/chat',     icon: MessageSquare,   label: 'AI Chat'   },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Bot size={28} className="sidebar-logo-icon" />
        <span>BizAI</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  )
}
