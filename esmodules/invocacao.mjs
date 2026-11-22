/**
 * LIGEIA — INVOCAÇÃO DE CRIATURAS (Livro do Jogador)
 * ===========================================================================
 * Desde o build 30, uma ação do sistema pode invocar criaturas: arrasta-se a
 * ficha para a ação, na ficha do item, e ao usar a ação escolhe-se no mapa,
 * dentro do alcance, onde cada token aparece.
 *
 * As magias e itens do compêndio que invocam (Invocar Animais, Invocar
 * Plantas, Invocar, a estatueta de Invocação Animal) não têm como saber QUAL
 * ficha é a sua: a ação vem com um MARCADOR — uma entrada sem ficha cujo nome
 * diz o que cabe ali ("Fera pequena, Desafio até 2× Nível — arraste a ficha
 * abaixo"), já com a quantidade, a atitude e a duração certas (a Criação de
 * Magias ajusta tudo isso: tamanho, Desafio, Replicante, "não é amigável a
 * ninguém"...). Este arquivo:
 *
 *   1. quando uma ficha é arrastada para uma ação que tem marcador, põe a
 *      ficha NO marcador (a soltura do sistema acrescentaria uma entrada nova,
 *      com quantidade 1 e atitude padrão, e o marcador ficaria sobrando);
 *   2. ao usar, na ficha do personagem, uma ação que só tem marcadores, avisa
 *      que falta arrastar a ficha da criatura (sem ela o sistema não invoca
 *      nada).
 */

const MODULE_ID = "ligeia-livro-do-jogador";

/** Entrada de invocação sem ficha: o marcador do que cabe ali. */
export const ehMarcador = (x) => !!x && !String(x.actorUuid ?? "").trim();

/** A ação só tem marcadores (ligados) — nenhuma ficha para invocar ainda? */
export function faltaFicha(acao) {
  const ligadas = (acao?.summons ?? []).filter((x) => x && x.enabled !== false);
  return ligadas.length > 0 && ligadas.every(ehMarcador);
}

/** "Fera pequena, Desafio até 2× Nível — arraste a ficha abaixo" → "Fera pequena, Desafio até 2× Nível". */
export const requisitoDoMarcador = (x) => String(x?.actorName ?? "").replace(/\s+—\s+arraste a ficha.*$/i, "").trim();

/**
 * Encaixa nos marcadores as fichas que a soltura do sistema acrescentou.
 *
 * A soltura grava a lista de ações inteira com UMA entrada a mais no fim das
 * invocações da ação. Se essa ação tinha um marcador, a ficha nova vai para o
 * primeiro marcador (que mantém a quantidade, a atitude, a duração, o
 * controle e o "oculta" dele) e a entrada acrescentada sai.
 *
 * @param {object[]} antes   system.actions atuais do item
 * @param {object[]} depois  system.actions da atualização (mutado no lugar)
 * @returns {string[]} nomes das fichas encaixadas
 */
export function encaixarNosMarcadores(antes, depois) {
  const encaixadas = [];
  if (!Array.isArray(antes) || !Array.isArray(depois)) return encaixadas;
  depois.forEach((acao, i) => {
    const velhas = antes[i]?.summons;
    const novas = acao?.summons;
    if (!Array.isArray(velhas) || !Array.isArray(novas) || novas.length !== velhas.length + 1) return;
    // As primeiras são as de antes, na mesma ordem (só uma entrou, no fim).
    if (!velhas.every((v, k) => String(v?.actorUuid ?? "") === String(novas[k]?.actorUuid ?? ""))) return;
    const nova = novas[novas.length - 1];
    if (!nova?.actorUuid || velhas.some((v) => v?.actorUuid === nova.actorUuid)) return;
    // Só um marcador ligado: o desligado (○) foi posto de lado de propósito.
    const k = novas.slice(0, -1).findIndex((x) => ehMarcador(x) && x.enabled !== false);
    if (k < 0) return;
    novas[k] = { ...novas[k], actorUuid: nova.actorUuid, actorName: nova.actorName || novas[k].actorName };
    novas.pop();
    encaixadas.push(nova.actorName || "criatura");
  });
  return encaixadas;
}

/** Hook preUpdateItem: a ficha arrastada ocupa o marcador. */
export function aoAtualizarItem(item, mudancas) {
  const depois = mudancas?.system?.actions ?? mudancas?.["system.actions"];
  if (!Array.isArray(depois)) return;
  const antes = item?.system?.actions;
  const nomes = encaixarNosMarcadores(antes, depois);
  if (nomes.length) {
    globalThis.ui?.notifications?.info(`${nomes.join(", ")}: no lugar do marcador da criatura (quantidade, atitude e duração dele).`);
  }
}

/**
 * Ficha do personagem: usar uma ação que só tem marcadores avisa que falta
 * a ficha. A ação segue normalmente (o resto dela — custo, rolagem — vale).
 */
export function ligarNaFicha(app, html) {
  const HE = globalThis.HTMLElement;
  const el = HE && app?.element instanceof HE ? app.element : (html?.[0] ?? html);
  if (!el?.addEventListener || el.dataset?.ligeiaInvocacao) return;
  el.dataset.ligeiaInvocacao = "1";
  el.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.('[data-action="itemRoll"]');
    if (!btn) return;
    const actor = app.document ?? app.actor;
    const item = actor?.items?.get(btn.closest("[data-item-id]")?.dataset?.itemId);
    const acao = item?.system?.actions?.[Number(btn.dataset.actionIndex ?? 0)];
    if (!faltaFicha(acao)) return;
    const quais = acao.summons.filter((x) => x && x.enabled !== false).map(requisitoDoMarcador).join("; ");
    globalThis.ui?.notifications?.warn(
      `${item.name}: falta a ficha da criatura (${quais}). Arraste-a para a ação, na ficha do item — sem ela, nada é invocado.`,
      { permanent: false },
    );
  }, true);
}

globalThis.Hooks?.on?.("preUpdateItem", (item, mudancas) => aoAtualizarItem(item, mudancas));
globalThis.Hooks?.on?.("renderActorSheetV2", ligarNaFicha);
globalThis.Hooks?.on?.("renderActorSheet", ligarNaFicha);
globalThis.Hooks?.once?.("ready", () => {
  const mod = globalThis.game?.modules?.get(MODULE_ID);
  if (mod) mod.api = Object.assign(mod.api ?? {}, { encaixarNosMarcadores, faltaFicha });
});
