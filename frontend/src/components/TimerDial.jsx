import React, { useEffect, useRef } from 'react';

const ITEM_HEIGHT = 50; // px — must match CSS
const VALUES = Array.from({ length: 120 }, (_, i) => i + 1); // 1–120 minutes

/**
 * TimerDial — CSS scroll-snap vertical wheel for selecting a duration in minutes.
 *
 * Props:
 *   value    — currently selected minute value
 *   onChange — called with new minute value when scroll settles
 */
const TimerDial = ({ value, onChange }) => {
  const scrollRef = useRef(null);
  const snapTimer = useRef(null);
  const isProgrammaticScroll = useRef(false);

  // Scroll to the selected value on mount (without triggering onChange)
  useEffect(() => {
    const index = VALUES.indexOf(value);
    if (scrollRef.current && index >= 0) {
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTop = index * ITEM_HEIGHT;
      // Allow the next user scroll to trigger onChange normally
      setTimeout(() => { isProgrammaticScroll.current = false; }, 200);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When `value` changes externally (e.g. reset), sync the scroll position
  useEffect(() => {
    const index = VALUES.indexOf(value);
    if (scrollRef.current && index >= 0) {
      const expectedTop = index * ITEM_HEIGHT;
      if (Math.abs(scrollRef.current.scrollTop - expectedTop) > 2) {
        isProgrammaticScroll.current = true;
        scrollRef.current.scrollTop = expectedTop;
        setTimeout(() => { isProgrammaticScroll.current = false; }, 200);
      }
    }
  }, [value]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!scrollRef.current) return;
      const rawIndex = scrollRef.current.scrollTop / ITEM_HEIGHT;
      const index = Math.round(rawIndex);
      const clamped = Math.max(0, Math.min(VALUES.length - 1, index));
      // Snap the scroll position to the exact item center
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTop = clamped * ITEM_HEIGHT;
      setTimeout(() => { isProgrammaticScroll.current = false; }, 200);
      onChange(VALUES[clamped]);
    }, 120); // wait for native snap animation to settle
  };

  return (
    <div className="timer-dial-wrapper">
      {/* Centre highlight to mark the selected row */}
      <div className="timer-dial-highlight" />

      <div
        ref={scrollRef}
        className="timer-dial-scroll"
        onScroll={handleScroll}
      >
        {/* Padding items let first/last values reach the centre */}
        <div className="timer-dial-spacer" />
        {VALUES.map(v => (
          <div
            key={v}
            className={`timer-dial-item${v === value ? ' selected' : ''}`}
          >
            {v} min
          </div>
        ))}
        <div className="timer-dial-spacer" />
      </div>
    </div>
  );
};

export default TimerDial;
