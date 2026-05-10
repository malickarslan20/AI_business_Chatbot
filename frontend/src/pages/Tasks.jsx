import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks'
import { Plus, Trash2, Pencil, CheckSquare, ChevronLeft, ChevronRight, Filter, RefreshCw, AlertCircle, Calendar } from 'lucide-react'

const PRIORITIES = ['low', 'medium', 'high']
const STATUSES   = ['pending', 'completed']

const priorityStyles = {
  low:    'bg-brandGreen/10 text-brandGreen',
  medium: 'bg-brandYellow/10 text-brandYellow',
  high:   'bg-brandRed/10 text-brandRed',
}

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
      status:   task.status ?? 'pending'
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
    if (res.success) { showToast(`Task ${newStatus}`); load() }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    const res = await deleteTask(id)
    if (res.success) { showToast('Task deleted'); load() }
    else showToast(res.detail ?? 'Delete failed')
  }

  const totalPages = Math.max(1, Math.ceil(count / limit))

  const TaskForm = () => (
    <form onSubmit={handleSave} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Task Title *</label>
        <input 
          placeholder="What needs to be done?" 
          className="w-full bg-darkBg border border-white/10 rounded-2xl py-3.5 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
          value={form.title} 
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
          required 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Priority</label>
          <select 
            className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all appearance-none"
            value={form.priority} 
            onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
          >
            {PRIORITIES.map(p => <option key={p} className="bg-darkBg2">{p}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Deadline</label>
          <input 
            type="date" 
            className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all"
            value={form.deadline} 
            onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Notes</label>
        <textarea 
          rows={3} placeholder="Add some context..." 
          className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all resize-none"
          value={form.notes} 
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
        />
      </div>

      {editTask && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-textSecondary uppercase tracking-widest ml-1">Status</label>
          <select 
            className="w-full bg-darkBg border border-white/10 rounded-2xl py-3 px-4 text-sm text-textMain outline-none focus:border-brandPurple transition-all appearance-none"
            value={form.status ?? editTask.status ?? 'pending'} 
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
          >
            {STATUSES.map(s => <option key={s} className="bg-darkBg2">{s}</option>)}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-textMain" 
          onClick={() => { setShowCreate(false); setEditTask(null) }}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={saving}
          className="flex-1 py-3 bg-gradient-brand rounded-2xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 flex items-center justify-center gap-2"
        >
          {saving ? <RefreshCw className="animate-spin" size={18} /> : (editTask ? 'Save Changes' : 'Create Task')}
        </button>
      </div>
    </form>
  )

  return (
    <div className="flex h-screen bg-darkBg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title="Tasks" />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10">
          {toast && (
            <div className="fixed bottom-8 right-8 z-[110] p-4 bg-brandPurple bg-opacity-90 backdrop-blur-md rounded-2xl text-white font-bold shadow-2xl animate-fade-in">
              {toast}
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-textMain tracking-tight">Tasks</h2>
                <span className="px-2 py-0.5 bg-brandOrange/10 text-brandOrange rounded-md text-xs font-bold">{count} active</span>
              </div>
              <p className="text-textSecondary text-sm sm:text-base font-medium">Keep track of your business to-dos and deadlines.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select 
                  className="flex-1 sm:w-32 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs font-bold text-textMain appearance-none outline-none focus:border-brandPurple"
                  value={statusFilter} 
                  onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                >
                  <option value="" className="bg-darkBg2">All Status</option>
                  <option value="pending" className="bg-darkBg2">Pending</option>
                  <option value="completed" className="bg-darkBg2">Completed</option>
                </select>
                <select 
                  className="flex-1 sm:w-32 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs font-bold text-textMain appearance-none outline-none focus:border-brandPurple"
                  value={priorityFilter} 
                  onChange={e => { setPriorityFilter(e.target.value); setPage(1) }}
                >
                  <option value="" className="bg-darkBg2">All Priority</option>
                  {PRIORITIES.map(p => <option key={p} className="bg-darkBg2">{p}</option>)}
                </select>
              </div>
              <button 
                onClick={openCreate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-brand rounded-xl text-sm font-bold text-white shadow-lg shadow-brandPurple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          <div className="glass rounded-3xl border-white/5 overflow-hidden">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-textSecondary">
                <RefreshCw size={40} className="animate-spin text-brandPurple" />
                <p className="font-bold animate-pulse">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                  <CheckSquare size={40} className="text-textMuted" />
                </div>
                <h3 className="text-xl font-bold text-textMain mb-2">No tasks found</h3>
                <p className="text-textSecondary max-w-xs mx-auto">Create a task to start organizing your business workflows.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-4 w-12"></th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Task</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest">Priority</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest hidden md:table-cell">Deadline</th>
                        <th className="px-6 py-4 text-[10px] font-black text-textMuted uppercase tracking-widest hidden sm:table-cell">Status</th>
                        <th className="px-6 py-4 w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tasks.map((task) => (
                        <tr 
                          key={task.id} 
                          className={`group hover:bg-white/[0.03] transition-colors ${task.status === 'completed' ? 'opacity-60' : ''}`}
                        >
                          <td className="px-6 py-5">
                            <button 
                              onClick={() => handleToggleStatus(task)}
                              className={`
                                w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all active:scale-90
                                ${task.status === 'completed' 
                                  ? 'bg-brandPurple border-brandPurple text-white' 
                                  : 'border-white/10 text-transparent hover:border-brandPurple/50'}
                              `}
                            >
                              <CheckSquare size={14} strokeWidth={3} />
                            </button>
                          </td>
                          <td className="px-6 py-5">
                            <p className={`text-sm font-bold truncate max-w-xs sm:max-w-md ${task.status === 'completed' ? 'line-through text-textMuted' : 'text-textMain'}`}>
                              {task.title}
                            </p>
                            {task.notes && <p className="text-[10px] text-textMuted truncate max-w-xs mt-0.5">{task.notes}</p>}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${priorityStyles[task.priority] ?? 'bg-white/5 text-textMuted'}`}>
                              {task.priority ?? 'medium'}
                            </span>
                          </td>
                          <td className="px-6 py-5 hidden md:table-cell">
                            <div className="flex items-center gap-2 text-xs text-textSecondary font-medium">
                              <Calendar size={12} className="text-textMuted" />
                              {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}
                            </div>
                          </td>
                          <td className="px-6 py-5 hidden sm:table-cell">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'text-brandGreen' : 'text-brandYellow'}`}>
                              {task.status ?? 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => openEdit(task)}
                                className="p-2 rounded-lg bg-white/5 text-textMuted hover:text-textMain transition-all"
                              >
                                <Pencil size={15} />
                              </button>
                              <button 
                                onClick={() => handleDelete(task.id)}
                                className="p-2 rounded-lg bg-brandRed/10 text-brandRed hover:bg-brandRed/20 transition-all"
                              >
                                <Trash2 size={15} />
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

      {(showCreate || editTask) && (
        <Modal 
          title={editTask ? 'Edit Task' : 'New Task'} 
          onClose={() => { setShowCreate(false); setEditTask(null) }}
        >
          <TaskForm />
        </Modal>
      )}
    </div>
  )
}
