import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { db } from '@/lib/db';
import { canEditNotebook } from '@/lib/permissions';
import { AuthSession } from '@/lib/auth-types';
import { z } from 'zod';

const createNoteSchema = z.object({
  notebookId: z.string(),
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
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
    const { notebookId, title, content } = createNoteSchema.parse(body);

    // Check edit permission
    const canEdit = await canEditNotebook(session.user.id, notebookId);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this notebook' },
        { status: 403 }
      );
    }

    // Create note
    const note = await db.note.create({
      data: {
        title,
        content,
        notebookId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Note creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
