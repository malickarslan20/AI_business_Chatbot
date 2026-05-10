import { useAuth } from '../context/AuthContext'
import { Bell, Search } from 'lucide-react'

export default function Navbar({ title }) {
  const { user } = useAuth()

  return (
    <header className="h-16 sm:h-20 border-b border-white/5 bg-darkBg2/50 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:gap-0">
        {/* Title spacer for mobile toggle */}
        <div className="w-10 lg:hidden" /> 
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-textMain">{title}</h1>
      </div>
      
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden md:flex items-center bg-darkBg3 border border-white/10 rounded-full px-4 py-2 w-64 group focus-within:border-brandPurple transition-all">
          <Search size={16} className="text-textMuted group-focus-within:text-brandPurple" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none focus:ring-0 text-sm py-0 w-full ml-2 text-textMain placeholder:text-textMuted"
          />
        </div>

        <button className="relative p-2 rounded-xl bg-white/5 border border-white/5 text-textSecondary hover:text-textMain hover:bg-white/10 transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brandRed rounded-full border-2 border-darkBg2" />
        </button>

        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-textMain truncate max-w-[120px]">
              {user?.email?.split('@')[0]}
            </p>
            <p className="text-[10px] text-textMuted font-medium uppercase tracking-wider">Free Plan</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-brand flex items-center justify-center font-bold text-white shadow-lg shadow-brandPurple/20 border border-white/10">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
