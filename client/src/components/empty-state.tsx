import { MessageSquare, Sparkles, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onSuggestedPrompt: (prompt: string) => void;
}

const suggestedPrompts = [
  { icon: Sparkles, text: "Tell me an interesting fact" },
  { icon: Brain, text: "Help me brainstorm ideas" },
  { icon: Zap, text: "Explain a complex concept" },
];

export function EmptyState({ onSuggestedPrompt }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8" data-testid="empty-state">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Welcome to AI Chatbot
          </h1>
          <p className="text-muted-foreground text-base">
            Start a conversation with our AI assistant. Ask anything and get intelligent responses.
          </p>
        </div>

        <div className="grid gap-3 mt-8">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Try these prompts:
          </p>
          {suggestedPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto py-3 px-4 text-left justify-start hover-elevate"
              onClick={() => onSuggestedPrompt(prompt.text)}
              data-testid={`button-suggested-prompt-${index}`}
            >
              <prompt.icon className="h-4 w-4 mr-3 flex-shrink-0 text-primary" />
              <span className="text-sm">{prompt.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
