# -*- coding: utf-8 -*-
"""Construtores de documentos de Item no schema do sistema ligeia-rpg 0.2.x
(versão 22: fórmulas @variáveis, ações por nível, cura, tipagens de arma,
encantamentos, tamanhos, filtros de área).

Valores numéricos que o schema guarda como string (fórmulas) aceitam int ou
str aqui e são normalizados por _s(). Fórmulas úteis: "@nivel",
"ceil(@nivel/2)", "floor(@nivel/2)", "2*@vigor", "5+@mente".
"""
import hashlib
import re
import unicodedata

VERSION = "0.2.0"


def _s(v, default="0"):
    """Normaliza número/None para o formato string do schema."""
    if v is None:
        return default
    if isinstance(v, bool):
        return "1" if v else "0"
    return str(v)


def make_id(*parts):
    h = hashlib.sha1("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()
    # 16 chars válidos para Foundry (a-p a partir do hex)
    return "".join("abcdefghijklmnop"[int(c, 16)] for c in h[:16])


def slugify(text):
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    t = re.sub(r"[^A-Za-z0-9]+", "-", t).strip("-").lower()
    return t or "item"


def p(text):
    """Texto simples -> HTML em parágrafos."""
    if not text:
        return ""
    parts = [x.strip() for x in text.split("\n\n") if x.strip()]
    return "".join(f"<p>{x.replace(chr(10), '<br>')}</p>" for x in parts)


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
        "ownership": {"default": 0},
        "flags": {},
        "_stats": {"coreVersion": "13"},
    }


# ---------------------------------------------------------------------------
#  Efeitos, custos, ações
# ---------------------------------------------------------------------------

def effect(etype, target, value, level="all", label="", damage_type="",
           enabled=True, reroll_all=False, vuln_percent=False, enchant=False):
    """Efeito mecânico de item.

    Tipos: dice, rollDice, bonus, attr, stat, set, damage, rd, vuln,
    reroll1, reroll6, crit, fumble, tempHp, areaFilter, condition, size,
    restore, info.
    Alvos de rolagem incluem "arma:<tag>" e "conjuracao:<palavra>".
    value aceita fórmula: "ceil(@nivel/2)".
    """
    return {
        "type": etype,
        "target": target,
        "value": _s(value),
        "rerollAll": reroll_all,
        "vulnPercent": vuln_percent,
        "label": label,
        "enabled": enabled,
        "enchant": enchant,
        "level": level,
        "damageType": damage_type,
    }


def cost(resource, value, label="", level="all"):
    """Custo de ativação (mp, hp, hpTemp, heroic); level B/A/E restringe."""
    return {"resource": resource, "value": _s(value), "label": label, "level": level}


def applies(label, fx_type="condition", fx_target="", fx_value=0, fx_all=False,
            duration_mode="scene", duration_rounds=1, resist=False,
            resist_attr="vigor", resist_vs_cast=True, resist_dc=0,
            resist_reroll=False, tick_amount=0, tick_type="",
            tick_resource="hp", tick_heal_amount=0, tick_heal_resource="hp",
            fx_enchant=False, grant_temp_hp=0, fx_sustain="none"):
    """Efeito aplicado ao alvo quando a ação acerta (vira efeito ativo com
    duração). fx_value aceita fórmula com @variáveis do CONJURADOR."""
    return {
        "label": label,
        "fxType": fx_type,
        "fxTarget": fx_target,
        "fxValue": _s(fx_value),
        "fxAll": fx_all,
        "durationMode": duration_mode,
        "durationRounds": _s(duration_rounds, "1"),
        "resist": resist,
        "resistAttr": resist_attr,
        "resistVsCast": resist_vs_cast,
        "resistDc": _s(resist_dc),
        "resistReroll": resist_reroll,
        "tickAmount": _s(tick_amount),
        "tickType": tick_type,
        "tickResource": tick_resource,
        "tickHealAmount": _s(tick_heal_amount),
        "tickHealResource": tick_heal_resource,
        "fxFile": "",
        "fxScale": "1",
        "fxAaConfig": None,
        "fxAaName": "",
        "fxAaPersist": True,
        "fxEnchant": fx_enchant,
        "grantTempHp": _s(grant_temp_hp),
        # Sistema build 31: ação que quem conjurou paga a cada turno para o
        # efeito continuar no alvo ("none" = não precisa sustentar).
        "fxSustain": fx_sustain,
    }


def extra_damage(formula, dtype="", resource="hp", scaling=False):
    return {"formula": _s(formula, ""), "type": dtype, "resource": resource,
            "scaling": scaling}


def action(label, level="all", can_roll=True, roll_attr="forca", roll_bonus=0,
           roll_dice=0, vs_difficulty=False, fixed_difficulty=8,
           difficulty_attr="nenhum", target_mode="target", include_self=False,
           area_filter="all", defense_attr="esquiva", defense_attr2="",
           damage="", damage_type="", damage_resource="hp",
           scaling_damage=False, heal="", heal_resource="hp",
           scaling_heal=False, temp_stack=False, extra=None, movement=None,
           applies_effects=None, line_width="1.5", cone_angle="45",
           rng=0, area=0, cost_mp=0, cost_hp=0, cost_heroic=0,
           is_weapon=False, is_melee=False, persist_area=False,
           persist_rounds=1, persist_affects_self=False,
           persist_reroll_attack=False, persist_trigger="both",
           pre_activations=None, skip_roll_dialog=True, drain=None,
           removes_effects=None, chain_actions=None, variable_cost=None,
           summons=None, action_cost=None, persist_sustain="none",
           summon_count=1):
    """Uma ação de item (schema do sistema, build 30).

    - level: "all"/"B"/"A"/"E" — nível em que a ação existe (habilidades).
    - roll_bonus/roll_dice/rng/area/custos/damage/heal aceitam fórmulas
      com @variáveis ("@nivel", "ceil(@nivel/2)", "2*@vigor").
    - movement: dict com kind/who/distance/... (enabled é ligado aqui).
    - drain: dict com resource/from/ratio — parte do dano causado volta como
      recurso para quem conjurou (enabled é ligado aqui).
    - removes_effects / chain_actions: listas no formato do sistema.
    - variable_cost: dict com min/max/label/resource e as fórmulas de bônus
      (damageBonus, healBonus, areaBonus, rangeBonus, rollBonus) — o custo
      escolhido na ativação; @gasto vale nelas (enabled é ligado aqui).
    - summons: CARDÁPIO de criaturas (veja summon()): a ação conjura UMA delas,
      escolhida na hora, na quantidade summon_count (as que seguem o geral).
    - action_cost: ação da rodada que a ação gasta (sistema build 31:
      standard/movement/simple/reaction/free/none). Sem ele, o
      enhance_acoes.py decide pelo livro (ativação, texto, tipo da ação).
    - persist_sustain: ação por turno para a emanação continuar de pé.
    """
    dr = {"enabled": False, "resource": "mp", "from": "both", "ratio": "1"}
    if drain:
        dr.update(drain)
        dr["enabled"] = True
        dr["ratio"] = _s(dr.get("ratio", 1), "1")
    vc = variable_cost_field(variable_cost)
    mv = {"enabled": False, "kind": "push", "who": "targets", "distance": "0",
          "lateralSide": "right", "ignoreWalls": False, "snap": True}
    if movement:
        mv.update(movement)
        mv["enabled"] = True
        mv["distance"] = _s(mv.get("distance", 0))
        if mv["kind"] == "teleport":
            mv["ignoreWalls"] = True
    return {
        "label": label,
        "level": level,
        "canRoll": can_roll,
        "rollAttr": roll_attr,
        "rollBonus": _s(roll_bonus),
        "rollDice": _s(roll_dice),
        "vsDifficulty": vs_difficulty,
        "fixedDifficulty": _s(fixed_difficulty, "8"),
        "difficultyAttr": difficulty_attr,
        "targetMode": target_mode,
        "includeSelf": include_self,
        "areaFilter": area_filter,
        "defenseAttr": defense_attr,
        "defenseAttr2": defense_attr2,
        "damage": _s(damage, ""),
        "damageType": damage_type,
        "damageResource": damage_resource,
        "scalingDamage": scaling_damage,
        "heal": _s(heal, ""),
        "healResource": heal_resource,
        "scalingHeal": scaling_heal,
        "tempStack": temp_stack,
        "skipRollDialog": skip_roll_dialog,
        "extraDamage": extra or [],
        "movement": mv,
        "preActivations": pre_activations or [],
        "drain": dr,
        "removesEffects": removes_effects or [],
        "chainActions": chain_actions or [],
        "showInSheet": False,
        "appliesEffects": applies_effects or [],
        "lineWidth": _s(line_width, "1.5"),
        "coneAngle": _s(cone_angle, "45"),
        "isWeapon": is_weapon,
        "isMelee": is_melee,
        "range": _s(rng, ""),
        "area": _s(area, ""),
        "macroUuid": "", "macroName": "", "macroEnabled": True,
        "aaConfig": None, "aaName": "", "aaEnabled": True,
        "animFile": "", "animPlacement": "target", "animScale": "1",
        "animEnabled": True, "animAttach": False,
        "costMp": _s(cost_mp),
        "costHp": _s(cost_hp),
        "costHeroic": _s(cost_heroic),
        "persistArea": persist_area,
        "persistRounds": _s(persist_rounds, "1"),
        "persistAffectsSelf": persist_affects_self,
        "persistRerollAttack": persist_reroll_attack,
        "persistTrigger": persist_trigger,
        "variableCost": vc,
        "summons": [dict(x) for x in (summons or [])],
        "summonCount": _s(summon_count, "1"),
        "persistSustain": persist_sustain,
        **({"actionCost": action_cost} if action_cost else {}),
    }


VARIABLE_COST_PADRAO = {
    "enabled": False, "resource": "mp", "min": "1", "max": "", "label": "",
    "damageBonus": "", "healBonus": "", "areaBonus": "", "rangeBonus": "", "rollBonus": "",
}


def variable_cost_field(cfg=None):
    """Campo variableCost (sistema build 30): o custo escolhido na ativação.

    Sem cfg, desligado. Com cfg, ligado; números viram texto (o schema guarda
    fórmulas).
    """
    vc = dict(VARIABLE_COST_PADRAO)
    if cfg:
        vc.update(cfg)
        vc["enabled"] = cfg.get("enabled", True)
        for k in ("min", "max", "damageBonus", "healBonus", "areaBonus", "rangeBonus", "rollBonus"):
            vc[k] = _s(vc[k], "")
    return vc


def summon(actor_name="", actor_uuid="", count=1, disposition="same", rounds=0,
           give_control=True, hidden=False, enabled=True, use_global_count=True,
           own_sheet=True, sustain="none"):
    """Uma criatura que a ação invoca (sistema build 30).

    Sem actor_uuid é um MARCADOR: diz qual criatura cabe ali; a ficha
    arrastada para a ação ocupa o primeiro marcador (gancho do módulo) e leva
    a quantidade, a atitude e a duração dele. Até lá, não invoca nada.
    """
    return {
        "actorUuid": actor_uuid, "actorName": actor_name, "count": _s(count, "1"),
        # Build 31: segue o número geral da ação (summonCount), ganha ficha
        # própria ao aparecer e pode pedir uma ação por rodada para ficar.
        "useGlobalCount": use_global_count, "ownSheet": own_sheet, "sustain": sustain,
        "disposition": disposition, "rounds": _s(rounds, "0"),
        "giveControl": give_control, "hidden": hidden, "enabled": enabled,
    }


def _activatable(mode, effects, costs):
    """Campos comuns dos itens ativáveis (inclui os novos da v22).

    mode=None = automático: o enhance.py decide passive/active pelos efeitos
    e custos. Um modo escrito nos dados é respeitado como está.
    """
    return {
        "enchantments": [],
        "costsCumulative": False,
        "noEnchant": False,
        "fxFile": "", "fxScale": "1",
        "fxAaConfig": None, "fxAaName": "", "fxAaPersist": True,
        "animOnActivate": True,
        "mode": mode,
        "active": False,
        "effects": effects or [],
        "costs": costs or [],
        # Sistema build 31: ação que LIGAR o item consome, e a sustentação do
        # item ligado (uma ação por turno para continuar ligado).
        "actionCost": "none",
        "sustain": {"enabled": False, "action": "simple"},
    }


# ---------------------------------------------------------------------------
#  Itens
# ---------------------------------------------------------------------------

def _xp_habilidade(cost_b, cost_a, cost_e):
    """Custos de XP no formato do sistema (string).

    Vazio = tabela padrão (20/40/80); "0" = de graça. No livro, "-" marca um
    nível que não existe: ele vira "0" para nunca cobrar XP por um nível sem
    conteúdo (ex.: Melhorar Atributo 40/-, habilidades só Épicas -/-/60).
    Épico não citado no livro fica vazio (padrão do sistema).
    """
    b = str(cost_b) if cost_b else "0"
    a = str(cost_a) if cost_a else "0"
    e = str(cost_e) if cost_e else ""
    return b, a, e


def habilidade(name, lists, desc_b, desc_a, cost_b, cost_a, cost_e=0,
               desc_e="", prereq="", activation="", target="", area="",
               rng="", duration="", mode=None, effects=None, costs=None,
               actions=None, img="icons/svg/book.svg", sort=0,
               costs_cumulative=False):
    xb, xa, xe = _xp_habilidade(cost_b, cost_a, cost_e)
    so_epica = not cost_b and not cost_a and bool(cost_e)
    system = {
        # Habilidades só Épicas (- / - / 60) já entram no nível Épico.
        "level": "E" if so_epica else "B",
        "costBasic": xb,
        "costAdvanced": xa,
        "costSpecial": xe,
        "prereq": prereq,
        "lists": lists,
        "activation": activation,
        "target": target, "area": area, "range": rng, "duration": duration,
        "descBasic": p(desc_b),
        "descAdvanced": p(desc_a),
        "descSpecial": p(desc_e) if desc_e else "",
        "actions": actions or [],
        **_activatable(mode, effects, costs),
    }
    system["costsCumulative"] = costs_cumulative
    return base_doc(name, "habilidade", img, system, sort)


def complicacao(name, lists, desc_b, desc_a, xp_b=0, xp_a=0, xp_e=0, desc_e="",
                prereq="", activation="", target="", area="", rng="",
                duration="", mode=None, effects=None, costs=None,
                actions=None, img="icons/svg/downgrade.svg", sort=0):
    # XP concedido (string): complicações do Avulso 09 têm um nível só, então
    # Avançado/Épico ficam "0" (vazio daria XP da tabela por nível inexistente).
    system = {
        "level": "B",
        "xpBasic": str(xp_b) if xp_b else "",
        "xpAdvanced": str(xp_a) if xp_a else "0",
        "xpSpecial": str(xp_e) if xp_e else "0",
        "prereq": prereq,
        "lists": lists,
        "activation": activation,
        "target": target, "area": area, "range": rng, "duration": duration,
        "descBasic": p(desc_b),
        "descAdvanced": p(desc_a),
        "descSpecial": p(desc_e) if desc_e else "",
        "actions": actions or [],
        **_activatable(mode, effects, costs),
    }
    return base_doc(name, "complicacao", img, system, sort)


def magia(name, word, tier, casting, target, area, rng, duration, desc,
          pecs, word2="", word3="", actions=None, effects=None, costs=None,
          mode="active", img="icons/svg/daze.svg", sort=0):
    system = {
        "wordId": word,
        "wordId2": word2,
        "wordId3": word3,
        "tier": tier,
        "casting": casting,
        "target": target, "area": area, "range": rng, "duration": duration,
        "description": p(desc),
        "peculiarities": p(pecs),
        "metamagics": [],
        "actions": actions or [],
        **_activatable(mode, effects, costs),
    }
    return base_doc(name, "magia", img, system, sort)


def equipamento(name, category, price, weight, description, notes="",
                tags=None, qty=1, mode=None, effects=None, costs=None,
                actions=None, img="icons/svg/item-bag.svg", sort=0):
    system = {
        "category": category,
        "tags": tags or [],
        "tagsExtra": "",
        "qty": qty,
        "weight": weight,
        "price": price,
        "notes": notes,
        "description": p(description),
        "actions": actions or [],
        **_activatable(mode, effects, costs),
    }
    return base_doc(name, "equipamento", img, system, sort)


def traco(name, source, description, is_weapon=False, mode=None,
          effects=None, costs=None, actions=None, img="icons/svg/aura.svg",
          sort=0):
    system = {
        "source": source,
        "description": p(description),
        "isWeapon": is_weapon,
        "actions": actions or [],
        **_activatable(mode, effects, costs),
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


def key_skill_snapshot(hab_doc, in_pack=True):
    """Snapshot de uma habilidade para o campo keySkills das vocações.

    in_pack=False para chaves montadas só para a vocação (Pacto [Único]...),
    que não existem como item do compêndio.
    """
    return {
        "name": hab_doc["name"],
        "img": hab_doc["img"],
        "system": hab_doc["system"],
        "sourceUuid": (f"Compendium.ligeia-livro-do-jogador.habilidades.Item.{hab_doc['_id']}"
                       if in_pack else ""),
    }


def definicao(name, itype, description, skill_list=None, granted=None,
              key_skills=None, img="icons/svg/mystery-man.svg", sort=0,
              size=None, **extra):
    """Item de definição: raca, heranca, vocacao, organizacao ou carreira.

    - raca: size ("pequeno"/"medio"/...) + moveBonus (ajuste por cima do
      deslocamento da categoria; o livro dá o total, então moveBonus =
      bônus do livro - move da categoria).
    - vocacao: hpBonus/mpBonus (aceitam fórmula).
    """
    system = {
        "description": p(description),
        "skillList": skill_list or [],
        "grantedTraits": [trait_snapshot(t) for t in (granted or [])],
    }
    if itype == "raca":
        system["size"] = size or "medio"
        system["moveBonus"] = _s(extra.pop("moveBonus", 0))
    if itype == "vocacao":
        system["hpBonus"] = _s(extra.pop("hpBonus", 0))
        system["mpBonus"] = _s(extra.pop("mpBonus", 0))
        system["keySkills"] = [key_skill_snapshot(h, in_pack=not h.get("_generic"))
                               for h in (key_skills or [])]
    system.update(extra)
    return base_doc(name, itype, img, system, sort)
