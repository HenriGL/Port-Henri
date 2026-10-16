/* =========================================================
   Scroll — Lenis smooth scrolling + scroll-linked effects
   (sticky hero photo wipe, content overlap, cover zoom, parallax)
   ========================================================= */
(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop=matchMedia('(min-width: 821px)');
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

  /* ---------- Smooth scroll ---------- */
  let lenis=null;
  if(!reduce&&typeof Lenis!=='undefined'){
    lenis=new Lenis({lerp:.09,smoothWheel:true,wheelMultiplier:1});
    const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};
    requestAnimationFrame(raf);
  }

  // Anchor links glide with the same easing
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');if(id.length<2)return;
    const target=document.querySelector(id);if(!target)return;
    e.preventDefault();
    if(lenis)lenis.scrollTo(id==='#home'?0:target,{duration:1.6});
    else target.scrollIntoView({behavior:reduce?'auto':'smooth'});
  }));

  if(reduce)return;

  /* ---------- Elements ---------- */
  const media=document.querySelector('.hero__media');
  const imgB=document.querySelector('.hero__img--b');
  const edge=document.querySelector('.hero__edge');
  const shade=document.querySelector('.hero__shade');
  const cue=document.querySelector('.hero__scroll');
  const lang=document.querySelector('.lang');
  const covers=[...document.querySelectorAll('.cover')];
  const parallax=[...document.querySelectorAll('[data-speed]')];
  const drift=[...document.querySelectorAll('[data-drift]')];
  const ctaTitle=document.querySelector('.cta h2');
  const xp=document.getElementById('xp');

  // 0 when the element's top hits the bottom of the viewport, 1 when it reaches the top
  const enter=(el,vh)=>{const r=el.getBoundingClientRect();return clamp(1-r.top/vh)};

  function update(){
    const y=scrollY,vh=innerHeight;

    /* Hero (desktop only — mobile cross-fades in CSS) */
    if(desktop.matches){
      const p=clamp(y/(vh*.6));                 // red → blue wipe
      const q=clamp((y-vh*.5)/vh);              // content sliding over
      imgB.style.clipPath=`inset(${(1-p)*100}% 0 0 0)`;
      imgB.style.transform=`scale(${1.08-.08*p})`;
      edge.style.top=`${(1-p)*100}%`;
      edge.style.opacity=p>0&&p<1?Math.sin(p*Math.PI):0;
      media.style.transform=`scale(${1-.08*q}) translateY(${q*-4}%)`;
      shade.style.opacity=q*.7;
      // filter (not opacity) so it doesn't fight the CSS entrance animation
      const away=clamp(y/(vh*.2));
      if(cue)cue.style.filter=`opacity(${1-away})`;
      lang.style.filter=`opacity(${1-away})`;
      lang.style.pointerEvents=away>.9?'none':'';
    }else{
      imgB.style.clipPath='';imgB.style.transform='';media.style.transform='';shade.style.opacity=0;
    }

    /* Project covers zoom out as they arrive (perspective scale 1.25 → 1) */
    covers.forEach(c=>{c.style.setProperty('--z',(1.25-.25*clamp(enter(c,vh)*1.6)).toFixed(4))});

    /* Desktop only: parallax boxes + heading drift (they'd collide/crop on one column) */
    if(desktop.matches){
      parallax.forEach(el=>{
        const r=el.getBoundingClientRect();
        const off=(r.top+r.height/2-vh/2);
        el.style.transform=`translateY(${(-off*+el.dataset.speed).toFixed(1)}px)`;
      });
      drift.forEach(el=>{el.style.transform=`translateX(${((1-clamp(enter(el,vh)*1.4))*-80).toFixed(1)}px)`});
    }else{
      parallax.forEach(el=>{el.style.transform=''});
      drift.forEach(el=>{el.style.transform=''});
    }

    /* Experience timeline draws down to the middle of the viewport; dots light as it passes.
       Rows are re-rendered on language switch, so dots are queried each frame. */
    if(xp){
      const r=xp.firstElementChild.getBoundingClientRect(),reach=vh*.6;
      xp.style.setProperty('--p',clamp((reach-r.top)/r.height).toFixed(4));
      xp.querySelectorAll('.xrow__dot').forEach(d=>d.classList.toggle('lit',d.getBoundingClientRect().top+6<reach));
    }

    /* CTA title grows into place */
    if(ctaTitle){const t=clamp(enter(ctaTitle,vh)*1.3);ctaTitle.style.transform=`scale(${.82+.18*t})`}
  }

  let ticking=false;
  const onScroll=()=>{if(!ticking){ticking=true;requestAnimationFrame(()=>{update();ticking=false})}};
  if(lenis)lenis.on('scroll',onScroll);
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll);
  update();
})();
