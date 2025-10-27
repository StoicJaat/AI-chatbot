import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getChatCompletion } from "./openai";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all conversations
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Create a new conversation
  app.post("/api/conversations", async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid conversation data", details: error.errors });
      } else {
        console.error("Error creating conversation:", error);
        res.status(500).json({ error: "Failed to create conversation" });
      }
    }
  });

  // Get messages for a conversation
  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Delete a conversation
  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send a message and get AI response
  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        conversationId,
      });

      // Save user message
      const userMessage = await storage.createMessage(validatedData);

      // Get conversation history
      const conversationMessages = await storage.getMessagesByConversation(conversationId);
      
      // Prepare messages for OpenAI (only include user and assistant messages)
      const aiMessages = conversationMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Get AI response
      const aiResponse = await getChatCompletion(aiMessages);

      // Save AI response
      const aiMessage = await storage.createMessage({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });

      // Update conversation title if this is the first message
      if (conversationMessages.length === 1) {
        await storage.updateConversationTitle(
          conversationId, 
          validatedData.content.slice(0, 50)
        );
      }

      // Return both messages
      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid message data", details: error.errors });
      } else {
        console.error("Error sending message:", error);
        res.status(500).json({ error: error.message || "Failed to send message" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
