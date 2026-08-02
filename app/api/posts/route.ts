import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/posts
 * Liste tous les posts LinkedIn, triés par date de création descendante.
 * Query params: status (filtrer par statut)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const posts = await prisma.linkedInPost.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Erreur liste posts:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

/**
 * POST /api/posts
 * Crée un nouveau post LinkedIn (brouillon ou programmé).
 *
 * Body: { content, mediaUrl?, status?, scheduledAt?, aiGenerated?, theme?, hashtags? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.content || body.content.trim().length < 10) {
      return NextResponse.json(
        { error: "Le contenu doit faire au moins 10 caractères" },
        { status: 400 }
      );
    }

    const post = await prisma.linkedInPost.create({
      data: {
        content: body.content,
        mediaUrl: body.mediaUrl || null,
        status: body.status || "draft",
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
        aiGenerated: body.aiGenerated || false,
        theme: body.theme || null,
        hashtags: body.hashtags || null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Erreur création post:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
