import { createClient } from "@/lib/supabase/server"
import { CalendarDays, Users, CheckCircle2, TrendingUp, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  scheduled:  { label: "Programada", class: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Confirmada",  class: "bg-purple-100 text-purple-700" },
  completed:  { label: "Completada",  class: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelada",   class: "bg-red-100 text-red-700" },
  no_show:    { label: "No asistió",  class: "bg-gray-100 text-gray-600" },
}

export default async function PsicologoDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Profile + psychologist data
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, country")
    .eq("id", user?.id ?? "")
    .single()

  const { data: psyData } = await supabase
    .from("psychologists")
    .select("status, specialties, session_price_clp, session_price_eur")
    .eq("id", user?.id ?? "")
    .single()

  // Stats
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

  const [
    { count: totalPatients },
    { count: completedSessions },
    { count: todaySessions },
    { data: upcomingAppointments },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("patient_id", { count: "exact", head: true })
      .eq("psychologist_id", user?.id ?? ""),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user?.id ?? "")
      .eq("status", "completed"),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("psychologist_id", user?.id ?? "")
      .gte("scheduled_at", todayStart)
      .lt("scheduled_at", todayEnd),
    supabase
      .from("appointments")
      .select(`
        id, scheduled_at, duration_minutes, status, session_link,
        patient:patients(profiles(full_name, avatar_url))
      `)
      .eq("psychologist_id", user?.id ?? "")
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(5),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? "Psicólogo"
  const hour = now.getHours()
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches"

  // Status badge for pending approval
  const isPending = psyData?.status === "pending"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{greeting},</p>
          <h1 className="text-2xl font-bold text-foreground mt-0.5">
            {profile?.full_name ?? "—"}
          </h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      {/* Pending alert */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">Cuenta en revisión</p>
          <p className="text-sm text-amber-700">
            Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos por email en 24–48 horas.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sesiones hoy",      value: todaySessions ?? 0,    icon: Clock,         color: "bg-primary" },
          { label: "Pacientes totales",  value: totalPatients ?? 0,    icon: Users,         color: "bg-accent" },
          { label: "Sesiones completadas", value: completedSessions ?? 0, icon: CheckCircle2, color: "bg-primary" },
          { label: "Especialidades",     value: psyData?.specialties?.length ?? 0, icon: TrendingUp, color: "bg-accent" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Próximas citas</h2>
          </div>
          <Link
            href="/dashboard/psicologo/citas"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingAppointments && upcomingAppointments.length > 0 ? (
          <div className="divide-y divide-border">
            {upcomingAppointments.map((apt: any) => {
              const date = new Date(apt.scheduled_at)
              const badge = STATUS_BADGE[apt.status]
              const patientName = apt.patient?.profiles?.full_name ?? "Paciente"
              const initial = patientName[0]

              return (
                <div key={apt.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                    {initial}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{patientName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                      {" · "}
                      {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      {" · "}
                      {apt.duration_minutes} min
                    </p>
                  </div>

                  {/* Status + link */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                      {badge.label}
                    </span>
                    {apt.session_link && (
                      <a
                        href={apt.session_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full hover:bg-accent transition-colors"
                      >
                        Unirse →
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tienes citas próximas</p>
          </div>
        )}
      </div>

      {/* Quick info card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Mis especialidades</h3>
          {psyData?.specialties?.length ? (
            <div className="flex flex-wrap gap-2">
              {psyData.specialties.map((sp: string) => (
                <span key={sp} className="px-2.5 py-1 bg-primary/10 text-primary rounded-full text-xs">
                  {sp}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin especialidades registradas</p>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-foreground text-sm mb-3">Precio por sesión</h3>
          <div className="space-y-2">
            {psyData?.session_price_clp && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">🇨🇱 Chile</span>
                <span className="text-sm font-semibold text-foreground">
                  ${psyData.session_price_clp.toLocaleString("es-CL")} CLP
                </span>
              </div>
            )}
            {psyData?.session_price_eur && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">🇪🇸 España</span>
                <span className="text-sm font-semibold text-foreground">
                  €{psyData.session_price_eur} EUR
                </span>
              </div>
            )}
            {!psyData?.session_price_clp && !psyData?.session_price_eur && (
              <p className="text-sm text-muted-foreground">Sin precio configurado</p>
            )}
          </div>
          <Link
            href="/dashboard/psicologo/perfil"
            className="text-xs text-primary hover:underline mt-3 inline-block"
          >
            Editar perfil →
          </Link>
        </div>
      </div>
    </div>
  )
}
