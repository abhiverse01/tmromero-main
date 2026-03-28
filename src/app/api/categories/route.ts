import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json([
    { id: '1', name: 'Electronics', icon: '💻', description: 'Gadgets and devices', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '2', name: 'Books', icon: '📚', description: 'Textbooks and novels', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '3', name: 'Furniture', icon: '🪑', description: 'Room essentials', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '4', name: 'Clothing', icon: '👕', description: 'Apparel and accessories', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '5', name: 'Services', icon: '🛠️', description: 'Help and services', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' },
    { id: '6', name: 'Transport', icon: '🚗', description: 'Carpool and trips', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
  ]);
}
