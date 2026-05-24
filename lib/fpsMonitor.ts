/**
 * monitorFPS — measures frame rate and triggers callbacks.
 * onLow      called if FPS < 30 sustained for 2 seconds
 * onCritical called if FPS < 20 sustained for 2 seconds
 * Returns a cancel function.
 */
export function monitorFPS(
  onLow: () => void,
  onCritical: () => void
): () => void {
  let rafId = 0;
  let lastTime = performance.now();
  let lowStart = 0;
  let criticalStart = 0;
  let fired = false;

  function tick(now: number) {
    if (fired) return;

    const delta = now - lastTime;
    lastTime = now;

    // Avoid division by zero on first frame
    if (delta > 0) {
      const fps = 1000 / delta;

      if (fps < 20) {
        if (criticalStart === 0) criticalStart = now;
        if (now - criticalStart >= 2000) {
          fired = true;
          onCritical();
          return;
        }
      } else {
        criticalStart = 0;
      }

      if (fps < 30) {
        if (lowStart === 0) lowStart = now;
        if (now - lowStart >= 2000) {
          fired = true;
          onLow();
          return;
        }
      } else {
        lowStart = 0;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  return () => cancelAnimationFrame(rafId);
}
