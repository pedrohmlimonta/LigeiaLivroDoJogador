/**
 * LIGEIA — REFERÊNCIAS ENTRE AÇÕES (Livro do Jogador)
 * ===========================================================================
 * As ativações prévias e as ações em cadeia do sistema (build 27) apontam
 * para outra ação com um texto "action|idDoItem|índice|nome". O sistema acha
 * o alvo pelo id e, sem ele, pelo nome — mas o select da ficha do item só
 * marca a opção cujo texto é IGUAL ao guardado (o id e o nome atuais). Com o
 * id velho ou vazio nada aparece marcado, e a ficha, que salva a cada
 * mudança, grava o select vazio por cima: a cadeia some na primeira edição.
 *
 * Por isso este arquivo:
 *   - monta as referências no formato exato (refAcao);
 *   - acerta as referências de um item PARA ELE MESMO (a magia criada que
 *     dispara as próprias ações antes ou em cadeia) quando o item chega numa
 *     ficha com id novo (cópia, compêndio) ou muda de nome.
 * Referências para OUTROS itens (as ações ✦ dos itens conjuradores) são
 * acertadas pelo encantamento.mjs.
 *
 * Este arquivo não depende do Foundry para as funções puras (testes em Node).
 */

export const MODULE_ID = "ligeia-livro-do-jogador";

const limparNome = (n) => String(n ?? "").replace(/\|/g, "/");

/** Referência de ação no formato do sistema (buildPreActivationRef). */
export function refAcao(id, indice, nome) {
  return ["action", id ?? "", Number(indice) || 0, limparNome(nome)].join("|");
}

/** Lê "tipo|id|índice|nome" (parsePreActivation do sistema). */
export function lerRef(ref) {
  const [tipo = "", id = "", indice = "", ...resto] = String(ref ?? "").split("|");
  return { tipo, id, indice: Number(indice) || 0, nome: resto.join("|") };
}

/** Id de documento do Foundry (16 letras e números), para criar com keepId. */
export function novoIdDocumento() {
  const doFoundry = globalThis.foundry?.utils?.randomID?.(16);
  if (typeof doFoundry === "string" && /^[A-Za-z0-9]{16}$/.test(doFoundry)) return doFoundry;
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < 16; i++) s += letras[Math.floor(Math.random() * letras.length)];
  return s;
}

/** Cada elo (ativação prévia ou cadeia) das ações de um item. */
export function* elosDoItem(sys) {
  for (const [i, a] of (sys?.actions ?? []).entries()) {
    for (const elo of a?.preActivations ?? []) if (elo) yield { acao: i, elo, tipo: "pre" };
    for (const elo of a?.chainActions ?? []) if (elo) yield { acao: i, elo, tipo: "cadeia" };
  }
}

/**
 * O elo aponta para o próprio item? (pelo id ou pelo nome dele, atuais ou
 * antigos). `tipos`: "action" (uma ação do item) e, para acertar o id,
 * também "item" — o "Vestir" das armaduras liga o próprio item.
 */
function ehAutoRef(r, ids, nomes, tipos = ["action"]) {
  return tipos.includes(r.tipo) && (ids.has(r.id) || nomes.has(limparNome(r.nome)));
}

const conjuntos = ({ id, nome, ids = [], nomes = [] }) => ({
  ids: new Set([id, ...ids].filter(Boolean)),
  nomes: new Set([nome, ...nomes].filter(Boolean).map(limparNome)),
});

/**
 * Aponta as referências do item para ELE MESMO com o id e o nome atuais
 * (mutação in-place em `data.system.actions`).
 * @param {object} data   dados do item (ou só { system: { actions } })
 * @param {object} quem   { id, nome } atuais e, se houver, ids/nomes antigos
 * @returns {number} quantas referências mudaram
 */
export function normalizarAutoRefs(data, quem) {
  const { ids, nomes } = conjuntos(quem);
  let n = 0;
  for (const { elo } of elosDoItem(data?.system)) {
    const r = lerRef(elo.ref);
    if (!ehAutoRef(r, ids, nomes, ["action", "item"])) continue;
    const certa = r.tipo === "item"
      ? ["item", quem.id ?? "", 0, limparNome(quem.nome)].join("|")
      : refAcao(quem.id, r.indice, quem.nome);
    if (elo.ref !== certa) { elo.ref = certa; n++; }
  }
  return n;
}

/**
 * Índices das ações que o próprio item dispara (antes da rolagem ou em
 * cadeia) — as "internas", que não se usam sozinhas.
 * @returns {Set<number>}
 */
export function acoesDisparadas(data, quem) {
  const { ids, nomes } = conjuntos(quem);
  const out = new Set();
  for (const { elo } of elosDoItem(data?.system)) {
    const r = lerRef(elo.ref);
    if (ehAutoRef(r, ids, nomes)) out.add(r.indice);
  }
  return out;
}

/**
 * Acerta as auto-referências de um documento de item já criado.
 * @returns {Promise<number>}
 */
export async function acertarAutoRefs(item, { ids = [], nomes = [] } = {}) {
  if (!item || item.pack || !Array.isArray(item.system?.actions) || !item.system.actions.length) return 0;
  const acoes = JSON.parse(JSON.stringify(item.system.actions));
  const n = normalizarAutoRefs({ system: { actions: acoes } }, { id: item.id, nome: item.name, ids, nomes });
  if (n) await item.update({ "system.actions": acoes });
  return n;
}

/* ------------------------------------------------------------------ */
/*  Ganchos: item chegou numa ficha (id novo) ou mudou de nome          */
/* ------------------------------------------------------------------ */
// Quem fez a mudança é quem acerta (os ganchos rodam em todos os clientes).
const fuiEu = (userId) => userId === globalThis.game?.user?.id;

globalThis.Hooks?.on("createItem", (item, options, userId) => {
  if (!fuiEu(userId)) return;
  acertarAutoRefs(item).catch((e) => console.warn("Ligeia — Livro do Jogador | referências das ações:", e));
});

globalThis.Hooks?.on("preUpdateItem", (item, mudancas, options) => {
  if (mudancas && "name" in mudancas && options) options.ligeiaNomeAntigo = item.name;
});

globalThis.Hooks?.on("updateItem", (item, mudancas, options, userId) => {
  if (!fuiEu(userId) || !mudancas || !("name" in mudancas)) return;
  acertarAutoRefs(item, { nomes: [options?.ligeiaNomeAntigo] })
    .catch((e) => console.warn("Ligeia — Livro do Jogador | referências das ações:", e));
});
