import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packs = ["habilidades", "magias", "equipamentos", "tracos",
               "racas", "herancas", "vocacoes", "carreiras", "complicacoes"];

import fs from "fs";

for (const pack of packs) {
  const src = path.join(root, "packs-source", pack);
  if (!fs.existsSync(src)) continue; // pack sem fonte (ex.: complicacoes vazio)
  const dest = path.join(root, "packs", pack);
  await compilePack(src, dest, { log: false });
  console.log(`Compilado: packs/${pack}`);
}
console.log("Todos os packs compilados.");
