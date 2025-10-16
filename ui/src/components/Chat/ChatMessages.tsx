import React from "react";
import { ChatMessage } from "./ChatWindow";
import { ChatBubble } from "./ChatBubble";


interface ChatMessagesProps {
  messages: ChatMessage[];
  loading?: boolean; // ✅ add this line
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  loading = false,
}) => {
  return (
    <div className="chatmessages">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} message={msg} />
      ))}

      {/* ✅ show a simple "bot is typing" animation */}
      {loading && (
        <div className="chatbubble bot typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
    </div>
  );
};
