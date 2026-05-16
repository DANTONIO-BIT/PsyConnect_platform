// ============================================================
// Database types — mirrors the Supabase schema exactly
// Run scripts/schema.sql in Supabase SQL Editor first
// ============================================================

export type UserRole = "patient" | "psychologist" | "admin"
export type PsychologistStatus = "pending" | "approved" | "rejected"
export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
export type Country = "CL" | "ES"

// ------ profiles (extends auth.users) ------
export interface Profile {
  id: string // uuid — matches auth.users.id
  email: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  country: Country
  phone: string | null
  created_at: string
  updated_at: string
}

// ------ psychologists ------
export interface Psychologist {
  id: string // references profiles.id
  specialties: string[]
  bio: string
  experience_years: number
  registration_number: string // colegiado (ES) / Minsal (CL)
  languages: string[]
  session_price_clp: number | null
  session_price_eur: number | null
  status: PsychologistStatus
  rejection_reason: string | null
  documents_urls: string[]
  available_hours: AvailableHours
  session_modality: ("online" | "presential" | "both")[]
  created_at: string
  updated_at: string
  // joined from profiles
  profile?: Profile
}

// Availability structure: { monday: ["09:00","10:00",...], tuesday: [...], ... }
export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"
export type AvailableHours = Partial<Record<WeekDay, string[]>>

// ------ patients ------
export interface Patient {
  id: string // references profiles.id
  date_of_birth: string | null
  emergency_contact: string | null
  notes: string | null
  assigned_psychologist_id: string | null
  created_at: string
  // joined from profiles
  profile?: Profile
}

// ------ appointments ------
export interface Appointment {
  id: string
  psychologist_id: string
  patient_id: string
  scheduled_at: string
  duration_minutes: number
  status: AppointmentStatus
  session_link: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  psychologist?: Psychologist & { profile: Profile }
  patient?: Patient & { profile: Profile }
}

// ------ Supabase DB helper type ------
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at" | "updated_at">; Update: Partial<Profile> }
      psychologists: { Row: Psychologist; Insert: Omit<Psychologist, "created_at" | "updated_at">; Update: Partial<Psychologist> }
      patients: { Row: Patient; Insert: Omit<Patient, "created_at">; Update: Partial<Patient> }
      appointments: { Row: Appointment; Insert: Omit<Appointment, "id" | "created_at" | "updated_at">; Update: Partial<Appointment> }
    }
  }
}
