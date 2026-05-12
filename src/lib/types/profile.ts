/**
 * Mirrors the public.profiles table schema.
 * Keep in sync with supabase/migrations/20260512000001_create_profiles.sql
 *
 * For a fully generated, always-up-to-date version run:
 *   npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts
 */
export interface Profile {
  id: string           // uuid — matches auth.users.id
  email: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  is_onboarded: boolean
  created_at: string   // ISO-8601 timestamptz
  updated_at: string
}

/** Columns the user is allowed to mutate via the client */
export type ProfileUpdate = Partial<
  Pick<Profile, 'username' | 'full_name' | 'avatar_url' | 'bio' | 'is_onboarded'>
>
