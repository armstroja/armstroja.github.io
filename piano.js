// piano.js — ES module
// Exports: init, startCam, stopCam

const TEAL = '#1D9E75', BLUE = '#378ADD';
const SMOOTH_ALPHA = 0.55;
const GHOST_FRAMES = 6;

// MediaPipe landmark indices for each finger (tip, PIP)
const TIPS = [4, 8, 12, 16, 20];

// Semitone offsets from root of the chosen octave — 10 notes: 5 left + 5 right
const SCALES = {
  major:      [0, 2, 4, 5, 7,  9, 11, 12, 14, 16],
  pentatonic: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21],
  chromatic:  [0, 1, 2, 3, 4,  5,  6,  7,  8,  9],
};

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Module-level state
let video, canvas, statusEl, notesEl, octaveEl, scaleEl;
let ctx, cvW = 0, cvH = 0;
let hands = null, stream = null, raf = null, running = false;
let smoothL = null, smoothR = null;
let lastSmoothL = null, lastSmoothR = null;
let ghostL = 0, ghostR = 0;
let actx = null;

// Active oscillators: key → { osc, gain }
const active = new Map();

// Note pill elements (one per scale step)
const pills = [];

// ── Public API ──────────────────────────────────────────────────

export function init(refs) {
  ({ video, canvas, status: statusEl, notes: notesEl, octave: octaveEl, scale: scaleEl } = refs);
  ctx = canvas.getContext('2d');
  window.addEventListener('resize', resize);
  resize();
  buildPills();
  octaveEl.addEventListener('change', buildPills);
  scaleEl.addEventListener('change', buildPills);
}

export async function startCam() {
  navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange);
  navigator.mediaDevices.addEventListener('devicechange', onDeviceChange);

  setStatus('opening camera…', '#EF9F27');
  stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user',
      width:  { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30, min: 20 },
    },
  });
  video.srcObject = stream;
  await new Promise(r => { video.readyState >= 2 ? r() : (video.onloadedmetadata = r); });
  await video.play();
  setStatus('loading model…', '#EF9F27');

  hands = new Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}` });
  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.65,
    minTrackingConfidence: 0.6,
    selfieMode: false,
  });
  hands.onResults(onResults);
  await hands.initialize();

  setStatus('live', '#1D9E75');
  running = true;

  let lastT = 0;
  const TARGET_MS = 1000 / 30;
  async function loop(ts) {
    if (!running) return;
    if (ts - lastT >= TARGET_MS - 2) {
      lastT = ts;
      try { if (video.readyState >= 2) await hands.send({ image: video }); } catch (e) {}
    }
    raf = requestAnimationFrame(loop);
  }
  raf = requestAnimationFrame(loop);
}

export function stopCam() {
  navigator.mediaDevices.removeEventListener('devicechange', onDeviceChange);
  running = false;
  smoothL = null; smoothR = null; lastSmoothL = null; lastSmoothR = null;
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
  if (hands) { hands.close(); hands = null; }
  ctx.clearRect(0, 0, cvW, cvH);
  for (const key of [...active.keys()]) stopNote(key);
  pills.forEach(p => p.classList.remove('on'));
  setStatus('stopped');
}

// ── Internal helpers ────────────────────────────────────────────

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  if (w === cvW && h === cvH) return;
  cvW = w; cvH = h;
  canvas.width = w; canvas.height = h;
}

function setStatus(msg, col) {
  statusEl.textContent = msg;
  statusEl.style.color = col || 'rgba(255,255,255,0.4)';
}

function buildPills() {
  notesEl.innerHTML = '';
  pills.length = 0;
  const scale = SCALES[scaleEl.value] || SCALES.major;
  const baseOctave = parseInt(octaveEl.value);
  for (let i = 0; i < Math.min(10, scale.length); i++) {
    const total = (baseOctave - 4) * 12 + scale[i];
    const name  = NOTE_NAMES[((total % 12) + 12) % 12] + (4 + Math.floor(total / 12));
    const el = document.createElement('span');
    el.className = 'note-pill';
    el.textContent = name;
    notesEl.appendChild(el);
    pills.push(el);
  }
}

function noteFreq(scaleIdx) {
  const scale = SCALES[scaleEl.value] || SCALES.major;
  if (scaleIdx >= scale.length) return null;
  const total = (parseInt(octaveEl.value) - 4) * 12 + scale[scaleIdx];
  return 261.6255653 * Math.pow(2, total / 12); // C4 = 261.63 Hz
}

function ensureAudioContext() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    actx.onstatechange = () => {
      if (actx && (actx.state === 'suspended' || actx.state === 'interrupted')) {
        actx.resume().catch(() => {});
      }
    };
  }
  if (actx.state === 'suspended' || actx.state === 'interrupted') {
    actx.resume().catch(() => {});
  }
  return actx;
}

function onDeviceChange() {
  // When the audio output changes (e.g. AirPods connected/disconnected on Safari),
  // the existing AudioContext may stop producing sound. Stop all notes, close the
  // context and let it be recreated fresh on the next note play.
  for (const key of [...active.keys()]) stopNote(key);
  if (actx) {
    actx.onstatechange = null;
    actx.close().catch(() => {});
    actx = null;
  }
  pills.forEach(p => p.classList.remove('on'));
}

function playNote(key, freq) {
  if (active.has(key)) return;
  const ctx_ = ensureAudioContext();
  const now  = ctx_.currentTime;
  const gain = ctx_.createGain();
  const osc  = ctx_.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.015);
  gain.gain.setTargetAtTime(0.2, now + 0.015, 0.1);
  osc.connect(gain);
  gain.connect(ctx_.destination);
  osc.start(now);
  active.set(key, { osc, gain });
}

function stopNote(key) {
  if (!active.has(key) || !actx) return;
  const { osc, gain } = active.get(key);
  const now = actx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(gain.gain.value, now);
  gain.gain.linearRampToValueAtTime(0, now + 0.08);
  osc.stop(now + 0.1);
  active.delete(key);
}

function smoothLandmarks(prev, next) {
  if (!prev) return next.map(p => ({ ...p }));
  return next.map((p, i) => ({
    x: prev[i].x * (1 - SMOOTH_ALPHA) + p.x * SMOOTH_ALPHA,
    y: prev[i].y * (1 - SMOOTH_ALPHA) + p.y * SMOOTH_ALPHA,
    z: prev[i].z * (1 - SMOOTH_ALPHA) + p.z * SMOOTH_ALPHA,
  }));
}

function isHandPlausible(lm) {
  const dx = (lm[9].x - lm[0].x) * cvW;
  const dy = (lm[9].y - lm[0].y) * cvH;
  return Math.hypot(dx, dy) > 25;
}

function isFingerCurled(lm, fi) {
  const tipIdx = TIPS[fi];
  // Thumb: compare tip (4) to IP joint (3)
  // Others: compare tip to PIP joint (tip - 2)
  const refIdx = fi === 0 ? 3 : tipIdx - 2;
  return lm[tipIdx].y > lm[refIdx].y;
}

function skeleton(lm) {
  [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],
   [9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]]
    .forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(lm[a].x * cvW, lm[a].y * cvH);
      ctx.lineTo(lm[b].x * cvW, lm[b].y * cvH);
      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
}

function processHand(lm, handIdx, color) {
  skeleton(lm);
  const scale = SCALES[scaleEl.value] || SCALES.major;
  for (let fi = 0; fi < 5; fi++) {
    const si  = handIdx * 5 + fi;
    if (si >= scale.length) continue;
    const key    = `h${handIdx}f${fi}`;
    const curled = isFingerCurled(lm, fi);
    const tx = lm[TIPS[fi]].x * cvW;
    const ty = lm[TIPS[fi]].y * cvH;

    const r = curled ? 12 : 8;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fillStyle = curled ? color : 'rgba(255,255,255,0.25)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw note name on the fingertip circle
    if (pills[si]) {
      const noteName = pills[si].textContent;
      ctx.fillStyle = curled ? '#000' : '#fff';
      ctx.font = `bold ${r < 10 ? 7 : 8}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(noteName, tx, ty);
    }

    if (curled) {
      const freq = noteFreq(si);
      if (freq) playNote(key, freq);
      if (pills[si]) pills[si].classList.add('on');
    } else {
      stopNote(key);
      if (pills[si]) pills[si].classList.remove('on');
    }
  }
}

function onResults(res) {
  ctx.clearRect(0, 0, cvW, cvH);

  let rawL = null, rawR = null;
  if (res.multiHandLandmarks && res.multiHandedness) {
    res.multiHandedness.forEach((h, i) => {
      const lm = res.multiHandLandmarks[i];
      if (!isHandPlausible(lm)) return;
      if (h.label === 'Right') rawL = lm; else rawR = lm;
    });
  }

  if (rawL) { smoothL = smoothLandmarks(smoothL, rawL); lastSmoothL = smoothL; ghostL = 0; }
  else if (lastSmoothL && ghostL < GHOST_FRAMES) { smoothL = lastSmoothL; ghostL++; }
  else { smoothL = null; lastSmoothL = null; ghostL = 0; }

  if (rawR) { smoothR = smoothLandmarks(smoothR, rawR); lastSmoothR = smoothR; ghostR = 0; }
  else if (lastSmoothR && ghostR < GHOST_FRAMES) { smoothR = lastSmoothR; ghostR++; }
  else { smoothR = null; lastSmoothR = null; ghostR = 0; }

  if (!smoothL) { for (let f = 0; f < 5; f++) { stopNote(`h0f${f}`); if (pills[f])     pills[f].classList.remove('on'); } }
  if (!smoothR) { for (let f = 0; f < 5; f++) { stopNote(`h1f${f}`); if (pills[5+f]) pills[5+f].classList.remove('on'); } }

  if (smoothL) processHand(smoothL, 0, TEAL);
  if (smoothR) processHand(smoothR, 1, BLUE);
}
