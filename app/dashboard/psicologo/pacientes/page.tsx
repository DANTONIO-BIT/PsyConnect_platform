import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Users, Search } from "lucide-react"

export default async function PsicologoPacientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get all patients this psychologist has had appointments with
  const { data: patients } = await supabase
    .from("patients")
    .select(`
      id, created_at, notes,
      profiles(full_name, email, phone, country, avatar_url),
      appointments(count)
    `)
    .or(`assigned_psychologist_id.eq.${user?.id},appointments.psychologist_id.eq.${user?.id}`)

  // Deduplicate by id
  const uniquePatients = patients
    ? Array.from(new Map(patients.map((p: any) => [p.id, p])).values())
    : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mis Pacientes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {uniquePatients.length} paciente{uniquePatients.length !== 1 ? "s" : ""}
        </p>
      </div>

      {uniquePatients.length > 0 ? (
        <div className="space-y-3">
          {uniquePatients.map((patient: any) => {
            const profile = patient.profiles
            const sessionCount = patient.appointments?.[0]?.count ?? 0

            return (
              <Link
                key={patient.id}
                href={`/dashboard/psicologo/pacientes/${patient.id}`}
                className="block bg-card border border-border rounded-2xl px-6 py-5 hover:border-primary/50 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      profile?.full_name?.[0] ?? "?"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {profile?.full_name ?? "Paciente"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                      <span>{profile?.email ?? "—"}</span>
                      <span>{profile?.phone ?? "—"}</span>
                      <span>{profile?.country === "CL" ? "🇨🇱" : "🇪🇸"}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-foreground">{sessionCount}</p>
                    <p className="text-xs text-muted-foreground">sesiones</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl px-6 py-14 text-center">
          <Users className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aún no tienes pacientes asignados</p>
        </div>
      )}
    </div>
  )
}
