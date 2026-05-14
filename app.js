// ── CONFIG ────────────────────────────────────────────────────────
const COUNTER_URL = 'counter.php';
const DL_URL      = 'https://www.mediafire.com/file/be8ovjjlr0j1nbx/Galaxy+Beta+2.2.apk/file';
const FILE_MB     = 21.43;
const FILE_KB     = FILE_MB * 1024;

// ── ELEMENTS ──────────────────────────────────────────────────────
const elTotal   = document.getElementById('totalDl');
const elActive  = document.getElementById('activeUsers');
const elOnline  = document.getElementById('onlineCount');

// ── UTILS ─────────────────────────────────────────────────────────
function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function animCount(el, from, to, dur) {
  if (!el) return;
  dur = dur || 1000;
  const start = performance.now();
  const tick = now => {
    const p    = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (to - from) * ease)
                       .toLocaleString('id-ID');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function fmtSpeed(kb) {
  return kb >= 1024
    ? (kb / 1024).toFixed(1) + ' MB/s'
    : Math.floor(kb) + ' KB/s';
}

function fmtSize(kb) {
  return kb >= 1024
    ? (kb / 1024).toFixed(1) + ' MB'
    : Math.floor(kb) + ' KB';
}

// ── DOWNLOAD COUNTER ──────────────────────────────────────────────
async function fetchCount() {
  try {
    const r = await fetch(COUNTER_URL + '?t=' + Date.now());
    const d = await r.json();
    return d.count || 0;
  } catch (e) {
    return null;
  }
}

async function postDownload() {
  try {
    await fetch(COUNTER_URL, { method: 'POST' });
  } catch (e) {}
}

// ── INIT STATS ────────────────────────────────────────────────────
let curDl     = 0;
let curActive = rnd(1800, 3600);
let curOnline = rnd(900, 2400);

async function initStats() {
  const count = await fetchCount();
  curDl = count !== null ? count : 0;

  animCount(elTotal,  0, curDl,     1600);
  animCount(elActive, 0, curActive, 1800);
  animCount(elOnline, 0, curOnline, 1300);
}

setTimeout(initStats, 350);

// Poll download count setiap 30 detik
setInterval(async () => {
  const count = await fetchCount();
  if (count !== null && count !== curDl) {
    animCount(elTotal, curDl, count, 900);
    curDl = count;
  }
}, 30000);

// Drift active users setiap ~14 detik
setInterval(() => {
  const next = rnd(
    Math.max(1200, curActive - 220),
    Math.min(5000, curActive + 220)
  );
  animCount(elActive, curActive, next, 2000);
  curActive = next;
}, 14000);

// Drift online count setiap ~10 detik
setInterval(() => {
  const next = rnd(
    Math.max(600, curOnline - 160),
    Math.min(3500, curOnline + 160)
  );
  animCount(elOnline, curOnline, next, 1500);
  curOnline = next;
}, 10000);

// ── DOWNLOAD FLOW ─────────────────────────────────────────────────
function startDownload() {
  const btn      = document.getElementById('btnDownload');
  const progress = document.getElementById('dlProgressWrap');
  const done     = document.getElementById('dlDone');

  btn.disabled           = true;
  progress.style.display = 'block';
  done.style.display     = 'none';

  simulateDownload(async () => {
    // Trigger real download
    const a = document.createElement('a');
    a.href     = DL_URL;
    a.download = 'GALAXYV2.2.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // +5 ke server counter
    await postDownload();

    // Refresh angka download
    const count = await fetchCount();
    if (count !== null) {
      animCount(elTotal, curDl, count, 900);
      curDl = count;
    }

    progress.style.display = 'none';
    done.style.display     = 'flex';
    btn.disabled           = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3v13M12 16l-5-5M12 16l5-5M3 21h18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg> Download Lagi`;
  });
}

function simulateDownload(onDone) {
  const statusEl = document.getElementById('dlStatusText');
  const pctEl    = document.getElementById('dlPercent');
  const barEl    = document.getElementById('dlBar');
  const speedEl  = document.getElementById('dlSpeed');
  const sizeEl   = document.getElementById('dlSize');

  const phases = [
    { label: 'Menghubungkan ke server...',  until: 6,   sMin: 0,    sMax: 60   },
    { label: 'Mengautentikasi...',          until: 14,  sMin: 60,   sMax: 200  },
    { label: 'Mendownload NETYSV3.apk...', until: 86,  sMin: 400,  sMax: 1200 },
    { label: 'Memverifikasi file...',      until: 95,  sMin: 500,  sMax: 850  },
    { label: 'Selesai!',                   until: 100, sMin: 700,  sMax: 950  },
  ];

  let pct = 0, phase = 0;

  const iv = setInterval(() => {
    const p     = phases[phase];
    statusEl.textContent = p.label;

    const boost = Math.random() * (phase < 2 ? 0.65 : phase === 4 ? 0.28 : 0.68) + 0.18;
    pct = Math.min(pct + boost, p.until);

    const spd = Math.floor(rnd(p.sMin, p.sMax));
    const kb  = (pct / 100) * FILE_KB;

    barEl.style.width   = pct + '%';
    pctEl.textContent   = Math.floor(pct) + '%';
    speedEl.textContent = fmtSpeed(spd);
    sizeEl.textContent  = fmtSize(kb) + ' / ' + FILE_MB + ' MB';

    if (pct >= p.until && phase < phases.length - 1) phase++;
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(onDone, 450);
    }
  }, 120);
}

// ── REVEAL ANIMATION ──────────────────────────────────────────────
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 55);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.05, rootMargin: '0px 0px -16px 0px' });

document.querySelectorAll('.feat-card, .dl-card, .comm-item, .stats-row')
  .forEach(el => {
    el.classList.add('reveal');
    revealObs.observe(el);
  });
