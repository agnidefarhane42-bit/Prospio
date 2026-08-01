import { NextRequest, NextResponse } from 'next/server';

// POST /api/emails/generate - Générer un email avec Groq (Llama 3.3 70B)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospect, persona, tone } = body;

    if (!prospect || !prospect.name) {
      return NextResponse.json({ error: 'Informations prospect requises' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;

    const userPrompt = `Génère un email pour ce prospect:
Nom: ${prospect.name}
Headline: ${prospect.headline || 'N/A'}
Entreprise: ${prospect.company || 'N/A'}
Localisation: ${prospect.location || 'N/A'}
Notes: ${prospect.notes || 'N/A'}

Persona de l'expéditeur: ${persona || 'Fondateur B2B'}
Ton de communication: ${tone || 'Professionnel'}

Incorpore les informations du prospect de manière naturelle. L'email doit être court, percutant et donner envie d'échanger.
Réponds UNIQUEMENT au format JSON: {"subject": "...", "body": "..."}`;

    if (!apiKey) {
      console.warn('GROQ_API_KEY non configurée, utilisation d\'un email généré par défaut');
      return NextResponse.json({
        subject: `Opportunité de collaboration pour ${prospect.company || prospect.name}`,
        body: `Bonjour ${prospect.name.split(' ')[0]},\n\nJ'ai remarqué votre profil (${prospect.headline || 'votre activité'}) et j'ai été impressionné par votre travail chez ${prospect.company || 'votre entreprise'}.\n\nNous aidons les entreprises comme la vôtre à accélérer leur prospection grâce à l'IA.\n\nSeriez-vous disponible pour un échange rapide de 10 minutes cette semaine ?\n\nBien cordialement,\nProspio Team`,
      });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en cold emailing B2B. Génère un email de prospection court, personnalisé et professionnel. Format JSON: {"subject": "...", "body": "..."}',
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!groqRes.ok) {
      const errData = await groqRes.text();
      console.error('Erreur API Groq:', errData);
      return NextResponse.json(
        { error: 'Erreur lors de la génération avec Groq' },
        { status: 502 }
      );
    }

    const data = await groqRes.json();
    const content = data.choices?.[0]?.message?.content || '';

    let parsed: { subject?: string; body?: string } = {};
    try {
      // Nettoyer les éventuelles balises ```json ... ```
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (pErr) {
      console.error('Erreur parse JSON Groq:', pErr, content);
      parsed = {
        subject: `Opportunité pour ${prospect.name}`,
        body: content,
      };
    }

    return NextResponse.json({
      subject: parsed.subject || `Prospection pour ${prospect.name}`,
      body: parsed.body || content,
    });
  } catch (error) {
    console.error('Erreur POST /api/emails/generate:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération de l\'email' }, { status: 500 });
  }
}
