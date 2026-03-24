import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TWO_MINUTES = 2 * 60 * 1000;
let simulatedDayOffset = 0;

async function runSimulationTick() {
  simulatedDayOffset++;
  console.log(`\n⏳ [SIMULATOR] SANAL GÜN ${simulatedDayOffset} BAŞLADI... (Gerçek Zaman: '${new Date().toLocaleTimeString()}')`);

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const virtualDate = new Date();
    virtualDate.setDate(virtualDate.getDate() + simulatedDayOffset);

    // 1. Product 4 (The Leaky Bucket): DAU düşüyor, Churn artıyor
    let p4 = await prisma.product.findFirst({ where: { name: 'LeakyApp' } });
    if (p4) {
      await prisma.metric.upsert({
        where: { productId_date: { productId: p4.id, date: virtualDate } },
        update: {
          dau: Math.max(10, 100 - (simulatedDayOffset * 15)),
          churnedUsers: 20 + (simulatedDayOffset * 8)
        },
        create: {
          productId: p4.id, date: virtualDate, source: 'INTEGRATION',
          dau: Math.max(10, 100 - (simulatedDayOffset * 15)),
          churnedUsers: 20 + (simulatedDayOffset * 8), newSignups: 50
        }
      });
      console.log(`💧 LeakyApp: Veriler kötüleşti (Kova su sızdırıyor).`);
    }

    // 2. Product 5 (The Rocket): DAU ve MRR artıyor
    let p5 = await prisma.product.findFirst({ where: { name: 'RocketApp' } });
    if (p5) {
      await prisma.metric.upsert({
        where: { productId_date: { productId: p5.id, date: virtualDate } },
        update: {
          dau: 1000 + (simulatedDayOffset * 200),
          mrr: 5000 + (simulatedDayOffset * 500)
        },
        create: {
          productId: p5.id, date: virtualDate, source: 'INTEGRATION',
          dau: 1000 + (simulatedDayOffset * 200),
          mrr: 5000 + (simulatedDayOffset * 500), newSignups: 100
        }
      });
      console.log(`🚀 RocketApp: Veriler patladı (Roket havalanıyor).`);
    }

    // 3. Product 6 (The Transitioner): Uçtan uca durum değiştirme (Zamana bağlı Stage Değişimi)
    let p6 = await prisma.product.findFirst({ where: { name: 'TransitionApp' } });
    if (p6) {
      if (simulatedDayOffset === 2) {
        await prisma.product.update({
          where: { id: p6.id },
          data: { status: 'LAUNCHED', launchStatus: 'Yayında', businessModel: 'SaaS' }
        });
        console.log(`🎯 TransitionApp LANSBMAN YAPTI! (Bugün: Gün ${simulatedDayOffset}). Ürün artık 'Yayında'.`);
      } else if (simulatedDayOffset === 4) {
        await prisma.product.update({
          where: { id: p6.id },
          data: { status: 'GROWING', launchStatus: 'Büyüme aşamasında' }
        });
        
        // Stripe bağlansın
        const integrationExists = await prisma.integration.findUnique({ where: { productId_provider: { productId: p6.id, provider: 'STRIPE' } }});
        if (!integrationExists) {
            await prisma.integration.create({
              data: { productId: p6.id, provider: 'STRIPE', status: 'CONNECTED' }
            });
        }
        console.log(`📈 TransitionApp BÜYÜMEYE GEÇTİ! (Bugün: Gün ${simulatedDayOffset}). Stripe bağlandı.`);
      }

      // Gün 4 ve sonrasında metrik girmeye başla
      if (simulatedDayOffset >= 4) {
        await prisma.metric.upsert({
          where: { productId_date: { productId: p6.id, date: virtualDate } },
          update: { dau: 100 * simulatedDayOffset, mrr: 50 * simulatedDayOffset },
          create: { productId: p6.id, date: virtualDate, dau: 100 * simulatedDayOffset, mrr: 50 * simulatedDayOffset, source: 'INTEGRATION', newSignups: 5 }
        });
      }
    }

  } catch (err) {
    console.error('Simulation error:', err);
  }
}

console.log('🤖 Tiramisup Zaman Simülatörü Başlatıldı.');
console.log('Her 2 dakika, sistem için otomatik olarak 1 gün sonrasının metriklerini girecek.\n');

// Hızlıca 1. günü tetikle
runSimulationTick();

setInterval(() => {
  runSimulationTick();
}, TWO_MINUTES);
