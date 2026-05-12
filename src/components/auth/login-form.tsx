'use client'

import * as React from 'react'
import { useActionState } from 'react'
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logIn, signUp, type AuthActionState } from '@/app/auth/actions'

import { loginSchema, type LoginSchema } from '@/lib/validations/auth'

type FieldErrors = Partial<Record<keyof LoginSchema, string>>

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState: AuthActionState = { error: null, message: null }

// ─── Component ────────────────────────────────────────────────────────────────

interface LoginFormProps {
  /** When true the form renders in signup mode */
  mode?: 'login' | 'signup'
  className?: string
}

export function LoginForm({ mode = 'login', className }: LoginFormProps) {
  const action = mode === 'signup' ? signUp : logIn

  const [serverState, formAction, isPending] = useActionState(action, initialState)

  // Client-side field errors (Zod)
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({})

  // Track form element ref so we can read values for client validation
  const formRef = React.useRef<HTMLFormElement>(null)

  // Reset field errors when server gives a fresh response
  React.useEffect(() => {
    if (serverState.error || serverState.message) {
      setFieldErrors({})
    }
  }, [serverState])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(e.currentTarget)
    const raw = Object.fromEntries(formData.entries())
    const result = loginSchema.safeParse(raw)

    if (!result.success) {
      e.preventDefault() // Block Server Action submission
      const errs: FieldErrors = {}
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof LoginSchema
        if (!errs[key]) errs[key] = issue.message
      })
      setFieldErrors(errs)
    }
  }

  const isSignup = mode === 'signup'

  return (
    <div
      className={cn(
        // Bento-cell base: dark glass surface, sharp border, subtle glow
        'relative flex flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-white/10 bg-black p-7',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_40px_rgba(0,0,0,0.6)]',
        className,
      )}
    >
      {/* Subtle top-edge highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* ── Header ── */}
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] tracking-[0.2em] text-white/30 uppercase">
          {isSignup ? 'create account' : 'welcome back'}
        </p>
        <h2 className="text-xl font-semibold tracking-tight text-white">
          {isSignup ? 'Sign up' : 'Sign in'}
        </h2>
      </div>

      {/* ── Form ── */}
      <form
        ref={formRef}
        action={formAction}
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Email */}
        <div className="space-y-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-medium tracking-wide text-white/60"
          >
            Email
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/30" />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              className={cn(
                'h-9 pl-9 text-sm',
                'border-white/10 bg-white/5 text-white placeholder:text-white/25',
                'focus-visible:border-white/40 focus-visible:ring-white/10',
                'transition-colors duration-150',
                fieldErrors.email && 'border-red-500/60 focus-visible:border-red-500/80',
              )}
            />
          </div>
          {fieldErrors.email && (
            <p id="email-error" className="flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle className="size-3 shrink-0" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label
            htmlFor="password"
            className="text-xs font-medium tracking-wide text-white/60"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-white/30" />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'min. 6 characters' : '••••••••'}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              className={cn(
                'h-9 pl-9 text-sm',
                'border-white/10 bg-white/5 text-white placeholder:text-white/25',
                'focus-visible:border-white/40 focus-visible:ring-white/10',
                'transition-colors duration-150',
                fieldErrors.password && 'border-red-500/60 focus-visible:border-red-500/80',
              )}
            />
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle className="size-3 shrink-0" />
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Server-side feedback banner */}
        {serverState.error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-[12px] text-red-400"
          >
            <AlertCircle className="mt-px size-3.5 shrink-0" />
            <span>{serverState.error}</span>
          </div>
        )}

        {serverState.message && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-[12px] text-emerald-400"
          >
            <CheckCircle2 className="mt-px size-3.5 shrink-0" />
            <span>{serverState.message}</span>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            'mt-1 h-9 w-full text-sm font-semibold tracking-wide',
            'bg-white text-black hover:bg-white/90',
            'transition-all duration-150',
            isPending && 'cursor-not-allowed opacity-70',
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              {isSignup ? 'Creating account…' : 'Signing in…'}
            </>
          ) : (
            isSignup ? 'Create account' : 'Sign in'
          )}
        </Button>
      </form>

      {/* ── Footer toggle ── */}
      <p className="text-center text-[11px] text-white/30">
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <a
          href={isSignup ? '/login' : '/signup'}
          className="text-white/60 underline-offset-2 hover:text-white hover:underline transition-colors duration-150"
        >
          {isSignup ? 'Sign in' : 'Sign up'}
        </a>
      </p>
    </div>
  )
}
