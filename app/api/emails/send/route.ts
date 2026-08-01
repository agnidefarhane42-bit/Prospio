import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/emails/send - Envoyer un email via Resend et enregistrer dans EmailLog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, subject, body: emailBody, from } = body;

    if (!prospectId || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Champs requis manquants (prospectId, subject, body)' },
        { status: 400 }
      );
    }

    const prospect = await prisma.prospect.findUnique({
      where: { id: Number(prospectId) },
    });

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 });
    }

    if (!prospect.email) {
      return NextResponse.json(
        { error: "Le prospect n'a pas d'adresse email renseignée" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const senderEmail = from || 'Prospio <onboarding@resend.dev>';
    let resendResponseData: unknown = null;
    let isSuccess = false;

    if (apiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [prospect.email],
          subject,
          html: emailBody.replace(/\n/g, '<br/>'),
        }),
      });

      resendResponseData = await res.json().catch(() => null);
      if (res.ok) {
        isSuccess = true;
      } else {
        console.error('Erreur Resend API:', resendResponseData);
      }
    } else {
      console.warn('RESEND_API_KEY non configurée. Simulation de l\'envoi.');
      isSuccess = true;
      resendResponseData = { simulated: true, id: 'sim_' + Date.now() };
    }

    const emailLog = await prisma.emailLog.create({
      data: {
        prospectId: Number(prospectId),
        subject,
        body: emailBody,
        status: isSuccess ? 'sent' : 'failed',
      },
      include: {
        prospect: true,
      },
    });

    if (isSuccess) {
      await prisma.prospect.update({
        where: { id: Number(prospectId) },
        data: { status: 'email_sent' },
      });

      // Enregistrer une activité
      try {
        await prisma.activity.create({
          data: {
            type: 'email',
            prospectId: Number(prospectId),
            status: 'success',
            message: `Email envoyé à ${prospect.email}: "${subject}"`,
          },
        });
      } catch (actErr) {
        console.error('Erreur création activité:', actErr);
      }
    }

    return NextResponse.json({
      success: isSuccess,
      emailLog,
      resend: resendResponseData,
    });
  } catch (error) {
    console.error('Erreur POST /api/emails/send:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 });
  }
}
