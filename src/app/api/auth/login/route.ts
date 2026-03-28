import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();import { randomUUID } from 'crypto';

function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      );
    }

    // Use $queryRaw to bypass the cached Prisma client types
    const users = await db.$queryRaw<Array<{
      id: string;
      email: string;
      name: string;
      image: string | null;
      bio: string | null;
      college: string | null;
      isVerified: number;
      isAdmin: number;
      trustScore: number;
    }>>`
      SELECT id, email, name, image, bio, college, isVerified, isAdmin, trustScore 
      FROM User 
      WHERE email = ${email}
    `;

    const user = users[0];

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (stored in bio for demo)
    const storedHash = user.bio?.replace('pwd:', '');
    const inputHash = simpleHash(password);

    if (storedHash !== inputHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate a simple token
    const token = randomUUID();

    // Return user without bio (which contains password hash)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        college: user.college,
        isVerified: Boolean(user.isVerified),
        isAdmin: Boolean(user.isAdmin),
        trustScore: user.trustScore,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
