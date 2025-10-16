import { useEffect, useState } from "react";
import "./SidebarGrid.css"
import "./Home.css";
import { Sidebar } from "@/components/Sidebar";
import { WelcomeMessage } from "@/components/Home/PersonalizedWelcomeMessage";
import { TodaysGoals } from "@/components/Home/TodaysGoals";

export default function Home() {
  const [time, setTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [backgroundClass, setBackgroundClass] = useState("bg-morning");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 6 && hour < 12) {
      setTime("morning");
      setBackgroundClass("bg-morning");
    } 
    else if (hour >= 12 && hour < 18) {
      setTime("afternoon");
      setBackgroundClass("bg-afternoon");
    } 
    else {
      setTime("evening");
      setBackgroundClass("bg-evening");
    }
  }, []);


  return (
    <div className="layout">
      <aside className="sidebar-area">
        <Sidebar />
      </aside>
      <main className={`main-area ${backgroundClass}`}>
        <div className="welcome-message">
          <WelcomeMessage username="Mun Khin" time={time}/>
        </div>
        <div className="todays-goals">
          <TodaysGoals />
        </div>
      </main>
    </div>
  );
}
