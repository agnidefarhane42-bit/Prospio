import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/campaigns/[id] - Détail d'une campagne
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        steps: { orderBy: { order: 'asc' } },
        prospects: { include: { prospect: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur GET campaign:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/campaigns/[id] - Mettre à jour une campagne (statut, limites, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, status, channel, dailyVisitLimit, dailyMessageLimit, smartDelayMin, smartDelayMax } = body;

    const campaign = await prisma.campaign.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(channel !== undefined && { channel }),
        ...(dailyVisitLimit !== undefined && { dailyVisitLimit }),
        ...(dailyMessageLimit !== undefined && { dailyMessageLimit }),
        ...(smartDelayMin !== undefined && { smartDelayMin }),
        ...(smartDelayMax !== undefined && { smartDelayMax }),
      },
      include: {
        steps: { orderBy: { order: 'asc' } },
        prospects: { include: { prospect: true } },
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Erreur PATCH campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Supprimer une campagne
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.campaign.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE campaign:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
