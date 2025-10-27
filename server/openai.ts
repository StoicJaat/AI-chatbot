import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

const mockResponses = [
  "That's an interesting question! Based on what you've asked, here are my thoughts: This is a demonstration response to show how the chat interface works. The conversation history is being saved to the database, and you can create multiple conversations to test the features.",
  "I understand what you're asking about. Let me provide some insight on that topic. This AI chatbot supports persistent chat history, dark/light mode switching, and the ability to continue old conversations. Try creating a new chat to see how conversations are managed!",
  "Great question! Here's what I think: The application is fully functional with features like typing indicators, message history, conversation management, and a beautiful responsive UI. Feel free to explore all the features!",
  "Thanks for your message! To answer your question: This chatbot demonstrates a modern full-stack application with React frontend, Express backend, and PostgreSQL database. All your conversations and messages are being persisted in the database.",
  "I appreciate you reaching out about this. From my perspective: The interface supports multiple features including creating new chats, switching between conversations, deleting old chats, and theme toggling. Everything you see is working with real database storage!",
];

function getMockResponse(userMessage: string): string {
  const hash = userMessage.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return mockResponses[hash % mockResponses.length];
}

export async function getChatCompletion(messages: Array<{ role: string; content: string }>): Promise<string> {
  const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
  
  if (!openai) {
    console.log("OpenAI API key not configured, using mock response");
    return getMockResponse(lastUserMessage);
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
    console.error("OpenAI API error, falling back to mock response:", error.message);
    return getMockResponse(lastUserMessage);
  }
}
