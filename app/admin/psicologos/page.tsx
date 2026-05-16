import { createClient } from "@/lib/supabase/server"
import { PsychologistActions } from "./psychologist-actions"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

type Filter = "all" | "pending" | "approved" | "rejected"

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: "Pendiente", class: "bg-amber-100 text-amber-700" },
  approved: { label: "Aprobado", class: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazado", class: "bg-red-100 text-red-700" },
}

export default async function PsicologosPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter }>
}) {
  const { filter = "all" } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("psychologists")
    .select(`
      id, status, specialties, experience_years, registration_number,
      session_price_clp, session_price_eur, created_at,
      profiles(full_name, email, country, avatar_url, phone)
    `)
    .order("created_at", { ascending: false })

  if (filter !== "all") query = query.eq("status", filter)

  const { data: psychologists } = await query

  const filters: { key: Filter; label: string; icon: React.ElementType }[] = [
    { key: "all", label: "Todos", icon: Clock },
    { key: "pending", label: "Pendientes", icon: Clock },
    { key: "approved", label: "Aprobados", icon: CheckCircle2 },
    { key: "rejected", label: "Rechazados", icon: XCircle },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestión de Psicólogos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revisa, aprueba o rechaza las solicitudes de registro profesional
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map(({ key, label }) => (
          <a
            key={key}
            href={`/admin/psicologos${key !== "all" ? `?filter=${key}` : ""}`}
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

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {psychologists && psychologists.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-6 py-3 font-medium">Profesional</th>
                <th className="text-left px-6 py-3 font-medium hidden md:table-cell">País</th>
                <th className="text-left px-6 py-3 font-medium hidden lg:table-cell">Especialidades</th>
                <th className="text-left px-6 py-3 font-medium">Estado</th>
                <th className="text-left px-6 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {psychologists.map((psy: any) => {
                const badge = STATUS_BADGE[psy.status]
                return (
                  <tr key={psy.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary flex-shrink-0">
                          {psy.profiles?.full_name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{psy.profiles?.full_name}</p>
                          <p className="text-xs text-muted-foreground">{psy.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                      {psy.profiles?.country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {psy.specialties?.slice(0, 2).map((sp: string) => (
                          <span key={sp} className="px-2 py-0.5 bg-secondary rounded-full text-xs text-muted-foreground">
                            {sp}
                          </span>
                        ))}
                        {psy.specialties?.length > 2 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{psy.specialties.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <PsychologistActions psychologistId={psy.id} currentStatus={psy.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No hay psicólogos en esta categoría
          </div>
        )}
      </div>
    </div>
  )
}
