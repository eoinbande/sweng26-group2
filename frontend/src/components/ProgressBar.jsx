import React from "react";

export default function ProgressBar({ progress = 0 }) {
  const p = Math.max(0, Math.min(100, Math.round(progress)));

  // Choose color by percentage bucket
  let color = "#e53935"; // red for 0-33
  if (p >= 34 && p <= 67) color = "#f6c23e"; // yellow
  if (p >= 68 && p <= 99) color = "#2b8cff"; // blue
  if (p === 100) color = "#27ae60"; // green

  return (
    <div className="progress-wrap" aria-hidden>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{
            width: `${p}%`,
            background: color,
          }}
        />
        {p === 100 && (
          <div className="progress-check" title="Completed" aria-hidden>
            {/* simple SVG check */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}