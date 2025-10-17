import { NextResponse } from 'next/server'
import { query } from '@/lib/db/pg'

export async function GET() {
  try {
    const res = await query('SELECT now() as now')
    return NextResponse.json({ ok: true, time: res.rows?.[0] ?? null })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
