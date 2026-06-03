import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = new URL(request.url)
  const code     = searchParams.get("code")
  const next     = searchParams.get("next") ?? "/"
  const error    = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError && user) {
      // If a specific destination was requested (e.g. password reset), honour it
      if (next !== "/") return NextResponse.redirect(`${origin}${next}`)

      // Otherwise redirect by role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin")        return NextResponse.redirect(`${origin}/admin`)
      if (profile?.role === "psychologist") return NextResponse.redirect(`${origin}/dashboard/psicologo`)
      return NextResponse.redirect(`${origin}/dashboard/paciente`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
