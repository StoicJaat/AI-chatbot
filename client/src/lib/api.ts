import { apiRequest } from "./queryClient";
import type { Conversation, Message, InsertConversation, InsertMessage } from "@shared/schema";

export const conversationsApi = {
  getAll: async (): Promise<Conversation[]> => {
    const response = await fetch("/api/conversations");
    if (!response.ok) throw new Error("Failed to fetch conversations");
    return response.json();
  },

  create: async (data: InsertConversation): Promise<Conversation> => {
    return apiRequest("POST", "/api/conversations", data);
  },

  delete: async (id: string): Promise<void> => {
    return apiRequest("DELETE", `/api/conversations/${id}`);
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    return response.json();
  },

  sendMessage: async (
    conversationId: string,
    data: Omit<InsertMessage, "conversationId">
  ): Promise<{ userMessage: Message; aiMessage: Message }> => {
    return apiRequest("POST", `/api/conversations/${conversationId}/messages`, data);
  },
};
