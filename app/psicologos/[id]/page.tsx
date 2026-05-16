import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin, Clock, Globe, GraduationCap,
  CalendarDays, ArrowLeft, Check,
} from "lucide-react"

const DAY_LABELS: Record<string, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mié",
  thursday: "Jue", friday: "Vie", saturday: "Sáb", sunday: "Dom",
}

export default async function PsicologoPerfilPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: psy } = await supabase
    .from("psychologists")
    .select(`
      id, specialties, bio, experience_years, registration_number,
      session_price_clp, session_price_eur, session_modality,
      languages, available_hours,
      profiles(full_name, avatar_url, country)
    `)
    .eq("id", id)
    .eq("status", "approved")
    .single()

  if (!psy) notFound()

  const name    = psy.profiles?.full_name ?? "—"
  const country = psy.profiles?.country
  const symbol  = country === "CL" ? "$" : "€"
  const price   = country === "CL" ? psy.session_price_clp : psy.session_price_eur
  const currency = country === "CL" ? "CLP" : "EUR"

  const availDays = Object.entries(psy.available_hours ?? {}).filter(
    ([, slots]) => (slots as string[]).length > 0
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <Link
            href="/psicologos"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al directorio
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left / Main ────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Header card */}
            <div className="bg-card border border-border rounded-3xl p-8">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {psy.profiles?.avatar_url ? (
                    <img
                      src={psy.profiles.avatar_url}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">{name[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {psy.experience_years} años de experiencia
                    </span>
                    {psy.session_modality?.includes("online") && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Online
                      </span>
                    )}
                  </div>
                  {psy.registration_number && (
                    <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Nº {psy.registration_number}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {psy.bio && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-3">Sobre mí</h2>
                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                  {psy.bio}
                </p>
              </div>
            )}

            {/* Specialties */}
            {psy.specialties?.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Especialidades</h2>
                <div className="grid grid-cols-2 gap-2">
                  {psy.specialties.map((sp: string) => (
                    <div key={sp} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      {sp}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability preview */}
            {availDays.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="font-semibold text-foreground mb-4">Disponibilidad semanal</h2>
                <div className="space-y-3">
                  {availDays.map(([day, slots]) => (
                    <div key={day} className="flex items-start gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-8 flex-shrink-0 pt-0.5">
                        {DAY_LABELS[day]}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(slots as string[]).slice(0, 8).map((h) => (
                          <span
                            key={h}
                            className="px-2 py-0.5 bg-secondary rounded-lg text-xs text-foreground"
                          >
                            {h}
                          </span>
                        ))}
                        {(slots as string[]).length > 8 && (
                          <span className="text-xs text-muted-foreground py-0.5">
                            +{(slots as string[]).length - 8}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right / Booking ────────────────────── */}
          <div className="space-y-4">
            {/* Booking card */}
            <div className="bg-card border border-border rounded-3xl p-6 sticky top-6">
              <div className="text-center mb-5">
                {price ? (
                  <>
                    <p className="text-3xl font-bold text-foreground">
                      {symbol}{price.toLocaleString("es")}
                    </p>
                    <p className="text-sm text-muted-foreground">{currency} por sesión</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Consultar precio</p>
                )}
              </div>

              <Link
                href={`/dashboard/paciente/agendar?psicologo=${psy.id}`}
                className="block w-full bg-primary hover:bg-accent text-primary-foreground text-center py-3 rounded-full font-medium text-sm transition-colors"
              >
                <CalendarDays className="w-4 h-4 inline mr-2 -mt-0.5" />
                Agendar sesión
              </Link>

              <div className="mt-5 space-y-3 text-sm">
                {[
                  psy.session_modality?.includes("online") && "🌐 Sesión online por videollamada",
                  psy.session_modality?.includes("presential") && "🏢 Atención presencial",
                  "🔒 Sesión 100% confidencial",
                  "📅 Confirmación instantánea",
                ].filter(Boolean).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span>{item as string}</span>
                  </div>
                ))}
              </div>

              {/* Languages */}
              {psy.languages?.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2">
                    Idiomas
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {psy.languages.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-2.5 py-1 bg-secondary text-foreground rounded-full text-xs"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
