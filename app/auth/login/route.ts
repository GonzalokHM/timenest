import { supabase } from '@/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` }
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const codeVerifier = await (supabase.auth as any).storage.getItem(
    'supabase.auth.token-code-verifier'
  )
  const response = NextResponse.redirect(data.url)
  if (codeVerifier) {
    response.cookies.set('sb-code-verifier', codeVerifier as string, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 10
    })
  }
  return response
}
