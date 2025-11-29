'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Loader2, RefreshCw, Trash2, Edit2, LogOut, Server } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type Backend = {
  id: number;
  name: string;
  url: string;
  authEnabled: boolean;
  username?: string;
  password?: string;
  rescanInterval?: number | null;
};

export default function AdminClient() {
  const [backends, setBackends] = useState<Backend[]>([]);
  const [form, setForm] = useState<Partial<Backend>>({
    authEnabled: false,
    rescanInterval: null,
  });
  const [urlError, setUrlError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setBackends(await fetch('/api/backends').then((r) => r.json()));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    let url = form.url?.trim() || '';
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }

    const method = form.id ? 'PUT' : 'POST';
    const res = await fetch('/api/backends', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, url }),
    });
    const saved: Backend = await res.json();

    await fetch('/api/backends/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: saved.id }),
    });

    setBackends(await fetch('/api/backends').then((r) => r.json()));
    setForm({ authEnabled: false, rescanInterval: null });
    // Scroll to top or show success toast (todo)
  }

  async function rescan(id: number) {
    const btn = document.getElementById(`rescan-${id}`) as HTMLButtonElement;
    if (btn) btn.disabled = true;
    
    try {
        await fetch('/api/backends/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        });
        // You might want to use a toast here
        alert('Rescan triggered successfully');
    } catch (error) {
        console.error(error);
        alert('Failed to trigger rescan');
    } finally {
        if (btn) btn.disabled = false;
    }
  }

  async function deleteBackend() {
    if (deleteId === null) return;
    await fetch('/api/backends', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });
    setBackends(await fetch('/api/backends').then((r) => r.json()));
    setDeleteId(null);
  }

  function edit(b: Backend) {
    setForm({
      id: b.id,
      name: b.name,
      url: b.url,
      authEnabled: b.authEnabled,
      username: b.username,
      password: b.password,
      rescanInterval: b.rescanInterval ?? null,
    });
    setUrlError('');
    document.getElementById('backend-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function cancel() {
    setForm({ authEnabled: false, rescanInterval: null });
    setUrlError('');
  }

  return (
    <div className="container max-w-5xl py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your storage backends and settings.</p>
        </div>
        <Button variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Backends List */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>Configured Backends</CardTitle>
            <CardDescription>
                List of connected storage providers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : backends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No backends configured yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {backends.map((b) => (
                        <div key={b.id} className="flex flex-col space-y-2 p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary/10 text-primary p-2 rounded-full">
                                        <Server className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{b.name}</h4>
                                        <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">
                                            {b.url}
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => edit(b)}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Dialog open={deleteId === b.id} onOpenChange={(open) => setDeleteId(open ? b.id : null)}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete Backend</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to delete <strong>{b.name}</strong>? This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                                                <Button variant="destructive" onClick={deleteBackend}>Delete</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs pt-2">
                                <div className="flex gap-2">
                                    <Badge variant="outline">
                                        {b.rescanInterval == null ? 'Auto-scan disabled' : `Scan every ${b.rescanInterval}m`}
                                    </Badge>
                                    {b.authEnabled && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-transparent">
                                            Auth
                                        </Badge>
                                    )}
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    id={`rescan-${b.id}`}
                                    onClick={() => rescan(b.id)}
                                    className="h-7 text-xs"
                                >
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Rescan
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        <Card className="md:col-span-2 lg:col-span-1" id="backend-form">
          <CardHeader>
            <CardTitle>{form.id ? 'Edit Backend' : 'Add New Backend'}</CardTitle>
            <CardDescription>
                Configure connection details for a new storage backend.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    placeholder="My Documents"
                    value={form.name || ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                    id="url"
                    placeholder="http://localhost:8080"
                    value={form.url || ''}
                    onChange={(e) => {
                        const url = e.target.value;
                        setForm({ ...form, url });
                        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                          setUrlError('URL must start with http:// or https://');
                        } else {
                          setUrlError('');
                        }
                    }}
                />
                {urlError && <p className="text-sm text-destructive">{urlError}</p>}
            </div>

            <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="authEnabled" className="flex flex-col space-y-1">
                    <span>Enable Authentication</span>
                    <span className="font-normal text-xs text-muted-foreground">If the backend requires basic auth credentials.</span>
                </Label>
                <Switch
                    id="authEnabled"
                    checked={form.authEnabled || false}
                    onCheckedChange={(checked) => setForm({ ...form, authEnabled: checked })}
                />
            </div>

            {form.authEnabled && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={form.username || ''}
                            onChange={(e) => setForm({ ...form, username: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={form.password || ''}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <Label>Auto-rescan Interval</Label>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="rescan-never"
                            className="text-primary focus:ring-primary"
                            checked={form.rescanInterval == null}
                            onChange={() => setForm({ ...form, rescanInterval: null })}
                        />
                        <Label htmlFor="rescan-never" className="font-normal cursor-pointer">Never</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="rescan-interval"
                             className="text-primary focus:ring-primary"
                            checked={form.rescanInterval != null}
                            onChange={() => setForm({ ...form, rescanInterval: form.rescanInterval ?? 5 })}
                        />
                         <Label htmlFor="rescan-interval" className="font-normal cursor-pointer">Every</Label>
                     </div>
                     <div className="flex items-center space-x-2">
                        <Input
                            type="number"
                            min="1"
                            disabled={form.rescanInterval == null}
                            value={form.rescanInterval ?? ''}
                            onChange={(e) => setForm({ ...form, rescanInterval: Number(e.target.value) })}
                            className="w-20 h-8"
                        />
                        <span className="text-sm text-muted-foreground">minutes</span>
                     </div>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            {form.id && (
                <Button variant="outline" onClick={cancel}>
                    Cancel
                </Button>
            )}
            <Button onClick={save}>
                {form.id ? 'Update Backend' : 'Add Backend'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
