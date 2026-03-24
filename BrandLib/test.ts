import { runOrchestrator } from './orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🤖 Tiramisup AI Mimarisi Testi Başlıyor...\n');

  // Veritabanından örnek bir ürün (Product) bulalım
  let product = await prisma.product.findFirst();

  // Eğer veritabanı boşsa test için "Dummy" bir kullanıcı ve ürün oluşturalım
  if (!product) {
    console.log('Veritabanında ürün bulunamadı. Test için "Dummy Product" oluşturuluyor...');
    
    // Önce test maili olan bir deneme user varsa bulalım yoksa yaratalım
    let user = await prisma.user.findUnique({ where: { email: 'test@tiramisup.ai' }});
    if(!user) {
         user = await prisma.user.create({
            data: {
              email: 'test@tiramisup.ai',
              name: 'Test Founder',
              passwordHash: 'dummy'
            }
          });
    }

    product = await prisma.product.create({
      data: {
        userId: user.id,
        name: 'AI Test Product',
        description: 'Testing the new AI Architecture'
      }
    });
  }

  console.log(`📌 Seçilen Ürün ID: ${product.id} (${product.name})`);

  // Prompt 1: Büyüme (Growth) Ajanını tetikleyecek metrik içerikli konuşma
  const prompt1 = "Bugün sitemize 1500 yeni ziyaretçi geldi ve bunların 300'ü kayıt oldu! Sence bu durumu günlüğe (metrik) kaydetmeli miyim?";
  console.log(`\n\n👤 Founder (Sen): "${prompt1}"`);
  console.log('🧠 Orchestrator Düşünüyor (Vercel AI + OpenAI Gidiş Dönüşü)...');
  
  const response1 = await runOrchestrator(prompt1, product.id);
  console.log(`\n🤖 Tiramisup AI:\n${response1}`);

  // Prompt 2: İcraat (Execution) Ajanını tetikleyecek görev odaklı konuşma
  const prompt2 = "Harika! O zaman yarınki ilk planımız bir hoş geldin (Welcome) maili dizisi (drip campaign) oluşturmak olsun. Bunu doğrudan yüksek öncelikli olarak yapılacaklar (tasks) listeme ekler misin?";
  console.log(`\n\n👤 Founder (Sen): "${prompt2}"`);
  console.log('🧠 Orchestrator Düşünüyor (Vercel AI + OpenAI Gidiş Dönüşü)...');
  
  const response2 = await runOrchestrator(prompt2, product.id);
  console.log(`\n🤖 Tiramisup AI:\n${response2}`);

  console.log('\n\n✅ Test Tamamlandı. Veritabanınızı (Prima Studio veya veritabanı aracı ile) kontrol edip yeni task ve metriklerin kaydedildiğini doğrulayabilirsiniz.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
