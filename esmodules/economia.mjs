/**
 * LIGEIA — ECONOMIA DE AÇÕES (Livro do Jogador)
 * ===========================================================================
 * O sistema (build 31) conta, por rodada, 1 ação padrão, 1 de movimento, 1
 * simples (a "ação rápida" do livro), 1 reação e as livres à vontade — tudo
 * opcional, ligado pelo Narrador. O compêndio diz o que cada ação gasta; este
 * arquivo cuida de dois detalhes que acontecem na mesa:
 *
 *   1. MOVIMENTO FORÇADO não é deslocamento. Quando uma ação move o token
 *      (teleporte, empurrão, telecinese — o sistema marca a atualização com
 *      `ligeiaForced`), quem pagou foi a ação: o Teletransporte já gastou o
 *      movimento, o Teleporte Faérian também. Sem isto o sistema cobraria o
 *      deslocamento de novo, como se o personagem tivesse andado.
 *
 *   2. AÇÕES NA HORA. "Gaste 1 PM para fazer um movimento adicional" (Movimento
 *      Rápido), "um turno adicional" (Aceleração), "uma reação adicional"
 *      (Reflexos Rápidos), "um ataque adicional" (Veloz): a ação do item põe
 *      o efeito de +1 na rodada — que só aumenta o MÁXIMO — e aqui a ação
 *      volta ao estoque na hora, para ser usada ainda nesta rodada.
 */

const MODULE_ID = "ligeia-livro-do-jogador";
const SISTEMA = "ligeia-rpg";

/* ------------------------------------------------------------------ */
/*  1) Movimento forçado                                               */
/* ------------------------------------------------------------------ */

/**
 * preUpdateToken: o sistema guarda de onde o token saiu para cobrar o
 * deslocamento; num movimento forçado por uma ação, tira essa marca — sem
 * ela, a distância cobrada é zero.
 */
export function naoCobrarMovimentoForcado(tokenDoc, changed, options) {
  if (options?.ligeiaForced) delete options.ligeiaMoveFrom;
}

/* ------------------------------------------------------------------ */
/*  2) Ações na hora                                                   */
/* ------------------------------------------------------------------ */

/** Rótulo da ação → as ações que voltam ao estoque depois de usada. */
export const ACOES_NA_HORA = [
  [/^✦\s*Aceleração\b/i, ["standard", "movement", "simple"]],
  [/^✦\s*Movimento Rápido\b/i, ["movement"]],
  [/^✦\s*Reflexos Rápidos\b/i, ["reaction"]],
  [/^✦\s*Veloz\b/i, ["standard"]],
];

/** As ações que esta ação devolve na hora (ou []). */
export function acoesNaHora(acao) {
  const rotulo = String(acao?.label ?? "");
  return ACOES_NA_HORA.find(([re]) => re.test(rotulo))?.[1] ?? [];
}

const pendentes = [];

/** Ficha do personagem: o clique na ação marca a devolução. */
export function ligarNaFicha(app, html) {
  const HE = globalThis.HTMLElement;
  const el = HE && app?.element instanceof HE ? app.element : (html?.[0] ?? html);
  if (!el?.addEventListener || el.dataset?.ligeiaEconomia) return;
  el.dataset.ligeiaEconomia = "1";
  el.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.('[data-action="itemRoll"]');
    if (!btn) return;
    const actor = app.document ?? app.actor;
    const item = actor?.items?.get(btn.closest("[data-item-id]")?.dataset?.itemId);
    const acao = item?.system?.actions?.[Number(btn.dataset.actionIndex ?? 0)];
    const tipos = acoesNaHora(acao);
    if (!tipos.length) return;
    pendentes.push({ actorId: actor.id, tipos, ate: Date.now() + 120000 });
  }, true);
}

/** Mensagem da ação no chat → devolve as ações (o efeito de +1 já entrou). */
async function aoCriarMensagem(msg) {
  const k = pendentes.findIndex((p) => p.actorId && p.actorId === msg?.speaker?.actor && p.ate > Date.now());
  if (k < 0) return;
  const [p] = pendentes.splice(k, 1);
  const actor = globalThis.game?.actors?.get(p.actorId);
  if (!actor?.isOwner) return;
  try {
    // O mesmo módulo que o sistema carregou (relativo a este arquivo, para
    // valer também num Foundry servido com prefixo de rota).
    const url = new URL(`../../../systems/${SISTEMA}/module/helpers/actions.mjs`, import.meta.url).href;
    const { refundActions, actionEconomyOn } = await import(url);
    if (!actionEconomyOn()) return;
    // Espera o efeito da rodada chegar à ficha (ele aumenta o máximo).
    await new Promise((r) => setTimeout(r, 300));
    await refundActions(actor, p.tipos);
  } catch (e) {
    console.warn("Ligeia — Livro do Jogador | não deu para devolver as ações:", e);
  }
}

globalThis.Hooks?.on?.("preUpdateToken", naoCobrarMovimentoForcado);
globalThis.Hooks?.on?.("renderActorSheetV2", ligarNaFicha);
globalThis.Hooks?.on?.("renderActorSheet", ligarNaFicha);
globalThis.Hooks?.on?.("createChatMessage", aoCriarMensagem);
globalThis.Hooks?.once?.("ready", () => {
  const mod = globalThis.game?.modules?.get(MODULE_ID);
  if (mod) mod.api = Object.assign(mod.api ?? {}, { acoesNaHora });
});
