import { Link } from 'react-router-dom'
import { Bot, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LandingNavbar() {
  const { signInWithGoogle } = useAuth()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-darkBg/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-brand rounded-lg flex items-center justify-center shadow-lg shadow-purple/20 group-hover:scale-105 transition-transform">
              <Bot size={20} className="text-white sm:w-6 sm:h-6" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-textMain hidden xs:block">
              AI Assistant
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-6">
            <Link 
              to="/login" 
              className="text-sm font-medium text-textSecondary hover:text-textMain transition-colors"
            >
              Login
            </Link>
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-darkBg rounded-full text-xs sm:text-sm font-semibold hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-white/10"
            >
              <Mail size={16} className="hidden sm:block" />
              <span>Continue with Google</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
