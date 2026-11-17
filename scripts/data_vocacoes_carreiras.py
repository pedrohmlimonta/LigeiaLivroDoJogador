# -*- coding: utf-8 -*-
"""Vocações (Sessão 6, edição revisada) e Carreiras (Sessão 16).

Cada vocação traz:
  - keySkills: a habilidade-CHAVE (vem com o personagem, sem custo de XP);
  - skillList: habilidades iniciais + de progressão (custo normal de lista).
"""
import copy

from builders import definicao, habilidade
from data_tracos import TRACOS
from data_tracos_2 import TRACOS_2
from data_habilidades_1 import HABILIDADES_1
from data_habilidades_2 import HABILIDADES_2
from data_habilidades_3 import HABILIDADES_3
from data_habilidades_4 import HABILIDADES_4

_ALL_TRACOS = {t["name"]: t for t in (TRACOS + TRACOS_2)}
_ALL_HABS = {h["name"]: h for h in (HABILIDADES_1 + HABILIDADES_2 +
                                    HABILIDADES_3 + HABILIDADES_4)}
IMG_VOC = "icons/svg/combat.svg"
IMG_CAR = "icons/svg/upgrade.svg"
_PAL = "Palavra Arcana"


def _hab(nome):
    return _ALL_HABS[nome]


def _chave_generica(nome, variantes, texto_escolha, troca=None):
    """Habilidade-chave de ESCOLHA (Pacto [Único], Juramento, Presa de Caça).

    O sistema compara nomes exatos para dar gratuidade às chaves, então a
    chave precisa funcionar sozinha: copia a mecânica (ações, efeitos) da
    primeira variante e reúne na descrição o texto de TODAS as opções.
    troca: (de, para) aplicado ao texto copiado (ex.: "Feras" -> "o tipo escolhido").
    """
    base = _hab(variantes[0])
    sysd = copy.deepcopy(base["system"])
    if troca:
        de, para = troca
        sysd["descBasic"] = sysd["descBasic"].replace(de, para)
        sysd["descAdvanced"] = sysd["descAdvanced"].replace(de, para)
        for a in sysd.get("actions", []):
            a["label"] = a["label"].replace(de, para)
    else:
        opcoes = "".join(
            f"<p><strong>{v}</strong></p>{_hab(v)['system']['descBasic']}" for v in variantes)
        sysd["descBasic"] = f"<p><em>{texto_escolha}</em></p>" + opcoes
    if troca:
        sysd["descBasic"] = f"<p><em>{texto_escolha}</em></p>" + sysd["descBasic"]
    doc = {"_id": base["_id"] + "k", "name": nome, "img": base["img"],
           "type": "habilidade", "system": sysd, "_generic": True}
    return doc


_PACTOS = [f"Pacto ({p})" for p in ("Abissal", "Celestial", "Elemental",
                                    "Faérian", "Infernal", "Sombrio")]
_JURAMENTOS = [f"Juramento ({j})" for j in ("Devoção", "Justiça", "Vingança")]

_CHAVES_GENERICAS = {
    "Pacto (Único)": _chave_generica(
        "Pacto (Único)", _PACTOS,
        "Habilidade-chave do Bruxo: escolha UM dos pactos abaixo quando a vocação entrar na ficha e anote-o aqui. O ritual (ações) é o mesmo para todos."),
    "Juramento (Qualquer)": _chave_generica(
        "Juramento (Qualquer)", _JURAMENTOS,
        "Habilidade-chave do Paladino: escolha UM dos juramentos abaixo e anote-o aqui."),
    "Presa de Caça (Qualquer)": _chave_generica(
        "Presa de Caça (Qualquer)", ["Presa de Caça (Feras)"],
        "Habilidade-chave do Patrulheiro: escolha UM tipo de criatura (Aberrações, Feras, Constructos, Dragões, Planares, Fadas, Gigantes, Bestiais, Plantas, Mortos-vivos, Insetos ou Humanoides de uma raça) e anote-o aqui.",
        troca=("Feras", "o tipo escolhido")),
}


def _voc(nome, desc, hp, mp, chave, iniciais, progressao):
    """chave: nome de habilidade real OU chave genérica (dict acima)."""
    key_doc = _CHAVES_GENERICAS.get(chave) or _hab(chave)
    skills = [chave] + iniciais + progressao
    return definicao(
        nome, "vocacao",
        desc + f"\n\nBônus de Pontos de Vida: +{hp}. Bônus de Pontos de Magia: +{mp}. "
               f"Habilidade-chave: {chave} (vem com o personagem, sem custo de XP). "
               f"A lista inclui as habilidades iniciais e as de progressão.",
        skill_list=skills, key_skills=[key_doc],
        hpBonus=hp, mpBonus=mp, img=IMG_VOC,
    )


VOCACOES = [
    _voc("Bárbaro",
         "Combatentes selvagens movidos pela fúria, resistentes e devastadores no corpo a corpo.",
         4, 0, "Fúria",
         ["Acrobacia", "Alerta", "Atletismo", "Carregador", "Combater sem Armadura",
          "Conhecimento (Natureza)", "Corredor", "Medicina", "Montar Criatura",
          "Sobrevivência", "Usar Armaduras Leves", "Usar Armas (Arremesso)",
          "Usar Armas (Duas Mãos)", "Usar Armas (Militar)", "Usar Armas (Simples)",
          "Usar Armas (Uma Mão)", "Usar Escudos"],
         ["Contragolpe", "Espírito Guardião (Qualquer)", "Golpe Crítico Brutal",
          "Grito de Guerra", "Guerreiro Incauto", "Ímpeto", "Melhorar Atributo (Força)",
          "Melhorar Atributo (Vigor)", "Presença Aterradora", "Reação Furiosa",
          "Reflexos", "Sem Brechas", "Velocidade de Ataque", "Vigor de Aço"]),
    _voc("Bardo",
         "Artistas e eruditos que inspiram aliados com música, lábia e conhecimento vasto.",
         2, 2, "Inspirar",
         ["Carisma", "Conhecimento (Arcano)", "Conhecimento (Guerra)",
          "Conhecimento (História)", "Conhecimento (Natureza)", "Conhecimento (Religião)",
          "Lidar com Animais", "Medicina", "Montar Criatura", "Ofícios",
          "Palavra Arcana (sorcdiron)", "Sobrevivência", "Usar Armaduras Leves",
          "Usar Armas (Leves)", "Usar Armas (Simples)", "Veículos (Terrestres)"],
         ["Canção do Viajante", "Especialista", "Lidar com Armadilhas",
          "Melhorar Atributo (Agilidade)", "Melhorar Atributo (Mente)", "Mercado Negro",
          "Mestre do Conhecimento", "Palavra Arcana (carmo)", "Palavra Arcana (iluzio)",
          "Palavra Arcana (inanis)", "Palavra Arcana (sonigu)", "Palavra Arcana (traumato)",
          "Palavra Arcana (vitae)", "Usar Armas (Bestas)", "Usar Armas (Lâminas Pequenas)"]),
    _voc("Bruxo",
         "Conjuradores que obtêm poder por meio de pactos com entidades extraplanares.",
         2, 0, "Pacto (Único)",
         ["Carisma", "Conhecimento (Arcano)", "Conhecimento (História)",
          "Conhecimento (Ocultismo)", "Conhecimento (Religião)", "Estudos Místicos",
          "Usar Armaduras Leves", "Usar Armas (Simples)"],
         ["Familiar", "Linguista Arcano", "Magia sem Gestos", "Magia sem Materiais",
          "Magia Silenciosa", "Melhorar Atributo (Mente)", "Melhorar Atributo (Vigor)",
          "Mercado Negro", "Vontade de Ferro"]),
    _voc("Clérigo",
         "Servos devotos que canalizam os aspectos de sua divindade em milagres.",
         2, 0, "Primeiro Aspecto",
         ["Carisma", "Conhecimento (História)", "Conhecimento (Religião)", "Guia Divino",
          "Medicina", "Usar Armaduras Leves", "Usar Armas (Simples)"],
         ["Escolhido da Divindade", "Guerra Santa", "Guerreiro da Fé", "Magia Unilateral",
          "Melhorar Atributo (Mente)", "Prece de Repouso", "Segundo Aspecto"]),
    _voc("Druida",
         "Guardiões da natureza que conjuram seus ciclos e assumem formas animais.",
         2, 2, "Forma Animal",
         ["Atletismo", "Carisma", "Conhecimento (Natureza)", "Lidar com Animais",
          "Medicina", "Montar Criatura", "Palavra Arcana (devena)",
          "Palavra Arcana (sangon)", "Palavra Arcana (vitae)", "Sobrevivência",
          "Usar Armaduras Leves", "Usar Armas (Simples)"],
         ["Companheiro Animal", "Conhecimento (Arcano)", "Conhecimento (História)",
          "Conhecimento (Religião)", "Espírito Guardião (Qualquer)",
          "Explorador (Qualquer)", "Magia Unilateral", "Melhorar Atributo (Mente)",
          "Melhorar Atributo (Percepção)", "Palavra Arcana (krucigon)",
          "Palavra Arcana (noxia)", "Trilhador (Qualquer)"]),
    _voc("Guardião",
         "Defensores implacáveis que protegem aliados e controlam o campo de batalha.",
         4, 0, "Zona de Ameaça",
         ["Atletismo", "Baluarte", "Medicina", "Montar Criatura", "Provocar",
          "Usar Armas (Arremesso)", "Usar Armas (Militar)", "Usar Armas (Artilharia)",
          "Usar Armas (Simples)", "Usar Armas (Uma Mão)", "Usar Escudos",
          "Veículos (Terrestres)"],
         ["Carregador", "Contragolpe", "Golpear com Escudo", "Ímpeto",
          "Melhorar Atributo (Força)", "Melhorar Atributo (Vigor)", "Proteger",
          "Recuperar o Fôlego", "Táticas de Grupo", "Vigor de Aço"]),
    _voc("Guerreiro",
         "Mestres das armas e das táticas, versáteis em qualquer estilo de combate.",
         3, 0, "Impulso de Combate",
         ["Atletismo", "Baluarte", "Carregador", "Medicina", "Montar Criatura",
          "Usar Armaduras Leves", "Usar Armas (Arremesso)", "Usar Armas (Corpo a Corpo)",
          "Usar Armas (Duas Mãos)", "Usar Armas (Militar)", "Usar Armas (Artilharia)",
          "Usar Armas (Simples)", "Usar Armas (Uma Mão)", "Usar Escudos",
          "Veículos (Terrestres)"],
         ["Acrobacia", "Alerta", "Carisma", "Conhecimento (Guerra)", "Contragolpe",
          "Empunhadura Dupla", "Golpear com Escudo", "Ímpeto",
          "Melhorar Atributo (Agilidade)", "Melhorar Atributo (Força)",
          "Recuperar o Fôlego", "Saque Rápido", "Sobrevivência", "Táticas de Grupo",
          "Velocidade de Ataque"]),
    _voc("Ladino",
         "Especialistas em furtividade, precisão e golpes oportunos.",
         2, 0, "Letalidade",
         ["Acrobacia", "Alerta", "Atletismo", "Carisma", "Furtividade", "Reflexos",
          "Usar Armaduras Leves", "Usar Armas (Arremesso)", "Usar Armas (Leves)",
          "Usar Armas (Artilharia)"],
         ["Ameaça Invisível", "Desengajar", "Especialista", "Golpe Cegante",
          "Golpe de Sorte", "Lidar com Armadilhas", "Melhorar Atributo (Agilidade)",
          "Melhorar Atributo (Percepção)", "Mercado Negro", "Movimento Astuto",
          "Saque Rápido", "Sem Brechas"]),
    _voc("Mago",
         "Estudiosos das palavras arcanas, com o mais amplo repertório de magias.",
         1, 3, "Escola Arcana",
         ["Conhecimento (Arcano)", "Conhecimento (História)", "Implemento Arcano Superior",
          "Medicina", "Palavra Arcana (acida)", "Palavra Arcana (augurado)",
          "Palavra Arcana (energio)", "Palavra Arcana (fulgur)", "Palavra Arcana (glacios)",
          "Palavra Arcana (ignis)", "Palavra Arcana (iluzio)", "Palavra Arcana (inanis)",
          "Palavra Arcana (kreo)", "Palavra Arcana (krucigon)", "Palavra Arcana (lumo)",
          "Palavra Arcana (mortis)", "Palavra Arcana (noxia)", "Palavra Arcana (sonigu)",
          "Palavra Arcana (sorcdiron)", "Palavra Arcana (tenebrae)", "Usar Armas (Simples)"],
         ["Carisma", "Conhecimento (Religião)", "Familiar", "Linguista Arcano",
          "Melhorar Atributo (Mente)", "Preparação Arcana"]),
    _voc("Monge",
         "Ascetas disciplinados que transformam o próprio corpo em arma.",
         2, 1, "Artes Marciais",
         ["Acrobacia", "Alerta", "Atletismo", "Carisma", "Combater sem Armadura",
          "Conhecimento (Arcano)", "Conhecimento (Natureza)", "Conhecimento (Religião)",
          "Corredor", "Furtividade", "Medicina", "Ofícios", "Usar Armas (Desarmado)",
          "Usar Armas (Simples)", "Velocidade de Ataque"],
         ["Combater às Cegas", "Contragolpe", "Defletir Projéteis", "Desengajar",
          "Melhorar Atributo (Agilidade)", "Melhorar Atributo (Força)",
          "Melhorar Atributo (Mente)", "Palavra Arcana (sorcdiron)", "Reflexos",
          "Sem Brechas", "Vigor de Aço", "Vontade de Ferro"]),
    _voc("Paladino",
         "Guerreiros sagrados unidos por juramentos e pela fé em sua divindade.",
         3, 1, "Juramento (Qualquer)",
         ["Atletismo", "Baluarte", "Carisma", "Conhecimento (História)",
          "Conhecimento (Religião)", "Medicina", "Montar Criatura",
          "Palavra Arcana (vitae)", "Proteger", "Usar Armaduras Leves",
          "Usar Armas (Duas Mãos)", "Usar Armas (Militar)", "Usar Armas (Simples)",
          "Usar Armas (Uma Mão)", "Usar Escudos"],
         ["Alerta", "Golpear com Escudo", "Grito de Guerra", "Guerra Santa", "Ímpeto",
          "Melhorar Atributo (Força)", "Melhorar Atributo (Mente)",
          "Palavra Arcana (sorcdiron)", "Prece de Repouso", "Presença Aterradora",
          "Punição", "Vigor de Aço", "Vontade de Ferro"]),
    _voc("Patrulheiro",
         "Caçadores e rastreadores dos ermos, mortais com arcos e armas duplas.",
         2, 0, "Presa de Caça (Qualquer)",
         ["Acrobacia", "Alerta", "Atirador", "Atletismo", "Conhecimento (Natureza)",
          "Empunhadura Dupla", "Furtividade", "Lidar com Animais", "Medicina",
          "Recarga Rápida", "Sobrevivência", "Usar Armaduras Leves",
          "Usar Armas (Arremesso)", "Usar Armas (Artilharia)", "Usar Armas (Militar)",
          "Usar Armas (Simples)", "Usar Armas (Uma Mão)", "Usar Escudos"],
         ["Atirador em Movimento", "Combater às Cegas", "Companheiro Animal",
          "Exímio Atirador", "Explorador (Qualquer)", "Melhorar Atributo (Agilidade)",
          "Melhorar Atributo (Percepção)", "Montar Criatura", "Predador Astuto",
          "Saque Rápido", "Trilhador (Qualquer)", "Velocidade de Ataque"]),
]


def _car(nome, desc, prereq, granted_name, skills):
    return definicao(
        nome, "carreira",
        desc + "\n\n" + prereq,
        skill_list=skills,
        granted=[_ALL_TRACOS[granted_name]],
        img=IMG_CAR,
    )


CARREIRAS = [
    _car("Arquimago",
         "Estudiosos avançados das magias, capazes de liberar o fluxo arcano dentro de si e moldar magias no ato da conjuração. Magos e Bruxos se tornam aptos mais rapidamente a assumir esta carreira.",
         "Pré-requisitos — Corrupção: Qualquer. Raça: Qualquer. Tempo Necessário: 60 dias de estudos em uma escola arcana. Habilidades Necessárias: Palavra Arcana (Qualquer) [A], Preparação Arcana [B], Conhecimento (Arcano) [A], Linguista Arcano [A].\n\nCaracterísticas: +2 Pontos de Magia Máximos.",
         "Característica do Arquimago",
         ["Alta Arcana", "Fluxo Arcano", "Magia Sem Gestos", "Magia Sem Materiais",
          "Magia Silenciosa", "Mestre Conjurador", "Mestre do Conhecimento"]),
    _car("Assassino",
         "Especialistas em eliminar vítimas sem serem vistos, precisos, letais e hábeis com venenos. Ladinos se tornam aptos mais rapidamente a assumir esta carreira.",
         "Pré-requisitos — Corrupção: 6+. Raça: Qualquer. Tempo Necessário: 60 dias e testes em uma guilda de assassinos. Habilidades Necessárias: Ameaça Invisível [A], Golpe Cegante [B], Letalidade [A], Movimento Astuto [A].\n\nCaracterísticas: +1 Ponto de Vida Máximo.",
         "Característica do Assassino",
         ["Contragolpe", "Desaparecer", "Golpe Letal", "Lidar com Venenos", "Sem Falhas",
          "Velocidade de Ataque"]),
    _car("Legionário",
         "Combatentes veteranos de trincheira, treinados para enfrentar grandes unidades sozinhos, equilibrando ataque e defesa. Guerreiros, Guardiões e Paladinos se tornam aptos mais rapidamente a assumir esta carreira.",
         "Pré-requisitos — Corrupção: Qualquer. Raça: Qualquer. Tempo Necessário: 60 dias atuando em guerras. Habilidades Necessárias: Conhecimento (Guerra) [A], Sobrevivência [B], Recuperar o Fôlego [A], Ímpeto [A].\n\nCaracterísticas: +3 Pontos de Vida Máximos.",
         "Característica do Legionário",
         ["Carregador", "Corredor", "Desengajar", "Enfrentar a Horda", "Firmeza Física",
          "Golpe Giratório", "Golpear com Escudo", "Grito de Guerra", "Impulso de Combate",
          "Proteger", "Usar Escudos", "Velocidade de Ataque"]),
    _car("Sacerdote",
         "Autoridades de alta escala na hierarquia religiosa, os mortais mais próximos de sua divindade, capazes de manifestar parcialmente seu poder em combate. Clérigos se tornam aptos mais rapidamente a assumir esta carreira.",
         "Pré-requisitos — Corrupção: Qualquer. Raça: Qualquer. Tempo Necessário: 60 dias de estudos e trabalhos a serviço da igreja de sua divindade. Habilidades Necessárias: Primeiro Aspecto [A], Segundo Aspecto [A], Guerreiro da Fé [B], Escolhido da Divindade [B].\n\nCaracterísticas: +1 Ponto de Vida Máximo.",
         "Característica do Sacerdote",
         ["Autoridade Divina", "Manifestação Divina", "Terceiro Aspecto"]),
]
