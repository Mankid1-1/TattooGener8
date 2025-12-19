
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { AppTier, GenerationParams, BodyPlacement, TattooStyle } from "../types";

// Security Note: We use specific HarmCategory enums required by the GoogleGenAI SDK to ensure
// safety settings are correctly applied. Incorrect strings are ignored or cause type errors.

export const generateTattooDesign = async (params: GenerationParams): Promise<{ imageUrl: string; prompt: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const { concept, placement, style, tier, variationIndex = 0, isProjectItem = false } = params;

  // 🛡️ SENTINEL: Input Sanitization
  // Truncate concept to prevent massive prompts (DoS/Token exhaustion)
  const sanitizedConcept = concept.slice(0, 1000).replace(/[^\w\s.,!?'"-]/g, "");

  // Use Flash model for speed and efficiency.
  const modelName = 'gemini-2.5-flash-image';

  let visualContext = "";
  
  // If it's a Project Item (for the Sleeve Builder) OR explicitly Paper Flash
  if (isProjectItem || placement === BodyPlacement.PAPER) {
      visualContext = `
      TASK: Generate a TATTOO FLASH ELEMENT.
      BACKGROUND: Pure white background (#FFFFFF). 
      IMPORTANT: Do NOT render a body part. Just the tattoo design isolated.
      RENDERING: Clean vector lines, high contrast stencil ready.
      This element will be digitally composited onto a body later.
      If style is Traditional, use bold black outlines. 
      If style is Realism, use high contrast shading.
      `;
  } else {
      // Single Shot Visualizer Mode
      visualContext = `
      TASK: Generate a TATTOO VISUALIZATION ON SKIN.
      BODY PLACEMENT: ${placement}.
      RENDERING: Show the tattoo design inked on the ${placement} of a human body.
      Lighting should be studio quality.
      Skin texture should be realistic.
      `;
  }

  // Handle style-specific overrides
  let styleSpecifics = "";
  if (style === TattooStyle.GEOMETRIC) {
      styleSpecifics = "STYLE DETAILS: Focus on mandalas, sacred geometry, and shading achieved through stippling (dots). Emphasize mathematical precision, symmetry, and fine dotwork texture.";
  }

  const prompt = `
    Generate an image of a professional tattoo design.
    
    SUBJECT: "${sanitizedConcept}"
    STYLE: ${style}
    VARIATION_SEED: ${variationIndex}
    
    ${visualContext}
    
    ${styleSpecifics}

    ARTISTIC REQUIREMENTS:
    - Masterpiece quality ink.
    - If color is used in the style (e.g. Watercolor, New School), make it vibrant.
    - If style is Blackwork/Dotwork/Geometric, strictly monochrome black ink.
    - No text labels, no watermarks, no artist signatures.
    
    Ensure the output is a high-resolution image.
  `;

  const imageConfig: any = {
    aspectRatio: "3:4"
  };

  // Add small delay to prevent rate limits on batch generation
  if (variationIndex > 0) {
      await new Promise(resolve => setTimeout(resolve, 800 * variationIndex));
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig,
        // Relax safety settings to allow artistic depiction of skulls, weapons, etc common in tattoos
        // Using explicit enums as required by the GoogleGenAI SDK to ensure type safety
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        ]
      },
    });

    // Check for image data
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64Data = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mimeType};base64,${base64Data}`,
            prompt
          };
        }
      }
    }

    // Check if the model refused with text
    const textPart = response.candidates?.[0]?.content?.parts?.find(p => p.text);
    if (textPart && textPart.text) {
        console.warn("Model refused to generate image:", textPart.text);
        throw new Error(`Model Refusal: ${textPart.text.substring(0, 100)}...`);
    }

    throw new Error("No image data found in response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message && error.message.includes("Model Refusal")) {
        throw error; // Re-throw specific refusal
    }
    if (error.status === 403 || error.code === 403 || (error.message && error.message.includes('permission'))) {
       throw new Error("PERMISSION_DENIED");
    }
    // Rate limit or Overloaded
    if (error.status === 429 || error.code === 429 || error.status === 503) {
       throw new Error("Server busy. Please try generating fewer designs at once.");
    }
    throw error;
  }
};
