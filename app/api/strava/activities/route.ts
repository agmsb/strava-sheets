import { NextRequest, NextResponse } from 'next/server';
import { MOCK_ACTIVITIES } from '@/lib/strava';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const isDemo = searchParams.get('demo') === 'true';
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || searchParams.get('token');

  if (isDemo || !token) {
    return NextResponse.json({
      source: 'demo',
      activities: MOCK_ACTIVITIES,
    });
  }

  try {
    const after = searchParams.get('after') || '';
    const perPage = searchParams.get('per_page') || '200';
    let url = `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`;
    if (after) {
      url += `&after=${after}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Strava API returned status ${response.status}: ${errorText}`, source: 'live' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      source: 'live',
      activities: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch Strava activities';
    return NextResponse.json({ error: message, source: 'live' }, { status: 500 });
  }
}
