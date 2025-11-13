import { NextRequest, NextResponse } from 'next/server';

interface User {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  custodyAddress: string;
  verifiedAddresses: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Demo users for testing
    const mockUsers: User[] = [
      {
        fid: 12345,
        username: 'demo_user',
        displayName: 'Demo User',
        pfp: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
        custodyAddress: '0x1234567890123456789012345678901234567890',
        verifiedAddresses: ['0x1234567890123456789012345678901234567890']
      },
      {
        fid: 67890,
        username: 'farcaster_enthusiast',
        displayName: 'Farcaster Enthusiast',
        pfp: 'https://api.dicebear.com/7.x/avataaars/svg?seed=farcaster',
        custodyAddress: '0x6789012345678901234567890123456789012345',
        verifiedAddresses: ['0x6789012345678901234567890123456789012345']
      },
      {
        fid: 11111,
        username: 'giveaway_host',
        displayName: 'Giveaway Host',
        pfp: 'https://api.dicebear.com/7.x/avataaars/svg?seed=host',
        custodyAddress: '0x1111122222333334444455555666667777788888',
        verifiedAddresses: ['0x1111122222333334444455555666667777788888']
      }
    ];

    // Randomly select a demo user
    const randomUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];

    return NextResponse.json(randomUser);

  } catch (error) {
    console.error('Error signing in:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}