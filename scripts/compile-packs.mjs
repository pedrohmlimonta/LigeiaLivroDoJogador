import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { fileURLToPath } from "url";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packs = ["habilidades", "magias", "equipamentos", "tracos"];

for (const pack of packs) {
  const src = path.join(root, "packs-source", pack);
  const dest = path.join(root, "packs", pack);
  await compilePack(src, dest, { log: false });
  console.log(`Compilado: packs/${pack}`);
}
console.log("Todos os packs compilados.");
