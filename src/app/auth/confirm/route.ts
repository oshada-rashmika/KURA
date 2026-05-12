import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Handles the email confirmation callback from Supabase.
 * Supabase redirects here after the user clicks the confirmation link in
 * their email. The route exchanges the one-time token for a live session
 * and then redirects the user into the app.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  // If either required param is missing, treat it as a broken link
  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_token`)
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({ type, token_hash })

  if (error) {
    const reason = encodeURIComponent(error.message)
    return NextResponse.redirect(`${origin}/auth/error?reason=${reason}`)
  }

  // Token is valid — redirect into the app
  return NextResponse.redirect(`${origin}${next}`)
}
