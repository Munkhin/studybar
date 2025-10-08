import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, FileText, MessageSquare, Map } from "lucide-react";
import { useTutor } from "@/hooks/useTutor";
import { cn } from "@/lib/utils";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I'm TutorGPT, your AI study assistant. How can I help you today?",
    timestamp: new Date(),
  },
];

const TutorGPT = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = useState("");
  const [activeView, setActiveView] = useState<"chat" | "questions" | "feedback" | "map">("chat");
  const [studentId] = useState("alice");
  const [subject] = useState("chemistry");

  const { sendMessage, getHistory, loading, error } = useTutor();

  useEffect(() => {
    // load history on mount
    (async () => {
      try {
        const hist = await getHistory(studentId, subject);
        if (hist?.status === "ok" && hist.messages) {
          setMessages(hist.messages.map((m: any, i: number) => ({ id: i + 1, role: m.role, content: m.content, timestamp: new Date(m.timestamp || Date.now()) })));
        }
      } catch (e) {
        // ignore for now, UI shows demo messages
      }
    })();
  }, [studentId, subject]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    try {
      const resp = await sendMessage(studentId, subject, newMessage.content);
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: resp?.reply || "(no reply)",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (e) {
      const errMsg: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: `Error: ${(e as any)?.message || String(e)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Sparkles className="h-8 w-8 text-secondary" />
                TutorGPT
              </h1>
              <p className="text-muted-foreground mt-1">Your AI-powered study companion</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeView === "questions" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("questions")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Questions
              </Button>
              <Button
                variant={activeView === "feedback" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("feedback")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Feedback
              </Button>
              <Button
                variant={activeView === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveView("map")}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>

          {activeView === "chat" && (
            <Card className="flex flex-col h-[calc(100vh-250px)]">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask a question..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeView === "questions" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Generated Questions</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-medium">What are the key principles of calculus?</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generated from: Mathematics → Calculus
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="font-medium">Explain Newton's laws in your own words</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Generated from: Physics → Mechanics
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeView === "feedback" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Feedback</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-success/20 bg-success/5">
                  <p className="text-sm font-medium text-success">Great progress!</p>
                  <p className="text-sm mt-2">
                    You've shown excellent understanding of derivatives. Keep practicing with more
                    complex functions.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-warning/20 bg-warning/5">
                  <p className="text-sm font-medium text-warning">Needs attention</p>
                  <p className="text-sm mt-2">
                    Review the concept of force vectors. Consider revisiting the examples in your
                    Physics notes.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {activeView === "map" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Topic Map</h2>
              <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-muted-foreground">
                  Interactive topic map visualization coming soon...
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorGPT;
