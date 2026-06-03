"use client";
import { useEffect, useRef, useState } from "react";

export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }),
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`psy-reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Eyebrow({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <span className={`psy-eyebrow${dark ? " on-dark" : ""}`}>{children}</span>;
}

export function Flag({ c }: { c: string }) {
  const map: Record<string, string> = { CL: "🇨🇱", ES: "🇪🇸" };
  return <span style={{ fontSize: 13 }}>{map[c] || ""}</span>;
}

export function Stars({ value }: { value: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--gold)" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.3 6.2 20.5l1.1-6.5L2.6 9.3l6.5-.9L12 2.5l2.9 5.9 6.5.9-4.7 4.7 1.1 6.5z"/></svg>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", color: "var(--ink-1)", fontWeight: 600 }}>{value.toFixed(1)}</span>
    </span>
  );
}

export function MatchRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOff(c - (pct / 100) * c), 120);
    return () => clearTimeout(t);
  }, [pct, c]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="3" stroke="var(--line)" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="3" stroke="var(--clay)" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: size > 50 ? 16 : 13, color: "var(--ink)" }}>{pct}<span style={{ fontSize: size > 50 ? 9 : 8 }}>%</span></span>
      </div>
    </div>
  );
}

export function IndexMark({ n, label, dark = false }: { n: string; label: string; dark?: boolean }) {
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--t-caption)", letterSpacing: "0.02em", color: dark ? "var(--cream-3)" : "var(--ink-3)" }}>
      {n} <span style={{ opacity: 0.5 }}>/</span> {label}
    </span>
  );
}
