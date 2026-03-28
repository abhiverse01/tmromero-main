import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();
// GET /api/admin/posts - List all posts with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    interface WhereClause {
      status?: string;
      type?: string;
      OR?: Array<{
        title?: { contains: string };
        description?: { contains: string };
        itemName?: { contains: string };
      }>;
    }
    const where: WhereClause = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { itemName: { contains: search } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true, trustScore: true },
          },
          category: { select: { id: true, name: true, icon: true } },
          _count: {
            select: { comments: true, joinRequests: true },
          },
        },
      }),
      db.post.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/posts - Update post status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, isUrgent } = body;

    const post = await db.post.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        isUrgent: isUrgent !== undefined ? isUrgent : undefined,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts - Delete post
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    // Delete related data first
    await db.comment.deleteMany({ where: { postId: id } });
    await db.joinRequest.deleteMany({ where: { postId: id } });
    
    // Delete post
    await db.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
