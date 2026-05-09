const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const getEmails = (page = 1, limit = 10) =>
  fetch(`${BASE}/emails/?page=${page}&limit=${limit}`).then(r => r.json())

export const getEmail = (id) =>
  fetch(`${BASE}/emails/${id}`).then(r => r.json())

export const syncEmails = () =>
  fetch(`${BASE}/emails/sync`).then(r => r.json())

export const sendEmail = (to, subject, body) =>
  fetch(`${BASE}/emails/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, subject, body }),
  }).then(r => r.json())
