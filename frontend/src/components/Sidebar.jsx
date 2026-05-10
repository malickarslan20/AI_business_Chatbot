import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Mail, FileText, CheckSquare, MessageSquare, LogOut, Bot, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

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
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-darkBg2 border border-white/10 rounded-lg text-textMain shadow-xl"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-[55]
        w-64 bg-darkBg2 border-r border-white/5
        flex flex-col p-6 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-brandPurple/20">
            <Bot size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BizAI</span>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                ${isActive 
                  ? 'bg-brandPurple/15 text-brandPurple-light shadow-inner shadow-white/5' 
                  : 'text-textSecondary hover:text-textMain hover:bg-white/5'}
              `}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button 
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-textMuted hover:text-brandRed hover:bg-brandRed/10 transition-all"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
    </>
  )
}
