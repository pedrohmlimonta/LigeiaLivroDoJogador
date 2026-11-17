# -*- coding: utf-8 -*-
"""Aprimoramentos automáticos aplicados pelo generate.py sobre os documentos
(sistema ligeia-rpg 0.2.x v22+).

Mantém os data_*.py como transcrição fiel do livro e concentra aqui a
automação transversal:
  1. Perícias "1D em rolagens de X": efeito ativável (rollDice) + ação de
     rolagem pronta com o dado já somado — as duas opções.
  2. Fórmulas @nivel no lugar dos valores "1 (ajuste)" de RD/dano/efeito.
  3. Alcance/área das ações de magia derivados dos slots do livro
     ("5m x Círculo x Nível" -> "5*@nivel" no Círculo Menor).
  4. Classificação passive/active por item (incondicional vs situacional).
"""
import re

from builders import action, effect
from enhance_levels import apply_level_upgrades

ATTR_LABEL = {
    "forca": "Força", "agilidade": "Agilidade", "vigor": "Vigor",
    "mente": "Mente", "percepcao": "Percepção", "esquiva": "Esquiva",
    "bloqueio": "Bloqueio", "conjuracao": "Conjuração",
}

# ---------------------------------------------------------------------------
# 1) PERÍCIAS — nome (pré-colchetes) ou prefixo -> (alvo do efeito, atributo
#    da ação de rolagem ou None, efeito extra no nível A ou None)
#    O efeito é ATIVÁVEL (liga quando a situação se aplica); a ação rola o
#    atributo já com +1 dado de melhoria.
# ---------------------------------------------------------------------------
_A_BONUS_MEIO_NIVEL = ("bonus", "all", "ceil(@nivel/2)")

PERICIAS = {
    "Acrobacia": ("agilidade", "agilidade", None),
    "Alerta": ("percepcao", "percepcao", None),
    "Atletismo": ("forca", "forca", None),
    "Carisma": ("mente", "mente", None),
    "Conhecimento (": ("mente", "mente", None),
    "Defletir Projéteis": ("esquiva", "esquiva", None),
    "Desengajar": ("esquiva", "esquiva", None),
    "Etiqueta": ("all", "mente", None),
    "Explorador (": ("all", "percepcao", None),
    "Firmeza Física": ("all", "forca", None),
    "Furtividade": ("agilidade", "agilidade", None),
    "Guerra Santa": ("mente", "mente", None),
    "Lábia Natural": ("mente", "mente", None),
    "Lidar com Animais": ("mente", "mente", None),
    "Lidar com Armadilhas": ("mente", "mente", None),
    "Lidar com Venenos": ("mente", "mente", None),
    "Medicina": ("mente", "mente", None),
    "Mestre do Conhecimento": ("mente", "mente", None),
    "Montar Criatura": ("agilidade", "agilidade", None),
    "Ofícios": ("mente", "mente", None),
    "Presa de Caça (": ("all", "mente", None),
    "Senso Lógico": ("mente", "mente", ("rollDice", "mente", 1)),
    "Sobrevivência": ("percepcao", "percepcao", None),
    "Tenacidade Assustadora": ("mente", "mente", None),
    "Veículos (": ("agilidade", "agilidade", None),
    "Vontade de Ferro": ("all", "mente", _A_BONUS_MEIO_NIVEL),
}


def _match_pericia(name):
    if name in PERICIAS:
        return PERICIAS[name]
    for key, val in PERICIAS.items():
        if key.endswith("(") and name.startswith(key):
            return val
    return None


def _enhance_pericia(doc):
    spec = _match_pericia(doc["name"])
    if not spec:
        return
    fx_target, roll_attr, extra_a = spec
    sysd = doc["system"]
    alvo_lbl = "todas as rolagens aplicáveis" if fx_target == "all" \
        else f"rolagens de {ATTR_LABEL[fx_target]} aplicáveis"
    novo = effect("rollDice", fx_target, 1, level="B",
                  label=f"{doc['name']}: +1 dado em {alvo_lbl} (ligue quando valer)")
    # Não duplica se o item já declara um efeito igual
    if not any(e["type"] == "rollDice" and e["target"] == fx_target
               for e in sysd["effects"]):
        sysd["effects"].insert(0, novo)
    if extra_a:
        et, tg, vl = extra_a
        if not any(e["level"] == "A" and e["type"] == et and e["target"] == tg
                   for e in sysd["effects"]):
            sysd["effects"].append(effect(
                et, tg, vl, level="A",
                label=f"{doc['name']} (Avançado): aprimoramento adicional"))
    if roll_attr and not any(a.get("canRoll") and a.get("targetMode") == "none"
                             for a in sysd["actions"]):
        sysd["actions"].insert(0, action(
            f"{doc['name']} — rolar {ATTR_LABEL[roll_attr]} +1D",
            roll_attr=roll_attr, roll_dice=1, target_mode="none",
        ))
    sysd["mode"] = "active"
    doc["_mode_locked"] = True


# ---------------------------------------------------------------------------
# 2) Fórmulas @nivel nos valores marcados "(ajuste)"
# ---------------------------------------------------------------------------
_RE_LIMPA = re.compile(r"\s*\((?:metade do Nível(?:\s*—\s*ajuste)?|ajuste[^)]*)\)|"
                       r"\s*—\s*ajuste[^;)]*|; ajuste o valor", re.I)


def _formula_sweep(doc):
    sysd = doc["system"]
    for e in sysd.get("effects", []):
        lbl = e.get("label", "")
        if "metade do nível" in lbl.lower() and e.get("value") == "1":
            e["value"] = "ceil(@nivel/2)"
            e["label"] = _RE_LIMPA.sub("", lbl).strip()
    for a in sysd.get("actions", []):
        lbl = a.get("label", "")
        low = lbl.lower()
        if a.get("damage") == "1":
            if "metade do nível" in low:
                a["damage"] = "ceil(@nivel/2)"
            elif "+nível" in low or "+ nível" in low:
                a["damage"] = "@nivel"
        if "ajuste" in low or "metade do nível" in low or "+nível" in low:
            a["label"] = _RE_LIMPA.sub("", lbl).replace("; ajuste o valor", "").strip()
        for ap in a.get("appliesEffects", []):
            al = ap.get("label", "")
            if "metade do nível" in al.lower() and ap.get("fxValue") == "1":
                ap["fxValue"] = "ceil(@nivel/2)"


# ---------------------------------------------------------------------------
# 3) Alcance/área de MAGIA a partir dos slots textuais do livro
#    (Círculo Menor: Círculo = 1)
# ---------------------------------------------------------------------------
def _slot_formula(text):
    """Converte "5m x Círculo x Nível" etc. em fórmula (@nivel) p/ Menor."""
    t = (text or "").strip().lower()
    if not t:
        return None
    t2 = t.replace("í", "i")
    # "Nível x Círculo", "Círculo x Nível" e "Nível" (sem metragem)
    if re.match(r"^(nivel\s*x\s*circulo|circulo\s*x\s*nivel|nivel)$", t2):
        return "@nivel"
    t = t.replace("í", "i").replace("x", "x")
    m = re.match(r"^(\d+)\s*m?\s*(?:x\s*(circulo|nivel)\s*)?(?:x\s*(circulo|nivel)\s*)?$",
                 t.replace("círculo", "circulo").replace("nível", "nivel"))
    if not m:
        return None
    base = int(m.group(1))
    fatores = [g for g in (m.group(2), m.group(3)) if g]
    usa_nivel = "nivel" in fatores
    if usa_nivel:
        return "@nivel" if base == 1 else f"{base}*@nivel"
    return str(base)


def _enhance_magia(doc):
    sysd = doc["system"]
    rng_f = _slot_formula(sysd.get("range", ""))
    area_f = _slot_formula(sysd.get("area", ""))
    toque = "toque" in (sysd.get("range", "") or "").lower()
    for a in sysd.get("actions", []):
        if rng_f and a.get("range") not in ("", "0") and "@" not in a["range"]:
            a["range"] = rng_f
        if toque and a.get("targetMode") in ("target", "none"):
            a["isMelee"] = True
            a["range"] = ""
        if area_f and a.get("targetMode") in ("area", "aura") \
                and "@" not in (a.get("area") or ""):
            a["area"] = area_f
    sysd["mode"] = "active"
    doc["_mode_locked"] = True


# ---------------------------------------------------------------------------
# 4) passive × active
#    Incondicional (vale sempre): stat, rd, crit, attr, vuln e bonus/dice em
#    alvos estruturais (arma:<tag>, conjuracao:<palavra>, secundários).
# ---------------------------------------------------------------------------
_ALVOS_ESTRUTURAIS = {"iniciativa", "esquiva", "bloqueio", "conjuracao",
                      "attack", "defense", "attackMelee", "attackRanged",
                      "defenseMelee", "defenseRanged"}
_TIPOS_INCONDICIONAIS = {"stat", "rd", "crit", "fumble", "attr", "vuln",
                         "reroll1", "reroll6", "info", "damage"}


def _efeito_incondicional(e):
    if e["type"] in _TIPOS_INCONDICIONAIS:
        return True
    # "dice" = dado de melhoria que MUDA o atributo (Melhorar Atributo):
    # é permanente, não situacional.
    if e["type"] == "dice":
        return True
    if e["type"] in ("bonus", "dice", "rollDice"):
        t = e.get("target", "")
        return (t in _ALVOS_ESTRUTURAIS or t.startswith("arma:")
                or t.startswith("conjuracao:"))
    return False


def _classify_mode(doc):
    doc.pop("_mode_locked", None)
    sysd = doc["system"]
    if "mode" not in sysd:
        return
    if sysd["mode"] is not None:      # modo declarado nos dados: respeita
        sysd["active"] = False
        return
    # Efeitos que começam desligados são interruptores individuais (ligados
    # no próprio efeito, na ficha): não pedem que o item inteiro seja ativável.
    effects = [e for e in sysd.get("effects", []) if e.get("enabled", True)]
    costs = [c for c in sysd.get("costs", []) if c.get("value") not in ("0", "")]
    if costs:
        sysd["mode"] = "active"
    elif not effects:
        sysd["mode"] = "passive"
    elif all(_efeito_incondicional(e) for e in effects):
        sysd["mode"] = "passive"
    else:
        sysd["mode"] = "active"
    sysd["active"] = False


# Itens que a heurística classificaria errado: vestir/empunhar é escolha.
_FORCE_ACTIVE = ("Armadura de ", "Cota de Malha", "Armadura de Placas",
                 "Escudo de ", "Manoplas de Segurança")


def enhance(doc):
    """Aplicada a cada documento pelo generate.py (antes dos colchetes)."""
    t = doc["type"]
    is_pericia = False
    if t == "habilidade":
        is_pericia = bool(_match_pericia(doc["name"]))
        _enhance_pericia(doc)
    if t == "magia":
        _enhance_magia(doc)
    apply_level_upgrades(doc, is_pericia)
    _formula_sweep(doc)
    _classify_mode(doc)
    if t == "equipamento" and any(doc["name"].startswith(x) for x in _FORCE_ACTIVE):
        doc["system"]["mode"] = "active"
        doc["system"]["active"] = False
    _niveis_explicitos(doc)
    # Snapshots embutidos nas definições (traços de raça/herança/carreira e
    # habilidades-chave de vocação) recebem os mesmos aprimoramentos.
    #
    # Instantâneos com sourceUuid compartilham o objeto `system` com o item do
    # compêndio (já aprimorado quando o pack dele foi gerado) — passar de novo
    # duplicaria ações. Só as chaves genéricas montadas para a vocação
    # (Pacto [Único], Juramento [Qualquer], Presa de Caça [Qualquer]) são
    # cópias e passam pelo pipeline inteiro aqui.
    sysd = doc["system"]
    for campo, tipo in (("grantedTraits", "traco"), ("keySkills", "habilidade")):
        for snap in sysd.get(campo, []):
            if snap.get("sourceUuid"):
                continue
            sub = {"type": tipo, "name": snap["name"], "system": snap["system"]}
            if tipo == "habilidade":
                pericia = bool(_match_pericia(sub["name"]))
                _enhance_pericia(sub)
                apply_level_upgrades(sub, pericia)
            _formula_sweep(sub)
            _classify_mode(sub)
            _niveis_explicitos(sub)
    return doc


def _niveis_explicitos(doc):
    """Habilidades/complicações: ações e efeitos "Sempre" passam a "Básico",
    para o seletor B/A/E da ficha mostrar o nível de cada um. (Custos ficam
    como estão: para custos, "Sempre" e "Básico" significam coisas diferentes.)"""
    if doc["type"] not in ("habilidade", "complicacao"):
        return
    s = doc["system"]
    for coll in (s.get("actions", []), s.get("effects", [])):
        for x in coll:
            if x.get("level", "all") == "all":
                x["level"] = "B"
