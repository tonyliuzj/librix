// src/app/admin/backends/page.tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminClient from './admin-client';

export const dynamic = 'force-dynamic';

export default async function AdminBackendsPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/admin/backends');
  }
  const user = session.user as { role?: string };
  if (user.role !== 'admin') {
    redirect('/');
  }
  return <AdminClient />;
}
