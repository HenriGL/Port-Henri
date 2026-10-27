/* Eventos da página e início */
"use strict";

/* ============ eventos ============ */
let toastT;
function toast(msg){ clearTimeout(toastT); document.querySelector(".toast")?.remove(); const t = document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); t.textContent=msg; document.body.appendChild(t); toastT = setTimeout(()=>t.remove(), 2600); }
async function copy(text){ try{ await navigator.clipboard.writeText(text); toast("Pedido copiado"); }catch(e){ const el = document.getElementById("bagtext"); if(el){ const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } toast("Selecione o texto e copie"); } }
const newId = () => "w" + Date.now().toString(36) + Math.random().toString(36).slice(2,5);

app.addEventListener("click", async ev => {
  const t = ev.target.closest("[data-act]"); if(!t) return;
  const act = t.dataset.act, id = t.dataset.id;
  if(t.tagName==="BUTTON" || t.tagName==="A") { if(t.tagName==="BUTTON") ev.preventDefault(); }
  switch(act){
    case "tab": ui.tab = t.dataset.tab; try{ history.replaceState(null,"", ui.tab==="jane"?"#jane":ui.tab==="estoque"?"#estoque":"#vinhos"); }catch(e){} ui.sheet=null; document.documentElement.style.overflow=""; render(); scrollTo({top:0}); break;
    case "open": ev.stopPropagation(); if(ev.target.closest(".edit-tools")) return; openSheet("detail", {id}); break;
    case "close": closeSheet(); break;
    case "filters": openSheet("filters"); break;
    case "facet": { const set = ui[t.dataset.key]; const v = t.dataset.val; set.has(v) ? set.delete(v) : set.add(v); refilter(); break; }
    case "preset": { const p = PRICE_PRESETS[+t.dataset.i]; if(ui.pmin===p.a && ui.pmax===p.b){ ui.pmin=ui.pmax=null; } else { ui.pmin=p.a; ui.pmax=p.b; } refilter(); break; }
    case "clear": ["types","cats","grapes","countries"].forEach(k=>ui[k].clear()); ui.pmin=ui.pmax=null; ui.hideOut=false; if(!ui.sheet) ui.q=""; ui.reveal=false; render(); break;
    case "clear-price": ui.pmin=ui.pmax=null; refilter(); break;
    case "clear-out": case "toggle-hideout": ui.hideOut = act==="toggle-hideout" ? !ui.hideOut : false; refilter(); break;
    case "fgroup": { const g = t.dataset.g, open = !ui.fopen.has(g); open ? ui.fopen.add(g) : ui.fopen.delete(g);
      // abre/fecha sem redesenhar, para a transição acontecer; vale para a coluna e para a folha de filtros
      app.querySelectorAll(`[data-act="fgroup"][data-g="${g}"]`).forEach(b => { b.setAttribute("aria-expanded", open); b.closest(".fgrp").classList.toggle("open", open); }); break; }
    case "allgrapes": ui.allGrapes = !ui.allGrapes; refilter(); break;
    case "outs": { const k = t.dataset.shelf; ui.outOpen.has(k) ? ui.outOpen.delete(k) : ui.outOpen.add(k); refilter(); document.querySelector(`[data-act="outs"][data-shelf="${k}"]`)?.focus({preventScroll:true}); break; }
    case "jump": { const el = document.getElementById("s-"+t.dataset.shelf); if(ui.sheet) closeSheet(); el && el.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}); break; }
    case "variant": { if(ev.target.closest("[data-stop]")) break; const w = byId(ui.sheet.id); const i = +t.dataset.i; ui.sheet.variant = i;
      if(w && isMulti(w) && !optOut(w,i) && !Object.values(ui.sheet.qtys||{}).some(n=>n)) { ui.sheet.qtys = {[i]:1}; }
      rerenderSheet(); break; }
    case "oqty": { const i = +t.dataset.i; const q = ui.sheet.qtys = ui.sheet.qtys||{}; { const w = byId(ui.sheet.id), mx = Math.max(0, maxQty(w,i) - inBag(w.id,i)); if(+t.dataset.d>0 && (q[i]||0)>=mx){ toast(mx ? `Temos só mais ${mx} desta opção` : "Você já colocou todas as garrafas desta opção no pedido"); break; } q[i] = Math.max(0, Math.min(mx, (q[i]||0) + +t.dataset.d)); } ui.sheet.variant = i; rerenderSheet(); break; }
    case "addmulti": { const s = ui.sheet, w = byId(s.id); const parts = [];
      Object.entries(s.qtys||{}).forEach(([i,n]) => { i = +i; if(!n || optOut(w,i)) return; const ex = bag.find(b => b.id===s.id && b.variant===i); ex ? ex.qty += n : bag.push({id:s.id, variant:i, qty:n}); parts.push(`${n} ${optLabel(w,i)}`); });
      if(!parts.length) break; saveBag(); closeSheet(); toast("Adicionado: " + parts.join(" + ")); break; }
    case "qty": { const w = byId(ui.sheet.id); const mx = Math.max(1, maxQty(w,0) - inBag(w.id,0)); ui.sheet.qty = Math.max(1, Math.min(mx, ui.sheet.qty + +t.dataset.d)); if(+t.dataset.d>0 && ui.sheet.qty===mx && stockOf(w,0)!=null) toast(`Temos ${stockOf(w,0)} garrafa${stockOf(w,0)===1?"":"s"} deste vinho`); rerenderSheet(); break; }
    case "add": { const s = ui.sheet; const w = byId(s.id); const mx = maxQty(w,0); const ex = bag.find(b => b.id===s.id && (b.variant||0)===0);
      const have = ex ? ex.qty : 0; const n = Math.min(s.qty, mx - have);
      if(n<=0){ toast("Você já colocou todas as garrafas disponíveis no pedido"); break; }
      ex ? ex.qty += n : bag.push({id:s.id, variant:0, qty:n}); saveBag(); closeSheet(); toast(n<s.qty ? `Adicionadas ${n} (é o que temos)` : "Adicionado ao pedido"); break; }
    case "bag": openSheet("bag"); break;
    case "bagqty": { const it = bag[+t.dataset.i]; if(!it) break; const w = STATE.wines.find(x=>x.id===it.id); const mx = w ? maxQty(w, it.variant||0) : 48;
      if(+t.dataset.d>0 && it.qty>=mx){ toast(`Temos ${mx} garrafa${mx===1?"":"s"} desta opção`); break; }
      it.qty += +t.dataset.d; if(it.qty<=0) bag.splice(+t.dataset.i,1); saveBag(); rerenderSheet(); break; }
    case "bagclear": bag = []; saveBag(); closeSheet(); break;
    case "copybag": copy(bagText(ui.sheet.name||"")); break;
    /* edição */
    case "editmode": ui.editMode = !ui.editMode; if(ui.editMode) ensureDraft(); else if(ui.tab==="estoque") ui.tab = "vinhos"; render(); break;
    case "new": openSheet("editor", {w: EMPTY()}); break;
    case "edit": ev.stopPropagation(); openSheet("editor", {w: JSON.parse(JSON.stringify(byId(id)))}); break;
    case "toggle-out": { ev.stopPropagation(); const w = byId(id);
      if(wineOut(w) && w.status!=="esgotado"){ toast("Esse vinho está com estoque zerado. Ajuste a quantidade na aba Estoque."); break; }
      w.status = w.status==="esgotado" ? "disponivel" : "esgotado"; changed(); toast(w.status==="esgotado" ? "Marcado como esgotado" : "Marcado como disponível"); break; }
    case "eseg": { readForm(); const e = ui.sheet.w, f = t.dataset.field, v = t.dataset.val; e[f] = e[f]||[]; e[f].includes(v) ? e[f] = e[f].filter(x=>x!==v) : e[f].push(v); rerenderSheet(); break; }
    case "estatus": readForm(); ui.sheet.w.status = t.dataset.val; rerenderSheet(); break;
    case "gdel": readForm(); ui.sheet.w.grapes.splice(+t.dataset.i,1); rerenderSheet(); break;
    case "bdel": readForm(); ui.sheet.w.bottles.splice(+t.dataset.i,1); rerenderSheet(); break;
    case "bmove": { readForm(); const b = ui.sheet.w.bottles, i = +t.dataset.i; [b[i-1], b[i]] = [b[i], b[i-1]]; rerenderSheet(); break; }
    case "bgremove": { readForm(); const b = ui.sheet.w.bottles[+t.dataset.i]; toast("Tirando o fundo…"); try{ const before = b.photo; b.photo = await processPhoto(b.photo, true); if(b.photo!==before) ORIG.set(b.photo, before); rerenderSheet(); toast("Fundo removido"); }catch(e){ toast("Não consegui tirar o fundo dessa foto."); } break; }
    case "bgundo": { readForm(); const b = ui.sheet.w.bottles[+t.dataset.i]; if(ORIG.has(b.photo)) b.photo = ORIG.get(b.photo); rerenderSheet(); break; }
    case "pzdel": { const j = document.getElementById("cf-json"); if(j) ui.sheet.json = j.value; ui.sheet.photos.splice(+t.dataset.i,1); rerenderSheet(); break; }
    case "edel": readForm(); ui.sheet.confirmDel = true; rerenderSheet(); break;
    case "edelno": readForm(); ui.sheet.confirmDel = false; rerenderSheet(); break;
    case "edelyes": { ensureDraft(); DRAFT.wines = DRAFT.wines.filter(w => w.id !== ui.sheet.w.id); bag = bag.filter(b=>b.id!==ui.sheet.w.id); saveBag(); ui.sheet = null; document.documentElement.style.overflow=""; changed(); toast("Vinho excluído (publique para valer)"); break; }
    case "esave": {
      const e = readForm();
      if(!e.name){ toast("Coloque o nome do vinho"); document.getElementById("e-name")?.focus(); break; }
      ensureDraft();
      if(!e.id){ e.id = newId(); DRAFT.wines.push(e); }
      else { const i = DRAFT.wines.findIndex(w=>w.id===e.id); DRAFT.wines[i] = e; }
      ui.sheet = null; document.documentElement.style.overflow=""; changed(); toast("Salvo. Publique quando terminar.");
      break; }
    case "import": openSheet("import", {link:"", json:""}); break;
    case "cfgo": {
      const s = ui.sheet; s.json = document.getElementById("cf-json").value; s.link = document.getElementById("cf-link").value;
      try{
        const r = parseCasaFlora(s.json);
        r.wine.bottles = (s.photos||[]).map(u => ({label:"", photo:u}));
        const needPhoto = !r.wine.bottles.length && r.img;
        const info = `<div class="notice">Ficha preenchida com os dados da Casa Flora. Confira os campos e coloque o seu preço${r.cost?` (o preço no site do fornecedor é R$ ${brl(Number(r.cost))}; esse valor não aparece no catálogo)`:""}.${needPhoto?`<br><br><b>Foto:</b> <a href="${esc(r.img)}" target="_blank" rel="noopener">abra a foto da Casa Flora ↗</a>, toque e segure nela → “Copiar imagem” e cole em “Colar foto” logo abaixo.`:""}${r.wine.bottles.length>1?`<br><br>Você colou ${r.wine.bottles.length} fotos: dê um nome a cada opção (ex.: Shiraz, Cabernet Sauvignon).`:""}</div>`;
        openSheet("editor", {w: r.wine, importInfo: info});
      }catch(err){ s.err = err.message; render(); }
      break; }
    case "settings": openSheet("settings", {s: {...settings()}}); break;
    case "sphotodel": ui.sheet.s.photo = ""; rerenderSheet(); break;
    case "ssave": {
      const f = document.getElementById("sform"); const s = ui.sheet.s;
      ["whatsapp","instagram","city","aboutTitle","about","payments"].forEach(k => s[k] = f.elements[k].value.trim());
      ensureDraft(); DRAFT.settings = s; ui.sheet = null; document.documentElement.style.overflow=""; changed(); toast("Salvo. Publique quando terminar.");
      break; }
    case "discard": DRAFT = null; ui.dirty = false; LS.del("jv-draft"); ui.readOnlyNote=""; ensureDraft(); render(); toast("Alterações descartadas"); break;
    case "publish": openSheet("publish"); break;
    case "publishgo": doPublish(); break;
    case "aboutphotodel": ensureDraft(); DRAFT.settings = {...(DRAFT.settings||{}), photo: ""}; changed(); toast("Ilustração de volta. Publique para valer."); break;
    case "sfilter": ui.sf = t.dataset.f; render(); break;
    case "sstep": { const r = findRow(t.dataset.k); if(!r) break; const cur = stockOf(r.w, r.i) ?? 0; const nv = Math.max(0, cur + +t.dataset.d); if(nv===cur && stockOf(r.w,r.i)!=null) break; setStock(r.w, r.i, nv); logStock(r.w, r.i, nv - cur, "ajuste"); changed(); break; }
    case "orderin": openSheet("orderin", {text:"", lines:[]}); break;
    case "oldel": ui.sheet.lines.splice(+t.dataset.i,1); rerenderSheet(); break;
    case "oladd": ui.sheet.lines.push({txt:"Item adicionado à mão", qty:1, key:""}); rerenderSheet(); break;
    case "ordgo": {
      const s = ui.sheet; ensureDraft(); let done = 0, untracked = [], short = [];
      s.lines.filter(l=>l.key && +l.qty>0).forEach(l => {
        const r = findRow(l.key); if(!r) return; const st = stockOf(r.w, r.i), q = +l.qty;
        if(st==null){ untracked.push(optName(r.w,r.i)); return; }
        const nv = Math.max(0, st - q); if(st < q) short.push(optName(r.w,r.i));
        setStock(r.w, r.i, nv); logStock(r.w, r.i, nv - st, "pedido"); done += st - nv;
      });
      ui.sheet = null; document.documentElement.style.overflow = ""; changed();
      toast(`Baixa de ${done} garrafa${done===1?"":"s"}${untracked.length?`. Sem contagem: ${untracked.join(", ")}`:""}${short.length?`. Ficaram zerados: ${short.join(", ")}`:""}. Publique para atualizar o catálogo.`);
      break; }
  }
});
app.addEventListener("keydown", ev => {
  if(ev.key==="Escape" && ui.sheet){ closeSheet(); return; }
  if((ev.key==="Enter"||ev.key===" ") && ev.target.matches(".optrow")){ ev.preventDefault(); ev.target.click(); return; }
  if((ev.key==="Enter"||ev.key===" ") && ev.target.matches(".spec")){ ev.preventDefault(); openSheet("detail",{id:ev.target.dataset.id}); }
});
let qT;
app.addEventListener("input", ev => {
  const k = ev.target.dataset.input; if(!k) return;
  const v = ev.target.value;
  if(k==="q"){ ui.q = v; ui.reveal = false; clearTimeout(qT); qT = setTimeout(renderCat, 160); }
  else if(k==="pmin"||k==="pmax"){ const n = v.replace(/\D/g,""); ui[k] = n==="" ? null : +n; ui.reveal = false; clearTimeout(qT); qT = setTimeout(render, 450); }
  else if(k==="cflink"){ ui.sheet.link = v; ui.sheet.err = ""; clearTimeout(qT); qT = setTimeout(()=>{ ui.sheet.json = document.getElementById("cf-json")?.value || ui.sheet.json; rerenderSheet(); document.getElementById("cf-link")?.focus(); }, 500); }
  else if(k==="sq"){ ui.sq = v; clearTimeout(qT); qT = setTimeout(render, 200); }
  else if(k==="ordtxt"){ ui.sheet.text = v; clearTimeout(qT); qT = setTimeout(() => { ui.sheet.lines = parseOrder(v); rerenderSheet(); const ta = document.getElementById("ord-txt"); if(ta){ ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } }, 450); }
  else if(k==="cfjson"){ ui.sheet.json = v; clearTimeout(qT); qT = setTimeout(() => { try{ const r = parseCasaFlora(v); if(r.img && r.img !== ui.sheet.img){ ui.sheet.img = r.img; ui.sheet.err = ""; rerenderSheet(); } }catch(e){} }, 400); }
  else if(k==="pastebg"){ ui.pasteBg = ev.target.checked; LS.set("jv-pastebg", ui.pasteBg); }
  else if(k==="bagname"){ ui.sheet.name = v; const a = document.getElementById("walink"); if(a){ a.href = `https://wa.me/${waDigits(settings().whatsapp)}?text=${encodeURIComponent(bagText(v))}`; } const bt = document.getElementById("bagtext"); if(bt) bt.textContent = bagText(v); }
});
app.addEventListener("change", async ev => {
  const k = ev.target.dataset.input;
  if(ev.target.dataset.sk){ const r = findRow(ev.target.dataset.sk); if(r){ const cur = stockOf(r.w,r.i); const v = ev.target.value.trim(); setStock(r.w, r.i, v===""?null:v); const nv = stockOf(r.w,r.i); if(nv!=null || cur!=null){ logStock(r.w, r.i, (nv??0)-(cur??0), "ajuste"); changed(); } } return; }
  if(ev.target.dataset.ol!=null){ ui.sheet.lines[+ev.target.dataset.ol].key = ev.target.value; rerenderSheet(); return; }
  if(ev.target.dataset.oq!=null){ ui.sheet.lines[+ev.target.dataset.oq].qty = Math.max(1, +ev.target.value||1); rerenderSheet(); return; }
  if(k==="sort"){ ui.sort = ev.target.value; LS.set("jv-sort", ui.sort); refilter(); }
  else if(k==="hideOut"){ ui.hideOut = ev.target.checked; render(); }
  else if(ev.target.id==="about-photo" && ev.target.files[0]){
    toast("Preparando a foto…");
    try{ const url = await processPhotoSquare(ev.target.files[0]); ensureDraft(); DRAFT.settings = {...(DRAFT.settings||{}), photo: url}; changed(); toast("Foto trocada. Publique para os clientes verem."); }
    catch(e){ toast("Não consegui abrir essa imagem. Tente um arquivo JPG ou PNG."); }
  }
  else if(ev.target.id==="s-photo" && ev.target.files[0]){
    const f = document.getElementById("sform"); ["whatsapp","instagram","city","aboutTitle","about","payments"].forEach(k => ui.sheet.s[k] = f.elements[k].value);
    try{ ui.sheet.s.photo = await processPhotoSquare(ev.target.files[0]); rerenderSheet(); }catch(e){ toast("Não consegui abrir essa imagem."); }
  }
});
async function processPhotoSquare(file){
  const img = await loadImg(URL.createObjectURL(file));
  const s = Math.min(img.naturalWidth, img.naturalHeight), c = document.createElement("canvas"); c.width = c.height = 900;
  c.getContext("2d").drawImage(img, (img.naturalWidth-s)/2, (img.naturalHeight-s)/2, s, s, 0, 0, 900, 900);
  const u = c.toDataURL("image/webp", .82); return u.startsWith("data:image/webp") ? u : c.toDataURL("image/jpeg", .85);
}
addEventListener("hashchange", () => { const t = location.hash==="#jane" ? "jane" : "vinhos"; if(t!==ui.tab){ ui.tab=t; render(); } });

/* ============ movimento e navegação do catálogo ============ */
// Filtrar redesenha só o catálogo (a busca e a parede do topo ficam como estão) e desliga as entradas animadas
function refilter(){ ui.reveal = false; renderCat(); }

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealIO, spyIO;
// Chamada depois de cada render: entradas na primeira visita, prateleira atual na barra de atalhos
function enhance(){
  revealIO && revealIO.disconnect(); spyIO && spyIO.disconnect();
  const rv = [...app.querySelectorAll(".rv:not(.in)")];
  if(!ui.reveal || calm() || !("IntersectionObserver" in window)) rv.forEach(el => el.classList.add("in"));
  else {
    document.documentElement.classList.add("js-reveal");
    revealIO = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); revealIO.unobserve(e.target); } }), {rootMargin: "0px 0px -8% 0px"});
    rv.forEach(el => revealIO.observe(el));
  }
  const jump = app.querySelector(".jump"); if(!jump || !("IntersectionObserver" in window)) return;
  spyIO = new IntersectionObserver(es => es.forEach(e => {
    if(!e.isIntersecting) return;
    const k = e.target.id.slice(2);
    jump.querySelectorAll("button").forEach(b => b.toggleAttribute("aria-current", b.dataset.shelf===k));
    const cur = jump.querySelector("[aria-current]"); cur && jump.scrollTo({left: cur.offsetLeft - jump.offsetLeft - 8, behavior: calm() ? "auto" : "smooth"});
  }), {rootMargin: "-30% 0px -60% 0px"});
  app.querySelectorAll(".shelf").forEach(s => spyIO.observe(s));
}

/* ============ início ============ */
render();
(async () => {
  try{
    if(!window.claude || !claude.use) return;
    const user = await claude.use("user");
    const can = user ? await user.canEdit() : false;
    if(!can) return;
    ui.canEdit = true;
    ui.art = await claude.use("artifact");
    if(loadDraft()){ ui.editMode = true; }
    render();
  }catch(e){}
})();
