import React, { useState } from 'react';
import useFocusTimer from '../hooks/useFocusTimer';
import TimerDial from './TimerDial';
import PlantDisplay from './PlantDisplay';
import '../styles/components/FocusPanel.css';

/**
 * Format seconds as MM:SS
 */
const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * FocusPanel — inline expandable focus timer at the bottom of the Goal detail page.
 *
 * Three visual states:
 *   collapsed  — single "Focus" button
 *   setup      — timer dial + mode toggle + start CTA
 *   active     — live countdown + growing plant + stop button
 *
 * Props:
 *   goalId    — UUID of the current goal
 *   goalTitle — title of the goal (stored with plant record)
 */
const FocusPanel = ({ goalId, goalTitle }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    timeRemaining,
    progress,
    isActive,
    plantStage,
    selectedDuration,
    setSelectedDuration,
    mode,
    setMode,
    startSession,
    stopSession,
  } = useFocusTimer(goalId, goalTitle);

  // Auto-open the panel if a session is already running (e.g. after page refresh)
  const panelOpen = isPanelOpen || isActive;

  const handleStart = () => {
    startSession();
  };

  const handleStop = async () => {
    await stopSession();
    setIsPanelOpen(false);
  };

  return (
    <div className="focus-panel">
      {/* Collapsed button — hidden while panel is open */}
      {!panelOpen && (
        <button
          className="btn-focus"
          onClick={() => setIsPanelOpen(true)}
        >
          🌿 Focus
        </button>
      )}

      {/* Expandable body */}
      <div className={`focus-panel-body${panelOpen ? ' open' : ''}`}>
        {isActive ? (
          /* ── Active session view ── */
          <div className="focus-active">
            <h3 className="focus-panel-title">Stay focused</h3>

            <PlantDisplay stage={plantStage} progress={progress} size="lg" />

            <div className="focus-countdown">{formatTime(timeRemaining)}</div>

            <p className="focus-mode-label">
              {mode === 'deep' ? '🌳 Deep Focus' : '🌿 Normal Focus'}
            </p>

            <button className="btn-stop-session" onClick={handleStop}>
              Stop Session
            </button>

            {mode === 'deep' && (
              <p className="focus-warning">
                Stopping or leaving saves a dead plant 💀
              </p>
            )}
          </div>
        ) : (
          /* ── Setup view ── */
          <div className="focus-setup">
            <div className="focus-panel-header">
              <h3 className="focus-panel-title">How long will you focus?</h3>
              <button
                className="focus-close-btn"
                onClick={() => setIsPanelOpen(false)}
                aria-label="Close focus panel"
              >
                ✕
              </button>
            </div>

            <TimerDial value={selectedDuration} onChange={setSelectedDuration} />

            <p className="focus-duration-label">{selectedDuration} min selected</p>

            {/* Mode toggle */}
            <div className="focus-mode-toggle">
              <button
                className={`focus-mode-btn${mode === 'normal' ? ' active' : ''}`}
                onClick={() => setMode('normal')}
              >
                🌿 Normal
              </button>
              <button
                className={`focus-mode-btn${mode === 'deep' ? ' active' : ''}`}
                onClick={() => setMode('deep')}
              >
                🌳 Deep
              </button>
            </div>

            {mode === 'deep' && (
              <p className="focus-mode-hint">
                Leaving the page will save a dead plant 💀
              </p>
            )}

            <button className="btn-start-session" onClick={handleStart}>
              Start Focus Session
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FocusPanel;
