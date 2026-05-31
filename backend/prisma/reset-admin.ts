import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/class_memories?schema=public';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync('admin123', salt, 100000, 64, 'sha512').toString('hex');
  const pw = `${salt}:${hash}`;

  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { passwordHash: pw, nickname: '管理员' },
    });
    console.log(`Admin password reset. Username: ${existing.username} / Password: admin123`);
  } else {
    await prisma.user.create({
      data: {
        username: 'admin',
        nickname: '管理员',
        email: 'admin@classmemories.com',
        passwordHash: pw,
        role: 'ADMIN',
      },
    });
    console.log('Admin created: admin / admin123');
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
