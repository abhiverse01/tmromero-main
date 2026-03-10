import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

// Simple password hashing (in production, use bcrypt)
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
    const { email, name, password, college } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user with hashed password stored in bio (hacky for demo)
    const user = await db.user.create({
      data: {
        email,
        name,
        college: college || null,
        bio: `pwd:${simpleHash(password)}`, // Store password hash in bio (for demo only)
        trustScore: 0,
        isVerified: false,
      },
    });

    // Generate a simple token
    const token = randomUUID();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        college: user.college,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        trustScore: user.trustScore,
      },
      token,
    });
  } catch (error) {
    console.error('Error signing up:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
