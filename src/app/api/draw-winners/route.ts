import { NextRequest, NextResponse } from 'next/server';

interface Comment {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
}

interface Winner {
  username: string;
  fid: number;
  displayName: string;
  pfp: string;
}

export async function POST(request: NextRequest) {
  try {
    const { castHash, winnerCount, hostFid } = await request.json();

    if (!castHash) {
      return NextResponse.json({ error: 'Cast hash is required' }, { status: 400 });
    }

    if (!winnerCount || winnerCount < 1) {
      return NextResponse.json({ error: 'Winner count must be at least 1' }, { status: 400 });
    }

    // Get comments from Neynar API
    const comments = await getCastComments(castHash);
    
    if (comments.length === 0) {
      return NextResponse.json({ 
        error: 'No comments found for this cast',
        winners: [],
        totalComments: 0
      });
    }

    // Draw winners
    const winners = drawWinners(comments, winnerCount);

    return NextResponse.json({
      winners: winners.map(w => ({
        username: w.username,
        fid: w.fid,
        displayName: w.displayName,
        pfp: w.pfp
      })),
      totalComments: comments.length,
      hostFid: hostFid || null
    });

  } catch (error) {
    console.error('Error drawing winners:', error);
    return NextResponse.json(
      { error: 'Failed to draw winners' },
      { status: 500 }
    );
  }
}

async function getCastComments(castHash: string): Promise<Comment[]> {
  const apiKey = process.env.NEYNAR_API_KEY || '4143CF21-0BAC-4A9D-9E06-F3AB819238BA';
  
  try {
    console.log('Fetching cast with hash:', castHash);
    
    // First, get the cast details to get the thread hash
    const castResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?type=hash&identifier=${castHash}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey,
        },
      }
    );

    console.log('Cast response status:', castResponse.status);

    if (!castResponse.ok) {
      const errorData = await castResponse.json().catch(() => ({}));
      console.error('Neynar API Error:', errorData);
      
      if (castResponse.status === 404) {
        throw new Error('Postingan tidak ditemukan. Pastikan link postingan benar dan publik.');
      }
      if (castResponse.status === 400) {
        throw new Error('Format hash tidak valid. Pastikan menggunakan link postingan Farcaster yang benar.');
      }
      if (castResponse.status === 401) {
        throw new Error('API key tidak valid. Silakan periksa konfigurasi API key.');
      }
      throw new Error(`Gagal mengambil data postingan: ${errorData.message || castResponse.statusText}`);
    }

    const castData = await castResponse.json();
    console.log('Cast data received:', castData);
    const cast = castData.cast;

    if (!cast) {
      throw new Error('Postingan tidak ditemukan atau tidak dapat diakses');
    }

    // Get replies to the cast
    const repliesResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast/conversation?identifier=${cast.hash}&reply_depth=1&limit=150`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api_key': apiKey,
        },
      }
    );

    console.log('Replies response status:', repliesResponse.status);

    if (!repliesResponse.ok) {
      const errorData = await repliesResponse.json().catch(() => ({}));
      console.error('Neynar Conversation API Error:', errorData);
      throw new Error(`Gagal mengambil komentar: ${errorData.message || repliesResponse.statusText}`);
    }

    const repliesData = await repliesResponse.json();
    console.log('Replies data received:', repliesData);
    
    // Extract unique commenters
    const uniqueCommenters = new Map<number, Comment>();
    
    if (repliesData.conversation && repliesData.conversation.cast) {
      const replies = Array.isArray(repliesData.conversation.cast) 
        ? repliesData.conversation.cast 
        : [repliesData.conversation.cast];

      console.log('Processing replies:', replies.length);

      for (const reply of replies) {
        if (reply.author && reply.author.fid && reply.author.username) {
          const commenter: Comment = {
            fid: reply.author.fid,
            username: reply.author.username,
            display_name: reply.author.display_name || reply.author.username,
            pfp_url: reply.author.pfp_url || ''
          };
          
          // Only add unique users (exclude the original cast author)
          if (reply.author.fid !== cast.author.fid) {
            uniqueCommenters.set(reply.author.fid, commenter);
          }
        }
      }
    }

    const result = Array.from(uniqueCommenters.values());
    console.log('Unique commenters found:', result.length);
    return result;

  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

function drawWinners(comments: Comment[], winnerCount: number): Winner[] {
  // Shuffle the comments array using Fisher-Yates algorithm
  const shuffled = [...comments];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Take the first winnerCount entries
  const selectedWinners = shuffled.slice(0, Math.min(winnerCount, shuffled.length));

  return selectedWinners.map(comment => ({
    username: comment.username,
    fid: comment.fid,
    displayName: comment.display_name,
    pfp: comment.pfp_url
  }));
}