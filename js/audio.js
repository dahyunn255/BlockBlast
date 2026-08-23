const AudioFx = (() => {
  let ctx = null;
  let muted = Storage.getMuted();

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ freq, duration = 0.12, type = 'sine', gain = 0.15, delay = 0, slideTo = null }) {
    if (muted) return;
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    const t0 = c.currentTime + delay;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function place() {
    tone({ freq: 320, duration: 0.08, type: 'triangle', gain: 0.12 });
  }

  function invalid() {
    tone({ freq: 120, duration: 0.12, type: 'square', gain: 0.08 });
  }

  function clearLines(count) {
    const base = 440;
    for (let i = 0; i < Math.min(count, 4); i++) {
      tone({ freq: base + i * 120, duration: 0.18, type: 'sine', gain: 0.16, delay: i * 0.05 });
    }
  }

  function combo(level) {
    tone({ freq: 300, slideTo: 900, duration: 0.25, type: 'sawtooth', gain: 0.1 + Math.min(level, 5) * 0.02 });
  }

  function gameOver() {
    tone({ freq: 400, slideTo: 100, duration: 0.6, type: 'sine', gain: 0.15 });
  }

  function achievement() {
    tone({ freq: 660, duration: 0.14, type: 'sine', gain: 0.14 });
    tone({ freq: 880, duration: 0.22, type: 'sine', gain: 0.14, delay: 0.1 });
  }

  function reroll() {
    tone({ freq: 260, slideTo: 520, duration: 0.1, type: 'triangle', gain: 0.1 });
    tone({ freq: 220, slideTo: 440, duration: 0.12, type: 'triangle', gain: 0.1, delay: 0.06 });
  }

  function levelComplete() {
    [520, 660, 780, 1040].forEach((freq, i) => {
      tone({ freq, duration: 0.22, type: 'sine', gain: 0.15, delay: i * 0.08 });
    });
  }

  function popCrack(count) {
    for (let i = 0; i < Math.min(count, 4); i++) {
      tone({ freq: 900 - i * 80, duration: 0.05, type: 'square', gain: 0.14, delay: i * 0.05 });
      tone({ freq: 180, duration: 0.05, type: 'square', gain: 0.09, delay: i * 0.05 + 0.02 });
    }
  }

  function beepPulse(count) {
    for (let i = 0; i < Math.min(count, 4); i++) {
      tone({ freq: 1200, duration: 0.08, type: 'sine', gain: 0.12, delay: i * 0.09 });
      tone({ freq: 1800, duration: 0.06, type: 'sine', gain: 0.1, delay: i * 0.09 + 0.05 });
    }
  }

  function chiptune(count) {
    const notes = [523, 659, 784, 1047];
    for (let i = 0; i < Math.min(count, notes.length); i++) {
      tone({ freq: notes[i], duration: 0.09, type: 'square', gain: 0.12, delay: i * 0.06 });
    }
  }

  function setMuted(value) {
    muted = value;
    Storage.setMuted(value);
  }

  function isMuted() {
    return muted;
  }

  return {
    place, invalid, clearLines, combo, gameOver, levelComplete, reroll, achievement,
    popCrack, beepPulse, chiptune, setMuted, isMuted,
  };
})();
