import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Search, MapPin, Star, Clock } from "lucide-react"

const SPECIALTIES = [
  "Ansiedad", "Depresión", "Estrés", "Autoestima", "Terapia de Pareja",
  "Terapia Familiar", "Psicología Adolescente", "Duelo y Pérdida",
  "Trauma y PTSD", "TOC", "Mindfulness",
]

interface SearchParams {
  q?: string
  especialidad?: string
  pais?: string
  modalidad?: string
}

export default async function DirectorioPsicologos({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, especialidad, pais, modalidad } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("psychologists")
    .select(`
      id, specialties, bio, experience_years,
      session_price_clp, session_price_eur,
      session_modality, languages,
      profiles(full_name, avatar_url, country, city)
    `)
    .eq("status", "approved")
    .order("experience_years", { ascending: false })

  if (pais)       query = query.eq("profiles.country", pais)
  if (especialidad) query = query.contains("specialties", [especialidad])
  if (modalidad)  query = query.contains("session_modality", [modalidad])

  const { data: psychologists } = await query

  // Client-side name search filter
  const filtered = q
    ? (psychologists ?? []).filter((p: any) =>
        p.profiles?.full_name?.toLowerCase().includes(q.toLowerCase())
      )
    : (psychologists ?? [])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <div className="bg-gradient-to-br from-background to-secondary border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide mb-3">
            Directorio de psicólogos
          </p>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Encuentra tu psicólogo ideal
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Profesionales verificados en Chile y España listos para acompañarte
          </p>

          {/* Search bar */}
          <form className="relative max-w-lg mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nombre..."
              className="w-full h-12 pl-11 pr-4 rounded-full border border-border bg-card text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </form>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-52 flex-shrink-0 hidden md:block">
          <form className="space-y-6 sticky top-8">
            {/* País */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">País</p>
              <div className="space-y-1">
                {[
                  { value: "", label: "Todos" },
                  { value: "CL", label: "🇨🇱 Chile" },
                  { value: "ES", label: "🇪🇸 España" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="pais"
                      value={value}
                      defaultChecked={pais === value || (!pais && value === "")}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Modalidad */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Modalidad</p>
              <div className="space-y-1">
                {[
                  { value: "", label: "Todas" },
                  { value: "online", label: "🌐 Online" },
                  { value: "presential", label: "🏢 Presencial" },
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="modalidad"
                      value={value}
                      defaultChecked={modalidad === value || (!modalidad && value === "")}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Especialidad */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">Especialidad</p>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="especialidad"
                    value=""
                    defaultChecked={!especialidad}
                    className="accent-primary"
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Todas</span>
                </label>
                {SPECIALTIES.map((sp) => (
                  <label key={sp} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="especialidad"
                      value={sp}
                      defaultChecked={especialidad === sp}
                      className="accent-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                      {sp}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-full py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Aplicar filtros
            </button>
          </form>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-5">
            {filtered.length} psicólogo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            {q && ` para "${q}"`}
          </p>

          <div className="space-y-4">
            {filtered.length > 0 ? (
              filtered.map((psy: any) => (
                <PsychologistCard key={psy.id} psy={psy} />
              ))
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No se encontraron psicólogos</p>
                <p className="text-sm mt-1">Prueba con otros filtros</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Card Component ───────────────────────────────────────────
function PsychologistCard({ psy }: { psy: any }) {
  const name    = psy.profiles?.full_name ?? "—"
  const country = psy.profiles?.country
  const price   = country === "CL" ? psy.session_price_clp : psy.session_price_eur
  const currency = country === "CL" ? "CLP" : "EUR"
  const symbol   = country === "CL" ? "$" : "€"

  return (
    <Link
      href={`/psicologos/${psy.id}`}
      className="block bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
          {psy.profiles?.avatar_url ? (
            <img
              src={psy.profiles.avatar_url}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-primary">{name[0]}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {name}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {country === "CL" ? "Chile" : "España"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {psy.experience_years} año{psy.experience_years !== 1 ? "s" : ""}
                </span>
                {psy.session_modality?.includes("online") && (
                  <span>🌐 Online</span>
                )}
              </div>
            </div>
            {price && (
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-foreground">
                  {symbol}{price.toLocaleString("es")}
                </p>
                <p className="text-xs text-muted-foreground">{currency} / sesión</p>
              </div>
            )}
          </div>

          {/* Bio snippet */}
          {psy.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{psy.bio}</p>
          )}

          {/* Specialties */}
          {psy.specialties?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {psy.specialties.slice(0, 4).map((sp: string) => (
                <span
                  key={sp}
                  className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                >
                  {sp}
                </span>
              ))}
              {psy.specialties.length > 4 && (
                <span className="px-2.5 py-0.5 text-xs text-muted-foreground">
                  +{psy.specialties.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
