/* Montagem do HTML: topo, catálogo, A Jane, estoque e render() */
"use strict";

/* ============ pedaços de interface ============ */
const maskEl = (k, cls="") => `<span class="mask ${cls}" style="--m:url(${ASSETS[k]})" aria-hidden="true"></span>`;
const typeLabel = k => (TYPES.find(t=>t.k===k)||{l:k}).l;
const catLabel = k => (CATS.find(t=>t.k===k)||{l:k}).l;
function bottlesHtml(w, active=-1){
  const b = (w.bottles||[]).filter(x => x.photo);
  if(!b.length) return `<div class="bottles"><span class="ph"></span></div>`;
  const n = Math.min(b.length, 4);
  return `<div class="bottles n${n}">${b.slice(0,4).map((x,i) => `<img src="${x.photo}" alt="${esc(w.name+(x.label?" — "+x.label:""))}" class="${active>-1&&i!==active?"dim":""}" loading="lazy" decoding="async">`).join("")}</div>`;
}
const priceHtml = w => priceOf(w)==null ? `<span class="price ask">Consulte</span>` : `<span class="price"><small>R$</small>${brl(w.price)}</span>`;
// Card vertical (referência do Figma): a garrafa sai pelo topo do card; embaixo o nome, o volume e o preço
function cardHtml(w, i=0, lead=false){
  const out = wineOut(w);
  const nb = (w.bottles||[]).length;
  const p = priceOf(w);
  const [int, cents] = p==null ? [] : Number(p).toFixed(2).split(".");
  const note = out ? "" : nb>1 ? `${nb} opções` : (w.pick && ui.shelf!=="picks" ? "Indicação da Jane" : "");
  return `<article class="spec ${out?"out":""} ${lead?"lead":""} ${ui.reveal?"rv":""}" style="--d:${(i%4)*70}ms" data-act="open" data-id="${w.id}" tabindex="0" role="button" aria-label="${esc(w.name)}${out?", esgotado":p!=null?", R$ "+brl(w.price):""}">
    <div class="tile">
      ${w.country ? `<span class="flag" title="${esc(countryName(w.country))}">${flagSvg(w.country)}</span>` : ""}
      ${bottlesHtml(w)}
    </div>
    <div class="spec-t">
      <h3 title="${esc(w.name)}">${esc(w.name)}</h3>
      <div class="spec-foot">
        <div class="spec-meta">${w.volume ? `<span class="pill">${esc(String(w.volume).replace(/\s*m\s*l\s*$/i," ml"))}</span>` : ""}${note ? `<span class="pill ${w.pick&&nb<2?"pick":""}">${note}</span>` : ""}<span class="leader" aria-hidden="true"></span></div>
        ${out ? `<p class="pricebox soldout">Esgotado</p>` : p==null ? `<p class="pricebox ask">Consulte</p>` : `<p class="pricebox"><small>R$</small><b>${Number(int).toLocaleString("pt-BR")}</b><small>,${cents}</small></p>`}
      </div>
    </div>
    ${ui.editMode ? `<div class="edit-tools"><button data-act="edit" data-id="${w.id}">Editar</button><button data-act="toggle-out" data-id="${w.id}" class="${out?"":"on-out"}">${out?"Disponível":"Esgotou"}</button>${stockBadge(w)}</div>` : ""}
  </article>`;
}

// Filtros em lista: cada grupo abre e fecha; cada opção é uma linha com caixa, rótulo e contagem
function filtersHtml(){
  const all = wines();
  const typesPresent = TYPES.filter(t => all.some(w => (w.types||[]).includes(t.k)));
  const catsPresent = CATS.filter(c => all.some(w => (w.categories||[]).includes(c.k)));
  const byCount = (a,b) => b[1]-a[1] || a[0].localeCompare(b[0],"pt-BR");
  const grapesAll = Object.entries(all.flatMap(w => w.grapes||[]).reduce((o,g)=>(o[g]=(o[g]||0)+1,o),{})).sort(byCount).map(e=>e[0]);
  const grapes = ui.allGrapes ? grapesAll.slice().sort((a,b)=>a.localeCompare(b,"pt-BR")) : grapesAll.filter((g,i)=>i<8 || ui.grapes.has(g));
  const countries = [...new Set(all.map(w => countryName(w.country)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  const opt = (key, val, label, extra="") => {
    const on = ui[key].has(val); const n = facetCount(key, val);
    return `<button class="fopt" role="checkbox" aria-checked="${on}" data-act="facet" data-key="${key}" data-val="${esc(val)}" ${!on&&!n?"disabled":""}><span class="box" aria-hidden="true"></span><span class="fl">${extra}${esc(label)}</span><span class="n">${n}</span></button>`;
  };
  const presetOn = p => ui.pmin===p.a && ui.pmax===p.b;
  const sortHtml = `<div class="fsort field"><label for="sort2">Ordem</label><select id="sort2" class="sortsel" data-input="sort">
      <option value="desc" ${ui.sort==="desc"?"selected":""}>Maior preço</option><option value="asc" ${ui.sort==="asc"?"selected":""}>Menor preço</option><option value="az" ${ui.sort==="az"?"selected":""}>Nome (A–Z)</option></select></div>`;
  const group = (g, title, sel, body) => {
    const open = ui.fopen.has(g);
    return `<div class="fgrp ${open?"open":""}">
      <h3><button class="fgrp-h" aria-expanded="${open}" aria-controls="fg-${g}" data-act="fgroup" data-g="${g}"><span>${title}</span>${sel?`<span class="fsel">${sel}</span>`:""}<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button></h3>
      <div class="fgrp-b" id="fg-${g}"><div class="fgrp-in">${body}</div></div>
    </div>`;
  };
  const nsel = set => set.size ? `${set.size} ${set.size===1?"marcado":"marcados"}` : "";
  const priceSel = ui.pmin!=null||ui.pmax!=null ? `${ui.pmin!=null?"R$ "+ui.pmin:"R$ 0"}–${ui.pmax!=null?"R$ "+ui.pmax:"…"}` : "";
  return `${sortHtml}
  ${group("price", "Preço", priceSel, `
    ${PRICE_PRESETS.map((p,i)=>`<button class="fopt" role="radio" aria-checked="${presetOn(p)}" data-act="preset" data-i="${i}"><span class="box round" aria-hidden="true"></span><span class="fl">${p.l}</span></button>`).join("")}
    <div class="prange">
      <label><span class="sr">Preço mínimo</span><input id="pmin" inputmode="numeric" placeholder="R$ mín." value="${ui.pmin??""}" data-input="pmin"></label>
      <span>até</span>
      <label><span class="sr">Preço máximo</span><input id="pmax" inputmode="numeric" placeholder="R$ máx." value="${ui.pmax??""}" data-input="pmax"></label>
    </div>`)}
  ${group("types", "Tipo de vinho", nsel(ui.types), typesPresent.map(t=>opt("types",t.k,t.l,`<span class="dot" style="--c:var(--t-${t.k})"></span>`)).join(""))}
  ${group("cats", "Categoria", nsel(ui.cats), catsPresent.map(c=>opt("cats",c.k,c.l)).join(""))}
  ${group("countries", "País", nsel(ui.countries), countries.map(c=>opt("countries",c,c,`<span class="flag-s">${flagSvg(c)}</span>`)).join(""))}
  ${group("grapes", "Uva", nsel(ui.grapes), grapes.map(g=>opt("grapes",g,g)).join("") + (grapesAll.length>8 ? `<button class="linkbtn" data-act="allgrapes">${ui.allGrapes?"Mostrar só as mais comuns":`Ver todas as ${grapesAll.length} uvas`}</button>` : ""))}
  <button class="fopt solo" role="checkbox" aria-checked="${ui.hideOut}" data-act="toggle-hideout"><span class="box" aria-hidden="true"></span><span class="fl">Ocultar esgotados</span></button>`;
}

function activeChips(){
  const out = [];
  ui.types.forEach(v => out.push(["types",v,typeLabel(v)]));
  ui.cats.forEach(v => out.push(["cats",v,catLabel(v)]));
  ui.countries.forEach(v => out.push(["countries",v,v]));
  ui.grapes.forEach(v => out.push(["grapes",v,v]));
  let html = out.map(([k,v,l]) => `<button class="active" data-act="facet" data-key="${k}" data-val="${esc(v)}" aria-label="Remover filtro ${esc(l)}">${esc(l)}</button>`).join("");
  if(ui.pmin!=null || ui.pmax!=null) html += `<button class="active" data-act="clear-price">${ui.pmin!=null?"R$ "+ui.pmin:"R$ 0"}–${ui.pmax!=null?"R$ "+ui.pmax:"∞"}</button>`;
  if(ui.hideOut) html += `<button class="active" data-act="clear-out">Sem esgotados</button>`;
  return html;
}

function updatedLabel(){
  const d = live().updatedAt; if(!d) return "";
  const dt = new Date(d+"T12:00:00");
  return isNaN(dt) ? "" : dt.toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"});
}

function headerHtml(){
  return `<div class="topbar"><div class="brand-row">${brandHtml()}</div></div>${ui.tab==="vinhos" ? heroHtml() : ""}`;
}

const brandHtml = () => `<span class="logo mask" style="--m:url(${ASSETS.logo})" role="img" aria-label="Jane Vinhos — personal sommelière"></span>
  <span class="brand-line" aria-hidden="true"></span>
  <nav class="tabs" aria-label="Seções do site">
    <button class="tab" aria-current="${ui.tab==="vinhos"?"page":"false"}" data-act="tab" data-tab="vinhos">Vinhos</button>
    <button class="tab" aria-current="${ui.tab==="jane"?"page":"false"}" data-act="tab" data-tab="jane">A Jane</button>
  </nav>`;
// Topo da aba Vinhos: no painel bordô com o desenho das taças, o título e a busca
function heroHtml(){
  return `<header class="hero">
    <div class="dock-in" style="--tacas:url(${ASSETS.tacas})">
      <h1>Catálogo de Vinhos</h1>
      <div class="search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <label for="q" class="sr">Buscar vinho</label>
        <input id="q" type="search" placeholder="Buscar por nome, uva, país ou prato" value="${esc(ui.q)}" data-input="q" autocomplete="off"></div>
    </div>
  </header>`;
}
function adminbarHtml(){
  if(!ui.canEdit) return "";
  const d = dirty();
  return `<div class="adminbar"><div class="wrap gut">
    <span class="lbl">${maskEl("brilhos")}Área da Jane</span>
    <button class="switch" aria-pressed="${ui.editMode}" data-act="editmode"><i></i>Modo edição</button>
    ${ui.editMode ? `
      <button class="abtn" data-act="new">+ Novo vinho</button>
      <button class="abtn" data-act="import">Importar da Casa Flora</button>
      <button class="abtn ${ui.tab==="estoque"?"on":""}" data-act="tab" data-tab="estoque">Estoque</button>
      <button class="abtn" data-act="settings">Contato e “Sobre”</button>
      <button class="abtn" data-act="discard" ${d?"":"disabled"}>Descartar</button>
      <button class="abtn primary" data-act="publish" ${d?"":"disabled"}>${d?"Publicar alterações":"Tudo publicado"}</button>
      ${ui.readOnlyNote ? `<span class="adminnote">${esc(ui.readOnlyNote)}</span>` : (d ? `<span class="adminnote">As alterações só aparecem para os clientes depois de “Publicar alterações”.</span>` : "")}
    ` : ""}
  </div></div>`;
}

const pairList = w => String(w.pairing||"").replace(/^harmoniza com\s*/i,"").replace(/[.]\s*$/,"").split(/\s*[,;·]\s*|\s+e\s+(?=[A-ZÁÉÍÓÚ])/).map(t=>t.trim()).filter(Boolean).map(t=>t[0].toUpperCase()+t.slice(1));
const countHtml = (list, total, avail, ac) => `<b>${list.length}</b> ${list.length===1?"vinho":"vinhos"}${ac||ui.q?` de ${total}`:` · ${avail} disponíveis`}`;
function catalogHtml(){
  const list = sorted(wines().filter(w => matches(w)));
  const total = wines().length, avail = wines().filter(w=>!wineOut(w)).length;
  const ac = activeCount();
  const sh = shelves(list);
  const shelfHtml = s => { ui.shelf = s.k;
    const av = s.items.filter(w => !wineOut(w)), outs = s.items.filter(w => wineOut(w));
    const shown = av.length ? av : outs, rest = av.length ? outs : [];
    const lead = false, openOut = ui.outOpen.has(s.k) || ui.editMode; // no modo edição os esgotados ficam à mostra para serem reativados
    const h = `<section class="shelf" id="s-${s.k}" aria-labelledby="sh-${s.k}">
      <div class="shelf-h ${ui.reveal?"rv":""}"><div class="shelf-ht"><h2 id="sh-${s.k}">${s.l}</h2><span class="shelf-n">${s.items.length} ${s.items.length===1?"rótulo":"rótulos"}</span></div>${s.note ? `<p class="shelf-note">${s.note}</p>` : ""}</div>
      <div class="grid ${shown.length===4?"g4":""}">${shown.map((w,i)=>cardHtml(w, i, lead && i===0)).join("")}</div>
      ${rest.length ? `<button class="outs-t" data-act="outs" data-shelf="${s.k}" aria-expanded="${openOut}" aria-controls="o-${s.k}">${openOut?"Esconder":"Mostrar"} ${rest.length} ${rest.length===1?"esgotado":"esgotados"}</button>
      <div class="grid outs" id="o-${s.k}" ${openOut?"":"hidden"}>${openOut ? rest.map((w,i)=>cardHtml(w, i+1)).join("") : ""}</div>` : ""}
    </section>`; ui.shelf = null; return h; };
  return `
  <div class="toolbar"><div class="wrap gut">
    <button class="tool-btn filters-open" data-act="filters">Filtros${ac?` <span class="badge">${ac}</span>`:""}</button>
    <label for="sort" class="sr">Ordenar</label>
    <select id="sort" class="sortsel" data-input="sort">
      <option value="desc" ${ui.sort==="desc"?"selected":""}>Maior preço</option>
      <option value="asc" ${ui.sort==="asc"?"selected":""}>Menor preço</option>
      <option value="az" ${ui.sort==="az"?"selected":""}>Nome (A–Z)</option>
    </select>
  </div></div>
  <main class="gut"><div class="wrap layout">
    <aside class="filters" aria-label="Filtros">
      <p class="fcount">${countHtml(list, total, avail, ac)}</p>
      ${ui.sheet && ui.sheet.kind==="filters" ? "" : filtersHtml()}
      ${ac ? `<button class="linkbtn" data-act="clear">Limpar filtros</button>` : ""}
    </aside>
    <div class="shelfs" aria-live="polite">
      ${ac ? `<div class="resultbar"><span class="count">${countHtml(list, total, avail, ac)}</span>${activeChips()}</div>` : ""}
      ${ui.editMode ? `<button class="addcard" data-act="new"><b>+</b>Novo vinho</button>` : ""}
      ${sh.map(shelfHtml).join("") || `<div class="empty"><img src="${ASSETS.bottle}" alt=""><h2>Nenhum vinho encontrado</h2><p>Tente tirar algum filtro ou buscar por outro nome.</p>${ac||ui.q?`<button class="btn ghost" data-act="clear">Limpar filtros e busca</button>`:""}</div>`}
    </div>
  </div></main>`;
}

const DEFAULT_PAY = "Pix\nDinheiro\nCartão de crédito (até 2x)\nLink de pagamento";
const payList = () => String(settings().payments ?? DEFAULT_PAY).split(/\n+/).map(t=>t.trim()).filter(Boolean);
const PAY_IC = {
  pix:'<path d="M12 3l3.5 3.5L12 10 8.5 6.5zM12 14l3.5 3.5L12 21l-3.5-3.5zM3 12l3.5-3.5L10 12l-3.5 3.5zM14 12l3.5-3.5L21 12l-3.5 3.5z"/>',
  dinheiro:'<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>',
  cartao:'<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 9.5h19M6 15h4"/>',
  link:'<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  outro:'<circle cx="12" cy="12" r="8.5"/><path d="M9 12l2 2 4-4"/>'
};
function payIcon(t){
  const n = norm(t);
  const k = n.includes("pix") ? "pix" : /dinheiro|especie/.test(n) ? "dinheiro" : /cartao|credito|debito/.test(n) ? "cartao" : n.includes("link") ? "link" : "outro";
  return `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${PAY_IC[k]}</svg>`;
}
function payHtml(){
  const l = payList(); if(!l.length) return "";
  return `<section class="pay" aria-labelledby="pay-h"><h3 id="pay-h">Formas de pagamento</h3><ul>${l.map(t=>`<li>${payIcon(t)}<span>${esc(t)}</span></li>`).join("")}</ul></section>`;
}
function aboutHtml(){
  const s = settings();
  const wa = waDigits(s.whatsapp);
  const ig = String(s.instagram||"").replace(/^@/,"").trim();
  const paras = String(s.about||"").split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("");
  return `<main class="gut"><div class="wrap about">
    <div class="about-art">${s.photo ? `<img src="${s.photo}" alt="Jane">` : `<img src="${ASSETS.jane}" alt="Ilustração da Jane brindando com uma taça de vinho">${maskEl("brilhos","b1")}`}
      ${ui.editMode ? `<div class="art-edit"><label for="about-photo">${s.photo?"Trocar foto":"Colocar foto da Jane"}<input type="file" accept="image/*" id="about-photo" class="sr"></label>${s.photo?`<button data-act="aboutphotodel">Voltar para a ilustração</button>`:""}</div>` : ""}</div>
    <div class="about-txt">
      <span class="eyebrow">Personal sommelière${s.city?" · "+esc(s.city):""}</span> <!-- taste-skill-ignore: etiqueta mantida por decisão da marca -->
      <h2>${esc(s.aboutTitle||"Oi, eu sou a Jane")}</h2>
      ${paras}
      <ol class="how">
        <li><span><b>Escolha no catálogo</b>Use os filtros de preço, uva, país e tipo.</span></li>
        <li><span><b>Monte sua lista</b>Toque no vinho, escolha a opção e a quantidade.</span></li>
        <li><span><b>Envie o pedido</b>${wa?"Sua lista vai pronta para o meu WhatsApp.":"Copie a lista e me mande pelo WhatsApp."}</span></li>
      </ol>
      ${payHtml()}
      <div class="contacts">
        ${wa ? `<a class="btn" href="https://wa.me/${wa}?text=${encodeURIComponent("Olá, Jane! Vim pelo catálogo.")}" target="_blank" rel="noopener">Conversar no WhatsApp</a>` : ""}
        ${ig ? `<a class="btn ghost" href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener">@${esc(ig)}</a>` : ""}
        <button class="btn ghost" data-act="tab" data-tab="vinhos">Ver os vinhos</button>
      </div>
      ${wa ? `<span class="contact-line">WhatsApp: <b>${esc(fmtPhone(s.whatsapp))}</b></span>` : ""}
    </div>
  </div></main>`;
}

function bagBarHtml(){
  const n = bag.reduce((a,b)=>a+b.qty,0);
  if(!n || ui.tab!=="vinhos" && ui.tab!=="jane") return "";
  return `<div class="bagbar"><button data-act="bag"><span>Meu pedido · ${n} ${n===1?"garrafa":"garrafas"}</span><span class="total">R$ ${brl(bagTotal())}</span></button></div>`;
}

/* ============ estoque (só no modo edição) ============ */
function stockRows(){
  const rows = [];
  wines().forEach(w => {
    const n = isMulti(w) ? w.bottles.length : 1;
    for(let i=0;i<n;i++){ const b = (w.bottles||[])[i]||{}; rows.push({w, i, name: optName(w,i), photo: b.photo, stock: stockOf(w,i), off: w.status==="esgotado" || b.status==="esgotado"}); }
  });
  return rows;
}
function stockState(r){ if(r.stock==null) return ["none","Sem contagem"]; if(r.stock===0) return ["out","Sem estoque"]; if(r.stock<=3) return ["low","Estoque baixo"]; return ["ok","Em estoque"]; }
function stockBadge(w){
  if(!ui.editMode) return "";
  const n = isMulti(w) ? w.bottles.length : 1; let tot = 0, any = false;
  for(let i=0;i<n;i++){ const st = stockOf(w,i); if(st!=null){ any = true; tot += st; } }
  return any ? `<span class="sbadge ${tot===0?"out":tot<=3?"low":""}" title="Garrafas em estoque">${tot} un.</span>` : "";
}
function logStock(w, i, d, kind, note){
  if(!d) return; ensureDraft();
  const L = DRAFT.stockLog = DRAFT.stockLog || [];
  const now = Date.now(), last = L[0];
  if(kind==="ajuste" && last && last.kind==="ajuste" && last.id===w.id && last.i===i && now - Date.parse(last.t) < 180000){ last.d += d; last.t = new Date(now).toISOString(); if(!last.d) L.shift(); }
  else L.unshift({t: new Date(now).toISOString(), id: w.id, i, name: optName(w,i), d, kind, note: note||""});
  if(L.length > 200) L.length = 200;
}
function stockHtml(){
  const all = stockRows();
  const q = norm(ui.sq||""), f = ui.sf || "all";
  const list = all.filter(r => (!q || norm(r.name).includes(q)) && (f==="all" || stockState(r)[0]===f));
  const sum = all.reduce((a,r)=>a+(r.stock||0),0);
  const cnt = k => all.filter(r => stockState(r)[0]===k).length;
  const tile = (k, n, l) => `<button class="stile ${k} ${f===k?"on":""}" data-act="sfilter" data-f="${f===k?"all":k}"><b>${n}</b><span>${l}</span></button>`;
  const log = (live().stockLog||[]).slice(0,30);
  const fmt = t => { const d = new Date(t); return isNaN(d) ? "" : d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); };
  return `<main class="gut"><div class="wrap stock">
    <div class="stock-head">
      <div><h2>Estoque</h2><p class="hint" style="margin:4px 0 0;max-width:60ch">Controle quantas garrafas a Jane tem de cada vinho. Quando um item chega a zero, ele aparece como esgotado no catálogo. Os pedidos chegam pelo WhatsApp: cole a mensagem em “Dar baixa de um pedido” para descontar do estoque.</p></div>
      <div class="stock-actions"><button class="btn" data-act="orderin">Dar baixa de um pedido</button>${dirty()?`<button class="btn ghost" data-act="publish">Publicar alterações</button>`:""}</div>
    </div>
    <div class="stiles">
      <div class="stile total"><b>${sum}</b><span>garrafas em estoque</span></div>
      ${tile("low", cnt("low"), "com estoque baixo (até 3)")}
      ${tile("out", cnt("out"), "sem estoque")}
      ${tile("none", cnt("none"), "ainda sem contagem")}
    </div>
    <div class="stock-tools">
      <label class="field" for="sq" style="flex:1;min-width:200px"><span class="sr">Buscar no estoque</span><input id="sq" type="search" data-input="sq" value="${esc(ui.sq||"")}" placeholder="Buscar vinho ou uva"></label>
      ${f!=="all" ? `<button class="linkbtn" data-act="sfilter" data-f="all">Mostrar todos</button>` : ""}
    </div>
    <div class="slist">
      ${list.map(r => { const [k,l] = stockState(r); const key = r.w.id+":"+r.i; return `<div class="srow">
        ${r.photo?`<img src="${r.photo}" alt="">`:`<span class="sph"></span>`}
        <div class="sname"><b>${esc(r.name)}</b><span>${priceOf(r.w)!=null?`R$ ${brl(priceOf(r.w))}`:"Consulte"}${r.off?" · marcado como esgotado":""}</span></div>
        <span class="spill ${k}">${l}</span>
        <div class="sctl">
          <button data-act="sstep" data-k="${key}" data-d="-1" aria-label="Tirar uma garrafa de ${esc(r.name)}" ${!r.stock?"disabled":""}>−</button>
          <input type="number" min="0" inputmode="numeric" id="sk-${key.replace(":","-")}" data-sk="${key}" value="${r.stock??""}" placeholder="—" aria-label="Garrafas de ${esc(r.name)}">
          <button data-act="sstep" data-k="${key}" data-d="1" aria-label="Somar uma garrafa de ${esc(r.name)}">+</button>
        </div>
      </div>`; }).join("") || `<p class="hint">Nenhum item encontrado.</p>`}
    </div>
    <section class="slog"><h3>Últimas movimentações</h3>
      ${log.length ? `<ul>${log.map(e => `<li><span class="sd">${fmt(e.t)}</span><span class="sn">${esc(e.name)}</span><span class="sk ${e.kind}">${e.kind==="pedido"?"Pedido":"Ajuste"}</span><b class="${e.d<0?"neg":"pos"}">${e.d>0?"+":""}${e.d}</b></li>`).join("")}</ul>` : `<p class="hint">As baixas de pedidos e os ajustes manuais aparecem aqui.</p>`}
    </section>
  </div></main>`;
}
function findRow(key){ const [id, i] = key.split(":"); const w = byId(id); return w ? {w, i: +i} : null; }

/* --- dar baixa de pedido colado do WhatsApp --- */
function parseOrder(text){
  const cands = stockRows().map(r => ({key: r.w.id+":"+r.i, name: r.name, n: norm(r.name)}));
  const out = [];
  String(text||"").split(/\n/).forEach(line => {
    const m = line.match(/^\s*[•·*\-]?\s*(\d+)\s*[×xX]\s*(.+?)\s*(?:[—–-]+\s*(?:R\$.*|consultar.*))?\s*$/);
    if(!m) return;
    const qty = +m[1], nm = norm(m[2]);
    let hit = cands.find(c => c.n === nm);
    if(!hit){ const inc = cands.filter(c => nm.includes(c.n) || c.n.includes(nm)).sort((a,b)=>b.n.length-a.n.length); hit = inc[0]; }
    out.push({txt: m[2].trim(), qty, key: hit ? hit.key : ""});
  });
  return out;
}
function orderParts(){
  const s = ui.sheet; s.lines = s.lines || [];
  const opts = stockRows().map(r => `<option value="${r.w.id}:${r.i}">${esc(r.name)}${r.stock!=null?` (${r.stock})`:""}</option>`).join("");
  const total = s.lines.filter(l=>l.key).reduce((a,l)=>a+(+l.qty||0),0);
  return {
    title: "Dar baixa de um pedido",
    body: `<div class="form">
      <label class="field" for="ord-txt">Cole a mensagem do pedido que chegou no WhatsApp
        <textarea id="ord-txt" data-input="ordtxt" rows="6" placeholder="Olá, Jane! Quero encomendar:&#10;• 2× Tantehue Merlot — R$ 94" autofocus>${esc(s.text||"")}</textarea>
        <span class="hint">Os itens são reconhecidos sozinhos. Confira abaixo e corrija o vinho ou a quantidade se precisar.</span>
      </label>
      ${s.lines.length ? `<div class="olines">${s.lines.map((l,ix) => `<div class="oline ${l.key?"":"miss"}">
          <span class="otxt">${esc(l.txt)}</span>
          <select data-ol="${ix}" aria-label="Vinho do item ${ix+1}"><option value="">${l.key?"":"Não reconhecido. Escolha o vinho…"}</option>${opts.replace(`value="${l.key}"`,`value="${l.key}" selected`)}</select>
          <input type="number" min="1" data-oq="${ix}" value="${l.qty}" aria-label="Quantidade do item ${ix+1}">
          <button class="xbtn" data-act="oldel" data-i="${ix}" aria-label="Tirar este item">×</button>
        </div>`).join("")}</div>` : ""}
      <button class="linkbtn" data-act="oladd" style="justify-self:start">+ Adicionar item à mão</button>
    </div>`,
    foot: `<button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="ordgo" ${total?"":"disabled"}>${total?`Dar baixa de ${total} ${total===1?"garrafa":"garrafas"}`:"Nenhum item reconhecido"}</button>`
  };
}

/* ============ render ============ */
const app = document.getElementById("app");
function render(){
  const focusId = document.activeElement && document.activeElement.id;
  const selStart = document.activeElement && document.activeElement.selectionStart;
  app.innerHTML = headerHtml() + adminbarHtml() + (ui.tab==="vinhos" ? `<div id="cat">${catalogHtml()}</div>` : ui.tab==="estoque" && ui.editMode ? stockHtml() : aboutHtml()) + footerHtml() + `<div id="bagroot">${bagBarHtml()}</div><div id="sheetroot">${sheetHtml()}</div>`;
  if(focusId){ const el = document.getElementById(focusId); if(el && !ui.sheet){ el.focus(); try{ if(selStart!=null) el.setSelectionRange(selStart, selStart); }catch(e){} } }
  afterSheetRender(); enhance();
}
function renderCat(){
  const c = document.getElementById("cat"); if(!c || ui.sheet) return render();
  const st = scrollY; c.innerHTML = catalogHtml(); scrollTo({top:st}); enhance();
}
// Rodapé: logo à esquerda; à direita os contatos com ícones; embaixo o aviso legal e a assinatura
function footerHtml(){
  const s = settings();
  const wa = waDigits(s.whatsapp);
  const ig = String(s.instagram||"").replace(/^@/,"").trim();
  const ic = k => `<span class="ct-ic"><img src="${ASSETS[k]}" alt="" width="20" height="20"></span>`;
  return `<footer class="site-foot">
    <div class="sf-top">
      <span class="sf-logo mask" style="--m:url(${ASSETS.logo})" role="img" aria-label="Jane Vinhos — personal sommelière"></span>
      <div class="sf-contacts">
        <h2>Dados para Contato</h2>
        <ul>
          ${wa ? `<li><a href="https://wa.me/${wa}?text=${encodeURIComponent("Olá, Jane! Vim pelo catálogo.")}" target="_blank" rel="noopener" aria-label="WhatsApp ${esc(fmtPhone(s.whatsapp))}">${ic("icWhatsapp")}${esc(fmtPhone(s.whatsapp))}</a></li>` : ""}
          ${ig ? `<li><a href="https://instagram.com/${encodeURIComponent(ig)}" target="_blank" rel="noopener" aria-label="Instagram @${esc(ig)}">${ic("icInstagram")}@${esc(ig)}</a></li>` : ""}
          <li><button data-act="tab" data-tab="${ui.tab==="jane"?"vinhos":"jane"}">${ic("icPessoa")}${ui.tab==="jane"?"Ver os vinhos":"Conheça a Jane"}</button></li>
        </ul>
      </div>
    </div>
    <div class="sf-bottom"><p>Venda proibida para menores de 18 anos. Beba com moderação.</p><p>Jane Vinhos · Personal Sommelière</p></div>
  </footer>`;
}
