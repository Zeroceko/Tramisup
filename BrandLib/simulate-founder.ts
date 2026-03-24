import { runOrchestrator } from './orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 VIRTUAL FOUNDER SIMULATION: 30 DAYS TO GLORY\n');

  // Create a clean Virtual Founder & Product
  const email = `founder_${Date.now()}@tiramisup.ai`;
  const user = await prisma.user.create({
    data: { email, name: 'Sanal Kurucu', passwordHash: 'dummy' }
  });

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name: 'VirtuSaaS',
      description: 'Dünyayı değiştirecek yepyeni bir AI B2B ürünü',
      status: 'PRE_LAUNCH',
      launchStatus: 'Geliştirme aşamasında'
    }
  });

  console.log(`✅ Sanal Kurucu Yaratıldı. Ürün ID: ${product.id}\n`);
  
  for (let day = 1; day <= 30; day++) {
    console.log(`\n========================================`);
    console.log(`🌅 GÜN ${day}`);
    console.log(`========================================`);

    // 1. Gününe göre Founder Promptu (Ne isteyecek?)
    let founderPrompt = "";
    if (day < 20) {
      founderPrompt = `Bugün Launch Checklist'imden 1 maddeyi daha Task'a çevirip bitirdim. Lansmana ${20 - day} günüm kaldı. Sence hızım iyi mi? Checklistimdeki bir sonraki önemli adım ne olmalı?`;
    } else if (day === 20) {
      // 20. Gün Lansman
      await prisma.product.update({ where: { id: product.id }, data: { status: 'LAUNCHED', launchStatus: 'Yayında' }});
      founderPrompt = `BUGÜN BÜYÜK GÜN! Ürünümü (VirtuSaaS) Product Hunt ve Twitter'da yayına aldım. Lansman günü için ilk odaklanmam gereken şey nedir?`;
    } else {
      // Post-launch Büyüme (Growth)
      await prisma.product.update({ where: { id: product.id }, data: { status: 'GROWING', launchStatus: 'Büyüme aşamasında' }});
      if (day === 21) {
          founderPrompt = `Lansman dün harikaydı. İlk trafiği aldık ama henüz GA4 veya Stripe hiçbir şey bağlamadım. Metriklerimi nasıl takip edeceğim?`;
      } else {
          const signups = 10 + Math.floor(Math.random() * 40); // 10 ile 50 arası rastgele kayıt
          founderPrompt = `GÜN ${day} Özeti: Bugün siteye gelenlerden ${signups} yeni kayıt aldık. Onboarding dönüşümlerini takip etmek için bunu bugünün günlük metriklerine (logMetric aracıyla) kaydeder misin?`;
      }
    }

    console.log(`👤 SANAL KURUCU: "${founderPrompt}"\n`);
    
    // 2. Orchestrator AI'den Yanıt Al
    const aiResponse = await runOrchestrator(founderPrompt, product.id);
    console.log(`🤖 TIRAMISUP AI (FOUNDER COACH):\n${aiResponse}\n`);

    // 3. Virtual Founder, sistemdeki her TODO taskını tamamlar (Gerçek hayatta check atar gibi)
    const pendingTasks = await prisma.task.findMany({ where: { productId: product.id, status: 'TODO' } });
    if (pendingTasks.length > 0) {
      console.log(`🛠️ SANAL KURUCU EYLEMİ: ${pendingTasks.length} adet Task tamamlanıyor...`);
      for (const t of pendingTasks) {
         console.log(`   ✓ YAPILDI (DONE): [${t.title}]`);
         await prisma.task.update({ where: { id: t.id }, data: { status: 'DONE' }});
      }
    }
  }

  console.log('\n🏁 30 GÜNLÜK KALİTE / DENEYİM SİMÜLASYONU TAMAMLANDI.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
