import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logOut } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-950 p-4 text-white">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-white/60">Welcome, {user.email}</p>
      </div>
      
      <form action={logOut}>
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  )
}
