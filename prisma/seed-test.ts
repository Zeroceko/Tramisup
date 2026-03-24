import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 5 Test Personas based on SCENARIO_TEST_PLAN.md...');
  const passwordHash = await bcrypt.hash('testpassword', 10);

  // Helper
  const createUser = async (email: string, name: string) => {
    return prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name, passwordHash }
    });
  };

  // 1. Idea Stage (Pre-Launch)
  const u1 = await createUser('persona1@tiramisup.ai', 'The Idea Maker');
  await prisma.product.create({
    data: { userId: u1.id, name: 'IdeaApp', description: 'Just a raw idea', status: 'PRE_LAUNCH', launchStatus: 'Geliştirme aşamasında' }
  });

  // 2. Beta Launcher
  const u2 = await createUser('persona2@tiramisup.ai', 'The Beta Tester');
  await prisma.product.create({
    data: { userId: u2.id, name: 'BetaApp', status: 'PRE_LAUNCH', launchStatus: 'Test kullanıcıları var' }
  });

  // 3. Blind Scaler (Launched, NO Integration)
  const u3 = await createUser('persona3@tiramisup.ai', 'The Blind Scaler');
  await prisma.product.create({
    data: { userId: u3.id, name: 'BlindApp', status: 'LAUNCHED', launchStatus: 'Yayında', businessModel: 'SaaS - No Tracking' }
  });

  // 4. Leaky Bucket (Launched, Integrations, High Churn context)
  const u4 = await createUser('persona4@tiramisup.ai', 'The Leaky Founder');
  const p4 = await prisma.product.create({
    data: { userId: u4.id, name: 'LeakyApp', status: 'GROWING', launchStatus: 'Büyüme aşamasında', businessModel: 'Subscription' }
  });
  // Add integration
  await prisma.integration.create({ data: { productId: p4.id, provider: 'STRIPE', status: 'CONNECTED' } });
  
  // 5. Post-PMF Rocket
  const u5 = await createUser('persona5@tiramisup.ai', 'The Rocket Founder');
  const p5 = await prisma.product.create({
    data: { userId: u5.id, name: 'RocketApp', status: 'GROWING', launchStatus: 'Büyüme aşamasında' }
  });
  await prisma.integration.create({ data: { productId: p5.id, provider: 'GA4', status: 'CONNECTED' } });

  // 6. The Transitioner (End-to-end fluid flow)
  const u6 = await createUser('persona6@tiramisup.ai', 'The Transitioner');
  await prisma.product.create({
    data: { userId: u6.id, name: 'TransitionApp', status: 'PRE_LAUNCH', launchStatus: 'Yakında yayında' }
  });

  console.log('All 6 Test Personas seeded successfully!');
  console.log('You can now log in using these emails and password: "testpassword"');
}

main().catch(console.error).finally(() => prisma.$disconnect());
