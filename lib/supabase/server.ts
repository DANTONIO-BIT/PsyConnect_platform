// Server-side Supabase client (cookies).
// When NEXT_PUBLIC_SUPABASE_URL is a placeholder the mock client is returned
// so all Server Components and Route Handlers render with realistic data.

import { createServerClient } from "@supabase/ssr"
import { cookies }            from "next/headers"
import { createMockClient }   from "@/lib/supabase/mock-client"
import type { Database }      from "@/types/database"

const isMockMode = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  return !url || url.includes("placeholder") || url.includes("your-project")
}

export const createClient = async (): Promise<any> => {
  if (isMockMode()) return createMockClient()

  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie mutations are no-ops here
          }
        },
      },
    }
  )
}

// Admin client with service_role key — bypasses RLS.
// Only use in trusted server contexts (webhooks, admin actions).
export const createAdminClient = (): any => {
  if (isMockMode()) return createMockClient()
  const { createClient: sc } = require("@supabase/supabase-js")
  return sc(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
