import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { PsychologistActions } from "../psychologist-actions"
import {
  ArrowLeft, MapPin, Clock, Globe, GraduationCap,
  FileText, Mail, Phone, Check, CalendarDays,
} from "lucide-react"

const DAY_LABELS: Record<string, string> = {
  monday: "Lunes", tuesday: "Martes", wednesday: "Miércoles",
  thursday: "Jueves", friday: "Viernes", saturday: "Sábado", sunday: "Domingo",
}

const STATUS_STYLE: Record<string, { label: string; class: string }> = {
  pending:  { label: "Pendiente de revisión", class: "bg-amber-100 text-amber-700 border-amber-200" },
  approved: { label: "Aprobado",              class: "bg-green-100 text-green-700 border-green-200" },
  rejected: { label: "Rechazado",             class: "bg-red-100 text-red-700 border-red-200" },
}

export default async function AdminPsicologoDetalle({
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
      languages, available_hours, documents_urls,
      status, rejection_reason, created_at,
      profiles(full_name, email, avatar_url, country, phone, created_at)
    `)
    .eq("id", id)
    .single()

  if (!psy) notFound()

  const profile = psy.profiles as any
  const name    = profile?.full_name ?? "—"
  const country = profile?.country
  const statusStyle = STATUS_STYLE[psy.status] ?? STATUS_STYLE.pending

  const availDays = Object.entries(psy.available_hours ?? {}).filter(
    ([, slots]) => (slots as string[]).length > 0
  )

  // Appointment count for this psychologist
  const { count: totalAppointments } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("psychologist_id", id)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/psicologos"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a psicólogos
        </Link>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusStyle.class}`}>
          {statusStyle.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main info ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Header card */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0 overflow-hidden">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                  : name[0]
                }
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-foreground">{name}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />{profile?.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />{profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {country === "CL" ? "🇨🇱 Chile" : "🇪🇸 España"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />{psy.experience_years} años de exp.
                  </span>
                </div>
                {psy.registration_number && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    {country === "ES" ? "Colegiado" : "Minsal / SMA"} Nº {psy.registration_number}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Registro: {new Date(psy.created_at).toLocaleDateString("es-ES", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {psy.bio && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-3">Descripción profesional</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{psy.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {psy.specialties?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4">Especialidades</h2>
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

          {/* Availability */}
          {availDays.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" /> Disponibilidad semanal
              </h2>
              <div className="space-y-3">
                {availDays.map(([day, slots]) => (
                  <div key={day} className="flex items-start gap-3">
                    <span className="text-xs font-medium text-muted-foreground w-20 flex-shrink-0 pt-0.5">
                      {DAY_LABELS[day]}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(slots as string[]).map((h) => (
                        <span key={h} className="px-2 py-0.5 bg-secondary rounded-lg text-xs text-foreground">
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {psy.documents_urls?.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-semibold text-foreground text-sm mb-4">Documentos adjuntos</h2>
              <div className="space-y-2">
                {psy.documents_urls.map((url: string, i: number) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-secondary rounded-xl hover:bg-primary/5 transition-colors group"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-foreground truncate">
                      Documento {i + 1}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Rejection reason */}
          {psy.status === "rejected" && psy.rejection_reason && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-red-800 mb-1">Motivo de rechazo</p>
              <p className="text-sm text-red-700">{psy.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ────────────────────────────── */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Acciones</h2>
            <PsychologistActions psychologistId={id} currentStatus={psy.status} />
          </div>

          {/* Stats */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Estadísticas</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Citas registradas</span>
                <span className="font-medium text-foreground">{totalAppointments ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Idiomas</span>
                <span className="font-medium text-foreground">{psy.languages?.join(", ") || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modalidad</span>
                <span className="font-medium text-foreground">
                  {psy.session_modality?.map((m: string) => (
                    { online: "Online", presential: "Presencial", both: "Ambas" }[m] ?? m
                  )).join(", ") || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Prices */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h2 className="font-semibold text-foreground text-sm">Precios</h2>
            <div className="space-y-2 text-sm">
              {psy.session_price_clp && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🇨🇱 CLP</span>
                  <span className="font-medium text-foreground">
                    ${psy.session_price_clp.toLocaleString("es-CL")}
                  </span>
                </div>
              )}
              {psy.session_price_eur && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">🇪🇸 EUR</span>
                  <span className="font-medium text-foreground">€{psy.session_price_eur}</span>
                </div>
              )}
              {!psy.session_price_clp && !psy.session_price_eur && (
                <p className="text-muted-foreground">Sin precio configurado</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
