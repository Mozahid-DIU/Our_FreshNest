import { useEffect, useMemo, useState } from 'react';

function getRemainingMs(expiresAt) {
  if (!expiresAt) return 0;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, target - Date.now());
}

export function useCountdown(expiresAt) {
  const initialRemaining = useMemo(() => getRemainingMs(expiresAt), [expiresAt]);
  const [remainingMs, setRemainingMs] = useState(initialRemaining);

  useEffect(() => {
    setRemainingMs(getRemainingMs(expiresAt));
    if (!expiresAt) return undefined;

    const timer = window.setInterval(() => {
      setRemainingMs(getRemainingMs(expiresAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return remainingMs;
}

export function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}