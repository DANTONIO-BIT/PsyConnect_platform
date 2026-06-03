"use client";
import "@/app/landing.css";
import { useRef } from "react";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Match } from "./Match";
import { HowItWorks, Psicologos, Especialidades, Confianza, Testimonios, Precio, FinalCTA, Footer } from "./Sections";

export function LandingPage() {
  const matchRef = useRef<HTMLDivElement>(null);

  const scrollToMatch = () => {
    document.getElementById("match")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="psy-landing" ref={matchRef}>
      <Navbar onMatch={scrollToMatch} />
      <Hero onMatch={scrollToMatch} />
      <Match />
      <HowItWorks />
      <Psicologos />
      <Especialidades />
      <Confianza />
      <Testimonios />
      <Precio onMatch={scrollToMatch} />
      <FinalCTA onMatch={scrollToMatch} />
      <Footer />
    </div>
  );
}
