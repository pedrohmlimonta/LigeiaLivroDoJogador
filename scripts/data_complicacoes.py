# -*- coding: utf-8 -*-
"""Complicações — fonte: Avulso 09 (Complicações), Dinho Reis, Playtest v0.1.

XP concedido vai direto em xpBasic. Sub-grupos expandidos: Efeito Colateral
(uma por palavra arcana) e Insanidade (uma por tipo). Efeitos mecânicos
mapeáveis já configurados (reroll6 com rerollAll; demais como "info")."""
from builders import complicacao, effect

IMG_COMP = "icons/svg/downgrade.svg"

_REGRA = ("\n\nRegra: cada jogador pode escolher apenas uma complicação, durante a criação do "
          "personagem. Para se livrar dela: pague pontos de experiência iguais aos pontos de "
          "antecedentes concedidos, ou cumpra uma missão específica para isso (Avulso 09).")


def _c(nome, xp, flavor, efeito, effects=None, prereq="", lists=""):
    return complicacao(
        nome, lists,
        flavor + "\n\n" + efeito + _REGRA,
        "", xp_b=xp, prereq=prereq,
        effects=effects or [], img=IMG_COMP,
    )


_SEM_MELHORIA = "não pode rolar dados de melhoria nas mesmas (aplique manualmente na rolagem)"

COMPLICACOES = [
    # ------------------------- Avulsas (12) -----------------------------
    _c("Cegueira", 20,
       "Você nasceu cego ou sofreu algo que o deixou cego. Seja lá qual for, você deve sobreviver apenas com os outros sentidos.",
       "Você está constantemente sob a condição Cego.",
       effects=[effect("info", "all", 0, label="Constantemente sob a condição Cego")]),
    _c("Débil", 20,
       "Sua concentração e capacidade de raciocínio são fracos. Você sente dificuldade de manter-se focado em tarefas que exijam o uso da mente.",
       "Você re-rola quaisquer resultados \"6\" nos dados de rolagens de Mente obrigatoriamente e não pode rolar dados de melhoria nas mesmas.",
       effects=[effect("reroll6", "mente", 1, label="Débil: re-rola todos os 6 em Mente", reroll_all=True),
                effect("info", "mente", 0, label=f"Débil: {_SEM_MELHORIA}")]),
    _c("Deformação", 10,
       "Você nasceu com alguma deformação física grotesca ou ficou assim em alguma catástrofe durante a sua vida. As pessoas tendem a evitá-lo por medo, nojo ou os dois.",
       "Você recebe -3 em rolagens de interação social.",
       effects=[effect("info", "all", 0, label="Deformação: -3 em interação social")]),
    _c("Desajeitado", 20,
       "Não importa o quão rápido você seja. Você está sempre esbarrando em algo, caindo e derrubando coisas. Um arco em suas mãos pode ser perigoso para seus aliados.",
       "Você re-rola quaisquer resultados \"6\" nos dados de rolagens de Agilidade obrigatoriamente e não pode rolar dados de melhoria nas mesmas.",
       effects=[effect("reroll6", "agilidade", 1, label="Desajeitado: re-rola todos os 6 em Agilidade", reroll_all=True),
                effect("info", "agilidade", 0, label=f"Desajeitado: {_SEM_MELHORIA}")]),
    _c("Distraído", 20,
       "Você possui dificuldade em prestar atenção aos seus arredores, além de demonstrar uma ingenuidade além do normal.",
       "Você re-rola quaisquer resultados \"6\" nos dados de rolagens de Percepção obrigatoriamente e não pode rolar dados de melhoria nas mesmas.",
       effects=[effect("reroll6", "percepcao", 1, label="Distraído: re-rola todos os 6 em Percepção", reroll_all=True),
                effect("info", "percepcao", 0, label=f"Distraído: {_SEM_MELHORIA}")]),
    _c("Doença Grave", 20,
       "Você possui uma doença grave, algo que torna seu organismo extremamente frágil. Doenças, venenos e quaisquer danos ao seu corpo poderiam matá-lo mais facilmente.",
       "Você re-rola quaisquer resultados \"6\" nos dados de rolagens de Vigor obrigatoriamente e não pode rolar dados de melhoria nas mesmas.",
       effects=[effect("reroll6", "vigor", 1, label="Doença Grave: re-rola todos os 6 em Vigor", reroll_all=True),
                effect("info", "vigor", 0, label=f"Doença Grave: {_SEM_MELHORIA}")]),
    _c("Fraco", 20,
       "Força física não é bem o seu forte, independente do seu porte. Você tem dificuldade com feitos de força, seus braços ou pernas tremem mediante o esforço.",
       "Você re-rola quaisquer resultados \"6\" nos dados de rolagens de Força obrigatoriamente e não pode rolar dados de melhoria nas mesmas.",
       effects=[effect("reroll6", "forca", 1, label="Fraco: re-rola todos os 6 em Força", reroll_all=True),
                effect("info", "forca", 0, label=f"Fraco: {_SEM_MELHORIA}")]),
    _c("Honestidade", 10,
       "Você é incapaz de trapacear ou mentir, dizendo a verdade mesmo que isso possa colocar em risco a sua vida e a de seus companheiros.",
       "Você é incapaz de roubar, trapacear, mentir ou desobedecer leis locais, e tentará impedir que seus companheiros os façam. Caso você não seja capaz de impedir que um companheiro seu o faça, você perderá 1 ponto heróico.",
       effects=[effect("info", "all", 0, label="Honestidade: não mente/trapaceia; falhar em impedir aliados custa 1 PH")]),
    _c("Mudo", 10,
       "Você nasceu sem o dom da fala ou ficou mudo devido a alguma calamidade ocorrida a você. Logo, você é incapaz de conjurar magias e se comunicar verbalmente.",
       "Você não consegue se comunicar através da fala e não pode suprir o componente verbal para conjurar magias. Você recebe -2 em rolagens de interação social.",
       effects=[effect("info", "all", 0, label="Mudo: sem componente verbal; -2 em interação social")]),
    _c("Pacifista", 10,
       "Você se nega a ferir qualquer tipo de criatura, evitando combates e batalhas, mesmo sabendo que isso pode ser prejudicial para o seu grupo.",
       "Você não pode fazer qualquer ação que cause dano a inimigos. Quando você sofre dano causado por um inimigo, você deve ser bem sucedido em uma rolagem de Mente cuja dificuldade é igual a 10 + o dano sofrido para se manter pacífico. Caso você falhe, você perde 1 ponto heróico e pode atacar inimigos normalmente.",
       effects=[effect("info", "all", 0, label="Pacifista: não causa dano; Mente (10 + dano sofrido) para se manter pacífico")]),
    _c("Ponto Fraco", 10,
       "Você possui um ponto fraco em seu corpo. Em combate, os inimigos que sabem disso podem tirar vantagem para derrotá-lo mais facilmente.",
       "Sempre que você sofrer dano de um ataque, role um dado. Se o resultado for 3 ou menos, o inimigo acertou no seu ponto fraco e tem ciência disso. Você é considerado indefeso para todos os ataques dele permanentemente.",
       effects=[effect("info", "all", 0, label="Ponto Fraco: ao sofrer dano, role 1d6; 3- = indefeso contra esse inimigo")]),
    _c("Surdo", 10,
       "Você não possui nenhuma capacidade auditiva, logo não consegue ouvir sons, prejudicando a comunicação com as pessoas à sua volta e a sua percepção dos arredores.",
       "Você falha automaticamente em notar aproximação de criaturas e recebe -2 em rolagens de interação social.",
       effects=[effect("info", "all", 0, label="Surdo: falha automática em notar aproximação; -2 em interação social")]),
]

# ------------------- Efeito Colateral (28 palavras) ---------------------
_EC_FLAVOR = ("Quando você conjura magias compostas por uma determinada palavra arcana, "
              "ela sempre foge ao seu controle e produz um efeito prejudicial a você e/ou "
              "pessoas próximas.")

EFEITOS_COLATERAIS = {
    "acida": ("Queimadura Ácida", "Você sofre 1 ponto de dano final de ácido."),
    "augurado": ("Surto de Visões", "Você fica pasmo até o fim da cena (Mente anula)."),
    "carmo": ("Nariz Sangrando", "Você força demais a sua mente e perde 1 PV."),
    "devena": ("Enxame de Insetos", "Você invoca um enxame de insetos que ataca aleatoriamente 3 personagens da cena, causando 1 ponto de dano final de veneno, e se dispersa em seguida."),
    "energio": ("Explosão de Mana", "Você e todas as criaturas adjacentes sofrem 1 ponto de dano final de energia."),
    "exitium": ("Destruição e Estilhaços", "Um objeto não mágico dentre os seus pertences é destruído e você sofre 1 ponto de dano final de perfuração."),
    "forjuri": ("Aprisionar-se", "Você fica paralisado até o fim da cena (Vigor anula)."),
    "fulgur": ("Raio", "Um raio cai sobre você ou um aliado aleatoriamente, causando 1 ponto de dano final de raio."),
    "glacios": ("Congelar os Nervos", "Você fica lento até o fim da cena (Força anula)."),
    "ignis": ("Queimadura Ígnea", "Você sofre 1 ponto de dano final de fogo."),
    "iluzio": ("Vertigem", "Você fica pasmo até o fim da cena (Vigor anula)."),
    "inanis": ("Queimar por Dentro", "Você perde 1 ponto adicional de magia."),
    "kreo": ("Imperfeição", "O objeto criado é imperfeito e rolagens em seu uso recebem -2."),
    "krucigon": ("Vórtice Caótico", "Você é teleportado para o ar (10m de altura) ou adjacente a um inimigo (à escolha do narrador)."),
    "lumo": ("Lampejo", "Um brilho intenso te deixa pasmo até o fim da cena (Percepção anula)."),
    "majesto": ("Objeto Aumentado", "Um objeto seu tem seu tamanho aumentado até o ponto de não ser possível carregá-lo (à escolha do narrador)."),
    "menso": ("Poltergeist", "Um objeto da cena voa e atinge você ou um aliado aleatoriamente, causando 1 ponto de dano final de concussão."),
    "mortis": ("Apodrecer", "Algum ponto do seu corpo necrosa e você recebe 1 ponto de dano final necrótico permanente (Curar anula)."),
    "noxia": ("Envenenado", "Você fica enfraquecido até o fim da cena (Vigor anula)."),
    "pluribus": ("Déjà vu", "Um inimigo aleatório da cena recebe um turno adicional."),
    "saeculorum": ("Deslocamento Temporal", "Você fica lento até o fim da cena (Não anula)."),
    "sangon": ("Deformidade", "Você deforma parte do seu corpo recebendo -2 acumulativo em rolagens de interação social permanentemente (Restaurar anula)."),
    "sankta": ("Rejeição", "Você sofre 1 ponto de dano final radiante."),
    "sonigu": ("Explosão Sônica", "Você e todas as criaturas adjacentes ficam surdas até o fim da cena (Percepção anula)."),
    "sorcdiron": ("Reversão", "Você sofre -2 em todas as rolagens até o fim da cena (Mente anula)."),
    "tenebrae": ("Olhos Sem Vida", "Você fica cego até o fim da cena (Percepção anula)."),
    "traumato": ("Transe do Pesadelo", "Você fica atordoado até o fim da cena (Mente anula)."),
    "vitae": ("Sacrifício Involuntário", "Você perde 1 ponto de vida."),
}

COMPLICACOES += [
    _c(f"Efeito Colateral ({palavra})", 10,
       _EC_FLAVOR,
       f"Quando você conjura magias compostas pela palavra arcana {palavra} e o resultado da "
       f"Conjuração é 12 ou menor, a magia produz um efeito colateral, independente dela "
       f"funcionar ou não.\n\nEfeito Colateral — {nome_ef}: {texto_ef}",
       prereq=f"Palavra Arcana ({palavra})", lists="Palavra Arcana",
       effects=[effect("info", "all", 0,
                       label=f"Conjuração ≤ 12 com {palavra}: {nome_ef}")])
    for palavra, (nome_ef, texto_ef) in EFEITOS_COLATERAIS.items()
]

# ----------------------- Insanidade (10 tipos) --------------------------
_INS_FLAVOR = ("Você possui algum tipo de insanidade, o que faz com que algumas pessoas não "
               "acreditem em coisas que você diz ou mesmo tenham dificuldades em confiar em você.")

INSANIDADES = {
    "Cleptomania": "Você precisa ser bem sucedido em cada cena para não roubar algum objeto de alguém (até mesmo dos seus aliados).",
    "Compulsividade": "Defina algum tipo de ação pela qual seu personagem sinta compulsão em fazer (algo que atrapalhe um combate, por exemplo). Você precisa ser bem sucedido em cada cena para não satisfazer sua compulsão.",
    "Fobia": "Escolha um tipo de criatura ou uma raça de humanoide. Seu personagem deve ser bem sucedido em uma rolagem de Mente sempre que fizer contato visual com uma criatura desse tipo ou ficará abalado até o fim da cena (Mente anula).",
    "Homicídio": "Uma vez por dia, o narrador pode exigir de você uma rolagem de Mente (Difícil). Se você não for bem sucedido nesta rolagem, você irá forçar-se em matar alguém. Você não recupera pontos heróicos enquanto não o fizer.",
    "Masoquismo": "Sempre que você passar um dia inteiro sem ferimentos, você irá se ferir no fim do seu descanso, causando a si mesmo 2 pontos de dano. Esses pontos de vida perdidos não contam no pacto.",
    "Megalomania": "Você acredita ser extremamente poderoso, sempre tomando a frente nos combates. Em um combate, no começo de cada turno, você deve ser bem sucedido em uma rolagem de Mente para não ficar adjacente ao inimigo mais próximo e atacá-lo. A dificuldade para o teste é igual a 8 + o seu total de pontos de vida perdidos.",
    "Obsessão": "Você tem um objetivo que se tornou sua obsessão. Você fará tudo para alcançá-lo. Sempre que estiver agindo fora do caminho que te leva à sua obsessão, você perde todos os dados de melhoria em suas rolagens.",
    "Paranóia": "Você tem dificuldade para dormir e não confia sua vida nem mesmo aos seus companheiros. Você não pode ser curado por aliados e recupera apenas metade dos pontos de vida quando dorme na companhia de qualquer outro personagem.",
    "Sonambulismo": "Sempre que você descansa, seu personagem age sob o controle do narrador, causando confusão para os seus aliados.",
    "Suicídio": "Funciona como Megalomania, com a diferença de que o personagem quer mesmo morrer.",
}

COMPLICACOES += [
    _c(f"Insanidade ({tipo})", 10,
       _INS_FLAVOR,
       f"Você recebe a insanidade {tipo}.\n\n{tipo}: {texto}",
       effects=[effect("info", "all", 0, label=f"Insanidade: {tipo}")])
    for tipo, texto in INSANIDADES.items()
]
