"use client"

import Image from "next/image"

export function Specialties() {
  const specialties = [
    {
      title: "Ansiedad",
      description: "Aprende técnicas para manejar la preocupación, ataques de pánico y tensión constante.",
      image: "/images/specialty1.jpg",
    },
    {
      title: "Estrés",
      description: "Desarrolla estrategias saludables para enfrentar la presión laboral y personal.",
      image: "/images/specialty2.jpg",
    },
    {
      title: "Depresión",
      description: "Encuentra apoyo y herramientas para superar el bajo estado de ánimo y recuperar la motivación.",
      image: "/images/specialty3.jpg",
    },
    {
      title: "Autoestima",
      description: "Construye confianza y desarrolla una imagen más saludable de ti mismo.",
      image: "/images/specialty1.jpg",
    },
    {
      title: "Terapia de Pareja",
      description: "Mejora la comunicación y fortalece tus conexiones con los demás.",
      image: "/images/specialty2.jpg",
    },
    {
      title: "Terapia Adolescente",
      description: "Apoyo especializado para adolescentes que navegan el crecimiento y sus desafíos.",
      image: "/images/specialty3.jpg",
    },
  ]

  return (
    <section id="specialties" className="bg-card section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Nuestra Experiencia</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Especialidades
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Nuestro equipo de psicólogos se especializa en una amplia gama de áreas de salud mental para apoyar tus necesidades únicas.
          </p>
        </div>

        <div className="grid-12 gap-6">
          {specialties.map((specialty, index) => (
            <div
              key={index}
              className="col-span-4 md:col-span-4 lg:col-span-4 group bg-background border border-border rounded-3xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square relative">
                <Image
                  src={specialty.image}
                  alt={specialty.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {specialty.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{specialty.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
