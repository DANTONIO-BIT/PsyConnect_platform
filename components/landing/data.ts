export const topics = [
  { id: "ansiedad",     label: "Ansiedad" },
  { id: "estres",       label: "Estrés y burnout" },
  { id: "depresion",    label: "Depresión" },
  { id: "autoestima",   label: "Autoestima" },
  { id: "pareja",       label: "Relación de pareja" },
  { id: "duelo",        label: "Duelo y pérdida" },
  { id: "trauma",       label: "Trauma" },
  { id: "adolescencia", label: "Adolescencia" },
  { id: "sueno",        label: "Sueño" },
  { id: "tdah",         label: "TDAH y foco" },
];

export const languages = ["Español", "Inglés", "Francés"];

export const genders = [
  { id: "any", label: "Indiferente" },
  { id: "f",   label: "Mujer" },
  { id: "m",   label: "Hombre" },
];

export const times = [
  { id: "any",    label: "Indiferente" },
  { id: "manana", label: "Mañanas" },
  { id: "tarde",  label: "Tardes / noche" },
];

export interface Psicologo {
  id: string; name: string; title: string; photo: string;
  gender: string; country: string; topics: string[];
  specialties: string[]; approach: string; languages: string[];
  modality: string[]; time: string[]; years: number;
  price: { clp: number; eur: number };
  rating: number; reviews: number; next: string; bio: string;
}

export const psicologos: Psicologo[] = [
  {
    id: "ana", name: "Ana González", title: "Psicóloga clínica",
    photo: "/assets/psy-ana.jpg", gender: "f", country: "CL",
    topics: ["ansiedad","depresion","estres","sueno"],
    specialties: ["Ansiedad","Depresión","Estrés","Mindfulness"],
    approach: "Cognitivo-conductual", languages: ["Español","Inglés"],
    modality: ["Online"], time: ["manana","tarde"], years: 8,
    price: { clp: 45000, eur: 45 }, rating: 4.9, reviews: 184,
    next: "Hoy · 18:00",
    bio: "Acompaño a adultos y adolescentes a recuperar la calma con herramientas prácticas y un ritmo que respeta tu proceso.",
  },
  {
    id: "elena", name: "Elena Navarro", title: "Psicóloga sanitaria",
    photo: "/assets/psy-javier.jpg", gender: "f", country: "ES",
    topics: ["pareja","autoestima","duelo"],
    specialties: ["Terapia de pareja","Autoestima","Duelo y pérdida"],
    approach: "Sistémica · humanista", languages: ["Español","Inglés","Francés"],
    modality: ["Online","Presencial"], time: ["tarde"], years: 12,
    price: { clp: 72000, eur: 75 }, rating: 4.8, reviews: 211,
    next: "Mañana · 17:00",
    bio: "Doce años acompañando vínculos y procesos de cambio. Creo en una terapia honesta, cálida y sin juicios.",
  },
  {
    id: "mateo", name: "Mateo Silva", title: "Psicólogo infantojuvenil",
    photo: "/assets/psy-sofia.jpg", gender: "m", country: "CL",
    topics: ["adolescencia","tdah","ansiedad"],
    specialties: ["Adolescencia","TDAH y foco","Neurodesarrollo"],
    approach: "Integrador", languages: ["Español"],
    modality: ["Online"], time: ["tarde"], years: 5,
    price: { clp: 38000, eur: 40 }, rating: 4.7, reviews: 96,
    next: "Hoy · 19:00",
    bio: "Trabajo con adolescentes y familias desde el respeto a su mundo. El primer paso es que se sientan escuchados.",
  },
  {
    id: "lucia", name: "Lucía Romero", title: "Psicóloga sanitaria",
    photo: "/assets/psy-lucia.jpg", gender: "f", country: "ES",
    topics: ["trauma","ansiedad","estres"],
    specialties: ["Trauma","Ansiedad","EMDR"],
    approach: "EMDR · exposición", languages: ["Español","Inglés"],
    modality: ["Online"], time: ["manana"], years: 10,
    price: { clp: 64000, eur: 65 }, rating: 4.9, reviews: 167,
    next: "Jue · 10:00",
    bio: "Especialista en trauma y ansiedad. Un espacio seguro para procesar lo difícil a un ritmo que tú marcas.",
  },
];

export const steps = [
  { n: "01", t: "Cuéntanos qué buscas", d: "Responde tres preguntas. En menos de un minuto entendemos tu motivo, tus preferencias y tu disponibilidad." },
  { n: "02", t: "Recibe tu match", d: "Te mostramos los profesionales con mayor afinidad — con su enfoque, idiomas y primeras horas libres." },
  { n: "03", t: "Reserva y confirma", d: "Eliges día y hora. Recibes confirmación al instante y un recordatorio antes de la sesión." },
  { n: "04", t: "Conecta por videollamada", d: "Te unes desde un enlace seguro y cifrado. Sin descargas, desde donde estés." },
];

export const especialidades = [
  "Ansiedad","Depresión","Estrés y burnout","Autoestima",
  "Terapia de pareja","Duelo y pérdida","Trauma","Adolescencia",
  "Trastornos del sueño","TDAH","TOC","Mindfulness",
];

export const testimonios = [
  { quote: "Probé otras plataformas y siempre acababa rellenando formularios eternos. Aquí, en tres preguntas, di con alguien que de verdad encajaba.", name: "María P.", meta: "Santiago, CL · 6 meses en terapia", photo: "/assets/testi-1.jpg" },
  { quote: "La videollamada se siente cercana, no clínica. Por primera vez la terapia online no me pareció un parche.", name: "Luis T.", meta: "Madrid, ES · 4 meses en terapia", photo: "/assets/testi-2.jpg" },
  { quote: "Saber el precio y la primera hora libre desde el inicio me quitó toda la ansiedad de dar el paso.", name: "Camila V.", meta: "Valparaíso, CL · 3 meses en terapia", photo: "/assets/testi-3.jpg" },
];

export const stats = [
  { v: "1.200+", l: "Sesiones completadas" },
  { v: "100%",   l: "Colegiados y verificados" },
  { v: "4.8/5",  l: "Valoración media" },
  { v: "48 h",   l: "Primera cita, de media" },
];

export function matchScore(psy: Psicologo, ans: { topics: string[]; language: string; gender: string; time: string }): number {
  let score = 0;
  score += ans.topics?.length ? 55 * (ans.topics.filter(t => psy.topics.includes(t)).length / ans.topics.length) : 55 * 0.6;
  score += (ans.language && ans.language !== "any") ? (psy.languages.includes(ans.language) ? 18 : 0) : 18;
  score += (ans.gender && ans.gender !== "any") ? (psy.gender === ans.gender ? 14 : 4) : 14;
  score += (ans.time && ans.time !== "any") ? (psy.time.includes(ans.time) ? 13 : 5) : 13;
  return Math.max(62, Math.min(99, Math.round((score / 100) * 100)));
}

export function priceLabel(price: { clp: number; eur: number }) {
  return { clp: `$${price.clp.toLocaleString("es-CL")}`, eur: `${price.eur} €` };
}
