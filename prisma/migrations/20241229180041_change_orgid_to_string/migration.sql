-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_clientid_fkey";

-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_organizationid_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_organizationid_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_clientid_fkey";

-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_organizationid_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_organizationid_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembership" DROP CONSTRAINT "OrganizationMembership_userid_fkey";

-- AlterTable
ALTER TABLE "CheckIn" ALTER COLUMN "clientid" SET DATA TYPE TEXT,
ALTER COLUMN "organizationid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Client" ALTER COLUMN "organizationid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "clientid" SET DATA TYPE TEXT,
ALTER COLUMN "organizationid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "OrganizationMembership" ALTER COLUMN "organizationid" SET DATA TYPE TEXT,
ALTER COLUMN "userid" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "SaleData" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizationid" TEXT NOT NULL,
    "employeeid" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "combonum" INTEGER,
    "note" TEXT,
    "createdat" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SaleData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_clientid_fkey" FOREIGN KEY ("clientid") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_clientid_fkey" FOREIGN KEY ("clientid") REFERENCES "Client"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMembership" ADD CONSTRAINT "OrganizationMembership_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleData" ADD CONSTRAINT "SaleData_employeeid_fkey" FOREIGN KEY ("employeeid") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "SaleData" ADD CONSTRAINT "SaleData_organizationid_fkey" FOREIGN KEY ("organizationid") REFERENCES "Organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
