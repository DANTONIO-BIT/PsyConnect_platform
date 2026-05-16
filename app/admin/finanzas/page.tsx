import { createClient } from "@/lib/supabase/server"
import { DollarSign, TrendingUp, CalendarDays, CreditCard, ArrowUpRight, ArrowDownRight } from "lucide-react"

// ─── Stat Card ────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  sub,
  trend,
}: {
  label: string
  value: number | string
  icon: React.ElementType
  color: string
  sub?: string
  trend?: { value: string; positive: boolean }
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
    {trend && (
      <div className={`flex items-center gap-1 mt-3 text-xs ${trend.positive ? "text-green-600" : "text-red-600"}`}>
        {trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend.value}
      </div>
    )}
  </div>
)

// ─── Page ─────────────────────────────────────────────────────
export default async function AdminFinancePage() {
  const supabase = await createClient()

  const AVG_SESSION_PRICE = 45000 // CLP

  // Appointments stats
  const [
    { count: totalAppointments },
    { count: completedAppointments },
    { count: cancelledAppointments },
    { count: pendingAppointments },
  ] = await Promise.all([
    supabase.from("appointments").select("*", { count: "exact", head: true }),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "cancelled"),
    supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
  ])

  // Revenue calculations
  const completedCount = completedAppointments ?? 0
  const cancelledCount = cancelledAppointments ?? 0
  const totalRevenue = completedCount * AVG_SESSION_PRICE
  const lostRevenue = cancelledCount * AVG_SESSION_PRICE
  const pendingRevenue = (pendingAppointments ?? 0) * AVG_SESSION_PRICE

  // Completion rate
  const completionRate = totalAppointments && totalAppointments > 0
    ? Math.round((completedCount / totalAppointments) * 100)
    : 0

  // Revenue by psychologist
  const { data: revenueByPsychologist } = await supabase
    .from("appointments")
    .select(`
      psychologist:psychologists(
        profiles(full_name, email)
      ),
      status
    `)
    .eq("status", "completed")

  const psychologistRevenue: Record<string, { count: number; revenue: number }> = {}
  revenueByPsychologist?.forEach((apt: any) => {
    const name = apt.psychologist?.profiles?.full_name ?? "Sin nombre"
    if (!psychologistRevenue[name]) {
      psychologistRevenue[name] = { count: 0, revenue: 0 }
    }
    psychologistRevenue[name].count++
    psychologistRevenue[name].revenue += AVG_SESSION_PRICE
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
        <p className="text-muted-foreground text-sm mt-1">Dashboard financiero del centro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Ingresos totales"
          value={`$${(totalRevenue / 1000).toLocaleString("es")}k`}
          icon={DollarSign}
          color="bg-success"
          sub="CLP (estimado)"
          trend={{ value: `${completedCount} sesiones completadas`, positive: true }}
        />
        <StatCard
          label="Ingresos pendientes"
          value={`$${(pendingRevenue / 1000).toLocaleString("es")}k`}
          icon={CreditCard}
          color="bg-amber-500"
          sub="Citas programadas"
        />
        <StatCard
          label="Ingresos perdidos"
          value={`$${(lostRevenue / 1000).toLocaleString("es")}k`}
          icon={ArrowDownRight}
          color="bg-destructive"
          sub="Citas canceladas"
        />
        <StatCard
          label="Tasa de completación"
          value={`${completionRate}%`}
          icon={TrendingUp}
          color="bg-primary"
          sub={`de ${totalAppointments ?? 0} citas totales`}
        />
      </div>

      {/* Revenue by psychologist */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Ingresos por psicólogo</h2>
        </div>

        {Object.keys(psychologistRevenue).length > 0 ? (
          <div className="divide-y divide-border">
            {Object.entries(psychologistRevenue)
              .sort(([, a], [, b]) => b.revenue - a.revenue)
              .map(([name, data]) => (
                <div key={name} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{data.count} sesiones completadas</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    ${(data.revenue / 1000).toLocaleString("es")}k CLP
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            No hay datos de ingresos aún
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-2">Nota sobre precios</h3>
        <p className="text-sm text-muted-foreground">
          Los ingresos se calculan usando un precio promedio de <strong>${AVG_SESSION_PRICE.toLocaleString("es")} CLP</strong> por sesión.
          Cuando se configure la tabla <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">payments</code>, los valores serán exactos.
        </p>
      </div>
    </div>
  )
}
