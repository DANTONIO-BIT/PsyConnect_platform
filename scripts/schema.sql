-- ============================================================
-- Psicología Online — Supabase Schema
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
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
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
create policy "Admin full access on appointments" on public.appointments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ─────────────────────────────────────────
-- 6. STORAGE BUCKET for documents & avatars
-- ─────────────────────────────────────────
-- Run in Storage section of Supabase Dashboard:
-- Create bucket "psicologos-docs" (private)
-- Create bucket "avatars" (public)

-- ─────────────────────────────────────────
-- 7. UPDATED_AT auto-trigger
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
