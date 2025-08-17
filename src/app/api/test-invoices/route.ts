import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

export async function GET() {
  const { data: invoices, error: invErr } = await supabase
    .from('invoices_with_client')
    .select('*')
  if (invErr) return NextResponse.json({ error: invErr.message }, { status: 500 })

  const ids = (invoices ?? []).map((i: any) => i.id)
  const { data: items, error: itemsErr } = await supabase
    .from('invoice_items')
    .select('*')
    .in('invoice_id', ids)
  if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

  const byInvoice = new Map<string, any[]>()
  ;(items ?? []).forEach((it: any) => {
    if (!byInvoice.has(it.invoice_id)) byInvoice.set(it.invoice_id, [])
    byInvoice.get(it.invoice_id)!.push({
      description: it.description,
      qty: Number(it.qty),
      unit_price: Number(it.unit_price),
      line_total: Number(it.line_total),
    })
  })

  const shaped = (invoices ?? []).map((inv: any) => ({
    id: inv.id,
    number: inv.invoice_number,
    status: inv.status,
    total: Number(inv.total),
    client: { name: inv.client_name, email: inv.client_email },
    items: byInvoice.get(inv.id) ?? [],
  }))

  return NextResponse.json(shaped)
}
