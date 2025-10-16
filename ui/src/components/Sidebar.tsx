import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Moon, Sun, Home, MessageSquare, CreditCard, AlertTriangle, User } from "lucide-react";
import styles from "./Sidebar.module.css";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/tutor", label: "Tutor GPT", icon: MessageSquare },
  { path: "/flashcards", label: "Flashcards", icon: CreditCard },
  { path: "/error-log", label: "Error Log", icon: AlertTriangle },
  { path: "/account", label: "Account", icon: User },
];

export const Sidebar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "light" ? "dark" : "light"));

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logoGroup}>
          <img src="/favicon.ico" alt="StudyBar logo" className={styles.logoIcon} />
          <h1 className={styles.logoText}>StudyBar</h1>
        </div>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(styles.navLink, isActive && styles.navLinkActive)
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
