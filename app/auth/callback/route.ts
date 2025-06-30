import { supabase } from '@/lib/supabase'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const codeVerifier = request.cookies.get('sb-code-verifier')?.value
    if (codeVerifier) {
      await (supabase.auth as any).storage.setItem(
        'supabase.auth.token-code-verifier',
        codeVerifier
      )
    }
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.delete('sb-code-verifier')
      return response
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
