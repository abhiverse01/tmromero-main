import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/users - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    // Build where clause
    interface WhereClause {
      OR?: Array<{
        name?: { contains: string };
        email?: { contains: string };
        college?: { contains: string };
      }>;
    }
    const where: WhereClause = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { college: { contains: search } },
      ];
    }

    // Get users
    const users = await db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
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
      },
    });

    // Get total count
    const total = await db.user.count({ where });

    // Add isAdmin field manually from raw query since it may not be in cached types
    const userIds = users.map(u => u.id);
    const adminStatus = await db.$queryRaw<Array<{ id: string; isAdmin: number }>>`
      SELECT id, isAdmin FROM User WHERE id IN (${userIds.map(() => '?').join(',')})
    `.then(results => {
      const map = new Map<string, boolean>();
      results.forEach(r => map.set(r.id, Boolean(r.isAdmin)));
      return map;
    }).catch(() => new Map<string, boolean>());

    // Format users with isAdmin
    const formattedUsers = users.map(u => ({
      ...u,
      isAdmin: adminStatus.get(u.id) ?? false,
    }));

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user (verify/ban/admin)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isVerified, trustScore, isAdmin } = body;

    // Build update data
    interface UpdateData {
      isVerified?: boolean;
      trustScore?: number;
    }
    const updateData: UpdateData = {};
    
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (trustScore !== undefined) updateData.trustScore = trustScore;

    // Update standard fields with Prisma
    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id },
        data: updateData,
      });
    }

    // Update isAdmin field with raw query if needed
    if (isAdmin !== undefined) {
      await db.$executeRaw`
        UPDATE User SET isAdmin = ${isAdmin ? 1 : 0} WHERE id = ${id}
      `;
    }

    // Fetch updated user
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        college: true,
        isVerified: true,
        trustScore: true,
        createdAt: true,
      },
    });

    // Get isAdmin separately
    const adminCheck = await db.$queryRaw<Array<{ isAdmin: number }>>`
      SELECT isAdmin FROM User WHERE id = ${id}
    `;

    return NextResponse.json({
      ...user,
      isAdmin: Boolean(adminCheck[0]?.isAdmin),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    // Delete related data first
    await db.comment.deleteMany({ where: { authorId: id } });
    await db.joinRequest.deleteMany({ where: { senderId: id } });
    await db.joinRequest.deleteMany({ where: { receiverId: id } });
    await db.rating.deleteMany({ where: { giverId: id } });
    await db.rating.deleteMany({ where: { receiverId: id } });
    await db.post.deleteMany({ where: { authorId: id } });
    
    // Delete user
    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
