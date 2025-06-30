import { supabase } from '@/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin, searchParams } = new URL(request.url)
  const next = searchParams.get('next') ?? '/'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  })

  const codeVerifier = (supabase.auth as any)['pkce']?.code_verifier as
    | string
    | undefined

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const response = NextResponse.redirect(data.url)
  if (codeVerifier) {
    response.cookies.set('sb-code-verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
      maxAge: 60 * 10
    })
  }
  return response
}
