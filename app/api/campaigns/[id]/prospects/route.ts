import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/campaigns/[id]/prospects - Ajouter des prospects à une campagne
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { prospectIds } = body;

    if (!prospectIds || !Array.isArray(prospectIds) || prospectIds.length === 0) {
      return NextResponse.json({ error: 'Liste de prospectIds requise' }, { status: 400 });
    }

    const campaignId = parseInt(params.id);

    // Vérifier que la campagne existe
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
    }

    // Créer les liens campagne-prospect (ignorer les doublons)
    const created = await Promise.all(
      prospectIds.map((prospectId: number) =>
        prisma.campaignProspect
          .create({ data: { campaignId, prospectId } })
          .catch(() => null) // Ignorer si déjà lié (contrainte unique)
      )
    );

    const added = created.filter((c) => c !== null).length;

    return NextResponse.json({ added, total: prospectIds.length }, { status: 201 });
  } catch (error) {
    console.error('Erreur POST campaign prospects:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'ajout' }, { status: 500 });
  }
}

// GET /api/campaigns/[id]/prospects - Lister les prospects d'une campagne
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignProspects = await prisma.campaignProspect.findMany({
      where: { campaignId: parseInt(params.id) },
      include: { prospect: true },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json(campaignProspects);
  } catch (error) {
    console.error('Erreur GET campaign prospects:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id]/prospects - Retirer des prospects d'une campagne
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { prospectIds } = body;

    if (!prospectIds || !Array.isArray(prospectIds)) {
      return NextResponse.json({ error: 'Liste de prospectIds requise' }, { status: 400 });
    }

    await prisma.campaignProspect.deleteMany({
      where: {
        campaignId: parseInt(params.id),
        prospectId: { in: prospectIds },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE campaign prospects:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
