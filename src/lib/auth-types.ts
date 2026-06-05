import type { Session } from 'next-auth';

export interface AuthSession extends Session {
  user?: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };
}

export interface RequestContext {
  session: AuthSession | null;
  userId?: string;
}

// Helper to get user from session
export function getUserIdFromSession(session: AuthSession | null): string | null {
  if (!session?.user?.id) return null;
  return session.user.id;
}

// Helper to check if user is authenticated
export function isAuthenticated(session: AuthSession | null): boolean {
  return Boolean(session?.user?.id);
}
