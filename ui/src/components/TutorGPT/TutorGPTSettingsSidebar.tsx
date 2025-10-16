import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, FileText } from "lucide-react";
import styles from "./TutorGPTSettingsSidebar.module.css";
import { SidebarItem } from "./SidebarItem";
import { SubjectsTab } from "./SubjectsTab";
import { MaterialsTab } from "./MaterialsTab";

export const TutorGPTSettingsSidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"subjects" | "materials">(
    "subjects"
  );

  const items = [
    { key: "subjects" as const, icon: <BookOpen />, label: "Subjects" },
    { key: "materials" as const, icon: <FileText />, label: "Materials" },
  ];

  const handleItemClick = (key: "subjects" | "materials") => {
    if (!expanded) {
      setExpanded(true);
      setTimeout(() => setActiveTab(key), 80);
    } else {
      setActiveTab(key);
    }
  };

  return (
    <motion.aside
      className={styles.settingsSidebar}
      initial={false}
      animate={{ width: expanded ? 260 : 80 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      layout
      role="complementary"
      aria-expanded={expanded}
    >
      {/* Expand/Collapse Button */}
      <div className={styles.topRow}>
        <button
          type="button"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => setExpanded((s) => !s)}
          className={styles.expandBtn}
        >
          {expanded ? (
            <ChevronLeft className={styles.chev} />
          ) : (
            <ChevronRight className={styles.chev} />
          )}
        </button>
      </div>

      {/* Sidebar Tabs */}
      <nav className={styles.sidebarItems} aria-label="Sidebar Tabs">
        {items.map((it) => (
          <SidebarItem
            key={it.key}
            icon={it.icon}
            label={it.label}
            expanded={expanded}
            active={activeTab === it.key}
            onClick={() => handleItemClick(it.key)}
          />
        ))}
      </nav>

      {/* Tab Content (only visible when expanded) */}
      {expanded && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className={styles.tabContent}
        >
          {activeTab === "subjects" && <SubjectsTab />}
          {activeTab === "materials" && <MaterialsTab />}
        </motion.div>
      )}
    </motion.aside>
  );
};
