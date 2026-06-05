import { db } from './db';

export type NotebookRole = 'OWNER' | 'EDITOR' | 'VIEWER';

// Check if user has access to notebook
export async function checkNotebookAccess(
  userId: string,
  notebookId: string
): Promise<NotebookRole | null> {
  const access = await db.notebookUser.findUnique({
    where: {
      userId_notebookId: {
        userId,
        notebookId,
      },
    },
  });

  return (access?.role as NotebookRole | null) ?? null;
}

// Check if user has permission (OWNER or EDITOR can write)
export async function canEditNotebook(
  userId: string,
  notebookId: string
): Promise<boolean> {
  const role = await checkNotebookAccess(userId, notebookId);
  return role === 'OWNER' || role === 'EDITOR';
}

// Only OWNER can manage notebook
export async function isNotebookOwner(
  userId: string,
  notebookId: string
): Promise<boolean> {
  const role = await checkNotebookAccess(userId, notebookId);
  return role === 'OWNER';
}

// Get all notebooks for a user
export async function getUserNotebooks(userId: string) {
  return db.notebookUser.findMany({
    where: { userId },
    include: {
      notebook: {
        include: {
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
          notes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}
