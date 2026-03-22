let lastPlayAt = 0;

export const playNotificationSound = () => {
  const now = Date.now();
  // Prevent rapid bursts of overlapping sounds.
  if (now - lastPlayAt < 500) {
    return;
  }
  lastPlayAt = now;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.16);

    oscillator.onended = () => {
      ctx.close().catch(() => {});
    };
  } catch (error) {
    // Best-effort sound; ignore failures silently.
  }
};
