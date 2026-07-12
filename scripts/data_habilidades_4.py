# -*- coding: utf-8 -*-
"""Habilidades — parte 4: Asas (Sessão 9) e habilidades exclusivas de carreira
(Sessão 16). O nível Épico usa costSpecial/descSpecial."""
from builders import habilidade, effect, cost, action, applies
from data_habilidades_1 import IMG

HABILIDADES_4 = [
    habilidade(
        "Asas",
        "Celestial, draconiano e infernal",
        "Você desenvolveu asas provindas de algum tipo de poder. Você pode escolher voar, em vez de mover-se em solo firme, usando seu movimento, mas deve concluir o movimento em solo firme. Seu Deslocamento voando é o mesmo que quando caminha.",
        "Você pode flutuar a meio metro acima do chão ilimitadamente. Quando escolhe mover-se voando, você pode mover-se o dobro do seu Deslocamento.",
        20, 40,
        img=IMG["corpo"],
    ),
    # -------------------- Arquimago (Sessão 16) -------------------------
    habilidade(
        "Alta Arcana",
        "Arquimago",
        "Quando você conjura uma magia de círculo Menor ou Intermediário, você pode gastar 1 ponto heróico para adicionar uma de suas Metamagias a esta conjuração.",
        "Você pode gastar 2 pontos de magia, no lugar do ponto heróico, quando usa essa habilidade.",
        20, 40, cost_e=80,
        desc_e="Você não gasta pontos heróicos, nem de magia, para fazê-lo.",
        img=IMG["magia"],
    ),
    habilidade(
        "Fluxo Arcano",
        "Arquimago",
        "—",
        "—",
        0, 0, cost_e=60,
        desc_e="(Épica) Quando você chega a 0 pontos de magia, você recebe regeneração arcana até o fim da cena ou até alcançar seus pontos de magia máximos.",
        img=IMG["magia"],
    ),
    habilidade(
        "Mestre Conjurador",
        "Arquimago",
        "—",
        "—",
        0, 0, cost_e=80,
        desc_e="(Épica) Quando você falha em uma rolagem de Conjuração, você não perde seus pontos de magia.",
        img=IMG["magia"],
    ),
    # -------------------- Assassino (Sessão 16) -------------------------
    habilidade(
        "Lidar com Venenos",
        "Assassino",
        "Você recebe 1D em rolagens para coletar e manusear venenos.",
        "Venenos aplicados em sua arma têm duração de 2 ataques, em vez de 1.",
        20, 40, cost_e=80,
        desc_e="Venenos preparados por você recebem +2 na dificuldade das rolagens de resistência.",
        img=IMG["pericia"],
    ),
    habilidade(
        "Sem Falhas",
        "Assassino",
        "Quando você ataca uma criatura indefesa com uma arma leve, seus resultados 1 nos dados de ataque são considerados 2.",
        "Quando você ataca uma criatura indefesa com uma arma leve, seus resultados 1 no ataque são considerados 3.",
        20, 40, cost_e=80,
        desc_e="O alvo não precisa estar indefeso para esta habilidade.",
        img=IMG["combate"],
    ),
    habilidade(
        "Desaparecer",
        "Assassino",
        "—",
        "—",
        0, 0, cost_e=60,
        desc_e="(Épica) Você pode realizar rolagens para se esconder, mesmo que não tenha cobertura, contanto que o ambiente tenha pouca ou nenhuma luz. Você é considerado invisível, mas fica visível novamente caso se mova, ataque ou fale.",
        img=IMG["pericia"],
    ),
    habilidade(
        "Golpe Letal",
        "Assassino",
        "—",
        "—",
        0, 0, cost_e=80,
        desc_e="(Épica) Quando ataca uma criatura indefesa, o dano garantido pela sua Letalidade é dobrado.",
        img=IMG["combate"],
    ),
    # -------------------- Legionário (Sessão 16) ------------------------
    habilidade(
        "Enfrentar a Horda",
        "Legionário",
        "Quando você ataca uma criatura com uma arma corpo a corpo, você pode movê-la até 2m.",
        "Criaturas atingidas por seus ataques com arma corpo a corpo ficam imobilizadas até o fim da cena (Força anula).",
        10, 30, cost_e=60,
        desc_e="Quando você ataca uma criatura com uma arma corpo a corpo, você recebe +1 nesta rolagem de ataque para cada outra criatura hostil adjacente a você.",
        img=IMG["combate"],
    ),
    habilidade(
        "Golpe Giratório",
        "Legionário",
        "—",
        "—",
        0, 0, cost_e=80,
        desc_e="(Épica) Enquanto estiver empunhando um escudo, quando você realiza um ataque corpo a corpo com arma, criaturas adjacentes, além do alvo, sofrem o dano escalonado desse ataque.",
        img=IMG["combate"],
    ),
    # -------------------- Sacerdote (Sessão 16) -------------------------
    habilidade(
        "Manifestação Divina",
        "Sacerdote",
        "Seu deus intervém em favor de seus aliados. Quando um aliado que você possa ver ficar com menos da metade dos pontos de vida, você pode gastar 1 ponto heróico e usar sua reação para que ele recupere pontos de vida iguais ao seu nível. Se isso não elevar os pontos de vida dele acima da metade, você recupera o ponto heróico gasto.",
        "Quando essa habilidade eleva os pontos de vida de seu aliado acima da metade, inimigos adjacentes a ele devem ser bem sucedidos em uma rolagem de Mente (Difícil) ou ficarão Atordoados até o fim da cena (Mente anula).",
        20, 40, cost_e=60,
        desc_e="Adicionalmente, seu aliado recebe regeneração até o fim da cena ou até ficar sem ferimentos.",
        activation="Reação",
        img=IMG["social"],
    ),
    habilidade(
        "Terceiro Aspecto",
        "Sacerdote",
        "Você manifesta agora o último aspecto da sua divindade. Você tem acesso à Magia Divina e ao Sentido Divino pertencentes a esse aspecto.",
        "Você tem acesso à Arma Divina do aspecto escolhido.",
        20, 40, prereq="Segundo Aspecto",
        img=IMG["social"],
    ),
    habilidade(
        "Autoridade Divina",
        "Sacerdote",
        "—",
        "—",
        0, 0, cost_e=60,
        desc_e="(Épica) Sempre que realizar rolagens de interação social, re-role os resultados 1. Os novos resultados não podem ser re-rolados. Adicionalmente, caso sua Corrupção seja inferior a 5, criaturas com Corrupção 7 ou superior ficam enfraquecidas enquanto estiverem adjacentes a você. Caso sua Corrupção seja superior a 5, essa habilidade afeta criaturas com Corrupção 3 ou inferior.",
        img=IMG["social"],
    ),
]
