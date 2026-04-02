import React from 'react';

const STAGE_EMOJI = {
  seed:   '🌱',
  sprout: '🌿',
  tree:   '🌳',
  dead:   '💀',
};

// SVG circle circumference for r=34: 2 * π * 34 ≈ 213.63
const CIRCUMFERENCE = 2 * Math.PI * 34;

/**
 * PlantDisplay — shows a plant emoji inside an SVG progress ring.
 *
 * Props:
 *   stage    — 'seed' | 'sprout' | 'tree' | 'dead'
 *   progress — 0–100 (controls ring fill)
 *   size     — 'sm' | 'md' | 'lg' (controls emoji font size)
 */
const PlantDisplay = ({ stage = 'seed', progress = 0, size = 'lg' }) => {
  const emoji = STAGE_EMOJI[stage] ?? STAGE_EMOJI.seed;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 100) / 100);

  const emojiFontSize = size === 'lg' ? '52px' : size === 'md' ? '38px' : '26px';
  const ringSize = size === 'lg' ? 120 : size === 'md' ? 88 : 60;

  return (
    <div
      style={{
        position: 'relative',
        width: ringSize,
        height: ringSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SVG progress ring */}
      <svg
        viewBox="0 0 80 80"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        {/* Track */}
        <circle
          cx="40" cy="40" r="34"
          fill="none"
          stroke="rgba(105, 153, 93, 0.18)"
          strokeWidth="4"
        />
        {/* Progress arc */}
        <circle
          cx="40" cy="40" r="34"
          fill="none"
          stroke={stage === 'dead' ? 'var(--text-secondary)' : 'var(--green)'}
          strokeWidth="4"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>

      {/* Plant emoji */}
      <span
        style={{
          fontSize: emojiFontSize,
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
          userSelect: 'none',
        }}
        role="img"
        aria-label={stage}
      >
        {emoji}
      </span>
    </div>
  );
};

export default PlantDisplay;
