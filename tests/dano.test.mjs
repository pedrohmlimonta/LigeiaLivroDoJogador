// Testes do dano escalonado no compêndio: node tests/dano.test.mjs (após python3 scripts/generate.py)
// "+N" no livro = dano escalonado (base N, +1 a cada 2 acima da defesa); sem o "+", fixo.
import fs from 'fs';

const raiz = new URL('../packs-source/', import.meta.url).pathname;
const todos = [];
for (const pack of fs.readdirSync(raiz)) {
  for (const f of fs.readdirSync(`${raiz}/${pack}`)) {
    todos.push({ pack, doc: JSON.parse(fs.readFileSync(`${raiz}/${pack}/${f}`, 'utf8')) });
  }
}
const item = (pack, nome) => todos.find((x) => x.pack === pack && x.doc.name === nome)?.doc;
const comDano = (doc) => (doc?.system.actions ?? []).filter((a) => String(a.damage ?? '').trim() !== '' && (a.damageResource ?? 'hp') === 'hp');

let falhas = 0;
const ok = (cond, msg) => { console.log((cond ? '  ✓ ' : '  ✗ ') + msg); if (!cond) falhas++; };

console.log('1) Armas: "Dano Base: Tipo +N" — todas escalam');
const armas = todos.filter((x) => x.pack === 'equipamentos').flatMap((x) => comDano(x.doc).map((a) => [x.doc.name, a]));
ok(armas.length >= 54 && armas.every(([, a]) => a.scalingDamage === true),
   `${armas.length} ataques de arma escalonados (${armas.filter(([, a]) => !a.scalingDamage).map(([n]) => n).join(', ') || 'nenhum fixo'})`);
const adaga = comDano(item('equipamentos', 'Adaga'))[0];
ok(adaga.damage === '1' && adaga.damageType === 'perfuracao' && adaga.scalingDamage, 'Adaga: Perfuração +1 (base 1, escalonado)');
ok(comDano(item('equipamentos', 'Soco'))[0].damage === '0' && comDano(item('equipamentos', 'Soco'))[0].scalingDamage,
   'Soco: Concussão +0 (base 0, escalonado)');
const cajado = comDano(item('equipamentos', 'Cajado'))[0];
ok(cajado.scalingDamage && cajado.isMelee && cajado.isWeapon, 'Cajado como arma de duas mãos: Concussão +1, corpo a corpo');

console.log('2) Habilidades');
const esc = (nome, re) => comDano(item('habilidades', nome)).filter((a) => !re || re.test(a.label));
ok(esc('Garras').every((a) => a.scalingDamage), 'Garras: Corte +Nível escala');
ok(esc('Presas').every((a) => a.scalingDamage) && esc('Cauda').every((a) => a.scalingDamage), 'Presas e Cauda escalam');
ok(esc('Artes Marciais').length === 2 && esc('Artes Marciais').every((a) => a.scalingDamage),
   'Artes Marciais: o dano base do ataque desarmado (metade do Nível / Nível) escala');
ok(esc('Golpear com Escudo').every((a) => a.scalingDamage), 'Golpear com Escudo: Concussão +0 escala');
ok(esc('Sopro de Dragão [Fogo]').every((a) => a.scalingDamage), 'Sopro de Dragão: dano base metade do Nível, escalonado');
ok(esc('Afinidade Mágica Elemental [Fogo]').every((a) => !a.scalingDamage), 'Afinidade Mágica Elemental: dano bruto adicional, fixo');
for (const nome of ['Letalidade', 'Golpe Letal', 'Punição', 'Golpe Crítico Brutal']) {
  ok(esc(nome).length > 0 && esc(nome).every((a) => !a.scalingDamage && a.damageType === 'final'), `${nome}: dano final, fixo`);
}

console.log('3) Magias');
const magia = (nome) => comDano(item('magias', nome))[0];
for (const nome of ['Esfera Ígnea', 'Raio Arcano', 'Toque Chocante', 'Área Congelada', 'Consagrar', 'Visão Aterradora']) {
  ok(magia(nome)?.scalingDamage === true, `${nome}: escalonado`);
}
for (const nome of ['Míssil Mágico', 'Explodir', 'Aura Arcana', 'Força da Natureza']) {
  ok(magia(nome)?.scalingDamage === false, `${nome}: fixo`);
}

console.log('4) Cópias embutidas');
const monge = item('vocacoes', 'Monge').system.keySkills.find((k) => k.name === 'Artes Marciais');
ok(comDano(monge).every((a) => a.scalingDamage), 'Artes Marciais do Monge também escala');
const finaisEscalonados = todos.flatMap((x) => [x.doc, ...(x.doc.system.keySkills ?? []), ...(x.doc.system.grantedTraits ?? [])])
  .flatMap((d) => comDano(d)).filter((a) => a.damageType === 'final' && a.scalingDamage);
ok(finaisEscalonados.length === 0, 'nenhum dano final escalonado em todo o compêndio');

console.log(falhas ? `\n${falhas} FALHA(S)` : '\nTodos os testes passaram.');
process.exit(falhas ? 1 : 0);
