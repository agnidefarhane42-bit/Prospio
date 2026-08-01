import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/campaigns/[id]/steps - Ajouter des étapes à une campagne
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const campaignId = parseInt(params.id);

    // Si body est un objet step unique ou contient un tableau steps
    const stepsArray = Array.isArray(body.steps)
      ? body.steps
      : body.type || body.channel
      ? [body]
      : null;

    if (!stepsArray || stepsArray.length === 0) {
      return NextResponse.json({ error: 'Liste d\'étapes requise' }, { status: 400 });
    }

    // Récupérer le nombre d'étapes existantes
    const existingStepsCount = await prisma.step.count({
      where: { campaignId },
    });

    const created = await Promise.all(
      stepsArray.map((step: {
        order?: number;
        type?: string;
        channel?: string;
        delayDays?: number;
        template?: string;
        emailSubject?: string;
        emailBody?: string;
      }, i: number) =>
        prisma.step.create({
          data: {
            campaignId,
            order: step.order ?? (existingStepsCount + i + 1),
            type: step.type || (step.channel === 'email' ? 'email' : 'message'),
            channel: step.channel || (step.type === 'email' ? 'email' : 'linkedin'),
            delayDays: step.delayDays ?? 0,
            template: step.template || null,
            emailSubject: step.emailSubject || null,
            emailBody: step.emailBody || null,
          },
        })
      )
    );

    return NextResponse.json({ added: created.length, steps: created }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST steps:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout d\'étapes' }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id]/steps - Supprimer une étape via query param stepId
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const stepId = searchParams.get('stepId');

    if (!stepId) {
      return NextResponse.json({ error: 'ID d\'étape requis' }, { status: 400 });
    }

    await prisma.step.delete({
      where: {
        id: parseInt(stepId),
        campaignId: parseInt(params.id),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE step:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
