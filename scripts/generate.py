#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera os documentos JSON dos compêndios em packs-source/."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from builders import slugify
from data_habilidades_1 import HABILIDADES_1
from data_habilidades_2 import HABILIDADES_2
from data_habilidades_3 import HABILIDADES_3
from data_magias_1 import MAGIAS_1
from data_magias_2 import MAGIAS_2
from data_equipamentos import EQUIPAMENTOS
from data_tracos import TRACOS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PACKS = {
    "habilidades": sorted(HABILIDADES_1 + HABILIDADES_2 + HABILIDADES_3,
                          key=lambda d: d["name"].lower()),
    "magias": sorted(MAGIAS_1 + MAGIAS_2,
                     key=lambda d: (d["system"]["wordId"], d["name"].lower())),
    "equipamentos": EQUIPAMENTOS,
    "tracos": sorted(TRACOS, key=lambda d: (d["system"]["source"], d["name"].lower())),
}


def main():
    total = 0
    for pack, docs in PACKS.items():
        outdir = os.path.join(ROOT, "packs-source", pack)
        os.makedirs(outdir, exist_ok=True)
        for old in os.listdir(outdir):
            os.remove(os.path.join(outdir, old))
        seen = {}
        for i, doc in enumerate(docs):
            doc["sort"] = (i + 1) * 100
            # Padrão global: todo item mostra o botão de ativação (mode
            # "active"), mas começa com a checkbox desligada (active False).
            doc["system"]["mode"] = "active"
            doc["system"]["active"] = False
            if doc["_id"] in seen:
                raise SystemExit(f"ID duplicado em {pack}: {doc['name']} x {seen[doc['_id']]}")
            seen[doc["_id"]] = doc["name"]
            fname = f"{slugify(doc['name'])}_{doc['_id']}.json"
            with open(os.path.join(outdir, fname), "w", encoding="utf-8") as f:
                json.dump(doc, f, ensure_ascii=False, indent=2)
                f.write("\n")
        print(f"packs-source/{pack}: {len(docs)} documentos")
        total += len(docs)
    print(f"Total: {total} documentos")


if __name__ == "__main__":
    main()
