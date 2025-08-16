// src/components/chat-interface.tsx
"use client";

import { useState, FormEvent, useRef, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

export function ChatInterface({
  documentId,
  documentName,
}: {
  documentId: string;
  documentName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/documents/${documentId}/chat`,
        { question: input }
      );

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        content: response.data.answer,
      };
      setMessages((current) => [...current, aiMessage]);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setMessages(messages => messages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl truncate">Chat with: {documentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[60vh] flex flex-col">
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "ai" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <Skeleton className="h-12 w-24 rounded-lg" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex items-center mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your document..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" className="ml-2" disabled={isLoading}>
                <SendHorizonal className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}