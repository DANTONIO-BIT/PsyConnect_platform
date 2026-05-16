"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle2, Upload, Camera } from "lucide-react"

const SPECIALTIES = [
  "Ansiedad", "Depresión", "Estrés", "Autoestima", "Terapia de Pareja",
  "Terapia Familiar", "Psicología Adolescente", "Duelo y Pérdida",
  "Trauma y PTSD", "TOC", "Fobias", "Trastornos Alimentarios",
  "TDAH", "Orientación Vocacional", "Mindfulness",
]

const toggle = <T,>(arr: T[], item: T): T[] =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]

export default function MiPerfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Profile fields
  const [fullName, setFullName] = useState("")
  const [phone, setPhone]     = useState("")
  const [city, setCity]       = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Psychologist fields
  const [bio, setBio]                       = useState("")
  const [specialties, setSpecialties]       = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState(1)
  const [registrationNumber, setReg]        = useState("")
  const [priceCLP, setPriceCLP]             = useState("")
  const [priceEUR, setPriceEUR]             = useState("")
  const [country, setCountry]               = useState("CL")

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profile }, { data: psy }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("psychologists").select("*").eq("id", user.id).single(),
      ])

      if (profile) {
        setFullName(profile.full_name ?? "")
        setPhone(profile.phone ?? "")
        setCountry(profile.country ?? "CL")
        setAvatarUrl(profile.avatar_url ?? null)
      }
      if (psy) {
        setBio(psy.bio ?? "")
        setSpecialties(psy.specialties ?? [])
        setExperienceYears(psy.experience_years ?? 1)
        setReg(psy.registration_number ?? "")
        setPriceCLP(psy.session_price_clp ? String(psy.session_price_clp) : "")
        setPriceEUR(psy.session_price_eur ? String(psy.session_price_eur) : "")
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload avatar if changed
    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop()
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from("avatars").getPublicUrl(path)
        newAvatarUrl = data.publicUrl
      }
    }

    await Promise.all([
      supabase.from("profiles").update({
        full_name: fullName,
        phone,
        avatar_url: newAvatarUrl,
      }).eq("id", user.id),

      supabase.from("psychologists").update({
        bio,
        specialties,
        experience_years: experienceYears,
        registration_number: registrationNumber,
        session_price_clp: priceCLP ? parseInt(priceCLP) : null,
        session_price_eur: priceEUR ? parseInt(priceEUR) : null,
      }).eq("id", user.id),
    ])

    setSaving(false)
    setSaved(true)
    setAvatarFile(null)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  const displayAvatar = avatarPreview ?? avatarUrl

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Esta información es visible para los pacientes
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-accent text-primary-foreground rounded-full gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" /> Guardado</>
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>

      {/* Avatar */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-semibold text-foreground text-sm mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              {displayAvatar ? (
                <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-primary">{fullName[0] ?? "?"}</span>
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-primary-foreground" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{fullName || "—"}</p>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
            >
              <Upload className="w-3 h-3" /> Cambiar foto
            </button>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-foreground text-sm">Datos personales</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2 col-span-2">
            <Label>Nombre completo</Label>
            <Input
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setSaved(false) }}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaved(false) }}
              placeholder="+56 9 0000 0000"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>País</Label>
            <div className="h-10 px-3 rounded-xl border border-input bg-secondary flex items-center text-sm text-muted-foreground">
              {country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}
            </div>
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="font-semibold text-foreground text-sm">Perfil profesional</h2>

        <div className="space-y-2">
          <Label>Descripción / Bio</Label>
          <textarea
            value={bio}
            onChange={(e) => { setBio(e.target.value); setSaved(false) }}
            rows={4}
            placeholder="Cuéntanos sobre tu enfoque terapéutico..."
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Años de experiencia</Label>
            <Input
              type="number"
              min={0}
              value={experienceYears}
              onChange={(e) => { setExperienceYears(Number(e.target.value)); setSaved(false) }}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>{country === "ES" ? "Nº de colegiado" : "Código Minsal / SMA"}</Label>
            <Input
              value={registrationNumber}
              onChange={(e) => { setReg(e.target.value); setSaved(false) }}
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <Label>Especialidades</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => { setSpecialties(toggle(specialties, sp)); setSaved(false) }}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  specialties.includes(sp)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {sp}
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
                placeholder="45.000 CLP"
                value={priceCLP}
                onChange={(e) => { setPriceCLP(e.target.value); setSaved(false) }}
                className="rounded-xl pl-7"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
              <Input
                placeholder="60 EUR"
                value={priceEUR}
                onChange={(e) => { setPriceEUR(e.target.value); setSaved(false) }}
                className="rounded-xl pl-7"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
