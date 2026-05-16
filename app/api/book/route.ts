import { NextRequest, NextResponse } from 'next/server';
import { createCalendarEvent, checkAvailability } from '@/lib/calendar';
import { z } from 'zod';

const bookingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  notes: z.string().optional(),
});

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

    const { name, email, date, time, notes } = validation.data;

    const isAvailable = await checkAvailability(date, time);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'This time slot is not available. Please choose another time.' },
        { status: 409 }
      );
    }

    const result = await createCalendarEvent({
      name,
      email,
      date,
      time,
      notes,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment booked successfully!',
      eventId: result.eventId,
    });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
