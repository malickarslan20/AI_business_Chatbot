import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getEmails, getEmail, syncEmails, sendEmail } from '../api/emails'
import { RefreshCw, Send, Mail, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

export default function Emails() {
  const [emails, setEmails] = useState([])
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [toast, setToast] = useState('')

  const [compose, setCompose] = useState({ to: '', subject: '', body: '' })
  const [sending, setSending] = useState(false)

  const limit = 10

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const load = async (p = page) => {
    setLoading(true)
    try {
      const res = await getEmails(p, limit)
      setEmails(res.data ?? [])
      setCount(res.count ?? 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page])

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await syncEmails()
      showToast(res.message ?? 'Sync complete')
      load()
    } catch { showToast('Sync failed') }
    finally { setSyncing(false) }
  }

  const handleView = async (id) => {
    const res = await getEmail(id)
    setSelected(res.data ?? null)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await sendEmail(compose.to, compose.subject, compose.body)
      if (res.success) {
        showToast(`Email sent to ${compose.to}`)
        setShowCompose(false)
        setCompose({ to: '', subject: '', body: '' })
      } else {
        showToast(res.detail ?? 'Send failed')
      }
    } catch { showToast('Send failed') }
    finally { setSending(false) }
  }

  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Emails" />
        <div className="page-content">
          {toast && <div className="toast">{toast}</div>}

          <div className="page-header">
            <div>
              <h2 className="page-heading">Email Inbox</h2>
              <p className="page-sub">{count} emails stored</p>
            </div>
            <div className="btn-group">
              <button className="btn btn-ghost" onClick={handleSync} disabled={syncing}>
                <RefreshCw size={16} className={syncing ? 'spin' : ''} />
                {syncing ? 'Syncing…' : 'Sync Gmail'}
              </button>
              <button className="btn btn-primary" onClick={() => setShowCompose(true)}>
                <Send size={16} /> Compose
              </button>
            </div>
          </div>

          <div className="glass-card table-card">
            {loading ? (
              <div className="table-loading"><div className="spinner" /></div>
            ) : emails.length === 0 ? (
              <div className="table-empty">
                <Mail size={40} className="empty-icon" />
                <p>No emails yet. Click "Sync Gmail" to fetch.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {emails.map((email) => (
                    <tr key={email.id} className={email.is_read ? '' : 'row-unread'}>
                      <td className="td-main">{email.sender ?? email.from ?? '—'}</td>
                      <td>{email.subject ?? '(no subject)'}</td>
                      <td className="td-date">{email.received_at ? new Date(email.received_at).toLocaleDateString() : '—'}</td>
                      <td>
                        <span className={`badge ${email.is_read ? 'badge--gray' : 'badge--blue'}`}>
                          {email.is_read ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => handleView(email.id)} title="View">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && emails.length > 0 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft size={16} />
                </button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Email Modal */}
      {selected && (
        <Modal title="Email Details" onClose={() => setSelected(null)}>
          <div className="email-detail">
            <div className="email-meta">
              <span className="email-meta-label">From:</span>
              <span>{selected.sender ?? selected.from ?? '—'}</span>
            </div>
            <div className="email-meta">
              <span className="email-meta-label">Subject:</span>
              <span>{selected.subject ?? '—'}</span>
            </div>
            <div className="email-meta">
              <span className="email-meta-label">Date:</span>
              <span>{selected.received_at ? new Date(selected.received_at).toLocaleString() : '—'}</span>
            </div>
            <div className="email-body">{selected.body ?? selected.content ?? '(no content)'}</div>
          </div>
        </Modal>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <Modal title="Compose Email" onClose={() => setShowCompose(false)}>
          <form onSubmit={handleSend} className="modal-form">
            <div className="form-group">
              <label>To</label>
              <input type="email" placeholder="recipient@example.com" value={compose.to}
                onChange={e => setCompose(c => ({ ...c, to: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input type="text" placeholder="Email subject" value={compose.subject}
                onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Body</label>
              <textarea rows={6} placeholder="Write your message…" value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCompose(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? <span className="btn-spinner" /> : <><Send size={14} /> Send</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
