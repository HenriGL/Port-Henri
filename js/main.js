/* =========================================================
   Page behaviour — language, entrance reveals, counters, nav, buttons
   ========================================================= */
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Language (default PT, choice remembered) ---------- */
let currentLang='pt';
try{const saved=localStorage.getItem('lang');if(saved==='en'||saved==='pt')currentLang=saved}catch(e){}
applyLang(currentLang,false);

document.querySelectorAll('.lang button').forEach(b=>b.addEventListener('click',()=>{
  const lang=b.dataset.lang;if(lang===currentLang)return;currentLang=lang;
  try{localStorage.setItem('lang',lang)}catch(e){}
  document.body.classList.add('switching');
  setTimeout(()=>{applyLang(lang,true);document.body.classList.remove('switching')},250);
}));

/* ---------- Entrance reveals ----------
   Scroll-based check (instead of IntersectionObserver) so elements that were
   jumped past — anchor links, reloads mid-page — still reveal. */
let pending=[...document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-line')];
function checkReveals(){
  const limit=innerHeight*.9;
  pending=pending.filter(el=>{
    if(!el.isConnected)return false;
    if(el.getBoundingClientRect().top>limit)return true;
    el.classList.add('in');
    if(el.classList.contains('stat'))countUp(el);
    return false;
  });
}
let revealTick=false;
addEventListener('scroll',()=>{if(!revealTick){revealTick=true;requestAnimationFrame(()=>{checkReveals();revealTick=false})}},{passive:true});
addEventListener('resize',checkReveals);
addEventListener('load',checkReveals);
checkReveals();

/* ---------- Count-up stats ---------- */
function countUp(stat){
  const el=stat.querySelector('.count');const to=+el.dataset.to;
  if(reduceMotion){el.textContent=to;return}
  const dur=1400,t0=performance.now();
  const step=t=>{const p=Math.min((t-t0)/dur,1);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};
  requestAnimationFrame(step);
}

/* ---------- Nav: blur once scrolled, hide while scrolling down ---------- */
const nav=document.getElementById('nav');let lastY=0;
addEventListener('scroll',()=>{
  const y=scrollY;
  nav.classList.toggle('scrolled',y>40);
  nav.classList.toggle('hidden',y>lastY&&y>innerHeight*.8);
  lastY=y;
},{passive:true});

/* ---------- Magnetic buttons ---------- */
if(!reduceMotion&&matchMedia('(hover:hover)').matches){
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.translate=`${(e.clientX-r.left-r.width/2)*.15}px ${(e.clientY-r.top-r.height/2)*.25}px`});
    b.addEventListener('mouseleave',()=>{b.style.translate='0 0'});
  });
}
