import { getConfig } from "../config";
import { SymptomCheckerData } from "@shared/schema";

interface PerplexityOptions {
  model: string;
  messages: Array<{role: string, content: string}>;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface PerplexityResponse {
  id: string;
  model: string;
  object: string;
  created: number;
  citations: string[];
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      role: string;
      content: string;
    };
    delta?: {
      role: string;
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a prescription using the Perplexity API
 * 
 * @param symptomData User's symptom data
 * @returns The AI-generated diagnosis and recommendations
 */
export async function generateAIPrescription(symptomData: SymptomCheckerData): Promise<{
  diagnosis: string;
  recommendations: string;
  error?: string;
}> {
  const config = getConfig();
  
  // Check if Perplexity API integration is enabled
  if (!config.ai.usePerplexity || !process.env.PERPLEXITY_API_KEY) {
    return {
      diagnosis: "",
      recommendations: "",
      error: "AI prescription generation is not enabled"
    };
  }
  
  try {
    // Construct the prompt for Perplexity
    const prompt = `
As a medical AI assistant, analyze the following patient symptoms and provide a possible diagnosis and recommendations.
Do NOT prescribe specific medications, just provide general medical advice.

Patient symptoms:
- Main symptom: ${symptomData.mainSymptom}
- Duration: ${symptomData.duration}
- Severity (1-10): ${symptomData.severity}
- Additional symptoms: ${symptomData.additionalSymptoms?.join(", ") || "None"}
- Medical history: ${symptomData.medicalHistory || "None provided"}

Please provide:
1. A brief diagnosis based on these symptoms
2. General recommendations for the patient (lifestyle changes, home remedies, when to see a doctor)
`;

    const options: PerplexityOptions = {
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system", 
          content: "You are a helpful medical assistant. Provide accurate, evidence-based information about symptoms and conditions, but always remind users to consult healthcare professionals for definitive diagnosis and treatment."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.2,
      top_p: 0.9,
      stream: false
    };
    
    // Call Perplexity API
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json() as PerplexityResponse;
    const content = data.choices[0]?.message.content;
    
    if (!content) {
      throw new Error("Empty response from Perplexity API");
    }
    
    // Extract diagnosis and recommendations from the response
    const diagnosisMatch = content.match(/diagnosis:?(.*?)(?=recommendations|$)/is);
    const recommendationsMatch = content.match(/recommendations:?(.*?)(?=$)/is);
    
    return {
      diagnosis: diagnosisMatch?.[1]?.trim() || "Unable to determine diagnosis",
      recommendations: recommendationsMatch?.[1]?.trim() || "No specific recommendations provided"
    };
    
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    return {
      diagnosis: "",
      recommendations: "",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}