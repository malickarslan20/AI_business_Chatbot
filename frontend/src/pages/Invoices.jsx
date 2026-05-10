import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getInvoices, uploadInvoice, updateInvoiceStatus, sendInvoice } from '../api/invoices'
import { Upload, Send, FileText, ChevronLeft, ChevronRight, Eye, CheckCircle, Clock, Filter, Plus, DollarSign, Calendar } from 'lucide-react'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showSend, setShowSend] = useState({ open: false, id: null })
  const [toast, setToast] = useState('')
  const [recipient, setRecipient] = useState('')

  const [form, setForm] = useState({ vendor: '', amount: '', currency: 'USD', due_date: '', notes: '' })
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)

  const limit = 10

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getInvoices(statusFilter || null, page, limit)
      setInvoices(res.data ?? [])
      setCount(res.count ?? 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, page])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return showToast('Please select a file')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      if (form.vendor)   fd.append('vendor', form.vendor)
      if (form.amount)   fd.append('amount', form.amount)
      fd.append('currency', form.currency)
      if (form.due_date) fd.append('due_date', form.due_date)
      if (form.notes)    fd.append('notes', form.notes)
      const res = await uploadInvoice(fd)
      if (res.success) {
        showToast('Invoice uploaded')
        setShowUpload(false)
        setFile(null)
        setForm({ vendor: '', amount: '', currency: 'USD', due_date: '', notes: '' })
        load()
      } else { showToast(res.detail ?? 'Upload failed') }
    } catch { showToast('Upload failed') }
    finally { setUploading(false) }
  }

  const handleStatusToggle = async (invoice) => {
    const newStatus = invoice.status === 'paid' ? 'pending' : 'paid'
    const res = await updateInvoiceStatus(invoice.id, newStatus)
    if (res.success) { showToast(`Status → ${newStatus}`); load() }
    else showToast(res.detail ?? 'Update failed')
  }

  const handleSendInvoice = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      const res = await sendInvoice(showSend.id, recipient)
      if (res.success) { 
        showToast(`Invoice sent to ${recipient}`)
        setShowSend({ open: false, id: null })
        setRecipient('') 
      } else {
        showToast(res.detail ?? 'Failed to send')
      }
    } finally { setSending(false) }
  }

  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="flex h-screen bg-darkBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Invoices" />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {toast && (
            <div className="fixed bottom-8 right-8 z-[110] p-4 bg-brandPurple bg-opacity-90 backdrop-blur-md rounded-2xl text-white font-bold shadow-2xl animate-fade-in">
              {toast}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Invoices</h2>
                <span className="px-2 py-0.5 bg-brandGreen/10 text-brandGreen rounded-md text-xs font-bold">{count} total</span>
              </div>
              <p className="text-textSecondary text-sm sm:text-base font-medium">Track your revenue and manage vendor payments.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-40">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold text-textMain appearance-none focus:border-brandPurple outline-none transition-all"
                  value={statusFilter} 
                  onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                >
                  <option value="" className="bg-darkBg2">All Status</option>
                  <option value="pending" className="bg-darkBg2">Pending</option>
                  <option value="paid" className="bg-darkBg2">Paid</option>
                </select>
              </div>
              <button 
                onClick={() => setShowUpload(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-brand rounded-xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 hover:scale-[1.02] transition-all active:scale-[0.98]"
              >
                <Plus size={18} />
                <span>Upload Invoice</span>
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-textSecondary">
                <RefreshCw size={40} className="animate-spin text-brandPurple" />
                <p className="font-bold animate-pulse">Loading invoices...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <FileText size={40} className="text-textMuted" />
                </div>
                <h3 className="text-xl font-bold text-textMain mb-2">No invoices found</h3>
                <p className="text-textSecondary max-w-xs mx-auto">Upload your first invoice to start tracking your business finances.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Vendor</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Amount</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest hidden sm:table-cell">Due Date</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 w-28"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="group hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-sm font-bold text-textMain">{inv.vendor ?? '—'}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-black text-textMain">
                                {inv.amount != null ? Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                              </span>
                              <span className="text-[10px] font-bold text-textMuted">{inv.currency ?? 'USD'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            <p className="text-xs text-textSecondary font-medium">
                              {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => handleStatusToggle(inv)}
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all active:scale-95
                                ${inv.status === 'paid' ? 'bg-brandGreen/10 text-brandGreen' : 'bg-brandYellow/10 text-brandYellow'}
                              `}
                            >
                              {inv.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                              {inv.status ?? 'pending'}
                            </button>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setSelected(inv)}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 text-textMuted hover:text-textMain hover:bg-white/10 transition-all"
                              >
                                <Eye size={16} />
                              </button>
                              <button 
                                onClick={() => setShowSend({ open: true, id: inv.id })}
                                className="p-2 rounded-lg bg-brandPurple/10 border border-brandPurple/20 text-brandPurple-light hover:bg-brandPurple/20 transition-all"
                              >
                                <Send size={16} />
                              </button>
                            </div>
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
                      className="p-2 rounded-xl bg-white/5 border border-white/5 text-textSecondary disabled:opacity-30"
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
                      className="p-2 rounded-xl bg-white/5 border border-white/5 text-textSecondary disabled:opacity-30"
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

      {/* Details Modal */}
      {selected && (
        <Modal title="Invoice Overview" onClose={() => setSelected(null)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <DetailCard label="Vendor" value={selected.vendor} icon={FileText} />
              <DetailCard label="Amount" value={`${selected.amount} ${selected.currency}`} icon={DollarSign} />
              <DetailCard label="Due Date" value={selected.due_date ? new Date(selected.due_date).toLocaleDateString() : '—'} icon={Calendar} />
              <DetailCard label="Status" value={selected.status} icon={Activity} color={selected.status === 'paid' ? 'green' : 'yellow'} />
            </div>
            {selected.notes && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-textSecondary leading-relaxed">{selected.notes}</p>
              </div>
            )}
            <button 
              onClick={() => setSelected(null)}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-textMain"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <Modal title="New Invoice" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Invoice File</label>
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain file:bg-brandPurple/10 file:border-none file:text-brandPurple-light file:rounded-lg file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold"
                onChange={e => setFile(e.target.files[0])} 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Vendor</label>
                <input 
                  placeholder="ACME Corp" 
                  className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
                  value={form.vendor} 
                  onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Amount</label>
                <input 
                  type="number" step="0.01" placeholder="0.00" 
                  className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
                  value={form.amount} 
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Currency</label>
                <select 
                  className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
                  value={form.currency} 
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                >
                  <option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Due Date</label>
                <input 
                  type="date" 
                  className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
                  value={form.due_date} 
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Notes</label>
              <textarea 
                rows={3} placeholder="Optional details..." 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all resize-none"
                value={form.notes} 
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-textMain" 
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={uploading}
                className="flex-1 py-3 bg-gradient-brand rounded-2xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {uploading ? <RefreshCw className="animate-spin" size={18} /> : <><Upload size={18} /> Upload Invoice</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Send Modal */}
      {showSend.open && (
        <Modal title="Send via Email" onClose={() => setShowSend({ open: false, id: null })}>
          <form onSubmit={handleSendInvoice} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Client Email</label>
              <input 
                type="email" placeholder="client@company.com" 
                className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
                value={recipient} onChange={e => setRecipient(e.target.value)} required 
              />
            </div>
            <button 
              type="submit" 
              disabled={sending}
              className="w-full py-4 bg-gradient-brand rounded-2xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 flex items-center justify-center gap-2"
            >
              {sending ? <RefreshCw className="animate-spin" size={18} /> : <><Send size={18} /> Send to Client</>}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}

function DetailCard({ label, value, icon: Icon, color = 'gray' }) {
  const colors = {
    gray:   'text-textSecondary bg-white/5 border-white/10',
    green:  'text-brandGreen bg-brandGreen/10 border-brandGreen/20',
    yellow: 'text-brandYellow bg-brandYellow/10 border-brandYellow/20',
  }
  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="opacity-60" />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-bold text-textMain truncate">{value ?? '—'}</p>
    </div>
  )
}
