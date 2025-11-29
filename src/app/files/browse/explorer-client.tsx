'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Folder, File, Film, Image as ImageIcon, Database, ArrowLeft, Loader2, HardDrive } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

type Entry = {
  id: number;
  name: string;
  path: string;
  isDirectory: boolean;
};

export default function ExplorerClient() {
  const router = useRouter();
  const params = useSearchParams();
  const backendIdParam = params.get('backendId') || '';
  const pathParam = params.get('path') || '/';
  const backendId = backendIdParam ? Number(backendIdParam) : null;

  const [backends, setBackends] = useState<{ id: number; name: string }[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/backends')
      .then(r => r.json())
      .then(setBackends);
  }, []);

  useEffect(() => {
    if (backendId != null) {
      setLoading(true);
      setEntries([]);
      fetch(`/api/files/explorer?backendId=${backendId}&path=${encodeURIComponent(pathParam)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Sort: Directories first, then files
            data.sort((a, b) => {
              if (a.isDirectory && !b.isDirectory) return -1;
              if (!a.isDirectory && b.isDirectory) return 1;
              return a.name.localeCompare(b.name);
            });
            setEntries(data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [backendId, pathParam]);

  const updateUrl = (newBackend: number | null, newPath: string) => {
    const url = newBackend
      ? `/files/browse?backendId=${newBackend}&path=${encodeURIComponent(newPath)}`
      : '/files/browse';
    router.push(url);
    setMobileSidebarOpen(false);
  };

  const getBreadcrumbs = () => {
    const parts = pathParam.split('/').filter(Boolean);
    let currentPath = '';
    return parts.map((part, index) => {
      currentPath += '/' + part;
      return {
        name: decodeURIComponent(part),
        path: currentPath,
        isLast: index === parts.length - 1
      };
    });
  };

  const getFileIcon = (isDirectory: boolean, name: string) => {
    if (isDirectory) {
      return <Folder className="h-8 w-8 text-yellow-500" />;
    }
    const ext = name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-8 w-8 text-purple-500" />;
    }
    if (['mp4', 'webm', 'mov'].includes(ext || '')) {
      return <Film className="h-8 w-8 text-red-500" />;
    }
    if (['pdf'].includes(ext || '')) {
        return <File className="h-8 w-8 text-red-600" />;
    }
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold tracking-tight">Storage</h2>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
            {backends.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">No backends configured</div>
            )}
            {backends.map(b => (
            <Button
                key={b.id}
                variant={b.id === backendId ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => updateUrl(b.id, '/')}
            >
                <HardDrive className="mr-2 h-4 w-4" />
                {b.name}
            </Button>
            ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] pt-16">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Mobile Header / Sidebar Toggle */}
        <div className="md:hidden flex items-center p-4 border-b">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="mr-2">
                        <Database className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <span className="font-semibold truncate">
                {backendId ? backends.find(b => b.id === backendId)?.name : 'Select Storage'}
            </span>
        </div>

        {backendId != null ? (
            <>
                {/* Breadcrumbs */}
                <div className="flex items-center px-4 py-3 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateUrl(backendId, '/')}
                        className="mr-2"
                        title="Go to root"
                    >
                        <HardDrive className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <ScrollArea className="flex-1 whitespace-nowrap">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                     <BreadcrumbLink 
                                        onClick={() => updateUrl(backendId, '/')}
                                        className="cursor-pointer"
                                     >
                                        Root
                                     </BreadcrumbLink>
                                </BreadcrumbItem>
                                {getBreadcrumbs().map((crumb) => (
                                    <React.Fragment key={crumb.path}>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            {crumb.isLast ? (
                                                <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink 
                                                    onClick={() => updateUrl(backendId, crumb.path)}
                                                    className="cursor-pointer"
                                                >
                                                    {crumb.name}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </ScrollArea>
                </div>

                {/* File List */}
                <ScrollArea className="flex-1 p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {pathParam !== '/' && (
                                <Card
                                    className="cursor-pointer hover:bg-accent/50 transition-colors border-dashed"
                                    onClick={() => {
                                        const parts = pathParam.split('/').filter(Boolean);
                                        parts.pop();
                                        const parent = parts.length > 0 ? '/' + parts.join('/') : '/';
                                        updateUrl(backendId, parent);
                                    }}
                                >
                                    <CardContent className="flex flex-col items-center justify-center p-4 h-full aspect-square">
                                        <ArrowLeft className="h-8 w-8 text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium text-muted-foreground">Back</span>
                                    </CardContent>
                                </Card>
                            )}
                            
                            {entries.length === 0 && pathParam === '/' ? (
                                <div className="col-span-full text-center py-12 text-muted-foreground">
                                    Folder is empty
                                </div>
                            ) : (
                                entries.map(e => (
                                    <Card
                                        key={e.id}
                                        className="group cursor-pointer hover:bg-accent/50 transition-all hover:shadow-md"
                                        onClick={() => {
                                            if (e.isDirectory) {
                                                const dir = e.path.endsWith('/') ? e.path : e.path + '/';
                                                updateUrl(backendId, dir);
                                            } else {
                                                router.push(`/files/${e.id}?backendId=${backendId}&path=${encodeURIComponent(e.path)}`);
                                            }
                                        }}
                                    >
                                        <CardContent className="flex flex-col items-center p-4 h-full">
                                            <div className="flex-1 flex items-center justify-center mb-3">
                                                {getFileIcon(e.isDirectory, e.name)}
                                            </div>
                                            <div className="w-full text-center">
                                                <p className="text-sm font-medium truncate w-full" title={decodeURIComponent(e.name)}>
                                                    {decodeURIComponent(e.name)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {e.isDirectory ? 'Folder' : e.name.split('.').pop()?.toUpperCase() || 'File'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </ScrollArea>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4">
                <HardDrive className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg">Select a storage backend to browse files</p>
            </div>
        )}
      </main>
    </div>
  );
}
