// Põe as animações automáticas nas magias do compêndio (packs-source/magias).
//
// Usa as MESMAS regras da Criação de Magias (esmodules/animacoes.mjs), mas só
// com animações que existem no JB2A gratuito E no Patreon — o compêndio não
// sabe qual dos dois você tem. Chamado por scripts/generate.py depois de
// gravar os JSON e antes de validar.
//
// As animações ficam onde o sistema guarda uma animação puxada do item
// (action.aaConfig e appliesEffects[].fxAaConfig), então saem pelo ✕ ou pelo
// "limpar animações" na ficha do item.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { animarMagia, chaveSegura } from "../esmodules/animacoes.mjs";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dir = path.join(root, "packs-source", "magias");

let acoes = 0, efeitos = 0, magias = 0;
for (const nome of fs.readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
  const arquivo = path.join(dir, nome);
  const doc = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const r = animarMagia(doc, { existe: chaveSegura });
  if (r.acoes || r.efeitos) magias++;
  acoes += r.acoes;
  efeitos += r.efeitos;
  fs.writeFileSync(arquivo, JSON.stringify(doc, null, 2) + "\n", "utf8");
}
console.log(`Animações automáticas: ${magias} magias, ${acoes} ações, ${efeitos} efeitos.`);
