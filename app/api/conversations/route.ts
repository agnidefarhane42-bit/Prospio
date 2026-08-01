import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/conversations - Liste toutes les conversations avec leur prospect
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prospectId = searchParams.get('prospectId');
    const channel = searchParams.get('channel');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};

    if (prospectId) {
      where.prospectId = parseInt(prospectId, 10);
    }
    if (channel && channel !== 'all') {
      where.channel = channel;
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        prospect: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Erreur GET /api/conversations:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des conversations' }, { status: 500 });
  }
}

// POST /api/conversations - Créer une nouvelle conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, channel, direction, content, status } = body;

    if (!prospectId || !channel || !direction || !content) {
      return NextResponse.json(
        { error: 'Champs requis manquants: prospectId, channel, direction, content' },
        { status: 400 }
      );
    }

    const conversation = await prisma.conversation.create({
      data: {
        prospectId: Number(prospectId),
        channel,
        direction,
        content,
        status: status || 'sent',
      },
      include: {
        prospect: true,
      },
    });

    // Optionnel: si c'est un message entrant (réponse), on peut aussi mettre à jour le statut du prospect à "replied"
    if (direction === 'inbound') {
      await prisma.prospect.update({
        where: { id: Number(prospectId) },
        data: { status: 'replied' },
      }).catch(() => {
        // Ignorer si la mise à jour échoue
      });
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/conversations:', error);
    return NextResponse.json({ error: 'Erreur lors de la création de la conversation' }, { status: 500 });
  }
}
