import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";

const SCHEMES = {
  blue: { band: "#bcd4ec", bg: "#e1edf8" },
  pink: { band: "#f6cfd0", bg: "#fde8e9" },
  yellow: { band: "#f5d46a", bg: "#f7e0a7" },
};

export default function GoalCard({ goal }) {
  const scheme = SCHEMES[goal.colorScheme] || SCHEMES.blue;
  const pillColor = "#e74c3c";

  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);

  function handleOpen(e) {
    if (animating) return;
    setAnimating(true);

    const ANIM_MS = 220;
    setTimeout(() => {
      navigate(`/goal/${goal.id}`, { state: { goal } });
    }, ANIM_MS);
  }

  function onKey(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleOpen();
    }
  }

  return (
    <article
      className={`goal-card ${animating ? "animating" : ""}`}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={`Open ${goal.title}`}
    >
      <div className="card-inner">
        <div className="card-header" style={{ background: scheme.band }}>
          <h2 className="card-title">{goal.title}</h2>
        </div>

        <div className="card-body">
          <p className="card-desc">{goal.description}</p>
          <ProgressBar progress={goal.progress} />
        </div>
      </div>

      <div
        className="date-pill"
        style={{ background: pillColor }}
        aria-hidden="true"
      >
        <span>{goal.date}</span>
      </div>
    </article>
  );
}