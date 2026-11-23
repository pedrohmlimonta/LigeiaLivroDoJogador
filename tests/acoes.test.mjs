// Testes da economia de ações (sistema build 31): node tests/acoes.test.mjs
// (depois de python3 scripts/generate.py). O compêndio diz o que cada ação
// gasta, sustenta o que é sustentável e todo item tem ação; a Criação de
// Magias leva isso para as magias criadas (Acelerada, reação, lendárias) e o
// Encantamento de Itens para as propriedades.
import fs from 'fs';

globalThis.foundry = { utils: { escapeHTML: (s) => String(s) }, applications: { api: { ApplicationV2: class {} } } };
globalThis.Hooks = { on() {}, once() {} };
globalThis.ui = { notifications: { info() {}, warn() {} } };

const raiz = new URL('../packs-source/', import.meta.url).pathname;
const MOD = 'ligeia-livro-do-jogador';
const pack = (p) => fs.readdirSync(`${raiz}/${p}`).map((f) => JSON.parse(fs.readFileSync(`${raiz}/${p}/${f}`, 'utf8')));
const PACKS = Object.fromEntries(fs.readdirSync(raiz).map((p) => [p, pack(p)]));
const doc = (p, nome) => {
  const d = PACKS[p].find((x) => x.name === nome);
  if (!d) throw new Error(`${p}/${nome}`);
  return d;
};
const acao = (d, re) => d.system.actions.find((a) => re.test(a.label));
const magias = PACKS.magias.map((raw) => ({ ...raw, id: raw._id, toObject() { return JSON.parse(JSON.stringify(raw)); } }));
globalThis.game = { packs: new Map([[`${MOD}.magias`, { getDocuments: async () => magias }]]), items: [], actors: [] };

const sf = await import(new URL('../esmodules/spellforge.mjs', import.meta.url).href);
const enc = await import(new URL('../esmodules/encantamento.mjs', import.meta.url).href);
const eco = await import(new URL('../esmodules/economia.mjs', import.meta.url).href);
const { PROPRIEDADES } = await import(new URL('../esmodules/propriedades.mjs', import.meta.url).href);

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };
const CUSTOS = new Set(['none', 'standard', 'movement', 'simple', 'reaction', 'free']);

console.log('1) Compêndio: toda ação diz o que gasta; todo item de jogo tem ação');
let semCusto = [], semAcao = [], total = 0;
const jogo = new Set(['habilidade', 'magia', 'equipamento', 'traco', 'complicacao']);
const percorrer = (onde, d) => {
  if (jogo.has(d.type) && !(d.system.actions ?? []).length) semAcao.push(onde);
  for (const a of d.system.actions ?? []) {
    total++;
    if (!CUSTOS.has(a.actionCost)) semCusto.push(`${onde}: ${a.label}`);
  }
  for (const [campo, tipo] of [['grantedTraits', 'traco'], ['keySkills', 'habilidade']]) {
    for (const s of d.system[campo] ?? []) percorrer(`${onde} › ${s.name}`, { type: tipo, ...s });
  }
};
for (const [p, docs] of Object.entries(PACKS)) for (const d of docs) percorrer(`${p}/${d.name}`, d);
ok(total > 1500 && semCusto.length === 0, `${total} ações, todas com actionCost${semCusto.length ? ` (faltam: ${semCusto.slice(0, 5).join('; ')})` : ''}`);
ok(semAcao.length === 0, `toda habilidade, magia, equipamento, traço e complicação tem ação${semAcao.length ? ` (faltam: ${semAcao.slice(0, 8).join('; ')})` : ''}`);

console.log('2) Magias: o tempo de conjuração vira a ação');
ok(doc('magias', 'Teletransporte').system.actions[0].actionCost === 'movement', 'Teletransporte (Movimento): ação de movimento');
ok(doc('magias', 'Aumento Arcano').system.actions.every((a) => a.actionCost === 'simple'), 'Aumento Arcano (Ação Rápida): as cinco opções gastam a ação simples');
ok(doc('magias', 'Replicar').system.actions[0].actionCost === 'reaction' && doc('magias', 'Simular').system.actions[0].actionCost === 'reaction',
   'Replicar e Simular (Reação): reação');
ok(doc('magias', 'Reviver').system.actions[0].actionCost === 'none' && doc('magias', 'Reparar').system.actions[0].actionCost === 'none',
   'Reviver e Reparar (Cena): não gastam ação da rodada');
ok(doc('magias', 'Raio Arcano').system.actions[0].actionCost === 'standard', 'Raio Arcano (Ação): ação padrão');
const velocidade = doc('magias', 'Velocidade').system.actions[0];
ok(velocidade.appliesEffects[0].fxType === 'action' && velocidade.appliesEffects[0].fxTarget === 'acao:movement'
   && velocidade.appliesEffects[0].durationMode === 'scene', 'Velocidade: +1 ação de movimento por turno (efeito "Ações por rodada"), a cena');
ok(doc('magias', 'Luz').system.actions[0].appliesEffects[0].fxType === 'emanation', 'Luz: emanação em volta do alvo (o raio iluminado)');
ok(doc('magias', 'Invocar os Mortos').system.actions[0].summons.length === 1, 'Invocar os Mortos: o cadáver tocado entra pelo marcador de invocação');

console.log('3) Sustentação');
let aura = doc('magias', 'Aura Arcana').system.actions[0];
ok(aura.persistSustain === 'simple' && aura.persistRounds === '0', 'Aura Arcana (Sustentação — Ação Rápida): a emanação cobra a ação simples por turno, até o fim da cena');
ok(doc('magias', 'Barreira Arcana').system.actions[0].persistSustain === 'standard', 'Barreira Arcana (Sustentável — Ação): ação padrão por turno');
let escudo = doc('magias', 'Escudo Arcano').system.actions[0];
ok(escudo.appliesEffects.length === 2 && escudo.appliesEffects.every((e) => e.fxSustain === 'simple')
   && new Set(escudo.appliesEffects.map((e) => e.label)).size === 1,
   'Escudo Arcano: os dois efeitos sustentados com o MESMO rótulo (um vínculo só, uma ação por turno)');
const esc = doc('magias', 'Escuridão').system.actions[0];
ok(esc.persistSustain === 'simple' && esc.appliesEffects.every((e) => e.fxSustain === 'none'),
   'Escuridão: a área é que sustenta (o Cego de quem entra não cria vínculos por disparo)');
ok(doc('magias', 'Invocar').system.actions[1].appliesEffects[0].fxSustain === 'movement', 'Invocar um objeto encantado: sustentado com o movimento');
ok(doc('magias', 'Silêncio').system.actions[0].persistSustain === 'simple' && doc('magias', 'Imagem Ilusória').system.actions[0].persistSustain === 'simple',
   'Silêncio e Imagem Ilusória (antes só descritivas): áreas sustentadas com a ação rápida');

console.log('4) Habilidades: o livro diz a ação');
ok(acao(doc('habilidades', 'Acrobacia'), /reação/).actionCost === 'reaction' && acao(doc('habilidades', 'Acrobacia'), /rolar/).actionCost === 'none',
   'Acrobacia: a rolagem pronta não gasta; o desvio do Avançado é a reação');
ok(doc('habilidades', 'Baluarte').system.actions[0].actionCost === 'simple', 'Baluarte (A): "usar sua ação rápida"');
ok(doc('habilidades', 'Inspirar').system.actions.every((a) => a.actionCost === 'standard'), 'Inspirar (Ativação: Ação): ação padrão');
ok(doc('habilidades', 'Fúria').system.actions.filter((a) => /Entrar/.test(a.label)).every((a) => a.actionCost === 'free'),
   'Fúria (Livre, no seu turno): entrar é ação livre');
ok(acao(doc('habilidades', 'Usar Armas [Militar]'), /Manobra/).actionCost === 'none'
   && acao(doc('habilidades', 'Usar Armas [Dardos]'), /Manobra/).actionCost === 'movement'
   && acao(doc('habilidades', 'Usar Armas [Corpo a Corpo]'), /Manobra/).actionCost === 'reaction'
   && acao(doc('habilidades', 'Usar Armas [Leves]'), /Manobra/).actionCost === 'free',
   'manobras: "(Ação)" — o ataque com a arma paga; "(Ação e Movimento)" — o movimento; "(Reação)"; "(Livre)"');
ok(doc('habilidades', 'Tenacidade Assustadora').system.actions.map((a) => a.actionCost).join() === 'none,free,standard,movement',
   'Tenacidade Assustadora: rolar (nada), acumular (livre), converter (ação; no Avançado, o movimento)');
ok(doc('habilidades', 'Contragolpe').system.actions.every((a) => a.actionCost === 'reaction'), 'Contragolpe (antes sem ação): reação');
ok(acao(doc('habilidades', 'Atirador em Movimento'), /\(A\)/).actionCost === 'simple'
   && acao(doc('habilidades', 'Atirador em Movimento'), /\(A\)/).appliesEffects[0].fxTarget === 'attackRanged',
   'Atirador em Movimento (A): mirar com a ação rápida (+1 no próximo ataque à distância)');
ok(acao(doc('habilidades', 'Asas'), /\(A\)/).appliesEffects[0].fxType === 'action' && acao(doc('habilidades', 'Asas'), /\(A\)/).appliesEffects[0].fxTarget === 'corrida',
   'Asas (A): voando, corre sem gastar a ação padrão (efeito de corrida)');
ok(doc('habilidades', 'Idioma Adicional [Élfico]').system.actions[0].label.startsWith('Idioma Adicional [Élfico] — Você é capaz de falar'),
   'o que é só regra ganha a ação que a anuncia no chat (rótulo com colchetes, como o item)');

console.log('5) Bônus de uma habilidade em outra (efeito passivo já na habilidade)');
const carisma = doc('habilidades', 'Carisma');
ok(carisma.system.mode === 'passive' && carisma.system.effects.some((e) => e.target === 'item:Telepatia' && e.type === 'bonus' && e.enabled)
   && carisma.system.effects.filter((e) => e.target === 'mente').every((e) => !e.enabled),
   'Carisma: +1 na Conjuração de Telepatia (e das outras magias que o citam) sempre; o 1D social vira interruptor');
const arcano = doc('habilidades', 'Conhecimento [Arcano]');
ok(arcano.system.effects.filter((e) => e.target.startsWith('item:')).length >= 15, `Conhecimento [Arcano]: ${arcano.system.effects.filter((e) => e.target.startsWith('item:')).length} magias com +1 na Conjuração`);
ok(doc('tracos', 'Presença Ardente').system.effects.map((e) => e.target).join() === 'item:Presença Aterradora,item:Provocar,item:Grito de Guerra'
   && doc('tracos', 'Presença Ardente').system.effects.every((e) => e.value === 'ceil(@nivel/2)'),
   'Presença Ardente: +metade do Nível em Presença Aterradora, Provocar e Grito de Guerra');
ok(doc('habilidades', 'Mestre do Conhecimento').system.effects.some((e) => e.target === 'item:Conhecimento [Religião]' && e.type === 'rollDice'),
   'Mestre do Conhecimento: 1D nas rolagens das habilidades Conhecimento');
const vd = doc('tracos', 'Vontade de Diamante').system.effects;
ok(vd.filter((e) => e.enabled).length === 6 && vd.filter((e) => !e.enabled).length === 6 && vd.every((e) => e.target.startsWith('resistir:')),
   'Vontade de Diamante: +1 para anular as 6 condições (+1 a mais, interruptor, com Vontade de Ferro no Avançado)');
ok(doc('tracos', 'Filhos de Agalard').system.effects.some((e) => e.target === 'defenseMagia' && e.enabled), 'Filhos de Agalard: 1D para se defender de magias');

console.log('6) Equipamentos');
ok(doc('equipamentos', 'Espada Longa').system.actions.every((a) => a.actionCost === 'standard'), 'ataque com arma: ação padrão');
ok(acao(doc('equipamentos', 'Arco Longo'), /^Mirar/).actionCost === 'movement' && acao(doc('equipamentos', 'Besta Pesada'), /^Recarregar/).actionCost === 'movement',
   'arma à distância: Mirar (abdica do movimento); de Recarga: Recarregar (movimento)');
ok(doc('equipamentos', 'Armadura de Placas').system.actions[0].preActivations[0].ref.startsWith('item|'), 'armadura: "Vestir" liga o próprio item');
const ref = await import(new URL('../esmodules/referencias.mjs', import.meta.url).href);
const placas = JSON.parse(JSON.stringify(doc('equipamentos', 'Armadura de Placas')));
ref.normalizarAutoRefs(placas, { id: 'naFicha000000001', nome: placas.name, ids: [placas._id] });
ok(placas.system.actions[0].preActivations[0].ref === 'item|naFicha000000001|0|Armadura de Placas'
   && ref.acoesDisparadas(placas, { id: 'naFicha000000001', nome: placas.name }).size === 0,
   'na ficha (id novo), o "Vestir" passa a apontar para o id do item — e não vira ação interna');
ok(doc('equipamentos', 'Cavalo de Guerra').system.actions[0].appliesEffects[0].fxType === 'set'
   && doc('equipamentos', 'Cavalo de Guerra').system.actions[0].appliesEffects[0].fxValue === '15', 'montaria: Deslocamento 15m enquanto montado');
const estrepes = doc('equipamentos', 'Estrepes').system.actions[0];
ok(estrepes.persistArea && estrepes.appliesEffects[0].fxTarget === 'lento' && estrepes.appliesEffects[0].resistDc === '12',
   'Estrepes: área que deixa Lento quem entra (Agilidade Difícil anula)');
ok(/\(consumível\)$/.test(doc('equipamentos', 'Remédio').system.actions[0].label) && doc('equipamentos', 'Remédio').system.actions[0].actionCost === 'simple',
   'Remédio: beber é ação rápida (consumível)');

console.log('7) Criação de Magias: tempo de conjuração, reação e lendárias');
const base = (n) => magias.find((m) => m.name === n);
const MM = (p, n) => sf.METAMAGIAS[p].find((m) => m.name === n);
const criar = (n, tier, extra = {}) => sf.construirMagia({ base: base(n), tier, nome: '', palavra1: base(n).system.wordId, pecs: extra.pecs ?? [], ajuste: 0,
  ...extra }, { animar: false });
let d = await criar('Raio Arcano', 'Intermediária', { palavra2: 'saeculorum', meta2: MM('saeculorum', 'Magia Acelerada') });
ok(d.system.casting === 'Ação Rápida' && d.system.actions[0].actionCost === 'simple', 'Magia Acelerada: de Ação para Ação Rápida (gasta a simples)');
d = await criar('Raio Arcano', 'Intermediária', { palavra2: 'saeculorum', meta2: MM('saeculorum', 'Magia Acelerada'), reacao: true });
ok(d.system.casting === 'Reação' && d.system.actions[0].actionCost === 'reaction' && d.flags[MOD].receita.reacao,
   'Acelerada + "conjurar como reação": a magia gasta a reação');
d = await criar('Aumento Arcano', 'Menor', { reacao: true });
ok(d.system.actions.every((a) => a.actionCost === 'reaction'), 'magia que já é de ação rápida (Aumento Arcano) também pode ser feita reação');
d = await criar('Raio Arcano', 'Menor', { reacao: true });
ok(d.system.actions[0].actionCost === 'standard' && d.system.casting === 'Ação', 'de Ação, sem Acelerada, a reação não vale (fica a padrão)');
d = await criar('Reparar', 'Intermediária', { palavra2: 'saeculorum', meta2: MM('saeculorum', 'Magia Acelerada') });
ok(d.system.casting === 'Rodada completa' && d.system.actions[0].actionCost === 'standard', 'Acelerada numa magia de Cena: rodada completa');
d = await criar('Esfera Ígnea', 'Lendária (4 palavras)', { palavra2: 'majesto', meta2: MM('majesto', 'Magia Ampliada'),
  palavra3: 'fulgur', meta3: MM('fulgur', 'Magia Eletrizante'), palavra4: 'saeculorum', meta4: MM('saeculorum', 'Magia Acelerada') });
let a = d.system.actions[0];
ok(d.system.tier === 'Maior' && d.flags[MOD].receita.lendaria === 4 && d.flags[MOD].receita.palavras.length === 4
   && d.system.metamagics.length === 3 && a.costMp === '4' && a.damageType === 'raio' && a.actionCost === 'simple'
   && a.range === '20*@nivel' && /Magia Lendária — 4 palavras/.test(d.system.description),
   `lendária de 4 palavras: 4 PM, 3 metamagias (Ampliada, Eletrizante, Acelerada), alcance ${a.range} (5m × 4 × Nível), Círculo Maior no sistema`);
d = await criar('Esfera Ígnea', 'Lendária (5 palavras)', { palavra2: 'majesto', meta2: MM('majesto', 'Magia Ampliada'), palavra3: 'majesto',
  meta3: MM('majesto', 'Magia Ampliada'), palavra4: 'majesto', meta4: MM('majesto', 'Magia Ampliada'), palavra5: 'majesto', meta5: MM('majesto', 'Magia Ampliada') });
ok(d.system.actions[0].costMp === '5' && d.system.actions[0].area === '4*(5*@nivel)' && /aplicada pela 4ª vez/.test(d.system.description),
   `cinco palavras, Ampliada quatro vezes: a área soma a base (${d.system.actions[0].area})`);
ok(Object.keys(sf.TIERS).length === 5 && sf.MAX_PALAVRAS === 5 && sf.tierEfetivo('Lendária (5 palavras)') === 'Maior',
   'círculos: Menor, Intermediária, Maior e as Lendárias de 4 e 5 palavras (no máximo 5)');

console.log('8) Criação de Magias: ações internas e sustentação');
d = await criar('Controlar Criatura', 'Intermediária', { palavra2: 'pluribus', meta2: MM('pluribus', 'Magia Múltipla') });
const copia = d.system.actions.find((x) => /^↳/.test(x.label));
ok(d.system.actions[0].appliesEffects[0].fxSustain === 'simple' && copia?.actionCost === 'none' && copia.appliesEffects.every((e) => e.fxSustain === 'none'),
   'Controlar Criatura + Múltipla: a original sustenta; a cópia (2º alvo) não gasta ação nem cria outro vínculo');
d = await criar('Barreira Arcana', 'Maior', { palavra2: 'forjuri', meta2: MM('forjuri', 'Magia Protetora') ?? sf.METAMAGIAS.forjuri[0],
  palavra3: 'forjuri', meta3: sf.METAMAGIAS.forjuri[0],
  pecs: sf.parsePeculiaridades(base('Barreira Arcana')).filter((p) => /^Sustentável — Ação Rápida/.test(p.texto)) });
ok(d.system.actions[0].persistSustain === 'simple' && d.system.duration === 'Sustentável — Ação Rápida',
   'Barreira Arcana com a peculiaridade "Sustentável — Ação Rápida" (Maior): a área passa a sustentar com a ação simples');
d = await criar('Raio Arcano', 'Intermediária', { palavra2: 'carmo', meta2: MM('carmo', 'Magia Dominadora') });
ok(d.system.actions[0].appliesEffects.some((e) => e.fxTarget === 'dominado' && e.fxSustain === 'simple'),
   'Magia Dominadora: Dominado enquanto sustentado pela ação rápida');

const conj = { items: [{ type: 'habilidade', name: 'Carisma' }, { type: 'habilidade', name: 'Vontade de Ferro' }] };
const bh = sf.bonusDeHabilidades(base('Telepatia'), conj);
d = await criar('Telepatia', 'Menor', { bonusHabilidades: bh, nome: 'Recado Mental' });
ok(bh.map((x) => x.nome).join() === 'Vontade de Ferro,Carisma' && d.flags[MOD].receita.habilidades.length === 2
   && /Bônus de habilidades da ficha/.test(d.system.description),
   'magia criada (outro nome): o +1 de Carisma e de Vontade de Ferro que a base cita entra na própria magia');
d = await criar('Raio Arcano', 'Menor', { bonusHabilidades: sf.bonusDeHabilidades(base('Raio Arcano'), { items: [] }) });
ok(!d.flags[MOD].receita.habilidades, 'sem a habilidade na ficha, nada entra');

console.log('9) Encantamento de Itens: a ativação da propriedade é a ação');
const P = (id) => PROPRIEDADES.find((p) => p.id === id);
const sint = (nome, categoria = '') => ({ _id: 'sint', name: nome, type: 'equipamento', flags: {}, system: { category: categoria, tags: [], actions: [], effects: [], costs: [], price: '10 Vo', description: '' } });
const encantar = (item, nivel, ids, extra = {}) => enc.construirEncantamento(item, { nivel, escolhas: ids.map((id) => ({ prop: P(id), palavra: P(id).palavra })), ...extra }, { animar: false });
ok(enc.custoDaAtivacao('Ação Rápida') === 'simple' && enc.custoDaAtivacao('Reação') === 'reaction' && enc.custoDaAtivacao('Movimento') === 'movement'
   && enc.custoDaAtivacao('Ação Livre') === 'free' && enc.custoDaAtivacao('Ação') === 'standard' && enc.custoDaAtivacao('Constante') === 'none'
   && enc.custoDaAtivacao('Constante / Ação Rápida') === 'simple', 'ativação da propriedade → ação da rodada');
d = encantar(sint('Anel de Prata', 'Joia'), 'Menor', ['saeculorum-movimento-rapido']);
let mov = d.system.actions[0];
ok(mov.actionCost === 'free' && mov.appliesEffects[0].fxType === 'action' && mov.appliesEffects[0].fxTarget === 'acao:movement'
   && mov.appliesEffects[0].durationMode === 'rounds' && eco.acoesNaHora(mov).join() === 'movement',
   'Movimento Rápido: ação livre, +1 movimento nesta rodada (o módulo devolve a ação na hora)');
d = encantar(sint('Anel de Prata', 'Joia'), 'Intermediário', ['saeculorum-aceleracao']);
ok(d.system.actions[0].appliesEffects.map((e) => e.fxTarget).join() === 'acao:standard,acao:movement,acao:simple'
   && eco.acoesNaHora(d.system.actions[0]).length === 3, 'Aceleração: um turno adicional (padrão, movimento e simples)');
const rapidez = P('saeculorum-rapidez');
d = enc.construirEncantamento(sint('Poção', 'Suprimento'), { escolhas: [{ prop: rapidez, palavra: 'saeculorum', variante: rapidez.variantes[1] }] }, { animar: false });
ok(d.system.actions[0].actionCost === 'simple' && d.system.actions[0].appliesEffects[0].fxTarget === 'acao:movement'
   && d.system.actions[0].appliesEffects[0].durationMode === 'scene', 'poção de Rapidez (Movimento): beber é ação rápida; +1 movimento por turno, a cena');
d = encantar(sint('Sinete de Prata', 'Joia'), 'Menor', ['forjuri-contramagica']);
ok(d.system.actions.some((x) => x.actionCost === 'reaction'), 'Contramágica (Reação): a propriedade gasta a reação');
const anel = sint('Anel de Prata', 'Joia');
const constante = PROPRIEDADES.find((p) => p.ativacao === 'Constante' && !p.consumivel && enc.compativel(p, enc.tiposDoItem(anel))
  && !enc.regraDe(p, enc.contexto(p, p.variantes[0], enc.tiposDoItem(anel))).arma);
d = encantar(anel, 'Menor', [constante.id]);
ok(d.system.actions.find((x) => x.label.startsWith('✦ Ativar'))?.actionCost === 'free', `propriedade constante paga por cena (${constante.nome}): "✦ Ativar" é ação livre`);
d = encantar(anel, 'Menor', ['iluzio-invisibilidade']);
ok(d.system.actions[0].actionCost === 'simple', 'Invisibilidade (Ação Rápida): a ação simples');
d = encantar(JSON.parse(JSON.stringify(doc('equipamentos', 'Espada Longa'))), 'Menor', ['ignis-dano-flamejante']);
ok(d.system.actions.filter((x) => x.isWeapon).every((x) => x.actionCost === 'standard'), 'versões ✦ do ataque: continuam na ação padrão');
d = encantar(anel, 'Maior', [constante.id], { lendario: true });
ok(d.system.actions.length === 1 && d.system.actions[0].actionCost === 'none' && /constante \(lendário\)/.test(d.system.actions[0].label),
   'lendário só com constantes: a ação que anuncia a propriedade (todo item tem ação)');
ok(PACKS['itens-magicos'].every((x) => x.system.actions.length && x.system.actions.every((y) => CUSTOS.has(y.actionCost))),
   'compêndio Itens Mágicos: todo item com ação, e toda ação com o que gasta');

const lend5 = await criar('Esfera Ígnea', 'Lendária (5 palavras)', { palavra2: 'ignis', meta2: MM('ignis', 'Magia Flamejante'), palavra3: 'ignis',
  meta3: MM('ignis', 'Magia Flamejante'), palavra4: 'ignis', meta4: MM('ignis', 'Magia Flamejante'), palavra5: 'ignis', meta5: MM('ignis', 'Magia Flamejante') });
const cajado = enc.construirItemConjurador(JSON.parse(JSON.stringify(doc('equipamentos', 'Cajado'))), { magia: lend5 });
const rcj = cajado.flags[MOD].encantamentos.at(-1);
ok(rcj.nivel === 'Maior' && rcj.pm === 5 && /lendária de 5 palavras/.test(cajado.system.description) && /<b>5 PM<\/b>/.test(cajado.system.description),
   'item conjurador com magia lendária: item Maior, conjura pagando os 5 PM dela');

console.log('10) Movimento forçado não é cobrado de novo');
const opcoes = { ligeiaForced: true, ligeiaMoveFrom: { x: 0, y: 0 } };
eco.naoCobrarMovimentoForcado({}, { x: 100 }, opcoes);
const normal = { ligeiaMoveFrom: { x: 0, y: 0 } };
eco.naoCobrarMovimentoForcado({}, { x: 100 }, normal);
ok(!('ligeiaMoveFrom' in opcoes) && 'ligeiaMoveFrom' in normal, 'teleporte/empurrão de uma ação: sem cobrança de deslocamento; andar continua cobrando');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
