// src/app/test/page.tsx
import { supabase } from '@/lib/supabaseClient'

export default async function TestPage() {
  // Simple server-side query (reads clients)
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .limit(10)

  if (error) {
    return (
      <pre style={{ padding: 16, color: 'crimson' }}>
        {JSON.stringify(error, null, 2)}
      </pre>
    )
  }

  return (
    <main style={{ padding: 16 }}>
      <h1 style={{ fontFamily: 'system-ui, sans-serif' }}>Test: Clients (JSON)</h1>
      <p>Showing up to 10 rows from <code>clients</code>.</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  )
}
