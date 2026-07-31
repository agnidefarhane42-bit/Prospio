import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/activity - Journal d'activité
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { prospect: true },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Erreur GET activity:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/activity - Enregistrer une nouvelle activité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, prospectId, campaignId, status, message, screenshot } = body;

    const activity = await prisma.activity.create({
      data: {
        type,
        prospectId: prospectId ?? null,
        campaignId: campaignId ?? null,
        status: status || 'success',
        message,
        screenshot,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Erreur POST activity:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 });
  }
}
