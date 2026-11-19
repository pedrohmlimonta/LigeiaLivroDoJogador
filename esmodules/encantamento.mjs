/**
 * LIGEIA — ENCANTAMENTO DE ITENS (Livro do Jogador)
 * ===========================================================================
 * A contraparte da Criação de Magias para os itens: grava, de forma
 * permanente, PROPRIEDADES PARA ITENS MÁGICOS (Sessão 11 do livro) num
 * equipamento da ficha.
 *
 *   1. Escolha o item e o NÍVEL: Menor (1 palavra arcana), Intermediário (2)
 *      ou Maior (3). As palavras podem se repetir (ignis + ignis + glacios).
 *   2. Para cada palavra, uma propriedade dela. Nas propriedades com três
 *      preços (Proteção 1/2/3, Conjuração +1/+2/+3...), o nível do item diz
 *      até onde ela vai — como o círculo nas magias. Os preços do livro
 *      seguem a escala dos círculos (até 3.500 Vo Menor, até 120.000 Vo
 *      Intermediário, acima disso Maior), e uma propriedade de preço Maior
 *      só cabe num item Maior. Repetir a MESMA propriedade não soma: serve
 *      para levar um item de uma só propriedade a um nível mais alto.
 *   3. MANA: como as magias, o item gasta pontos de magia para ativar as
 *      propriedades — 1 PM por palavra (Menor 1, Intermediário 2, Maior 3).
 *      Item LENDÁRIO não gasta mana. Poções, bombas, óleos e pedras são
 *      consumidos ao usar e por isso também não cobram mana.
 *
 * O que o item recebe:
 *   - propriedades constantes (Proteção, bônus, dados, atributos...): uma ação
 *     "✦ Ativar ..." que cobra a mana e aplica tudo em você até o fim da cena.
 *     No item lendário viram efeitos do próprio item, sempre ligados.
 *   - propriedades de arma (Dano Flamejante, Corrosiva, Ferida Arcana...):
 *     uma versão "✦" de cada ataque do item, com o dano extra/condição e a
 *     mana no custo — o ataque comum continua lá. No lendário, o próprio
 *     ataque passa a carregá-las.
 *   - propriedades ativadas (Ação, Ação Rápida, Reação...): uma ação cada.
 *   - o texto do livro de cada propriedade, na descrição; o preço somado no
 *     preço do item; a receita guardada para "Desfazer último encantamento".
 *
 * O que o sistema não tem como fazer sozinho (imunidades, absorção, dano
 * extra nas magias de um foco, bônus em perícias...) fica marcado: um
 * lembrete com o nome da propriedade entra nos efeitos ativos ao ativar, e o
 * texto completo fica na descrição.
 *
 * ITEM CONJURADOR (o outro tipo de encantamento): em vez de propriedades, o
 * item guarda uma magia que quem estiver com ele pode conjurar, pagando os PM
 * do círculo e usando a própria Conjuração — com os bônus de palavra. Ver
 * "Itens conjuradores" mais abaixo.
 */

import { PROPRIEDADES } from "./propriedades.mjs";
import { animarItemEncantado, criarVerificador, contarAnimacoesAutomaticas } from "./animacoes.mjs";
import { novaAcao, novoApplies, DTYPES, ATTRS, TRACOS_COM_PALAVRA } from "./spellforge.mjs";
import { acoesDisparadas, normalizarAutoRefs, novoIdDocumento, lerRef } from "./referencias.mjs";

const MODULE_ID = "ligeia-livro-do-jogador";

export { PROPRIEDADES };

/* ------------------------------------------------------------------ */
/*  Níveis do item                                                     */
/* ------------------------------------------------------------------ */

export const NIVEIS_ITEM = {
  "Menor": { n: 1, pm: 1 },
  "Intermediário": { n: 2, pm: 2 },
  "Maior": { n: 3, pm: 3 },
};
export const NOME_DO_NIVEL = { 1: "Menor", 2: "Intermediário", 3: "Maior" };

/** As 28 palavras arcanas do livro (as que têm propriedades). */
export const PALAVRAS = [...new Set(PROPRIEDADES.map((p) => p.palavra))].sort();

const semAcento = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const esc = (s) => (globalThis.foundry?.utils?.escapeHTML ? foundry.utils.escapeHTML(String(s ?? "")) : String(s ?? ""));
const clone = (x) => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
export const formatarVo = (n) => `${Number(n || 0).toLocaleString("pt-BR")} Vo`;
const novoId = () => (globalThis.foundry?.utils?.randomID?.() ?? Math.random().toString(36).slice(2, 12));

/* ------------------------------------------------------------------ */
/*  Tipos do item escolhido                                            */
/* ------------------------------------------------------------------ */

// Nome (sem acento) → tipo de item das propriedades.
const TIPOS_PELO_NOME = [
  [/\banel\b|\baneis\b/, "anel"], [/amuleto/, "amuleto"], [/\bcolar/, "colar"], [/periapto/, "periapto"],
  [/\bfaixa/, "faixa"], [/\bcint(o|os|urao|uroes)\b/, "cinto"], [/\bbota/, "bota"], [/sandalia/, "sandalia"],
  [/bracadeira|bracelete/, "bracadeira"], [/\bluva/, "luva"], [/manopla/, "manopla"], [/escudo/, "escudo"],
  [/\belmo|capacete/, "elmo"], [/mascara/, "mascara"], [/tiara/, "tiara"], [/bandana/, "bandana"],
  [/\bcoroa/, "coroa"], [/\blente|monoculo|oculos/, "lente"], [/\borbe/, "orbe"], [/bastao|bastoes/, "bastao"],
  [/cajado|bordao/, "cajado"], [/varinha/, "varinha"], [/totem/, "totem"], [/simbolo/, "simbolo"],
  [/instrumento|alaude|flauta|lira\b|tambor|harpa|violino|bandolim|gaita/, "instrumento"], [/espelho/, "espelho"],
  [/cristal/, "cristal"], [/pedra ionica/, "pedra_ionica"], [/\bpedra\b(?! ionica)/, "pedra"],
  [/pocao|pocoes|elixir/, "pocao"], [/\bbomba/, "bomba"], [/\boleo/, "oleo"], [/lanterna/, "lanterna"],
  [/\bchave/, "chave"], [/\bcubo/, "cubo"], [/estatueta|idolo/, "estatueta"], [/\bmapa/, "mapa"],
  [/bussola/, "bussola"], [/baralho/, "baralho"], [/sinete|\bsino\b/, "sinete"], [/cantil|cantis/, "cantil"],
  [/\bsela\b/, "sela"], [/mochila/, "mochila"], [/\bbolsa|algibeira/, "bolsa"], [/\bdisco/, "disco"],
  [/tapete/, "tapete"], [/incensorio/, "incensorio"], [/involucro|mortalha/, "involucro"],
  [/saco de dormir/, "saco_de_dormir"], [/estrepe/, "estrepes"], [/bainha/, "bainha"], [/algema/, "algemas"],
  [/\bcapa\b|\bcapas\b|\bmanto/, "capa"], [/\brobe|tunica/, "robe"],
  [/armadura|cota de malha|couraca|gibao/, "armadura"],
  [/municao|municoes|flecha|virote|balas? de funda/, "municao"], [/\badaga/, "adaga"], [/\bdardo/, "dardo"],
];
// Grupo da arma (categoria "Arma (X)" ou tipagem) → tipo das propriedades.
const GRUPOS_DE_ARMA = {
  "laminas pequenas": "laminas_pequenas", laminas_pequenas: "laminas_pequenas",
  "laminas grandes": "laminas_grandes", laminas_grandes: "laminas_grandes",
  arcos: "arco", bestas: "besta", macas: "maca", martelos: "martelo", dardos: "dardo", arremesso: "arremesso",
};
const DANO_FISICO = { corte: "arma_corte", perfuracao: "arma_perfuracao", concussao: "arma_concussao" };

/** A ação é um ataque da arma? (as versões ✦ não contam: nascem dos comuns) */
export function eAtaque(a) {
  if (!a || String(a.label ?? "").startsWith("✦")) return false;
  return a.isWeapon === true || /^Ataque\b/.test(String(a.label ?? ""));
}

/**
 * Tipos de item (no vocabulário das propriedades) que o equipamento é:
 * pela categoria, pelo nome, pelas tipagens e pelo dano dos ataques.
 * @returns {Set<string>}
 */
export function tiposDoItem(data) {
  const sys = data?.system ?? {};
  const out = new Set();
  const cat = semAcento(sys.category);
  const nome = semAcento(data?.name);
  for (const [re, t] of TIPOS_PELO_NOME) if (re.test(nome)) out.add(t);
  const ataques = (sys.actions ?? []).filter(eAtaque);
  if (/^arma\b/.test(cat) || ataques.length) {
    out.add("arma");
    const grupo = cat.match(/\(([^)]+)\)/)?.[1];
    if (grupo && GRUPOS_DE_ARMA[grupo]) out.add(GRUPOS_DE_ARMA[grupo]);
    for (const tag of sys.tags ?? []) {
      const t = GRUPOS_DE_ARMA[semAcento(tag)];
      if (t) out.add(t);
    }
    for (const a of ataques) {
      const fis = DANO_FISICO[a.damageType];
      if (fis) out.add(fis);
      for (const ex of a.extraDamage ?? []) if (DANO_FISICO[ex.type] && ex.scaling) out.add(DANO_FISICO[ex.type]);
    }
  }
  if (/armadura/.test(cat)) out.add("armadura");
  if (/escudo/.test(cat)) out.add("escudo");
  if (/municao/.test(cat)) out.add("municao");
  if (/manopla/.test(cat)) out.add("manopla");
  return out;
}

/** A propriedade foi feita para este tipo de item? */
export function compativel(prop, tipos) {
  if (prop.tipos.includes("qualquer")) return true;
  return prop.tipos.some((t) => tipos.has(t));
}

/* ------------------------------------------------------------------ */
/*  Variantes (preços) de uma propriedade                              */
/* ------------------------------------------------------------------ */

/**
 * As variantes que valem para este item: as do tipo dele quando o preço
 * depende do tipo (Munições / Armas / Braçadeiras); todas, senão. Cada uma
 * vem com `permitida` (o nível do preço cabe no nível do item?).
 */
export function variantesDoItem(prop, nivelN, tipos) {
  let vs = prop.variantes.map((v, i) => ({ ...v, indice: i }));
  const tiposVar = [...new Set(vs.map((v) => v.tipo).filter(Boolean))];
  if (tiposVar.length) {
    const doItem = tiposVar.filter((t) => tipos.has(t));
    if (doItem.length) vs = vs.filter((v) => doItem.includes(v.tipo));
  }
  return vs.map((v) => ({ ...v, permitida: v.nivel <= nivelN }));
}

const ORDEM_DO_TIPO = { arma: 0, municao: 1, bracadeira: 2 };

/**
 * A variante mais alta que cabe no nível do item (ou null). Empate no
 * nível: arma antes de munição e braçadeira; depois, a mais cara (a poção
 * de 3 PV, não a de 1).
 */
export function variantePadrao(prop, nivelN, tipos) {
  const ok = variantesDoItem(prop, nivelN, tipos).filter((v) => v.permitida);
  if (!ok.length) return null;
  const chave = (v) => [v.nivel, -(ORDEM_DO_TIPO[v.tipo] ?? 0), v.preco];
  return ok.reduce((m, v) => {
    const [a, b] = [chave(v), chave(m)];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i] ? v : m;
    return m;
  }, ok[0]);
}

/** Nível mínimo do item para a propriedade caber (pelo preço mais barato). */
export function nivelMinimo(prop, tipos) {
  return Math.min(...variantesDoItem(prop, 3, tipos).map((v) => v.nivel));
}

/* ------------------------------------------------------------------ */
/*  Regras de automação                                                */
/* ------------------------------------------------------------------ */
/*
 * Cada regra recebe o contexto da variante escolhida —
 *   V  número do rótulo (Proteção 2 → 2; "+5 em Iniciativa" → 5),
 *      ou o grau quando o rótulo não tem número;
 *   G  grau (1, 2, 3...) dentro do tipo; CD  Normal 10 / Difícil 12 /
 *   Muito Difícil 14 (10 quando o livro não diz);
 * — e devolve o que o item ganha:
 *   efeitos  efeitos em quem usa o item (tipo/alvo/valor do sistema)
 *   info     lembrete (texto curto) de uma regra sem automação
 *   arma     mudanças nos ataques: extra [{formula,type,resource}],
 *            aplica [...], final (dano base vira final), base (+N no dano
 *            base, numa versão à parte: "contra a presa")
 *   acao     uma ação própria (alvo, área, cura, dano, aplica, movimento...)
 *   obs      observação que só vai para a descrição
 */

const ELEMENTO_DA_PALAVRA = {
  acida: "acido", energio: "energia", fulgur: "raio", glacios: "frio", ignis: "fogo",
  mortis: "necrotico", noxia: "veneno", sankta: "radiante", sonigu: "sonico", traumato: "psiquico",
  menso: "concussao", exitium: "energia",
};
const PROTECAO_DE = {
  "acido": "acido", "energia": "energia", "raio": "raio", "frio": "frio", "fogo": "fogo",
  "necrotico": "necrotico", "veneno": "veneno", "radiante": "radiante", "som": "sonico", "psiquico": "psiquico",
};
const ROTULO_COND = {
  abalado: "Abalado", agarrado: "Agarrado", atordoado: "Atordoado", caido: "Caído", cego: "Cego",
  dano_continuo: "Dano Contínuo", dominado: "Dominado", enfeiticado: "Enfeitiçado", enfraquecido: "Enfraquecido",
  exausto: "Exausto", imobilizado: "Imobilizado", inconsciente: "Inconsciente", indefeso: "Indefeso",
  intangivel: "Intangível", invisivel: "Invisível", lento: "Lento", oculto: "Oculto", paralisado: "Paralisado",
  pasmo: "Pasmo", surdo: "Surdo", surpreso: "Surpreso", telecinese: "Telecinese", vendo_invisivel: "Vendo Invisível",
};

const ef = (type, target, value, extra = {}) => ({ type, target, value: String(value), ...extra });
const rd = (dt, v) => ef("rd", "all", v, { damageType: dt });
/** Resistência por rodada: CD fixa (número) ou contra a rolagem (null). */
const resiste = (attr, dc) => (attr ? { resist: true, resistAttr: attr, resistVsCast: dc == null, resistDc: String(dc ?? 0) } : {});
const ap = (label, extra = {}) => ({ label, ...extra });
const cond = (id, attr, dc, extra = {}) => ap(ROTULO_COND[id] ?? id, { fxType: "condition", fxTarget: id, ...resiste(attr, dc), ...extra });
const continuo = (dt, attr, dc) => ap(`Dano contínuo de ${DTYPES[dt] ?? dt}`, {
  fxType: "condition", fxTarget: "dano_continuo", tickAmount: "1", tickType: dt, ...resiste(attr, dc),
});
const marcador = (label, extra = {}) => ap(label, { fxType: "bonus", fxTarget: "all", fxValue: "0", ...extra });
const acaoInfo = (rotulo = "") => ({ acao: { rotulo } });
/** Bomba alquímica: arremessa até 10m (Agilidade), 2m de raio, Esquiva. */
const bomba = (...aplica) => ({ acao: {
  rotulo: "10m, 2m de raio", targetMode: "area", range: "10", area: "2",
  canRoll: true, rollAttr: "agilidade", defenseAttr: "esquiva", includeSelf: false, aplica,
} });

/** Regras escritas à mão, por propriedade. */
const REGRAS = {
  // acida
  "acida-caminhar-na-agua-e-acido": () => ({ info: "anda sobre água e ácido como se fossem sólidos" }),
  "acida-caustifices": () => ({ info: "1D para identificar itens com propriedades de acida" }),
  "acida-respirar-na-agua": () => ({ info: "respira na água" }),
  "acida-guia-das-aguas": () => acaoInfo("aponta para a água mais próxima"),
  "acida-explosao-corrosiva": () => bomba(continuo("acido", "vigor", null)),
  // augurado
  "augurado-augurio": () => acaoInfo("ver uma cena do dia"),
  "augurado-cacadora-temporal": () => acaoInfo("re-rolar um ataque"),
  "augurado-guardiao-temporal": () => acaoInfo("re-rolar o Bloqueio"),
  "augurado-vigilante-temporal": () => acaoInfo("re-rolar a Esquiva"),
  "augurado-visao-da-verdade": () => ({ efeitos: [ef("condition", "vendo_invisivel", 1)],
    info: "vê o invisível; 1D contra magias de iluzio" }),
  "augurado-visao-no-escuro": () => ({ info: "visão no escuro (10m)" }),
  "augurado-visao-do-perigo": () => ({ efeitos: [ef("bonus", "esquiva", 1), ef("bonus", "bloqueio", 1)] }),
  // carmo — quem vê o item resiste (Mente Normal) ou recebe a condição
  "carmo-aterradora": () => ({ acao: { rotulo: "quem o vê: Mente 10 ou Abalado", targetMode: "target",
    aplica: [cond("abalado", "mente", 10)] }, obs: "Uma mesma criatura só pode ser afetada uma vez por dia." }),
  "carmo-atordoante": () => ({ acao: { rotulo: "quem o vê: Mente 10 ou Atordoado", targetMode: "target",
    aplica: [cond("atordoado", "mente", 10)] }, obs: "Uma mesma criatura só pode ser afetada uma vez por dia." }),
  "carmo-dreno-mental": () => ({ acao: { rotulo: "quem o vê: Mente 10 ou Pasmo", targetMode: "target",
    aplica: [cond("pasmo", "mente", 10)] }, obs: "Uma mesma criatura só pode ser afetada uma vez por dia." }),
  "carmo-dominacao": () => ({ acao: { rotulo: "quem o vê: Mente 10 ou Dominado", targetMode: "target",
    aplica: [cond("dominado", "mente", 10)] }, obs: "Uma mesma criatura só pode ser afetada uma vez por dia." }),
  "carmo-atracao": (c) => acaoInfo(`atrai quem vê a luz (Mente ${c.CD})`),
  // devena
  "devena-camuflagem": () => ({ info: "1D para se manter escondido" }),
  "devena-carvalho": (c) => ({ acao: { rotulo: `Proteção ${c.V} contra Corte, Perfuração e Concussão`,
    aplica: ["corte", "perfuracao", "concussao"].map((t) => ap(`Carvalho: Proteção ${c.V} (${DTYPES[t]})`, {
      fxType: "rd", fxTarget: t, fxValue: String(c.V) })) } }),
  "devena-face-feral": () => ({ info: "1D para lidar com feras", acao: { rotulo: "falar com animais (cena)",
    aplica: [marcador("Face Feral: fala com animais")] } }),
  "devena-invocacao-animal": (c) => acaoInfo(`vira uma fera de Desafio até ${c.V} por 1 hora`),
  "devena-pele-de-arvore": (c) => ({ acao: { rotulo: `Proteção ${c.V}; vulnerável ${c.V} a Fogo`,
    aplica: [...["corte", "perfuracao", "concussao", "veneno"].map((t) => ap(`Pele de Árvore: Proteção ${c.V} (${DTYPES[t]})`, {
      fxType: "rd", fxTarget: t, fxValue: String(c.V) })),
      ap(`Pele de Árvore: vulnerável ${c.V} a Fogo`, { fxType: "vuln", fxTarget: "fogo", fxValue: String(c.V) })] } }),
  "devena-peregrino": () => ({ info: "terreno escolhido: sem lentidão e 1D para mover-se em silêncio" }),
  "devena-predador": (c) => ({ arma: { base: c.V, condicional: `contra a presa (+${c.V} no dano base)` },
    obs: "Escolha o tipo de criatura (ou raça) ao criar o item e anote no nome ou na descrição." }),
  "devena-raizes": () => ({ info: "não pode ser derrubado" }),
  "devena-sobrevivente": () => acaoInfo("acha comida e água (300m)"),
  // energio
  "energio-emanacao": () => acaoInfo("aura de energia (1 de dano; raio = PM extras gastos)"),
  "energio-fonte-arcana": (c) => ({ info: `guarda ${c.V} PM excedentes no descanso` }),
  "energio-mana": (c) => ({ acao: { rotulo: `recupera ${c.V} PM`, heal: String(c.V), healResource: "mp" } }),
  "energio-regeneracao-arcana": () => ({ info: "recupera 1 PM no turno em que não se mover" }),
  "energio-explosao-de-energia": () => bomba(continuo("energia", "vigor", null)),
  "energio-forma-de-energia": () => ({ info: "o dano sofrido sai dos PM; sem exaustão por falta de PM" }),
  // exitium
  "exitium-aniquilacao": (c) => ({ info: `+${c.V} de dano final de energia nas magias de exitium com este foco (perde 1 PV ao conjurar)` }),
  "exitium-demolicao": () => acaoInfo("destrói parede, porta ou cela tocada"),
  "exitium-esmagador": () => ({ arma: { final: true }, obs: "Os acertos críticos com esta arma atordoam o alvo." }),
  "exitium-lamina-afiada": () => ({ arma: { final: true }, obs: "O dano adicional dos acertos críticos com esta arma é dobrado." }),
  "exitium-penetrante": () => ({ arma: { final: true }, obs: "Os acertos críticos com esta arma causam dano contínuo de Sangramento." }),
  "exitium-explosivo": (c) => ({ arma: { extra: [{ formula: String(c.V), type: "energia" }],
    sufixo: `Agilidade ${c.CD} evita os ${c.V} de energia` },
    obs: `O alvo atingido à distância rola Agilidade (CD ${c.CD}); se passar, desfaça os ${c.V} pontos de dano de energia.` }),
  "exitium-potencializador": () => ({ info: "o dano base das magias com este foco é final; críticos causam dano contínuo" }),
  // forjuri
  "forjuri-atencao": () => ({ info: "imune a Indefeso, Cego e Surdo" }),
  "forjuri-couraca": (c) => ({ acao: { rotulo: `+${c.V} em todas as Proteções`,
    aplica: [ap(`Couraça: +${c.V} em todas as Proteções`, { fxType: "rd", fxTarget: "all", fxValue: String(c.V) })] } }),
  "forjuri-determinacao": () => ({ info: "imune a Abalado, Pasmo, Dominado, Atordoado e Enfeitiçado" }),
  "forjuri-egide": (c) => ({ efeitos: [ef("set", "bloqueio", "@mente", { label: "Bloqueio com Mente" }), ef("bonus", "bloqueio", c.V)] }),
  "forjuri-espelho": () => ({ info: "dano defletido no Bloqueio volta para o atacante" }),
  "forjuri-fortificacao": () => ({ info: "imune a dano final que não venha do dano bruto acima da Proteção" }),
  "forjuri-obstinacao": () => ({ info: "imune a Lento, Imobilizado e Paralisado" }),
  "forjuri-contramagica": (c) => acaoInfo(`devolve a magia (Conjuração ${c.CD})`),
  "forjuri-rigidez": () => ({ info: "não pode ser derrubado nem agarrado" }),
  "forjuri-tenacidade": () => ({ info: "imune a Exausto e Enfraquecido" }),
  // fulgur
  "fulgur-explosao-eletrica": () => bomba(continuo("raio", "vigor", null), cond("paralisado", "vigor", null)),
  "fulgur-receptor": (c) => ({ acao: { rotulo: `raio de ${c.V} em quem estiver até 4m`, targetMode: "area",
    range: "5", area: "4", includeSelf: false, damage: String(c.V), damageType: "raio" },
    obs: `Carregado, o cubo serve de foco para magias de fulgur e concede ${c.V} PM para conjurá-las.` }),
  // glacios
  "glacios-caminhar-no-gelo": () => ({ info: "anda em superfícies escorregadias sem penalidade" }),
  "glacios-explosao-congelante": () => bomba(continuo("frio", "vigor", null), cond("lento", "vigor", null)),
  "glacios-protecao-invernal": (c) => ({ acao: { rotulo: `Proteção ${c.V} contra Frio a todos em 10m`,
    targetMode: "area", area: "10", includeSelf: true,
    aplica: [ap(`Proteção Invernal: Proteção ${c.V} (Frio)`, { fxType: "rd", fxTarget: "frio", fxValue: String(c.V) })] } }),
  // ignis
  "ignis-caminhar-em-lava-e-brasa": () => ({ info: "anda sobre lava e brasa sem dano" }),
  "ignis-conflagracao": (c) => ({ acao: { rotulo: `aura de chamas (${c.V}m, ${c.V} de fogo por rodada)`,
    targetMode: "aura", area: String(c.V), includeSelf: false, damage: String(c.V), damageType: "fogo",
    persistArea: true, persistRounds: "0", persistTrigger: "turn" } }),
  "ignis-vaporizacao": (c) => acaoInfo(`emanação de ${c.V}m com o líquido guardado`),
  "ignis-incendiaria": () => bomba(continuo("fogo", "vigor", null)),
  // iluzio
  "iluzio-camaleao": () => ({ acao: { rotulo: "aparência de outro humanóide (cena)",
    aplica: [marcador("Camaleão: disfarçado (1D para se passar pela criatura)")] } }),
  "iluzio-deslocamento": () => ({ info: "não pode ser alvo de reações de ataque" }),
  "iluzio-invisibilidade": () => ({ acao: { rotulo: "fica invisível (até atacar)", aplica: [cond("invisivel")] } }),
  "iluzio-ocultacao": () => ({ info: "1D em atividades furtivas" }),
  "iluzio-nebulosa": () => ({ acao: { rotulo: "fica invisível (até atacar ou conjurar)", aplica: [cond("invisivel")] } }),
  "iluzio-quarto-fantasma": (c) => acaoInfo(`área de 12m² invisível (Percepção ${c.CD})`),
  // inanis
  "inanis-antimagia": () => ({ info: "a criatura algemada não conjura magias" }),
  "inanis-anulacao": (c) => ({ info: `imune a áreas de magias do ${c.v.rotulo || "círculo do item"} ou inferior` }),
  "inanis-ferida-arcana": (c) => ({ arma: { extra: [{ formula: String(c.V), type: "", resource: "mp" }] } }),
  "inanis-magia-neutra": () => acaoInfo("saca uma carta: anula uma palavra arcana (1km)"),
  "inanis-rompimento": () => ({ arma: { sufixo: "cancela as condições benéficas do alvo" },
    obs: "Ao causar dano com a arma, todas as condições benéficas do alvo são canceladas (retire-as da ficha dele)." }),
  "inanis-sangramento-arcano": (c) => ({ arma: { aplica: [ap("Sangramento Arcano (−1 PM por rodada)", {
    fxType: "bonus", fxTarget: "all", fxValue: "0", tickAmount: "1", tickResource: "mp", ...resiste("vigor", c.CD) })] } }),
  "inanis-vazio": () => acaoInfo("aura de 10m sem magia (1 PM por rodada)"),
  // kreo
  "kreo-artesao": (c) => ({ info: `+${c.V} ponto(s) heroico(s) por dia para criar itens` }),
  "kreo-absorcao-material": (c) => ({ info: `arma que o ferir testa Dureza ou perde ${c.V}` }),
  "kreo-fortaleza": (c) => acaoInfo(`ergue uma construção (${c.v.rotulo})`),
  "kreo-identificacao": () => ({ info: "1D para identificar propriedades mágicas" }),
  "kreo-indestrutivel": (c) => ({ info: `Dureza +${c.V}` }),
  "kreo-laminas-infinitas": (c) => acaoInfo(`cria ${c.v.rotulo || "uma lâmina"} na bainha (cena)`),
  "kreo-reparacao": (c) => acaoInfo(`recupera ${c.V} de Dureza de um objeto`),
  // krucigon
  "krucigon-arrombar-portais": () => acaoInfo("abre um portal planar trancado"),
  "krucigon-intangibilidade": () => ({ acao: { rotulo: "fica intangível (cena)", aplica: [cond("intangivel")] } }),
  "krucigon-teletransporte": () => ({ acao: { rotulo: "teleporta metade do Deslocamento",
    movement: { kind: "teleport", who: "self", distance: "floor(@deslocamento/2)" } } }),
  "krucigon-toque-planar": () => ({ info: "magias e ataques ignoram a intangibilidade" }),
  // lumo
  "lumo-brilhante": () => acaoInfo("luz de 10m"),
  "lumo-cores-cintilantes": (c) => ({ acao: { rotulo: `luz de 3m: Percepção ${c.CD} ou Atordoado`,
    targetMode: "aura", area: "3", includeSelf: false, aplica: [cond("atordoado", "percepcao", c.CD)] } }),
  "lumo-marca-luminosa": () => ({ arma: { aplica: [marcador("Marca Luminosa: não consegue se esconder; ataques contra ele recebem 1D")] } }),
  "lumo-orientacao": () => acaoInfo("mostra o caminho até um lugar"),
  "lumo-solar": (c) => acaoInfo(`luz de ${c.V}m por 1 dia`),
  "lumo-visao-clara": () => ({ info: "1D em rolagens fora de combate que dependem da visão" }),
  // majesto
  "majesto-aumento": () => ({ acao: { rotulo: "+1 categoria de tamanho (cena)",
    aplica: [ap("Aumento: +1 categoria de tamanho", { fxType: "size", fxTarget: "shift", fxValue: "1" })] } }),
  "majesto-atalho": () => acaoInfo("corta pela metade a distância até o destino"),
  "majesto-crescimento": () => ({ acao: { rotulo: "+1 categoria de tamanho (cena)",
    aplica: [ap("Crescimento: +1 categoria de tamanho", { fxType: "size", fxTarget: "shift", fxValue: "1" })] } }),
  "majesto-dimensoes": (c) => ({ info: `+${c.V}m no alcance das magias com este foco` }),
  "majesto-diminuicao": () => ({ acao: { rotulo: "−1 categoria de tamanho (cena)",
    aplica: [ap("Diminuição: −1 categoria de tamanho", { fxType: "size", fxTarget: "shift", fxValue: "-1" })] } }),
  "majesto-encolhimento": () => ({ acao: { rotulo: "−1 categoria de tamanho (cena)",
    aplica: [ap("Encolhimento: −1 categoria de tamanho", { fxType: "size", fxTarget: "shift", fxValue: "-1" })] } }),
  "majesto-extradimensional": (c) => ({ info: `guarda ${c.V} pontos de peso sem pesar` }),
  "majesto-passo-dimensional": (c) => ({ efeitos: [ef("stat", "deslocamento", c.V)] }),
  "majesto-toque-dimensional": (c) => ({ info: `magias de toque com alcance de ${c.V}m` }),
  // menso
  "menso-flutuante": (c) => acaoInfo(`flutua junto de você por 1 dia (carga ${c.V})`),
  "menso-mensagem-telepatica": (c) => acaoInfo(`mensagem mental (${c.v.rotulo || "distância do item"})`),
  "menso-salto-telecinetico": () => ({ info: "1D para saltar" }),
  // mortis
  "mortis-dreno": (c) => ({ acao: { rotulo: `${c.V}m: Vigor 10 ou Enfraquecido`, targetMode: "aura",
    area: String(c.V), includeSelf: false, aplica: [cond("enfraquecido", "vigor", 10)] },
    obs: "Você recupera 1 PV por criatura que ficar enfraquecida." }),
  "mortis-esqueletica": () => ({ info: "1D na Conjuração de magias que pasmem, atordoem, abalem ou dominem mortos-vivos" }),
  "mortis-lamina-vampirica": () => ({ arma: { sufixo: "cura o dano escalonado causado", dreno: { resource: "hp", from: "scaling" } },
    obs: "Ao causar dano escalonado com esta arma, você recupera PV igual ao dano escalonado." }),
  "mortis-macula": (c) => ({ acao: { rotulo: `aura de ${c.V}m (1 necrótico por turno)`, targetMode: "aura",
    area: String(c.V), includeSelf: false, damage: "1", damageType: "necrotico",
    persistArea: true, persistRounds: "0", persistTrigger: "turn" },
    obs: "Só afeta criaturas com Corrupção 4 ou menor." }),
  "mortis-perversao": () => acaoInfo("estatueta corrupta (1 necrótico por rodada; Corrupção)"),
  "mortis-pragas": (c) => acaoInfo(`praga de Desafio ${c.V} (100m por PM)`),
  // noxia
  "noxia-apotecarios": () => ({ info: "1D para identificar itens de noxia e manipular venenos" }),
  "noxia-explosao-toxica": () => bomba(continuo("veneno", "vigor", null)),
  "noxia-nevoa-sufocante": (c) => ({ acao: { rotulo: `névoa de ${c.V}m (Vigor ${c.CD})`, targetMode: "aura",
    area: String(c.V), includeSelf: false, damage: "1", damageType: "veneno",
    aplica: [cond("lento", "vigor", c.CD), ...(c.G >= 2 ? [cond("pasmo", "vigor", c.CD)] : []),
      ...(c.G >= 3 ? [cond("enfraquecido", "vigor", c.CD)] : [])] } }),
  // pluribus
  "pluribus-duplicacao": (c) => ({ info: `duplica um item (${c.v.rotulo || ""})` }),
  "pluribus-mimico": () => ({ info: "1D numa ação fora de combate que alguém já tentou na cena" }),
  "pluribus-laminas-espelho": () => acaoInfo("cria uma cópia de você (cena)"),
  "pluribus-recuperacao-replicada": () => ({ info: "ao recuperar PV, a criatura mais próxima (3m) recupera o mesmo" }),
  "pluribus-seta-fantasma": () => acaoInfo("segundo ataque contra outro alvo a até 3m"),
  // saeculorum
  "saeculorum-aceleracao": () => acaoInfo("turno adicional (uma vez por rodada)"),
  "saeculorum-corrida": (c) => ({ info: `a montaria recebe +${c.V}m de Deslocamento` }),
  "saeculorum-desaceleracao": () => ({ acao: { rotulo: "o alvo atingido fica Lento (Força 10 anula)",
    targetMode: "target", aplica: [cond("lento", "forca", 10)] },
    obs: "Gastando 2 PM o alvo fica Imobilizado, e 3 PM, Paralisado — troque a condição na ficha do alvo." }),
  "saeculorum-letargia-temporal": () => bomba(cond("lento", "forca", null),
    marcador("Letargia Temporal: sem reações", resiste("forca", null))),
  "saeculorum-movimento-rapido": () => acaoInfo("movimento adicional (uma vez por rodada)"),
  "saeculorum-preservacao": () => ({ info: "o corpo envolto conta 10 dias como 1 para Reviver" }),
  "saeculorum-rapidez": (c) => ({ acao: { rotulo: `+1 ${c.v.rotulo || "ação"} por turno (cena)`,
    aplica: [marcador(`Rapidez: +1 ${c.v.rotulo || "ação"} por turno`)] } }),
  "saeculorum-reflexos-rapidos": () => acaoInfo("reação adicional (uma vez por rodada)"),
  "saeculorum-veloz": () => acaoInfo("ataque adicional com a arma (uma vez por rodada)"),
  // sangon
  "sangon-alado": () => ({ info: "usa a habilidade Asas (Avançado)" }),
  "sangon-anfibia": () => ({ info: "usa Movimento de Natação (Avançado); sem penalidade de armadura na água" }),
  "sangon-aracnideo": () => ({ info: "anda por paredes e tetos" }),
  "sangon-bestial": () => ({ info: "usa a habilidade Predador Astuto (Avançado)" }),
  "sangon-garras-afiadas": () => ({ info: "usa a habilidade Garras (Avançado)" }),
  "sangon-joia": () => acaoInfo("vira joia (e volta)"),
  "sangon-presas-vorazes": () => ({ info: "usa a habilidade Presas (Avançado)" }),
  // sankta
  "sankta-esplendor": (c) => ({ acao: { rotulo: `aura de ${c.V}m (1 radiante por turno)`, targetMode: "aura",
    area: String(c.V), includeSelf: false, damage: "1", damageType: "radiante",
    persistArea: true, persistRounds: "0", persistTrigger: "turn" },
    obs: "Só afeta criaturas com Corrupção 6 ou maior." }),
  // sonigu
  "sonigu-abertura": () => acaoInfo("abre trancas, portas e correntes"),
  "sonigu-atuacao": (c) => ({ info: "1D em atuação e performance", acao: {
    rotulo: `aliados a até ${c.V}m: 1D na próxima rolagem`, targetMode: "area", area: String(c.V),
    areaFilter: "allies", includeSelf: false,
    aplica: [ap("Atuação: 1D na próxima rolagem", { fxType: "rollDice", fxTarget: "all", fxValue: "1" })] } }),
  "sonigu-estrondante": () => ({ arma: { aplica: [cond("surdo", "vigor", 10)] } }),
  "sonigu-explosao-sonica": () => bomba(continuo("sonico", "percepcao", null), cond("surdo", "percepcao", null)),
  "sonigu-murmurante": (c) => ({ acao: { rotulo: `${c.V}m: Percepção 10 ou −${c.G} em Mente`, targetMode: "aura",
    area: String(c.V), includeSelf: false,
    aplica: [ap(`Murmurante: −${c.G} em Mente`, { fxType: "bonus", fxTarget: "mente", fxValue: String(-c.G), ...resiste("percepcao", 10) })] } }),
  // sorcdiron
  "sorcdiron-arcanista": (c) => ({ acao: { rotulo: `+${c.V} em Conjuração (cena)`,
    aplica: [ap(`Arcanista: +${c.V} em Conjuração`, { fxType: "bonus", fxTarget: "conjuracao", fxValue: String(c.V) })] } }),
  "sorcdiron-atirador": (c) => ({ efeitos: [ef("bonus", "attackRanged", c.V)] }),
  "sorcdiron-ataque-certeiro": (c) => ({ acao: { rotulo: `+${c.V} nos ataques da arma escolhida`,
    aplica: [ap(`Ataque Certeiro: +${c.V} no ataque`, { fxType: "bonus", fxTarget: "attack", fxValue: String(c.V), fxEnchant: true })] },
    obs: "Ao usar, escolha a arma que recebe o óleo; o bônus vale até o fim do próximo combate (remova-o da arma depois)." }),
  "sorcdiron-batalha": (c) => ({ efeitos: [ef("bonus", "attackMelee", c.V)] }),
  "sorcdiron-bloqueio-absoluto": (c) => ({ efeitos: [ef("bonus", "bloqueio", c.V)] }),
  "sorcdiron-corredor": (c) => ({ efeitos: [ef("stat", "deslocamento", c.V)], info: "1D em Esquiva contra reações de ataque" }),
  "sorcdiron-esquiva-ardilosa": (c) => ({ efeitos: [ef("bonus", "esquiva", c.V)] }),
  "sorcdiron-reacao-rapida": (c) => ({ efeitos: [ef("bonus", "iniciativa", c.V)], info: "1D nas reações de ataque" }),
  "sorcdiron-saltitantes": (c) => ({ info: `estrepes que andam ${c.V}m por rodada e causam 1 de dano final` }),
  "sorcdiron-sobrevida": (c) => ({ acao: { rotulo: `${c.V} de sobrevida`, heal: String(c.V), healResource: "hpTemp" } }),
  // tenebrae — escuridão: quem está dentro fica cego enquanto estiver lá
  "tenebrae-crepusculo": (c) => ({ acao: { rotulo: `aura de escuridão (${c.V}m): Cego dentro dela`, targetMode: "aura",
    area: String(c.V), includeSelf: false, persistArea: true, persistRounds: "0", persistTrigger: "both",
    aplica: [cond("cego", null, null, { durationMode: "rounds", durationRounds: "1" })] },
    obs: "Luz não mágica não funciona na aura; a de itens precisa ser de nível superior ao da lanterna, e a de magias, Conjuração 12 (Difícil)." }),
  "tenebrae-lugubre": () => ({ efeitos: [rd("radiante", 1)], info: "1D para evitar ser notado" }),
  "tenebrae-macabra": (c) => ({ acao: { rotulo: `escuridão de ${c.V}m (Percepção ${c.CD} para enxergar)`, targetMode: "aura",
    area: String(c.V), includeSelf: false, persistArea: true, persistRounds: "0", persistTrigger: "both",
    aplica: [cond("cego", "percepcao", c.CD, { durationMode: "rounds", durationRounds: "1" })] } }),
  "tenebrae-tentaculos-negros": (c) => ({ acao: { rotulo: `tentáculos (${c.V}m): Agilidade ${10 + 2 * (c.G - 1)} ou Agarrado`,
    targetMode: "aura", area: String(c.V), includeSelf: false, persistArea: true, persistRounds: "0", persistTrigger: "both",
    aplica: [cond("agarrado", "agilidade", 10 + 2 * (c.G - 1))] } }),
  "tenebrae-passo-umbral": () => ({ info: "1D em Esquiva contra reações de ataque ao se mover" }),
  // traumato
  "traumato-tormento": (c) => {
    const raio = Number(String(c.v.rotulo ?? "").match(/(\d+)m/)?.[1]) || 5 * c.G;
    return { acao: { rotulo: `aura de ${raio}m (${c.V} psíquico ao se deslocar)`, targetMode: "aura",
      area: String(raio), includeSelf: false, damage: String(c.V), damageType: "psiquico",
      persistArea: true, persistRounds: "0", persistTrigger: "enter" },
      obs: "Causa o dano a quem se deslocar dentro da aura (entrar ou sair), exceto o portador." };
  },
  // vitae
  "vitae-bastiao": (c) => ({ acao: { rotulo: `recupera ${c.V} PV ao sofrer crítico`, heal: String(c.V), healResource: "hp" } }),
  "vitae-bom-descanso": (c) => ({ info: `+${c.V} PV ao descansar nele` }),
  "vitae-curandeiro": (c) => ({ info: `+${c.V} PV nas magias de cura` }),
  "vitae-cura": (c) => ({ acao: { rotulo: `recupera ${c.V} PV`, heal: String(c.V), healResource: "hp" } }),
  "vitae-forca-de-espirito": () => ({ info: "continua consciente até o fim da cena ao cair" }),
  "vitae-regeneracao": () => ({ acao: { rotulo: "regeneração (com metade dos PV ou menos)",
    aplica: [ap("Regeneração (1 PV por rodada)", { fxType: "bonus", fxTarget: "all", fxValue: "0",
      tickHealAmount: "1", tickHealResource: "hp" })] } }),
  "vitae-restauracao": () => acaoInfo("cancela uma condição mental ou física"),
  "vitae-vivido": () => ({ info: "ao conjurar com este foco, aliados que o vejam recuperam 1 PV" }),
  "vitae-vitalidade": (c) => ({ efeitos: [ef("stat", "hp", c.V)] }),
};

/** Regras por família (quando não há regra escrita à mão). */
function regraDaFamilia(prop, c) {
  const nome = prop.nome;
  const txt = prop.texto;
  const elem = ELEMENTO_DA_PALAVRA[prop.palavra];
  // Proteção Contra X → Proteção (RD) do tipo.
  if (/^Proteção Contra /.test(nome)) {
    const dt = PROTECAO_DE[semAcento(nome.replace(/^Proteção Contra /, ""))];
    if (dt) return { efeitos: [rd(dt, c.V)] };
  }
  // Dano X → parcela de dano bruto extra do elemento nos ataques da arma.
  if (/^Dano /.test(nome) && prop.variantes.some((v) => v.tipo) && elem) {
    if (c.tipoVar === "arma") return { arma: { extra: [{ formula: String(c.V), type: elem }] } };
    const onde = c.tipoVar === "municao" ? "com esta munição" : "enquanto usa as braçadeiras";
    return { info: `+${c.V} de dano bruto de ${DTYPES[elem]} nos ataques ${onde}` };
  }
  // Arma/munição/braçadeira que deixa condição em quem sofre dano.
  const NO_ACERTO = {
    "acida-corrosiva": () => continuo("acido", "vigor", 10),
    "ignis-ardente": () => continuo("fogo", "vigor", 10),
    "sankta-expurgo": () => continuo("radiante", "mente", 10),
    "noxia-nocivo": () => continuo("veneno", "vigor", 10),
    "fulgur-chocante": () => cond("imobilizado", "vigor", 10),
    "glacios-congelante": () => cond("imobilizado", "forca", 10),
  };
  if (NO_ACERTO[prop.id]) {
    const efeito = NO_ACERTO[prop.id]();
    if (c.tipoVar === "arma" || (!c.tipoVar && c.tipos.has("arma"))) return { arma: { aplica: [efeito] } };
    const onde = c.tipoVar === "bracadeira" ? "dos seus ataques (braçadeiras)" : "dos ataques com esta munição";
    return { info: `quem sofre dano ${onde}: ${efeito.label}` };
  }
  // Focos: bônus na Conjuração das magias da palavra.
  const foco = txt.match(/composta pela palavra arcana (\S+?) usando esse item como foco, você recebe um bônus para a rolagem de conjuração/i);
  if (foco) {
    const w = semAcento(foco[1]).replace(/[^a-z]/g, "");
    const palavra = PALAVRAS.includes(w) ? w : prop.palavra;
    return { efeitos: [ef("bonus", `conjuracao:${palavra}`, c.V)] };
  }
  // Focos: dano adicional nas magias da palavra (o sistema não soma sozinho).
  if (/Se esta magia causar dano, ela irá causar dano/i.test(txt) && elem) {
    return { info: `+${c.V} de dano bruto de ${DTYPES[elem]} nas magias de ${prop.palavra} com este foco` };
  }
  // 1D no atributo.
  const dado = txt.match(/recebe 1D no seu atributo de (\S+?)\./);
  if (dado) {
    const attr = Object.entries(ATTRS).find(([, r]) => semAcento(r) === semAcento(dado[1]))?.[0];
    if (attr) return { efeitos: [ef("dice", attr, 1)] };
  }
  // +1/2/3 pontos no atributo (sorcdiron).
  const pontos = txt.match(/recebe 1\/2\/3 pontos em (Agilidade|Força|Mente|Percepção|Vigor)\b/);
  if (pontos) {
    const attr = Object.entries(ATTRS).find(([, r]) => r === pontos[1])?.[0];
    if (attr) return { efeitos: [ef("attr", attr, c.V)] };
  }
  if (/^Imunidade/.test(nome) && elem) {
    return { info: `ignora dano final${/contínuo/.test(txt) ? " e contínuo" : ""} de ${DTYPES[elem]}` };
  }
  if (/^Absorção/.test(nome)) {
    return { info: `dano final de ${elem ? DTYPES[elem] : "arma"} vira ${/pontos de magia/.test(txt) ? "PM" : "PV"}` };
  }
  if (/^Penetração/.test(nome) && elem) {
    return { info: `seus ataques ignoram Proteção contra ${DTYPES[elem]}` };
  }
  if (prop.tipos.includes("pedra_ionica")) {
    const em = txt.match(/bônus em (rolagens .+?) enquanto/)?.[1] ?? "rolagens";
    return { info: `+${c.V} em ${em} (com a pedra em órbita)` };
  }
  return null;
}

/** Contexto (V, G, CD) da variante escolhida. */
export function contexto(prop, variante, tipos) {
  const v = variante ?? prop.variantes[0];
  return {
    prop, v, tipos: tipos ?? new Set(), tipoVar: v?.tipo ?? "",
    V: v?.valor ?? v?.grau ?? 1, G: v?.grau ?? 1, CD: v?.cd ?? 10,
  };
}

/**
 * Regra de automação de uma propriedade com a variante escolhida. Sem regra
 * escrita, as constantes viram um lembrete e as ativadas, uma ação com o
 * texto do livro na descrição.
 */
export function regraDe(prop, ctx) {
  const c = ctx ?? contexto(prop, null, new Set());
  const r = REGRAS[prop.id]?.(c) ?? regraDaFamilia(prop, c);
  if (r) return r;
  return (prop.ativacao === "Constante" && !prop.consumivel) ? { info: "ativa (ver descrição)" } : acaoInfo("");
}

/** A regra mexe na ficha (efeito, dano, cura, condição, movimento)? */
export function automatizada(regra) {
  if (!regra) return false;
  if (regra.efeitos?.length) return true;
  const a = regra.arma;
  if (a && (a.extra?.length || a.aplica?.length || a.final || a.base || a.dreno)) return true;
  const x = regra.acao;
  return !!(x && (x.aplica?.length || x.heal || x.damage || x.movement));
}

/* ------------------------------------------------------------------ */
/*  Construção                                                         */
/* ------------------------------------------------------------------ */

const ROTULO_ALVO = {
  all: "todas as rolagens", forca: "Força", agilidade: "Agilidade", vigor: "Vigor", mente: "Mente",
  percepcao: "Percepção", conjuracao: "Conjuração", esquiva: "Esquiva", bloqueio: "Bloqueio",
  iniciativa: "Iniciativa", attack: "ataque", attackMelee: "ataques corpo a corpo",
  attackRanged: "ataques à distância", hp: "PV máximo", mp: "PM máximo", deslocamento: "Deslocamento",
};
const alvoLegivel = (t) => (String(t).startsWith("conjuracao:")
  ? `Conjuração (${String(t).slice(11)})` : (ROTULO_ALVO[t] ?? t));

/** Texto curto de um efeito, para rótulos. */
export function descreverEfeito(e) {
  const v = e.value;
  switch (e.type) {
    case "rd": return `Proteção ${v} (${e.damageType && e.damageType !== "all" ? DTYPES[e.damageType] : "todos os tipos"})`;
    case "vuln": return `vulnerável ${v} a ${DTYPES[e.damageType] ?? e.damageType}`;
    case "bonus": return `${Number(v) >= 0 ? "+" : ""}${v} em ${alvoLegivel(e.target)}`;
    case "dice": return `${v}D em ${alvoLegivel(e.target)}`;
    case "rollDice": return `${v}D na rolagem de ${alvoLegivel(e.target)}`;
    case "attr": return `+${v} em ${alvoLegivel(e.target)}`;
    case "stat": return `+${v} de ${alvoLegivel(e.target)}`;
    case "set": return e.label || `${alvoLegivel(e.target)} = ${v}`;
    case "condition": return ROTULO_COND[e.target] ?? e.target;
    default: return e.label || e.type;
  }
}

/** Efeito do item no formato do sistema. */
function efeitoDoItem(e, label) {
  return {
    type: e.type, target: e.target ?? "all", value: String(e.value ?? "0"),
    rerollAll: false, vulnPercent: false, label, enabled: true, enchant: false,
    level: "all", damageType: e.damageType ?? "",
  };
}

/** Efeito constante → efeito aplicado (para a ativação até o fim da cena). */
function efeitoParaAplicavel(e, label) {
  const alvo = ["rd", "vuln"].includes(e.type) ? (e.damageType || "all") : (e.target ?? "all");
  return novoApplies(label, { fxType: e.type, fxTarget: alvo, fxValue: String(e.value ?? "0"), durationMode: "scene" });
}

const somaFormula = (f, n) => {
  const s = String(f ?? "").trim();
  if (!s) return String(n);
  return /^-?\d+$/.test(s) ? String(Number(s) + Number(n)) : `${s}+${n}`;
};

/** Mudanças de arma (mutação in-place numa ação de ataque). */
function aplicarNaArma(a, arma) {
  a.extraDamage = Array.isArray(a.extraDamage) ? a.extraDamage : [];
  a.appliesEffects = Array.isArray(a.appliesEffects) ? a.appliesEffects : [];
  for (const x of arma.extra ?? []) {
    a.extraDamage.push({ formula: String(x.formula), type: x.type ?? "", resource: x.resource ?? "hp", scaling: false });
  }
  for (const e of arma.aplica ?? []) {
    const { label, ...resto } = e;
    a.appliesEffects.push(novoApplies(label, resto));
  }
  if (arma.final && a.damageType !== "final") {
    // "Todo o dano base da arma é considerado dano final": o base sai como
    // final (fixo) e o escalonado continua do tipo da arma, à parte.
    const tipo = a.damageType;
    const escalava = !!a.scalingDamage;
    a.damageType = "final";
    a.scalingDamage = false;
    if (escalava) a.extraDamage.push({ formula: "0", type: tipo, resource: "hp", scaling: true });
  }
  if (arma.base) a.damage = somaFormula(a.damage, arma.base);
  // Dreno (sistema build 27): parte do dano que passou volta como recurso.
  if (arma.dreno) {
    a.drain = { enabled: true, resource: arma.dreno.resource ?? "hp", from: arma.dreno.from ?? "scaling",
                ratio: String(arma.dreno.ratio ?? "1") };
  }
}

/** Campos de ação do sistema a partir de uma regra `acao`. */
function acaoDaRegra(label, s, custo) {
  const extra = {
    canRoll: !!s.canRoll, rollAttr: s.rollAttr ?? "agilidade", defenseAttr: s.defenseAttr ?? "esquiva",
    targetMode: s.targetMode ?? "self", includeSelf: s.includeSelf ?? true, areaFilter: s.areaFilter ?? "all",
    range: s.range ?? "", area: s.area ?? "", costMp: String(custo),
    heal: s.heal ?? "", healResource: s.healResource ?? "hp",
    damage: s.damage ?? "", damageType: s.damageType ?? "", damageResource: "hp", scalingDamage: false,
    appliesEffects: (s.aplica ?? []).map(({ label: l, ...resto }) => novoApplies(l, resto)),
  };
  if (s.movement) {
    extra.movement = { enabled: true, kind: "push", who: "targets", distance: "0", lateralSide: "right",
      ignoreWalls: false, snap: true, ...s.movement };
    if (extra.movement.kind === "teleport") extra.movement.ignoreWalls = true;
  }
  if (s.persistArea) {
    Object.assign(extra, { persistArea: true, persistRounds: s.persistRounds ?? "0",
      persistTrigger: s.persistTrigger ?? "both", persistAffectsSelf: false });
  }
  return novaAcao(label, extra);
}

/** O verbo da ação de um consumível, pelo tipo do item: a poção se bebe, a bomba se arremessa... */
const VERBO_DO_CONSUMIVEL = [["pocao", "Beber"], ["bomba", "Arremessar"], ["oleo", "Aplicar"], ["pedra", "Usar"]];
export function verboDoConsumivel(tipos) {
  return VERBO_DO_CONSUMIVEL.find(([t]) => tipos?.has?.(t))?.[1] ?? "Usar";
}

/** "24 Vo" + 7.000 → "7.024 Vo"; preço em outra moeda (ou "—") vira só o das propriedades. */
export function somarPreco(preco, total) {
  const m = String(preco ?? "").trim().match(/^([\d.]+)\s*Vo$/i);
  const base = m ? Number(m[1].replace(/\./g, "")) : 0;
  return formatarVo(base + total);
}

/** Quantas propriedades este módulo já gravou no item (cada magia guardada conta uma). */
export function propriedadesGravadas(data) {
  return (data?.flags?.[MODULE_ID]?.encantamentos ?? [])
    .reduce((n, e) => n + (e?.tipo === "magia" ? 1 : (e?.propriedades?.length ?? 0)), 0);
}

/**
 * Grava um encantamento nos dados de um equipamento (cópia; o original não
 * muda). Devolve os dados novos, prontos para `item.update`.
 *
 * @param {object} dados  item.toObject()
 * @param {object} opcoes
 * @param {"Menor"|"Intermediário"|"Maior"} opcoes.nivel
 * @param {{prop: object, variante?: object, palavra?: string}[]} opcoes.escolhas  uma por palavra
 * @param {boolean} [opcoes.lendario]  não gasta mana
 * @param {string} [opcoes.nome]  novo nome (vazio mantém)
 * @param {object} [cfg]
 * @param {boolean} [cfg.animar]  animações automáticas nas ações novas
 * @param {(k:string)=>boolean} [cfg.existe]  a chave existe no JB2A?
 */
export function construirEncantamento(dados, { nivel, escolhas, lendario = false, nome = "" }, { animar = true, existe = null } = {}) {
  const N = NIVEIS_ITEM[nivel];
  if (!N) throw new Error(`Nível de item desconhecido: ${nivel}`);
  const data = clone(dados);
  data.system ??= {};
  const sys = data.system;
  sys.actions = Array.isArray(sys.actions) ? sys.actions : [];
  sys.effects = Array.isArray(sys.effects) ? sys.effects : [];
  const pm = lendario ? 0 : N.pm;
  const tipos = tiposDoItem(data);
  const antes = {
    name: data.name,
    system: { actions: clone(sys.actions), effects: clone(sys.effects), description: sys.description ?? "", price: sys.price ?? "" },
  };

  // A mesma propriedade em mais de uma palavra conta uma vez (ela já vem no
  // nível do item); as palavras continuam contando para o nível e a mana.
  const vistas = new Set();
  const lista = [];
  for (const e of escolhas ?? []) {
    if (!e?.prop || vistas.has(e.prop.id)) continue;
    vistas.add(e.prop.id);
    const variante = e.variante ?? variantePadrao(e.prop, N.n, tipos) ?? e.prop.variantes[0];
    const ctx = contexto(e.prop, variante, tipos);
    lista.push({ prop: e.prop, variante, ctx, regra: regraDe(e.prop, ctx) });
  }

  const ataques = sys.actions.filter(eAtaque);
  const constantes = [];
  const deArma = [];
  const ativadas = [];
  for (const r of lista) {
    const { regra } = r;
    if (regra.arma && ataques.length) deArma.push(r);
    else if (regra.arma) {
      // Propriedade de arma num item sem ataque: fica como lembrete.
      regra.info = regra.info ?? "aplique aos ataques feitos com o item (ele não tem ação de ataque)";
    }
    if (regra.efeitos?.length || regra.info) constantes.push(r);
    if (regra.acao) ativadas.push(r);
  }

  const custoTxt = lendario ? "lendário, sem mana" : `${pm} PM`;
  const novas = [];

  // 1) Constantes: uma ativação até o fim da cena (ou efeitos fixos, se lendário).
  if (constantes.length) {
    if (lendario) {
      for (const r of constantes) {
        for (const e of r.regra.efeitos ?? []) sys.effects.push(efeitoDoItem(e, `✦ ${r.prop.nome}: ${descreverEfeito(e)}`));
        if (r.regra.info) sys.effects.push(efeitoDoItem({ type: "info", target: "all", value: "0" }, `✦ ${r.prop.nome}: ${r.regra.info}`));
      }
    } else {
      const aplica = [];
      for (const r of constantes) {
        for (const e of r.regra.efeitos ?? []) aplica.push(efeitoParaAplicavel(e, `✦ ${r.prop.nome}: ${descreverEfeito(e)}`));
        if (r.regra.info) aplica.push(novoApplies(`✦ ${r.prop.nome}: ${r.regra.info}`, { fxType: "bonus", fxTarget: "all", fxValue: "0" }));
      }
      const nomes = constantes.map((r) => r.prop.nome).join(", ");
      const a = novaAcao(`✦ Ativar ${nomes} (${pm} PM, até o fim da cena)`, {
        canRoll: false, targetMode: "self", includeSelf: true, costMp: String(pm), appliesEffects: aplica,
      });
      a._palavra = constantes[0].prop.palavra;
      novas.push(a);
    }
  }

  // 2) Arma: versões ✦ dos ataques (ou o próprio ataque, se lendário).
  if (deArma.length) {
    const sempre = deArma.filter((r) => !r.regra.arma.base);
    const presa = deArma.filter((r) => r.regra.arma.base);
    const rotulo = (rs) => rs.map((r) => r.regra.arma.sufixo ? `${r.prop.nome}: ${r.regra.arma.sufixo}` : r.prop.nome).join(" + ");
    for (const atk of ataques) {
      const original = atk.label;
      if (sempre.length) {
        if (lendario) {
          for (const r of sempre) aplicarNaArma(atk, r.regra.arma);
          atk.label = `${original} ✦ ${rotulo(sempre)}`;
        } else {
          const v = clone(atk);
          for (const r of sempre) aplicarNaArma(v, r.regra.arma);
          v.label = `✦ ${original} — ${rotulo(sempre)} (${pm} PM)`;
          v.costMp = somaFormula(atk.costMp || "0", pm);
          novas.push(v);
        }
      }
      for (const r of presa) {
        // Só contra a presa escolhida: sempre uma versão à parte (no item
        // lendário o ataque já carrega as outras propriedades de arma).
        const v = clone(atk);
        if (!lendario) for (const s of sempre) aplicarNaArma(v, s.regra.arma);
        aplicarNaArma(v, r.regra.arma);
        const outras = sempre.length ? ` + ${rotulo(sempre)}` : "";
        v.label = `✦ ${original} — ${r.prop.nome} ${r.regra.arma.condicional}${outras} (${custoTxt})`;
        v.costMp = somaFormula(atk.costMp || "0", pm);
        novas.push(v);
      }
    }
  }

  // 3) Ativadas: uma ação cada (consumível não cobra mana: é gasto — e a
  //    ação diz o que se faz com ele: a poção se bebe, a bomba se arremessa).
  for (const r of ativadas) {
    const s = r.regra.acao;
    const custo = r.prop.consumivel ? 0 : pm;
    const detalhe = s.rotulo ? ` — ${s.rotulo}` : "";
    const label = r.prop.consumivel
      ? `✦ ${verboDoConsumivel(tipos)}: ${r.prop.nome}${detalhe} (consumível)`
      : `✦ ${r.prop.nome}${detalhe} (${custoTxt})`;
    const a = acaoDaRegra(label, s, custo);
    a._palavra = r.prop.palavra;
    novas.push(a);
  }
  sys.actions.push(...novas);

  // Preço, descrição e receita.
  const total = lista.reduce((t, r) => t + (r.variante?.preco ?? 0), 0);
  const palavras = (escolhas ?? []).map((e) => e?.palavra ?? e?.prop?.palavra).filter(Boolean);
  sys.price = somarPreco(sys.price, total);
  sys.description = (sys.description ?? "") + descricaoDoEncantamento({ nivel, pm, lendario, palavras, lista, total });
  if (nome && nome.trim()) data.name = nome.trim();

  data.flags ??= {};
  data.flags[MODULE_ID] ??= {};
  data.flags[MODULE_ID].encantamentos = [...(data.flags[MODULE_ID].encantamentos ?? []), {
    id: novoId(), nivel, pm: N.pm, lendario, palavras,
    // Uma entrada por palavra (com as repetições), para refazer igual.
    slots: (escolhas ?? []).filter((e) => e?.prop).map((e) => ({ palavra: e.palavra ?? e.prop.palavra, id: e.prop.id })),
    propriedades: lista.map((r) => ({ id: r.prop.id, nome: r.prop.nome, palavra: r.prop.palavra,
      variante: r.variante?.rotulo ?? "", preco: r.variante?.preco ?? 0,
      indice: r.variante?.indice ?? r.prop.variantes.findIndex((v) => v.preco === r.variante?.preco && (v.rotulo ?? "") === (r.variante?.rotulo ?? "")) })),
    preco: total, antes,
  }];

  if (animar) animarItemEncantado(data, { existe: existe ?? criarVerificador() });
  for (const a of sys.actions) delete a._palavra;
  return data;
}

/** Bloco da descrição: o que foi encantado, a mana e o texto do livro. */
function descricaoDoEncantamento({ nivel, pm, lendario, palavras, lista, total }) {
  const consumiveis = lista.filter((r) => r.prop.consumivel).length;
  const mana = lendario
    ? "Item <b>lendário</b>: ativa as propriedades sem gastar mana."
    : consumiveis && consumiveis === lista.length
      ? "Item <b>consumível</b>: não gasta mana — é gasto ao usar (pedras, poções, óleos, elixires e bombas são consumidos quando utilizados)."
      : `Ativar as propriedades custa <b>${pm} PM</b> (1 por palavra arcana) a cada uso; as constantes valem até o fim da cena.`
        + (consumiveis ? " As consumíveis não gastam mana: são gastas ao usar." : "");
  const itens = lista.map((r) => {
    const v = r.variante?.rotulo ? ` · ${esc(r.variante.rotulo)}` : "";
    const auto = automatizada(r.regra) ? "" : " <em>(sem automação: aplique pela descrição)</em>";
    const obs = r.regra.obs ? `<br><em>${esc(r.regra.obs)}</em>` : "";
    const corr = r.prop.corrupcao ? `<br><em>Corrupção: ${esc(r.prop.corrupcao)}</em>` : "";
    return `<li><b>${esc(r.prop.nome)}</b> (${esc(r.prop.palavra)} · ${esc(r.prop.ativacao)}${v} · +${formatarVo(r.variante?.preco)})${auto}<br>${esc(r.prop.texto)}${obs}${corr}</li>`;
  }).join("");
  return `<hr><h3>✦ Encantamento — Item ${esc(nivel)} (${esc(palavras.join(" + "))})</h3>`
    + `<p>${mana}</p><ul>${itens}</ul><p>Preço das propriedades: +${formatarVo(total)}.</p>`;
}

/**
 * Desfaz o último encantamento gravado por este módulo (dados para
 * `item.update`), ou null se não há o que desfazer.
 */
export function desfazerEncantamento(dados) {
  const lista = [...(dados?.flags?.[MODULE_ID]?.encantamentos ?? [])];
  const ultimo = lista.pop();
  if (!ultimo?.antes) return null;
  return {
    name: ultimo.antes.name,
    "system.actions": ultimo.antes.system.actions,
    "system.effects": ultimo.antes.system.effects,
    "system.description": ultimo.antes.system.description,
    "system.price": ultimo.antes.system.price,
    [`flags.${MODULE_ID}.encantamentos`]: lista,
  };
}

/**
 * Refaz todos os encantamentos deste módulo no item, trocando só o
 * "lendário" (com ou sem mana) — o item volta ao estado de antes do primeiro
 * e cada receita é aplicada de novo, com as mesmas palavras, propriedades e
 * preços. O nome atual fica. Devolve os dados novos, ou null.
 */
export function refazerEncantamentos(dados, { lendario }, cfg = {}) {
  const receitas = dados?.flags?.[MODULE_ID]?.encantamentos ?? [];
  if (!receitas.length || !receitas[0]?.antes) return null;
  let atual = clone(dados);
  Object.assign(atual.system, clone(receitas[0].antes.system));
  atual.name = receitas[0].antes.name;
  atual.flags[MODULE_ID].encantamentos = [];
  for (const rec of receitas) {
    if (rec.tipo === "magia") {
      atual = construirItemConjurador(atual, { magia: rec.magia, lendario, pergaminho: !!rec.pergaminho });
      continue;
    }
    const porId = new Map((rec.propriedades ?? []).map((p) => [p.id, p]));
    const slots = rec.slots?.length ? rec.slots : (rec.propriedades ?? []).map((p) => ({ palavra: p.palavra, id: p.id }));
    const escolhas = slots.map((sl) => {
      const prop = PROPRIEDADES.find((p) => p.id === sl.id);
      if (!prop) return null;
      const salvo = porId.get(sl.id);
      const i = Number.isInteger(salvo?.indice) && salvo.indice >= 0 ? salvo.indice
        : prop.variantes.findIndex((v) => v.preco === salvo?.preco);
      const variante = i >= 0 ? { ...prop.variantes[i], indice: i } : undefined;
      return { prop, variante, palavra: sl.palavra };
    }).filter(Boolean);
    atual = construirEncantamento(atual, { nivel: rec.nivel, escolhas, lendario }, cfg);
  }
  atual.name = dados.name;
  return atual;
}

/** Todos os encantamentos deste módulo no item são lendários? */
export function eLendario(dados) {
  const receitas = dados?.flags?.[MODULE_ID]?.encantamentos ?? [];
  return receitas.length > 0 && receitas.every((r) => r.lendario);
}

/* ------------------------------------------------------------------ */
/*  Itens conjuradores: o item guarda uma magia                         */
/* ------------------------------------------------------------------ */
/*
 * Em vez de propriedades, o item guarda UMA magia (uma por encantamento).
 * Quem estiver com ele conjura a magia com a própria Conjuração, pagando os
 * PM do círculo — e, como numa magia comum, valem os bônus de Palavra Arcana
 * e dos focos das palavras dela. Para isso o sistema precisa de uma magia de
 * verdade (é o tipo "magia" que carrega as palavras): enquanto o item estiver
 * numa ficha, o módulo mantém nela a MAGIA VINCULADA "Magia (Item)", criada
 * e apagada junto com o item. O item em si leva a magia guardada (flags) e a
 * descrição do que ela faz.
 *
 * Nível do item = círculo da magia (Menor 1 PM, Intermediária 2, Maior 3).
 * Preço e tempo: os de criar uma magia daquele círculo (Sessão 11). Item
 * lendário conjura sem mana. Pergaminho: quem grava paga os PM na gravação
 * (1 hora) e quem conjura paga de novo; conjurar leva uma rodada completa e
 * queima o pergaminho.
 */

/** Círculo da magia → nível do item conjurador. */
export const NIVEL_DA_MAGIA = { "Menor": "Menor", "Intermediária": "Intermediário", "Maior": "Maior" };

/** Criar uma magia (Sessão 11) — o preço e o tempo de guardá-la num item. */
export const CRIACAO_DA_MAGIA = {
  "Menor": { preco: 400, tempo: "1 dia" },
  "Intermediário": { preco: 7000, tempo: "7 dias" },
  "Maior": { preco: 200000, tempo: "30 dias" },
};

/** O item é um pergaminho? */
export const ePergaminho = (data) => /^pergaminho\b/i.test(String(data?.name ?? "").trim());

/** Palavras da magia (tantas quanto o círculo pede). */
export function palavrasDaMagia(magia) {
  const s = magia?.system ?? {};
  const n = { "Menor": 1, "Intermediária": 2, "Maior": 3 }[s.tier] ?? 1;
  return [s.wordId, s.wordId2, s.wordId3].slice(0, n).map((w) => semAcento(w)).filter(Boolean);
}

/** O que guardar da magia escolhida: o item leva a magia consigo. */
export function retratoDaMagia(doc) {
  const d = typeof doc?.toObject === "function" ? doc.toObject() : clone(doc);
  const nossos = clone(d?.flags?.[MODULE_ID] ?? {});
  delete nossos.doItem;
  delete nossos.encId;
  // O id de origem fica junto: é por ele (e pelo nome) que se reconhecem as
  // ações que a magia dispara nela mesma (antes da rolagem e em cadeia).
  return { name: d?.name ?? "Magia", img: d?.img || "icons/svg/explosion.svg", idOriginal: d?._id ?? doc?.id ?? "",
    system: clone(d?.system ?? {}), flags: { [MODULE_ID]: nossos } };
}

const ROTULO_ATTR = {
  forca: "Força", agilidade: "Agilidade", vigor: "Vigor", mente: "Mente", percepcao: "Percepção",
  conjuracao: "Conjuração", esquiva: "Esquiva", bloqueio: "Bloqueio", iniciativa: "Iniciativa",
};
const ROTULO_VAR = { ...ROTULO_ATTR, nivel: "Nível", deslocamento: "Deslocamento" };
const ROTULO_RECURSO = { hp: "PV", mp: "PM", heroic: "PH", hpTemp: "de sobrevida" };

/** Fórmula do sistema → texto do livro ("5*@nivel" → "5 × Nível"). */
export function formulaLegivel(f) {
  let s = String(f ?? "").trim();
  if (!s) return "";
  s = s.replace(/ceil\(@nivel\/2\)/g, "metade do Nível (para cima)")
    .replace(/floor\(@nivel\/2\)/g, "metade do Nível")
    .replace(/@(\w+)/g, (_, v) => ROTULO_VAR[v] ?? v)
    .replace(/\*/g, " × ")
    .replace(/\s+/g, " ");
  return s.trim();
}

/** Distância em metros, no jeito do livro ("5*@nivel" → "5m × Nível"). */
function metros(f) {
  const s = String(f ?? "").trim();
  if (!s) return "";
  if (/^\d+(\.\d+)?$/.test(s)) return `${s}m`;
  const m = s.match(/^(\d+)\s*\*\s*(.+)$/);
  if (m) return `${m[1]}m × ${formulaLegivel(m[2])}`;
  return `${formulaLegivel(s)} (em metros)`;
}

/** O que UMA ação faz, em texto (vai para a descrição do item). */
export function resumoDaAcao(a) {
  const p = [];
  const regiao = ["target", "area", "aura", "line", "cone", "lineCustom"].includes(a.targetMode);
  if (a.canRoll) {
    const def = regiao && a.defenseAttr
      ? ` contra ${ROTULO_ATTR[a.defenseAttr] ?? a.defenseAttr}${a.defenseAttr2 ? ` ou ${ROTULO_ATTR[a.defenseAttr2] ?? a.defenseAttr2}` : ""} dos alvos`
      : "";
    p.push(`rola ${ROTULO_ATTR[a.rollAttr] ?? a.rollAttr}${def}`);
  }
  if (a.vsDifficulty) p.push(`contra CD ${formulaLegivel(a.fixedDifficulty)}`);
  const area = metros(a.area);
  const alcance = String(a.range ?? "").trim() === "0" ? "" : metros(a.range);
  switch (a.targetMode) {
    case "self": p.push("em você"); break;
    case "target": p.push("num alvo"); break;
    case "area": p.push(`área de ${area || "?"} de raio`); break;
    case "aura": p.push(`aura de ${area || "?"} em volta de você`); break;
    case "line": p.push(`linha de ${alcance || "?"}`); break;
    case "cone": p.push(`cone de ${alcance || "?"}`); break;
    case "lineCustom": p.push(`linha de ${area || "?"}`); break;
    default: break;
  }
  if (alcance && !["line", "cone", "self"].includes(a.targetMode)) p.push(`alcance ${alcance}`);
  const dano = String(a.damage ?? "").trim();
  const recurso = a.damageResource ?? "hp";
  if (dano) {
    if (recurso !== "hp") p.push(`drena ${formulaLegivel(dano)} ${ROTULO_RECURSO[recurso]}`);
    else if (a.damageType === "final") p.push(`Dano Final ${formulaLegivel(dano)} (ignora a Proteção)`);
    else {
      const tipo = DTYPES[a.damageType] ?? "";
      p.push(a.scalingDamage ? `dano ${tipo} +${formulaLegivel(dano)} (escalonado)`.replace(/\s+/g, " ")
        : `dano ${tipo} ${formulaLegivel(dano)} (fixo)`.replace(/\s+/g, " "));
    }
  }
  for (const ex of a.extraDamage ?? []) {
    if (!String(ex.formula ?? "").trim()) continue;
    const r = ex.resource ?? "hp";
    p.push(r !== "hp" ? `drena mais ${formulaLegivel(ex.formula)} ${ROTULO_RECURSO[r]}`
      : `mais ${ex.scaling ? "+" : ""}${formulaLegivel(ex.formula)} de ${DTYPES[ex.type] ?? "dano"}${ex.scaling ? " (escalonado)" : ""}`);
  }
  if (String(a.heal ?? "").trim()) {
    p.push(`recupera ${formulaLegivel(a.heal)} ${ROTULO_RECURSO[a.healResource ?? "hp"] ?? "PV"}${a.scalingHeal ? " (+1 a cada 2 acima)" : ""}`);
  }
  const efeitos = (a.appliesEffects ?? []).map((e) => {
    const dur = e.durationMode === "rounds" ? `${formulaLegivel(e.durationRounds)} rodada(s)` : "até o fim da cena";
    const res = e.resist && !/anula/i.test(e.label ?? "")
      ? ` (${ROTULO_ATTR[e.resistAttr] ?? e.resistAttr} anula${e.resistVsCast ? "" : `, CD ${formulaLegivel(e.resistDc)}`})` : "";
    return `${e.label} — ${dur}${res}`;
  });
  if (efeitos.length) p.push(`aplica ${efeitos.join("; ")}`);
  const mv = a.movement;
  if (mv?.enabled) {
    const quem = mv.who === "self" ? "você" : "os alvos";
    const dist = String(mv.distance ?? "0").trim() === "0" ? "à vontade" : metros(mv.distance);
    const verbo = { teleport: "teleporta", push: "empurra", pull: "puxa", lateral: "desloca de lado", place: "move" }[mv.kind] ?? "move";
    p.push(`${verbo} ${quem} ${dist}`);
  }
  if (a.persistArea) {
    const r = Number(a.persistRounds) || 0;
    p.push(`a área fica ${r > 0 ? `${r} rodada(s)` : "até o fim da cena"}`);
  }
  const dr = a.drain;
  if (dr?.enabled) {
    const parte = { base: "do dano base", scaling: "do dano escalonado", both: "do dano causado" }[dr.from] ?? "do dano causado";
    const taxa = String(dr.ratio ?? "").trim();
    const prop = taxa && taxa !== "1" ? ` (× ${formulaLegivel(taxa)})` : "";
    p.push(`você recupera ${ROTULO_RECURSO[dr.resource] ?? "PM"} ${parte}${prop}`);
  }
  const tira = (a.removesEffects ?? []).filter((r) => r && r.enabled !== false).map((r) => {
    const quantos = String(r.count ?? "").trim() && String(r.count).trim() !== "0" ? `${formulaLegivel(r.count)} ` : "";
    switch (r.mode) {
      case "condition": return `${quantos}efeito de ${ROTULO_COND[r.value] ?? r.value}`;
      case "mine": return `${quantos}efeitos que você aplicou`;
      case "all": return quantos ? `${quantos}efeitos` : "todos os efeitos";
      default: return `${quantos}"${r.value}"`;
    }
  });
  if (tira.length) p.push(`tira dos alvos ${tira.join(" e ")}`);
  const custo = Number(a.costMp) || 0;
  p.push(custo ? `${custo} PM` : "sem mana");
  return p.join(" · ");
}

/** Quando a ação em cadeia dispara (rótulos do sistema). */
const ROTULO_QUANDO = { always: "sempre", hit: "se acertar", miss: "se errar", crit: "se for crítico", damage: "se causar dano", heal: "se curar" };

/**
 * O que uma ação dispara na própria magia: "antes da rolagem: …; depois, em
 * cadeia (se acertar): …". Para a descrição do item conjurador.
 */
function encadeamentoDaAcao(m, a) {
  const acoes = m.system?.actions ?? [];
  const minha = (r) => r.tipo === "action" && (r.id === m.idOriginal || r.nome === String(m.name ?? "").replace(/\|/g, "/"));
  const nomeDe = (r) => String(acoes[r.indice]?.label ?? "?").replace(/^↳\s*/, "");
  const antes = (a.preActivations ?? []).map((x) => lerRef(x.ref)).filter(minha).map(nomeDe);
  const depois = (a.chainActions ?? []).filter((c) => minha(lerRef(c.ref)))
    .map((c) => `${nomeDe(lerRef(c.ref))} (${ROTULO_QUANDO[c.when] ?? c.when}${c.targets === "pick" ? ", com o alvo escolhido na hora" : ""})`);
  const partes = [];
  if (antes.length) partes.push(`antes da rolagem: ${antes.join("; ")}`);
  if (depois.length) partes.push(`depois, em cadeia: ${depois.join("; ")}`);
  return partes.join(" — ");
}

/** A magia guardada como ela fica no item (custo do lendário, pergaminho). */
function magiaAjustada(retrato, { lendario = false, pergaminho = false } = {}) {
  const m = clone(retrato);
  const s = m.system ?? (m.system = {});
  s.actions = Array.isArray(s.actions) ? s.actions : [];
  if (!s.actions.length) {
    // Magia só descritiva: ganha uma ação de conjurar (rolagem de Conjuração,
    // com os PM do círculo), para o item ter o que disparar. A mana passa a
    // sair dessa ação — ligar a magia na ficha deixa de cobrar de novo.
    const pm = { "Menor": 1, "Intermediária": 2, "Maior": 3 }[s.tier] ?? 1;
    s.actions.push(novaAcao(`Conjurar ${m.name} (rolagem de Conjuração)`, {
      canRoll: true, rollAttr: "conjuracao", targetMode: "none", includeSelf: false, costMp: String(pm),
    }));
    s.costs = [];
  }
  if (lendario) {
    for (const a of s.actions) a.costMp = "0";
    s.costs = [];
  }
  if (pergaminho) {
    // "Conjurar uma magia a partir de um pergaminho requer sempre uma
    // rodada completa" — e ele queima na conjuração. Só nas ações que se
    // usam: as que a magia dispara sozinha (↳) fazem parte da mesma conjuração.
    s.casting = "Rodada completa (pergaminho)";
    const internas = internasDaMagia(m);
    s.actions.forEach((a, i) => { if (!internas.has(i)) a.label = `${a.label} — queima o pergaminho`; });
  }
  return m;
}

/** Ações que a magia dispara nela mesma (antes da rolagem ou em cadeia): não se usam à parte. */
function internasDaMagia(m) {
  return acoesDisparadas(m, { id: m.idOriginal, nome: m.name });
}

/** Bloco da descrição do item: a magia guardada e o que ela faz. */
function descricaoDoItemConjurador({ magia, nivel, pm, lendario, pergaminho, palavras, preco, tempo, itemNome }) {
  const s = magia.system ?? {};
  const circulo = s.tier || "Menor";
  const uso = lendario
    ? "sem gastar mana (item <b>lendário</b>)"
    : `pagando <b>${pm} PM</b> (Círculo ${esc(circulo)}) a cada conjuração`;
  const caracteristicas = [["Conjurar", s.casting], ["Alvo", s.target], ["Área", s.area], ["Alcance", s.range], ["Duração", s.duration]]
    .filter(([, v]) => String(v ?? "").trim())
    .map(([k, v]) => `<b>${k}:</b> ${esc(v)}`).join(" · ");
  const acoes = s.actions ?? [];
  // As ações que a magia dispara sozinha aparecem como parte da que se usa.
  const internas = internasDaMagia(magia);
  const oQueFaz = acoes.length
    ? `<p><b>O que a magia faz:</b></p><ul>${acoes.map((a, i) => {
      const cadeia = encadeamentoDaAcao(magia, a);
      const marca = internas.has(i) ? " <em>(dispara sozinha, sem custo)</em>" : "";
      return `<li><b>${esc(a.label)}</b>${marca}: ${esc(resumoDaAcao(a))}.${cadeia ? ` <em>${esc(cadeia)}.</em>` : ""}</li>`;
    }).join("")}</ul>`
    : `<p><b>O que a magia faz:</b> efeito descrito abaixo.</p>`;
  const perg = pergaminho
    ? `<p><b>Pergaminho:</b> gravar a magia custou ${pm || NIVEIS_ITEM[nivel]?.pm} PM a quem a gravou (1 hora). Conjurar a partir dele `
      + `${lendario ? "não gasta mana" : `também custa ${pm} PM`}, leva sempre uma rodada completa e <b>queima o pergaminho</b> — apague-o da ficha depois de conjurar.</p>`
    : "";
  const custo = pergaminho
    ? "<p>Gravação: 1 hora e os PM da magia.</p>"
    : `<p>Preço: +${formatarVo(preco)} (como criar uma magia de Círculo ${esc(circulo)}: ${esc(tempo)}).</p>`;
  return `<hr><h3>✦ Item conjurador — ${esc(magia.name)}</h3>`
    + `<p><b>Magia guardada:</b> ${esc(magia.name)} (Círculo ${esc(circulo)}${palavras.length ? ` · ${esc(palavras.join(" + "))}` : ""}) — item conjurador ${esc(nivel)}.</p>`
    + `<p><b>Como usar:</b> quem estiver com o item usa as ações <b>✦</b> dele e conjura a magia com a própria Conjuração, ${uso}. `
    + `Os bônus de Palavra Arcana e dos focos das palavras da magia valem. Com o item na ficha, a magia também aparece na lista `
    + `de Magias como <b>${esc(nomeDaMagiaVinculada(magia.name, itemNome))}</b> — é ela que as ações ✦ disparam, e ela sai junto com o item.</p>`
    + perg
    + (caracteristicas ? `<p>${caracteristicas}</p>` : "")
    + oQueFaz
    + (String(s.description ?? "").trim() ? `<div class="ligeia-magia-guardada">${s.description}</div>` : "")
    + custo;
}

/**
 * Grava uma magia num equipamento (cópia; devolve os dados para
 * `item.update`). O item ganha a descrição do que a magia faz, o preço e a
 * receita; a magia vinculada na ficha é feita por sincronizarMagiasDoItem.
 *
 * @param {object} dados  item.toObject()
 * @param {object} opcoes
 * @param {object} opcoes.magia  a magia (documento ou retratoDaMagia)
 * @param {boolean} [opcoes.lendario]  conjura sem mana
 * @param {boolean} [opcoes.pergaminho]  regra do pergaminho (padrão: pelo nome)
 * @param {string} [opcoes.nome]  novo nome (vazio mantém; pergaminho em branco vira "Pergaminho de X")
 */
export function construirItemConjurador(dados, { magia, lendario = false, pergaminho = null, nome = "" }) {
  const data = clone(dados);
  data.system ??= {};
  const sys = data.system;
  const retrato = retratoDaMagia(magia);
  const nivel = NIVEL_DA_MAGIA[retrato.system?.tier] ?? "Menor";
  const N = NIVEIS_ITEM[nivel];
  const ehPergaminho = pergaminho ?? ePergaminho(data);
  const palavras = palavrasDaMagia(retrato);
  const { preco, tempo } = ehPergaminho ? { preco: 0, tempo: "1 hora" } : CRIACAO_DA_MAGIA[nivel];
  const antes = {
    name: data.name,
    system: { actions: clone(sys.actions ?? []), effects: clone(sys.effects ?? []), description: sys.description ?? "", price: sys.price ?? "" },
  };
  const emBranco = /^pergaminho(\s*\(em branco\))?$/i.test(String(data.name ?? "").trim());
  data.name = (nome && nome.trim()) || (ehPergaminho && emBranco ? `Pergaminho de ${retrato.name}` : data.name);
  const ajustada = magiaAjustada(retrato, { lendario, pergaminho: ehPergaminho });
  sys.actions = Array.isArray(sys.actions) ? sys.actions : [];
  sys.actions.push(...gatilhosDaMagia(ajustada, data.name, lendario));
  sys.description = (sys.description ?? "") + descricaoDoItemConjurador({
    magia: ajustada, nivel, pm: lendario ? 0 : N.pm, lendario, pergaminho: ehPergaminho, palavras, preco, tempo, itemNome: data.name,
  });
  if (preco) sys.price = somarPreco(sys.price, preco);
  data.flags ??= {};
  data.flags[MODULE_ID] ??= {};
  data.flags[MODULE_ID].encantamentos = [...(data.flags[MODULE_ID].encantamentos ?? []), {
    id: novoId(), tipo: "magia", nivel, pm: N.pm, lendario, pergaminho: ehPergaminho, palavras,
    magia: retrato, propriedades: [], preco, antes, gatilhos: true,
  }];
  return data;
}

/** Nome da magia vinculada na ficha: "Esfera Ígnea (Varinha de Fogo)". */
export const nomeDaMagiaVinculada = (magia, item) => `${magia} (${item})`;

/**
 * Referência de ativação prévia para a ação i da magia vinculada, no formato
 * do sistema (buildPreActivationRef): "action|id|i|nome". Com o id da magia
 * vinculada ela fica IGUAL à opção do select da ficha do item — sem ele o
 * select não marca nada e a primeira edição na ficha apagaria a referência.
 * O id só existe depois que a magia vinculada é criada (sincronizarMagiasDoItem).
 */
const refDaMagia = (i, nome, id = "") => ["action", id ?? "", Number(i) || 0, String(nome ?? "").replace(/\|/g, "/")].join("|");

/** O que a ação da magia cobra, para o rótulo da ação ✦: "1 PM", "sem mana". */
function custoDaAcao(a, lendario) {
  if (lendario) return "sem mana (lendário)";
  const pm = String(a?.costMp ?? "").trim();
  return pm && pm !== "0" ? `${pm} PM` : "sem mana";
}

/**
 * As ações ✦ que a magia põe no item, uma por ação da magia: cada uma
 * DISPARA a ação da magia vinculada (ativação prévia), que é quem rola — por
 * ser uma magia, ela recebe os bônus de palavra. O PM sai da ação da magia.
 */
function gatilhosDaMagia(ajustada, itemNome, lendario) {
  const vinculada = nomeDaMagiaVinculada(ajustada.name, itemNome);
  // Só as ações que se usam: as que a magia dispara sozinha (↳, em cadeia ou
  // antes da rolagem) vão junto, pela própria magia vinculada.
  const internas = internasDaMagia(ajustada);
  return (ajustada.system?.actions ?? []).flatMap((a, i) => (internas.has(i) ? [] : [
    novaAcao(`✦ ${a.label} — ${custoDaAcao(a, lendario)}`, {
      canRoll: false, targetMode: "none", includeSelf: false, costMp: "0",
      preActivations: [{ ref: refDaMagia(i, vinculada), enabled: true }],
    }),
  ]));
}

/** Trechos da descrição gravada pela 0.2.8 (sem ações ✦) e como ficam agora. */
const DESCRICAO_028 = [
  ["quem estiver com o item conjura a magia com a própria Conjuração,",
    "quem estiver com o item usa as ações <b>✦</b> dele e conjura a magia com a própria Conjuração,"],
  ["a magia aparece na lista de Magias como", "a magia também aparece na lista de Magias como"],
  ["— e sai junto com ele.</p>", "— é ela que as ações ✦ disparam, e ela sai junto com o item.</p>"],
  ["efeito descrito abaixo, sem rolagem automática — ative a magia na ficha para pagar a mana.", "efeito descrito abaixo."],
];

/**
 * Itens gravados na 0.2.8 guardam a magia sem as ações ✦ no item. Acrescenta
 * as ações (uma vez por magia guardada), também nas fotos "antes" dos
 * encantamentos feitos depois dela — senão desfazer um deles as levaria
 * junto —, acerta a descrição e troca o id da receita, para a magia vinculada
 * ser refeita no formato atual (magia só descritiva ganha a ação "Conjurar").
 * @returns {object|null} dados para `item.update`, ou null se nada falta
 */
export function migrarGatilhos(dados) {
  const receitas = dados?.flags?.[MODULE_ID]?.encantamentos ?? [];
  if (!receitas.some((r) => r?.tipo === "magia" && r.magia && !r.gatilhos)) return null;
  const lista = clone(receitas);
  const acoes = clone(dados.system?.actions ?? []);
  lista.forEach((r, k) => {
    if (r?.tipo !== "magia" || !r.magia || r.gatilhos) return;
    const novas = gatilhosDaMagia(magiaAjustada(r.magia, { lendario: r.lendario, pergaminho: r.pergaminho }), dados.name, r.lendario);
    acoes.push(...novas);
    for (const depois of lista.slice(k + 1)) {
      if (Array.isArray(depois?.antes?.system?.actions)) depois.antes.system.actions.push(...clone(novas));
    }
    r.id = novoId();
    r.gatilhos = true;
  });
  let descricao = String(dados.system?.description ?? "");
  for (const [velho, novo] of DESCRICAO_028) descricao = descricao.split(velho).join(novo);
  return {
    "system.actions": acoes,
    "system.description": descricao,
    [`flags.${MODULE_ID}.encantamentos`]: lista,
  };
}

/** Dados da magia vinculada que vai para a ficha de quem tem o item. */
export function dadosDaMagiaDoItem(item, rec) {
  const m = magiaAjustada(rec.magia, { lendario: rec.lendario, pergaminho: rec.pergaminho });
  const aviso = `<p><em>✦ Magia do item <b>${esc(item.name)}</b> (item conjurador ${esc(rec.nivel)}`
    + `${rec.lendario ? ", lendário: conjura sem mana" : ""}${rec.pergaminho ? ", pergaminho: queima ao conjurar" : ""}). `
    + `Ela vem e vai junto com o item.</em></p>`;
  m.system.description = aviso + (m.system.description ?? "");
  m.system.active = false;
  // Id próprio já definido (criada com keepId): as ações em cadeia e as
  // ativações prévias da magia passam a apontar para ESTA cópia, com o id e o
  // nome dela — iguais às opções da ficha.
  const _id = novoIdDocumento();
  const name = nomeDaMagiaVinculada(m.name, item.name);
  normalizarAutoRefs(m, { id: _id, nome: name, ids: [rec.magia.idOriginal], nomes: [rec.magia.name] });
  return {
    _id, name, type: "magia", img: m.img, system: m.system,
    flags: { [MODULE_ID]: { ...(m.flags?.[MODULE_ID] ?? {}), doItem: item.id ?? item._id, encId: rec.id } },
  };
}

const receitasDeMagia = (item) => (item?.flags?.[MODULE_ID]?.encantamentos ?? []).filter((r) => r?.tipo === "magia" && r.magia);
const magiasVinculadas = (actor, itemId) => [...(actor?.items ?? [])]
  .filter((i) => i.type === "magia" && i.flags?.[MODULE_ID]?.doItem === itemId);

/**
 * Deixa a ficha com exatamente as magias vinculadas que o item guarda: cria
 * as que faltam, apaga as que sobraram, acerta o nome se o item mudou de
 * nome e aponta as ações ✦ do item para elas (id e nome). Antes, completa um
 * item gravado na 0.2.8 com as ações ✦ (migrarGatilhos) — isso vale também
 * fora de uma ficha; o resto, só com o item numa ficha.
 * @returns {Promise<{criadas: number, apagadas: number, renomeadas: number, referencias: number, migrado: boolean}>}
 */
export async function sincronizarMagiasDoItem(item) {
  const out = { criadas: 0, apagadas: 0, renomeadas: 0, referencias: 0, migrado: false };
  if (item?.type !== "equipamento") return out;
  const migracao = migrarGatilhos(typeof item.toObject === "function" ? item.toObject() : item);
  if (migracao) {
    await item.update(migracao);
    out.migrado = true;
  }
  const actor = item.parent;
  if (!actor || actor.documentName !== "Actor") return out;
  const receitas = receitasDeMagia(item);
  const atuais = magiasVinculadas(actor, item.id);
  const ids = new Set(receitas.map((r) => r.id));
  const ja = new Set(atuais.map((m) => m.flags[MODULE_ID].encId));
  const apagar = atuais.filter((m) => !ids.has(m.flags[MODULE_ID].encId)).map((m) => m.id);
  const criar = receitas.filter((r) => !ja.has(r.id)).map((r) => dadosDaMagiaDoItem(item, r));
  const renomear = atuais.filter((m) => ids.has(m.flags[MODULE_ID].encId)).map((m) => {
    const r = receitas.find((x) => x.id === m.flags[MODULE_ID].encId);
    const nome = nomeDaMagiaVinculada(r.magia.name, item.name);
    // As ações em cadeia da magia vinculada apontam para ela pelo nome também.
    const acoes = clone(m.system?.actions ?? []);
    const refs = normalizarAutoRefs({ system: { actions: acoes } }, { id: m.id, nome, nomes: [m.name] });
    if (m.name === nome && !refs) return null;
    return refs ? { _id: m.id, name: nome, "system.actions": acoes } : { _id: m.id, name: nome };
  }).filter(Boolean);
  if (apagar.length) {
    // Apagar um item faz o sistema encerrar os visuais dele (veja prenderEndEffects).
    prenderEndEffects();
    await actor.deleteEmbeddedDocuments("Item", apagar);
  }
  if (criar.length) await actor.createEmbeddedDocuments("Item", criar, { keepId: true });
  if (renomear.length) await actor.updateEmbeddedDocuments("Item", renomear);
  Object.assign(out, { criadas: criar.length, apagadas: apagar.length, renomeadas: renomear.length });
  // As ações ✦ do item apontam para a magia vinculada com o id e o nome dela,
  // exatamente como a opção do select da ficha (veja refDaMagia). Uma ação ✦
  // é reconhecida pelo id da magia vinculada ou pelo nome "Magia (…)" — o
  // nome do item pode ter mudado, ou o item veio de outra ficha.
  const porReceita = new Map(magiasVinculadas(actor, item.id).map((m) => [m.flags[MODULE_ID].encId, m]));
  const vinculadas = receitas.map((r) => ({ m: porReceita.get(r.id), prefixo: `${r.magia.name} (`.replace(/\|/g, "/") }))
    .filter((x) => x.m);
  const acoes = clone(item.system?.actions ?? []);
  for (const a of acoes) {
    for (const pre of a?.preActivations ?? []) {
      const [tipo = "", id = "", indice = "", ...resto] = String(pre?.ref ?? "").split("|");
      if (tipo !== "action") continue;
      const alvo = resto.join("|");
      const dona = vinculadas.find((x) => x.m.id === id) ?? vinculadas.find((x) => alvo.startsWith(x.prefixo));
      if (!dona) continue;
      const certa = refDaMagia(indice, dona.m.name, dona.m.id);
      if (pre.ref === certa) continue;
      pre.ref = certa;
      out.referencias++;
    }
  }
  if (out.referencias) await item.update({ "system.actions": acoes });
  return out;
}

/** Magia vinculada → o item conjurador dela, na mesma ficha. */
const itemDaMagia = (magia) => {
  const id = magia?.flags?.[MODULE_ID]?.doItem;
  return id && magia.parent?.documentName === "Actor" ? magia.parent.items.get(id) ?? null : null;
};

/**
 * Sincroniza em fila, item a item: o gancho de atualização e a janela podem
 * pedir ao mesmo tempo, e duas sincronizações simultâneas criariam a magia
 * vinculada duas vezes.
 */
const _filas = new Map();
export function sincronizar(item) {
  const chave = item?.uuid ?? item?.id;
  const antes = _filas.get(chave) ?? Promise.resolve();
  const agora = antes.catch(() => {}).then(() => sincronizarMagiasDoItem(item)).catch((e) => {
    console.error("Ligeia — Livro do Jogador | magia vinculada:", e);
    globalThis.ui?.notifications?.warn(`Não foi possível acertar a magia vinculada de ${item?.name}: ${e?.message ?? e}`);
  });
  _filas.set(chave, agora);
  return agora;
}

/** Magias do compêndio do Livro do Jogador (em cache). */
let _magiasDoCompendio = null;
async function magiasDoCompendio() {
  if (_magiasDoCompendio) return _magiasDoCompendio;
  const pack = globalThis.game?.packs?.get?.(`${MODULE_ID}.magias`);
  _magiasDoCompendio = pack ? await pack.getDocuments() : [];
  return _magiasDoCompendio;
}

/* ------------------------------------------------------------------ */
/*  Palavras arcanas do personagem                                     */
/* ------------------------------------------------------------------ */

const NIVEL_TXT = { B: "Básico", A: "Avançado", E: "Épico" };

/**
 * Palavras que o personagem domina, com o nível: habilidade "Palavra Arcana
 * [x]" ou traço racial que a concede.
 * @returns {Map<string, {nivel: string|null, fonte: string}>}
 */
export function palavrasComNivel(actor) {
  const out = new Map();
  for (const it of actor?.items ?? []) {
    if (it.type === "habilidade") {
      const m = it.name.match(/^Palavra Arcana\s*[[(]\s*(\w+)\s*[\])]/i);
      if (m) out.set(semAcento(m[1]), { nivel: it.system?.level || "B", fonte: "habilidade" });
    } else if (it.type === "traco") {
      const p = TRACOS_COM_PALAVRA[semAcento(it.name)];
      if (p && !out.has(p)) out.set(p, { nivel: null, fonte: `traço ${it.name}` });
    }
  }
  return new Map([...out.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

/* ------------------------------------------------------------------ */
/*  A janela                                                           */
/* ------------------------------------------------------------------ */

const ApplicationV2 = globalThis.foundry?.applications?.api?.ApplicationV2 ?? class {};

export class EncantamentoApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "ligeia-encantamento-{id}",
    classes: ["ligeia-encantamento"],
    window: { title: "Encantamento de Itens — Ligeia", icon: "fa-solid fa-gem" },
    position: { width: 680, height: "auto" },
  };

  constructor(actor, item = null, options = {}) {
    super(options);
    this.actor = actor ?? item?.parent ?? null;
    this.itemFixo = item;
    // Estado da janela (não pode se chamar "state": é getter da ApplicationV2).
    this.forja = {
      itemId: item?.id ?? "", nivel: "Menor", lendario: false, nome: "", liberarTodas: false,
      tipo: "propriedades", magiaChave: "",
      slots: [0, 1, 2].map(() => ({ palavra: "", propId: "", var: -1, todas: false })),
    };
    this.minhas = palavrasComNivel(this.actor);
  }

  /**
   * Palavras que dá para escolher: as da ficha. O Mestre pode liberar todas
   * (itens de tesouro, NPCs) — e sem nenhuma na ficha elas já vêm liberadas.
   */
  get todasAsPalavras() {
    const mestre = !!globalThis.game?.user?.isGM;
    return mestre && (this.forja.liberarTodas || !this.minhas.size);
  }

  get palavras() {
    return this.todasAsPalavras ? new Map(PALAVRAS.map((p) => [p, this.minhas.get(p) ?? { nivel: null, fonte: "Mestre" }])) : this.minhas;
  }

  get title() { return `Encantamento de Itens — ${this.actor?.name ?? this.itemFixo?.name ?? ""}`; }

  get itensEncantaveis() {
    if (this.itemFixo) return [this.itemFixo];
    return [...(this.actor?.items ?? [])]
      .filter((i) => i.type === "equipamento" && !i.system?.noEnchant)
      .sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  get item() {
    return this.itensEncantaveis.find((i) => i.id === this.forja.itemId) ?? null;
  }

  /** Escolhas (propriedade + variante) das palavras do nível atual. */
  escolhas() {
    const s = this.forja;
    const N = NIVEIS_ITEM[s.nivel];
    const tipos = this.item ? tiposDoItem(this.item) : new Set();
    return s.slots.slice(0, N.n).map((sl) => {
      const prop = PROPRIEDADES.find((p) => p.id === sl.propId) ?? null;
      if (!prop) return { palavra: sl.palavra, prop: null };
      const vs = variantesDoItem(prop, N.n, tipos);
      const variante = vs.find((v) => v.indice === sl.var && v.permitida) ?? variantePadrao(prop, N.n, tipos);
      return { palavra: sl.palavra, prop, variante };
    });
  }

  #opcoes(lista, atual, vazio) {
    const o = vazio == null ? [] : [`<option value="">${esc(vazio)}</option>`];
    for (const [v, rot, extra = ""] of lista) {
      o.push(`<option value="${esc(v)}" ${String(v) === String(atual) ? "selected" : ""} ${extra}>${esc(rot)}</option>`);
    }
    return o.join("");
  }

  #blocoPalavra(i, item, tipos, N) {
    const sl = this.forja.slots[i];
    const optPal = this.#opcoes([...this.palavras.entries()].map(([p, info]) =>
      [p, info.nivel ? `${p} (${NIVEL_TXT[info.nivel]})` : (info.fonte === "Mestre" ? p : `${p} (${info.fonte})`)]),
    sl.palavra, "— escolha —");
    const info = this.palavras.get(sl.palavra);
    const aviso = info && info.nivel && info.nivel === "B"
      ? `<p class="aviso">⚠ O livro pede Palavra Arcana [${esc(sl.palavra)}] no <b>Avançado</b> para encantar (a ficha tem no Básico).</p>` : "";
    let lista = "";
    if (sl.palavra && item) {
      const props = PROPRIEDADES.filter((p) => p.palavra === sl.palavra);
      const comp = props.filter((p) => compativel(p, tipos));
      const mostrar = (sl.todas || !comp.length) ? props : props.filter((p) => compativel(p, tipos) || p.id === sl.propId);
      const ordem = [...mostrar].sort((a, b) => (compativel(b, tipos) - compativel(a, tipos)) || a.nome.localeCompare(b.nome, "pt"));
      lista = ordem.map((p) => {
        const vs = variantesDoItem(p, N.n, tipos);
        const pad = variantePadrao(p, N.n, tipos);
        const pode = !!pad;
        const ok = compativel(p, tipos);
        const minimo = NOME_DO_NIVEL[nivelMinimo(p, tipos)];
        const regra = regraDe(p, contexto(p, pad ?? vs[0], tipos));
        const auto = automatizada(regra) ? `<span class="auto" title="Mexe na ficha sozinha">⚙</span>` : `<span class="manual" title="Fica como lembrete: aplique pela descrição">✎</span>`;
        const preco = pad ? `+${formatarVo(pad.preco)}${pad.rotulo ? ` (${esc(pad.rotulo)})` : ""}` : `de nível ${minimo}`;
        const sel = p.id === sl.propId;
        let variantes = "";
        if (sel && vs.filter((v) => v.permitida).length > 1) {
          variantes = `<select name="var${i}" class="var">${this.#opcoes(vs.map((v) => [v.indice,
            `${v.rotulo || "padrão"} — +${formatarVo(v.preco)}${v.permitida ? "" : ` (só em item ${NOME_DO_NIVEL[v.nivel]})`}`,
            v.permitida ? "" : "disabled"]), (vs.find((v) => v.indice === sl.var && v.permitida) ?? pad)?.indice)}</select>`;
        }
        const titulo = pode ? p.texto : `Preço de propriedade ${minimo}: só cabe num item ${minimo}. ${p.texto}`;
        return `<div class="prop ${ok ? "" : "fora"} ${pode ? "" : "bloq"} ${sel ? "sel" : ""}" title="${esc(titulo)}"><label>
            <input type="radio" name="prop${i}" value="${esc(p.id)}" ${sel ? "checked" : ""} ${pode ? "" : "disabled"}>
            ${auto} <b>${esc(p.nome)}</b> <span class="ativ">${esc(p.ativacao)}${p.consumivel ? " · consumível" : ""}</span>
            <span class="preco">${preco}</span><br>
            <span class="itens">${esc(p.itens)}${ok ? "" : " — não é o tipo deste item"}</span>
            <span class="texto">${esc(p.texto.length > 190 ? `${p.texto.slice(0, 187)}…` : p.texto)}</span>
            </label>${variantes}</div>`;
      }).join("");
      const outras = props.length - comp.length;
      lista += comp.length && outras
        ? `<label class="todas"><input type="checkbox" name="todas${i}" ${sl.todas ? "checked" : ""}> Mostrar também as ${outras} propriedade(s) de ${esc(sl.palavra)} feitas para outros tipos de item</label>`
        : (!comp.length ? `<p class="dica">Nenhuma propriedade de ${esc(sl.palavra)} é feita para este tipo de item — todas listadas.</p>` : "");
    } else if (!item) {
      lista = `<p class="dica">Escolha o item primeiro.</p>`;
    } else {
      lista = `<p class="dica">Escolha a palavra para ver as propriedades dela.</p>`;
    }
    return `<fieldset><legend>${i + 2} · ${i + 1}ª palavra arcana e propriedade</legend>
      <label>Palavra arcana <select name="palavra${i}" ${this.palavras.size ? "" : "disabled"}>${optPal}</select></label>
      ${aviso}<div class="props">${lista}</div></fieldset>`;
  }

  /** Magias que dá para guardar: as da ficha; o Mestre libera compêndio e mundo. */
  async carregarMagias() {
    const lista = [];
    const daFicha = [...(this.actor?.items ?? [])].filter((i) => i.type === "magia" && !i.flags?.[MODULE_ID]?.doItem);
    for (const it of daFicha) lista.push({ chave: `ficha:${it.id}`, origem: `Na ficha de ${this.actor.name}`, doc: it });
    this.temMagiasNaFicha = daFicha.length > 0;
    const mestre = !!globalThis.game?.user?.isGM;
    if (mestre && (this.forja.liberarTodas || !daFicha.length)) {
      for (const d of await magiasDoCompendio()) lista.push({ chave: `pack:${d.id ?? d._id}`, origem: "Compêndio do Livro do Jogador", doc: d });
      for (const d of globalThis.game?.items ?? []) {
        if (d.type === "magia") lista.push({ chave: `mundo:${d.id}`, origem: "Magias do mundo", doc: d });
      }
    }
    const ordem = new Map();
    lista.forEach((m) => { if (!ordem.has(m.origem)) ordem.set(m.origem, ordem.size); });
    lista.sort((a, b) => (ordem.get(a.origem) - ordem.get(b.origem)) || String(a.doc.name).localeCompare(String(b.doc.name), "pt"));
    this.magias = lista;
  }

  get magiaEscolhida() {
    return (this.magias ?? []).find((m) => m.chave === this.forja.magiaChave) ?? null;
  }

  #corpoMagia(item) {
    const s = this.forja;
    const escolhida = this.magiaEscolhida;
    const retrato = escolhida ? retratoDaMagia(escolhida.doc) : null;
    const grupos = new Map();
    for (const m of this.magias ?? []) {
      if (!grupos.has(m.origem)) grupos.set(m.origem, []);
      grupos.get(m.origem).push(m);
    }
    const opcoes = [...grupos.entries()].map(([origem, lista]) => `<optgroup label="${esc(origem)}">${lista.map((m) => {
      const tier = m.doc.system?.tier || "Menor";
      const pal = palavrasDaMagia(m.doc).join(" + ");
      const pm = NIVEIS_ITEM[NIVEL_DA_MAGIA[tier] ?? "Menor"].pm;
      return `<option value="${esc(m.chave)}" ${m.chave === s.magiaChave ? "selected" : ""}>${esc(m.doc.name)} — ${esc(tier)}${pal ? ` · ${esc(pal)}` : ""} · ${pm} PM</option>`;
    }).join("")}</optgroup>`).join("");
    const pergaminho = item ? ePergaminho(item) : false;
    let info = "";
    let previa = "";
    if (retrato) {
      const nivel = NIVEL_DA_MAGIA[retrato.system?.tier] ?? "Menor";
      const pm = NIVEIS_ITEM[nivel].pm;
      const palavras = palavrasDaMagia(retrato);
      const liberado = !!globalThis.game?.user?.isGM && (s.liberarTodas || !this.temMagiasNaFicha);
      const avisos = (!this.actor || liberado) ? [] : palavras.map((w) => {
        const p = this.palavras.get(w);
        if (!p) return `⚠ ${esc(this.actor.name)} não tem Palavra Arcana [${esc(w)}] na ficha.`;
        if (p.nivel === "B") return `⚠ O livro pede Palavra Arcana [${esc(w)}] no <b>Avançado</b> para encantar (a ficha tem no Básico).`;
        return "";
      }).filter(Boolean);
      info = `<p>Item conjurador <b>${esc(nivel)}</b> (Círculo ${esc(retrato.system?.tier || "Menor")}${palavras.length ? ` · ${esc(palavras.join(" + "))}` : ""})
        — quem estiver com ele conjura pagando <b>${s.lendario ? "nenhuma mana (lendário)" : `${pm} PM`}</b>, com a própria Conjuração e os bônus de palavra que tiver.</p>
        ${avisos.map((a) => `<p class="aviso">${a}</p>`).join("")}
        ${pergaminho ? `<p class="aviso">📜 Pergaminho: gravar custa <b>${pm} PM</b> agora${this.actor ? ` (de ${esc(this.actor.name)})` : ""} e 1 hora;
          conjurar também custa ${s.lendario ? "nada (lendário)" : `${pm} PM`}, leva uma rodada completa e queima o pergaminho.
          ${(Number(item.system?.qty) || 1) > 1 ? `A magia vai para um pergaminho só (sai 1 da pilha de ${Number(item.system.qty)}).` : ""}</p>` : ""}`;
      const ajustada = magiaAjustada(retrato, { lendario: s.lendario, pergaminho });
      const acoes = ajustada.system.actions ?? [];
      previa = acoes.length
        ? `<div class="previa"><b>O que o item vai conjurar</b> (vai para a descrição dele):<ul>${acoes.map((a) =>
          `<li><b>${esc(a.label)}</b>: ${esc(resumoDaAcao(a))}</li>`).join("")}</ul></div>`
        : `<div class="previa"><b>O que o item vai conjurar:</b> magia descritiva, sem rolagem automática (a descrição dela vai para o item).</div>`;
    }
    const nomePadrao = item ? ((pergaminho && retrato && /^pergaminho(\s*\(em branco\))?$/i.test(item.name.trim())) ? `Pergaminho de ${retrato.name}` : item.name) : "";
    const nivel = retrato ? (NIVEL_DA_MAGIA[retrato.system?.tier] ?? "Menor") : null;
    const { preco, tempo } = !retrato ? { preco: 0, tempo: "" } : (pergaminho ? { preco: 0, tempo: "1 hora" } : CRIACAO_DA_MAGIA[nivel]);
    const html = `
      <fieldset><legend>2 · Magia guardada no item</legend>
        ${(this.magias ?? []).length ? `<label>Magia
          <select name="magiaChave">${`<option value="">— escolha —</option>`}${opcoes}</select></label>`
          : `<p class="aviso">⚠ ${esc(this.actor?.name ?? "Este personagem")} não tem magias na ficha — quem encanta precisa saber a magia
            (o Mestre pode liberar as do compêndio).</p>`}
        ${info}${previa}
      </fieldset>
      <fieldset><legend>Nome e resumo</legend>
        <label>Nome do item
          <input type="text" name="nome" value="${esc(s.nome)}" placeholder="${esc(nomePadrao)}"></label>
        <div class="resumo">
          ${retrato ? `Item conjurador <b>${esc(nivel)}</b> · Conjurar: <b>${s.lendario ? "sem mana (lendário)" : `${NIVEIS_ITEM[nivel].pm} PM por conjuração`}</b>
            · ${pergaminho ? `Gravação: <b>1 hora e ${NIVEIS_ITEM[nivel].pm} PM</b>` : `Preço: <b>+${formatarVo(preco)}</b> (como criar uma magia de Círculo ${esc(retrato.system?.tier || "Menor")}: ${esc(tempo)})`}
            <br><em>Com o item na ficha, a magia aparece na lista de Magias como "${esc(retrato.name)} (${esc(s.nome?.trim() || nomePadrao)})" — e sai junto com ele.</em>`
            : "Escolha a magia."}
        </div>
      </fieldset>`;
    return { html, pronto: !!(item && retrato), rotulo: "Gravar magia no item" };
  }

  #corpoPropriedades(item) {
    const s = this.forja;
    const N = NIVEIS_ITEM[s.nivel];
    const tipos = item ? tiposDoItem(item) : new Set();
    const escolhas = this.escolhas();
    const completas = escolhas.filter((e) => e.prop && e.variante);
    const unicas = [...new Map(completas.map((e) => [e.prop.id, e])).values()];
    const total = unicas.reduce((t, e) => t + (e.variante?.preco ?? 0), 0);
    const repetidas = completas.length - unicas.length;
    const pm = s.lendario ? 0 : N.pm;
    const html = `
      ${[0, 1, 2].slice(0, N.n).map((i) => this.#blocoPalavra(i, item, tipos, N)).join("")}
      <fieldset><legend>Nome e resumo</legend>
        <label>Nome do item encantado
          <input type="text" name="nome" value="${esc(s.nome)}" placeholder="${esc(item ? `${item.name}${unicas.length ? ` (${unicas.map((e) => e.prop.nome).join(", ")})` : ""}` : "")}"></label>
        <div class="resumo">
          Item <b>${esc(s.nivel)}</b> · Mana para ativar: <b>${s.lendario ? "nenhuma (lendário)" : `${pm} PM por uso`}</b>
          · Preço das propriedades: <b>+${formatarVo(total)}</b> (criação: metade, ${formatarVo(Math.ceil(total / 2))}, abatendo 20 Vo por ponto heroico gasto)
          ${repetidas ? `<br><em>A mesma propriedade em mais de uma palavra conta uma vez — ela já vem no nível do item.</em>` : ""}
          ${unicas.some((e) => e.prop.consumivel) ? `<br><em>Poções, bombas, óleos e pedras são consumidos ao usar e não gastam mana.</em>` : ""}
        </div>
      </fieldset>`;
    return { html, pronto: !!item && completas.length === N.n, rotulo: "Encantar item" };
  }

  async _renderHTML() {
    const s = this.forja;
    const N = NIVEIS_ITEM[s.nivel];
    const itens = this.itensEncantaveis;
    if (!s.itemId && itens.length === 1) s.itemId = itens[0].id;
    const item = this.item;
    const jaTem = item ? propriedadesGravadas(item) : 0;
    const conjurador = s.tipo === "magia";
    if (conjurador) await this.carregarMagias();
    const corpo = conjurador ? this.#corpoMagia(item) : this.#corpoPropriedades(item);
    const mestre = !!globalThis.game?.user?.isGM;
    const auto = conjurador ? !this.temMagiasNaFicha : !this.minhas.size;

    // Um <form> por janela: os botões de opção (tipo, propriedade) ficam
    // agrupados só dentro dela, mesmo com duas janelas abertas.
    const el = document.createElement("form");
    el.className = "encantamento-form";
    const semPalavras = !conjurador && !this.palavras.size;
    el.innerHTML = `
      <style>
        .ligeia-encantamento .encantamento-form { padding: 6px 10px; max-height: 74vh; overflow-y: auto; }
        .ligeia-encantamento fieldset { border: 1px solid var(--color-border-light-primary, #888);
          border-radius: 6px; margin: 6px 0; padding: 6px 10px; }
        .ligeia-encantamento legend { font-weight: bold; padding: 0 6px; }
        .ligeia-encantamento label { display: block; margin: 3px 0; }
        .ligeia-encantamento .linha { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .ligeia-encantamento .linha > label { flex: 1 1 180px; }
        .ligeia-encantamento select, .ligeia-encantamento input[type=text] { width: 100%; }
        .ligeia-encantamento .tipos { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 4px; }
        .ligeia-encantamento .tipos label { flex: 1 1 240px; padding: 4px 6px; border-radius: 4px; background: rgba(120,120,160,0.08); }
        .ligeia-encantamento .props { max-height: 260px; overflow-y: auto; margin-top: 4px; }
        .ligeia-encantamento .prop { margin: 3px 0; padding: 3px 4px; border-radius: 4px; font-size: 0.92em; }
        .ligeia-encantamento .prop:hover, .ligeia-encantamento .prop.sel { background: rgba(120,120,160,0.12); }
        .ligeia-encantamento .prop label { margin: 0; cursor: pointer; }
        .ligeia-encantamento .prop.fora { opacity: 0.6; }
        .ligeia-encantamento .prop.bloq { opacity: 0.4; }
        .ligeia-encantamento .prop .ativ, .ligeia-encantamento .prop .itens { opacity: 0.8; font-style: italic; }
        .ligeia-encantamento .prop .preco { float: right; font-weight: bold; }
        .ligeia-encantamento .prop .texto { display: block; opacity: 0.85; }
        .ligeia-encantamento .prop .var { margin-top: 3px; }
        .ligeia-encantamento .auto { color: #3a7; } .ligeia-encantamento .manual { color: #a83; }
        .ligeia-encantamento .todas { font-size: 0.9em; margin-top: 6px; }
        .ligeia-encantamento .previa { font-size: 0.92em; background: rgba(120,120,160,0.08); border-radius: 4px; padding: 4px 8px; margin-top: 4px; }
        .ligeia-encantamento .previa ul { margin: 2px 0 0 18px; }
        .ligeia-encantamento .dica { opacity: 0.75; font-style: italic; }
        .ligeia-encantamento .aviso { color: #b60; font-size: 0.92em; margin: 3px 0; }
        .ligeia-encantamento .resumo { background: rgba(120,120,160,0.12); border-radius: 6px; padding: 6px 10px; margin: 6px 0; }
        .ligeia-encantamento footer { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; margin: 8px 0 4px; }
      </style>
      ${semPalavras ? `<p class="aviso">⚠ ${esc(this.actor?.name ?? "Este personagem")} não tem nenhuma habilidade
        "Palavra Arcana [x]" na ficha — adicione ao menos uma para encantar itens.</p>` : ""}
      ${mestre ? `<label class="dica"><input type="checkbox" name="liberarTodas" ${s.liberarTodas || auto ? "checked" : ""}
        ${auto ? "disabled" : ""}> Mestre: liberar todas as ${conjurador ? "magias (compêndio e mundo)" : "palavras arcanas"}${auto ? ` (a ficha não tem nenhuma)` : ""}</label>` : ""}
      <fieldset><legend>1 · Item e ${conjurador ? "tipo" : "nível"}</legend>
        <div class="tipos">
          <label><input type="radio" name="tipo" value="propriedades" ${conjurador ? "" : "checked"}> <b>Propriedades mágicas</b> — até 3 palavras arcanas, uma propriedade de cada</label>
          <label><input type="radio" name="tipo" value="magia" ${conjurador ? "checked" : ""}> <b>Item conjurador</b> — o item guarda uma magia, e quem estiver com ele pode conjurá-la</label>
        </div>
        <div class="linha">
          <label>Item
            <select name="itemId" ${this.itemFixo ? "disabled" : ""}>${this.#opcoes(itens.map((i) =>
              [i.id, `${i.name}${i.system?.category ? ` (${i.system.category})` : ""}${propriedadesGravadas(i) ? " ✦" : ""}`]),
              s.itemId, itens.length ? "— escolha —" : "— nenhum equipamento na ficha —")}</select>
          </label>
          ${conjurador ? "" : `<label>Nível do item
            <select name="nivel">${this.#opcoes(Object.entries(NIVEIS_ITEM).map(([k, v]) =>
              [k, `${k} (${v.n} palavra${v.n > 1 ? "s" : ""} · ${v.pm} PM)`]), s.nivel)}</select>
          </label>`}
        </div>
        <label><input type="checkbox" name="lendario" ${s.lendario ? "checked" : ""}> <b>Item lendário</b> — ${conjurador ? "conjura a magia sem gastar mana" : "ativa as propriedades sem gastar mana"}</label>
        ${jaTem ? `<p class="aviso">⚠ ${esc(item.name)} já tem ${jaTem} propriedade(s) mágica(s): ao fim do encantamento,
          role a Dureza do item com −${jaTem}. Se falhar, o item se quebra e perde todas as propriedades.</p>` : ""}
      </fieldset>
      ${corpo.html}
      <footer>
        <button type="button" data-action="cancelar">Cancelar</button>
        ${item && propriedadesGravadas(item) ? `<button type="button" data-action="lendario" title="Refaz os encantamentos deste item ${eLendario(item) ? "voltando a gastar mana" : "como item lendário, sem gastar mana"}"><i class="fa-solid fa-crown"></i> ${eLendario(item) ? "Voltar a gastar mana" : "Tornar lendário"}</button>
          <button type="button" data-action="desfazer"><i class="fa-solid fa-rotate-left"></i> Desfazer último encantamento</button>` : ""}
        <button type="button" data-action="encantar" ${corpo.pronto ? "" : "disabled"}><i class="fa-solid ${conjurador ? "fa-book-sparkles" : "fa-gem"}"></i> ${corpo.rotulo}</button>
      </footer>`;
    return el;
  }

  _replaceHTML(result, content) {
    // Cada escolha redesenha a janela: guarda onde as listas estavam roladas.
    const antigo = content.querySelector?.(".encantamento-form");
    const rolagens = antigo ? [antigo.scrollTop, ...[...antigo.querySelectorAll(".props")].map((p) => p.scrollTop)] : null;
    content.replaceChildren(result);
    if (rolagens) {
      result.scrollTop = rolagens[0];
      [...result.querySelectorAll(".props")].forEach((p, i) => { p.scrollTop = rolagens[i + 1] ?? 0; });
    }
    this.#listeners(content);
  }

  #listeners(root) {
    const s = this.forja;
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((n) => n.addEventListener(ev, fn));
    on("form.encantamento-form", "submit", (e) => e.preventDefault()); // Enter no nome não recarrega
    on("select[name=itemId]", "change", (e) => { s.itemId = e.target.value; this.render(); });
    on("input[name=tipo]", "change", (e) => { s.tipo = e.target.value; this.render(); });
    on("select[name=magiaChave]", "change", (e) => { s.magiaChave = e.target.value; this.render(); });
    on("select[name=nivel]", "change", (e) => { s.nivel = e.target.value; this.render(); });
    on("input[name=lendario]", "change", (e) => { s.lendario = e.target.checked; this.render(); });
    on("input[name=liberarTodas]", "change", (e) => { s.liberarTodas = e.target.checked; this.render(); });
    for (const i of [0, 1, 2]) {
      on(`select[name=palavra${i}]`, "change", (e) => {
        Object.assign(s.slots[i], { palavra: e.target.value, propId: "", var: -1 });
        this.render();
      });
      on(`input[name=prop${i}]`, "change", (e) => { s.slots[i].propId = e.target.value; s.slots[i].var = -1; this.render(); });
      on(`select[name=var${i}]`, "change", (e) => { s.slots[i].var = Number(e.target.value); this.render(); });
      on(`input[name=todas${i}]`, "change", (e) => { s.slots[i].todas = e.target.checked; this.render(); });
    }
    on("input[name=nome]", "input", (e) => { s.nome = e.target.value; });
    on("[data-action=cancelar]", "click", () => this.close());
    on("[data-action=encantar]", "click", () => this.encantar());
    on("[data-action=desfazer]", "click", () => this.desfazer());
    on("[data-action=lendario]", "click", () => this.alternarLendario());
  }

  async encantar() {
    const s = this.forja;
    if (s.tipo === "magia") return this.gravarMagia();
    const item = this.item;
    if (!item) return ui.notifications.warn("Escolha o item a encantar.");
    const N = NIVEIS_ITEM[s.nivel];
    const escolhas = this.escolhas();
    for (let i = 0; i < N.n; i++) {
      if (!escolhas[i]?.palavra) return ui.notifications.warn(`Escolha a ${i + 1}ª palavra arcana.`);
      if (!escolhas[i]?.prop) return ui.notifications.warn(`Escolha a propriedade da ${i + 1}ª palavra (${escolhas[i].palavra}).`);
      if (!escolhas[i]?.variante) return ui.notifications.warn(`${escolhas[i].prop.nome} não cabe num item ${s.nivel}.`);
    }
    const data = construirEncantamento(item.toObject(), {
      nivel: s.nivel, escolhas, lendario: s.lendario, nome: s.nome,
    }, { animar: animacoesLigadas() });
    await item.update({
      name: data.name,
      "system.actions": data.system.actions,
      "system.effects": data.system.effects,
      "system.description": data.system.description,
      "system.price": data.system.price,
      [`flags.${MODULE_ID}.encantamentos`]: data.flags[MODULE_ID].encantamentos,
    });
    const nAnim = contarAnimacoesAutomaticas(data);
    const nProps = data.flags[MODULE_ID].encantamentos.at(-1).propriedades.length;
    ui.notifications.info(`${data.name} encantado (item ${s.nivel}, ${s.lendario ? "lendário, sem mana" : `${N.pm} PM por ativação`}): `
      + `${nProps} propriedade${nProps > 1 ? "s" : ""}${nAnim ? `, ${nAnim} animaç${nAnim > 1 ? "ões" : "ão"} automática${nAnim > 1 ? "s" : ""}` : ""}.`);
    this.close();
    item.sheet?.render(true);
  }

  /** Item conjurador: grava a magia escolhida no item. */
  async gravarMagia() {
    const s = this.forja;
    const item = this.item;
    if (!item) return ui.notifications.warn("Escolha o item.");
    const escolhida = this.magiaEscolhida;
    if (!escolhida) return ui.notifications.warn("Escolha a magia a guardar no item.");
    const retrato = retratoDaMagia(escolhida.doc);
    const nivel = NIVEL_DA_MAGIA[retrato.system?.tier] ?? "Menor";
    const pm = NIVEIS_ITEM[nivel].pm;
    const pergaminho = ePergaminho(item);
    const quem = this.actor;
    const pmAtual = Number(quem?.system?.resources?.mp?.value) || 0;
    // Pergaminho: quem grava paga os PM da magia (e quem conjurar paga de novo).
    if (pergaminho && quem && pmAtual < pm) {
      return ui.notifications.warn(`Gravar ${retrato.name} no pergaminho custa ${pm} PM — ${quem.name} tem ${pmAtual}.`);
    }
    let alvo = item;
    if (pergaminho && (Number(item.system?.qty) || 1) > 1) {
      // Uma magia por pergaminho: separa um da pilha.
      const um = item.toObject();
      delete um._id;
      um.system.qty = 1;
      await item.update({ "system.qty": Number(item.system.qty) - 1 });
      alvo = item.parent
        ? (await item.parent.createEmbeddedDocuments("Item", [um]))[0]
        : await (globalThis.CONFIG?.Item?.documentClass ?? globalThis.Item).create(um);
    }
    const data = construirItemConjurador(alvo.toObject(), { magia: retrato, lendario: s.lendario, pergaminho, nome: s.nome });
    await alvo.update({
      name: data.name,
      "system.actions": data.system.actions,
      "system.description": data.system.description,
      "system.price": data.system.price,
      [`flags.${MODULE_ID}.encantamentos`]: data.flags[MODULE_ID].encantamentos,
    });
    if (pergaminho && quem) await quem.update({ "system.resources.mp.value": pmAtual - pm });
    if (alvo.parent) await sincronizar(alvo);
    ui.notifications.info(`${data.name}: ${retrato.name} guardada (item conjurador ${nivel}, `
      + `${s.lendario ? "lendário, sem mana" : `${pm} PM por conjuração`})`
      + `${pergaminho && quem ? ` — gravar custou ${pm} PM a ${quem.name}` : ""}. `
      + `Conjure pela ação ✦ do item${alvo.parent ? " (a magia também aparece na lista de Magias da ficha)." : "; a magia vinculada aparece na ficha de quem receber o item."}`);
    this.close();
    alvo.sheet?.render(true);
  }

  async alternarLendario() {
    const item = this.item;
    if (!item) return;
    const virar = !eLendario(item);
    const data = refazerEncantamentos(item.toObject(), { lendario: virar }, { animar: animacoesLigadas() });
    if (!data) return ui.notifications.warn("Não há encantamento deste módulo neste item.");
    const DialogV2 = globalThis.foundry?.applications?.api?.DialogV2;
    const ok = DialogV2 ? await DialogV2.confirm({
      window: { title: virar ? "Tornar lendário" : "Voltar a gastar mana" },
      content: `<p>${virar ? `<b>${esc(item.name)}</b> passa a ser lendário: as propriedades valem sem gastar mana.`
        : `<b>${esc(item.name)}</b> deixa de ser lendário: ativar as propriedades volta a custar mana.`}
        Os encantamentos são refeitos a partir da receita; mudanças feitas à mão nas ações, efeitos, descrição ou preço depois deles se perdem.</p>`,
      rejectClose: false,
    }) : true;
    if (!ok) return;
    await item.update({
      "system.actions": data.system.actions,
      "system.effects": data.system.effects,
      "system.description": data.system.description,
      "system.price": data.system.price,
      [`flags.${MODULE_ID}.encantamentos`]: data.flags[MODULE_ID].encantamentos,
    });
    ui.notifications.info(`${item.name} ${virar ? "agora é lendário (sem mana)" : "voltou a gastar mana"}.`);
    this.render();
  }

  async desfazer() {
    const item = this.item;
    if (!item) return;
    const upd = desfazerEncantamento(item.toObject());
    if (!upd) return ui.notifications.warn("Não há encantamento deste módulo para desfazer neste item.");
    const DialogV2 = globalThis.foundry?.applications?.api?.DialogV2;
    const ok = DialogV2 ? await DialogV2.confirm({
      window: { title: "Desfazer último encantamento" },
      content: `<p>Voltar <b>${esc(item.name)}</b> a como estava antes do último encantamento?
        Mudanças feitas à mão nas ações, efeitos, descrição ou preço depois dele também se perdem.</p>`,
      rejectClose: false,
    }) : true;
    if (!ok) return;
    await item.update(upd);
    ui.notifications.info(`Último encantamento de ${upd.name} desfeito.`);
    this.render();
  }
}

export function abrirEncantamento(actor, item = null) {
  actor ??= item?.parent ?? globalThis.canvas?.tokens?.controlled?.[0]?.actor ?? globalThis.game?.user?.character ?? null;
  if (!actor && !item) return ui.notifications.warn("Selecione um personagem.");
  const app = new EncantamentoApp(actor, item);
  app.render({ force: true });
  return app;
}

function animacoesLigadas() {
  try { return game.settings.get(MODULE_ID, "animacoesAutomaticas") !== false; }
  catch (e) { return true; }
}

/* ------------------------------------------------------------------ */
/*  Botões: ficha do personagem e ficha do equipamento                 */
/* ------------------------------------------------------------------ */

function cabecalho(app, html) {
  const el = html instanceof HTMLElement ? html : html?.[0];
  return el?.closest?.(".app, .application")?.querySelector(".window-header")
    ?? el?.querySelector?.(".window-header")
    ?? app.element?.querySelector?.(".window-header");
}

function botao(header, classe, titulo, icone, acao) {
  if (!header || header.querySelector(`.${classe}`)) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `header-control ${classe}`;
  btn.title = titulo;
  btn.innerHTML = `<i class="${icone}"></i>`;
  btn.style.cssText = "flex:0; min-width:24px;";
  btn.addEventListener("click", (ev) => { ev.preventDefault(); acao(); });
  const fechar = header.querySelector('[data-action="close"], .close');
  fechar ? header.insertBefore(btn, fechar) : header.appendChild(btn);
}

function botaoNaFicha(app, html) {
  // Na ficha de um item, app.actor é o DONO do item: o documento vem primeiro.
  const doc = app.document ?? app.object ?? app.actor;
  // Documentos de compêndio ficam de fora: encanta-se o que está no mundo.
  if (!doc?.isOwner || doc.pack) return;
  if (doc.documentName === "Actor") {
    if (!["personagem", "npc"].includes(doc.type)) return;
    botao(cabecalho(app, html), "ligeia-encantamento-btn", "Encantamento de Itens (Livro do Jogador)",
      "fa-solid fa-gem", () => abrirEncantamento(doc));
  } else if (doc.documentName === "Item" && doc.type === "equipamento") {
    if (!doc.parent && !game.user?.isGM) return;
    botao(cabecalho(app, html), "ligeia-encantamento-btn", "Encantar este item (Livro do Jogador)",
      "fa-solid fa-gem", () => abrirEncantamento(doc.parent ?? null, doc));
  }
}

globalThis.Hooks?.on("renderActorSheet", botaoNaFicha);
globalThis.Hooks?.on("renderActorSheetV2", botaoNaFicha);
globalThis.Hooks?.on("renderItemSheet", botaoNaFicha);
globalThis.Hooks?.on("renderItemSheetV2", botaoNaFicha);

/* ------------------------------------------------------------------ */
/*  Magias vinculadas: vêm e vão junto com o item conjurador            */
/* ------------------------------------------------------------------ */
// Quem fez a mudança é quem cuida da ficha (os ganchos rodam em todos os
// clientes; só um deve criar/apagar).
const fuiEu = (userId) => userId === globalThis.game?.user?.id;

globalThis.Hooks?.on("createItem", (item, options, userId) => {
  if (!fuiEu(userId)) return;
  if (item.type === "equipamento" && receitasDeMagia(item).length) {
    sincronizar(item);
  } else if (item.type === "magia" && item.flags?.[MODULE_ID]?.doItem) {
    // Magia vinculada arrastada sozinha para outra ficha: sem o item, ela não existe.
    const actor = item.parent;
    if (actor?.documentName === "Actor" && !actor.items.get(item.flags[MODULE_ID].doItem)) {
      item.delete();
      ui.notifications?.warn(`${item.name} vem de um item conjurador: leve o item para a ficha e a magia aparece com ele.`);
    }
  }
});

globalThis.Hooks?.on("updateItem", (item, mudancas, options, userId) => {
  if (!fuiEu(userId) || item.parent?.documentName !== "Actor") return;
  if (item.type === "magia") {
    // Magia vinculada renomeada à mão: ela segue o nome do item (e as ações ✦
    // do item procuram por ele), então volta ao nome certo.
    const dono = "name" in (mudancas ?? {}) ? itemDaMagia(item) : null;
    if (dono) sincronizar(dono);
    return;
  }
  if (item.type !== "equipamento") return;
  const mexeu = globalThis.foundry?.utils?.hasProperty?.(mudancas, `flags.${MODULE_ID}.encantamentos`) || "name" in (mudancas ?? {});
  if (mexeu) sincronizar(item);
});

globalThis.Hooks?.on("deleteItem", (item, options, userId) => {
  if (!fuiEu(userId) || item.type !== "equipamento") return;
  const actor = item.parent;
  if (actor?.documentName !== "Actor") return;
  const ids = magiasVinculadas(actor, item.id).map((m) => m.id);
  if (ids.length) {
    prenderEndEffects();
    actor.deleteEmbeddedDocuments("Item", ids);
  }
});

/**
 * Ao abrir o mundo, o Mestre (um só, o ativo) confere os itens conjuradores
 * das fichas e do mundo: completa os gravados na 0.2.8 com as ações ✦ e
 * acerta as magias vinculadas e as referências. Itens já em dia não mudam.
 * @returns {Promise<number>} quantos itens foram completados com as ações ✦
 */
export async function conferirItensConjuradores() {
  const g = globalThis.game;
  const gm = g?.users?.activeGM;
  if (!g?.user?.isGM || (gm && gm.id !== g.user.id)) return 0;
  const itens = [];
  for (const actor of g.actors ?? []) for (const it of actor.items ?? []) itens.push(it);
  for (const it of g.items ?? []) itens.push(it);
  let migrados = 0;
  for (const it of itens) {
    if (it.type !== "equipamento" || !receitasDeMagia(it).length) continue;
    const r = await sincronizar(it);
    if (r?.migrado) migrados++;
  }
  if (migrados) {
    globalThis.ui?.notifications?.info(`Livro do Jogador: ${migrados} item(ns) conjurador(es) ganharam as ações ✦ da magia guardada.`);
  }
  return migrados;
}

/**
 * Compatibilidade com o Sequencer 4.x: o sistema (endEffectFx, chamado quando
 * um item sai da ficha ou é desligado) pega `Sequencer.EffectManager.endEffects`
 * solto da classe e o chama sem ela — e o Sequencer usa `this` lá dentro
 * ("Cannot read properties of undefined (reading '_validateFilters')"). Além
 * do erro no console, o visual do efeito não era encerrado. Prendendo o
 * método à própria classe, a chamada solta passa a funcionar; quem chama do
 * jeito normal (EffectManager.endEffects(...)) não percebe diferença.
 * @returns {boolean} true se ajustou
 */
export function prenderEndEffects(Sequencer = globalThis.Sequencer) {
  try {
    const EM = Sequencer?.EffectManager;
    const original = EM?.endEffects;
    if (typeof original !== "function" || original._ligeiaPreso) return false;
    const preso = function endEffects(...args) { return original.apply(EM, args); };
    preso._ligeiaPreso = true;
    EM.endEffects = preso;
    return EM.endEffects === preso;
  } catch (e) {
    console.warn("Ligeia — Livro do Jogador | não foi possível ajustar o Sequencer.EffectManager.endEffects:", e);
    return false;
  }
}

globalThis.Hooks?.once("ready", () => {
  const mod = game.modules.get(MODULE_ID);
  mod.api = Object.assign(mod.api ?? {}, {
    abrirEncantamento, construirEncantamento, desfazerEncantamento, refazerEncantamentos, PROPRIEDADES, regraDe,
    construirItemConjurador, sincronizarMagiasDoItem, sincronizar, dadosDaMagiaDoItem, migrarGatilhos, conferirItensConjuradores,
  });
  prenderEndEffects();
  conferirItensConjuradores().catch((e) => console.error("Ligeia — Livro do Jogador | itens conjuradores:", e));
  console.log("Ligeia — Livro do Jogador | Encantamento de Itens pronto (botão ✦ na ficha).");
});
