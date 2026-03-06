<script lang="ts">
  import { onMount } from 'svelte';

  let active = $state(false);
  let lines = $state<{ text: string; cls: string }[]>([]);
  let flash = $state('');
  let showStatic = $state(false);
  let showScanlines = $state(false);
  let shaking = $state(false);
  let canvasEl: HTMLCanvasElement;
  let cleanup: (() => void) | null = null;
  let audioCtx: AudioContext | null = null;
  let activeAudioNodes: { stop: () => void }[] = [];

  function getAudio(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext();
    return audioCtx;
  }

  function sfxBeep(freq: number, duration: number, vol = 0.06) {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function sfxDialup(): { stop: () => void } {
    const ctx = getAudio();
    const t = ctx.currentTime;
    const duration = 18;
    const master = ctx.createGain();
    master.gain.value = 0.09;
    master.connect(ctx.destination);

    // Telephone bandpass filter (300-3400Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1800;
    bandpass.Q.value = 0.8;
    bandpass.connect(master);

    // Helper: create a sine tone at specific time
    function osc(freq: number, start: number, dur: number, vol: number, dest: AudioNode = bandpass) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t + start);
      g.gain.setValueAtTime(vol, t + start + dur);
      g.gain.linearRampToValueAtTime(0, t + start + dur + 0.005);
      o.connect(g).connect(dest);
      o.start(t + start);
      o.stop(t + start + dur + 0.01);
    }

    // Helper: dual-tone
    function tone(f1: number, f2: number, start: number, dur: number, vol = 0.5) {
      osc(f1, start, dur, vol);
      osc(f2, start, dur, vol);
    }

    // Helper: bandpass noise burst
    function noiseBurst(start: number, dur: number, vol: number, lo: number, hi: number) {
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * (dur + 0.1)), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, t + start);
      g.gain.setValueAtTime(vol, t + start + dur);
      g.gain.linearRampToValueAtTime(0, t + start + dur + 0.02);
      const fLo = ctx.createBiquadFilter();
      fLo.type = 'highpass'; fLo.frequency.value = lo;
      const fHi = ctx.createBiquadFilter();
      fHi.type = 'lowpass'; fHi.frequency.value = hi;
      src.connect(fLo).connect(fHi).connect(g).connect(master);
      src.start(t + start);
      src.stop(t + start + dur + 0.05);
    }

    // Helper: V.21 FSK — random switching between mark/space frequencies
    function fsk(markHz: number, spaceHz: number, start: number, dur: number, vol: number) {
      const baud = 300;
      const bitLen = 1 / baud;
      const numBits = Math.floor(dur * baud);
      for (let j = 0; j < numBits; j++) {
        const freq = Math.random() > 0.5 ? markHz : spaceHz;
        osc(freq, start + j * bitLen, bitLen, vol);
      }
    }

    // ===== PHASE 1: Dial tone 350+440Hz (0.0-0.85s) =====
    tone(350, 440, 0, 0.85, 0.5);

    // ===== PHASE 2: DTMF dialing (0.90-3.20s) =====
    // Actual digits from analysis: pairs with ~100ms gap between
    const dtmf: { f: [number, number]; s: number }[] = [
      { f: [700, 1210], s: 0.90 },   // digit
      { f: [850, 1340], s: 1.10 },
      { f: [700, 1210], s: 1.30 },
      { f: [850, 1340], s: 1.50 },
      { f: [700, 1340], s: 1.70 },
      { f: [850, 1340], s: 1.90 },
      { f: [770, 1210], s: 2.10 },
      { f: [770, 1210], s: 2.30 },
      { f: [940, 1340], s: 2.50 },
      { f: [770, 1340], s: 2.70 },
      { f: [850, 1480], s: 2.90 },
      { f: [850, 1340], s: 3.10 },
    ];
    for (const d of dtmf) {
      tone(d.f[0], d.f[1], d.s, 0.15, 0.6);
    }

    // ===== PHASE 3: Silence (3.25-5.45s) — waiting for remote =====

    // ===== PHASE 4: V.8bis answer 1530+2220Hz (5.50-5.90s) =====
    tone(1530, 2220, 5.50, 0.4, 0.4);

    // ===== PHASE 5: 1900Hz transition + V.21 low FSK (5.90-6.80s) =====
    osc(1900, 5.90, 0.15, 0.4);
    fsk(980, 1180, 6.05, 0.75, 0.2);

    // ===== PHASE 6: V.21 high channel 1650-1850Hz (6.90-7.65s) =====
    osc(1650, 6.90, 0.2, 0.35);
    fsk(1650, 1850, 7.05, 0.6, 0.25);

    // ===== PHASE 7: V.21 low channel again (7.65-8.00s) =====
    fsk(980, 1180, 7.65, 0.4, 0.2);

    // ===== PHASE 8: Silence (8.05-8.80s) =====

    // ===== PHASE 9: CED 2100Hz answer tone (8.85-10.90s) =====
    // Pure 2100Hz for first ~1s, then V.21 FSK overlaid
    osc(2100, 8.85, 2.0, 0.2);
    // V.21 FSK data overlapping CED from ~9.95s
    fsk(980, 1180, 9.95, 0.95, 0.1);

    // ===== PHASE 10: Dual V.21 channels (10.90-12.00s) =====
    fsk(1650, 1850, 10.90, 1.1, 0.12);
    fsk(980, 1180, 10.90, 1.1, 0.12);

    // ===== PHASE 11: V.34 carriers 1200+1800+2400Hz (12.05-12.35s) =====
    osc(1200, 12.05, 0.3, 0.2);
    osc(1800, 12.05, 0.3, 0.15);
    osc(2400, 12.05, 0.3, 0.25);

    // ===== PHASE 12: Line probing L1 — high tones 2550-3300Hz (12.35-12.65s) =====
    for (let f = 2550; f <= 3300; f += 150) {
      osc(f, 12.35, 0.28, 0.06);
    }

    // ===== PHASE 13: V.34 carriers again (12.65-12.80s) =====
    osc(1200, 12.65, 0.15, 0.15);
    osc(2400, 12.65, 0.15, 0.12);

    // ===== PHASE 14: Line probing L2 — low tones 450-1350Hz (12.80-13.10s) =====
    for (let f = 450; f <= 1350; f += 150) {
      osc(f, 12.80, 0.28, 0.06);
    }

    // ===== PHASE 15: V.34 training carriers (13.10-13.50s) =====
    osc(2400, 13.10, 0.4, 0.3);
    osc(1800, 13.10, 0.4, 0.15);
    osc(1200, 13.10, 0.4, 0.1);

    // ===== PHASE 16: The screech — broadband 2500-3400Hz (13.50-16.00s) =====
    // Dense noise centered in upper telephone band
    noiseBurst(13.50, 2.5, 0.1, 2400, 3500);
    // Add some carrier structure through the noise
    for (const f of [2700, 2850, 3000, 3150, 3300]) {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(f, t + 13.5);
      // Wobble the frequency slightly
      for (let j = 0; j < 15; j++) {
        o2.frequency.setValueAtTime(f + (Math.random() - 0.5) * 200, t + 13.5 + j * 0.17);
      }
      g2.gain.setValueAtTime(0.04, t + 13.5);
      g2.gain.setValueAtTime(0.04, t + 16.0);
      g2.gain.linearRampToValueAtTime(0, t + 16.05);
      o2.connect(g2).connect(bandpass);
      o2.start(t + 13.5);
      o2.stop(t + 16.1);
    }

    // ===== PHASE 17: Connected data hiss (16.00-end) =====
    // Broadband noise across full telephone spectrum, louder than before
    noiseBurst(16.0, duration - 16.0, 0.07, 300, 3400);
    // Some carrier peaks visible in data
    for (const f of [1800, 2200, 2670]) {
      osc(f, 20.0, duration - 20.0, 0.03);
    }

    // Subtle line noise throughout
    noiseBurst(0, duration, 0.01, 300, 3400);

    const handle = { stop: () => { try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05); } catch {} } };
    activeAudioNodes.push(handle);
    return handle;
  }

  function sfxStatic(duration: number): { stop: () => void } {
    const ctx = getAudio();
    const bufSize = ctx.sampleRate * Math.ceil(duration);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + duration);
    const handle = { stop: () => { try { gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05); src.stop(); } catch {} } };
    activeAudioNodes.push(handle);
    return handle;
  }

  function sfxAlarm() {
    const ctx = getAudio();
    const t = ctx.currentTime;
    // "EHHHH" buzzer — flat, sustained, like a wrong-answer game show buzzer
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc.frequency.value = 260;
    osc2.frequency.value = 265; // slight detune for grit
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.setValueAtTime(0.07, t + 0.6);
    gain.gain.linearRampToValueAtTime(0, t + 0.7);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t); osc2.start(t);
    osc.stop(t + 0.7); osc2.stop(t + 0.7);
  }

  function sfxDenied() {
    const ctx = getAudio();
    const t = ctx.currentTime;
    // "EHHHH" — flat buzzer, like the sound when you get it wrong
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc.frequency.value = 200;
    osc2.frequency.value = 205;
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.setValueAtTime(0.07, t + 0.5);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t); osc2.start(t);
    osc.stop(t + 0.6); osc2.stop(t + 0.6);
  }

  function sfxGranted() {
    const ctx = getAudio();
    const t = ctx.currentTime;
    // Ascending sine tones — clean digital chime
    const freqs = [523, 659, 784];
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freqs[i];
      gain.gain.setValueAtTime(0.07, t + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.15);
      osc.stop(t + i * 0.15 + 0.4);
    }
  }

  function sfxKill() {
    const ctx = getAudio();
    const t = ctx.currentTime;
    // Descending tone — like a power-down
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 1.0);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.linearRampToValueAtTime(0, t + 1.0);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(t + 1.0);
    // Noise burst layered
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.04, t);
    ng.gain.linearRampToValueAtTime(0, t + 0.5);
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 800;
    src.connect(filt).connect(ng).connect(ctx.destination);
    src.start(t);
    src.stop(t + 0.5);
  }

  type SoundFn = 'dialup' | 'beep' | 'static' | 'denied' | 'granted' | 'alarm' | 'kill' | 'type';

  function playSound(sound: SoundFn) {
    switch (sound) {
      case 'dialup': sfxDialup(); break;
      case 'beep': sfxBeep(1200, 0.06); break;
      case 'static': sfxStatic(0.3); break;
      case 'denied': sfxDenied(); break;
      case 'granted': sfxGranted(); break;
      case 'alarm': sfxAlarm(); break;
      case 'kill': sfxKill(); break;
      case 'type': sfxBeep(800 + Math.random() * 400, 0.03, 0.03); break;
    }
  }

  function stopAllAudio() {
    activeAudioNodes.forEach(n => n.stop());
    activeAudioNodes = [];
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
  }

  const sequence: { text: string; delay: number; cls?: string; flash?: string; static?: boolean; shake?: boolean; sound?: SoundFn }[] = [
    { text: '', delay: 0, static: true, sound: 'static' },
    { text: 'BIOS check.......... ok', delay: 400, cls: 'dim', sound: 'beep' },
    { text: 'Memory: 65536K verified', delay: 150, cls: 'dim', sound: 'type' },
    { text: 'Loading kernel module', delay: 150, cls: 'dim', sound: 'type' },
    { text: '', delay: 300 },

    // Dial-up starts here — 18s total, text synced to audio phases
    { text: '$ dial praetorian-mainframe', delay: 0, sound: 'dialup' },
    { text: 'atdt 7979894409599', delay: 3200, cls: 'dim' },
    { text: 'Waiting for remote...', delay: 2300, cls: 'dim' },
    { text: 'Remote answered', delay: 500 },
    { text: 'v.8 negotiation...', delay: 1500, cls: 'dim' },
    { text: 'Protocol: v.34 // carrier: 2100Hz', delay: 1200, cls: 'dim' },
    { text: 'Handshake in progress', delay: 2000, cls: 'dim' },
    { text: 'Line probing... L1/L2 complete', delay: 1500, cls: 'dim' },
    { text: 'Training equalizer', delay: 1500, cls: 'dim' },
    { text: 'Scrambled data exchange', delay: 2000, cls: 'dim' },
    { text: 'Carrier locked // 33600 bps', delay: 1000 },
    { text: 'Connection established', delay: 500, cls: 'green', sound: 'beep' },
    { text: '', delay: 300 },

    { text: '$ ssh -J proxy1,proxy2,proxy3 ghost@praetorian', delay: 400 },
    { text: 'Resolving route: 194.32.107.42 → 83.142.59.11 → 211.47.234.8 → 45.91.12.203', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Encryption: aes-256-gcm // handshake complete', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Tunnel established', delay: 400, cls: 'green', sound: 'beep' },
    { text: '', delay: 400 },

    { text: 'Authenticating: user=ghost protocol=zero-knowledge', delay: 300, cls: 'dim', sound: 'type' },
    { text: 'error: access denied', delay: 700, cls: 'red', flash: 'red', shake: true, sound: 'denied' },
    { text: '', delay: 400 },
    { text: '$ exploit --cve 2025-31337 --target praetorian', delay: 400, sound: 'type' },
    { text: 'Injecting shellcode @ 0x7fff4de2a000', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Payload: ████████████████████████████████', delay: 150, cls: 'dim', sound: 'type' },
    { text: 'Heap spray complete — overflow triggered', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Escalating privileges: user → root', delay: 300, sound: 'beep' },
    { text: '', delay: 300 },
    { text: '*** access granted ***', delay: 0, cls: 'green big', flash: 'green', shake: true, sound: 'granted' },
    { text: '', delay: 1000, static: true, sound: 'static' },

    { text: '    ██████╗ ██████╗  █████╗ ███████╗████████╗ ██████╗ ██████╗ ██╗ █████╗ ███╗   ██╗', delay: 0, cls: 'title' },
    { text: '    ██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██║██╔══██╗████╗  ██║', delay: 0, cls: 'title' },
    { text: '    ██████╔╝██████╔╝███████║█████╗     ██║   ██║   ██║██████╔╝██║███████║██╔██╗ ██║', delay: 0, cls: 'title' },
    { text: '    ██╔═══╝ ██╔══██╗██╔══██║██╔══╝     ██║   ██║   ██║██╔══██╗██║██╔══██║██║╚██╗██║', delay: 0, cls: 'title' },
    { text: '    ██║     ██║  ██║██║  ██║███████╗   ██║   ╚██████╔╝██║  ██║██║██║  ██║██║ ╚████║', delay: 0, cls: 'title' },
    { text: '    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═╝ ╚═══╝', delay: 0, cls: 'title' },
    { text: '', delay: 800 },

    { text: 'root@praetorian:~# ls -la /classified/praetorian/', delay: 400 },
    { text: '  drwxr-x---  shadow_ops/', delay: 100, cls: 'dim' },
    { text: '  drwxr-x---  project_monarch/', delay: 100, cls: 'dim' },
    { text: '  drwxr-x---  black_pharaoh/', delay: 100, cls: 'dim' },
    { text: '  -rw-r-----  targets.db           4.2G', delay: 100, cls: 'dim' },
    { text: '  -rw-r-----  sleeper_cells.enc    891M', delay: 100, cls: 'dim' },
    { text: '  -rw-r-----  key_schedule.pem     128K', delay: 100, cls: 'dim' },
    { text: '', delay: 500 },

    { text: 'root@praetorian:~# scp targets.db ghost@exfil:/drop/', delay: 400, sound: 'beep' },
    { text: '  targets.db   38%  1.6GB  12.4MB/s  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░', delay: 300, cls: 'dim', sound: 'type' },
    { text: '  targets.db   61%  2.6GB  11.8MB/s  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░', delay: 400, cls: 'dim', sound: 'type' },
    { text: '  targets.db   79%  3.3GB  10.2MB/s  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░', delay: 350, cls: 'dim', sound: 'type' },
    { text: '', delay: 200 },

    { text: '*** TRACE DETECTED ***', delay: 0, cls: 'red big blink', flash: 'red', shake: true, sound: 'alarm' },
    { text: 'Origin: NSA/CSS Fort Meade — signature: TURBULENCE', delay: 200, cls: 'red', sound: 'type' },
    { text: 'Counter-intrusion active — they are inside the tunnel', delay: 200, cls: 'red', sound: 'type' },
    { text: '', delay: 300 },
    { text: '$ kill -9 $$; shred -vfz -n 5 /var/log/*', delay: 200, sound: 'kill' },
    { text: 'Shredding logs... ████████████████ done', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Burning tunnel endpoints', delay: 200, cls: 'dim', sound: 'type' },
    { text: 'Spoofing exit node', delay: 200, cls: 'dim', sound: 'type' },
    { text: '', delay: 400 },
    { text: 'Connection terminated', delay: 300, cls: 'red', sound: 'denied' },
    { text: '', delay: 500 },
    { text: 'You were never here.', delay: 0, cls: 'green', sound: 'beep' },
    { text: '', delay: 1500 },
    { text: 'Ending session in 10...', delay: 1000, cls: 'dim', sound: 'type' },
    { text: '9...', delay: 1000, cls: 'dim' },
    { text: '8...', delay: 1000, cls: 'dim' },
    { text: '7...', delay: 1000, cls: 'dim' },
    { text: '6...', delay: 1000, cls: 'dim' },
    { text: '5...', delay: 1000, cls: 'dim' },
    { text: '4...', delay: 1000, cls: 'dim' },
    { text: '3...', delay: 1000, cls: 'dim' },
    { text: '2...', delay: 1000, cls: 'dim' },
    { text: '1...', delay: 1000, cls: 'dim' },
    { text: '', delay: 500, static: true, sound: 'static' },
  ];

  function drawStatic(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255;
      d[i] = v;
      d[i + 1] = v;
      d[i + 2] = v;
      d[i + 3] = Math.random() < 0.92 ? 30 : 120;
    }
    ctx.putImageData(img, 0, 0);
  }

  function startStaticLoop() {
    if (!canvasEl) return () => {};
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return () => {};
    canvasEl.width = 200;
    canvasEl.height = 150;
    let raf: number;
    function loop() {
      drawStatic(ctx!, 200, 150);
      raf = requestAnimationFrame(loop);
    }
    loop();
    return () => cancelAnimationFrame(raf);
  }

  export function trigger() {
    if (active) return;
    active = true;
    showScanlines = true;
    lines = [];

    setTimeout(() => runSequence(), 100);
  }

  function runSequence() {
    let i = 0;
    let staticCleanup: (() => void) | null = null;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function next() {
      if (i >= sequence.length) {
        // End — close after last delay
        const t = setTimeout(() => {
          if (staticCleanup) staticCleanup();
          stopAllAudio();
          active = false;
          lines = [];
          flash = '';
          showStatic = false;
          showScanlines = false;
          shaking = false;
        }, 500);
        timeouts.push(t);
        return;
      }

      const step = sequence[i];
      i++;

      if (step.static) {
        showStatic = true;
        if (step.sound) playSound(step.sound);
        if (!staticCleanup) {
          setTimeout(() => { staticCleanup = startStaticLoop(); }, 0);
        }
        const t = setTimeout(() => {
          showStatic = false;
          next();
        }, 250);
        timeouts.push(t);
        return;
      }

      if (step.sound) {
        playSound(step.sound);
      }

      if (step.flash) {
        flash = step.flash;
        setTimeout(() => { flash = ''; }, 150);
      }

      if (step.shake) {
        shaking = true;
        setTimeout(() => { shaking = false; }, 200);
      }

      if (step.text) {
        lines = [...lines, { text: step.text, cls: step.cls || '' }];
      }

      // Auto-scroll
      setTimeout(() => {
        const el = document.querySelector('.praet-output');
        if (el) el.scrollTop = el.scrollHeight;
      }, 10);

      const t = setTimeout(next, step.delay);
      timeouts.push(t);
    }

    cleanup = () => {
      timeouts.forEach(clearTimeout);
      if (staticCleanup) staticCleanup();
    };

    next();
  }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && active) {
      cleanup?.();
      stopAllAudio();
      active = false;
      lines = [];
      flash = '';
      showStatic = false;
      showScanlines = false;
      shaking = false;
    }
  }

  onMount(() => {
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      cleanup?.();
    };
  });
</script>

{#if active}
  <div class="praet-overlay" class:shaking>
    <canvas class="praet-static" class:visible={showStatic} bind:this={canvasEl}></canvas>
    {#if showScanlines}
      <div class="praet-scanlines"></div>
    {/if}
    {#if flash}
      <div class="praet-flash {flash}"></div>
    {/if}
    <div class="praet-output">
      {#each lines as line}
        {#if line.text}
          <div class="praet-line {line.cls}">{line.text}</div>
        {:else}
          <div class="praet-line spacer">&nbsp;</div>
        {/if}
      {/each}
      <span class="praet-cursor">█</span>
    </div>
    <div class="praet-esc">ESC TO EXIT</div>
  </div>
{/if}

<style>
  .praet-overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: #000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .praet-overlay.shaking {
    animation: praetShake 0.1s steps(1) infinite;
  }

  @keyframes praetShake {
    0%   { transform: translate(0, 0); }
    25%  { transform: translate(-4px, 2px); }
    50%  { transform: translate(3px, -3px); }
    75%  { transform: translate(-2px, -1px); }
    100% { transform: translate(4px, 1px); }
  }

  .praet-static {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: pixelated;
    opacity: 0;
    pointer-events: none;
    z-index: 2;
  }

  .praet-static.visible {
    opacity: 1;
  }

  .praet-scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent 0px,
      transparent 2px,
      rgba(0, 0, 0, 0.15) 2px,
      rgba(0, 0, 0, 0.15) 4px
    );
    pointer-events: none;
    z-index: 3;
  }

  .praet-flash {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 4;
    animation: praetFlash 0.15s steps(1) forwards;
  }

  .praet-flash.green { background: rgba(0, 255, 65, 0.15); }
  .praet-flash.red { background: rgba(255, 0, 0, 0.15); }

  @keyframes praetFlash {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  .praet-output {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
    z-index: 1;
    font-family: var(--font-mono, monospace);
    font-size: clamp(0.8rem, 1.6vw, 1.1rem);
    line-height: 1.6;
    color: #00ff41;
  }

  .praet-line {
    white-space: pre;
    overflow: hidden;
  }

  .praet-line.dim { color: #338833; }
  .praet-line.green { color: #00ff41; }
  .praet-line.red { color: #ff3333; }
  .praet-line.big { font-weight: 700; font-size: 1.1em; }
  .praet-line.title {
    color: #00ff41;
    font-size: clamp(0.5rem, 1.1vw, 0.8rem);
    line-height: 1.15;
  }
  .praet-line.blink { animation: praetBlink 0.3s steps(1) infinite; }
  .praet-line.spacer { line-height: 0.8; }

  @keyframes praetBlink {
    0%   { opacity: 1; }
    50%  { opacity: 0; }
  }

  .praet-cursor {
    animation: praetBlink 0.6s steps(1) infinite;
    color: #00ff41;
  }

  .praet-esc {
    position: absolute;
    bottom: 16px;
    right: 24px;
    font-size: 0.6rem;
    color: #335533;
    letter-spacing: 0.15em;
    z-index: 5;
  }

  @media (max-width: 768px) {
    .praet-line.title {
      font-size: 0.3rem;
    }

    .praet-output {
      padding: 16px;
    }
  }
</style>
