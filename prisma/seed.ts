import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'Aspe1aCS2025';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // Create admin if it doesn't exist
  const admin = await prisma.usuario.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Seed completed successfully');
  console.log('Created admin:', admin.email);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
