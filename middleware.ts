import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Routes that require authentication
const PROTECTED_ROUTES = ["/admin", "/dashboard", "/perfil"]
// Routes only admins can access
const ADMIN_ROUTES = ["/admin"]

export const middleware = async (request: NextRequest) => {
  // Skip auth checks if Supabase is not configured (local dev without credentials)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r))
  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r))

  // Redirect unauthenticated users to login
  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin role for /admin routes
  if (isAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
