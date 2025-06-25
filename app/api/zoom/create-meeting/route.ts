import { type NextRequest, NextResponse } from 'next/server'
import { getValidAccessToken } from '@/lib/zoom'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { userId, topic, start_time } = body

  const accessToken = await getValidAccessToken(userId)
  if (!accessToken) {
    return NextResponse.json({ error: 'No Zoom tokens found' }, { status: 400 })
  }

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ topic, type: 1, start_time })
  })

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json(
      { error: 'Failed to create meeting', details: text },
      { status: 500 }
    )
  }

  const json = await res.json()
  return NextResponse.json(json)
}
