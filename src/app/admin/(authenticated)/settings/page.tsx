'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required');
      return;
    }

    if (!newUsername && !newPassword) {
      setError('Please provide a new username or password');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update credentials');
        setLoading(false);
        return;
      }

      setSuccess('Credentials updated successfully! Redirecting to sign in...');
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');

      // Sign out and redirect to sign in page
      setTimeout(async () => {
        await signOut({ redirect: false });
        router.push('/admin/signin');
      }, 2000);
    } catch {
      setError('An error occurred while updating credentials');
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Change Credentials</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
              Current Password *
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
              disabled={loading}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Leave fields blank if you don&apos;t want to change them
            </p>

            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium mb-2">
                New Username
              </label>
              <input
                id="newUsername"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={loading}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={loading}
              />
            </div>

            <div className="mt-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
}
