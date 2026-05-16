import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { HowItWorks } from "@/components/how-it-works"
import { Therapists } from "@/components/therapists"
import { Specialties } from "@/components/specialties"
import { TrustSection } from "@/components/trust-section"
import { Testimonials } from "@/components/testimonials"
import { BookingForm } from "@/components/booking-form"
import { FinalCTA } from "@/components/final-cta"
import { ChatWidget } from "@/components/chat-widget"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <Therapists />
      <Specialties />
      <TrustSection />
      <Testimonials />
      <section id="booking" className="section-padding bg-gradient-to-br from-background to-secondary">
        <div className="container-main">
          <div className="grid-12 gap-6 items-start">
            <div className="col-span-4 md:col-span-8 lg:col-span-5">
              <p className="text-primary font-semibold text-sm uppercase tracking-wide">Comienza</p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                Comienza tu camino hacia el bienestar emocional
              </h2>
              <p className="text-muted-foreground mb-8">
                Da el primer paso hacia una mente más sana. Nuestro equipo de psicólogos certificados está listo para acompañarte en tu proceso terapéutico.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">1</span>
                  </div>
                  <p className="text-foreground">Elige una fecha y hora que te convenga</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">2</span>
                  </div>
                  <p className="text-foreground">Recibe confirmación instantánea por email</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold">3</span>
                  </div>
                  <p className="text-foreground">Conéctate con tu psicólogo por videollamada segura</p>
                </div>
              </div>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
      <FinalCTA />
      <Footer />
      <ChatWidget />
    </main>
  )
}
