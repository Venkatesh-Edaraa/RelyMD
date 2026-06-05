'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Note, NotebookUser } from '@prisma/client';

interface NoteWithUser extends Note {
  user?: { id: string; name: string | null; email: string }; // ✅ made optional
}

interface NotebookMember extends NotebookUser {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Props {
  notebookId: string;
  notes: NoteWithUser[];
  members: NotebookMember[];
  canEdit: boolean;
  userId: string;
}

function formatNoteDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

export function NotebookDetailClient({
  notebookId,
  notes: initialNotes,
  members,
  canEdit,
  userId,
}: Props) {
  const [notes, setNotes] = useState<NoteWithUser[]>(initialNotes);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [selectedNote, setSelectedNote] = useState<NoteWithUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateNote = async (title: string, content: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebookId, title, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create note');
        return;
      }

      const newNote = await response.json();

      // ✅ Safety check
      if (!newNote.user) {
        console.warn('User missing in new note response', newNote);
      }

      setNotes((prev) => [newNote, ...prev]);
      setShowNewNoteForm(false);
    } catch (err) {
      setError('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId: string, title: string, content: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update note');
        return;
      }

      const updated = await response.json();

      if (!updated.user) {
        console.warn('User missing in updated note response', updated);
      }

      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      setSelectedNote(updated);
    } catch (err) {
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Failed to delete note');
        return;
      }

      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      setSelectedNote(null);
    } catch (err) {
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Notes List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Notes</h2>
            {canEdit && (
              <button
                onClick={() => setShowNewNoteForm(true)}
                className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                + Add Note
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3">
              {error}
            </div>
          )}

          {showNewNoteForm && canEdit && (
            <NoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowNewNoteForm(false)}
              loading={loading}
            />
          )}

          {selectedNote ? (
            <NoteDetailView
              note={selectedNote}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
              onClose={() => setSelectedNote(null)}
              canEdit={canEdit && selectedNote.userId === userId}
              loading={loading}
            />
          ) : (
            <div className="divide-y">
              {notes.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No notes yet. {canEdit && 'Create your first note to get started.'}
                </div>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition"
                  >
                    <h3 className="font-semibold text-gray-900">{note.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {note.content}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      {/* ✅ FIXED HERE */}
                      <span className="text-xs text-gray-500">
                        {note.user?.name ?? 'Unknown'}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatNoteDate(note.createdAt)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Members */}
      <div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Members</h2>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {member.user.name ?? 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-600">{member.user.email}</p>
                </div>
                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteForm({
  onSubmit,
  onCancel,
  loading,
}: {
  onSubmit: (title: string, content: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit(title, content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border-b space-y-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Note title"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Note content"
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Note'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

interface NoteDetailViewProps {
  note: NoteWithUser;
  onUpdate: (id: string, title: string, content: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  canEdit: boolean;
  loading: boolean;
}

function NoteDetailView({
  note,
  onUpdate,
  onDelete,
  onClose,
  canEdit,
  loading,
}: NoteDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onUpdate(note.id, title, content);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={onClose}
        className="text-indigo-600 hover:underline text-sm mb-2"
      >
        ← Back to list
      </button>
      <h3 className="text-2xl font-semibold text-gray-900">{note.title}</h3>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {note.user?.name ?? 'Unknown'} on {formatNoteDate(note.createdAt)}
        </span>
      </div>
      <article className="prose prose-sm max-w-none text-gray-700">
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </article>
      {canEdit && (
        <div className="flex gap-2 pt-4">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
