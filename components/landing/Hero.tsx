"use client";
import { Reveal, Eyebrow } from "./ui";

export function Hero({ onMatch }: { onMatch: () => void }) {
  const avatars = ["/assets/testi-1.jpg", "/assets/psy-ana.jpg", "/assets/testi-2.jpg"];
  return (
    <section id="top" style={{ paddingTop: 132, paddingBottom: 0, position: "relative" }}>
      <div className="psy-wrap">
        <div className="psy-hero-grid">
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingBottom: 80 }}>
            <Reveal><Eyebrow>Psicología online · Chile &amp; España</Eyebrow></Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-l)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", color: "var(--ink)", maxWidth: "13ch", margin: 0 }}>
                Encuentra al psicólogo que <em style={{ color: "var(--clay-deep)", fontStyle: "italic" }}>de verdad</em> encaja contigo.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p style={{ fontSize: "var(--t-body-l)", color: "var(--ink-2)", lineHeight: "var(--lh-body)", maxWidth: "44ch", margin: 0 }}>
                Sin formularios eternos ni listas infinitas. Responde tres preguntas y te presentamos profesionales colegiados con afinidad real a lo que necesitas.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <button className="psy-btn psy-btn-primary psy-btn-lg" onClick={onMatch}>
                  Empieza tu match <span className="psy-arrow">→</span>
                </button>
                <a href="#psicologos" className="psy-btn psy-btn-ghost psy-btn-lg">Ver psicólogos</a>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginTop: 6 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", letterSpacing: "0.02em", color: "var(--ink-3)" }}>Sesión 50 min · desde</span>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 24, color: "var(--ink)", letterSpacing: "-0.02em" }}>
                    40 € <span style={{ color: "var(--ink-3)", fontSize: 18 }}>/</span> $38.000
                  </span>
                </div>
                <div style={{ width: 1, height: 40, background: "var(--line)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", marginRight: 4 }}>
                    {avatars.map((src, i) => (
                      <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", overflow: "hidden", border: "2px solid var(--paper)", marginLeft: i ? -10 : 0, background: "var(--paper-2)" }}>
                        <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", letterSpacing: "0.02em", color: "var(--ink-2)" }}>+1.200 personas<br />ya empezaron</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Right — image */}
          <Reveal delay={140} className="psy-hero-media">
            <div style={{ position: "relative", width: "100%" }}>
              <div style={{ position: "absolute", inset: "18px -18px -18px 18px", background: "var(--clay-soft)", borderRadius: "var(--r-4)", zIndex: 0 }} />
              <div style={{ position: "relative", zIndex: 1, borderRadius: "var(--r-4)", aspectRatio: "4/5", overflow: "hidden", boxShadow: "var(--shadow-lift)" }}>
                <img src="/assets/hero.jpg" alt="Sesión de terapia online" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(1.02)" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 55%, rgba(28,36,30,0.34))" }} />
              </div>
              <div className="psy-card" style={{ position: "absolute", zIndex: 2, left: -18, bottom: 38, padding: "13px 16px", borderRadius: 14, boxShadow: "var(--shadow-soft)", display: "flex", gap: 11, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--sage-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#515c43" strokeWidth="1.8"><path d="M20 6 9 17l-5-5" /></svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Colegiados y verificados</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Título y nº de colegiado revisados</span>
                </div>
              </div>
              <div className="psy-card" style={{ position: "absolute", zIndex: 2, right: -14, top: 30, padding: "12px 15px", borderRadius: 14, boxShadow: "var(--shadow-soft)", display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sage)", boxShadow: "0 0 0 4px var(--sage-soft)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Próxima cita</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>Hoy · 18:00</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Trust marquee */}
      <div style={{ marginTop: 8, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", paddingBlock: 18, background: "var(--card-2)" }}>
        <div className="psy-marquee">
          <div className="psy-marquee-track">
            {[...Array(2)].flatMap((_, k) =>
              ["Colegiados y verificados", "Videollamada cifrada de extremo a extremo", "Sin permanencia", "Cambia de profesional cuando quieras", "Confidencialidad garantizada", "Chile 🇨🇱 & España 🇪🇸"].map((t, i) => (
                <span key={`${k}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-2)", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--clay)" }}>✳</span> {t}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
