import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { EmptyState } from "@/components/empty-state";
import { TypingIndicator } from "@/components/typing-indicator";
import { AppSidebar } from "@/components/app-sidebar";
import type { Message, Conversation } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { conversationsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [conversationMessages, setConversationMessages] = useState<Map<string, Message[]>>(new Map());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentMessages = currentConversationId 
    ? conversationMessages.get(currentConversationId) || []
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await conversationsApi.getAll();
      setConversations(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const messages = await conversationsApi.getMessages(conversationId);
      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(conversationId, messages);
        return newMap;
      });
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;
    
    try {
      if (!conversationId) {
        const newConversation = await conversationsApi.create({
          title: "New Conversation",
        });
        conversationId = newConversation.id;
        setConversations((prev) => [newConversation, ...prev]);
        setCurrentConversationId(conversationId);
        setConversationMessages((prev) => {
          const newMap = new Map(prev);
          newMap.set(conversationId, []);
          return newMap;
        });
      }

      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId: conversationId,
        role: "user",
        content,
        createdAt: new Date(),
      };

      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        const messages = newMap.get(conversationId) || [];
        newMap.set(conversationId, [...messages, tempUserMessage]);
        return newMap;
      });

      setIsTyping(true);

      const { userMessage, aiMessage } = await conversationsApi.sendMessage(conversationId, {
        role: "user",
        content,
      });

      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        const messages = (newMap.get(conversationId) || []).filter(m => !m.id.startsWith("temp-"));
        newMap.set(conversationId, [...messages, userMessage, aiMessage]);
        return newMap;
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, title: content.slice(0, 50), updatedAt: new Date() }
            : c
        )
      );

      setIsTyping(false);
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      setIsTyping(false);
      
      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        const messages = (newMap.get(conversationId) || []).filter(m => !m.id.startsWith("temp-"));
        newMap.set(conversationId, messages);
        return newMap;
      });
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setConversationMessages((prev) => {
      const newMap = new Map(prev);
      return newMap;
    });
  };

  const handleSelectConversation = async (id: string) => {
    setCurrentConversationId(id);
    if (!conversationMessages.has(id)) {
      await loadMessages(id);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await conversationsApi.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      if (currentConversationId === id) {
        setCurrentConversationId(null);
      }
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-lg font-semibold text-foreground">AI Chatbot</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-[900px] mx-auto w-full">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : currentMessages.length === 0 ? (
              <EmptyState onSuggestedPrompt={handleSendMessage} />
            ) : (
              <div className="flex flex-col gap-6 p-4 pb-8">
                {currentMessages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
}
