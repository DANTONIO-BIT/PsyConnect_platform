"use client";
import { useMemo, useState } from "react";
import { topics, genders, times, psicologos, matchScore, priceLabel, type Psicologo } from "./data";
import { Reveal, Flag, Stars, MatchRing, IndexMark } from "./ui";

function Segmented({ options, value, onChange }: { options: { id: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: "10px 16px", borderRadius: "var(--r-pill)", fontSize: 14, fontWeight: 500,
          border: "1px solid", transition: "all 180ms cubic-bezier(0.16,1,0.3,1)", cursor: "pointer",
          borderColor: value === o.id ? "var(--ink)" : "var(--line-strong)",
          background: value === o.id ? "var(--ink)" : "transparent",
          color: value === o.id ? "var(--paper)" : "var(--ink-1)",
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function PrefRow({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBlock: 22, borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>{hint}</span>
      </div>
      {children}
    </div>
  );
}

function ResultCard({ psy, ans, i }: { psy: Psicologo; ans: { topics: string[]; language: string; gender: string; time: string }; i: number }) {
  const pct = matchScore(psy, ans);
  const p = priceLabel(psy.price);
  return (
    <Reveal delay={i * 90}>
      <div className="psy-card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ width: 66, height: 82, borderRadius: 11, overflow: "hidden", flexShrink: 0, background: "var(--paper-2)" }}>
            <img src={psy.photo} alt={psy.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.1 }}>{psy.name}</span>
              <Flag c={psy.country} />
            </div>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <Stars value={psy.rating} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>· {psy.approach}</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
              {psy.specialties.slice(0, 3).map((s) => (
                <span key={s} className="psy-tag">{s}</span>
              ))}
            </div>
          </div>
          <MatchRing pct={pct} size={52} />
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: 0 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Sesión 50 min · desde</span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--ink)" }}>{psy.country === "ES" ? p.eur : p.clp}</span>
          </div>
          <a href="/auth/signup" className="psy-btn psy-btn-primary" style={{ padding: "11px 18px", fontSize: 13.5 }}>Reservar · {psy.next}</a>
        </div>
      </div>
    </Reveal>
  );
}

export function Match() {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<string[]>([]);
  const [lang, setLang] = useState("any");
  const [gender, setGender] = useState("any");
  const [time, setTime] = useState("any");

  const ans = { topics: sel, language: lang, gender, time };
  const ranked = useMemo(() =>
    [...psicologos].map(p => ({ p, s: matchScore(p, ans) })).sort((a, b) => b.s - a.s).map(x => x.p),
    [sel, lang, gender, time]
  );

  const toggle = (id: string) => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const reset = () => { setStep(0); setSel([]); setLang("any"); setGender("any"); setTime("any"); };

  const langOpts = [{ id: "any", label: "Indiferente" }, ...["Español","Inglés","Francés"].map(l => ({ id: l, label: l }))];

  return (
    <section id="match" style={{ background: "var(--forest)", color: "var(--cream-2)", position: "relative", paddingBlock: "clamp(64px,9vw,136px)", scrollMarginTop: 80 }}>
      <div className="psy-wrap">
        <div className="psy-match-layout">
          {/* Left rail */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <IndexMark n="02" label="Match" dark />
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", color: "var(--cream)", maxWidth: "11ch", margin: 0 }}>
              Tres preguntas. Tu psicólogo <em style={{ color: "var(--clay)", fontStyle: "italic" }}>ideal.</em>
            </h2>
            <p style={{ fontSize: "var(--t-body-l)", color: "var(--cream-2)", lineHeight: "var(--lh-body)", maxWidth: "40ch" }}>
              Nuestro sistema cruza tu motivo de consulta con el enfoque, idioma y disponibilidad de cada profesional para ordenarlos por afinidad real.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
              {["Cuéntanos qué buscas", "Ajusta tus preferencias", "Conoce a tus mejores matches"].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: step === i ? 1 : 0.5, transition: "opacity 320ms" }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--forest-line)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: step >= i ? "var(--clay)" : "var(--cream-3)", background: step === i ? "var(--clay-soft)" : "transparent" }}>{i + 1}</span>
                  <span style={{ fontSize: 14, color: step >= i ? "var(--cream)" : "var(--cream-3)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Panel */}
          <div className="psy-card" style={{ borderRadius: "var(--r-4)", boxShadow: "var(--shadow-lift)", overflow: "hidden", alignSelf: "start" }}>
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)" }}>
                {step < 2 ? `Paso ${step + 1} de 3` : "Tus resultados"}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: i === step ? 26 : 8, height: 6, borderRadius: 4, background: i <= step ? "var(--clay)" : "var(--line)", transition: "all 320ms cubic-bezier(0.16,1,0.3,1)" }} />
                ))}
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--t-h3)", color: "var(--ink)" }}>¿Qué te gustaría trabajar?</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Elige una o varias. No tiene que ser perfecto.</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                    {topics.map((t) => (
                      <button key={t.id} className="psy-chip" data-on={sel.includes(t.id) ? "true" : "false"} onClick={() => toggle(t.id)}>
                        {sel.includes(t.id) && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>✓</span>}
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <button className="psy-btn psy-btn-primary" style={{ width: "100%", marginTop: 8, opacity: sel.length ? 1 : 0.4, cursor: sel.length ? "pointer" : "not-allowed" }}
                    disabled={!sel.length} onClick={() => setStep(1)}>
                    Continuar {sel.length ? `· ${sel.length} seleccionado${sel.length > 1 ? "s" : ""}` : ""} <span className="psy-arrow">→</span>
                  </button>
                </div>
              )}

              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 4 }}>
                    <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--t-h3)", color: "var(--ink)" }}>Tus preferencias</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Todo opcional — déjalo en &ldquo;indiferente&rdquo; si te da igual.</span>
                  </div>
                  <PrefRow label="Idioma de la sesión" hint="En qué idioma prefieres hablar">
                    <Segmented options={langOpts} value={lang} onChange={setLang} />
                  </PrefRow>
                  <PrefRow label="Profesional" hint="¿Te sientes más cómodo/a con alguien en concreto?">
                    <Segmented options={genders} value={gender} onChange={setGender} />
                  </PrefRow>
                  <PrefRow label="Horario" hint="Cuándo te encaja mejor conectarte">
                    <Segmented options={times} value={time} onChange={setTime} />
                  </PrefRow>
                  <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                    <button className="psy-btn psy-btn-ghost" onClick={() => setStep(0)} style={{ padding: "14px 20px" }}>← Atrás</button>
                    <button className="psy-btn psy-btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>Ver mis matches <span className="psy-arrow">→</span></button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--t-h3)", color: "var(--ink)" }}>{ranked.length} profesionales para ti</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Ordenados por afinidad con tus respuestas</span>
                    </div>
                    <button onClick={reset} style={{ background: "none", border: "1px solid var(--line-strong)", borderRadius: 999, padding: "7px 13px", fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)", cursor: "pointer" }}>↺ Reempezar</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {ranked.slice(0, 3).map((p, i) => <ResultCard key={p.id} psy={p} ans={ans} i={i} />)}
                  </div>
                  <a href="#psicologos" className="psy-btn psy-btn-ghost" style={{ width: "100%", marginTop: 2, textAlign: "center" }}>Ver todo el equipo</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
