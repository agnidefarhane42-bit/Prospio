import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/prospects - Liste tous les prospects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const profileType = searchParams.get('profileType');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (profileType && profileType !== 'all') where.profileType = profileType;

    const prospects = await prisma.prospect.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(prospects);
  } catch (error) {
    console.error('Erreur GET prospects:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/prospects - Créer un nouveau prospect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, profileUrl, profileType, headline, company, location, notes, intentScore, signals } = body;

    if (!name || !profileUrl) {
      return NextResponse.json({ error: 'Nom et URL du profil requis' }, { status: 400 });
    }

    const prospect = await prisma.prospect.create({
      data: {
        name,
        email,
        profileUrl,
        profileType,
        headline,
        company,
        location,
        notes,
        intentScore,
        signals,
      },
    });

    return NextResponse.json(prospect, { status: 201 });
  } catch (error) {
    console.error('Erreur POST prospect:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
