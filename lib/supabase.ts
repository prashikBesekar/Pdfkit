import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client for browser
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  return { data, error }
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  return { data, error }
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  return { data, error }
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  
  return { data, error }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get the current logged-in user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Reset password (send email)
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  return { data, error }
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  
  return { data, error }
}

/**
 * Update user profile
 */
export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  })
  
  return { data, error }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}