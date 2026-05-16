"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [email, setEmail]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/auth/update-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">Email enviado</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Hemos enviado un enlace de recuperación a <strong>{email}</strong>.
          Revisa tu bandeja de entrada.
        </p>
        <Link href="/auth/login">
          <Button variant="outline" className="rounded-full">Volver al login</Button>
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">PsyConnect</span>
        </Link>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al login
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-1">Recuperar contraseña</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full h-11"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace de recuperación"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
