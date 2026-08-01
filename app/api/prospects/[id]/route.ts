import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/prospects/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prospect = await prisma.prospect.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        emails: { orderBy: { sentAt: 'desc' } },
      },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Erreur GET prospect:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH /api/prospects/[id] - Mettre à jour un prospect
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { email, status, messageText, messageSent, visitDate, notes, intentScore, signals } = body;

    const prospect = await prisma.prospect.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(email !== undefined && { email }),
        ...(status !== undefined && { status }),
        ...(messageText !== undefined && { messageText }),
        ...(messageSent !== undefined && { messageSent }),
        ...(visitDate !== undefined && { visitDate: new Date(visitDate) }),
        ...(notes !== undefined && { notes }),
        ...(intentScore !== undefined && { intentScore }),
        ...(signals !== undefined && { signals }),
      },
    });

    return NextResponse.json(prospect);
  } catch (error) {
    console.error('Erreur PATCH prospect:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

// DELETE /api/prospects/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.prospect.delete({ where: { id: parseInt(params.id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE prospect:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
