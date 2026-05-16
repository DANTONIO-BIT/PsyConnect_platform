"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function FinalCTA() {
  const handleBookSession = () => {
    const bookingSection = document.getElementById("booking")
    bookingSection?.scrollIntoView({ behavior: "smooth" })
  }

  const trustBadges = [
    "Profesionales certificados",
    "Sesiones seguras online",
    "Apoyo confidencial",
  ]

  return (
    <section id="booking" className="bg-primary section-padding">
      <div className="container-main text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 text-balance">
          Comienza tu camino hacia el bienestar emocional hoy
        </h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Da el primer paso hacia una mente más sana. Nuestro equipo de psicólogos compasivos está listo para acompañarte.
        </p>

        <Button
          onClick={handleBookSession}
          size="lg"
          className="bg-white hover:bg-white/90 text-primary text-base rounded-full px-10 py-6 font-semibold"
        >
          Reserva tu primera sesión
        </Button>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-10">
          {trustBadges.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-foreground/90">
              <div className="w-5 h-5 rounded-full bg-[#8FC439] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
