# -*- coding: utf-8 -*-
"""Helpers para construir documentos Item do sistema ligeia-rpg."""
import hashlib
import re
import unicodedata

VALID_ID = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"


def make_id(*parts):
    """ID determinístico de 16 chars a partir do nome (estável entre builds)."""
    h = hashlib.sha1(("|".join(parts)).encode("utf-8")).hexdigest()
    out = []
    i = 0
    while len(out) < 16:
        out.append(VALID_ID[int(h[i % len(h)], 16) % len(VALID_ID)])
        i += 1
        h = h + hashlib.sha1((h + str(i)).encode()).hexdigest()
    return "".join(out)[:16]


def slugify(name):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "-", s).strip("-").lower()
    return s


def p(text):
    """Envelopa parágrafos simples em <p>."""
    text = text.strip()
    if not text:
        return ""
    parts = [t.strip() for t in text.split("\n\n") if t.strip()]
    return "".join(f"<p>{t}</p>" for t in parts)


def effect(etype, target, value, level="all", label="", damage_type="", enabled=True, reroll_all=False):
    return {
        "type": etype,
        "target": target,
        "value": value,
        "rerollAll": reroll_all,
        "label": label,
        "enabled": enabled,
        "level": level,
        "damageType": damage_type,
    }


def cost(resource, value, label=""):
    return {"resource": resource, "value": value, "label": label}


def applies(label, fx_type="condition", fx_target="", fx_value=0, duration_mode="scene",
            duration_rounds=1, resist=False, resist_attr="vigor", resist_vs_cast=True,
            resist_dc=0, resist_reroll=False, tick_amount=0, tick_type="", tick_resource="hp",
            fx_all=False):
    return {
        "label": label,
        "fxType": fx_type,
        "fxTarget": fx_target,
        "fxValue": fx_value,
        "fxAll": fx_all,
        "durationMode": duration_mode,
        "durationRounds": duration_rounds,
        "resist": resist,
        "resistAttr": resist_attr,
        "resistVsCast": resist_vs_cast,
        "resistDc": resist_dc,
        "resistReroll": resist_reroll,
        "tickAmount": tick_amount,
        "tickType": tick_type,
        "tickResource": tick_resource,
    }


def action(label="Ação", can_roll=True, roll_attr="forca", roll_bonus=0, roll_dice=0,
           vs_difficulty=False, fixed_difficulty=8, difficulty_attr="nenhum",
           target_mode="target", include_self=False, defense_attr="esquiva", defense_attr2="",
           damage="", damage_type="", damage_resource="hp", scaling_damage=False,
           applies_effects=None, movement=None, rng=0, area=0,
           cost_mp=0, cost_hp=0, cost_heroic=0, extra_damage=None,
           persist_area=False, persist_rounds=1, persist_affects_self=False,
           persist_reroll_attack=False, persist_trigger="both", skip_roll_dialog=True):
    mv = {
        "enabled": False, "kind": "push", "who": "targets", "distance": 0,
        "lateralSide": "right", "ignoreWalls": False, "snap": True,
    }
    if movement:
        mv.update(movement)
        mv["enabled"] = True
    return {
        "label": label,
        "canRoll": can_roll,
        "rollAttr": roll_attr,
        "rollBonus": roll_bonus,
        "rollDice": roll_dice,
        "vsDifficulty": vs_difficulty,
        "fixedDifficulty": fixed_difficulty,
        "difficultyAttr": difficulty_attr,
        "targetMode": target_mode,
        "includeSelf": include_self,
        "defenseAttr": defense_attr,
        "defenseAttr2": defense_attr2,
        "damage": damage,
        "damageType": damage_type,
        "damageResource": damage_resource,
        "scalingDamage": scaling_damage,
        "skipRollDialog": skip_roll_dialog,
        "extraDamage": extra_damage or [],
        "movement": mv,
        "appliesEffects": applies_effects or [],
        "range": rng,
        "area": area,
        "macroUuid": "", "macroName": "", "macroEnabled": True,
        "aaConfig": None, "aaName": "", "aaEnabled": True,
        "animFile": "", "animPlacement": "target", "animScale": 1, "animEnabled": True,
        "animAttach": False,
        "costMp": cost_mp, "costHp": cost_hp, "costHeroic": cost_heroic,
        "persistArea": persist_area, "persistRounds": persist_rounds,
        "persistAffectsSelf": persist_affects_self,
        "persistRerollAttack": persist_reroll_attack, "persistTrigger": persist_trigger,
    }


def base_doc(name, itype, img, system, sort=0):
    _id = make_id(itype, name)
    return {
        "_id": _id,
        "_key": f"!items!{_id}",
        "name": name,
        "type": itype,
        "img": img,
        "system": system,
        "effects": [],
        "folder": None,
        "sort": sort,
        "flags": {},
        "ownership": {"default": 0},
        "_stats": {"coreVersion": "13", "systemId": "ligeia-rpg"},
    }


def habilidade(name, lists, desc_b, desc_a, cost_b, cost_a, prereq="", activation="",
               target="", area="", rng="", duration="", desc_e="", cost_e=0,
               mode="passive", effects=None, costs=None, actions=None,
               img="icons/svg/book.svg", sort=0):
    system = {
        "level": "B",
        "costBasic": cost_b,
        "costAdvanced": cost_a,
        "costSpecial": cost_e,
        "prereq": prereq,
        "lists": lists,
        "activation": activation,
        "target": target,
        "area": area,
        "range": rng,
        "duration": duration,
        "descBasic": p(desc_b),
        "descAdvanced": p(desc_a),
        "descSpecial": p(desc_e),
        "actions": actions or [],
        "mode": mode,
        "active": False,
        "effects": effects or [],
        "costs": costs or [],
    }
    return base_doc(name, "habilidade", img, system, sort)


def magia(name, word_id, tier, casting, target, area, rng, duration, description,
          peculiarities="", metamagics=None, mode="active", effects=None, costs=None,
          actions=None, img="icons/svg/daze.svg", sort=0):
    system = {
        "wordId": word_id,
        "tier": tier,
        "casting": casting,
        "target": target,
        "area": area,
        "range": rng,
        "duration": duration,
        "description": p(description),
        "peculiarities": p(peculiarities),
        "metamagics": metamagics or [],
        "actions": actions or [],
        "mode": mode,
        "active": False,
        "effects": effects or [],
        "costs": costs or [],
    }
    return base_doc(name, "magia", img, system, sort)


def equipamento(name, category, price, weight, description, notes="", qty=1,
                mode="passive", effects=None, costs=None, actions=None,
                img="icons/svg/item-bag.svg", sort=0):
    system = {
        "category": category,
        "qty": qty,
        "weight": weight,
        "price": price,
        "notes": notes,
        "description": p(description),
        "actions": actions or [],
        "mode": mode,
        "active": False,
        "effects": effects or [],
        "costs": costs or [],
    }
    return base_doc(name, "equipamento", img, system, sort)


def traco(name, source, description, is_weapon=False, mode="passive",
          effects=None, costs=None, actions=None, img="icons/svg/aura.svg", sort=0):
    system = {
        "source": source,
        "description": p(description),
        "isWeapon": is_weapon,
        "actions": actions or [],
        "mode": mode,
        "active": False,
        "effects": effects or [],
        "costs": costs or [],
    }
    return base_doc(name, "traco", img, system, sort)


def trait_snapshot(trait_doc):
    """Snapshot de um traço para o campo grantedTraits das definições."""
    return {
        "name": trait_doc["name"],
        "img": trait_doc["img"],
        "system": trait_doc["system"],
        "sourceUuid": f"Compendium.ligeia-livro-do-jogador.tracos.Item.{trait_doc['_id']}",
    }


def definicao(name, itype, description, skill_list=None, granted=None,
              img="icons/svg/mystery-man.svg", sort=0, **extra):
    """Item de definição: raca, heranca, vocacao ou carreira.

    granted: lista de documentos de traço (dicts) a embutir como snapshots.
    extra: moveBonus (raca) ou hpBonus/mpBonus (vocacao).
    """
    system = {
        "description": p(description),
        "skillList": skill_list or [],
        "grantedTraits": [trait_snapshot(t) for t in (granted or [])],
    }
    system.update(extra)
    return base_doc(name, itype, img, system, sort)
