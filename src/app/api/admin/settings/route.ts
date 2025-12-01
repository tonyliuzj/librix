// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import db from '@/utils/db';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string };
  if (!session || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function PUT(req: NextRequest) {
  try {
    const authErr = await requireAdmin();
    if (authErr) return authErr;

    const { currentPassword, newUsername, newPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }

    if (!newUsername && !newPassword) {
      return NextResponse.json(
        { error: 'New username or password is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUser = session?.user?.name;

    // Get current user from database
    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(currentUser) as { id: number; username: string; password: string } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update username and/or password
    if (newUsername && newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET username = ?, password = ? WHERE id = ?')
        .run(newUsername, hashedPassword, user.id);
    } else if (newUsername) {
      db.prepare('UPDATE users SET username = ? WHERE id = ?')
        .run(newUsername, user.id);
    } else if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.prepare('UPDATE users SET password = ? WHERE id = ?')
        .run(hashedPassword, user.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Credentials updated successfully'
    });
  } catch (error) {
    console.error('Error updating admin credentials:', error);
    return NextResponse.json(
      { error: 'Failed to update credentials' },
      { status: 500 }
    );
  }
}
