# -*- coding: utf-8 -*-
"""Habilidades — parte 3 (O–Z). Fonte: Livro de Regras, Sessão 9."""
from builders import habilidade, effect, cost, action, applies
from data_habilidades_1 import IMG

PALAVRAS_ARCANAS = [
    "sorcdiron", "carmo", "vitae", "iluzio", "augurado", "forjuri", "krucigon",
    "sangon", "kreo", "devena", "acida", "glacios", "ignis", "energio", "fulgur",
    "mortis", "noxia", "traumato", "lumo", "sonigu", "sankta", "tenebrae",
    "majesto", "exitium", "saeculorum", "pluribus", "menso", "inanis",
]

_PACTO_BASE = (
    "Você possui um pacto com um poderoso ser extraplanar. Você deve escolher o tipo de pacto "
    "quando compra essa habilidade e ele não poderá ser mudado no futuro. Pagando 1 ponto de vida "
    "em um ritual após um descanso, você recebe benefícios (1 por nível), de acordo com o tipo de "
    "extraplanar escolhido. Os benefícios duram até o seu próximo descanso. Habilidades concedidas "
    "pelo pacto não contam como requisitos para aprender outras habilidades ou Carreiras."
)
_PACTO_AVANCADO = (
    "Quando você escolhe uma habilidade da lista do pacto, você tem acesso a ela no nível "
    "Avançado. Pagando 2 pontos de vida durante o ritual, você recebe acesso a Palavra Arcana "
    "(majesto) [A] ou Palavra Arcana (exitium) [A]."
)

PACTOS = [
    ("Abissal",
     "Um pacto forjado com uma entidade do Abismo, demônios maiores, servos de Azrael e, em casos raros, até o próprio anjo caído. Este pacto aumentará sua Corrupção em 1 ponto a cada 10 dias, obrigatoriamente.",
     "Proteção Contra Necrótico (metade do Nível), Pele de Escamas, Presença Aterradora, Palavra Arcana (mortis), Palavra Arcana (noxia), Palavra Arcana (traumato), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
    ("Celestial",
     "Um pacto forjado com uma entidade de Solária, anjos poderosos, servos de Lohanost e, em casos raros, um de seus arcanjos. Este pacto diminuirá sua Corrupção em 1 ponto a cada 10 dias, obrigatoriamente.",
     "Proteção Contra Necrótico (metade do nível), Proteção Contra Fogo (metade do nível), Asas, Palavra Arcana (sankta), Palavra Arcana (lumo), Palavra Arcana (energio), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
    ("Elemental",
     "Um pacto forjado com uma entidade dos planos elementais, um elemental poderoso, filhos dos Primordiais e, em casos raros, uma de suas Calamidades.",
     "Proteção Contra Fogo (metade do Nível), Proteção Contra Frio (metade do Nível), Proteção Contra Raio (metade do Nível), Palavra Arcana (ignis), Palavra Arcana (glacios), Palavra Arcana (fulgur), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
    ("Faérian",
     "Um pacto forjado com uma entidade da Selva Faérian, espíritos da natureza, fadas poderosas e, em casos raros, até mesmo uma entidade faérian.",
     "Proteção Contra Veneno (metade do Nível), Proteção Contra Ácido (metade do Nível), Forma Animal, Palavra Arcana (devena), Palavra Arcana (noxia), Palavra Arcana (acida), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
    ("Infernal",
     "Um pacto forjado com uma entidade do Inferno, diabos poderosos, servos de Asmodeus e, em casos raros, até o próprio tirano. Este pacto aumentará sua Corrupção em 1 ponto a cada 10 dias, obrigatoriamente.",
     "Proteção Contra Fogo (metade do Nível), Asas, Garras, Palavra Arcana (ignis), Palavra Arcana (glacios), Palavra Arcana (acida), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
    ("Sombrio",
     "Um pacto forjado com uma entidade da Umbra, sombras poderosas, servos de Sigh e, em casos raros, até a própria dama da lua.",
     "Proteção Contra Necrótico (metade do Nível), Furtividade, Ameaça Invisível, Palavra Arcana (tenebrae), Palavra Arcana (mortis), Palavra Arcana (iluzio), Palavra Arcana (sangon), Palavra Arcana (krucigon) e Palavra Arcana (forjuri)."),
]

TIPOS_CRIATURA = [
    "Aberrações", "Feras", "Constructos", "Dragões", "Planares", "Fadas",
    "Gigantes", "Bestiais", "Plantas", "Mortos-vivos", "Insetos",
    "Humanoides (escolha uma raça)",
]

TERRENOS_TRILHADOR = [
    "Planícies", "Montanhas", "Colinas", "Florestas", "Pântanos", "Desertos",
    "Subterrâneos", "Glacial",
]

GRUPOS_ARMAS = [
    "Corpo a Corpo", "Artilharia", "Arremesso", "Uma Mão", "Duas Mãos",
    "Simples", "Militar", "Superior", "Haste", "Lâminas Pequenas",
    "Lâminas Grandes", "Lanças", "Arcos", "Bestas", "Machados", "Martelos",
    "Maças", "Bastões", "Chicotes", "Dardos", "Fundas", "Manguais",
    "Picaretas", "Armas de Fogo", "Desarmado", "Naturais", "Orientais",
]

SOPROS = [
    ("Fogo", "fogo"), ("Frio", "frio"), ("Raio", "raio"),
    ("Ácido", "acido"), ("Veneno", "veneno"),
]

VEICULOS = ["Aéreos", "Terrestres", "Marítimos", "Subterrâneos"]

HABILIDADES_3 = [
    habilidade(
        "Ofícios",
        "Anão das montanhas, anão das terras baixas, gnomos das rochas, humano, meio-elfo, pequenino, bardo, monge, clérigo (Aeon, Kovar, Pálim, Eurecca, Seníah e Ruff)",
        "Você recebe 1D em rolagens para identificar objetos (origem, propósito, material...). Você recebe uma quantidade diária adicional de Pontos Heróicos igual a metade do seu nível, que só podem ser gastos na criação de itens.",
        "Você recebe uma quantidade diária adicional de Pontos Heróicos para criação de itens igual ao seu nível (em vez de metade dele).",
        10, 30,
        img=IMG["pericia"],
    ),
    habilidade(
        "Operar Mecanismos",
        "Faen Oeste",
        "Quando você usa um equipamento mecânico, ele não possui chance de mau funcionamento. Adicionalmente, você recebe +1 em rolagens para ativar itens arcanomecânicos.",
        "Você recebe +2 em rolagens para ativar itens arcanomecânicos.",
        10, 30,
        img=IMG["pericia"],
    ),
    *[
        habilidade(
            f"Pacto ({nome})",
            "Bruxo",
            _PACTO_BASE + f"\n\nPatronos — {patronos}\n\nBenefícios — {beneficios}",
            _PACTO_AVANCADO,
            20, 40, prereq="Mente 4+",
            mode="active", activation="Ritual após descanso",
            costs=[cost("hp", 1, "Ritual do pacto (A: 2 PV p/ majesto/exitium)")],
            img=IMG["magia"],
        )
        for nome, patronos, beneficios in PACTOS
    ],
    *[
        habilidade(
            f"Palavra Arcana ({palavra})",
            "Alto elfo, elfo cinzento, elfo das profundezas, gnomo da floresta, gnomo das profundezas, celestial, draconiano, entrópico, infernal, bardo, druida, mago, monge, paladino e clérigo.",
            f"Você domina a palavra arcana {palavra}. Você é capaz de conjurar suas magias de círculo menor e pode criar novas magias compostas por ela.",
            f"Você recebe um bônus de +1 nas rolagens de Conjuração quando conjura magias compostas pela palavra arcana {palavra}. Você pode criar magias com metamagias avançadas e itens mágicos com propriedades da palavra arcana em questão.",
            10, 30,
            img=IMG["magia"],
        )
        for palavra in PALAVRAS_ARCANAS
    ],
    habilidade(
        "Pele de Escamas",
        "Draconiano",
        "Sua pele possui grossas escamas. Você recebe Proteção igual a metade do seu nível, contra corte, perfuração e concussão.",
        "Você pode gastar 1 ponto heróico para aumentar essa proteção em 1 ponto até o fim da cena, mas fica lento até o final do efeito.",
        20, 40,
        effects=[
            effect("rd", "all", 1, level="B", label="Pele de Escamas: RD corte (metade do Nível — ajuste)", damage_type="corte"),
            effect("rd", "all", 1, level="B", label="Pele de Escamas: RD perfuração (metade do Nível — ajuste)", damage_type="perfuracao"),
            effect("rd", "all", 1, level="B", label="Pele de Escamas: RD concussão (metade do Nível — ajuste)", damage_type="concussao"),
        ],
        img=IMG["corpo"],
    ),
    habilidade(
        "Predador Astuto",
        "Patrulheiro",
        "Escolha um inimigo que você possa ver durante seu turno de combate. Até o fim da cena, todos os ataques com arma que você fizer contra esse inimigo recebem os dados de melhoria que você tiver no atributo Percepção.",
        "Os ataques com arma que você fizer contra esse inimigo também recebem os dados de melhoria do atributo Mente.",
        20, 40, prereq="Percepção 4+",
        img=IMG["combate"],
    ),
    habilidade(
        "Preparação Arcana",
        "Mago",
        "Quando você realiza um descanso, você pode escolher uma quantidade de magias igual ao dobro do seu nível para serem suas magias preparadas. Quando você conjura uma magia preparada, você recebe 1D na rolagem de Conjuração para conjurá-la. Quando você realiza um descanso, pode redefinir sua lista de magias preparadas.",
        "Magias preparadas de Círculo Intermediário ou Maior custam 1 ponto a menos de magia para serem conjuradas.",
        20, 40,
        img=IMG["magia"],
    ),
    habilidade(
        "Precisão Arcana",
        "Sael",
        "Uma vez por rodada, você pode re-rolar um dado com resultado 1 em uma rolagem de Conjuração.",
        "Uma vez por rodada, você pode re-rolar até dois dados com resultado 2 ou menor em uma rolagem de Conjuração.",
        10, 30,
        effects=[effect("reroll1", "conjuracao", 1, level="B", label="Precisão Arcana: re-rola 1 dado (1) em Conjuração")],
        img=IMG["magia"],
    ),
    habilidade(
        "Prece de Repouso",
        "Clérigo, paladino",
        "Você realiza uma prece à sua divindade antes de realizar um descanso. Após feita a prece, você e seus aliados que aceitarem ouvir sua prece recuperam 1 ponto de vida adicional quando descansam.",
        "Você e seus aliados que aceitarem ouvir sua prece recuperam 3 pontos de vida adicionais (em vez de 1).",
        10, 30,
        img=IMG["social"],
    ),
    *[
        habilidade(
            f"Presa de Caça ({tipo})",
            "Patrulheiro",
            f"Você recebe 1D em rolagens de conhecimento, pesquisa, rastreio e investigação relacionadas a criaturas do tipo {tipo}. Adicionalmente, você recebe 1D em rolagens de ataque e defesa contra criaturas do tipo em questão.",
            "Seus golpes críticos contra criaturas do tipo em questão causam dano contínuo de sangramento (Vigor anula). Enquanto estiver sangrando, a criatura não recebe ocultação contra você e, caso você a atinja com um golpe com arma enquanto ela estiver sangrando, ela ficará lenta (Vigor anula). Um segundo acerto a deixará imobilizada (Vigor anula).",
            20, 40, prereq="Percepção 4+",
            img=IMG["fera"],
        )
        for tipo in TIPOS_CRIATURA
    ],
    habilidade(
        "Presas",
        "Draconiano",
        "Você desenvolveu presas que podem ser usadas como arma. Suas presas são consideradas uma arma natural, cujo ataque usa a Força e causam dano de Perfuração +Nível.",
        "Você pode gastar 1 ponto heróico quando causar dano a um alvo com suas presas para agarrar o alvo (Força anula). Enquanto o alvo estiver agarrado, ele sofre 1 ponto de dano final no começo do seu turno.",
        20, 40,
        activation="Ação (ataque)",
        actions=[action("Ataque de Presas (dano = Perfuração +Nível; ajuste o valor)",
                        roll_attr="forca", damage="1", damage_type="perfuracao",
                        defense_attr="esquiva", defense_attr2="bloqueio")],
        img=IMG["combate"],
    ),
    habilidade(
        "Presença Aterradora",
        "Draconiano, bárbaro, paladino, clérigo (Gobel, Umberham)",
        "Você pode gastar 1 ponto heróico para liberar uma aura com um alcance de 2m x Nível que dura até o fim da cena. Inimigos que entrarem ou iniciarem seus turnos na aura devem ser bem sucedidos em uma rolagem de Mente oposta a Mente ou ficarão abalados até o fim da cena (Mente anula).",
        "O alcance da aura é de 4m x seu nível.",
        20, 40,
        activation="Livre",
        actions=[action("Presença Aterradora (Mente vs Mente — Abalado)",
                        roll_attr="mente", target_mode="aura", area=4, defense_attr="mente",
                        cost_heroic=1,
                        persist_area=True, persist_rounds=0, persist_trigger="both",
                        persist_reroll_attack=False,
                        applies_effects=[applies("Abalado (Mente anula)", fx_type="condition",
                                                 fx_target="abalado", duration_mode="scene",
                                                 resist=True, resist_attr="mente")])],
        img=IMG["social"],
    ),
    habilidade(
        "Presença do Leão",
        "Leão Dourado",
        "Sempre que iniciar um combate, inimigos que possam vê-lo devem realizar uma rolagem de Mente oposta ao seu maior atributo primário. Se falharem, ficarão Pasmos até o fim da cena (Mente anula).",
        "Os inimigos ficam também Abalados. Adicionalmente, você é imune às condições Abalado e Enfeitiçado, e recebe 1D em rolagens de interação social.",
        10, 30,
        img=IMG["social"],
    ),
    habilidade(
        "Primeiro Aspecto",
        "Clérigo",
        "Escolha um aspecto relacionado à sua divindade. Você tem acesso à Magia Divina e ao Sentido Divino pertencentes a esse aspecto.",
        "Você tem acesso à Arma Divina do aspecto escolhido.",
        20, 40,
        img=IMG["social"],
    ),
    habilidade(
        "Proteção dos Espíritos",
        "Terras dos Vales",
        "Após um descanso, você pode realizar um ritual gastando uma cena, para se conectar aos espíritos ancestrais da natureza, para que eles lhe concedam uma proteção. Quando o fizer, você recebe Proteção igual à metade do seu nível contra todo o tipo de dano. Essa Proteção dura até o próximo descanso e cai em 1 ponto cada vez que ela anula qualquer dano sofrido por você.",
        "Você recebe Proteção igual ao seu nível, em vez de metade do nível.",
        10, 30,
        mode="active", activation="Ritual (uma cena)",
        img=IMG["magia"],
    ),
    habilidade(
        "Proteger",
        "Guardião e paladino",
        "Durante o seu turno, você pode escolher um aliado adjacente como seu protegido. Você só pode ter um protegido por vez. Você recebe metade do dano bruto sofrido pelo seu protegido enquanto ele estiver adjacente a você. Quando você finaliza seu turno sem estar adjacente ao personagem escolhido, ele deixa de ser seu protegido.",
        "Você sofre todo o dano causado ao seu protegido (em vez de apenas metade). Não há limite para o número de protegidos que você pode manter.",
        20, 40,
        img=IMG["combate"],
    ),
    habilidade(
        "Provocar",
        "Guardião",
        "Você faz uma rolagem de Mente e usa sua ação rápida para gritar algo para seus inimigos que possam ouvir. Eles devem ser bem sucedidos em uma rolagem de Percepção oposta à sua Mente, ou serão compelidos a escolher você como alvo de seus ataques até o fim da cena (Percepção anula).",
        "Você recebe um bônus para essa rolagem de Mente igual a metade do seu nível (arredondado para cima).",
        20, 40,
        activation="Ação rápida",
        actions=[action("Provocar (Mente vs Percepção)",
                        roll_attr="mente", target_mode="aura", area=20,
                        defense_attr="percepcao")],
        img=IMG["social"],
    ),
    habilidade(
        "Punição",
        "Celestial e Paladino",
        "Quando você acerta uma criatura com um ataque corpo a corpo, você pode gastar pontos de magia para causar dano final adicional a ela. A cada 2 pontos de magia gastos, você causa 1 ponto de dano final adicional (limite de 6 de dano).",
        "A cada ponto de magia gasto, você causa 1 ponto de dano final adicional (limite de 6 de dano).",
        20, 40,
        img=IMG["combate"],
    ),
    habilidade(
        "Reação Furiosa",
        "Bárbaro",
        "Até o final da cena, você recebe um bônus igual a metade do seu nível nas rolagens de ataque com armas corpo a corpo e armas de arremesso, contra criaturas que causarem dano a você.",
        "Um ataque que receba esse bônus possui margem de crítico 11-12 enquanto você estiver ferido, ou 10-12 caso você esteja com uma quantidade de pontos de vida atual menor ou igual ao seu nível.",
        20, 40, prereq="Força 4+",
        img=IMG["combate"],
    ),
    habilidade(
        "Recarga Rápida",
        "Patrulheiro",
        "Você pode recarregar uma arma de Recarga usando uma ação rápida (em vez do seu movimento).",
        "Você pode recarregar uma arma de Recarga usando uma ação livre (em vez do seu movimento).",
        10, 30,
        img=IMG["combate"],
    ),
    habilidade(
        "Recuperar o Fôlego",
        "Meio-orc, orc, guardião e guerreiro",
        "Quando você gastar um ponto heróico para recuperar pontos de vida igual ao seu nível, some 3 pontos a esse valor.",
        "Quando você gastar um ponto heróico para recuperar pontos de vida igual ao seu nível, some 5 pontos a esse valor (em vez de 3). Adicionalmente, você recebe um bônus igual a metade do seu nível em rolagens para resistir e anular condições de Inconsciente e Morrendo.",
        20, 40, prereq="Vigor 4+",
        img=IMG["corpo"],
    ),
    habilidade(
        "Recursos",
        "Terras Centrais, Faen Leste, astrólogo, bardo, bruxo, clérigo, mago, paladino.",
        "Você pertence à nobreza ou a uma família muito rica. No começo de cada aventura, você pode rolar nas tabelas de tesouros para determinar um item de nível de raridade igual ao seu nível. Você pode escolher ficar com o item ou com um terço de seu valor em ouro.",
        "Você pode rolar em tabelas de nível de raridade igual ao dobro do seu nível. Você pode ficar com o item ou com metade do seu valor em ouro.",
        10, 30,
        img=IMG["social"],
    ),
    habilidade(
        "Reflexos",
        "Pequenino, bárbaro, ladino e monge",
        "Quando você é bem sucedido em uma rolagem de Esquiva, você pode usar sua reação para mover-se metade do seu Deslocamento.",
        "Quando você se desloca usando essa habilidade, você não pode ser alvo de reações de ataque. Quando você falha numa rolagem de Esquiva, você pode gastar 1 ponto heróico para mudar sua rolagem para um 12 natural.",
        20, 40,
        activation="Reação",
        img=IMG["corpo"],
    ),
    habilidade(
        "Saque Rápido",
        "Guerreiro, ladino e patrulheiro",
        "Você troca de arma gastando seu movimento (em vez da sua ação). Você recebe +2 nas rolagens de Iniciativa.",
        "Você troca de arma gastando uma ação rápida em vez de uma ação. Você recebe +4 nas rolagens de Iniciativa (em vez de +2).",
        10, 30,
        effects=[
            effect("bonus", "iniciativa", 2, level="B", label="Saque Rápido B: +2 Iniciativa"),
            effect("bonus", "iniciativa", 2, level="A", label="Saque Rápido A: +2 Iniciativa (total +4)"),
        ],
        img=IMG["combate"],
    ),
    habilidade(
        "Segundo Aspecto",
        "Clérigo",
        "Escolha um segundo aspecto relacionado à sua divindade. Você tem acesso à Magia Divina e ao Sentido Divino pertencentes a esse aspecto.",
        "Você tem acesso à Arma Divina do aspecto escolhido.",
        20, 40, prereq="Primeiro Aspecto [B]",
        img=IMG["social"],
    ),
    habilidade(
        "Sem Brechas",
        "Bárbaro, ladino e monge",
        "Você pode gastar 1 ponto heróico para anular todos os dados de melhoria de uma rolagem de ataque feita contra você. Você deve declarar o uso dessa habilidade antes que o atacante role os dados.",
        "Você pode adicionar uma quantidade de dados de melhoria igual à quantidade de dados anulados à sua rolagem de defesa contra esse ataque.",
        10, 30,
        img=IMG["combate"],
    ),
    habilidade(
        "Senso Lógico",
        "Rúffio",
        "Você recebe 1D em rolagens de pesquisa, rastreio, procurar objetos, compartimentos, armadilhas escondidas, comida, abrigo e identificar objetos. Adicionalmente, você recebe 1 ponto de Proteção contra dano psíquico e +1 em rolagens de defesa contra reações de ataque.",
        "Você recebe 2D nas rolagens, em vez de 1D, 2 pontos de Proteção contra dano psíquico e +2 em rolagens de defesa contra reações de ataque.",
        10, 30,
        effects=[
            effect("rd", "all", 1, level="B", label="Senso Lógico B: RD 1 psíquico", damage_type="psiquico"),
            effect("rd", "all", 1, level="A", label="Senso Lógico A: +1 RD psíquico (total 2)", damage_type="psiquico"),
        ],
        img=IMG["pericia"],
    ),
    habilidade(
        "Sentido Sísmico",
        "Guardião e guerreiro",
        "Quando você está em contato com o solo, você sabe a localização exata de qualquer criatura tocando o solo em um raio de metros igual ao dobro da sua Percepção.",
        "O raio de alcance dessa habilidade, em metros, é igual ao triplo da Percepção (em vez do dobro). Você sabe também o tipo e o tamanho das criaturas.",
        10, 30,
        img=IMG["pericia"],
    ),
    habilidade(
        "Sobrevivência",
        "Elfo da floresta, gnomo da floresta, humano, meio-orc, bárbaro, bardo, druida, guerreiro, patrulheiro, clérigo (Uru-haau).",
        "Você recebe 1D em rolagens de atividades em lugares selvagens (encontrar comida, encontrar abrigo, rastreio...).",
        "Você recebe 1D para rolagens de ataque contra Feras. Se tiver a habilidade Companheiro Animal, você pode ter uma criatura com o traço Companheiro Animal com Desafio um ponto acima do seu nível.",
        10, 30,
        img=IMG["fera"],
    ),
    *[
        habilidade(
            f"Sopro de Dragão ({elem})",
            "Draconiano",
            f"Você pode gastar pontos de magia para fazer um sopro que cause dano a todas as criaturas numa área de raio igual à quantidade de pontos de magia gastos. Essa área deve estar dentro de um alcance igual ao dobro do seu Vigor em metros. O ataque do sopro é uma rolagem de Vigor. O dano base é igual a metade do seu nível. O tipo de dano é {elem}.",
            f"Criaturas que sofrerem dano do sopro devem ser bem sucedidas em uma rolagem de Vigor oposta a Vigor, ou sofrerão dano contínuo de {elem.lower()} (Vigor anula).",
            20, 40,
            activation="Ação",
            actions=[action(
                f"Sopro de Dragão — {elem} (dano = metade do Nível; área = PM gastos)",
                roll_attr="vigor", target_mode="area", area=1, rng=8,
                damage="1", damage_type=dtipo, cost_mp=1,
                defense_attr="esquiva", defense_attr2="bloqueio",
                applies_effects=[applies(f"Dano contínuo de {elem.lower()} (Vigor anula) — nível A",
                                         fx_type="condition", fx_target="dano_continuo",
                                         duration_mode="scene", resist=True, resist_attr="vigor",
                                         tick_amount=1, tick_type=dtipo)],
            )],
            img=IMG["combate"],
        )
        for elem, dtipo in SOPROS
    ],
    habilidade(
        "Táticas de Grupo",
        "Ceifera",
        "Enquanto você estiver adjacente a um ou mais aliados, você e esses aliados recebem um bônus acumulativo de +1 nas rolagens de defesa. Esses aliados precisam poder vê-lo e ouvi-lo para receber esse bônus.",
        "Enquanto você estiver adjacente a um ou mais aliados, você e esses aliados recebem um bônus acumulativo de +1 nas rolagens de ataque. Esses aliados precisam poder vê-lo e ouvi-lo para receber esse bônus.",
        10, 30,
        img=IMG["combate"],
    ),
    habilidade(
        "Tenacidade Assustadora",
        "Ceifera",
        "Você recebe 1D em intimidação. Adicionalmente, sempre que você sofrer dano, você pode gastar 1 ponto de magia para receber um bônus acumulativo +1 nas rolagens de bloqueio, esquiva, ataques ou conjuração. Você pode usar sua ação para converter esse bônus em sobrevida.",
        "Quando você converte esse bônus em sobrevida, você recebe o dobro do bônus em sobrevida. Você pode converter o bônus em sobrevida usando seu movimento.",
        10, 30,
        img=IMG["corpo"],
    ),
    *[
        habilidade(
            f"Trilhador ({terreno})",
            "Anão das montanhas, elfo da floresta, elfo das profundezas, gnomo da floresta, gnomo das profundezas, druida, patrulheiro.",
            f"Você se movimenta através de terreno difícil sem sofrer penalidades, quando se movimenta no terreno em questão ({terreno.lower()}). Seu Deslocamento aumenta em uma quantidade de metros igual a metade do seu nível, quando se desloca no tipo de terreno escolhido.",
            "Enquanto estiver lutando no tipo de terreno em questão, você pode desengajar de combate corpo a corpo sem sofrer reações de ataque. Seu Deslocamento aumenta em uma quantidade de metros igual ao seu nível, quando se desloca no tipo de terreno escolhido (em vez de metade).",
            10, 30,
            img=IMG["fera"],
        )
        for terreno in TERRENOS_TRILHADOR
    ],
    habilidade(
        "Usar Armaduras Leves",
        "Anão das montanhas, bárbaro, bardo, bruxo, clérigo, druida, guerreiro, ladino, paladino e patrulheiro.",
        "Enquanto você estiver vestindo uma armadura leve, sua penalidade e peso são reduzidos em 1 ponto.",
        "Quando você usa uma armadura leve, sua penalidade e peso são reduzidos em 2 pontos (em vez de 1).",
        10, 30,
        img=IMG["combate"],
    ),
    *[
        habilidade(
            f"Usar Armas ({grupo})",
            "Anão das montanhas, anão das terras baixas, alto elfo, elfo cinzento, elfo solar, elfo da floresta, elfo das profundezas, pequenino, bárbaro, bardo, bruxo, clérigo, druida, guardião, guerreiro, ladino, mago, monge, paladino e patrulheiro.",
            f"Você recebe um bônus acumulativo de +1 nas rolagens de ataque feitas com armas do grupo {grupo}. Você também pode gastar 1 ponto heróico para realizar uma manobra de combate dependendo do sub-grupo desta habilidade.",
            "Seus resultados naturais 11-12 são considerados críticos.",
            10, 30,
            img=IMG["combate"],
        )
        for grupo in GRUPOS_ARMAS
    ],
    habilidade(
        "Usar Escudos",
        "Bárbaro, guardião, guerreiro e paladino.",
        "Você acerta uma Deflexão em uma rolagem de Bloqueio quando seus dados resultam em números consecutivos também. Adicionalmente, sua deflexão reduz 2 pontos de dano bruto, em vez de 1.",
        "Suas Deflexões reduzem 3 pontos de dano (em vez de 1).",
        10, 30,
        img=IMG["combate"],
    ),
    *[
        habilidade(
            f"Veículos ({tipo})",
            "Gnomo das rochas, bardo, guardião e guerreiro.",
            f"Você recebe 1D para conduzir veículos do tipo {tipo}. Você não sofre penalidades para atacar ou defender enquanto conduz um veículo do tipo em questão.",
            "Você pode gastar 1 ponto heróico para fazer uma manobra arriscada de condução, pilotando o veículo do tipo em questão. Adicionalmente, você recebe 1D em rolagens para atropelar criaturas, usando o veículo em questão.",
            10, 30,
            img=IMG["pericia"],
        )
        for tipo in VEICULOS
    ],
    habilidade(
        "Velocidade de Ataque",
        "Bárbaro, guerreiro, monge e patrulheiro.",
        "Quando você faz ataques múltiplos, a penalidade nos ataques é de -3 em vez de -4.",
        "Quando você faz ataques múltiplos, a penalidade nos ataques é de -2 em vez de -4.",
        20, 40, prereq="Agilidade 4+",
        img=IMG["combate"],
    ),
    habilidade(
        "Vigor de Aço",
        "Anão das terras baixas, anão das montanhas, meio-orc, orc, bárbaro, guardião, monge e paladino.",
        "Você tem 3 pontos de vida adicionais.",
        "Você tem 5 pontos de vida adicionais (em vez de 3).",
        20, 40,
        effects=[
            effect("stat", "hp", 3, level="B", label="Vigor de Aço B: +3 PV"),
            effect("stat", "hp", 2, level="A", label="Vigor de Aço A: +2 PV (total +5)"),
        ],
        img=IMG["corpo"],
    ),
    habilidade(
        "Vontade de Ferro",
        "Elfo solar, anão das terras baixas, bruxo, monge, paladino, clérigo",
        "Você recebe 1D em rolagens para resistir e anular as condições Abalado, Dominado, Enfeitiçado, Atordoado, Pasmo ou Dano Contínuo Psíquico.",
        "Você recebe um bônus igual a metade do seu nível em rolagens para resistir e anular as condições Abalado, Dominado, Enfeitiçado, Atordoado, Pasmo ou Dano Contínuo Psíquico.",
        10, 30,
        img=IMG["corpo"],
    ),
    habilidade(
        "Zona de Ameaça",
        "Guardião",
        "Você pode usar sua reação para realizar um ataque com arma corpo a corpo contra uma criatura adjacente que tente desengajar, conjurar magia ou realizar um ataque que não inclua você como alvo. Sua ação é feita antes da ação da criatura em questão. Se seu ataque causar dano, a ação ou movimento da criatura são cancelados.",
        "Você pode usar essa habilidade como uma ação livre, em vez de uma rápida. Desta forma, não há limite para quantas vezes ela pode ser usada por rodada. Uma criatura que sofra dano de um de seus ataques engatilhados por essa habilidade fica indefesa.",
        20, 40, prereq="Vigor 4+",
        activation="Reação",
        img=IMG["combate"],
    ),
]
