import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Bot, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brandPurple/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brandIndigo/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="glass p-8 sm:p-10 rounded-[32px] border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brandPurple/30 mb-6">
              <Bot size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Welcome back</h1>
            <p className="text-textSecondary text-sm mt-2 font-medium">Sign in to your AI Business Assistant</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-brandRed/10 border border-brandRed/20 rounded-2xl text-brandRed text-sm font-medium flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-brandRed rounded-full" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-brandPurple transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-darkBg3 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-textMain placeholder:text-textMuted focus:border-brandPurple focus:ring-4 focus:ring-brandPurple/10 transition-all outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-brandPurple transition-colors" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-darkBg3 border border-white/10 rounded-2xl py-3.5 pl-12 pr-12 text-textMain placeholder:text-textMuted focus:border-brandPurple focus:ring-4 focus:ring-brandPurple/10 transition-all outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-textMain transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-brand rounded-2xl font-bold text-white shadow-lg shadow-brandPurple/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : 'Sign In to Account'}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-black text-textMuted uppercase tracking-[0.2em]">Social Login</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-textMain hover:bg-white/10 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm font-medium text-textSecondary">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brandPurple-light hover:underline font-bold">Create one for free</Link>
        </p>
      </div>
    </div>
  )
}
