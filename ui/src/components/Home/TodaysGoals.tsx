import { useState, useEffect } from "react";
import "./TodaysGoals.css";

export function TodaysGoals() {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");

  // 🧩 Load saved goals from localStorage when component mounts
  useEffect(() => {
    const savedGoals = localStorage.getItem("todaysGoals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // 💾 Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todaysGoals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (newGoal.trim() !== "") {
      setGoals([...goals, { text: newGoal, completed: false }]);
      setNewGoal("");
    }
  };

  const toggleGoal = (index) => {
    const updated = [...goals];
    updated[index].completed = !updated[index].completed;
    setGoals(updated);
  };

  const removeGoal = (index) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  return (
    <div className="goals-card">
      <h2>Today's Goals</h2>

      <div className="goal-input">
        <input
          type="text"
          value={newGoal}
          placeholder="Add a new goal..."
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addGoal()}
        />
        <button onClick={addGoal}>+</button>
      </div>

      <ul className="goal-list">
        {goals.map((goal, index) => (
          <li key={index} className={goal.completed ? "completed" : ""}>
            <label>
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleGoal(index)}
              />
              {goal.text}
            </label>
            <button className="remove" onClick={() => removeGoal(index)}>
              ✕
            </button>
          </li>
        ))}
        {goals.length === 0 && (
          <p className="no-goals">No goals yet. Add one above ✨</p>
        )}
      </ul>
    </div>
  );
}
