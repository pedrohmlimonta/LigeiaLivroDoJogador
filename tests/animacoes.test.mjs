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
ok(mod.chavesDasTabelas({ comOpcionais: false }).every((l) => l.some((k) => FREE.has(k) && PAT.has(k))),
   'toda lista tem ao menos uma chave do JB2A gratuito E do Patreon (arremesso é opcional)');
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
ok(semAcao === 0, `toda magia tem ação (${semAcao} sem): a economia de ações pede o que cada uma gasta`);

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

const raiz = new URL('../packs-source/', import.meta.url).pathname;
const doPack = (pack, nome) => {
  const pasta = `${raiz}/${pack}`;
  for (const f of fs.readdirSync(pasta)) {
    const x = JSON.parse(fs.readFileSync(`${pasta}/${f}`, 'utf8'));
    if (x.name === nome) return x;
  }
  throw new Error(`${pack}/${nome} não encontrado`);
};
const acao = (doc, re) => doc.system.actions.find((x) => re.test(x.label));

console.log('8) Armas');
d = doPack('equipamentos', 'Espada Longa');
a = d.system.actions[0];
ok(a.aaConfig?.menu === 'melee' && chave(a.aaConfig) === 'melee.weapon.sword.01.white', `Espada Longa: golpe ${chave(a.aaConfig)}`);
ok(a.aaConfig.meleeSwitch?.options?.switchType === 'off',
   'troca por projétil explícita e desligada (o padrão "on" do AA procuraria um arremesso inexistente)');
d = doPack('equipamentos', 'Adaga');
a = d.system.actions[0];
ok(a.aaConfig.meleeSwitch.options.switchType === 'custom' && a.aaConfig.meleeSwitch.video.animation === 'dagger',
   'Adaga: golpe de perto, adaga arremessada de longe');
ok(chave(doPack('equipamentos', 'Arco Longo').system.actions[0].aaConfig) === 'range.weapon.arrow.regular.regular', 'Arco Longo: flecha');
ok(chave(doPack('equipamentos', 'Besta Pesada').system.actions[0].aaConfig) === 'range.weapon.bolt.physical.orange', 'Besta Pesada: virote');
for (const nome of ['Bacamarte', 'Pistola', 'Rifle', 'Rifle de Cano Duplo']) {
  const acoes = doPack('equipamentos', nome).system.actions.filter((x) => x.isWeapon);
  ok(acoes.length > 0 && acoes.every((x) => x.aaConfig?.menu === 'range' && chave(x.aaConfig) === 'range.weapon.bullet.1.orange'),
     `${nome}: tiro de bala em ${acoes.length === 1 ? 'seu ataque' : `todos os ${acoes.length} ataques`}`);
}
d = clone(doPack('equipamentos', 'Pistola'));
d.name = 'Mosquete do Capitão';
d.system.tags = ['Armas de Fogo', 'Duas Mãos'];
for (const x of d.system.actions) x.aaConfig = null;
mod.animarItem(d, { existe: mod.chaveSegura });
ok(chave(d.system.actions[0].aaConfig) === 'range.weapon.bullet.1.orange',
   'arma de fogo fora da tabela: pela tipagem digitada "Armas de Fogo" (o id que o sistema compara, armas_de_fogo)');
ok(chave(doPack('equipamentos', 'Mordida').system.actions[0].aaConfig) === 'melee.creature.bite.01.red', 'Mordida: mordida');
d = doPack('equipamentos', 'Soco');
ok(chave(acao(d, /^Ataque/).aaConfig) === 'melee.weapon.unarmedstrike.physical.blue'
   && chave(acao(d, /Artes Marciais A/).aaConfig) === 'melee.weapon.flurryofblows.physical.blue',
   'Soco comum e Soco de Artes Marciais (rajada de golpes)');
d = clone(doPack('equipamentos', 'Machado de Mão'));
mod.animarItem(d, { existe: (k) => PAT.has(k) });
ok(d.system.actions[0].aaConfig.meleeSwitch.options.switchType === 'custom'
   && d.system.actions[0].aaConfig.metaData.arremesso === 'range.weapon.handaxe.01.white',
   'com o JB2A Patreon, o Machado de Mão arremessado vira machado voando');
let semArma = [];
for (const f of fs.readdirSync(`${raiz}/equipamentos`)) {
  const x = JSON.parse(fs.readFileSync(`${raiz}/equipamentos/${f}`, 'utf8'));
  for (const y of x.system.actions ?? []) if (y.isWeapon && !y.aaConfig) semArma.push(`${x.name}: ${y.label}`);
}
ok(semArma.length === 0, `toda ação de arma tem animação (${semArma.join('; ') || 'ok'})`);

console.log('9) Habilidades e traços');
d = doPack('habilidades', 'Fúria');
ok(chave(acao(d, /Entrar em Fúria \(B/).aaConfig) === 'static.energy.circle.complete.orange'
   && acao(d, /Entrar em Fúria \(B/).aaConfig.primary.options.playOn === 'source', 'Fúria: energia ao redor do bárbaro');
d = clone(doPack('habilidades', 'Fúria'));
mod.animarItem(d, { existe: (k) => PAT.has(k) });
ok(chave(d.system.actions[0].aaConfig) === 'static.energy.strands.01.red', 'Fúria com Patreon: energia vermelha');
ok(chave(acao(doPack('habilidades', 'Inspirar'), /^Inspirar:/).aaConfig) === 'static.spell.bardicinspiration.inspire.greenorange',
   'Inspirar: inspiração do bardo');
d = doPack('habilidades', 'Sopro de Dragão [Fogo]');
a = d.system.actions[0];
ok(a.aaConfig.menu === 'range' && chave(a.aaConfig) === 'range.spell.fireballbeam.01.orange', 'Sopro de Dragão [Fogo]: jato até cada atingido');
d = doPack('habilidades', 'Presa de Caça [Feras]');
a = acao(d, /sangramento/);
ok(chave(a.aaConfig) === 'static.spell.huntersmark.eye.green' && chave(a.appliesEffects[0].fxAaConfig) === 'static.conditions.drop.02.red',
   'Presa de Caça: marca do caçador e sangramento enquanto durar');
d = doPack('habilidades', 'Usar Armas [Fundas]');
ok(!acao(d, /^Manobra/).aaConfig && chave(acao(d, /Tiro Atordoante —/).aaConfig) === 'static.generic.ui.stun.purple',
   'manobra: a preparação em você fica quieta; o efeito no alvo mostra o ícone da condição');
ok(chave(acao(doPack('habilidades', 'Recuperar o Fôlego'), /\(B/).aaConfig) === 'static.spell.generichealing.01.green',
   'Recuperar o Fôlego: cura em você');
ok(!doPack('habilidades', 'Acrobacia').system.actions.some((x) => x.aaConfig), 'rolagens de perícia ficam sem animação');
ok(!doPack('habilidades', 'Atirador').system.actions.some((x) => x.aaConfig), 'ajuste de número em você fica sem animação');
ok(doPack('habilidades', 'Pacto [Faérian]').system.actions.every((x) => chave(x.aaConfig) === 'static.leaves.outburst.01.pink'),
   'Pacto [Faérian]: o ritual ganha folhas faérian');
ok(chave(doPack('tracos', 'Filhos de Auralia').system.actions[0].aaConfig) === 'static.leaves.outburst.01.pink',
   'Filhos de Auralia: teleporte faérian');

console.log('10) Instantâneos e complicações');
const porUuid = new Map();
for (const pack of fs.readdirSync(raiz)) {
  for (const f of fs.readdirSync(`${raiz}/${pack}`)) {
    const x = JSON.parse(fs.readFileSync(`${raiz}/${pack}/${f}`, 'utf8'));
    porUuid.set(`Compendium.ligeia-livro-do-jogador.${pack}.Item.${x._id}`, x);
  }
}
let copias = 0, diferentes = [];
for (const x of porUuid.values()) {
  for (const sn of [...(x.system.grantedTraits ?? []), ...(x.system.keySkills ?? [])]) {
    const origem = sn.sourceUuid && porUuid.get(sn.sourceUuid);
    if (!origem) continue;
    copias++;
    if (JSON.stringify(origem.system) !== JSON.stringify(sn.system)) diferentes.push(`${x.name} › ${sn.name}`);
  }
}
ok(copias > 50 && diferentes.length === 0, `${copias} cópias embutidas idênticas ao item (com as animações)`);
const barb = doPack('vocacoes', 'Bárbaro').system.keySkills.find((k) => k.name === 'Fúria');
ok(chave(barb.system.actions[0].aaConfig) === 'static.energy.circle.complete.orange', 'a Fúria do Bárbaro já vem animada');
const bruxo = doPack('vocacoes', 'Bruxo').system.keySkills.find((k) => /^Pacto/.test(k.name));
ok(bruxo.system.actions.every((x) => x.aaConfig), 'chave genérica (Pacto [Único]) também animada');
let complSem = [];
for (const f of fs.readdirSync(`${raiz}/complicacoes`)) {
  const x = JSON.parse(fs.readFileSync(`${raiz}/complicacoes/${f}`, 'utf8'));
  if (!(x.system.actions ?? []).length) complSem.push(x.name);
}
ok(complSem.length === 0, `toda complicação tem ação (rolagem, efeito colateral, aviso no chat)${complSem.length ? `: faltam ${complSem.join(', ')}` : ''}`);
d = doPack('complicacoes', 'Efeito Colateral [ignis]');
ok(d.system.actions[0].damageType === 'final' && d.system.actions[0].targetMode === 'self',
   'Efeito Colateral [ignis]: 1 de dano final em você');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
