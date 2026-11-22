// Testes do compêndio Itens Mágicos e do gasto dos consumíveis:
// node tests/itens-magicos.test.mjs (após python3 scripts/generate.py)
// Confere que há um item para cada grau de cada propriedade do livro (menos a
// Poção de Mana), o nível e a mana, as ações (a poção se bebe, a bomba se
// arremessa), os nomes, as pastas, o nível de tesouro, que o build é
// determinístico e que usar um consumível na ficha tira 1 da pilha.
import fs from 'fs';

globalThis.game = { user: { id: 'jogador', isGM: false }, packs: new Map(), items: [] };
const avisos = [];
globalThis.ui = { notifications: { info: (m) => avisos.push(m), warn() {} } };

const raiz = new URL('..', import.meta.url).pathname;
const im = await import(new URL('../scripts/itens-magicos.mjs', import.meta.url).href);
const enc = await import(new URL('../esmodules/encantamento.mjs', import.meta.url).href);
const con = await import(new URL('../esmodules/consumiveis.mjs', import.meta.url).href);
const { PROPRIEDADES, NOME_DO_NIVEL, NIVEIS_ITEM, desfazerEncantamento } = enc;
const MOD = 'ligeia-livro-do-jogador';

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };

const dir = `${raiz}/packs-source/itens-magicos`;
const itens = fs.readdirSync(dir).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')));
const item = (nome) => itens.find((d) => d.name === nome);
const receita = (d) => d.flags[MOD].encantamentos[0];
const acoes = (d, re) => d.system.actions.filter((a) => re.test(a.label));
const pastas = im.pastasUsadas(itens);
const pastaDe = new Map(pastas.map((p) => [p._id, p]));
const caminho = (d) => { const p = pastaDe.get(d.folder); return p.folder ? `${pastaDe.get(p.folder).name} / ${p.name}` : p.name; };

console.log('1) Um item para cada grau de cada propriedade');
const esperados = PROPRIEDADES.filter((p) => !im.FORA.has(p.id)).flatMap((p) => p.variantes.map((v, i) => `${p.id}#${i}`));
const vistos = itens.map((d) => { const r = receita(d); return `${r.propriedades[0].id}#${r.propriedades[0].indice}`; });
ok(itens.length === esperados.length && new Set(vistos).size === vistos.length
   && esperados.every((k) => vistos.includes(k)), `${itens.length} itens = ${esperados.length} graus das ${PROPRIEDADES.length - im.FORA.size} propriedades`);
ok(!itens.some((d) => receita(d).propriedades.some((p) => p.id === 'energio-mana')) && !itens.some((d) => /Mana/.test(d.name)),
   'nenhuma Poção de Mana (não faz sentido gastar mana para recuperar mana)');
ok(PROPRIEDADES.find((p) => p.id === 'energio-mana'), 'a Mana continua no Encantamento de Itens (fora só do compêndio)');
ok(new Set(itens.map((d) => d.name)).size === itens.length && new Set(itens.map((d) => d._id)).size === itens.length,
   'nomes e ids únicos');

console.log('2) Nível do item e mana');
let nivelErrado = [], manaErrada = [];
for (const d of itens) {
  const r = receita(d);
  const p = PROPRIEDADES.find((x) => x.id === r.propriedades[0].id);
  const v = p.variantes[r.propriedades[0].indice];
  if (r.nivel !== NOME_DO_NIVEL[v.nivel] || r.palavras.length !== 1 || r.lendario || r.mana !== 'propriedade') nivelErrado.push(d.name);
  for (const a of d.system.actions.filter((x) => x.label.startsWith('✦'))) {
    // A mana é o nível do grau (uma palavra só); gasto à escolha (Emanação, Pragas): o que se escolhe — custo fixo 0.
    const esperado = (p.consumivel || a.variableCost?.enabled) ? '0' : String(v.nivel);
    if (a.costMp !== esperado) manaErrada.push(`${d.name}: ${a.label} = ${a.costMp}`);
  }
}
ok(nivelErrado.length === 0, `nível = nível do preço, com uma palavra só (Menor, Intermediário ou Maior) ${nivelErrado.slice(0, 3).join(', ')}`);
ok(manaErrada.length === 0, `mana: o nível do grau (Menor 1, Intermediário 2, Maior 3); consumível 0 ${manaErrada.slice(0, 3).join(' | ')}`);
ok(receita(item('Anel de Carvalho (Maior)')).palavras.join() === 'devena'
   && acoes(item('Anel de Carvalho (Maior)'), /^✦/).every((a) => a.costMp === '3'), 'Anel de Carvalho Maior: devena (uma palavra), 3 PM por uso');

console.log('3) Poções se bebem; bombas se arremessam; óleos se aplicam; pedras se usam');
const pocoes = itens.filter((d) => caminho(d) === 'Poções');
ok(pocoes.length === 13 && pocoes.every((d) => acoes(d, /^✦ Beber: /).length === 1
   && acoes(d, /^✦ Beber: /).every((a) => a.targetMode === 'self' && a.costMp === '0' && a.label.endsWith('(consumível)'))),
   `${pocoes.length} poções, cada uma com "✦ Beber" em você, sem mana`);
ok([1, 2, 3].every((n) => acoes(item(`Poção de Cura (${n} PV)`), /^✦ Beber: Cura/)[0]?.heal === String(n)
   && acoes(item(`Poção de Cura (${n} PV)`), /^✦ Beber/)[0].healResource === 'hp'), 'Poção de Cura de 1, 2 e 3 PV: bebe e recupera os PV');
ok(acoes(item('Poção de Pele de Árvore (Proteção 2)'), /^✦ Beber/)[0].appliesEffects.some((e) => e.fxType === 'rd' && e.fxValue === '2')
   && acoes(item('Poção Nebulosa (Menor)'), /^✦ Beber/)[0].appliesEffects.some((e) => e.fxTarget === 'invisivel'),
   'Pele de Árvore dá Proteção; Nebulosa deixa invisível');
const bombas = itens.filter((d) => /Bomba/.test(d.name));
ok(bombas.length === 8 && bombas.every((d) => { const a = acoes(d, /^✦ Arremessar: /)[0];
  return a && a.targetMode === 'area' && a.range === '10' && a.area === '2' && a.canRoll && a.rollAttr === 'agilidade'; }),
   `${bombas.length} bombas: "✦ Arremessar" a 10m, 2m de raio, Agilidade contra Esquiva`);
ok(itens.filter((d) => /^Óleo /.test(d.name)).every((d) => acoes(d, /^✦ Aplicar: /).length === 1)
   && itens.filter((d) => /^Pedra Solar/.test(d.name)).every((d) => acoes(d, /^✦ Usar: /).length === 1),
   'óleos: "✦ Aplicar"; Pedra Solar: "✦ Usar"');
ok(/Item <b>consumível<\/b>: não gasta mana/.test(item('Poção de Cura (1 PV)').system.description),
   'a descrição da poção diz que ela não gasta mana (é gasta ao usar)');

console.log('4) Armas e armaduras do livro como base');
let d = item('Espada Longa Corrosiva (Intermediário)');
ok(acoes(d, /^Ataque — Espada Longa/).length === 2 && acoes(d, /^✦ Ataque/).length === 2
   && acoes(d, /^✦ Ataque/).every((a) => a.appliesEffects.some((e) => e.fxTarget === 'dano_continuo' && e.tickType === 'acido')),
   'Espada Longa Corrosiva: os ataques do livro e as versões ✦ com dano contínuo de ácido');
const flamejantes = itens.filter((d2) => receita(d2).propriedades[0].id === 'ignis-dano-flamejante' && d2.system.actions.some((a) => a.isWeapon));
ok(flamejantes.length === 3 && flamejantes.every((d2) => { const n = receita(d2).propriedades[0].nivel;
  return acoes(d2, /^✦ Ataque/).every((a) => a.extraDamage.some((x) => x.type === 'fogo' && x.formula === String(n)) && a.costMp === String(n)); }),
   `Dano Flamejante na arma (${flamejantes[0]?.name.replace(/ \(.*/, '')}): +1/+2/+3 de fogo nos níveis Menor/Intermediário/Maior`);
d = item('Armadura de Placas de Proteção Contra Fogo (Menor)');
ok(d.system.effects.filter((e) => e.type === 'rd').length === 3 && acoes(d, /^✦ Ativar Proteção Contra Fogo/)[0]
   ?.appliesEffects.some((e) => e.fxType === 'rd' && e.fxTarget === 'fogo'), 'armadura: a Proteção do livro e a de fogo ao ativar');
ok(item('Espada Longa Corrosiva (Intermediário)').system.price === '30.024 Vo', 'preço: o da arma + o da propriedade');
const desfeito = desfazerEncantamento(item('Espada Longa Corrosiva (Intermediário)'));
ok(desfeito?.name === 'Espada Longa' && desfeito['system.actions'].length === 2, 'Desfazer último encantamento volta à Espada Longa do livro');

console.log('5) Nomes');
for (const nome of ['Flechas Corrosivas (Menor)', 'Botas Aracnídeas (Intermediário)', 'Coroa Esquelética (Menor)',
  'Luvas Caçadoras Temporais (Maior)', 'Escudo Guardião Temporal (Maior)', 'Poção Nebulosa (Menor)', 'Bomba Incendiária (Menor)',
  'Cinto do Artesão (Menor)', 'Capa de Invisibilidade (Maior)', 'Cubo das Pragas (Menor, Desafio 3)', 'Pedra Solar (15m)',
  'Bainha das Lâminas Infinitas (Lâminas Pequenas)', 'Estrepes Saltitantes (Maior)', 'Mochila Extradimensional (Menor)']) {
  ok(item(nome), nome);
}
ok(im.flexoes('Caçador Temporal').fp === 'Caçadoras Temporais' && im.flexoes('Indestrutível').mp === 'Indestrutíveis'
   && im.flexoes('Guardião Temporal').mp === 'Guardiões Temporais' && im.flexoes('Veloz').fp === 'Velozes',
   'adjetivos concordam com o item (gênero e número)');

console.log('6) Pastas');
const raizes = pastas.filter((p) => !p.folder).map((p) => p.name);
ok(['Poções', 'Bombas Alquímicas', 'Venenos', 'Armas', 'Anéis', 'Focos', 'Itens Maravilhosos'].every((n) => raizes.includes(n)),
   `${raizes.length} pastas por tipo (as do livro): ${raizes.join(', ')}`);
ok(itens.every((d2) => pastaDe.has(d2.folder)) && pastas.every((p) => !p.folder || pastaDe.has(p.folder)),
   'todo item numa pasta que existe; toda subpasta dentro de uma pasta');
ok(pastas.filter((p) => p.folder).every((p) => ['Menor', 'Intermediário', 'Maior'].includes(p.name)), 'subpastas por nível');
const venenos = itens.filter((d2) => caminho(d2).startsWith('Venenos'));
ok(venenos.length === 14 && venenos.every((d2) => im.VENENOS.has(receita(d2).propriedades[0].id)),
   `Venenos: ${venenos.length} itens de noxia que envenenam (bomba, munição, armas, braçadeiras, incensório)`);
ok(caminho(item('Anel de Carvalho (Menor)')) === 'Anéis / Menor' && caminho(item('Poção de Cura (1 PV)')) === 'Poções',
   'Anel de Carvalho (Menor) em Anéis / Menor; Poção de Cura em Poções');

console.log('7) Tesouro (Sessão 17)');
ok(/Consumível Mágico de Nível 2 \(100 Vo\)/.test(item('Poção de Cura (2 PV)').system.description)
   && /Equipamento Mágico de Nível 17 \(1\.500\.000 Vo\)/.test(item('Anel de Carvalho (Maior)').system.description)
   && /Equipamento Mágico de Nível 1 \(400 Vo\)/.test(item('Amuleto Murmurante (Menor)').system.description),
   'a descrição diz a linha das tabelas de tesouro (Poção de Cura 2 PV: Consumível 2; Anel de Carvalho Maior: Equipamento 17)');

console.log('8) Build determinístico');
const equip = im.lerEquipamentos(raiz);
ok(im.makeId('equipamento', 'Espada Longa') === equip.find((x) => x.name === 'Espada Longa')._id,
   'makeId = make_id do builders.py (o mesmo id do Python)');
const deNovo = im.gerar(equip);
ok(JSON.stringify(deNovo) === JSON.stringify([...itens].sort((a, b) => a.sort - b.sort)), 'gerar de novo dá exatamente os mesmos itens');

console.log('9) Consumíveis gastos ao usar');
con.CONSUMO.sossego = 15;
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
function fichaFalsa(dados, qtd) {
  const itensDoAtor = new Map();
  const ator = { id: 'ator1', items: { get: (id) => itensDoAtor.get(id) } };
  const it = { id: 'it1', name: dados.name, type: 'equipamento', flags: dados.flags,
    system: { ...dados.system, qty: qtd },
    async update(u) { this.system.qty = u['system.qty']; },
    async delete() { itensDoAtor.delete(this.id); this.apagado = true; } };
  itensDoAtor.set(it.id, it);
  return { ator, it };
}
const pocao = item('Poção de Cura (1 PV)');
const beber = acoes(pocao, /^✦ Beber/)[0];
ok(con.acaoConsumivel(pocao, beber) && !con.acaoConsumivel(item('Espada Longa Corrosiva (Intermediário)'), acoes(item('Espada Longa Corrosiva (Intermediário)'), /^✦/)[0])
   && !con.acaoConsumivel({ type: 'equipamento', flags: {}, system: {} }, { label: 'Algo (consumível)' }),
   'só as ações "(consumível)" de itens encantados pelo módulo');
let { ator, it } = fichaFalsa(pocao, 3);
const msg = (texto, actor = 'ator1') => ({ speaker: { actor }, flavor: `<strong>${it.name}</strong> <span class="lig-act-name">— ${texto}</span>` });
con.armar(ator, it, beber);
con.aoCriarMensagem(msg('outra ação'), 'jogador');
await espera(40);
ok(it.system.qty === 3, 'mensagem de outra ação não gasta');
con.aoCriarMensagem(msg(beber.label), 'jogador');
await espera(40);
ok(it.system.qty === 2 && con.pendentes() === 0, 'bebeu: a ação chegou ao chat e saiu 1 da pilha (3 → 2)');
con.armar(ator, it, beber);
con.armar(ator, it, beber);
con.aoCriarMensagem(msg(beber.label), 'jogador');
con.aoCriarMensagem(msg(beber.label), 'jogador');
await espera(60);
ok(it.apagado === true && ator.items.get('it1') === undefined, 'duas de uma vez: 2 → 1 → a última sai da ficha');
({ ator, it } = fichaFalsa(pocao, 2));
con.armar(ator, it, beber, Date.now() - con.CONSUMO.prazo - 1);
con.aoCriarMensagem(msg(beber.label), 'jogador');
await espera(40);
ok(it.system.qty === 2 && con.pendentes() === 0, 'clique sem ação no chat (área cancelada) vence e não gasta');
con.armar(ator, it, beber);
con.aoCriarMensagem(msg(beber.label, 'outroAtor'), 'jogador');
con.aoCriarMensagem(msg(beber.label), 'outroJogador');
await espera(40);
ok(it.system.qty === 2, 'mensagem de outro personagem ou de outro jogador não gasta');
con.aoCriarMensagem(msg(beber.label), 'jogador');
con.aoCriarMensagem({ speaker: { actor: 'ator1' }, flavor: 'resultado das defesas' }, 'jogador');
await espera(5);
ok(it.system.qty === 2, 'espera o chat do personagem sossegar (a bomba posta o ataque e depois as defesas)');
await espera(40);
ok(it.system.qty === 1 && avisos.some((a) => /sobram 1/.test(a)), 'e então gasta, com um aviso');
// O clique na ficha marca o uso.
const ouvintes = [];
const botao = { dataset: { actionIndex: String(pocao.system.actions.indexOf(beber)) },
  closest: (sel) => (sel === '[data-action="itemRoll"]' ? botao : sel === '[data-item-id]' ? { dataset: { itemId: 'it1' } } : null) };
const el = { dataset: {}, addEventListener: (tipo, fn, captura) => ouvintes.push({ tipo, fn, captura }) };
// No Foundry v13 o gancho de render da ApplicationV2 entrega o elemento da ficha.
con.ligarNaFicha({ document: ator, element: el }, el);
con.ligarNaFicha({ document: ator, element: el }, el);
ok(ouvintes.length === 1 && ouvintes[0].tipo === 'click' && ouvintes[0].captura === true, 'a ficha ganha um ouvinte de clique (uma vez só)');
ouvintes[0].fn({ target: botao });
ok(con.pendentes() === 1, 'clicar em "✦ Beber" na ficha marca o uso');
con.aoCriarMensagem(msg(beber.label), 'jogador');
await espera(40);
ok(it.apagado === true, 'e, com a ação no chat, a última poção sai da ficha');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
