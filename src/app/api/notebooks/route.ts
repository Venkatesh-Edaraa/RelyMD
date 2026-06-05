import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { db } from '@/lib/db';
import { z } from 'zod';
import { AuthSession } from '@/lib/auth-types';

const createNotebookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authConfig)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description } = createNotebookSchema.parse(body);

    // Create notebook with owner role
    const notebook = await db.notebook.create({
      data: {
        title,
        description,
        members: {
          create: {
            userId: session.user.id,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: true,
        notes: true,
      },
    });

    return NextResponse.json(notebook, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Notebook creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create notebook' },
      { status: 500 }
    );
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = (await getServerSession(authConfig)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all notebooks for user
    const userNotebooks = await db.notebookUser.findMany({
      where: { userId: session.user.id },
      include: {
        notebook: {
          include: {
            members: true,
            notes: true,
          },
        },
      },
    });

    return NextResponse.json(userNotebooks);
  } catch (error) {
    console.error('Notebook fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notebooks' },
      { status: 500 }
    );
  }
}
