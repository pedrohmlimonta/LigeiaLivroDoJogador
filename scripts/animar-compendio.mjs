// Põe as animações automáticas em todo o compêndio (packs-source/**).
//
// Usa as MESMAS regras da Criação de Magias (esmodules/animacoes.mjs): magias,
// armas, habilidades, traços... — mas só com animações que existem no JB2A
// gratuito E no Patreon, porque o compêndio não sabe qual dos dois você tem.
// Chamado por scripts/generate.py depois de gravar os JSON e antes de validar.
//
// As animações ficam onde o sistema guarda uma animação puxada do item
// (action.aaConfig e appliesEffects[].fxAaConfig), então saem pelo ✕ ou pelo
// "limpar animações" na ficha do item.
//
// Os instantâneos embutidos (traços das raças, heranças e carreiras;
// habilidades-chave das vocações) recebem a cópia exata do item do compêndio
// para o qual apontam — é o que a ficha recria.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { animarItem, chaveSegura } from "../esmodules/animacoes.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fonte = path.join(root, "packs-source");
const MODULO = "ligeia-livro-do-jogador";
const opcoes = { existe: chaveSegura };

// 1) Lê tudo.
const docs = [];
for (const pack of fs.readdirSync(fonte).sort()) {
  const dir = path.join(fonte, pack);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const nome of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const arquivo = path.join(dir, nome);
    docs.push({ pack, arquivo, doc: JSON.parse(fs.readFileSync(arquivo, "utf8")) });
  }
}

// 2) Anima cada item.
const porPack = {};
const porUuid = new Map();
for (const { pack, doc } of docs) {
  const r = animarItem(doc, opcoes);
  const t = (porPack[pack] ??= { itens: 0, acoes: 0, efeitos: 0 });
  if (r.acoes || r.efeitos) t.itens++;
  t.acoes += r.acoes;
  t.efeitos += r.efeitos;
  porUuid.set(`Compendium.${MODULO}.${pack}.Item.${doc._id}`, doc);
}

// 3) Instantâneos: cópia do item de origem; os genéricos (sem origem) são
//    animados pelas mesmas regras.
let copias = 0;
for (const { doc } of docs) {
  for (const [campo, tipo] of [["grantedTraits", "traco"], ["keySkills", "habilidade"]]) {
    for (const snap of doc.system?.[campo] ?? []) {
      const origem = snap.sourceUuid ? porUuid.get(snap.sourceUuid) : null;
      if (origem) {
        snap.system = JSON.parse(JSON.stringify(origem.system));
        copias++;
      } else {
        animarItem({ name: snap.name, type: tipo, system: snap.system }, opcoes);
      }
    }
  }
}

// 4) Grava.
for (const { arquivo, doc } of docs) {
  fs.writeFileSync(arquivo, JSON.stringify(doc, null, 2) + "\n", "utf8");
}
const resumo = Object.entries(porPack)
  .filter(([, t]) => t.acoes || t.efeitos)
  .map(([p, t]) => `${p}: ${t.itens} itens, ${t.acoes} ações, ${t.efeitos} efeitos`)
  .join("; ");
console.log(`Animações automáticas — ${resumo}; ${copias} instantâneos sincronizados.`);
