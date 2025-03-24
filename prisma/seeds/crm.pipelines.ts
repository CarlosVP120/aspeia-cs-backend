import { PrismaClient, CRMStatusType } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCRMPipelines() {
  // Create default sales pipeline
  const defaultPipeline = await prisma.cRMPipeline.upsert({
    where: { name: 'Sales Pipeline' },
    update: {
      isDefault: true,
      displayOrder: 0,
    },
    create: {
      name: 'Sales Pipeline',
      description: 'Default sales pipeline',
      isDefault: true,
      displayOrder: 0,
    },
  });

  // Create default pipeline stages
  const defaultStages = [
    {
      name: 'Qualification',
      description: 'Initial contact and qualification',
      probability: 10,
      displayOrder: 0,
      color: '#FF6B6B',
    },
    {
      name: 'Meeting Scheduled',
      description: 'First meeting with prospect',
      probability: 25,
      displayOrder: 1,
      color: '#4ECDC4',
    },
    {
      name: 'Proposal Sent',
      description: 'Proposal has been sent to the prospect',
      probability: 50,
      displayOrder: 2,
      color: '#45B7D1',
    },
    {
      name: 'Negotiation',
      description: 'Negotiating terms and conditions',
      probability: 75,
      displayOrder: 3,
      color: '#96C93D',
    },
    {
      name: 'Closed Won',
      description: 'Deal successfully closed',
      probability: 100,
      displayOrder: 4,
      color: '#40C057',
    },
  ];

  // Create stages for default pipeline
  for (const stage of defaultStages) {
    await prisma.cRMPipelineStage.upsert({
      where: {
        name_pipelineId: {
          name: stage.name,
          pipelineId: defaultPipeline.id,
        },
      },
      update: stage,
      create: {
        ...stage,
        pipelineId: defaultPipeline.id,
      },
    });
  }

  // Create default statuses for each entity type
  const statusesByType = {
    [CRMStatusType.LEAD]: [
      { name: 'New', color: '#4263EB', isDefault: true, displayOrder: 0 },
      { name: 'Contacted', color: '#45B7D1', displayOrder: 1 },
      { name: 'Qualified', color: '#40C057', displayOrder: 2 },
      { name: 'Unqualified', color: '#FF6B6B', displayOrder: 3 },
    ],
    [CRMStatusType.DEAL]: [
      { name: 'Open', color: '#4263EB', isDefault: true, displayOrder: 0 },
      { name: 'Won', color: '#40C057', displayOrder: 1 },
      { name: 'Lost', color: '#FF6B6B', displayOrder: 2 },
      { name: 'On Hold', color: '#FAB005', displayOrder: 3 },
    ],
    [CRMStatusType.PROJECT]: [
      {
        name: 'Not Started',
        color: '#4263EB',
        isDefault: true,
        displayOrder: 0,
      },
      { name: 'In Progress', color: '#45B7D1', displayOrder: 1 },
      { name: 'On Hold', color: '#FAB005', displayOrder: 2 },
      { name: 'Completed', color: '#40C057', displayOrder: 3 },
      { name: 'Cancelled', color: '#FF6B6B', displayOrder: 4 },
    ],
    [CRMStatusType.ACTIVITY]: [
      { name: 'Planned', color: '#4263EB', isDefault: true, displayOrder: 0 },
      { name: 'In Progress', color: '#45B7D1', displayOrder: 1 },
      { name: 'Completed', color: '#40C057', displayOrder: 2 },
      { name: 'Cancelled', color: '#FF6B6B', displayOrder: 3 },
    ],
  };

  // Create all statuses
  for (const [type, statuses] of Object.entries(statusesByType)) {
    for (const status of statuses) {
      await prisma.cRMStatus.upsert({
        where: {
          name_type: {
            name: status.name,
            type: type as CRMStatusType,
          },
        },
        update: status,
        create: {
          ...status,
          type: type as CRMStatusType,
        },
      });
    }
  }
}
