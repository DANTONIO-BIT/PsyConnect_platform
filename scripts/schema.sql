-- ============================================================
-- Psicología Online — Supabase Schema (v2)
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. PROFILES (extends auth.users)
-- ─────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  email       text not null,
  full_name   text not null,
  role        text not null check (role in ('patient', 'psychologist', 'admin')) default 'patient',
  avatar_url  text,
  country     text not null check (country in ('CL', 'ES')) default 'CL',
  phone       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, country)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    coalesce(new.raw_user_meta_data->>'country', 'CL')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. PSYCHOLOGISTS
-- ─────────────────────────────────────────
create table public.psychologists (
  id                  uuid references public.profiles(id) on delete cascade primary key,
  specialties         text[] not null default '{}',
  bio                 text not null default '',
  experience_years    int not null default 0,
  registration_number text not null default '',
  languages           text[] not null default '{es}',
  session_price_clp   int,
  session_price_eur   int,
  status              text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  rejection_reason    text,
  documents_urls      text[] not null default '{}',
  available_hours     jsonb not null default '{}',
  session_modality    text[] not null default '{online}',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 3. PATIENTS
-- ─────────────────────────────────────────
create table public.patients (
  id                       uuid references public.profiles(id) on delete cascade primary key,
  date_of_birth            date,
  emergency_contact        text,
  notes                    text,
  assigned_psychologist_id uuid references public.psychologists(id),
  created_at               timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 4. APPOINTMENTS
-- ─────────────────────────────────────────
create table public.appointments (
  id                uuid primary key default uuid_generate_v4(),
  psychologist_id   uuid not null references public.psychologists(id),
  patient_id        uuid not null references public.patients(id),
  scheduled_at      timestamptz not null,
  duration_minutes  int not null default 50,
  status            text not null check (status in ('scheduled','confirmed','completed','cancelled','no_show')) default 'scheduled',
  session_link      text,
  notes             text,
  google_event_id   text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 5. PATIENT RECORDS (clinical notes / fichas)
-- ─────────────────────────────────────────
create table public.patient_records (
  id                uuid primary key default uuid_generate_v4(),
  patient_id        uuid not null references public.patients(id) on delete cascade,
  psychologist_id   uuid not null references public.psychologists(id) on delete cascade,
  session_date      timestamptz not null,
  record_type       text not null check (record_type in ('session_note', 'assessment', 'treatment_plan', 'progress_note')) default 'session_note',
  title             text not null,
  content           text not null,
  mood_score        int check (mood_score between 1 and 10),
  risk_level        text check (risk_level in ('low', 'medium', 'high', 'critical')),
  next_steps        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 6. NOTIFICATIONS
-- ─────────────────────────────────────────
create table public.notifications (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  type              text not null check (type in ('appointment_created', 'appointment_reminder', 'appointment_cancelled', 'appointment_completed', 'new_patient', 'payment_received', 'document_uploaded', 'system')),
  title             text not null,
  message           text not null,
  is_read           boolean not null default false,
  channel           text not null check (channel in ('in_app', 'email', 'whatsapp', 'push')) default 'in_app',
  metadata          jsonb not null default '{}',
  sent_at           timestamptz,
  created_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 7. PAYMENTS (stub — ready for Stripe/MercadoPago)
-- ─────────────────────────────────────────
create table public.payments (
  id                uuid primary key default uuid_generate_v4(),
  appointment_id    uuid not null references public.appointments(id) on delete cascade,
  patient_id        uuid not null references public.patients(id) on delete cascade,
  psychologist_id   uuid not null references public.psychologists(id) on delete cascade,
  amount            numeric(10,2) not null,
  currency          text not null check (currency in ('CLP', 'EUR', 'USD')) default 'CLP',
  status            text not null check (status in ('pending', 'paid', 'refunded', 'failed')) default 'pending',
  provider          text check (provider in ('stripe', 'mercadopago', 'manual')),
  provider_ref      text,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- profiles
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins read all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- psychologists
alter table public.psychologists enable row level security;
create policy "Approved psychologists are public" on public.psychologists for select using (status = 'approved');
create policy "Psychologist reads own record" on public.psychologists for select using (auth.uid() = id);
create policy "Psychologist updates own record" on public.psychologists for update using (auth.uid() = id);
create policy "Admin full access on psychologists" on public.psychologists for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- patients
alter table public.patients enable row level security;
create policy "Patient reads own record" on public.patients for select using (auth.uid() = id);
create policy "Patient updates own record" on public.patients for update using (auth.uid() = id);
create policy "Psychologist reads assigned patients" on public.patients for select using (
  exists (select 1 from public.appointments a where a.patient_id = id and a.psychologist_id = auth.uid())
);
create policy "Admin full access on patients" on public.patients for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- appointments
alter table public.appointments enable row level security;
create policy "Patient sees own appointments" on public.appointments for select using (auth.uid() = patient_id);
create policy "Psychologist sees own appointments" on public.appointments for select using (auth.uid() = psychologist_id);
create policy "Psychologist can update own appointments" on public.appointments for update using (auth.uid() = psychologist_id);
create policy "Patient can update own appointments" on public.appointments for update using (auth.uid() = patient_id);
create policy "Admin full access on appointments" on public.appointments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- patient_records
alter table public.patient_records enable row level security;
create policy "Psychologist manages own patient records" on public.patient_records for all using (
  auth.uid() = psychologist_id
);
create policy "Patient reads own records" on public.patient_records for select using (
  auth.uid() = patient_id
);
create policy "Admin reads all patient records" on public.patient_records for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- notifications
alter table public.notifications enable row level security;
create policy "Users see own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications as read" on public.notifications for update using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true);

-- payments
alter table public.payments enable row level security;
create policy "Patient sees own payments" on public.payments for select using (auth.uid() = patient_id);
create policy "Psychologist sees own payments" on public.payments for select using (auth.uid() = psychologist_id);
create policy "Admin full access on payments" on public.payments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ─────────────────────────────────────────
-- 9. STORAGE BUCKETS (create via Dashboard)
-- ─────────────────────────────────────────
-- Bucket "avatars" (public) — fotos de perfil
-- Bucket "psicologos-docs" (private) — documentos de verificación
-- Bucket "patient-files" (private) — archivos adjuntos de fichas clínicas

-- ─────────────────────────────────────────
-- 10. UPDATED_AT auto-trigger
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger set_psychologists_updated_at before update on public.psychologists
  for each row execute procedure public.set_updated_at();
create trigger set_appointments_updated_at before update on public.appointments
  for each row execute procedure public.set_updated_at();
create trigger set_patient_records_updated_at before update on public.patient_records
  for each row execute procedure public.set_updated_at();
create trigger set_payments_updated_at before update on public.payments
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────
-- 11. AUTO-NOTIFICATION TRIGGER on new appointment
-- ─────────────────────────────────────────
create or replace function public.notify_new_appointment()
returns trigger language plpgsql as $$
begin
  -- Notify psychologist
  insert into public.notifications (user_id, type, title, message, metadata)
  values (
    new.psychologist_id,
    'appointment_created',
    'Nueva cita agendada',
    'Un paciente ha agendado una cita para ' || to_char(new.scheduled_at, 'DD/MM/YYYY HH24:MI'),
    jsonb_build_object('appointment_id', new.id, 'patient_id', new.patient_id)
  );

  -- Notify patient
  insert into public.notifications (user_id, type, title, message, metadata)
  select
    new.patient_id,
    'appointment_created',
    'Cita confirmada',
    'Tu cita ha sido agendada para ' || to_char(new.scheduled_at, 'DD/MM/YYYY HH24:MI'),
    jsonb_build_object('appointment_id', new.id, 'psychologist_id', new.psychologist_id)
  ;

  return new;
end;
$$;

create trigger on_appointment_created
  after insert on public.appointments
  for each row execute procedure public.notify_new_appointment();
