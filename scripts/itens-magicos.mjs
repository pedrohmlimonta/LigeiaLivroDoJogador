// Compêndio ITENS MÁGICOS (packs-source/itens-magicos): um item pronto para
// cada grau de cada Propriedade para Itens Mágicos do livro (Sessão 11) —
// Poção de Cura de 1, 2 e 3 PV, Anel de Carvalho Menor, Intermediário e
// Maior... —, encantado pelo próprio Encantamento de Itens do módulo
// (esmodules/encantamento.mjs). Cada um sai como sairia de um encantamento
// feito na ficha: as ações ✦ (a poção se bebe, a bomba se arremessa), a mana
// da propriedade (o nível dela), o texto do livro, o preço somado e a receita
// para desfazer ou tornar lendário.
//
//   - Base: o equipamento do livro quando existe (armas, armaduras, escudos,
//     focos, lanterna, munições...), com os ataques e a animação do golpe; os
//     demais tipos (anéis, capas, poções...) nascem de um item simples, com a
//     frase do livro sobre o tipo (Sessão 17, Tipos de Itens Mágicos).
//   - Nível do item = nível do preço (Menor, Intermediário, Maior), com uma
//     palavra só; a mana de cada uso é a desse nível (1, 2 ou 3 PM).
//   - A descrição diz também o nível de TESOURO (Sessão 17): o preço da
//     propriedade é o de uma linha das tabelas de Consumíveis e Equipamentos
//     Mágicos.
//   - Pastas por tipo (as do livro) e, dentro, por nível; os venenos (noxia)
//     ficam juntos numa pasta.
//
// Chamado pelo generate.py DEPOIS de animar o compêndio (as bases já vêm com
// as animações) e antes de validar. As pastas não ficam em packs-source (os
// leitores de lá esperam só itens): o compile-packs.mjs pede pastasUsadas().
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PACK = "itens-magicos";

/* ------------------------------------------------------------------ */
/*  O mínimo do Foundry para carregar o módulo no Node                 */
/* ------------------------------------------------------------------ */

const ESCAPE = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };
let semente = 1;
const aleatorio = () => { semente = (Math.imul(semente, 1103515245) + 12345) >>> 0; return semente / 2 ** 32; };
const LETRAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
globalThis.foundry ??= {};
globalThis.foundry.utils ??= {};
globalThis.foundry.utils.escapeHTML ??= (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ESCAPE[c]);
// Ids das receitas: determinísticos (a semente é a de cada item), para o
// build não reescrever os arquivos a cada vez.
globalThis.foundry.utils.randomID = (n = 16) => Array.from({ length: n }, () => LETRAS[Math.floor(aleatorio() * LETRAS.length)]).join("");
globalThis.foundry.applications ??= { api: { ApplicationV2: class {} } };
globalThis.Hooks ??= { on() {}, once() {} };
globalThis.game ??= { user: { isGM: false }, packs: new Map(), items: [] };
globalThis.ui ??= { notifications: { info() {}, warn() {} } };

const { PROPRIEDADES, NOME_DO_NIVEL, construirEncantamento, tiposDoItem, compativel } =
  await import("../esmodules/encantamento.mjs");
const { chaveSegura } = await import("../esmodules/animacoes.mjs");

/* ------------------------------------------------------------------ */
/*  Ids (mesmo algoritmo do make_id de scripts/builders.py)             */
/* ------------------------------------------------------------------ */

export function makeId(...partes) {
  const h = crypto.createHash("sha1").update(partes.map(String).join("|"), "utf8").digest("hex");
  return [...h.slice(0, 16)].map((c) => "abcdefghijklmnop"[parseInt(c, 16)]).join("");
}

/* ------------------------------------------------------------------ */
/*  O que entra                                                        */
/* ------------------------------------------------------------------ */

/**
 * Fora do compêndio. Poção de Mana: não faz sentido gastar mana para
 * recuperar mana (decisão da mesa). A propriedade continua no Encantamento.
 */
export const FORA = new Set(["energio-mana"]);

/** Os venenos (noxia que envenena o alvo) ficam juntos numa pasta. */
export const VENENOS = new Set(["noxia-explosao-toxica", "noxia-nocivo", "noxia-dano-de-veneno", "noxia-nevoa-sufocante"]);

/* ------------------------------------------------------------------ */
/*  Pastas (Sessão 17, Tipos de Itens Mágicos)                          */
/* ------------------------------------------------------------------ */

const CONSUMIVEIS = "São itens alquímicos que são consumidos quando utilizados.";
export const GRUPOS = {
  pocoes: { nome: "Poções", livro: CONSUMIVEIS, img: "icons/svg/heal.svg" },
  bombas: { nome: "Bombas Alquímicas", livro: CONSUMIVEIS, img: "icons/svg/explosion.svg" },
  oleos: { nome: "Óleos e Pedras", livro: CONSUMIVEIS, img: "icons/svg/item-bag.svg" },
  venenos: { nome: "Venenos", livro: "Itens criados ou aprimorados com a runa de noxia, a palavra arcana que manipula magicamente todo tipo de toxina.", img: "icons/svg/poison.svg" },
  armas: { nome: "Armas", livro: "São itens que podem ser empunhados com uma ou duas mãos, dependendo da arma.", img: "icons/svg/sword.svg" },
  municoes: { nome: "Munições", livro: "Munições para armas de artilharia.", img: "icons/svg/item-bag.svg" },
  armaduras: { nome: "Armaduras e Robes", livro: "São itens que podem ser equipados no torso do personagem.", img: "icons/svg/cowled.svg" },
  escudos: { nome: "Escudos", livro: "São itens que podem ser empunhados com uma das mãos.", img: "icons/svg/shield.svg" },
  capas: { nome: "Capas", livro: "São itens que podem ser equipados nos ombros.", img: "icons/svg/cowled.svg" },
  cabeca: { nome: "Elmos, Máscaras, Coroas, Lentes, Bandanas e Tiaras", livro: "São itens que podem ser equipados na cabeça.", img: "icons/svg/eye.svg" },
  pescoco: { nome: "Colares, Periaptos e Amuletos", livro: "São itens que podem ser equipados no pescoço.", img: "icons/svg/aura.svg" },
  bracadeiras: { nome: "Braçadeiras", livro: "São itens que podem ser equipados nos braços.", img: "icons/svg/combat.svg" },
  luvas: { nome: "Luvas e Manoplas", livro: "São itens que podem ser equipados nas mãos.", img: "icons/svg/combat.svg" },
  aneis: { nome: "Anéis", livro: "São itens que podem ser equipados nos dedos, mas apenas um por mão.", img: "icons/svg/target.svg" },
  cintos: { nome: "Cintos e Faixas", livro: "São itens que podem ser equipados na cintura.", img: "icons/svg/upgrade.svg" },
  botas: { nome: "Botas e Sandálias", livro: "São itens que podem ser equipados nos pés.", img: "icons/svg/falling.svg" },
  focos: { nome: "Focos", livro: "São itens que podem ser empunhados com uma das mãos, exceto o instrumento musical.", img: "icons/svg/sun.svg" },
  ionicas: { nome: "Pedras Iônicas", livro: "Pedras que orbitam ao redor de quem as usa.", img: "icons/svg/sun.svg" },
  selas: { nome: "Selas", livro: "São itens que podem ser equipados em uma montaria.", img: "icons/svg/pawprint.svg" },
  maravilhosos: { nome: "Itens Maravilhosos", livro: "Quaisquer itens que não pertençam as categorias acima são chamados de itens maravilhosos.", img: "icons/svg/item-bag.svg" },
};

const GRUPO_DO_TIPO = {
  pocao: "pocoes", bomba: "bombas", oleo: "oleos", pedra: "oleos",
  arma: "armas", arma_corte: "armas", arma_perfuracao: "armas", arma_concussao: "armas",
  laminas_pequenas: "armas", adaga: "armas", dardo: "armas", arco: "armas", besta: "armas",
  arremesso: "armas", maca: "armas", martelo: "armas", municao: "municoes",
  armadura: "armaduras", robe: "armaduras", escudo: "escudos", capa: "capas",
  elmo: "cabeca", mascara: "cabeca", tiara: "cabeca", bandana: "cabeca", coroa: "cabeca", lente: "cabeca",
  colar: "pescoco", periapto: "pescoco", amuleto: "pescoco",
  bracadeira: "bracadeiras", luva: "luvas", manopla: "luvas", anel: "aneis",
  cinto: "cintos", faixa: "cintos", bota: "botas", sandalia: "botas",
  cajado: "focos", bastao: "focos", varinha: "focos", orbe: "focos", totem: "focos", simbolo: "focos",
  instrumento: "focos", espelho: "focos", cristal: "focos",
  pedra_ionica: "ionicas", sela: "selas",
};

/* ------------------------------------------------------------------ */
/*  Bases                                                              */
/* ------------------------------------------------------------------ */

// Do compêndio de equipamentos (o item do livro, com descrição, preço, peso e
// ataques). Onde há mais de uma, elas se revezam entre as propriedades.
const DO_COMPENDIO = {
  arma: ["Espada Longa", "Machado de Batalha", "Arco Longo", "Lança Curta", "Martelo de Guerra", "Besta Leve",
    "Maça Estrela", "Cimitarra", "Espada Grande", "Machado Grande", "Florete", "Mangual"],
  arma_corte: ["Espada Longa"], arma_perfuracao: ["Florete"], arma_concussao: ["Martelo de Guerra"],
  laminas_pequenas: ["Espada Curta"], adaga: ["Adaga"], dardo: ["Dardo"], arco: ["Arco Longo"], besta: ["Besta Leve"],
  arremesso: ["Machado de Mão"], maca: ["Maça"], martelo: ["Martelo de Guerra"],
  municao: ["Flechas", "Virotes", "Balas de Funda"],
  armadura: ["Cota de Malha", "Armadura de Couro", "Armadura de Escamas", "Armadura de Peles", "Armadura de Placas"],
  escudo: ["Escudo de Metal"],
  cajado: ["Cajado"], orbe: ["Orbe"], bastao: ["Bastão"], varinha: ["Varinha"], totem: ["Totem"],
  simbolo: ["Símbolo Sagrado / Profano"], instrumento: ["Instrumento Musical"], espelho: ["Espelho"],
  lanterna: ["Lanterna"], mochila: ["Mochila (vazia)"], saco_de_dormir: ["Saco de Dormir"], estrepes: ["Estrepes"],
  cantil: ["Cantil"],
};
// Nome no item mágico e gênero/número (para concordar os adjetivos).
const NOME_DA_BASE = {
  "Espada Longa": "fs", "Machado de Batalha": "ms", "Arco Longo": "ms", "Lança Curta": "fs", "Martelo de Guerra": "ms",
  "Besta Leve": "fs", "Maça Estrela": "fs", "Cimitarra": "fs", "Espada Grande": "fs", "Machado Grande": "ms",
  "Florete": "ms", "Mangual": "ms", "Espada Curta": "fs", "Adaga": "fs", "Dardo": "ms", "Machado de Mão": "ms",
  "Maça": "fs", "Flechas": "fp", "Virotes": "mp", "Balas de Funda": "fp", "Cota de Malha": "fs",
  "Armadura de Couro": "fs", "Armadura de Escamas": "fs", "Armadura de Peles": "fs", "Armadura de Placas": "fs",
  "Escudo": "ms", "Cajado": "ms", "Orbe": "ms", "Bastão": "ms", "Varinha": "fs", "Totem": "ms",
  "Símbolo Sagrado": "ms", "Instrumento Musical": "ms", "Espelho": "ms", "Lanterna": "fs", "Mochila": "fs",
  "Saco de Dormir": "ms", "Estrepes": "mp", "Cantil": "ms",
};
const RENOMEAR = { "Escudo de Metal": "Escudo", "Símbolo Sagrado / Profano": "Símbolo Sagrado", "Mochila (vazia)": "Mochila" };

// Tipos sem item no livro: um item simples, com a frase do livro sobre o tipo.
const SINTETICOS = {
  anel: ["Anel", "ms"], amuleto: ["Amuleto", "ms"], colar: ["Colar", "ms"], periapto: ["Periapto", "ms"],
  faixa: ["Faixa", "fs"], cinto: ["Cinto", "ms"], bota: ["Botas", "fp"], sandalia: ["Sandálias", "fp"],
  bracadeira: ["Braçadeiras", "fp"], luva: ["Luvas", "fp"], manopla: ["Manoplas", "fp"], elmo: ["Elmo", "ms"],
  mascara: ["Máscara", "fs"], tiara: ["Tiara", "fs"], bandana: ["Bandana", "fs"], coroa: ["Coroa", "fs"],
  lente: ["Lentes", "fp"], cristal: ["Cristal", "ms"], pedra_ionica: ["Pedra Iônica", "fs"], pedra: ["Pedra", "fs"],
  pocao: ["Poção", "fs"], bomba: ["Bomba", "fs", "Bomba Alquímica"], oleo: ["Óleo", "ms"], chave: ["Chave", "fs"],
  cubo: ["Cubo", "ms"], estatueta: ["Estatueta", "fs"], mapa: ["Mapa", "ms"], bussola: ["Bússola", "fs"],
  baralho: ["Baralho", "ms"], sinete: ["Sinete", "ms"], sela: ["Sela", "fs"], disco: ["Disco", "ms"],
  tapete: ["Tapete", "ms"], incensorio: ["Incensório", "ms"], involucro: ["Invólucro", "ms"], bainha: ["Bainha", "fs"],
  algemas: ["Algemas", "fp"], capa: ["Capa", "fs"], robe: ["Robe", "ms"], bolsa: ["Bolsa", "fs"],
};

/** "Qualquer item": a base escolhida para a propriedade. */
const QUALQUER = { "kreo-indestrutivel": "escudo", "lumo-brilhante": "arma_corte" };
/** Tipo preferido quando o livro dá vários (o que automatiza mais). */
const PREFERIDO = { "exitium-explosivo": "adaga" };

/* ------------------------------------------------------------------ */
/*  Nomes                                                              */
/* ------------------------------------------------------------------ */

/** Flexões de um adjetivo pelo masculino singular (cada palavra concorda). */
export function flexoes(m) {
  const palavra = (w) => {
    if (/ão$/.test(w)) return { ms: w, fs: w.replace(/ão$/, "ã"), mp: w.replace(/ão$/, "ões"), fp: w.replace(/ão$/, "ãs") };
    if (/o$/.test(w)) { const r = w.slice(0, -1); return { ms: w, fs: `${r}a`, mp: `${w}s`, fp: `${r}as` }; }
    if (/or$/.test(w)) return { ms: w, fs: `${w}a`, mp: `${w}es`, fp: `${w}as` };
    if (/e$/.test(w)) return { ms: w, fs: w, mp: `${w}s`, fp: `${w}s` };
    if (/ível$/.test(w)) { const p = w.replace(/ível$/, "íveis"); return { ms: w, fs: w, mp: p, fp: p }; }
    if (/al$/.test(w)) { const p = w.replace(/al$/, "ais"); return { ms: w, fs: w, mp: p, fp: p }; }
    if (/[rz]$/.test(w)) return { ms: w, fs: w, mp: `${w}es`, fp: `${w}es` };
    return { ms: w, fs: w, mp: w, fp: w };
  };
  const partes = String(m).split(" ").map(palavra);
  const junta = (k) => partes.map((p) => p[k]).join(" ");
  return { ms: junta("ms"), fs: junta("fs"), mp: junta("mp"), fp: junta("fp") };
}

// Propriedades com nome de adjetivo: concordam com o item ("Flechas Nocivas").
const ADJETIVO = {
  "acida-corrosiva": "Corrosivo", "augurado-cacadora-temporal": "Caçador Temporal",
  "augurado-guardiao-temporal": "Guardião Temporal", "augurado-vigilante-temporal": "Vigilante Temporal",
  "carmo-aterradora": "Aterrador", "carmo-atordoante": "Atordoante", "devena-primitivo": "Primitivo",
  "exitium-esmagador": "Esmagador", "exitium-explosivo": "Explosivo", "exitium-lamina-afiada": "Afiado",
  "exitium-penetrante": "Penetrante", "exitium-potencializador": "Potencializador", "fulgur-chocante": "Chocante",
  "fulgur-receptor": "Receptor", "glacios-congelante": "Congelante", "ignis-ardente": "Ardente",
  "ignis-incandescente": "Incandescente", "ignis-incendiaria": "Incendiário", "iluzio-nebulosa": "Nebuloso",
  "kreo-indestrutivel": "Indestrutível", "lumo-brilhante": "Brilhante", "lumo-prismatico": "Prismático",
  "lumo-solar": "Solar", "majesto-amplificador": "Amplificador", "majesto-extradimensional": "Extradimensional",
  "menso-flutuante": "Flutuante", "mortis-esqueletica": "Esquelético", "mortis-funebre": "Fúnebre",
  "mortis-lamina-vampirica": "Vampírico", "noxia-nocivo": "Nocivo", "noxia-perfido": "Pérfido",
  "pluribus-paradoxal": "Paradoxal", "saeculorum-veloz": "Veloz", "sangon-alado": "Alado",
  "sangon-anfibia": "Anfíbio", "sangon-aracnideo": "Aracnídeo", "sangon-bestial": "Bestial",
  "sangon-fundamental": "Fundamental", "sonigu-ecoante": "Ecoante", "sonigu-estrondante": "Estrondante",
  "sonigu-murmurante": "Murmurante", "sorcdiron-saltitantes": "Saltitante", "tenebrae-lugubre": "Lúgubre",
  "tenebrae-macabra": "Macabro", "vitae-vivido": "Vívido",
};
// Complemento que não é "de <Propriedade>".
const COMPLEMENTO = {
  "acida-guia-das-aguas": "Guia das Águas", "forjuri-espelho": "Espelho", "carmo-mente": "da Mente",
  "devena-predador": "do Predador", "devena-peregrino": "do Peregrino", "devena-sobrevivente": "do Sobrevivente",
  "iluzio-camaleao": "do Camaleão", "iluzio-quarto-fantasma": "do Quarto Fantasma", "inanis-vazio": "do Vazio",
  "inanis-magia-neutra": "da Magia Neutra", "sangon-joia": "da Jóia", "kreo-artesao": "do Artesão", "kreo-fortaleza": "da Fortaleza",
  "kreo-laminas-infinitas": "das Lâminas Infinitas", "krucigon-planos": "dos Planos", "majesto-atalho": "do Atalho",
  "majesto-dimensoes": "das Dimensões", "mortis-macula": "da Mácula", "mortis-perversao": "da Perversão",
  "mortis-pragas": "das Pragas", "noxia-apotecarios": "dos Apotecários", "pluribus-mimico": "do Mímico",
  "saeculorum-eras": "das Eras", "sankta-esplendor": "do Esplendor", "sorcdiron-arcanista": "do Arcanista",
  "sorcdiron-atirador": "do Atirador", "sorcdiron-corredor": "do Corredor",
  "sorcdiron-forca-do-gigante": "da Força do Gigante", "sorcdiron-vigor-da-rocha": "do Vigor da Rocha",
  "tenebrae-crepusculo": "do Crepúsculo", "tenebrae-sombras": "das Sombras", "traumato-pesadelos": "dos Pesadelos",
  "traumato-tormento": "do Tormento", "vitae-bom-descanso": "do Bom Descanso", "vitae-curandeiro": "do Curandeiro",
  "vitae-essencia": "da Essência",
};

/** "Anel de Invisibilidade", "Flechas Nocivas", "Cinto do Artesão". */
export function nomeBase(prop, base) {
  if (ADJETIVO[prop.id]) return `${base.nome} ${flexoes(ADJETIVO[prop.id])[base.gn]}`;
  return `${base.nome} ${COMPLEMENTO[prop.id] ?? `de ${prop.nome}`}`;
}

/** "1 Ponto de Vida" → "1 PV" (o resto fica). */
const rotuloCurto = (r) => String(r ?? "").replace(/\bPontos? de Vida\b/, "PV").replace(/\bPontos? de Magia\b/, "PM").trim();

/**
 * O que distingue os itens da mesma propriedade: o nível ("Menor"), ou o
 * grau quando há mais de um no mesmo nível (as poções: "1 PV", "2 PV"...).
 */
export function sufixo(v, irmas) {
  const nivel = NOME_DO_NIVEL[v.nivel];
  if (irmas.filter((x) => x.nivel === v.nivel).length <= 1) return nivel;
  const r = rotuloCurto(v.rotulo);
  return new Set(irmas.map((x) => x.nivel)).size > 1 ? `${nivel}, ${r}` : r;
}

/* ------------------------------------------------------------------ */
/*  Tesouro (Sessão 17)                                                */
/* ------------------------------------------------------------------ */

const TESOURO_EQUIPAMENTO = [400, 700, 1000, 1500, 2500, 3500, 7000, 14000, 21000, 30000, 60000, 120000,
  200000, 400000, 600000, 1000000, 1500000, 2000000];
const TESOURO_CONSUMIVEL = [50, 100, 200, 300, 500, 1000];
const vo = (n) => `${Number(n).toLocaleString("pt-BR")} Vo`;

/** "Consumível Mágico de Nível 2 (100 Vo)" — a linha das tabelas de tesouro. */
export function nivelDeTesouro(prop, preco) {
  const tabela = prop.consumivel ? TESOURO_CONSUMIVEL : TESOURO_EQUIPAMENTO;
  let i = tabela.findLastIndex((p) => p <= preco);
  if (i < 0) i = 0;
  return `${prop.consumivel ? "Consumível Mágico" : "Equipamento Mágico"} de Nível ${i + 1} (${vo(tabela[i])})`;
}

/* ------------------------------------------------------------------ */
/*  Pastas                                                             */
/* ------------------------------------------------------------------ */

const ORDEM_DO_NIVEL = { "Menor": 1, "Intermediário": 2, "Maior": 3 };
export const idDaPasta = (grupo, nivel = "") => makeId(PACK, "pasta", grupo, nivel);

function pasta(_id, name, folder, sort) {
  return { _id, _key: `!folders!${_id}`, name, type: "Item", folder, sorting: "m", sort, color: null,
    flags: {}, _stats: { coreVersion: "13" } };
}

/**
 * As pastas que os itens usam (com as de cima): o compile-packs.mjs grava
 * estas junto dos itens.
 */
export function pastasUsadas(itens) {
  const usadas = new Set(itens.map((d) => d.folder).filter(Boolean));
  const out = [];
  const grupos = Object.keys(GRUPOS);
  grupos.forEach((g, i) => {
    const raiz = idDaPasta(g);
    const filhas = Object.keys(ORDEM_DO_NIVEL).filter((n) => usadas.has(idDaPasta(g, n)));
    if (!usadas.has(raiz) && !filhas.length) return;
    out.push(pasta(raiz, GRUPOS[g].nome, null, (i + 1) * 100));
    for (const n of filhas) out.push(pasta(idDaPasta(g, n), n, raiz, ORDEM_DO_NIVEL[n] * 100));
  });
  return out;
}

/* ------------------------------------------------------------------ */
/*  Catálogo: um item por grau de cada propriedade                     */
/* ------------------------------------------------------------------ */

const clone = (x) => JSON.parse(JSON.stringify(x));

function baseSintetica(tipo) {
  const [nome, gn, categoria] = SINTETICOS[tipo];
  const grupo = GRUPOS[GRUPO_DO_TIPO[tipo] ?? "maravilhosos"];
  const doc = {
    _id: "base", name: nome, type: "equipamento", img: grupo.img, flags: {},
    system: { category: categoria ?? nome, tags: [], tagsExtra: "", qty: 1, weight: 0, price: "", notes: "",
      description: `<p><b>${grupo.nome}</b>: ${grupo.livro}</p>`, actions: [], enchantments: [],
      costsCumulative: false, noEnchant: false, fxFile: "", fxScale: "1", fxAaConfig: null, fxAaName: "",
      fxAaPersist: true, animOnActivate: true, mode: "passive", active: false, effects: [], costs: [] },
  };
  return { doc, nome, gn };
}

/**
 * Planeja o compêndio (sem construir): para cada propriedade, a base e um
 * item por variante. A base de uma propriedade com vários tipos é a do tipo
 * menos usado até ali (varia o compêndio: Proteção Contra Fogo numa armadura,
 * Contra Frio num robe...); armas e armaduras se revezam entre as do livro.
 */
export function planejar(equipamentos) {
  const porNome = new Map(equipamentos.map((d) => [d.name, d]));
  const usoDoTipo = {};
  const giro = {};
  const base = (tipo) => {
    if (DO_COMPENDIO[tipo]) {
      const lista = DO_COMPENDIO[tipo];
      const nomeLivro = lista[(giro[tipo] = (giro[tipo] ?? -1) + 1) % lista.length];
      const doc = porNome.get(nomeLivro);
      if (!doc) throw new Error(`base ${nomeLivro} não está no compêndio de equipamentos`);
      const nome = RENOMEAR[nomeLivro] ?? nomeLivro;
      return { doc, nome, gn: NOME_DA_BASE[nome] };
    }
    if (SINTETICOS[tipo]) return baseSintetica(tipo);
    throw new Error(`tipo de item sem base: ${tipo}`);
  };
  const plano = [];
  for (const prop of PROPRIEDADES) {
    if (FORA.has(prop.id)) continue;
    // Variantes por tipo (Corrosiva: arma, munição, braçadeira) vão cada uma
    // no seu; as demais, todas na mesma base.
    const porTipo = new Map();
    for (const [indice, v] of prop.variantes.entries()) {
      let tipo = v.tipo;
      if (!tipo) {
        tipo = QUALQUER[prop.id] ?? PREFERIDO[prop.id]
          ?? [...prop.tipos].sort((a, b) => (usoDoTipo[a] ?? 0) - (usoDoTipo[b] ?? 0))[0];
      }
      if (!porTipo.has(tipo)) porTipo.set(tipo, []);
      porTipo.get(tipo).push({ ...v, indice });
    }
    for (const [tipo, variantes] of porTipo) {
      usoDoTipo[tipo] = (usoDoTipo[tipo] ?? 0) + 1;
      const b = base(tipo);
      const grupo = VENENOS.has(prop.id) ? "venenos" : GRUPO_DO_TIPO[tipo] ?? "maravilhosos";
      for (const v of variantes) {
        plano.push({ prop, variante: v, tipo, base: b, grupo,
          nome: `${nomeBase(prop, b)} (${sufixo(v, variantes)})` });
      }
    }
  }
  return plano;
}

/** Constrói um item do plano (com animações só das duas versões do JB2A). */
export function construir(p, ordem) {
  const _id = makeId(PACK, p.prop.id, p.variante.indice);
  semente = parseInt(_id.split("").map((c) => (c.charCodeAt(0) - 97).toString(16)).join("").slice(0, 8), 16) || 1;
  const nivel = NOME_DO_NIVEL[p.variante.nivel];
  const dados = clone(p.base.doc);
  if (!compativel(p.prop, tiposDoItem(dados))) {
    throw new Error(`${p.prop.id} não cabe em ${dados.name} (${[...tiposDoItem(dados)].join(", ")})`);
  }
  // Uma palavra: o grau não depende das palavras — a mana, sim, é a do nível.
  const escolhas = [{ prop: p.prop, variante: p.variante, palavra: p.prop.palavra }];
  const d = construirEncantamento(dados, { escolhas, nome: p.nome }, { animar: true, existe: chaveSegura });
  d.system.description += `<p><b>Tesouro</b> (Sessão 17): ${nivelDeTesouro(p.prop, p.variante.preco)}.</p>`;
  if (VENENOS.has(p.prop.id) && !DO_COMPENDIO[p.tipo]) d.img = GRUPOS.venenos.img;
  const nivelDaPasta = new Set(planoDoGrupo.get(p.grupo) ?? []).size > 1 ? nivel : "";
  return {
    _id, _key: `!items!${_id}`, name: d.name, type: "equipamento", img: d.img, system: d.system,
    effects: [], folder: idDaPasta(p.grupo, nivelDaPasta), sort: ordem, ownership: { default: 0 },
    flags: d.flags ?? {}, _stats: { coreVersion: "13" },
  };
}

// Níveis presentes em cada grupo (decide se o grupo ganha subpastas por nível).
let planoDoGrupo = new Map();

/** Todos os itens do compêndio, prontos para gravar. */
export function gerar(equipamentos) {
  const plano = planejar(equipamentos);
  planoDoGrupo = new Map();
  for (const p of plano) {
    if (!planoDoGrupo.has(p.grupo)) planoDoGrupo.set(p.grupo, []);
    planoDoGrupo.get(p.grupo).push(NOME_DO_NIVEL[p.variante.nivel]);
  }
  // Ordem dentro da pasta: pelo nome do item, e os graus em sequência.
  const ordenado = [...plano].sort((a, b) => nomeBase(a.prop, a.base).localeCompare(nomeBase(b.prop, b.base), "pt-BR")
    || a.variante.indice - b.variante.indice);
  const itens = ordenado.map((p, i) => construir(p, (i + 1) * 100));
  const nomes = new Set();
  for (const d of itens) {
    if (nomes.has(d.name)) throw new Error(`nome repetido: ${d.name}`);
    nomes.add(d.name);
  }
  return itens;
}

const slug = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "").toLowerCase() || "item";

export function lerEquipamentos(root = ROOT) {
  const dir = path.join(root, "packs-source", "equipamentos");
  return fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

export function main(root = ROOT) {
  const itens = gerar(lerEquipamentos(root));
  const dir = path.join(root, "packs-source", PACK);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) fs.rmSync(path.join(dir, f));
  for (const d of itens) {
    fs.writeFileSync(path.join(dir, `${slug(d.name)}_${d._id}.json`), `${JSON.stringify(d, null, 2)}\n`, "utf8");
  }
  const pastas = pastasUsadas(itens);
  console.log(`packs-source/${PACK}: ${itens.length} itens mágicos em ${pastas.length} pastas`);
  return itens;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
