import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import { Mail, FileText, CheckSquare, MessageSquare, RefreshCw, Activity, Zap, ExternalLink } from 'lucide-react'
import { getEmails } from '../api/emails'
import { getInvoices } from '../api/invoices'
import { getTasks } from '../api/tasks'

export default function Dashboard() {
  const [stats, setStats] = useState({ emails: 0, invoices: 0, tasks: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const [emailsRes, invoicesRes, tasksRes, pendingRes] = await Promise.allSettled([
        getEmails(1, 1),
        getInvoices(null, 1, 1),
        getTasks(null, null, 1, 1),
        getTasks('pending', null, 1, 1),
      ])
      setStats({
        emails:   emailsRes.value?.count   ?? 0,
        invoices: invoicesRes.value?.count  ?? 0,
        tasks:    tasksRes.value?.count    ?? 0,
        pending:  pendingRes.value?.count  ?? 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  return (
    <div className="flex h-screen bg-darkBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Welcome back,</h2>
              <p className="text-textSecondary text-sm sm:text-base mt-1 font-medium">Your AI business suite is ready for action.</p>
            </div>
            <button 
              onClick={loadStats} 
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-textMain hover:bg-white/10 transition-all disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Stats</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
            <StatCard icon={Mail}        label="Total Emails"    value={stats.emails}   color="blue"   sub="Unread messages" />
            <StatCard icon={FileText}    label="Invoices"        value={stats.invoices} color="purple" sub="Across all clients" />
            <StatCard icon={CheckSquare} label="All Tasks"       value={stats.tasks}    color="green"  sub="Productivity tracking" />
            <StatCard icon={Activity}    label="Pending Tasks"   value={stats.pending}  color="orange" sub="Needs attention" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Actions */}
            <div className="xl:col-span-2 space-y-6">
              <div className="glass p-6 sm:p-8 rounded-3xl border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                  <Zap size={120} className="text-brandPurple" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                  <Zap size={20} className="text-brandPurple" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ActionItem href="/emails" color="indigo" icon={Mail} label="Open Gmail Inbox" isPrimary />
                  <ActionItem href="/emails" color="blue" icon={Mail} label="View Synced Emails" />
                  <ActionItem href="/invoices" color="purple" icon={FileText} label="Manage Invoices" />
                  <ActionItem href="/tasks" color="green" icon={CheckSquare} label="Manage Tasks" />
                  <ActionItem href="/chat" color="indigo" icon={MessageSquare} label="Talk to AI Assistant" />
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="glass p-6 sm:p-8 rounded-3xl border-white/5">
              <h3 className="text-lg sm:text-xl font-bold text-textMain mb-6 flex items-center gap-2">
                <Activity size={20} className="text-brandGreen" />
                System Status
              </h3>
              <div className="space-y-4">
                <StatusItem label="Backend API" status="Online" color="green" />
                <StatusItem label="Supabase DB" status="Connected" color="green" />
                <StatusItem label="Gmail Sync" status="30m Interval" color="yellow" />
                <StatusItem label="AI Agent" status="Ready" color="green" />
              </div>
              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-xs text-textSecondary leading-relaxed">
                  Last sync performed: <span className="text-textMain font-medium">2 mins ago</span>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function ActionItem({ href, icon: Icon, label, color, isPrimary }) {
  const colors = {
    indigo: 'text-brandIndigo bg-brandIndigo/10 border-brandIndigo/20 hover:bg-brandIndigo/20',
    blue:   'text-brandBlue bg-brandBlue/10 border-brandBlue/20 hover:bg-brandBlue/20',
    purple: 'text-brandPurple bg-brandPurple/10 border-brandPurple/20 hover:bg-brandPurple/20',
    green:  'text-brandGreen bg-brandGreen/10 border-brandGreen/20 hover:bg-brandGreen/20',
  }

  return (
    <a 
      href={href} 
      className={`
        flex items-center justify-between p-4 rounded-2xl border transition-all active:scale-[0.98]
        ${isPrimary ? 'bg-gradient-brand text-white border-transparent shadow-lg shadow-brandPurple/20 hover:scale-[1.02]' : colors[color]}
      `}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ExternalLink size={14} className="opacity-50" />
    </a>
  )
}

function StatusItem({ label, status, color }) {
  const dots = {
    green:  'bg-brandGreen shadow-brandGreen/50',
    yellow: 'bg-brandYellow shadow-brandYellow/50',
    red:    'bg-brandRed shadow-brandRed/50',
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${dots[color]}`} />
        <span className="text-sm font-medium text-textSecondary">{label}</span>
      </div>
      <span className="text-xs font-bold text-textMain">{status}</span>
    </div>
  )
}
