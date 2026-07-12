# -*- coding: utf-8 -*-
"""Traços adicionais: raças/heranças que faltavam e características de carreiras."""
from builders import traco, effect
from data_tracos import IMG_RACA, IMG_HERANCA

IMG_CARREIRA = "icons/svg/upgrade.svg"

TRACOS_2 = [
    traco("Filhos de Éllon", "race",
          "Agraciados pelo príncipe dos faérian, seu criador, seu povo possui uma resistência à magia herdada do próprio Éllon. Você recebe 1D em rolagens para se defender, evitar e resistir a magias.\n\nRaça: alto elfo.",
          img=IMG_RACA),
    traco("Talentoso", "race",
          "Escolha uma habilidade que te dê 1D em uma rolagem fora de combate. Você recebe um bônus igual a metade do seu nível em todas as rolagens que adicionar esse dado de melhoria.\n\nRaça: meio-elfo.",
          img=IMG_RACA),
    traco("Conjuração Celestial", "heritage",
          "Quando você conjura magias compostas pela Palavra Arcana (vitae), elas curam 1 ponto de vida adicional.\n\nHerança: celestial.",
          img=IMG_HERANCA),
    traco("Característica do Arquimago", "other",
          "+2 Pontos de Magia Máximos.\n\nConcedida ao adquirir a carreira Arquimago.",
          effects=[effect("stat", "mp", 2, label="Arquimago: +2 PM máximos")],
          img=IMG_CARREIRA),
    traco("Característica do Assassino", "other",
          "+1 Ponto de Vida Máximo.\n\nConcedida ao adquirir a carreira Assassino.",
          effects=[effect("stat", "hp", 1, label="Assassino: +1 PV máximo")],
          img=IMG_CARREIRA),
    traco("Característica do Legionário", "other",
          "+3 Pontos de Vida Máximos.\n\nConcedida ao adquirir a carreira Legionário.",
          effects=[effect("stat", "hp", 3, label="Legionário: +3 PV máximos")],
          img=IMG_CARREIRA),
    traco("Característica do Sacerdote", "other",
          "+1 Ponto de Vida Máximo.\n\nConcedida ao adquirir a carreira Sacerdote.",
          effects=[effect("stat", "hp", 1, label="Sacerdote: +1 PV máximo")],
          img=IMG_CARREIRA),
]
