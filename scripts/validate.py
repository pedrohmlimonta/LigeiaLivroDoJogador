# -*- coding: utf-8 -*-
"""Validação dos documentos gerados contra o schema do sistema ligeia-rpg
(build 23): choices de todos os campos enumerados, tipos string/número/bool,
fórmulas e @variáveis, condições e alvos de efeito.

Rodado pelo generate.py ao final; também pode rodar sozinho:
    python3 scripts/validate.py
Sai com código 1 se houver erro.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

EFFECT_TYPES = {"dice", "rollDice", "bonus", "attr", "stat", "set", "damage", "rd",
                "vuln", "reroll1", "reroll6", "crit", "fumble", "tempHp",
                "areaFilter", "condition", "size", "restore", "info"}
APPLIES_TYPES = {"bonus", "dice", "rollDice", "attr", "stat", "set", "damage", "rd",
                 "vuln", "reroll1", "reroll6", "crit", "fumble", "restore",
                 "condition", "size"}
LEVELS = {"all", "B", "A", "E"}
COST_LEVELS = LEVELS | {"A+", "E+"}
COST_RES = {"mp", "hp", "hpTemp", "heroic"}
RES3 = {"hp", "mp", "heroic"}
TARGET_MODES = {"none", "self", "target", "area", "aura", "line", "cone", "lineCustom"}
AREA_FILTERS = {"all", "allies", "enemies"}
MOVE_KINDS = {"teleport", "push", "pull", "lateral", "place"}
CONDS = {"abalado", "agarrado", "atordoado", "caido", "cego", "cobertura_parcial",
         "cobertura_completa", "dano_continuo", "dominado", "enfeiticado",
         "enfraquecido", "exausto", "imobilizado", "inconsciente", "indefeso",
         "intangivel", "invisivel", "lento", "oculto", "paralisado", "pasmo",
         "surdo", "surpreso", "telecinese", "vendo_invisivel", "vendo_oculto"}
DMG = {"acido", "concussao", "corte", "energia", "fogo", "frio", "necrotico",
       "perfuracao", "psiquico", "radiante", "raio", "sonico", "veneno"}
ROLL_TARGETS = {"all", "forca", "agilidade", "vigor", "mente", "percepcao",
                "conjuracao", "esquiva", "bloqueio", "iniciativa", "attack",
                "defense", "attackMelee", "attackRanged", "defenseMelee",
                "defenseRanged"}
STAT_TARGETS = {"hp", "mp", "heroic", "deslocamento"}
ATTACK_ATTRS = {"forca", "agilidade", "vigor", "mente", "percepcao", "conjuracao",
                "bloqueio", "esquiva"}
DEFENSE_ATTRS = ATTACK_ATTRS | {""}
VARS = {"nivel", "forca", "agilidade", "vigor", "mente", "percepcao", "bloqueio",
        "esquiva", "conjuracao", "iniciativa", "deslocamento", "pv", "pvmax", "pm",
        "pmmax", "ph", "phmax", "sobrevida"}
FORMULA = re.compile(r"^[0-9@a-z\.\+\-\*\/\(\) ,_]*$")
SIZES = {"minusculo", "diminuto", "miudo", "pequeno", "medio", "grande", "enorme",
         "imenso", "colossal", "continental"}


class V:
    def __init__(self):
        self.erros = []

    def err(self, onde, msg):
        self.erros.append(f"{onde}: {msg}")

    def choice(self, onde, campo, valor, opcoes):
        if valor not in opcoes:
            self.err(onde, f"{campo}={valor!r} fora das opções {sorted(opcoes)}")

    def string(self, onde, campo, valor):
        if not isinstance(valor, str):
            self.err(onde, f"{campo} deveria ser string (é {type(valor).__name__}: {valor!r})")

    def formula(self, onde, campo, valor):
        self.string(onde, campo, valor)
        if not isinstance(valor, str):
            return
        if valor and not FORMULA.match(valor):
            self.err(onde, f"{campo} com fórmula inválida {valor!r}")
        for var in re.findall(r"@(\w+)", valor):
            if var not in VARS:
                self.err(onde, f"{campo} usa @{var} (inexistente)")


def _alvo_rolagem(t):
    return t in ROLL_TARGETS or t.startswith("arma:") or t == "arma" or t.startswith("conjuracao:")


def validar_efeito(v, onde, e, leveled):
    v.choice(onde, "effect.type", e.get("type"), EFFECT_TYPES)
    v.choice(onde, "effect.level", e.get("level", "all"), LEVELS)
    v.formula(onde, "effect.value", e.get("value"))
    t, tp = e.get("target", "all"), e.get("type")
    if tp in ("bonus", "dice", "rollDice", "attr", "reroll1", "reroll6", "crit", "fumble"):
        if not _alvo_rolagem(t):
            v.err(onde, f"efeito {tp} com alvo de rolagem inválido {t!r}")
    elif tp == "stat" and t not in STAT_TARGETS:
        v.err(onde, f"efeito stat com alvo {t!r}")
    elif tp in ("rd", "vuln"):
        dt = e.get("damageType", "")
        if dt not in DMG | {"", "all"}:
            v.err(onde, f"efeito {tp} com damageType {dt!r}")
        if t not in ("all", ""):
            v.err(onde, f"efeito {tp}: o tipo de dano vai em damageType, não em target ({t!r})")
    elif tp == "damage":
        if not (t == "arma" or t.startswith("arma:")):
            v.err(onde, f"efeito damage com alvo {t!r}: o sistema só soma dano de efeitos por tipagem de arma ('arma' ou 'arma:<tag>')")
    elif tp == "condition" and t not in CONDS:
        v.err(onde, f"efeito condition com condição {t!r}")


def validar_custo(v, onde, c):
    v.choice(onde, "cost.resource", c.get("resource"), COST_RES)
    v.choice(onde, "cost.level", c.get("level", "all"), COST_LEVELS)
    v.formula(onde, "cost.value", c.get("value"))


def validar_aplicavel(v, onde, ap):
    v.choice(onde, "applies.fxType", ap.get("fxType"), APPLIES_TYPES)
    v.choice(onde, "applies.durationMode", ap.get("durationMode"), {"rounds", "scene"})
    v.choice(onde, "applies.tickResource", ap.get("tickResource", "hp"), RES3)
    v.choice(onde, "applies.tickHealResource", ap.get("tickHealResource", "hp"), RES3)
    for f in ("fxValue", "durationRounds", "resistDc", "tickAmount", "tickHealAmount", "grantTempHp"):
        v.formula(onde, f"applies.{f}", ap.get(f, "0"))
    tp, t = ap.get("fxType"), ap.get("fxTarget", "")
    if tp == "condition" and t not in CONDS:
        v.err(onde, f"applies condition com condição {t!r}")
    if tp in ("rd", "vuln") and t not in DMG | {"all", ""}:
        v.err(onde, f"applies {tp} com tipo {t!r}")
    if tp == "damage" and not (t == "arma" or t.startswith("arma:")):
        v.err(onde, f"applies damage com alvo {t!r} (use 'arma' ou 'arma:<tag>')")
    if tp == "restore" and (str(ap.get("tickHealAmount", "0")) not in ("0", "")):
        v.err(onde, "applies restore é instantâneo e não gera efeito duradouro: a regeneração (tickHeal) nunca roda")
    if tp in ("bonus", "dice", "rollDice", "attr", "reroll1", "reroll6", "crit", "fumble") and not _alvo_rolagem(t):
        v.err(onde, f"applies {tp} com alvo {t!r}")
    if tp == "stat" and t not in STAT_TARGETS:
        v.err(onde, f"applies stat com alvo {t!r}")
    if ap.get("fxEnchant") and str(ap.get("fxValue", "0")) in ("0", ""):
        v.err(onde, "encantamento com valor 0 é descartado pelo sistema")


def validar_acao(v, onde, a):
    v.choice(onde, "action.level", a.get("level", "all"), LEVELS)
    v.choice(onde, "action.targetMode", a.get("targetMode"), TARGET_MODES)
    v.choice(onde, "action.areaFilter", a.get("areaFilter", "all"), AREA_FILTERS)
    v.choice(onde, "action.damageResource", a.get("damageResource", "hp"), RES3)
    v.choice(onde, "action.healResource", a.get("healResource", "hp"), RES3 | {"hpTemp"})
    v.choice(onde, "action.persistTrigger", a.get("persistTrigger", "both"), {"turn", "enter", "both"})
    v.choice(onde, "action.animPlacement", a.get("animPlacement", "target"), {"cast", "target", "ranged"})
    if a.get("canRoll"):
        v.choice(onde, "action.rollAttr", a.get("rollAttr"), ATTACK_ATTRS)
    v.choice(onde, "action.defenseAttr", a.get("defenseAttr", "esquiva"), DEFENSE_ATTRS)
    v.choice(onde, "action.defenseAttr2", a.get("defenseAttr2", ""), DEFENSE_ATTRS)
    dt = a.get("damageType", "")
    if dt not in DMG | {"", "final"}:
        v.err(onde, f"action.damageType {dt!r}")
    for f in ("rollBonus", "rollDice", "fixedDifficulty", "damage", "heal", "range", "area",
              "costMp", "costHp", "costHeroic", "persistRounds", "lineWidth", "coneAngle"):
        v.formula(onde, f"action.{f}", a.get(f, ""))
    mv = a.get("movement", {})
    v.choice(onde, "movement.kind", mv.get("kind", "push"), MOVE_KINDS)
    v.choice(onde, "movement.who", mv.get("who", "targets"), {"self", "targets"})
    v.choice(onde, "movement.lateralSide", mv.get("lateralSide", "right"), {"left", "right"})
    v.formula(onde, "movement.distance", mv.get("distance", "0"))
    for ex in a.get("extraDamage", []):
        v.choice(onde, "extraDamage.resource", ex.get("resource", "hp"), RES3)
        v.formula(onde, "extraDamage.formula", ex.get("formula", ""))
    for i, ap in enumerate(a.get("appliesEffects", [])):
        validar_aplicavel(v, f"{onde} › aplica[{i}] {ap.get('label', '')[:30]}", ap)
        # Sem rolagem, a "CD = resultado da conjuração/ataque" vira 0 e a
        # condição cai no primeiro teste: use CD fixa ou "refazer a cada rodada".
        if (ap.get("resist") and ap.get("resistVsCast") and not ap.get("resistReroll")
                and not a.get("canRoll")):
            v.err(onde, f"aplica {ap.get('label', '')[:30]!r} com resistência contra a rolagem, "
                        "mas a ação não rola: a CD seria 0")


def validar_sistema(v, onde, tipo, s):
    leveled = tipo in ("habilidade", "complicacao")
    if tipo in ("habilidade", "complicacao"):
        v.choice(onde, "level", s.get("level"), {"B", "A", "E"})
    campos_xp = {"habilidade": ("costBasic", "costAdvanced", "costSpecial"),
                 "complicacao": ("xpBasic", "xpAdvanced", "xpSpecial")}.get(tipo, ())
    for c in campos_xp:
        v.formula(onde, c, s.get(c))
    if tipo == "magia":
        v.choice(onde, "tier", s.get("tier"), {"Menor", "Intermediária", "Maior"})
    if "mode" in s:
        v.choice(onde, "mode", s.get("mode"), {"passive", "active"})
        if not isinstance(s.get("active"), bool):
            v.err(onde, "active deveria ser bool")
    for e in s.get("effects", []):
        validar_efeito(v, f"{onde} › efeito {e.get('label', '')[:30]}", e, leveled)
    for c in s.get("costs", []):
        validar_custo(v, f"{onde} › custo", c)
    for i, a in enumerate(s.get("actions", [])):
        validar_acao(v, f"{onde} › ação[{i}] {a.get('label', '')[:34]}", a)
    if tipo == "equipamento":
        if not isinstance(s.get("qty"), int):
            v.err(onde, "qty deveria ser inteiro")
        if not isinstance(s.get("tags"), list):
            v.err(onde, "tags deveria ser lista")
    if tipo == "raca":
        v.choice(onde, "size", s.get("size"), SIZES)
        v.formula(onde, "moveBonus", s.get("moveBonus"))
    if tipo == "vocacao":
        v.formula(onde, "hpBonus", s.get("hpBonus"))
        v.formula(onde, "mpBonus", s.get("mpBonus"))
    for snap in s.get("grantedTraits", []):
        validar_sistema(v, f"{onde} ⟶ traço {snap['name']}", "traco", snap["system"])
    for snap in s.get("keySkills", []):
        validar_sistema(v, f"{onde} ⟶ chave {snap['name']}", "habilidade", snap["system"])


def main(root=ROOT):
    v = V()
    total = 0
    src = os.path.join(root, "packs-source")
    por_uuid = {}
    docs = []
    for pack in sorted(os.listdir(src)):
        for fn in sorted(os.listdir(os.path.join(src, pack))):
            d = json.load(open(os.path.join(src, pack, fn), encoding="utf-8"))
            total += 1
            docs.append((pack, d))
            por_uuid[f"Compendium.ligeia-livro-do-jogador.{pack}.Item.{d['_id']}"] = d
            validar_sistema(v, f"{pack}/{d['name']}", d["type"], d["system"])
    # Instantâneos (traços concedidos e habilidades-chave) que apontam para um
    # item do compêndio têm de ser idênticos a ele: é o que a ficha recria.
    for pack, d in docs:
        for campo in ("grantedTraits", "keySkills"):
            for snap in d["system"].get(campo, []):
                uuid = snap.get("sourceUuid")
                if not uuid:
                    continue
                alvo = por_uuid.get(uuid)
                if alvo is None:
                    v.err(f"{pack}/{d['name']}", f"{campo} {snap['name']!r} aponta para {uuid} inexistente")
                elif alvo["name"] != snap["name"] or json.dumps(alvo["system"], sort_keys=True) != json.dumps(snap["system"], sort_keys=True):
                    v.err(f"{pack}/{d['name']}", f"{campo} {snap['name']!r} difere do item do compêndio")
    if v.erros:
        print(f"VALIDAÇÃO: {len(v.erros)} erro(s) em {total} documentos")
        for e in v.erros[:60]:
            print("  !", e)
        if len(v.erros) > 60:
            print(f"  ... +{len(v.erros) - 60}")
        return 1
    print(f"Validação OK: {total} documentos conferidos contra o schema do sistema.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
