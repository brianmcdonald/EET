import { GoogleGenAI, Type } from "@google/genai";

// These are the valid trigger values from the form's dropdown.
const validTriggers = ['insecurity', 'conflict', 'natural_disaster', 'other'];

export interface AnalysisResult {
  trigger: string;
  priorityNeeds: string[];
}

// Initialize the Gemini client. The API key is sourced from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the JSON schema for the expected response to ensure structured output.
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    trigger: {
      type: Type.STRING,
      description: `The main trigger of the event. Must be one of the following values: ${validTriggers.join(', ')}.`,
      enum: validTriggers,
    },
    priorityNeeds: {
      type: Type.ARRAY,
      description: 'A list of the top 3 priority needs for the affected population. Each need should be a short phrase (e.g., "Clean Water", "Shelter", "Medical Supplies").',
      items: {
        type: Type.STRING,
      },
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['trigger', 'priorityNeeds'],
};

/**
 * Analyzes the event narrative using the Gemini API to extract trigger and priority needs.
 * @param narrative - The detailed summary of the emergency event.
 * @returns A promise that resolves to an AnalysisResult object.
 */
export async function analyzeNarrative(narrative: string): Promise<AnalysisResult> {
  try {
    const systemInstruction = `You are an expert humanitarian aid analyst working for the IOM Displacement Tracking Matrix (DTM). Your task is to analyze an emergency event narrative and extract key information. Based on the text provided, identify the primary trigger of the event and list the top three most urgent priority needs of the affected population. The response must be in JSON format and adhere to the provided schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Please analyze the following narrative:\n\n---\n\n${narrative}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString) as AnalysisResult;

    // Basic validation to ensure the result matches the expected structure.
    if (
      !result.trigger || 
      !Array.isArray(result.priorityNeeds) || 
      result.priorityNeeds.length !== 3
    ) {
      throw new Error("AI returned an invalid or incomplete data structure.");
    }
    
    // Ensure the trigger value is one of the allowed options.
    if (!validTriggers.includes(result.trigger)) {
      console.warn(`AI returned an unexpected trigger: '${result.trigger}'. Defaulting to 'other'.`);
      result.trigger = 'other';
    }

    return result;
  } catch (error) {
    console.error("Error analyzing narrative with Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    throw new Error(`Failed to analyze narrative: ${errorMessage}`);
  }
}
