import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { fileURLToPath } from "url";
import fs from "fs";
import os from "os";
import path from "path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packs = ["habilidades", "magias", "equipamentos", "itens-magicos", "tracos",
               "racas", "herancas", "vocacoes", "carreiras", "organizacoes", "complicacoes"];

for (const pack of packs) {
  let src = path.join(root, "packs-source", pack);
  if (!fs.existsSync(src)) continue; // pack sem fonte (ex.: complicacoes vazio)
  let temporaria = null;
  if (pack === "itens-magicos") {
    // As pastas do compêndio (tipo do item › nível) não ficam em packs-source,
    // onde só há itens: entram aqui, junto de uma cópia dos itens.
    const { pastasUsadas } = await import("./itens-magicos.mjs");
    temporaria = fs.mkdtempSync(path.join(os.tmpdir(), "itens-magicos-"));
    const itens = [];
    for (const f of fs.readdirSync(src).filter((x) => x.endsWith(".json"))) {
      fs.copyFileSync(path.join(src, f), path.join(temporaria, f));
      itens.push(JSON.parse(fs.readFileSync(path.join(src, f), "utf8")));
    }
    for (const p of pastasUsadas(itens)) {
      fs.writeFileSync(path.join(temporaria, `_pasta_${p._id}.json`), JSON.stringify(p, null, 2));
    }
    src = temporaria;
  }
  const dest = path.join(root, "packs", pack);
  await compilePack(src, dest, { log: false });
  if (temporaria) fs.rmSync(temporaria, { recursive: true, force: true });
  console.log(`Compilado: packs/${pack}`);
}
console.log("Todos os packs compilados.");
