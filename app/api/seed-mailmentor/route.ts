import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const email = 'ozerocek+43@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ error: `User ${email} not found in production database.` }, { status: 404 });
    }
    
    // Get the latest product created by the user (Mailmentor AI)
    const product = await prisma.product.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!product) {
      return NextResponse.json({ error: `No products found for user ${email}. Create one first!` }, { status: 404 });
    }

    // Clean existing metrics to avoid duplicate date errors
    await prisma.metric.deleteMany({ where: { productId: product.id } });

    const metrics = [];
    const today = new Date();
    
    // We will generate 15 days of data (including today) with a nice growing trend
    let currentDau = 15;
    let currentSignup = 2;
    let currentMrr = 100;
    
    for (let i = 14; i >= 0; i--) {
      // Midnight timestamps
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      metrics.push({
        productId: product.id,
        date: d,
        dau: currentDau,
        mau: currentDau * 3,
        mrr: currentMrr,
        newSignups: currentSignup,
        activeSubscriptions: Math.floor(currentMrr / 15),
        churnedUsers: i % 4 === 0 ? 1 : 0,
        activationRate: 0.25 + (i * 0.01),
        source: 'MANUAL' as const
      });
      
      // Simulate steady B2B growth
      currentDau += Math.floor(Math.random() * 4);
      currentSignup += Math.floor(Math.random() * 2);
      currentMrr += Math.floor(Math.random() * 20);
    }

    await prisma.metric.createMany({ data: metrics });

    return NextResponse.json({ 
      success: true, 
      message: `Success! 15 days of growing dummy metrics injected for product: ${product.name}`, 
      metricsCount: metrics.length 
    });
  } catch (error) {
    console.error("Metric seeder error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
