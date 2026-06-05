import { NextRequest } from 'next/server';
import { sendError, sendSuccess } from '@/lib/api-helpers';
import { db } from '@/lib/db';
import { z } from 'zod';

// For demo purposes - in production use bcrypt or similar
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError('User already exists', 409);
    }

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashPassword(password),
      },
    });

    return sendSuccess({
      id: user.id,
      email: user.email,
      name: user.name,
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return sendError(error.errors[0].message, 400);
    }
    console.error('Registration error:', error);
    return sendError('Registration failed', 500);
  }
}
