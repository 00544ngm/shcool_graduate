import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/class_memories?schema=public';
const adapter = new PrismaPg(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Users to keep
  const keepUsernames = ['lover', 'newadmin'];

  const toDelete = await prisma.user.findMany({
    where: { username: { notIn: keepUsernames } },
    select: { id: true, username: true, role: true },
  });

  console.log(`Found ${toDelete.length} users to delete:`);
  toDelete.forEach((u) => console.log(`  - ${u.username} (${u.role})`));

  const ids = toDelete.map((u) => u.id);

  // Delete in order to avoid FK violations (use Promise.all for unrelated tables)
  const [likesDel, commentsDel, momentsDel, photosDel, videosDel, favoritesDel, homeMessagesDel, notificationsDel, chatQuotasDel, lettersDel] = await Promise.all([
    prisma.like.deleteMany({ where: { userId: { in: ids } } }),
    prisma.comment.deleteMany({ where: { userId: { in: ids } } }),
    prisma.moment.deleteMany({ where: { userId: { in: ids } } }),
    prisma.photo.deleteMany({ where: { userId: { in: ids } } }),
    prisma.video.deleteMany({ where: { userId: { in: ids } } }),
    prisma.favorite.deleteMany({ where: { userId: { in: ids } } }),
    prisma.homeMessage.deleteMany({ where: { userId: { in: ids } } }),
    prisma.notification.deleteMany({ where: { userId: { in: ids } } }),
    prisma.chatQuota.deleteMany({ where: { userId: { in: ids } } }),
    prisma.futureLetter.deleteMany({ where: { userId: { in: ids } } }),
  ]);
  console.log(`Deleted ${likesDel.count} likes`);
  console.log(`Deleted ${commentsDel.count} comments`);
  console.log(`Deleted ${momentsDel.count} moments`);
  console.log(`Deleted ${photosDel.count} photos`);
  console.log(`Deleted ${videosDel.count} videos`);
  console.log(`Deleted ${favoritesDel.count} favorites`);
  console.log(`Deleted ${homeMessagesDel.count} home messages`);
  console.log(`Deleted ${notificationsDel.count} notifications`);
  console.log(`Deleted ${chatQuotasDel.count} chat quotas`);
  console.log(`Deleted ${lettersDel.count} future letters`);

  // Finally delete the users
  const [{ count: usersDel }] = await Promise.all([
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  console.log(`Deleted ${usersDel} users`);

  // Verify remaining
  const remaining = await prisma.user.findMany({ select: { username: true, role: true } });
  console.log('\nRemaining users:');
  remaining.forEach((u) => console.log(`  - ${u.username} (${u.role})`));

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
