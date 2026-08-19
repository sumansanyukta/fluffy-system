import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Silk Evening Dress",
    description: "Floor-length silk charmeuse gown with a thigh-high slit and cowl neckline.",
    price: 1850,
    fabric: "Silk",
    category: "Dresses",
    sizeRange: "XS–L",
    imageUrl: "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress-2.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MTcxMjk5OTUxLCJpYXQiOjE3ODcxMjgxMDAxMjl9.UhXRz5vhzVVMJZ-tKFNce1D_6uoMp2twSoXvmxaIOuY&vercel-blob-signature=YxgGltX9WlFU99WiTUi9VTD9njZXRgcqfoGhmA-LrVU",
  },
  {
    name: "Pleated Midi Dress",
    description: "Micro-pleated midi dress in satin-finish polyester with a scoop neckline.",
    price: 520,
    fabric: "Polyester",
    category: "Dresses",
    sizeRange: "XS–XL",
    imageUrl: "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress_1.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MTcxNDcyNDc0LCJpYXQiOjE3ODcxMjgyNzI2Mzl9.XK77z6dn3kAMjLT6KzLVx3rFPYrdg3BkXukugIrldfk&vercel-blob-signature=z9EWtBc8mulAD0zb2cCQk504H2k7hqTJ-enzaj2s9cI",
  },
  {
    name: "Cotton Poplin Sundress",
    description: "Sundress in crisp cotton poplin with a sweetheart neckline and tiered skirt.",
    price: 325,
    fabric: "Cotton",
    category: "Dresses",
    sizeRange: "XS–L",
    imageUrl: "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress_3.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MTcxNTA4MjM5LCJpYXQiOjE3ODcxMjgzMDgzODN9.ptyV8Z9nYXUhdLGZUhqF18JTlG-5JzhNlDX6H8ghzZM&vercel-blob-signature=GHL4iaVcXPPSGPFg6EwOk5E16aweY6PYAvr6-31X0pQ",
  },
];

async function main() {
  console.log("Clearing database and seeding...");

  await prisma.product.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      name: "Luxury Collection 2026",
      description: "Demo product catalog with 3 dress images.",
      ownerId: "user_seed",
    },
  });

  console.log(`Created project: ${project.name} (${project.id})`);

  for (const product of products) {
    await prisma.product.create({
      data: {
        projectId: project.id,
        ...product,
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
