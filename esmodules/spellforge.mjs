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
 *      Maior: terceira palavra + mais uma metamagia. As palavras podem se
 *      repetir (ignis + majesto + majesto: Ampliada e Dimensional na mesma
 *      magia); a mesma metamagia duas vezes triplica, não dobra o dobrado.
 *      Metamagia de dano sobre magia que JÁ causa dano: troca apenas o TIPO
 *      do dano (não soma). Em conflito, a metamagia da 3ª palavra prevalece.
 *
 * O resultado é um item de magia criado na ficha, com ações ajustadas
 * (bônus das peculiaridades, custo de PM do círculo, dano/condições das
 * metamagias) e a receita registrada na descrição.
 *
 * Animações: cada ação e cada condição da magia criada ganham uma animação
 * do Automated Animations que combine com o que ela ficou fazendo (ver
 * animacoes.mjs). Ficam guardadas como animação PUXADA — na ficha do item,
 * ●/○ desliga, ✕ remove e "🎞️ limpar animações" tira todas. A configuração
 * do módulo "Animações automáticas nas magias criadas" desliga o recurso.
 */

import { animarMagia, animarItem, limparAnimacoesAutomaticas, criarVerificador,
         contarAnimacoesAutomaticas } from "./animacoes.mjs";
import { refAcao, lerRef, novoIdDocumento, normalizarAutoRefs } from "./referencias.mjs";

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
/*   buff {...}       aprimoramento no alvo ou em você (em cadeia)     */
/*   planar | eterea  teleporte / intangível no alvo ou em você        */
/*   restauradora     tira uma condição (remoção de efeito do sistema) */
/*   marcador         efeito-lembrete na cena (forma/traço alterado)   */
/*   telecinetica     imobilizado + ação de mover o alvo 5m            */
/*   invisivel        alvos indefesos antes da rolagem; depois, sai    */
/*   vampirica        dreno: o dano escalonado volta como PV           */
/*   potencializada   dobra o dano base; você sofre o base (final)     */
/*   multipla         cópia da ação em cadeia, com o alvo escolhido na  */
/*                    hora (o dobro de alvos; duas vezes, o triplo)     */
/*   replicante       idem para a área: ela é reposicionada na hora     */
/*   other            registrada na receita (resolução manual)         */
/*                                                                    */
/*  alvoOuVoce: o livro deixa escolher, na criação, se a metamagia    */
/*  vale no alvo ou em você. comDano / semDano: só serve em magia que  */
/*  causa dano / que não causa.                                        */
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
    { name: "Magia Potencializada", lvl: "Básica", kind: "potencializada", comDano: true,
      desc: "Dobra o dano base da magia; você sofre dano final igual ao dano base ao conjurá-la. Só em magias que causem dano." },
  ],
  forjuri: [
    { name: "Magia Protetora", lvl: "Básica", kind: "buff", buff: "rd", needs: "damageType", alvoOuVoce: true,
      desc: "O alvo (ou você) recebe Proteção 2 (3 no Círculo Maior) contra um tipo de dano, até o fim da cena." },
    { name: "Magia Defensora", lvl: "Básica", kind: "buff", buff: "bloqueio", alvoOuVoce: true,
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
    { name: "Magia Invisível", lvl: "Básica", kind: "invisivel",
      desc: "Os alvos são considerados indefesos para se defender desta magia (antes da rolagem ficam Indefesos; depois, o efeito sai)." },
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
    { name: "Magia Arrebatadora", lvl: "Avançada", kind: "other", semDano: true,
      desc: "Mente oposta à Conjuração ou o alvo é retirado de cena até o fim do turno dele; ao voltar sofre 1 de dano psíquico por círculo. Não se aplica a magias que causem dano." },
    { name: "Magia Etérea", lvl: "Básica", kind: "eterea", alvoOuVoce: true,
      desc: "As criaturas afetadas ficam intangíveis até o fim da cena. Pode aplicar em você." },
    { name: "Magia Planar", lvl: "Básica", kind: "planar", alvoOuVoce: true,
      desc: "Teleporta o alvo até Mente metros, para um lugar em terra firme. Pode aplicar em você." },
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
      desc: "Dobra o alcance e as distâncias (teleporte, empurrão, telecinese). Toque, o próprio conjurador e emanação passam a ter alcance de 3m x Círculo x Nível e alvo: o toque e o \"em você\" viram um alvo; a emanação passa a sair do alvo." },
    { name: "Magia Majestosa", lvl: "Básica", kind: "other",
      desc: "Invocações/criações saem uma categoria de tamanho maior (duas no Círculo Maior)." },
  ],
  menso: [
    { name: "Magia Impactante", lvl: "Básica", kind: "damage", dtype: "concussao",
      desc: "Se a base não causa dano, causa dano de Concussão +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Concussão." },
    { name: "Magia Telecinética", lvl: "Básica", kind: "telecinetica", cond: "imobilizado", resist: "forca",
      desc: "Força oposta à Conjuração ou Imobilizado até o fim da cena (Força anula); enquanto durar, você pode mover um dos alvos até 5m usando sua ação." },
  ],
  mortis: [
    { name: "Magia Necrótica", lvl: "Básica", kind: "damage", dtype: "necrotico",
      desc: "Se a base não causa dano, causa dano Necrótico +1/+2/+3 pelo círculo; se causa, o dano passa a ser Necrótico." },
    { name: "Magia Debilitante", lvl: "Avançada", kind: "condition", cond: "enfraquecido", resist: "vigor",
      desc: "Vigor oposto à Conjuração ou Enfraquecido até o fim da cena (Vigor anula)." },
    { name: "Magia Vampírica", lvl: "Básica", kind: "vampirica", comDano: true,
      desc: "Você recupera PV igual ao dano escalonado causado. Só em magias que causem dano." },
  ],
  noxia: [
    { name: "Magia Venenosa", lvl: "Básica", kind: "damage", dtype: "veneno",
      desc: "Se a base não causa dano, causa dano de Veneno +1/+2/+3 pelo círculo; se causa, o dano passa a ser de Veneno." },
    { name: "Magia Tóxica", lvl: "Básica", kind: "condition", cond: "dano_continuo", resist: "vigor", tickType: "veneno",
      desc: "Vigor oposto à Conjuração ou dano contínuo de veneno até o fim da cena (Vigor anula)." },
  ],
  pluribus: [
    { name: "Magia Múltipla", lvl: "Básica", kind: "multipla",
      desc: "Atinge o dobro de alvos da base (aplicada duas vezes: o triplo). Depois do primeiro alvo, o jogo pede o próximo." },
    { name: "Magia Replicante", lvl: "Avançada", kind: "replicante",
      desc: "Tudo o que a magia cria ou invoca é duplicado, inclusive a área de efeito (sem sobrepor a primeira): a área é reposicionada na hora." },
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
    { name: "Magia Deformante", lvl: "Básica", kind: "marcador", marcador: "Traço trocado (Magia Deformante)", resist: "vigor", alvoOuVoce: true,
      desc: "Troca um traço do alvo por um de outra criatura (até 2x Nível em Pontos de Criação) até o fim da cena (Vigor anula). Pode aplicar em você." },
    { name: "Magia Metamórfica", lvl: "Básica", kind: "marcador", marcador: "Forma alterada (Magia Metamórfica)", resist: "vigor", alvoOuVoce: true,
      desc: "Vigor oposto à Conjuração ou o alvo assume a forma de uma criatura de Desafio até 2 x Nível até o fim da cena (Vigor anula; ele soma a diferença de Desafio à rolagem). Pode aplicar em você." },
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
    { name: "Magia Sonora", lvl: "Básica", kind: "other",
      desc: "As ilusões, criações ou invocações da magia emitem um som (barulho ou voz); Percepção oposta à Conjuração para notar que é falso." },
  ],
  sorcdiron: [
    { name: "Magia Adjetiva", lvl: "Básica", kind: "buff", buff: "dice", needs: "attr", alvoOuVoce: true,
      desc: "O alvo (ou você) recebe 1D em um atributo à sua escolha até o fim da cena." },
    { name: "Magia Aperfeiçoante", lvl: "Básica", kind: "buff", buff: "bonus", needs: "bonusTarget", alvoOuVoce: true,
      desc: "O alvo (ou você) recebe +1 em ataque, Deslocamento, Iniciativa, Esquiva, Bloqueio ou Conjuração até o fim da cena." },
    { name: "Magia Artifícia", lvl: "Básica", kind: "other",
      desc: "Objeto não mágico alvo recebe +1 por círculo nas rolagens de uso, até o fim da cena." },
    { name: "Magia Revigorante", lvl: "Básica", kind: "buff", buff: "sobrevida", alvoOuVoce: true,
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
    { name: "Magia Curativa", lvl: "Básica", kind: "buff", buff: "cura", alvoOuVoce: true,
      desc: "Cura 1 PV dos afetados (2 no Intermediário, 3 no Maior). Pode aplicar em você." },
    { name: "Magia Regeneradora", lvl: "Avançado", kind: "buff", buff: "regen", alvoOuVoce: true,
      desc: "O alvo (ou você) recebe regeneração até o fim da cena." },
    { name: "Magia Restauradora", lvl: "Básica", kind: "restauradora", needs: "condicao", alvoOuVoce: true,
      desc: "Neutraliza uma condição negativa do alvo (escolhida na criação). Pode aplicar em você." },
  ],
};

const TIERS = {
  "Menor": { circ: 1, pm: 1 },
  "Intermediária": { circ: 2, pm: 2 },
  "Maior": { circ: 3, pm: 3 },
};

export const DTYPES = {
  acido: "Ácido", concussao: "Concussão", corte: "Corte", energia: "Energia",
  fogo: "Fogo", frio: "Frio", necrotico: "Necrótico", perfuracao: "Perfuração",
  psiquico: "Psíquico", radiante: "Radiante", raio: "Raio", sonico: "Sônico",
  veneno: "Veneno",
};
const BONUS_TARGETS = {
  attack: "Ataque", deslocamento: "Deslocamento", iniciativa: "Iniciativa",
  esquiva: "Esquiva", bloqueio: "Bloqueio", conjuracao: "Conjuração",
};
export const ATTRS = { forca: "Força", agilidade: "Agilidade", vigor: "Vigor",
                mente: "Mente", percepcao: "Percepção" };

/** Condições negativas que a Magia Restauradora pode neutralizar (ids do sistema). */
export const CONDICOES_NEGATIVAS = {
  dano_continuo: "Dano Contínuo", enfraquecido: "Enfraquecido", exausto: "Exausto", lento: "Lento",
  imobilizado: "Imobilizado", cego: "Cego", surdo: "Surdo", abalado: "Abalado", pasmo: "Pasmo",
  atordoado: "Atordoado", paralisado: "Paralisado", dominado: "Dominado", enfeiticado: "Enfeitiçado",
  agarrado: "Agarrado", caido: "Caído", indefeso: "Indefeso", inconsciente: "Inconsciente",
  telecinese: "Telecinese",
};
const ROTULO_COND = { ...CONDICOES_NEGATIVAS, intangivel: "Intangível", invisivel: "Invisível", oculto: "Oculto" };

/**
 * Quando um efeito de metamagia em cadeia dispara, depois da ação principal
 * (condições de disparo do sistema: chainActions[].when).
 */
export const QUANDO = {
  always: "Sempre (ao conjurar)", hit: "Se acertar", damage: "Se causar dano", crit: "Se for crítico",
};

/** Metamagias que viram uma ação em cadeia (e por isso têm "Quando"). */
export function encadeia(meta, escolha = {}) {
  if (!meta) return false;
  if (["buff", "selfcond", "planar", "eterea", "restauradora"].includes(meta.kind)) return true;
  return meta.kind === "marcador" && escolha.quem === "voce";
}

/** Em quem a metamagia vale ("alvo" ou "voce") e quando dispara, com os padrões do livro. */
export function comoAplicar(meta, escolha = {}) {
  const quem = meta?.alvoOuVoce && escolha.quem === "voce" ? "voce"
    : meta?.kind === "selfcond" ? "voce" : "alvo";
  const quando = QUANDO[escolha.quando] ? escolha.quando : (quem === "voce" ? "always" : "hit");
  return { quem, quando };
}

/* ------------------------------------------------------------------ */
/*  Utilidades                                                         */
/* ------------------------------------------------------------------ */

/** Traços que CONCEDEM a habilidade Palavra Arcana (livro, Sessão 4). */
export const TRACOS_COM_PALAVRA = {
  "filhos de kalael": "energio",
  "prole de mizra": "tenebrae",
  "ilusionista natural": "iluzio",
};

const semAcento = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

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
  // Distâncias de movimento que o texto dá "x Círculo" (o Teletransporte:
  // "até uma distância igual a 10m x Círculo x Nível") — o compêndio grava a
  // do Círculo Menor.
  const texto = String(sys.description ?? "").replace(/<[^>]+>/g, " ");
  const slots = texto.match(/\d+\s*m\s*x\s*C[íi]rculo\s*x\s*N[íi]vel/gi) ?? [];
  for (const slot of slots) {
    const menor = slotFormula(slot, 1);
    const novo = slotFormula(slot, circ);
    if (!menor || !novo || menor === novo) continue;
    for (const a of sys.actions) {
      if (a.movement?.enabled && String(a.movement.distance ?? "") === menor) a.movement.distance = novo;
    }
  }
}

/** Dobra (ou triplica, na segunda vez) uma distância pela Magia Dimensional. */
function dobrarDistancia(mv) {
  if (!mv?.enabled) return;
  const d = String(mv.distance ?? "").trim();
  if (!d || d === "0") return; // "0" = à vontade
  mv._distBase ??= d;
  mv._dimensional = (mv._dimensional ?? 0) + 1;
  mv.distance = /^\d+$/.test(mv._distBase) ? String((mv._dimensional + 1) * Number(mv._distBase))
    : `${mv._dimensional + 1}*(${mv._distBase})`;
}

/** Distância de uma ação que uma metamagia cria, já com a Magia Dimensional da magia. */
function distanciaDaMagia(data, base) {
  const n = data._dimensional ?? 0;
  if (!n) return base;
  return /^\d+$/.test(base) ? String((n + 1) * Number(base)) : `${n + 1}*(${base})`;
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

/**
 * A ação causa dano de vida? "Psíquico +0" causa (dano base 0, escalonado);
 * um 0 fixo não causa; PM drenados (Queimar Magia) não são dano.
 */
function causaDanoDeVida(a) {
  const d = String(a.damage ?? "").trim();
  if (!d || (a.damageResource ?? "hp") !== "hp") return false;
  return d !== "0" || !!a.scalingDamage;
}

/**
 * Ação que uma metamagia criou como efeito à parte (a "↳ ..."), que as
 * outras metamagias não devem mexer. A ação-âncora (o ataque que uma
 * metamagia de condição ou dano ganha quando a magia não tem alvo) conta como
 * ação da magia: recebe área, alcance, dano e condições das outras.
 */
const deMetamagia = (a) => !!a._interna && !a._ancora;

function acoesOfensivas(data) {
  return data.system.actions.filter((a) => !deMetamagia(a) &&
    ["target", "area", "aura", "line", "cone", "lineCustom"].includes(a.targetMode));
}

/**
 * As ações que o jogador usa — as que cobram a mana da magia. É nelas que as
 * metamagias penduram o que disparam antes (ativações prévias) e depois (ações
 * em cadeia); as que as metamagias criam não cobram nada.
 */
function acoesIniciais(data) {
  return data.system.actions.filter((a) => !a._interna && Number(a.costMp || 0) > 0);
}

/** Ação interna de uma metamagia: disparada pela principal, sem custo de PM. */
function subAcao(label, extra = {}) {
  return Object.assign(novaAcao(`↳ ${label}`, { canRoll: false, includeSelf: false, ...extra, costMp: "0" }),
    { _interna: true });
}

/** `sub` dispara DEPOIS de cada ação de `de` (ação em cadeia; a ref é feita em construirMagia). */
function encadear(de, sub, when, targets) {
  for (const a of de) (a._cadeia ??= []).push({ alvo: sub, when, targets });
}

/** `sub` roda ANTES da rolagem de cada ação de `de` (ativação prévia). */
function antesDe(de, sub) {
  for (const a of de) (a._antes ??= []).push(sub);
}

export function novoApplies(label, extra = {}) {
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

export function novaAcao(label, extra = {}) {
  return Object.assign({
    label, level: "all", canRoll: false, rollAttr: "conjuracao",
    rollBonus: "0", rollDice: "0", vsDifficulty: false, fixedDifficulty: "8",
    difficultyAttr: "nenhum", targetMode: "target", includeSelf: true,
    areaFilter: "all", defenseAttr: "esquiva", defenseAttr2: "",
    damage: "", damageType: "", damageResource: "hp", scalingDamage: false,
    heal: "", healResource: "hp", scalingHeal: false, tempStack: false,
    skipRollDialog: true, extraDamage: [], preActivations: [],
    // Sistema build 27: dreno, efeitos removidos do alvo e ações em cadeia.
    drain: { enabled: false, resource: "mp", from: "both", ratio: "1" },
    removesEffects: [], chainActions: [],
    // Build 28: ação que é alvo de cadeia não ganha botão na ficha (dispara
    // sozinha), a menos que isto esteja marcado.
    showInSheet: false,
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

/** Rótulo de um efeito de aprimoramento, pelo tipo do buff. */
function efeitoDoBuff(meta, circ, escolha) {
  switch (meta.buff) {
    case "cura": return { rotulo: `cura ${circ} PV`, extra: { heal: String(circ), healResource: "hp" } };
    case "regen":
      // "restore" é instantâneo no sistema; a regeneração precisa de um
      // efeito duradouro (valor 0) carregando o tickHeal.
      return { rotulo: "regeneração até o fim da cena", extra: { appliesEffects: [novoApplies("Regeneração (1 PV/rodada)", {
        fxType: "bonus", fxTarget: "all", fxValue: "0", tickHealAmount: "1", tickHealResource: "hp",
      })] } };
    case "sobrevida":
      // "1 de sobrevida por 2 pontos da Conjuração acima de 10": rola
      // Conjuração contra CD 10 (sem defesa do alvo) e a sobrevida escala.
      return { rotulo: "sobrevida (1 por 2 acima de 10 na Conjuração)", extra: {
        vsDifficulty: true, fixedDifficulty: "10", rollAttr: "conjuracao", defenseAttr: "",
        heal: "0", healResource: "hpTemp", scalingHeal: true,
      } };
    case "rd": {
      const tipo = escolha?.damageType || "fogo";
      const v = circ >= 3 ? 3 : 2;
      return { rotulo: `Proteção ${v} contra ${DTYPES[tipo]} (cena)`, extra: { appliesEffects: [novoApplies(`Proteção ${v} (${DTYPES[tipo]})`, {
        fxType: "rd", fxTarget: tipo, fxValue: String(v),
      })] } };
    }
    case "dice": {
      const attr = escolha?.attr || "forca";
      return { rotulo: `1D em ${ATTRS[attr]} (cena)`, extra: { appliesEffects: [novoApplies(`1D em ${ATTRS[attr]} (cena)`, {
        fxType: "dice", fxTarget: attr, fxValue: "1",
      })] } };
    }
    case "bloqueio":
      return { rotulo: "+1 Bloqueio (cena)", extra: { appliesEffects: [novoApplies("+1 Bloqueio (cena)", {
        fxType: "bonus", fxTarget: "bloqueio", fxValue: "1",
      })] } };
    case "bonus": {
      const alvo = escolha?.bonusTarget || "attack";
      return { rotulo: `+1 ${BONUS_TARGETS[alvo]} (cena)`, extra: { appliesEffects: [novoApplies(`+1 ${BONUS_TARGETS[alvo]} (cena)`, {
        fxType: alvo === "deslocamento" ? "stat" : "bonus", fxTarget: alvo, fxValue: "1",
      })] } };
    }
    default: return null;
  }
}

/** Rótulo dos efeitos-lembrete e da remoção da Magia Invisível. */
const ROTULO_INVISIVEL = "Indefeso (Magia Invisível)";

/**
 * Aplica UMA metamagia sobre os dados do item (mutação in-place).
 *
 * O que a metamagia acrescenta como efeito à parte (cura, proteção,
 * teleporte...) vira uma AÇÃO EM CADEIA da ação principal: ela dispara sozinha
 * depois que a principal se resolve, sem cobrar PM — a mana sai uma vez só, na
 * ação que o jogador usa. A Magia Invisível usa uma ATIVAÇÃO PRÉVIA: deixa os
 * alvos Indefesos antes da rolagem e, em cadeia, tira o efeito depois.
 *
 * @param {object} escolha  o que o jogador decidiu na criação: quem (alvo /
 *   voce), quando (always / hit / damage / crit), damageType, attr,
 *   bonusTarget, condicao
 * @returns {string|null} aviso quando a metamagia não se aplica a esta magia
 */
export function aplicarMetamagia(data, meta, circ, escolha = {}) {
  const sys = data.system;
  const ofensivas = acoesOfensivas(data);
  const iniciais = acoesIniciais(data);
  // Magia só descritiva (sem ações): ganha a ação de conjurar, que cobra a
  // mana do círculo e dispara o que a metamagia acrescentar.
  const garantirInicial = () => {
    if (iniciais.length) return;
    const conj = novaAcao(`Conjurar ${data.name} (rolagem de Conjuração)`, {
      canRoll: true, rollAttr: "conjuracao", targetMode: "none", includeSelf: false, costMp: String(circ),
    });
    sys.actions.push(conj);
    sys.costs = []; // a mana sai da ação; ligar a magia na ficha não cobra de novo
    iniciais.push(conj);
  };
  // Ação ofensiva para ancorar o efeito. Sem nenhuma, a metamagia ganha a
  // dela: se a magia já tem a ação que se usa (só em você, por exemplo), o
  // ataque dispara em cadeia ao conjurar, sem custo extra; se não tem nenhuma,
  // o ataque é a própria conjuração e cobra a mana.
  const ancora = () => {
    if (ofensivas[0]) return ofensivas[0];
    const rotulo = `Efeito de ${meta.name} (Conjuração vs Esquiva)`;
    const def = { canRoll: true, rollAttr: "conjuracao", targetMode: "target", includeSelf: false, defenseAttr: "esquiva" };
    let nova;
    if (iniciais.length) {
      nova = Object.assign(subAcao(rotulo, def), { _ancora: true });
      encadear(iniciais, nova, "always", "own");
    } else {
      nova = novaAcao(rotulo, { ...def, costMp: String(circ) });
      sys.costs = [];
      iniciais.push(nova);
    }
    sys.actions.push(nova);
    ofensivas.push(nova);
    return nova;
  };
  const { quem, quando } = comoAplicar(meta, escolha);
  // Efeito à parte, em cadeia: em você (sub-ação "em si") ou em quem a magia
  // atingiu. Magia sem alvos (só em você) e efeito "no alvo": vale para os
  // alvos marcados na hora de conjurar.
  const encadearEfeito = (rotulo, extra = {}) => {
    garantirInicial();
    const deAlvo = iniciais.filter((a) => !["self", "none"].includes(a.targetMode));
    const emVoce = quem === "voce";
    const sub = subAcao(`${meta.name}${emVoce ? " (você)" : ""}: ${rotulo}`, {
      targetMode: emVoce ? "self" : "target", includeSelf: emVoce, ...extra,
    });
    sys.actions.push(sub);
    if (emVoce) encadear(iniciais, sub, quando, "own");
    else if (deAlvo.length) encadear(deAlvo, sub, quando, "hitOnly");
    else encadear(iniciais, sub, quando, "own");
    return sub;
  };
  const danosas = () => sys.actions.filter((a) => !deMetamagia(a) && causaDanoDeVida(a));

  switch (meta.kind) {
    case "damage": {
      // A base já causa dano? Troca só o TIPO — e o dano continua como era:
      // escalonado ("Fogo +1") ou fixo ("Energia 1, não escalonável"). Dano
      // final continua final (ignora a Proteção); só o elemento é outro.
      let alguma = false;
      for (const a of sys.actions) {
        if (deMetamagia(a)) continue;
        if (causaDanoDeVida(a)) {
          if (a.damageType !== "final") a.damageType = meta.dtype;
          alguma = true;
        }
        for (const ex of a.extraDamage ?? []) {
          if (ex.formula && (ex.resource ?? "hp") === "hp") ex.type = meta.dtype;
        }
      }
      if (!alguma) {
        // Não causa: ganha dano +1/+2/+3 pelo círculo — o "+" é dano
        // escalonado (base = círculo, +1 a cada 2 acima da defesa).
        const a = ancora();
        if (String(a.damage ?? "").trim() !== "" && (a.damageResource ?? "hp") !== "hp") {
          // A ação já drena PM (Queimar Magia): o dano entra como parcela extra.
          a.extraDamage ??= [];
          a.extraDamage.push({ formula: String(circ), type: meta.dtype, resource: "hp", scaling: true });
        } else {
          a.damage = String(circ);
          a.damageType = meta.dtype;
          a.damageResource = "hp";
          a.scalingDamage = true;
        }
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
    case "selfcond": {
      garantirInicial();
      const sub = subAcao(`${meta.name} (você): fica ${ROTULO_COND[meta.cond] ?? meta.cond} até o fim da cena`, {
        targetMode: "self", includeSelf: true,
        appliesEffects: [novoApplies(meta.name, { fxType: "condition", fxTarget: meta.cond, durationMode: "scene" })],
      });
      sys.actions.push(sub);
      encadear(iniciais, sub, quando, "own");
      break;
    }
    case "area2x":
      // Aplicada mais de uma vez (palavra repetida: majesto + majesto), soma
      // a área da base em vez de dobrar o já dobrado — a regra que o livro dá
      // para a Magia Múltipla: 2× na primeira, 3× na segunda.
      for (const a of sys.actions) {
        if (deMetamagia(a)) continue;
        const regiao = ["area", "aura", "cone", "line", "lineCustom"].includes(a.targetMode);
        if (regiao && a.area && a.area !== "0") {
          a._areaBase ??= a.area;
          a._ampliada = (a._ampliada ?? 0) + 1;
          a.area = `${a._ampliada + 1}*(${a._areaBase})`;
        } else if (a.targetMode === "target") {
          // Magia de alvo vira Área (1m x Círculo x Nível); uma segunda
          // Ampliada dobra essa área.
          a.targetMode = "area";
          a._areaBase = `${circ}*@nivel`;
          a._ampliada = 0;
          a.area = a._areaBase;
        }
      }
      break;
    case "range2x": {
      // Regra da mesa (no lugar do "emanação, aura ou conjurador não são
      // afetadas" do livro): tudo o que tem alcance dobra — inclusive as
      // distâncias de teleporte, empurrão e telecinese —, e uma magia de
      // TOQUE, no PRÓPRIO CONJURADOR ou de EMANAÇÃO passa a ter alcance de
      // 3m x Círculo x Nível e alvo: o toque e o "em você" viram um alvo (o
      // teleporte que levava você leva o alvo), e a emanação sai do alvo —
      // vira uma área posta nele. Aplicada duas vezes, triplica.
      data._dimensional = (data._dimensional ?? 0) + 1;
      const alcance = `${3 * circ}*@nivel`;
      const sufixo = (txt) => `${txt}, alcance ${metrosLegiveis(alcance)}`;
      for (const a of sys.actions) {
        if (deMetamagia(a)) continue; // efeitos das metamagias: só as distâncias (distanciaDaMagia)
        if (a.targetMode === "self") {
          a.targetMode = "target";
          a.includeSelf = false;
          a.isMelee = false;
          a.range = a._alcanceBase = alcance;
          a._dimensional = 0;
          if (a.movement?.enabled && a.movement.who === "self") a.movement.who = "targets";
          a._rotuloDim = { base: a.label, txt: "no alvo" };
          a.label = `${a.label} — ${sufixo("no alvo")}`;
        } else if (a.targetMode === "aura") {
          a.targetMode = "area";
          a.includeSelf = false;
          a.range = a._alcanceBase = alcance;
          a._dimensional = 0;
          a._rotuloDim = { base: a.label, txt: "emanando do alvo" };
          a.label = `${a.label} — ${sufixo("emanando do alvo")}`;
        } else if (a.isMelee) {
          // Toque passa a ter alcance de 3m x Círculo x Nível.
          a.isMelee = false;
          a._alcanceBase = alcance;
          a._dimensional = 0;
          a.range = a._alcanceBase;
        } else if (a.range && a.range !== "0") {
          a._alcanceBase ??= a.range;
          a._dimensional = (a._dimensional ?? 0) + 1;
          a.range = `${a._dimensional + 1}*(${a._alcanceBase})`;
          // A que já tinha virado alvo nesta magia: o rótulo acompanha o alcance.
          if (a._rotuloDim) a.label = `${a._rotuloDim.base} — ${a._rotuloDim.txt}, alcance ${metrosLegiveis(a.range)}`;
        }
        dobrarDistancia(a.movement);
      }
      break;
    }
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
      const ef = efeitoDoBuff(meta, circ, escolha);
      if (ef) encadearEfeito(ef.rotulo, ef.extra);
      break;
    }
    case "planar": {
      const dist = distanciaDaMagia(data, "@mente");
      encadearEfeito(`teleporta ${quem === "voce" ? "você" : "o alvo"} até ${metrosLegiveis(dist)} (terra firme)`, {
        movement: { enabled: true, kind: "teleport", who: quem === "voce" ? "self" : "targets",
                    distance: dist, lateralSide: "right", ignoreWalls: true, snap: true },
      });
      break;
    }
    case "eterea":
      encadearEfeito("fica intangível até o fim da cena", {
        appliesEffects: [novoApplies("Intangível (Magia Etérea)", { fxType: "condition", fxTarget: "intangivel", durationMode: "scene" })],
      });
      break;
    case "restauradora": {
      const cond = CONDICOES_NEGATIVAS[escolha?.condicao] ? escolha.condicao : "dano_continuo";
      encadearEfeito(`neutraliza ${CONDICOES_NEGATIVAS[cond]}`, {
        removesEffects: [{ mode: "condition", value: cond, count: "1", enabled: true }],
      });
      break;
    }
    case "marcador": {
      // Lembrete na aba de efeitos (a forma ou o traço novo é com a mesa),
      // com a duração da cena. No alvo, Vigor oposto à Conjuração anula —
      // fica na ação principal, que é quem rola.
      if (quem === "voce") {
        encadearEfeito("efeito até o fim da cena", {
          appliesEffects: [novoApplies(meta.marcador, { fxType: "bonus", fxTarget: "all", fxValue: "0", durationMode: "scene" })],
        });
      } else {
        const alvo1 = ancora();
        alvo1.appliesEffects ??= [];
        alvo1.appliesEffects.push(novoApplies(meta.marcador, {
          fxType: "bonus", fxTarget: "all", fxValue: "0", durationMode: "scene",
          resist: true, resistAttr: meta.resist || "vigor",
        }));
      }
      break;
    }
    case "telecinetica": {
      const alvo1 = ancora();
      alvo1.appliesEffects ??= [];
      alvo1.appliesEffects.push(novoApplies(`${meta.name}: ${ROTULO_COND[meta.cond] ?? meta.cond}`, {
        fxType: "condition", fxTarget: meta.cond, durationMode: "scene",
        resist: true, resistAttr: meta.resist || "forca",
      }));
      // Nas rodadas seguintes, com a sua ação: não dispara sozinha.
      const dist = distanciaDaMagia(data, "5");
      sys.actions.push(Object.assign(novaAcao(`${meta.name}: mover um alvo até ${metrosLegiveis(dist)} (sua ação)`, {
        canRoll: false, targetMode: "target", includeSelf: false, costMp: "0",
        movement: { enabled: true, kind: "place", who: "targets", distance: dist,
                    lateralSide: "right", ignoreWalls: false, snap: true },
      }), { _interna: true }));
      break;
    }
    case "invisivel": {
      // "Os alvos são considerados indefesos para se defender desta magia":
      // antes da rolagem (ativação prévia, sem rolagem nem CD) eles ficam
      // Indefesos — −3 na Esquiva e sem Bloqueio —, a ação rola, e depois, em
      // cadeia, o efeito é removido pelo nome. Dura 1 rodada por segurança, se
      // a conjuração for cancelada no meio.
      const atacam = sys.actions.filter((a) => !deMetamagia(a) && a.canRoll
        && !["self", "none"].includes(a.targetMode) && (Number(a.costMp || 0) > 0 || a._ancora));
      if (!atacam.length) return `${meta.name}: a magia não rola contra a defesa de um alvo — registrada na receita.`;
      const antes = subAcao(`${meta.name}: alvos indefesos contra esta magia (antes da rolagem)`, {
        targetMode: "target",
        appliesEffects: [novoApplies(ROTULO_INVISIVEL, {
          fxType: "condition", fxTarget: "indefeso", durationMode: "rounds", durationRounds: "1",
        })],
      });
      const depois = subAcao(`${meta.name}: fim do efeito (depois da rolagem)`, {
        targetMode: "target",
        removesEffects: [{ mode: "label", value: ROTULO_INVISIVEL, count: "", enabled: true }],
      });
      antes._semVisual = true;
      depois._semVisual = true;
      sys.actions.push(antes, depois);
      antesDe(atacam, antes);
      encadear(atacam, depois, "always", "same");
      break;
    }
    case "vampirica": {
      const lista = danosas();
      if (!lista.length) return `${meta.name}: a magia não causa dano — não se aplica.`;
      for (const a of lista) a.drain = { enabled: true, resource: "hp", from: "scaling", ratio: "1" };
      break;
    }
    case "potencializada": {
      const lista = danosas();
      if (!lista.length) return `${meta.name}: a magia não causa dano — não se aplica.`;
      for (const a of lista) {
        const base = String(a.damage).trim();
        a.damage = /^\d+$/.test(base) ? String(2 * Number(base)) : `2*(${base})`;
        const sub = subAcao(`${meta.name} (você): sofre ${formulaCurta(base)} de dano final`, {
          targetMode: "self", includeSelf: true,
          damage: base, damageType: "final", damageResource: "hp", scalingDamage: false,
        });
        sys.actions.push(sub);
        encadear([a], sub, "always", "own");
      }
      break;
    }
    case "multipla":
    case "replicante": {
      // "Sua magia atinge o dobro de alvos da magia base" (Múltipla, efeito
      // Alvo) / "tudo o que sua magia cria ou invoca é duplicado, [...] ou
      // uma área de efeito; uma área não pode ocupar o mesmo espaço que a
      // primeira" (Replicante): uma CÓPIA da ação que se usa, disparada em
      // cadeia logo depois dela com o alvo escolhido na hora — o jogo pede
      // que se mire outro alvo, ou que a área seja reposicionada. Não cobra
      // PM e rola por si. O que a ação faz nos alvos dela (cadeias nos
      // atingidos, ativações prévias) ganha uma versão para a cópia; o que
      // vale uma vez por conjuração (em você) fica só na primeira — a
      // cadeia do sistema não roda a mesma ação duas vezes.
      const deArea = (a) => ["area", "line", "cone", "lineCustom"].includes(a.targetMode);
      const servem = iniciais.filter((a) => (meta.kind === "multipla" ? a.targetMode === "target" : deArea(a)));
      if (!servem.length) {
        return meta.kind === "multipla"
          ? `${meta.name}: a magia não é de alvo — não se aplica (registrada na receita).`
          : `${meta.name}: a magia não tem área — o que ela cria ou invoca fica duplicado pela mesa (registrada na receita).`;
      }
      for (const a of servem) {
        a._copias = (a._copias ?? 0) + 1;
        const n = a._copias + 1;
        const qual = meta.kind === "multipla" ? `${n}º alvo` : `${n}ª área`;
        const copia = copiarAcao(a);
        copia.label = `↳ ${meta.name}: ${a.label} — ${qual}`;
        sys.actions.push(copia);
        for (const sub of a._antes ?? []) {
          const s2 = copiarAcao(sub);
          s2.label = `${sub.label} (${qual})`;
          sys.actions.push(s2);
          (copia._antes ??= []).push(s2);
        }
        for (const elo of a._cadeia ?? []) {
          if (elo.targets === "own" || elo.targets === "pick") continue; // por conjuração / outras cópias
          const s2 = copiarAcao(elo.alvo);
          s2.label = `${elo.alvo.label} (${qual})`;
          sys.actions.push(s2);
          (copia._cadeia ??= []).push({ alvo: s2, when: elo.when, targets: elo.targets });
        }
        encadear([a], copia, "always", "pick");
      }
      break;
    }
    default:
      break; // "other": registrada na receita
  }
  if (meta.semDano && danosas().length) return `${meta.name}: não funciona em magia que causa dano (registrada na receita).`;
  return null;
}

/** Cópia de uma ação para a Múltipla / Replicante: sem custo, interna, sem as ligações. */
function copiarAcao(a) {
  const { _antes, _cadeia, _copias, ...resto } = a;
  const c = JSON.parse(JSON.stringify(resto));
  c.costMp = "0";
  c._interna = true;
  return c;
}

/** Distância/alcance em texto: "6*@nivel" → "6m × Nível", "2*(@mente)" → "2 × Mente metros", "10" → "10m". */
function metrosLegiveis(f) {
  const s = String(f ?? "").trim();
  let m;
  if ((m = s.match(/^(\d+)\*@nivel$/))) return `${m[1]}m × Nível`;
  if ((m = s.match(/^(\d+)$/))) return `${m[1]}m`;
  if (s === "@mente") return "Mente metros";
  if ((m = s.match(/^(\d+)\*\((.+)\)$/))) return `${m[1]} × ${metrosLegiveis(m[2])}`;
  return `${formulaCurta(s)} m`;
}

/** "2*@nivel" → "2 × Nível", para os rótulos. */
function formulaCurta(f) {
  return String(f).replace(/\*/g, " × ").replace(/@nivel/g, "Nível").replace(/@(\w+)/g, (_, v) => ATTRS[v] ?? v);
}

/* ------------------------------------------------------------------ */
/*  Construção do item final                                           */
/* ------------------------------------------------------------------ */

/**
 * Monta os dados do item da magia criada.
 * @param {object} state escolhas da oficina
 * @param {object} [opcoes]
 * @param {boolean} [opcoes.animar=true] pôr animações automáticas
 * @param {(chave:string)=>boolean} [opcoes.existe] a animação existe no JB2A
 *   instalado? (padrão: consulta a base do Sequencer)
 */
export async function construirMagia(state, { animar = true, existe = null } = {}) {
  const { base, tier, nome, palavra1, palavra2, palavra3,
          pecs, ajuste, meta2, meta3 } = state;
  const escolha2 = state.escolha2 ?? {};
  const escolha3 = state.escolha3 ?? {};
  const { circ, pm } = TIERS[tier];
  const data = base.toObject();
  const idDaBase = data._id ?? base.id ?? "";
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

  // Metamagias — a da 3ª palavra é aplicada DEPOIS (prevalece em conflito).
  // Palavras podem se repetir (ignis + majesto + majesto). A mesma metamagia
  // duas vezes vale o que o livro diz para a Magia Múltipla: área/alcance
  // triplicam (não dobram o dobrado); condições, efeitos em cadeia e o efeito
  // em você não se aplicam duas vezes.
  const repetida = circ >= 3 && meta2 && meta3 && meta2.name === meta3.name;
  // (A Múltipla duas vezes vale: o triplo de alvos.)
  const UMA_VEZ = ["condition", "selfcond", "buff", "planar", "eterea", "restauradora", "marcador",
                   "telecinetica", "invisivel", "vampirica", "potencializada", "replicante"];
  const avisos = [];
  // As ações que uma metamagia cria levam a palavra dela (para a animação
  // seguir o tema certo: Magia Furtiva de iluzio numa magia de ignis).
  const aplicar = (meta, palavra, escolha) => {
    const antes = new Set(data.system.actions);
    const aviso = aplicarMetamagia(data, meta, circ, escolha);
    if (aviso) avisos.push(aviso);
    for (const a of data.system.actions) if (!antes.has(a)) a._palavra = palavra;
  };
  const fila = [];
  if (circ >= 2 && meta2) fila.push([meta2, palavra2, escolha2]);
  if (circ >= 3 && meta3 && !(repetida && UMA_VEZ.includes(meta3.kind))) fila.push([meta3, palavra3, escolha3]);
  // Ordem de aplicação: primeiro as de dano (entre elas, a da 3ª palavra
  // continua prevalecendo), depois as que dão à magia um ataque contra alvos,
  // depois as demais e por fim as que copiam a ação (Múltipla, Replicante) —
  // assim a Vampírica e a Potencializada já encontram o dano, a Invisível a
  // rolagem contra a defesa, e a cópia leva tudo o que a ação ficou fazendo.
  // A Múltipla e a Replicante copiam a ação pronta, então vêm por último.
  // A forma e o alcance (Ampliada, Dimensional, Vórtica — entre elas, na
  // ordem das palavras) vêm logo depois do dano: os efeitos das outras já
  // nascem com o alcance certo, no alvo certo.
  const prioridade = (m) => (m.kind === "damage" ? 0
    : ["area2x", "range2x", "aura"].includes(m.kind) ? 0.5
      : ["condition", "mpdrain", "telecinetica", "marcador"].includes(m.kind) ? 1
        : ["multipla", "replicante"].includes(m.kind) ? 3 : 2);
  fila.sort((x, y) => prioridade(x[0]) - prioridade(y[0]));
  for (const [m, p, e] of fila) aplicar(m, p, e);
  for (const a of data.system.actions) {
    delete a._areaBase; delete a._ampliada; delete a._alcanceBase; delete a._dimensional; delete a._rotuloDim;
  }

  // Peculiaridade do Toque Vampírico: "o dano escalonado recupera seus pontos
  // de magia, em vez dos pontos de vida" — o dreno passa a devolver PM.
  if (pecsValidas.some((p) => /recupera seus pontos de magia, em vez dos pontos de vida/.test(semAcento(p.texto)))) {
    for (const a of data.system.actions) if (a.drain?.enabled) a.drain.resource = "mp";
  }

  delete data._dimensional;

  // Referências entre as ações: a magia nasce com id próprio (criada com
  // keepId), então as ativações prévias e as ações em cadeia já apontam para
  // o id e o nome definitivos — iguais às opções da ficha do item, que só as
  // mantém marcadas assim.
  data._id = state.id || novoIdDocumento();
  const acoes = data.system.actions;
  for (const a of acoes) {
    a.preActivations = Array.isArray(a.preActivations) ? a.preActivations : [];
    a.chainActions = Array.isArray(a.chainActions) ? a.chainActions : [];
    for (const sub of a._antes ?? []) {
      a.preActivations.push({ ref: refAcao(data._id, acoes.indexOf(sub), data.name), enabled: true });
    }
    for (const elo of a._cadeia ?? []) {
      a.chainActions.push({ ref: refAcao(data._id, acoes.indexOf(elo.alvo), data.name),
                            when: elo.when, targets: elo.targets, enabled: true });
    }
  }
  // Uma base que já dispare as próprias ações passa a apontar para a magia nova.
  normalizarAutoRefs(data, { id: data._id, nome: data.name, ids: [idDaBase], nomes: [base.name] });

  // Receita na descrição
  const linhasPec = pecsValidas.map((p) => `<li>${esc(p.texto)} (${p.mod >= 0 ? "+" : ""}${p.mod})</li>`).join("");
  const linhasApr = aprimorados.map((a) => `<li>${esc(a.texto)}${a.tipo ? "" : " <em>(aplique manualmente)</em>"}</li>`).join("");
  const metas = data.system.metamagics.map((m, i) =>
    `<li><strong>${esc(m.name)}</strong> (${esc(m.wordId)}): ${esc(m.description)}${
      repetida && i === 1 ? " <em>— aplicada pela segunda vez (área/alcance/alvos triplicam; não dobram o dobrado)</em>" : ""}</li>`).join("");
  const palavras = [palavra1, circ >= 2 ? palavra2 : null, circ >= 3 ? palavra3 : null].filter(Boolean);
  // Dano no formato do livro: "+N" é escalonado; sem o "+", fixo.
  const principal = data.system.actions.find((a) => causaDanoDeVida(a));
  let linhaDano = "";
  if (principal) {
    const metaDano = [circ >= 3 ? meta3 : null, circ >= 2 ? meta2 : null].find((m) => m?.kind === "damage");
    const valor = esc(principal.damage);
    if (principal.damageType === "final") {
      const elem = metaDano ? ` de ${DTYPES[metaDano.dtype]}` : "";
      linhaDano = `Dano Final${elem} ${valor} (fixo — ignora a Proteção)`;
    } else {
      const tipo = DTYPES[principal.damageType] ?? principal.damageType;
      linhaDano = principal.scalingDamage ? `${tipo} +${valor} (escalonado)` : `${tipo} ${valor} (fixo, não escalonável)`;
    }
  }
  const comoFunciona = descreverCadeias(data);
  const escolhas = [[meta2, escolha2, circ >= 2], [meta3, escolha3, circ >= 3]]
    .filter(([m, , vale]) => m && vale)
    .map(([m, e]) => ({ metamagia: m.name, ...escolhaLegivel(m, e) }));
  data.system.description = (data.system.description || "") + `
<hr><p><strong>Magia criada — Círculo ${esc(tier)}</strong> (custo ${pm} PM; bônus de peculiaridades: ${delta >= 0 ? "+" : ""}${delta})</p>
<p>Palavras: ${esc(palavras.join(", "))}. Base: ${esc(base.name)}.</p>
${linhaDano ? `<p>Dano: ${linhaDano}.</p>` : ""}
${linhasApr ? `<p>Aprimoramentos do círculo (gratuitos):</p><ul>${linhasApr}</ul>` : ""}
${linhasPec ? `<p>Peculiaridades escolhidas:</p><ul>${linhasPec}</ul>` : ""}
${metas ? `<p>Metamagias:</p><ul>${metas}</ul>` : ""}
${escolhas.some((e) => e.texto) ? `<p>Como as metamagias foram escolhidas: ${escolhas.filter((e) => e.texto).map((e) => `<strong>${esc(e.metamagia)}</strong> — ${esc(e.texto)}`).join("; ")}.</p>` : ""}
${comoFunciona}
${avisos.length ? `<p><em>${avisos.map(esc).join(" ")}</em></p>` : ""}`;

  // Receita estruturada (para consulta ou reconstrução futura)
  data.flags ??= {};
  data.flags[MODULE_ID] = {
    receita: {
      tier, palavras, base: base.name, bonus: delta,
      peculiaridades: pecsValidas.map((p) => ({ texto: p.texto, mod: p.mod })),
      metamagias: data.system.metamagics.map((m) => m.name),
      escolhas: escolhas.map(({ texto, ...resto }) => resto),
    },
  };

  // Animações que combinem com o que a magia ficou fazendo. As automáticas
  // que vieram da base são refeitas (a forma pode ter mudado: alvo → área);
  // as que você puxou ou digitou ficam como estão. As ações que só deixam os
  // alvos indefesos por um instante e as que tiram o efeito depois não têm o
  // que mostrar.
  if (animar) animarMagia(data, { existe: existe ?? criarVerificador() });
  else limparAnimacoesAutomaticas(data);
  for (const a of data.system.actions) {
    if (a._semVisual) {
      if (a.aaConfig?.metaData?.origem === MODULE_ID) { a.aaConfig = null; a.aaName = ""; }
      for (const e of a.appliesEffects ?? []) {
        if (e.fxAaConfig?.metaData?.origem === MODULE_ID) { e.fxAaConfig = null; e.fxAaName = ""; }
      }
    }
    delete a._palavra; delete a._antes; delete a._cadeia; delete a._interna; delete a._semVisual; delete a._ancora;
    delete a._copias;
    if (a.movement) { delete a.movement._distBase; delete a.movement._dimensional; }
  }

  return data;
}

/** O que o jogador escolheu numa metamagia, legível e estruturado. */
function escolhaLegivel(meta, escolha = {}) {
  const out = {};
  const partes = [];
  if (meta.alvoOuVoce || meta.kind === "selfcond") {
    const { quem } = comoAplicar(meta, escolha);
    out.quem = quem;
    partes.push(quem === "voce" ? "em você" : "no alvo");
  }
  if (encadeia(meta, comoAplicar(meta, escolha))) {
    const { quando } = comoAplicar(meta, escolha);
    out.quando = quando;
    partes.push(`dispara: ${QUANDO[quando].toLowerCase()}`);
  }
  if (meta.needs === "condicao") {
    out.condicao = CONDICOES_NEGATIVAS[escolha.condicao] ? escolha.condicao : "dano_continuo";
    partes.push(`neutraliza ${CONDICOES_NEGATIVAS[out.condicao]}`);
  }
  if (meta.needs === "damageType") { out.damageType = escolha.damageType || "fogo"; partes.push(`contra ${DTYPES[out.damageType]}`); }
  if (meta.needs === "attr") { out.attr = escolha.attr || "forca"; partes.push(`em ${ATTRS[out.attr]}`); }
  if (meta.needs === "bonusTarget") { out.bonusTarget = escolha.bonusTarget || "attack"; partes.push(`em ${BONUS_TARGETS[out.bonusTarget]}`); }
  return { ...out, texto: partes.join(", ") };
}

const ROTULO_ALVOS_CADEIA = { same: "nos mesmos alvos", hitOnly: "em quem foi atingido", own: "", pick: "com o alvo escolhido na hora" };
const QUANDO_CURTO = { always: "sempre", hit: "se acertar", damage: "se causar dano", crit: "se for crítico", miss: "se errar", heal: "se curar" };

/**
 * "Como a magia funciona": o que cada ação usada dispara antes da rolagem e
 * em cadeia, depois dela — vai na descrição da magia criada.
 */
export function descreverCadeias(data) {
  const acoes = data?.system?.actions ?? [];
  const id = data?._id ?? "";
  const linhas = [];
  acoes.forEach((a) => {
    const pre = (a.preActivations ?? []).map((p) => lerRef(p.ref)).filter((r) => r.tipo === "action" && r.id === id);
    const cad = (a.chainActions ?? []).filter((c) => lerRef(c.ref).id === id);
    if (!pre.length && !cad.length) return;
    const custo = Number(a.costMp || 0) ? ` (cobra ${a.costMp} PM)` : "";
    const partes = [];
    if (pre.length) partes.push(`antes da rolagem: ${pre.map((r) => esc(acoes[r.indice]?.label?.replace(/^↳\s*/, "") ?? "?")).join("; ")}`);
    if (cad.length) {
      partes.push(`depois, em cadeia: ${cad.map((c) => {
        const alvo = acoes[lerRef(c.ref).indice];
        const quando = QUANDO_CURTO[c.when] ?? c.when ?? "";
        const onde = ROTULO_ALVOS_CADEIA[c.targets] ? `, ${ROTULO_ALVOS_CADEIA[c.targets]}` : "";
        return `${esc(alvo?.label?.replace(/^↳\s*/, "") ?? "?")} (${quando}${onde})`;
      }).join("; ")}`);
    }
    linhas.push(`<li><strong>${esc(a.label)}</strong>${custo} — ${partes.join("; ")}.</li>`);
  });
  if (!linhas.length) return "";
  return `<p><strong>Como a magia funciona:</strong> use a ação principal; o que as metamagias acrescentam dispara sozinho, sem custo extra de PM (as ações marcadas com ↳ não se usam à parte — as que vêm em cadeia nem aparecem com botão na ficha).</p><ul>${linhas.join("")}</ul>`;
}

/** Uma linha explicando o que a metamagia faz na magia criada (janela). */
const EXPLICACAO = {
  buff: (m, c) => `Dispara em cadeia depois da ação principal (${QUANDO[c.quando].toLowerCase()}), ${c.quem === "voce" ? "em você" : "em quem a magia atingiu"} — sem custo extra de PM.`,
  selfcond: (m, c) => `Em você, em cadeia depois da ação principal (${QUANDO[c.quando].toLowerCase()}) — sem custo extra de PM.`,
  planar: (m, c) => `Teleporte em cadeia (${QUANDO[c.quando].toLowerCase()}): ${c.quem === "voce" ? "você escolhe para onde vai" : "você escolhe para onde vai cada alvo atingido"}, até Mente metros — sem custo extra de PM.`,
  eterea: (m, c) => `Intangível até o fim da cena, em cadeia (${QUANDO[c.quando].toLowerCase()}) — sem custo extra de PM.`,
  restauradora: (m, c) => `Em cadeia (${QUANDO[c.quando].toLowerCase()}): tira da aba de efeitos ${c.quem === "voce" ? "sua" : "do alvo"} um efeito com a condição escolhida.`,
  marcador: (m, c) => (c.quem === "voce"
    ? `Em você, em cadeia (${QUANDO[c.quando].toLowerCase()}): um lembrete na aba de efeitos até o fim da cena; a mudança em si é com a mesa.`
    : "No alvo, com Vigor oposto à Conjuração (anula): um lembrete na aba de efeitos até o fim da cena; a mudança em si é com a mesa."),
  telecinetica: () => "Imobiliza (Força anula) e a magia ganha a ação de mover um alvo até 5m, para usar com a sua ação enquanto durar.",
  invisivel: () => "Antes da rolagem, os alvos ficam Indefesos (−3 na Esquiva, sem Bloqueio), sem rolagem nem CD; depois do ataque, o efeito sai sozinho.",
  vampirica: () => "A ação ganha dreno: você recupera PV igual ao dano escalonado que de fato passar.",
  potencializada: () => "Dobra o dano base; em cadeia, ao conjurar, você sofre o dano base como dano final.",
  range2x: () => "Dobra o alcance e as distâncias (teleporte, empurrão, telecinese). Toque, \"em você\" e emanação viram alvo a 3m × Círculo × Nível; a emanação sai do alvo (posicione a área nele).",
  multipla: () => "Depois do primeiro alvo, o jogo pede o próximo: mire outro alvo e confirme (ou pule). Sem custo extra de PM; cada alvo tem a sua rolagem e recebe os efeitos da magia.",
  replicante: () => "Numa magia de área, depois da primeira o jogo pede a segunda: reposicione a área sem sobrepor a primeira. Sem custo extra de PM. Criações e invocações duplicadas ficam com a mesa.",
};

/** Metamagias que dão à magia um ataque contra alvos, quando ela não tem. */
const CRIAM_ATAQUE = ["damage", "condition", "mpdrain", "telecinetica"];

/** Aviso da janela: a metamagia escolhida não tem efeito nesta magia? */
function avisoDaMetamagia(meta, { base = null, outra = null } = {}) {
  if (!base) return "";
  const acoes = base.system?.actions ?? [];
  const danoDepois = acoes.some((a) => causaDanoDeVida(a)) || outra?.kind === "damage";
  if (meta.comDano && !danoDepois) return "esta magia não causa dano: a metamagia não terá efeito (combine com uma metamagia de dano).";
  if (meta.semDano && danoDepois) return "esta metamagia não funciona em magia que causa dano.";
  const viraArea = ["area2x", "aura"].includes(outra?.kind);
  if (meta.kind === "multipla" && (viraArea || !acoes.some((a) => a.targetMode === "target"))) {
    return "a Magia Múltipla vale para magias de alvo: esta não tem uma ação contra um alvo.";
  }
  if (meta.kind === "invisivel") {
    const rola = acoes.some((a) => a.canRoll && !["self", "none"].includes(a.targetMode)) || CRIAM_ATAQUE.includes(outra?.kind);
    if (!rola) return "esta magia não rola contra a defesa de um alvo: não há de quem a Magia Invisível esconder o efeito.";
  }
  return "";
}

/* ------------------------------------------------------------------ */
/*  A janela da oficina                                                */
/* ------------------------------------------------------------------ */

export class SpellForgeApp extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "ligeia-spellforge-{id}",
    classes: ["ligeia-spellforge"],
    window: { title: "Criação de Magias — Ligeia", icon: "fa-solid fa-wand-sparkles" },
    position: { width: 620, height: "auto" },
  };

  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    // Estado da oficina. Não pode se chamar "state": em ApplicationV2 esse
    // nome é um getter (estado de renderização) e atribuir a ele quebra.
    this.forja = {
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
    this.bases = this.forja.palavra1 ? await magiasBase(this.forja.palavra1) : [];
    if (!this.bases.find((b) => b.id === this.forja.baseId)) this.forja.baseId = "";
  }

  #opcoes(lista, atual, vazio) {
    const o = [`<option value="">${vazio}</option>`];
    for (const [v, rot] of lista) {
      o.push(`<option value="${esc(v)}" ${v === atual ? "selected" : ""}>${esc(rot)}</option>`);
    }
    return o.join("");
  }

  #metamagiaBloco(n, palavra, metaIdx, escolha, contexto = {}) {
    if (!palavra) return `<p class="dica">Escolha a ${n}ª palavra arcana para ver as metamagias dela.</p>`;
    const lista = METAMAGIAS[palavra] ?? [];
    if (!lista.length) return `<p class="dica">Sem metamagias catalogadas para <b>${esc(palavra)}</b>.</p>`;
    const sel = lista[metaIdx];
    const radios = lista.map((m, i) => `
      <label class="meta-opt"><input type="radio" name="meta${n}" value="${i}" ${i === metaIdx ? "checked" : ""}>
        <b>${esc(m.name)}</b> <em>(${esc(m.lvl)})</em><br><span>${esc(m.desc)}</span></label>`).join("");
    const extra = [];
    if (sel?.needs === "damageType") {
      extra.push(`<label>Tipo de dano protegido: <select name="escolha${n}-damageType">${
        this.#opcoes(Object.entries(DTYPES), escolha.damageType || "fogo", "—")}</select></label>`);
    } else if (sel?.needs === "attr") {
      extra.push(`<label>Atributo: <select name="escolha${n}-attr">${
        this.#opcoes(Object.entries(ATTRS), escolha.attr || "forca", "—")}</select></label>`);
    } else if (sel?.needs === "bonusTarget") {
      extra.push(`<label>Bônus em: <select name="escolha${n}-bonusTarget">${
        this.#opcoes(Object.entries(BONUS_TARGETS), escolha.bonusTarget || "attack", "—")}</select></label>`);
    } else if (sel?.needs === "condicao") {
      extra.push(`<label>Condição neutralizada: <select name="escolha${n}-condicao">${
        this.#opcoes(Object.entries(CONDICOES_NEGATIVAS), escolha.condicao || "dano_continuo", "—")}</select></label>`);
    }
    const como = comoAplicar(sel, escolha);
    if (sel?.alvoOuVoce) {
      extra.push(`<label>Em quem: <select name="escolha${n}-quem">${
        this.#opcoes([["alvo", "No alvo da magia"], ["voce", "Em você"]], como.quem, "—")}</select></label>`);
    }
    if (encadeia(sel, como)) {
      extra.push(`<label>Quando dispara: <select name="escolha${n}-quando">${
        this.#opcoes(Object.entries(QUANDO), como.quando, "—")}</select></label>`);
    }
    const explica = sel ? EXPLICACAO[sel.kind]?.(sel, como) : "";
    const aviso = sel ? avisoDaMetamagia(sel, contexto) : "";
    return radios
      + (extra.length ? `<div class="meta-extra">${extra.join("")}</div>` : "")
      + (explica ? `<p class="dica">${esc(explica)}</p>` : "")
      + (aviso ? `<p class="aviso">⚠ ${esc(aviso)}</p>` : "");
  }

  async _renderHTML() {
    await this.carregarBases();
    const s = this.forja;
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
    // Todas as palavras da ficha em cada seletor: as palavras podem se repetir.
    const optPal = (atual) => this.#opcoes(
      [...this.palavras.entries()]
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
        .ligeia-spellforge .aviso { color: var(--color-level-warning, #c80); font-size: 0.92em; margin: 2px 0; }
        .ligeia-spellforge .meta-extra { display: flex; gap: 10px; flex-wrap: wrap; margin: 4px 0; }
        .ligeia-spellforge .meta-extra > label { flex: 1 1 170px; }
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
            <select name="palavra1" ${semPalavras ? "disabled" : ""}>${optPal(s.palavra1)}</select>
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
        <p class="dica">As palavras podem se repetir (ex.: ignis + majesto + majesto).</p>
        <label>Segunda palavra arcana
          <select name="palavra2">${optPal(s.palavra2)}</select></label>
        ${this.#metamagiaBloco(2, s.palavra2, s.meta2i, s.escolha2, { base, outra: circ >= 3 ? (METAMAGIAS[s.palavra3] ?? [])[s.meta3i] : null })}
      </fieldset>` : ""}
      ${circ >= 3 ? `
      <fieldset><legend>4 · Terceira palavra e metamagia (prevalece em conflito)</legend>
        <label>Terceira palavra arcana
          <select name="palavra3">${optPal(s.palavra3)}</select></label>
        ${this.#metamagiaBloco(3, s.palavra3, s.meta3i, s.escolha3, { base, outra: (METAMAGIAS[s.palavra2] ?? [])[s.meta2i] })}
      </fieldset>` : ""}
      <fieldset><legend>Nome e resumo</legend>
        <label>Nome da nova magia
          <input type="text" name="nome" value="${esc(s.nome)}" placeholder="${esc(base ? `${base.name} (${s.tier})` : "")}"></label>
        <div class="resumo">
          Custo: <b>${pm} PM</b> · Bônus de Conjuração: <b>${soma >= 0 ? "+" : ""}${soma}</b>
          ${circ >= 2 ? ` · Metamagia 2: <b>${esc((METAMAGIAS[s.palavra2] ?? [])[s.meta2i]?.name ?? "—")}</b>` : ""}
          ${circ >= 3 ? ` · Metamagia 3: <b>${esc((METAMAGIAS[s.palavra3] ?? [])[s.meta3i]?.name ?? "—")}</b>` : ""}
          ${circ >= 3 && s.palavra2 && s.palavra2 === s.palavra3 && s.meta2i >= 0 && s.meta2i === s.meta3i
            ? `<br><em>A mesma metamagia duas vezes: área/alcance/alvos triplicam (não dobram o dobrado).</em>` : ""}
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
    const s = this.forja;
    const on = (sel, ev, fn) => root.querySelectorAll(sel).forEach((n) => n.addEventListener(ev, fn));
    on('select[name=tier]', "change", (e) => { s.tier = e.target.value; this.render(); });
    on('select[name=palavra1]', "change", (e) => {
      s.palavra1 = e.target.value; s.baseId = ""; s.pecsMarcadas.clear();
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
      this.render();
    });
    on('select[name=palavra3]', "change", (e) => { s.palavra3 = e.target.value; s.meta3i = -1; s.escolha3 = {}; this.render(); });
    on('input[name=meta2]', "change", (e) => { s.meta2i = Number(e.target.value); s.escolha2 = {}; this.render(); });
    on('input[name=meta3]', "change", (e) => { s.meta3i = Number(e.target.value); s.escolha3 = {}; this.render(); });
    for (const n of [2, 3]) {
      for (const campo of ["damageType", "attr", "bonusTarget", "condicao", "quando"]) {
        on(`select[name=escolha${n}-${campo}]`, "change", (e) => {
          (n === 2 ? s.escolha2 : s.escolha3)[campo] = e.target.value;
        });
      }
      // Trocar em quem muda o padrão de quando dispara (você: sempre; alvo: se acertar).
      on(`select[name=escolha${n}-quem]`, "change", (e) => {
        const esc2 = n === 2 ? s.escolha2 : s.escolha3;
        esc2.quem = e.target.value;
        delete esc2.quando;
        this.render();
      });
    }
    on('input[name=nome]', "input", (e) => { s.nome = e.target.value; });
    on('[data-action=cancelar]', "click", () => this.close());
    on('[data-action=criar]', "click", () => this.criar());
  }

  async criar() {
    const s = this.forja;
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
    }, { animar: animacoesLigadas() });
    // keepId: as ações em cadeia já apontam para o id que a magia vai ter.
    const [item] = await this.actor.createEmbeddedDocuments("Item", [data], { keepId: true });
    const nAnim = contarAnimacoesAutomaticas(data);
    ui.notifications.info(`Magia criada: ${item.name} (${s.tier}, ${TIERS[s.tier].pm} PM)${
      nAnim ? ` — com ${nAnim} animaç${nAnim > 1 ? "ões" : "ão"} automática${nAnim > 1 ? "s" : ""} (remova pelo ✕ na ficha do item, se quiser)` : ""}.`);
    this.close();
    item.sheet?.render(true);
  }
}

export function abrirCriacaoDeMagia(actor) {
  actor ??= canvas.tokens?.controlled[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("Selecione um personagem.");
  const app = new SpellForgeApp(actor);
  app.render({ force: true });
  return app;
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

/** A configuração "Animações automáticas nas magias criadas" está ligada? */
function animacoesLigadas() {
  try { return game.settings.get(MODULE_ID, "animacoesAutomaticas") !== false; }
  catch (e) { return true; } // configuração ainda não registrada
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "animacoesAutomaticas", {
    name: "Animações automáticas nas magias criadas e nos itens encantados",
    hint: "A Criação de Magias e o Encantamento de Itens escolhem uma animação do Automated Animations (JB2A) "
      + "que combine com cada ação e com cada condição do que foi criado. Ela fica guardada como animação puxada: "
      + "na ficha do item, ●/○ desliga, ✕ remove e \"limpar animações\" tira todas. Desmarcado, as magias "
      + "criadas e as propriedades encantadas saem sem animação.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
});

Hooks.once("ready", () => {
  // O Encantamento de Itens também pendura funções aqui: soma, não troca.
  const mod = game.modules.get(MODULE_ID);
  mod.api = Object.assign(mod.api ?? {}, {
    abrirCriacaoDeMagia, METAMAGIAS, animarMagia, animarItem, limparAnimacoesAutomaticas,
  });
  console.log("Ligeia — Livro do Jogador | Criação de Magias pronta (botão na ficha).");
});
