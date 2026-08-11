// Plays a 0.3s burst of white-noise static using the Web Audio API
// Call playStatic() on region-switch before the shutter closes
export function createStaticPlayer() {
  let ctx: AudioContext | null = null;

  return function playStatic() {
    // Create (or resume) AudioContext lazily on first user gesture
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const duration = 0.3;
    const bufferSize = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.35; // 35% volume to not shock
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Band-pass filter to sound more like tuning static (not pure white noise)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 0.5;

    // Gain envelope: quick fade in → sustained → fade out
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.03);
    gain.gain.setValueAtTime(0.5, now + 0.22);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  };
}
