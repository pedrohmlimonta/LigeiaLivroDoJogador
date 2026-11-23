/**
 * LIGEIA — CONSUMÍVEIS (Livro do Jogador)
 * ===========================================================================
 * "Pedras, Poções, Óleos, Elixires e Bombas — São itens alquímicos que são
 * consumidos quando utilizados" (Sessão 17). O sistema não tem como gastar a
 * quantidade de um item numa ação, então o módulo faz isso nas ações
 * "(consumível)" que o Encantamento de Itens grava — ✦ Beber, ✦ Arremessar,
 * ✦ Aplicar, ✦ Usar —, as do compêndio Itens Mágicos incluídas, e nas do
 * próprio livro marcadas como consumíveis (Remédio, Kit de Primeiros Socorros):
 *
 *   1. o clique no botão da ação, na ficha, marca o item;
 *   2. quando a ação chega ao chat — o sinal de que foi usada: cancelar a área
 *      da bomba não posta nada — e o chat daquele personagem sossega (a bomba
 *      posta o ataque e depois as defesas), sai 1 da pilha. O último some da
 *      ficha.
 *
 * Desligável nas configurações do mundo ("Consumíveis encantados são gastos
 * ao usar"). Usado por fora da ficha (macro, outro módulo), o item fica como
 * está.
 */

const MODULE_ID = "ligeia-livro-do-jogador";

/** Prazo para a ação chegar ao chat e o sossego que encerra a ação (ms). */
export const CONSUMO = { prazo: 120000, sossego: 1500 };

/** A ação é a de um consumível encantado por este módulo? */
export function acaoConsumivel(item, acao) {
  if (!item || item.type !== "equipamento" || !acao) return false;
  const receitas = item.flags?.[MODULE_ID]?.encantamentos ?? [];
  // Encantado como consumível, ou consumível do próprio livro (Remédio, Kit de
  // Primeiros Socorros — "consumido quando utilizado").
  if (!receitas.some((r) => r?.tipo !== "magia") && !item.flags?.[MODULE_ID]?.consumivel) return false;
  return /\(consumível\)\s*$/.test(String(acao.label ?? ""));
}

/**
 * Tira 1 da pilha; o último sai da ficha.
 * @returns {Promise<number>} quantos sobraram
 */
export async function gastarUm(item) {
  const qtd = Math.max(1, Number(item?.system?.qty ?? 1) || 1);
  if (qtd > 1) {
    await item.update({ "system.qty": qtd - 1 });
    return qtd - 1;
  }
  await item.delete();
  return 0;
}

/* ------------------------------------------------------------------ */
/*  Clique → mensagem no chat → gasto                                  */
/* ------------------------------------------------------------------ */

const fila = [];
let corrente = Promise.resolve();

/** Marca o uso de uma ação consumível (o clique na ficha). */
export function armar(actor, item, acao, agora = Date.now()) {
  const p = { actor, actorId: actor?.id, itemId: item?.id, nome: item?.name, label: String(acao?.label ?? ""),
    ate: agora + CONSUMO.prazo, viu: false, timer: null };
  fila.push(p);
  return p;
}

/** Quantos usos ainda esperam a mensagem ou o sossego (para os testes). */
export const pendentes = () => fila.length;

/**
 * Hook createChatMessage: a primeira mensagem do personagem que cita a ação
 * confirma o uso; enquanto ele seguir postando (ataque, defesas), espera.
 */
export function aoCriarMensagem(msg, userId, agora = Date.now()) {
  if (!fila.length || userId !== globalThis.game?.user?.id) return;
  for (let i = fila.length - 1; i >= 0; i--) if (!fila[i].viu && fila[i].ate < agora) fila.splice(i, 1);
  const actorId = msg?.speaker?.actor;
  const daqui = fila.filter((p) => p.actorId && p.actorId === actorId);
  if (!daqui.length) return;
  const texto = `${msg?.flavor ?? ""} ${msg?.content ?? ""}`;
  const nova = daqui.find((p) => !p.viu && p.label && texto.includes(p.label));
  if (nova) nova.viu = true;
  for (const p of daqui) {
    if (!p.viu) continue;
    clearTimeout(p.timer);
    p.timer = setTimeout(() => { corrente = corrente.then(() => concluir(p)); }, CONSUMO.sossego);
  }
}

async function concluir(p) {
  const i = fila.indexOf(p);
  if (i >= 0) fila.splice(i, 1);
  const item = p.actor?.items?.get?.(p.itemId);
  if (!item) return;
  try {
    const resto = await gastarUm(item);
    globalThis.ui?.notifications?.info(resto ? `${p.nome}: sobram ${resto}.` : `${p.nome}: acabou (saiu da ficha).`);
  } catch (e) {
    console.warn(`Ligeia — Livro do Jogador | não foi possível gastar ${p.nome}:`, e);
  }
}

function consumoLigado() {
  try { return globalThis.game?.settings?.get(MODULE_ID, "consumirAoUsar") !== false; }
  catch (e) { return true; } // configuração ainda não registrada
}

/** Ficha do personagem: o clique num botão de ação consumível marca o uso. */
export function ligarNaFicha(app, html) {
  const HE = globalThis.HTMLElement;
  const el = HE && app?.element instanceof HE ? app.element : (html?.[0] ?? html);
  if (!el?.addEventListener || el.dataset?.ligeiaConsumo) return;
  el.dataset.ligeiaConsumo = "1";
  el.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.('[data-action="itemRoll"]');
    if (!btn || !consumoLigado()) return;
    const actor = app.document ?? app.actor;
    const item = actor?.items?.get(btn.closest("[data-item-id]")?.dataset?.itemId);
    const acao = item?.system?.actions?.[Number(btn.dataset.actionIndex ?? 0)];
    if (acaoConsumivel(item, acao)) armar(actor, item, acao);
  }, true);
}

globalThis.Hooks?.once?.("init", () => {
  game.settings.register(MODULE_ID, "consumirAoUsar", {
    name: "Consumíveis encantados são gastos ao usar",
    hint: "Poções, bombas, óleos e pedras do Encantamento de Itens (e do compêndio Itens Mágicos): usar a ação "
      + "✦ na ficha tira 1 da pilha depois que ela chega ao chat, e o último sai da ficha. Desmarcado, a quantidade "
      + "fica por sua conta.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });
});
globalThis.Hooks?.on?.("renderActorSheetV2", ligarNaFicha);
globalThis.Hooks?.on?.("renderActorSheet", ligarNaFicha);
globalThis.Hooks?.on?.("createChatMessage", (msg, options, userId) => aoCriarMensagem(msg, userId));
