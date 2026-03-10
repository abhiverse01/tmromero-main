import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all statistics
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalJoinRequests,
      totalRatings,
      postsByStatus,
      postsByType,
      recentUsersData,
      recentPostsData,
    ] = await Promise.all([
      db.user.count(),
      db.post.count(),
      db.comment.count(),
      db.joinRequest.count(),
      db.rating.count(),
      db.post.groupBy({
        by: ['status'],
        _count: true,
      }),
      db.post.groupBy({
        by: ['type'],
        _count: true,
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true, college: true },
      }),
      db.post.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          author: { select: { name: true } },
          category: { select: { name: true, icon: true } },
        },
      }),
    ]);

    // Calculate average trust score
    const avgTrustScore = await db.user.aggregate({
      _avg: { trustScore: true },
    });

    // Get pending join requests count
    const pendingRequests = await db.joinRequest.count({
      where: { status: 'PENDING' },
    });

    // Get active posts count
    const activePosts = await db.post.count({
      where: { status: 'OPEN' },
    });

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalJoinRequests,
        totalRatings,
        pendingRequests,
        activePosts,
        avgTrustScore: avgTrustScore._avg.trustScore || 0,
      },
      postsByStatus: postsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      postsByType: postsByType.reduce((acc, item) => {
        acc[item.type] = item._count;
        return acc;
      }, {} as Record<string, number>),
      recentUsers: recentUsersData,
      recentPosts: recentPostsData,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
