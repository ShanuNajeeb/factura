import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'

// Types that match your views/tables
type InvoiceView = {
  id: string
  invoice_number: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled'
  total: number
  client_name: string | null
  client_email: string | null
}

type ItemRow = {
  invoice_id: string
  description: string
  qty: number
  unit_price: number
  line_total: number
}

type ShapedItem = Pick<ItemRow, 'description' | 'qty' | 'unit_price' | 'line_total'>

type ShapedInvoice = {
  id: string
  number: string
  status: InvoiceView['status']
  total: number
  client: { name: string | null; email: string | null }
  items: ShapedItem[]
}

export async function GET() {
  // Invoices + client info via the view
  const { data: invoices, error: invErr } = await supabase
    .from('invoices_with_client')
    .select('*')

  if (invErr) {
    return NextResponse.json({ error: invErr.message }, { status: 500 })
  }

  const safeInvoices: InvoiceView[] = (invoices ?? []) as InvoiceView[]

  // Fetch items for these invoices
  const ids = safeInvoices.map((i) => i.id)
  const { data: items, error: itemsErr } = await supabase
    .from('invoice_items')
    .select('*')
    .in('invoice_id', ids)

  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  const safeItems: ItemRow[] = (items ?? []) as ItemRow[]

  const byInvoice = new Map<string, ShapedItem[]>()
  for (const it of safeItems) {
    if (!byInvoice.has(it.invoice_id)) byInvoice.set(it.invoice_id, [])
    byInvoice.get(it.invoice_id)!.push({
      description: it.description,
      qty: Number(it.qty),
      unit_price: Number(it.unit_price),
      line_total: Number(it.line_total),
    })
  }

  const shaped: ShapedInvoice[] = safeInvoices.map((inv) => ({
    id: inv.id,
    number: inv.invoice_number,
    status: inv.status,
    total: Number(inv.total),
    client: { name: inv.client_name, email: inv.client_email },
    items: byInvoice.get(inv.id) ?? [],
  }))

  return NextResponse.json(shaped)
}
