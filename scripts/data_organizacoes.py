# -*- coding: utf-8 -*-
"""Organizações — as Nações de Ligeia (Sessão 7). Cada organização traz a
lista de Habilidades Regionais da nação."""
from builders import definicao

IMG_ORG = "icons/svg/castle.svg"


def _org(nome, desc, skills):
    return definicao(nome, "organizacao", desc, skill_list=skills, img=IMG_ORG)


ORGANIZACOES = [
    _org("Terras Centrais",
         "O povo das terras centrais é o mais abrangente racialmente. Essa relação entre as raças aprimorou as habilidades interpessoais da nação Otherana ao longo dos anos. São uma nação rica e muito perseverante, tendo resistido até mesmo ao Ataque de Lennor.",
         ["Carisma", "Recursos", "Usar Armas (Haste)", "Usar Armas (Lâminas Grandes)",
          "Bastião de Esperança"]),
    _org("Leão Dourado",
         "Um reino teocrático, com uma educação rígida e com uma poderosa ordem de cavalaria. Seu povo possui uma altivez e uma presença tremenda.",
         ["Conhecimento (Religião)", "Etiqueta", "Montar Criatura",
          "Usar Armas (Lâminas Grandes)", "Presença do Leão"]),
    _org("Ceifera",
         "Uma nação forte e brutal. Um povo extremamente militarizado e de um vigor que assusta qualquer estrangeiro.",
         ["Conhecimento (Guerra)", "Usar Armas (Machados)", "Usar Armas (Manguais)",
          "Usar Armas (Lanças)", "Tenacidade Assustadora"]),
    _org("Sei Yang",
         "Uma nação situada no oriente, cujo povo se devota aos espíritos ancestrais da natureza que regem cada clã. Possuem um senso moral e ético muito forte.\n\nHabilidades Regionais de acordo com o Clã — Ohitsuji (Carneiro): Usar Armas (Lâminas Grandes) / Espírito Guardião (Carneiro); Washi (Águia): Arcos / Águia; Kuma (Urso): Duas Mãos / Urso; Kame (Tartaruga): Martelos / Tartaruga; Uma (Cavalo): Correntes / Cavalo; Hebi (Serpente): Lâminas Pequenas / Serpente; Ookami (Lobo): Lâminas Pequenas / Lobo; Osuushi (Touro): Machados / Búfalo; Koi (Carpa): Lanças / Carpa; Saru (Macaco): Desarmado / Macaco; Shika (Cervo): Haste / Cervo; Shishi (Leão): Lâminas Grandes / Leão; Sasori (Escorpião): Arremesso / Serpente; Ryu (Dragão): Uma Mão / Lobo; Tora (Tigre): Uma Mão / Leão; Karasu (Corvo): Corpo a Corpo / Águia.",
         ["Espírito Guardião (Único, depende do Clã)", "Usar Armas (Único, depende do Clã)",
          "Conhecimento (História)", "Medicina", "Morte Antes da Desonra"]),
    _org("Faen Oeste",
         "A nação de Faen Oeste é extremamente acostumada a lidar com os objetos mecânicos e arcanomecânicos produzidos em sua capital, Grandía.",
         ["Conhecimento (Arcano)", "Ofícios", "Usar Armas (Bestas)", "Veículos (Qualquer)",
          "Operar Mecanismos"]),
    _org("Faen Leste",
         "A nação de Faen Leste possui uma tremenda influência e habilidade de falar em público. Tendo uma habilidade natural para o comércio e para a diplomacia.",
         ["Mercado Negro", "Ofícios", "Usar Armas (Lâminas Pequenas)", "Recursos",
          "Lábia Natural"]),
    _org("Dunas do Norte",
         "O povo do deserto é um dos povos mais resistentes que existe em Ligeia, sobrevivendo a ameaças do deserto, como fome, sede, calor intenso, orcs das ruínas de Baruk e outras criaturas ainda piores, como os vermes púrpura. Devido à escassez em recursos minerais, eles quase não possuem acesso a armas de metal, acabando por se tornarem bons com armas como chicotes e clavas.",
         ["Explorador (Desertos)", "Sobrevivência", "Usar Armas (Chicotes)",
          "Usar Armas (Maças)", "Força Repentina"]),
    _org("Terras dos Vales",
         "O povo do vale é composto por humanos de uma linhagem muito antiga e extremamente ligada à natureza e seus espíritos ancestrais. Eles são grandes conhecedores da fauna, da flora e do herbalismo.",
         ["Conhecimento (Natureza)", "Espírito Guardião (Único)", "Medicina",
          "Usar Armas (Dardos)", "Proteção dos Espíritos"]),
    _org("Casa Norn",
         "O povo norniano sofreu muitas perdas nos últimos anos, sendo assolados por maldições, pragas e fome. Sem nenhum amparo, devido à perda recente de seu regente, eles tiveram que sobreviver e se reerguer sozinhos.",
         ["Conhecimento (Ocultismo)", "Medicina", "Usar Armas (Haste)",
          "Usar Armas (Lâminas Grandes)", "Marca da Mácula"]),
    _org("Sael",
         "O povo saelar é um povo estudioso e com extremo interesse nas artes arcanas. Seus filhos são ensinados a dominar a magia desde crianças. A única arma que aprendem a usar são os bastões, que também são muitas vezes usados como foco arcano, na conjuração de suas magias. Os saelares são tão precisos e metódicos em suas conjurações, que dificilmente falham em executá-las.",
         ["Conhecimento (Arcano)", "Conhecimento (Ocultismo)", "Palavra Arcana (Único)",
          "Usar Armas (Bastões)", "Precisão Arcana"]),
    _org("Rúffio",
         "Os ruffianos são um povo pacífico e que aprecia o conforto de seus lares e a vida no campo. Eles adoram lidar com os animais e os ofícios mais comuns. No entanto, a característica mais impressionante entre eles é a sua incrível habilidade de resolver situações complicadas e enigmáticas.",
         ["Conhecimento (História)", "Lidar com Animais", "Ofícios", "Usar Armas (Simples)",
          "Senso Lógico"]),
    _org("Jardins de Inverno",
         "Nação de povo estudioso e engenhoso, cujas habilidades regionais refletem sua inventividade.",
         ["Conhecimento (Qualquer)", "Ofícios", "Usar Armas (Arcos)", "Usar Armas (Lanças)",
          "Espírito Inovador"]),
    _org("Durathor",
         "A nação de Durathor é uma nação acostumada a viver nas montanhas e em seus subterrâneos, trabalhando das minas repletas de riquezas minerais, ao tilintar do martelo das forjas e das picaretas a escavar. O trabalho árduo enrijeceu o povo das montanhas e os deixou duros como pedra.",
         ["Explorador (Montanhas)", "Ofícios", "Usar Armas (Martelos)",
          "Usar Armas (Picaretas)", "Implacável"]),
    _org("Terras de Beoven",
         "A nação aisengardiana possui o sangue dos primeiros homens do sul de Ligeia. São um povo abençoado por Iperon, o Deus da Força, e de onde descendem a maior parte dos humanos das Terras Centrais. Eles ainda carregam costumes bárbaros e são muito resistentes ao clima gelado do sul.",
         ["Explorador (Glacial)", "Sobrevivência", "Usar Armas (Arremesso)",
          "Usar Armas (Machados)", "Ferocidade Primitiva"]),
]
