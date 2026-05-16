"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const RECORD_TYPES = [
  { value: "session_note", label: "Nota de Sesión" },
  { value: "assessment", label: "Evaluación" },
  { value: "treatment_plan", label: "Plan de Tratamiento" },
  { value: "progress_note", label: "Nota de Progreso" },
]

const RISK_LEVELS = [
  { value: "low", label: "Bajo", color: "bg-green-100 text-green-700" },
  { value: "medium", label: "Moderado", color: "bg-yellow-100 text-yellow-700" },
  { value: "high", label: "Alto", color: "bg-orange-100 text-orange-700" },
  { value: "critical", label: "Crítico", color: "bg-red-100 text-red-700" },
]

export default function NewPatientRecordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const [patientId, setPatientId] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [recordType, setRecordType] = useState("session_note")
  const [moodScore, setMoodScore] = useState<number | null>(null)
  const [riskLevel, setRiskLevel] = useState<string | null>(null)
  const [nextSteps, setNextSteps] = useState("")
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientId || !title || !content) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from("patient_records").insert({
      patient_id: patientId,
      psychologist_id: user?.id,
      session_date: new Date(sessionDate).toISOString(),
      record_type: recordType,
      title,
      content,
      mood_score: moodScore,
      risk_level: riskLevel,
      next_steps: nextSteps || null,
    })

    setSaving(false)
    if (error) {
      alert(`Error: ${error.message}`)
      return
    }
    setDone(true)
  }

  if (done) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Registro creado</h2>
      <p className="text-muted-foreground text-sm">La ficha clínica ha sido guardada exitosamente.</p>
      <Button onClick={() => router.push(`/dashboard/psicologo/pacientes/${patientId}`)} className="bg-primary hover:bg-accent text-primary-foreground rounded-full">
        Volver a la ficha
      </Button>
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Registro Clínico</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Documenta la sesión o evaluación del paciente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5">
        {/* Patient ID */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">ID del Paciente</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="UUID del paciente"
            required
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Session Date */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Fecha de Sesión</label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            required
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Record Type */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Tipo de Registro</label>
          <div className="grid grid-cols-2 gap-2">
            {RECORD_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setRecordType(t.value)}
                className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                  recordType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Sesión 5 — Técnicas de respiración"
            required
            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">Contenido</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe lo ocurrido en la sesión, observaciones, etc."
            required
            rows={6}
            className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        {/* Mood Score */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Estado de Ánimo (1-10) — opcional
          </label>
          <div className="flex gap-1.5">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMoodScore(moodScore === n ? null : n)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  moodScore === n
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-primary/20"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Risk Level */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Nivel de Riesgo — opcional
          </label>
          <div className="flex gap-2">
            {RISK_LEVELS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRiskLevel(riskLevel === r.value ? null : r.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  riskLevel === r.value
                    ? `${r.color} border-current`
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Siguientes Pasos — opcional
          </label>
          <textarea
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="Plan para la próxima sesión, tareas para el paciente, etc."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={saving || !patientId || !title || !content}
          className="w-full bg-primary hover:bg-accent text-primary-foreground rounded-full"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar Registro"}
        </Button>
      </form>
    </div>
  )
}
