import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Clean all tables between tests to ensure isolation.
 * Deletes in correct order to respect foreign key constraints.
 */
export async function cleanDatabase(): Promise<void> {
  await prisma.integrationLog.deleteMany();
  await prisma.vehicleStatusHistory.deleteMany();
  await prisma.vehicle.deleteMany();
}

/**
 * Seed test data: companies and branches.
 */
export async function seedTestData(): Promise<void> {
  await prisma.company.upsert({
    where: { code: "PT-AKA" },
    update: {},
    create: { code: "PT-AKA", name: "PT Astra Kendaraan Andalan" },
  });

  await prisma.company.upsert({
    where: { code: "PT-AJN" },
    update: {},
    create: { code: "PT-AJN", name: "PT Astra Jaya Niaga" },
  });

  await prisma.branch.upsert({
    where: { code: "JKT01" },
    update: {},
    create: { code: "JKT01", companyCode: "PT-AKA", name: "Jakarta Pusat", location: "Jl. Sudirman" },
  });

  await prisma.branch.upsert({
    where: { code: "SBY01" },
    update: {},
    create: { code: "SBY01", companyCode: "PT-AJN", name: "Surabaya", location: "Jl. Ahmad Yani" },
  });
}

/**
 * Disconnect Prisma after all tests.
 */
export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}

export { prisma as testPrisma };
