/*
  Warnings:

  - You are about to drop the column `orgid` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OrganizationMembership` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `OrganizationMembership` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OrganizationMembership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userid,organizationid]` on the table `OrganizationMembership` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationid` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationid` to the `OrganizationMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userid` to the `OrganizationMembership` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_orgid_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_userId_fkey";

-- DropIndex
DROP INDEX "OrganizationMembership_userId_organizationId_key";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "orgid",
ADD COLUMN     "organizationid" UUID NOT NULL;

-- AlterTable
ALTER TABLE "OrganizationMembership" DROP COLUMN "createdAt",
DROP COLUMN "organizationId",
DROP COLUMN "userId",
ADD COLUMN     "createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationid" UUID NOT NULL,
ADD COLUMN     "userid" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_userid_organizationid_key" ON "OrganizationMembership"("userid", "organizationid");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
