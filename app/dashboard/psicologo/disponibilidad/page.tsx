"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, Clock, Grid3X3, Sparkles } from "lucide-react"
import type { AvailableHours, WeekDay } from "@/types/database"

const DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: "monday",    label: "Lunes",     short: "Lun" },
  { key: "tuesday",   label: "Martes",    short: "Mar" },
  { key: "wednesday", label: "Miércoles", short: "Mié" },
  { key: "thursday",  label: "Jueves",    short: "Jue" },
  { key: "friday",    label: "Viernes",   short: "Vie" },
  { key: "saturday",  label: "Sábado",    short: "Sáb" },
  { key: "sunday",    label: "Domingo",   short: "Dom" },
]

const HOURS = Array.from({ length: 30 }, (_, i) => {
  const totalMins = 7 * 60 + i * 30
  const h = Math.floor(totalMins / 60)
  const m = totalMins % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
})

const PRESETS = [
  { label: "Lun–Vie 9:00–18:00", icon: "🕘", apply: (): AvailableHours => {
    const result: AvailableHours = {}
    const workHours = HOURS.filter(t => t >= "09:00" && t < "18:00")
    const days: WeekDay[] = ["monday","tuesday","wednesday","thursday","friday"]
    days.forEach(d => { result[d] = [...workHours] })
    result.saturday = []
    result.sunday = []
    return result
  }},
  { label: "Lun–Vie 9:00–13:00", icon: "🌅", apply: (): AvailableHours => {
    const result: AvailableHours = {}
    const morning = HOURS.filter(t => t >= "09:00" && t < "13:00")
    const days: WeekDay[] = ["monday","tuesday","wednesday","thursday","friday"]
    days.forEach(d => { result[d] = [...morning] })
    result.saturday = []
    result.sunday = []
    return result
  }},
  { label: "Lun–Vie 14:00–20:00", icon: "🌇", apply: (): AvailableHours => {
    const result: AvailableHours = {}
    const afternoon = HOURS.filter(t => t >= "14:00" && t < "20:00")
    const days: WeekDay[] = ["monday","tuesday","wednesday","thursday","friday"]
    days.forEach(d => { result[d] = [...afternoon] })
    result.saturday = []
    result.sunday = []
    return result
  }},
  { label: "Lun–Sáb 9:00–13:00", icon: "📅", apply: (): AvailableHours => {
    const result: AvailableHours = {}
    const morning = HOURS.filter(t => t >= "09:00" && t < "13:00")
    const days: WeekDay[] = ["monday","tuesday","wednesday","thursday","friday","saturday"]
    days.forEach(d => { result[d] = [...morning] })
    result.sunday = []
    return result
  }},
]

const DEFAULT_PRESET = PRESETS[0].apply()

export default function DisponibilidadPage() {
  const [hours, setHours] = useState<AvailableHours>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<"add" | "remove" | null>(null)
  const dragStart = useRef<{ day: WeekDay; hour: string } | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      if (data?.available_hours && Object.keys(data.available_hours).length > 0) {
        setHours(data.available_hours as AvailableHours)
      } else {
        // First time — apply default preset
        setHours(DEFAULT_PRESET)
      }
      setLoading(false)
    }
    load()
  }, [])

  const isSelected = (day: WeekDay, hour: string): boolean => {
    return (hours[day] ?? []).includes(hour)
  }

  const toggle = (day: WeekDay, hour: string) => {
    const current = hours[day] ?? []
    const updated = current.includes(hour)
      ? current.filter((h) => h !== hour)
      : [...current, hour].sort()
    setHours((prev) => ({ ...prev, [day]: updated }))
    setSaved(false)
  }

  const setRange = (startDay: WeekDay, startHour: string, endDay: WeekDay, endHour: string, value: boolean) => {
    const dayKeys = DAYS.map(d => d.key)
    const startDayIdx = dayKeys.indexOf(startDay)
    const endDayIdx = dayKeys.indexOf(endDay)
    const hourIdx = HOURS.indexOf(startHour)
    const endHourIdx = HOURS.indexOf(endHour)

    const minDay = Math.min(startDayIdx, endDayIdx)
    const maxDay = Math.max(startDayIdx, endDayIdx)
    const minHour = Math.min(hourIdx, endHourIdx)
    const maxHour = Math.max(hourIdx, endHourIdx)

    setHours((prev) => {
      const next = { ...prev }
      for (let di = minDay; di <= maxDay; di++) {
        const day = dayKeys[di]
        const current = [...(next[day] ?? [])]
        for (let hi = minHour; hi <= maxHour; hi++) {
          const hour = HOURS[hi]
          if (value && !current.includes(hour)) {
            current.push(hour)
          } else if (!value) {
            const idx = current.indexOf(hour)
            if (idx >= 0) current.splice(idx, 1)
          }
        }
        next[day] = current.sort()
      }
      return next
    })
    setSaved(false)
  }

  const handleMouseDown = (day: WeekDay, hour: string) => {
    const selected = isSelected(day, hour)
    setIsDragging(true)
    setDragMode(selected ? "remove" : "add")
    dragStart.current = { day, hour }
  }

  const handleMouseEnter = (day: WeekDay, hour: string) => {
    if (!isDragging || !dragMode || !dragStart.current) return
    setRange(dragStart.current.day, dragStart.current.hour, day, hour, dragMode === "add")
  }

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragMode(null)
    dragStart.current = null
  }, [])

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseUp])

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setHours(preset.apply())
    setSaved(false)
  }

  const clearAll = () => {
    const cleared: AvailableHours = {}
    DAYS.forEach(d => { cleared[d.key] = [] })
    setHours(cleared)
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
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Disponibilidad</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Haz clic y arrastra para seleccionar tus horarios de atención
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

      {/* Presets */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Configuración rápida</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <span>{preset.icon}</span>
              {preset.label}
            </button>
          ))}
          <button
            onClick={clearAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:border-destructive/50 hover:text-destructive transition-all"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Scrollable container */}
        <div ref={gridRef} className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
              <div className="p-3 text-xs font-medium text-muted-foreground text-center border-r border-border/50">
                Hora
              </div>
              {DAYS.map(({ short }) => (
                <div key={short} className="p-3 text-xs font-semibold text-foreground text-center border-r border-border/50 last:border-r-0">
                  {short}
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-border/30 last:border-b-0 hover:bg-secondary/20 transition-colors">
                {/* Time label */}
                <div className="p-2 text-xs font-mono text-muted-foreground text-center border-r border-border/50 flex items-center justify-center bg-secondary/30">
                  {hour}
                </div>
                {/* Day cells */}
                {DAYS.map(({ key }) => {
                  const selected = isSelected(key, hour)
                  return (
                    <button
                      key={`${key}-${hour}`}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); handleMouseDown(key, hour) }}
                      onMouseEnter={() => handleMouseEnter(key, hour)}
                      className={`border-r border-border/30 last:border-r-0 transition-colors cursor-pointer ${
                        selected
                          ? "bg-primary/80 hover:bg-primary"
                          : "hover:bg-primary/10"
                      }`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary/80 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-card border border-border rounded" />
          <span>No disponible</span>
        </div>
        <span className="ml-auto">Clic + arrastrar para seleccionar rangos</span>
      </div>
    </div>
  )
}
