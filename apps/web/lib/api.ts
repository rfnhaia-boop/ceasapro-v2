const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Erro ${res.status}`)
  }
  return res.json()
}

export const api = {
  get: (path: string, token?: string) => apiFetch(path, { method: 'GET' }, token),
  post: (path: string, body: any, token?: string) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }, token),
  patch: (path: string, body: any, token?: string) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }, token),
  del: (path: string, token?: string) => apiFetch(path, { method: 'DELETE' }, token),
}
