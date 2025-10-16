import React, { useState, useEffect } from "react";
import { ChatInput } from "./ChatInput";
import { ChatMessages } from "./ChatMessages";
import { API_BASE_URL } from "/workspaces/studybar/ui/config.ts";
import { useFileContext } from "@/contexts/FileContext";
import { useSubjectContext } from "@/contexts/SubjectContext";
import "./ChatWindow.css";

export interface ChatMessage {
  id: string;
  text?: string;
  fileUrl?: string;
  file?: File;
  type: "user" | "bot";
}

export function ChatWindow () {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addFiles } = useFileContext();
  const { getSelectedTopicData, selectedSubject, selectedTopic } = useSubjectContext();

  const studentId = "student123"; // TODO: dynamically set from auth/session

  // Get selected subject and topic data
  const selectedData = getSelectedTopicData();
  const subject = selectedData?.subject.name;
  const topic = selectedData?.topic.name;
  const conversationId = selectedData?.topic.conversationId;

  // Clear messages when topic changes
  useEffect(() => {
    setMessages([]);
  }, [conversationId]);

  /** Send text and files to the API */
  const handleSend = async (text: string, files: File[]) => {
    // Check if a topic is selected
    if (!conversationId) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: "⚠️ Please select a subject and topic from the settings sidebar to start chatting.",
          type: "bot",
        },
      ]);
      return;
    }

    const newMessages: ChatMessage[] = [];

    // Track files in context when they're sent
    if (files.length > 0) {
      addFiles(files, "chat");
    }

    // Add user's files & text to UI immediately
    files.forEach((file) =>
      newMessages.push({
        id: crypto.randomUUID(),
        file,
        type: "user",
      })
    );

    if (text.trim()) {
      newMessages.push({
        id: crypto.randomUUID(),
        text,
        type: "user",
      });
    }

    setMessages((prev) => [...prev, ...newMessages]);
    if (!text && files.length === 0) return;

    try {
      setIsLoading(true);

      if (files.length > 0) {
        // Example: send file to /generate endpoint for flashcards
        const formData = new FormData();
        formData.append("file", files[0]); // assuming single file for now
        if (subject) {
          formData.append("subject", subject);
        }

        const res = await fetch(`${API_BASE_URL}/api/flashcards/generate`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const botReply = data.status === "ok"
          ? `📘 Flashcards generated (${data.flashcards.length} items)!`
          : "Could not generate flashcards.";

        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: botReply, type: "bot" },
        ]);
      } else if (text.trim()) {
        // Send chat message to /chat with conversation_id
        const formData = new FormData();
        formData.append("student_id", studentId);
        formData.append("conversation_id", conversationId);
        formData.append("message", text);

        const res = await fetch(`${API_BASE_URL}/api/tutor/chat`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            text: data.reply ?? "No response received.",
            type: "bot",
          },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          text: "⚠️ Error communicating with the tutor.",
          type: "bot",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatwindow-container">
      {selectedData && (
        <div className="chat-header">
          <h3>{subject}</h3>
          <span className="topic-badge">{topic}</span>
        </div>
      )}
      <ChatMessages messages={messages} loading={isLoading} />
      <ChatInput onSend={handleSend} disabled={!conversationId} />
    </div>
  );
};
