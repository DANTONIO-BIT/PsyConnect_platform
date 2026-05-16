"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Therapists() {
  const therapists = [
    {
      name: "Dra. María García",
      specialty: "Ansiedad y Depresión",
      image: "/images/therapist1.jpg",
    },
    {
      name: "Dr. Javier López",
      specialty: "Terapia de Pareja",
      image: "/images/therapist2.jpg",
    },
    {
      name: "Dra. Sofía Martínez",
      specialty: "Psicología Adolescente",
      image: "/images/therapist3.jpg",
    },
  ]

  return (
    <section id="therapists" className="bg-gradient-to-br from-background to-secondary section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Nuestro Equipo</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Nuestros Psicólogos
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Profesionales compasivos dedicados a tu bienestar emocional.
          </p>
        </div>

        <div className="grid-12 gap-6">
          {therapists.map((therapist, index) => (
            <div
              key={index}
              className="col-span-4 md:col-span-8 lg:col-span-4 bg-card border border-border rounded-3xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Photo */}
              <div className="aspect-[3/4] relative">
                <Image
                  src={therapist.image}
                  alt={therapist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-1">{therapist.name}</h3>
                <p className="text-muted-foreground mb-4">{therapist.specialty}</p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full w-full"
                >
                  Ver perfil
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
