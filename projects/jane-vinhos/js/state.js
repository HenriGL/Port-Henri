/* Estado da interface, rascunho de edição, opções/estoque de cada vinho, filtros e ordenação */
"use strict";

/* ============ estado da interface ============ */
const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} }
};
const ui = {
  tab: location.hash === "#jane" ? "jane" : "vinhos",
  q: "", types: new Set(), cats: new Set(), grapes: new Set(), countries: new Set(),
  pmin: null, pmax: null, hideOut: false,
  sort: LS.get("jv-sort", "desc"),
  canEdit: false, editMode: false, art: null, readOnlyNote: "",
  sheet: null,
  fopen: new Set(["price","types"]), allGrapes: false, // grupos de filtro abertos
  outOpen: new Set(), // prateleiras com os esgotados à mostra
  reveal: true, // entradas animadas só até a primeira interação com filtros/busca
};
let DRAFT = null;            // cópia editável (só para quem edita)
let bag = LS.get("jv-bag", []); // [{id, variant, qty}]

const live = () => (ui.editMode && DRAFT) ? DRAFT : STATE;
const wines = () => live().wines;
const settings = () => live().settings || {};
const byId = id => wines().find(w => w.id === id);
const draftStamp = () => STATE.updatedAt + ":" + STATE.rev;

function loadDraft(){
  const d = LS.get("jv-draft", null);
  if(d && d.data){
    DRAFT = d.data; ui.dirty = JSON.stringify(DRAFT) !== JSON.stringify(STATE);
    if(d.base !== draftStamp()) ui.readOnlyNote = "Uma versão mais nova do catálogo foi publicada depois destas alterações. Revise antes de publicar, para não sobrescrever nada.";
    return true;
  }
  return false;
}
function ensureDraft(){ if(!DRAFT) DRAFT = JSON.parse(JSON.stringify(STATE)); }
function changed(){
  ensureDraft(); ui.dirty = true;
  if(!LS.set("jv-draft", {base: draftStamp(), data: DRAFT})) toast("O rascunho ficou grande demais para guardar neste navegador. Publique logo para não perder as mudanças.");
  render();
}
const dirty = () => !!DRAFT && ui.dirty;

/* ---- opções (várias garrafas no mesmo item) ---- */
const isMulti = w => (w.bottles||[]).length > 1;
const stockOf = (w,i) => { const v = isMulti(w) ? ((w.bottles||[])[i]||{}).stock : w.stock; return typeof v==="number" && isFinite(v) ? v : null; };
function setStock(w,i,v){ v = (v==null || v==="") ? null : Math.max(0, Math.round(+v)); if(v!=null && isNaN(v)) return; const o = isMulti(w) ? w.bottles[i] : w; if(v==null) delete o.stock; else o.stock = v; }
const optOut = (w,i) => w.status==="esgotado" || ((w.bottles||[])[i]||{}).status==="esgotado" || stockOf(w,i)===0;
const wineOut = w => isMulti(w) ? w.bottles.every((b,i)=>optOut(w,i)) : optOut(w,0);
const maxQty = (w,i) => { const st = stockOf(w,i); return st==null ? 48 : Math.min(48, st); };
const inBag = (id,i) => (bag.find(b=>b.id===id && (b.variant||0)===i)||{}).qty || 0;
function optLabel(w,i){ const b=(w.bottles||[])[i]; return (b && b.label) || ("Opção "+(i+1)); }
function optName(w,i){
  if(!isMulti(w)) return w.name;
  const lab = ((w.bottles[i]||{}).label||"").trim(); if(!lab) return `${w.name} (opção ${i+1})`;
  const low = w.name.toLowerCase();
  const hits = w.bottles.map(b => (b.label||"").trim()).filter(Boolean).map(l => [low.indexOf(l.toLowerCase()), l]).filter(h => h[0] >= 0);
  if(hits.length){
    const first = Math.min(...hits.map(h=>h[0]));
    const last = Math.max(...hits.map(h=>h[0]+h[1].length));
    return (w.name.slice(0,first).replace(/[\s,]+$/,"") + " " + lab + " " + w.name.slice(last).replace(/^[\s,]+/,"")).replace(/\s+/g," ").trim();
  }
  if(norm(lab).split(" ")[0] === norm(w.name).split(" ")[0]) return lab;
  return `${w.name} — ${lab}`;
}
function optGrapes(w,i){
  const b = (w.bottles||[])[i]; if(!isMulti(w) || !b) return w.grapes||[];
  if(b.grape) return [b.grape];
  const L = norm(b.label);
  const own = (w.grapes||[]).filter(g => L.includes(norm(g)));
  if(own.length) return own;
  const known = GRAPES.filter(g => g!=="Blend" && L.includes(norm(g)));
  return known.length ? known : (w.grapes||[]);
}
const optTypes = (w,i) => { const b=(w.bottles||[])[i]; return isMulti(w) && b && b.type ? [b.type] : (w.types||[]); };
function optSummary(w,i){
  const t = optTypes(w,i).map(typeLabel).join(" / "), g = optGrapes(w,i).join(", ");
  return [t, g && norm(g)!==norm(optLabel(w,i)) ? g : ""].filter(Boolean).join(" · ");
}

/* ============ filtros e ordenação ============ */
function priceOf(w){ return w.price==null || w.price==="" ? null : Number(w.price); }
function matches(w, skip){
  if(ui.hideOut && wineOut(w)) return false;
  if(skip!=="types" && ui.types.size && !(w.types||[]).some(t => ui.types.has(t))) return false;
  if(skip!=="cats" && ui.cats.size && !(w.categories||[]).some(t => ui.cats.has(t))) return false;
  if(skip!=="grapes" && ui.grapes.size && !(w.grapes||[]).some(g => ui.grapes.has(g))) return false;
  if(skip!=="countries" && ui.countries.size && !ui.countries.has(countryName(w.country))) return false;
  const p = priceOf(w);
  if(ui.pmin!=null && (p==null || p < ui.pmin)) return false;
  if(ui.pmax!=null && (p==null || p > ui.pmax)) return false;
  if(ui.q){
    const hay = norm([w.name, w.producer, (w.grapes||[]).join(" "), countryName(w.country), (w.bottles||[]).map(b=>b.label).join(" "), (w.types||[]).join(" "), w.region, w.pairing].join(" "));
    if(!norm(ui.q).split(/\s+/).every(t => hay.includes(t))) return false;
  }
  return true;
}
function sorted(list){
  const s = ui.sort, out = list.slice();
  out.sort((a,b) => {
    const oa = wineOut(a), ob = wineOut(b);
    if(oa!==ob) return oa ? 1 : -1;
    if(s==="az") return a.name.localeCompare(b.name,"pt-BR");
    const pa = priceOf(a), pb = priceOf(b);
    if(pa==null && pb==null) return 0; if(pa==null) return 1; if(pb==null) return -1;
    return s==="asc" ? pa-pb : pb-pa;
  });
  return out;
}
const facetCount = (key, val) => wines().filter(w => matches(w, key)).filter(w => {
  if(key==="types") return (w.types||[]).includes(val);
  if(key==="cats") return (w.categories||[]).includes(val);
  if(key==="grapes") return (w.grapes||[]).includes(val);
  if(key==="countries") return countryName(w.country)===val;
}).length;
const activeCount = () => ui.types.size+ui.cats.size+ui.grapes.size+ui.countries.size+(ui.pmin!=null||ui.pmax!=null?1:0)+(ui.hideOut?1:0);

/* ============ prateleiras (seções do catálogo) ============ */
// As indicações da Jane abrem o catálogo; depois, todos os rótulos numa prateleira só (as indicações levam a pílula)
const SHELVES = [
  {k:"picks", l:"Indicações da Jane", note:"A seleção pessoal da Jane para começar."},
  {k:"todos", l:"Vinhos", note:"Rótulos disponíveis no catálogo da Jane."}
];
const shelves = list => SHELVES
  .map(s => ({...s, items: s.k==="picks" ? list.filter(w => w.pick) : list}))
  .filter(s => s.items.length);
