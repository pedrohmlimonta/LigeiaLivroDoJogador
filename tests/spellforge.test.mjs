// Testes da Criação de Magias: node tests/spellforge.test.mjs (após python3 scripts/generate.py)
globalThis.foundry = { utils: { escapeHTML: (s)=>String(s) }, applications: { api: { ApplicationV2: class {} } } };
globalThis.Hooks = { on(){}, once(){} };
globalThis.game = { packs: new Map(), items: [] };
const mod = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);
import fs from 'fs';
const dir=new URL('../packs-source/magias/', import.meta.url).pathname;
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

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
