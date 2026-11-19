# -*- coding: utf-8 -*-
"""Armas de fogo e itens mecânicos.

Fonte: Diário do Oráculo — Obras-primas: Itens Mecânicos (pág. 20), Dinho Reis.

As armas usam o mesmo modelo das armas do livro (_arma): ataque de Agilidade
com dano escalonado, alcance, a ação de duas mãos da arma Versátil e as
tipagens. Armas de Fogo, Mecânica e Penetrante não estão na lista de tipagens
do sistema e entram como tipagens digitadas — Usar Armas [Armas de Fogo] mira
arma:armas_de_fogo, a forma normalizada de "Armas de Fogo".

Mecânica (rolagem de Dureza depois de uma falha crítica) e Penetrante (ignora a
Proteção de armaduras de couro e de peles) ficam na descrição: o sistema não
tem Dureza nos itens, nem cadeia por falha crítica, nem como ignorar a
Proteção de uma armadura específica.
"""
from builders import equipamento
from data_equipamentos import _arma, IMG_ITEM, IMG_TOOL

_FONTE = "(Diário do Oráculo — Obras-primas: Itens Mecânicos)"

_MECANICA = (
    "Mecânica: itens mecânicos são itens poderosos, mas que apresentam muitas vezes um certo "
    "nível de mau funcionamento. Sempre que um usuário rola uma falha crítica em uma ação usando "
    "o item, ele deve realizar uma rolagem de Dureza do item. Numa falha, o item perde 1 ponto de "
    "Dureza."
)

_ARMA_DE_FOGO = (
    "Armas de Fogo: são armas que usam balas de chumbo como munição e necessitam da pólvora para "
    "funcionar.\n\n"
    + _MECANICA + "\n\n"
    "Penetrante: estas armas ignoram a Proteção de armaduras de couro e de peles. " + _FONTE
)

ITENS_MECANICOS = [
    # ------------------------------ Armas de fogo -----------------------
    _arma("Bacamarte", "450 Vo", "Armas de Fogo", "Agilidade", 4, "perfuracao", 1,
          "Mecânica, Versátil, Artilharia, Alcance 120m, Penetrante, Recarga",
          alcance=120, versatil=True, desc=_ARMA_DE_FOGO),
    _arma("Pistola", "200 Vo", "Armas de Fogo", "Agilidade", 3, "perfuracao", 0,
          "Mecânica, Uma Mão, Artilharia, Alcance 60m, Penetrante, Recarga",
          alcance=60, desc=_ARMA_DE_FOGO),
    _arma("Rifle", "300 Vo", "Armas de Fogo", "Agilidade", 5, "perfuracao", 1,
          "Mecânica, Duas Mãos, Artilharia, Alcance 120m, Penetrante, Recarga",
          alcance=120, desc=_ARMA_DE_FOGO),
    _arma("Rifle de Cano Duplo", "1200 Vo", "Armas de Fogo", "Agilidade", 6, "perfuracao", 2,
          "Mecânica, Duas Mãos, Artilharia, Alcance 120m, Penetrante, Recarga",
          alcance=120, desc=_ARMA_DE_FOGO),
    # ------------------------- Munição e suprimentos ---------------------
    equipamento("Balas de Chumbo", "Munição", "10 Vo", 0,
                "Balas esféricas e pesadas, feitas em chumbo.\n\n"
                "Propriedade: munição para uma arma de fogo, suficiente para uma aventura. " + _FONTE,
                img=IMG_ITEM),
    equipamento("Garrafa de Pólvora", "Material", "50 Vo", 0,
                "Uma garrafa afunilada de metal contendo pólvora dentro.\n\n"
                "Propriedade: contém pólvora para manter uma arma por uma aventura inteira. " + _FONTE,
                img=IMG_ITEM),
    # ------------------------------ Propulsor ---------------------------
    equipamento("Propulsor de Ar", "Utensílio (Item Mecânico)", "450 Vo", 0,
                "Uma pesada mochila mecânica, com duas cavidades em seu inferior. Nela podem ser "
                "ligadas duas cápsulas de gás que, quando liberados, escapam através das cavidades "
                "da mochila.\n\n"
                "Propriedade: quando utilizado para saltar, adiciona 10m à distância do salto. "
                "Necessita de duas cápsulas de gás para funcionar.\n\n" + _MECANICA + " " + _FONTE,
                img=IMG_TOOL),
    equipamento("Cápsula de Gás", "Material", "15 Vo", 0,
                "Cápsulas do tamanho de uma tocha, mecanicamente trancadas e contendo uma válvula em "
                "uma de suas extremidades, que podem ser anexadas a um propulsor de ar.\n\n"
                "Propriedade: contém gás suficiente para uma aventura. " + _FONTE,
                img=IMG_ITEM),
]
