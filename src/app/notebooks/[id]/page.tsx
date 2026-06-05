import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { checkNotebookAccess, canEditNotebook } from '@/lib/permissions';
import { db } from '@/lib/db';
import { AuthSession } from '@/lib/auth-types';
import Link from 'next/link';
import { NotebookDetailClient } from '@/components/notebook-detail-client';

interface Params {
  id: string;
}

export default async function NotebookDetail({ params }: { params: Params }) {
  const session = (await getServerSession(authConfig)) as AuthSession | null;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check access
  const access = await checkNotebookAccess(session.user.id, params.id);
  if (!access) {
    redirect('/dashboard');
  }

  const canEdit = await canEditNotebook(session.user.id, params.id);

  // Fetch notebook and notes
  const notebook = await db.notebook.findUnique({
    where: { id: params.id },
    include: {
      notes: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!notebook) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/dashboard" className="text-indigo-600 hover:underline mb-4 block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{notebook.title}</h1>
              <p className="text-gray-600 mt-1">{notebook.description}</p>
            </div>
            <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded">
              {access}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <NotebookDetailClient
          notebookId={params.id}
          notes={notebook.notes}
          members={notebook.members}
          canEdit={canEdit}
          userId={session.user.id}
        />
      </div>
    </main>
  );
}
