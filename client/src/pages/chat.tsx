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

export default function Chat() {
  const [conversationMessages, setConversationMessages] = useState<Map<string, Message[]>>(new Map());
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentMessages = currentConversationId 
    ? conversationMessages.get(currentConversationId) || []
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isTyping]);

  const handleSendMessage = async (content: string) => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = `conv-${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        title: content.slice(0, 50),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(conversationId);
      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        newMap.set(conversationId, []);
        return newMap;
      });
    }

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId,
      role: "user",
      content,
      createdAt: new Date(),
    };

    setConversationMessages((prev) => {
      const newMap = new Map(prev);
      const messages = newMap.get(conversationId) || [];
      newMap.set(conversationId, [...messages, userMessage]);
      return newMap;
    });

    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, title: content.slice(0, 50), updatedAt: new Date() }
            : c
        )
      );
    }

    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversationId: conversationId,
        role: "assistant",
        content: "This is a frontend demo. The backend integration will connect this to the OpenAI API to provide real AI responses. For now, this demonstrates the beautiful UI and user experience.",
        createdAt: new Date(),
      };
      
      setConversationMessages((prev) => {
        const newMap = new Map(prev);
        const messages = newMap.get(conversationId) || [];
        newMap.set(conversationId, [...messages, aiMessage]);
        return newMap;
      });
      setIsTyping(false);
    }, 1500);
  };

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: `New Conversation`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(newConversation.id);
    setConversationMessages((prev) => {
      const newMap = new Map(prev);
      newMap.set(newConversation.id, []);
      return newMap;
    });
  };

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setConversationMessages((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
    if (currentConversationId === id) {
      setCurrentConversationId(null);
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
            {currentMessages.length === 0 ? (
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
