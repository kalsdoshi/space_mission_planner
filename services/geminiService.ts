import { GoogleGenAI } from "@google/genai";
import { Mission, Maneuver } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeMissionProfile = async (mission: Mission, maneuvers: Maneuver[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Configuration Error: API Key missing.";

  const prompt = `
    You are the Chief Flight Architect for the SLS (Space Launch System).
    Analyze the following mission profile against standard orbital mechanics and safety protocols.
    
    Mission Details:
    - Name: ${mission.mission_name}
    - Block: ${mission.block_version}
    - Payload: ${mission.payload_mass}t
    - Destination: ${mission.destination}
    - C3 Energy: ${mission.c3_energy} km²/s²
    
    Proposed Maneuvers:
    ${maneuvers.map(m => `- DeltaV: ${m.delta_v}m/s, Duration: ${m.burn_duration}s, G-Force: ${m.calculated_g_force.toFixed(2)}g, Status: ${m.status}`).join('\n')}

    Please provide a brief executive summary (max 3 sentences) assessing the mission feasibility and any structural or thermal risks identified.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return "Analysis unavailable due to network or configuration error.";
  }
};
