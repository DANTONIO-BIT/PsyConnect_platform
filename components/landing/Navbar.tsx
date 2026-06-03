"use client";
import { useEffect, useState } from "react";

function Logo({ dark = false }: { dark?: boolean }) {
  const ink = dark ? "var(--cream)" : "var(--ink)";
  return (
    <a href="#top" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect x="0.5" y="0.5" width="29" height="29" rx="8" fill={dark ? "var(--cream)" : "var(--ink)"} />
        <path d="M9 21V9.6c0-.3.25-.55.55-.55H15c2.7 0 4.6 1.7 4.6 4.2S17.7 17.4 15 17.4h-3.1V21"
          stroke={dark ? "var(--forest)" : "var(--paper)"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="20.4" cy="20" r="1.5" fill="var(--clay)" />
      </svg>
      <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: 17, letterSpacing: "-0.02em", color: ink }}>PsyConnect</span>
    </a>
  );
}

export { Logo };

export function Navbar({ onMatch }: { onMatch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 24);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { t: "Cómo funciona", h: "#como" },
    { t: "Psicólogos", h: "#psicologos" },
    { t: "Especialidades", h: "#especialidades" },
    { t: "Precios", h: "#precio" },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "all 320ms cubic-bezier(0.16,1,0.3,1)",
      background: scrolled ? "color-mix(in oklab, var(--paper) 82%, transparent)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
    }}>
      <div className="psy-wrap" style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <nav className="psy-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <a key={l.t} href={l.h} style={{ fontSize: 14, color: "var(--ink-2)", textDecoration: "none", fontWeight: 500, transition: "color 180ms" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}>
              {l.t}
            </a>
          ))}
        </nav>
        <div className="psy-nav-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/auth/login" className="psy-btn psy-btn-ghost" style={{ padding: "11px 18px" }}>Iniciar sesión</a>
          <button className="psy-btn psy-btn-primary" style={{ padding: "11px 20px" }} onClick={onMatch}>
            Empieza tu match <span style={{ fontFamily: "var(--font-mono)", transition: "transform 320ms" }}>→</span>
          </button>
        </div>
        <button className="psy-mobile-toggle" onClick={() => setOpen(!open)} aria-label="Menú" style={{
          display: "none", background: "none", border: "1px solid var(--line-strong)", borderRadius: 8, padding: 9, cursor: "pointer",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" stroke="var(--ink)" strokeWidth="1.6" fill="none">
            <path d={open ? "M6 6l12 12M6 18L18 6" : "M3 6h18M3 12h18M3 18h18"} />
          </svg>
        </button>
      </div>
      {open && (
        <div className="psy-wrap" style={{ paddingBottom: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map((l) => (
            <a key={l.t} href={l.h} onClick={() => setOpen(false)}
              style={{ padding: "12px 4px", fontSize: 16, color: "var(--ink-1)", textDecoration: "none", borderTop: "1px solid var(--line)" }}>
              {l.t}
            </a>
          ))}
          <button className="psy-btn psy-btn-primary" style={{ marginTop: 10, width: "100%" }} onClick={() => { setOpen(false); onMatch(); }}>
            Empieza tu match →
          </button>
        </div>
      )}
    </header>
  );
}
