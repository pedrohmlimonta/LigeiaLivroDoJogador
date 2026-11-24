// Testes das PECULIARIDADES na Criação de Magias: node tests/peculiaridades.test.mjs
// (após python3 scripts/generate.py). Toda peculiaridade das 70 magias do
// livro tem regra — muda a magia criada (⚙) ou fica registrada (✎) —, as que
// mudam mudam mesmo, as alternativas se excluem e tudo passa no validador.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

// ApplicationV2 de teste: guarda os ouvintes da janela por seletor, para o
// teste disparar os cliques como a janela de verdade.
const ouvintes = new Map();
class ApplicationV2 {
  #state = 0;
  #element = null;
  options;
  position = {};
  constructor(options = {}) { this.options = Object.freeze({ ...this.constructor.DEFAULT_OPTIONS, ...options }); }
  get state() { return this.#state; }
  get element() { return this.#element; }
  get id() { return 'app-1'; }
  get title() { return this.options.window?.title ?? ''; }
  get window() { return {}; }
  get rendered() { return this.#state === 2; }
  async render() {
    ouvintes.clear();
    const conteudo = { filho: null, replaceChildren(x) { this.filho = x; },
      querySelectorAll(sel) { return [{ addEventListener(ev, fn) { ouvintes.set(`${sel}|${ev}`, fn); } }]; } };
    this.#element = conteudo;
    this._replaceHTML(await this._renderHTML(), conteudo);
    this.#state = 2;
    return this;
  }
  async close() { this.#state = -1; }
}
globalThis.foundry = { utils: { escapeHTML: (s) => String(s) }, applications: { api: { ApplicationV2 } } };
globalThis.Hooks = { on() {}, once() {} };
globalThis.ui = { notifications: { info() {}, warn() {} } };
globalThis.document = { createElement: () => ({ className: '', innerHTML: '' }) };
const dir = new URL('../packs-source/magias/', import.meta.url).pathname;
const brutos = fs.readdirSync(dir).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')));
const comoDoc = (raw) => ({ id: raw._id, name: raw.name, type: 'magia', system: raw.system,
  toObject() { return JSON.parse(JSON.stringify({ _id: raw._id, name: raw.name, type: 'magia', img: raw.img, system: raw.system, flags: {} })); } });
const todas = brutos.map(comoDoc);
globalThis.game = { packs: new Map([['ligeia-livro-do-jogador.magias', { getDocuments: async () => todas }]]), items: [] };
const sf = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
const base = (nome) => todas.find((d) => d.name === nome);
const pecsDe = (nome, ...res) => sf.parsePeculiaridades(base(nome)).filter((p) => res.some((r) => r.test(p.texto)));
const criar = (nome, tier, res = [], extra = {}) => sf.construirMagia({ base: base(nome), tier, nome: '', palavra1: base(nome).system.wordId,
  pecs: pecsDe(nome, ...res), ajuste: 0, ...extra }, { animar: false });
const receita = (d) => d.flags['ligeia-livro-do-jogador'].receita;
const efeitos = (d) => d.system.actions.flatMap((a) => a.appliesEffects ?? []);
const ORDEM = ['Menor', 'Intermediária', 'Maior'];

console.log('1) Cobertura: toda peculiaridade das 70 magias tem regra, e as que mudam a magia mudam');
let total = 0, mudam = 0, semRegra = [], naoAplicaram = [];
for (const b of todas) {
  for (const p of sf.parsePeculiaridades(b)) {
    total++;
    if (!sf.regraDaPeculiaridade(p.texto, b.name)) { semRegra.push(`${b.name}: ${p.texto}`); continue; }
    const tier = ORDEM.find((t) => p.circulos.has(t));
    const d = await sf.construirMagia({ base: b, tier, nome: '', palavra1: b.system.wordId, pecs: [p], ajuste: 0 }, { animar: false });
    const r = receita(d).peculiaridades[0];
    if (p.muda) { mudam++; if (!r.aplicada) naoAplicaram.push(`${b.name} (${tier}): ${p.texto}`); }
    else if (r.aplicada) naoAplicaram.push(`${b.name}: ${p.texto} — marcada ✎ mas aplicada`);
  }
}
ok(todas.length === 70 && total > 300, `${total} peculiaridades em ${todas.length} magias`);
ok(!semRegra.length, `todas têm regra${semRegra.length ? `; sem: ${semRegra.slice(0, 5).join(' | ')}` : ''}`);
ok(!naoAplicaram.length && mudam > 120, `as ${mudam} que mudam a magia mudaram, sozinhas, no menor círculo em que valem${naoAplicaram.length ? `; falharam: ${naoAplicaram.slice(0, 5).join(' | ')}` : ''}`);

console.log('2) Saeculorum — Velocidade: a ação a mais muda de tipo');
let d = await criar('Velocidade', 'Menor');
let fx = efeitos(d)[0];
ok(fx.fxType === 'action' && fx.fxTarget === 'acao:movement' && fx.fxValue === '1', 'base: +1 ação de movimento por turno');
d = await criar('Velocidade', 'Menor', [/reação adicional/]);
fx = efeitos(d)[0];
ok(fx.fxTarget === 'acao:reaction' && fx.fxValue === '1' && /\+1 reação por rodada/.test(d.system.actions[0].label) && /\+1 reação/.test(fx.label),
   '"uma reação adicional (em vez de movimento)": +1 reação (acao:reaction), no nome da ação e do efeito');
d = await criar('Velocidade', 'Intermediária', [/uma ação adicional/]);
ok(efeitos(d)[0].fxTarget === 'acao:standard' && efeitos(d)[0].fxValue === '1', '"uma ação adicional": +1 ação padrão (acao:standard)');
d = await criar('Velocidade', 'Maior', [/um turno adicional/]);
ok(efeitos(d)[0].fxTarget === 'acao:turno' && efeitos(d)[0].fxValue === '1', '"um turno adicional": acao:turno +1 (+1 de cada ação, sistema build 32)');
d = await criar('Velocidade', 'Maior', [/dois turnos adicionais/]);
ok(efeitos(d)[0].fxTarget === 'acao:turno' && efeitos(d)[0].fxValue === '2', '"dois turnos adicionais": acao:turno +2');
d = await criar('Velocidade', 'Intermediária', [/um turno adicional/]);
ok(efeitos(d)[0].fxTarget === 'acao:movement' && receita(d).peculiaridades.length === 0, 'o turno adicional (só Maior) não vale no Intermediário');
d = await criar('Velocidade', 'Menor', [/1 ponto de dano por rodada/]);
fx = efeitos(d)[0];
ok(fx.tickAmount === '1' && fx.fxTarget === 'acao:movement' && d.system.actions[0].rollBonus === '2',
   '"sofre 1 ponto de dano por rodada": o efeito fere 1 por turno enquanto dura (e +2 na Conjuração)');
d = await criar('Velocidade', 'Maior', [/reação adicional/, /uma ação adicional/, /um turno adicional/, /dois turnos/, /1 ponto de dano/]);
fx = efeitos(d);
ok(fx.length === 1 && fx[0].fxTarget === 'acao:turno' && fx[0].fxValue === '2' && fx[0].tickAmount === '1'
   && d.system.actions[0].rollBonus === String(-10 + 2) && receita(d).peculiaridades.length === 2,
   'as quatro alternativas marcadas: vale só a de maior desconto (dois turnos, −10), no efeito e no bônus; o dano soma +2');

console.log('3) Saeculorum — Lentidão: lento e sem reações; imobilizado; paralisado');
d = await criar('Lentidão', 'Menor');
fx = efeitos(d);
ok(fx.length === 2 && fx[0].fxTarget === 'lento' && fx[0].resist && fx[0].resistAttr === 'agilidade'
   && fx[1].fxType === 'action' && fx[1].fxTarget === 'acao:reaction' && fx[1].fxValue === '-1' && fx[1].resistAttr === 'agilidade',
   'base: Lento e −1 reação por rodada (sem reações), cada um anulado com Agilidade');
d = await criar('Lentidão', 'Intermediária', [/imobilizado/]);
fx = efeitos(d);
ok(fx.length === 2 && fx[0].fxTarget === 'imobilizado' && /^Imobilizado/.test(fx[0].label) && fx[1].fxTarget === 'acao:reaction'
   && d.system.actions[0].rollBonus === '-2', '"imobilizado e não pode fazer reações": Imobilizado no lugar do Lento, continua sem reações (−2)');
d = await criar('Lentidão', 'Maior', [/paralisado/]);
fx = efeitos(d);
ok(fx.length === 1 && fx[0].fxTarget === 'paralisado' && fx[0].resistAttr === 'agilidade',
   '"paralisado": só o Paralisado (que já tira todas as ações, a reação também)');
d = await criar('Lentidão', 'Maior', [/imobilizado/, /paralisado/]);
ok(efeitos(d).length === 1 && efeitos(d)[0].fxTarget === 'paralisado' && d.system.actions[0].rollBonus === '-4',
   'as duas marcadas: alternativas — fica o Paralisado (−4), não somam');
ok(sf.parsePeculiaridades(base('Lentidão')).filter((p) => p.grupo === 'lentidao').length === 2, 'a janela sabe que são alternativas (mesmo grupo)');

console.log('4) Saeculorum — Viagem Temporal');
d = await criar('Viagem Temporal', 'Intermediária', [/uma hora pro passado/, /Duração \(Uma cena\)/]);
let a = d.system.actions[0];
ok(/uma hora ao passado/.test(a.label) && d.system.duration === 'Uma cena' && a.costHeroic === '1',
   'uma hora ao passado/futuro e Duração (Uma cena); o ponto heróico continua');
d = await criar('Viagem Temporal', 'Maior', [/uma hora pro/, /um dia pro/, /Uma cena\)/, /Uma hora\)/, /perde 1 ponto de vida/]);
a = d.system.actions[0];
ok(/um dia ao passado/.test(a.label) && d.system.duration === 'Uma hora' && a.costHp === '1' && a.rollBonus === String(-6 - 8 + 1),
   'Maior com tudo marcado: um dia (vale o maior), uma hora de duração, 1 PV ao conjurar ("perde 1 ponto de vida quando conjura")');

console.log('5) Outras peculiaridades que mudam a magia');
d = await criar('Míssil Mágico', 'Menor', [/2 mísseis/, /sofre 1 ponto de dano/]);
a = d.system.actions[0];
const copias = d.system.actions.slice(1);
ok(a.costHp === '1' && a.chainActions.length === 2 && a.chainActions.every((c) => c.targets === 'pick' && c.when === 'always')
   && copias.length === 2 && copias.every((c) => c.costMp === '0' && c.actionCost === 'none' && c.damage === a.damage),
   'Míssil Mágico: 2 mísseis a mais em cadeia, cada um com o alvo escolhido na hora, sem PM nem ação; 1 PV ao conjurar');
d = await criar('Revelar Passado', 'Menor');
ok(d.system.actions.length === 2 && d.system.actions[0].chainActions[0]?.when === 'hit' && d.system.actions[1].targetMode === 'self'
   && d.system.actions[1].appliesEffects[0].fxTarget === 'atordoado' && d.system.actions[1].actionCost === 'none',
   'Revelar Passado (base): o alvo e você ficam atordoados (você em cadeia, se a visão acontecer)');
d = await criar('Revelar Passado', 'Menor', [/conjurador não fica/]);
ok(d.system.actions.length === 1 && !d.system.actions[0].chainActions.length && d.system.actions[0].appliesEffects.length === 1,
   '"O conjurador não fica atordoado": a ação em cadeia sai (e a referência a ela também)');
d = await criar('Revelar Passado', 'Menor', [/alvo não fica/]);
ok(d.system.actions[0].appliesEffects.length === 0 && d.system.actions.length === 2, '"O alvo não fica atordoado": tira o Atordoado do alvo');
d = await criar('Esvaziar a Mente', 'Maior', [/atordoado, em vez de pasmo/]);
ok(efeitos(d).map((e) => e.fxTarget).join() === 'atordoado', 'Esvaziar a Mente: Atordoado no lugar do Pasmo');
d = await criar('Esvaziar a Mente', 'Menor', [/Emanação/]);
a = d.system.actions[0];
ok(a.targetMode === 'aura' && a.area === '3' && a.range === '' && a.includeSelf === false, 'Alcance (Emanação) e Área (3m): emanação de 3m em volta de você');
d = await criar('Esvaziar a Mente', 'Menor', [/Emanação/, /Toque/]);
ok(d.system.actions[0].targetMode === 'aura' && d.system.actions[0].rollBonus === '-5', 'Toque e Emanação são alternativas: fica a emanação (−5)');
d = await criar('Explodir', 'Menor', [/aumenta para 2/]);
ok(d.system.actions[0].costHp === '2' && /sofre 2 de dano final/.test(d.system.actions[0].label), 'Explodir: você sofre 2 de dano final ao conjurar');
d = await criar('Controlar a Terra', 'Intermediária', [/Pode movê-la/]);
const mover = d.system.actions.find((x) => /mover a terra/.test(x.label));
ok(mover && mover.actionCost === 'standard' && mover.costMp === '0' && d.system.actions[0].actionCost === 'standard',
   'Controlar a Terra: ganha a ação de mover a terra (gasta a ação padrão, sem PM)');
d = await criar('Controlar a Terra', 'Intermediária', [/Pode movê-la/], { palavra2: 'saeculorum', meta2: sf.METAMAGIAS.saeculorum.find((m) => m.kind === 'acelerada') });
ok(d.system.actions[0].actionCost === 'simple' && d.system.actions.find((x) => /mover a terra/.test(x.label))?.actionCost === 'standard',
   '…com a Magia Acelerada, conjurar sai na ação rápida, mas mover a terra continua sendo a sua ação');
d = await criar('Aumento Arcano', 'Maior', [/três efeitos/]);
const amais = d.system.actions.filter((x) => /efeito a mais/.test(x.label));
ok(amais.length === 5 && amais.every((x) => x.costMp === '0' && x.actionCost === 'none'), 'Aumento Arcano (três efeitos): os efeitos a mais da mesma conjuração, sem PM nem ação');
d = await criar('Barreira Arcana', 'Maior', [/Alcance \(Aura\)/, /atordoados/, /pasmos/]);
a = d.system.actions[0];
ok(a.targetMode === 'aura' && a.persistArea && efeitos(d).length === 1 && efeitos(d)[0].fxTarget === 'atordoado' && efeitos(d)[0].resistAttr === 'mente',
   'Barreira Arcana: Aura (acompanha você) e, dos pasmos/atordoados, o Atordoado (Mente anula)');
d = await criar('Barreira Arcana', 'Menor');
ok(d.system.actions[0].targetMode === 'area' && d.system.actions[0].range === '1' && d.system.actions[0].areaFilter === 'enemies',
   'Barreira Arcana (base): emanação que fica no lugar (área no seu espaço), só os inimigos rolam');
const arm = sf.parsePeculiaridades(base('Armadura Arcana')).filter((p) => /^Outro tipo|^Um tipo/.test(p.texto));
arm[0].escolha = { damageType: 'frio' };
arm[1].escolha = { damageType: 'raio' };
d = await sf.construirMagia({ base: base('Armadura Arcana'), tier: 'Maior', nome: '', palavra1: 'forjuri', pecs: arm, ajuste: 0 }, { animar: false });
ok(efeitos(d).map((e) => `${e.fxTarget}${e.fxValue}`).join() === 'frio3,raio3' && /Proteção 3 contra Frio e Raio/.test(d.system.actions[0].label)
   && receita(d).peculiaridades.every((p) => p.escolha?.damageType),
   'Armadura Arcana: "outro tipo" (Frio) troca as três; "um tipo adicional" (Raio) soma — com a escolha guardada na receita');
d = await criar('Armadura Arcana', 'Maior', [/Alvo muda/]);
ok(d.system.actions[0].targetMode === 'target' && d.system.actions[0].isMelee && d.system.actions[0].includeSelf, 'Alvo muda de Conjurador para Criatura: toque, em você ou noutra criatura');
d = await criar('Toque Vampírico', 'Menor', [/pontos de magia, em vez/]);
ok(d.system.actions[0].drain.resource === 'mp', 'Toque Vampírico: o dreno devolve PM');
d = await criar('Restaurar', 'Maior', [/todas as condições/]);
ok(d.system.actions[0].removesEffects.length === Object.keys(sf.CONDICOES_NEGATIVAS).length, 'Restaurar: tira todas as condições negativas');
d = await criar('Curar', 'Maior', [/regeneração/]);
ok(efeitos(d).some((e) => e.tickHealAmount === '1' && e.fxType === 'bonus'), 'Curar: regeneração de 1 PV por rodada até o fim da cena');
d = await criar('Reparar', 'Maior', [/Repara 5/]);
ok(d.system.actions[0].heal === '5' && d.system.actions[0].scalingHeal, 'Reparar: 5 pontos de base (e o escalonado continua)');
d = await criar('Telecinésia', 'Maior', [/mover o alvo 15m/]);
ok(d.system.actions[0].movement.distance === '15', 'Telecinésia: move o alvo até 15m');
d = await criar('Telepatia', 'Intermediária', [/5km/]);
ok(d.system.actions[0].range === '10000*@nivel', 'Telepatia: alcance 5km × Círculo × Nível');
d = await criar('Invocar os Mortos', 'Maior', [/quatro vezes/, /três vezes/]);
ok(/Desafio até 4× Nível/.test(d.system.actions[0].summons[0].actorName) && d.system.actions[0].rollBonus === '-8',
   'Invocar os Mortos: o marcador pede Desafio até 4× Nível (vale o maior)');
d = await criar('Causar Medo', 'Menor', [/imobilizados/, /paralisados/]);
ok(efeitos(d).map((e) => e.fxTarget).join() === 'abalado,paralisado' && efeitos(d)[1].resistAttr === 'mente',
   'Causar Medo: imobilizados ou paralisados são alternativas — fica o Paralisado (Mente anula), junto do Abalado');
d = await criar('Nuvem Tóxica', 'Maior', [/imobilizado/, /cego/, /atordoado/, /enfraquecido/]);
ok(efeitos(d).map((e) => e.fxTarget).join() === 'dano_continuo,imobilizado,cego,atordoado,enfraquecido' && efeitos(d).slice(1).every((e) => e.resistAttr === 'vigor'),
   'Nuvem Tóxica: as quatro condições somam (escadas diferentes), cada uma com Vigor anula');
d = await criar('Rajada Sônica', 'Maior', [/sônico contínuo/]);
fx = efeitos(d).find((e) => e.fxTarget === 'dano_continuo');
ok(fx?.tickType === 'sonico' && fx.tickAmount === '1' && fx.resistAttr === 'vigor' && fx.label === 'Dano contínuo sônico (Vigor anula)',
   'Rajada Sônica: dano sônico contínuo (Vigor anula)');
d = await criar('Toque Venenoso', 'Maior', [/fica paralisado enquanto/]);
fx = efeitos(d).find((e) => e.fxTarget === 'paralisado');
ok(fx?.resist && fx.resistAttr === 'vigor' && /enquanto sofrer o dano contínuo/.test(fx.label), 'Toque Venenoso: Paralisado enquanto sofre o dano contínuo (anula como ele)');
d = await criar('Melhoria Arcana', 'Intermediária', [/rolar 1 em um dado/]);
ok(efeitos(d).some((e) => e.fxType === 'reroll1' && e.fxAll && e.fxTarget === 'forca'), 'Melhoria Arcana: re-rola os 1 do atributo');
d = await criar('Escuridão', 'Intermediária', [/terreno difícil/]);
ok(efeitos(d).some((e) => e.fxTarget === 'lento' && e.durationMode === 'rounds'), 'Escuridão: a área vira terreno difícil (Lento dentro dela)');
d = await criar('Tempestade Mental', 'Menor', [/cai no chão/]);
ok(efeitos(d).some((e) => e.fxTarget === 'caido'), 'Tempestade Mental: o alvo cai no chão');
d = await criar('Força da Natureza', 'Menor', [/afeta você/]);
ok(d.system.actions[0].persistAffectsSelf && d.system.actions[0].range === '1', 'Força da Natureza: o terreno afeta você (e a emanação é em volta de você)');
d = await criar('Aumentar', 'Maior', [/3 categorias/]);
ok(efeitos(d).map((e) => e.fxValue).join() === '3,2,2', 'Aumentar: +3 categorias, 2D em Força e Vigor');
d = await criar('Diminuir', 'Intermediária', [/2 categorias/]);
ok(efeitos(d).map((e) => e.fxValue).join() === '-2,1', 'Diminuir: −2 categorias, 1D em Agilidade');

console.log('6) As registradas (✎): só o bônus e a anotação');
d = await criar('Corrosão', 'Menor', [/terreno/, /Dureza/]);
ok(d.system.actions[0].targetMode === 'area' && d.system.actions[0].rollBonus === '0' && receita(d).peculiaridades.every((p) => !p.aplicada && p.efeito),
   'Corrosão (terreno +2, Dureza −2): a ação não muda; a soma entra na Conjuração; cada uma registrada com o que faz');
ok(/✎ A magia só funciona/.test(d.system.description) && /registrada: /.test(d.system.description), 'a descrição marca cada uma: ⚙ na magia / ✎ registrada');
d = await criar('Velocidade', 'Menor', [/reação adicional/]);
ok(/⚙ O alvo recebe uma reação adicional/.test(d.system.description) && /na magia: \+1 reação por rodada/.test(d.system.description),
   'e a que muda diz o que mudou');

console.log('7) A janela: ⚙/✎, alternativas que se desmarcam e a escolha do tipo de dano');
const criadas = [];
const ator = { name: 'Cronomante', items: [
    { type: 'habilidade', name: 'Palavra Arcana [saeculorum]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [forjuri]', system: { level: 'B' } }],
  async createEmbeddedDocuments(tipo, lista) { criadas.push(...lista); return lista.map((x) => ({ ...x, sheet: null })); } };
const app = sf.abrirCriacaoDeMagia(ator);
// Maior: três palavras (saeculorum + Magia Duradoura, que só fica registrada).
Object.assign(app.forja, { palavra1: 'saeculorum', tier: 'Maior', palavra2: 'saeculorum', meta2i: 0, palavra3: 'saeculorum', meta3i: 0 });
await app.render();
app.forja.baseId = app.bases.find((x) => x.name === 'Velocidade')?.id;
await app.render();
let html = app.element.filho.innerHTML;
ok(html.includes('⚙ muda a magia criada') && html.includes('title="Muda a magia criada">⚙') && html.includes('title="Só fica registrada')
   && (html.match(/class="pec-alt"/g) ?? []).length === 4, 'Velocidade: ⚙ nas que mudam, ✎ nas registradas e ⇄ nas quatro alternativas');
const pecs = app.pecsAtuais;
const idx = (re) => pecs.findIndex((p) => re.test(p.texto));
const marcar = async (i, sim = true) => { ouvintes.get('input[name=pec]|change')({ target: { value: String(i), checked: sim } }); await app.render(); };
await marcar(idx(/reação adicional/));
await marcar(idx(/um turno adicional/));
ok(app.forja.pecsMarcadas.has(idx(/um turno adicional/)) && !app.forja.pecsMarcadas.has(idx(/reação adicional/)),
   'marcar o turno adicional desmarca a reação adicional (alternativas)');
await marcar(idx(/1 ponto de dano/));
ok(app.forja.pecsMarcadas.size === 2 && app.element.filho.innerHTML.includes('Bônus de Conjuração: <b>-6</b>'), 'o dano por rodada soma com a escolhida (−8 +2 = −6)');
await app.criar();
let nova = criadas.at(-1);
ok(nova?.system.actions[0].appliesEffects[0].fxTarget === 'acao:turno' && nova.system.actions[0].appliesEffects[0].tickAmount === '1',
   'criou a Velocidade com +1 turno e o dano por rodada');
const app2 = sf.abrirCriacaoDeMagia(ator);
Object.assign(app2.forja, { palavra1: 'forjuri', tier: 'Menor' });
await app2.render();
app2.forja.baseId = app2.bases.find((x) => x.name === 'Armadura Arcana')?.id;
await app2.render();
const iOutro = app2.pecsAtuais.findIndex((p) => /^Outro tipo de dano/.test(p.texto));
ouvintes.get('input[name=pec]|change')({ target: { value: String(iOutro), checked: true } });
await app2.render();
ok(app2.element.filho.innerHTML.includes(`name="pec-dtype" data-pec="${iOutro}"`), 'Armadura Arcana: marcar "Outro tipo de dano" pede o tipo');
ouvintes.get('select[name=pec-dtype]|change')({ target: { value: 'fogo', dataset: { pec: String(iOutro) } } });
ouvintes.get('select[name=pec-dtype]|change')({ target: { value: 'acido', dataset: { pec: String(iOutro) } } });
await app2.criar();
nova = criadas.at(-1);
ok(nova?.system.actions[0].appliesEffects.map((e) => e.fxTarget).join() === 'acido', 'criou a Armadura Arcana com a Proteção contra Ácido (o tipo escolhido)');

console.log('8) Cada magia, em cada círculo, com todas as peculiaridades que valem nele, passa no validador');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'peculiaridades-'));
fs.mkdirSync(`${tmp}/packs-source/criadas`, { recursive: true });
let n = 0;
for (const b of todas) {
  for (const tier of ['Menor', 'Intermediária', 'Maior', 'Lendária (4 palavras)']) {
    const efetivo = sf.tierEfetivo(tier);
    const pecs = sf.parsePeculiaridades(b).filter((p) => p.circulos.has(efetivo));
    const extra = {};
    const { circ } = sf.TIERS[tier];
    for (let k = 2; k <= circ; k++) { extra[`palavra${k}`] = b.system.wordId; extra[`meta${k}`] = null; }
    const doc = await sf.construirMagia({ base: b, tier, nome: '', palavra1: b.system.wordId, pecs, ajuste: 0, ...extra }, { animar: false });
    fs.writeFileSync(`${tmp}/packs-source/criadas/${String(n++).padStart(4, '0')}.json`, JSON.stringify(doc));
  }
}
let saida = '';
let codigo = 0;
try { saida = execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(new URL('../scripts', import.meta.url).pathname)}); import validate; sys.exit(validate.main(${JSON.stringify(tmp)}))`], { encoding: 'utf8' }); }
catch (e) { codigo = e.status; saida = `${e.stdout}${e.stderr}`; }
ok(codigo === 0, `${n} magias criadas: ${saida.trim().split('\n')[0]}`);
if (codigo) console.log(saida.split('\n').slice(0, 15).join('\n'));
fs.rmSync(tmp, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
