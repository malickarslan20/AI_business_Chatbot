const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const getTasks = (status = null, priority = null, page = 1, limit = 20) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  if (priority) params.set('priority', priority)
  return fetch(`${BASE}/tasks/?${params}`).then(r => r.json())
}

export const getTask = (id) =>
  fetch(`${BASE}/tasks/${id}`).then(r => r.json())

export const createTask = (payload) =>
  fetch(`${BASE}/tasks/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(r => r.json())

export const updateTask = (id, updates) =>
  fetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }).then(r => r.json())

export const deleteTask = (id) =>
  fetch(`${BASE}/tasks/${id}`, { method: 'DELETE' }).then(r => r.json())
