import { NextResponse } from 'next/server';

// Mock categories data
const MOCK_CATEGORIES = [
  { 
    id: 'cat_1', 
    name: 'Electronics', 
    icon: '💻', 
    description: 'Gadgets, laptops, phones, and tech accessories', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  },
  { 
    id: 'cat_2', 
    name: 'Books', 
    icon: '📚', 
    description: 'Textbooks, novels, study materials', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  },
  { 
    id: 'cat_3', 
    name: 'Furniture', 
    icon: '🪑', 
    description: 'Desks, chairs, storage, room essentials', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  },
  { 
    id: 'cat_4', 
    name: 'Clothing', 
    icon: '👕', 
    description: 'Apparel, accessories, shoes', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  },
  { 
    id: 'cat_5', 
    name: 'Services', 
    icon: '🛠️', 
    description: 'Tutoring, repairs, help, collaborations', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  },
  { 
    id: 'cat_6', 
    name: 'Transport', 
    icon: '🚗', 
    description: 'Carpool, bike share, trip planning', 
    createdAt: new Date('2024-01-01').toISOString(), 
    updatedAt: new Date('2024-01-01').toISOString() 
  }
];

export async function GET() {
  try {
    // Return mock categories sorted by name (matches your old code)
    const sortedCategories = MOCK_CATEGORIES.sort((a, b) => a.name.localeCompare(b.name));
    return NextResponse.json(sortedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
