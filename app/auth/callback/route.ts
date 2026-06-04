import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get("code")
  const next  = searchParams.get("next") ?? "/"
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${error}`)
  }

  if (code) {
    // Start with a fallback redirect; cookies will be set on this response object
    const response = NextResponse.redirect(new URL("/auth/login", origin))

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            // Write session cookies directly onto the response that will be returned
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && user) {
      // Password reset or other explicit destination
      if (next !== "/") {
        response.headers.set("location", `${origin}${next}`)
        return response
      }

      // Role-based redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      const dest =
        profile?.role === "admin"        ? `${origin}/admin` :
        profile?.role === "psychologist" ? `${origin}/dashboard/psicologo` :
                                           `${origin}/dashboard/paciente`

      response.headers.set("location", dest)
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
