// Browser-side Supabase client (singleton).
// When NEXT_PUBLIC_SUPABASE_URL is a placeholder the mock client is returned
// so all Client Components render with realistic data immediately.

import { createBrowserClient } from "@supabase/ssr"
import { createMockClient }    from "@/lib/supabase/mock-client"
import type { Database }       from "@/types/database"

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  return !url || url.includes("placeholder") || url.includes("your-project")
}

export const createClient = (): any => {
  if (isMockMode()) return createMockClient()
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Use localStorage so the PKCE code_verifier persists through
        // cross-domain redirects (supabase.co → our app) without SameSite issues
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
        flowType: "pkce",
      },
    }
  )
}
