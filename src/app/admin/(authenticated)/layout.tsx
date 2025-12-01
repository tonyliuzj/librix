'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Server, Settings } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="min-h-screen">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4">
          <nav className="flex gap-6 py-4">
            <Link
              href="/admin/backends"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary pb-2 border-b-2",
                isActive('/admin/backends')
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent"
              )}
            >
              <Server className="h-4 w-4" />
              Backends
            </Link>
            <Link
              href="/admin/settings"
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary pb-2 border-b-2",
                isActive('/admin/settings')
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent"
              )}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
