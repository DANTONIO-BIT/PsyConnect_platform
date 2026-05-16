import { createClient } from "@/lib/supabase/server"
import { UserCheck, Users, CalendarDays, Clock, TrendingUp, AlertCircle } from "lucide-react"

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sub?: string
}) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
    </div>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const supabase = await createClient()

  // Parallel queries
  const [
    { count: totalPsychologists },
    { count: pendingPsychologists },
    { count: totalPatients },
    { count: totalAppointments },
    { count: todayAppointments },
    { data: recentPsychologists },
  ] = await Promise.all([
    supabase.from("psychologists").select("*", { count: "exact", head: true }),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("scheduled_at", new Date().toISOString().split("T")[0])
      .lt("scheduled_at", new Date(Date.now() + 86400000).toISOString().split("T")[0]),
    supabase
      .from("psychologists")
      .select("id, status, created_at, profiles(full_name, email, country)")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Pending alert */}
      {(pendingPsychologists ?? 0) > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{pendingPsychologists}</strong> psicólogo{pendingPsychologists !== 1 ? "s" : ""} pendiente{pendingPsychologists !== 1 ? "s" : ""} de revisión.{" "}
            <a href="/admin/psicologos?filter=pending" className="underline font-medium">Revisar ahora →</a>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Psicólogos activos"
          value={totalPsychologists ?? 0}
          icon={UserCheck}
          color="bg-primary"
          sub={`${pendingPsychologists ?? 0} pendientes`}
        />
        <StatCard
          label="Pacientes registrados"
          value={totalPatients ?? 0}
          icon={Users}
          color="bg-accent"
        />
        <StatCard
          label="Citas totales"
          value={totalAppointments ?? 0}
          icon={CalendarDays}
          color="bg-primary"
        />
        <StatCard
          label="Citas hoy"
          value={todayAppointments ?? 0}
          icon={Clock}
          color="bg-accent"
        />
      </div>

      {/* Recent pending registrations */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Solicitudes recientes de psicólogos</h2>
          <a href="/admin/psicologos" className="text-sm text-primary hover:underline">Ver todas →</a>
        </div>

        {recentPsychologists && recentPsychologists.length > 0 ? (
          <div className="divide-y divide-border">
            {recentPsychologists.map((psy: any) => (
              <div key={psy.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center text-sm font-medium text-foreground">
                    {psy.profiles?.full_name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{psy.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{psy.profiles?.email} · {psy.profiles?.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                    Pendiente
                  </span>
                  <a
                    href={`/admin/psicologos/${psy.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Revisar
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            No hay solicitudes pendientes
          </div>
        )}
      </div>
    </div>
  )
}
