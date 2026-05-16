// ============================================================
// Mock / seed data — used when Supabase is not yet configured
// Replace with real DB calls by connecting Supabase
// ============================================================

import type { Profile, Psychologist, Patient, Appointment } from "@/types/database"

// ─── Mock user session ────────────────────────────────────────
export const MOCK_USER = {
  id:    "mock-user-admin-001",
  email: "admin@psyconnect.com",
}

// ─── Profiles ─────────────────────────────────────────────────
export const MOCK_PROFILES: Profile[] = [
  {
    id: "mock-psy-001", email: "ana.gonzalez@psyconnect.com",
    full_name: "Dra. Ana González", role: "psychologist",
    avatar_url: null, country: "CL", phone: "+56 9 8765 4321",
    created_at: "2024-11-10T09:00:00Z", updated_at: "2024-11-10T09:00:00Z",
  },
  {
    id: "mock-psy-002", email: "javier.lopez@psyconnect.com",
    full_name: "Dr. Javier López", role: "psychologist",
    avatar_url: null, country: "ES", phone: "+34 91 234 5678",
    created_at: "2024-11-15T11:00:00Z", updated_at: "2024-11-15T11:00:00Z",
  },
  {
    id: "mock-psy-003", email: "sofia.martinez@psyconnect.com",
    full_name: "Dra. Sofía Martínez", role: "psychologist",
    avatar_url: null, country: "CL", phone: "+56 9 1234 5678",
    created_at: "2024-12-01T08:00:00Z", updated_at: "2024-12-01T08:00:00Z",
  },
  {
    id: "mock-psy-004", email: "carlos.ruiz@psyconnect.com",
    full_name: "Dr. Carlos Ruiz", role: "psychologist",
    avatar_url: null, country: "ES", phone: "+34 93 876 5432",
    created_at: "2025-01-05T10:00:00Z", updated_at: "2025-01-05T10:00:00Z",
  },
  {
    id: "mock-pat-001", email: "maria.perez@gmail.com",
    full_name: "María Pérez", role: "patient",
    avatar_url: null, country: "CL", phone: "+56 9 1111 2222",
    created_at: "2024-12-10T14:00:00Z", updated_at: "2024-12-10T14:00:00Z",
  },
  {
    id: "mock-pat-002", email: "luis.torres@gmail.com",
    full_name: "Luis Torres", role: "patient",
    avatar_url: null, country: "ES", phone: "+34 61 333 4444",
    created_at: "2024-12-15T10:00:00Z", updated_at: "2024-12-15T10:00:00Z",
  },
  {
    id: "mock-pat-003", email: "camila.vega@gmail.com",
    full_name: "Camila Vega", role: "patient",
    avatar_url: null, country: "CL", phone: "+56 9 5555 6666",
    created_at: "2025-01-08T09:00:00Z", updated_at: "2025-01-08T09:00:00Z",
  },
]

// ─── Psychologists ─────────────────────────────────────────────
export const MOCK_PSYCHOLOGISTS: (Psychologist & { profile: Profile })[] = [
  {
    id: "mock-psy-001",
    specialties: ["Ansiedad", "Depresión", "Estrés", "Mindfulness"],
    bio: "Psicóloga clínica con 8 años de experiencia en terapia cognitivo-conductual. Especializada en el tratamiento de trastornos de ansiedad y depresión en adultos y adolescentes.",
    experience_years: 8,
    registration_number: "23456789-0",
    languages: ["Español", "Inglés"],
    session_price_clp: 45000,
    session_price_eur: null,
    status: "approved",
    rejection_reason: null,
    documents_urls: [],
    available_hours: {
      monday:    ["09:00","10:00","11:00","15:00","16:00","17:00"],
      tuesday:   ["09:00","10:00","11:00","15:00","16:00"],
      wednesday: ["09:00","10:00","15:00","16:00","17:00"],
      thursday:  ["10:00","11:00","15:00","16:00"],
      friday:    ["09:00","10:00","11:00"],
    },
    session_modality: ["online"],
    created_at: "2024-11-10T09:00:00Z",
    updated_at: "2024-11-10T09:00:00Z",
    profile: MOCK_PROFILES[0],
  },
  {
    id: "mock-psy-002",
    specialties: ["Terapia de Pareja", "Autoestima", "Duelo y Pérdida"],
    bio: "Psicólogo especializado en terapia de pareja y familiar. Formación en terapia sistémica y enfoque humanista. Más de 12 años acompañando procesos de cambio.",
    experience_years: 12,
    registration_number: "M-45678",
    languages: ["Español", "Inglés", "Francés"],
    session_price_clp: null,
    session_price_eur: 75,
    status: "approved",
    rejection_reason: null,
    documents_urls: [],
    available_hours: {
      monday:   ["10:00","11:00","16:00","17:00","18:00"],
      wednesday:["10:00","11:00","16:00","17:00"],
      friday:   ["10:00","11:00","16:00","17:00","18:00"],
    },
    session_modality: ["online", "presential"],
    created_at: "2024-11-15T11:00:00Z",
    updated_at: "2024-11-15T11:00:00Z",
    profile: MOCK_PROFILES[1],
  },
  {
    id: "mock-psy-003",
    specialties: ["Psicología Adolescente", "TDAH", "Trastornos Alimentarios"],
    bio: "Especialista en psicología infantojuvenil con enfoque en el neurodesarrollo. Trabajo con niños, adolescentes y sus familias desde una perspectiva integradora.",
    experience_years: 5,
    registration_number: "34567890-1",
    languages: ["Español"],
    session_price_clp: 38000,
    session_price_eur: null,
    status: "pending",
    rejection_reason: null,
    documents_urls: [],
    available_hours: {
      tuesday:  ["14:00","15:00","16:00","17:00","18:00","19:00"],
      thursday: ["14:00","15:00","16:00","17:00","18:00","19:00"],
      saturday: ["10:00","11:00","12:00"],
    },
    session_modality: ["online"],
    created_at: "2024-12-01T08:00:00Z",
    updated_at: "2024-12-01T08:00:00Z",
    profile: MOCK_PROFILES[2],
  },
  {
    id: "mock-psy-004",
    specialties: ["Trauma y PTSD", "TOC", "Fobias"],
    bio: "Psicólogo clínico especializado en trauma y trastornos de ansiedad. Formado en EMDR y terapia de exposición. Trabajo con adultos en español e inglés.",
    experience_years: 10,
    registration_number: "M-78901",
    languages: ["Español", "Inglés"],
    session_price_clp: null,
    session_price_eur: 65,
    status: "rejected",
    rejection_reason: "Documentación incompleta. Falta el título universitario homologado para ejercer en España.",
    documents_urls: [],
    available_hours: {},
    session_modality: ["online"],
    created_at: "2025-01-05T10:00:00Z",
    updated_at: "2025-01-05T10:00:00Z",
    profile: MOCK_PROFILES[3],
  },
]

// ─── Patients ──────────────────────────────────────────────────
export const MOCK_PATIENTS: (Patient & { profile: Profile })[] = [
  {
    id: "mock-pat-001",
    date_of_birth: "1990-05-12",
    emergency_contact: "Pedro Pérez +56 9 9999 0000",
    notes: "Paciente con historial de ansiedad social. Primera consulta online.",
    assigned_psychologist_id: "mock-psy-001",
    created_at: "2024-12-10T14:00:00Z",
    profile: MOCK_PROFILES[4],
  },
  {
    id: "mock-pat-002",
    date_of_birth: "1985-08-23",
    emergency_contact: null,
    notes: null,
    assigned_psychologist_id: "mock-psy-002",
    created_at: "2024-12-15T10:00:00Z",
    profile: MOCK_PROFILES[5],
  },
  {
    id: "mock-pat-003",
    date_of_birth: "1998-02-14",
    emergency_contact: "Rosa Vega +56 9 7777 8888",
    notes: "Derivada por médico de cabecera. Proceso de duelo reciente.",
    assigned_psychologist_id: "mock-psy-001",
    created_at: "2025-01-08T09:00:00Z",
    profile: MOCK_PROFILES[6],
  },
]

// ─── Appointments ──────────────────────────────────────────────
const futureDate = (daysFromNow: number, hour = 10) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}
const pastDate = (daysAgo: number, hour = 15) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-001",
    psychologist_id: "mock-psy-001", patient_id: "mock-pat-001",
    scheduled_at: futureDate(1, 10), duration_minutes: 50,
    status: "confirmed", session_link: "https://meet.google.com/xyz-abc-123",
    notes: "Segunda sesión. Trabajar técnicas de respiración.",
    google_event_id: "gcal_001",
    created_at: pastDate(5), updated_at: pastDate(5),
  },
  {
    id: "apt-002",
    psychologist_id: "mock-psy-001", patient_id: "mock-pat-003",
    scheduled_at: futureDate(3, 15), duration_minutes: 50,
    status: "scheduled", session_link: null,
    notes: null,
    google_event_id: null,
    created_at: pastDate(2), updated_at: pastDate(2),
  },
  {
    id: "apt-003",
    psychologist_id: "mock-psy-001", patient_id: "mock-pat-001",
    scheduled_at: pastDate(7, 10), duration_minutes: 50,
    status: "completed", session_link: null,
    notes: "Primera sesión completada. Buena adherencia.",
    google_event_id: null,
    created_at: pastDate(14), updated_at: pastDate(7),
  },
  {
    id: "apt-004",
    psychologist_id: "mock-psy-002", patient_id: "mock-pat-002",
    scheduled_at: futureDate(2, 17), duration_minutes: 50,
    status: "confirmed", session_link: "https://meet.google.com/def-ghi-456",
    notes: "Seguimiento terapia de pareja.",
    google_event_id: "gcal_004",
    created_at: pastDate(3), updated_at: pastDate(3),
  },
  {
    id: "apt-005",
    psychologist_id: "mock-psy-001", patient_id: "mock-pat-003",
    scheduled_at: pastDate(14, 15), duration_minutes: 50,
    status: "completed", session_link: null,
    notes: null,
    google_event_id: null,
    created_at: pastDate(21), updated_at: pastDate(14),
  },
  {
    id: "apt-006",
    psychologist_id: "mock-psy-002", patient_id: "mock-pat-002",
    scheduled_at: pastDate(3, 17), duration_minutes: 50,
    status: "no_show", session_link: null,
    notes: "Paciente no se conectó.",
    google_event_id: null,
    created_at: pastDate(10), updated_at: pastDate(3),
  },
]

// ─── Helpers ───────────────────────────────────────────────────
export const getPsychologistById   = (id: string) => MOCK_PSYCHOLOGISTS.find((p) => p.id === id)
export const getPatientById        = (id: string) => MOCK_PATIENTS.find((p) => p.id === id)
export const getAppointmentsForPsy = (psyId: string) => MOCK_APPOINTMENTS.filter((a) => a.psychologist_id === psyId)
export const getAppointmentsForPat = (patId: string) => MOCK_APPOINTMENTS.filter((a) => a.patient_id === patId)

export const ADMIN_STATS = {
  totalPsychologists: MOCK_PSYCHOLOGISTS.length,
  pendingPsychologists: MOCK_PSYCHOLOGISTS.filter((p) => p.status === "pending").length,
  approvedPsychologists: MOCK_PSYCHOLOGISTS.filter((p) => p.status === "approved").length,
  totalPatients: MOCK_PATIENTS.length,
  totalAppointments: MOCK_APPOINTMENTS.length,
  todayAppointments: MOCK_APPOINTMENTS.filter((a) => {
    const d = new Date(a.scheduled_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length,
}
