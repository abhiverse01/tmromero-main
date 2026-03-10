import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/ratings - Get ratings for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const ratings = await db.rating.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    return NextResponse.json({ ratings, avgRating, total: ratings.length });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}

// POST /api/ratings - Create a rating
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giverId, receiverId, score, review, postId } = body;

    if (!giverId || !receiverId || !score) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: 'Score must be between 1 and 5' }, { status: 400 });
    }

    // Check if already rated
    const existingRating = await db.rating.findFirst({
      where: { giverId, receiverId, postId: postId || null },
    });

    if (existingRating) {
      return NextResponse.json({ error: 'Already rated' }, { status: 400 });
    }

    const rating = await db.rating.create({
      data: {
        giverId,
        receiverId,
        score,
        review: review || null,
        postId: postId || null,
      },
      include: {
        giver: { select: { id: true, name: true, image: true } },
      },
    });

    // Update user's trust score
    const allRatings = await db.rating.findMany({
      where: { receiverId },
      select: { score: true },
    });
    
    const avgScore = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    
    await db.user.update({
      where: { id: receiverId },
      data: { trustScore: avgScore },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
  }
}
