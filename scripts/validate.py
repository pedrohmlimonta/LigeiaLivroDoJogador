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

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from enhance_dano import escalonamento_da_magia  # noqa: E402

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
SET_TARGETS = {"forca", "agilidade", "vigor", "mente", "percepcao", "bloqueio", "esquiva",
               "conjuracao", "iniciativa", "deslocamento", "percepcao_passiva"}
ATTACK_ATTRS = {"forca", "agilidade", "vigor", "mente", "percepcao", "conjuracao",
                "bloqueio", "esquiva"}
DEFENSE_ATTRS = ATTACK_ATTRS | {""}
VARS = {"nivel", "forca", "agilidade", "vigor", "mente", "percepcao", "bloqueio",
        "esquiva", "conjuracao", "iniciativa", "deslocamento", "pv", "pvmax", "pm",
        "pmmax", "ph", "phmax", "sobrevida"}
FORMULA = re.compile(r"^[0-9@a-z\.\+\-\*\/\(\) ,_]*$")
SIZES = {"minusculo", "diminuto", "miudo", "pequeno", "medio", "grande", "enorme",
         "imenso", "colossal", "continental"}
MODULO = "ligeia-livro-do-jogador"
PLAY_ON = {"source", "target", "default", "both"}


def _chaves_jb2a():
    """Chaves do Automated Animations presentes no JB2A gratuito E no Patreon."""
    caminho = os.path.join(ROOT, "scripts", "aa-chaves.json")
    try:
        cat = json.load(open(caminho, encoding="utf-8"))
    except OSError:
        return None
    return set(cat["free"]) & set(cat["patreon"])


AMBOS = _chaves_jb2a()


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
    if tp == "set" and t not in SET_TARGETS:
        v.err(onde, f"applies set (definir valor) com alvo {t!r}")
    if ap.get("fxEnchant") and str(ap.get("fxValue", "0")) in ("0", ""):
        v.err(onde, "encantamento com valor 0 é descartado pelo sistema")


def validar_animacao(v, onde, cfg, persistente):
    """Animação automática guardada como animação puxada (Automated Animations v8)."""
    if not isinstance(cfg, dict):
        v.err(onde, f"animação deveria ser objeto (é {type(cfg).__name__})")
        return
    menu = cfg.get("menu")
    v.choice(onde, "animação.menu", menu, {"ontoken", "range", "melee"})
    if cfg.get("version") != 5:
        v.err(onde, f"animação com version {cfg.get('version')!r}: o Automated Animations ignora flags abaixo da 5")
    if cfg.get("isEnabled") is not True or cfg.get("isCustomized") is not True:
        v.err(onde, "animação precisa de isEnabled e isCustomized verdadeiros (senão o AA a ignora)")
    if (cfg.get("metaData") or {}).get("origem") != MODULO:
        v.err(onde, "animação sem metaData.origem do módulo (a Criação de Magias não a reconheceria)")
    prim = cfg.get("primary") or {}
    vid = prim.get("video") or {}
    partes = [vid.get(k) for k in ("dbSection", "menuType", "animation", "variant", "color")]
    if not all(isinstance(x, str) and x for x in partes):
        v.err(onde, f"animação com vídeo incompleto {vid!r}")
        return
    chave = ".".join(partes)
    if AMBOS is not None and chave not in AMBOS:
        v.err(onde, f"animação {chave!r} não existe nas duas versões do JB2A (gratuito e Patreon)")
    esperado = {"range": "range", "melee": "melee"}.get(partes[0], "ontoken")
    if menu != esperado:
        v.err(onde, f"animação {chave!r} com menu {menu!r} (esperado {esperado!r})")
    if menu == "melee":
        # A troca por projétil precisa ser explícita: o padrão do AA ("on")
        # procuraria um arremesso que pode não existir no JB2A gratuito.
        troca = cfg.get("meleeSwitch") or {}
        tipo = (troca.get("options") or {}).get("switchType")
        v.choice(onde, "animação.meleeSwitch.switchType", tipo, {"off", "custom"})
        if tipo == "custom":
            tv = troca.get("video") or {}
            tchave = ".".join(str(tv.get(k, "")) for k in ("dbSection", "menuType", "animation", "variant", "color"))
            if AMBOS is not None and tchave not in AMBOS:
                v.err(onde, f"arremesso {tchave!r} não existe nas duas versões do JB2A")
    if vid.get("enableCustom"):
        v.err(onde, "animação automática não deve usar caminho personalizado")
    op = prim.get("options") or {}
    if menu == "ontoken":
        v.choice(onde, "animação.playOn", op.get("playOn"), PLAY_ON)
        if not (isinstance(op.get("size"), (int, float)) and op.get("size") > 0):
            v.err(onde, f"animação com tamanho {op.get('size')!r}")
    if persistente and not (menu == "ontoken" and op.get("persistent") is True):
        v.err(onde, "visual de efeito precisa ser no token e persistente (dura enquanto o efeito durar)")


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
    if a.get("aaConfig"):
        validar_animacao(v, f"{onde} › animação", a["aaConfig"], False)
        if a.get("aaEnabled") is not True or not a.get("aaName"):
            v.err(onde, "ação com animação automática precisa de aaEnabled e aaName")
    for i, ap in enumerate(a.get("appliesEffects", [])):
        validar_aplicavel(v, f"{onde} › aplica[{i}] {ap.get('label', '')[:30]}", ap)
        if ap.get("fxAaConfig"):
            validar_animacao(v, f"{onde} › aplica[{i}] › visual", ap["fxAaConfig"], True)
            if not ap.get("fxAaName") or ap.get("fxAaPersist") is not True:
                v.err(onde, f"aplica[{i}] com visual automático precisa de fxAaName e fxAaPersist")
        # Sem rolagem, a "CD = resultado da conjuração/ataque" vira 0 e a
        # condição cai no primeiro teste: use CD fixa ou "refazer a cada rodada".
        if (ap.get("resist") and ap.get("resistVsCast") and not ap.get("resistReroll")
                and not a.get("canRoll")):
            v.err(onde, f"aplica {ap.get('label', '')[:30]!r} com resistência contra a rolagem, "
                        "mas a ação não rola: a CD seria 0")


TIPOS_DANO_ROTULO = ("Corte", "Perfuração", "Concussão", "Ácido", "Fogo", "Frio", "Raio", "Veneno",
                     "Energia", "Necrótico", "Radiante", "Sônico", "Psíquico")
_ROTULO_ESCALONADO = re.compile(r"(?:=|\()\s*(?:%s)\s\+(?:\d+|Nível)" % "|".join(TIPOS_DANO_ROTULO))


def validar_escalonamento(v, onde, tipo, s):
    """Dano escalonado ("+N" no livro) — ver enhance_dano.py."""
    escala_magia = escalonamento_da_magia(s.get("description", "")) if tipo == "magia" else None
    for i, a in enumerate(s.get("actions", [])):
        if str(a.get("damage", "")).strip() == "" or a.get("damageResource", "hp") != "hp":
            continue
        lugar = f"{onde} › ação[{i}] {a.get('label', '')[:34]}"
        esc = bool(a.get("scalingDamage"))
        if a.get("damageType") == "final":
            if esc:
                v.err(lugar, "dano final não escala")
            continue
        if tipo == "equipamento" and (a.get("isWeapon") or a.get("label", "").startswith("Ataque —")) and not esc:
            v.err(lugar, "ataque de arma sem dano escalonado (o livro dá \"Dano Base: Tipo +N\")")
        if escala_magia is not None and esc != escala_magia:
            v.err(lugar, f"dano {'escalonado' if escala_magia else 'fixo'} na descrição, "
                         f"{'escalonado' if esc else 'fixo'} na ação")
        if _ROTULO_ESCALONADO.search(a.get("label", "")) and not esc:
            v.err(lugar, "o rótulo diz \"Tipo +N\" mas o dano não está escalonado")


def validar_sistema(v, onde, tipo, s):
    validar_escalonamento(v, onde, tipo, s)
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
            # A animação fica nas ações: uma animação no ITEM tocaria como
            # reserva e voltaria depois de removida da ação.
            if (d.get("flags") or {}).get("autoanimations"):
                v.err(f"{pack}/{d['name']}", "flags.autoanimations no item (use a animação da ação)")
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
