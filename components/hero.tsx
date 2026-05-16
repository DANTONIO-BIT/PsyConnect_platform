"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Hero() {
  const handleBookSession = () => {
    const bookingSection = document.getElementById("booking")
    bookingSection?.scrollIntoView({ behavior: "smooth" })
  }

  const handleMeetTherapists = () => {
    const therapistsSection = document.getElementById("therapists")
    therapistsSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-secondary section-padding">
      <div className="container-main">
        <div className="grid-12 items-center">
          {/* Left Content */}
          <div className="col-span-4 md:col-span-8 lg:col-span-6 flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              Psicología online que te ayuda a recuperar el equilibrio emocional
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Terapia profesional, confidencial y compasiva desde cualquier lugar. Conecta con psicólogos certificados que entienden tus necesidades.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={handleBookSession}
                size="lg"
                className="bg-primary hover:bg-accent text-primary-foreground text-base rounded-full px-8"
              >
                Reserva tu primera sesión
              </Button>
              <Button
                onClick={handleMeetTherapists}
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 bg-transparent rounded-full px-8"
              >
                Conoce a nuestros psicólogos
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="col-span-4 md:col-span-8 lg:col-span-6 relative aspect-[4/5] max-w-md mx-auto lg:max-w-none">
            <div className="absolute inset-3 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl"></div>
            <div className="absolute inset-3 bg-secondary rounded-3xl shadow-xl overflow-hidden">
              <Image
                src="/images/hero.jpg"
                alt="Online therapy session with psychologist"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
