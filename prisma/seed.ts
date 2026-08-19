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
    imageUrl:
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress_1.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjEzMDk3MjkxLCJpYXQiOjE3ODcxNjk4OTc0MzV9.YdRMtAHDgwM1e41N0-zgkSy3-a3WNwMIF2WSBasE4_s&vercel-blob-signature=kV-t62ry0WB2YW8kaOOs8j8dUKeuFUDs4y6RU64NhVE",
  },
  {
    name: "Pleated Midi Dress",
    description: "Micro-pleated midi dress in satin-finish polyester with a scoop neckline.",
    price: 520,
    fabric: "Polyester",
    category: "Dresses",
    sizeRange: "XS–XL",
    imageUrl:
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress-2.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjEzMTExODA5LCJpYXQiOjE3ODcxNjk5MTE5MTh9.T8_ejnjF6yjj5vbnwkd4G5Xs8E_zjy-_HF6Gqw2clfM&vercel-blob-signature=MxYjclAGDi8EElc6cJg_xY-LPJ6u5f8iBuy-HyJP0Qw",
  },
  {
    name: "Cotton Poplin Sundress",
    description: "Sundress in crisp cotton poplin with a sweetheart neckline and tiered skirt.",
    price: 325,
    fabric: "Cotton",
    category: "Dresses",
    sizeRange: "XS–L",
    imageUrl:
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress-2.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjEzMTIzMzkzLCJpYXQiOjE3ODcxNjk5MjM1MDl9.D2K79wxEAebvXrDAIsrm0SbpI8lAG1N8ikIEMtuCR1w&vercel-blob-signature=B6iBNF-bLqs-R0k4ocB_AVdx5YXhIPW_xo--5NAzupo",
  },
];

async function main() {
  console.log("Clearing database and seeding...");

  await prisma.product.deleteMany();

  for (const product of products) {
    await prisma.product.create({ data: product });
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
