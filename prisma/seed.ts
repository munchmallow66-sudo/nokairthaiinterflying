import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Thai Inter Flying Admission System database...");

  // Seed Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tif.ac.th" },
    update: {},
    create: {
      name: "Academy Administrator",
      email: "admin@tif.ac.th",
      role: "ADMIN",
    },
  });

  console.log("Created Admin:", adminUser.email);

  // Seed Courses
  const courses = [
    {
      slug: "ppl",
      code: "PPL",
      name: "Private Pilot License",
      description: "Fundamental single-engine flight training on Cessna 172 Skyhawks.",
      price: 350000,
      duration: "4 Months",
      requirements: ["Age 17+", "High School Graduation", "CAAT Class 2 Medical"],
    },
    {
      slug: "cpl",
      code: "CPL",
      name: "Commercial Pilot License",
      description: "Complete career license program for commercial airline pilot cadets.",
      price: 1250000,
      duration: "14 Months",
      requirements: ["Age 18+", "PPL License", "CAAT Class 1 Medical", "TOEIC 650+"],
    },
    {
      slug: "atpl-theory",
      code: "ATPL",
      name: "ATPL Frozen Ground Theory",
      description: "High-level airline ground school covering 14 CAAT examination subjects.",
      price: 180000,
      duration: "6 Months",
      requirements: ["CPL/PPL License"],
    },
    {
      slug: "flight-instructor",
      code: "FI",
      name: "Flight Instructor Rating",
      description: "Certifies pilot graduates to instruct flight student cadets.",
      price: 300000,
      duration: "3 Months",
      requirements: ["CPL License", "200 Hours Flight Log"],
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  console.log("Courses seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
