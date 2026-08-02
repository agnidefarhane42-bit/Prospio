import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * POST /api/posts/generate
 * Génère le contenu d'un post LinkedIn à partir d'un thème/sujet.
 * Utilise Gemini 1.5 Flash (rapide et économique).
 *
 * Body: { theme: string, tone?: string }
 * Response: { content: string, hashtags: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { theme, tone = "professionnel mais authentique" } = await req.json();

    if (!theme || theme.trim().length < 3) {
      return NextResponse.json(
        { error: "Le thème doit faire au moins 3 caractères" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY non configuré" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Tu es un expert en création de contenu LinkedIn pour les entrepreneurs tech africains.
    
Génère un post LinkedIn sur le thème suivant : "${theme}"

Contraintes :
- Ton : ${tone}
- Longueur : 3-6 paragraphes (max 3000 caractères)
- Commence par une accroche forte (question, statistique, ou affirmation audacieuse)
- Utilise des sauts de ligne entre les paragraphes
- Termine par un appel à l'action (engager la conversation, partager, etc.)
- Inclus 3-5 hashtags pertinents à la fin sur une ligne séparée
- Écris en français
- Pas d'emojis excessifs (2-3 max)
- Pas de "Voici" ou "Aujourd'hui je vais vous parler de"

Réponds UNIQUEMENT avec le contenu du post, sans explication ni meta-commentaire.`;

    const result = await model.generateContent(prompt);
    const content = result.response.text().trim();

    // Extraire les hashtags
    const hashtagMatch = content.match(/#[\wéèêàâçîïôûù]+/g);
    const hashtags = hashtagMatch ? hashtagMatch.join(" ") : "";

    return NextResponse.json({ content, hashtags });
  } catch (error) {
    console.error("Erreur génération post:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du contenu" },
      { status: 500 }
    );
  }
}
