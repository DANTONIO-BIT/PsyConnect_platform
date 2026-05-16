import { createClient } from "@/lib/supabase/server"
import { Users, UserCheck, CalendarDays, TrendingUp } from "lucide-react"

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
export default async function AdminPatientsPage() {
  const supabase = await createClient()

  // All patients with their assigned psychologist
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      id, created_at,
      profiles(id, full_name, email, country),
      psychologists:assigned_psychologist_id(
        profiles(full_name, email)
      )
    `)
    .order("created_at", { ascending: false })

  // Stats per psychologist
  const { data: psychologists } = await supabase
    .from("psychologists")
    .select(`
      id, status,
      profiles(full_name, email, country),
      patients(count)
    `)
    .eq("status", "approved")

  // Total patients
  const { count: totalPatients } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })

  // Unassigned patients
  const { count: unassignedCount } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .is("assigned_psychologist_id", null)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
        <p className="text-muted-foreground text-sm mt-1">Vista general de pacientes por psicólogo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total pacientes"
          value={totalPatients ?? 0}
          icon={Users}
          color="bg-accent"
        />
        <StatCard
          label="Sin asignar"
          value={unassignedCount ?? 0}
          icon={Users}
          color="bg-amber-500"
          sub="Requieren asignación"
        />
        <StatCard
          label="Psicólogos activos"
          value={psychologists?.length ?? 0}
          icon={UserCheck}
          color="bg-primary"
        />
        <StatCard
          label="Promedio pacientes/psicólogo"
          value={psychologists && psychologists.length > 0
            ? (Math.round((totalPatients ?? 0) / psychologists.length * 10) / 10).toFixed(1)
            : "0"}
          icon={TrendingUp}
          color="bg-primary"
        />
      </div>

      {/* Patients by psychologist */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Pacientes por psicólogo</h2>
        </div>

        {patients && patients.length > 0 ? (
          <div className="divide-y divide-border">
            {patients.map((patient: any) => (
              <div key={patient.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center text-sm font-medium text-accent">
                    {patient.profiles?.full_name?.[0] ?? "P"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{patient.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{patient.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {patient.psychologists?.profiles ? (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Asignado a</p>
                      <p className="text-sm font-medium text-foreground">{patient.psychologists.profiles.full_name}</p>
                    </div>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
                      Sin asignar
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {patient.profiles?.country}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-center text-muted-foreground text-sm">
            No hay pacientes registrados
          </div>
        )}
      </div>

      {/* Psychologist summary */}
      {psychologists && psychologists.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Resumen por psicólogo</h2>
          </div>
          <div className="divide-y divide-border">
            {psychologists.map((psy: any) => (
              <div key={psy.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {psy.profiles?.full_name?.[0] ?? "P"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{psy.profiles?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{psy.profiles?.email} · {psy.profiles?.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {psy.patients?.[0]?.count ?? 0} pacientes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
