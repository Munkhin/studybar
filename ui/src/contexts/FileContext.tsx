import React, { createContext, useContext, useState, ReactNode } from "react";

export interface TrackedFile {
  id: string;
  name: string;
  file?: File;
  fileUrl?: string;
  uploadedAt: string;
  source: "chat" | "materials";
}

interface FileContextType {
  trackedFiles: TrackedFile[];
  addFiles: (files: File[], source: "chat" | "materials") => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([]);

  const addFiles = (files: File[], source: "chat" | "materials") => {
    const newFiles: TrackedFile[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      uploadedAt: new Date().toISOString(),
      source,
    }));
    setTrackedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setTrackedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFiles = () => {
    setTrackedFiles([]);
  };

  return (
    <FileContext.Provider value={{ trackedFiles, addFiles, removeFile, clearFiles }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};
