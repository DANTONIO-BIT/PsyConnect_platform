export interface CalendarEvent {
  summary: string;
  description: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: {
    email: string;
  }[];
}

export interface BookingData {
  name: string;
  email: string;
  date: string;
  time: string;
  notes?: string;
}

const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

export async function createCalendarEvent(booking: BookingData): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    
    const startDateTime = new Date(`${booking.date}T${booking.time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const event: CalendarEvent = {
      summary: `Psychology Session - ${booking.name}`,
      description: `
Client: ${booking.name}
Email: ${booking.email}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Booked through PsyConnect website.
      `.trim(),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: booking.email },
      ],
    };

    const accessToken = await getAccessToken();

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google Calendar API error:', error);
      return { success: false, error: error.error?.message || 'Failed to create calendar event' };
    }

    const createdEvent = await response.json();
    return { success: true, eventId: createdEvent.id };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { success: false, error: 'Failed to create calendar event' };
  }
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Google OAuth credentials');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  return data.access_token;
}

export async function checkAvailability(date: string, time: string): Promise<boolean> {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

    const accessToken = await getAccessToken();

    const response = await fetch(
      `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?` +
      new URLSearchParams({
        timeMin: startDateTime.toISOString(),
        timeMax: endDateTime.toISOString(),
        singleEvents: 'true',
        maxResults: '1',
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return true;
    }

    const data = await response.json();
    return data.items?.length === 0;
  } catch (error) {
    console.error('Error checking availability:', error);
    return true;
  }
}
