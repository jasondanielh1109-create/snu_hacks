import { UserData, AnalysisResult } from '../types';
import { GoogleGenAI } from '@google/genai';

export const runCompetitiveAnalysis = async (user: UserData): Promise<AnalysisResult> => {
  // @ts-ignore - Suppress TS error for import.meta
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  
  if (!apiKey) {
    throw new Error('Gemini API key is missing from environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a world-class healthcare market analyst. Analyze the following hospital and its competitors to provide a detailed competitive intelligence report.
    
    USER HOSPITAL:
    Name: ${user.hospitalName}
    Profile: ${JSON.stringify(user.hospitalProfile)}
    
    COMPETITORS:
    ${user.competitors.map(c => `- ${c.name} (Rating: ${c.rating}, Address: ${c.vicinity})`).join('\n')}
    
    Provide the analysis in the following JSON format:
    {
      "userHospitalRank": number (1 to ${user.competitors.length + 1}),
      "overallRanking": [
        { "hospitalName": string, "rank": number, "overallScore": number (0-100) }
      ],
      "radarScores": {
        "userHospital": { 
          "clinicalQuality": number, "patientExperience": number, "operationalEfficiency": number, 
          "technologyAdoption": number, "specializationBreadth": number, "emergencyCapability": number,
          "accreditationLevel": number, "staffStrength": number 
        },
        "competitors": [
          { 
            "name": string, "clinicalQuality": number, "patientExperience": number, "operationalEfficiency": number, 
            "technologyAdoption": number, "specializationBreadth": number, "emergencyCapability": number,
            "accreditationLevel": number, "staffStrength": number 
          }
        ]
      },
      "comparativeAnalysis": {
        "userStrengths": string[],
        "userWeaknesses": string[],
        "opportunities": string[],
        "threats": string[],
        "keyDifferentiators": string
      },
      "competitorProfiles": [
        { "name": string, "marketPosition": string, "estimatedBeds": number, "estimatedDoctors": number, "strengths": string[], "keyServices": string[] }
      ],
      "quickInsights": string[],
      "isAlreadyBest": boolean,
      "strategyReport": {
        "executiveSummary": string,
        "priorityActions": [
          { "title": string, "description": string, "priority": number (1-3), "category": string, "timeframe": string, "expectedImpact": string }
        ],
        "longTermVision": string,
        "estimatedTimeToLeadership": string
      }
    }
    
    Ensure the JSON is valid and the analysis is realistic based on the provided data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const content = response.text || '';
    
    // Extract JSON using regex /\{[\s\S]*\}/
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    throw new Error(error?.message || 'Gemini API failed to generate analysis');
  }
};


