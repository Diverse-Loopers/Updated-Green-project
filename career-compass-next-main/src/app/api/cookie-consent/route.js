import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { action } = await request.json()

    if (action !== 'accepted' && action !== 'rejected') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get client IP address (best effort in Next.js App Router)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert log into database
    const { error } = await supabase
      .from('cookie_consent_logs')
      .insert([
        { 
          action,
          ip_address: ip,
          user_agent: userAgent
        }
      ])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging cookie consent:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
