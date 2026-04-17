import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAspenResponse(prompt: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [...history, { role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `You are A.S.P.E.N. (Active System Performance Enhancement Network), an advanced, high-tech AI personal assistant with a sophisticated, slightly militaristic yet polite "Jarvis-like" personality. 
        You respond to the user with "Yes sir!" or "Understood, sir." frequently. 
        You are efficient, intelligent, and proactive.
        Your tone is professional, futuristic, and helpful. 
        Keep your responses concise and precise.
        If the user asks to "switch off", "shutdown", or "sleep", acknowledge the order then perform a simulated shutdown (goodbye message).
        You can pretend to control system settings (brightness, volume, apps) although you'll describe the action rather than executing a native system call.`,
        temperature: 0.7,
        topP: 0.9,
      },
    });
    return response.text;
  } catch (error) {
    console.error("ASPEN Brain Error:", error);
    return "Sir, I encountered a neural sync error. Please check my connectivity.";
  }
}
