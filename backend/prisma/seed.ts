import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/class_memories?schema=public';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD environment variable is required for seeding');
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@classmemories.com';

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username: adminUsername }, { role: 'ADMIN' }] },
  });

  if (existing) {
    if (existing.role === 'ADMIN') {
      console.log(`Admin account already exists: ${existing.username}`);
    } else {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN' },
      });
      console.log(`Promoted ${existing.username} to ADMIN`);
    }
    return;
  }

  await prisma.user.create({
    data: {
      username: adminUsername,
      nickname: '管理员',
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: 'ADMIN',
    },
  });

  console.log(`Admin account created: ${adminUsername} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
