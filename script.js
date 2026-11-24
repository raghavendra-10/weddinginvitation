/* ============================================================
   Rahul Sandeep Sai & Arshitha — wedding invitation
   ============================================================ */

const body = document.body;

/* ---------- 0. BACKGROUND MUSIC ---------- */
const audio = document.getElementById('bgAudio');
const musicBtn = document.getElementById('musicBtn');
function setPlayingUI(on){ musicBtn.classList.toggle('playing', on); musicBtn.setAttribute('aria-label', on ? 'Pause music' : 'Play music'); }
function fadeIn(target){
  let v = 0; audio.volume = 0;
  const t = setInterval(() => { v += 0.04; audio.volume = Math.min(v, target); if (v >= target) clearInterval(t); }, 90);
}
function playMusic(){ const p = audio.play(); if (p && p.then){ p.then(() => { fadeIn(0.65); setPlayingUI(true); }).catch(() => setPlayingUI(false)); } }
musicBtn.addEventListener('click', () => {
  if (audio.paused){ playMusic(); } else { audio.pause(); setPlayingUI(false); }
});

/* ---------- 1. GATEFOLD OPEN (the split seal rides apart with the panels) ---------- */
const gate = document.getElementById('gate');

function openGate(){
  if (body.classList.contains('opened')) return;
  body.classList.add('opened');
  body.classList.remove('locked');
  playMusic();                       // start the song when they open the invitation
  // remove cover from flow after the panels finish, curtains after they finish parting
  setTimeout(() => body.classList.add('gate-gone'), 1800);
  setTimeout(() => body.classList.add('curtains-gone'), 3200);
  // kick off first reveal check
  setTimeout(revealCheck, 100);
  // begin the gentle auto-scroll tour once the curtains have parted
  setTimeout(startAutoScroll, 3800);
}
gate.addEventListener('click', openGate);
gate.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGate(); }});

/* ---------- 1b. AUTO-SCROLL TOUR (stops the moment the guest takes over) ---------- */
let asRAF = 0, asActive = false;
function startAutoScroll(){
  if (asActive) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  asActive = true;
  const SPEED = 0.9;                  // px per frame ≈ 54px/s, calm & readable
  const step = () => {
    if (!asActive) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= max - 1){ asActive = false; return; }   // reached the footer
    window.scrollBy(0, SPEED);
    asRAF = requestAnimationFrame(step);
  };
  asRAF = requestAnimationFrame(step);
}
function stopAutoScroll(){ asActive = false; cancelAnimationFrame(asRAF); }
// any manual intent hands control back to the guest for good
['wheel','touchstart','keydown','mousedown'].forEach(ev =>
  window.addEventListener(ev, stopAutoScroll, {passive:true}));

/* ---------- 2. SCROLL REVEALS ---------- */
const reveals = document.querySelectorAll('.reveal');
let io;
if ('IntersectionObserver' in window){
  io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }});
  }, { threshold:0.14, rootMargin:'0px 0px -8% 0px' });
  reveals.forEach(el => io.observe(el));
}
function revealCheck(){ reveals.forEach(el => { if (el.getBoundingClientRect().top < innerHeight*0.9) el.classList.add('in'); }); }

/* ---------- 4. COUNTDOWN ---------- */
const TARGET = new Date('2026-12-13T08:08:00+05:30').getTime();
const elD = document.getElementById('cd-days');
const elH = document.getElementById('cd-hours');
const elM = document.getElementById('cd-mins');
const elS = document.getElementById('cd-secs');
const pad = n => String(n).padStart(2,'0');

function tick(){
  const diff = TARGET - Date.now();
  if (diff <= 0){
    elD.textContent='00'; elH.textContent='00'; elM.textContent='00'; elS.textContent='00';
    const grid = document.getElementById('countGrid');
    if (grid && !grid.dataset.done){ grid.dataset.done='1'; grid.innerHTML='<p style="font-family:var(--head);font-size:2.4rem;color:var(--green-deep)">Today is the day! ♥</p>'; }
    return;
  }
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff%86400000/3600000);
  const m = Math.floor(diff%3600000/60000);
  const s = Math.floor(diff%60000/1000);
  elD.textContent=pad(d); elH.textContent=pad(h); elM.textContent=pad(m); elS.textContent=pad(s);
}
tick(); setInterval(tick, 1000);

/* ---------- 5. FALLING PETALS ---------- */
const petalLayer = document.getElementById('petals');
const PETAL_KINDS = ['', 'gold', 'white'];
function spawnPetal(){
  if (document.hidden) return;
  const p = document.createElement('div');
  p.className = 'petal ' + PETAL_KINDS[Math.floor(Math.random()*PETAL_KINDS.length)];
  const size = 9 + Math.random()*12;
  p.style.left = Math.random()*100 + 'vw';
  p.style.width = p.style.height = size + 'px';
  p.style.setProperty('--drift', (Math.random()*160 - 80) + 'px');
  const dur = 7 + Math.random()*7;
  p.style.animationDuration = dur + 's';
  p.style.opacity = 0.5 + Math.random()*0.4;
  petalLayer.appendChild(p);
  setTimeout(() => p.remove(), dur*1000 + 500);
}
setInterval(spawnPetal, 650);
for (let i=0;i<8;i++) setTimeout(spawnPetal, i*300);

/* ---------- 6. SCRATCH-TO-REVEAL CARD ---------- */
(function(){
  const card = document.getElementById('scratchCard');
  const canvas = document.getElementById('scratchCanvas');
  const hint = document.getElementById('scratchHint');
  if (!card || !canvas) return;
  const ctx = canvas.getContext('2d');
  let drawing = false, cleared = false, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function paintCover(){
    const r = card.getBoundingClientRect();
    canvas.width = r.width * dpr; canvas.height = r.height * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // sage-green glitter cover (matches the reel's heart)
    const g = ctx.createRadialGradient(r.width*0.5,r.height*0.42,8, r.width*0.5,r.height*0.5,r.width*0.7);
    g.addColorStop(0,'#9aa678'); g.addColorStop(.6,'#7c8a5f'); g.addColorStop(1,'#5f6d45');
    ctx.fillStyle = g; ctx.fillRect(0,0,r.width,r.height);
    // glitter speckle
    for (let i=0;i<260;i++){
      const a = Math.random();
      ctx.fillStyle = a > .5 ? 'rgba(255,255,240,'+(Math.random()*0.5)+')' : 'rgba(220,210,150,'+(Math.random()*0.4)+')';
      ctx.beginPath();
      ctx.arc(Math.random()*r.width, Math.random()*r.height, Math.random()*1.7, 0, 7);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';   // full-alpha brush so each pass truly clears
  }
  // (re)build cover when the card scrolls into view & on resize
  let built = false;
  function build(){ if (!built){ built = true; paintCover(); } }
  const bo = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) build(); }), {threshold:.3});
  bo.observe(card);
  window.addEventListener('resize', () => { built=false; cleared=false; card.classList.remove('done'); ctx.globalCompositeOperation='source-over'; build(); });

  function pos(e){
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  }
  function scratch(e){
    if (!drawing) return;
    const {x,y} = pos(e);
    // wide, soft brush so a light swipe clears plenty
    ctx.beginPath(); ctx.arc(x,y,34,0,7); ctx.fill();
    if (hint) hint.style.opacity = 0;
    checkCleared();
  }
  function checkCleared(){
    if (cleared) return;
    const img = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    let clear = 0;
    for (let i=3;i<img.length;i+=40*4) if (img[i] === 0) clear++;
    const total = img.length/(40*4);
    // reveal early — a light scratch (~22%) auto-clears the rest
    if (clear/total > 0.22){
      cleared = true;
      canvas.style.transition = 'opacity .5s ease';
      canvas.style.opacity = 0;
      setTimeout(() => canvas.style.display='none', 520);
      burstConfetti();
    }
  }
  // celebratory confetti dots, like the reel's reveal
  function burstConfetti(){
    const wrap = card.closest('.scratch-wrap') || card.parentElement;
    const colors = ['#d8bd84','#cf8a98','#9aa678','#f3e8cd','#b38f4c'];
    for (let i=0;i<26;i++){
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = (8 + Math.random()*84) + '%';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--cx', (Math.random()*90 - 45) + 'px');
      c.style.animationDelay = (Math.random()*0.7) + 's';
      c.style.width = c.style.height = (4 + Math.random()*5) + 'px';
      wrap.style.position = 'relative';
      wrap.appendChild(c);
      setTimeout(() => c.remove(), 3600);
    }
  }
  const start = e => { build(); drawing = true; scratch(e); };
  const end   = () => drawing = false;
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', scratch);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); start(e); }, {passive:false});
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); scratch(e); }, {passive:false});
  canvas.addEventListener('touchend', end);
})();

/* ---------- 7. fallback: if gate never tapped, still reveal on scroll ---------- */
window.addEventListener('scroll', () => { if (body.classList.contains('opened')) return; }, {passive:true});
