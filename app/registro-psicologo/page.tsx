"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Brain,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Upload,
  X,
  Mail,
} from "lucide-react"
import type { AvailableHours, WeekDay } from "@/types/database"

// ─── Constants ────────────────────────────────────────────────
const SPECIALTIES = [
  "Ansiedad", "Depresión", "Estrés", "Autoestima", "Terapia de Pareja",
  "Terapia Familiar", "Psicología Adolescente", "Duelo y Pérdida",
  "Trauma y PTSD", "TOC", "Fobias", "Trastornos Alimentarios",
  "TDAH", "Orientación Vocacional", "Mindfulness",
]

const LANGUAGES = ["Español", "Inglés", "Portugués", "Francés", "Catalán"]

const DAYS: { key: WeekDay; label: string }[] = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
]

const HOURS = Array.from({ length: 22 }, (_, i) => {
  const h = i + 7 // 07:00 to 22:30
  return [`${String(h).padStart(2, "0")}:00`, `${String(h).padStart(2, "0")}:30`]
}).flat()

// ─── Types ────────────────────────────────────────────────────
interface FormData {
  // Step 1 — Personal
  fullName: string
  phone: string
  country: "CL" | "ES"
  city: string
  // Step 2 — Professional
  specialties: string[]
  bio: string
  experienceYears: number
  registrationNumber: string
  languages: string[]
  sessionPriceCLP: string
  sessionPriceEUR: string
  sessionModality: ("online" | "presential" | "both")[]
  // Step 3 — Availability
  availableHours: AvailableHours
  // Step 4 — Documents
  avatarFile: File | null
  documentFiles: File[]
}

const INITIAL: FormData = {
  fullName: "", phone: "", country: "CL", city: "",
  specialties: [], bio: "", experienceYears: 1, registrationNumber: "",
  languages: ["Español"], sessionPriceCLP: "", sessionPriceEUR: "",
  sessionModality: ["online"],
  availableHours: {},
  avatarFile: null, documentFiles: [],
}

// ─── Step indicators ──────────────────────────────────────────
const STEPS = [
  { label: "Personal", icon: User },
  { label: "Profesional", icon: GraduationCap },
  { label: "Disponibilidad", icon: Calendar },
  { label: "Documentos", icon: CheckCircle2 },
]

// ─── Toggle helper ────────────────────────────────────────────
const toggle = <T,>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

// ─── Main Component ───────────────────────────────────────────
export default function RegistroPsicologoPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [emailNotVerified, setEmailNotVerified] = useState(false)

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login?redirect=/registro-psicologo")
        return
      }
      // Check if email is verified
      if (!user.email_confirmed_at) {
        setEmailNotVerified(true)
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [])

  // Listen for auth changes (e.g., user signs out)
  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_OUT") {
        router.push("/auth/login?redirect=/registro-psicologo")
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleHour = (day: WeekDay, hour: string) => {
    const current = form.availableHours[day] ?? []
    const updated = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort()
    set("availableHours", { ...form.availableHours, [day]: updated })
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login?redirect=/registro-psicologo")
      return
    }

    if (!user.email_confirmed_at) {
      setError("Debes verificar tu email antes de completar el registro. Revisa tu bandeja de entrada y haz clic en el enlace de verificación.")
      setLoading(false)
      return
    }

    // Upload avatar
    let avatarUrl: string | null = null
    if (form.avatarFile) {
      const ext = form.avatarFile.name.split(".").pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, form.avatarFile, { upsert: true })
      if (!uploadError) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path)
        avatarUrl = data.publicUrl
      }
    }

    // Upload documents
    const documentUrls: string[] = []
    for (const file of form.documentFiles) {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error: docError } = await supabase.storage
        .from("psicologos-docs")
        .upload(path, file)
      if (!docError) documentUrls.push(path)
    }

    // Update profile
    await supabase.from("profiles").update({
      full_name: form.fullName,
      phone: form.phone,
      country: form.country,
      avatar_url: avatarUrl,
      role: "psychologist",
    }).eq("id", user.id)

    // Insert psychologist record
    const { error: psyError } = await supabase.from("psychologists").upsert({
      id: user.id,
      specialties: form.specialties,
      bio: form.bio,
      experience_years: form.experienceYears,
      registration_number: form.registrationNumber,
      languages: form.languages,
      session_price_clp: form.sessionPriceCLP ? parseInt(form.sessionPriceCLP) : null,
      session_price_eur: form.sessionPriceEUR ? parseInt(form.sessionPriceEUR) : null,
      status: "pending",
      documents_urls: documentUrls,
      available_hours: form.availableHours,
      session_modality: form.sessionModality,
    })

    if (psyError) {
      setError("Error al guardar tu perfil. Intenta de nuevo.")
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  // ── Auth checking screen ──
  if (authChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    )
  }

  // ── Email not verified screen ──
  if (emailNotVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Verifica tu email</h1>
          <p className="text-muted-foreground mb-2">
            Te enviamos un enlace de verificación a tu correo electrónico.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Haz clic en el enlace para activar tu cuenta y luego vuelve aquí para completar tu registro profesional.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/auth/login">
              <Button variant="outline" className="rounded-full">Ir al login</Button>
            </Link>
            <Link href="/">
              <Button className="bg-primary hover:bg-accent text-primary-foreground rounded-full">Volver al inicio</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Success screen ──
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">¡Registro enviado!</h1>
          <p className="text-muted-foreground mb-2">
            Hemos recibido tu solicitud. Nuestro equipo revisará tu perfil en un plazo de <strong>24–48 horas</strong>.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            Te notificaremos por email cuando tu cuenta esté aprobada.
          </p>
          <Link href="/">
            <Button variant="outline" className="rounded-full">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">PsyConnect</span>
          </Link>
          <span className="text-sm text-muted-foreground">Registro Profesional</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const active = i === step
            const done = i < step
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-primary" : active ? "bg-primary" : "bg-border"
                  }`}>
                    <Icon className={`w-4 h-4 ${done || active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 transition-all ${done ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          {error && (
            <div className="mb-6 text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">{error}</div>
          )}

          {/* ── STEP 0: Personal ──────────────────── */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Datos personales</h2>
                <p className="text-muted-foreground text-sm mt-1">Información básica de tu perfil público</p>
              </div>

              <div className="space-y-2">
                <Label>Nombre completo *</Label>
                <Input
                  placeholder="Dra. Ana González"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono de contacto</Label>
                <Input
                  placeholder="+56 9 1234 5678"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>País *</Label>
                  <select
                    value={form.country}
                    onChange={(e) => set("country", e.target.value as "CL" | "ES")}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="CL">🇨🇱 Chile</option>
                    <option value="ES">🇪🇸 España</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    placeholder="Santiago, Madrid..."
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: Professional ──────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Perfil profesional</h2>
                <p className="text-muted-foreground text-sm mt-1">Tu experiencia y área de especialización</p>
              </div>

              {/* Specialties */}
              <div className="space-y-2">
                <Label>Especialidades * (selecciona las que apliquen)</Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((sp) => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => set("specialties", toggle(form.specialties, sp))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.specialties.includes(sp)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label>Descripción profesional *</Label>
                <textarea
                  placeholder="Cuéntanos sobre tu enfoque terapéutico, formación y cómo ayudas a tus pacientes..."
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Años de experiencia</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.experienceYears}
                    onChange={(e) => set("experienceYears", Number(e.target.value))}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{form.country === "ES" ? "Nº de colegiado" : "Código Minsal / SMA"}</Label>
                  <Input
                    placeholder={form.country === "ES" ? "M-12345" : "12345678-9"}
                    value={form.registrationNumber}
                    onChange={(e) => set("registrationNumber", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Idiomas de atención</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => set("languages", toggle(form.languages, lang))}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.languages.includes(lang)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prices */}
              <div className="space-y-2">
                <Label>Precio por sesión</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      placeholder="45.000 (CLP)"
                      value={form.sessionPriceCLP}
                      onChange={(e) => set("sessionPriceCLP", e.target.value)}
                      className="rounded-xl pl-7"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                    <Input
                      placeholder="60 (EUR)"
                      value={form.sessionPriceEUR}
                      onChange={(e) => set("sessionPriceEUR", e.target.value)}
                      className="rounded-xl pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Modality */}
              <div className="space-y-2">
                <Label>Modalidad de atención</Label>
                <div className="flex gap-3">
                  {(["online", "presential", "both"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => set("sessionModality", [m])}
                      className={`flex-1 py-2 rounded-xl text-sm border transition-all ${
                        form.sessionModality.includes(m)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {{ online: "🌐 Online", presential: "🏢 Presencial", both: "🔄 Ambas" }[m]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Availability ──────────────── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">Disponibilidad horaria</h2>
                <p className="text-muted-foreground text-sm mt-1">Selecciona los horarios en que estás disponible</p>
              </div>

              {DAYS.map(({ key, label }) => {
                const selected = form.availableHours[key] ?? []
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      {selected.length > 0 && (
                        <span className="text-xs text-primary">{selected.length} horarios</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {HOURS.map((h) => (
                        <button
                          key={h}
                          type="button"
                          onClick={() => toggleHour(key, h)}
                          className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                            selected.includes(h)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── STEP 3: Documents ─────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Foto y documentos</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Sube tu foto de perfil y los documentos que acrediten tu formación
                </p>
              </div>

              {/* Avatar */}
              <div className="space-y-2">
                <Label>Foto de perfil *</Label>
                <div
                  className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("avatar-input")?.click()}
                >
                  {form.avatarFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={URL.createObjectURL(form.avatarFile)}
                        alt="preview"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{form.avatarFile.name}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); set("avatarFile", null) }}
                          className="text-xs text-destructive hover:underline mt-1"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Haz clic para subir tu foto</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG — máx. 5MB</p>
                    </>
                  )}
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) set("avatarFile", file)
                    }}
                  />
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label>Documentos de acreditación *</Label>
                <p className="text-xs text-muted-foreground">
                  {form.country === "ES"
                    ? "Título universitario, colegiación y especialización (si aplica)"
                    : "Título universitario, registro Minsal / SMA, certificados de formación"}
                </p>
                <div
                  className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("docs-input")?.click()}
                >
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Arrastra o haz clic para subir documentos</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG — múltiples archivos</p>
                  <input
                    id="docs-input"
                    type="file"
                    accept=".pdf,image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? [])
                      set("documentFiles", [...form.documentFiles, ...files])
                    }}
                  />
                </div>

                {form.documentFiles.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {form.documentFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
                        <span className="text-sm text-foreground truncate max-w-xs">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => set("documentFiles", form.documentFiles.filter((_, idx) => idx !== i))}
                          className="text-muted-foreground hover:text-destructive transition ml-2 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-secondary rounded-2xl p-4 space-y-2">
                <p className="text-sm font-semibold text-foreground">Resumen de tu registro</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>👤 {form.fullName} · {form.country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}</p>
                  <p>🎓 {form.experienceYears} año{form.experienceYears !== 1 ? "s" : ""} de experiencia</p>
                  <p>🧠 {form.specialties.slice(0, 3).join(", ")}{form.specialties.length > 3 ? ` +${form.specialties.length - 3}` : ""}</p>
                  <p>📅 {Object.values(form.availableHours).flat().length} horarios disponibles</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={`flex mt-8 ${step === 0 ? "justify-end" : "justify-between"}`}>
            {step > 0 && (
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Anterior
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="bg-primary hover:bg-accent text-primary-foreground rounded-full gap-2"
              >
                Siguiente <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-primary hover:bg-accent text-primary-foreground rounded-full gap-2 min-w-40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Enviar solicitud <CheckCircle2 className="w-4 h-4" /></>}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
