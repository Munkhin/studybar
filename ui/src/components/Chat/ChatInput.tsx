import React, { useState, useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string, files: File[]) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((file) =>
      ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)
    );
    if (valid.length !== selected.length) alert("Only PDF and image files are allowed.");
    setFiles(valid);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    onSend(message, files);
    setMessage("");
    setFiles([]);
  };

  return (
    <form className="chatinput" onSubmit={handleSubmit}>
      <label className={`upload-btn ${disabled ? "disabled" : ""}`}>
        <input
          type="file"
          accept=".pdf,image/*"
          multiple
          hidden
          onChange={handleFileUpload}
          disabled={disabled}
        />
        <Paperclip size={18} />
      </label>

      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? "Select a topic to start chatting..." : "Type a message..."}
        className="chat-input"
        rows={1}
        disabled={disabled}
      />

      <button type="submit" className="send-btn" disabled={disabled}>
        <Send size={18} />
      </button>
    </form>
  );
};
