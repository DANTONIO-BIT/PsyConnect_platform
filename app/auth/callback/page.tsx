"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Brain, Loader2 } from "lucide-react"
import type { EmailOtpType } from "@supabase/supabase-js"

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handle = async () => {
      const supabase = createClient()
      const params   = new URLSearchParams(window.location.search)

      const code      = params.get("code")
      const tokenHash = params.get("token_hash")
      const type      = params.get("type") as EmailOtpType | null
      const next      = params.get("next") ?? "/"
      const errParam  = params.get("error")

      if (errParam) {
        router.replace(`/auth/login?error=${encodeURIComponent(errParam)}`)
        return
      }

      // Exchange code or verify OTP — browser client handles PKCE verifier natively
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setError(error.message); return }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) { setError(error.message); return }
      } else {
        router.replace("/auth/login")
        return
      }

      // Explicit destination (e.g. password reset)
      if (next !== "/") {
        router.replace(next)
        return
      }

      // Redirect by role
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace("/auth/login"); return }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role === "admin")        router.replace("/admin")
      else if (profile?.role === "psychologist") router.replace("/dashboard/psicologo")
      else router.replace("/dashboard/paciente")
    }

    handle()
  }, [router])

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-4">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Brain className="w-6 h-6 text-destructive" />
        </div>
        <p className="font-semibold text-foreground">Error al verificar tu cuenta</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <a href="/auth/login" className="text-primary text-sm hover:underline block">
          Volver al login
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Brain className="w-6 h-6 text-primary" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Verificando tu cuenta...</p>
      </div>
    </div>
  )
}
