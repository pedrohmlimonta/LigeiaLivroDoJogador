/**
 * LIGEIA — ECONOMIA DE AÇÕES (Livro do Jogador)
 * ===========================================================================
 * O sistema (build 32) conta, por rodada, 1 ação padrão, 1 de movimento, 1
 * simples (a "ação rápida" do livro), 1 reação e as livres à vontade — tudo
 * opcional, ligado pelo Narrador. A ficha guarda o que já foi GASTO, então
 * uma ação a mais concedida no meio do turno (Movimento Rápido, Aceleração,
 * Reflexos Rápidos, Veloz, Velocidade) já vale na hora: o módulo não precisa
 * mais devolver nada. O compêndio diz o que cada ação gasta; este arquivo
 * cuida de um detalhe que acontece na mesa:
 *
 *   MOVIMENTO FORÇADO não é deslocamento. Quando uma ação move o token
 *   (teleporte, empurrão, telecinese — o sistema marca a atualização com
 *   `ligeiaForced`), quem pagou foi a ação: o Teletransporte já gastou o
 *   movimento, o Teleporte Faérian também. Sem isto o sistema cobraria o
 *   deslocamento de novo, como se o personagem tivesse andado.
 *
 * O gancho tem de rodar DEPOIS do gancho do sistema, que marca de onde o
 * token saiu — e o sistema o registra no "ready". Por isso este registra o
 * seu no "ready" também (os do sistema, carregado antes, rodam primeiro).
 */

/* ------------------------------------------------------------------ */
/*  Movimento forçado                                                  */
/* ------------------------------------------------------------------ */

/**
 * preUpdateToken: o sistema guarda de onde o token saiu para cobrar o
 * deslocamento; num movimento forçado por uma ação, tira essa marca — sem
 * ela, a distância cobrada é zero.
 */
export function naoCobrarMovimentoForcado(tokenDoc, changed, options) {
  if (options?.ligeiaForced) delete options.ligeiaMoveFrom;
}

globalThis.Hooks?.once?.("ready", () => {
  globalThis.Hooks.on("preUpdateToken", naoCobrarMovimentoForcado);
});
