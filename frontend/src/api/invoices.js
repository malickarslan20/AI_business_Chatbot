const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const getInvoices = (status = null, page = 1, limit = 10) => {
  const params = new URLSearchParams({ page, limit })
  if (status) params.set('status', status)
  return fetch(`${BASE}/invoices/?${params}`).then(r => r.json())
}

export const getInvoice = (id) =>
  fetch(`${BASE}/invoices/${id}`).then(r => r.json())

export const uploadInvoice = (formData) =>
  fetch(`${BASE}/invoices/upload`, {
    method: 'POST',
    body: formData,
  }).then(r => r.json())

export const updateInvoiceStatus = (id, status) =>
  fetch(`${BASE}/invoices/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(r => r.json())

export const sendInvoice = (id, recipient) =>
  fetch(`${BASE}/invoices/${id}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient }),
  }).then(r => r.json())
