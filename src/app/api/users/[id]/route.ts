import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        college: true,
        isVerified: true,
        trustScore: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            receivedRatings: true,
          },
        },
        posts: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { category: true },
        },
        receivedRatings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            giver: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const user = await db.user.update({
      where: { id },
      data: {
        name: body.name,
        bio: body.bio,
        college: body.college,
        image: body.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        college: true,
        isVerified: true,
        trustScore: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
