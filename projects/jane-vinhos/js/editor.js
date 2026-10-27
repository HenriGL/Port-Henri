/* Só para quem edita: editor de vinho, fotos, importação Casa Flora, contato e publicação */
"use strict";

/* ============ editor (só para quem edita) ============ */
const EMPTY = () => ({id:"", name:"", producer:"", description:"", country:"", grapes:[], types:["tinto"], categories:["seco"], price:"", volume:"750 ml", vintage:"", region:"", abv:"", serve:"", pairing:"", status:"disponivel", pick:false, bottles:[]});
function editorParts(){
  const e = ui.sheet.w; const isNew = !e.id;
  const segs = (field, opts) => `<div class="seg" role="group">${opts.map(o=>`<button type="button" class="chip" aria-pressed="${(e[field]||[]).includes(o.k)}" data-act="eseg" data-field="${field}" data-val="${o.k}">${field==="types"?`<span class="dot" style="--c:var(--t-${o.k})"></span>`:""}${o.l}</button>`).join("")}</div>`;
  const c = findCountry(e.country);
  return {
    title: isNew ? "Novo vinho" : "Editar vinho",
    body: `<form class="form" id="eform" autocomplete="off">
      ${ui.sheet.importInfo || ""}
      <div class="fsec"><h5>Fotos das garrafas</h5>
        <span class="hint">Copie a foto no site (toque e segure na imagem → “Copiar imagem”) e cole abaixo, ou envie um arquivo. Se a foto tiver fundo branco, toque em “Tirar fundo”. Para várias uvas no mesmo preço, adicione uma garrafa por opção: cada uma ganha nome, uva, tipo, descrição própria e pode ser marcada como esgotada separadamente.</span>
        ${pasteZoneHtml("pz-editor")}
        <div class="blist ${(e.bottles||[]).length>1?"multi":""}">
          ${(e.bottles||[]).map((b,i)=>{ const m = (e.bottles||[]).length>1; return `<div class="bitem">
            <div class="bimg">${b.photo?`<img src="${b.photo}" alt="">`:`<span class="hint" style="align-self:center">sem foto</span>`}</div>
            <input type="text" id="blabel${i}" data-bi="${i}" placeholder="${m?"Nome da opção. Ex.: Malbec":"Nome da opção (opcional)"}" value="${esc(b.label||"")}" aria-label="Nome da opção ${i+1}">
            ${m ? `<div class="ofields">
              <input type="text" id="bgrape${i}" list="grapelist" placeholder="Uva desta opção (se diferente)" value="${esc(b.grape||"")}" aria-label="Uva da opção ${i+1}">
              <select id="btype${i}" aria-label="Tipo da opção ${i+1}"><option value="">Tipo: igual ao vinho</option>${TYPES.map(t=>`<option value="${t.k}" ${b.type===t.k?"selected":""}>${t.l}</option>`).join("")}</select>
              <textarea id="bdesc${i}" placeholder="Descrição só desta opção (opcional)" aria-label="Descrição da opção ${i+1}">${esc(b.desc||"")}</textarea>
              <label class="ochk" for="bstock${i}">Estoque: <input type="number" min="0" inputmode="numeric" id="bstock${i}" value="${b.stock??""}" placeholder="—" style="width:76px;border:1px solid var(--line);border-radius:8px;padding:4px 6px;background:var(--chip)"> garrafas</label>
              <label class="ochk" for="bout${i}"><input type="checkbox" id="bout${i}" ${b.status==="esgotado"?"checked":""}> Esta opção esgotou</label>
            </div>` : ""}
            <div class="bb">
              <label>Trocar foto<input type="file" accept="image/*" class="sr" data-photo="${i}"></label>
              ${b.photo ? (ORIG.has(b.photo) ? `<button type="button" data-act="bgundo" data-i="${i}">Voltar fundo</button>` : `<button type="button" data-act="bgremove" data-i="${i}">Tirar fundo</button>`) : ""}
              ${i>0?`<button type="button" data-act="bmove" data-i="${i}" aria-label="Mover para a esquerda">←</button>`:""}
              <button type="button" data-act="bdel" data-i="${i}">Remover</button>
            </div></div>`; }).join("")}
          <label class="bitem add">+ Adicionar garrafa<input type="file" accept="image/*" class="sr" data-photo="new" multiple></label>
        </div>
      </div>
      <label class="field" for="e-name">Nome no catálogo<input id="e-name" name="name" required value="${esc(e.name)}" placeholder="Ex.: Luigi Bosca Malbec"></label>
      <div class="row2">
        <label class="field" for="e-price">Preço (R$)<input id="e-price" name="price" inputmode="decimal" value="${e.price??""}" placeholder="Ex.: 145"><span class="hint">Deixe vazio para mostrar “Consulte”.</span></label>
        <label class="field" for="e-country">País
          <input id="e-country" name="country" list="countrylist" value="${esc(e.country)}" placeholder="Ex.: Argentina">
          <span class="flagpreview" id="flagprev"><span class="flag-s">${flagSvg(e.country)}</span>${c?esc(c.name):(e.country?"Bandeira não encontrada":"A bandeira aparece sozinha")}</span>
        </label>
      </div>
      <datalist id="countrylist">${COUNTRIES.map(c=>`<option value="${c.name}">`).join("")}</datalist>
      <div class="field">Uvas
        <div class="tags" id="gtags">${(e.grapes||[]).map((g,i)=>`<span>${esc(g)}<button type="button" data-act="gdel" data-i="${i}" aria-label="Remover ${esc(g)}">×</button></span>`).join("")}<input id="e-grape" list="grapelist" placeholder="${(e.grapes||[]).length?"Mais uma…":"Digite e aperte Enter"}" aria-label="Adicionar uva"></div>
        <datalist id="grapelist">${GRAPES.map(g=>`<option value="${g}">`).join("")}</datalist>
      </div>
      <div class="field">Tipo${segs("types", TYPES)}</div>
      <div class="field">Categoria${segs("categories", CATS)}</div>
      <label class="field" for="e-desc">Descrição<textarea id="e-desc" name="description" rows="4" placeholder="Aromas, sabor, ocasião…">${esc(e.description)}</textarea></label>
      <div class="row3">
        <label class="field" for="e-producer">Produtor<input id="e-producer" name="producer" value="${esc(e.producer)}"></label>
        <label class="field" for="e-region">Região<input id="e-region" name="region" value="${esc(e.region)}"></label>
        <label class="field" for="e-vintage">Safra<input id="e-vintage" name="vintage" inputmode="numeric" value="${esc(e.vintage)}"></label>
        <label class="field" for="e-volume">Volume<input id="e-volume" name="volume" value="${esc(e.volume)}"></label>
        <label class="field" for="e-abv">Teor alcoólico<input id="e-abv" name="abv" value="${esc(e.abv)}" placeholder="13,5%"></label>
        <label class="field" for="e-serve">Servir a<input id="e-serve" name="serve" value="${esc(e.serve)}" placeholder="16 a 18 °C"></label>
      </div>
      <label class="field" for="e-pairing">Harmoniza com<input id="e-pairing" name="pairing" value="${esc(e.pairing)}" placeholder="Carnes vermelhas, queijos…"></label>
      <div class="row2">
        <div class="field">Disponibilidade<div class="seg"><button type="button" class="chip" aria-pressed="${e.status!=="esgotado"}" data-act="estatus" data-val="disponivel">Disponível</button><button type="button" class="chip" aria-pressed="${e.status==="esgotado"}" data-act="estatus" data-val="esgotado">Esgotado</button></div></div>
        ${(e.bottles||[]).length>1 ? "" : `<label class="field" for="e-stock">Estoque (garrafas)<input id="e-stock" name="stock" type="number" min="0" inputmode="numeric" value="${e.stock??""}" placeholder="Sem contagem"></label>`}
        <label class="toggle-row field" for="e-pick" style="align-self:end">Indicação da Jane <input type="checkbox" id="e-pick" name="pick" ${e.pick?"checked":""}></label>
      </div>
      ${!isNew ? (ui.sheet.confirmDel
        ? `<div class="notice warn confirm">Excluir “${esc(e.name)}” do catálogo? <button type="button" class="btn danger" data-act="edelyes">Sim, excluir</button><button type="button" class="btn ghost" data-act="edelno">Cancelar</button></div>`
        : `<button type="button" class="linkbtn" data-act="edel" style="justify-self:start;color:var(--warn)">Excluir este vinho</button>`) : ""}
    </form>`,
    foot: `<button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="esave">${isNew?"Adicionar ao catálogo":"Salvar"}</button>`
  };
}
function readForm(){
  const e = ui.sheet.w, f = document.getElementById("eform"); if(!f) return e;
  ["name","producer","description","country","volume","vintage","region","abv","serve","pairing"].forEach(k => { if(f.elements[k]) e[k] = f.elements[k].value.trim(); });
  const p = f.elements.price.value.replace(/[^\d,.-]/g,"").replace(/\.(?=\d{3}(\D|$))/g,"").replace(",",".");
  e.price = p==="" ? null : Number(p);
  e.pick = f.elements.pick.checked;
  if(f.elements.stock){ const v = f.elements.stock.value.trim(); if(v==="") delete e.stock; else e.stock = Math.max(0, Math.round(+v)||0); }
  (e.bottles||[]).forEach((b,i) => {
    const el = document.getElementById("blabel"+i); if(el) b.label = el.value.trim();
    const g = document.getElementById("bgrape"+i); if(g){ const v = g.value.trim(); if(v) b.grape = (GRAPES.find(x=>norm(x)===norm(v))||v); else delete b.grape; }
    const t = document.getElementById("btype"+i); if(t){ if(t.value) b.type = t.value; else delete b.type; }
    const d = document.getElementById("bdesc"+i); if(d){ const v = d.value.trim(); if(v) b.desc = v; else delete b.desc; }
    const o = document.getElementById("bout"+i); if(o){ if(o.checked) b.status = "esgotado"; else delete b.status; }
    const sk = document.getElementById("bstock"+i); if(sk){ const v = sk.value.trim(); if(v==="") delete b.stock; else b.stock = Math.max(0, Math.round(+v)||0); }
  });
  const g = document.getElementById("e-grape"); if(g && g.value.trim()) addGrape(g.value);
  if(findCountry(e.country)) e.country = findCountry(e.country).name;
  return e;
}
function addGrape(v){
  const e = ui.sheet.w; v = v.replace(/,$/,"").trim(); if(!v) return;
  const known = GRAPES.find(g => norm(g)===norm(v)); v = known || v.charAt(0).toUpperCase()+v.slice(1);
  e.grapes = e.grapes||[]; if(!e.grapes.some(g=>norm(g)===norm(v))) e.grapes.push(v);
}
function bindEditor(){
  const ctry = document.getElementById("e-country");
  ctry && ctry.addEventListener("input", () => {
    const c = findCountry(ctry.value);
    document.getElementById("flagprev").innerHTML = `<span class="flag-s">${flagSvg(ctry.value)}</span>${c?esc(c.name):(ctry.value?"Bandeira não encontrada":"A bandeira aparece sozinha")}`;
  });
  const g = document.getElementById("e-grape");
  g && g.addEventListener("keydown", ev => {
    if(ev.key==="Enter" || ev.key===","){ ev.preventDefault(); readForm(); g.value=""; ui.sheet.refocus="e-grape"; rerenderSheet(); }
    else if(ev.key==="Backspace" && !g.value && (ui.sheet.w.grapes||[]).length){ readForm(); ui.sheet.w.grapes.pop(); ui.sheet.refocus="e-grape"; rerenderSheet(); }
  });
  g && g.addEventListener("change", () => { if(GRAPES.includes(g.value)){ readForm(); g.value=""; ui.sheet.refocus="e-grape"; rerenderSheet(); } });
  app.querySelectorAll("[data-photo]").forEach(inp => inp.addEventListener("change", async () => {
    readForm();
    const files = [...inp.files]; if(!files.length) return;
    toast("Preparando a foto…");
    try{
      for(const file of files){
        const url = await processPhoto(file, false);
        if(inp.dataset.photo==="new") ui.sheet.w.bottles.push({label:"", photo:url});
        else ui.sheet.w.bottles[+inp.dataset.photo].photo = url;
      }
      rerenderSheet();
    }catch(err){ toast("Não consegui abrir essa imagem. Tente um arquivo PNG ou JPG."); }
  }));
  if(ui.sheet.refocus){ const el = document.getElementById(ui.sheet.refocus); el && el.focus(); ui.sheet.refocus = null; }
}
function rerenderSheet(){
  const root = document.getElementById("sheetroot");
  if(!root || !ui.sheet) return render();
  const b = root.querySelector(".sheet-b"); const st = b ? b.scrollTop : 0;
  root.innerHTML = sheetHtml();
  const nb = root.querySelector(".sheet-b"); if(nb) nb.scrollTop = st;
  const bb = document.getElementById("bagroot"); if(bb) bb.innerHTML = bagBarHtml();
  afterSheetRender();
}

/* --- fotos: redimensiona, recorta margens e (opcional) tira fundo claro --- */
function loadImg(src){ return new Promise((res,rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }
async function processPhoto(fileOrUrl, removeBg){
  const src = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  const img = await loadImg(src);
  const scale = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
  let w = Math.round(img.naturalWidth*scale), h = Math.round(img.naturalHeight*scale);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const x = c.getContext("2d", {willReadFrequently:true}); x.drawImage(img, 0, 0, w, h);
  let d = x.getImageData(0, 0, w, h);
  if(removeBg) removeBackground(d, w, h);
  // recorta as margens transparentes
  const px = d.data; let minX=w, minY=h, maxX=-1, maxY=-1;
  for(let y=0;y<h;y++) for(let xx=0;xx<w;xx++){ if(px[(y*w+xx)*4+3] > 12){ if(xx<minX)minX=xx; if(xx>maxX)maxX=xx; if(y<minY)minY=y; if(y>maxY)maxY=y; } }
  x.putImageData(d, 0, 0);
  let sx=0, sy=0, sw=w, sh=h;
  if(maxX>=0){ sx=minX; sy=minY; sw=maxX-minX+1; sh=maxY-minY+1; }
  const H = Math.min(560, sh), W = Math.round(sw * H / sh);
  const o = document.createElement("canvas"); o.width = W; o.height = H;
  const ox = o.getContext("2d"); ox.imageSmoothingQuality = "high"; ox.drawImage(c, sx, sy, sw, sh, 0, 0, W, H);
  let out = o.toDataURL("image/webp", 0.82);
  if(!out.startsWith("data:image/webp")) out = o.toDataURL("image/png");
  if(typeof fileOrUrl !== "string") URL.revokeObjectURL(src);
  return out;
}
function removeBackground(d, w, h){
  const p = d.data;
  const corners = [0, w-1, (h-1)*w, h*w-1].map(i => [p[i*4],p[i*4+1],p[i*4+2],p[i*4+3]]);
  if(corners.every(c => c[3] < 20)) return; // já sem fundo
  const bg = [0,1,2].map(k => corners.reduce((a,c)=>a+c[k],0)/4);
  const dist = i => Math.hypot(p[i*4]-bg[0], p[i*4+1]-bg[1], p[i*4+2]-bg[2]);
  const T = 34, seen = new Uint8Array(w*h), q = new Int32Array(w*h); let qh=0, qt=0;
  const push = i => { if(!seen[i] && dist(i) < T){ seen[i]=1; q[qt++]=i; } };
  for(let xx=0;xx<w;xx++){ push(xx); push((h-1)*w+xx); }
  for(let y=0;y<h;y++){ push(y*w); push(y*w+w-1); }
  while(qh<qt){ const i=q[qh++], xx=i%w; p[i*4+3]=0;
    if(xx>0)push(i-1); if(xx<w-1)push(i+1); if(i>=w)push(i-w); if(i<w*(h-1))push(i+w); }
  // suaviza a borda
  for(let i=0;i<w*h;i++){ if(seen[i]) continue; const xx=i%w;
    const nb = (xx>0&&seen[i-1])||(xx<w-1&&seen[i+1])||(i>=w&&seen[i-w])||(i<w*(h-1)&&seen[i+w]);
    if(nb){ const dd = dist(i); if(dd < T*2.2) p[i*4+3] = Math.round(p[i*4+3] * Math.min(1, (dd-T*.6)/(T*1.6))); } }
}

/* ============ colar foto ============ */
const ORIG = new Map(); // foto tratada -> original, para "Desfazer" o tirar fundo
if(ui.pasteBg === undefined) ui.pasteBg = LS.get("jv-pastebg", true);
function pasteZoneHtml(id){
  return `<div class="pastezone" id="${id}" contenteditable="true" role="button" aria-label="Colar foto da garrafa" spellcheck="false" inputmode="none"><span class="pz-ic">⎘</span><span><b>Colar foto</b>Toque e segure aqui → “Colar”, ou use Ctrl+V / ⌘V. Também dá para arrastar o arquivo.</span></div>
  <label class="pz-opt" for="${id}-bg"><input type="checkbox" id="${id}-bg" data-input="pastebg" ${ui.pasteBg?"checked":""}> Tirar fundo branco automaticamente</label>`;
}
function imagesFrom(dt){
  const out = [];
  if(!dt) return out;
  [...(dt.items||[])].forEach(it => { if(it.kind==="file" && /^image\//.test(it.type)){ const f = it.getAsFile(); if(f) out.push(f); } });
  if(!out.length) [...(dt.files||[])].forEach(f => { if(/^image\//.test(f.type)) out.push(f); });
  if(!out.length){ const h = dt.getData && dt.getData("text/html"); const m = h && h.match(/<img[^>]+src="(data:image\/[^"]+)"/i); if(m) out.push(m[1]); }
  return out;
}
async function pastedToPhotos(files){
  const res = [];
  for(const f of files){
    const plain = await processPhoto(f, false);
    if(ui.pasteBg){ const clean = await processPhoto(plain, true); if(clean !== plain) ORIG.set(clean, plain); res.push(clean); }
    else res.push(plain);
  }
  return res;
}
async function receivePhotos(files){
  if(!ui.sheet) return;
  toast(files.length>1 ? "Preparando as fotos…" : "Preparando a foto…");
  try{
    if(ui.sheet.kind==="editor"){
      readForm();
      const urls = await pastedToPhotos(files);
      urls.forEach(u => ui.sheet.w.bottles.push({label:"", photo:u}));
      rerenderSheet(); toast(urls.length>1 ? "Fotos adicionadas" : "Foto adicionada");
    } else if(ui.sheet.kind==="import"){
      const j = document.getElementById("cf-json"), l = document.getElementById("cf-link");
      if(j) ui.sheet.json = j.value; if(l) ui.sheet.link = l.value;
      const urls = await pastedToPhotos(files);
      ui.sheet.photos = (ui.sheet.photos||[]).concat(urls);
      rerenderSheet(); toast("Foto pronta. Ela entra na ficha do vinho.");
    }
  }catch(err){ toast("Não consegui usar essa imagem. Tente copiar a foto de novo ou enviar o arquivo."); }
}
document.addEventListener("paste", ev => {
  if(!ui.sheet || !["editor","import"].includes(ui.sheet.kind)) return;
  const files = imagesFrom(ev.clipboardData);
  const inZone = ev.target && ev.target.closest && ev.target.closest(".pastezone");
  if(!files.length){
    if(inZone){
      ev.preventDefault();
      const t = (ev.clipboardData && ev.clipboardData.getData("text")) || "";
      toast(/^https?:\/\//i.test(t.trim()) ? "Isso é o endereço da foto. Abra a foto, toque e segure nela e escolha “Copiar imagem”." : "Não encontrei uma imagem no que foi colado.");
    }
    return;
  }
  ev.preventDefault();
  receivePhotos(files);
});
document.addEventListener("beforeinput", ev => { if(ev.target && ev.target.closest && ev.target.closest(".pastezone") && ev.inputType !== "insertFromPaste") ev.preventDefault(); });
document.addEventListener("dragover", ev => { const z = ev.target.closest && ev.target.closest(".pastezone"); if(z){ ev.preventDefault(); z.classList.add("drag"); } });
document.addEventListener("dragleave", ev => { const z = ev.target.closest && ev.target.closest(".pastezone"); if(z) z.classList.remove("drag"); });
document.addEventListener("drop", ev => { const z = ev.target.closest && ev.target.closest(".pastezone"); if(!z) return; ev.preventDefault(); z.classList.remove("drag"); const f = imagesFrom(ev.dataTransfer); f.length ? receivePhotos(f) : toast("Solte um arquivo de imagem aqui."); });

/* ============ importação Casa Flora ============ */
function importParts(){
  const s = ui.sheet;
  const h = handleFrom(s.link||"");
  const jsonUrl = h ? `https://www.casaflora.com.br/products/${h}.json` : "";
  const shareLink = /share\.google|goo\.gl|g\.co\//i.test(s.link||"");
  return {
    title: "Importar da Casa Flora",
    body: `<div class="form">
      <label class="field" for="cf-link"><span>1. Cole o link do produto</span>
        <input id="cf-link" data-input="cflink" value="${esc(s.link||"")}" placeholder="casaflora.com.br/products/…" inputmode="url" autofocus>
        ${shareLink ? `<span class="hint" style="color:var(--warn)">Esse é um link de compartilhamento. Abra-o, e copie o endereço que aparece no navegador (começa com casaflora.com.br/products/…).</span>` : `<span class="hint">O endereço da página do vinho no site da Casa Flora.</span>`}
      </label>
      <div class="field"><span>2. Abra os dados do produto e copie tudo</span>
        ${jsonUrl ? `<a class="btn ghost" href="${jsonUrl}" target="_blank" rel="noopener" style="justify-content:center">Abrir dados do produto ↗</a>
          <span class="hint">Abre uma página só com texto. Selecione tudo (no celular: toque e segure → “Selecionar tudo”; no computador: Ctrl+A ou ⌘A), copie e volte aqui.</span>`
          : `<span class="hint">O botão aparece quando o link do passo 1 estiver certo.</span>`}
      </div>
      <label class="field" for="cf-json"><span>3. Cole aqui o texto copiado</span>
        <textarea id="cf-json" data-input="cfjson" placeholder='{"product":{"title":"Vinho Tinto…' style="min-height:110px;font-family:ui-monospace,Menlo,monospace;font-size:13px">${esc(s.json||"")}</textarea> <!-- taste-skill-ignore: JSON colado da Casa Flora é código literal -->
      </label>
      <div class="field"><span>4. Cole a foto da garrafa</span>
        ${jsonUrl ? `<span class="hint">Abra a foto pelo botão abaixo (ou na página do vinho), toque e segure na imagem e escolha “Copiar imagem”. Depois cole na área tracejada. Pode colar mais de uma, se o item tiver várias garrafas.</span>` : ""}
        ${s.img ? `<a class="btn ghost" href="${esc(s.img)}" target="_blank" rel="noopener" style="justify-content:center">Abrir foto da Casa Flora ↗</a>` : ""}
        ${pasteZoneHtml("pz-import")}
        ${(s.photos||[]).length ? `<div class="pz-thumbs">${s.photos.map((u,i)=>`<figure><img src="${u}" alt="Foto ${i+1}"><button type="button" data-act="pzdel" data-i="${i}" aria-label="Remover foto ${i+1}">×</button></figure>`).join("")}</div>` : ""}
      </div>
      ${s.err ? `<div class="notice warn">${esc(s.err)}</div>` : ""}
      <span class="hint">Nome, descrição, país (com bandeira), uvas, tipo, categoria, produtor e harmonização são preenchidos sozinhos. Você confere e coloca o seu preço. A foto colada já entra na ficha.</span>
    </div>`,
    foot: `<button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="cfgo">Preencher ficha</button>`
  };
}
function handleFrom(link){ const m = String(link).match(/\/products\/([^/?#\s]+)/i); return m ? m[1].replace(/\.(json|js)$/i,"") : ""; }
const titleCase = s => String(s||"").toLowerCase().replace(/(^|[\s\-(])([a-zà-ÿ])/g,(m,a,b)=>a+b.toUpperCase()).replace(/\b(De|Da|Do|Di|Del|Dos|Das|E|La|Le)\b/g, m=>m.toLowerCase()).replace(/^./, m=>m.toUpperCase());
const PAIR = {"carnes-vermelhas":"Carnes vermelhas","massas-risotos":"Massas e risotos","queijos":"Queijos","aves":"Aves","peixes-frutos-do-mar":"Peixes e frutos do mar","aperitivos-entradas":"Aperitivos e entradas","embutidos-frios":"Embutidos e frios","sobremesas":"Sobremesas"};
function parseCasaFlora(text){
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if(a<0||b<a) throw new Error("Não encontrei os dados do produto no texto colado. Confira se copiou a página inteira do passo 2.");
  let j; try{ j = JSON.parse(text.slice(a,b+1)); }catch(e){ throw new Error("O texto colado está incompleto. Volte ao passo 2, selecione tudo de novo e copie."); }
  const p = j.product || j;
  if(!p || !p.title) throw new Error("Esse texto não parece ser de um produto da Casa Flora.");
  const title = String(p.title);
  const tags = (Array.isArray(p.tags) ? p.tags : String(p.tags||"").split(",")).map(t => norm(t));
  const T = norm(title + " " + (p.handle||"")), ptype = norm(p.product_type||"");
  const types = [];
  if(/\btinto\b/.test(T)) types.push("tinto");
  if(/\bbranco\b/.test(T)) types.push("branco");
  if(/\brose\b/.test(T)) types.push("rose");
  if(/vinho[ -]verde/.test(T)) types.push("verde");
  if(/espumante|frisante|lambrusco|prosecco|champagne|\bcava\b|brut/.test(T)) types.push("espumante");
  if(/\blicor\b/.test(T)) types.push("licor");
  if(!types.length) types.push("tinto");
  const cats = [];
  const C = ptype + " " + T;
  if(/demi/.test(C)) cats.push("demi-sec"); else if(/suave|doce|moscato/.test(C)) cats.push("suave"); else if(/seco|brut|nature/.test(C)) cats.push("seco");
  let country = "";
  for(const c of COUNTRIES){ if(tags.some(t => t===slug(c.name) || c.al.map(slug).includes(t))){ country = c.name; break; } }
  if(!country){ const words = T.split(/[^a-z-]+/); const c = COUNTRIES.find(c => c.al.some(a => words.includes(a))); if(c) country = c.name; }
  const grapes = tags.filter(t => t.startsWith("uva-")).map(t => t.slice(4)).map(s => GRAPE_BY_SLUG[s] || titleCase(s.replace(/-/g," ")));
  const pairing = tags.filter(t => t.startsWith("harmoniza-")).map(t => PAIR[t.slice(10)] || titleCase(t.slice(10).replace(/-/g," "))).join(", ");
  let name = title
    .replace(/\b\d+([.,]\d+)?\s?(ml|l|lt|litros?)\b/ig, "")
    .replace(/^\s*(vinho|espumante|frisante|licor)\s+/i, m => /verde/i.test(title) && /vinho/i.test(m) ? m : "")
    .replace(/\b(tinto|branco|ros[ée])\b/i, "")
    .replace(new RegExp("\\b(" + COUNTRIES.flatMap(c => c.al).filter(a => a.length>3 && !a.includes(" ")).join("|") + "|portugu[eê]s|portuguesa|franc[eê]s|alem[aã]o|liban[eê]s|italiana?|espanhola?)\\b","i"), "")
    .replace(/\s{2,}/g, " ").trim();
  name = name.replace(/^(vinho verde)\s+/i, "Vinho Verde ");
  const vol = (title.match(/(\d+([.,]\d+)?)\s?(ml|l)\b/i)||[])[0];
  const tmp = document.createElement("div"); tmp.innerHTML = String(p.body_html || p.description || "").replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n\n");
  const desc = (tmp.textContent||"").replace(/\n{3,}/g,"\n\n").trim();
  const serve = (desc.match(/sirva entre ([^.]+)/i)||[])[1] || "";
  let cost = p.variants && p.variants[0] ? p.variants[0].price : null;
  if(typeof cost === "number" && cost > 999) cost = cost/100;
  const img = (p.image && p.image.src) || (p.images && p.images[0] && (p.images[0].src || p.images[0])) || p.featured_image || "";
  const producer = titleCase(String(p.vendor||"").replace(/\b(s\.?\s?a\.?|ltda\.?|s\.?r\.?l\.?|spa|s\.?p\.?a\.?)\s*$/i,"").trim());
  return { wine: {...EMPTY(), name, producer, description: desc, country, grapes, types, categories: cats, volume: vol ? vol.replace(/\s*(ml|l)\s*$/i,(m,u)=>u.toLowerCase()==="ml"?" ml":" L") : "750 ml", pairing, serve: serve.replace(/\s*°\s*C/g," °C")}, cost, img: String(img).replace(/^\/\//,"https://") };
}

/* ============ contato e “sobre” ============ */
const waDigits = v => { let d = String(v||"").replace(/\D/g,""); if(!d) return ""; if(d.length<=11) d = "55"+d; return d.length>=12 ? d : ""; };
const fmtPhone = v => { const d = waDigits(v).replace(/^55/,""); return d.length===11 ? `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}` : d.length===10 ? `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}` : v; };
function settingsParts(){
  const s = ui.sheet.s;
  return {
    title: "Contato e “Sobre a Jane”",
    body: `<form class="form" id="sform">
      <label class="field" for="s-wa">WhatsApp para pedidos<input id="s-wa" name="whatsapp" inputmode="tel" value="${esc(s.whatsapp||"")}" placeholder="(27) 99999-9999"><span class="hint">Com DDD. Os pedidos chegam prontos neste número.</span></label>
      <label class="field" for="s-ig">Instagram<input id="s-ig" name="instagram" value="${esc(s.instagram||"")}" placeholder="@janevinhos"></label>
      <label class="field" for="s-city">Cidade ou região<input id="s-city" name="city" value="${esc(s.city||"")}"></label>
      <label class="field" for="s-title">Título da aba “A Jane”<input id="s-title" name="aboutTitle" value="${esc(s.aboutTitle||"")}"></label>
      <label class="field" for="s-about">Texto sobre a Jane<textarea id="s-about" name="about" rows="8">${esc(s.about||"")}</textarea><span class="hint">Deixe uma linha em branco para separar parágrafos.</span></label>
      <label class="field" for="s-pay">Formas de pagamento<textarea id="s-pay" name="payments" rows="4">${esc(s.payments ?? DEFAULT_PAY)}</textarea><span class="hint">Uma por linha. Aparecem na aba “A Jane” e no resumo do pedido.</span></label>
      <div class="field">Foto da Jane (opcional)
        <div class="seg"><label class="chip" style="cursor:pointer">${s.photo?"Trocar foto":"Enviar foto"}<input type="file" accept="image/*" class="sr" id="s-photo"></label>${s.photo?`<button type="button" class="chip" data-act="sphotodel">Voltar para a ilustração</button>`:""}</div>
        <span class="hint">Sem foto, a aba mostra a ilustração da marca.</span></div>
    </form>`,
    foot: `<button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="ssave">Salvar</button>`
  };
}

/* ============ publicação ============ */
function publishParts(){
  const st = ui.sheet.state || "ready";
  const n = DRAFT ? DRAFT.wines.length : 0;
  return {
    title: "Publicar catálogo",
    body: st==="busy" ? `<p>Publicando…</p>`
      : st==="readonly" ? `<div class="notice warn">Esta página está aberta só para leitura, então não dá para publicar daqui. Abra o catálogo pela sua conta do Claude.</div>`
      : st==="error" ? `<div class="notice warn">${esc(ui.sheet.msg||"Não foi possível publicar agora. Suas alterações continuam guardadas neste aparelho. Tente de novo em alguns minutos.")}</div>`
      : `<p style="margin:0 0 10px">O catálogo com <b>${n} vinhos</b> vai ficar visível para todo mundo que tem o link, com a data de hoje como “atualizado em”.</p><p class="hint" style="margin:0">Quem estiver com a página aberta vê a versão nova automaticamente.</p>`,
    foot: st==="ready" ? `<button class="btn ghost" data-act="close">Cancelar</button><button class="btn" data-act="publishgo" autofocus>Publicar agora</button>` : `<button class="btn ghost" data-act="close">Fechar</button>`
  };
}
const RESET = ":root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}";
// Refaz a página inteira com os dados novos, no formato que o claude.ai publica: o esqueleto fixo (só charset, viewport e o reset
// no <head>) e, no <body>, tudo que tem data-keep (título, estilos), os dados e os scripts. Assim nada se aninha numa republicação.
const SKELETON = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${RESET}</style></head><body>`;
function buildDocument(data){
  const json = JSON.stringify(data).replace(/</g,"\\u003c");
  const keep = [...document.querySelectorAll("[data-keep]")];
  const top = keep.filter(el => el.tagName!=="SCRIPT").map(el => el.outerHTML);
  const scripts = keep.filter(el => el.tagName==="SCRIPT").map(el => el.outerHTML);
  return SKELETON + "\n" + top.join("\n") + `\n<script type="application/json" id="app-data">${json}<\/script>\n<div id="app"></div>\n` + scripts.join("\n") + `\n</body></html>`;
}
async function doPublish(){
  ui.sheet.state = "busy"; render();
  const art = ui.art || await claude.use("artifact");
  if(!art){ ui.sheet.state = "error"; ui.sheet.msg = "A publicação não está disponível nesta visualização. Abra o catálogo no claude.ai pela sua conta."; render(); return; }
  const next = JSON.parse(JSON.stringify(DRAFT));
  next.updatedAt = new Date().toLocaleDateString("sv-SE");
  next.rev = (STATE.rev||1) + 1;
  try{
    await art.publish(buildDocument(next));
    LS.del("jv-draft");
    STATE = next; DRAFT = null; ui.dirty = false; ui.readOnlyNote = ""; ui.sheet = null; render(); toast("Catálogo publicado");
  }catch(e){
    const code = e && e.code;
    if(code==="conflict"){ ui.sheet.state="error"; ui.sheet.msg="Outra versão foi publicada ao mesmo tempo. A página vai recarregar; suas alterações continuam guardadas neste aparelho."; }
    else if(code==="not_writer" || code==="not_granted"){ ui.sheet.state="readonly"; ui.canEdit=false; }
    else if(code==="too_large" || /size|large/i.test(e&&e.message||"")){ ui.sheet.state="error"; ui.sheet.msg="O catálogo ficou grande demais para publicar. Tire algumas fotos repetidas ou vinhos antigos e tente de novo."; }
    else { ui.sheet.state="error"; ui.sheet.msg=null; }
    render();
  }
}
