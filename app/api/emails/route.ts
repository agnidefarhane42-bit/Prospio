import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/emails - Lister tous les EmailLogs avec le prospect associé
export async function GET() {
  try {
    const emailLogs = await prisma.emailLog.findMany({
      include: {
        prospect: true,
      },
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json(emailLogs);
  } catch (error) {
    console.error('Erreur GET /api/emails:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des logs email' }, { status: 500 });
  }
}
