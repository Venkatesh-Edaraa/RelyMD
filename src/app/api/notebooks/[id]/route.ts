import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { db } from '@/lib/db';
import { checkNotebookAccess } from '@/lib/permissions';
import { AuthSession } from '@/lib/auth-types';

export async function GET(
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

    // Check access
    const access = await checkNotebookAccess(session.user.id, params.id);
    if (!access) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const notebook = await db.notebook.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        notes: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!notebook) {
      return NextResponse.json(
        { error: 'Notebook not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Notebook fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notebook' },
      { status: 500 }
    );
  }
}
