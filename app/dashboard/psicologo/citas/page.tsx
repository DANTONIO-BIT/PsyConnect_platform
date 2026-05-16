import { createClient } from "@/lib/supabase/server"
import { CalendarDays } from "lucide-react"

type StatusFilter = "all" | "scheduled" | "confirmed" | "completed" | "cancelled"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Programada",  class: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Confirmada", class: "bg-purple-100 text-purple-700" },
  completed:  { label: "Completada", class: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelada",  class: "bg-red-100 text-red-700" },
  no_show:    { label: "No asistió", class: "bg-gray-100 text-gray-600" },
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",       label: "Todas" },
  { key: "scheduled", label: "Programadas" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "completed", label: "Completadas" },
  { key: "cancelled", label: "Canceladas" },
]

export default async function MisCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: StatusFilter }>
}) {
  const { status = "all" } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from("appointments")
    .select(`
      id, scheduled_at, duration_minutes, status, session_link, notes,
      patient:patients(profiles(full_name, email, avatar_url))
    `)
    .eq("psychologist_id", user?.id ?? "")
    .order("scheduled_at", { ascending: false })

  if (status !== "all") query = query.eq("status", status)

  const { data: appointments } = await query

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Citas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {appointments?.length ?? 0} cita{appointments?.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(({ key, label }) => (
          <a
            key={key}
            href={`/dashboard/psicologo/citas${key !== "all" ? `?status=${key}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              status === key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {appointments && appointments.length > 0 ? (
          appointments.map((apt: any) => {
            const date = new Date(apt.scheduled_at)
            const badge = STATUS_BADGE[apt.status] ?? { label: apt.status, class: "bg-gray-100 text-gray-600" }
            const patientName = apt.patient?.profiles?.full_name ?? "Paciente"
            const isUpcoming = new Date(apt.scheduled_at) > new Date()

            return (
              <div
                key={apt.id}
                className="bg-card border border-border rounded-2xl px-6 py-5 flex items-center gap-5"
              >
                {/* Date block */}
                <div className="flex-shrink-0 w-14 text-center bg-primary/5 rounded-xl p-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {date.toLocaleDateString("es-ES", { month: "short" })}
                  </p>
                  <p className="text-2xl font-bold text-primary leading-none mt-0.5">
                    {date.getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Patient info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-semibold text-primary">
                      {patientName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.patient?.profiles?.email ?? "—"}
                      </p>
                    </div>
                  </div>
                  {apt.notes && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-1">📝 {apt.notes}</p>
                  )}
                </div>

                {/* Duration + status + actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {apt.duration_minutes} min
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                    {badge.label}
                  </span>
                  {isUpcoming && apt.session_link && (
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
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl px-6 py-14 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {status !== "all" ? "No hay citas en esta categoría" : "Aún no tienes citas registradas"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
