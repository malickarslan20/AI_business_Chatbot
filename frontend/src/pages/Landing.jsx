import { Link } from 'react-router-dom'
import { Bot, Mail, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import LandingNavbar from '../components/LandingNavbar'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen bg-darkBg text-textMain selection:bg-brandPurple/30">
      <LandingNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brandPurple/20 blur-[120px] rounded-full pointer-events-none opacity-50" />
        
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brandBlue/10 border border-brandBlue/20 text-brandBlue text-xs sm:text-sm font-medium mb-8 animate-fade-in">
            <Zap size={14} /> 
            <span>AI-Powered Business Automation</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Run your business on <br className="hidden sm:block" />
            <span className="bg-gradient-brand bg-clip-text text-transparent">Autopilot</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-textSecondary mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one AI assistant that manages your emails, tracks invoices, and automates tasks so you can focus on growth.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={signInWithGoogle} 
              className="w-full sm:w-auto px-8 py-4 bg-gradient-brand rounded-full font-bold text-white shadow-lg shadow-brandPurple/25 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight size={18} />
            </button>
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold text-textMain hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="relative mt-20 max-w-6xl mx-auto px-4 z-10 animate-fade-in [animation-delay:200ms]">
          <div className="glass p-2 sm:p-3 rounded-2xl sm:rounded-[32px] border-white/10 shadow-2xl shadow-black/50">
             <img 
               src="/hero_dashboard_preview.png" 
               alt="Dashboard Preview" 
               className="w-full rounded-xl sm:rounded-[24px] shadow-2xl" 
             />
          </div>
          {/* Decorative accents */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brandIndigo/30 blur-3xl rounded-full -z-10" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-brandPurple/30 blur-3xl rounded-full -z-10" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to scale</h2>
          <p className="text-textSecondary text-lg max-w-xl mx-auto">Powerful features designed to streamline your daily operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Mail className="text-brandBlue" />,
              title: "Smart Email Sync",
              desc: "Automatically fetch and categorize your Gmail inbox every 30 minutes. Never miss an important client again."
            },
            {
              icon: <Bot className="text-brandPurple-light" />,
              title: "AI-Powered Insights",
              desc: "Our AI agents analyze your business data to provide actionable insights and automate repetitive tasks."
            },
            {
              icon: <Shield className="text-brandGreen" />,
              title: "Secure & Reliable",
              desc: "Built on enterprise-grade security with encrypted data storage and secure OAuth authentication."
            }
          ].map((feature, i) => (
            <div key={i} className="glass p-8 rounded-2xl hover:bg-white/[0.06] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-textSecondary leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scope Section */}
      <section className="py-24 px-6 bg-darkBg2/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Designed for Modern Entrepreneurs</h2>
            <p className="text-textSecondary text-lg leading-relaxed mb-10">
              Whether you're a freelancer, a small business owner, or managing a growing team, AI Business Assistant scales with your needs.
            </p>
            <div className="space-y-4">
              {[
                'Automated Invoice Tracking',
                'Client Communication Management',
                'Task Prioritization & Scheduling',
                'Financial Performance Analytics'
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-textMain font-medium">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brandGreen/10 flex items-center justify-center">
                    <CheckCircle size={16} className="text-brandGreen" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass p-10 sm:p-16 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brandPurple/10 blur-3xl rounded-full" />
            <h3 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-brand bg-clip-text text-transparent">
              Why Choose Us?
            </h3>
            <p className="text-textSecondary text-lg leading-relaxed">
              Unlike generic assistants, we specialize in business operations. We integrate directly with your tools to provide a seamless automation experience.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Bot size={28} className="text-brandPurple" />
          <span className="font-bold text-xl tracking-tight">AI Assistant</span>
        </div>
        <p className="text-textMuted text-sm">
          © 2026 AI Business Assistant. Built for the future of work.
        </p>
      </footer>
    </div>
  )
}
