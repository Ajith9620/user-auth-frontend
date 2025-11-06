import { useEffect, useRef } from 'react';

const INACTIVITY_MS = 10 * 60 * 1000; // 10 minutes

export default function useAutoLogout(onLogout) {
  const timerRef = useRef();

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
