import { createClient } from "@/lib/supabase/server"
import { CalendarDays } from "lucide-react"
import Link from "next/link"

type Filter = "all" | "upcoming" | "completed" | "cancelled"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Programada",  class: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Confirmada", class: "bg-purple-100 text-purple-700" },
  completed:  { label: "Completada", class: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelada",  class: "bg-red-100 text-red-700" },
  no_show:    { label: "No asistió", class: "bg-gray-100 text-gray-600" },
}

export default async function PacienteCitasPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter }>
}) {
  const { filter = "all" } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from("appointments")
    .select(`
      id, scheduled_at, duration_minutes, status, session_link,
      psychologist:psychologists(
        profiles(full_name, avatar_url),
        specialties
      )
    `)
    .eq("patient_id", user?.id ?? "")
    .order("scheduled_at", { ascending: false })

  if (filter === "upcoming")  query = query.in("status", ["scheduled", "confirmed"]).gte("scheduled_at", new Date().toISOString())
  if (filter === "completed") query = query.eq("status", "completed")
  if (filter === "cancelled") query = query.in("status", ["cancelled", "no_show"])

  const { data: appointments } = await query

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all",       label: "Todas" },
    { key: "upcoming",  label: "Próximas" },
    { key: "completed", label: "Completadas" },
    { key: "cancelled", label: "Canceladas" },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Citas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Historial de tus sesiones de psicología
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {FILTERS.map(({ key, label }) => (
          <a
            key={key}
            href={`/dashboard/paciente/citas${key !== "all" ? `?filter=${key}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === key
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
            const date    = new Date(apt.scheduled_at)
            const badge   = STATUS_BADGE[apt.status] ?? { label: apt.status, class: "bg-gray-100 text-gray-600" }
            const psyName = apt.psychologist?.profiles?.full_name ?? "Psicólogo"
            const isUpcoming = new Date(apt.scheduled_at) > new Date()

            return (
              <div
                key={apt.id}
                className="bg-card border border-border rounded-2xl px-6 py-5 flex items-center gap-5"
              >
                {/* Date */}
                <div className="w-14 flex-shrink-0 text-center bg-primary/5 rounded-xl p-2">
                  <p className="text-xs text-muted-foreground uppercase">
                    {date.toLocaleDateString("es-ES", { month: "short" })}
                  </p>
                  <p className="text-2xl font-bold text-primary leading-none mt-0.5">
                    {date.getDate()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Psychologist info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                    {psyName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{psyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {apt.psychologist?.specialties?.[0] ?? "Psicología"} · {apt.duration_minutes} min
                    </p>
                  </div>
                </div>

                {/* Status + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
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
                  {apt.status === "completed" && (
                    <Link
                      href={`/psicologos/${apt.psychologist?.id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      Volver a agendar
                    </Link>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-card border border-border rounded-2xl px-6 py-14 text-center">
            <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {filter !== "all" ? "No hay citas en esta categoría" : "Aún no tienes citas"}
            </p>
            <Link
              href="/dashboard/paciente/agendar"
              className="text-sm text-primary hover:underline"
            >
              Agendar mi primera sesión →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
