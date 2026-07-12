# -*- coding: utf-8 -*-
"""Raças (Sessão 4) e Heranças (Sessão 5) como itens de definição."""
from builders import definicao
from data_tracos import TRACOS
from data_tracos_2 import TRACOS_2

_ALL_TRACOS = {t["name"]: t for t in (TRACOS + TRACOS_2)}


def _g(*names):
    return [_ALL_TRACOS[n] for n in names]


def _carac_raca(dado, desloc, tamanho, idiomas, corrupcao):
    return (f"Características — Dado de Melhoria: {dado}. Bônus de Deslocamento: +{desloc}m. "
            f"Tamanho: {tamanho}. Idiomas Iniciais: {idiomas}. Corrupção: {corrupcao}.")


IMG_RACA_DEF = "icons/svg/mystery-man.svg"
IMG_HERANCA_DEF = "icons/svg/eye.svg"

_ELFO_ARMAS = ["Usar Armas (Arcos)", "Usar Armas (Lâminas Grandes)", "Usar Armas (Lâminas Pequenas)"]

RACAS = [
    definicao(
        "Anão das Montanhas", "raca",
        "Anões robustos das fortalezas montanhosas, mestres da forja e da pedra.\n\n"
        + _carac_raca("Vigor ou Força", 4, "Médio", "Regional e Anão", "+0"),
        skill_list=["Baluarte", "Carregador", "Conhecimento (História)", "Explorador (Montanhas)",
                    "Firmeza Física", "Ofícios", "Presa de Caça (Gigantes)", "Usar Armaduras Leves",
                    "Usar Armas (Machados)", "Usar Armas (Martelos)", "Trilhador (Montanhas)",
                    "Vigor de Aço"],
        granted=_g("Visão no Escuro (10m)", "Resistência Anã", "Filhos de Pálim"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
    definicao(
        "Anão das Terras Baixas", "raca",
        "Anões das colinas e cidades baixas, comerciantes e artesãos de vontade firme.\n\n"
        + _carac_raca("Vigor ou Mente", 4, "Médio", "Regional e Anão", "+0"),
        skill_list=["Carisma", "Carregador", "Conhecimento (História)", "Firmeza Física", "Ofícios",
                    "Presa de Caça (Gigantes)", "Usar Armas (Machados)", "Usar Armas (Martelos)",
                    "Vigor de Aço", "Vontade de Ferro"],
        granted=_g("Visão no Escuro (10m)", "Resistência Anã", "Filhos de Pálim"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
    definicao(
        "Alto Elfo", "raca",
        "Elfos de traços finos e herança arcana, agraciados pelo príncipe dos faérian.\n\n"
        + _carac_raca("Agilidade ou Mente", 5, "Médio", "Regional e Élfico", "+0"),
        skill_list=["Conhecimento (Arcano)", "Palavra Arcana (lumo)"] + _ELFO_ARMAS,
        granted=_g("Visão no Escuro (10m)", "Ancestral Faerian", "Transe", "Filhos de Éllon"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Elfo Cinzento", "raca",
        "Elfos eruditos abençoados por Kalael com grande afinidade mágica.\n\n"
        + _carac_raca("Agilidade ou Mente", 5, "Médio", "Regional e Élfico", "+0"),
        skill_list=["Conhecimento (Arcano)", "Conhecimento (Religião)"] + _ELFO_ARMAS,
        granted=_g("Visão no Escuro (10m)", "Ancestral Faerian", "Transe", "Filhos de Kalael"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Elfo Solar", "raca",
        "Elfos ligados a Auralia, capazes de atravessar a Selva Faérian em curtos saltos.\n\n"
        + _carac_raca("Agilidade ou Mente", 5, "Médio", "Regional e Élfico", "+0"),
        skill_list=["Conhecimento (Arcano)", "Conhecimento (História)", "Vontade de Ferro"] + _ELFO_ARMAS,
        granted=_g("Visão no Escuro (10m)", "Ancestral Faerian", "Transe", "Filhos de Auralia"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Elfo da Floresta", "raca",
        "Elfos guardiões das matas de Illain, imperceptíveis em ambientes selvagens.\n\n"
        + _carac_raca("Agilidade ou Percepção", 6, "Médio", "Regional e Élfico", "+0"),
        skill_list=["Conhecimento (Natureza)", "Explorador (Florestas)", "Furtividade",
                    "Sobrevivência", "Trilhador (Florestas)"] + _ELFO_ARMAS,
        granted=_g("Visão no Escuro (10m)", "Ancestral Faerian", "Transe", "Filhos de Illain"),
        moveBonus=6, img=IMG_RACA_DEF,
    ),
    definicao(
        "Elfo das Profundezas", "raca",
        "Elfos marcados pela maldição de Mizra, senhores das sombras do subterrâneo.\n\n"
        + _carac_raca("Agilidade ou Percepção", 5, "Médio", "Regional e Élfico", "+1"),
        skill_list=["Carisma", "Explorador (Subterrâneos)", "Furtividade", "Mercado Negro",
                    "Trilhador (Subterrâneos)"] + _ELFO_ARMAS,
        granted=_g("Visão no Escuro (20m)", "Ancestral Faerian", "Transe", "Prole de Mizra"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Gnomo da Floresta", "raca",
        "Gnomos travessos das matas, ilusionistas natos e amigos dos animais.\n\n"
        + _carac_raca("Mente ou Agilidade", 4, "Pequeno", "Regional e Élfico", "+0"),
        skill_list=["Carisma", "Conhecimento (Natureza)", "Especialista", "Explorador (Florestas)",
                    "Golpe de Sorte", "Lidar com Animais", "Montar Criatura", "Sobrevivência",
                    "Trilhador (Florestas)"],
        granted=_g("Visão no Escuro (10m)", "Filhos de Agalard", "Ilusionista Natural"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
    definicao(
        "Gnomo das Profundezas", "raca",
        "Gnomos furtivos das cavernas profundas, camuflados entre as rochas.\n\n"
        + _carac_raca("Mente ou Agilidade", 4, "Pequeno", "Regional e Élfico", "+1"),
        skill_list=["Alerta", "Conhecimento (Arcano)", "Explorador (Subterrâneos)", "Furtividade",
                    "Mercado Negro", "Movimento Astuto", "Palavra Arcana (iluzio)",
                    "Palavra Arcana (tenebrae)", "Trilhador (Subterrâneos)"],
        granted=_g("Visão no Escuro (20m)", "Filhos de Agalard", "Camuflagem Natural"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
    definicao(
        "Gnomo das Rochas", "raca",
        "Gnomos inventores e estudiosos, criadores de engenhocas notáveis.\n\n"
        + _carac_raca("Mente ou Vigor", 4, "Pequeno", "Regional e Élfico", "+0"),
        skill_list=["Carisma", "Conhecimento (Arcano)", "Conhecimento (Guerra)",
                    "Conhecimento (História)", "Conhecimento (Natureza)", "Conhecimento (Religião)",
                    "Especialista", "Lidar com Armadilhas", "Ofícios", "Veículos (Terrestres)",
                    "Veículos (Aéreos)"],
        granted=_g("Visão no Escuro (10m)", "Filhos de Agalard", "Inventor de Engenhocas"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
    definicao(
        "Humano", "raca",
        "Versáteis e ambiciosos, os humanos se adaptam a qualquer caminho.\n\n"
        + _carac_raca("Um atributo à escolha", 5, "Médio", "Regional e um à escolha", "+0"),
        skill_list=["Ofícios", "Sobrevivência"],
        granted=_g("Versátil", "Sangue Aagn"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Meio-elfo", "raca",
        "Filhos de dois mundos, combinam a graça élfica com a versatilidade humana.\n\n"
        + _carac_raca("Agilidade, Percepção ou Mente", 5, "Médio",
                      "Regional, Élfico e mais um à escolha", "+0"),
        skill_list=["Carisma", "Conhecimento (Arcano)", "Conhecimento (História)",
                    "Conhecimento (Natureza)", "Ofícios"],
        granted=_g("Visão no Escuro (10m)", "Ancestral Faerian", "Versatilidade dos Humanos",
                   "Talentoso"),
        moveBonus=5, img=IMG_RACA_DEF,
    ),
    definicao(
        "Meio-orc", "raca",
        "Herdeiros do vigor orc e da adaptabilidade humana, resistentes a qualquer adversidade.\n\n"
        + _carac_raca("Força ou Vigor", 6, "Médio", "Regional e Orc", "+0"),
        skill_list=["Atletismo", "Carregador", "Guerreiro Incauto", "Ímpeto", "Recuperar o Fôlego",
                    "Sobrevivência", "Vigor de Aço"],
        granted=_g("Visão no Escuro (10m)", "Sangue Ruim"),
        moveBonus=6, img=IMG_RACA_DEF,
    ),
    definicao(
        "Orc", "raca",
        "Guerreiros ferozes de Grumbar, movidos pela sede de batalha.\n\n"
        + _carac_raca("Força ou Vigor", 6, "Médio", "Regional e Orc", "+1"),
        skill_list=["Guerreiro Incauto", "Grito de Guerra", "Recuperar o Fôlego", "Vigor de Aço"],
        granted=_g("Visão no Escuro (20m)", "Filhos de Grumbar"),
        moveBonus=6, img=IMG_RACA_DEF,
    ),
    definicao(
        "Pequenino", "raca",
        "Pequenos, ágeis e sortudos, abençoados por Ruff.\n\n"
        + _carac_raca("Agilidade ou Percepção", 4, "Pequeno", "Regional e mais um à escolha", "+0"),
        skill_list=["Acrobacia", "Alerta", "Atletismo", "Furtividade", "Ofícios", "Reflexos",
                    "Usar Armas (Fundas)"],
        granted=_g("Agilidade dos Pequeninos", "Filhos de Ruff", "Resistência dos Pequeninos"),
        moveBonus=4, img=IMG_RACA_DEF,
    ),
]

_PAL = "Palavra Arcana"

HERANCAS = [
    definicao(
        "Celestial", "heranca",
        "Descendentes de seres de Solária, com sangue angelical.\n\nCusto: 20 pontos de antecedentes. Restrições: Nenhuma. Corrupção: -1.",
        skill_list=["Asas", "Carisma", "Energia Mágica Ampliada", "Familiar (Querubim)",
                    f"{_PAL} (exitium)", f"{_PAL} (lumo)", f"{_PAL} (majesto)", f"{_PAL} (pluribus)",
                    f"{_PAL} (saeculorum)", f"{_PAL} (sankta)", f"{_PAL} (sorcdiron)",
                    f"{_PAL} (vitae)", "Punição"],
        granted=_g("Visão no Escuro (10m)", "Ancestralidade Celestial", "Conjuração Celestial"),
        img=IMG_HERANCA_DEF,
    ),
    definicao(
        "Draconiano", "heranca",
        "Herdeiros do sangue dos dragões, com escamas, presas e sopros elementais.\n\nCusto: 30 pontos de antecedentes. Restrições: Nenhuma. Corrupção: +1 (Vermelho, Azul, Preto, Branco e Verde) ou +0 (Dourado, Prateado, Bronze, Latão e Cobre).",
        skill_list=["Afinidade Mágica Elemental (Ancestralidade)", "Asas", "Carisma",
                    "Conhecimento (Arcano)", "Conhecimento (História)", "Energia Mágica Ampliada",
                    "Familiar (Dragonete)", "Melhorar Atributo (Força)", "Melhorar Atributo (Mente)",
                    f"{_PAL} (Ancestralidade)", f"{_PAL} (exitium)", f"{_PAL} (majesto)",
                    f"{_PAL} (pluribus)", f"{_PAL} (saeculorum)", "Pele de Escamas", "Presas",
                    "Presença Aterradora", "Sopro de Dragão"],
        granted=_g("Fúria Draconiana", "Sangue de Dragão", "Ancestralidade Draconiana",
                   "Resistência Draconiana"),
        img=IMG_HERANCA_DEF,
    ),
    definicao(
        "Entrópico", "heranca",
        "Tocados pelo caos primordial, sua magia é imprevisível e mutável.\n\nCusto: 20 pontos de antecedentes. Restrições: Nenhuma. Corrupção: —.",
        skill_list=["Carisma", "Conhecimento (Arcano)", "Conhecimento (Natureza)",
                    "Energia Mágica Ampliada", f"{_PAL} (exitium)", f"{_PAL} (majesto)",
                    f"{_PAL} (pluribus)", f"{_PAL} (saeculorum)"],
        granted=_g("Alma Entrópica", "Magia do Caos"),
        img=IMG_HERANCA_DEF,
    ),
    definicao(
        "Infernal", "heranca",
        "Descendentes de diabos do Inferno, com chifres, garras e afinidade com o fogo.\n\nCusto: 30 pontos de antecedentes. Restrições: Nenhuma. Corrupção: +1.",
        skill_list=["Afinidade Mágica Elemental (Fogo)", "Asas", "Carisma", "Cauda",
                    "Familiar (Imp)", "Furtividade", "Garras", "Melhorar Atributo (Força)",
                    "Melhorar Atributo (Mente)", "Mercado Negro", f"{_PAL} (exitium)",
                    f"{_PAL} (ignis)", f"{_PAL} (majesto)", f"{_PAL} (pluribus)",
                    f"{_PAL} (saeculorum)"],
        granted=_g("Visão no Escuro (10m)", "Ancestralidade Infernal", "Caçada de Sangue"),
        img=IMG_HERANCA_DEF,
    ),
    definicao(
        "Psiônico", "heranca",
        "Mentes despertas capazes de moldar energia e dominar a própria vontade.\n\nCusto: 30 pontos de antecedentes. Restrições: Nenhuma. Corrupção: —.",
        skill_list=["Acrobacia", "Alerta", "Atletismo", "Carisma", "Conhecimento (Arcano)",
                    "Grito de Guerra", "Melhorar Atributo (Mente)", f"{_PAL} (augurado)",
                    f"{_PAL} (menso)", f"{_PAL} (sorcdiron)", f"{_PAL} (traumato)",
                    "Presença Aterradora", "Provocar", "Sentido Sísmico", "Sobrevivência",
                    "Vontade de Ferro"],
        granted=_g("Vontade de Diamante", "Moldar Energia", "Presença Ardente"),
        img=IMG_HERANCA_DEF,
    ),
]
