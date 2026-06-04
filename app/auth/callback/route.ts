import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)

  const code       = searchParams.get("code")
  const tokenHash  = searchParams.get("token_hash")
  const type       = searchParams.get("type") as EmailOtpType | null
  const next       = searchParams.get("next") ?? "/"
  const error      = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(error)}`)
  }

  // Helper: create a redirect response with session cookies attached
  const makeRedirect = (dest: string) => NextResponse.redirect(dest)

  const buildClient = (response: NextResponse) =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

  // ── Flow 1: PKCE code exchange (OAuth / magic link / password reset) ──
  if (code) {
    const response = makeRedirect(`${origin}/auth/login`)
    const supabase = buildClient(response)

    const { data: { user }, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && user) {
      return redirectByDestination(supabase, user.id, next, origin, response)
    }

    return response // fallback → login
  }

  // ── Flow 2: Token hash (email confirmation / email change) ──
  if (tokenHash && type) {
    const response = makeRedirect(`${origin}/auth/login`)
    const supabase = buildClient(response)

    const { data: { user }, error: verifyError } =
      await supabase.auth.verifyOtp({ token_hash: tokenHash, type })

    if (!verifyError && user) {
      return redirectByDestination(supabase, user.id, next, origin, response)
    }

    return response // fallback → login
  }

  // No recognized params
  return NextResponse.redirect(`${origin}/auth/login`)
}

// Redirect to explicit `next` or by role
async function redirectByDestination(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  next: string,
  origin: string,
  response: NextResponse
): Promise<NextResponse> {
  if (next !== "/") {
    return NextResponse.redirect(`${origin}${next}`, {
      headers: response.headers,
    })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  const dest =
    profile?.role === "admin"        ? `${origin}/admin` :
    profile?.role === "psychologist" ? `${origin}/dashboard/psicologo` :
                                       `${origin}/dashboard/paciente`

  const finalResponse = NextResponse.redirect(dest)
  // Copy session cookies onto the final redirect
  response.cookies.getAll().forEach(({ name, value, ...rest }) => {
    finalResponse.cookies.set({ name, value, ...rest })
  })
  return finalResponse
}
