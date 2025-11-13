import { NextRequest, NextResponse } from 'next/server';

interface NeynarUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json({ error: 'FID is required' }, { status: 400 });
    }

    const apiKey = process.env.NEYNAR_API_KEY || '4143CF21-0BAC-4A9D-9E06-F3AB819238BA';
    
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.users || data.users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const neynarUser: NeynarUser = data.users[0];
    
    const user = {
      fid: neynarUser.fid,
      username: neynarUser.username,
      displayName: neynarUser.display_name || neynarUser.username,
      pfp: neynarUser.pfp_url || '',
      custodyAddress: neynarUser.custody_address,
      verifiedAddresses: neynarUser.verifications || []
    };

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}