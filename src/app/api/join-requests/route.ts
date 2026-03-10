import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/join-requests - Get join requests
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    const postId = request.nextUrl.searchParams.get('postId');
    
    const where: Record<string, string> = {};
    if (userId) where.senderId = userId;
    if (postId) where.postId = postId;

    const requests = await db.joinRequest.findMany({
      where,
      include: {
        post: {
          include: {
            author: { select: { id: true, name: true, image: true } },
            category: true,
          },
        },
        sender: {
          select: { id: true, name: true, image: true, email: true, trustScore: true },
        },
        receiver: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching join requests:', error);
    return NextResponse.json({ error: 'Failed to fetch join requests' }, { status: 500 });
  }
}

// POST /api/join-requests - Create a join request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, senderId, message } = body;

    if (!postId || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the post to find the receiver
    const post = await db.post.findUnique({
      where: { id: postId },
      select: { authorId: true, currentParticipants: true, maxParticipants: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.currentParticipants >= post.maxParticipants) {
      return NextResponse.json({ error: 'Post is full' }, { status: 400 });
    }

    // Check if already requested
    const existingRequest = await db.joinRequest.findFirst({
      where: { postId, senderId },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Already requested' }, { status: 400 });
    }

    const joinRequest = await db.joinRequest.create({
      data: {
        postId,
        senderId,
        receiverId: post.authorId,
        message: message || null,
      },
      include: {
        post: { include: { category: true } },
        sender: { select: { id: true, name: true, image: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json({ error: 'Failed to create join request' }, { status: 500 });
  }
}

// PUT /api/join-requests - Update join request status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, agreement } = body;

    const joinRequest = await db.joinRequest.update({
      where: { id },
      data: { 
        status,
        agreement: agreement || undefined,
      },
      include: {
        post: true,
        sender: { select: { id: true, name: true } },
      },
    });

    // If accepted, increment post participants
    if (status === 'ACCEPTED') {
      await db.post.update({
        where: { id: joinRequest.postId },
        data: { currentParticipants: { increment: 1 } },
      });
    }

    return NextResponse.json(joinRequest);
  } catch (error) {
    console.error('Error updating join request:', error);
    return NextResponse.json({ error: 'Failed to update join request' }, { status: 500 });
  }
}
