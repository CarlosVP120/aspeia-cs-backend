/*
  Warnings:

  - You are about to drop the `USUARIO` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `USUARIO_WORKSPACE` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WORKSPACE` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('ADMIN', 'MEMBER');

-- DropForeignKey
ALTER TABLE "USUARIO_WORKSPACE" DROP CONSTRAINT "USUARIO_WORKSPACE_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "USUARIO_WORKSPACE" DROP CONSTRAINT "USUARIO_WORKSPACE_workspaceId_fkey";

-- DropTable
DROP TABLE "USUARIO";

-- DropTable
DROP TABLE "USUARIO_WORKSPACE";

-- DropTable
DROP TABLE "WORKSPACE";

-- DropEnum
DROP TYPE "WORKSPACE_ROLE";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioWorkspace" (
    "usuarioId" INTEGER NOT NULL,
    "workspaceId" INTEGER NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioWorkspace_pkey" PRIMARY KEY ("usuarioId","workspaceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "UsuarioWorkspace_usuarioId_idx" ON "UsuarioWorkspace"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioWorkspace_workspaceId_idx" ON "UsuarioWorkspace"("workspaceId");

-- AddForeignKey
ALTER TABLE "UsuarioWorkspace" ADD CONSTRAINT "UsuarioWorkspace_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioWorkspace" ADD CONSTRAINT "UsuarioWorkspace_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
