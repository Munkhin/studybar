import React from "react";
import { motion } from "framer-motion";
import "./SidebarItem.css";

interface SidebarItemProps {
  icon: JSX.Element;
  label: string;
  expanded: boolean;
  active: boolean;
  onClick: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  expanded,
  active,
  onClick,
}) => {
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.03 }}
      className={`sidebar-item ${active ? "active" : ""}`}
    >
      <div className="sidebar-icon" aria-hidden>
        {icon}
      </div>
      {expanded && <span className="sidebar-label">{label}</span>}
    </motion.button>
  );
};
