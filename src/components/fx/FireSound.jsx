import { useEffect, useRef, useState } from 'react';

/**
 * "Campfire" ambient sound, generated live with the Web Audio API (no audio files):
 * a low rumble of filtered noise plus random wood-crackle pops. Off by default.
 */
export default function FireSound() {
  const [on, setOn] = useState(false);
  const audio = useRef(null);

  const start = () => {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 1.2);
    master.connect(ctx.destination);

    // Brown-noise rumble
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      d[i] = lastOut * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf; noise.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
    const rumble = ctx.createGain(); rumble.gain.value = 0.11;
    noise.connect(lp).connect(rumble).connect(master);
    noise.start();

    // Slow "breathing" of the flame
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.25;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.035;
    lfo.connect(lfoGain).connect(rumble.gain); lfo.start();

    // Crackles
    const crackBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
    const cd = crackBuf.getChannelData(0);
    for (let i = 0; i < cd.length; i++) cd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / cd.length, 3);
    let timer = 0;
    const crackle = () => {
      const src = ctx.createBufferSource(); src.buffer = crackBuf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500 + Math.random() * 3500; bp.Q.value = 0.8;
      const g = ctx.createGain(); g.gain.value = 0.08 + Math.random() * 0.35;
      src.playbackRate.value = 0.6 + Math.random() * 1.2;
      src.connect(bp).connect(g).connect(master);
      src.start();
      const bursty = Math.random() < 0.18;
      timer = setTimeout(crackle, bursty ? 20 + Math.random() * 60 : 90 + Math.random() * 420);
    };
    crackle();

    audio.current = { ctx, master, stop: () => clearTimeout(timer) };
  };

  const stop = () => {
    const a = audio.current;
    if (!a) return;
    a.stop();
    a.master.gain.linearRampToValueAtTime(0, a.ctx.currentTime + 0.4);
    setTimeout(() => a.ctx.close(), 500);
    audio.current = null;
  };

  useEffect(() => () => stop(), []);

  // One-shot effects: "whoosh" (throw), "sizzle" (lands on the grill), "ignite" (big flare)
  useEffect(() => {
    const play = (e) => {
      const a = audio.current;
      if (!a) return;
      const { ctx, master } = a;
      const type = e.detail?.type;
      const dur = type === 'whoosh' ? 0.45 : type === 'ignite' ? 1.6 : 1.1;
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter();
      const g = ctx.createGain();
      const now = ctx.currentTime;
      if (type === 'whoosh') {
        f.type = 'bandpass'; f.Q.value = 1.2;
        f.frequency.setValueAtTime(300, now); f.frequency.exponentialRampToValueAtTime(2400, now + dur);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.5, now + 0.12); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      } else if (type === 'ignite') {
        f.type = 'lowpass'; f.frequency.setValueAtTime(200, now); f.frequency.exponentialRampToValueAtTime(3000, now + 0.25); f.frequency.exponentialRampToValueAtTime(500, now + dur);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.9, now + 0.08); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      } else {
        f.type = 'highpass'; f.frequency.value = 3200;
        g.gain.setValueAtTime(0.35, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      }
      src.connect(f).connect(g).connect(master);
      src.start();
    };
    window.addEventListener('alab:sfx', play);
    return () => window.removeEventListener('alab:sfx', play);
  }, []);

  const toggle = () => {
    if (on) stop(); else start();
    setOn(!on);
  };

  return (
    <button type="button" className={`sound-btn${on ? ' on' : ''}`} onClick={toggle} aria-pressed={on} aria-label={on ? 'Turn off campfire sound' : 'Turn on campfire sound'} title={on ? 'Campfire sound: on' : 'Campfire sound: off'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10v4h3l5 4V6L7 10z" />
        {on ? (<><path d="M15.5 9a4 4 0 010 6" /><path d="M18 6.5a8 8 0 010 11" /></>) : <path d="M16 9l5 6M21 9l-5 6" />}
      </svg>
      <span className="eq" aria-hidden="true"><i /><i /><i /></span>
    </button>
  );
}
