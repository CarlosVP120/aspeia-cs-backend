import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCRMPermissions() {
  // Create CRM Module
  const crmModule = await prisma.module.upsert({
    where: { name: 'CRM' },
    update: {},
    create: {
      name: 'CRM',
      description: 'Client Relationship Management Module',
    },
  });

  // Define CRM Permissions
  const permissions = [
    // Organization Permissions
    { name: 'crm.organization.create', description: 'Create organizations' },
    { name: 'crm.organization.read', description: 'View organizations' },
    { name: 'crm.organization.update', description: 'Update organizations' },
    { name: 'crm.organization.delete', description: 'Delete organizations' },

    // Person Permissions
    { name: 'crm.person.create', description: 'Create contacts' },
    { name: 'crm.person.read', description: 'View contacts' },
    { name: 'crm.person.update', description: 'Update contacts' },
    { name: 'crm.person.delete', description: 'Delete contacts' },

    // Lead Permissions
    { name: 'crm.lead.create', description: 'Create leads' },
    { name: 'crm.lead.read', description: 'View leads' },
    { name: 'crm.lead.update', description: 'Update leads' },
    { name: 'crm.lead.delete', description: 'Delete leads' },
    { name: 'crm.lead.convert', description: 'Convert leads to deals' },

    // Deal Permissions
    { name: 'crm.deal.create', description: 'Create deals' },
    { name: 'crm.deal.read', description: 'View deals' },
    { name: 'crm.deal.update', description: 'Update deals' },
    { name: 'crm.deal.delete', description: 'Delete deals' },
    { name: 'crm.deal.change_stage', description: 'Move deals between stages' },

    // Project Permissions
    { name: 'crm.project.create', description: 'Create projects' },
    { name: 'crm.project.read', description: 'View projects' },
    { name: 'crm.project.update', description: 'Update projects' },
    { name: 'crm.project.delete', description: 'Delete projects' },

    // Activity Permissions
    { name: 'crm.activity.create', description: 'Create activities' },
    { name: 'crm.activity.read', description: 'View activities' },
    { name: 'crm.activity.update', description: 'Update activities' },
    { name: 'crm.activity.delete', description: 'Delete activities' },

    // Product Permissions
    { name: 'crm.product.create', description: 'Create products' },
    { name: 'crm.product.read', description: 'View products' },
    { name: 'crm.product.update', description: 'Update products' },
    { name: 'crm.product.delete', description: 'Delete products' },

    // Email Permissions
    { name: 'crm.email.create', description: 'Send emails' },
    { name: 'crm.email.read', description: 'View emails' },
    { name: 'crm.email.delete', description: 'Delete emails' },

    // Report Permissions
    { name: 'crm.reports.view', description: 'View CRM reports' },
    { name: 'crm.dashboard.view', description: 'View CRM dashboard' },

    // Settings Permissions
    { name: 'crm.settings.manage', description: 'Manage CRM settings' },

    // Pipeline Management Permissions
    { name: 'crm.pipeline.create', description: 'Create sales pipelines' },
    { name: 'crm.pipeline.read', description: 'View sales pipelines' },
    { name: 'crm.pipeline.update', description: 'Update sales pipelines' },
    { name: 'crm.pipeline.delete', description: 'Delete sales pipelines' },
    {
      name: 'crm.pipeline.manage_stages',
      description: 'Manage pipeline stages',
    },
    { name: 'crm.pipeline.set_default', description: 'Set default pipeline' },

    // Status Management Permissions
    { name: 'crm.status.create', description: 'Create custom statuses' },
    { name: 'crm.status.read', description: 'View statuses' },
    { name: 'crm.status.update', description: 'Update statuses' },
    { name: 'crm.status.delete', description: 'Delete statuses' },
    { name: 'crm.status.set_default', description: 'Set default status' },

    // Tag Permissions
    { name: 'crm.tag.create', description: 'Create tags' },
    { name: 'crm.tag.read', description: 'View tags' },
    { name: 'crm.tag.update', description: 'Update tags' },
    { name: 'crm.tag.delete', description: 'Delete tags' },
    { name: 'crm.tag.assign', description: 'Assign tags to entities' },
    { name: 'crm.tag.unassign', description: 'Remove tags from entities' },
  ];

  // Create all permissions
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Define CRM Roles
  const roles = [
    {
      name: 'CRM Admin',
      description: 'Full access to all CRM features',
      permissions: permissions.map((p) => p.name),
    },
    {
      name: 'Sales Manager',
      description: 'Manage sales team and view all deals',
      permissions: [
        'crm.organization.read',
        'crm.organization.create',
        'crm.organization.update',
        'crm.person.read',
        'crm.person.create',
        'crm.person.update',
        'crm.lead.read',
        'crm.lead.create',
        'crm.lead.update',
        'crm.lead.convert',
        'crm.deal.read',
        'crm.deal.create',
        'crm.deal.update',
        'crm.deal.change_stage',
        'crm.activity.read',
        'crm.activity.create',
        'crm.activity.update',
        'crm.product.read',
        'crm.email.read',
        'crm.email.create',
        'crm.reports.view',
        'crm.dashboard.view',
        'crm.pipeline.read',
        'crm.pipeline.update',
        'crm.pipeline.manage_stages',
        'crm.status.read',
        'crm.status.update',
        'crm.tag.create',
        'crm.tag.read',
        'crm.tag.update',
        'crm.tag.assign',
        'crm.tag.unassign',
      ],
    },
    {
      name: 'Sales Representative',
      description: 'Handle leads and deals',
      permissions: [
        'crm.organization.read',
        'crm.organization.create',
        'crm.person.read',
        'crm.person.create',
        'crm.lead.read',
        'crm.lead.create',
        'crm.lead.update',
        'crm.deal.read',
        'crm.deal.create',
        'crm.deal.update',
        'crm.deal.change_stage',
        'crm.activity.read',
        'crm.activity.create',
        'crm.email.read',
        'crm.email.create',
        'crm.dashboard.view',
        'crm.pipeline.read',
        'crm.status.read',
        'crm.tag.read',
        'crm.tag.assign',
        'crm.tag.unassign',
      ],
    },
    {
      name: 'CRM Viewer',
      description: 'Read-only access to CRM',
      permissions: [
        'crm.organization.read',
        'crm.person.read',
        'crm.lead.read',
        'crm.deal.read',
        'crm.project.read',
        'crm.activity.read',
        'crm.product.read',
        'crm.email.read',
        'crm.dashboard.view',
        'crm.tag.read',
      ],
    },
  ];

  // Create roles and assign permissions
  for (const roleData of roles) {
    // Create role
    const role = await prisma.role.upsert({
      where: {
        name_moduleId: {
          name: roleData.name,
          moduleId: crmModule.id,
        },
      },
      update: {
        description: roleData.description,
      },
      create: {
        name: roleData.name,
        description: roleData.description,
        moduleId: crmModule.id,
      },
    });

    // Get all permissions for this role
    const rolePermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: roleData.permissions,
        },
      },
    });

    // Assign permissions to role
    for (const permission of rolePermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
}
