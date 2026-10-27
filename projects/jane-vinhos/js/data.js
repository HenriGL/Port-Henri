/* Dados de referência: imagens da marca, tipos, países (bandeiras), uvas e utilitários de texto */
"use strict";
document.documentElement.lang = "pt-BR"; // o esqueleto publicado pelo claude.ai não traz o idioma

/* ============ dados de referência ============ */
// Endereços absolutos: url() dentro de variável CSS (--m) é resolvida a partir da folha de estilo, não da página
const ASSETS = Object.fromEntries(Object.entries({
  logo: "assets/logo.webp",
  bolhas: "assets/bolhas.webp",
  brilhos: "assets/brilhos.webp",
  jane: "assets/jane.webp",
  bottle: "assets/bottle.webp",
  glassesColor: "assets/glasses-color.webp",
  tacas: "assets/painel-tacas.png",
  icWhatsapp: "assets/icone-whatsapp.svg",
  icInstagram: "assets/icone-instagram.svg",
  icPessoa: "assets/icone-pessoa.svg"
}).map(([k, p]) => [k, new URL(p, document.baseURI).href]));
let STATE = JSON.parse(document.getElementById("app-data").textContent);
STATE.rev = STATE.rev || 1;

const TYPES = [
  {k:"tinto", l:"Tinto"}, {k:"branco", l:"Branco"}, {k:"rose", l:"Rosé"}, {k:"verde", l:"Verde"},
  {k:"espumante", l:"Espumante e frisante"}, {k:"licor", l:"Licor"}
];
const CATS = [{k:"seco", l:"Seco"}, {k:"demi-sec", l:"Demi-sec"}, {k:"suave", l:"Suave"}];
const PRICE_PRESETS = [{l:"Até R$ 60", a:null, b:60}, {l:"R$ 60–100", a:60, b:100}, {l:"R$ 100–150", a:100, b:150}, {l:"Acima de R$ 150", a:150, b:null}];

const norm = s => String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().trim();
const esc = s => String(s??"").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const brl = n => n==null||n==="" ? "" : Number(n).toLocaleString("pt-BR",{minimumFractionDigits: Number(n)%1?2:0, maximumFractionDigits:2});

/* bandeiras em SVG (viewBox 36×36, recortadas em círculo pelo CSS) */
const STAR = (x,y,r,f) => { let p=""; for(let i=0;i<10;i++){const a=Math.PI/5*i-Math.PI/2, rr=i%2?r*.42:r; p+=(i?"L":"M")+(x+rr*Math.cos(a)).toFixed(2)+" "+(y+rr*Math.sin(a)).toFixed(2);} return `<path d="${p}Z" fill="${f}"/>`; };
const SUN = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F6B40E" stroke="#85340A" stroke-width=".5"/>`;
const H3 = (a,b,c) => `<rect width="36" height="12" fill="${a}"/><rect y="12" width="36" height="12" fill="${b}"/><rect y="24" width="36" height="12" fill="${c}"/>`;
const V3 = (a,b,c) => `<rect width="12" height="36" fill="${a}"/><rect x="12" width="12" height="36" fill="${b}"/><rect x="24" width="12" height="36" fill="${c}"/>`;
const COUNTRIES = [
  {name:"Argentina", al:["argentino","argentina"], svg:H3("#74ACDF","#fff","#74ACDF")+SUN(18,18,3.4)},
  {name:"Chile", al:["chileno","chilena","chile"], svg:`<rect width="36" height="18" fill="#fff"/><rect y="18" width="36" height="18" fill="#D52B1E"/><rect width="16" height="18" fill="#0039A6"/>`+STAR(8,9,4,"#fff")},
  {name:"Itália", al:["italiano","italiana","italia"], svg:V3("#009246","#fff","#CE2B37")},
  {name:"Portugal", al:["portugues","portuguesa","portugal"], svg:`<rect width="36" height="36" fill="#DA291C"/><rect width="15" height="36" fill="#046A38"/><circle cx="15" cy="18" r="6.5" fill="#FFE000" stroke="#000" stroke-width=".3"/><path d="M11.8 14.2h6.4v4.6a3.2 3.2 0 0 1-6.4 0z" fill="#fff" stroke="#DA291C" stroke-width="1.2"/>`},
  {name:"Espanha", al:["espanhol","espanhola","espanha","spain"], svg:`<rect width="36" height="36" fill="#AA151B"/><rect y="9" width="36" height="18" fill="#F1BF00"/><rect x="9" y="14" width="5" height="7" rx="1" fill="#AA151B"/>`},
  {name:"França", al:["frances","francesa","franca","france"], svg:V3("#0055A4","#fff","#EF4135")},
  {name:"Uruguai", al:["uruguaio","uruguaia","uruguai","uruguay"], svg:`<rect width="36" height="36" fill="#fff"/>`+[4,12,20,28].map(y=>`<rect x="0" y="${y}" width="36" height="4" fill="#0038A8"/>`).join("")+`<rect width="17" height="20" fill="#fff"/>`+SUN(8.5,10,4)},
  {name:"Brasil", al:["brasileiro","brasileira","brasil","brazil"], svg:`<rect width="36" height="36" fill="#009C3B"/><path d="M18 6 33 18 18 30 3 18z" fill="#FFDF00"/><circle cx="18" cy="18" r="6.4" fill="#002776"/><path d="M11.8 16.6c4.4-1 9-.4 12.3 1.6l-.4 1.1c-3.2-1.9-7.6-2.5-11.8-1.5z" fill="#fff"/>`},
  {name:"África do Sul", al:["africa do sul","sul-africano","sul africano","sul-africana","south africa"], svg:`<rect width="36" height="18" fill="#E03C31"/><rect y="18" width="36" height="18" fill="#001489"/><path d="M0 4 16 18 0 32z" fill="#FFB81C"/><path d="M0 0h5l15 14h16v8H20L5 36H0V30l13-12L0 6z" fill="#fff"/><path d="M0 3h3l15.5 13.5H36v3H18.5L3 33H0v-2l14-13L0 5z" fill="#007749"/><path d="M0 8.5 10.5 18 0 27.5z" fill="#000"/>`},
  {name:"Austrália", al:["australiano","australiana","australia"], svg:`<rect width="36" height="36" fill="#012169"/><path d="M0 0l18 18M18 0 0 18" stroke="#fff" stroke-width="3.6"/><path d="M0 0l18 18M18 0 0 18" stroke="#C8102E" stroke-width="1.2"/><path d="M9 0v18M0 9h18" stroke="#fff" stroke-width="5"/><path d="M9 0v18M0 9h18" stroke="#C8102E" stroke-width="3"/>`+STAR(9,27,3.2,"#fff")+STAR(27,10,1.8,"#fff")+STAR(24,21,1.8,"#fff")+STAR(30,26,1.8,"#fff")},
  {name:"Alemanha", al:["alemao","alema","alemanha","germany"], svg:H3("#000","#DD0000","#FFCE00")},
  {name:"Estados Unidos", al:["eua","usa","estados unidos","americano","americana","california"], svg:`<rect width="36" height="36" fill="#fff"/>`+[0,5.6,11.2,16.8,22.4,28,33.6].map(y=>`<rect y="${y}" width="36" height="2.8" fill="#B22234"/>`).join("")+`<rect width="18" height="19.6" fill="#3C3B6E"/>`+[[5,5],[11,5],[8,9.5],[5,14],[11,14]].map(([x,y])=>STAR(x,y,1.6,"#fff")).join("")},
  {name:"Nova Zelândia", al:["nova zelandia","neozelandes","new zealand"], svg:`<rect width="36" height="36" fill="#012169"/><path d="M9 0v18M0 9h18" stroke="#fff" stroke-width="5"/><path d="M9 0v18M0 9h18" stroke="#C8102E" stroke-width="3"/>`+[[26,10],[22,19],[30,18],[26,28]].map(([x,y])=>STAR(x,y,2.2,"#C8102E")).join("")},
  {name:"Líbano", al:["libano","libanes","libanesa"], svg:`<rect width="36" height="36" fill="#fff"/><rect width="36" height="9" fill="#ED1C24"/><rect y="27" width="36" height="9" fill="#ED1C24"/><path d="M18 11 25 24H11z" fill="#00A651"/><rect x="17" y="23" width="2" height="3" fill="#00A651"/>`},
  {name:"Hungria", al:["hungaro","hungara","hungria"], svg:H3("#CE2939","#fff","#477050")},
  {name:"Áustria", al:["austriaco","austriaca","austria"], svg:H3("#ED2939","#fff","#ED2939")},
  {name:"Romênia", al:["romeno","romena","romenia"], svg:V3("#002B7F","#FCD116","#CE1126")},
  {name:"Grécia", al:["grego","grega","grecia"], svg:`<rect width="36" height="36" fill="#0D5EAF"/>`+[4,12,20,28].map(y=>`<rect y="${y}" width="36" height="4" fill="#fff"/>`).join("")+`<rect width="20" height="20" fill="#0D5EAF"/><path d="M10 0v20M0 10h20" stroke="#fff" stroke-width="4"/>`},
  {name:"Moldávia", al:["moldavo","moldava","moldavia"], svg:V3("#0046AE","#FFD200","#CC092F")},
];
const GLOBE = `<rect width="36" height="36" fill="#b8916a"/><circle cx="18" cy="18" r="10" fill="none" stroke="#f3ebd8" stroke-width="1.6"/><ellipse cx="18" cy="18" rx="4.5" ry="10" fill="none" stroke="#f3ebd8" stroke-width="1.4"/><path d="M8 18h20" stroke="#f3ebd8" stroke-width="1.4"/>`;
function findCountry(txt){
  const n = norm(txt); if(!n) return null;
  return COUNTRIES.find(c => norm(c.name)===n || c.al.includes(n)) || COUNTRIES.find(c => c.al.some(a => a.length>=5 && n.includes(a))) || null;
}
const flagSvg = name => { const c = findCountry(name); return `<svg viewBox="0 0 36 36" aria-hidden="true">${c ? c.svg : GLOBE}</svg>`; };
const countryName = name => (findCountry(name)||{}).name || String(name||"").trim();

const GRAPES = ["Aglianico","Albariño","Alicante Bouschet","Alvarinho","Aragonez","Arinto","Barbera","Blend","Bonarda","Cabernet Franc","Cabernet Sauvignon","Carignan","Carménère","Chardonnay","Chenin Blanc","Corvina","Fernão Pires","Gamay","Garnacha","Gewürztraminer","Glera","Grenache","Lambrusco","Loureiro","Malbec","Merlot","Montepulciano","Moscatel","Moscato","Nebbiolo","Negroamaro","Nero d'Avola","Petit Verdot","Pinot Grigio","Pinot Noir","Pinotage","Primitivo","Riesling","Sangiovese","Sauvignon Blanc","Sémillon","Shiraz","Syrah","Tannat","Tempranillo","Torrontés","Touriga Franca","Touriga Nacional","Trebbiano","Verdejo","Vermentino","Viognier","Zinfandel"];
const slug = s => norm(s).replace(/['’]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const GRAPE_BY_SLUG = Object.fromEntries(GRAPES.map(g => [slug(g), g]));
