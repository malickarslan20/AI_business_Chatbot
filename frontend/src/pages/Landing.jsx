import { Link } from 'react-router-dom'
import { Bot, Mail, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react'
import LandingNavbar from '../components/LandingNavbar'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
  const { signInWithGoogle } = useAuth()

  return (
    <div className="landing-page" style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <LandingNavbar />
      
      {/* Hero Section */}
      <section style={{ padding: '160px 24px 100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="auth-glow auth-glow--1" style={{ width: '800px', height: '800px', top: '-400px', left: '50%', transform: 'translateX(-50%)', opacity: 0.2 }}></div>
        
        <div style={{ maxWidth: '900px', zIndex: 1 }}>
          <div className="badge badge--blue" style={{ marginBottom: '24px', padding: '6px 16px', fontSize: '13px' }}>
            <Zap size={14} /> AI-Powered Business Automation
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Run your business on <span style={{ background: 'linear-gradient(135deg, var(--purple), var(--indigo))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Autopilot</span>
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--text2)', marginBottom: '40px', lineHeight: 1.6, maxWidth: '700px', margin: '0 auto 40px' }}>
            The all-in-one AI assistant that manages your emails, tracks invoices, and automates tasks so you can focus on what matters most.
          </p>
          
          <div className="btn-group" style={{ justifyContent: 'center' }}>
            <button onClick={signInWithGoogle} className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Get Started for Free <ArrowRight size={18} />
            </button>
            <Link to="/login" className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: '16px' }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ marginTop: '80px', width: '100%', maxWidth: '1100px', position: 'relative', zIndex: 1 }}>
          <div className="glass-card" style={{ padding: '12px', borderRadius: '24px', border: '1px solid var(--border2)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
             <img 
               src="/hero_dashboard_preview.png" 
               alt="Dashboard Preview" 
               style={{ width: '100%', borderRadius: '16px', display: 'block' }} 
             />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px' }}>Everything you need to scale</h2>
          <p style={{ color: 'var(--text2)', fontSize: '18px' }}>Powerful features to streamline your daily operations.</p>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="glass-card">
            <div className="stat-card-icon" style={{ background: 'rgba(37,99,235,.15)', color: '#60a5fa', marginBottom: '20px' }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Smart Email Sync</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>Automatically fetch and categorize your Gmail inbox every 30 minutes. Never miss an important client again.</p>
          </div>

          <div className="glass-card">
            <div className="stat-card-icon" style={{ background: 'rgba(124,58,237,.15)', color: '#a78bfa', marginBottom: '20px' }}>
              <Bot size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>AI-Powered Insights</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>Our AI agents analyze your business data to provide actionable insights and automate repetitive tasks.</p>
          </div>

          <div className="glass-card">
            <div className="stat-card-icon" style={{ background: 'rgba(5,150,105,.15)', color: '#34d399', marginBottom: '20px' }}>
              <Shield size={24} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>Secure & Reliable</h3>
            <p style={{ color: 'var(--text2)', lineHeight: 1.6 }}>Built on top of enterprise-grade security with encrypted data storage and secure OAuth authentication.</p>
          </div>
        </div>
      </section>

      {/* Scope Section */}
      <section style={{ padding: '100px 24px', background: 'var(--bg2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '60px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '24px' }}>Designed for Modern Entrepreneurs</h2>
            <p style={{ color: 'var(--text2)', fontSize: '18px', lineHeight: 1.6, marginBottom: '32px' }}>
              Whether you're a freelancer, a small business owner, or managing a growing team, AI Business Assistant scales with you. 
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                'Automated Invoice Tracking',
                'Client Communication Management',
                'Task Prioritization & Scheduling',
                'Financial Performance Analytics'
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: 500 }}>
                  <CheckCircle size={20} style={{ color: 'var(--green)' }} /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '16px', color: 'var(--purple)' }}>Why Choose Us?</div>
            <p style={{ color: 'var(--text2)', fontSize: '18px', lineHeight: 1.6 }}>
              Unlike generic assistants, we specialize in business operations. We integrate directly with your existing tools to provide a seamless automation experience.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <div className="sidebar-logo" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <Bot size={28} className="sidebar-logo-icon" />
          <span>AI Business Assistant</span>
        </div>
        <p style={{ color: 'var(--text3)', fontSize: '14px' }}>
          © 2026 AI Business Assistant. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
