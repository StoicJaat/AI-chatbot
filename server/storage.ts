import { type Conversation, type Message, type InsertConversation, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<void>;
  updateConversationTitle(id: string, title: string): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const now = new Date();
    const conversation: Conversation = { 
      ...insertConversation, 
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
    Array.from(this.messages.values())
      .filter(m => m.conversationId === id)
      .forEach(m => this.messages.delete(m.id));
  }

  async updateConversationTitle(id: string, title: string): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.conversations.set(id, conversation);
    }
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    const conversation = this.conversations.get(insertMessage.conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
      this.conversations.set(conversation.id, conversation);
    }
    
    return message;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
}

export const storage = new MemStorage();
