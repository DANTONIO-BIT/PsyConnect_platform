import { createClient } from "@/lib/supabase/server"
import { CalendarDays } from "lucide-react"

type StatusFilter = "all" | "scheduled" | "confirmed" | "completed" | "cancelled"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  scheduled: { label: "Programada", class: "bg-blue-100 text-blue-700" },
  confirmed: { label: "Confirmada", class: "bg-purple-100 text-purple-700" },
  completed: { label: "Completada", class: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelada", class: "bg-red-100 text-red-700" },
  no_show: { label: "No asistió", class: "bg-gray-100 text-gray-600" },
}

export default async function CitasPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: StatusFilter }>
}) {
  const { status = "all" } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("appointments")
    .select(`
      id, scheduled_at, duration_minutes, status, session_link, created_at,
      psychologist:psychologists(profiles(full_name)),
      patient:patients(profiles(full_name))
    `)
    .order("scheduled_at", { ascending: false })
    .limit(100)

  if (status !== "all") query = query.eq("status", status)

  const { data: appointments } = await query

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Todas" },
    { key: "scheduled", label: "Programadas" },
    { key: "confirmed", label: "Confirmadas" },
    { key: "completed", label: "Completadas" },
    { key: "cancelled", label: "Canceladas" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Citas y Sesiones</h1>
        <p className="text-muted-foreground text-sm mt-1">Historial y estado de todas las sesiones</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label }) => (
          <a
            key={key}
            href={`/admin/citas${key !== "all" ? `?status=${key}` : ""}`}
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

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {appointments && appointments.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Fecha y hora</th>
                <th className="text-left px-6 py-3 font-medium">Paciente</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">Psicólogo</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Duración</th>
                <th className="text-left px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {appointments.map((apt: any) => {
                const badge = STATUS_BADGE[apt.status] ?? { label: apt.status, class: "bg-gray-100 text-gray-600" }
                const date = new Date(apt.scheduled_at)
                return (
                  <tr key={apt.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">
                            {date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {apt.patient?.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {apt.psychologist?.profiles?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                      {apt.duration_minutes} min
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay citas en esta categoría
          </div>
        )}
      </div>
    </div>
  )
}
