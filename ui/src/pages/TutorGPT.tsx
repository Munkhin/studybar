import React from "react";
import "./TutorGPT.css";
import { Sidebar } from "@/components/Sidebar";
import { TutorGPTSettingsSidebar } from "@/components/TutorGPT/TutorGPTSettingsSidebar";
import { ChatWindow } from "../components/Chat/ChatWindow";
import { FileProvider } from "@/contexts/FileContext";
import { SubjectProvider } from "@/contexts/SubjectContext";

export default function TutorGPT() {
  return (
    <SubjectProvider>
      <FileProvider>
        <div className="tutorgpt-layout">
          {/* Left Sidebar */}
          <aside className="tutorgpt-sidebar">
            <Sidebar />
          </aside>

          {/* Main Content Area */}
          <main className="tutorgpt-main">
            <section className="tutorgpt-workspace">
              <ChatWindow />
            </section>

            {/* Right Sidebar (Settings) */}
            <aside className="tutorgpt-settings">
              <TutorGPTSettingsSidebar />
            </aside>
          </main>
        </div>
      </FileProvider>
    </SubjectProvider>
  );
}
