import { NextRequest, NextResponse } from 'next/server';

// Mock users
const MOCK_USERS = [
  {
    id: 'user_1',
    name: 'Alex Johnson',
    email: 'alex@university.edu',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    trustScore: 4.8,
    college: 'State University',
    isVerified: true
  },
  {
    id: 'user_2',
    name: 'Sarah Chen',
    email: 'sarah@college.edu',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    trustScore: 4.5,
    college: 'Tech Institute',
    isVerified: true
  },
  {
    id: 'user_3',
    name: 'Mike Brown',
    email: 'mike@campus.edu',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    trustScore: 3.9,
    college: 'State University',
    isVerified: false
  }
];

// Mock categories (same as categories API)
const MOCK_CATEGORIES = [
  { id: 'cat_1', name: 'Electronics', icon: '💻', description: 'Gadgets and tech', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'cat_2', name: 'Books', icon: '📚', description: 'Study materials', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'cat_3', name: 'Furniture', icon: '🪑', description: 'Room essentials', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'cat_4', name: 'Clothing', icon: '👕', description: 'Apparel', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'cat_5', name: 'Services', icon: '🛠️', description: 'Help and services', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() },
  { id: 'cat_6', name: 'Transport', icon: '🚗', description: 'Carpool and trips', createdAt: new Date('2024-01-01').toISOString(), updatedAt: new Date('2024-01-01').toISOString() }
];

// Mock posts with full relations
const MOCK_POSTS = [
  {
    id: 'post_1',
    title: 'Group Buy: MacBook Air M3',
    description: 'Looking for 3 more people to join a group buy for the new MacBook Air M3. We can get educational pricing if we buy 5 together!',
    type: 'CO_BUY',
    categoryId: 'cat_1',
    itemName: 'MacBook Air M3',
    itemPrice: 1099,
    itemCondition: 'new',
    itemImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
    maxParticipants: 5,
    currentParticipants: 2,
    location: 'University Tech Store',
    terms: 'Payment due upfront. Pickup together next Friday.',
    startDate: new Date('2024-04-01').toISOString(),
    endDate: new Date('2024-04-15').toISOString(),
    status: 'OPEN',
    isUrgent: true,
    authorId: 'user_1',
    createdAt: new Date('2024-03-20').toISOString(),
    updatedAt: new Date('2024-03-20').toISOString()
  },
  {
    id: 'post_2',
    title: 'Calculus Textbook - Share Cost',
    description: 'Need Calculus Early Transcendentals 8th edition. Anyone want to split the cost and share?',
    type: 'SHARE',
    categoryId: 'cat_2',
    itemName: 'Calculus Early Transcendentals 8th Ed',
    itemPrice: 120,
    itemCondition: 'new',
    itemImage: null,
    maxParticipants: 3,
    currentParticipants: 1,
    location: 'Library',
    terms: 'We rotate who keeps it each week',
    startDate: null,
    endDate: null,
    status: 'OPEN',
    isUrgent: false,
    authorId: 'user_2',
    createdAt: new Date('2024-03-22').toISOString(),
    updatedAt: new Date('2024-03-22').toISOString()
  },
  {
    id: 'post_3',
    title: 'Desk Chair for Rent - $15/month',
    description: 'Ergonomic desk chair available for rent while I am studying abroad. Great condition!',
    type: 'RENT',
    categoryId: 'cat_3',
    itemName: 'Ergonomic Office Chair',
    itemPrice: 15,
    itemCondition: 'like_new',
    itemImage: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500',
    maxParticipants: 1,
    currentParticipants: 0,
    location: 'Dorm Building C',
    terms: 'Monthly payment, security deposit required',
    startDate: new Date('2024-04-01').toISOString(),
    endDate: new Date('2024-08-31').toISOString(),
    status: 'OPEN',
    isUrgent: false,
    authorId: 'user_1',
    createdAt: new Date('2024-03-25').toISOString(),
    updatedAt: new Date('2024-03-25').toISOString()
  },
  {
    id: 'post_4',
    title: 'Spring Break Road Trip to Miami',
    description: 'Planning a road trip to Miami for spring break. Looking for 2 more people to split gas and hotel costs!',
    type: 'TRIP',
    categoryId: 'cat_6',
    itemName: 'Miami Spring Break Trip',
    itemPrice: 200,
    itemCondition: null,
    itemImage: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=500',
    maxParticipants: 4,
    currentParticipants: 2,
    location: 'Miami, FL',
    terms: 'Split all costs equally, must be okay with long drives',
    startDate: new Date('2024-03-30').toISOString(),
    endDate: new Date('2024-04-05').toISOString(),
    status: 'IN_PROGRESS',
    isUrgent: true,
    authorId: 'user_3',
    createdAt: new Date('2024-03-15').toISOString(),
    updatedAt: new Date('2024-03-26').toISOString()
  },
  {
    id: 'post_5',
    title: 'Python Study Group - Join Us!',
    description: 'Weekly Python study group for CS101. We meet Tuesdays 7pm at the library. All levels welcome!',
    type: 'STUDY',
    categoryId: 'cat_5',
    itemName: 'Python Study Group',
    itemPrice: null,
    itemCondition: null,
    itemImage: null,
    maxParticipants: 8,
    currentParticipants: 5,
    location: 'Library Room 302',
    terms: 'Bring your laptop, free pizza provided',
    startDate: new Date('2024-03-01').toISOString(),
    endDate: new Date('2024-05-30').toISOString(),
    status: 'OPEN',
    isUrgent: false,
    authorId: 'user_2',
    createdAt: new Date('2024-02-28').toISOString(),
    updatedAt: new Date('2024-03-27').toISOString()
  },
  {
    id: 'post_6',
    title: 'iPhone 15 Pro Group Purchase',
    description: 'Carrier is offering buy 3 get 1 free. Need 2 more people to join!',
    type: 'CO_BUY',
    categoryId: 'cat_1',
    itemName: 'iPhone 15 Pro',
    itemPrice: 999,
    itemCondition: 'new',
    itemImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=500',
    maxParticipants: 4,
    currentParticipants: 2,
    location: 'Campus Mall',
    terms: 'Must activate with carrier, contract required',
    startDate: null,
    endDate: new Date('2024-04-10').toISOString(),
    status: 'OPEN',
    isUrgent: true,
    authorId: 'user_3',
    createdAt: new Date('2024-03-26').toISOString(),
    updatedAt: new Date('2024-03-26').toISOString()
  }
];

// Helper to add relations to posts
function enrichPost(post: typeof MOCK_POSTS[0]) {
  return {
    ...post,
    author: MOCK_USERS.find(u => u.id === post.authorId) || MOCK_USERS[0],
    category: MOCK_CATEGORIES.find(c => c.id === post.categoryId) || MOCK_CATEGORIES[0]
  };
}

// GET /api/posts - List posts with filters (matches your old code exactly)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter posts (matches your where clause logic)
    let filteredPosts = [...MOCK_POSTS];

    if (category) {
      filteredPosts = filteredPosts.filter(p => p.categoryId === category);
    }

    if (type) {
      filteredPosts = filteredPosts.filter(p => p.type === type);
    }

    if (status) {
      filteredPosts = filteredPosts.filter(p => p.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPosts = filteredPosts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.itemName.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredPosts.length;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    // Add relations (matches your include clause)
    const postsWithRelations = paginatedPosts.map(enrichPost);

    return NextResponse.json({ posts: postsWithRelations, total });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post (stores in memory only)
export async function POST(request: NextRequest) {
  try {
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

    // Validation (matches your old code)
    if (!title || !description || !type || !itemName || !categoryId || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new post (in memory only - will disappear on redeploy)
    const newPost = {
      id: `post_${Date.now()}`,
      title,
      description,
      type,
      itemName,
      itemPrice: itemPrice || null,
      itemCondition: itemCondition || null,
      itemImage: itemImage || null,
      maxParticipants: maxParticipants || 1,
      currentParticipants: 0,
      location: location || null,
      terms: terms || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
      categoryId,
      authorId,
      isUrgent: isUrgent || false,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add to mock data (temporary only)
    MOCK_POSTS.unshift(newPost);

    // Return with relations (matches your old include clause)
    const postWithRelations = enrichPost(newPost);
    return NextResponse.json(postWithRelations);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
