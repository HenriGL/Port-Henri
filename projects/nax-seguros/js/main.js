/* NAX Seguros — interações e animações */
(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Split do título do hero em palavras ---------- */
  $$('.split').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => {
      const accent = /protegido/i.test(w) ? ' class="accent"' : '';
      return `<span class="word" aria-hidden="true"><span style="--w:${i}"${accent}>${w}</span></span>`;
    }).join(' ');
  });

  /* ---------- Intro ---------- */
  body.classList.add('is-loading');
  const start = () => {
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
    const chip = $('.price-chip');
    if (chip && !reduceMotion) setTimeout(() => chip.classList.add('is-floating'), 2400);
  };
  const minIntro = reduceMotion ? 0 : 1300;
  const t0 = performance.now();
  const onLoad = () => setTimeout(start, Math.max(0, minIntro - (performance.now() - t0)));
  if (document.readyState === 'complete') onLoad();
  else window.addEventListener('load', onLoad, { once: true });
  setTimeout(start, 4000); // garantia caso alguma imagem demore

  /* ---------- Header, progresso, voltar ao topo ---------- */
  const header = $('.header');
  const progress = $('.progress span');
  const toTop = $('.to-top');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('is-scrolled', y > 20);
    const navOpen = $('.nav').classList.contains('is-open');
    header.classList.toggle('is-hidden', !navOpen && y > 400 && y > lastY);
    toTop.classList.toggle('is-visible', y > 800);
    lastY = y;

    // parallax suave no hero
    if (!reduceMotion && y < window.innerHeight * 1.2) {
      $$('.hero .blob').forEach((b, i) => b.style.translate = `0 ${y * (0.15 + i * 0.08)}px`);
      const content = $('.hero__content');
      if (content) content.style.translate = `0 ${y * 0.12}px`;
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Reveal ao rolar ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Contadores de preço ---------- */
  const fmtFor = el => {
    const d = el.dataset.decimals ? Number(el.dataset.decimals) : 2;
    return n => n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  };
  const countUp = el => {
    const target = parseFloat(el.dataset.count);
    const fmt = fmtFor(el);
    if (reduceMotion) { el.textContent = fmt(target); return; }
    const dur = 1400;
    const t = performance.now();
    const step = now => {
      const p = Math.min(1, (now - t) / dur);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = el.closest('.price-chip') ? 1500 : 250;
        setTimeout(() => countUp(el), delay);
        countObs.unobserve(el);
      }
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => { el.textContent = fmtFor(el)(0); countObs.observe(el); });

  /* ---------- FAQ (accordion: um item aberto por vez) ---------- */
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    const btn = $('.faq-item__header', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        $('.faq-item__header', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  /* ---------- Menu mobile ---------- */
  const burger = $('.burger');
  const nav = $('#nav');
  const closeNav = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menu');
    body.style.overflow = '';
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    body.style.overflow = open ? 'hidden' : '';
  });
  $$('a', nav).forEach(a => a.addEventListener('click', closeNav));

  /* ---------- Dropdown Central de Ajuda (clique/teclado) ---------- */
  const dd = $('.nav__dropdown');
  const ddBtn = $('button', dd);
  ddBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = !dd.classList.contains('is-open');
    dd.classList.toggle('is-open', open);
    ddBtn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', e => {
    if (!dd.contains(e.target)) { dd.classList.remove('is-open'); ddBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Busca ---------- */
  const search = $('.search');
  const searchInput = $('input', search);
  const openSearch = () => { search.classList.add('is-open'); setTimeout(() => searchInput.focus(), 150); };
  const closeSearch = () => search.classList.remove('is-open');
  $('[data-search-open]').addEventListener('click', openSearch);
  $('[data-search-close]').addEventListener('click', closeSearch);
  search.addEventListener('click', e => { if (e.target === search) closeSearch(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeSearch(); closeNav(); dd.classList.remove('is-open'); }
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault(); openSearch();
    }
  });

  /* ---------- Link ativo no menu conforme seção ---------- */
  const navMap = { vantagens: $('.nav a[href="#vantagens"]'), planos: $('.nav a[href="#planos"]') };
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const link = navMap[e.target.id];
      if (link) link.classList.toggle('is-active', e.isIntersecting);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  Object.keys(navMap).forEach(id => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

  if (reduceMotion) return;

  /* ---------- Partículas no hero ---------- */
  const canvas = $('.hero__particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = $('.hero');
    let w, h, dots = [], running = true;
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.offsetWidth; h = hero.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 16000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.6
      }));
    };
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        const mdx = d.x - mouse.x, mdy = d.y - mouse.y, md = Math.hypot(mdx, mdy);
        if (md < 120) { d.x += mdx / md * 1.2; d.y += mdy / md * 1.2; }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(140, 200, 255, .55)';
        ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j];
          const dist = Math.hypot(d.x - o.x, d.y - o.y);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(92, 181, 255, ${0.14 * (1 - dist / 120)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    new IntersectionObserver(([e]) => {
      const was = running; running = e.isIntersecting;
      if (running && !was) draw();
    }).observe(hero);
    draw();
  }

  if (!finePointer) return;

  /* ---------- Tilt 3D na imagem do hero ---------- */
  const media = $('[data-tilt]');
  if (media) {
    const img = $('.hero__image', media);
    media.addEventListener('pointermove', e => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      img.style.transform = `rotateY(${(px - 0.5) * 10}deg) rotateX(${(0.5 - py) * 10}deg) scale(1.02)`;
      img.style.setProperty('--mx', `${px * 100}%`);
      img.style.setProperty('--my', `${py * 100}%`);
    });
    media.addEventListener('pointerleave', () => { img.style.transform = ''; });
  }

  /* ---------- Tilt leve nos planos ---------- */
  $$('.plan').forEach(card => {
    card.addEventListener('pointermove', e => {
      if (!card.classList.contains('is-visible')) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * 6}deg) rotateX(${-py * 6}deg) translateY(-8px)`;
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });

  /* ---------- Spotlight nos cards de vantagem e CTA ---------- */
  $$('.feature, .cta__card').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
