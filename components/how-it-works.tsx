"use client"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Reserva tu sesión",
      description: "Elige un horario que te convenga y selecciona tu psicólogo preferido.",
      isHighlighted: false,
    },
    {
      number: "02",
      title: "Conoce a tu psicólogo",
      description: "Conéctate por videollamada segura y preséntate en un espacio seguro.",
      isHighlighted: false,
    },
    {
      number: "03",
      title: "Comienza tu proceso terapéutico",
      description: "Inicia tu camino hacia el bienestar emocional con acompañamiento continuo.",
      isHighlighted: true,
    },
  ]

  return (
    <section id="how-it-works" className="bg-gradient-to-br from-background to-secondary section-padding">
      <div className="container-main">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm uppercase tracking-wide">Proceso Simple</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 text-balance">
            Cómo Funciona
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 z-0" />

          <div className="grid-12 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="col-span-4 md:col-span-8 lg:col-span-4 flex flex-col items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-6 ${
                    step.isHighlighted
                      ? "bg-[#8FC439] text-white"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
