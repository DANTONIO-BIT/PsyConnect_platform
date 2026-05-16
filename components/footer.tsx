"use client"

import Link from "next/link"
import { Brain } from "lucide-react"

const year = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-[#3D4335] text-white py-16">
      <div className="container-main">
        <div className="grid-12 gap-6 mb-12">

          {/* Brand */}
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">PsyConnect</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Centro de psicología online con profesionales verificados en Chile y España.
              Terapia confidencial desde cualquier lugar.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { label: "🇨🇱 Chile", sub: "psyconnect.cl" },
                { label: "🇪🇸 España", sub: "psyconnect.es" },
              ].map(({ label, sub }) => (
                <div key={sub} className="bg-white/10 rounded-xl px-3 py-2 text-xs">
                  <p className="font-medium">{label}</p>
                  <p className="text-white/50 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Plataforma */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:col-start-6">
            <h4 className="font-semibold text-sm mb-4 text-white/90">Plataforma</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                { label: "Buscar psicólogos",  href: "/psicologos" },
                { label: "Cómo funciona",      href: "/#how-it-works" },
                { label: "Crear cuenta",       href: "/auth/signup" },
                { label: "Iniciar sesión",     href: "/auth/login" },
                { label: "Únete como psicólogo", href: "/registro-psicologo" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Especialidades */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h4 className="font-semibold text-sm mb-4 text-white/90">Especialidades</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              {[
                "Ansiedad", "Depresión", "Estrés",
                "Terapia de Pareja", "Psicología Adolescente", "Mindfulness",
              ].map((sp) => (
                <li key={sp}>
                  <Link
                    href={`/psicologos?especialidad=${encodeURIComponent(sp)}`}
                    className="hover:text-primary transition-colors"
                  >
                    {sp}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div className="col-span-4 md:col-span-8 lg:col-span-2">
            <h4 className="font-semibold text-sm mb-4 text-white/90">Contacto</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li>
                <a href="mailto:hola@psyconnect.com" className="hover:text-primary transition-colors">
                  hola@psyconnect.com
                </a>
              </li>
              <li className="text-white/40">Lun–Vie: 9:00 – 20:00</li>
              <li className="text-white/40">Sáb: 10:00 – 15:00</li>
            </ul>

            <div className="mt-5">
              <h4 className="font-semibold text-sm mb-3 text-white/90">Síguenos</h4>
              <div className="flex gap-3">
                {[
                  { label: "IG", href: "#" },
                  { label: "LI", href: "#" },
                  { label: "TW", href: "#" },
                ].map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className="w-8 h-8 bg-white/10 hover:bg-primary rounded-lg flex items-center justify-center text-xs font-semibold transition-colors"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {year} PsyConnect. Todos los derechos reservados.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-primary transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Términos de uso</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
