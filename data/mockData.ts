import { Prospect, Campaign } from '@/types';

export const mockProspects: Prospect[] = [
  {
    id: 'p1',
    name: 'Kofi Mensah',
    avatarInitials: 'KM',
    headline: 'Fondateur & CEO chez PayAfrik | Fintech & Mobile Money Specialist',
    company: 'PayAfrik',
    location: 'Accra, Ghana',
    profileType: 'Founder',
    status: 'visited',
    intentScore: 85,
    linkedinUrl: 'https://linkedin.com/in/kofi-mensah-payafrik',
    email: 'kofi@payafrik.io',
    bio: 'Pionnier du paiement transfrontalier en Afrique de l’Ouest. Recherche des partenariats stratégiques pour développer le SaaS B2B.',
    generatedMessage: 'Bonjour Kofi, j\'ai suivi l\'expansion impressionnante de PayAfrik dans la région. Votre vision des paiements transfrontaliers résonne avec notre solution SaaS. Serez-vous disponible pour un court échange ?',
    campaignId: 'c1',
    currentCampaignStep: 2,
    timeline: {
      visitedAt: '2026-07-28 10:15',
    }
  },
  {
    id: 'p2',
    name: 'Amina Diallo',
    avatarInitials: 'AD',
    headline: 'Co-fondatrice & CTO @ AgriTech Sahel | AI for Agriculture',
    company: 'AgriTech Sahel',
    location: 'Dakar, Sénégal',
    profileType: 'CTO',
    status: 'messaged',
    intentScore: 92,
    linkedinUrl: 'https://linkedin.com/in/amina-diallo-agritech',
    email: 'a.diallo@agritech-sahel.sn',
    bio: 'Ingénieure en IA passionnée par le développement de solutions agricoles durables en zone sahélienne.',
    generatedMessage: 'Bonjour Amina, impressionné par l\'impact d\'AgriTech Sahel. En tant que CTO, vous devez gérer de multiples intégrations. Notre outil Prospio automatise le sourcing B2B tout en restant sous le radar LinkedIn.',
    campaignId: 'c1',
    currentCampaignStep: 3,
    timeline: {
      visitedAt: '2026-07-26 14:20',
      messagedAt: '2026-07-27 09:30',
    }
  },
  {
    id: 'p3',
    name: 'Ousmane Sawadogo',
    avatarInitials: 'OS',
    headline: 'CEO @ Djoroka Tech | Solutions Cloud & Cybersécurité B2B',
    company: 'Djoroka Tech',
    location: 'Cotonou, Bénin',
    profileType: 'CEO',
    status: 'connected',
    intentScore: 78,
    linkedinUrl: 'https://linkedin.com/in/ousmane-sawadogo-djoroka',
    email: 'ousmane@djorokatech.bj',
    bio: 'Expert en transformation digitale des PME africaines. Bâtisseur d’infrastructures cloud robustes.',
    generatedMessage: 'Ravi de vous compter parmi mes contacts Ousmane ! Djoroka Tech fait un travail remarquable au Bénin. Si vous cherchez à accélérer votre prospection LinkedIn, échangeons !',
    campaignId: 'c2',
    currentCampaignStep: 4,
    timeline: {
      visitedAt: '2026-07-20 11:00',
      messagedAt: '2026-07-21 16:45',
      connectedAt: '2026-07-23 08:12',
    }
  },
  {
    id: 'p4',
    name: 'Fatou Sow',
    avatarInitials: 'FS',
    headline: 'Head of Product @ FinTech West | Growth & SaaS Scale',
    company: 'FinTech West',
    location: 'Abidjan, Côte d’Ivoire',
    profileType: 'Product Manager',
    status: 'replied',
    intentScore: 95,
    linkedinUrl: 'https://linkedin.com/in/fatou-sow-fintechwest',
    email: 'fatou.sow@fintechwest.ci',
    bio: 'Spécialiste de la conception produit et de l’acquisition d’utilisateurs B2B en Afrique subsaharienne.',
    generatedMessage: 'Bonjour Fatou, félicitations pour le lancement du dernier module FinTech West ! J\'aimerais échanger sur la manière dont Prospio génère des leads qualifiés automatiquement.',
    campaignId: 'c1',
    currentCampaignStep: 4,
    timeline: {
      visitedAt: '2026-07-22 09:00',
      messagedAt: '2026-07-23 10:15',
      repliedAt: '2026-07-24 15:30',
      connectedAt: '2026-07-24 11:00',
    }
  },
  {
    id: 'p5',
    name: 'Olumide Adebayo',
    avatarInitials: 'OA',
    headline: 'Managing Partner @ Lagos Seed Capital | VC & Tech Angel',
    company: 'Lagos Seed Capital',
    location: 'Lagos, Nigeria',
    profileType: 'Investor',
    status: 'new',
    intentScore: 64,
    linkedinUrl: 'https://linkedin.com/in/olumide-adebayo-lsc',
    email: 'olumide@lagosseed.vc',
    bio: 'Investisseur early-stage dans les startups SaaS et Fintech à fort potentiel de croissance en Afrique.',
    generatedMessage: 'Bonjour Olumide, nous développons Prospio, une plateforme de prospection LinkedIn automatisée propulsée par l’IA Gemini. Seriez-vous ouvert à consulter notre pitch deck ?',
    campaignId: 'c3',
    currentCampaignStep: 1,
    timeline: {}
  },
  {
    id: 'p6',
    name: 'Chiamaka Eze',
    avatarInitials: 'CE',
    headline: 'Co-Founder & COO @ HealthLog Africa | HealthTech Pioneer',
    company: 'HealthLog Africa',
    location: 'Kigali, Rwanda',
    profileType: 'Founder',
    status: 'visited',
    intentScore: 88,
    linkedinUrl: 'https://linkedin.com/in/chiamaka-eze-healthlog',
    email: 'chiamaka@healthlog.africa',
    bio: 'Optimisation de la chaîne de santé numérique à travers l’Afrique de l’Est et du Centre.',
    generatedMessage: 'Bonjour Chiamaka, quel parcours impressionnant avec HealthLog Africa à Kigali ! Nous aidons les fondateurs Tech à automatiser leur prospection B2B sans risque.',
    campaignId: 'c1',
    currentCampaignStep: 2,
    timeline: {
      visitedAt: '2026-07-29 16:00',
    }
  }
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Fondateurs SaaS Afrique',
    status: 'active',
    channel: 'linkedin',
    completedProspects: 34,
    totalProspects: 50,
    dailyVisitLimit: 20,
    dailyMessageLimit: 10,
    stepCount: 4,
    responseRate: 28,
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        type: 'visit',
        title: 'Visite automatique du profil',
        description: 'Visite silencieuse du profil LinkedIn pour susciter la curiosité',
        delayHours: 0
      },
      {
        id: 's2',
        stepNumber: 2,
        type: 'connect',
        title: 'Demande de connexion personnalisée',
        description: 'Envoi d\'une invitation sans note ou avec accroche légère',
        delayHours: 24
      },
      {
        id: 's3',
        stepNumber: 3,
        type: 'message',
        title: 'Premier message AI généré',
        description: 'Message personnalisé basé sur les compétences et le poste',
        delayHours: 48
      },
      {
        id: 's4',
        stepNumber: 4,
        type: 'followup',
        title: 'Relance valeur ajoutée',
        description: 'Partage d\'une étude de cas ou démo personnalisée',
        delayHours: 72
      }
    ],
    prospects: mockProspects.filter(p => p.campaignId === 'c1')
  },
  {
    id: 'c2',
    name: 'Développeurs Bénin',
    status: 'active',
    channel: 'linkedin',
    completedProspects: 18,
    totalProspects: 25,
    dailyVisitLimit: 15,
    dailyMessageLimit: 8,
    stepCount: 3,
    responseRate: 35,
    steps: [
      {
        id: 's2_1',
        stepNumber: 1,
        type: 'visit',
        title: 'Visite de profil tech',
        description: 'Consultation du profil des ingénieurs et leads tech',
        delayHours: 0
      },
      {
        id: 's2_2',
        stepNumber: 2,
        type: 'connect',
        title: 'Invitation réseau dev',
        description: 'Connexion ciblée pour talents tech au Bénin',
        delayHours: 12
      },
      {
        id: 's2_3',
        stepNumber: 3,
        type: 'message',
        title: 'Proposition opportunités B2B',
        description: 'Message orienté collaboration ou recrutement tech',
        delayHours: 36
      }
    ],
    prospects: mockProspects.filter(p => p.campaignId === 'c2')
  },
  {
    id: 'c3',
    name: 'Investisseurs FCFA',
    status: 'paused',
    channel: 'linkedin',
    completedProspects: 5,
    totalProspects: 30,
    dailyVisitLimit: 10,
    dailyMessageLimit: 5,
    stepCount: 4,
    responseRate: 15,
    steps: [
      {
        id: 's3_1',
        stepNumber: 1,
        type: 'visit',
        title: 'Visite profil VC & Business Angels',
        description: 'Visite ciblée d\'investisseurs Afrique francophone',
        delayHours: 0
      },
      {
        id: 's3_2',
        stepNumber: 2,
        type: 'connect',
        title: 'Demande de mise en relation VC',
        description: 'Invitation sobre sur les startups SaaS',
        delayHours: 24
      },
      {
        id: 's3_3',
        stepNumber: 3,
        type: 'message',
        title: 'Présentation Teaser Prospio',
        description: 'Pitch court et métriques de croissance',
        delayHours: 48
      },
      {
        id: 's3_4',
        stepNumber: 4,
        type: 'followup',
        title: 'Lien Pitch Deck',
        description: 'Partage du deck et invitation à un meeting',
        delayHours: 96
      }
    ],
    prospects: mockProspects.filter(p => p.campaignId === 'c3')
  }
];
