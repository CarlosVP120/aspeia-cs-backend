-- CreateEnum
CREATE TYPE "CRMStatusType" AS ENUM ('LEAD', 'DEAL', 'PROJECT', 'ACTIVITY');

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "moduleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMTag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMOrganization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMPerson" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "organizationId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMLead" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "statusId" INTEGER,
    "organizationId" INTEGER,
    "personId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMDeal" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "statusId" INTEGER,
    "pipelineId" INTEGER NOT NULL,
    "stageId" INTEGER NOT NULL,
    "probability" DOUBLE PRECISION,
    "expectedCloseDate" TIMESTAMP(3),
    "organizationId" INTEGER,
    "personId" INTEGER,
    "projectId" INTEGER,
    "leadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMProject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "statusId" INTEGER,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "organizationId" INTEGER,
    "personId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMProjectTask" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,
    "parentTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMActivity" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "statusId" INTEGER,
    "organizationId" INTEGER,
    "personId" INTEGER,
    "dealId" INTEGER,
    "leadId" INTEGER,
    "projectId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMProduct" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tax" DOUBLE PRECISION,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMDealProduct" (
    "id" SERIAL NOT NULL,
    "dealId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "tax" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMDealProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMEmail" (
    "id" SERIAL NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "personId" INTEGER,
    "dealId" INTEGER,
    "leadId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMEmailAttachment" (
    "id" SERIAL NOT NULL,
    "emailId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMEmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMPipeline" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMPipelineStage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "displayOrder" INTEGER NOT NULL,
    "color" TEXT,
    "pipelineId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CRMStatusType" NOT NULL,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CRMOrganizationToCRMTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CRMOrganizationToCRMTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CRMPersonToCRMTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CRMPersonToCRMTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CRMLeadToCRMTag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CRMLeadToCRMTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Module_name_key" ON "Module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_moduleId_key" ON "Role"("name", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMTag_name_key" ON "CRMTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CRMDeal_leadId_key" ON "CRMDeal"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMProduct_code_key" ON "CRMProduct"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CRMDealProduct_dealId_productId_key" ON "CRMDealProduct"("dealId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMPipeline_name_key" ON "CRMPipeline"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CRMPipelineStage_name_pipelineId_key" ON "CRMPipelineStage"("name", "pipelineId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMStatus_name_type_key" ON "CRMStatus"("name", "type");

-- CreateIndex
CREATE INDEX "_CRMOrganizationToCRMTag_B_index" ON "_CRMOrganizationToCRMTag"("B");

-- CreateIndex
CREATE INDEX "_CRMPersonToCRMTag_B_index" ON "_CRMPersonToCRMTag"("B");

-- CreateIndex
CREATE INDEX "_CRMLeadToCRMTag_B_index" ON "_CRMLeadToCRMTag"("B");

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMPerson" ADD CONSTRAINT "CRMPerson_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CRMOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CRMStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CRMOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMLead" ADD CONSTRAINT "CRMLead_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CRMPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CRMStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "CRMPipeline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "CRMPipelineStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CRMOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CRMPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CRMProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDeal" ADD CONSTRAINT "CRMDeal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CRMLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMProject" ADD CONSTRAINT "CRMProject_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CRMStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMProject" ADD CONSTRAINT "CRMProject_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CRMOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMProject" ADD CONSTRAINT "CRMProject_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CRMPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMProjectTask" ADD CONSTRAINT "CRMProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CRMProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMProjectTask" ADD CONSTRAINT "CRMProjectTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "CRMProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CRMStatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "CRMOrganization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CRMPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CRMLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMActivity" ADD CONSTRAINT "CRMActivity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "CRMProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDealProduct" ADD CONSTRAINT "CRMDealProduct_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMDealProduct" ADD CONSTRAINT "CRMDealProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "CRMProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMEmail" ADD CONSTRAINT "CRMEmail_personId_fkey" FOREIGN KEY ("personId") REFERENCES "CRMPerson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMEmail" ADD CONSTRAINT "CRMEmail_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "CRMDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMEmail" ADD CONSTRAINT "CRMEmail_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "CRMLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMEmailAttachment" ADD CONSTRAINT "CRMEmailAttachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "CRMEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMPipelineStage" ADD CONSTRAINT "CRMPipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "CRMPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMOrganizationToCRMTag" ADD CONSTRAINT "_CRMOrganizationToCRMTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CRMOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMOrganizationToCRMTag" ADD CONSTRAINT "_CRMOrganizationToCRMTag_B_fkey" FOREIGN KEY ("B") REFERENCES "CRMTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMPersonToCRMTag" ADD CONSTRAINT "_CRMPersonToCRMTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CRMPerson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMPersonToCRMTag" ADD CONSTRAINT "_CRMPersonToCRMTag_B_fkey" FOREIGN KEY ("B") REFERENCES "CRMTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMLeadToCRMTag" ADD CONSTRAINT "_CRMLeadToCRMTag_A_fkey" FOREIGN KEY ("A") REFERENCES "CRMLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CRMLeadToCRMTag" ADD CONSTRAINT "_CRMLeadToCRMTag_B_fkey" FOREIGN KEY ("B") REFERENCES "CRMTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
