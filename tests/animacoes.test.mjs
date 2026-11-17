// Testes das animações automáticas: node tests/animacoes.test.mjs (após python3 scripts/generate.py)
import fs from 'fs';

const mod = await import(new URL('../esmodules/animacoes.mjs', import.meta.url).href);
const cat = JSON.parse(fs.readFileSync(new URL('../scripts/aa-chaves.json', import.meta.url), 'utf8'));
const FREE = new Set(cat.free), PAT = new Set(cat.patreon);
const dir = new URL('../packs-source/magias/', import.meta.url).pathname;
const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
const carregar = (prefixo) => {
  const f = arquivos.find((x) => x.startsWith(prefixo));
  return JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
};
const chave = (cfg) => cfg && ['dbSection', 'menuType', 'animation', 'variant', 'color'].map((k) => cfg.primary.video[k]).join('.');
const clone = (x) => JSON.parse(JSON.stringify(x));

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };

console.log('1) Tabelas conferidas contra o catálogo do Automated Animations');
const listas = mod.chavesDasTabelas();
const todas = new Set(listas.flat());
const inexistentes = [...todas].filter((k) => !FREE.has(k) && !PAT.has(k));
ok(inexistentes.length === 0, `todas as ${todas.size} chaves existem no JB2A (inexistentes: ${inexistentes.join(', ') || 'nenhuma'})`);
ok(listas.every((l) => l.some((k) => FREE.has(k) && PAT.has(k))), 'toda lista tem ao menos uma chave do JB2A gratuito E do Patreon');
const seguras = [...todas].filter((k) => FREE.has(k) && PAT.has(k)).sort();
ok(JSON.stringify(seguras) === JSON.stringify([...mod.SEGURAS].sort()),
   `SEGURAS = chaves das tabelas presentes nas duas versões (${mod.SEGURAS.size})`);
ok([...todas].every((k) => k.split('.').length === 5), 'chaves no formato seção.tipo.animação.variante.cor');

console.log('2) Compêndio: animações gravadas como animação puxada');
let a, e, d = carregar('esfera-ignea');
a = d.system.actions[0];
ok(a.aaConfig?.menu === 'range' && chave(a.aaConfig) === 'range.spell.firebolt.01.orange',
   `Esfera Ígnea: projétil ${chave(a.aaConfig)}`);
ok(a.aaEnabled === true && /automática/.test(a.aaName), `ação ligada (●) e nomeada: "${a.aaName}"`);
e = a.appliesEffects.find((x) => x.fxTarget === 'dano_continuo');
ok(chave(e.fxAaConfig) === 'static.shieldfx.fire.01.orange' && e.fxAaConfig.primary.options.persistent === true
   && e.fxAaPersist === true, `dano contínuo de fogo: chamas enquanto durar (${e.fxAaName})`);
ok(!d.flags?.autoanimations, 'nada em flags.autoanimations do item (não volta como reserva depois de removida)');
d = carregar('curar_');
ok(chave(d.system.actions[0].aaConfig) === 'static.spell.curewounds.01.blue'
   && d.system.actions[0].aaConfig.primary.options.playOn === 'default', 'Curar: curewounds no alvo (ou em você, sem alvo)');
d = carregar('teletransporte');
ok(chave(d.system.actions[0].aaConfig) === 'static.spell.mistystep.01.blue'
   && d.system.actions[0].aaConfig.primary.options.playOn === 'source', 'Teletransporte: mistystep no ponto de partida');
d = carregar('causar-medo');
a = d.system.actions[0];
ok(a.aaConfig.primary.options.playOn === 'source' && a.aaConfig.primary.options.size > 1, 'Causar Medo (emanação): no conjurador, maior');
ok(chave(a.appliesEffects[0].fxAaConfig) === 'static.conditions.fear.01.darkpurple', 'Abalado: marcador de medo enquanto durar');
d = carregar('chama-sagrada');
ok(chave(d.system.actions[0].aaConfig) === 'static.spell.sacredflame.target.yellow', 'Chama Sagrada: a chama desce sobre o alvo');
d = carregar('diminuir');
ok(d.system.actions[0].aaConfig.primary.options.playOn === 'default', 'Diminuir é benefício (toca no alvo ou em você)');
let total = 0, foraDasSeguras = [], comFlag = [], semAcao = 0;
for (const f of arquivos) {
  const doc = JSON.parse(fs.readFileSync(`${dir}/${f}`, 'utf8'));
  if (doc.flags?.autoanimations) comFlag.push(doc.name);
  if (!doc.system.actions?.length) { semAcao++; continue; }
  for (const x of doc.system.actions) {
    for (const cfg of [x.aaConfig, ...(x.appliesEffects ?? []).map((y) => y.fxAaConfig)]) {
      if (!cfg) continue;
      total++;
      if (!mod.SEGURAS.has(chave(cfg))) foraDasSeguras.push(`${doc.name}: ${chave(cfg)}`);
    }
  }
}
ok(total > 70 && foraDasSeguras.length === 0, `${total} animações no compêndio, todas do JB2A gratuito e do Patreon`);
ok(comFlag.length === 0, 'nenhuma magia com flags.autoanimations');
ok(semAcao > 0, `${semAcao} magias sem ações ficam sem animação (não há onde tocar)`);

console.log('3) O que você configurou fica');
d = clone(carregar('raio-arcano'));
const minha = { menu: 'ontoken', primary: { video: { dbSection: 'static', menuType: 'spell', animation: 'curewounds', variant: '01', color: 'blue' } } };
d.system.actions[0].aaConfig = clone(minha);
mod.animarMagia(d, { existe: () => true });
ok(JSON.stringify(d.system.actions[0].aaConfig) === JSON.stringify(minha), 'animação puxada por você não é trocada');
d = clone(carregar('raio-arcano'));
d.system.actions[0].aaConfig = null; d.system.actions[0].animFile = 'jb2a.magic_missile';
mod.animarMagia(d, { existe: () => true });
ok(d.system.actions[0].aaConfig === null, 'caminho digitado no "Avançado" também é respeitado');

console.log('4) Sem a animação no JB2A instalado');
d = clone(carregar('esfera-ignea'));
const r = mod.animarMagia(d, { existe: () => false });
ok(r.acoes === 0 && d.system.actions[0].aaConfig === null && d.system.actions[0].appliesEffects[0].fxAaConfig === null,
   'nada existe → nenhuma animação, e as automáticas antigas saem');

console.log('5) Com o JB2A Patreon, a primeira opção de cada lista');
d = clone(carregar('raio-necrotico'));
mod.animarMagia(d, { existe: (k) => PAT.has(k) });
ok(chave(d.system.actions[0].aaConfig) === 'range.spell.eldritchblast.01.darkgreen', `Raio Necrótico: ${chave(d.system.actions[0].aaConfig)}`);
d = clone(carregar('nuvem-toxica'));
mod.animarMagia(d, { existe: (k) => PAT.has(k) });
ok(chave(d.system.actions[0].aaConfig) === 'static.spell.fogcloud.02.green', `Nuvem Tóxica: ${chave(d.system.actions[0].aaConfig)}`);
d = clone(carregar('nuvem-toxica'));
mod.animarMagia(d, { existe: (k) => FREE.has(k) });
ok(FREE.has(chave(d.system.actions[0].aaConfig)), `JB2A gratuito: ${chave(d.system.actions[0].aaConfig)}`);

console.log('6) Consulta à base do Sequencer');
globalThis.Sequencer = { Database: { getEntry(caminho) {
  const reg = ['autoanimations.static.generic.impact.01.blue', 'autoanimations.range.spell.firebolt.01.orange.30ft'];
  const achados = reg.filter((x) => x === caminho || x.startsWith(`${caminho}.`)).map((x) => ({ dbPath: x }));
  return achados.length ? achados : false;
} } };
let existe = mod.criarVerificador();
ok(existe('range.spell.firebolt.01.orange') && !existe('range.spell.scorchingray.01.orange'), 'usa o que o Automated Animations registrou');
ok(!existe('static.generic.impact.01.blu'), 'prefixo parcial não conta como chave');
globalThis.Sequencer = { Database: { getEntry: () => false } };
existe = mod.criarVerificador();
ok(existe('range.spell.firebolt.01.orange') && !existe('range.spell.firebolt.01.green'),
   'base do AA não registrada → só as chaves seguras');
delete globalThis.Sequencer;
existe = mod.criarVerificador();
ok(existe('static.spell.curewounds.01.blue'), 'fora do Foundry → chaves seguras');

console.log('7) Remoção');
d = clone(carregar('toque-chocante'));
d.system.actions.push({ ...clone(d.system.actions[0]), aaConfig: clone(minha), appliesEffects: [] });
const n = mod.limparAnimacoesAutomaticas(d);
ok(n === 2 && d.system.actions[0].aaConfig === null && d.system.actions[0].appliesEffects[0].fxAaConfig === null,
   `limparAnimacoesAutomaticas tirou ${n} (ação + condição)`);
ok(JSON.stringify(d.system.actions[1].aaConfig) === JSON.stringify(minha), 'e deixou a sua');
ok(mod.contarAnimacoesAutomaticas(d) === 0, 'contagem zerada');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
