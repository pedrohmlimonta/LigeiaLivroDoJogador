# -*- coding: utf-8 -*-
"""Equipamentos adicionais: armas naturais / ataques desarmados."""
from builders import equipamento, action

IMG_NAT = "icons/svg/sword.svg"


def _natural(nome, dano, dtipo, attr, desc, melhorias=None):
    tipo_label = {"corte": "Corte", "perfuracao": "Perfuração",
                  "concussao": "Concussão"}[dtipo]
    dano_lbl = {"@nivel": "+Nível", "ceil(@nivel/2)": "+metade do Nível"}.get(str(dano), f"+{dano}")
    acts = [action(f"Ataque — {nome}",
                   roll_attr=attr, damage=dano, damage_type=dtipo,
                   defense_attr="esquiva", defense_attr2="bloqueio",
                   is_weapon=True, is_melee=True)]
    for extra in (melhorias or []):
        acts.append(extra)
    return equipamento(
        nome, "Arma Natural", "—", 0,
        desc + f"\n\nGrupo: Naturais / Desarmado. Dano Base: {tipo_label} {dano_lbl}.",
        notes="Arma natural",
        tags=["naturais", "desarmado", "corpo_a_corpo"],
        actions=acts,
        img=IMG_NAT,
    )


EQUIPAMENTOS_2 = [
    _natural("Soco", 0, "concussao", "forca",
             "Um golpe desarmado com os punhos. Com a habilidade Artes Marciais, use as ações de Agilidade com dano de metade do Nível (Básico) ou igual ao Nível (Avançado).",
             melhorias=[
                 action("Soco — Artes Marciais B (Agilidade, metade do Nível)",
                        roll_attr="agilidade", damage="ceil(@nivel/2)", damage_type="concussao",
                        defense_attr="esquiva", defense_attr2="bloqueio",
                        is_weapon=True, is_melee=True),
                 action("Soco — Artes Marciais A (Agilidade, dano = Nível)",
                        roll_attr="agilidade", damage="@nivel", damage_type="concussao",
                        defense_attr="esquiva", defense_attr2="bloqueio",
                        is_weapon=True, is_melee=True),
             ]),
    _natural("Chute", 0, "concussao", "forca",
             "Um golpe desarmado com as pernas. Com a habilidade Artes Marciais, use as ações de Agilidade com dano de metade do Nível (Básico) ou igual ao Nível (Avançado).",
             melhorias=[
                 action("Chute — Artes Marciais B (Agilidade, metade do Nível)",
                        roll_attr="agilidade", damage="ceil(@nivel/2)", damage_type="concussao",
                        defense_attr="esquiva", defense_attr2="bloqueio",
                        is_weapon=True, is_melee=True),
                 action("Chute — Artes Marciais A (Agilidade, dano = Nível)",
                        roll_attr="agilidade", damage="@nivel", damage_type="concussao",
                        defense_attr="esquiva", defense_attr2="bloqueio",
                        is_weapon=True, is_melee=True),
             ]),
    _natural("Garras", "@nivel", "corte", "forca",
             "Garras usadas como arma natural (habilidade Garras — infernal). O ataque usa Força ou Agilidade e causa dano de Corte +Nível. No nível Avançado da habilidade, ao acertar, 1 ponto heróico causa dano contínuo de sangramento ou torna o ataque crítico."),
    _natural("Cauda", "@nivel", "concussao", "forca",
             "Cauda usada como arma natural (habilidade Cauda — infernal). O ataque usa Força e causa dano de Concussão +Nível. Pode-se optar por agarrar o alvo (com 1D no ataque) em vez de causar dano."),
    _natural("Presas", "@nivel", "perfuracao", "forca",
             "Presas usadas como arma natural (habilidade Presas — draconiano). O ataque usa Força e causa dano de Perfuração +Nível. No nível Avançado da habilidade, 1 ponto heróico ao causar dano agarra o alvo (Força anula)."),
    _natural("Mordida", 0, "perfuracao", "forca",
             "Um ataque de mordida comum, sem presas desenvolvidas."),
]
