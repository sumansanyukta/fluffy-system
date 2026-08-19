import { generateObject } from "ai";
import { geminiFlash } from "./gemini";
import { z } from "zod";

const ScoreSchema = z.object({
  score: z.number().min(1).max(10),
  reasoning: z.string(),
  issues: z.array(z.string()),
});

export type ScoreResult = z.infer<typeof ScoreSchema>;

const SCORING_PROMPT = `Evaluate this product description against the brand guidelines.

Brand Guidelines:
- Aspirational, concise, no superlatives
- Follows the brand's voice and style
- Includes product details (price, fabric, category, size range)
- Avoids technical terms or jargon

Rate the description on a scale of 1-10:
- 8-10: Excellent — matches brand voice, includes all details, no issues
- 5-7: Good — mostly matches but has minor issues
- 1-4: Poor — significant deviations from brand guidelines

Provide a brief reasoning and list any specific issues found.`;

export async function scoreDescription(
  description: string,
  product: { name: string; price: { toNumber(): number }; fabric: string; category: string }
): Promise<ScoreResult> {
  const { object } = await generateObject({
    model: geminiFlash,
    schema: ScoreSchema,
    prompt: `${SCORING_PROMPT}

Description: ${description}
Product: ${product.name}, $${product.price.toNumber()}, ${product.fabric}, ${product.category}`,
  });

  return object;
}
