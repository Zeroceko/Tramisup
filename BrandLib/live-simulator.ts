import { runOrchestrator } from './orchestrator';
import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const ONE_MINUTE = 60 * 1000;

async function runLiveTick(product: any, dayOffset: number) {
  console.log(`\n======================================================`);
  console.log(`🕒 [CANLI SİMÜLATÖR] GÜN ${dayOffset} (Geçek Zaman: ${new Date().toLocaleTimeString()})`);
  console.log(`======================================================\n`);
  
  // Eğer gün < 24 ise Pre-Launch aşaması
  if (dayOffset <= 23) {
      console.log(`📊 DURUM: Lansmana ${24 - dayOffset} gün var. Ürün Adı: ${product.name}`);
      
      const prompt = `Bugün uygulamamın (Tiramisup Live Demo) lansmanına ${24 - dayOffset} gün kaldı. Launch Checklist'imden 1 maddeyi daha kapatıp Task'ı bitirdim. Şu an sence eksigim ne? Yönlendir beni.`;
      console.log(`👤 FOUNDER: ${prompt}`);
      
      const aiResponse = await runOrchestrator(prompt, product.id);
      console.log(`🤖 AI MENTOR:\n${aiResponse}\n`);

      if (dayOffset === 23) {
          await prisma.product.update({ where: { id: product.id }, data: { status: 'LAUNCHED', launchStatus: 'Yayında', businessModel: 'B2B SaaS' }});
          console.log(`🚀 BÜYÜK AN! ÜRÜN YAYINA ALINDI! (Day 23 tamamlandı) / DB Status -> 'LAUNCHED'`);
      }
  } else {
      // Gün 24 ve sonrası Büyüme (Growth)
      const growthDay = dayOffset - 23;
      await prisma.product.update({ where: { id: product.id }, data: { status: 'GROWING', launchStatus: 'Büyüme aşamasında' }});
      
      console.log(`📈 DURUM: Büyüme Aşaması - Gün ${growthDay}`);
      const signups = 20 + Math.floor(Math.random() * 50); // 20-70 arası

      const prompt = `Bugün post-launch ${growthDay}. gündeyiz. ${signups} yeni profil kaydı oldu. Bunu metrik sistemine eklesek sence hangi AARRR hunisindeki sorunu çözer? Bize odaklanacak Checklist adımı ver.`;
      console.log(`👤 FOUNDER: ${prompt}`);
      
      const aiResponse = await runOrchestrator(prompt, product.id);
      console.log(`🤖 AI GROWTH MENTOR:\n${aiResponse}\n`);

      // Gerçek DB'ye Metrik gir
      const virtualDate = new Date();
      virtualDate.setDate(virtualDate.getDate() + dayOffset);
      await prisma.metric.upsert({
          where: { productId_date: { productId: product.id, date: virtualDate } },
          update: { dau: 100 + (growthDay * 15), newSignups: signups },
          create: { productId: product.id, date: virtualDate, dau: 100 + (growthDay * 15), newSignups: signups, source: 'INTEGRATION' }
      });
      console.log(`✓ Veritabanına Günlük DAU (%d) ve Signups (%d) verisi işlendi.`, 100 + (growthDay * 15), signups);
  }
}

async function main() {
  console.log('🌟 TIRAMISUP CANLI SİMULTATÖR BAŞLATILIYOR (1 Dakika = 1 Sanal Gün) 🌟\n');
  const passwordHash = await bcrypt.hash('pwd123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'live_founder@tiramisup.ai' },
    update: { passwordHash },
    create: { email: 'live_founder@tiramisup.ai', name: 'Canlı Kurucu', passwordHash }
  });

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name: `Live 53-Day App #${Math.floor(Math.random() * 1000)}`,
      description: 'Gerçek zamanlı AI mentor test ürünü',
      status: 'PRE_LAUNCH',
      launchStatus: 'Yakında yayında'
    }
  });

  console.log(`✅ Sanal Kurucu DB'ye Girdi. Hesap: live_founder@tiramisup.ai | Product ID: ${product.id}`);

  let currentDay = 1;
  await runLiveTick(product, currentDay);

  setInterval(async () => {
    currentDay++;
    if (currentDay > 53) {
        console.log('\n🏁 53 GÜNLÜK CANLI SİMULATÖR TAMAMLANDI.');
        process.exit(0);
    }
    await runLiveTick(product, currentDay);
  }, ONE_MINUTE);
}

main().catch(console.error);
