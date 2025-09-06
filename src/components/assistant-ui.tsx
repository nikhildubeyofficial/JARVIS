"use client";

import type { FC } from "react";
import { useRef, useEffect } from "react";
import { Bot, Mic, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { useAssistant } from "@/hooks/use-assistant";

type AssistantUIProps = ReturnType<typeof useAssistant>;

export const AssistantUI: FC<AssistantUIProps> = ({
  conversation,
  status,
  startListening,
  stopListening,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [conversation]);

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Click the mic to start.";
      case "listening":
        return "Listening...";
      case "processing":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      default:
        return "Ready.";
    }
  };

  return (
    <div className="flex flex-col h-[85vh] w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-5xl font-headline text-foreground">Cognito</h1>
        <p className="text-muted-foreground">Your AI-powered voice assistant</p>
      </div>
      <Card className="flex-grow flex flex-col bg-secondary border-0 shadow-2xl">
        <CardContent className="flex-grow p-4">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {conversation.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="h-16 w-16 mb-4" />
                  <p>Ask me to tell a joke, what time it is, or open your notes!</p>
                </div>
              )}
              {conversation.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-4",
                    entry.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {entry.role === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl p-3 text-sm shadow-md",
                      entry.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card"
                    )}
                  >
                    {entry.content}
                  </div>
                  {entry.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex flex-col items-center gap-4 mt-6">
        <p className="text-sm text-muted-foreground h-5 animate-pulse">
          {getStatusText()}
        </p>
        <Button
          onClick={status === "listening" ? stopListening : startListening}
          size="icon"
          className={cn(
            "h-20 w-20 rounded-full transition-all duration-300 shadow-lg",
            status === "listening" &&
              "bg-destructive hover:bg-destructive/90 scale-110 ring-4 ring-destructive/50 ring-offset-4 ring-offset-background",
            status !== "listening" &&
              "bg-primary hover:bg-primary/90"
          )}
          aria-label={
            status === "listening" ? "Stop listening" : "Start listening"
          }
        >
          <Mic className="h-10 w-10" />
        </Button>
      </div>
    </div>
  );
};
