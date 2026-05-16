"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Clock } from "lucide-react"
import type { AvailableHours, WeekDay } from "@/types/database"

const DAYS: { key: WeekDay; label: string }[] = [
  { key: "monday",    label: "Lunes" },
  { key: "tuesday",   label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday",  label: "Jueves" },
  { key: "friday",    label: "Viernes" },
  { key: "saturday",  label: "Sábado" },
  { key: "sunday",    label: "Domingo" },
]

const HOURS = Array.from({ length: 30 }, (_, i) => {
  const totalMins = (7 * 60) + i * 30 // 07:00 to 21:30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
})

export default function DisponibilidadPage() {
  const [hours, setHours] = useState<AvailableHours>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("psychologists")
        .select("available_hours")
        .eq("id", user.id)
        .single()

      if (data?.available_hours) setHours(data.available_hours as AvailableHours)
      setLoading(false)
    }
    load()
  }, [])

  const toggle = (day: WeekDay, hour: string) => {
    const current = hours[day] ?? []
    const updated = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort()
    setHours((prev) => ({ ...prev, [day]: updated }))
    setSaved(false)
  }

  const clearDay = (day: WeekDay) => {
    setHours((prev) => ({ ...prev, [day]: [] }))
    setSaved(false)
  }

  const copyToAll = (day: WeekDay) => {
    const source = hours[day] ?? []
    const updated: AvailableHours = {}
    DAYS.forEach(({ key }) => { updated[key] = [...source] })
    setHours(updated)
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("psychologists")
      .update({ available_hours: hours })
      .eq("id", user.id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const totalSlots = Object.values(hours).flat().length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disponibilidad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Define los horarios en que puedes atender pacientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">{totalSlots} horarios</span>
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
      </div>

      {/* Days */}
      <div className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const selected = hours[key] ?? []
          return (
            <div key={key} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{label}</span>
                  {selected.length > 0 && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {selected.length} horarios
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selected.length > 0 && (
                    <>
                      <button
                        onClick={() => copyToAll(key)}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        title="Copiar a todos los días"
                      >
                        Copiar a todos
                      </button>
                      <span className="text-muted-foreground/40">·</span>
                      <button
                        onClick={() => clearDay(key)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Limpiar
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggle(key, h)}
                    className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                      selected.includes(h)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
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
    </div>
  )
}
