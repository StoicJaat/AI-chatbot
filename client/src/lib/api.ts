import { apiRequest } from "./queryClient";
import type { Conversation, Message, InsertConversation, InsertMessage } from "@shared/schema";

export const conversationsApi = {
  getAll: async (): Promise<Conversation[]> => {
    const response = await apiRequest("GET", "/api/conversations");
    return response.json();
  },

  create: async (data: InsertConversation): Promise<Conversation> => {
    const response = await apiRequest("POST", "/api/conversations", data);
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest("DELETE", `/api/conversations/${id}`);
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiRequest("GET", `/api/conversations/${conversationId}/messages`);
    return response.json();
  },

  sendMessage: async (
    conversationId: string,
    data: Omit<InsertMessage, "conversationId">
  ): Promise<{ userMessage: Message; aiMessage: Message }> => {
    const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, data);
    return response.json();
  },
};
