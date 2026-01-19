import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Lazy initialization to prevent build-time errors
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // During build time, if env vars are missing, use placeholder values
    // This allows the build to complete. At runtime, these will be replaced with actual values.
    const url = supabaseUrl || 'https://placeholder.supabase.co'
    const key = supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'

    // Only throw error at runtime (in browser), not during build
    if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
      throw new Error(
        'Missing Supabase environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
      )
    }

    supabaseClient = createBrowserClient(url, key)
  }

  return supabaseClient
}
