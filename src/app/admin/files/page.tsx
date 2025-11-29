// src/app/admin/files/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminFilesPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/files');
  }
  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    redirect('/');
  }
  return (
    <div className="container max-w-5xl py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">File Management</h1>
        <p className="text-muted-foreground">Reindex files, check status, and manage file operations.</p>
      </div>
      <div className="text-center py-12 text-muted-foreground">
        File management tools coming soon...
      </div>
    </div>
  );
}
