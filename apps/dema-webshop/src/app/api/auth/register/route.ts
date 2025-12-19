import { NextRequest, NextResponse } from 'next/server';

// In production, this would connect to a database
// For now, we'll simulate registration and store in memory (resets on server restart)
const registeredUsers: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, phone, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const normalizedEmail = email.toLowerCase();
    if (registeredUsers.has(normalizedEmail)) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // In production: Hash password and store in database
    // For demo purposes, we'll just store the user data
    const user = {
      id: `user_${Date.now()}`,
      name,
      email: normalizedEmail,
      company: company || null,
      phone: phone || null,
      createdAt: new Date().toISOString(),
      // In production: store hashed password, not plain text
      // passwordHash: await bcrypt.hash(password, 10),
    };

    registeredUsers.set(normalizedEmail, user);

    // Log registration (in production, this would be proper logging)
    console.log(`New user registered: ${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
