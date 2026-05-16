import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Plus, Calendar, TrendingUp, AlertTriangle } from "lucide-react"

const RECORD_TYPE_LABELS: Record<string, string> = {
  session_note: "Nota de Sesión",
  assessment: "Evaluación",
  treatment_plan: "Plan de Tratamiento",
  progress_note: "Nota de Progreso",
}

const RISK_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
}

const RISK_LABELS: Record<string, string> = {
  low: "Bajo",
  medium: "Moderado",
  high: "Alto",
  critical: "Crítico",
}

export default async function PatientFichaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get patient info
  const { data: patient } = await supabase
    .from("patients")
    .select(`
      id, date_of_birth, emergency_contact, notes, created_at,
      profiles(full_name, email, phone, country, avatar_url)
    `)
    .eq("id", id)
    .single()

  if (!patient) notFound()

  // Get records for this patient
  const { data: records } = await supabase
    .from("patient_records")
    .select("*")
    .eq("patient_id", id)
    .eq("psychologist_id", user?.id ?? "")
    .order("session_date", { ascending: false })

  // Get appointments for this patient
  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_at, status, notes")
    .eq("patient_id", id)
    .eq("psychologist_id", user?.id ?? "")
    .order("scheduled_at", { ascending: false })
    .limit(5)

  const profile = patient.profiles
  const age = patient.date_of_birth
    ? Math.floor((Date.now() - new Date(patient.date_of_birth).getTime()) / 365.25 / 24 / 60 / 60 / 1000)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/psicologo/citas"
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ficha del Paciente</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{profile?.full_name}</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              profile?.full_name?.[0] ?? "?"
            )}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{profile?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{profile?.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Edad</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{age ? `${age} años` : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">País</p>
              <p className="text-sm font-medium text-foreground mt-0.5">{patient.country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}</p>
            </div>
          </div>
        </div>
        {patient.emergency_contact && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Contacto de Emergencia</p>
            <p className="text-sm font-medium text-foreground mt-0.5">{patient.emergency_contact}</p>
          </div>
        )}
        {patient.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Notas Generales</p>
            <p className="text-sm text-foreground mt-1">{patient.notes}</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{records?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Registros clínicos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{appointments?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Sesiones totales</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {records && records.length > 0
                  ? (records.reduce((sum: number, r: any) => sum + (r.mood_score || 0), 0) / records.filter((r: any) => r.mood_score).length).toFixed(1)
                  : "—"}
              </p>
              <p className="text-xs text-muted-foreground">Estado de ánimo promedio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Records */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Historial Clínico</h2>
          <Link
            href={`/dashboard/psicologo/pacientes/${id}/nuevo-registro`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo registro
          </Link>
        </div>

        {records && records.length > 0 ? (
          <div className="divide-y divide-border">
            {records.map((record: any) => (
              <div key={record.id} className="px-6 py-5 hover:bg-secondary/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{record.title}</span>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                        {RECORD_TYPE_LABELS[record.record_type] ?? record.record_type}
                      </span>
                      {record.risk_level && (
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${RISK_COLORS[record.risk_level]}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {RISK_LABELS[record.risk_level]}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{record.content}</p>
                    {record.next_steps && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <strong>Siguientes pasos:</strong> {record.next_steps}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    {record.mood_score && (
                      <div className="text-center mb-1">
                        <p className="text-lg font-bold text-primary">{record.mood_score}</p>
                        <p className="text-xs text-muted-foreground">/10</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.session_date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-14 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay registros clínicos aún</p>
            <Link
              href={`/dashboard/psicologo/pacientes/${id}/nuevo-registro`}
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              Crear primer registro →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Appointments */}
      {appointments && appointments.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Últimas Citas</h2>
          </div>
          <div className="divide-y divide-border">
            {appointments.map((apt: any) => (
              <div key={apt.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(apt.scheduled_at).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                    {" "} a las {" "}
                    {new Date(apt.scheduled_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {apt.notes && <p className="text-xs text-muted-foreground mt-0.5">📝 {apt.notes}</p>}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  apt.status === "completed" ? "bg-green-100 text-green-700" :
                  apt.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                  apt.status === "confirmed" ? "bg-purple-100 text-purple-700" :
                  apt.status === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {apt.status === "completed" ? "Completada" :
                   apt.status === "scheduled" ? "Programada" :
                   apt.status === "confirmed" ? "Confirmada" :
                   apt.status === "cancelled" ? "Cancelada" : "No asistió"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
