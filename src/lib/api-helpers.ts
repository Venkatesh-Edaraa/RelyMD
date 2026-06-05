import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/api/auth/[...nextauth]/config';
import { AuthSession } from './auth-types';

export type ApiHandler = (
  req: NextRequest,
  context: { params?: Record<string, string> }
) => Promise<NextResponse>;

export function withAuth(handler: (session: AuthSession) => ApiHandler): ApiHandler {
  return async (req, context) => {
    const session = (await getServerSession(authConfig)) as AuthSession | null;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return handler(session)(req, context);
  };
}

export function sendError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function sendSuccess(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
