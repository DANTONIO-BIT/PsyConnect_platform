"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Brain, Eye, EyeOff, Loader2, User, Stethoscope } from "lucide-react"
import type { Country } from "@/types/database"

type SignupRole = "patient" | "psychologist"

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<SignupRole>("patient")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [country, setCountry] = useState<Country>("CL")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role, country },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Psychologists go to multi-step registration
    if (role === "psychologist") {
      router.push("/registro-psicologo?step=profesional")
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">¡Revisa tu email!</h1>
          <p className="text-muted-foreground">
            Te hemos enviado un enlace de verificación a <strong>{email}</strong>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <Link href="/auth/login">
            <Button variant="outline" className="mt-8 rounded-full">
              Ir al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg text-foreground">PsyConnect</span>
        </Link>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-foreground mb-1">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm mb-6">Da el primer paso hacia el bienestar</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["patient", "psychologist"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  role === r
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {r === "patient" ? (
                  <User className={`w-5 h-5 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
                ) : (
                  <Stethoscope className={`w-5 h-5 ${role === r ? "text-primary" : "text-muted-foreground"}`} />
                )}
                <span className={`text-sm font-medium ${role === r ? "text-primary" : "text-muted-foreground"}`}>
                  {r === "patient" ? "Soy paciente" : "Soy psicólogo/a"}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                placeholder="Tu nombre"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="CL">🇨🇱 Chile</option>
                <option value="ES">🇪🇸 España</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full h-11"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : role === "psychologist" ? (
                "Continuar con registro profesional →"
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
