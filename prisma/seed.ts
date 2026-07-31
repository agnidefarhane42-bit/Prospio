import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with default settings and sample prospects...');

  // 1. Insert default settings
  const defaultSettings = [
    { key: 'daily_visit_limit', value: '20' },
    { key: 'daily_message_limit', value: '10' },
    { key: 'smart_delay_min', value: '30' },
    { key: 'smart_delay_max', value: '120' },
    { key: 'safe_mode', value: 'true' },
    { key: 'headless', value: 'true' },
  ];

  for (const setting of defaultSettings) {
    const upsertedSetting = await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    });
    console.log(`Setting upserted: ${upsertedSetting.key} = ${upsertedSetting.value}`);
  }

  // 2. Insert sample prospects
  const sampleProspects = [
    {
      name: 'Sarah Chen',
      profileUrl: 'https://www.linkedin.com/in/sarah-chen-tech',
      profileType: 'founder',
      headline: 'Co-Founder & CEO at AI Velocity | YC W24',
      company: 'AI Velocity',
      location: 'San Francisco, CA',
      status: 'new',
      messageText: null,
      messageSent: false,
      visitDate: null,
      notes: 'High intent prospect from YC network.',
      intentScore: 85,
      signals: JSON.stringify(['hiring_engineers', 'raised_seed_round']),
    },
    {
      name: 'Alex Rivera',
      profileUrl: 'https://www.linkedin.com/in/alex-rivera-dev',
      profileType: 'developer',
      headline: 'Lead Full Stack Engineer | React & Node.js Specialist',
      company: 'CloudScale Systems',
      location: 'Austin, TX',
      status: 'visited',
      messageText: 'Hi Alex, saw your recent post about Node.js microservices performance!',
      messageSent: false,
      visitDate: new Date('2026-07-30T10:00:00Z'),
      notes: 'Visited profile, draft message generated.',
      intentScore: 72,
      signals: JSON.stringify(['posted_about_tech_stack', 'active_commenter']),
    },
  ];

  for (const prospect of sampleProspects) {
    const upsertedProspect = await prisma.prospect.upsert({
      where: { profileUrl: prospect.profileUrl },
      update: prospect,
      create: prospect,
    });
    console.log(`Prospect upserted: ${upsertedProspect.name} (${upsertedProspect.profileUrl})`);
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
