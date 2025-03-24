import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedCRMPermissions } from './seeds/crm.permissions';
import { seedCRMPipelines } from './seeds/crm.pipelines';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'Aspe1aCS2025';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // Create admin if it doesn't exist
  const admin = await prisma.user.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com',
      password: hashedPassword,
      name: 'Admin',
    },
  });

  // Seed CRM permissions and roles
  await seedCRMPermissions();

  // Seed CRM pipelines and statuses
  await seedCRMPipelines();

  // Assign CRM Admin role to the super admin
  const crmModule = await prisma.module.findUnique({
    where: { name: 'CRM' },
  });

  if (crmModule) {
    const crmAdminRole = await prisma.role.findFirst({
      where: {
        name: 'CRM Admin',
        moduleId: crmModule.id,
      },
    });

    if (crmAdminRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: admin.id,
            roleId: crmAdminRole.id,
          },
        },
        update: {},
        create: {
          userId: admin.id,
          roleId: crmAdminRole.id,
        },
      });
    }
  }

  console.log('Seed completed successfully');
  console.log('Created admin:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
