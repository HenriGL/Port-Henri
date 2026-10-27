/* Folhas: detalhe do vinho e pedido */
"use strict";

/* ============ folhas: detalhe, filtros, pedido, editor ============ */
function sheetHtml(){
  const s = ui.sheet; if(!s) return "";
  let title = "", body = "", foot = "", narrow = false;
  if(s.kind==="filters"){ title = "Filtros"; body = `<div class="filters">${filtersHtml()}</div>`; foot = `<button class="btn ghost" data-act="clear">Limpar</button><button class="btn" data-act="close">Ver ${wines().filter(w=>matches(w)).length} vinhos</button>`; narrow = true; }
  else if(s.kind==="detail"){ const w = byId(s.id); if(!w){ ui.sheet=null; return ""; } ({title, body, foot} = detailParts(w)); }
  else if(s.kind==="bag"){ ({title, body, foot} = bagParts()); narrow = true; }
  else if(s.kind==="editor"){ ({title, body, foot} = editorParts()); }
  else if(s.kind==="import"){ ({title, body, foot} = importParts()); narrow = true; }
  else if(s.kind==="settings"){ ({title, body, foot} = settingsParts()); narrow = true; }
  else if(s.kind==="publish"){ ({title, body, foot} = publishParts()); narrow = true; }
  else if(s.kind==="orderin"){ ({title, body, foot} = orderParts()); }
  const anim = !s.shownOnce; s.shownOnce = true;
  return `<div class="scrim ${anim?"anim":""}" data-act="close"></div><div class="sheet ${narrow?"narrow":""} ${anim?"anim":""}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-h"><h2>${esc(title)}</h2><button class="xbtn" data-act="close" aria-label="Fechar">×</button></div>
    <div class="sheet-b">${body}</div>${foot?`<div class="sheet-f">${foot}</div>`:""}</div>`;
}
function afterSheetRender(){
  if(!ui.sheet) return;
  if(ui.sheet.kind==="editor") bindEditor();
  if(!ui.sheet.focused){ ui.sheet.focused = true; const f = app.querySelector(".sheet [autofocus]") || app.querySelector(".sheet .xbtn"); f && f.focus({preventScroll:true}); }
}
function openSheet(kind, extra={}){ ui.sheet = {kind, ...extra}; document.documentElement.style.overflow="hidden"; render(); }
function closeSheet(){ ui.sheet = null; document.documentElement.style.overflow=""; render(); }

function detailParts(w){
  const s = ui.sheet; const bottles = w.bottles||[];
  const multi = isMulti(w);
  if(s.qtys==null) s.qtys = {};
  if(s.variant==null) s.variant = multi ? Math.max(0, bottles.findIndex((b,i)=>!optOut(w,i))) : 0;
  if(s.qty==null) s.qty = 1;
  const out = wineOut(w);
  const v = s.variant, vb = bottles[v] || {};
  const grapes = optGrapes(w, v), types = optTypes(w, v);
  const facts = [
    ["País", w.country ? `<span class="flag-s">${flagSvg(w.country)}</span>${esc(countryName(w.country))}` : ""],
    [grapes.length>1?"Uvas":"Uva", esc(grapes.join(", "))],
    ["Tipo", esc(types.map(typeLabel).join(", "))],
    ["Categoria", esc((w.categories||[]).map(catLabel).join(", "))],
    ["Região", esc(w.region||"")], ["Safra", esc(w.vintage||"")], ["Teor alcoólico", esc(w.abv||"")],
    ["Volume", esc(w.volume||"")], ["Servir a", esc(w.serve||"")], ["Harmoniza com", esc(w.pairing||"")],
  ].filter(f => f[1]);
  const wa = waDigits(settings().whatsapp);
  const total = Object.values(s.qtys).reduce((a,n)=>a+n,0);
  const optRows = multi ? `<div class="fgroup">
      <h4 class="opt-h">Opções: escolha quantas de cada</h4>
      <div class="optlist">${bottles.map((b,i)=>{ const off = optOut(w,i), q = s.qtys[i]||0; return `<div class="optrow ${off?"off":""}" data-act="variant" data-i="${i}" aria-current="${i===v}" role="button" tabindex="0">
          ${b.photo?`<img src="${b.photo}" alt="">`:"<span></span>"}
          <div style="min-width:0"><div class="ot">${esc(optLabel(w,i))}</div><div class="os">${off?`<span class="opttag">Esgotada</span>`:esc(optSummary(w,i))}</div></div>
          ${off ? "" : `<div class="qty" data-stop="1"><button data-act="oqty" data-i="${i}" data-d="-1" aria-label="Menos uma ${esc(optLabel(w,i))}" ${q?"":"disabled"}>−</button><output>${q}</output><button data-act="oqty" data-i="${i}" data-d="1" aria-label="Mais uma ${esc(optLabel(w,i))}">+</button></div>`}
        </div>`; }).join("")}</div></div>` : "";
  const desc = multi && vb.desc ? vb.desc : w.description;
  return {
    title: out ? "Esgotado no momento" : "Detalhes do vinho",
    body: `<div class="detail">
      <div class="dphoto ${multi?"multi":""}">${w.country?`<span class="flag">${flagSvg(w.country)}</span>`:""}${multi ? bottlesHtml({...w, bottles:[vb]}) : bottlesHtml(w)}${out?`<span class="stamp">Esgotado</span>`:(multi&&optOut(w,v)?`<span class="stamp">Esgotada</span>`:"")}</div>
      <div class="dinfo">
        ${multi ? `<span class="optlabel">Opção: ${esc(optLabel(w,v))}</span>` : ""}
        <div class="dkind"><span class="dots">${types.map(k=>`<span class="dot" style="--c:var(--t-${k})"></span>`).join("")}</span>${esc(types.map(typeLabel).join(" / "))}${(w.categories||[]).length ? " · "+esc(w.categories.map(catLabel).join(" / ")) : ""}</div>
        <h3>${esc(multi ? optName(w,v) : w.name)}</h3>
        ${w.producer ? `<div class="producer">${esc(w.producer)}</div>` : ""}
        <div class="dprice">${priceHtml(w)}${multi?`<span class="vol">cada garrafa, qualquer opção</span>`:""}</div>
        ${optRows}
        ${desc ? `<p class="desc">${esc(desc)}</p>` : ""}
        ${facts.length ? `<dl class="facts">${facts.map(([k,val])=>`<dt>${k}</dt><dd>${val}</dd>`).join("")}</dl>` : ""}
      </div></div>`,
    foot: out
      ? (wa ? `<a class="btn" href="https://wa.me/${wa}?text=${encodeURIComponent(`Olá, Jane! O ${w.name} vai voltar? Tem alguma sugestão parecida?`)}" target="_blank" rel="noopener">Pedir sugestão parecida</a>` : `<button class="btn ghost" data-act="close">Voltar ao catálogo</button>`)
      : multi
        ? `<button class="btn" data-act="addmulti" ${total?"":"disabled"}>${total ? `Adicionar ${total} ${total===1?"garrafa":"garrafas"} ao pedido` : "Escolha a quantidade de cada opção"}</button>`
        : `<div class="qty"><button data-act="qty" data-d="-1" aria-label="Menos uma">−</button><output>${s.qty}</output><button data-act="qty" data-d="1" aria-label="Mais uma">+</button></div><button class="btn" data-act="add">Adicionar ao pedido</button>`
  };
}

/* pedido */
function bagItems(){ return bag.map(it => { const w = STATE.wines.find(x=>x.id===it.id); return {...it, w, qty: w ? Math.min(it.qty, maxQty(w, it.variant||0)) : it.qty}; }).filter(it => it.w && !optOut(it.w, it.variant||0) && it.qty>0); }
function bagTotal(){ return bagItems().reduce((a,it)=>a+(priceOf(it.w)||0)*it.qty,0); }
function bagText(name){
  const lines = bagItems().map(it => {
    const p = priceOf(it.w);
    return `• ${it.qty}× ${optName(it.w, it.variant||0)}${p!=null?` — R$ ${brl(p*it.qty)}`:" — consultar"}`;
  });
  return `Olá, Jane! ${name?`Aqui é ${name}. `:""}Quero encomendar:\n${lines.join("\n")}\n\nTotal: R$ ${brl(bagTotal())}`;
}
function saveBag(){ LS.set("jv-bag", bag); }
function bagParts(){
  const items = bagItems();
  const wa = waDigits(settings().whatsapp);
  const name = ui.sheet.name || "";
  if(!items.length) return {title:"Meu pedido", body:`<div class="empty"><h3>Seu pedido está vazio</h3><p>Toque em um vinho e escolha “Adicionar ao pedido”.</p></div>`, foot:`<button class="btn" data-act="close">Ver os vinhos</button>`};
  return {
    title: "Meu pedido",
    body: `${items.map((it,ix) => { const v=(it.w.bottles||[])[it.variant]||(it.w.bottles||[])[0]; return `<div class="bagline">
        ${v&&v.photo?`<img src="${v.photo}" alt="">`:"<span></span>"}
        <div style="min-width:0">${isMulti(it.w)?`<span class="optlabel" style="font-size:11px;padding:2px 8px;margin-bottom:4px">${esc(optLabel(it.w,it.variant))}</span>`:""}<div class="t">${esc(optName(it.w, it.variant||0))}</div><div class="s">${isMulti(it.w)&&optSummary(it.w,it.variant)?esc(optSummary(it.w,it.variant))+" · ":""}${priceOf(it.w)!=null?`R$ ${brl(priceOf(it.w))} cada`:"preço a consultar"}</div></div>
        <div class="qty"><button data-act="bagqty" data-i="${bag.indexOf(bag.find(b=>b.id===it.id&&b.variant===it.variant))}" data-d="-1" aria-label="Menos uma">−</button><output>${it.qty}</output><button data-act="bagqty" data-i="${bag.indexOf(bag.find(b=>b.id===it.id&&b.variant===it.variant))}" data-d="1" aria-label="Mais uma">+</button></div>
      </div>`; }).join("")}
      <div class="bagtotal"><span>Total</span><span class="price"><small>R$</small>${brl(bagTotal())}</span></div>${payList().length?`<p class="bagpay">Pagamento: ${esc(payList().join(" · "))}</p>`:""}
      <div class="form" style="margin-top:16px">
        <label class="field" for="bagname">Seu nome (opcional)<input id="bagname" data-input="bagname" value="${esc(name)}" autocomplete="name"></label>
        ${wa ? "" : `<div class="notice">Copie a lista abaixo e mande para a Jane pelo WhatsApp.</div><div class="copybox" id="bagtext">${esc(bagText(name))}</div>`}
        <button class="linkbtn" data-act="bagclear" style="justify-self:start">Esvaziar pedido</button>
      </div>`,
    foot: wa
      ? `<button class="btn ghost" data-act="copybag">Copiar</button><a class="btn" id="walink" href="https://wa.me/${wa}?text=${encodeURIComponent(bagText(name))}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a>`
      : `<button class="btn" data-act="copybag">Copiar pedido</button>`
  };
}
