import React from "react";
import { useFileContext } from "@/contexts/FileContext";
import { FileText, X, Upload } from "lucide-react";
import "./MaterialsTab.css";

export const MaterialsTab: React.FC = () => {
  const { trackedFiles, addFiles, removeFile } = useFileContext();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      addFiles(files, "materials");
    }
    e.currentTarget.value = "";
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="materials-tab">
      <div className="materials-header">
        <h4>Files Uploaded</h4>
        <p className="materials-subtitle">
          Files added to the conversation or directly uploaded
        </p>
      </div>

      <label className="materials-upload-btn">
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          hidden
        />
        <Upload size={16} />
        <span>Upload Files</span>
      </label>

      {trackedFiles.length === 0 ? (
        <div className="materials-empty">
          <FileText size={32} opacity={0.3} />
          <p>No files uploaded yet</p>
        </div>
      ) : (
        <ul className="materials-list">
          {trackedFiles.map((file) => (
            <li key={file.id} className="materials-item">
              <div className="materials-item-icon">
                <FileText size={16} />
              </div>
              <div className="materials-item-content">
                <span className="materials-item-name">{file.name}</span>
                <span className="materials-item-meta">
                  {formatDate(file.uploadedAt)} at {formatTime(file.uploadedAt)}
                  {file.source === "chat" && (
                    <span className="materials-badge">From chat</span>
                  )}
                </span>
              </div>
              <button
                className="materials-item-remove"
                onClick={() => removeFile(file.id)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
