'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

// ─── Shared return type ───────────────────────────────────────────────────────

export type AuthActionState = {
  error: string | null
  message: string | null
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUp(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Basic validation
  if (!email || !password) {
    return { error: 'Email and password are required.', message: null }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.', message: null }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Update this to your deployed URL in production
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`,
    },
  })

  if (error) {
    // Map common Supabase error codes to user-friendly messages
    const message = mapAuthError(error.code, error.message)
    return { error: message, message: null }
  }

  // Supabase sends a confirmation email; let the user know
  return {
    error: null,
    message: 'Check your email — we sent you a confirmation link to activate your account.',
  }
}

// ─── Log In ───────────────────────────────────────────────────────────────────

export async function logIn(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.', message: null }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const message = mapAuthError(error.code, error.message)
    return { error: message, message: null }
  }

  // Revalidate all cached data for the user's session, then redirect
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── Log Out ──────────────────────────────────────────────────────────────────

export async function logOut(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ─── Error mapper ─────────────────────────────────────────────────────────────

/**
 * Maps Supabase auth error codes to user-friendly messages.
 * Falls back to the raw Supabase message if the code is unrecognised.
 * @see https://supabase.com/docs/reference/javascript/auth-error-codes
 */
function mapAuthError(code: string | undefined, fallback: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'Invalid email or password. Please try again.'
    case 'user_already_exists':
    case 'email_exists':
      return 'An account with this email already exists. Try logging in instead.'
    case 'email_not_confirmed':
      return 'Please confirm your email address before logging in.'
    case 'over_email_send_rate_limit':
      return 'Too many emails sent. Please wait a moment before trying again.'
    case 'weak_password':
      return 'Your password is too weak. Please use at least 6 characters.'
    case 'user_not_found':
      return 'No account found with this email. Please sign up first.'
    default:
      return fallback ?? 'An unexpected error occurred. Please try again.'
  }
}
