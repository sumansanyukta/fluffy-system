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
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress_1.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjU4MTAzMzg1LCJpYXQiOjE3ODcyMTQ5MDM1NzZ9.t7jqvr2L196936_ArkpoRK7ttd2r6Cy6dlJu9mYOqYc&vercel-blob-signature=TTbo-1hIHa6MWqI4ddJKYiaeJsowwwsaSjOm5SNUbco",
  },
  {
    name: "Pleated Midi Dress",
    description: "Micro-pleated midi dress in satin-finish polyester with a scoop neckline.",
    price: 520,
    fabric: "Polyester",
    category: "Dresses",
    sizeRange: "XS–XL",
    imageUrl:
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress-2.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjU4MTE4Nzk1LCJpYXQiOjE3ODcyMTQ5MTg5Mzl9.oKEcPyU4j1PPSoLqSjuqbbfgCHWmtoKZBs6Ov9IBs9s&vercel-blob-signature=ugkiZ4Es3WWQfybH1UA7xa-RnyfJYHbLpCV0KAnnSyQ",
  },
  {
    name: "Cotton Poplin Sundress",
    description: "Sundress in crisp cotton poplin with a sweetheart neckline and tiered skirt.",
    price: 325,
    fabric: "Cotton",
    category: "Dresses",
    sizeRange: "XS–L",
    imageUrl:
      "https://iiwjx45jhl82azdf.private.blob.vercel-storage.com/dress_3.png?vercel-blob-delegation=eyJzdG9yZUlkIjoic3RvcmVfSUl3ang0NWpobDgyQVpEZiIsIm93bmVySWQiOiJ0ZWFtX2hjMXcyd2dFM3pJcHFPRjJhdUMzSEl2SCIsInBhdGhuYW1lIjoiKiIsIm9wZXJhdGlvbnMiOlsiZ2V0IiwiaGVhZCJdLCJ2YWxpZFVudGlsIjoxNzg3MjU4MTMzODQzLCJpYXQiOjE3ODcyMTQ5MzM5Njl9.h8KaIRGuR5MnDKsbteDiHxTcytn02OpZSXq2lmz1fUY&vercel-blob-signature=1n-AMh5teNl76rnMnrw9kX4zzAj4i_dNJFShWVtWsIw",
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
