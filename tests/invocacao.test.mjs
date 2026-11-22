// Testes do custo escolhido na ativação (@gasto) e da invocação de criaturas — sistema build 30:
// node tests/invocacao.test.mjs (após python3 scripts/generate.py)
// Confere o compêndio (Punição, Sopro de Dragão, Sangue Aagn, Moldar Energia, Invocar Animais/Plantas,
// Invocar; resistência e imunidades), a Criação de Magias (marcador da criatura, peculiaridades,
// Replicante, Majestosa, ficha escolhida na oficina), o Encantamento de Itens (Emanação, Pragas,
// Invocação Animal, imunidades), o encaixe da ficha arrastada no marcador e o validador.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

class ApplicationV2 {
  #state = 0;
  #element = null;
  options;
  position = {};
  constructor(options = {}) { this.options = Object.freeze({ ...this.constructor.DEFAULT_OPTIONS, ...options }); }
  get state() { return this.#state; }
  get element() { return this.#element; }
  async render() {
    const conteudo = { filho: null, replaceChildren(x) { this.filho = x; }, querySelectorAll() { return []; } };
    this.#element = conteudo;
    this._replaceHTML(await this._renderHTML(), conteudo);
    this.#state = 2;
    return this;
  }
  async close() { this.#state = -1; }
}
const avisos = [];
globalThis.foundry = { utils: { escapeHTML: (s) => String(s) }, applications: { api: { ApplicationV2 } } };
const ganchos = {};
globalThis.Hooks = { on(nome, fn) { (ganchos[nome] ??= []).push(fn); }, once() {} };
globalThis.ui = { notifications: { info(m) { avisos.push(['info', m]); }, warn(m) { avisos.push(['warn', m]); } } };
globalThis.document = { createElement: () => ({ className: '', innerHTML: '' }) };

const raiz = new URL('..', import.meta.url).pathname;
const todos = [];
for (const pack of fs.readdirSync(`${raiz}/packs-source`)) {
  for (const f of fs.readdirSync(`${raiz}/packs-source/${pack}`)) {
    todos.push({ pack, doc: JSON.parse(fs.readFileSync(`${raiz}/packs-source/${pack}/${f}`, 'utf8')) });
  }
}
const doc = (pack, nome) => {
  const d = todos.find((x) => x.pack === pack && x.doc.name === nome)?.doc;
  if (!d) throw new Error(`${pack}: ${nome}`);
  return JSON.parse(JSON.stringify(d));
};
const magias = todos.filter((x) => x.pack === 'magias').map((x) => x.doc)
  .map((raw) => ({ id: raw._id, name: raw.name, type: 'magia', system: raw.system,
    toObject() { return JSON.parse(JSON.stringify({ _id: raw._id, name: raw.name, type: 'magia', img: raw.img, system: raw.system, flags: {} })); } }));
globalThis.game = { user: { isGM: false, id: 'u1' }, packs: new Map([['ligeia-livro-do-jogador.magias', { getDocuments: async () => magias }]]),
  items: [], actors: [{ uuid: 'Actor.lobo00000000001', id: 'lobo00000000001', name: 'Lobo' }, { uuid: 'Actor.urso0000000002', id: 'urso0000000002', name: 'Urso' }] };

const sf = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);
const enc = await import(new URL('../esmodules/encantamento.mjs', import.meta.url).href);
const inv = await import(new URL('../esmodules/invocacao.mjs', import.meta.url).href);

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
const chave = (cfg) => cfg && ['dbSection', 'menuType', 'animation', 'variant', 'color'].map((k) => cfg.primary.video[k]).join('.');

// O que o sistema faz com o custo escolhido (applyVariableCost, build 30): dano e cura recebem o
// bônus como TERMO da fórmula; área, alcance e rolagem, como número. As fórmulas usam @gasto e as
// @variáveis do personagem.
const avaliar = (f, vars) => {
  const s = String(f ?? '').trim();
  if (!s) return 0;
  const expr = s.replace(/@(\w+)/g, (_, v) => String(vars[v] ?? 0));
  return Function('Math', `with (Math) { return (${expr}); }`)(Math);
};
const comGasto = (a, gasto, vars = {}) => {
  const vc = a.variableCost;
  const v = { ...vars, gasto };
  const termo = (base, b) => (String(b || '').trim() ? (String(base || '').trim() ? `${base} + (${b})` : b) : base);
  return {
    dano: avaliar(termo(a.damage, vc.damageBonus), v), cura: avaliar(termo(a.heal, vc.healBonus), v),
    area: avaliar(a.area, vars) + avaliar(vc.areaBonus, v), alcance: avaliar(a.range, vars) + avaliar(vc.rangeBonus, v),
    rolagem: avaliar(a.rollBonus, vars) + avaliar(vc.rollBonus, v),
  };
};

console.log('1) Compêndio: custo escolhido na ativação (@gasto)');
let d = doc('habilidades', 'Punição');
let [b, av] = d.system.actions;
ok(b.variableCost.enabled && b.variableCost.resource === 'mp' && b.variableCost.min === '2' && b.variableCost.max === '12'
   && b.damageType === 'final' && b.costMp === '0' && !b.damage.trim(),
   'Punição (B): pergunta de 2 a 12 PM, sem custo fixo; o dano final é o que se gasta');
ok([2, 3, 4, 12].map((g) => comGasto(b, g).dano).join() === '1,1,2,6', 'Punição (B): a cada 2 PM, 1 de dano final (2→1, 3→1, 4→2, 12→6)');
ok(av.level === 'A' && av.variableCost.min === '1' && av.variableCost.max === '6' && [1, 4, 6].map((g) => comGasto(av, g).dano).join() === '1,4,6',
   'Punição (A): cada PM, 1 de dano final, até 6');
d = doc('habilidades', 'Sopro de Dragão [Fogo]');
ok(d.system.actions.length === 2 && d.system.actions.every((a) => a.targetMode === 'area' && a.area === '0' && a.costMp === '0'
   && a.variableCost.enabled && a.variableCost.areaBonus === '@gasto' && a.range === '2*@vigor' && a.damage === 'ceil(@nivel/2)'),
   'Sopro de Dragão: raio = PM gastos (área 0 + @gasto), alcance 2 × Vigor, dano metade do Nível');
ok(comGasto(d.system.actions[0], 3, { vigor: 2 }).area === 3 && comGasto(d.system.actions[0], 3, { vigor: 2 }).alcance === 4,
   'Sopro de Dragão: 3 PM → raio de 3m (alcance 4m com Vigor 2)');
d = doc('tracos', 'Sangue Aagn');
let a = d.system.actions[0];
ok(a.variableCost.enabled && a.variableCost.min === '2' && a.variableCost.healBonus === 'floor(@gasto/2)' && a.costMp === '0'
   && [2, 5, 8].map((g) => comGasto(a, g).cura).join() === '1,2,4', 'Sangue Aagn: a cada 2 PM, 1 PV');
const humano = doc('racas', 'Humano');
const embutido = (humano.system.grantedTraits ?? []).find((t) => t.name === 'Sangue Aagn');
ok(embutido?.system?.actions?.[0]?.variableCost?.healBonus === 'floor(@gasto/2)', 'Sangue Aagn embutido na raça Humano também pergunta o gasto');
d = doc('tracos', 'Moldar Energia');
a = d.system.actions[0];
ok(a.vsDifficulty && a.fixedDifficulty === '10' && a.costMp === '0' && d.system.costs.length === 0 && a.variableCost.enabled,
   'Moldar Energia: Mente contra Normal (10), PM à escolha, sem ativação à parte');
ok([1, 2, 3, 4].map((g) => 10 - comGasto(a, g).rolagem).join() === '10,12,14,17',
   'Moldar Energia: peso 0/1/2/3 (1/2/3/4 PM) = Normal 10 → Difícil 12 → Muito Difícil 14 → Épica 17');

console.log('2) Compêndio: magias que invocam (marcador da criatura)');
const ia = doc('magias', 'Invocar Animais');
a = ia.system.actions[0];
ok(ia.system.actions.length === 1 && a.targetMode === 'none' && !a.canRoll && a.range === '@nivel' && a.costMp === '1'
   && a.summons.length === 1 && a.summons[0].actorUuid === '' && a.summons[0].actorName === 'Fera pequena, Desafio até 2× Nível — arraste a ficha abaixo'
   && a.summons[0].count === '1' && a.summons[0].disposition === 'same' && a.summons[0].rounds === '0' && a.summons[0].giveControl,
   'Invocar Animais: alcance Nível × Círculo, marcador "Fera pequena, Desafio até 2× Nível"');
ok(/A criatura não é amigável a ninguém \(\+2\)/.test(ia.system.peculiarities) && /Aumente o Desafio em \+1/.test(ia.system.peculiarities)
   && /perde 1 ponto de vida quando a conjura/.test(ia.system.peculiarities) && !/Desafio 3 \+ seu nível/.test(ia.system.peculiarities),
   'Invocar Animais: peculiaridades como no livro (pág. 125)');
const ip = doc('magias', 'Invocar Plantas');
ok(ip.system.actions[0].summons[0].actorName.startsWith('Planta pequena, Desafio até Nível') && ip.system.actions[0].range === '@nivel',
   'Invocar Plantas: "Planta pequena, Desafio até Nível"');
const ik = doc('magias', 'Invocar');
ok(ik.system.actions[0].summons[0].actorName.startsWith('Criatura pequena, Desafio até 2× Nível') && ik.system.actions[0].range === '1.5'
   && ik.system.actions[1].targetMode === 'self' && ik.system.actions[1].appliesEffects.length === 1,
   'Invocar (krucigon): criatura adjacente (1,5m) e a ação do objeto encantado');
ok(chave(a.aaConfig) === 'static.magicsign.conjuration.02.yellow' && a.aaConfig.primary.options.playOn === 'source',
   'a ação de invocar ganha o círculo de conjuração em quem invoca');
ok(chave(doc('habilidades', 'Punição').system.actions[0].aaConfig)?.includes('divinesmite')
   && chave(doc('tracos', 'Sangue Aagn').system.actions[0].aaConfig)?.includes('healing'),
   'Punição e Sangue Aagn continuam animados (o dano e a cura vêm do gasto)');

console.log('3) Compêndio: resistência (resistir:<condição>) e imunidades');
const efeitos = (nome) => doc('habilidades', nome).system.effects;
const anula = (nome, conds, nivel) => conds.every((c) => efeitos(nome).some((e) => e.target === `resistir:${c}` && e.enabled && e.level === nivel));
ok(anula('Alerta', ['cego', 'surdo'], 'A'), 'Alerta (A): anula Cego e Surdo');
ok(anula('Firmeza Física', ['agarrado', 'enfraquecido', 'exausto', 'paralisado'], 'A'), 'Firmeza Física (A): Agarrado, Enfraquecido, Exausto, Paralisado');
ok(anula('Corredor', ['lento', 'imobilizado'], 'A'), 'Corredor (A): Lento e Imobilizado');
ok(anula('Recuperar o Fôlego', ['inconsciente'], 'A'), 'Recuperar o Fôlego (A): Inconsciente');
const vf = doc('habilidades', 'Vontade de Ferro');
const vontade = ['abalado', 'dominado', 'enfeiticado', 'atordoado', 'pasmo'];
ok(vf.system.mode === 'passive' && anula('Vontade de Ferro', vontade, 'B') && anula('Vontade de Ferro', vontade, 'A')
   && vf.system.effects.filter((e) => e.target === 'all').every((e) => !e.enabled),
   'Vontade de Ferro: passiva — +1D (B) e +metade do Nível (A) para anular as 5 condições; o resto é interruptor');
ok(efeitos('Marca da Mácula').some((e) => e.type === 'immune' && e.target === 'efeito:veneno' && e.enabled)
   && efeitos('Marca da Mácula').some((e) => e.type === 'immune' && e.target === 'efeito:doença'),
   'Marca da Mácula: imune a envenenamento e doenças');

console.log('4) Criação de Magias: a criatura invocada');
const load = (nome) => magias.find((m) => m.name === nome);
const pecsDe = (nome, ...textos) => sf.parsePeculiaridades(load(nome)).filter((p) => textos.some((t) => p.texto.startsWith(t)));
const MM = (p, n) => sf.METAMAGIAS[p].find((m) => m.name === n);
const criar = (nome, tier, extra = {}) => sf.construirMagia({ base: load(nome), tier, nome: '', palavra1: load(nome).system.wordId,
  palavra2: extra.p2 ?? '', palavra3: extra.p3 ?? '', pecs: extra.pecs ?? [], ajuste: 0, meta2: extra.meta2 ?? null,
  meta3: extra.meta3 ?? null, escolha2: {}, escolha3: {}, criatura: extra.criatura ?? null }, { animar: false });
d = await criar('Invocar Animais', 'Menor');
let x = d.system.actions[0].summons[0];
ok(x.actorName === 'Fera pequena, Desafio até 2× Nível — arraste a ficha abaixo' && x.count === '1' && d.system.actions[0].costMp === '1'
   && /Invoca: Fera pequena, Desafio até 2× Nível — arraste a ficha/.test(d.system.description),
   'Menor: o marcador vem como no compêndio, e a descrição diz o que a magia invoca');
d = await criar('Invocar Animais', 'Intermediária', { p2: 'pluribus', meta2: MM('pluribus', 'Magia Múltipla'),
  pecs: pecsDe('Invocar Animais', 'Invoca criatura média', 'Aumente o Desafio em +1') });
x = d.system.actions[0].summons[0];
ok(x.actorName === 'Fera média, Desafio até 2× Nível + 1 — arraste a ficha abaixo' && d.system.actions[0].rollBonus === '-5'
   && d.system.actions[0].range === '2*@nivel',
   `peculiaridades: "${x.actorName.split(' — ')[0]}", −5 na Conjuração, alcance 2 × Nível no Intermediário`);
d = await criar('Invocar Animais', 'Menor', { pecs: pecsDe('Invocar Animais', 'A criatura não é amigável', 'O conjurador perde 1 ponto de vida') });
x = d.system.actions[0].summons[0];
ok(x.disposition === 'hostile' && x.giveControl === false && d.system.actions[0].costHp === '1' && d.system.actions[0].rollBonus === '4',
   '"não é amigável a ninguém": hostil e sem o controle; "perde 1 PV": +1 PV no custo (+4 na Conjuração)');
d = await criar('Invocar Animais', 'Intermediária', { p2: 'pluribus', meta2: MM('pluribus', 'Magia Replicante') });
x = d.system.actions[0].summons[0];
ok(x.count === '2' && d.system.actions.length === 1 && !/não é de alvo nem de área/.test(d.system.description)
   && /Invoca: 2 × Fera pequena/.test(d.system.description),
   'Replicante: invoca o dobro (2), sem ação copiada nem aviso de "registrada para a mesa"');
d = await criar('Invocar Animais', 'Intermediária', { p2: 'majesto', meta2: MM('majesto', 'Magia Majestosa') });
ok(d.system.actions[0].summons[0].actorName.startsWith('Fera média,'), 'Majestosa (Intermediária): uma categoria acima — média');
d = await criar('Invocar Animais', 'Maior', { p2: 'majesto', meta2: MM('majesto', 'Magia Majestosa'), p3: 'pluribus',
  meta3: MM('pluribus', 'Magia Replicante'), pecs: pecsDe('Invocar Animais', 'Invoca criatura grande') });
x = d.system.actions[0].summons[0];
ok(x.actorName.startsWith('Fera imensa,') && x.count === '2', 'Maior: criatura grande + Majestosa (duas categorias) = imensa, e a Replicante dobra');
d = await criar('Invocar Plantas', 'Intermediária', { p2: 'pluribus', meta2: MM('pluribus', 'Magia Múltipla'),
  pecs: pecsDe('Invocar Plantas', 'Desafio 3 + seu nível') });
ok(d.system.actions[0].summons[0].actorName.startsWith('Planta pequena, Desafio até Nível + 3'), 'Invocar Plantas: "Desafio 3 + seu nível" → até Nível + 3');
d = await criar('Invocar', 'Menor', { criatura: { uuid: 'Compendium.x.y.Actor.abc', name: 'Diabrete' } });
x = d.system.actions[0].summons[0];
ok(x.actorUuid === 'Compendium.x.y.Actor.abc' && x.actorName === 'Diabrete'
   && /Criatura pequena, Desafio até 2× Nível — ficha: Diabrete/.test(d.system.description)
   && d.flags['ligeia-livro-do-jogador'].receita.criatura?.nome === 'Diabrete',
   'a ficha escolhida na oficina já vem na ação (e na receita)');
d = await criar('Míssil Mágico', 'Intermediária', { p2: 'pluribus', meta2: MM('pluribus', 'Magia Replicante') });
const copia = d.system.actions.find((y) => /Magia Replicante/.test(y.label));
ok(copia && copia.variableCost.enabled === false && copia.summons.length === 0, 'as cópias (Múltipla/Replicante) não perguntam o gasto de novo nem invocam');
const nova = sf.novaAcao('x', { variableCost: { enabled: true, areaBonus: '@gasto' }, summons: [{ actorName: 'Lobo' }] });
ok(nova.variableCost.resource === 'mp' && nova.variableCost.min === '1' && nova.variableCost.areaBonus === '@gasto'
   && nova.summons[0].count === '1' && nova.summons[0].disposition === 'same' && nova.summons[0].enabled === true,
   'novaAcao completa os campos do custo escolhido e das invocações');

console.log('5) Criação de Magias: a janela pergunta a ficha da criatura');
const ator = { id: 'eu', name: 'Druida', items: [{ type: 'habilidade', name: 'Palavra Arcana [devena]', system: { level: 'B' } },
  { type: 'habilidade', name: 'Palavra Arcana [ignis]', system: { level: 'B' } }],
  criadas: [], async createEmbeddedDocuments(t, lista) { this.criadas.push(...lista); return lista.map((y) => ({ ...y, sheet: null })); } };
const app = sf.abrirCriacaoDeMagia(ator);
app.forja.palavra1 = 'devena';
await app.render();
app.forja.baseId = app.bases.find((y) => y.name === 'Invocar Animais')?.id;
await app.render();
let html = app.element.filho.innerHTML;
ok(html.includes('Criatura invocada') && html.includes('value="Actor.lobo00000000001"') && html.includes('— arrastar depois —')
   && html.includes('Fera pequena, Desafio até 2× Nível'), 'magia que invoca: fieldset com as fichas do mundo e o "arrastar depois"');
app.forja.criatura = { uuid: 'Actor.lobo00000000001', name: 'Lobo' };
await app.criar();
ok(ator.criadas[0]?.system.actions[0].summons[0].actorUuid === 'Actor.lobo00000000001', 'criar: a ficha escolhida entra na ação');
const app2 = sf.abrirCriacaoDeMagia(ator);
app2.forja.palavra1 = 'ignis';
await app2.render();
app2.forja.baseId = app2.bases[0]?.id;
await app2.render();
ok(!app2.element.filho.innerHTML.includes('Criatura invocada'), 'magia que não invoca: sem o fieldset');

console.log('6) Encantamento de Itens: Emanação, Pragas, Invocação Animal e imunidades');
const P = (id) => enc.PROPRIEDADES.find((y) => y.id === id);
const sintetico = (nome) => ({ _id: 'sint', name: nome, type: 'equipamento', img: 'icons/svg/item-bag.svg', flags: {},
  system: { category: '', tags: [], tagsExtra: '', qty: 1, weight: 0, price: '10 Vo', notes: '', description: '', actions: [],
    enchantments: [], costsCumulative: false, noEnchant: false, fxFile: '', fxScale: '1', fxAaConfig: null, fxAaName: '',
    fxAaPersist: true, animOnActivate: true, mode: 'passive', active: false, effects: [], costs: [] } });
const encantar = (nome, nivel, ids, extra = {}) => enc.construirEncantamento(sintetico(nome), {
  nivel, escolhas: ids.map((id) => ({ prop: P(id), palavra: P(id).palavra })), ...extra }, { animar: true, existe: () => true });
d = encantar('Robe', 'Maior', ['energio-emanacao']);
a = d.system.actions.find((y) => /Emanação/.test(y.label));
ok(a.targetMode === 'aura' && a.area === '0' && a.variableCost.enabled && a.variableCost.areaBonus === '@gasto' && a.costMp === '0'
   && a.persistArea && a.persistTrigger === 'both' && a.damage === '1' && a.damageType === 'energia' && /\(PM à escolha\)$/.test(a.label),
   'Emanação: aura de raio = PM gastos, 1 de dano de energia ao entrar ou começar o turno, até o fim da cena');
d = encantar('Cubo', 'Intermediário', ['mortis-pragas']);
a = d.system.actions.find((y) => /Pragas/.test(y.label));
ok(a.variableCost.enabled && a.variableCost.rangeBonus === '100*@gasto' && comGasto(a, 3).alcance === 300 && a.costMp === '0',
   'Pragas: alcance de 100m por PM gasto');
d = encantar('Estatueta', 'Menor', ['devena-invocacao-animal']);
a = d.system.actions.find((y) => /Invocação Animal/.test(y.label));
ok(a.summons.length === 1 && a.summons[0].actorName === 'Fera, Desafio até 2 — arraste a ficha abaixo' && a.costMp === '1'
   && a.targetMode === 'none' && !/sem automação/.test(d.system.description) && /invoca Fera, Desafio até 2/.test(enc.resumoDaAcao(a)),
   'Invocação Animal: a estatueta invoca a fera (marcador "Fera, Desafio até 2"), 1 PM');
d = encantar('Elmo', 'Intermediário', ['forjuri-atencao']);
a = d.system.actions.find((y) => y.label.startsWith('✦ Ativar'));
ok(['indefeso', 'cego', 'surdo'].every((c) => a.appliesEffects.some((e) => e.fxType === 'immune' && e.fxTarget === `condicao:${c}` && e.fxValue === '1'))
   && a.appliesEffects.some((e) => e.label === '✦ Atenção: imune a Cego'),
   'Atenção: imune a Indefeso, Cego e Surdo (ao ativar, até o fim da cena)');
d = encantar('Elmo', 'Intermediário', ['forjuri-atencao'], { lendario: true });
ok(['indefeso', 'cego', 'surdo'].every((c) => d.system.effects.some((e) => e.type === 'immune' && e.target === `condicao:${c}` && e.enabled)),
   'lendário: a imunidade fica nos efeitos do item, sempre ligada');
d = encantar('Cinto', 'Intermediário', ['forjuri-rigidez']);
ok(['caido', 'agarrado'].every((c) => d.system.actions[0].appliesEffects.some((e) => e.fxType === 'immune' && e.fxTarget === `condicao:${c}`)),
   'Rigidez: não pode ser derrubado nem agarrado');
d = encantar('Anel', 'Intermediário', ['ignis-imunidade-a-fogo']);
a = d.system.actions[0];
ok(a.appliesEffects.some((e) => e.fxType === 'immune' && e.fxTarget === 'efeito:dano contínuo de Fogo')
   && a.appliesEffects.some((e) => /ignora dano final de Fogo/.test(e.label)),
   'Imunidade a Fogo: recusa o dano contínuo de fogo; o dano final fica como lembrete');
d = encantar('Anel', 'Intermediário', ['mortis-imunidade-necrotica']);
ok(['efeito:dano contínuo de Necrótico', 'efeito:dano contínuo necrótico'].every((t) => d.system.actions[0].appliesEffects.some((e) => e.fxTarget === t)),
   'Imunidade Necrótica: "dano contínuo de Necrótico" e "dano contínuo necrótico"');
ok(enc.descreverEfeito({ type: 'immune', target: 'condicao:pasmo' }) === 'imune a Pasmo'
   && enc.descreverEfeito({ type: 'immune', target: 'dano:fogo' }) === 'imune a dano de Fogo'
   && enc.descreverEfeito({ type: 'autocrit', target: 'attack' }) === 'crítico automático em ataque',
   'textos de imunidade e crítico automático');
ok(/PM à escolha \(mín\. 2, máx\. 12\): dano \+metade do gasto/.test(enc.resumoDaAcao(doc('habilidades', 'Punição').system.actions[0])),
   'resumo da ação (item conjurador): o custo escolhido e o que ele amplia');

console.log('7) A ficha arrastada ocupa o marcador');
const antes = [{ label: 'x', summons: [sf.novaInvocacao('Fera pequena — arraste a ficha abaixo', { count: '2', disposition: 'hostile', giveControl: false })] }];
let depois = JSON.parse(JSON.stringify(antes));
depois[0].summons.push(sf.novaInvocacao('Lobo', { actorUuid: 'Actor.lobo' }));
let nomes = inv.encaixarNosMarcadores(antes, depois);
x = depois[0].summons;
ok(nomes.join() === 'Lobo' && x.length === 1 && x[0].actorUuid === 'Actor.lobo' && x[0].actorName === 'Lobo' && x[0].count === '2'
   && x[0].disposition === 'hostile' && x[0].giveControl === false, 'a ficha entra no marcador e leva a quantidade, a atitude e o controle dele');
depois.push({ label: 'y', summons: [] });
depois[0].summons.push(sf.novaInvocacao('Urso', { actorUuid: 'Actor.urso' }));
ok(inv.encaixarNosMarcadores(JSON.parse(JSON.stringify(depois.slice(0, 1).map((y) => ({ ...y, summons: y.summons.slice(0, 1) })))), depois).length === 0
   && depois[0].summons.length === 2, 'sem marcador sobrando, a segunda ficha entra como entrada nova (do sistema)');
const mudancas = { system: { actions: JSON.parse(JSON.stringify(antes)) } };
mudancas.system.actions[0].summons.push(sf.novaInvocacao('Lobo', { actorUuid: 'Actor.lobo' }));
avisos.length = 0;
ganchos.preUpdateItem?.forEach((fn) => fn({ system: { actions: antes } }, mudancas));
ok(mudancas.system.actions[0].summons.length === 1 && mudancas.system.actions[0].summons[0].actorUuid === 'Actor.lobo'
   && avisos.some(([t, m]) => t === 'info' && /Lobo/.test(m)), 'gancho preUpdateItem: encaixa e avisa');
ok(inv.faltaFicha(antes[0]) && !inv.faltaFicha(mudancas.system.actions[0]) && !inv.faltaFicha({ summons: [] }),
   'falta a ficha: só quando a ação tem marcadores e nenhuma ficha');
// Clique na ficha do personagem numa ação que só tem marcador: avisa.
let ouvinte = null;
const el = { dataset: {}, addEventListener(t, fn) { ouvinte = fn; } };
const acaoComMarcador = { label: 'Invocar', summons: antes[0].summons };
const sheet = { element: el, document: { items: { get: () => ({ name: 'Invocar Animais', system: { actions: [acaoComMarcador] } }) } } };
inv.ligarNaFicha(sheet, el);
avisos.length = 0;
ouvinte?.({ target: { closest: (sel) => (sel.includes('itemRoll') ? { dataset: { actionIndex: '0' }, closest: () => ({ dataset: { itemId: 'i1' } }) } : null) } });
ok(avisos.some(([t, m]) => t === 'warn' && /falta a ficha da criatura \(Fera pequena\)/.test(m)), 'usar a ação sem a ficha avisa o que arrastar');

console.log('8) Validador: custo escolhido, invocações e os alvos novos');
const tmpd = fs.mkdtempSync(path.join(os.tmpdir(), 'invocacao-'));
fs.mkdirSync(`${tmpd}/packs-source/teste`, { recursive: true });
const base = doc('habilidades', 'Punição');
const variante = (n, mexe) => {
  const v = JSON.parse(JSON.stringify(base));
  v._id = `t${n}`;
  mexe(v.system.actions[0], v);
  fs.writeFileSync(`${tmpd}/packs-source/teste/${n}.json`, JSON.stringify(v));
};
const validar = () => {
  try { return { cod: 0, saida: execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(`${raiz}/scripts`)}); import validate; sys.exit(validate.main(${JSON.stringify(tmpd)}))`], { encoding: 'utf8' }) }; }
  catch (e) { return { cod: e.status, saida: `${e.stdout}${e.stderr}` }; }
};
variante(0, () => {});
ok(validar().cod === 0, 'a Punição do compêndio passa');
variante(1, (y) => { y.damage = '@gasto'; });
variante(2, (y) => { y.summons = [sf.novaInvocacao('', {})]; });
variante(3, (y) => { y.summons = [sf.novaInvocacao('Lobo', { disposition: 'aliada' })]; });
variante(4, (y) => { y.variableCost.areaBonus = '@gasto'; });
variante(5, (y, v) => { v.system.effects = [{ type: 'immune', target: 'condicao:voando', value: '1', level: 'all', label: 'x', enabled: true }]; });
variante(6, (y, v) => { v.system.effects = [{ type: 'bonus', target: 'resistir:cego', value: '1', level: 'all', label: 'x', enabled: true },
  { type: 'immune', target: 'efeito:veneno', value: '1', level: 'all', label: 'y', enabled: true }]; });
variante(7, (y) => { y.variableCost.rollBonus = '@gastod6'; });
const r = validar();
const linhas = r.saida.split('\n');
ok(r.cod === 1 && linhas.some((l) => /action\.damage usa @gasto .*só vale no custo escolhido/.test(l)), '@gasto fora do custo escolhido: erro');
ok(linhas.some((l) => /marcador de invocação sem nome/.test(l)), 'marcador sem nome: erro');
ok(linhas.some((l) => /summons\.disposition='aliada'/.test(l)), 'atitude fora das opções: erro');
ok(linhas.some((l) => /amplia a área, mas a ação é de alvo/.test(l)), 'área ampliada numa ação de alvo: erro');
ok(linhas.some((l) => /imunidade à condição 'voando'/.test(l)), 'imunidade a condição inexistente: erro');
ok(!linhas.some((l) => /resistir:cego|efeito:veneno/.test(l)), 'resistir:cego e imunidade a "efeito:veneno": válidos');
ok(linhas.some((l) => /variableCost\.rollBonus com dados/.test(l)), 'dados no bônus da rolagem: erro (só dano e cura aceitam)');
fs.rmSync(tmpd, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
