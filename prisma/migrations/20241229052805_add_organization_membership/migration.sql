/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `firstname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "name",
DROP COLUMN "updatedAt",
ADD COLUMN     "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "firstname" TEXT NOT NULL,
ADD COLUMN     "lastname" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientid" UUID NOT NULL,
    "organizationid" UUID NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "createddate" DATE NOT NULL,
    "isinservice" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "numberofvisits" INTEGER DEFAULT 0,
    "lastvisitrating" INTEGER,
    "agreetoterms" BOOLEAN NOT NULL,
    "orgid" UUID NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clientid" UUID NOT NULL,
    "organizationid" UUID NOT NULL,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "rating" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "logourl" TEXT,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMembership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_phone_key" ON "Client"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMembership_userId_organizationId_key" ON "OrganizationMembership"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_clientid_fkey" FOREIGN KEY ("clientid") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_orgid_fkey" FOREIGN KEY ("orgid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clientid_fkey" FOREIGN KEY ("clientid") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
