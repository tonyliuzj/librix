// scripts/migrate-passwords.ts
// This script migrates plain text passwords to bcrypt hashed passwords
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'data.db');
const db = new Database(dbPath);

async function migratePasswords() {
  console.log('Starting password migration...');

  try {
    const users = db.prepare('SELECT * FROM users').all() as Array<{
      id: number;
      username: string;
      password: string;
    }>;

    console.log(`Found ${users.length} user(s) to check`);

    let migratedCount = 0;

    for (const user of users) {
      // Check if password is already hashed
      const isHashed = user.password.startsWith('$2');

      if (!isHashed) {
        console.log(`Migrating password for user: ${user.username}`);
        const hashedPassword = await bcrypt.hash(user.password, 10);

        db.prepare('UPDATE users SET password = ? WHERE id = ?').run(
          hashedPassword,
          user.id
        );

        migratedCount++;
        console.log(`✓ Password hashed for user: ${user.username}`);
      } else {
        console.log(`✓ Password already hashed for user: ${user.username}`);
      }
    }

    console.log(`\nMigration complete! ${migratedCount} password(s) migrated.`);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

migratePasswords();
