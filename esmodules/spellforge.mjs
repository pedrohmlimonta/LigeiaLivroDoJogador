/**
 * LIGEIA — CRIAÇÃO DE MAGIAS (Livro do Jogador)
 * ===========================================================================
 * Botão na ficha do personagem que abre a oficina de magias:
 *   1. Escolha o círculo (Menor 1 PM / Intermediária 2 PM / Maior 3 PM).
 *   2. Escolha a palavra arcana principal (precisa estar na ficha como
 *      habilidade "Palavra Arcana [x]", em qualquer nível) e a MAGIA MENOR
 *      base daquela palavra (compêndio do Livro do Jogador + magias do mundo).
 *   3. Marque quantas peculiaridades quiser — a soma entra como bônus (ou
 *      penalidade) fixa na rolagem de Conjuração da magia criada.
 *   4. Intermediária: segunda palavra (também na ficha) + UMA metamagia dela.
 *      Maior: terceira palavra + mais uma metamagia.
 *      Metamagia de dano sobre magia que JÁ causa dano: troca apenas o TIPO
 *      do dano (não soma). Em conflito, a metamagia da 3ª palavra prevalece.
 *
 * O resultado é um item de magia criado na ficha, com ações ajustadas
 * (bônus das peculiaridades, custo de PM do círculo, dano/condições das
 * metamagias) e a receita registrada na descrição.
 */

const MODULE_ID = "ligeia-livro-do-jogador";
const PACK_MAGIAS = `${MODULE_ID}.magias`;

/* ------------------------------------------------------------------ */
/*  Catálogo de METAMAGIAS por palavra arcana (Sessão 11 do livro)     */
/*  kind:                                                              */
/*   damage {dtype}   troca o tipo do dano (ou dá dano +1/+2/+3 se a   */
/*                    base não causar dano)                            */
/*   condition {...}  alvo resiste ou recebe condição (até fim da cena)*/
/*   selfcond {...}   o CONJURADOR recebe a condição ao conjurar       */
/*   area2x | range2x | aura   alteram área/alcance/forma              */
/*   mpdrain          dreno de 4 PM (6 no Círculo Maior)               */
/*   buff {...}       ação extra de aprimoramento (alvo ou você)       */
/*   other            registrada na receita (resolução manual)         */
/* ------------------------------------------------------------------ */
export const METAMAGIAS = {
  acida: [
    { name: "Magia Ácida", lvl: "Básica", kind: "damage", dtype: "acido",
      desc: "Se a base não causa dano, causa dano de Ácido +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Ácido." },
    { name: "Magia Corrosiva", lvl: "Básica", kind: "condition", cond: "dano_continuo", resist: "vigor", tickType: "acido",
      desc: "Vigor oposto à Conjuração ou dano contínuo de ácido pelo resto da cena (Vigor anula)." },
  ],
  augurado: [
    { name: "Magia Clarividente", lvl: "Básica", kind: "other",
      desc: "Pode mirar alvos fora da linha de visão ou ocultos, desde que não tenham cobertura." },
    { name: "Magia Precognitiva", lvl: "Básica", kind: "other",
      desc: "Pode re-rolar a rolagem de Conjuração desta magia, uma vez por conjuração." },
  ],
  carmo: [
    { name: "Magia Aterrorizante", lvl: "Básica", kind: "condition", cond: "abalado", resist: "mente",
      desc: "Mente oposta à Conjuração ou Abalado até o fim da cena (Mente anula)." },
    { name: "Magia Atordoante", lvl: "Avançada", kind: "condition", cond: "atordoado", resist: "mente",
      desc: "Mente oposta à Conjuração ou Atordoado até o fim da cena (Mente anula)." },
    { name: "Magia Dominadora", lvl: "Avançada", kind: "condition", cond: "dominado", resist: "mente",
      desc: "Mente oposta à Conjuração ou Dominado enquanto sustentado por ação rápida (Mente anula)." },
    { name: "Magia Estonteante", lvl: "Básica", kind: "condition", cond: "pasmo", resist: "mente",
      desc: "Mente oposta à Conjuração ou Pasmo até o fim da cena (Mente anula)." },
  ],
  devena: [
    { name: "Magia Selvagem", lvl: "Básica", kind: "other",
      desc: "Cria um efeito de Força da Natureza (pelo terreno) na área; dura uma cena e não afeta você." },
    { name: "Magia Verdejante", lvl: "Básica", kind: "other",
      desc: "Área de plantas (raio = Nível): inimigos sofrem 1 de veneno; aliados recuperam 1 PV. Sustentável (movimento)." },
  ],
  energio: [
    { name: "Magia Energética", lvl: "Básica", kind: "damage", dtype: "energia",
      desc: "Se a base não causa dano, causa dano de Energia +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Energia." },
    { name: "Magia Vórtica", lvl: "Básica", kind: "aura",
      desc: "O alcance muda para Emanação e o alvo vira Área 1m x Círculo x Nível em torno de você." },
  ],
  exitium: [
    { name: "Magia Potencializada", lvl: "Básica", kind: "other",
      desc: "Dobra o dano base da magia; você sofre dano final igual ao dano base ao conjurá-la." },
  ],
  forjuri: [
    { name: "Magia Protetora", lvl: "Básica", kind: "buff", buff: "rd", needs: "damageType",
      desc: "O alvo (ou você) recebe Proteção 2 (3 no Círculo Maior) contra um tipo de dano, até o fim da cena." },
    { name: "Magia Defensora", lvl: "Básica", kind: "buff", buff: "bloqueio",
      desc: "O alvo (ou você) recebe +1 em Bloqueio até o fim da cena." },
  ],
  fulgur: [
    { name: "Magia Chocante", lvl: "Básica", kind: "condition", cond: "imobilizado", resist: "vigor",
      desc: "Vigor oposto à Conjuração ou Imobilizado até o fim da cena (Vigor anula)." },
    { name: "Magia Corrente", lvl: "Básica", kind: "other",
      desc: "Causa 1 ponto de dano bruto de raio a todas as criaturas adjacentes ao alvo." },
    { name: "Magia Eletrizante", lvl: "Básica", kind: "damage", dtype: "raio",
      desc: "Se a base não causa dano, causa dano de Raio +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Raio." },
  ],
  glacios: [
    { name: "Magia Glacial", lvl: "Básica", kind: "damage", dtype: "frio",
      desc: "Se a base não causa dano, causa dano de Frio +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Frio." },
    { name: "Magia Congelante", lvl: "Básica", kind: "condition", cond: "lento", resist: "agilidade",
      desc: "Agilidade oposta à Conjuração ou Lento até o fim da cena (Força anula)." },
  ],
  ignis: [
    { name: "Magia Ardente", lvl: "Básica", kind: "condition", cond: "dano_continuo", resist: "vigor", tickType: "fogo",
      desc: "Vigor oposto à Conjuração ou dano contínuo de fogo pelo resto da cena (Vigor anula)." },
    { name: "Magia Flamejante", lvl: "Básica", kind: "damage", dtype: "fogo",
      desc: "Se a base não causa dano, causa dano de Fogo +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Fogo." },
  ],
  iluzio: [
    { name: "Magia Ilusória", lvl: "Básica", kind: "other",
      desc: "Cria uma ilusão média adjacente a você (sem som/cheiro/tato); Percepção oposta à Conjuração para notar." },
    { name: "Magia Invisível", lvl: "Básica", kind: "other",
      desc: "Os alvos são considerados indefesos para se defender desta magia." },
    { name: "Magia Furtiva", lvl: "Básica", kind: "selfcond", cond: "invisivel",
      desc: "Ao conjurar, você fica invisível até o fim da cena (cessa se você atacar)." },
  ],
  inanis: [
    { name: "Magia Neutralizante (cancelamento)", lvl: "Básica", kind: "other",
      desc: "Alvos: Conjuração oposta à Conjuração ou suas magias de duração ativa são canceladas." },
    { name: "Magia Neutralizante (dreno)", lvl: "Básica", kind: "mpdrain",
      desc: "Alvos perdem 4 PM (6 no Círculo Maior). Não pode ser aplicada a Queimar Magia." },
  ],
  kreo: [
    { name: "Magia Material", lvl: "Básica", kind: "other",
      desc: "Cria um objeto médio (Conjuração vs 10 + Dureza), lançável junto à magia; arma criada causa dano escalonado." },
    { name: "Magia Reparadora", lvl: "Básica", kind: "other",
      desc: "Se o alvo for um objeto, recupera 2 pontos de Dureza (3 no Círculo Maior)." },
  ],
  krucigon: [
    { name: "Magia Arrebatadora", lvl: "Avançada", kind: "other",
      desc: "Mente oposta à Conjuração ou o alvo é retirado de cena até o fim do turno dele; ao voltar sofre 1 de dano psíquico por círculo. Não se aplica a magias que causem dano." },
  ],
  lumo: [
    { name: "Magia Luminosa", lvl: "Básica", kind: "other",
      desc: "Os alvos irradiam luz (10m x Nível) até o fim da cena." },
    { name: "Magia Cromática", lvl: "Básica", kind: "other",
      desc: "Role 1d6 por alvo: Pasmo (1-2), Indefeso (3), Atordoado (4), Cego (5), Inconsciente (6) — Percepção anula." },
  ],
  majesto: [
    { name: "Magia Ampliada", lvl: "Básica", kind: "area2x",
      desc: "Dobra a área; magia de alvo vira Área (1m x Círculo x Nível)." },
    { name: "Magia Dimensional", lvl: "Básica", kind: "range2x",
      desc: "Dobra o alcance; toque vira 3m x Círculo x Nível. Não afeta emanação/aura/conjurador." },
    { name: "Magia Majestosa", lvl: "Básica", kind: "other",
      desc: "Invocações/criações saem uma categoria de tamanho maior (duas no Círculo Maior)." },
  ],
  menso: [
    { name: "Magia Impactante", lvl: "Básica", kind: "damage", dtype: "concussao",
      desc: "Se a base não causa dano, causa dano de Concussão +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Concussão." },
  ],
  mortis: [
    { name: "Magia Necrótica", lvl: "Básica", kind: "damage", dtype: "necrotico",
      desc: "Se a base não causa dano, causa dano Necrótico +1/+2/+3 pelo círculo; se causa, o dano passa a ser Necrótico." },
    { name: "Magia Debilitante", lvl: "Avançada", kind: "condition", cond: "enfraquecido", resist: "vigor",
      desc: "Vigor oposto à Conjuração ou Enfraquecido até o fim da cena (Vigor anula)." },
    { name: "Magia Vampírica", lvl: "Básica", kind: "other",
      desc: "Você recupera PV igual ao dano escalonado causado. Só em magias que causem dano." },
  ],
  noxia: [
    { name: "Magia Venenosa", lvl: "Básica", kind: "damage", dtype: "veneno",
      desc: "Se a base não causa dano, causa dano de Veneno +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Veneno." },
    { name: "Magia Tóxica", lvl: "Básica", kind: "condition", cond: "dano_continuo", resist: "vigor", tickType: "veneno",
      desc: "Vigor oposto à Conjuração ou dano contínuo de veneno até o fim da cena (Vigor anula)." },
  ],
  pluribus: [
    { name: "Magia Múltipla", lvl: "Básica", kind: "other",
      desc: "Atinge o dobro de alvos da base (aplicada duas vezes: o triplo)." },
    { name: "Magia Replicante", lvl: "Avançada", kind: "other",
      desc: "Tudo o que a magia cria ou invoca é duplicado (sem sobreposição)." },
  ],
  saeculorum: [
    { name: "Magia Duradoura", lvl: "Básica", kind: "other",
      desc: "Prolonga a duração (turno→rodada; rodada→cena; cena→hora; hora→dia...)." },
    { name: "Magia Acelerada", lvl: "Básica", kind: "other",
      desc: "Reduz o tempo de conjuração (hora→cena; cena→rodada; rodada→ação; ação→rápida...)." },
  ],
  sangon: [
    { name: "Magia Alquímica", lvl: "Básica", kind: "other",
      desc: "Transmuta o material de objetos-alvo (Conjuração vs 10 + Dureza; ±1 por 2 acima)." },
    { name: "Magia Deformante", lvl: "Básica", kind: "other",
      desc: "Troca um traço do alvo por um de outra criatura (até 2x Nível em Pontos de Criação) até o fim da cena (Vigor anula). Pode aplicar em você." },
  ],
  sankta: [
    { name: "Magia Purificadora", lvl: "Básica", kind: "other",
      desc: "Mente oposta à Conjuração ou o alvo perde 1 ponto de Corrupção (só acima da sua)." },
    { name: "Magia Sagrada", lvl: "Básica", kind: "damage", dtype: "radiante",
      desc: "Se a base não causa dano, causa dano Radiante +1/+2/+3 pelo círculo; se causa, o dano passa a ser Radiante." },
  ],
  sonigu: [
    { name: "Magia Atrativa", lvl: "Básica", kind: "condition", cond: "indefeso", resist: "mente", rounds: 1,
      desc: "Mente oposta à Conjuração ou Indefeso até o começo do turno do alvo." },
    { name: "Magia Ensurdecedora", lvl: "Básica", kind: "condition", cond: "surdo", resist: "vigor",
      desc: "Vigor oposto à Conjuração ou Surdo até o fim da cena (Percepção anula)." },
    { name: "Magia Estrondante", lvl: "Básica", kind: "damage", dtype: "sonico",
      desc: "Se a base não causa dano, causa dano Sônico +1/+2/+3 pelo círculo; se causa, o dano passa a ser Sônico." },
    { name: "Magia Reticente", lvl: "Básica", kind: "other",
      desc: "Cria área de silêncio (1m x Nível) na área/em torno do alvo; Força oposta à Conjuração para emitir som." },
  ],
  sorcdiron: [
    { name: "Magia Adjetiva", lvl: "Básica", kind: "buff", buff: "dice", needs: "attr",
      desc: "O alvo (ou você) recebe 1D em um atributo à sua escolha até o fim da cena." },
    { name: "Magia Aperfeiçoante", lvl: "Básica", kind: "buff", buff: "bonus", needs: "bonusTarget",
      desc: "O alvo (ou você) recebe +1 em ataque, Deslocamento, Iniciativa, Esquiva, Bloqueio ou Conjuração até o fim da cena." },
    { name: "Magia Artifícia", lvl: "Básica", kind: "other",
      desc: "Objeto não mágico alvo recebe +1 por círculo nas rolagens de uso, até o fim da cena." },
    { name: "Magia Revigorante", lvl: "Básica", kind: "buff", buff: "sobrevida",
      desc: "O alvo (ou você) recebe 1 de sobrevida por 2 pontos da Conjuração acima de 10." },
  ],
  tenebrae: [
    { name: "Magia Cegante", lvl: "Básica", kind: "condition", cond: "cego", resist: "percepcao",
      desc: "Percepção oposta à Conjuração ou Cego pela duração da magia (Percepção anula)." },
    { name: "Magia Umbral", lvl: "Básica", kind: "other",
      desc: "Área de escuridão na área da magia, ou aura (1m x Nível) de escuridão no alvo (não o afeta)." },
  ],
  traumato: [
    { name: "Magia Psíquica", lvl: "Básica", kind: "damage", dtype: "psiquico",
      desc: "Se a base não causa dano, causa dano Psíquico +1/+2/+3 pelo círculo; se causa, o dano passa a ser Psíquico." },
    { name: "Magia Compungente", lvl: "Básica", kind: "condition", cond: "dano_continuo", resist: "mente", tickType: "psiquico",
      desc: "Mente oposta à Conjuração ou dano contínuo psíquico pelo resto da cena (Mente anula)." },
  ],
  vitae: [
    { name: "Magia Curativa", lvl: "Básica", kind: "buff", buff: "cura",
      desc: "Cura 1 PV dos afetados (2 no Intermediário, 3 no Maior). Pode aplicar em você." },
    { name: "Magia Regeneradora", lvl: "Avançado", kind: "buff", buff: "regen",
      desc: "O alvo (ou você) recebe regeneração até o fim da cena." },
    { name: "Magia Restauradora", lvl: "Básica", kind: "other",
      desc: "Neutraliza uma condição negativa do alvo. Pode aplicar em você." },
  ],
};

const TIERS = {
  "Menor": { circ: 1, pm: 1 },
  "Intermediária": { circ: 2, pm: 2 },
  "Maior": { circ: 3, pm: 3 },
};

const DTYPES = {
  acido: "Ácido", concussao: "Concussão", corte: "Corte", energia: "Energia",
  fogo: "Fogo", frio: "Frio", necrotico: "Necrótico", perfuracao: "Perfuração",
  psiquico: "Psíquico", radiante: "Radiante", raio: "Raio", sonico: "Sônico",
  veneno: "Veneno",
};
const BONUS_TARGETS = {
  attack: "Ataque", deslocamento: "Deslocamento", iniciativa: "Iniciativa",
  esquiva: "Esquiva", bloqueio: "Bloqueio", conjuracao: "Conjuração",
};
const ATTRS = { forca: "Força", agilidade: "Agilidade", vigor: "Vigor",
                mente: "Mente", percepcao: "Percepção" };

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

/** Traços que CONCEDEM a habilidade Palavra Arcana (livro, Sessão 4). */
const TRACOS_COM_PALAVRA = {
  "filhos de kalael": "energio",
  "prole de mizra": "tenebrae",
  "ilusionista natural": "iluzio",
};

const semAcento = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Palavras arcanas que o personagem domina: habilidades "Palavra Arcana [x]"
 * (qualquer nível) e os traços raciais que concedem a habilidade.
 * @returns {Map<string,string>} palavra -> de onde vem
 */
function palavrasDoAtor(actor) {
  const out = new Map();
  for (const it of actor.items) {
    if (it.type === "habilidade") {
      const m = it.name.match(/^Palavra Arcana\s*[\[(]\s*(\w+)\s*[\])]/i);
      if (m) out.set(m[1].toLowerCase(), `habilidade (${it.system?.level || "B"})`);
    } else if (it.type === "traco") {
      const p = TRACOS_COM_PALAVRA[semAcento(it.name)];
      if (p && !out.has(p)) out.set(p, `traço ${it.name}`);
    }
  }
  return new Map([...out.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

/** Círculos em que uma peculiaridade vale ("apenas Círculo X ou Y"). */
function circulosDe(texto) {
  const t = semAcento(texto);
  const m = t.match(/apenas circulo ([a-z ]+?)\)/);
  if (!m) return new Set(Object.keys(TIERS));
  const out = new Set();
  if (/menor/.test(m[1])) out.add("Menor");
  if (/intermediari/.test(m[1])) out.add("Intermediária");
  if (/maior/.test(m[1])) out.add("Maior");
  return out.size ? out : new Set(Object.keys(TIERS));
}

/**
 * Alcance/área do livro ("5m x Círculo x Nível", "Nível x Círculo", "1m x
 * Nível") como fórmula para um círculo. Espelha _slot_formula do gerador,
 * que produz a versão do Círculo Menor gravada nas ações do compêndio.
 */
export function slotFormula(texto, circ) {
  const t = semAcento(texto);
  if (!t) return null;
  let base;
  let fatores;
  const m = t.match(/^(\d+)\s*m?\s*(?:x\s*(circulo|nivel)\s*)?(?:x\s*(circulo|nivel)\s*)?$/);
  if (m) { base = Number(m[1]); fatores = [m[2], m[3]].filter(Boolean); }
  else if (/^(nivel\s*x\s*circulo|circulo\s*x\s*nivel)$/.test(t)) { base = 1; fatores = ["nivel", "circulo"]; }
  else if (t === "nivel") { base = 1; fatores = ["nivel"]; }
  else return null;
  // No Círculo Menor o gerador ignora o fator Círculo (vale 1).
  const n = base * (fatores.includes("circulo") ? circ : 1);
  if (fatores.includes("nivel")) return n === 1 ? "@nivel" : `${n}*@nivel`;
  return String(n);
}

function textoPeculiaridades(item) {
  return (item.system?.peculiarities || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

/** Peculiaridades com modificador numérico (+N/-N), com os círculos válidos. */
export function parsePeculiaridades(item) {
  const texto = textoPeculiaridades(item);
  const out = [];
  const re = /([^.;]*?)\(([+-]\d+)\)/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const rot = m[1].replace(/^[\s\-–•]+/, "").trim();
    if (rot.length < 6) continue;
    out.push({ texto: rot, mod: Number(m[2]), circulos: circulosDe(rot + ")") });
  }
  return out;
}

/**
 * Aprimoramentos GRATUITOS do círculo — as peculiaridades "(-)" do livro,
 * como "Dano: Ácido +2 (apenas Círculo Intermediário) (-)". Valem sozinhos
 * quando a magia é criada naquele círculo. Os reconhecidos alteram a magia;
 * os demais ficam registrados na receita.
 */
export function parseAprimoramentos(item) {
  const texto = textoPeculiaridades(item);
  const out = [];
  const re = /([^.;]*?)\(-\)/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const rot = m[1].replace(/^[\s\-–•]+/, "").trim();
    if (rot.length < 6) continue;
    const t = semAcento(rot);
    let tipo = null;
    let valor = null;
    let x;
    if ((x = t.match(/^dano(?:\s+final)?(?:\s+de)?:?\s*[^\d+]*\+?\s*(\d+)/)) ||
        (x = t.match(/causa (\d+) pontos? de dano/))) { tipo = "dano"; valor = Number(x[1]); }
    else if ((x = t.match(/perde (\d+) pontos de magia/))) { tipo = "dreno"; valor = Number(x[1]); }
    else if ((x = t.match(/restaura (\d+) pontos de vida/))) { tipo = "cura"; valor = Number(x[1]); }
    else if ((x = t.match(/protecao aumenta para (\d+)/))) { tipo = "rd"; valor = Number(x[1]); }
    else if ((x = t.match(/recebem \+(\d+), em vez de \+1/))) { tipo = "bonus"; valor = Number(x[1]); }
    out.push({ texto: rot, tipo, valor, circulos: circulosDe(rot + ")") });
  }
  return out;
}

/** Aplica os aprimoramentos "(-)" do círculo escolhido (mutação in-place). */
function aplicarAprimoramentos(data, aprimoramentos, tier) {
  const sys = data.system;
  // Por tipo, o maior valor entre os que valem no círculo.
  const melhor = {};
  for (const a of aprimoramentos) {
    if (!a.tipo || !a.circulos.has(tier)) continue;
    melhor[a.tipo] = Math.max(melhor[a.tipo] ?? -Infinity, a.valor);
  }
  for (const a of sys.actions) {
    if (melhor.dano != null && (a.damage ?? "") !== "" && a.damageResource !== "mp") a.damage = String(melhor.dano);
    if (melhor.dreno != null && (a.damage ?? "") !== "" && a.damageResource === "mp") a.damage = String(melhor.dreno);
    if (melhor.cura != null && (a.heal ?? "") !== "") a.heal = String(melhor.cura);
    for (const ap of a.appliesEffects ?? []) {
      if (melhor.rd != null && ap.fxType === "rd") ap.fxValue = String(melhor.rd);
      if (melhor.bonus != null && ap.fxType === "bonus" && Number(ap.fxValue) > 0) ap.fxValue = String(melhor.bonus);
    }
  }
  for (const e of sys.effects ?? []) {
    if (melhor.rd != null && e.type === "rd") e.value = String(melhor.rd);
  }
  return aprimoramentos.filter((a) => a.circulos.has(tier));
}

/** Alcance e área das ações acompanham o círculo ("x Círculo" no livro). */
function escalarCirculo(data, circ) {
  const sys = data.system;
  const pares = [["range", sys.range], ["area", sys.area]];
  for (const [campo, slot] of pares) {
    const menor = slotFormula(slot, 1);
    const novo = slotFormula(slot, circ);
    if (!menor || !novo || menor === novo) continue;
    for (const a of sys.actions) {
      if (String(a[campo] ?? "") === menor) a[campo] = novo;
    }
  }
}

/** Magias Menores disponíveis de uma palavra (compêndio + mundo), em cache. */
const _cacheBases = new Map();
async function magiasBase(palavra) {
  if (_cacheBases.has(palavra)) return _cacheBases.get(palavra);
  const out = [];
  const pack = game.packs.get(PACK_MAGIAS);
  if (pack) {
    const docs = await pack.getDocuments();
    for (const d of docs) {
      if ((d.system?.wordId || "").toLowerCase() === palavra &&
          (d.system?.tier || "Menor") === "Menor") out.push(d);
    }
  }
  for (const d of game.items ?? []) {
    if (d.type === "magia" && (d.system?.wordId || "").toLowerCase() === palavra &&
        (d.system?.tier || "Menor") === "Menor") out.push(d);
  }
  out.sort((a, b) => a.name.localeCompare(b.name, "pt"));
  _cacheBases.set(palavra, out);
  return out;
}

const esc = (s) => foundry.utils.escapeHTML ? foundry.utils.escapeHTML(String(s)) : String(s);

/* ------------------------------------------------------------------ */
/*  Aplicação das metamagias ao item criado                            */
/* ------------------------------------------------------------------ */

function acoesOfensivas(data) {
  return data.system.actions.filter((a) =>
    ["target", "area", "aura", "line", "cone", "lineCustom"].includes(a.targetMode));
}

function novoApplies(label, extra = {}) {
  return Object.assign({
    label, fxType: "condition", fxTarget: "", fxValue: "0", fxAll: false,
    durationMode: "scene", durationRounds: "1",
    resist: false, resistAttr: "vigor", resistVsCast: true, resistDc: "0",
    resistReroll: false, tickAmount: "0", tickType: "", tickResource: "hp",
    tickHealAmount: "0", tickHealResource: "hp",
    fxFile: "", fxScale: "1", fxAaConfig: null, fxAaName: "", fxAaPersist: true,
    fxEnchant: false, grantTempHp: "0",
  }, extra);
}

function novaAcao(label, extra = {}) {
  return Object.assign({
    label, level: "all", canRoll: false, rollAttr: "conjuracao",
    rollBonus: "0", rollDice: "0", vsDifficulty: false, fixedDifficulty: "8",
    difficultyAttr: "nenhum", targetMode: "target", includeSelf: true,
    areaFilter: "all", defenseAttr: "esquiva", defenseAttr2: "",
    damage: "", damageType: "", damageResource: "hp", scalingDamage: false,
    heal: "", healResource: "hp", scalingHeal: false, tempStack: false,
    skipRollDialog: true, extraDamage: [], preActivations: [],
    movement: { enabled: false, kind: "push", who: "targets", distance: "0",
                lateralSide: "right", ignoreWalls: false, snap: true },
    appliesEffects: [], lineWidth: "1.5", coneAngle: "45",
    isWeapon: false, isMelee: false, range: "", area: "",
    macroUuid: "", macroName: "", macroEnabled: true,
    aaConfig: null, aaName: "", aaEnabled: true,
    animFile: "", animPlacement: "target", animScale: "1",
    animEnabled: true, animAttach: false,
    costMp: "0", costHp: "0", costHeroic: "0",
    persistArea: false, persistRounds: "1", persistAffectsSelf: false,
    persistRerollAttack: false, persistTrigger: "both",
  }, extra);
}

/** Aplica UMA metamagia sobre os dados do item (mutação in-place). */
export function aplicarMetamagia(data, meta, circ, escolha) {
  const sys = data.system;
  const ofensivas = acoesOfensivas(data);
  // Ação ofensiva para ancorar o efeito; sem nenhuma, cria uma nova.
  const ancora = () => {
    if (ofensivas[0]) return ofensivas[0];
    const nova = novaAcao(`Efeito de ${meta.name} (Conjuração vs Esquiva)`, {
      canRoll: true, rollAttr: "conjuracao", targetMode: "target",
      includeSelf: false, defenseAttr: "esquiva",
    });
    sys.actions.push(nova);
    ofensivas.push(nova);
    return nova;
  };
  switch (meta.kind) {
    case "damage": {
      let alguma = false;
      for (const a of sys.actions) {
        if ((a.damage ?? "") !== "" && a.damage !== "0") { a.damageType = meta.dtype; alguma = true; }
        for (const ex of a.extraDamage ?? []) if (ex.formula) ex.type = meta.dtype;
      }
      if (!alguma) {
        const a = ancora();
        a.damage = String(circ);              // +1/+2/+3 pelo círculo
        a.damageType = meta.dtype;
      }
      break;
    }
    case "condition": {
      const alvo1 = ancora();
      alvo1.appliesEffects ??= [];
      alvo1.appliesEffects.push(novoApplies(`${meta.name}: ${DTYPES[meta.tickType] ?? ""} ${meta.cond}`.trim(), {
        fxType: "condition", fxTarget: meta.cond,
        durationMode: meta.rounds ? "rounds" : "scene",
        durationRounds: String(meta.rounds ?? 1),
        resist: true, resistAttr: meta.resist || "vigor",
        tickAmount: meta.tickType ? "1" : "0", tickType: meta.tickType ?? "",
      }));
      break;
    }
    case "selfcond":
      sys.actions.push(novaAcao(`${meta.name} (você)`, {
        targetMode: "self",
        appliesEffects: [novoApplies(meta.name, {
          fxType: "condition", fxTarget: meta.cond, durationMode: "scene",
        })],
      }));
      break;
    case "area2x":
      for (const a of sys.actions) {
        if (["area", "aura", "cone", "line", "lineCustom"].includes(a.targetMode) && a.area) {
          a.area = `2*(${a.area})`;
        } else if (a.targetMode === "target") {
          a.targetMode = "area";
          a.area = `${circ}*@nivel`;
        }
      }
      break;
    case "range2x":
      for (const a of sys.actions) {
        if (a.isMelee) { a.isMelee = false; a.range = `3*${circ}*@nivel`; }
        else if (a.range && a.range !== "0") a.range = `2*(${a.range})`;
      }
      break;
    case "aura":
      for (const a of ofensivas) {
        a.targetMode = "aura"; a.range = ""; a.area = `${circ}*@nivel`;
      }
      break;
    case "mpdrain": {
      const alvo1 = ancora();
      alvo1.extraDamage ??= [];
      alvo1.extraDamage.push({ formula: String(circ >= 3 ? 6 : 4), type: "",
                               resource: "mp", scaling: false });
      break;
    }
    case "buff": {
      if (meta.buff === "cura") {
        sys.actions.push(novaAcao(`${meta.name} (cura ${circ} PV)`, {
          heal: String(circ), healResource: "hp",
        }));
      } else if (meta.buff === "regen") {
        sys.actions.push(novaAcao(`${meta.name} (regeneração na cena)`, {
          // "restore" é instantâneo no sistema; a regeneração precisa de um
          // efeito duradouro (valor 0) carregando o tickHeal.
          appliesEffects: [novoApplies("Regeneração (1 PV/rodada)", {
            fxType: "bonus", fxTarget: "all", fxValue: "0",
            tickHealAmount: "1", tickHealResource: "hp",
          })],
        }));
      } else if (meta.buff === "sobrevida") {
        sys.actions.push(novaAcao(`${meta.name} (sobrevida: 1 por 2 acima de 10)`, {
          canRoll: true, rollAttr: "conjuracao", vsDifficulty: true,
          fixedDifficulty: "10", heal: "0", healResource: "hpTemp",
          scalingHeal: true,
        }));
      } else if (meta.buff === "rd") {
        const tipo = escolha?.damageType || "fogo";
        sys.actions.push(novaAcao(`${meta.name} (RD ${circ >= 3 ? 3 : 2} de ${DTYPES[tipo]})`, {
          appliesEffects: [novoApplies(`Proteção ${circ >= 3 ? 3 : 2} (${DTYPES[tipo]})`, {
            fxType: "rd", fxTarget: tipo, fxValue: String(circ >= 3 ? 3 : 2),
          })],
        }));
      } else if (meta.buff === "dice") {
        const attr = escolha?.attr || "forca";
        sys.actions.push(novaAcao(`${meta.name} (1D em ${ATTRS[attr]})`, {
          appliesEffects: [novoApplies(`1D em ${ATTRS[attr]} (cena)`, {
            fxType: "dice", fxTarget: attr, fxValue: "1",
          })],
        }));
      } else if (meta.buff === "bloqueio") {
        sys.actions.push(novaAcao(`${meta.name} (+1 Bloqueio, cena)`, {
          appliesEffects: [novoApplies("+1 Bloqueio (cena)", {
            fxType: "bonus", fxTarget: "bloqueio", fxValue: "1",
          })],
        }));
      } else if (meta.buff === "bonus") {
        const alvo = escolha?.bonusTarget || "attack";
        sys.actions.push(novaAcao(`${meta.name} (+1 ${BONUS_TARGETS[alvo]}, cena)`, {
          appliesEffects: [novoApplies(`+1 ${BONUS_TARGETS[alvo]} (cena)`, {
            fxType: alvo === "deslocamento" ? "stat" : "bonus",
            fxTarget: alvo, fxValue: "1",
          })],
        }));
      }
      break;
    }
    default:
      break; // "other": registrada na receita
  }
}

/* ------------------------------------------------------------------ */
/*  Construção do item final                                           */
/* ------------------------------------------------------------------ */

export async function construirMagia(state) {
  const { base, tier, nome, palavra1, palavra2, palavra3,
          pecs, ajuste, meta2, meta3, escolha2, escolha3 } = state;
  const { circ, pm } = TIERS[tier];
  const data = base.toObject();
  delete data._id;
  data.name = nome || `${base.name} (${tier})`;
  data.system.tier = tier;
  data.system.wordId = palavra1;
  data.system.wordId2 = circ >= 2 ? (palavra2 || "") : "";
  data.system.wordId3 = circ >= 3 ? (palavra3 || "") : "";
  data.system.metamagics = [];
  if (circ >= 2 && meta2) data.system.metamagics.push({
    name: meta2.name, wordId: palavra2, description: meta2.desc });
  if (circ >= 3 && meta3) data.system.metamagics.push({
    name: meta3.name, wordId: palavra3, description: meta3.desc });

  // 1) Alcance/área acompanham o círculo ("5m x Círculo x Nível").
  escalarCirculo(data, circ);
  // 2) Aprimoramentos gratuitos "(-)" do círculo (dano +2/+3, cura, RD...).
  const aprimorados = aplicarAprimoramentos(data, parseAprimoramentos(base), tier);
  // 3) Só valem as peculiaridades permitidas no círculo escolhido.
  const pecsValidas = pecs.filter((p) => !p.circulos || p.circulos.has(tier));

  // Peculiaridade "Alcance (Toque)": a magia passa a ser de toque.
  if (pecsValidas.some((p) => /^alcance \(toque\)/.test(semAcento(p.texto)))) {
    for (const a of acoesOfensivas(data)) { a.range = ""; a.isMelee = true; }
  }

  // Peculiaridades: soma entra como bônus fixo nas rolagens das ações
  const delta = pecsValidas.reduce((s, p) => s + p.mod, 0) + (Number(ajuste) || 0);
  let temRolagem = false;
  for (const a of data.system.actions) {
    if (a.canRoll) {
      temRolagem = true;
      const atual = Number(a.rollBonus || 0);
      a.rollBonus = Number.isFinite(atual) ? String(atual + delta)
                                           : `${a.rollBonus}+${delta}`;
    }
  }
  if (delta !== 0 && !temRolagem && data.system.actions[0]) {
    data.system.actions[0].rollBonus = String(delta);
  }

  // Custo de PM do círculo
  let temCusto = false;
  for (const a of data.system.actions) {
    if (Number(a.costMp || 0) > 0) { a.costMp = String(pm); temCusto = true; }
  }
  if (!temCusto) {
    const alvo = data.system.actions.find((a) => a.canRoll) ?? data.system.actions[0];
    if (alvo) alvo.costMp = String(pm);
  }

  // Metamagias — a da 3ª palavra é aplicada DEPOIS (prevalece em conflito)
  if (circ >= 2 && meta2) aplicarMetamagia(data, meta2, circ, escolha2);
  if (circ >= 3 && meta3) aplicarMetamagia(data, meta3, circ, escolha3);

  // Receita na descrição
  const linhasPec = pecsValidas.map((p) => `<li>${esc(p.texto)} (${p.mod >= 0 ? "+" : ""}${p.mod})</li>`).join("");
  const linhasApr = aprimorados.map((a) => `<li>${esc(a.texto)}${a.tipo ? "" : " <em>(aplique manualmente)</em>"}</li>`).join("");
  const metas = data.system.metamagics.map((m) =>
    `<li><strong>${esc(m.name)}</strong> (${esc(m.wordId)}): ${esc(m.description)}</li>`).join("");
  const palavras = [palavra1, circ >= 2 ? palavra2 : null, circ >= 3 ? palavra3 : null].filter(Boolean);
  data.system.description = (data.system.description || "") + `
<hr><p><strong>Magia criada — Círculo ${esc(tier)}</strong> (custo ${pm} PM; bônus de peculiaridades: ${delta >= 0 ? "+" : ""}${delta})</p>
<p>Palavras: ${esc(palavras.join(", "))}. Base: ${esc(base.name)}.</p>
${linhasApr ? `<p>Aprimoramentos do círculo (gratuitos):</p><ul>${linhasApr}</ul>` : ""}
${linhasPec ? `<p>Peculiaridades escolhidas:</p><ul>${linhasPec}</ul>` : ""}
${metas ? `<p>Metamagias:</p><ul>${metas}</ul>` : ""}`;

  // Receita estruturada (para consulta ou reconstrução futura)
  data.flags ??= {};
  data.flags[MODULE_ID] = {
    receita: {
      tier, palavras, base: base.name, bonus: delta,
      peculiaridades: pecsValidas.map((p) => ({ texto: p.texto, mod: p.mod })),
      metamagias: data.system.metamagics.map((m) => m.name),
    },
  };

  return data;
}

/* ------------------------------------------------------------------ */
/*  A janela da oficina                                                */
/* ------------------------------------------------------------------ */

class SpellForgeApp extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "ligeia-spellforge-{id}",
    classes: ["ligeia-spellforge"],
    window: { title: "Criação de Magias — Ligeia", icon: "fa-solid fa-wand-sparkles" },
    position: { width: 620, height: "auto" },
  };

  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.state = {
      tier: "Menor", palavra1: "", palavra2: "", palavra3: "",
      baseId: "", nome: "", ajuste: 0,
      pecsMarcadas: new Set(), meta2i: -1, meta3i: -1,
      escolha2: {}, escolha3: {},
    };
    this.palavras = palavrasDoAtor(actor);
    this.bases = [];       // magias da palavra1
  }

  get title() { return `Criação de Magias — ${this.actor.name}`; }

  async carregarBases() {
    this.bases = this.state.palavra1 ? await magiasBase(this.state.palavra1) : [];
    if (!this.bases.find((b) => b.id === this.state.baseId)) this.state.baseId = "";
  }

  #opcoes(lista, atual, vazio) {
    const o = [`<option value="">${vazio}</option>`];
    for (const [v, rot] of lista) {
      o.push(`<option value="${esc(v)}" ${v === atual ? "selected" : ""}>${esc(rot)}</option>`);
    }
    return o.join("");
  }

  #metamagiaBloco(n, palavra, metaIdx, escolha) {
    if (!palavra) return `<p class="dica">Escolha a ${n}ª palavra arcana para ver as metamagias dela.</p>`;
    const lista = METAMAGIAS[palavra] ?? [];
    if (!lista.length) return `<p class="dica">Sem metamagias catalogadas para <b>${esc(palavra)}</b>.</p>`;
    const sel = lista[metaIdx];
    const radios = lista.map((m, i) => `
      <label class="meta-opt"><input type="radio" name="meta${n}" value="${i}" ${i === metaIdx ? "checked" : ""}>
        <b>${esc(m.name)}</b> <em>(${esc(m.lvl)})</em><br><span>${esc(m.desc)}</span></label>`).join("");
    let extra = "";
    if (sel?.needs === "damageType") {
      extra = `<label>Tipo de dano protegido: <select name="escolha${n}-damageType">${
        this.#opcoes(Object.entries(DTYPES), escolha.damageType || "fogo", "—")}</select></label>`;
    } else if (sel?.needs === "attr") {
      extra = `<label>Atributo: <select name="escolha${n}-attr">${
        this.#opcoes(Object.entries(ATTRS), escolha.attr || "forca", "—")}</select></label>`;
    } else if (sel?.needs === "bonusTarget") {
      extra = `<label>Bônus em: <select name="escolha${n}-bonusTarget">${
        this.#opcoes(Object.entries(BONUS_TARGETS), escolha.bonusTarget || "attack", "—")}</select></label>`;
    }
    return radios + (extra ? `<div class="meta-extra">${extra}</div>` : "");
  }

  async _renderHTML() {
    await this.carregarBases();
    const s = this.state;
    const { circ, pm } = TIERS[s.tier];
    const base = this.bases.find((b) => b.id === s.baseId) ?? null;
    const pecs = base ? parsePeculiaridades(base) : [];
    const valida = (p) => !p.circulos || p.circulos.has(s.tier);
    const soma = [...s.pecsMarcadas].reduce((t, i) => t + (pecs[i] && valida(pecs[i]) ? pecs[i].mod : 0), 0)
      + (Number(s.ajuste) || 0);
    const aprs = base ? parseAprimoramentos(base).filter((a) => a.circulos.has(s.tier)) : [];

    const el = document.createElement("div");
    el.className = "spellforge-form";
    const semPalavras = !this.palavras.size;
    const optPal = (atual, excluir) => this.#opcoes(
      [...this.palavras.entries()].filter(([p]) => !excluir.includes(p))
        .map(([p, fonte]) => [p, fonte.startsWith("traço") ? `${p} (${fonte})` : p]),
      atual, "— escolha —");

    el.innerHTML = `
      <style>
        .ligeia-spellforge .spellforge-form { padding: 6px 10px; max-height: 72vh; overflow-y: auto; }
        .ligeia-spellforge fieldset { border: 1px solid var(--color-border-light-primary, #888);
          border-radius: 6px; margin: 6px 0; padding: 6px 10px; }
        .ligeia-spellforge legend { font-weight: bold; padding: 0 6px; }
        .ligeia-spellforge label { display: block; margin: 3px 0; }
        .ligeia-spellforge .linha { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .ligeia-spellforge .linha > label { flex: 1 1 160px; }
        .ligeia-spellforge select, .ligeia-spellforge input[type=text], .ligeia-spellforge input[type=number] {
          width: 100%; }
        .ligeia-spellforge .pec { display: block; margin: 2px 0; font-size: 0.92em; }
        .ligeia-spellforge .pec b { color: var(--color-text-hyperlink, #46c); }
        .ligeia-spellforge .pec.fora { opacity: 0.45; }
        .ligeia-spellforge .aprs { margin-top: 6px; font-size: 0.92em; }
        .ligeia-spellforge .aprs ul { margin: 2px 0 0 18px; }
        .ligeia-spellforge .meta-opt { display: block; margin: 4px 0; font-size: 0.92em; }
        .ligeia-spellforge .meta-opt span { opacity: 0.85; }
        .ligeia-spellforge .dica { opacity: 0.75; font-style: italic; }
        .ligeia-spellforge .resumo { background: rgba(120,120,160,0.12); border-radius: 6px;
          padding: 6px 10px; margin: 6px 0; }
        .ligeia-spellforge footer { display: flex; gap: 8px; justify-content: flex-end; margin: 8px 0 4px; }
      </style>
      ${semPalavras ? `<p class="dica">⚠ ${esc(this.actor.name)} não possui nenhuma habilidade
        "Palavra Arcana [x]" na ficha (em qualquer nível) — adicione ao menos uma para criar magias.</p>` : ""}
      <fieldset><legend>1 · Círculo e palavra principal</legend>
        <div class="linha">
          <label>Círculo
            <select name="tier">${this.#opcoes(Object.keys(TIERS).map((t) => [t, `${t} (${TIERS[t].pm} PM)`]), s.tier, "—").replace('<option value="">—</option>', "")}</select>
          </label>
          <label>Palavra principal
            <select name="palavra1" ${semPalavras ? "disabled" : ""}>${optPal(s.palavra1, [])}</select>
          </label>
          <label>Magia Menor de base
            <select name="baseId" ${!s.palavra1 ? "disabled" : ""}>${this.#opcoes(this.bases.map((b) => [b.id, b.name]), s.baseId, s.palavra1 ? "— escolha —" : "— escolha a palavra —")}</select>
          </label>
        </div>
      </fieldset>
      <fieldset><legend>2 · Peculiaridades (a soma vira bônus na Conjuração)</legend>
        ${base ? (pecs.length ? pecs.map((p, i) => {
          const ok = valida(p);
          return `
          <label class="pec ${ok ? "" : "fora"}" ${ok ? "" : `title="Não vale no Círculo ${esc(s.tier)}"`}>
            <input type="checkbox" name="pec" value="${i}" ${s.pecsMarcadas.has(i) && ok ? "checked" : ""} ${ok ? "" : "disabled"}>
            <b>${p.mod >= 0 ? "+" : ""}${p.mod}</b> — ${esc(p.texto)}</label>`;
        }).join("")
          : `<p class="dica">Nenhuma peculiaridade com modificador numérico encontrada nesta magia.</p>`)
        : `<p class="dica">Escolha a magia de base para listar as peculiaridades dela.</p>`}
        ${aprs.length ? `<div class="aprs"><b>Aprimoramentos gratuitos do Círculo ${esc(s.tier)}</b> (aplicados automaticamente):<ul>${
          aprs.map((a) => `<li>${esc(a.texto)}${a.tipo ? "" : " <em>— registrar/aplicar manualmente</em>"}</li>`).join("")}</ul></div>` : ""}
        <label class="linha" style="margin-top:6px">Ajuste manual (peculiaridades fora da lista):
          <input type="number" name="ajuste" value="${Number(s.ajuste) || 0}" step="1" style="max-width:90px">
        </label>
      </fieldset>
      ${circ >= 2 ? `
      <fieldset><legend>3 · Segunda palavra e metamagia</legend>
        <label>Segunda palavra arcana
          <select name="palavra2">${optPal(s.palavra2, [s.palavra1])}</select></label>
        ${this.#metamagiaBloco(2, s.palavra2, s.meta2i, s.escolha2)}
      </fieldset>` : ""}
      ${circ >= 3 ? `
      <fieldset><legend>4 · Terceira palavra e metamagia (prevalece em conflito)</legend>
        <label>Terceira palavra arcana
          <select name="palavra3">${optPal(s.palavra3, [s.palavra1, s.palavra2])}</select></label>
        ${this.#metamagiaBloco(3, s.palavra3, s.meta3i, s.escolha3)}
      </fieldset>` : ""}
      <fieldset><legend>Nome e resumo</legend>
        <label>Nome da nova magia
          <input type="text" name="nome" value="${esc(s.nome)}" placeholder="${esc(base ? `${base.name} (${s.tier})` : "")}"></label>
        <div class="resumo">
          Custo: <b>${pm} PM</b> · Bônus de Conjuração: <b>${soma >= 0 ? "+" : ""}${soma}</b>
          ${circ >= 2 ? ` · Metamagia 2: <b>${esc((METAMAGIAS[s.palavra2] ?? [])[s.meta2i]?.name ?? "—")}</b>` : ""}
          ${circ >= 3 ? ` · Metamagia 3: <b>${esc((METAMAGIAS[s.palavra3] ?? [])[s.meta3i]?.name ?? "—")}</b>` : ""}
        </div>
      </fieldset>
      <footer>
        <button type="button" data-action="cancelar">Cancelar</button>
        <button type="button" data-action="criar" ${base ? "" : "disabled"}><i class="fa-solid fa-wand-sparkles"></i> Criar magia</button>
      </footer>`;
    return el;
  }

  _replaceHTML(result, content) {
    content.replaceChildren(result);
    this.#listeners(content);
  }

  #listeners(root) {
    const s = this.state;
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((n) => n.addEventListener(ev, fn));
    on('select[name=tier]', "change", (e) => { s.tier = e.target.value; this.render(); });
    on('select[name=palavra1]', "change", (e) => {
      s.palavra1 = e.target.value; s.baseId = ""; s.pecsMarcadas.clear();
      if (s.palavra2 === s.palavra1) { s.palavra2 = ""; s.meta2i = -1; }
      if (s.palavra3 === s.palavra1) { s.palavra3 = ""; s.meta3i = -1; }
      this.render();
    });
    on('select[name=baseId]', "change", (e) => { s.baseId = e.target.value; s.pecsMarcadas.clear(); this.render(); });
    on('input[name=pec]', "change", (e) => {
      const i = Number(e.target.value);
      e.target.checked ? s.pecsMarcadas.add(i) : s.pecsMarcadas.delete(i);
      this.render();
    });
    on('input[name=ajuste]', "change", (e) => { s.ajuste = Number(e.target.value) || 0; this.render(); });
    on('select[name=palavra2]', "change", (e) => {
      s.palavra2 = e.target.value; s.meta2i = -1; s.escolha2 = {};
      if (s.palavra3 === s.palavra2) { s.palavra3 = ""; s.meta3i = -1; }
      this.render();
    });
    on('select[name=palavra3]', "change", (e) => { s.palavra3 = e.target.value; s.meta3i = -1; s.escolha3 = {}; this.render(); });
    on('input[name=meta2]', "change", (e) => { s.meta2i = Number(e.target.value); this.render(); });
    on('input[name=meta3]', "change", (e) => { s.meta3i = Number(e.target.value); this.render(); });
    for (const n of [2, 3]) {
      for (const campo of ["damageType", "attr", "bonusTarget"]) {
        on(`select[name=escolha${n}-${campo}]`, "change", (e) => {
          (n === 2 ? s.escolha2 : s.escolha3)[campo] = e.target.value;
        });
      }
    }
    on('input[name=nome]', "input", (e) => { s.nome = e.target.value; });
    on('[data-action=cancelar]', "click", () => this.close());
    on('[data-action=criar]', "click", () => this.#criar());
  }

  async #criar() {
    const s = this.state;
    const base = this.bases.find((b) => b.id === s.baseId);
    if (!base) return ui.notifications.warn("Escolha a magia de base.");
    const { circ } = TIERS[s.tier];
    if (circ >= 2 && !s.palavra2) return ui.notifications.warn("Escolha a segunda palavra arcana.");
    if (circ >= 3 && !s.palavra3) return ui.notifications.warn("Escolha a terceira palavra arcana.");
    const meta2 = circ >= 2 ? (METAMAGIAS[s.palavra2] ?? [])[s.meta2i] : null;
    const meta3 = circ >= 3 ? (METAMAGIAS[s.palavra3] ?? [])[s.meta3i] : null;
    if (circ >= 2 && !meta2) return ui.notifications.warn("Escolha a metamagia da segunda palavra.");
    if (circ >= 3 && !meta3) return ui.notifications.warn("Escolha a metamagia da terceira palavra.");

    const pecsAll = parsePeculiaridades(base);
    const pecs = [...s.pecsMarcadas].sort((a, b) => a - b).map((i) => pecsAll[i]).filter(Boolean);
    const data = await construirMagia({
      base, tier: s.tier, nome: s.nome.trim(), palavra1: s.palavra1,
      palavra2: s.palavra2, palavra3: s.palavra3, pecs, ajuste: s.ajuste,
      meta2, meta3, escolha2: s.escolha2, escolha3: s.escolha3,
    });
    const [item] = await this.actor.createEmbeddedDocuments("Item", [data]);
    ui.notifications.info(`Magia criada: ${item.name} (${s.tier}, ${TIERS[s.tier].pm} PM).`);
    this.close();
    item.sheet?.render(true);
  }
}

export function abrirCriacaoDeMagia(actor) {
  actor ??= canvas.tokens?.controlled[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("Selecione um personagem.");
  new SpellForgeApp(actor).render(true);
}

/* ------------------------------------------------------------------ */
/*  Botão na ficha                                                     */
/* ------------------------------------------------------------------ */
function inserirBotao(app, html) {
  const doc = app.actor ?? app.document;
  if (!doc || doc.documentName !== "Actor") return;
  if (!["personagem", "npc"].includes(doc.type)) return;
  if (!doc.isOwner) return;
  const el = html instanceof HTMLElement ? html : html?.[0];
  const header = el?.closest?.(".app, .application")?.querySelector(".window-header")
    ?? el?.querySelector?.(".window-header")
    ?? app.element?.querySelector?.(".window-header");
  if (!header || header.querySelector(".ligeia-spellforge-btn")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "header-control ligeia-spellforge-btn";
  btn.title = "Criação de Magias (Livro do Jogador)";
  btn.innerHTML = '<i class="fa-solid fa-wand-sparkles"></i>';
  btn.style.cssText = "flex:0; min-width:24px;";
  btn.addEventListener("click", (ev) => { ev.preventDefault(); abrirCriacaoDeMagia(doc); });
  const fechar = header.querySelector('[data-action="close"], .close');
  fechar ? header.insertBefore(btn, fechar) : header.appendChild(btn);
}

Hooks.on("renderActorSheet", inserirBotao);
Hooks.on("renderActorSheetV2", inserirBotao);

Hooks.once("ready", () => {
  game.modules.get(MODULE_ID).api = { abrirCriacaoDeMagia, METAMAGIAS };
  console.log("Ligeia — Livro do Jogador | Criação de Magias pronta (botão na ficha).");
});
