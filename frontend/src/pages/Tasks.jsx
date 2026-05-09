import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { Plus, Trash2, Pencil, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES   = ['pending', 'completed']

const priorityColor = { low: 'badge--green', medium: 'badge--yellow', high: 'badge--red' }

const emptyForm = { title: '', priority: 'medium', notes: '', deadline: '' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [page, setPage] = useState(1)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const limit = 20

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const load = async () => {
    setLoading(true)
    try {
      const res = await getTasks(statusFilter || null, priorityFilter || null, page, limit)
      setTasks(res.data ?? [])
      setCount(res.count ?? 0)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, priorityFilter, page])

  const openCreate = () => { setForm(emptyForm); setShowCreate(true) }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title:    task.title ?? '',
      priority: task.priority ?? 'medium',
      notes:    task.notes ?? '',
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, deadline: form.deadline || undefined, notes: form.notes || undefined }
      const res = editTask
        ? await updateTask(editTask.id, payload)
        : await createTask(payload)
      if (res.success) {
        showToast(editTask ? 'Task updated' : 'Task created')
        setShowCreate(false)
        setEditTask(null)
        load()
      } else { showToast(res.detail ?? 'Save failed') }
    } finally { setSaving(false) }
  }

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const res = await updateTask(task.id, { status: newStatus })
    if (res.success) { showToast(`→ ${newStatus}`); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    const res = await deleteTask(id)
    if (res.success) { showToast('Task deleted'); load() }
    else showToast(res.detail ?? 'Delete failed')
  }

  const totalPages = Math.max(1, Math.ceil(count / limit))

  const TaskForm = () => (
    <form onSubmit={handleSave} className="modal-form">
      <div className="form-group">
        <label>Title *</label>
        <input placeholder="Task title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Priority</label>
          <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Deadline</label>
          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
        </div>
      </div>
      <div className="form-group">
        <label>Notes</label>
        <textarea rows={3} placeholder="Optional notes…" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      {editTask && (
        <div className="form-group">
          <label>Status</label>
          <select value={form.status ?? editTask.status ?? 'pending'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={() => { setShowCreate(false); setEditTask(null) }}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="btn-spinner" /> : editTask ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  )

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar title="Tasks" />
        <div className="page-content">
          {toast && <div className="toast">{toast}</div>}

          <div className="page-header">
            <div>
              <h2 className="page-heading">Tasks</h2>
              <p className="page-sub">{count} tasks found</p>
            </div>
            <div className="btn-group">
              <select className="select-filter" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select className="select-filter" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}>
                <option value="">All Priority</option>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              <button className="btn btn-primary" onClick={openCreate}>
                <Plus size={16} /> New Task
              </button>
            </div>
          </div>

          <div className="glass-card table-card">
            {loading ? (
              <div className="table-loading"><div className="spinner" /></div>
            ) : tasks.length === 0 ? (
              <div className="table-empty">
                <CheckSquare size={40} className="empty-icon" />
                <p>No tasks yet. Create your first task.</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Done</th>
                    <th>Title</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(task => (
                    <tr key={task.id} className={task.status === 'completed' ? 'row-done' : ''}>
                      <td>
                        <button
                          className={`check-btn ${task.status === 'completed' ? 'check-btn--done' : ''}`}
                          onClick={() => handleToggleStatus(task)}
                          title="Toggle complete"
                        >
                          <CheckSquare size={18} />
                        </button>
                      </td>
                      <td className="td-main">{task.title}</td>
                      <td><span className={`badge ${priorityColor[task.priority] ?? 'badge--gray'}`}>{task.priority ?? 'medium'}</span></td>
                      <td className="td-date">{task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge ${task.status === 'completed' ? 'badge--green' : 'badge--yellow'}`}>{task.status ?? 'pending'}</span></td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" onClick={() => openEdit(task)} title="Edit"><Pencil size={15} /></button>
                          <button className="btn-icon btn-icon--red" onClick={() => handleDelete(task.id)} title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {!loading && tasks.length > 0 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
                <span className="page-info">Page {page} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {(showCreate) && (
        <Modal title="Create Task" onClose={() => setShowCreate(false)}><TaskForm /></Modal>
      )}
      {editTask && (
        <Modal title="Edit Task" onClose={() => setEditTask(null)}><TaskForm /></Modal>
      )}
    </div>
  )
}
