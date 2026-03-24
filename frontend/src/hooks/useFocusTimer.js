import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase_client';

/**
 * useFocusTimer — manages a timed focus session with plant garden integration.
 *
 * Session state is persisted in localStorage so it survives a page refresh.
 * When the user navigates away (SPA navigation, not refresh) during a deep focus
 * session, a dead plant is saved to the garden automatically.
 *
 * localStorage keys used:
 *   focusSession     — { goalId, startTime, durationSecs, mode }
 *   pendingDeadPlant — JSON body of a dead-plant POST to retry on next mount
 *
 * sessionStorage keys used:
 *   focusRefreshing  — flag set by beforeunload to distinguish refresh vs nav-away
 */
const useFocusTimer = (goalId, goalTitle) => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(25); // minutes
  const [mode, setMode] = useState('normal'); // 'normal' | 'deep'

  // Refs — safe to read from cleanup/interval without stale closure issues
  const isActiveRef = useRef(false);
  const modeRef = useRef('normal');
  const timeRemainingRef = useRef(0);
  const sessionRef = useRef(null);
  const userIdRef = useRef(null);
  const goalTitleRef = useRef(goalTitle);
  const intervalRef = useRef(null);

  // Keep refs in sync with state
  useEffect(() => { isActiveRef.current = isActive; }, [isActive]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);
  useEffect(() => { goalTitleRef.current = goalTitle; }, [goalTitle]);

  // Fetch user ID once on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      userIdRef.current = data?.user?.id ?? null;
    });
  }, []);

  // On mount: handle pending dead plant + resume session + register beforeunload flag
  useEffect(() => {
    // --- Retry any pending dead plant from a previous navigation-away ---
    const pending = localStorage.getItem('pendingDeadPlant');
    if (pending) {
      try {
        fetch(`${import.meta.env.VITE_API_URL}/focus/plants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: pending,
        }).catch(() => {});
      } catch (_) {}
      localStorage.removeItem('pendingDeadPlant');
    }

    // --- Resume active session for this goal if present ---
    const saved = localStorage.getItem('focusSession');
    if (saved) {
      try {
        const session = JSON.parse(saved);
        if (session.goalId === goalId) {
          const elapsed = (Date.now() - session.startTime) / 1000;
          const remaining = session.durationSecs - elapsed;
          if (remaining > 0) {
            // Session still running — resume
            sessionRef.current = session;
            const rem = Math.ceil(remaining);
            setTimeRemaining(rem);
            timeRemainingRef.current = rem;
            setMode(session.mode);
            modeRef.current = session.mode;
            setSelectedDuration(Math.round(session.durationSecs / 60));
            setIsActive(true);
            isActiveRef.current = true;
          } else {
            // Session expired while the page was away — complete it silently
            const expiredSession = session;
            localStorage.removeItem('focusSession');
            completePlant(expiredSession);
          }
        }
      } catch (_) {
        localStorage.removeItem('focusSession');
      }
    }

    // --- beforeunload flag: distinguishes page refresh from SPA navigation ---
    const handleBeforeUnload = () => {
      sessionStorage.setItem('focusRefreshing', 'true');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Cleanup fires on both unmount (SPA nav) and before remount (refresh)
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(intervalRef.current);

      const isRefreshing = sessionStorage.getItem('focusRefreshing') === 'true';
      sessionStorage.removeItem('focusRefreshing');

      // Only save dead plant on genuine SPA navigation away, not refresh
      if (
        !isRefreshing &&
        isActiveRef.current &&
        modeRef.current === 'deep' &&
        sessionRef.current
      ) {
        const session = sessionRef.current;
        const elapsed = session.durationSecs - timeRemainingRef.current;
        const elapsedMins = Math.max(Math.round(elapsed / 60), 1);
        const body = JSON.stringify({
          user_id: userIdRef.current,
          goal_id: session.goalId,
          goal_title: goalTitleRef.current || null,
          duration: elapsedMins,
          completed: false,
          deep_focus: true,
          status: 'dead',
        });
        // sendBeacon: fire-and-forget, designed for page-unload scenarios
        try {
          navigator.sendBeacon(
            `${import.meta.env.VITE_API_URL}/focus/plants`,
            new Blob([body], { type: 'application/json' })
          );
        } catch (_) {}
        // localStorage backup in case sendBeacon fails (e.g. offline)
        localStorage.setItem('pendingDeadPlant', body);
      }
      // Note: focusSession is intentionally NOT cleared here so refresh can resume it
    };
  }, [goalId]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Countdown interval ---
  useEffect(() => {
    if (!isActive) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      if (!sessionRef.current) return;
      const elapsed = (Date.now() - sessionRef.current.startTime) / 1000;
      const remaining = Math.ceil(sessionRef.current.durationSecs - elapsed);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        setTimeRemaining(0);
        timeRemainingRef.current = 0;
        setIsActive(false);
        isActiveRef.current = false;
        const completedSession = sessionRef.current;
        sessionRef.current = null;
        localStorage.removeItem('focusSession');
        completePlant(completedSession);
      } else {
        setTimeRemaining(remaining);
        timeRemainingRef.current = remaining;
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save a completed (alive) plant
  const completePlant = async (session) => {
    try {
      if (userIdRef.current) {
        await fetch(`${import.meta.env.VITE_API_URL}/focus/plants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userIdRef.current,
            goal_id: session.goalId,
            goal_title: goalTitleRef.current || null,
            duration: Math.round(session.durationSecs / 60),
            completed: true,
            deep_focus: session.mode === 'deep',
            status: 'alive',
          }),
        });
      }
    } catch (e) {
      console.error('Failed to save completed plant:', e);
    }
  };

  // Start a new session
  const startSession = () => {
    const durationSecs = selectedDuration * 60;
    const session = {
      goalId,
      startTime: Date.now(),
      durationSecs,
      mode,
    };
    sessionRef.current = session;
    localStorage.setItem('focusSession', JSON.stringify(session));
    setTimeRemaining(durationSecs);
    timeRemainingRef.current = durationSecs;
    setIsActive(true);
    isActiveRef.current = true;
  };

  // Stop session manually (saves dead plant if deep focus)
  const stopSession = async () => {
    clearInterval(intervalRef.current);
    const session = sessionRef.current;
    const currentMode = modeRef.current;
    const currentRemaining = timeRemainingRef.current;

    sessionRef.current = null;
    setIsActive(false);
    isActiveRef.current = false;
    setTimeRemaining(0);
    timeRemainingRef.current = 0;
    localStorage.removeItem('focusSession');

    if (session && currentMode === 'deep') {
      const elapsed = session.durationSecs - currentRemaining;
      const elapsedMins = Math.max(Math.round(elapsed / 60), 1);
      try {
        if (userIdRef.current) {
          await fetch(`${import.meta.env.VITE_API_URL}/focus/plants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userIdRef.current,
              goal_id: session.goalId,
              goal_title: goalTitleRef.current || null,
              duration: elapsedMins,
              completed: false,
              deep_focus: true,
              status: 'dead',
            }),
          });
        }
      } catch (e) {
        console.error('Failed to save dead plant on stop:', e);
      }
    }
  };

  // Derived values
  const durationSecs = sessionRef.current?.durationSecs ?? selectedDuration * 60;
  const progress = durationSecs > 0
    ? Math.min(100, Math.round((1 - timeRemaining / durationSecs) * 100))
    : 0;
  const plantStage = progress < 33 ? 'seed' : progress < 66 ? 'sprout' : 'tree';

  return {
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
  };
};

export default useFocusTimer;
