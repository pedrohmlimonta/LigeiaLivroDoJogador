# -*- coding: utf-8 -*-
"""Ações e efeitos por nível (B/A/E) adicionados automaticamente.

Duas camadas:
  1. LEVEL_UPGRADES — tabela dirigida por item (variantes de Avançado/Épico
     que o texto do livro descreve: dano maior, condição extra, custo de PH).
  2. Gerador genérico — toda habilidade ativável com efeitos (que não seja
     perícia) ganha ações "Ativar (B/A/E)" que aplicam os efeitos do nível
     como efeitos ativos até o fim da cena, com os custos respectivos.
"""
from builders import action, applies, effect
from enhance_audit import apply_audit

_N = {"forca": "Força", "agilidade": "Agilidade", "mente": "Mente",
      "percepcao": "Percepção", "vigor": "Vigor"}


def _acao_rolagem(nome, attr, dados, level):
    return action(f"{nome} — rolar {_N[attr]} +{dados}D ({level})", level=level,
                  roll_attr=attr, roll_dice=dados, target_mode="none")


def _marcar_A_por_label(doc):
    for a in doc["system"]["actions"]:
        if "(A)" in a.get("label", "") or "(A —" in a.get("label", ""):
            a["level"] = "A"


def _medicina(doc):
    for a in doc["system"]["actions"]:
        if a["label"].startswith("Medicina — rolar"):
            a.update({"label": "Cuidados médicos (Mente +1D — cura 1 PV)",
                      "vsDifficulty": True, "fixedDifficulty": "8",
                      "targetMode": "target", "includeSelf": True,
                      "heal": "1", "healResource": "hp"})
    doc["system"]["actions"].append(action(
        "Cuidados médicos (A — cura 2 PV)", level="A",
        roll_attr="mente", roll_dice=1, vs_difficulty=True, fixed_difficulty=8,
        target_mode="target", include_self=True, heal=2, heal_resource="hp"))


LEVEL_UPGRADES = {
    "Artes Marciais": lambda d: d["system"]["actions"].append(action(
        "Ataque Desarmado Marcial (A — dano = Nível)", level="A",
        roll_attr="agilidade", damage="@nivel", damage_type="concussao",
        defense_attr="esquiva", defense_attr2="bloqueio",
        is_weapon=True, is_melee=True)),
    "Carisma": _marcar_A_por_label,
    "Medicina": _medicina,
    "Golpe Cegante": lambda d: d["system"]["actions"].append(action(
        "Golpe Cegante (A — cego até receber cuidados médicos)", level="A",
        can_roll=False, target_mode="target", cost_heroic=1,
        applies_effects=[applies("Cego (até cuidados médicos)",
                                 fx_type="condition", fx_target="cego",
                                 duration_mode="scene")])),
    "Golpear com Escudo": lambda d: d["system"]["actions"].append(action(
        "Ataque com Escudo (A — 2+ de dano deixa Pasmo)", level="A",
        roll_attr="forca", damage="0", damage_type="concussao",
        defense_attr="esquiva", defense_attr2="bloqueio",
        is_weapon=True, is_melee=True,
        applies_effects=[applies("Pasmo (se sofreu 2+ de dano; Vigor anula)",
                                 fx_type="condition", fx_target="pasmo",
                                 duration_mode="scene", resist=True,
                                 resist_attr="vigor")])),
    "Garras": lambda d: d["system"]["actions"].append(action(
        "Garras (A — 1 PH: sangramento contínuo)", level="A",
        can_roll=False, target_mode="target", cost_heroic=1,
        applies_effects=[applies("Sangramento (dano contínuo de corte; Vigor anula)",
                                 fx_type="condition", fx_target="dano_continuo",
                                 duration_mode="scene", resist=True,
                                 resist_attr="vigor", resist_vs_cast=False,
                                 resist_reroll=True, tick_amount=1,
                                 tick_type="corte")])),
    "Presas": lambda d: d["system"]["actions"].append(action(
        "Presas (A — 1 PH ao causar dano: agarrar; 1 de dano por turno agarrado)", level="A",
        can_roll=False, target_mode="target", cost_heroic=1,
        applies_effects=[applies("Agarrado pelas presas (Força anula; 1 de dano no começo do turno)",
                                 fx_type="condition", fx_target="agarrado",
                                 duration_mode="scene", resist=True,
                                 resist_attr="forca", resist_vs_cast=False,
                                 resist_reroll=True, tick_amount=1,
                                 tick_type="perfuracao")])),
    "Cauda": lambda d: d["system"]["actions"].append(action(
        "Agarrar com a Cauda (A — 1D no ataque, sem dano)", level="A",
        roll_attr="forca", roll_dice=1, defense_attr="esquiva",
        defense_attr2="bloqueio", is_melee=True,
        applies_effects=[applies("Agarrado pela cauda (Força anula)",
                                 fx_type="condition", fx_target="agarrado",
                                 duration_mode="scene", resist=True,
                                 resist_attr="forca")])),
    "Inspirar": lambda d: d["system"]["actions"].append(action(
        "Inspirar (A — 2D aos aliados, próximo turno)", level="A",
        can_roll=False, target_mode="aura", area_filter="allies", area=20,
        applies_effects=[applies("Inspirado: +2 dados (use em uma ou mais rolagens)",
                                 fx_type="rollDice", fx_target="all", fx_value=2,
                                 duration_mode="rounds", duration_rounds=1)])),
    "Mestre do Conhecimento": lambda d: d["system"]["actions"].append(
        _acao_rolagem("Mestre do Conhecimento", "mente", 2, "A")),
    "Senso Lógico": lambda d: d["system"]["actions"].append(
        _acao_rolagem("Senso Lógico", "mente", 2, "A")),
    "Lidar com Animais": lambda d: d["system"]["actions"].append(action(
        "Comunicar-se com uma Fera (A — 1 PH)", level="A",
        can_roll=False, target_mode="none", cost_heroic=1)),
    # Acrobacia, Atletismo e Alerta: ver enhance_audit (a lista de efeitos é
    # refeita lá, sem a duplicação que existia entre os dados e esta tabela).
    "Lábia Natural": lambda d: d["system"]["effects"].append(
        effect("reroll1", "mente", 1, level="A", reroll_all=True,
               label="Lábia (A): re-rola os 1 em interação social (re-role os 2 manualmente)")),
    "Guerra Santa": lambda d: d["system"]["effects"].append(
        effect("rollDice", "attack", 1, level="A",
               label="Guerra Santa (A): +1 dado vs servos de religiões opostas (ligue quando valer)")),
    "Sobrevivência": lambda d: d["system"]["effects"].append(
        effect("rollDice", "attack", 1, level="A",
               label="Sobrevivência (A): +1 dado de ataque contra Feras (ligue quando valer)")),
}

def _forma_animal(d):
    s = d["system"]
    s["costs"] = []          # o custo passa para as ações
    s["mode"] = "passive"
    s["actions"] += [
        action("Forma Animal (1 PM, cena) — forma com 1D em Força", level="B",
               can_roll=False, target_mode="self", include_self=True, cost_mp=1,
               applies_effects=[applies("Forma Animal: 1D Força", fx_type="dice",
                                        fx_target="forca", fx_value=1, duration_mode="scene")]),
        action("Forma Animal (1 PM, cena) — forma com 1D em Agilidade", level="B",
               can_roll=False, target_mode="self", include_self=True, cost_mp=1,
               applies_effects=[applies("Forma Animal: 1D Agilidade", fx_type="dice",
                                        fx_target="agilidade", fx_value=1, duration_mode="scene")]),
        action("Benefício (A): 1D em Percepção", level="A",
               can_roll=False, target_mode="self", include_self=True,
               applies_effects=[applies("Forma Animal (A): 1D Percepção", fx_type="dice",
                                        fx_target="percepcao", fx_value=1, duration_mode="scene")]),
        action("Benefício (A): +3m de Deslocamento", level="A",
               can_roll=False, target_mode="self", include_self=True,
               applies_effects=[applies("Forma Animal (A): +3m Deslocamento", fx_type="stat",
                                        fx_target="deslocamento", fx_value=3, duration_mode="scene")]),
        action("Benefício (A): Proteção 2 (corte/perfuração/concussão)", level="A",
               can_roll=False, target_mode="self", include_self=True,
               applies_effects=[applies(f"Forma Animal (A): RD 2 {t}", fx_type="rd",
                                        fx_target=t, fx_value=2, duration_mode="scene")
                                for t in ("corte", "perfuracao", "concussao")]),
        action("Benefício (A): +2 nos ataques", level="A",
               can_roll=False, target_mode="self", include_self=True,
               applies_effects=[applies("Forma Animal (A): +2 ataque", fx_type="bonus",
                                        fx_target="attack", fx_value=2, duration_mode="scene")]),
    ]


def _letalidade(d):
    d["system"]["actions"] += [
        action("Letalidade (B) — dano final +metade do Nível (alvo indefeso/surpreso)",
               level="B", can_roll=False, target_mode="target",
               damage="ceil(@nivel/2)", damage_type="final"),
        action("Letalidade (A) — dano final +Nível (alvo indefeso/surpreso)",
               level="A", can_roll=False, target_mode="target",
               damage="@nivel", damage_type="final"),
    ]


def _escola_arcana(d):
    s = d["system"]
    s["mode"] = "active"
    s["effects"] += [
        effect("bonus", "conjuracao", "ceil(@nivel/2)", level="B",
               label="Escola Arcana: +metade do Nível — troque o alvo para a SUA palavra (Conjuração — palavra) e ligue"),
        effect("crit", "conjuracao", 1, level="A",
               label="Escola Arcana (A): crítico 11-12 — troque o alvo para a SUA palavra"),
        effect("info", "all", 0, level="A",
               label="Escola Arcana (A): magias de dano da palavra causam +1 de dano bruto"),
    ]


def _zona_de_ameaca(d):
    d["system"]["actions"] += [
        action("Zona de Ameaça (reação) — ataque com sua arma; acerto cancela a ação",
               level="B", can_roll=False, target_mode="target"),
        action("Zona de Ameaça (A) — o alvo atingido fica Indefeso",
               level="A", can_roll=False, target_mode="target",
               applies_effects=[applies("Indefeso (Zona de Ameaça)", fx_type="condition",
                                        fx_target="indefeso", duration_mode="rounds",
                                        duration_rounds=1)]),
    ]


def _impulso_de_combate(d):
    d["system"]["actions"].append(action(
        "Impulso de Combate (1 PH) — ataques extras = metade dos PH gastos desde o descanso",
        level="B", can_roll=False, target_mode="none", cost_heroic=1))


LEVEL_UPGRADES.update({
    "Forma Animal": _forma_animal,
    "Letalidade": _letalidade,
    "Escola Arcana": _escola_arcana,
    "Zona de Ameaça": _zona_de_ameaca,
    "Impulso de Combate": _impulso_de_combate,
    "Golpe Letal": lambda d: d["system"]["actions"].append(action(
        "Golpe Letal (E) — Letalidade dobrada: dano final 2×Nível (alvo indefeso)",
        level="E", can_roll=False, target_mode="target",
        damage="2*@nivel", damage_type="final")),
    "Desaparecer": lambda d: d["system"]["actions"].append(action(
        "Desaparecer (E) — invisível na penumbra (some ao mover/atacar/falar)",
        level="E", can_roll=False, target_mode="self", include_self=True,
        applies_effects=[applies("Invisível (Desaparecer)", fx_type="condition",
                                 fx_target="invisivel", duration_mode="scene")])),
    "Autoridade Divina": lambda d: (d["system"].update(mode="active"), d["system"]["effects"].append(
        effect("reroll1", "mente", 1, level="E", reroll_all=True,
               label="Autoridade Divina (E): re-rola os 1 em interação social (ligue quando valer)"))),
})


for _v in ("Aéreos", "Terrestres", "Marítimos", "Subterrâneos"):
    LEVEL_UPGRADES[f"Veículos ({_v})"] = (
        lambda d, v=_v: d["system"]["actions"].append(action(
            f"Manobra arriscada (A — 1 PH, Agilidade +1D)", level="A",
            roll_attr="agilidade", roll_dice=1, target_mode="none",
            cost_heroic=1)))

for _c in ("Arcano", "Guerra", "História", "Natureza", "Ocultismo", "Religião"):
    LEVEL_UPGRADES[f"Conhecimento ({_c})"] = (
        lambda d: d["system"]["actions"].append(action(
            "Criar um “fato” (A — 1 PH)", level="A",
            can_roll=False, target_mode="none", cost_heroic=1)))


# ---------------------------------------------------------------------------
# Gerador genérico: "Ativar (B/A/E)" para ativáveis com efeitos
# ---------------------------------------------------------------------------
_FX_OK = {"bonus", "dice", "rollDice", "attr", "stat", "set", "damage", "rd",
          "vuln", "reroll1", "reroll6", "crit", "fumble", "restore",
          "condition", "size"}
_ORD = {"all": 0, "B": 0, "A": 1, "E": 2}


_SEQ = ["B", "A", "E"]


def _parse_nivel_custo(bruto):
    texto = bruto or "all"
    if texto == "all":
        return "all", False
    soma = texto.endswith("+")
    nivel = texto[:-1] if soma else texto
    return (nivel, soma) if nivel in _SEQ else ("all", False)


def custos_do_nivel(costs, nivel):
    """Mesma regra de costsForLevel (helpers/effects.mjs): "Sempre" entra em
    qualquer ativação; o nível ativado cobra os seus e, se algum for A+/E+,
    desce um degrau e repete."""
    sempre = [c for c in costs if _parse_nivel_custo(c.get("level"))[0] == "all"]
    pagar, i = [], _SEQ.index(nivel)
    while i >= 0:
        neste = [c for c in costs if _parse_nivel_custo(c.get("level"))[0] == _SEQ[i]]
        pagar += neste
        if not any(_parse_nivel_custo(c.get("level"))[1] for c in neste):
            break
        i -= 1
    escolhidos = {id(c) for c in sempre + pagar}
    return [c for c in costs if id(c) in escolhidos]


# Ativáveis cujo efeito precisa ser ajustado antes (alvo escolhido pelo
# jogador): a ação equivalente copiaria o alvo genérico.
_SEM_ACAO_ATIVACAO = {"Escola Arcana"}


def _gerar_acoes_ativacao(doc):
    if doc["name"] in _SEM_ACAO_ATIVACAO:
        return
    sysd = doc["system"]
    if sysd.get("mode") != "active" or not sysd.get("effects"):
        return
    if any(a.get("appliesEffects") for a in sysd.get("actions", [])):
        return  # já tem ação que aplica efeitos
    niveis = ["B"]
    if any(e.get("level") == "A" for e in sysd["effects"]):
        niveis.append("A")
    if any(e.get("level") == "E" for e in sysd["effects"]):
        niveis.append("E")
    rotulo_nivel = {"B": "Básico", "A": "Avançado", "E": "Épico"}
    for lv in niveis:
        custos = {"mp": 0, "hp": 0, "heroic": 0}
        for c in custos_do_nivel(sysd.get("costs", []), lv):
            try:
                custos[c["resource"]] = custos.get(c["resource"], 0) + int(c["value"])
            except (ValueError, KeyError):
                pass
        fx = []
        for e in sysd["effects"]:
            if e["type"] not in _FX_OK:
                continue
            if _ORD.get(e.get("level", "all"), 0) > _ORD[lv]:
                continue
            fx.append(applies(e.get("label") or f"{doc['name']} ({lv})",
                              fx_type=e["type"], fx_target=e["target"],
                              fx_value=e["value"], fx_all=e.get("rerollAll", False),
                              duration_mode="scene"))
        if not fx:
            continue
        sysd["actions"].append(action(
            f"Ativar {doc['name']} ({rotulo_nivel[lv]} — até o fim da cena)",
            level=lv,
            can_roll=False, target_mode="self", include_self=True,
            cost_mp=custos.get("mp", 0), cost_hp=custos.get("hp", 0),
            cost_heroic=custos.get("heroic", 0),
            applies_effects=fx))


def apply_level_upgrades(doc, is_pericia):
    # Só habilidades: as armas naturais do pack de equipamentos (Garras,
    # Presas, Cauda) têm o mesmo nome, mas não têm nível — as variantes de
    # Avançado ficam na habilidade.
    if doc["type"] == "habilidade":
        fn = LEVEL_UPGRADES.get(doc["name"])
        if fn:
            fn(doc)
        apply_audit(doc)
    if doc["type"] in ("habilidade", "complicacao") and not is_pericia:
        _gerar_acoes_ativacao(doc)
