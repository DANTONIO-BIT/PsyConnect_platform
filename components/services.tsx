"use client"

import { Brain, Heart, Users, Sparkles, Shield, Video } from "lucide-react"

export function Services() {
  const services = [
    {
      icon: Brain,
      title: "Terapia Individual",
      description: "Sesiones personalizadas para abordar ansiedad, depresión, estrés y más.",
    },
    {
      icon: Heart,
      title: "Terapia de Pareja",
      description: "Mejora la comunicación y fortalece los vínculos con tu pareja.",
    },
    {
      icon: Users,
      title: "Terapia Familiar",
      description: "Navega las dinámicas familiares y construye relaciones más saludables.",
    },
    {
      icon: Sparkles,
      title: "Psicología Adolescente",
      description: "Apoyo especializado para adolescentes con desafíos académicos, sociales o emocionales.",
    },
    {
      icon: Shield,
      title: "Autoestima",
      description: "Desarrolla confianza y una imagen positiva de ti mismo mediante técnicas terapéuticas guiadas.",
    },
    {
      icon: Video,
      title: "Sesiones Online",
      description: "Accede a terapia profesional desde la comodidad de tu hogar por videollamada segura.",
    },
  ]

  return (
    <section id="services" className="bg-card section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Nuestros Servicios</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Apoyo Integral en Salud Mental
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Ofrecemos una variedad de servicios psicológicos diseñados para apoyar tu bienestar emocional y crecimiento personal.
          </p>
        </div>

        <div className="grid-12 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="col-span-4 md:col-span-4 lg:col-span-4 bg-background border border-border rounded-3xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
