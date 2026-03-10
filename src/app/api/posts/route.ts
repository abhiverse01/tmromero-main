import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/posts - List posts with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: Record<string, unknown> = {};

    if (category) {
      where.categoryId = category;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { itemName: { contains: search } },
      ];
    }

    const posts = await db.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            trustScore: true,
            college: true,
            isVerified: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await db.post.count({ where });

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    // For demo, we'll use a mock user ID
    // In production, this would come from auth session
    const body = await request.json();
    
    const {
      title,
      description,
      type,
      itemName,
      itemPrice,
      itemCondition,
      itemImage,
      maxParticipants,
      location,
      terms,
      startDate,
      endDate,
      categoryId,
      isUrgent,
      authorId,
    } = body;

    if (!title || !description || !type || !itemName || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const post = await db.post.create({
      data: {
        title,
        description,
        type,
        itemName,
        itemPrice: itemPrice || null,
        itemCondition: itemCondition || null,
        itemImage: itemImage || null,
        maxParticipants: maxParticipants || 1,
        location: location || null,
        terms: terms || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        categoryId,
        authorId,
        isUrgent: isUrgent || false,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            trustScore: true,
            college: true,
            isVerified: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
