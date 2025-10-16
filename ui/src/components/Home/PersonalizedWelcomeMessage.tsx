// A personalized, non boring welcome message

import React, { useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import "./PersonalizedWelcomeMessage.css";

interface WelcomeMessageProps {
  username: string;
  time: "morning" | "afternoon" | "evening";
  size?: "sm" | "md" | "lg";
}

export function WelcomeMessage({ username, time, size = "md" }: WelcomeMessageProps) {
  const controls = useAnimation();

  // Pre-generate star positions evenly distributed across the container
  const stars = useMemo(() => {
    if (time !== "evening") return [] as Array<{ left: string; top: string; delay: number; duration: number }>;
    // Leave a small padding from edges so stars don't visually clip
    const pad = 6; // percent
    return Array.from({ length: 18 }).map(() => ({
      left: `${pad + Math.random() * (100 - pad * 2)}%`,
      top: `${pad + Math.random() * (100 - pad * 2)}%`,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
    }));
  }, [time]);

  useEffect(() => {
    const playEntrance = () => controls.start("visible");
    controls.set("hidden");
    playEntrance();
    const onFocus = () => playEntrance();
    const onVisibility = () => {
      if (!document.hidden) playEntrance();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [controls]);

  const baseContainer = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.08 } },
  };
  const textVariant = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const renderAnimation = () => {
    if (time === "morning") return morningAnimation();
    if (time === "afternoon") return afternoonAnimation();
    return eveningAnimation(); // evening no longer renders stars here
  };

  const greetingText =
    time === "morning"
      ? "Good morning"
      : time === "afternoon"
      ? "Good afternoon"
      : "Good evening";

  const subText =
    time === "morning"
      ? "A bright new day begins."
      : time === "afternoon"
      ? "The sun is gently setting."
      : "The stars are shining just for you.";

  const sizeMap: Record<string, string> = {
    sm: "p-3 text-sm",
    md: "p-4 text-base",
    lg: "p-6 text-lg",
  };

  return (
    <motion.div
      className={`welcome-card ${time} ${sizeMap[size]}`}
      variants={baseContainer}
      initial="hidden"
      animate={controls}
    >
      {/* Render stars as full-card layer so they are spread across the whole message, not limited to the icon */}
      {time === "evening" && (
        <div className="stars" aria-hidden>
          {stars.map((s, i) => (
            <motion.div
              key={i}
              className="star"
              style={{ top: s.top, left: s.left }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.05, 0.35, 0.05], scale: [0.9, 1.15, 0.95] }}
              transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="star-core" />
              <div className="star-cross horizontal" />
              <div className="star-cross vertical" />
            </motion.div>
          ))}
        </div>
      )}

      <div className="icon-section">{renderAnimation()}</div>

      <div className="text-section">
        <motion.h3 variants={textVariant} className="greeting">
          {greetingText}, <span className="username">{username}</span>
        </motion.h3>
        <motion.p variants={textVariant} className="subtext">
          {subText}
        </motion.p>
      </div>
    </motion.div>
  );
}

const morningAnimation = () => (
  <motion.div
    className="morning-container"
    animate={{ y: [10, -5, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
  >
    <Sun className="sun-icon" size={28} />
  </motion.div>
);

const afternoonAnimation = () => (
  <motion.div className="afternoon-container">
    <motion.div
      className="sunset-line"
      animate={{ opacity: [1, 0.6, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.div
      className="setting-sun"
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <Sun className="sun-icon" size={28} />
    </motion.div>
  </motion.div>
);

// eveningAnimation no longer includes the stars container
const eveningAnimation = () => (
  <motion.div
    className="evening-container"
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
  >
    <motion.div
      className="moon-glow"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <Moon className="moon-icon" size={28} />
    </motion.div>
  </motion.div>
);
