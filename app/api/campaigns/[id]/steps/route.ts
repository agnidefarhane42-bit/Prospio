import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/campaigns/[id]/steps - Ajouter des étapes à une campagne
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { steps } = body;

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: 'Liste d\'étapes requise' }, { status: 400 });
    }

    const campaignId = parseInt(params.id);

    const created = await Promise.all(
      steps.map((step: { order: number; type: string; channel: string; delayDays: number; template?: string }) =>
        prisma.step.create({
          data: {
            campaignId,
            order: step.order,
            type: step.type,
            channel: step.channel || 'linkedin',
            delayDays: step.delayDays ?? 0,
            template: step.template,
          },
        })
      )
    );

    return NextResponse.json({ added: created.length }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST steps:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout d\'étapes' }, { status: 500 });
  }
}
