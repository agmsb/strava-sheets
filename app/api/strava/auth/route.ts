import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const clientId = process.env.STRAVA_CLIENT_ID || '12345';
  const redirectUri = searchParams.get('redirect_uri') || `${request.nextUrl.origin}/api/strava/auth/callback`;

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&approval_prompt=force&scope=activity:read_all`;

  return NextResponse.json({
    authUrl,
    clientIdConfigured: Boolean(process.env.STRAVA_CLIENT_ID),
  });
}
