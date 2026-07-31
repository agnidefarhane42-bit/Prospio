import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings
export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Erreur GET settings:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT /api/settings - Mettre à jour les paramètres
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const updates = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PUT settings:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
