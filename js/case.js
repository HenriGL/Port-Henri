/* =========================================================
   Case modal — full-screen case study that slides up from the
   project card (Figma "Case Modal — NAX Seguros"). Rendered from
   data so it follows the PT / EN switch like the other lists.
   ========================================================= */
const CASE_IMG='assets/cases/nax/';

const CASES={
  nax:{
    pt:{
      label:"Case 01 · NAX Seguros",close:"Fechar",back:"Voltar aos projetos ↑",
      chip:"Landing page + fluxo de contratação",heroAlt:"Hero da landing NAX Seguros",
      title:"NAX Seguros",
      meta:[["Papel","UX/UI Designer"],["Contexto","Case UX/UI · processo seletivo"],["Segmento","Seguros · residencial"],["Entregas","Landing page, simulação em 3 passos e Design System"]],
      lead:"A NAX é uma seguradora focada em seguro residencial. Neste case desenhei a landing page e o fluxo de simulação e contratação de ponta a ponta, da arquitetura da informação ao design system.",
      intro:"O objetivo era fazer quem chega pela landing comparar planos com facilidade e contratar sem atrito: preço visível desde o primeiro scroll, coberturas explicadas em linguagem simples e um fluxo de 3 passos, sem cadastro e sem vistoria.",
      tags:["Landing Page","UX/UI","Design System","Fluxo de contratação"],
      flow:{t:"Da landing à contratação",d:"Cinco telas que levam o visitante da primeira dobra até a apólice emitida. Cada passo mostra só o que é preciso para decidir.",
        screens:[["landing","Landing","Hero, planos, vantagens, avaliações e FAQ"],["imovel","Seu imóvel","CEP, tipo de imóvel e uso"],["coberturas","Coberturas","Plano + coberturas adicionais"],["preco","Preço e contratação","Dados, endereço e pagamento"],["confirmacao","Confirmação","Resumo da apólice e próximos passos"]]},
      journey:{t:"Arquitetura e jornada",d:"Como a informação foi organizada na landing e como o visitante avança da comparação de planos até a apólice.",
        rows:[["Landing",[["entry","Hero"],["step","Planos"],["step","Vantagens"],["step","Avaliações"],["step","FAQ"],["step","CTA final"]],true],
              ["Simulação",[["entry","Simular online"],["step","1 · Seu imóvel"],["step","2 · Coberturas"],["step","3 · Preço e contratação"],["done","Apólice emitida"]],true],
              ["Canais de apoio",[["help","Falar com corretor"],["help","WhatsApp em cada passo"],["help","Área do Cliente"],["help","Baixar apólice (PDF)"]],false]],
        legend:[["entry","Ponto de entrada"],["step","Seção ou etapa"],["done","Sucesso"],["help","Canal de ajuda"]],
        decisions:[["Preço desde a primeira dobra","O selo “Planos a partir de R$ 19,90/mês” e os cards de plano respondem a pergunta principal antes de qualquer clique."],
                   ["Plano recomendado em destaque","O Prático ganha borda, selo e botão sólido, o que reduz a dúvida de quem compara três opções lado a lado."],
                   ["Resumo sempre à vista","Na simulação, a coluna lateral mostra o total mensal atualizado a cada escolha, com ajuda pelo WhatsApp por perto."]]},
      ui:{t:"Interfaces",d:"Telas finais da landing e do fluxo de contratação, construídas com os componentes do design system.",
        tabs:[["Landing","landing-full","nax.com.br/seguro-residencial"],["Planos","planos","nax.com.br/seguro-residencial#planos"],["Simulação","simulacao-full","nax.com.br/simulacao/coberturas"],["Confirmação","confirmacao-full","nax.com.br/simulacao/confirmacao"]],
        live:"Abrir a landing ao vivo"},
      visual:{t:"Linguagem visual",d:"O design system da NAX: azul para confiança e ação, navy para peso institucional e muito respiro em superfícies claras.",
        type:"Tipografia",pair:"Poppins + Inter",pairD:"Poppins nos títulos e botões, Inter no texto corrido",
        scale:[["Display","Poppins SemiBold · 56/64"],["H1","Poppins SemiBold · 44/52"],["H2","Poppins SemiBold · 36/44"],["H3","Poppins SemiBold · 24/32"],["H4","Poppins SemiBold · 20/28"],["Preço","Poppins Bold · 44/48"],["Body large","Inter Regular · 18/28"],["Body","Inter Regular · 16/24"],["Body small","Inter Regular · 14/20"],["Caption","Inter Medium · 12/16"]],
        main:"Paleta principal",neutral:"Neutros e superfícies",
        palette:[["#037FF7","Blue 500 · brand"],["#0A6AD8","Blue 700 · ação"],["#0649C9","Blue 800 · forte"],["#232F3F","Navy 900 · texto"]],
        neutrals:[["#EEF6FF","Blue 50 · fundo"],["#E5E7EB","Gray 200 · borda"],["#6B7280","Gray 500 · apoio"],["#FFFFFF","White · superfície"]],
        tokens:"Tokens",spacing:"Espaçamento",radius:"Raio",components:"Componentes"},
      did:{t:"O que eu fiz",items:["Arquitetura da informação da landing e do fluxo de simulação em 3 passos.","Comparativo de planos com preço visível e plano recomendado em destaque.","Fluxo de contratação sem cadastro e sem vistoria, com resumo do pedido sempre à vista.","Design System com tokens de cor, espaçamento, raio e tipografia (Poppins + Inter).","Biblioteca de componentes: botões, badges, campos, opções, stepper e linhas de cobertura.","Tela de confirmação com resumo da apólice e próximos passos claros."]}
    },
    en:{
      label:"Case 01 · NAX Seguros",close:"Close",back:"Back to projects ↑",
      chip:"Landing page + sign-up flow",heroAlt:"NAX Seguros landing page hero",
      title:"NAX Seguros",
      meta:[["Role","UX/UI Designer"],["Context","UX/UI case · hiring process"],["Industry","Insurance · home"],["Deliverables","Landing page, 3-step quote flow and Design System"]],
      lead:"NAX is an insurer focused on home insurance. In this case I designed the landing page and the quote and sign-up flow end to end, from information architecture to the design system.",
      intro:"The goal was to let visitors compare plans easily and sign up without friction: price visible from the first scroll, coverages explained in plain language and a 3-step flow with no account and no inspection.",
      tags:["Landing Page","UX/UI","Design System","Sign-up flow"],
      flow:{t:"From landing to sign-up",d:"Five screens that take the visitor from the first fold to an issued policy. Each step shows only what it takes to decide.",
        screens:[["landing","Landing","Hero, plans, benefits, reviews and FAQ"],["imovel","Your home","ZIP code, property type and use"],["coberturas","Coverages","Plan + add-on coverages"],["preco","Price & sign-up","Details, address and payment"],["confirmacao","Confirmation","Policy summary and next steps"]]},
      journey:{t:"Architecture & journey",d:"How information was organized on the landing page and how visitors move from comparing plans to an issued policy.",
        rows:[["Landing",[["entry","Hero"],["step","Plans"],["step","Benefits"],["step","Reviews"],["step","FAQ"],["step","Final CTA"]],true],
              ["Quote",[["entry","Get a quote"],["step","1 · Your home"],["step","2 · Coverages"],["step","3 · Price & sign-up"],["done","Policy issued"]],true],
              ["Support channels",[["help","Talk to a broker"],["help","WhatsApp at every step"],["help","Customer Area"],["help","Download policy (PDF)"]],false]],
        legend:[["entry","Entry point"],["step","Section or step"],["done","Success"],["help","Help channel"]],
        decisions:[["Price from the first fold","The “Plans from R$ 19.90/month” badge and the plan cards answer the main question before any click."],
                   ["Recommended plan highlighted","Prático gets a border, a badge and a solid button, which eases the doubt of comparing three options side by side."],
                   ["Summary always in view","During the quote, the side column shows the monthly total updated with every choice, with WhatsApp help close by."]]},
      ui:{t:"Interfaces",d:"Final screens of the landing page and the sign-up flow, built with the design system components.",
        tabs:[["Landing","landing-full","nax.com.br/seguro-residencial"],["Plans","planos","nax.com.br/seguro-residencial#planos"],["Quote","simulacao-full","nax.com.br/simulacao/coberturas"],["Confirmation","confirmacao-full","nax.com.br/simulacao/confirmacao"]],
        live:"Open the live landing"},
      visual:{t:"Visual language",d:"The NAX design system: blue for trust and action, navy for institutional weight and plenty of breathing room on light surfaces.",
        type:"Typography",pair:"Poppins + Inter",pairD:"Poppins for headings and buttons, Inter for body copy",
        scale:[["Display","Poppins SemiBold · 56/64"],["H1","Poppins SemiBold · 44/52"],["H2","Poppins SemiBold · 36/44"],["H3","Poppins SemiBold · 24/32"],["H4","Poppins SemiBold · 20/28"],["Price","Poppins Bold · 44/48"],["Body large","Inter Regular · 18/28"],["Body","Inter Regular · 16/24"],["Body small","Inter Regular · 14/20"],["Caption","Inter Medium · 12/16"]],
        main:"Main palette",neutral:"Neutrals & surfaces",
        palette:[["#037FF7","Blue 500 · brand"],["#0A6AD8","Blue 700 · action"],["#0649C9","Blue 800 · strong"],["#232F3F","Navy 900 · text"]],
        neutrals:[["#EEF6FF","Blue 50 · background"],["#E5E7EB","Gray 200 · border"],["#6B7280","Gray 500 · support"],["#FFFFFF","White · surface"]],
        tokens:"Tokens",spacing:"Spacing",radius:"Radius",components:"Components"},
      did:{t:"What I did",items:["Information architecture for the landing page and the 3-step quote flow.","Plan comparison with visible pricing and a highlighted recommended plan.","Sign-up flow with no account and no inspection, with the order summary always in view.","Design System with color, spacing, radius and typography tokens (Poppins + Inter).","Component library: buttons, badges, fields, options, stepper and coverage rows.","Confirmation screen with a policy summary and clear next steps."]}
    }
  }
};
const CASE_SPACING=["4","8","12","16","20","24","32","40","48","64","96","112"];
const CASE_RADIUS=["sm 8","md 12","lg 20","xl 28","full"];
const CASE_COMPONENTS=["Button","Badge","Text Field","Option","Stepper","Coverage Row","Summary Row","Check Item","Feature Card","Testimonial Card","FAQ Item","Header","Footer"];

let caseLang='pt',caseOpen=null,caseReturn=null;

function sectionHead(t,d){
  return `<div class="case__head"><h3 class="case__h"><i class="case__marker" aria-hidden="true"></i>${t}</h3>${d?`<p class="body-m muted">${d}</p>`:''}</div>`;
}
const tagList=a=>a.map(x=>`<span class="tag">${x}</span>`).join('');

function caseMarkup(id,c){
  const v=c.visual,tab0=c.ui.tabs[0];
  return `
  <div class="case__bar">
    <span class="case__label">${c.label}</span>
    <button type="button" class="case__close" data-case-close><span>${c.close}</span><span aria-hidden="true">✕</span></button>
  </div>
  <div class="case__body">
    <header class="case__hero">
      <div class="case__cover">
        <img class="case__shot" src="${CASE_IMG}hero.jpg" alt="${c.heroAlt}" width="1440" height="668">
        <div class="case__chips"><span class="case__chip"><i aria-hidden="true"></i>${c.chip}</span></div>
      </div>
      <h2 class="display-l case__title" id="case-${id}-title">${c.title}</h2>
      <dl class="case__meta">${c.meta.map(m=>`<div><dt>${m[0]}</dt><dd>${m[1]}</dd></div>`).join('')}</dl>
      <div class="case__intro">
        <p class="body-l">${c.lead}</p>
        <p class="body-m muted">${c.intro}</p>
        <div class="tags">${tagList(c.tags)}</div>
      </div>
    </header>

    <section class="case__sec">
      ${sectionHead(c.flow.t,c.flow.d)}
      <ol class="case__screens">${c.flow.screens.map((s,i)=>`
        <li><img src="${CASE_IMG}thumb-${s[0]}.jpg" alt="${s[1]}" loading="lazy" width="600" height="743">
          <span class="case__num">${String(i+1).padStart(2,'0')}</span><strong>${s[1]}</strong><span class="caption muted">${s[2]}</span></li>`).join('')}
      </ol>
    </section>

    <section class="case__sec">
      ${sectionHead(c.journey.t,c.journey.d)}
      <div class="case__map">
        ${c.journey.rows.map(r=>`<div class="case__row"><span class="case__rowlabel">${r[0]}</span><div class="case__nodes">${
          r[1].map((n,i)=>(i&&r[2]?'<span class="case__arrow" aria-hidden="true">→</span>':'')+`<span class="node node--${n[0]}">${n[1]}</span>`).join('')}</div></div>`).join('')}
        <hr>
        <div class="case__legend">${c.journey.legend.map(l=>`<span><i class="key key--${l[0]}" aria-hidden="true"></i>${l[1]}</span>`).join('')}</div>
      </div>
      <div class="case__decisions">${c.journey.decisions.map((d,i)=>`
        <article><span class="case__big">${String(i+1).padStart(2,'0')}</span><h4 class="h4">${d[0]}</h4><p class="body-s muted">${d[1]}</p></article>`).join('')}
      </div>
    </section>

    <section class="case__sec case__sec--ui">
      ${sectionHead(c.ui.t,c.ui.d)}
      <div class="case__tabs" role="tablist">${c.ui.tabs.map((t,i)=>`<button type="button" role="tab" aria-selected="${!i}" data-tab="${i}">${t[0]}</button>`).join('')}</div>
      <div class="case__browser">
        <div class="case__chrome"><i></i><i></i><i></i><a class="case__url" href="projects/nax-seguros/index.html" target="_blank" rel="noopener" title="${c.ui.live}">${tab0[2]}</a></div>
        <div class="case__screen" role="tabpanel" tabindex="0" data-lenis-prevent><img src="${CASE_IMG}${tab0[1]}.jpg" alt="${tab0[0]}" loading="lazy"></div>
      </div>
    </section>

    <section class="case__sec">
      ${sectionHead(v.t,v.d)}
      <div class="case__visual">
        <div class="case__type">
          <span class="case__over">${v.type}</span>
          <span class="case__aa" aria-hidden="true">Aa</span>
          <strong>${v.pair}</strong><span class="caption subtle">${v.pairD}</span>
          <ul>${v.scale.map(s=>`<li><span>${s[0]}</span><span class="caption subtle">${s[1]}</span></li>`).join('')}</ul>
        </div>
        <div class="case__palette">
          <span class="case__over">${v.main}</span>
          <div class="case__swatches">${v.palette.map(p=>`<div style="--c:${p[0]}"><span>${p[0]}</span><span class="caption">${p[1]}</span></div>`).join('')}</div>
          <span class="case__over">${v.neutral}</span>
          <div class="case__swatches case__swatches--light">${v.neutrals.map(p=>`<div style="--c:${p[0]}"${p[0]==='#6B7280'?' class="dark"':''}><span>${p[0]}</span><span class="caption">${p[1]}</span></div>`).join('')}</div>
          <span class="case__over">${v.tokens}</span>
          <div class="case__tokens"><span class="caption muted">${v.spacing}</span>${tagList(CASE_SPACING)}</div>
          <div class="case__tokens"><span class="caption muted">${v.radius}</span>${tagList(CASE_RADIUS)}</div>
          <span class="case__over">${v.components}</span>
          <div class="case__tokens">${tagList(CASE_COMPONENTS)}</div>
        </div>
      </div>
    </section>

    <section class="case__sec">
      ${sectionHead(c.did.t)}
      <ul class="case__did">${c.did.items.map(t=>`<li><span aria-hidden="true">✓</span>${t}</li>`).join('')}</ul>
    </section>

    <footer class="case__foot">
      <span class="case__label">${c.label}</span>
      <button type="button" class="btn btn--primary" data-case-close><span>${c.back}</span></button>
    </footer>
  </div>`;
}

function renderCase(lang){
  caseLang=lang;
  document.querySelectorAll('.case').forEach(el=>{
    const id=el.dataset.case,tab=el.querySelector('[aria-selected="true"]');
    el.innerHTML=caseMarkup(id,CASES[id][lang]||CASES[id].pt);
    if(tab)selectTab(el,+tab.dataset.tab);
  });
}

function selectTab(el,i){
  const t=(CASES[el.dataset.case][caseLang]||CASES[el.dataset.case].pt).ui.tabs[i];
  el.querySelectorAll('[role="tab"]').forEach(b=>b.setAttribute('aria-selected',String(+b.dataset.tab===i)));
  const screen=el.querySelector('.case__screen'),img=screen.querySelector('img');
  img.src=CASE_IMG+t[1]+'.jpg';img.alt=t[0];
  el.querySelector('.case__url').textContent=t[2];
  screen.scrollTop=0;
}

function openCase(id,from){
  const el=document.getElementById('case-'+id);if(!el)return;
  caseOpen=el;caseReturn=from||null;
  el.hidden=false;el.scrollTop=0;
  document.documentElement.classList.add('case-lock');
  if(window.lenis)window.lenis.stop();
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('open');el.focus({preventScroll:true})}));
}

function closeCase(){
  const el=caseOpen;if(!el)return;caseOpen=null;
  el.classList.remove('open');
  const done=()=>{el.hidden=true;document.documentElement.classList.remove('case-lock');if(window.lenis)window.lenis.start();if(caseReturn)caseReturn.focus({preventScroll:true})};
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)done();
  else el.addEventListener('transitionend',function end(e){if(e.target!==el)return;el.removeEventListener('transitionend',end);done()});
}

document.querySelectorAll('[data-case-open]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();openCase(a.dataset.caseOpen,a);
}));
document.addEventListener('click',e=>{
  if(!caseOpen)return;
  if(e.target.closest('[data-case-close]'))closeCase();
  const tab=e.target.closest('.case [role="tab"]');if(tab)selectTab(caseOpen,+tab.dataset.tab);
});
document.addEventListener('keydown',e=>{
  if(!caseOpen)return;
  if(e.key==='Escape')closeCase();
  // Keep keyboard focus inside the dialog
  if(e.key==='Tab'){
    const f=[...caseOpen.querySelectorAll('button,a[href],[tabindex="0"]')];
    if(!f.length)return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});
