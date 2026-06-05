import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { db } from '@/lib/db';
import { AuthSession } from '@/lib/auth-types';
import { z } from 'zod';

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authConfig)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const note = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Only allow note author to edit
    if (note.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own notes' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, content } = updateNoteSchema.parse(body);

    const updated = await db.note.update({
      where: { id: params.id },
      data: { title, content },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Note update error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authConfig)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const note = await db.note.findUnique({
      where: { id: params.id },
    });

    if (!note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    // Only allow note author to delete
    if (note.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own notes' },
        { status: 403 }
      );
    }

    await db.note.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Note deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
