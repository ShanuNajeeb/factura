'use client'

import { useEffect, useState } from 'react'

type Item = { description: string; qty: number; unit_price: number; line_total: number }
type Invoice = {
  id: string
  number: string
  status: string
  total: number
  client: { name: string; email: string } | null
  items: Item[]
}

export default function TestInvoicesPage() {
  const [rows, setRows] = useState<Invoice[] | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/test-invoices')
      .then(r => r.json())
      .then(json => (json?.error ? setErr(json.error) : setRows(json)))
      .catch(e => setErr(String(e)))
  }, [])

  if (err) return <pre style={{ color: 'crimson', padding: 16 }}>{err}</pre>
  if (!rows) return <p style={{ padding: 16 }}>Loading…</p>
  if (rows.length === 0) return <p style={{ padding: 16 }}>No invoices yet.</p>

  return (
    <main style={{ padding: 16 }}>
      <h1>Test Invoices</h1>
      <ul>
        {rows.map(inv => (
          <li key={inv.id} style={{ marginBottom: 16 }}>
            <strong>{inv.number}</strong> — {inv.status} — Total: {inv.total.toFixed(2)} <br />
            {inv.client && (
              <span>Client: {inv.client.name} {inv.client.email ? `(${inv.client.email})` : ''}</span>
            )}
            <details style={{ marginTop: 8 }}>
              <summary>Items</summary>
              <ul>
                {inv.items.map((it, idx) => (
                  <li key={idx}>
                    {it.description} — {it.qty} × {it.unit_price.toFixed(2)} = {it.line_total.toFixed(2)}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </main>
  )
}
