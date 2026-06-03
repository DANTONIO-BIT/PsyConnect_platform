"use client";
import { steps, psicologos, especialidades, testimonios, stats } from "./data";
import { priceLabel } from "./data";
import { Reveal, Eyebrow, Flag, Stars, IndexMark } from "./ui";
import { Logo } from "./Navbar";

export function HowItWorks() {
  const icons = [
    <path key={0} d="M4 5h16v10H8l-4 4V5z" />,
    <path key={1} d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z" />,
    <path key={2} d="M5 12l5 5L20 7" />,
    <g key={3}><rect x="3" y="6" width="12" height="12" rx="2" /><path d="M15 10l6-3v10l-6-3" /></g>,
  ];
  return (
    <section id="como" style={{ paddingBlock: "clamp(64px,9vw,136px)", scrollMarginTop: 70 }}>
      <div className="psy-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Reveal><IndexMark n="03" label="Cómo funciona" /></Reveal>
            <Reveal delay={60}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "15ch", margin: 0, color: "var(--ink)" }}>
                De la primera duda a tu primera sesión.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <p style={{ fontSize: "var(--t-body-l)", color: "var(--ink-2)", lineHeight: "var(--lh-body)", maxWidth: "34ch" }}>
              Diseñado para que dar el paso sea lo más simple posible. Sin descargas, sin papeleo, sin esperas largas.
            </p>
          </Reveal>
        </div>
        <div className="psy-steps-grid">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 80}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 24, borderTop: "1px solid var(--line)", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--clay)", letterSpacing: "0.04em" }}>{s.n}</span>
                  <span style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid var(--line-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink-1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{icons[i]}</svg>
                  </span>
                </div>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "var(--t-h3)", color: "var(--ink)", margin: 0 }}>{s.t}</h3>
                <p style={{ fontSize: 15, color: "var(--ink-2)", margin: 0 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Psicologos() {
  return (
    <section id="psicologos" style={{ background: "var(--paper-2)", paddingBlock: "clamp(64px,9vw,136px)", scrollMarginTop: 70 }}>
      <div className="psy-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <Reveal><IndexMark n="04" label="El equipo" /></Reveal>
            <Reveal delay={60}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "13ch", margin: 0, color: "var(--ink)" }}>
                Profesionales reales, <em style={{ color: "var(--clay-deep)" }}>verificados</em> uno a uno.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <a href="#match" className="psy-btn psy-btn-ghost psy-btn-lg">Encuentra tu match →</a>
          </Reveal>
        </div>
        <div className="psy-psy-grid">
          {psicologos.map((p, i) => {
            const pr = priceLabel(p.price);
            return (
              <Reveal key={p.id} delay={i * 70}>
                <article className="psy-card" style={{ overflow: "hidden" }}>
                  <div style={{ aspectRatio: "1/1", position: "relative", overflow: "hidden", background: "var(--paper-2)" }}>
                    <img src={p.photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(1.02)" }} />
                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                      {p.modality.map((m) => <span key={m} className="psy-tag" style={{ background: "color-mix(in oklab, var(--card) 88%, transparent)", backdropFilter: "blur(6px)" }}>{m}</span>)}
                    </div>
                    <div style={{ position: "absolute", bottom: 12, right: 12 }}>
                      <span className="psy-tag" style={{ background: "color-mix(in oklab, var(--sage) 92%, white)", color: "#fff", borderColor: "transparent", fontWeight: 600 }}>● {p.next}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: 21, color: "var(--ink)", letterSpacing: "-0.01em", lineHeight: 1.12 }}>{p.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)" }}>{p.title} <Flag c={p.country} /></span>
                      </div>
                      <Stars value={p.rating} />
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-2)", minHeight: 44, margin: 0 }}>{p.bio}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.specialties.slice(0, 3).map((s) => <span key={s} className="psy-tag">{s}</span>)}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="1.6"><path d="M5 8h14M5 12h14M5 16h9" /></svg>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)" }}>{p.languages.join(" · ")}</span>
                    </div>
                    <hr style={{ border: 0, borderTop: "1px solid var(--line)", marginBlock: 4 }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>Sesión 50 min · desde</span>
                        <span style={{ fontFamily: "var(--font-serif)", fontSize: 21, color: "var(--ink)" }}>{p.country === "ES" ? pr.eur : pr.clp}</span>
                      </div>
                      <a href="/auth/signup" className="psy-btn psy-btn-dark" style={{ padding: "11px 18px" }}>Ver perfil <span className="psy-arrow">→</span></a>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Especialidades() {
  return (
    <section id="especialidades" style={{ paddingBlock: "clamp(64px,9vw,136px)", scrollMarginTop: 70 }}>
      <div className="psy-wrap">
        <div className="psy-esp-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Reveal><IndexMark n="05" label="Especialidades" /></Reveal>
            <Reveal delay={60}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "12ch", margin: 0, color: "var(--ink)" }}>
                Acompañamiento para lo que estás viviendo.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p style={{ fontSize: "var(--t-body-l)", color: "var(--ink-2)", lineHeight: "var(--lh-body)", maxWidth: "40ch" }}>
                Sea cual sea tu motivo, hay un profesional con la formación específica para acompañarte.
              </p>
            </Reveal>
            <Reveal delay={160}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
                {especialidades.map((e) => (
                  <a key={e} href="#match" className="psy-chip" style={{ textDecoration: "none" }}>{e}</a>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={120} className="psy-esp-media">
            <div style={{ position: "relative", height: "100%" }}>
              <div style={{ borderRadius: "var(--r-4)", overflow: "hidden", height: "100%", minHeight: 360, boxShadow: "var(--shadow-soft)" }}>
                <img src="/assets/spec-1.jpg" alt="Sesión de terapia" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.92) contrast(1.02)" }} />
              </div>
              <div className="psy-card" style={{ position: "absolute", left: -16, bottom: 24, padding: "14px 18px", borderRadius: 14, boxShadow: "var(--shadow-soft)", maxWidth: 230 }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--ink)", lineHeight: 1.3, margin: 0 }}>
                  &ldquo;No sabía ni cómo nombrar lo que sentía. Me ayudaron a empezar por ahí.&rdquo;
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function Confianza() {
  const pillars = [
    { t: "Colegiación verificada", d: "Revisamos título y número de colegiado de cada profesional antes de que aparezca en la plataforma.", icon: "shield" },
    { t: "Videollamada cifrada", d: "Sesiones por enlace seguro con cifrado de extremo a extremo. Sin descargas ni instalaciones.", icon: "lock" },
    { t: "Confidencialidad total", d: "Lo que compartes se queda entre tú y tu psicólogo. Cumplimos RGPD y normativa de salud.", icon: "eye" },
    { t: "Sin permanencia", d: "Pagas por sesión. Cambias de profesional o pausas tu proceso cuando lo necesites.", icon: "calendar" },
  ];
  const ic: Record<string, React.ReactNode> = {
    shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />,
    lock: <g><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></g>,
    eye: <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.5" /></g>,
    calendar: <g><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 9h16M9 3v4M15 3v4" /></g>,
  };
  return (
    <section style={{ background: "var(--paper-2)", paddingBlock: "clamp(64px,9vw,136px)" }}>
      <div className="psy-wrap">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", marginBottom: 56 }}>
          <Reveal><Eyebrow>Por qué confiar en nosotros</Eyebrow></Reveal>
          <Reveal delay={60}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "16ch", margin: 0, color: "var(--ink)" }}>
              La seguridad no es un extra. Es el punto de partida.
            </h2>
          </Reveal>
        </div>
        <div className="psy-trust-grid">
          {pillars.map((p, i) => (
            <Reveal key={p.t} delay={i * 70}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "26px 22px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-4)", height: "100%" }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: "var(--clay-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--clay-deep)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ic[p.icon]}</svg>
                </span>
                <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 18, color: "var(--ink)", margin: 0 }}>{p.t}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0 }}>{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="psy-stats-band">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 60}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px,4vw,52px)", color: "var(--ink)", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.v}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)" }}>{s.l}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Testimonios() {
  return (
    <section style={{ paddingBlock: "clamp(64px,9vw,136px)" }}>
      <div className="psy-wrap">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
          <Reveal><IndexMark n="06" label="Testimonios" /></Reveal>
          <Reveal delay={60}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "16ch", margin: 0, textAlign: "right", color: "var(--ink)" }}>
              Historias de quienes <em style={{ color: "var(--clay-deep)" }}>dieron el paso.</em>
            </h2>
          </Reveal>
        </div>
        <div className="psy-testi-grid">
          {testimonios.map((t, i) => (
            <Reveal key={i} delay={i * 90}>
              <figure style={{ margin: 0, padding: 26, background: "var(--card)", border: "1px solid var(--line)", borderRadius: "var(--r-4)", display: "flex", flexDirection: "column", gap: 20, height: "100%" }}>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 44, color: "var(--clay)", lineHeight: 0.5, height: 22 }}>&ldquo;</span>
                <blockquote style={{ margin: 0, fontFamily: "var(--font-serif)", fontSize: 20, lineHeight: 1.4, color: "var(--ink)", letterSpacing: "-0.01em", flex: 1 }}>
                  {t.quote}
                </blockquote>
                <figcaption style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", background: "var(--paper-2)", flexShrink: 0 }}>
                    <img src={t.photo} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{t.name}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-3)" }}>{t.meta}</span>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Precio({ onMatch }: { onMatch: () => void }) {
  const reassure = [
    "Pagas por sesión, sin cuotas mensuales ni permanencia",
    "Si en la primera sesión no encajas, te ayudamos a cambiar sin coste",
    "Bono de 4 sesiones con descuento si decides continuar",
    "Factura disponible para reembolso de seguro o mutua",
  ];
  const features = ["Videollamada cifrada incluida", "Recordatorios automáticos", "Notas y materiales de tu psicólogo", "Reprogramación gratuita hasta 24 h antes"];
  return (
    <section id="precio" style={{ background: "var(--paper-2)", paddingBlock: "clamp(64px,9vw,136px)", scrollMarginTop: 70 }}>
      <div className="psy-wrap">
        <div className="psy-precio-layout">
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <Reveal><IndexMark n="07" label="Precio" /></Reveal>
            <Reveal delay={60}>
              <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-m)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "13ch", margin: 0, color: "var(--ink)" }}>
                Precio claro. Sin sorpresas, sin letra pequeña.
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 6 }}>
                {reassure.map((r) => (
                  <div key={r} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--sage-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#515c43" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
                    </span>
                    <span style={{ fontSize: 15.5, color: "var(--ink-1)" }}>{r}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <div className="psy-card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-soft)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "28px 28px 22px" }}>
                <span className="psy-tag" style={{ alignSelf: "flex-start", color: "var(--clay-deep)", background: "var(--clay-soft)", borderColor: "transparent" }}>Sesión individual · 50 min</span>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "var(--font-serif)", fontSize: 58, color: "var(--ink)", letterSpacing: "-0.03em", lineHeight: 0.9, whiteSpace: "nowrap" }}>40&nbsp;€</span>
                  <span style={{ color: "var(--ink-2)", paddingBottom: 8 }}>/ $38.000 CLP</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-2)" }}>desde · según profesional y país</span>
              </div>
              <hr style={{ border: 0, borderTop: "1px solid var(--line)", margin: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "22px 28px" }}>
                {features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="1.8"><path d="M5 12l5 5L20 7" /></svg>
                    <span style={{ fontSize: 14.5, color: "var(--ink-1)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "0 28px 28px" }}>
                <button className="psy-btn psy-btn-primary psy-btn-lg" style={{ width: "100%" }} onClick={onMatch}>
                  Empieza tu match <span className="psy-arrow">→</span>
                </button>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", textAlign: "center", marginTop: 12, color: "var(--ink-3)" }}>Sin tarjeta para hacer el match · Pagas solo al reservar</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA({ onMatch }: { onMatch: () => void }) {
  return (
    <section style={{ background: "var(--forest)", color: "var(--cream-2)", position: "relative", paddingBlock: "clamp(72px,10vw,140px)" }}>
      <div className="psy-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 28 }}>
        <Reveal><Eyebrow dark>Empieza hoy</Eyebrow></Reveal>
        <Reveal delay={60}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontSize: "var(--t-display-l)", lineHeight: "var(--lh-display)", letterSpacing: "var(--track-display)", maxWidth: "16ch", margin: "0 auto", color: "var(--cream)" }}>
            Tu primera sesión puede ser <em style={{ color: "var(--clay)" }}>esta semana.</em>
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p style={{ fontSize: "var(--t-body-l)", color: "var(--cream-2)", lineHeight: "var(--lh-body)", maxWidth: "46ch", margin: "0 auto" }}>
            No tienes que tenerlo todo claro para empezar. Solo responde tres preguntas — del resto nos encargamos nosotros.
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 6 }}>
            <button className="psy-btn psy-btn-lg" style={{ background: "var(--cream)", color: "var(--forest)" }} onClick={onMatch}>
              Empieza tu match <span className="psy-arrow">→</span>
            </button>
            <a href="#psicologos" className="psy-btn psy-btn-lg" style={{ background: "transparent", color: "var(--cream)", border: "1px solid var(--forest-line)" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--cream)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--forest-line)")}>
              Conoce al equipo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const cols = [
    { h: "Plataforma",         links: ["Cómo funciona", "Psicólogos", "Especialidades", "Precios"] },
    { h: "Para profesionales", links: ["Únete como psicólogo", "Verificación", "Recursos"] },
    { h: "Soporte",            links: ["Centro de ayuda", "Contacto", "Urgencias"] },
    { h: "Legal",              links: ["Privacidad (RGPD)", "Términos", "Cookies"] },
  ];
  return (
    <footer style={{ background: "var(--forest)", color: "var(--cream-2)", paddingTop: 72, paddingBottom: 36, borderTop: "1px solid var(--forest-line)" }}>
      <div className="psy-wrap">
        <div className="psy-footer-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 280 }}>
            <Logo dark />
            <p style={{ fontSize: 14, color: "var(--cream-3)", margin: 0 }}>
              Psicología online colegiada para Chile y España. Terapia profesional, confidencial y cercana, desde donde estés.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {["CL","ES"].map((c) => (
                <span key={c} className="psy-tag" style={{ background: "var(--forest-2)", borderColor: "var(--forest-line)", color: "var(--cream-2)" }}>
                  {c === "CL" ? "🇨🇱" : "🇪🇸"} {c === "CL" ? "Chile" : "España"}
                </span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--cream-3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{c.h}</span>
              {c.links.map((l) => (
                <a key={l} href="#" style={{ fontSize: 14, color: "var(--cream-2)", textDecoration: "none", transition: "color 180ms" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cream)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--cream-2)")}>
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <hr style={{ border: 0, borderTop: "1px solid var(--forest-line)", marginBlock: 32 }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--cream-3)" }}>© 2026 PsyConnect — Todos los derechos reservados</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--cream-3)" }}>
            Si estás en crisis, llama al <span style={{ color: "var(--cream)" }}>*4141</span> (CL) o <span style={{ color: "var(--cream)" }}>024</span> (ES)
          </span>
        </div>
      </div>
    </footer>
  );
}
