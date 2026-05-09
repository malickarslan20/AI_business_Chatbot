import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import { Mail, FileText, CheckSquare, MessageSquare, RefreshCw } from 'lucide-react'
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
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Dashboard" />
        <div className="page-content">
          <div className="page-header">
            <div>
              <h2 className="page-heading">Overview</h2>
              <p className="page-sub">Your AI-powered business at a glance</p>
            </div>
            <button className="btn btn-ghost" onClick={loadStats} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>

          <div className="stats-grid">
            <StatCard icon={Mail}         label="Total Emails"    value={stats.emails}   color="blue"   sub="in your inbox" />
            <StatCard icon={FileText}     label="Total Invoices"  value={stats.invoices} color="purple" sub="tracked invoices" />
            <StatCard icon={CheckSquare}  label="All Tasks"       value={stats.tasks}    color="green"  sub="tracked tasks" />
            <StatCard icon={CheckSquare}  label="Pending Tasks"   value={stats.pending}  color="orange" sub="needs attention" />
          </div>

          <div className="dashboard-grid">
            <div className="glass-card">
              <h3 className="card-heading">Quick Actions</h3>
              <div className="quick-actions">
                <a href="/emails"   className="qa-item qa-item--blue">
                  <Mail size={20}/> <span>View Emails</span>
                </a>
                <a href="/invoices" className="qa-item qa-item--purple">
                  <FileText size={20}/> <span>Manage Invoices</span>
                </a>
                <a href="/tasks"    className="qa-item qa-item--green">
                  <CheckSquare size={20}/> <span>Manage Tasks</span>
                </a>
                <a href="/chat"     className="qa-item qa-item--indigo">
                  <MessageSquare size={20}/> <span>Ask AI</span>
                </a>
              </div>
            </div>

            <div className="glass-card">
              <h3 className="card-heading">System Status</h3>
              <div className="status-list">
                <div className="status-item">
                  <span className="status-dot status-dot--green" />
                  <span>Backend API</span>
                  <span className="status-val">Online</span>
                </div>
                <div className="status-item">
                  <span className="status-dot status-dot--green" />
                  <span>Supabase DB</span>
                  <span className="status-val">Connected</span>
                </div>
                <div className="status-item">
                  <span className="status-dot status-dot--yellow" />
                  <span>Gmail Sync</span>
                  <span className="status-val">Manual</span>
                </div>
                <div className="status-item">
                  <span className="status-dot status-dot--green" />
                  <span>AI Agent</span>
                  <span className="status-val">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
