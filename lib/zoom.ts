import { supabase } from './supabase'

export interface ZoomToken {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
}

export async function fetchZoomTokens(
  userId: string
): Promise<ZoomToken | null> {
  const { data, error } = await supabase
    .from('zoom_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data as ZoomToken
}

async function refreshTokens(tokens: ZoomToken): Promise<ZoomToken> {
  const creds = `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  const auth = Buffer.from(creds).toString('base64')

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${tokens.refresh_token}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`
      }
    }
  )

  if (!res.ok) {
    throw new Error('Failed to refresh Zoom token')
  }

  const json = await res.json()
  const updated: Partial<ZoomToken> = {
    access_token: json.access_token,
    refresh_token: json.refresh_token,
    expires_at: new Date(Date.now() + json.expires_in * 1000).toISOString()
  }

  const { error } = await supabase
    .from('zoom_tokens')
    .update(updated)
    .eq('user_id', tokens.user_id)

  if (error) throw error

  return { ...tokens, ...updated } as ZoomToken
}

export async function getValidAccessToken(
  userId: string
): Promise<string | null> {
  const tokens = await fetchZoomTokens(userId)
  if (!tokens) return null
  if (new Date(tokens.expires_at).getTime() <= Date.now()) {
    const refreshed = await refreshTokens(tokens)
    return refreshed.access_token
  }
  return tokens.access_token
}
