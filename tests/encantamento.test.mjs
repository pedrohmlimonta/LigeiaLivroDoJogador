// Testes do Encantamento de Itens: node tests/encantamento.test.mjs (após python3 scripts/generate.py)
// Confere o catálogo de propriedades do livro, a mana (1 PM por palavra; lendário e consumível sem
// mana), o que cada propriedade grava no item e — passando TODAS as propriedades por um item
// compatível — que o resultado passa no validador do schema do sistema (scripts/validate.py).
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
globalThis.Hooks = { on() {}, once() {} };
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

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
