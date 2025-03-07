/*
  Warnings:

  - The `role` column on the `USUARIO_WORKSPACE` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "WORKSPACE_ROLE" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "USUARIO_WORKSPACE" DROP COLUMN "role",
ADD COLUMN     "role" "WORKSPACE_ROLE" NOT NULL DEFAULT 'MEMBER';
