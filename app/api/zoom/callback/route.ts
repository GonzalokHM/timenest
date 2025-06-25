import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const clientId = process.env.ZOOM_CLIENT_ID!
const clientSecret = process.env.ZOOM_CLIENT_SECRET!

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code || !state) {
    return NextResponse.json(
      { error: 'Missing code or state' },
      { status: 400 }
    )
  }

  const tokenRes = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.ZOOM_REDIRECT_URL!
    })
  })

  if (!tokenRes.ok) {
    const error = await tokenRes.text()
    return NextResponse.json({ error }, { status: 400 })
  }

  const data = (await tokenRes.json()) as any
  const expires_at = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await supabaseAdmin.from('zoom_tokens').upsert({
    user_id: state,
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at
  })

  return NextResponse.redirect(origin)
}
