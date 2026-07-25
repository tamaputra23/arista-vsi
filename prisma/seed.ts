import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Upsert companies
  const companyAKA = await prisma.company.upsert({
    where: { code: "PT-AKA" },
    update: {},
    create: {
      code: "PT-AKA",
      name: "PT Astra Kendaraan Andalan",
    },
  });

  const companyAJN = await prisma.company.upsert({
    where: { code: "PT-AJN" },
    update: {},
    create: {
      code: "PT-AJN",
      name: "PT Astra Jaya Niaga",
    },
  });

  // Upsert branches
  await prisma.branch.upsert({
    where: { code: "JKT01" },
    update: {},
    create: {
      code: "JKT01",
      companyCode: "PT-AKA",
      name: "Jakarta Pusat",
      location: "Jl. Sudirman, Jakarta",
    },
  });

  await prisma.branch.upsert({
    where: { code: "JKT02" },
    update: {},
    create: {
      code: "JKT02",
      companyCode: "PT-AKA",
      name: "Jakarta Selatan",
      location: "Jl. Gatot Subroto, Jakarta",
    },
  });

  await prisma.branch.upsert({
    where: { code: "SBY01" },
    update: {},
    create: {
      code: "SBY01",
      companyCode: "PT-AJN",
      name: "Surabaya",
      location: "Jl. Ahmad Yani, Surabaya",
    },
  });

  console.log("Seed data inserted successfully:");
  console.log(`  Companies: ${companyAKA.code}, ${companyAJN.code}`);
  console.log("  Branches: JKT01, JKT02, SBY01");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
