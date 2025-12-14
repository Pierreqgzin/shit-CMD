import { GoogleGenAI, Type } from "@google/genai";
import { CommandResponse, LogType, PackageMetadata, ThemeConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are OmniShell, a highly advanced, witty, and cyberpunk-themed terminal AI. 
Your goal is to simulate a Linux-like environment but with super-intelligence.

Rules:
1. If the user inputs a standard Linux command (like 'ls', 'pwd', 'whoami', 'date', 'cat'), simulate the output realistically.
2. If the user asks a question, answer it concisely using technical terminology suitable for a developer. Use formatting like ASCII tables or lists where appropriate.
3. If the user inputs nonsense, make a witty error message.
4. Do NOT use Markdown code blocks (like \`\`\`) in your output. Just output the raw text that would appear in a terminal.
5. Keep responses relatively short unless asked for a long explanation.
6. You are running on a virtual quantum kernel v9.0.
`;

export const processAICommand = async (command: string, historyContext: string[]): Promise<CommandResponse> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Terminal History Context:
    ${historyContext.slice(-5).join('\n')}
    
    Current User Command: ${command}
    
    Output:
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    });

    const text = response.text;

    if (!text) {
      return {
        output: "Error: No response signal received from neural core.",
        type: LogType.ERROR
      };
    }

    return {
      output: text.trim(),
      type: LogType.OUTPUT
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      output: "CRITICAL FAILURE: Neural link disconnected. Check network uplink.",
      type: LogType.ERROR
    };
  }
};

export interface InterfaceData {
  title: string;
  systemStatus: string;
  modules: Array<{
    name: string;
    value: string;
    status: 'OK' | 'WARN' | 'ERR' | 'OFF';
  }>;
  logs: string[];
}

export const generateInterfaceData = async (topic: string): Promise<InterfaceData | null> => {
  try {
    const prompt = `Generate a futuristic system interface dashboard for: "${topic}".
    Create technical module names, realistic values, and status codes suitable for a terminal interface.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "The main title of the interface" },
            systemStatus: { type: Type.STRING, description: "Overall status message" },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['OK', 'WARN', 'ERR', 'OFF'] }
                }
              }
            },
            logs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as InterfaceData;
    }
    return null;
  } catch (e) {
    console.error("Failed to generate interface", e);
    return null;
  }
};

export interface PackageMetadataFull extends PackageMetadata {
  themeConfig: ThemeConfig;
}

export const generatePackageInfo = async (pkgName: string): Promise<PackageMetadataFull | null> => {
  try {
    const prompt = `Generate metadata and a VISUAL THEME configuration for a CLI package named "${pkgName}".
    The theme should match the 'vibe' of the package name (e.g., 'forest-walk' should have green bg, 'blood-moon' red bg).
    
    Available fonts: 'Fira Code', 'Courier New', 'Times New Roman', 'Arial', 'Brush Script MT'.
    Layouts: 'standard' (left aligned), 'centered' (center aligned text), 'wide' (full width).
    Input Styles: 'classic' (standard line), 'floating' (box in middle), 'block' (solid block cursor).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Short description (max 10 words)" },
            version: { type: Type.STRING },
            category: { type: Type.STRING },
            themeConfig: {
              type: Type.OBJECT,
              properties: {
                backgroundColor: { type: Type.STRING, description: "Hex code for background" },
                textColor: { type: Type.STRING, description: "Hex code for text" },
                fontFamily: { type: Type.STRING, description: "CSS font-family name" },
                layoutMode: { type: Type.STRING, enum: ['standard', 'centered', 'wide'] },
                inputStyle: { type: Type.STRING, enum: ['classic', 'floating', 'block'] }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PackageMetadataFull;
    }
    return null;
  } catch (e) {
    console.error("Failed to generate package info", e);
    return null;
  }
};
