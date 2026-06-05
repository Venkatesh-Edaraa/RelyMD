import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { getUserNotebooks } from '@/lib/permissions';
import { AuthSession } from '@/lib/auth-types';
import Link from 'next/link';

export default async function Dashboard() {
  const session = (await getServerSession(authConfig)) as AuthSession | null;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const userNotebooks = await getUserNotebooks(session.user.id);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">RelyMD</h1>
            <p className="text-gray-600">Welcome, {session.user.name || 'User'}</p>
          </div>
          <Link
            href="/api/auth/signout"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Your Notebooks</h2>
          <Link
            href="/notebooks/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + New Notebook
          </Link>
        </div>

        {userNotebooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">You don't have any notebooks yet.</p>
            <Link
              href="/notebooks/new"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Notebook
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNotebooks.map((nb) => (
              <Link
                key={nb.notebook.id}
                href={`/notebooks/${nb.notebook.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600">
                    {nb.notebook.title}
                  </h3>
                  <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {nb.role}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {nb.notebook.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{nb.notebook.notes.length} notes</span>
                  <span>{nb.notebook.members.length} members</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
