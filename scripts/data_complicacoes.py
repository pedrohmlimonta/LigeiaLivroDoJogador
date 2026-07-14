# -*- coding: utf-8 -*-
"""Complicações (tipo `complicacao`, sistema ligeia-rpg 0.2.0+).

O Livro de Regras não traz uma lista de complicações — este tipo de item é
uma extensão do sistema. Adicione aqui as complicações da sua mesa usando o
construtor `complicacao()` e rode o build; o pack "complicacoes" só é gerado
e incluído no module.json quando esta lista tiver ao menos um item.

Exemplo:

    from builders import complicacao

    COMPLICACOES = [
        complicacao(
            "Código de Honra", "Qualquer",
            "Você segue um código rígido de conduta. Quando agir contra ele, "
            "sofre desvantagem em rolagens sociais até o fim da cena.",
            "Além do efeito Básico, quebrar o código custa 1 ponto heróico.",
            xp_b=20, xp_a=40,
        ),
    ]
"""
from builders import complicacao  # noqa: F401 — pronto para uso

COMPLICACOES = []
