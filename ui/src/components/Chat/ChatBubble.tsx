import React from "react";
import { ChatMessage } from "./ChatWindow";

export const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isImage = message.file && message.file.type.startsWith("image/");
  const isPDF = message.file && message.file.type === "application/pdf";

  return (
    <div className={`chatbubble ${message.type === "user" ? "chatbubble-user" : "chatbubble-bot"}`}>
      {isImage && (
        <img
          src={URL.createObjectURL(message.file!)}
          alt={message.file!.name}
          className="chatbubble-image"
        />
      )}
      {isPDF && (
        <div className="chatbubble-file">
          <span>📄 {message.file!.name}</span>
        </div>
      )}
      {message.text && <p className="chatbubble-text">{message.text}</p>}
    </div>
  );
};
