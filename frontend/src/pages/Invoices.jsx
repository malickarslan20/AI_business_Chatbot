import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getInvoices, uploadInvoice, updateInvoiceStatus, sendInvoice } from '../api/invoices'
import { Upload, Send, FileText, ChevronLeft, ChevronRight, Eye, CheckCircle, Clock } from 'lucide-react'

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
      if (res.success) { showToast(`Invoice sent to ${recipient}`); setShowSend({ open: false, id: null }); setRecipient('') }
      else showToast(res.detail ?? 'Failed')
    } finally { setSending(false) }
  }

  const totalPages = Math.max(1, Math.ceil(count / limit))

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Invoices" />
        <div className="page-content">
          {toast && <div className="toast">{toast}</div>}

          <div className="page-header">
            <div>
              <h2 className="page-heading">Invoices</h2>
              <p className="page-sub">{count} invoices tracked</p>
            </div>
            <div className="btn-group">
              <select className="select-filter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                <Upload size={16} /> Upload Invoice
              </button>
            </div>
          </div>

          <div className="glass-card table-card">
            {loading ? (
              <div className="table-loading"><div className="spinner" /></div>
            ) : invoices.length === 0 ? (
              <div className="table-empty">
                <FileText size={40} className="empty-icon" />
                <p>No invoices yet. Upload your first invoice.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Currency</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="td-main">{inv.vendor ?? '—'}</td>
                      <td>{inv.amount != null ? `$${Number(inv.amount).toFixed(2)}` : '—'}</td>
                      <td>{inv.currency ?? 'USD'}</td>
                      <td className="td-date">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                      <td>
                        <button
                          className={`badge badge-btn ${inv.status === 'paid' ? 'badge--green' : 'badge--yellow'}`}
                          onClick={() => handleStatusToggle(inv)}
                          title="Click to toggle status"
                        >
                          {inv.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {inv.status ?? 'pending'}
                        </button>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" title="View" onClick={() => setSelected(inv)}>
                            <Eye size={15} />
                          </button>
                          <button className="btn-icon btn-icon--purple" title="Send" onClick={() => setShowSend({ open: true, id: inv.id })}>
                            <Send size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && invoices.length > 0 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      {selected && (
        <Modal title="Invoice Details" onClose={() => setSelected(null)}>
          <div className="detail-grid">
            {[['Vendor', selected.vendor], ['Amount', selected.amount ? `$${Number(selected.amount).toFixed(2)}` : '—'], ['Currency', selected.currency], ['Due Date', selected.due_date ? new Date(selected.due_date).toLocaleDateString() : '—'], ['Status', selected.status], ['Notes', selected.notes]].map(([k, v]) => (
              <div key={k} className="detail-row">
                <span className="detail-label">{k}</span>
                <span className="detail-val">{v ?? '—'}</span>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <Modal title="Upload Invoice" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="modal-form">
            <div className="form-group">
              <label>File (PDF or image) *</label>
              <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files[0])} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Vendor</label>
                <input placeholder="ACME Corp" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input type="number" step="0.01" placeholder="500.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Currency</label>
                <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                  <option>USD</option><option>EUR</option><option>GBP</option><option>PKR</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea rows={3} placeholder="Optional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? <span className="btn-spinner" /> : <><Upload size={14} /> Upload</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Send Modal */}
      {showSend.open && (
        <Modal title="Send Invoice" onClose={() => setShowSend({ open: false, id: null })}>
          <form onSubmit={handleSendInvoice} className="modal-form">
            <div className="form-group">
              <label>Recipient Email</label>
              <input type="email" placeholder="client@example.com" value={recipient} onChange={e => setRecipient(e.target.value)} required />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowSend({ open: false, id: null })}>Cancel</button>
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
