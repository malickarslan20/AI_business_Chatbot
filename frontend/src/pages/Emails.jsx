import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getEmails, getEmail, syncEmails, sendEmail } from '../api/emails'
import { RefreshCw, Send, Mail, ChevronLeft, ChevronRight, Eye, Inbox, Filter } from 'lucide-react'

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
    <div className="flex h-screen bg-darkBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Emails" />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {/* Toast */}
          {toast && (
            <div className="fixed bottom-8 right-8 z-[110] p-4 bg-brandPurple bg-opacity-90 backdrop-blur-md rounded-2xl text-white font-bold shadow-2xl animate-fade-in">
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Email Inbox</h2>
                <span className="px-2 py-0.5 bg-brandPurple/10 text-brandPurple-light rounded-md text-xs font-bold">{count} total</span>
              </div>
              <p className="text-textSecondary text-sm sm:text-base font-medium">Manage and automate your business communications.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSync} 
                disabled={syncing}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-textMain hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Syncing...' : 'Sync Gmail'}</span>
              </button>
              <button 
                onClick={() => setShowCompose(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-brand rounded-xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                <Send size={18} />
                <span>Compose</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-textSecondary">
                <RefreshCw size={40} className="animate-spin text-brandPurple" />
                <p className="font-bold animate-pulse">Fetching your inbox...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <Inbox size={40} className="text-textMuted" />
                </div>
                <h3 className="text-xl font-bold text-textMain mb-2">Inbox is empty</h3>
                <p className="text-textSecondary max-w-xs mx-auto">No emails found in your local sync. Click the sync button to fetch your latest messages.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Sender</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Subject</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest hidden sm:table-cell">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 w-20"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {emails.map((email) => (
                        <tr 
                          key={email.id} 
                          className={`
                            group hover:bg-white/[0.03] transition-colors
                            ${!email.is_read ? 'bg-brandPurple/5' : ''}
                          `}
                        >
                          <td className="px-6 py-5">
                            <p className={`text-sm font-bold truncate max-w-[120px] sm:max-w-none ${!email.is_read ? 'text-brandPurple-light' : 'text-textMain'}`}>
                              {email.sender ?? email.from ?? '—'}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <p className={`text-sm truncate max-w-[200px] sm:max-w-md ${!email.is_read ? 'font-bold text-textMain' : 'text-textSecondary'}`}>
                              {email.subject ?? '(no subject)'}
                            </p>
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            <p className="text-xs text-textMuted font-medium">
                              {email.received_at ? new Date(email.received_at).toLocaleDateString() : '—'}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`
                              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                              ${email.is_read ? 'bg-white/5 text-textMuted' : 'bg-brandPurple/10 text-brandPurple-light'}
                            `}>
                              <div className={`w-1 h-1 rounded-full ${email.is_read ? 'bg-textMuted' : 'bg-brandPurple-light'}`} />
                              {email.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => handleView(email.id)}
                              className="p-2 rounded-lg bg-white/5 border border-white/5 text-textMuted hover:text-textMain hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <p className="text-xs font-bold text-textMuted">
                    Showing <span className="text-textSecondary">{(page-1)*limit + 1} - {Math.min(page*limit, count)}</span> of <span className="text-textSecondary">{count}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 rounded-xl bg-white/5 border border-white/5 text-textSecondary disabled:opacity-30 hover:bg-white/10 transition-all"
                      onClick={() => setPage(p => Math.max(1, p - 1))} 
                      disabled={page === 1}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-darkBg border border-white/10 text-xs font-bold">
                      <span className="text-brandPurple-light">{page}</span>
                      <span className="text-textMuted">/</span>
                      <span className="text-textSecondary">{totalPages}</span>
                    </div>
                    <button 
                      className="p-2 rounded-xl bg-white/5 border border-white/5 text-textSecondary disabled:opacity-30 hover:bg-white/10 transition-all"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                      disabled={page === totalPages}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* View Email Modal */}
      {selected && (
        <Modal title="Email Details" onClose={() => setSelected(null)}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div>
                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">From</p>
                <p className="text-sm font-bold text-textMain truncate">{selected.sender ?? selected.from ?? '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Date</p>
                <p className="text-sm font-bold text-textMain truncate">{selected.received_at ? new Date(selected.received_at).toLocaleString() : '—'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-1">Subject</p>
                <p className="text-sm font-bold text-textMain">{selected.subject ?? '(no subject)'}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-[10px] font-black text-textMuted uppercase tracking-widest ml-1">Message Body</p>
              <div className="p-6 rounded-2xl bg-darkBg border border-white/10 text-sm leading-relaxed text-textSecondary whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">
                {selected.body ?? selected.content ?? '(no content)'}
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => setSelected(null)}
                className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-textMain hover:bg-white/10 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Compose Modal */}
      {showCompose && (
        <Modal title="New Message" onClose={() => setShowCompose(false)}>
          <form onSubmit={handleSend} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Recipient</label>
              <input 
                type="email" 
                placeholder="client@company.com" 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain placeholder:text-textMuted focus:border-brandPurple outline-none transition-all"
                value={compose.to}
                onChange={e => setCompose(c => ({ ...c, to: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Subject</label>
              <input 
                type="text" 
                placeholder="Project Update" 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain placeholder:text-textMuted focus:border-brandPurple outline-none transition-all"
                value={compose.subject}
                onChange={e => setCompose(c => ({ ...c, subject: e.target.value }))} 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Message</label>
              <textarea 
                rows={6} 
                placeholder="Hello..." 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain placeholder:text-textMuted focus:border-brandPurple outline-none transition-all resize-none"
                value={compose.body}
                onChange={e => setCompose(c => ({ ...c, body: e.target.value }))} 
                required 
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-textMain hover:bg-white/10 transition-all" 
                onClick={() => setShowCompose(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={sending}
                className="flex-1 py-3 bg-gradient-brand rounded-2xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {sending ? <RefreshCw className="animate-spin" size={18} /> : <><Send size={18} /> Send Message</>}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
