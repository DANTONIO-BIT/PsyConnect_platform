import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { UserCheck, Users, CalendarDays, TrendingUp, AlertCircle, DollarSign, Clock } from "lucide-react"

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
    { count: approvedPsychologists },
    { count: totalPatients },
    { count: totalAppointments },
    { count: completedAppointments },
    { count: todayAppointments },
    { data: recentPsychologists },
    { data: recentAppointments },
  ] = await Promise.all([
    supabase.from("psychologists").select("*", { count: "exact", head: true }),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("psychologists").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("patients").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "completed"),
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
    supabase
      .from("appointments")
      .select(`
        id, scheduled_at, status,
        patient:patients(profiles(full_name)),
        psychologist:psychologists(profiles(full_name))
      `)
      .order("scheduled_at", { ascending: false })
      .limit(5),
  ])

  // Estimate revenue (completed appointments × avg price)
  const completedCount = completedAppointments ?? 0
  const estimatedRevenue = completedCount * 45000 // CLP avg

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
            <Link href="/admin/psicologos?filter=pending" className="underline font-medium">Revisar ahora →</Link>
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Psicólogos activos"
          value={approvedPsychologists ?? 0}
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
          label="Citas completadas"
          value={completedCount}
          icon={CalendarDays}
          color="bg-primary"
          sub={`de ${totalAppointments ?? 0} totales`}
        />
        <StatCard
          label="Ingresos estimados"
          value={`$${(estimatedRevenue / 1000).toLocaleString("es")}k`}
          icon={DollarSign}
          color="bg-success"
          sub="CLP (estimado)"
        />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Citas hoy"
          value={todayAppointments ?? 0}
          icon={Clock}
          color="bg-accent"
        />
        <StatCard
          label="Tasa de ocupación"
          value={totalAppointments && totalAppointments > 0
            ? `${Math.round((completedCount / totalAppointments) * 100)}%`
            : "0%"}
          icon={TrendingUp}
          color="bg-primary"
        />
        <StatCard
          label="Psicólogos totales"
          value={totalPsychologists ?? 0}
          icon={UserCheck}
          color="bg-accent"
        />
      </div>

      {/* Recent pending registrations */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Solicitudes recientes de psicólogos</h2>
          <Link href="/admin/psicologos" className="text-sm text-primary hover:underline">Ver todas →</Link>
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
                  <Link
                    href={`/admin/psicologos/${psy.id}`}
                    className="text-sm text-primary hover:underline"
                  >
                    Revisar
                  </Link>
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

      {/* Recent appointments */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Citas recientes</h2>
          <Link href="/admin/citas" className="text-sm text-primary hover:underline">Ver todas →</Link>
        </div>

        {recentAppointments && recentAppointments.length > 0 ? (
          <div className="divide-y divide-border">
            {recentAppointments.map((apt: any) => {
              const statusColors: Record<string, string> = {
                scheduled: "bg-blue-100 text-blue-700",
                confirmed: "bg-purple-100 text-purple-700",
                completed: "bg-green-100 text-green-700",
                cancelled: "bg-red-100 text-red-700",
                no_show: "bg-gray-100 text-gray-600",
              }
              const statusLabels: Record<string, string> = {
                scheduled: "Programada",
                confirmed: "Confirmada",
                completed: "Completada",
                cancelled: "Cancelada",
                no_show: "No asistió",
              }
              return (
                <div key={apt.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {apt.patient?.profiles?.full_name?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{apt.patient?.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        con {apt.psychologist?.profiles?.full_name} · {new Date(apt.scheduled_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[apt.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {statusLabels[apt.status] ?? apt.status}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            No hay citas registradas
          </div>
        )}
      </div>
    </div>
  )
}
