import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/posts/[id]/publish
 * Marque un post pour publication immédiate.
 * Le workflow agent détecte le statut "publishing" et publie via Browserbase.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const post = await prisma.linkedInPost.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: "Post introuvable" }, { status: 404 });
    }

    if (post.status === "published") {
      return NextResponse.json({ error: "Post déjà publié" }, { status: 400 });
    }

    // Marquer comme "publishing" — le workflow agent prend le relais
    await prisma.linkedInPost.update({
      where: { id },
      data: { status: "publishing" },
    });

    return NextResponse.json({
      success: true,
      message: "Post marqué pour publication. Le workflow va publier sur LinkedIn.",
      postId: id,
    });
  } catch (error) {
    console.error("Erreur publish post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
