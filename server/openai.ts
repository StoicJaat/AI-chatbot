import OpenAI from "openai";

// Using the javascript_openai blueprint
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function getChatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  if (!openai) {
    throw new Error("OpenAI API key is not configured. Please add your OPENAI_API_KEY to the Secrets to enable AI responses.");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages.map(m => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      max_completion_tokens: 8192,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
}
