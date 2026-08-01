import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns - Liste toutes les campagnes
export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        steps: { orderBy: { order: 'asc' } },
        prospects: { include: { prospect: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Erreur GET campaigns:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/campaigns - Créer une nouvelle campagne
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, channel, dailyVisitLimit, dailyMessageLimit, smartDelayMin, smartDelayMax, steps } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nom de campagne requis' }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        channel: channel || 'linkedin',
        dailyVisitLimit: dailyVisitLimit ?? 20,
        dailyMessageLimit: dailyMessageLimit ?? 10,
        smartDelayMin: smartDelayMin ?? 30,
        smartDelayMax: smartDelayMax ?? 120,
        steps: steps
          ? {
              create: steps.map((step: {
                order?: number;
                type: string;
                channel?: string;
                delayDays?: number;
                template?: string;
                emailSubject?: string;
                emailBody?: string;
              }, i: number) => ({
                order: step.order ?? i + 1,
                type: step.type || (step.channel === 'email' ? 'email' : 'message'),
                channel: step.channel || (step.type === 'email' ? 'email' : 'linkedin'),
                delayDays: step.delayDays ?? 0,
                template: step.template || null,
                emailSubject: step.emailSubject || null,
                emailBody: step.emailBody || null,
              })),
            }
          : undefined,
      },
      include: {
        steps: { orderBy: { order: 'asc' } },
        prospects: { include: { prospect: true } },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('Erreur POST campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}
