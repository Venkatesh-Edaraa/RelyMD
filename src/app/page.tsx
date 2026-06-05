import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { AuthSession } from '@/lib/auth-types';
import Link from 'next/link';

export default async function Home() {
  const session = (await getServerSession(authConfig)) as AuthSession | null;

  // Redirect to dashboard if already authenticated
  if (session?.user?.id) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">RelyMD</h1>
          <p className="text-xl text-gray-600">Collaborative Notebooks</p>
        </div>

        <div className="space-y-4 bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-600">
            Create and share notebooks with granular permissions. Collaborate with ease.
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="block w-full bg-white text-indigo-600 border-2 border-indigo-600 font-semibold py-3 rounded-lg hover:bg-indigo-50 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p>Demo Credentials:</p>
          <p>Email: sarah.chen@techcorp.com</p>
          <p>Password: password123</p>
        </div>
      </div>
    </main>
  );
}
