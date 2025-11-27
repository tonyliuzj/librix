'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, File, Folder, Film, Image as ImageIcon, Loader2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type SearchResult = {
  id: number;
  backendId: number;
  path: string;
  isDirectory: boolean;
};

type Backend = {
  id: number;
  name: string;
};

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [backends, setBackends] = useState<Backend[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const backendsRes = await fetch('/api/backends', { cache: 'no-store' });
        if (backendsRes.ok) {
          setBackends(await backendsRes.json());
        }
        
        if (q) {
          setLoading(true);
          const resultsRes = await fetch(`/api/files/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
          if (resultsRes.ok) {
            setResults(await resultsRes.json());
          } else {
            setResults([]);
          }
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [q]);

  const getFileIcon = (path: string, isDirectory: boolean) => {
    if (isDirectory) {
      return <Folder className="h-6 w-6 text-yellow-500" />;
    }
    const ext = path.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-6 w-6 text-purple-500" />;
    }
    if (['mp4', 'webm', 'mov'].includes(ext || '')) {
      return <Film className="h-6 w-6 text-red-500" />;
    }
    return <File className="h-6 w-6 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Search Files
        </h1>
        <p className="text-lg text-muted-foreground">
          Find documents, images, and media across all your backends.
        </p>
      </div>

      <form method="get" className="mb-12 relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search for files..."
            className="pl-9 h-10"
          />
        </div>
        <Button type="submit" size="default">
          Search
        </Button>
      </form>

      {loading && (
        <div className="flex justify-center my-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {!loading && q && results.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
            <p className="text-lg text-muted-foreground">
              No files found for {`"${q}"`}.
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight pl-1">
            {results.length} result{results.length === 1 ? '' : 's'} found
          </h2>
          <div className="grid gap-4">
            {results.map((r) => {
              const be = backends.find((b) => b.id === r.backendId);
              const backendName = be ? be.name : `Backend #${r.backendId}`;
              const fileName = r.path.split('/').pop();
              const dirPath = r.path.substring(0, r.path.lastIndexOf('/'));
              
              return (
                <Link
                  key={r.id}
                  href={r.isDirectory ? `/explorer?backendId=${r.backendId}&path=${encodeURIComponent(r.path)}` : `/viewer?backendId=${r.backendId}&path=${encodeURIComponent(r.path)}`}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getFileIcon(r.path, r.isDirectory)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">
                          {decodeURIComponent(fileName || r.path)}
                        </p>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {decodeURIComponent(dirPath) || '/'}
                        </p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {backendName}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
