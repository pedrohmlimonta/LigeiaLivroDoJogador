// Testes do Encantamento de Itens: node tests/encantamento.test.mjs (após python3 scripts/generate.py)
// Confere o catálogo de propriedades do livro, a mana (1 PM por palavra; lendário e consumível sem
// mana), o que cada propriedade grava no item e — passando TODAS as propriedades por um item
// compatível — que o resultado passa no validador do schema do sistema (scripts/validate.py).
// Também os itens conjuradores: a magia guardada, a descrição do que ela faz, o pergaminho, a
// magia vinculada que vem e vai com o item e as 70 magias do compêndio no validador.
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';

class ApplicationV2 {
  #state = 0;
  constructor(options = {}) { this.options = Object.freeze({ ...this.constructor.DEFAULT_OPTIONS, ...options }); }
  get state() { return this.#state; }
  async render() { this.#state = 2; return this; }
  async close() { this.#state = -1; }
}
globalThis.foundry = { utils: { escapeHTML: (s) => String(s) }, applications: { api: { ApplicationV2 } } };
const ganchos = {};
globalThis.Hooks = { on(nome, fn) { (ganchos[nome] ??= []).push(fn); }, once() {} };
globalThis.ui = { notifications: { info() {}, warn() {} } };
globalThis.document = { createElement: () => ({ className: '', innerHTML: '' }) };
globalThis.game = { user: { isGM: false }, packs: new Map(), items: [] };

const raiz = new URL('..', import.meta.url).pathname;
const mod = await import(new URL('../esmodules/encantamento.mjs', import.meta.url).href);
const { PROPRIEDADES, PALAVRAS, NIVEIS_ITEM, NOME_DO_NIVEL, construirEncantamento, desfazerEncantamento,
        tiposDoItem, compativel, variantesDoItem, variantePadrao, nivelMinimo, regraDe, contexto,
        automatizada, somarPreco, EncantamentoApp, eAtaque } = mod;

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
const MOD = 'ligeia-livro-do-jogador';

const equipamentos = fs.readdirSync(`${raiz}/packs-source/equipamentos`)
  .map((f) => JSON.parse(fs.readFileSync(`${raiz}/packs-source/equipamentos/${f}`, 'utf8')));
const eq = (nome) => {
  const d = equipamentos.find((x) => x.name === nome);
  if (!d) throw new Error(`equipamento ${nome}`);
  return JSON.parse(JSON.stringify(d));
};
const P = (id) => {
  const p = PROPRIEDADES.find((x) => x.id === id);
  if (!p) throw new Error(`propriedade ${id}`);
  return p;
};
const sintetico = (nome, categoria = '') => ({
  _id: 'sint', name: nome, type: 'equipamento', img: 'icons/svg/item-bag.svg', flags: {},
  system: { category: categoria, tags: [], tagsExtra: '', qty: 1, weight: 0, price: '10 Vo', notes: '',
    description: '', actions: [], enchantments: [], costsCumulative: false, noEnchant: false, fxFile: '',
    fxScale: '1', fxAaConfig: null, fxAaName: '', fxAaPersist: true, animOnActivate: true,
    mode: 'passive', active: false, effects: [], costs: [] },
});
const encantar = (item, nivel, ids, extra = {}) => construirEncantamento(item, {
  nivel, escolhas: ids.map((id) => ({ prop: P(id), palavra: P(id).palavra })), ...extra,
}, { animar: true });
const novas = (antes, depois) => depois.system.actions.filter((a) => String(a.label).startsWith('✦') || !antes.system.actions.some((b) => b.label === a.label));

console.log('1) Catálogo do livro (Sessão 11)');
ok(PROPRIEDADES.length === 262, `${PROPRIEDADES.length} propriedades`);
ok(PALAVRAS.length === 28, `${PALAVRAS.length} palavras arcanas com propriedades`);
ok(new Set(PROPRIEDADES.map((p) => p.id)).size === PROPRIEDADES.length, 'ids únicos');
ok(PROPRIEDADES.every((p) => p.variantes.length && p.variantes.every((v) => v.preco > 0 && [1, 2, 3].includes(v.nivel))),
   'toda propriedade tem preço(s) com nível 1/2/3');
ok(PROPRIEDADES.every((p) => p.tipos.length && p.texto.length > 30), 'todas com tipo de item e texto');
ok(PROPRIEDADES.every((p) => p.variantes.every((v) => v.cd === undefined || [10, 12, 14].includes(v.cd))),
   'dificuldades Normal/Difícil/Muito Difícil = 10/12/14');
ok(!PROPRIEDADES.some((p) => /Ritrak|Aruanky|Firyel|Marduk|Theodemar|Barbacurta|Liara/.test(p.texto)),
   'sem legendas de ilustração grudadas no texto');
const pcf = P('ignis-protecao-contra-fogo');
ok(pcf.variantes.map((v) => `${v.rotulo}:${v.preco}:${v.nivel}`).join(' ') ===
   'Proteção 1:400:1 Proteção 2:7000:2 Proteção 3:200000:3', 'Proteção Contra Fogo: +400 / +7.000 / +200.000');
const df = P('ignis-dano-flamejante');
ok(df.variantes.length === 9 && df.variantes.filter((v) => v.tipo === 'arma').map((v) => v.preco).join() === '1000,21000,600000',
   'Dano Flamejante (Variável): armas +1.000 / +21.000 / +600.000');
ok(P('vitae-cura').consumivel && P('acida-explosao-corrosiva').consumivel && P('lumo-solar').consumivel
   && !P('menso-equilibrio').consumivel, 'poções, bombas e pedras são consumíveis; pedra iônica não');

console.log('2) Tipo do item e nível da propriedade');
ok([...tiposDoItem(eq('Espada Longa'))].join() === 'arma,laminas_grandes,arma_corte', 'Espada Longa: arma de corte');
ok(!tiposDoItem(eq('Cota de Malha')).has('arma') && tiposDoItem(eq('Cota de Malha')).has('armadura'),
   'Cota de Malha: armadura (e não arma)');
ok(tiposDoItem(eq('Cajado')).has('cajado') && tiposDoItem(eq('Cajado')).has('arma_concussao'), 'Cajado: foco e arma de concussão');
ok(tiposDoItem(eq('Flechas')).has('municao'), 'Flechas: munição');
ok(compativel(pcf, tiposDoItem(eq('Cota de Malha'))) && !compativel(pcf, tiposDoItem(eq('Espada Longa'))),
   'Proteção Contra Fogo é para armaduras, não para espadas');
const T = tiposDoItem(eq('Espada Longa'));
ok(variantePadrao(df, 1, T).preco === 1000 && variantePadrao(df, 2, T).preco === 21000 && variantePadrao(df, 3, T).preco === 600000,
   'o nível do item escolhe o preço do Dano Flamejante (1/2/3 de dano)');
ok(variantesDoItem(df, 3, T).every((v) => v.tipo === 'arma'), 'numa arma, só os preços de Armas');
ok(variantePadrao(P('iluzio-invisibilidade'), 1, new Set(['anel'])) === null && nivelMinimo(P('iluzio-invisibilidade'), new Set(['anel'])) === 3,
   'Invisibilidade (+400.000) só cabe num item Maior');
ok(variantePadrao(P('acida-corrosiva'), 1, T) === null && variantePadrao(P('acida-corrosiva'), 2, T)?.preco === 30000,
   'Corrosiva numa arma (+30.000) pede item Intermediário; em munição (+1.000) cabe no Menor');
ok(variantePadrao(P('vitae-cura'), 1, new Set(['pocao'])).valor === 3, 'Poção de Cura: a de 3 PV também é preço Menor (+200)');

console.log('3) Espada Longa Intermediária: Dano Flamejante + Corrosiva');
let base = eq('Espada Longa');
let d = encantar(base, 'Intermediário', ['ignis-dano-flamejante', 'acida-corrosiva']);
let vs = d.system.actions.filter((a) => a.label.startsWith('✦ Ataque'));
ok(d.system.actions.filter((a) => !a.label.startsWith('✦')).length === base.system.actions.length,
   'os ataques comuns continuam lá, sem mana');
ok(vs.length === 2 && vs.every((a) => a.costMp === '2'), 'uma versão ✦ de cada ataque, custando 2 PM (2 palavras)');
ok(vs.every((a) => a.extraDamage.some((x) => x.formula === '2' && x.type === 'fogo' && !x.scaling)),
   '+2 de dano bruto de fogo (parcela extra, fixa)');
ok(vs.every((a) => a.appliesEffects.some((e) => e.fxTarget === 'dano_continuo' && e.tickType === 'acido'
   && e.resist && e.resistAttr === 'vigor' && !e.resistVsCast && e.resistDc === '10')),
   'Corrosiva: dano contínuo de ácido, Vigor (Normal = 10) anula');
ok(vs.every((a) => a.scalingDamage && a.damageType === 'corte'), 'o dano da arma continua Corte escalonado');
ok(d.system.price === '51.024 Vo', `preço: 24 Vo + 21.000 + 30.000 = ${d.system.price}`);
ok(d.system.description.includes('Corrosiva') && d.system.description.includes('2 PM'), 'texto do livro e mana na descrição');
const rec = d.flags[MOD].encantamentos[0];
ok(rec.nivel === 'Intermediário' && rec.pm === 2 && rec.propriedades.length === 2 && rec.palavras.join() === 'ignis,acida',
   'receita guardada no item');
ok(vs.every((a) => a.aaConfig?.metaData?.origem === MOD), 'as versões ✦ animam como a arma');
const lend = mod.refazerEncantamentos(d, { lendario: true }, { animar: true });
ok(lend.system.actions.length === base.system.actions.length && lend.system.actions.every((a) => a.costMp === '0'
   && a.extraDamage.some((x) => x.type === 'fogo' && x.formula === '2')) && mod.eLendario(lend) && lend.system.price === '51.024 Vo',
   'tornar lendário depois: refaz pela receita — o ataque carrega as propriedades, sem mana, mesmo preço');
const volta = mod.refazerEncantamentos(lend, { lendario: false }, { animar: true });
ok(JSON.stringify(volta.system.actions.map((a) => [a.label, a.costMp])) === JSON.stringify(d.system.actions.map((a) => [a.label, a.costMp])),
   'e voltar a gastar mana devolve as versões ✦ de 2 PM');
const desfeito = desfazerEncantamento(d);
ok(desfeito && desfeito['system.actions'].length === base.system.actions.length && desfeito['system.price'] === '24 Vo'
   && desfeito[`flags.${MOD}.encantamentos`].length === 0, 'desfazer volta ao item de antes');

console.log('4) Cota de Malha Maior: Proteção Contra Fogo + Proteção Contra Frio + Couraça');
base = eq('Cota de Malha');
d = encantar(base, 'Maior', ['ignis-protecao-contra-fogo', 'glacios-protecao-contra-frio', 'forjuri-couraca']);
const ativar = d.system.actions.find((a) => a.label.startsWith('✦ Ativar'));
ok(ativar && ativar.costMp === '3' && ativar.targetMode === 'self' && !ativar.canRoll,
   'ativação das constantes: 3 PM, em você');
ok(ativar.appliesEffects.some((e) => e.fxType === 'rd' && e.fxTarget === 'fogo' && e.fxValue === '3' && e.durationMode === 'scene')
   && ativar.appliesEffects.some((e) => e.fxType === 'rd' && e.fxTarget === 'frio' && e.fxValue === '3'),
   'Proteção 3 contra Fogo e Frio até o fim da cena');
ok(d.system.effects.length === base.system.effects.length, 'a armadura comum (RD física, penalidades) não muda nem cobra mana');
const cour = d.system.actions.find((a) => a.label.startsWith('✦ Couraça'));
ok(cour && cour.costMp === '3' && cour.appliesEffects[0].fxType === 'rd' && cour.appliesEffects[0].fxValue === '3',
   'Couraça (Ação Rápida): ação própria, 3 PM, +3 em todas as Proteções');

console.log('5) Lendário: sem mana');
d = encantar(base, 'Maior', ['ignis-protecao-contra-fogo', 'glacios-protecao-contra-frio', 'forjuri-couraca'], { lendario: true });
ok(!d.system.actions.some((a) => a.label.startsWith('✦ Ativar')), 'sem ação de ativar: as constantes ficam no item');
ok(d.system.effects.some((e) => e.type === 'rd' && e.damageType === 'fogo' && e.value === '3' && e.enabled)
   && d.system.effects.some((e) => e.type === 'rd' && e.damageType === 'frio' && e.value === '3'),
   'Proteção 3 contra Fogo e Frio como efeitos do item');
ok(novas(base, d).every((a) => a.costMp === '0'), 'nenhuma ação nova cobra mana');
d = encantar(eq('Espada Longa'), 'Menor', ['ignis-dano-flamejante'], { lendario: true });
ok(d.system.actions.length === 2 && d.system.actions.every((a) => a.extraDamage.some((x) => x.type === 'fogo' && x.formula === '1')),
   'arma lendária: o próprio ataque carrega o +1 de fogo, sem versão ✦ nem mana');

console.log('6) Casos especiais');
d = encantar(eq('Cajado'), 'Maior', ['forjuri-abjuracao', 'exitium-esmagador', 'vitae-vivido']);
const esm = d.system.actions.find((a) => a.label.includes('Esmagador'));
ok(esm.damageType === 'final' && !esm.scalingDamage && esm.extraDamage.some((x) => x.type === 'concussao' && x.scaling && x.formula === '0'),
   'Esmagador: o dano base vira final e o escalonado segue de Concussão');
ok(d.system.actions.find((a) => a.label.startsWith('✦ Ativar')).appliesEffects
  .some((e) => e.fxType === 'bonus' && e.fxTarget === 'conjuracao:forjuri' && e.fxValue === '3'),
   'Abjuração: +3 na Conjuração das magias de forjuri');
const anel = sintetico('Anel de Prata', 'Joia');
d = encantar(anel, 'Maior', ['iluzio-invisibilidade', 'iluzio-invisibilidade', 'iluzio-invisibilidade']);
ok(d.system.actions.length === 1 && d.system.actions[0].costMp === '3' && d.system.actions[0].appliesEffects[0].fxTarget === 'invisivel',
   'iluzio ×3 com a mesma propriedade: um Anel de Invisibilidade Maior (3 PM), propriedade contada uma vez');
ok(d.system.price === '400.010 Vo', 'preço da propriedade repetida contado uma vez');
const refeito = mod.refazerEncantamentos(d, { lendario: true });
ok(refeito.flags[MOD].encantamentos[0].palavras.join() === 'iluzio,iluzio,iluzio' && refeito.system.actions[0].costMp === '0',
   'refazer mantém as três palavras (item Maior) e o anel lendário não gasta mana');
const pocao = sintetico('Poção', 'Suprimento');
d = encantar(pocao, 'Intermediário', ['vitae-cura', 'energio-mana']);
ok(d.system.actions.every((a) => a.costMp === '0' && a.label.includes('consumível')), 'poção: consumível, não gasta mana');
ok(d.system.actions.some((a) => a.heal === '3' && a.healResource === 'hp') && d.system.actions.some((a) => a.heal === '3' && a.healResource === 'mp'),
   'Cura e Mana recuperam 3 PV e 3 PM');
d = encantar(sintetico('Bomba Alquímica'), 'Menor', ['acida-explosao-corrosiva']);
const bomba = d.system.actions[0];
ok(bomba.targetMode === 'area' && bomba.range === '10' && bomba.area === '2' && bomba.canRoll && bomba.rollAttr === 'agilidade'
   && bomba.defenseAttr === 'esquiva' && bomba.appliesEffects[0].resistVsCast, 'bomba: 10m, 2m de raio, Agilidade × Esquiva');
d = encantar(eq('Adaga'), 'Intermediário', ['devena-predador', 'inanis-ferida-arcana']);
const presa = d.system.actions.find((a) => a.label.includes('Predador'));
ok(presa && presa.damage === '3' && presa.extraDamage.some((x) => x.resource === 'mp' && x.formula === '2'),
   'Predador: versão "contra a presa" (+2 no dano base) com a Ferida Arcana junto');
d = encantar(sintetico('Botas'), 'Maior', ['krucigon-teletransporte', 'sorcdiron-agilidade-relampago', 'majesto-passo-dimensional']);
const tp = d.system.actions.find((a) => a.label.includes('Teletransporte'));
ok(tp.movement.enabled && tp.movement.kind === 'teleport' && tp.movement.who === 'self' && tp.movement.distance === 'floor(@deslocamento/2)',
   'Teletransporte: teleporta metade do Deslocamento');
ok(d.system.actions.find((a) => a.label.startsWith('✦ Ativar')).appliesEffects.some((e) => e.fxType === 'attr' && e.fxTarget === 'agilidade' && e.fxValue === '3'),
   'Agilidade Relâmpago: +3 em Agilidade');
ok(somarPreco('1 Va', 400) === '400 Vo' && somarPreco('24 Vo', 7000) === '7.024 Vo', 'preço somado (moedas menores viram só a propriedade)');

console.log('7) Todas as propriedades, num item compatível, passam no validador do schema');
const ITEM_DO_TIPO = {
  arma: 'Espada Longa', arma_corte: 'Espada Longa', arma_perfuracao: 'Adaga', arma_concussao: 'Maça',
  laminas_pequenas: 'Adaga', adaga: 'Adaga', dardo: 'Dardo', arco: 'Arco Longo', besta: 'Besta Leve', maca: 'Maça',
  martelo: 'Martelo de Guerra', arremesso: 'Azagaia', municao: 'Flechas', escudo: 'Escudo de Metal',
  manopla: 'Manoplas de Segurança', cajado: 'Cajado', orbe: 'Orbe', bastao: 'Bastão', varinha: 'Varinha',
  totem: 'Totem', simbolo: 'Símbolo Sagrado / Profano', instrumento: 'Instrumento Musical', espelho: 'Espelho',
  lanterna: 'Lanterna', mochila: 'Mochila (vazia)', saco_de_dormir: 'Saco de Dormir', estrepes: 'Estrepes',
  cantil: 'Cantil', oleo: 'Óleo', armadura: 'Cota de Malha',
};
const NOME_SINTETICO = { pedra_ionica: 'Pedra Iônica', pocao: 'Poção', bomba: 'Bomba Alquímica', qualquer: 'Anel' };
// Um item de cada tipo da propriedade (Corrosiva: munição, arma e braçadeira).
const itensPara = (prop) => prop.tipos.map((t) => (ITEM_DO_TIPO[t] ? eq(ITEM_DO_TIPO[t])
  : sintetico(NOME_SINTETICO[t] ?? t.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()))));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'encantamento-'));
fs.mkdirSync(`${tmp}/packs-source/encantados`, { recursive: true });
let n = 0;
let semCompat = 0;
let manaErrada = [];
let auto = 0;
for (const prop of PROPRIEDADES) {
  let mexe = false;
  for (const item of itensPara(prop)) {
  const tipos = tiposDoItem(item);
  if (!compativel(prop, tipos)) semCompat++;
  const minimo = nivelMinimo(prop, tipos);
  if (automatizada(regraDe(prop, contexto(prop, variantePadrao(prop, 3, tipos), tipos)))) mexe = true;
  for (const nivel of new Set([NOME_DO_NIVEL[minimo], 'Maior'])) {
    const N = NIVEIS_ITEM[nivel];
    for (const lendario of [false, true]) {
      const ids = Array(N.n).fill(prop.id);
      const out = encantar(item, nivel, ids, { lendario });
      const extras = novas(item, out);
      const esperado = (a) => (lendario || (prop.consumivel && !a.label.startsWith('✦ Ativar'))) ? '0' : String(N.pm);
      for (const a of extras) {
        if (a.label.startsWith('✦') && a.costMp !== esperado(a)) manaErrada.push(`${prop.id} ${nivel}${lendario ? ' lendário' : ''}: ${a.label} = ${a.costMp}`);
      }
      fs.writeFileSync(`${tmp}/packs-source/encantados/${String(n++).padStart(4, '0')}.json`,
        JSON.stringify({ ...out, _id: `enc${n}` }));
    }
  }
  }
  if (mexe) auto++;
}
ok(semCompat === 0, `cada propriedade achou um item do seu tipo (${semCompat} sem)`);
ok(manaErrada.length === 0, `mana: 1 PM por palavra; lendário e consumível 0 ${manaErrada.slice(0, 3).join(' | ')}`);
ok(auto >= 110, `${auto} de ${PROPRIEDADES.length} propriedades mexem na ficha sozinhas; as demais ficam como lembrete`);
let saida = '';
let codigo = 0;
try {
  saida = execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(`${raiz}scripts`)}); import validate; sys.exit(validate.main(${JSON.stringify(tmp)}))`], { encoding: 'utf8' });
} catch (e) { codigo = e.status; saida = `${e.stdout}${e.stderr}`; }
ok(codigo === 0, `${n} itens encantados validados: ${saida.trim().split('\n')[0]}`);
if (codigo) console.log(saida.split('\n').slice(0, 15).join('\n'));
fs.rmSync(tmp, { recursive: true, force: true });

console.log('8) A janela');
const ator = {
  name: 'Lyra', type: 'personagem', isOwner: true,
  items: [
    { id: 'p1', type: 'habilidade', name: 'Palavra Arcana [ignis]', system: { level: 'B' } },
    { id: 'p2', type: 'habilidade', name: 'Palavra Arcana [glacios]', system: { level: 'A' } },
    ...['Espada Longa', 'Cota de Malha'].map((nome, i) => {
      const raw = eq(nome);
      return { id: `e${i}`, type: 'equipamento', name: raw.name, system: raw.system, flags: {}, toObject: () => JSON.parse(JSON.stringify(raw)) };
    }),
  ],
};
const app = new EncantamentoApp(ator);
ok(app.palavras.size === 2 && app.palavras.get('ignis').nivel === 'B', 'palavras da ficha, com o nível');
app.forja.itemId = 'e1';
app.forja.nivel = 'Intermediário';
app.forja.slots[0].palavra = 'ignis';
app.forja.slots[1].palavra = 'glacios';
let html = (await app._renderHTML()).innerHTML;
ok(html.includes('Proteção Contra Fogo') && html.includes('Proteção Contra Frio'), 'lista as propriedades de cada palavra');
ok(html.includes('no <b>Avançado</b>') && (html.match(/no <b>Avançado<\/b>/g) || []).length === 1,
   'avisa que o livro pede Avançado só para a palavra no Básico');
ok(/name="prop0" value="ignis-protecao-contra-fogo"/.test(html) && !/value="ignis-dano-flamejante"/.test(html),
   'só as compatíveis com a armadura (as outras ficam atrás da caixa "mostrar também")');
ok(html.includes('data-action="encantar" disabled'), 'botão desligado até escolher as propriedades');
app.forja.slots[0].propId = 'ignis-protecao-contra-fogo';
app.forja.slots[1].propId = 'glacios-protecao-contra-frio';
html = (await app._renderHTML()).innerHTML;
ok(!html.includes('data-action="encantar" disabled') && html.includes('2 PM por uso') && html.includes('+14.000 Vo'),
   'resumo: 2 PM por uso, +14.000 Vo (Proteção 2 + Proteção 2)');
app.forja.lendario = true;
html = (await app._renderHTML()).innerHTML;
ok(html.includes('nenhuma (lendário)'), 'lendário: nenhuma mana');
app.forja.nivel = 'Menor';
app.forja.slots[0] = { palavra: 'ignis', propId: '', var: -1, todas: true };
html = (await app._renderHTML()).innerHTML;
ok(/value="ignis-imunidade-a-fogo"\s+disabled/.test(html), 'num item Menor, Imunidade a Fogo (+600.000) fica bloqueada');
ok(eAtaque({ label: 'Ataque — Adaga', isWeapon: true }) && !eAtaque({ label: '✦ Ataque — Adaga — X', isWeapon: true }),
   'as versões ✦ não viram base de novas versões');

console.log('9) Item conjurador: o item guarda uma magia');
const { construirItemConjurador, dadosDaMagiaDoItem, sincronizarMagiasDoItem, refazerEncantamentos, eLendario,
        propriedadesGravadas, resumoDaAcao, palavrasDaMagia } = mod;
const magias = fs.readdirSync(`${raiz}/packs-source/magias`)
  .map((f) => JSON.parse(fs.readFileSync(`${raiz}/packs-source/magias/${f}`, 'utf8')));
const magia = (nome) => {
  const d = magias.find((x) => x.name === nome);
  if (!d) throw new Error(`magia ${nome}`);
  return JSON.parse(JSON.stringify(d));
};
const receita = (d) => d.flags[MOD].encantamentos.at(-1);
const esfera = magia('Esfera Ígnea');
d = construirItemConjurador(eq('Varinha'), { magia: esfera });
let rc = receita(d);
ok(rc.tipo === 'magia' && rc.nivel === 'Menor' && rc.pm === 1 && rc.palavras.join() === 'ignis' && rc.magia.name === 'Esfera Ígnea',
   'Varinha + Esfera Ígnea: item conjurador Menor, 1 PM, palavra ignis, magia guardada no item');
const gat = d.system.actions;
ok(gat.length === 1 && gat[0].label === '✦ Esfera Ígnea (Conjuração vs Esquiva) — 1 PM' && gat[0].costMp === '0' && !gat[0].canRoll
   && gat[0].targetMode === 'none' && gat[0].preActivations[0]?.ref === 'action||0|Esfera Ígnea (Varinha)' && gat[0].preActivations[0]?.enabled,
   'o item ganha a ação da magia: "✦ Esfera Ígnea (Conjuração vs Esquiva) — 1 PM", que dispara a ação da magia vinculada');
ok(d.system.price === '420 Vo', 'preço +400 Vo (criar magia Menor)');
ok(propriedadesGravadas(d) === 1, 'a magia guardada conta como uma propriedade (Dureza)');
const desc = d.system.description;
ok(desc.includes('Item conjurador') && desc.includes('Como usar') && desc.includes('<b>1 PM</b>')
   && desc.includes('dano Fogo +1 (escalonado)') && desc.includes('rola Conjuração contra Esquiva dos alvos')
   && desc.includes('alcance 5m × Nível') && desc.includes('Dano contínuo de fogo') && desc.includes('runa da centelha'),
   'a descrição do item diz o que a magia faz (rolagem, alcance, dano, condição) e traz o texto dela');
let comp = dadosDaMagiaDoItem({ id: 'v1', name: d.name }, rc);
ok(comp.type === 'magia' && comp.name === 'Esfera Ígnea (Varinha)' && comp.system.tier === 'Menor' && comp.system.wordId === 'ignis'
   && comp.system.actions[0].costMp === '1' && comp.flags[MOD].doItem === 'v1' && comp.flags[MOD].encId === rc.id,
   'magia vinculada: uma magia de verdade (tipo, círculo e palavra — os bônus de palavra valem), 1 PM');
ok(comp.system.description.includes('Magia do item') && !comp.system.active, 'ela avisa de onde vem e começa desligada');
const maior = magia('Esfera Ígnea');
Object.assign(maior.system, { tier: 'Maior', wordId2: 'majesto', wordId3: 'majesto' });
maior.name = 'Tempestade da Chama';
maior.system.actions.forEach((a) => { a.costMp = '3'; });
d = construirItemConjurador(eq('Cajado'), { magia: maior });
rc = receita(d);
ok(rc.nivel === 'Maior' && rc.pm === 3 && palavrasDaMagia(maior).join() === 'ignis,majesto,majesto' && d.system.price === '200.020 Vo',
   'magia Maior (criada, 3 palavras): item conjurador Maior, 3 PM, +200.000 Vo');
ok(dadosDaMagiaDoItem({ id: 'c1', name: d.name }, rc).system.actions.every((a) => a.costMp === '3'), 'conjurar pelo item custa os 3 PM do círculo');
d = construirItemConjurador(eq('Varinha'), { magia: esfera, lendario: true });
comp = dadosDaMagiaDoItem({ id: 'v1', name: d.name }, receita(d));
ok(comp.system.actions.every((a) => a.costMp === '0') && comp.system.costs.length === 0 && d.system.description.includes('lendário')
   && d.system.actions[0].label.endsWith('— sem mana (lendário)'), 'lendário: conjura sem mana');
const pergaminho = eq('Pergaminho (em branco)');
d = construirItemConjurador(pergaminho, { magia: esfera });
rc = receita(d);
comp = dadosDaMagiaDoItem({ id: 'g1', name: d.name }, rc);
ok(d.name === 'Pergaminho de Esfera Ígnea' && rc.pergaminho && d.system.price === pergaminho.system.price,
   'pergaminho: vira "Pergaminho de Esfera Ígnea" (gravar custa os PM e 1 hora, não Vo)');
ok(comp.system.casting === 'Rodada completa (pergaminho)' && comp.system.actions.every((a) => a.costMp === '1' && a.label.includes('queima o pergaminho')),
   'conjurar do pergaminho também custa 1 PM, leva uma rodada completa e queima o pergaminho');
ok(d.system.description.includes('queima o pergaminho') && d.system.description.includes('também custa 1 PM')
   && d.system.actions[0].label === '✦ Esfera Ígnea (Conjuração vs Esquiva) — queima o pergaminho — 1 PM'
   && d.system.actions[0].preActivations[0].ref === 'action||0|Esfera Ígnea (Pergaminho de Esfera Ígnea)', 'e a descrição e a ação do pergaminho explicam isso');
d = construirItemConjurador(eq('Varinha'), { magia: magia('Imagem Ilusória') });
comp = dadosDaMagiaDoItem({ id: 'v2', name: d.name }, receita(d));
ok(comp.system.actions.length === 1 && comp.system.actions[0].label === 'Conjurar Imagem Ilusória (rolagem de Conjuração)'
   && comp.system.actions[0].canRoll && comp.system.actions[0].rollAttr === 'conjuracao' && comp.system.actions[0].costMp === '1'
   && comp.system.costs.length === 0 && d.system.actions[0].label === '✦ Conjurar Imagem Ilusória (rolagem de Conjuração) — 1 PM',
   'magia só descritiva: ganha "Conjurar" (rolagem de Conjuração, 1 PM) e o item a dispara');
// propriedades + magia no mesmo item; lendário depois; desfazer
let duplo = encantar(eq('Cajado'), 'Menor', ['forjuri-abjuracao']);
duplo = construirItemConjurador(duplo, { magia: esfera });
ok(propriedadesGravadas(duplo) === 2, 'o mesmo item pode ter propriedades e magia guardada');
const duploL = refazerEncantamentos(duplo, { lendario: true });
ok(eLendario(duploL) && duploL.flags[MOD].encantamentos.map((r) => r.tipo ?? 'propriedades').join() === 'propriedades,magia'
   && dadosDaMagiaDoItem({ id: 'x', name: duploL.name }, receita(duploL)).system.actions.every((a) => a.costMp === '0'),
   'tornar lendário refaz os dois encantamentos sem mana');
const volta2 = desfazerEncantamento(duplo);
ok(volta2[`flags.${MOD}.encantamentos`].length === 1 && !volta2['system.description'].includes('Item conjurador')
   && !volta2['system.actions'].some((a) => a.label.includes('Esfera Ígnea')), 'desfazer tira só a magia guardada (e as ações dela)');
ok(resumoDaAcao({ label: 'X', canRoll: false, targetMode: 'self', heal: 'ceil(@nivel/2)', healResource: 'hp', costMp: '2' })
   === 'em você · recupera metade do Nível (para cima) PV · 2 PM', 'resumo de cura com fórmula no jeito do livro');

console.log('10) A magia vinculada vem e vai com o item');
let seq = 0;
class AtorFalso {
  constructor(nome) { this.documentName = 'Actor'; this.name = nome; this._itens = []; this.apagados = []; }
  get items() { const lista = this._itens; return Object.assign([...lista], { get: (id) => lista.find((i) => i.id === id) }); }
  _pôr(dados) {
    const it = { ...JSON.parse(JSON.stringify(dados)), id: dados.id ?? dados._id ?? `i${++seq}`, parent: this };
    it.flags ??= {};
    it.delete = async () => { await this.deleteEmbeddedDocuments('Item', [it.id]); };
    it.toObject = () => { const { parent: _p, delete: _d, toObject: _t, update: _u, ...resto } = it; return JSON.parse(JSON.stringify(resto)); };
    it.update = async (mud) => {
      for (const [k, v] of Object.entries(mud)) {
        const ps = k.split('.');
        let o = it;
        while (ps.length > 1) { const pp = ps.shift(); o = (o[pp] ??= {}); }
        o[ps[0]] = v;
      }
    };
    this._itens.push(it);
    return it;
  }
  async createEmbeddedDocuments(_t, lista) { return lista.map((x) => this._pôr(x)); }
  async deleteEmbeddedDocuments(_t, ids) { this.apagados.push(...ids); this._itens = this._itens.filter((i) => !ids.includes(i.id)); return ids; }
  async updateEmbeddedDocuments(_t, lista) {
    for (const { _id, ...mud } of lista) await this._itens.find((i) => i.id === _id)?.update(mud);
    return lista;
  }
}
const vinc = (ator, id) => ator.items.filter((i) => i.type === 'magia' && i.flags?.[MOD]?.doItem === id);
const lyra = new AtorFalso('Lyra');
const varinha = lyra._pôr({ ...construirItemConjurador(eq('Varinha'), { magia: esfera }), id: 'var1' });
let r = await sincronizarMagiasDoItem(varinha);
ok(r.criadas === 1 && vinc(lyra, 'var1').length === 1 && vinc(lyra, 'var1')[0].name === 'Esfera Ígnea (Varinha)',
   'com o item na ficha, a magia "Esfera Ígnea (Varinha)" aparece');
r = await sincronizarMagiasDoItem(varinha);
ok(r.criadas === 0 && r.apagadas === 0 && vinc(lyra, 'var1').length === 1, 'sincronizar de novo não duplica');
const comoLendaria = refazerEncantamentos(varinha.toObject(), { lendario: true });
varinha.flags = comoLendaria.flags;
r = await sincronizarMagiasDoItem(varinha);
ok(r.apagadas === 1 && r.criadas === 1 && vinc(lyra, 'var1')[0].system.actions.every((a) => a.costMp === '0'),
   'tornou lendária: a magia vinculada é trocada pela sem mana');
// Como o sistema acha o alvo de uma ativação prévia: pelo id, senão pelo nome.
const resolver = (ator, ref) => {
  const [tipo, id, i, ...nome] = String(ref).split('|');
  const alvo = ator.items.get(id) ?? ator.items.find((x) => x.name === nome.join('|'));
  return tipo === 'action' && alvo ? { item: alvo, acao: alvo.system.actions[Number(i)] } : null;
};
// O select de ativação prévia da ficha do item (sistema, htmlDeOpcoesPre): uma opção por ação de cada
// item da ficha, "action|id|índice|nome". A referência guardada só aparece marcada — e sobrevive à
// próxima edição da ficha, que é salva a cada mudança — se for IGUAL a uma delas.
const opcoesDaFicha = (ator) => [...ator.items].flatMap((it) => (it.system?.actions ?? [])
  .map((_a, idx) => ['action', it.id, idx, String(it.name ?? '').replace(/\|/g, '/')].join('|')));
let disparo = resolver(lyra, varinha.system.actions[0].preActivations[0].ref);
ok(disparo?.item.type === 'magia' && disparo.item.flags[MOD].doItem === 'var1' && disparo.acao.label === 'Esfera Ígnea (Conjuração vs Esquiva)',
   'a ação ✦ do item acha a ação da magia vinculada (é ela que rola, com os bônus de palavra)');
varinha.name = 'Varinha do Fogo';
r = await sincronizarMagiasDoItem(varinha);
disparo = resolver(lyra, varinha.system.actions[0].preActivations[0].ref);
ok(r.renomeadas === 1 && r.referencias === 1 && vinc(lyra, 'var1')[0].name === 'Esfera Ígnea (Varinha do Fogo)' && disparo?.item.flags[MOD].doItem === 'var1',
   'renomeou o item: a magia acompanha e a ação ✦ continua achando ela');
const ana = new AtorFalso('Ana');
const varA = ana._pôr({ ...construirItemConjurador(eq('Varinha'), { magia: esfera }), id: 'varA' });
await Promise.all([mod.sincronizar(varA), mod.sincronizar(varA), mod.sincronizar(varA)]);
ok(vinc(ana, 'varA').length === 1, 'pedidos simultâneos de sincronizar não duplicam a magia');
// ganchos (rodam só para quem fez a mudança)
globalThis.game.user.id = 'u1';
globalThis.foundry.utils.hasProperty = (o, k) => k.split('.').reduce((x, p) => (x && typeof x === 'object' && p in x ? x[p] : undefined), o) !== undefined;
// Como o Foundry: todos os ganchos registrados para o evento (o de referências e o do encantamento).
const gancho = (nome) => async (...args) => { for (const fn of ganchos[nome] ?? []) await fn(...args); };
await gancho('deleteItem')?.(varinha, {}, 'u1');
await new Promise((res) => setTimeout(res, 0));
ok(vinc(lyra, 'var1').length === 0, 'item apagado da ficha: a magia vinculada vai junto');
const bruno = new AtorFalso('Bruno');
const orfa = bruno._pôr({ ...dadosDaMagiaDoItem({ id: 'var1', name: 'Varinha' }, receita(varinha)) });
await gancho('createItem')?.(orfa, {}, 'u1');
await new Promise((res) => setTimeout(res, 0));
ok(!bruno.items.get(orfa.id), 'magia vinculada arrastada sozinha para outra ficha é removida (sem o item, ela não existe)');
const daOutra = bruno._pôr({ ...construirItemConjurador(eq('Varinha'), { magia: esfera }), id: 'var2' });
await gancho('createItem')?.(daOutra, {}, 'u1');
await new Promise((res) => setTimeout(res, 0));
ok(vinc(bruno, 'var2').length === 1, 'o item que chega numa ficha traz a magia com ele');
await gancho('createItem')?.(bruno._pôr({ ...construirItemConjurador(eq('Varinha'), { magia: esfera }), id: 'var3' }), {}, 'u2');
await new Promise((res) => setTimeout(res, 0));
ok(vinc(bruno, 'var3').length === 0, 'só o cliente de quem fez a mudança mexe na ficha');

console.log('11) As 70 magias do compêndio em itens conjuradores passam no validador');
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'conjurador-'));
fs.mkdirSync(`${tmp2}/packs-source/conjuradores`, { recursive: true });
let n2 = 0;
for (const m of magias) {
  for (const [base, lendario] of [[eq('Varinha'), false], [eq('Pergaminho (em branco)'), false], [eq('Cajado'), true]]) {
    const it = construirItemConjurador(base, { magia: m, lendario });
    const c = dadosDaMagiaDoItem({ id: 'x', name: it.name }, receita(it));
    for (const doc of [it, c]) {
      fs.writeFileSync(`${tmp2}/packs-source/conjuradores/${String(n2++).padStart(4, '0')}.json`, JSON.stringify({ ...doc, _id: `cj${n2}` }));
    }
  }
}
let saida2 = '';
let codigo2 = 0;
try {
  saida2 = execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(`${raiz}scripts`)}); import validate; sys.exit(validate.main(${JSON.stringify(tmp2)}))`], { encoding: 'utf8' });
} catch (e) { codigo2 = e.status; saida2 = `${e.stdout}${e.stderr}`; }
ok(codigo2 === 0, `${n2} documentos (itens e magias vinculadas): ${saida2.trim().split('\n')[0]}`);
if (codigo2) console.log(saida2.split('\n').slice(0, 15).join('\n'));
fs.rmSync(tmp2, { recursive: true, force: true });

console.log('12) A janela no modo Item conjurador');
const perg3 = eq('Pergaminho (em branco)');
perg3.system.qty = 3;
const objeto = (raw, id) => ({ id, type: raw.type, name: raw.name, img: raw.img, system: raw.system, flags: raw.flags ?? {},
  toObject: () => JSON.parse(JSON.stringify(raw)) });
const maga = {
  name: 'Lyra', type: 'personagem', isOwner: true, system: { resources: { mp: { value: 5 } } },
  items: [
    { id: 'p1', type: 'habilidade', name: 'Palavra Arcana [ignis]', system: { level: 'B' } },
    objeto(magia('Esfera Ígnea'), 'm1'),
    { ...objeto(magia('Raio Arcano'), 'm9'), flags: { [MOD]: { doItem: 'zzz' } } },
    objeto(eq('Varinha'), 'e0'), objeto(perg3, 'e1'),
  ],
};
const app2 = new EncantamentoApp(maga);
Object.assign(app2.forja, { tipo: 'magia', itemId: 'e0' });
html = (await app2._renderHTML()).innerHTML;
ok(html.includes('Esfera Ígnea — Menor · ignis · 1 PM') && !html.includes('Raio Arcano —'),
   'lista as magias da ficha (não as vinculadas a outros itens)');
ok(html.includes('data-action="encantar" disabled'), 'botão desligado até escolher a magia');
app2.forja.magiaChave = 'ficha:m1';
html = (await app2._renderHTML()).innerHTML;
ok(html.includes('rola Conjuração contra Esquiva dos alvos') && html.includes('+400 Vo') && html.includes('Esfera Ígnea (Varinha)')
   && html.includes('Gravar magia no item') && !html.includes('data-action="encantar" disabled'),
   'prévia do que o item vai conjurar, preço e o nome da magia na ficha');
ok(html.includes('no <b>Avançado</b>'), 'avisa que o livro pede a palavra no Avançado');
app2.forja.itemId = 'e1';
html = (await app2._renderHTML()).innerHTML;
ok(html.includes('Pergaminho: gravar custa <b>1 PM</b> agora (de Lyra)') && html.includes('sai 1 da pilha de 3')
   && html.includes('Pergaminho de Esfera Ígnea'), 'pergaminho: avisa a mana da gravação e que separa um da pilha');

console.log('13) Gravar pela janela (o caminho que grava no item)');
const cora = new AtorFalso('Cora');
cora.type = 'personagem';
cora.system = { resources: { mp: { value: 5 } } };
cora.update = async (mud) => {
  for (const [k, v] of Object.entries(mud)) {
    const ps = k.split('.');
    let o = cora;
    while (ps.length > 1) { const pp = ps.shift(); o = (o[pp] ??= {}); }
    o[ps[0]] = v;
  }
};
cora._pôr({ id: 'pa', type: 'habilidade', name: 'Palavra Arcana [ignis]', system: { level: 'A' } });
cora._pôr({ ...magia('Esfera Ígnea'), id: 'mEsf' });
const espada = cora._pôr({ ...eq('Espada Longa'), id: 'esp' });
const pilha = cora._pôr({ ...eq('Pergaminho (em branco)'), id: 'pil' });
pilha.system.qty = 3;
const app3 = new EncantamentoApp(cora);
Object.assign(app3.forja, { tipo: 'magia', itemId: 'esp', magiaChave: 'ficha:mEsf' });
await app3.carregarMagias();
await app3.gravarMagia();
const acaoNaEspada = espada.system.actions.find((a) => a.label === '✦ Esfera Ígnea (Conjuração vs Esquiva) — 1 PM');
ok(!!acaoNaEspada && espada.system.actions.filter((a) => a.label.startsWith('Ataque')).length === 2,
   'gravar pela janela: a Espada Longa ganha a ação da magia (e os ataques dela continuam lá)');
ok(vinc(cora, 'esp').length === 1 && resolver(cora, acaoNaEspada.preActivations[0].ref)?.item.flags[MOD].doItem === 'esp',
   'a magia vinculada já está na ficha e a ação da espada dispara ela');
ok(acaoNaEspada.preActivations[0].ref === `action|${vinc(cora, 'esp')[0].id}|0|Esfera Ígnea (Espada Longa)`
   && opcoesDaFicha(cora).includes(acaoNaEspada.preActivations[0].ref),
   'a referência leva o id e o nome da magia vinculada: na ficha da espada ela aparece marcada e não se perde ao editar');
ok(espada.system.description.includes('O que a magia faz') && espada.system.price === '424 Vo', 'descrição e preço gravados no item');
const app4 = new EncantamentoApp(cora);
Object.assign(app4.forja, { tipo: 'magia', itemId: 'pil', magiaChave: 'ficha:mEsf' });
await app4.carregarMagias();
await app4.gravarMagia();
const escrito = cora.items.find((i) => i.name === 'Pergaminho de Esfera Ígnea');
ok(pilha.system.qty === 2 && escrito?.system.qty === 1 && cora.system.resources.mp.value === 4,
   'pergaminho pela janela: sai um da pilha e gravar custa 1 PM a quem grava');
ok(escrito && vinc(cora, escrito.id).length === 1 && escrito.system.actions.some((a) => a.label.includes('queima o pergaminho')),
   'o pergaminho escrito tem a ação da magia e a magia vinculada');

console.log('14) Ações ✦ em outras fichas, itens gravados na 0.2.8 e o Sequencer');
const gatilho = (it) => it.system.actions.find((a) => String(a.label).startsWith('✦'));
const dani = new AtorFalso('Dani');
const alabarda = dani._pôr({ ...construirItemConjurador(eq('Alabarda'), { magia: esfera }), id: 'ala' });
await sincronizarMagiasDoItem(alabarda);
ok(gatilho(alabarda).preActivations[0].ref === `action|${vinc(dani, 'ala')[0].id}|0|Esfera Ígnea (Alabarda)`
   && opcoesDaFicha(dani).includes(gatilho(alabarda).preActivations[0].ref),
   'Alabarda + Esfera Ígnea: a ação ✦ aponta para a magia vinculada com id e nome (igual à opção da ficha)');
const eva = new AtorFalso('Eva');
const copia = eva._pôr({ ...alabarda.toObject(), id: 'ala2' });
await gancho('createItem')?.(copia, {}, 'u1');
await mod.sincronizar(copia);
ok(vinc(eva, 'ala2').length === 1 && gatilho(copia).preActivations[0].ref === `action|${vinc(eva, 'ala2')[0].id}|0|Esfera Ígnea (Alabarda)`,
   'levada para outra ficha: a ação ✦ passa a apontar para a magia vinculada de lá');
const compE = vinc(eva, 'ala2')[0];
await eva.updateEmbeddedDocuments('Item', [{ _id: compE.id, name: 'Bola de Fogo' }]);
await gancho('updateItem')?.(compE, { name: 'Bola de Fogo' }, {}, 'u1');
await mod.sincronizar(copia);
ok(vinc(eva, 'ala2')[0].name === 'Esfera Ígnea (Alabarda)' && opcoesDaFicha(eva).includes(gatilho(copia).preActivations[0].ref),
   'magia vinculada renomeada à mão volta ao nome do item (e a ação ✦ continua marcada)');
// Como a 0.2.8 gravava: sem a ação ✦ no item, receita sem "gatilhos", a descrição antiga.
const como028 = (dados) => {
  const d = JSON.parse(JSON.stringify(dados));
  d.system.actions = d.system.actions.filter((a) => !String(a.label).startsWith('✦'));
  for (const rc2 of d.flags[MOD].encantamentos) delete rc2.gatilhos;
  d.system.description = d.system.description
    .replace('usa as ações <b>✦</b> dele e conjura', 'conjura')
    .replace('a magia também aparece', 'a magia aparece')
    .replace('— é ela que as ações ✦ disparam, e ela sai junto com o item.</p>', '— e sai junto com ele.</p>');
  return d;
};
const fred = new AtorFalso('Fred');
const velha = fred._pôr({ ...como028(construirItemConjurador(eq('Alabarda'), { magia: esfera })), id: 'alaV' });
fred._pôr(dadosDaMagiaDoItem(velha, receita(velha)));
const qtdAntes = velha.system.actions.length;
r = await sincronizarMagiasDoItem(velha);
ok(r.migrado && velha.system.actions.length === qtdAntes + 1 && gatilho(velha)?.label === '✦ Esfera Ígnea (Conjuração vs Esquiva) — 1 PM'
   && receita(velha).gatilhos && r.apagadas === 1 && r.criadas === 1 && vinc(fred, 'alaV').length === 1,
   'Alabarda gravada na 0.2.8 (sem a ação): ganha a ação ✦ e a magia vinculada é refeita');
ok(opcoesDaFicha(fred).includes(gatilho(velha).preActivations[0].ref)
   && resolver(fred, gatilho(velha).preActivations[0].ref)?.acao.label === 'Esfera Ígnea (Conjuração vs Esquiva)',
   'e a ação ✦ dela dispara a magia vinculada');
ok(velha.system.description.includes('usa as ações <b>✦</b> dele') && velha.system.description.includes('é ela que as ações ✦ disparam')
   && !velha.system.description.includes('— e sai junto com ele.'), 'a descrição antiga é acertada');
r = await sincronizarMagiasDoItem(velha);
ok(!r.migrado && !r.criadas && !r.apagadas && !r.referencias && velha.system.actions.filter((a) => String(a.label).startsWith('✦')).length === 1,
   'só uma vez: sincronizar de novo não muda nada');
const gil = new AtorFalso('Gil');
const ala3 = gil._pôr({ ...encantar(como028(construirItemConjurador(eq('Alabarda'), { magia: esfera })), 'Menor', ['ignis-dano-flamejante']), id: 'ala3' });
await sincronizarMagiasDoItem(ala3);
const desfeitoAla = desfazerEncantamento(ala3.toObject());
ok(desfeitoAla['system.actions'].some((a) => String(a.label).startsWith('✦ Esfera Ígnea')) && desfeitoAla[`flags.${MOD}.encantamentos`].length === 1,
   'desfazer um encantamento feito depois da magia não leva a ação ✦ junto');
const hugo = new AtorFalso('Hugo');
const varI = hugo._pôr({ ...como028(construirItemConjurador(eq('Varinha'), { magia: magia('Imagem Ilusória') })), id: 'varI' });
const comp028 = dadosDaMagiaDoItem(varI, receita(varI));
comp028.system.actions = [];
hugo._pôr(comp028);
await sincronizarMagiasDoItem(varI);
ok(resolver(hugo, gatilho(varI).preActivations[0].ref)?.acao?.label === 'Conjurar Imagem Ilusória (rolagem de Conjuração)',
   'magia só descritiva da 0.2.8: a magia vinculada volta com a ação "Conjurar", que a ação ✦ dispara');
const limbo = new AtorFalso('limbo');
const doMundo = limbo._pôr({ ...como028(construirItemConjurador(eq('Varinha'), { magia: esfera })), id: 'w1' });
doMundo.parent = null;
r = await sincronizarMagiasDoItem(doMundo);
ok(r.migrado && !!gatilho(doMundo) && vinc(limbo, 'w1').length === 0,
   'item do mundo (fora de ficha) também ganha a ação ✦; a magia vinculada só nasce numa ficha');
const ivo = new AtorFalso('Ivo');
const varIvo = ivo._pôr({ ...como028(construirItemConjurador(eq('Varinha'), { magia: esfera })), id: 'varIvo' });
const doMundo2 = limbo._pôr({ ...como028(construirItemConjurador(eq('Cajado'), { magia: esfera })), id: 'w2' });
doMundo2.parent = null;
const jogo = { actors: globalThis.game.actors, items: globalThis.game.items, users: globalThis.game.users };
Object.assign(globalThis.game, { actors: [ivo], items: [doMundo2], users: { activeGM: { id: 'u1' } } });
globalThis.game.user.isGM = false;
ok(await mod.conferirItensConjuradores() === 0 && !gatilho(varIvo), 'ao abrir o mundo, só o Mestre confere os itens');
globalThis.game.user.isGM = true;
const nMig = await mod.conferirItensConjuradores();
ok(nMig === 2 && !!gatilho(varIvo) && !!gatilho(doMundo2) && vinc(ivo, 'varIvo').length === 1
   && opcoesDaFicha(ivo).includes(gatilho(varIvo).preActivations[0].ref),
   'o Mestre, ao abrir o mundo, completa os itens da 0.2.8 (das fichas e do mundo)');
ok(await mod.conferirItensConjuradores() === 0, 'na vez seguinte não há o que completar');
Object.assign(globalThis.game, jogo);
globalThis.game.user.isGM = false;
// O sistema encerra o visual de um efeito chamando Sequencer.EffectManager.endEffects SOLTO da classe.
class GerenteFalso {
  static _validateFilters(f) { return f?.origin || f?.name ? f : false; }
  static async endEffects(f = {}, push = true) {
    const v = this._validateFilters(f);
    if (!v) throw new Error('filtro');
    return { ...v, push };
  }
}
const seqFalso = { EffectManager: GerenteFalso };
let erroSolto = null;
const solto = seqFalso.EffectManager.endEffects;
try { await solto({ origin: 'x' }); } catch (e) { erroSolto = e; }
ok(erroSolto instanceof TypeError && /_validateFilters/.test(erroSolto.message),
   'sem o ajuste, a chamada solta quebra como no Sequencer 4.3 ("reading \'_validateFilters\'")');
ok(mod.prenderEndEffects(seqFalso) && !mod.prenderEndEffects(seqFalso), 'o ajuste prende endEffects ao EffectManager (uma vez só)');
const soltoDepois = seqFalso.EffectManager.endEffects;
const fim1 = await soltoDepois({ origin: 'x' });
const fim2 = await seqFalso.EffectManager.endEffects({ name: 'y' }, false);
ok(fim1.origin === 'x' && fim1.push === true && fim2.name === 'y' && fim2.push === false,
   'com o ajuste, a chamada solta funciona e a normal continua igual (com os mesmos argumentos)');

console.log('15) Item conjurador com magia em cadeia (sistema build 27)');
const sf = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);
const refs = await import(new URL('../esmodules/referencias.mjs', import.meta.url).href);
const baseDe = (nome) => { const m = magia(nome); return { id: m._id, name: m.name, system: m.system, toObject: () => JSON.parse(JSON.stringify(m)) }; };
const meta = (p, n) => sf.METAMAGIAS[p].find((m) => m.name === n);
const invisivel = await sf.construirMagia({ base: baseDe('Esfera Ígnea'), tier: 'Intermediária', nome: 'Esfera Invisível', palavra1: 'ignis',
  palavra2: 'iluzio', palavra3: '', pecs: [], ajuste: 0, meta2: meta('iluzio', 'Magia Invisível'), meta3: null, escolha2: {}, escolha3: {} });
const lr = (ref) => refs.lerRef(ref);
ok(invisivel.system.actions.length === 3 && invisivel.system.actions[0].costMp === '2', 'a magia criada: a principal (2 PM) e as duas de bastidor da Magia Invisível');
const hana = new AtorFalso('Hana');
const ala4 = hana._pôr({ ...construirItemConjurador(eq('Alabarda'), { magia: { ...invisivel, toObject: () => JSON.parse(JSON.stringify(invisivel)) } }), id: 'ala4' });
const gat4 = ala4.system.actions.filter((a) => String(a.label).startsWith('✦'));
ok(gat4.length === 1 && gat4[0].label === '✦ Esfera Ígnea (Conjuração vs Esquiva) — 2 PM',
   'a Alabarda ganha só a ação que se usa (✦ ... — 2 PM): as de bastidor vão junto, pela magia vinculada');
await sincronizarMagiasDoItem(ala4);
const comp4 = vinc(hana, 'ala4')[0];
const a0 = comp4?.system.actions[0];
ok(comp4 && comp4.id === lr(a0.preActivations[0].ref).id && lr(a0.chainActions[0].ref).id === comp4.id
   && lr(a0.chainActions[0].ref).nome === 'Esfera Invisível (Alabarda)' && opcoesDaFicha(hana).includes(a0.chainActions[0].ref)
   && opcoesDaFicha(hana).includes(a0.preActivations[0].ref),
   'na magia vinculada, a ativação prévia e a cadeia apontam para ELA (id e nome dela, marcadas na ficha)');
ok(resolver(hana, gatilho(ala4).preActivations[0].ref)?.acao === a0 && a0.chainActions[0].when === 'always',
   'a ação ✦ da Alabarda dispara a principal da magia vinculada, que puxa a Invisível antes e o fim do efeito depois');
ala4.name = 'Alabarda Sombria';
await sincronizarMagiasDoItem(ala4);
const comp4b = vinc(hana, 'ala4')[0];
ok(comp4b.name === 'Esfera Invisível (Alabarda Sombria)' && lr(comp4b.system.actions[0].chainActions[0].ref).nome === 'Esfera Invisível (Alabarda Sombria)'
   && opcoesDaFicha(hana).includes(comp4b.system.actions[0].chainActions[0].ref) && opcoesDaFicha(hana).includes(gatilho(ala4).preActivations[0].ref),
   'renomeou o item: a magia vinculada, a cadeia dela e a ação ✦ acompanham');
const perg4 = construirItemConjurador(eq('Pergaminho (em branco)'), { magia: { ...invisivel, toObject: () => JSON.parse(JSON.stringify(invisivel)) } });
const comp4p = dadosDaMagiaDoItem({ id: 'pg4', name: perg4.name }, receita(perg4));
ok(comp4p.system.actions[0].label.endsWith('queima o pergaminho') && !comp4p.system.actions[1].label.includes('queima')
   && !comp4p.system.actions[2].label.includes('queima'), 'pergaminho: "queima o pergaminho" só na ação que se usa');
const lend4 = dadosDaMagiaDoItem({ id: 'cl4', name: 'Cajado' }, receita(construirItemConjurador(eq('Cajado'), { magia: invisivel, lendario: true })));
ok(lend4.system.actions.every((a) => a.costMp === '0') && /^[A-Za-z0-9]{16}$/.test(lend4._id), 'lendário: nada cobra mana; a magia vinculada já nasce com id próprio');
const desc4 = ala4.system.description;
ok(desc4.includes('(dispara sozinha, sem custo)') && desc4.includes('antes da rolagem: Magia Invisível') && desc4.includes('depois, em cadeia: Magia Invisível: fim do efeito'),
   'a descrição do item mostra o que a principal dispara antes e depois, e quais ações vêm sozinhas');
const vamp = await sf.construirMagia({ base: baseDe('Esfera Ígnea'), tier: 'Intermediária', nome: '', palavra1: 'ignis',
  palavra2: 'mortis', palavra3: '', pecs: [], ajuste: 0, meta2: meta('mortis', 'Magia Vampírica'), meta3: null, escolha2: {}, escolha3: {} });
const dvamp = construirItemConjurador(eq('Varinha'), { magia: vamp }).system.description;
ok(dvamp.includes('você recupera PV do dano escalonado'), 'o resumo da ação conta o dreno (Magia Vampírica)');
const rest = await sf.construirMagia({ base: baseDe('Curar'), tier: 'Intermediária', nome: '', palavra1: 'vitae', palavra2: 'vitae', palavra3: '',
  pecs: [], ajuste: 0, meta2: meta('vitae', 'Magia Restauradora'), meta3: null, escolha2: { condicao: 'cego' }, escolha3: {} });
ok(construirItemConjurador(eq('Varinha'), { magia: rest }).system.description.includes('tira dos alvos 1 efeito de Cego'),
   'e a remoção de efeito (Magia Restauradora)');
const lam = encantar(eq('Espada Longa'), 'Intermediário', ['mortis-lamina-vampirica']);
const lamAtq = lam.system.actions.filter((x) => String(x.label).startsWith('✦'));
ok(lamAtq.length === 2 && lamAtq.every((x) => x.drain?.enabled && x.drain.resource === 'hp' && x.drain.from === 'scaling'),
   'propriedade Lâmina Vampírica: os ataques encantados drenam o dano escalonado como PV (dreno do sistema)');
const missil2 = await sf.construirMagia({ base: baseDe('Míssil Mágico'), tier: 'Intermediária', nome: '', palavra1: 'exitium', palavra2: 'pluribus',
  palavra3: '', pecs: [], ajuste: 0, meta2: meta('pluribus', 'Magia Múltipla'), meta3: null, escolha2: {}, escolha3: {} });
const jade = new AtorFalso('Jade');
const varM = jade._pôr({ ...construirItemConjurador(eq('Varinha'), { magia: missil2 }), id: 'varM' });
await sincronizarMagiasDoItem(varM);
const compM = vinc(jade, 'varM')[0];
const eloM = compM.system.actions[0].chainActions[0];
ok(varM.system.actions.filter((x) => String(x.label).startsWith('✦')).length === 1 && eloM?.targets === 'pick'
   && lr(eloM.ref).id === compM.id && opcoesDaFicha(jade).includes(eloM.ref),
   'Míssil Mágico com Magia Múltipla numa varinha: uma ✦ só, e a magia vinculada leva a cópia do 2º alvo (escolhido na hora), apontando para ela');
ok(varM.system.description.includes('com o alvo escolhido na hora'), 'a descrição da varinha conta que o 2º alvo é escolhido na hora');
ok(JSON.stringify(compM.system.actions[1].aaConfig) === JSON.stringify(compM.system.actions[0].aaConfig) && !!compM.system.actions[0].aaConfig,
   'na magia vinculada, a cópia do 2º alvo continua com a mesma animação da principal');
// Ganchos das referências: a magia chega numa ficha com outro id (cópia, compêndio) ou muda de nome.
const ivy = new AtorFalso('Ivy');
const copiaMagia = ivy._pôr({ ...JSON.parse(JSON.stringify(invisivel)), _id: undefined, id: 'outroIdQualquer1' });
await gancho('createItem')?.(copiaMagia, {}, 'u1');
await new Promise((res) => setTimeout(res, 0));
ok(copiaMagia.system.actions[0].chainActions.every((c) => lr(c.ref).id === 'outroIdQualquer1') && opcoesDaFicha(ivy).includes(copiaMagia.system.actions[0].chainActions[0].ref),
   'magia com cadeia copiada para outra ficha (id novo): as referências passam a usar o id novo');
const opts = {};
await gancho('preUpdateItem')?.(copiaMagia, { name: 'Esfera da Sombra' }, opts);
copiaMagia.name = 'Esfera da Sombra';
await gancho('updateItem')?.(copiaMagia, { name: 'Esfera da Sombra' }, opts, 'u1');
await new Promise((res) => setTimeout(res, 0));
ok([...copiaMagia.system.actions[0].preActivations, ...copiaMagia.system.actions[0].chainActions].every((c) => lr(c.ref).nome === 'Esfera da Sombra')
   && opcoesDaFicha(ivy).includes(copiaMagia.system.actions[0].chainActions[0].ref), 'renomeou a magia: as referências acompanham o nome');
ok(refs.normalizarAutoRefs(copiaMagia, { id: copiaMagia.id, nome: copiaMagia.name }) === 0, 'e já estão no formato certo (nada a mudar)');
// Validador: magias criadas com cada metamagia que encadeia, gravadas em varinha, pergaminho e cajado lendário.
const tmp3 = fs.mkdtempSync(path.join(os.tmpdir(), 'conjurador-cadeia-'));
fs.mkdirSync(`${tmp3}/packs-source/conjuradores`, { recursive: true });
let n3 = 0;
const combos = [['Esfera Ígnea', 'ignis', 'krucigon', 'Magia Planar', {}], ['Esfera Ígnea', 'ignis', 'krucigon', 'Magia Planar', { quem: 'voce' }],
  ['Esfera Ígnea', 'ignis', 'iluzio', 'Magia Invisível', {}], ['Esfera Ígnea', 'ignis', 'iluzio', 'Magia Furtiva', {}],
  ['Esfera Ígnea', 'ignis', 'exitium', 'Magia Potencializada', {}], ['Esfera Ígnea', 'ignis', 'mortis', 'Magia Vampírica', {}],
  ['Curar', 'vitae', 'vitae', 'Magia Restauradora', { quem: 'voce', condicao: 'lento' }], ['Imagem Ilusória', 'iluzio', 'vitae', 'Magia Curativa', { quem: 'voce' }],
  ['Raio Arcano', 'energio', 'krucigon', 'Magia Etérea', {}], ['Escudo Arcano', 'forjuri', 'ignis', 'Magia Ardente', {}],
  ['Esfera Ígnea', 'ignis', 'menso', 'Magia Telecinética', {}], ['Causar Medo', 'carmo', 'sorcdiron', 'Magia Revigorante', { quem: 'voce' }],
  ['Míssil Mágico', 'exitium', 'pluribus', 'Magia Múltipla', {}], ['Nuvem Tóxica', 'noxia', 'pluribus', 'Magia Replicante', {}],
  ['Míssil Mágico', 'exitium', 'pluribus', 'Magia Replicante', {}]];
for (const [b0, p1, p2, mn, e2] of combos) {
  const sp = await sf.construirMagia({ base: baseDe(b0), tier: 'Intermediária', nome: '', palavra1: p1, palavra2: p2, palavra3: '',
    pecs: [], ajuste: 0, meta2: meta(p2, mn), meta3: null, escolha2: e2, escolha3: {} });
  fs.writeFileSync(`${tmp3}/packs-source/conjuradores/${String(n3++).padStart(4, '0')}.json`, JSON.stringify(sp));
  for (const [b1, lend] of [['Varinha', false], ['Pergaminho (em branco)', false], ['Cajado', true]]) {
    const it = { ...construirItemConjurador(eq(b1), { magia: sp, lendario: lend }), _id: `it${String(n3).padStart(14, '0')}` };
    const c = dadosDaMagiaDoItem({ id: it._id, name: it.name }, receita(it));
    for (const doc of [it, c]) fs.writeFileSync(`${tmp3}/packs-source/conjuradores/${String(n3++).padStart(4, '0')}.json`, JSON.stringify(doc));
  }
}
let saida3 = '';
let codigo3 = 0;
try {
  saida3 = execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(`${raiz}scripts`)}); import validate; sys.exit(validate.main(${JSON.stringify(tmp3)}))`], { encoding: 'utf8' });
} catch (e) { codigo3 = e.status; saida3 = `${e.stdout}${e.stderr}`; }
ok(codigo3 === 0, `${n3} documentos (magias com cadeia, itens e magias vinculadas): ${saida3.trim().split('\n')[0]}`);
if (codigo3) console.log(saida3.split('\n').slice(0, 15).join('\n'));
fs.rmSync(tmp3, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
