// Testes da Criação de Magias: node tests/spellforge.test.mjs (após python3 scripts/generate.py)
import fs from 'fs';

// ApplicationV2 de teste com a mesma superfície pública do Foundry v13: os
// getters (state, element, id, title, window...) não têm setter, então uma
// subclasse que atribua a um deles quebra aqui exatamente como quebra no
// Foundry ("Cannot set property state ... which has only a getter").
class ApplicationV2 {
  #state = 0;
  #element = null;
  options;
  position = {};
  tabGroups = {};
  constructor(options = {}) { this.options = Object.freeze({ ...this.constructor.DEFAULT_OPTIONS, ...options }); }
  get state() { return this.#state; }
  get element() { return this.#element; }
  get id() { return 'app-1'; }
  get title() { return this.options.window?.title ?? ''; }
  get window() { return {}; }
  get form() { return null; }
  get rendered() { return this.#state === 2; }
  get minimized() { return false; }
  get hasFrame() { return true; }
  get classList() { return undefined; }
  async render() {
    const conteudo = { filho: null, replaceChildren(x) { this.filho = x; }, querySelectorAll() { return []; } };
    this.#element = conteudo;
    this._replaceHTML(await this._renderHTML(), conteudo);
    this.#state = 2;
    return this;
  }
  async close() { this.#state = -1; }
}
globalThis.foundry = { utils: { escapeHTML: (s)=>String(s) }, applications: { api: { ApplicationV2 } } };
globalThis.Hooks = { on(){}, once(){} };
globalThis.ui = { notifications: { info(){}, warn(){} } };
globalThis.document = { createElement: () => ({ className: '', innerHTML: '' }) };
const dir=new URL('../packs-source/magias/', import.meta.url).pathname;
const todas = fs.readdirSync(dir).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8')))
  .map((raw) => ({ id: raw._id, name: raw.name, type: 'magia', system: raw.system,
    toObject() { return JSON.parse(JSON.stringify({ _id: raw._id, name: raw.name, type: 'magia', img: raw.img, system: raw.system, flags: {} })); } }));
globalThis.game = { packs: new Map([['ligeia-livro-do-jogador.magias', { getDocuments: async () => todas }]]), items: [] };
const mod = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);
const load=(p)=>{ const f=fs.readdirSync(dir).find(x=>x.startsWith(p));
  const raw=JSON.parse(fs.readFileSync(`${dir}/${f}`,'utf8'));
  return { name: raw.name, system: raw.system,
    toObject(){ return JSON.parse(JSON.stringify({name:raw.name,type:'magia',img:raw.img,system:raw.system,flags:{}})); } }; };
let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
const M = mod.METAMAGIAS;
const criar = (base, tier, p1, p2, p3, m2, m3, pecs=[]) => mod.construirMagia({ base, tier, nome:'', palavra1:p1, palavra2:p2, palavra3:p3, pecs, ajuste:0, meta2:m2, meta3:m3, escolha2:{}, escolha3:{} });

console.log('1) Exemplo do Pedro — Raio Arcano + Flamejante (ignis) + Eletrizante (fulgur), Maior');
let b = load('raio-arcano');
let d = await criar(b, 'Maior', 'energio','ignis','fulgur', M.ignis.find(m=>m.name==='Magia Flamejante'), M.fulgur.find(m=>m.name==='Magia Eletrizante'));
let a = d.system.actions[0];
ok(a.damageType === 'raio', `tipo de dano = ${a.damageType} (3ª palavra prevalece)`);
ok(a.damage === '4', `dano = ${a.damage} (aprimoramento gratuito do Maior "Energia +4"; metamagia não soma)`);
ok(a.costMp === '3', `custo = ${a.costMp} PM`);
ok(a.range === '15*@nivel', `alcance = ${a.range} (5m x Nível x Círculo 3)`);

console.log('2) Rajada Ácida Intermediária — dano +2 gratuito, alcance x2, peculiaridade só-Menor ignorada');
b = load('rajada-acida');
const pecs = mod.parsePeculiaridades(b);
const gest = pecs.find(p => /gestuais/.test(p.texto)); const toque = pecs.find(p => /Toque/.test(p.texto));
d = await criar(b, 'Intermediária', 'acida','ignis','', M.ignis[0], null, [gest, toque]);
a = d.system.actions[0];
ok(a.damage === '2', `dano = ${a.damage}`);
ok(a.rollBonus === '2', `bônus = ${a.rollBonus} (Toque +2; "gestuais (apenas Menor)" fora)`);
ok(a.isMelee === true && a.range === '', 'Alcance (Toque) torna a magia de toque');
ok(a.costMp === '2', `custo = ${a.costMp} PM`);
ok(a.appliesEffects.some(x=>x.tickType==='fogo'), 'Magia Ardente adicionou dano contínuo de fogo');

console.log('3) Curar Maior — cura 3 gratuita');
d = await criar(load('curar_'), 'Maior', 'vitae','sorcdiron','vitae', M.sorcdiron[1], M.vitae[1]);
ok(d.system.actions[0].heal === '3', `cura = ${d.system.actions[0].heal}`);
ok(d.system.actions.some(x=>x.appliesEffects?.some(e=>e.fxType==='bonus' && e.tickHealAmount==='1')), 'Regeneradora cria regeneração duradoura (não restore)');

console.log('4) Armadura Arcana Intermediária — Proteção 2 gratuita');
d = await criar(load('armadura-arcana'), 'Intermediária', 'forjuri','energio','', M.energio[0], null);
const rds = d.system.actions[0].appliesEffects.filter(x=>x.fxType==='rd').map(x=>x.fxValue);
ok(rds.every(v=>v==='2') && rds.length===3, `RD = ${rds.join('/')}`);

console.log('5) Causar Medo (área "Nível") + Ampliada — área dobrada');
d = await criar(load('causar-medo'), 'Intermediária', 'carmo','majesto','', M.majesto[0], null);
ok(d.system.actions[0].area === '2*(@nivel)', `área = ${d.system.actions[0].area}`);

console.log('6) Slots: "Nível x Círculo" e "3m x Círculo x Nível"');
ok(mod.slotFormula('Nível x Círculo', 2) === '2*@nivel', mod.slotFormula('Nível x Círculo', 2));
ok(mod.slotFormula('3m x Círculo x Nível', 3) === '9*@nivel', mod.slotFormula('3m x Círculo x Nível', 3));
ok(mod.slotFormula('1m x Nível', 3) === '@nivel', mod.slotFormula('1m x Nível', 3));
ok(mod.slotFormula('Toque', 2) === null, 'Toque não escala');

console.log('7) Palavras repetidas — Esfera Ígnea (ignis) + majesto Ampliada + majesto Dimensional, Maior');
const amp = M.majesto.find((m) => m.name === 'Magia Ampliada');
const dim = M.majesto.find((m) => m.name === 'Magia Dimensional');
d = await criar(load('esfera-ignea'), 'Maior', 'ignis', 'majesto', 'majesto', amp, dim);
a = d.system.actions[0];
ok(d.system.wordId2 === 'majesto' && d.system.wordId3 === 'majesto', 'a mesma palavra nas posições 2 e 3');
ok(a.targetMode === 'area' && a.area === '3*@nivel', `Ampliada: magia de alvo vira área ${a.area} (1m x Círculo 3 x Nível)`);
ok(a.range === '2*(15*@nivel)', `Dimensional: alcance ${a.range} (dobro de 5m x 3 x Nível)`);
ok(a.damageType === 'fogo' && a.costMp === '3', `continua de fogo e custa ${a.costMp} PM`);
ok(!Object.keys(a).some((k) => k.startsWith('_')), 'sem campos auxiliares no item salvo');

console.log('8) A mesma metamagia duas vezes — triplica, não dobra o dobrado');
d = await criar(load('combustao'), 'Maior', 'ignis', 'majesto', 'majesto', amp, amp);
ok(d.system.actions[0].area === '3*(@nivel)', `área da base (Nível) x3 = ${d.system.actions[0].area}`);
d = await criar(load('esfera-ignea'), 'Maior', 'ignis', 'majesto', 'majesto', amp, amp);
ok(d.system.actions[0].area === '2*(3*@nivel)', `alvo → área (1ª) e área dobrada (2ª) = ${d.system.actions[0].area}`);
ok(/segunda vez/.test(d.system.description), 'a receita registra a metamagia aplicada duas vezes');
const ard = M.ignis.find((m) => m.name === 'Magia Ardente');
d = await criar(load('esfera-ignea'), 'Maior', 'ignis', 'ignis', 'ignis', ard, ard);
ok(d.system.actions[0].appliesEffects.filter((x) => x.label.startsWith('Magia Ardente')).length === 1,
   'condição repetida (Magia Ardente 2x) entra uma vez só');
d = await criar(load('aumentar'), 'Intermediária', 'majesto', 'majesto', '', dim, null);
a = d.system.actions[0];
ok(a.isMelee === false && a.range === '6*@nivel', `Dimensional em magia de toque: alcance ${a.range} (3m x Círculo 2 x Nível)`);

console.log('9) Janela da oficina: abre, lista as palavras da ficha e cria a magia no personagem');
const criadas = [];
const criadasOpcoes = [];
const ator = { name: 'Arcanista', items: [
    { type: 'habilidade', name: 'Palavra Arcana [energio]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [ignis]', system: { level: 'A' } },
    { type: 'habilidade', name: 'Palavra Arcana [fulgur]', system: { level: 'B' } },
    { type: 'traco', name: 'Prole de Mizra', system: {} }],
  async createEmbeddedDocuments(tipo, lista, opcoes = {}) { criadas.push(...lista); criadasOpcoes.push(opcoes); return lista.map((x) => ({ ...x, sheet: null })); } };
let app = null;
try { app = mod.abrirCriacaoDeMagia(ator); ok(true, 'a janela é construída sem colidir com os getters do ApplicationV2'); }
catch (e) { ok(false, `abrir a janela: ${e.message}`); }
if (app) {
  await app.render({ force: true });
  let html = app.element.filho.innerHTML;
  ok(['energio', 'ignis', 'fulgur', 'tenebrae'].every((p) => html.includes(`value="${p}"`)),
     'palavras da ficha (habilidades + traço racial) aparecem para escolha');
  app.forja.palavra1 = 'energio'; await app.render();
  const raio = app.bases.find((x) => x.name === 'Raio Arcano');
  ok(!!raio && app.element.filho.innerHTML.includes('Raio Arcano'), 'magias Menores de energio listadas como base');
  Object.assign(app.forja, { tier: 'Maior', baseId: raio?.id, palavra2: 'ignis', palavra3: 'fulgur',
    meta2i: M.ignis.findIndex((m) => m.name === 'Magia Flamejante'),
    meta3i: M.fulgur.findIndex((m) => m.name === 'Magia Eletrizante') });
  await app.render();
  html = app.element.filho.innerHTML;
  ok(html.includes('<b>3 PM</b>') && html.includes('Magia Eletrizante'), 'resumo mostra custo e metamagias do círculo Maior');
  app.forja.palavra2 = 'energio'; app.forja.palavra3 = 'energio'; await app.render();
  html = app.element.filho.innerHTML;
  const opcoes = (nome) => (html.split(`name="${nome}"`)[1] || '').split('</select>')[0];
  ok(opcoes('palavra2').includes('value="energio" selected') && opcoes('palavra3').includes('value="energio" selected'),
     'os seletores aceitam repetir a palavra principal');
  Object.assign(app.forja, { palavra2: 'ignis', palavra3: 'fulgur' });
  await app.criar();
  const nova = criadas[0];
  ok(criadas.length === 1 && nova.system.tier === 'Maior' && nova.system.actions[0].damageType === 'raio'
     && /^[A-Za-z0-9]{16}$/.test(nova._id) && nova._id !== raio.id && criadasOpcoes[0]?.keepId === true,
     `criou "${nova?.name}" na ficha (Maior, dano de raio, id novo já definido e criado com keepId)`);
  ok(app.state === -1, 'a janela fecha depois de criar');
  const anim = nova?.system.actions[0].aaConfig;
  ok(anim?.metaData?.origem === 'ligeia-livro-do-jogador' && anim.primary.video.animation === 'chainlightning',
     'a magia criada pela janela já vem com animação (raio, pela metamagia da 3ª palavra)');
}

console.log('10) Animações da magia criada acompanham o que ela ficou fazendo');
const anim = await import(new URL('../esmodules/animacoes.mjs', import.meta.url).href);
const chave = (cfg) => cfg && ['dbSection', 'menuType', 'animation', 'variant', 'color'].map((k) => cfg.primary.video[k]).join('.');
d = await criar(load('esfera-ignea'), 'Intermediária', 'ignis', 'majesto', '', amp, null);
a = d.system.actions[0];
ok(a.targetMode === 'area' && a.aaConfig?.menu === 'ontoken' && a.aaConfig.primary.options.playOn === 'target'
   && chave(a.aaConfig) === 'static.spell.fireball.explode.orange',
   `Esfera Ígnea Ampliada: deixa de ser projétil e explode em cada atingido (${chave(a.aaConfig)})`);
d = await criar(load('raio-arcano'), 'Intermediária', 'energio', 'ignis', '', M.ignis.find((m) => m.name === 'Magia Flamejante'), null);
ok(chave(d.system.actions[0].aaConfig) === 'range.spell.firebolt.01.orange', 'Raio Arcano Flamejante: dano de fogo → projétil de fogo');
const furtiva = M.iluzio.find((m) => m.name === 'Magia Furtiva');
d = await criar(load('esfera-ignea'), 'Intermediária', 'ignis', 'iluzio', '', furtiva, null);
const voce = d.system.actions.find((x) => /\(você\)/.test(x.label));
ok(chave(voce?.aaConfig) === 'static.magicsign.illusion.02.purple' && voce.aaConfig.primary.options.playOn === 'source',
   'ação criada pela metamagia segue a palavra DELA (Magia Furtiva de iluzio: ilusão em você)');
ok(chave(d.system.actions[0].aaConfig) === 'range.spell.firebolt.01.orange', 'a ação da base continua com a dela');
ok(!d.system.actions.some((x) => '_palavra' in x), 'sem campo auxiliar de palavra no item salvo');
d = await criar(load('raio-arcano'), 'Intermediária', 'energio', 'vitae', '', M.vitae.find((m) => m.name === 'Magia Curativa'), null);
const cura = d.system.actions.find((x) => x.heal);
ok(chave(cura?.aaConfig) === 'static.spell.curewounds.01.blue' && cura.aaConfig.primary.options.playOn === 'default',
   'Magia Curativa: cura no alvo (ou em você)');
d = await criar(load('rajada-acida'), 'Intermediária', 'acida', 'ignis', '', ard, null);
const vis = d.system.actions[0].appliesEffects.map((x) => chave(x.fxAaConfig));
ok(vis.includes('static.shieldfx.fire.01.orange') && vis.includes('static.energy.strands.02.green'),
   'Magia Ardente: o dano contínuo de fogo ganha chamas, ao lado da corrosão da base');
d = await mod.construirMagia({ base: load('esfera-ignea'), tier: 'Menor', nome: '', palavra1: 'ignis', palavra2: '', palavra3: '',
  pecs: [], ajuste: 0, meta2: null, meta3: null, escolha2: {}, escolha3: {} }, { animar: false });
ok(anim.contarAnimacoesAutomaticas(d) === 0, 'configuração desligada: a magia criada sai sem animação automática (nem a da base)');
const bc = load('raio-arcano');
const sysc = JSON.parse(JSON.stringify(bc.system));
const minha = { menu: 'ontoken', primary: { video: { dbSection: 'static', menuType: 'spell', animation: 'bless', variant: 'intro', color: 'yellow' } } };
sysc.actions[0].aaConfig = minha;
const baseMinha = { name: bc.name, system: sysc,
  toObject() { return JSON.parse(JSON.stringify({ name: bc.name, type: 'magia', system: sysc, flags: {} })); } };
d = await criar(baseMinha, 'Intermediária', 'energio', 'ignis', '', M.ignis.find((m) => m.name === 'Magia Flamejante'), null);
ok(JSON.stringify(d.system.actions[0].aaConfig) === JSON.stringify(minha), 'animação que você pôs na magia de base é mantida');

console.log('11) Dano escalonado: "+N" escala, sem o "+" é fixo');
const flam = M.ignis.find((m) => m.name === 'Magia Flamejante');
ok(load('esfera-ignea').system.actions[0].scalingDamage === true, 'Esfera Ígnea (Fogo +1) escala');
ok(load('missil-magico').system.actions[0].scalingDamage === false, 'Míssil Mágico (Energia 1, não escalonável) é fixo');
ok(load('explodir').system.actions[0].scalingDamage === false, 'Explodir (Dano Final de Energia 1) é fixo');
ok(load('visao-aterradora').system.actions[0].scalingDamage === true, 'Visão Aterradora (Psíquico +0) escala com base 0');
d = await criar(load('raio-arcano'), 'Maior', 'energio', 'ignis', 'fulgur', flam, M.fulgur.find((m) => m.name === 'Magia Eletrizante'));
a = d.system.actions[0];
ok(a.damage === '4' && a.scalingDamage === true && /Raio \+4 \(escalonado\)/.test(d.system.description),
   'Raio Arcano Maior: Raio +4, escalonado, e a receita mostra no formato do livro');
d = await criar(load('cegueira'), 'Intermediária', 'tenebrae', 'ignis', '', flam, null);
a = d.system.actions.find((x) => x.damage);
ok(a?.damage === '2' && a.damageType === 'fogo' && a.scalingDamage === true,
   'Cegueira + Magia Flamejante (sem dano na base): Fogo +2 pelo círculo, escalonado');
d = await criar(load('missil-magico'), 'Intermediária', 'exitium', 'ignis', '', flam, null);
a = d.system.actions[0];
ok(a.damageType === 'fogo' && a.damage === '2' && a.scalingDamage === false && /Fogo 2 \(fixo/.test(d.system.description),
   'Míssil Mágico + Flamejante: troca para fogo e continua fixo');
d = await criar(load('explodir'), 'Intermediária', 'exitium', 'ignis', '', flam, null);
a = d.system.actions[0];
ok(a.damageType === 'final' && a.damage === '2' && a.scalingDamage === false && /Dano Final de Fogo 2/.test(d.system.description),
   'Explodir (exitium) + Flamejante: continua dano final, fixo — o elemento vira fogo');
d = await criar(load('visao-aterradora'), 'Intermediária', 'iluzio', 'ignis', '', flam, null);
ok(d.system.actions.length === 1 && d.system.actions[0].damageType === 'fogo' && d.system.actions[0].scalingDamage === true,
   '"Psíquico +0" já causa dano: a metamagia só troca o tipo (não cria outro dano)');
d = await criar(load('queimar-magia'), 'Intermediária', 'inanis', 'ignis', '', flam, null);
a = d.system.actions[0];
ok(a.damageResource === 'mp' && a.extraDamage.some((x) => x.type === 'fogo' && x.resource === 'hp' && x.scaling && x.formula === '2'),
   'Queimar Magia + Flamejante: o dreno de PM fica e o fogo entra como dano extra escalonado');

console.log('12) Escudo Arcano: +1 no Bloqueio e Bloqueio com Mente');
b = load('escudo-arcano');
const efs = b.system.actions[0].appliesEffects;
ok(efs.some((x) => x.fxType === 'bonus' && x.fxTarget === 'bloqueio' && x.fxValue === '1'), '+1 nas rolagens de Bloqueio');
ok(efs.some((x) => x.fxType === 'set' && x.fxTarget === 'bloqueio' && x.fxValue === '@mente' && x.durationMode === 'scene'),
   'Definir valor: Bloqueio = @mente (usa Mente em vez de Força)');
d = await criar(b, 'Intermediária', 'forjuri', 'energio', '', M.energio[0], null);
ok(d.system.actions[0].appliesEffects.some((x) => x.fxType === 'set' && x.fxValue === '@mente'),
   'a magia criada a partir do Escudo Arcano mantém o Bloqueio com Mente');

console.log('13) Metamagias em cadeia (sistema build 27): a principal cobra a mana, o resto dispara sozinho');
const MM = (p, n) => M[p].find((m) => m.name === n);
const lerRef = (ref) => { const [tipo, id, i, ...nome] = String(ref).split('|'); return { tipo, id, indice: Number(i), nome: nome.join('|') }; };
const com = (slug, p1, p2, meta, escolha = {}, tier = 'Intermediária', extra = {}) => mod.construirMagia({ base: load(slug), tier, nome: '',
  palavra1: p1, palavra2: p2, palavra3: extra.p3 ?? '', pecs: extra.pecs ?? [], ajuste: 0, meta2: meta, meta3: extra.meta3 ?? null,
  escolha2: escolha, escolha3: extra.escolha3 ?? {} });
// Cada referência entre as ações: "action|<id da magia>|<índice>|<nome da magia>" (o formato que a ficha marca).
const refsOk = (d) => d.system.actions.every((a, i) => [...a.preActivations, ...a.chainActions].every((e) => {
  const r = lerRef(e.ref);
  return r.tipo === 'action' && r.id === d._id && r.nome === d.name && r.indice !== i && d.system.actions[r.indice]?.costMp === '0';
}));
d = await com('esfera-ignea', 'ignis', 'krucigon', MM('krucigon', 'Magia Planar'));
a = d.system.actions[0];
let sub = d.system.actions[1];
ok(a.costMp === '2' && a.chainActions.length === 1 && lerRef(a.chainActions[0].ref).indice === 1 && a.chainActions[0].when === 'hit'
   && a.chainActions[0].targets === 'hitOnly' && sub.costMp === '0' && sub.movement.enabled && sub.movement.kind === 'teleport'
   && sub.movement.who === 'targets' && sub.movement.distance === '@mente' && sub.label.startsWith('↳'),
   'Esfera Ígnea + Magia Planar (no alvo): a principal cobra 2 PM e, se acertar, teleporta quem foi atingido até Mente metros (0 PM)');
ok(refsOk(d) && /^[A-Za-z0-9]{16}$/.test(d._id), 'a cadeia aponta para a própria magia com o id e o nome dela (a ficha mantém marcada)');
d = await com('esfera-ignea', 'ignis', 'krucigon', MM('krucigon', 'Magia Planar'), { quem: 'voce' });
sub = d.system.actions[1];
ok(sub.targetMode === 'self' && sub.movement.who === 'self' && d.system.actions[0].chainActions[0].when === 'always'
   && d.system.actions[0].chainActions[0].targets === 'own', 'Magia Planar em você: teleporta você, sempre que conjurar');
d = await com('esfera-ignea', 'ignis', 'krucigon', MM('krucigon', 'Magia Planar'), { quem: 'voce', quando: 'crit' });
ok(d.system.actions[0].chainActions[0].when === 'crit' && /em você, dispara: se for crítico/.test(d.system.description),
   'o jogador escolhe quando dispara (aqui: só no crítico) e a receita registra');
d = await com('esfera-ignea', 'ignis', 'iluzio', MM('iluzio', 'Magia Invisível'));
a = d.system.actions[0];
const antes = d.system.actions[lerRef(a.preActivations[0]?.ref).indice];
const depois = d.system.actions[lerRef(a.chainActions[0]?.ref).indice];
ok(antes?.appliesEffects?.[0]?.fxTarget === 'indefeso' && !antes.appliesEffects[0].resist && antes.appliesEffects[0].durationMode === 'rounds'
   && !antes.canRoll && antes.costMp === '0', 'Magia Invisível: antes da rolagem (ativação prévia), os alvos ficam Indefesos — sem rolagem nem CD');
ok(depois?.removesEffects?.[0]?.mode === 'label' && depois.removesEffects[0].value === antes.appliesEffects[0].label
   && a.chainActions[0].when === 'always' && a.chainActions[0].targets === 'same',
   'depois do ataque, em cadeia nos mesmos alvos, o efeito é removido pelo nome');
ok(!antes.aaConfig && !antes.appliesEffects[0].fxAaConfig && !depois.aaConfig && !!a.aaConfig && refsOk(d),
   'as duas ações de bastidor não tocam animação; a principal continua com a dela');
d = await com('esfera-ignea', 'ignis', 'mortis', MM('mortis', 'Magia Vampírica'));
ok(JSON.stringify(d.system.actions[0].drain) === JSON.stringify({ enabled: true, resource: 'hp', from: 'scaling', ratio: '1' }),
   'Magia Vampírica: dreno do sistema — você recupera PV igual ao dano escalonado causado');
d = await com('cegueira', 'tenebrae', 'mortis', MM('mortis', 'Magia Vampírica'));
ok(!d.system.actions.some((x) => x.drain?.enabled) && /não causa dano/.test(d.system.description),
   'em magia sem dano ela não se aplica (e a receita avisa)');
d = await com('cegueira', 'tenebrae', 'mortis', MM('mortis', 'Magia Vampírica'), {}, 'Maior', { p3: 'ignis', meta3: flam });
ok(d.system.actions.some((x) => x.damageType === 'fogo' && x.drain?.enabled),
   'com uma metamagia de dano junto, o dano vem primeiro e a Vampírica o encontra (mesmo sendo a 2ª palavra)');
d = await com('esfera-ignea', 'ignis', 'exitium', MM('exitium', 'Magia Potencializada'));
sub = d.system.actions[lerRef(d.system.actions[0].chainActions[0]?.ref).indice];
ok(d.system.actions[0].damage === '4' && sub?.damage === '2' && sub.damageType === 'final' && sub.targetMode === 'self'
   && d.system.actions[0].chainActions[0].when === 'always',
   'Magia Potencializada: dano base dobrado (2 → 4) e, em cadeia, você sofre o dano base (2) como dano final');
d = await com('curar', 'vitae', 'vitae', MM('vitae', 'Magia Restauradora'), { condicao: 'enfraquecido' });
sub = d.system.actions[1];
ok(JSON.stringify(sub.removesEffects) === JSON.stringify([{ mode: 'condition', value: 'enfraquecido', count: '1', enabled: true }]),
   'Magia Restauradora: tira um efeito da condição escolhida na criação (Enfraquecido)');
d = await com('imagem-ilusoria', 'iluzio', 'vitae', MM('vitae', 'Magia Curativa'), { quem: 'voce' });
a = d.system.actions[0];
ok(/^Conjurar /.test(a.label) && a.costMp === '2' && a.canRoll && d.system.costs.length === 0 && d.system.actions[1].heal === '2'
   && d.system.actions[1].targetMode === 'self', 'magia só descritiva ganha "Conjurar" (cobra os 2 PM) e dispara a cura em você');
d = await com('escudo-arcano', 'forjuri', 'ignis', ard);
const ataque = d.system.actions.find((x) => x.label.includes('Efeito de Magia Ardente'));
ok(ataque?.costMp === '0' && ataque.label.startsWith('↳') && d.system.actions[0].chainActions.some((c) => c.when === 'always' && d.system.actions[lerRef(c.ref).indice] === ataque),
   'Escudo Arcano (em você) + Magia Ardente: o ataque da metamagia dispara junto ao conjurar, sem cobrar de novo');
d = await com('imagem-ilusoria', 'iluzio', 'ignis', flam);
ok(d.system.actions.length === 1 && d.system.actions[0].costMp === '2' && d.system.actions[0].damageType === 'fogo',
   'magia sem ações + Flamejante: o ataque criado é a própria conjuração e cobra a mana');
d = await com('esfera-ignea', 'ignis', 'menso', MM('menso', 'Magia Telecinética'));
const mover = d.system.actions.find((x) => x.movement?.kind === 'place');
ok(d.system.actions[0].appliesEffects.some((e) => e.fxTarget === 'imobilizado' && e.resist && e.resistAttr === 'forca')
   && mover?.costMp === '0' && mover.movement.distance === '5' && !d.system.actions[0].chainActions.length,
   'Magia Telecinética: Imobilizado (Força anula) e uma ação de mover o alvo 5m para as rodadas seguintes (não dispara sozinha)');
d = await com('esfera-ignea', 'ignis', 'vitae', MM('vitae', 'Magia Curativa'), {}, 'Maior', { p3: 'vitae', meta3: MM('vitae', 'Magia Curativa') });
ok(d.system.actions.filter((x) => x.heal).length === 1, 'a mesma metamagia em cadeia duas vezes não dispara duas vezes');
const tv = load('toque-vampirico');
d = await com('toque-vampirico', 'mortis', 'ignis', flam, {}, 'Intermediária',
  { pecs: mod.parsePeculiaridades(tv).filter((x) => /pontos de magia, em vez/.test(x.texto)) });
ok(d.system.actions[0].drain.enabled && d.system.actions[0].drain.resource === 'mp',
   'Toque Vampírico com a peculiaridade "recupera seus pontos de magia": o dreno devolve PM');
ok(load('toque-vampirico').system.actions[0].drain?.from === 'scaling', 'o Toque Vampírico do compêndio já drena o dano escalonado como PV');

console.log('14) A janela: em quem, quando e os avisos');
if (app) {
  const app2 = mod.abrirCriacaoDeMagia({ ...ator, items: [...ator.items,
    { type: 'habilidade', name: 'Palavra Arcana [krucigon]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [mortis]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [tenebrae]', system: { level: 'B' } }] });
  app2.forja.palavra1 = 'ignis'; await app2.render();
  const esfera = app2.bases.find((x) => x.name === 'Esfera Ígnea');
  Object.assign(app2.forja, { tier: 'Intermediária', baseId: esfera?.id, palavra2: 'krucigon',
    meta2i: M.krucigon.findIndex((m) => m.name === 'Magia Planar') });
  await app2.render();
  let h = app2.element.filho.innerHTML;
  ok(h.includes('name="escolha2-quem"') && h.includes('name="escolha2-quando"') && h.includes('value="hit" selected')
     && /sem custo extra de PM/.test(h), 'Magia Planar: escolher em quem e quando dispara (padrão: no alvo, se acertar)');
  app2.forja.escolha2.quem = 'voce'; await app2.render();
  h = app2.element.filho.innerHTML;
  ok(h.includes('value="voce" selected') && h.includes('value="always" selected'), 'em você: o padrão passa a ser "sempre"');
  app2.forja.palavra1 = 'tenebrae'; await app2.render();
  Object.assign(app2.forja, { baseId: app2.bases.find((x) => x.name === 'Cegueira')?.id, palavra2: 'mortis',
    meta2i: M.mortis.findIndex((m) => m.name === 'Magia Vampírica'), escolha2: {} });
  await app2.render();
  ok(app2.element.filho.innerHTML.includes('class="aviso"'), 'Magia Vampírica numa magia sem dano: a janela avisa');
}

console.log('15) Magia Múltipla (alvo escolhido na hora) e Replicante (o dobro no mesmo alvo), com a mesma animação');
const mult = MM('pluribus', 'Magia Múltipla');
const repl = MM('pluribus', 'Magia Replicante');
const elos = (x) => x.chainActions.map((c) => ({ ...lerRef(c.ref), when: c.when, targets: c.targets }));
d = await com('missil-magico', 'exitium', 'pluribus', mult);
a = d.system.actions[0];
let copia = d.system.actions[elos(a).find((e) => e.targets === 'pick')?.indice];
ok(d.system.actions.length === 2 && a.costMp === '2' && copia?.costMp === '0' && copia.label.endsWith('— 2º alvo')
   && elos(a)[0].when === 'always' && copia.damage === a.damage && copia.targetMode === 'target' && refsOk(d),
   'Míssil Mágico + Magia Múltipla: a principal cobra 2 PM e, em cadeia, a cópia vai no 2º alvo, escolhido na hora');
d = await com('missil-magico', 'exitium', 'pluribus', mult, {}, 'Maior', { p3: 'pluribus', meta3: mult });
ok(elos(d.system.actions[0]).filter((e) => e.targets === 'pick').length === 2 && d.system.actions.some((x) => x.label.endsWith('— 3º alvo')),
   'aplicada duas vezes: o triplo de alvos (2º e 3º, cada um escolhido na hora)');
d = await com('raio-arcano', 'energio', 'ignis', flam, {}, 'Maior', { p3: 'pluribus', meta3: mult });
copia = d.system.actions[elos(d.system.actions[0]).find((e) => e.targets === 'pick').indice];
ok(copia.damageType === 'fogo' && copia.damage === d.system.actions[0].damage, 'a cópia sai depois das outras metamagias: leva o dano de fogo da Flamejante');
d = await com('esfera-ignea', 'ignis', 'iluzio', MM('iluzio', 'Magia Invisível'), {}, 'Maior', { p3: 'pluribus', meta3: mult });
a = d.system.actions[0];
copia = d.system.actions[elos(a).find((e) => e.targets === 'pick').indice];
const preCopia = (copia.preActivations ?? []).map((x) => lerRef(x.ref).indice);
const cadCopia = elos(copia).map((e) => e.indice);
ok(preCopia.length === 1 && cadCopia.length === 1 && !preCopia.includes(lerRef(a.preActivations[0].ref).indice)
   && !cadCopia.includes(elos(a)[0].indice) && d.system.actions[preCopia[0]].appliesEffects[0].fxTarget === 'indefeso'
   && d.system.actions[cadCopia[0]].removesEffects[0].value === 'Indefeso (Magia Invisível)',
   'com a Invisível, o 2º alvo tem o próprio "indefesos antes" e o próprio "fim do efeito" (a cadeia do sistema não repete uma ação)');
d = await com('esfera-ignea', 'ignis', 'exitium', MM('exitium', 'Magia Potencializada'), {}, 'Maior', { p3: 'pluribus', meta3: mult });
copia = d.system.actions[elos(d.system.actions[0]).find((e) => e.targets === 'pick').indice];
ok(copia.damage === d.system.actions[0].damage && !copia.chainActions.length,
   'com a Potencializada, o dano final em você fica só na primeira (é por conjuração, não por alvo)');
d = await com('nuvem-toxica', 'noxia', 'pluribus', repl);
a = d.system.actions[0];
copia = d.system.actions[elos(a).find((e) => e.targets === 'pick')?.indice];
ok(copia?.targetMode === a.targetMode && copia.area === a.area && copia.label.endsWith('— 2ª área') && copia.costMp === '0',
   'Nuvem Tóxica + Magia Replicante: uma 2ª área, reposicionada na hora, sem custo');
const animDe = (x) => JSON.stringify([x.aaConfig, x.aaName, (x.appliesEffects ?? []).map((e) => e.fxAaConfig)]);
d = await com('missil-magico', 'exitium', 'pluribus', repl);
a = d.system.actions[0];
copia = d.system.actions[elos(a)[0]?.indice];
ok(d.system.actions.length === 2 && elos(a)[0].targets === 'same' && elos(a)[0].when === 'always' && copia.costMp === '0'
   && copia.damage === a.damage && copia.label.endsWith('— 2º efeito, no mesmo alvo') && a.costMp === '2',
   'Míssil Mágico + Magia Replicante: dois mísseis — o 2º sai sozinho, em cadeia, no mesmo alvo, e só causa o dano (0 PM)');
ok(!!a.aaConfig && animDe(copia) === animDe(a), 'o 2º míssil repete a animação do 1º');
d = await com('esfera-ignea', 'ignis', 'pluribus', repl);
a = d.system.actions[0];
copia = d.system.actions[elos(a)[0]?.indice];
ok(copia?.canRoll && copia.defenseAttr === a.defenseAttr && elos(a)[0].targets === 'same' && animDe(copia) === animDe(a)
   && copia.appliesEffects.length === a.appliesEffects.length,
   'duas Esferas Ígneas: cada uma rola separado, no mesmo alvo, com a mesma animação (e os mesmos efeitos)');
d = await com('escudo-arcano', 'forjuri', 'pluribus', repl);
ok(d.system.actions.length === 1 && /não é de alvo nem de área/.test(d.system.description), 'Replicante numa magia só em você: fica registrada para a mesa');
d = await com('missil-magico', 'exitium', 'pluribus', mult);
ok(animDe(d.system.actions[1]) === animDe(d.system.actions[0]) && !!d.system.actions[0].aaConfig,
   'Magia Múltipla: a cópia do 2º alvo também repete a animação da 1ª (no alvo clicado)');
d = await com('missil-magico', 'exitium', 'pluribus', mult, {}, 'Maior', { p3: 'pluribus', meta3: repl });
a = d.system.actions[0];
const lista = elos(a);
const copiaM = d.system.actions[lista.find((e) => e.targets === 'pick')?.indice];
ok(lista.map((e) => e.targets).join() === 'same,pick' && elos(copiaM).some((e) => e.targets === 'same')
   && d.system.actions.every((x) => animDe(x) === animDe(a)),
   'Múltipla + Replicante (Maior): dois mísseis no 1º alvo e, no alvo clicado, mais dois — todos com a mesma animação');
d = await com('missil-magico', 'exitium', 'pluribus', repl, {}, 'Maior', { p3: 'pluribus', meta3: mult });
a = d.system.actions[0];
ok(elos(a).map((e) => e.targets).join() === 'same,pick' && elos(d.system.actions[elos(a)[1].indice]).some((e) => e.targets === 'same'),
   'na outra ordem das palavras, o mesmo resultado');
d = await com('escudo-arcano', 'forjuri', 'pluribus', mult);
ok(d.system.actions.length === 1 && /não é de alvo/.test(d.system.description), 'Múltipla numa magia só em você: não se aplica (e a receita avisa)');
ok(d.system.actions.every((x) => x.showInSheet === false), 'as ações levam showInSheet desligado: as que vêm em cadeia ficam sem botão na ficha');

console.log('16) Magia Dimensional (regra da mesa): alcance e distâncias dobram; em você/emanação, o jogador escolhe');
const dimen = MM('majesto', 'Magia Dimensional');
d = await com('teletransporte', 'krucigon', 'iluzio', MM('iluzio', 'Magia Ilusória'));
ok(d.system.actions[0].movement.distance === '20*@nivel', 'Teletransporte Intermediário: "10m x Círculo x Nível" escala com o círculo (20m × Nível)');
d = await com('teletransporte', 'krucigon', 'majesto', dimen);
a = d.system.actions[0];
ok(a.targetMode === 'self' && a.movement.who === 'self' && a.movement.distance === '2*(20*@nivel)' && a.label.endsWith('teleporte até 2 × 20m × Nível')
   && /continuam em você \(dobra a distância\)/.test(d.system.description),
   'krucigon + majesto, "continuam em você" (padrão): você se teleporta o dobro da distância');
d = await com('teletransporte', 'krucigon', 'majesto', dimen, { dimensional: 'alvo' });
a = d.system.actions[0];
ok(a.targetMode === 'target' && a.range === '6*@nivel' && a.movement.who === 'targets' && a.movement.distance === '20*@nivel'
   && a.label.endsWith('no alvo, alcance 6m × Nível') && /viram alvo/.test(d.system.description),
   '"viram alvo": o teleporte passa a levar o alvo, a 3m × Círculo × Nível — na distância normal (o que aumentou foi o alcance)');
d = await com('teletransporte', 'krucigon', 'majesto', dimen, {}, 'Maior', { p3: 'majesto', meta3: dimen });
ok(d.system.actions[0].targetMode === 'self' && d.system.actions[0].movement.distance === '3*(30*@nivel)',
   'Dimensional duas vezes em você: a distância triplica (não dobra o dobrado)');
d = await com('teletransporte', 'krucigon', 'majesto', dimen, {}, 'Maior', { p3: 'majesto', meta3: dimen, escolha3: { dimensional: 'alvo' } });
a = d.system.actions[0];
ok(a.targetMode === 'target' && a.range === '9*@nivel' && a.movement.distance === '2*(30*@nivel)',
   'cada aplicação com a sua escolha: a 1ª dobra o teleporte em você, a 2ª o torna de alvo');
d = await com('causar-medo', 'carmo', 'majesto', dimen, { dimensional: 'alvo' });
a = d.system.actions[0];
ok(a.targetMode === 'area' && a.range === '6*@nivel' && a.area === '@nivel' && a.label.includes('emanando do alvo'),
   'emanação "viram alvo" (Causar Medo): passa a sair do alvo — área do mesmo raio, posta a até 3m × Círculo × Nível');
d = await com('causar-medo', 'carmo', 'majesto', dimen);
ok(d.system.actions[0].targetMode === 'aura' && d.system.actions[0].label === load('causar-medo').system.actions[0].label,
   'emanação "continuam em você": fica em volta de você (sem distância para dobrar, não muda)');
d = await com('empurrao-cinetico', 'menso', 'majesto', dimen);
ok(d.system.actions[0].targetMode === 'aura' && d.system.actions[0].movement.distance === '4', 'Empurrão Cinético em você: o empurrão dobra (2 → 4m)');
d = await com('empurrao-cinetico', 'menso', 'majesto', dimen, { dimensional: 'alvo' });
ok(d.system.actions[0].targetMode === 'area' && d.system.actions[0].movement.distance === '2', 'Empurrão Cinético "viram alvo": a área sai do alvo; o empurrão fica o normal');
d = await com('escudo-arcano', 'forjuri', 'majesto', dimen, { dimensional: 'alvo' });
ok(d.system.actions[0].targetMode === 'target' && d.system.actions[0].range === '6*@nivel', 'magia em você (Escudo Arcano) "viram alvo": vai para um alvo a 3m × Círculo × Nível');
d = await com('telecinesia', 'menso', 'majesto', dimen);
ok(d.system.actions[0].range === '2*(6*@nivel)' && d.system.actions[0].movement.distance === '10', 'magia de alvo (Telecinésia): alcance dobrado e o arrasto também (5 → 10m)');
d = await com('toque-vampirico', 'mortis', 'majesto', dimen);
ok(d.system.actions[0].range === '6*@nivel' && !d.system.actions[0].isMelee, 'toque: passa a ter alcance de 3m × Círculo × Nível (como no livro)');
d = await com('esfera-ignea', 'ignis', 'krucigon', MM('krucigon', 'Magia Planar'), { quem: 'voce' }, 'Maior', { p3: 'majesto', meta3: dimen });
sub = d.system.actions.find((x) => x.movement?.kind === 'teleport');
ok(sub?.movement.distance === '2*(@mente)' && sub.label.includes('até 2 × Mente metros'), 'Magia Planar + Dimensional: teleporta até o dobro de Mente metros');
d = await com('esfera-ignea', 'ignis', 'menso', MM('menso', 'Magia Telecinética'), {}, 'Maior', { p3: 'majesto', meta3: dimen });
ok(d.system.actions.find((x) => x.movement?.kind === 'place')?.movement.distance === '10', 'Magia Telecinética + Dimensional: move o alvo até 10m');
ok(!JSON.stringify(d).includes('_distBase') && !JSON.stringify(d).includes('_rotuloDim'), 'sem campos auxiliares no item salvo');
if (app) {
  const app3 = mod.abrirCriacaoDeMagia({ ...ator, items: [...ator.items,
    { type: 'habilidade', name: 'Palavra Arcana [krucigon]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [majesto]', system: { level: 'B' } },
    { type: 'habilidade', name: 'Palavra Arcana [carmo]', system: { level: 'B' } }] });
  app3.forja.palavra1 = 'krucigon'; await app3.render();
  Object.assign(app3.forja, { tier: 'Intermediária', baseId: app3.bases.find((x) => x.name === 'Teletransporte')?.id, palavra2: 'majesto',
    meta2i: M.majesto.findIndex((m) => m.name === 'Magia Dimensional') });
  await app3.render();
  let h3 = app3.element.filho.innerHTML;
  ok(h3.includes('name="escolha2-dimensional"') && h3.includes('value="voce" selected') && h3.includes('Teletransporte (10m x Círculo x Nível)'),
     'janela: numa magia em você, a Dimensional pergunta se continua em você ou vira alvo (e mostra qual ação)');
  app3.forja.palavra1 = 'carmo'; await app3.render();
  Object.assign(app3.forja, { baseId: app3.bases.find((x) => x.name === 'Causar Medo')?.id, escolha2: {} });
  await app3.render();
  h3 = app3.element.filho.innerHTML;
  ok(h3.includes('class="aviso"') && /não muda nada/.test(h3), 'emanação "continuam em você" sem nada para dobrar: a janela avisa');
  app3.forja.escolha2.dimensional = 'alvo'; await app3.render();
  ok(!/não muda nada/.test(app3.element.filho.innerHTML), '…e escolhendo "viram alvo", o aviso sai');
  app3.forja.palavra1 = 'ignis'; await app3.render();
  Object.assign(app3.forja, { baseId: app3.bases.find((x) => x.name === 'Esfera Ígnea')?.id, escolha2: {} });
  await app3.render();
  ok(!app3.element.filho.innerHTML.includes('escolha2-dimensional'), 'numa magia de alvo (Esfera Ígnea), não há o que escolher');
}

console.log('17) Todas as metamagias, com cada escolha (no alvo / em você; Dimensional em você / no alvo), em magias diferentes, passam no validador');
const os = await import('os');
const path = await import('path');
const { execFileSync } = await import('child_process');
const tmpd = fs.mkdtempSync(path.join(os.tmpdir(), 'metamagias-'));
fs.mkdirSync(`${tmpd}/packs-source/criadas`, { recursive: true });
let nDocs = 0;
let refsTodos = true;
const bases = [['esfera-ignea', 'ignis'], ['curar', 'vitae'], ['escudo-arcano', 'forjuri'], ['imagem-ilusoria', 'iluzio'], ['causar-medo', 'carmo']];
for (const [palavra, lista] of Object.entries(M)) {
  for (const m of lista) {
    const variantes = m.alvoOuVoce ? [{ quem: 'alvo' }, { quem: 'voce' }]
      : m.kind === 'range2x' ? [{ dimensional: 'voce' }, { dimensional: 'alvo' }] : [{}];
    for (const escolha of variantes) {
      for (const [slug, p1] of bases) {
        const doc = await com(slug, p1, palavra, m, escolha);
        if (!refsOk(doc)) { refsTodos = false; console.log('    referência errada:', doc.name, m.name, JSON.stringify(escolha)); }
        fs.writeFileSync(`${tmpd}/packs-source/criadas/${String(nDocs++).padStart(4, '0')}.json`, JSON.stringify(doc));
      }
    }
  }
}
let saidaV = '';
let codV = 0;
try { saidaV = execFileSync('python3', ['-c', `import sys; sys.path.insert(0, ${JSON.stringify(new URL('../scripts', import.meta.url).pathname)}); import validate; sys.exit(validate.main(${JSON.stringify(tmpd)}))`], { encoding: 'utf8' }); }
catch (e) { codV = e.status; saidaV = `${e.stdout}${e.stderr}`; }
ok(codV === 0, `${nDocs} magias criadas: ${saidaV.trim().split('\n')[0]}`);
if (codV) console.log(saidaV.split('\n').slice(0, 15).join('\n'));
ok(refsTodos, 'em todas, cada ação em cadeia/ativação prévia aponta para a própria magia (id e nome), para outra ação, e a disparada não cobra PM');
fs.rmSync(tmpd, { recursive: true, force: true });

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
