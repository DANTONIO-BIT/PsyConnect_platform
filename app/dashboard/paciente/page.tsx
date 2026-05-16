import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { CalendarDays, Search, ArrowRight, Clock } from "lucide-react"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Programada",  class: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "Confirmada", class: "bg-purple-100 text-purple-700" },
  completed:  { label: "Completada", class: "bg-green-100 text-green-700" },
  cancelled:  { label: "Cancelada",  class: "bg-red-100 text-red-700" },
  no_show:    { label: "No asistió", class: "bg-gray-100 text-gray-600" },
}

export default async function PacienteDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, country")
    .eq("id", user?.id ?? "")
    .single()

  const now = new Date()

  const [{ data: upcoming }, { count: totalSessions }] = await Promise.all([
    supabase
      .from("appointments")
      .select(`
        id, scheduled_at, duration_minutes, status, session_link,
        psychologist:psychologists(
          profiles(full_name, avatar_url),
          specialties, session_price_clp, session_price_eur
        )
      `)
      .eq("patient_id", user?.id ?? "")
      .in("status", ["scheduled", "confirmed"])
      .gte("scheduled_at", now.toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(3),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", user?.id ?? "")
      .eq("status", "completed"),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? "allí"
  const hour = now.getHours()
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches"

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h1 className="text-2xl font-bold text-foreground mt-0.5">{profile?.full_name ?? "—"}</h1>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/paciente/agendar"
          className="bg-primary text-primary-foreground rounded-2xl p-5 flex items-center gap-3 hover:bg-accent transition-colors group"
        >
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Agendar sesión</p>
            <p className="text-xs opacity-80">Encuentra un psicólogo</p>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto opacity-60 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/paciente/citas"
          className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3 hover:border-primary/30 transition-colors group"
        >
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">Mis citas</p>
            <p className="text-xs text-muted-foreground">{totalSessions ?? 0} completadas</p>
          </div>
          <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Upcoming */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Próximas sesiones</h2>
          </div>
          <Link href="/dashboard/paciente/citas" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcoming && upcoming.length > 0 ? (
          <div className="divide-y divide-border">
            {upcoming.map((apt: any) => {
              const date = new Date(apt.scheduled_at)
              const badge = STATUS_BADGE[apt.status]
              const psyName = apt.psychologist?.profiles?.full_name ?? "Psicólogo"

              return (
                <div key={apt.id} className="px-6 py-4 flex items-center gap-4">
                  {/* Date block */}
                  <div className="w-12 text-center flex-shrink-0 bg-primary/5 rounded-xl p-2">
                    <p className="text-xs text-muted-foreground uppercase">
                      {date.toLocaleDateString("es-ES", { month: "short" })}
                    </p>
                    <p className="text-xl font-bold text-primary leading-none mt-0.5">
                      {date.getDate()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>

                  {/* Psychologist */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                      {psyName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{psyName}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.psychologist?.specialties?.[0] ?? "Psicología"} · {apt.duration_minutes} min
                      </p>
                    </div>
                  </div>

                  {/* Badge + join */}
                  <div className="flex items-center gap-2 flex-shrink-0">
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
            <CalendarDays className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No tienes sesiones próximas</p>
            <Link
              href="/dashboard/paciente/agendar"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Search className="w-3.5 h-3.5" /> Buscar un psicólogo
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
