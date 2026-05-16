"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Search, MapPin, Clock, CalendarDays,
  Check, ArrowLeft, Loader2, Globe,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────
interface Psychologist {
  id: string
  specialties: string[]
  bio: string
  experience_years: number
  session_price_clp: number | null
  session_price_eur: number | null
  session_modality: string[]
  available_hours: Record<string, string[]>
  profiles: { full_name: string; avatar_url: string | null; country: string }
}

const DAY_KEYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
const DAY_LABELS: Record<string, string> = {
  monday:"Lunes", tuesday:"Martes", wednesday:"Miércoles",
  thursday:"Jueves", friday:"Viernes", saturday:"Sábado", sunday:"Domingo",
}

const SPECIALTIES = [
  "Ansiedad","Depresión","Estrés","Autoestima","Terapia de Pareja",
  "Terapia Familiar","Psicología Adolescente","Trauma y PTSD","Mindfulness",
]

// ─── Step 0: Search ───────────────────────────────────────────
function SearchStep({
  onSelect,
  preselectedId,
}: {
  onSelect: (psy: Psychologist) => void
  preselectedId?: string
}) {
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [filtered, setFiltered]           = useState<Psychologist[]>([])
  const [q, setQ]                         = useState("")
  const [specialty, setSpecialty]         = useState("")
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("psychologists")
        .select(`
          id, specialties, bio, experience_years,
          session_price_clp, session_price_eur,
          session_modality, available_hours,
          profiles(full_name, avatar_url, country)
        `)
        .eq("status", "approved")
        .order("experience_years", { ascending: false })

      const list = (data ?? []) as unknown as Psychologist[]
      setPsychologists(list)

      if (preselectedId) {
        const pre = list.find((p) => p.id === preselectedId)
        if (pre) { onSelect(pre); return }
      }
      setLoading(false)
    }
    load()
  }, [preselectedId, onSelect])

  useEffect(() => {
    let result = psychologists
    if (q) result = result.filter((p) =>
      p.profiles?.full_name?.toLowerCase().includes(q.toLowerCase())
    )
    if (specialty) result = result.filter((p) => p.specialties?.includes(specialty))
    setFiltered(result)
  }, [q, specialty, psychologists])

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <Loader2 className="w-5 h-5 animate-spin text-primary" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar psicólogo..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas las especialidades</option>
          {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} psicólogos disponibles</p>

      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        {filtered.map((psy) => {
          const name    = psy.profiles?.full_name ?? "—"
          const country = psy.profiles?.country
          const price   = country === "CL" ? psy.session_price_clp : psy.session_price_eur
          const symbol  = country === "CL" ? "$" : "€"
          const currency = country === "CL" ? "CLP" : "EUR"

          return (
            <button
              key={psy.id}
              onClick={() => onSelect(psy)}
              className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                  {psy.profiles?.avatar_url
                    ? <img src={psy.profiles.avatar_url} alt={name} className="w-full h-full object-cover rounded-xl" />
                    : name[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {name}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{country === "CL" ? "Chile" : "España"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{psy.experience_years} años
                    </span>
                    {psy.session_modality?.includes("online") && (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />Online</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {psy.specialties?.slice(0,3).map((sp) => (
                      <span key={sp} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">{sp}</span>
                    ))}
                  </div>
                </div>
                {price && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">{symbol}{price.toLocaleString("es")}</p>
                    <p className="text-xs text-muted-foreground">{currency}</p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 1: Pick date/hour ───────────────────────────────────
function ScheduleStep({
  psychologist,
  onBack,
  onConfirm,
}: {
  psychologist: Psychologist
  onBack: () => void
  onConfirm: (date: string, hour: string) => void
}) {
  const [selectedDay, setSelectedDay]   = useState<string | null>(null)
  const [selectedHour, setSelectedHour] = useState<string | null>(null)

  const availDays = DAY_KEYS.filter(
    (d) => (psychologist.available_hours?.[d]?.length ?? 0) > 0
  )

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Cambiar psicólogo
      </button>

      <div className="flex items-center gap-3 bg-secondary rounded-2xl px-4 py-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
          {psychologist.profiles.full_name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{psychologist.profiles.full_name}</p>
          <p className="text-xs text-muted-foreground">{psychologist.specialties?.[0]}</p>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Selecciona un día</p>
        <div className="flex flex-wrap gap-2">
          {availDays.length > 0 ? availDays.map((day) => (
            <button
              key={day}
              onClick={() => { setSelectedDay(day); setSelectedHour(null) }}
              className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {DAY_LABELS[day]}
            </button>
          )) : (
            <p className="text-sm text-muted-foreground">Este psicólogo aún no tiene horarios configurados</p>
          )}
        </div>
      </div>

      {selectedDay && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Selecciona un horario</p>
          <div className="flex flex-wrap gap-2">
            {(psychologist.available_hours[selectedDay] ?? []).map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHour(h)}
                className={`px-3 py-1.5 rounded-xl text-sm border transition-all ${
                  selectedHour === h
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <Button
        disabled={!selectedDay || !selectedHour}
        onClick={() => onConfirm(selectedDay!, selectedHour!)}
        className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full"
      >
        Continuar
      </Button>
    </div>
  )
}

// ─── Step 2: Confirm ──────────────────────────────────────────
function ConfirmStep({
  psychologist,
  day,
  hour,
  onBack,
  onBook,
  booking,
}: {
  psychologist: Psychologist
  day: string
  hour: string
  onBack: () => void
  onBook: () => void
  booking: boolean
}) {
  const country = psychologist.profiles?.country
  const price   = country === "CL" ? psychologist.session_price_clp : psychologist.session_price_eur
  const symbol  = country === "CL" ? "$" : "€"
  const currency = country === "CL" ? "CLP" : "EUR"

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Cambiar horario
      </button>

      <div className="bg-secondary rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground">Resumen de tu sesión</h3>
        {[
          { label: "Psicólogo", value: psychologist.profiles.full_name },
          { label: "Especialidad", value: psychologist.specialties?.[0] ?? "—" },
          { label: "Día", value: DAY_LABELS[day] },
          { label: "Hora", value: hour },
          { label: "Duración", value: "50 minutos" },
          { label: "Modalidad", value: psychologist.session_modality?.includes("online") ? "🌐 Online" : "🏢 Presencial" },
          price ? { label: "Precio", value: `${symbol}${price.toLocaleString("es")} ${currency}` } : null,
        ].filter(Boolean).map((item: any) => (
          <div key={item.label} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>

      <Button
        onClick={onBook}
        disabled={booking}
        className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full gap-2"
      >
        {booking
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Agendando...</>
          : <><CalendarDays className="w-4 h-4" /> Confirmar cita</>
        }
      </Button>
    </div>
  )
}

// ─── Main page content (uses useSearchParams) ─────────────────
function AgendarContent() {
  const searchParams   = useSearchParams()
  const router         = useRouter()
  const preselectedId  = searchParams.get("psicologo") ?? undefined

  const [step, setStep]             = useState(0)
  const [psychologist, setPsy]      = useState<Psychologist | null>(null)
  const [selectedDay, setSelectedDay] = useState("")
  const [selectedHour, setHour]     = useState("")
  const [booking, setBooking]       = useState(false)
  const [done, setDone]             = useState(false)
  const [bookedAt, setBookedAt]     = useState<string>("")

  const handleSelect = (psy: Psychologist) => {
    setPsy(psy)
    setStep(1)
  }

  const handleSchedule = (day: string, hour: string) => {
    setSelectedDay(day)
    setHour(hour)
    setStep(2)
  }

  const handleBook = async () => {
    if (!psychologist) return
    setBooking(true)

    const response = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        psychologistId: psychologist.id,
        dayOfWeek: selectedDay,
        hour: selectedHour,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      setBooking(false)
      alert(result.error || 'Error al agendar la cita')
      return
    }

    setBookedAt(result.scheduledAt || '')
    setBooking(false)
    setDone(true)
  }

  if (done) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">¡Cita agendada!</h2>
      <p className="text-muted-foreground text-sm">
        Tu sesión con <strong>{psychologist?.profiles.full_name}</strong> ha sido registrada.
        {bookedAt && (
          <>
            <br />
            Fecha: <strong>{new Date(bookedAt).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</strong>
          </>
        )}
        <br />
        Recibirás una confirmación por email.
      </p>
      <Button
        onClick={() => router.push("/dashboard/paciente/citas")}
        className="bg-primary hover:bg-accent text-primary-foreground rounded-full"
      >
        Ver mis citas
      </Button>
    </div>
  )

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Agendar sesión</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {step === 0 && "Elige el psicólogo que mejor se adapte a ti"}
          {step === 1 && "Selecciona día y horario disponible"}
          {step === 2 && "Confirma tu cita"}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {["Psicólogo", "Horario", "Confirmar"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`flex items-center gap-1.5 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-semibold ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-border text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
            {i < 2 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        {step === 0 && <SearchStep onSelect={handleSelect} preselectedId={preselectedId} />}
        {step === 1 && psychologist && (
          <ScheduleStep
            psychologist={psychologist}
            onBack={() => setStep(0)}
            onConfirm={handleSchedule}
          />
        )}
        {step === 2 && psychologist && (
          <ConfirmStep
            psychologist={psychologist}
            day={selectedDay}
            hour={selectedHour}
            onBack={() => setStep(1)}
            onBook={handleBook}
            booking={booking}
          />
        )}
      </div>
    </div>
  )
}

// ─── Default export with Suspense boundary ────────────────────
export default function AgendarPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    }>
      <AgendarContent />
    </Suspense>
  )
}
