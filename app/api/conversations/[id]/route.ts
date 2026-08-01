import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/conversations/[id] - Mettre à jour une conversation (ex: statut, content, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { status, content, direction, channel } = body;

    const conversation = await prisma.conversation.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(content !== undefined && { content }),
        ...(direction !== undefined && { direction }),
        ...(channel !== undefined && { channel }),
      },
      include: {
        prospect: true,
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Erreur PATCH /api/conversations/[id]:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la conversation' }, { status: 500 });
  }
}

// DELETE /api/conversations/[id] - Supprimer une conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } } | { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    await prisma.conversation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/conversations/[id]:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la conversation' }, { status: 500 });
  }
}
