"use client"

import { ShieldCheck, Lock, Calendar } from "lucide-react"

export function TrustSection() {
  const trustFactors = [
    {
      icon: ShieldCheck,
      title: "Psicólogos Certificados",
      description: "Todos nuestros terapeutas son profesionales licenciados con años de experiencia clínica y formación continua.",
    },
    {
      icon: Lock,
      title: "Sesiones Confidenciales",
      description: "Tu privacidad es nuestra prioridad. Todas las sesiones son encriptadas y se realizan en un entorno seguro.",
    },
    {
      icon: Calendar,
      title: "Horarios Flexibles",
      description: "Reserva sesiones en horarios que te convengan, incluyendo tardes y fines de semana. Sin listas de espera.",
    },
  ]

  return (
    <section id="trust" className="bg-card section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Por Qué Elegirnos</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Confianza y Cuidado en Cada Paso
          </h2>
        </div>

        <div className="grid-12">
          {trustFactors.map((factor, index) => {
            const Icon = factor.icon
            return (
              <div
                key={index}
                className="col-span-4 md:col-span-4 lg:col-span-4 bg-background border border-border rounded-3xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{factor.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{factor.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
