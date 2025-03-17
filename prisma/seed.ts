import { PrismaClient, WorkspaceRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const defaultPassword = process.env.SUPER_ADMIN_PASSWORD || 'Aspe1aCS2025';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  // Create super admin if it doesn't exist
  const admin = await prisma.usuario.upsert({
    where: { email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com' },
    update: {},
    create: {
      email: process.env.SUPER_ADMIN_EMAIL || 'super@aspeiacs.com',
      password: hashedPassword,
      name: 'Super Admin',
      isSupervisor: true,
    },
  });

  // Create default workspace
  const defaultWorkspace = await prisma.workspace.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Default Workspace',
      description: 'Default workspace created during initialization',
    },
  });

  // Associate the admin with the default workspace as an ADMIN
  const userWorkspaceExists = await prisma.usuarioWorkspace.findUnique({
    where: {
      usuarioId_workspaceId: {
        usuarioId: admin.id,
        workspaceId: defaultWorkspace.id,
      },
    },
  });

  if (!userWorkspaceExists) {
    await prisma.usuarioWorkspace.create({
      data: {
        usuarioId: admin.id,
        workspaceId: defaultWorkspace.id,
        role: WorkspaceRole.ADMIN,
      },
    });
  }

  console.log('Seed completed successfully');
  console.log('Created super admin:', admin.email);
  console.log('Created default workspace:', defaultWorkspace.name);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
