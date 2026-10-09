import { NextRequest, NextResponse } from 'next/server';
import { MOCK_SEGMENT_EFFORTS } from '@/lib/strava';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const segmentId = searchParams.get('segment_id');
  const isDemo = searchParams.get('demo') === 'true';
  const token = request.headers.get('authorization')?.replace('Bearer ', '') || searchParams.get('token');

  if (!segmentId) {
    return NextResponse.json({ error: 'Missing segment_id query parameter' }, { status: 400 });
  }

  if (isDemo || !token) {
    const mockEfforts = MOCK_SEGMENT_EFFORTS[segmentId] || [
      {
        id: 9901,
        segment_id: Number(segmentId),
        name: `Segment #${segmentId}`,
        start_date_local: new Date().toISOString(),
        elapsed_time: 900,
        moving_time: 890,
        distance: 3500,
        average_watts: 240,
        average_heartrate: 160,
        max_heartrate: 175,
        pr_rank: 1,
      },
    ];

    return NextResponse.json({
      source: 'demo',
      segmentId,
      efforts: mockEfforts,
    });
  }

  try {
    const url = `https://www.strava.com/api/v3/segments/${segmentId}/all_efforts?per_page=200`;
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
      segmentId,
      efforts: data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch segment efforts';
    return NextResponse.json({ error: message, source: 'live' }, { status: 500 });
  }
}
