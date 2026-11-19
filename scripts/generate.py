#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera os documentos JSON dos compêndios em packs-source/."""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from builders import slugify
from enhance import enhance
from data_habilidades_1 import HABILIDADES_1
from data_habilidades_2 import HABILIDADES_2
from data_habilidades_3 import HABILIDADES_3
from data_habilidades_4 import HABILIDADES_4
from data_magias_1 import MAGIAS_1
from data_magias_2 import MAGIAS_2
from data_equipamentos import EQUIPAMENTOS
from data_equipamentos_2 import EQUIPAMENTOS_2
from data_itens_mecanicos import ITENS_MECANICOS
from data_tracos import TRACOS
from data_tracos_2 import TRACOS_2
from data_racas_herancas import RACAS, HERANCAS
from data_vocacoes_carreiras import VOCACOES, CARREIRAS
from data_complicacoes import COMPLICACOES
from data_organizacoes import ORGANIZACOES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Tipos cujos nomes usam sub-grupos: "Base (Sub)" -> "Base [Sub]".
SUBGROUP_NAME_TYPES = {"habilidade", "complicacao"}
# Tipos de definição cujas skillList referenciam habilidades por nome.
DEFINITION_TYPES = {"raca", "heranca", "vocacao", "carreira", "organizacao"}

_TRAILING_PARENS = re.compile(r"\s\(([^()]*)\)$")


# Entradas GENÉRICAS das listas do livro ("[Qualquer]", "[Único]"...). O
# sistema compara nomes exatos (com colchetes), então cada uma é expandida
# para as variantes reais do compêndio. Filtro opcional de subgrupos.
EXPANDIR = {
    "Afinidade Mágica Elemental [Ancestralidade]": ("Afinidade Mágica Elemental", None),
    "Conhecimento [Qualquer]": ("Conhecimento", None),
    "Espírito Guardião [Qualquer]": ("Espírito Guardião", None),
    "Espírito Guardião [Único]": ("Espírito Guardião", None),
    "Espírito Guardião [Único, depende do Clã]": ("Espírito Guardião", None),
    "Explorador [Qualquer]": ("Explorador", None),
    "Juramento [Qualquer]": ("Juramento", None),
    "Pacto [Único]": ("Pacto", None),
    "Palavra Arcana [Único]": ("Palavra Arcana", None),
    # Ancestralidade dracônica: ácido, raio, frio, fogo, veneno
    "Palavra Arcana [Ancestralidade]": ("Palavra Arcana", ["acida", "fulgur", "glacios", "ignis", "noxia"]),
    "Presa de Caça [Qualquer]": ("Presa de Caça", None),
    "Sopro de Dragão": ("Sopro de Dragão", None),
    "Trilhador [Qualquer]": ("Trilhador", None),
    # Tabela de Clãs de Sei Yang
    "Usar Armas [Único, depende do Clã]": ("Usar Armas", [
        "Lâminas Grandes", "Arcos", "Duas Mãos", "Martelos", "Lâminas Pequenas",
        "Machados", "Lanças", "Desarmado", "Haste", "Arremesso", "Uma Mão",
        "Corpo a Corpo"]),
    "Veículos [Qualquer]": ("Veículos", None),
}
# Mantêm também a própria entrada genérica (são nomes de habilidade-chave).
MANTER_GENERICO = {"Pacto [Único]", "Juramento [Qualquer]", "Presa de Caça [Qualquer]"}
# Grafias do livro que diferem do nome da habilidade.
RENOMEAR = {
    "Explorador [Glacial]": "Explorador [Glaciais]",
    "Familiar [Dragonete]": "Familiar",
    "Familiar [Imp]": "Familiar",
    "Familiar [Querubim]": "Familiar",
}


def _norm(s):
    import unicodedata
    s = unicodedata.normalize("NFD", str(s))
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s.lower().strip())


def expandir_lista(lista, catalogo, chaves=()):
    """Expande genéricos, corrige grafias e remove duplicatas (ordem mantida)."""
    out = []
    for s in lista:
        s = RENOMEAR.get(s, s)
        if s in EXPANDIR:
            base, filtro = EXPANDIR[s]
            filtro_n = {_norm(f) for f in filtro} if filtro else None
            if s in MANTER_GENERICO and s in chaves:
                out.append(s)
            for nome in catalogo:
                m = re.match(rf"^{re.escape(base)} \[(.+)\]$", nome)
                if m and (filtro_n is None or _norm(m.group(1)) in filtro_n):
                    out.append(nome)
        else:
            out.append(s)
    return list(dict.fromkeys(out))


def _rotulos_com_colchetes(sysd, antigo, novo):
    """Os rótulos de ações e efeitos citam o nome do item ("Explorador
    (Florestas) — rolar..."): acompanham a troca para colchetes."""
    if antigo == novo:
        return
    for e in sysd.get("effects", []):
        e["label"] = e.get("label", "").replace(antigo, novo)
    for a in sysd.get("actions", []):
        a["label"] = a.get("label", "").replace(antigo, novo)
        for ap in a.get("appliesEffects", []):
            ap["label"] = ap.get("label", "").replace(antigo, novo)


def bracketize(text):
    """Converte o sub-grupo final de parênteses para colchetes.

    "Usar Armas (Machados)" -> "Usar Armas [Machados]".
    Não altera nomes sem parêntese final.
    """
    return _TRAILING_PARENS.sub(r" [\1]", text)

PACKS = {
    "habilidades": sorted(HABILIDADES_1 + HABILIDADES_2 + HABILIDADES_3 + HABILIDADES_4,
                          key=lambda d: d["name"].lower()),
    "magias": sorted(MAGIAS_1 + MAGIAS_2,
                     key=lambda d: (d["system"]["wordId"], d["name"].lower())),
    "equipamentos": EQUIPAMENTOS + EQUIPAMENTOS_2 + ITENS_MECANICOS,
    "tracos": sorted(TRACOS + TRACOS_2,
                     key=lambda d: (d["system"]["source"], d["name"].lower())),
    "racas": RACAS,
    "herancas": HERANCAS,
    "vocacoes": VOCACOES,
    "carreiras": CARREIRAS,
    "organizacoes": ORGANIZACOES,
    "complicacoes": sorted(COMPLICACOES, key=lambda d: d["name"].lower()),
}


def animar_magias():
    """Põe as animações automáticas em packs-source/magias (Node)."""
    import shutil
    import subprocess
    node = shutil.which("node")
    if not node:
        print("AVISO — Node.js não encontrado: as magias saem sem as animações "
              "automáticas (scripts/animar-compendio.mjs).")
        return
    subprocess.run([node, os.path.join(ROOT, "scripts", "animar-compendio.mjs")], check=True)


def main():
    total = 0
    # Catálogo de nomes de habilidade (já com colchetes) para expandir e
    # validar as listas das definições.
    catalogo = [bracketize(d["name"]) for d in PACKS["habilidades"]]
    catalogo_n = {_norm(n) for n in catalogo}
    problemas = []
    for pack, docs in PACKS.items():
        if not docs:
            continue  # pack vazio (ex.: complicacoes sem conteúdo)
        outdir = os.path.join(ROOT, "packs-source", pack)
        os.makedirs(outdir, exist_ok=True)
        for old in os.listdir(outdir):
            os.remove(os.path.join(outdir, old))
        seen = {}
        for i, doc in enumerate(docs):
            doc["sort"] = (i + 1) * 100
            # Aprimoramentos automáticos (perícias, fórmulas @nivel, alcance
            # de magias, classificação passive/active) — ver enhance.py.
            enhance(doc)
            # Sub-grupos com colchetes: nos nomes de habilidades e
            # complicações (inclusive prereq) e em todas as skillList.
            if doc["type"] in SUBGROUP_NAME_TYPES:
                antigo = doc["name"]
                doc["name"] = bracketize(antigo)
                _rotulos_com_colchetes(doc["system"], antigo, doc["name"])
                if doc["system"].get("prereq"):
                    doc["system"]["prereq"] = bracketize(doc["system"]["prereq"])
            if doc["type"] in DEFINITION_TYPES:
                for k in doc["system"].get("keySkills", []):
                    antigo = k["name"]
                    k["name"] = bracketize(antigo)
                    if not k.get("sourceUuid"):   # os do compêndio já vieram prontos
                        _rotulos_com_colchetes(k["system"], antigo, k["name"])
                chaves = {k["name"] for k in doc["system"].get("keySkills", [])}
                lista = [bracketize(s) for s in doc["system"]["skillList"]]
                doc["system"]["skillList"] = expandir_lista(lista, catalogo, chaves)
                for s in doc["system"]["skillList"]:
                    if _norm(s) not in catalogo_n and s not in chaves:
                        problemas.append(f"{pack}/{doc['name']}: '{s}' não existe no compêndio")
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
    if problemas:
        print("\nERRO — entradas de lista sem habilidade correspondente:")
        for p_ in problemas:
            print("  -", p_)
        raise SystemExit(1)
    # Animações automáticas das magias: as mesmas regras da Criação de Magias
    # (esmodules/animacoes.mjs), rodadas pelo Node para não haver duas cópias.
    animar_magias()
    # Confere cada documento contra o schema do sistema (choices, tipos,
    # fórmulas) — o build falha se algo seria recusado pelo Foundry.
    import validate
    if validate.main(ROOT):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
