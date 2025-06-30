import { supabase } from '@/lib/supabase'
import {
  generatePKCEVerifier,
  generatePKCEChallenge
} from '@supabase/auth-js/dist/module/lib/helpers'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url)

  const codeVerifier = generatePKCEVerifier()
  const codeChallenge = await generatePKCEChallenge(codeVerifier)
  const codeChallengeMethod = codeVerifier === codeChallenge ? 'plain' : 's256'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        code_challenge: codeChallenge,
        code_challenge_method: codeChallengeMethod
      }
    }
  })

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/auth/error`)
  }

  const response = NextResponse.redirect(data.url)
  if (codeVerifier) {
    response.cookies.set('sb-code-verifier', codeVerifier, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 10
    })
  }
  return response
}
