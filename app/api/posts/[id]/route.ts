import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/posts/[id]
 * Récupère un post par son ID.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.linkedInPost.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!post) {
      return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Erreur get post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * PATCH /api/posts/[id]
 * Met à jour un post (contenu, statut, date programmée, etc.).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const id = parseInt(params.id);

    const post = await prisma.linkedInPost.update({
      where: { id },
      data: {
        ...body,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Erreur update post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * DELETE /api/posts/[id]
 * Supprime un post.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.linkedInPost.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur delete post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
