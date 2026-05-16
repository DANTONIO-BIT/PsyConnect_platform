"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

export function Testimonials() {
  const testimonials = [
    {
      name: "Ana L.",
      quote: "Después de luchar con la ansiedad durante años, finalmente encontré el apoyo que necesitaba. Las sesiones online encajan perfectamente en mi agenda, y mi psicóloga realmente me entiende.",
      image: "/images/testimonial1.jpg",
    },
    {
      name: "Carlos M.",
      quote: "La flexibilidad de la terapia online ha cambiado mi vida. Puedo asistir a sesiones desde cualquier lugar y la calidad de atención es excepcional. Lo recomiendo mucho.",
      image: "/images/testimonial2.jpg",
    },
    {
      name: "Elena R.",
      quote: "Al principio era escéptica sobre la terapia online, pero la experiencia superó mis expectativas. Mi psicóloga es cálida, profesional e increíblemente útil.",
      image: "/images/testimonial3.jpg",
    },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="bg-card section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Testimonios</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-background border border-border rounded-3xl p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full relative mb-6 overflow-hidden">
                <Image
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  fill
                  className="object-cover"
                />
              </div>

              <blockquote className="text-lg md:text-xl text-foreground leading-relaxed mb-6 max-w-2xl">
                "{testimonials[currentIndex].quote}"
              </blockquote>

              <p className="font-semibold text-foreground">{testimonials[currentIndex].name}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  index === currentIndex ? "bg-primary" : "bg-border"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
