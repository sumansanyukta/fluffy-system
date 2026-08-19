import { generateText } from "ai";
import { geminiFlash } from "./gemini";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const GENERATION_PROMPT = `You are a luxury fashion copywriter. Write a product description for the following item.

Brand Guidelines:
- Aspirational, concise, no superlatives
- Follows the brand's voice and style
- Includes product details (price, fabric, category, size range)
- Avoids technical terms or jargon
- Keep descriptions to 2-3 sentences

{{FEW_SHOT_EXAMPLES}}

Write a description for this product:
- Name: {{NAME}}
- Price: {{PRICE}}
- Fabric: {{FABRIC}}
- Category: {{CATEGORY}}
- Size Range: {{SIZE_RANGE}}
- Visual Attributes: {{IMAGE_DESCRIPTION}}

Return ONLY the description text, no quotes or extra formatting.`;

export async function generateDescription(product: {
  id: number;
  name: string;
  price: { toNumber(): number };
  fabric: string;
  category: string;
  sizeRange: string;
  imageDescription: string | null;
}): Promise<string> {
  const approvedExamples = await db.product.findMany({
    where: {
      category: product.category,
      generationStatus: "APPROVED",
      generatedDescription: { not: null },
      id: { not: product.id },
    },
    take: 3,
    select: { generatedDescription: true },
  });

  let fewShotSection = "";
  if (approvedExamples.length > 0) {
    const examples = approvedExamples
      .map((ex: Record<string, unknown>, i: number) => `Example ${i + 1}: ${ex.generatedDescription as string}`)
      .join("\n");
    fewShotSection = `Here are examples of approved descriptions for ${product.category}:\n\n${examples}\n`;
  }

  const prompt = GENERATION_PROMPT
    .replace("{{FEW_SHOT_EXAMPLES}}", fewShotSection)
    .replace("{{NAME}}", product.name)
    .replace("{{PRICE}}", `$${product.price.toNumber()}`)
    .replace("{{FABRIC}}", product.fabric)
    .replace("{{CATEGORY}}", product.category)
    .replace("{{SIZE_RANGE}}", product.sizeRange)
    .replace("{{IMAGE_DESCRIPTION}}", product.imageDescription ?? "Not available");

  const { text } = await generateText({
    model: geminiFlash,
    prompt,
  });

  return text.trim();
}
