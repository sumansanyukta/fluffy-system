import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const products = [
  {
    name: "Silk Evening Dress",
    description: "Floor-length silk charmeuse gown with a thigh-high slit and cowl neckline.",
    price: 1850,
    fabric: "Silk",
    category: "Dresses",
    sizeRange: "XS–L",
  },
  {
    name: "Pleated Midi Dress",
    description: "Micro-pleated midi dress in satin-finish polyester with a scoop neckline.",
    price: 520,
    fabric: "Polyester",
    category: "Dresses",
    sizeRange: "XS–XL",
  },
  {
    name: "Cotton Poplin Sundress",
    description: "Sundress in crisp cotton poplin with a sweetheart neckline and tiered skirt.",
    price: 325,
    fabric: "Cotton",
    category: "Dresses",
    sizeRange: "XS–L",
  },
];

async function main() {
  console.log("Clearing database and seeding...");

  await prisma.product.deleteMany();

  for (const product of products) {
    const slug = slugify(product.name);
    await prisma.product.create({
      data: {
        ...product,
        imageUrl: `https://picsum.dev/800/600?seed=${slug}`,
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
