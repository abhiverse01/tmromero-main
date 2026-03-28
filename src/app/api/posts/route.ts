import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  const allPosts = [
    {
      id: 'post_1',
      title: 'Group Buy: MacBook Air M3',
      description: 'Looking for 3 more people to join a group buy for the new MacBook Air M3!',
      type: 'CO_BUY',
      categoryId: '1',
      itemName: 'MacBook Air M3',
      itemPrice: 1099,
      itemCondition: 'new',
      itemImage: null,
      maxParticipants: 5,
      currentParticipants: 2,
      location: 'University Tech Store',
      terms: 'Payment due upfront',
      startDate: '2024-04-01T00:00:00.000Z',
      endDate: '2024-04-15T00:00:00.000Z',
      status: 'OPEN',
      isUrgent: true,
      authorId: 'user_1',
      createdAt: '2024-03-20T00:00:00.000Z',
      updatedAt: '2024-03-20T00:00:00.000Z',
      author: {
        id: 'user_1',
        name: 'Alex Johnson',
        email: 'alex@university.edu',
        image: null,
        trustScore: 4.8,
        college: 'State University',
        isVerified: true
      },
      category: {
        id: '1',
        name: 'Electronics',
        icon: '💻',
        description: 'Gadgets and devices',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    },
    {
      id: 'post_2',
      title: 'Calculus Textbook Share',
      description: 'Need Calculus Early Transcendentals 8th edition. Split cost?',
      type: 'SHARE',
      categoryId: '2',
      itemName: 'Calculus Early Transcendentals 8th Ed',
      itemPrice: 120,
      itemCondition: 'new',
      itemImage: null,
      maxParticipants: 3,
      currentParticipants: 1,
      location: 'Library',
      terms: 'Rotate who keeps it',
      startDate: null,
      endDate: null,
      status: 'OPEN',
      isUrgent: false,
      authorId: 'user_2',
      createdAt: '2024-03-22T00:00:00.000Z',
      updatedAt: '2024-03-22T00:00:00.000Z',
      author: {
        id: 'user_2',
        name: 'Sarah Chen',
        email: 'sarah@college.edu',
        image: null,
        trustScore: 4.5,
        college: 'Tech Institute',
        isVerified: true
      },
      category: {
        id: '2',
        name: 'Books',
        icon: '📚',
        description: 'Textbooks and novels',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  ];

  const posts = allPosts.slice(offset, offset + limit);
  
  return NextResponse.json({ posts, total: allPosts.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.title || !body.description || !body.type || !body.itemName || !body.categoryId || !body.authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newPost = {
      id: `post_${Date.now()}`,
      ...body,
      currentParticipants: 0,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: body.authorId,
        name: 'Demo User',
        email: 'demo@example.com',
        image: null,
        trustScore: 5.0,
        college: 'Demo College',
        isVerified: true
      },
      category: {
        id: body.categoryId,
        name: 'Category',
        icon: '📦',
        description: 'Demo category',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    };

    return NextResponse.json(newPost);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
