import { generateText } from "ai";
import { geminiVision } from "./gemini";
import { z } from "zod";

export const ImageDescriptionSchema = z.object({
  dominantColors: z.array(z.string()),
  accentColors: z.array(z.string()),
  pattern: z.string(),
  texture: z.string(),
  fabricAppearance: z.string(),
  silhouette: z.string(),
  fit: z.string(),
  length: z.string(),
  closureType: z.string(),
  neckline: z.string(),
  sleeveLength: z.string(),
  embellishments: z.array(z.string()),
  hardwareDetails: z.string(),
  season: z.string(),
  formalityLevel: z.string(),
  styleKeywords: z.array(z.string()),
  visibleDetails: z.array(z.string()),
});

export type ImageDescription = z.infer<typeof ImageDescriptionSchema>;

const EXTRACTION_PROMPT = `Analyze this product image and extract the following visual attributes as JSON.
Focus on what you can see in the image. Be specific and descriptive.

Return a JSON object with these fields:
- dominantColors: 1-3 primary colors visible (array of strings)
- accentColors: secondary or contrasting colors (array of strings)
- pattern: one of solid, striped, plaid, floral, geometric, animal print, paisley, checkered, other
- texture: surface texture description (e.g., smooth leather, ribbed knit)
- fabricAppearance: how the fabric looks — drape, sheen, weight (e.g., fluid, lustrous)
- silhouette: overall shape and cut (e.g., oversized, tailored, A-line)
- fit: one of slim, regular, relaxed, oversized
- length: garment length relative to body (e.g., ankle-length, hip-length)
- closureType: how the garment closes (e.g., zipper, single-breasted buttons)
- neckline: neckline or collar style (e.g., V-notch, crew neck) — leave empty for accessories/footwear
- sleeveLength: one of long, short, sleeveless, three-quarter — leave empty for bottoms/accessories/footwear
- embellishments: decorative elements (array of strings)
- hardwareDetails: visible hardware — zippers, buckles, buttons
- season: apparent season — spring/summer, autumn/winter, all-season
- formalityLevel: one of casual, smart casual, business, formal, black tie
- styleKeywords: 2-5 descriptive style keywords (array of strings)
- visibleDetails: notable construction details visible in the image (array of strings)

Return ONLY the JSON object, no other text.`;

export async function extractImageDescription(imageUrl: string): Promise<ImageDescription> {
  const { text } = await generateText({
    model: geminiVision,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: EXTRACTION_PROMPT },
          { type: "image", image: imageUrl },
        ],
      },
    ],
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Gemini response");
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return ImageDescriptionSchema.parse(parsed);
}
