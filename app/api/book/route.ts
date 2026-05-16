import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCalendarEvent } from '@/lib/calendar';
import { z } from 'zod';

const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
type DayKey = (typeof DAY_KEYS)[number];

const bookingSchema = z.object({
  psychologistId: z.string().uuid('Invalid psychologist ID'),
  dayOfWeek: z.enum(DAY_KEYS, { message: 'Invalid day of week' }),
  hour: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  notes: z.string().optional(),
});

function getNextDateForDay(dayOfWeek: DayKey, hour: string): Date {
  const dayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(dayOfWeek);
  const now = new Date();
  const diff = (dayIndex - now.getDay() + 7) % 7 || 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  const [hh, mm] = hour.split(':');
  date.setHours(Number(hh), Number(mm), 0, 0);
  return date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { psychologistId, dayOfWeek, hour, notes } = validation.data;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure patient record exists
    await supabase.from('patients').upsert(
      { id: user.id },
      { onConflict: 'id' }
    );

    // Calculate the actual datetime
    const scheduledAt = getNextDateForDay(dayOfWeek, hour);

    // Check for existing appointments in the same time slot (Supabase)
    const startWindow = new Date(scheduledAt.getTime() - 5 * 60 * 1000);
    const endWindow = new Date(scheduledAt.getTime() + 55 * 60 * 1000);
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('psychologist_id', psychologistId)
      .eq('status', 'scheduled')
      .gte('scheduled_at', startWindow.toISOString())
      .lte('scheduled_at', endWindow.toISOString());

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      );
    }

    // Insert appointment in Supabase
    const { data: appointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        psychologist_id: psychologistId,
        patient_id: user.id,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 50,
        status: 'scheduled',
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError || !appointment) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create appointment in database' },
        { status: 500 }
      );
    }

    // Try Google Calendar (non-blocking — appointment already saved)
    let googleEventId: string | null = null;
    try {
      const { data: patientProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      if (patientProfile) {
        const calResult = await createCalendarEvent({
          name: patientProfile.full_name,
          email: patientProfile.email,
          date: scheduledAt.toISOString().split('T')[0],
          time: scheduledAt.toISOString().split('T')[1].substring(0, 5),
          notes: notes,
        });

        if (calResult.success) {
          googleEventId = calResult.eventId || null;
        } else {
          console.warn('Google Calendar event not created (credentials may be missing):', calResult.error);
        }
      }
    } catch (calError) {
      console.warn('Google Calendar error (non-fatal):', calError);
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully',
      appointmentId: appointment.id,
      googleEventId,
      scheduledAt: appointment.scheduled_at,
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
