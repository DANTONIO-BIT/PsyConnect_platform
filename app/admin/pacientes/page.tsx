import { createClient } from "@/lib/supabase/server"
import { Search, UserCircle } from "lucide-react"

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("patients")
    .select(`
      id, created_at,
      profiles(full_name, email, country, phone),
      assigned_psychologist:psychologists(
        profiles(full_name)
      ),
      appointments(count)
    `)
    .order("created_at", { ascending: false })

  if (q) {
    query = query.ilike("profiles.full_name", `%${q}%`)
  }

  const { data: patients } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {patients?.length ?? 0} pacientes registrados
          </p>
        </div>
      </div>

      {/* Search */}
      <form className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="w-full h-10 pl-9 pr-4 rounded-xl border border-input bg-card text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {patients && patients.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Paciente</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">País</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Psicólogo asignado</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Sesiones</th>
                <th className="text-left px-6 py-3 font-medium">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {patients.map((patient: any) => (
                <tr key={patient.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{patient.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{patient.profiles?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                    {patient.profiles?.country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                    {patient.assigned_psychologist?.profiles?.full_name ?? (
                      <span className="italic text-muted-foreground/60">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-muted-foreground">
                    {patient.appointments?.[0]?.count ?? 0}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(patient.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {q ? `No se encontraron pacientes para "${q}"` : "No hay pacientes registrados aún"}
          </div>
        )}
      </div>
    </div>
  )
}
