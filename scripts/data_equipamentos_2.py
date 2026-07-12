# -*- coding: utf-8 -*-
"""Equipamentos adicionais: armas naturais / ataques desarmados."""
from builders import equipamento, action

IMG_NAT = "icons/svg/fist.svg" if False else "icons/svg/sword.svg"


def _natural(nome, dano, dtipo, attr, desc, attr2=""):
    tipo_label = {"corte": "Corte", "perfuracao": "Perfuração", "concussao": "Concussão"}[dtipo]
    return equipamento(
        nome, "Arma Natural", "—", 0,
        desc + f"\n\nGrupo: Naturais / Desarmado. Dano Base: {tipo_label} +{dano}.",
        notes="Arma natural",
        actions=[action(f"Ataque — {nome}",
                        roll_attr=attr, damage=str(dano), damage_type=dtipo,
                        defense_attr="esquiva", defense_attr2="bloqueio")],
        img=IMG_NAT,
    )


EQUIPAMENTOS_2 = [
    _natural("Soco", 0, "concussao", "forca",
             "Um golpe desarmado com os punhos. Personagens com Artes Marciais podem rolar Agilidade em vez de Força e usam dano base igual a metade do Nível (nível Básico) ou igual ao Nível (Avançado) — ajuste o valor da ação."),
    _natural("Chute", 0, "concussao", "forca",
             "Um golpe desarmado com as pernas. Personagens com Artes Marciais podem rolar Agilidade em vez de Força e usam dano base igual a metade do Nível (nível Básico) ou igual ao Nível (Avançado) — ajuste o valor da ação."),
    _natural("Garras", 1, "corte", "forca",
             "Garras usadas como arma natural (habilidade Garras — infernal). O ataque usa Força ou Agilidade e causa dano de Corte +Nível — ajuste o valor da ação conforme o Nível. No nível Avançado, ao acertar, 1 ponto heróico causa dano contínuo de sangramento ou torna o ataque crítico."),
    _natural("Cauda", 1, "concussao", "forca",
             "Cauda usada como arma natural (habilidade Cauda — infernal). O ataque usa Força e causa dano de Concussão +Nível — ajuste o valor da ação conforme o Nível. Pode-se optar por agarrar o alvo (com 1D no ataque) em vez de causar dano."),
    _natural("Presas", 1, "perfuracao", "forca",
             "Presas usadas como arma natural (habilidade Presas — draconiano). O ataque usa Força e causa dano de Perfuração +Nível — ajuste o valor da ação conforme o Nível. No nível Avançado, 1 ponto heróico ao causar dano agarra o alvo (Força anula)."),
    _natural("Mordida", 0, "perfuracao", "forca",
             "Um ataque de mordida comum, sem presas desenvolvidas."),
]
