import { LoginForm } from '@/components/auth/login-form'

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <LoginForm mode="signup" />
      </div>
    </div>
  )
}
