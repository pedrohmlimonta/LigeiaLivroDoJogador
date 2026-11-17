# -*- coding: utf-8 -*-
"""Revisão das ações por nível (B/A/E) — segunda passada sobre TODAS as
habilidades do livro, rodada logo depois de enhance_levels.LEVEL_UPGRADES.

O que esta passada resolve:

1. Perícias com benefício PERMANENTE misturado ao situacional (Acrobacia A,
   Atletismo A, Alerta A, Firmeza Física, Senso Lógico, Corredor...). No modo
   "ativável" o item inteiro só vale ligado — e o +1 de Esquiva, o crítico,
   a Proteção psíquica e os PV extras sumiam com ele desligado. Aqui o item
   fica PASSIVO: o permanente vale sempre e cada efeito situacional começa
   DESLIGADO (○), para ser ligado no próprio efeito, na ficha, quando valer.
   O mesmo vale para habilidades com efeitos de situações diferentes
   (Explorador fora × dentro de combate, Guerra Santa, Sobrevivência).

2. Habilidades cujo texto pede um gasto ou uma escolha em combate (PH, PM,
   PV, reação) ganham a ação daquele nível com o custo certo.

3. Manobras com Armas (Sessão 14): cada Usar Armas [x] que tem manobra no
   livro ganha a ação de 1 PH. O bônus de dano entra como efeito de 1
   rodada na tipagem da arma (arma:<tipagem>), então soma no ataque feito
   em seguida com a arma — com o tipo de dano e a Proteção do alvo certos.

Condições aplicadas por ações que NÃO rolam (o complemento depois do acerto)
usam a resistência "refazer a cada rodada": quem aplicou rola de novo o
atributo da ação para gerar a CD. Sem isso a CD ficaria 0 (a ação não teve
rolagem) e a condição cairia no primeiro teste.
"""
import re

from builders import action, applies, effect


# ---------------------------------------------------------------------------
# Construtores curtos
# ---------------------------------------------------------------------------
def _sit(etype, target, value, level, label, **kw):
    """Efeito situacional: começa DESLIGADO — ligue o efeito na ficha (●)."""
    e = effect(etype, target, value, level=level, label=label, **kw)
    e["enabled"] = False
    return e


def _marca(label, duration_mode="scene", rounds=1, **kw):
    """Efeito aplicado só como marcador (bônus 0): registra na ficha do alvo
    algo que o sistema não tem como condição própria, com duração."""
    return applies(label, fx_type="bonus", fx_target="all", fx_value=0,
                   duration_mode=duration_mode, duration_rounds=rounds, **kw)


def _cond(label, cond, attr=None, duration_mode="scene", rounds=1, **kw):
    """Condição no alvo; attr = atributo que anula (resistência refeita a
    cada rodada pela rolagem de quem aplicou)."""
    if attr:
        kw.update(resist=True, resist_attr=attr, resist_vs_cast=False,
                  resist_reroll=True)
    return applies(label, fx_type="condition", fx_target=cond,
                   duration_mode=duration_mode, duration_rounds=rounds, **kw)


def _sangramento(label, tipo="corte", attr="vigor"):
    return _cond(label, "dano_continuo", attr, tick_amount=1, tick_type=tipo)


def _gasto(label, level, ph=0, pm=0, pv=0):
    """Ação que registra o uso no chat e cobra o custo daquele nível."""
    return action(label, level=level, can_roll=False, target_mode="none",
                  cost_heroic=ph, cost_mp=pm, cost_hp=pv)


def _em_si(label, level, efeitos, ph=0, pm=0, pv=0, heal="", heal_resource="hp",
           temp_stack=False):
    return action(label, level=level, can_roll=False, target_mode="self",
                  include_self=True, cost_heroic=ph, cost_mp=pm, cost_hp=pv,
                  heal=heal, heal_resource=heal_resource, temp_stack=temp_stack,
                  applies_effects=efeitos)


def _no_alvo(label, level, efeitos=None, attr="forca", ph=0, pm=0, can_roll=False, **kw):
    """Complemento aplicado ao alvo já atingido (por padrão não rola de
    novo). attr é o atributo usado para refazer a CD das resistências — ou o
    da rolagem, quando can_roll=True."""
    return action(label, level=level, can_roll=can_roll, target_mode="target",
                  roll_attr=attr, cost_heroic=ph, cost_mp=pm,
                  applies_effects=efeitos or [], **kw)


def _rolagem(label, attr, dados=0, bonus=0, level="B"):
    return action(label, level=level, roll_attr=attr, roll_dice=dados,
                  roll_bonus=bonus, target_mode="none")


def _fx(label, tipo, alvo, valor, rodadas=0):
    """Efeito aplicado em si mesmo (rodadas=0 → até o fim da cena)."""
    if rodadas:
        return applies(label, fx_type=tipo, fx_target=alvo, fx_value=valor,
                       duration_mode="rounds", duration_rounds=rodadas)
    return applies(label, fx_type=tipo, fx_target=alvo, fx_value=valor,
                   duration_mode="scene")


def _passivo(doc, efeitos=None):
    """Item passivo; com `efeitos`, substitui a lista inteira."""
    s = doc["system"]
    s["mode"] = "passive"
    s["active"] = False
    if efeitos is not None:
        s["effects"] = efeitos


def _acoes(doc, *novas):
    doc["system"]["actions"].extend(novas)


def _sub(nome):
    m = re.search(r"\(([^)]*)\)\s*$", nome)
    return m.group(1) if m else ""


# ---------------------------------------------------------------------------
# 1) Perícias mistas → passivas com efeitos situacionais desligados
# ---------------------------------------------------------------------------
def _acrobacia(d):
    _passivo(d, [
        _sit("rollDice", "agilidade", 1, "B",
             "Acrobacia: +1 dado em atividades acrobáticas — evitar queda, corda bamba, atravessar espaço ocupado (ligue quando valer)"),
        effect("attr", "esquiva", 1, level="A", label="Acrobacia (A): +1 Esquiva"),
        effect("crit", "esquiva", 1, level="A", label="Acrobacia (A): crítico 11-12 em Esquiva"),
    ])
    _acoes(d, _gasto("Acrobacia (A) — reação quando alguém fica adjacente: mover-se sem sofrer reações de ataque (1 PH)", "A", ph=1))


def _atletismo(d):
    _passivo(d, [
        _sit("rollDice", "forca", 1, "B",
             "Atletismo: +1 dado em atividades atléticas — saltar, nadar, escalar (ligue quando valer)"),
        effect("attr", "bloqueio", 1, level="A", label="Atletismo (A): +1 Bloqueio"),
        effect("crit", "bloqueio", 1, level="A", label="Atletismo (A): crítico 11-12 em Bloqueio"),
    ])
    _acoes(d, _gasto("Atletismo (A) — sucesso crítico em uma atividade atlética fora de combate (1 PH)", "A", ph=1))


def _alerta(d):
    _passivo(d, [
        _sit("rollDice", "percepcao", 1, "B",
             "Alerta: +1 dado para achar coisas escondidas, pistas, detalhes e sons (ligue quando valer)"),
        effect("bonus", "iniciativa", 4, level="A", label="Alerta (A): +4 Iniciativa"),
        _sit("rollDice", "percepcao", 1, "A",
             "Alerta (A): +1 dado para perceber armadilhas e ameaças naturais (ligue quando valer)"),
        _sit("bonus", "all", "ceil(@nivel/2)", "A",
             "Alerta (A): +metade do Nível para resistir/anular Cego e Surdo (ligue quando valer)"),
    ])


def _firmeza_fisica(d):
    _passivo(d, [
        _sit("rollDice", "all", 1, "B",
             "Firmeza Física: +1 dado para evitar ser derrubado ou movido (ligue quando valer)"),
        effect("stat", "hp", 1, level="B", label="Firmeza Física B: +1 PV"),
        effect("stat", "hp", 2, level="A", label="Firmeza Física A: +2 PV (total +3)"),
        _sit("bonus", "all", "ceil(@nivel/2)", "A",
             "Firmeza Física (A): +metade do Nível para resistir/anular Agarrado, Enfraquecido, Exausto e Paralisado (ligue quando valer)"),
    ])
    _acoes(d, _gasto("Firmeza Física (A) — reação: evitar a derrubada/o empurrão e atacar quem tentou (1 PH)", "A", ph=1))


def _senso_logico(d):
    _passivo(d, [
        _sit("rollDice", "all", 1, "B",
             "Senso Lógico: +1 dado em pesquisa, rastreio, procurar objetos/compartimentos/armadilhas, comida, abrigo e identificar objetos (ligue quando valer)"),
        _sit("rollDice", "all", 1, "A",
             "Senso Lógico (A): +1 dado adicional — 2D no total; ligue junto com o de 1D"),
        effect("rd", "all", 1, level="B", label="Senso Lógico B: Proteção 1 contra psíquico",
               damage_type="psiquico"),
        effect("rd", "all", 1, level="A", label="Senso Lógico A: +1 Proteção contra psíquico (total 2)",
               damage_type="psiquico"),
        _sit("bonus", "defense", 1, "B",
             "Senso Lógico: +1 na defesa contra reações de ataque (ligue quando valer)"),
        _sit("bonus", "defense", 1, "A",
             "Senso Lógico (A): +1 adicional na defesa contra reações de ataque — total +2"),
    ])
    _acoes(d,
           _rolagem("Senso Lógico — rolar Percepção +1D", "percepcao", 1, level="B"),
           _rolagem("Senso Lógico — rolar Percepção +2D (A)", "percepcao", 2, level="A"))


def _explorador(d):
    t = _sub(d["name"]).lower()
    _passivo(d, [
        _sit("rollDice", "all", 1, "B",
             f"Explorador: +1 dado em ações ligadas ao terreno ({t}) fora de combate (ligue quando valer)"),
        _sit("rollDice", "all", 1, "A",
             f"Explorador (A): +1 dado em todas as rolagens em combate no terreno ({t}) (ligue quando lutar nele)"),
    ])


def _guerra_santa(d):
    _passivo(d, [
        _sit("rollDice", "mente", 1, "B",
             "Guerra Santa: +1 dado em conhecimento e investigação sobre servos de religiões rivais (ligue quando valer)"),
        _sit("rollDice", "attack", 1, "A",
             "Guerra Santa (A): +1 dado nos ataques contra servos de religiões opostas (ligue quando valer)"),
        _sit("rollDice", "defense", 1, "A",
             "Guerra Santa (A): +1 dado nas defesas contra servos de religiões opostas (ligue quando valer)"),
    ])
    _acoes(d, _no_alvo(
        "Guerra Santa (A) — ao usar um poder divino: servos rivais que o veem ajoelham-se (1 PH)",
        "A", attr="conjuracao", ph=1, efeitos=[
            _cond("Pasmo — ajoelhado (Mente anula)", "pasmo", "mente"),
            _cond("Indefeso até o começo do próprio turno", "indefeso",
                  duration_mode="rounds", rounds=1),
        ]))


def _sobrevivencia(d):
    _passivo(d, [
        _sit("rollDice", "percepcao", 1, "B",
             "Sobrevivência: +1 dado em atividades em lugares selvagens — comida, abrigo, rastreio (ligue quando valer)"),
        _sit("rollDice", "attack", 1, "A",
             "Sobrevivência (A): +1 dado nos ataques contra Feras (ligue quando valer)"),
    ])


def _corredor(d):
    _passivo(d)
    d["system"]["effects"].append(_sit(
        "bonus", "all", "ceil(@nivel/2)", "A",
        "Corredor (A): +metade do Nível para resistir/anular Lento e Imobilizado (ligue quando valer)"))


def _recuperar_o_folego(d):
    _passivo(d)
    d["system"]["effects"].append(_sit(
        "bonus", "all", "ceil(@nivel/2)", "A",
        "Recuperar o Fôlego (A): +metade do Nível para resistir/anular Inconsciente e Morrendo (ligue quando valer)"))


def _implacavel(d):
    _passivo(d, [
        _sit("bonus", "all", 1, "B",
             "Implacável: +1 para evitar ser movido, puxado, empurrado ou derrubado (ligue quando valer)"),
        _sit("bonus", "all", 1, "A",
             "Implacável (A): +1 adicional — total +2; ligue junto"),
    ])


def _trilhador(d):
    t = _sub(d["name"]).lower()
    _passivo(d, [
        _sit("stat", "deslocamento", "ceil(@nivel/2)", "B",
             f"Trilhador: +metade do Nível em metros de Deslocamento no terreno ({t}) (ligue quando valer)"),
        _sit("stat", "deslocamento", "floor(@nivel/2)", "A",
             f"Trilhador (A): completa o bônus até o Nível inteiro no terreno ({t}) — ligue junto"),
    ])


def _tatica_de_grupo(d):
    _passivo(d, [
        _sit("bonus", "defense", 1, "B",
             "Táticas de Grupo: +1 na defesa por aliado adjacente que o veja e ouça (ligue quando valer; some +1 por aliado)"),
        _sit("bonus", "attack", 1, "A",
             "Táticas de Grupo (A): +1 no ataque por aliado adjacente (ligue quando valer; some +1 por aliado)"),
    ])


def _preparacao_arcana(d):
    _passivo(d, [
        _sit("rollDice", "conjuracao", 1, "B",
             "Preparação Arcana: +1 dado ao conjurar uma magia preparada (ligue quando valer)"),
    ])


def _magia_unilateral(d):
    _passivo(d, [
        _sit("areaFilter", "enemies", 0, "A",
             "Magia Unilateral (A): áreas não afetam aliados — ligue ao conjurar (vale para TODAS as suas áreas enquanto ligado)"),
    ])


def _operar_mecanismos(d):
    d["system"]["mode"] = "active"
    d["system"]["effects"] += [
        effect("bonus", "all", 1, level="B",
               label="Operar Mecanismos: +1 para ativar itens arcanomecânicos (ligue quando valer)"),
        effect("bonus", "all", 1, level="A",
               label="Operar Mecanismos (A): +1 adicional — total +2"),
    ]


def _vontade_de_ferro(d):
    for e in d["system"]["effects"]:
        if e["level"] == "A" and e["type"] == "bonus":
            e["label"] = ("Vontade de Ferro (A): +metade do Nível para resistir/anular Abalado, "
                          "Dominado, Enfeitiçado, Atordoado, Pasmo ou Dano Contínuo Psíquico (ligue quando valer)")
    _acoes(d, _rolagem("Vontade de Ferro (A) — resistir/anular: Mente +1D +metade do Nível",
                       "mente", 1, "ceil(@nivel/2)", level="A"))


def _precisao_arcana(d):
    d["system"]["effects"].append(effect(
        "reroll1", "conjuracao", 1, level="A",
        label="Precisão Arcana (A): re-rola mais 1 dado com 1 — até 2 dados (os 2 você re-rola à mão)"))


def _marca_da_macula(d):
    _passivo(d, [
        effect("rd", "all", "ceil(@nivel/2)", level="B", damage_type="necrotico",
               label="Marca da Mácula: Proteção contra necrótico = metade do Nível"),
        effect("rd", "all", "ceil(@nivel/2)", level="B", damage_type="veneno",
               label="Marca da Mácula: Proteção contra veneno = metade do Nível"),
        _sit("rollDice", "mente", 1, "B",
             "Marca da Mácula: +1 dado em intimidação (ligue quando valer)"),
    ])
    _acoes(d,
           _no_alvo("Marca da Mácula — quem te impôs uma condição negativa sofre dano contínuo necrótico",
                    "B", attr="vigor",
                    efeitos=[_sangramento("Dano contínuo necrótico (Vigor anula)", "necrotico")]),
           _no_alvo("Marca da Mácula (A) — dano contínuo necrótico até uma magia cancelar",
                    "A", efeitos=[applies("Dano contínuo necrótico (até uma magia cancelar)",
                                          fx_type="condition", fx_target="dano_continuo",
                                          duration_mode="scene", tick_amount=1,
                                          tick_type="necrotico")]))


def _bastiao_de_esperanca(d):
    _passivo(d, [
        _sit("bonus", "defense", 1, "B",
             "Bastião de Esperança: +1 na defesa por aliado inconsciente na batalha (ligue quando valer; some +1 por aliado)"),
        _sit("bonus", "all", 1, "A",
             "Bastião de Esperança (A): o mesmo bônus nas rolagens para anular condições (ligue quando valer)"),
    ])


# ---------------------------------------------------------------------------
# 2) Ações por nível com os custos do livro
# ---------------------------------------------------------------------------
def _espirito_inovador(d):
    def _f(nivel, valor):
        return action(
            f"Espírito Inovador ({nivel}) — uma cena ajustando um equipamento: +{valor} nas rolagens de uso (escolha o item)",
            level=nivel, can_roll=False, target_mode="self", include_self=True,
            applies_effects=[applies(f"Ajuste inovador: +{valor} nas rolagens do item "
                                     f"(soma dos 2 maiores dados ≤ {6 if nivel == 'B' else 4}: o item sofre dano na Dureza)",
                                     fx_type="bonus", fx_target="all", fx_value=valor,
                                     duration_mode="scene", fx_enchant=True)])
    _acoes(d, _f("B", 1), _f("A", 2))


def _alta_arcana(d):
    _acoes(d,
           _gasto("Alta Arcana — adicionar uma Metamagia a uma conjuração Menor ou Intermediária (1 PH)", "B", ph=1),
           _gasto("Alta Arcana (A) — adicionar a Metamagia pagando 2 PM no lugar do PH", "A", pm=2),
           _gasto("Alta Arcana (E) — adicionar a Metamagia sem custo", "E"))


def _ameaca_invisivel(d):
    _acoes(d,
           _rolagem("Ameaça Invisível — abateu o alvo: permanecer escondido (Agilidade)", "agilidade"),
           _rolagem("Ameaça Invisível (A) — permanecer escondido (Agilidade +1D)", "agilidade", 1, level="A"),
           _gasto("Ameaça Invisível (A) — errou ou o alvo não caiu: permanecer escondido (1 PH)", "A", ph=1),
           _gasto("Ameaça Invisível (A) — acerto enquanto escondido vira sucesso crítico (1 PH)", "A", ph=1))


def _atirador(d):
    _acoes(d,
           _em_si("Atirador — usar o movimento: sem reações de ataque nos seus ataques à distância neste turno", "B",
                  [_marca("Atirador: sem reações de ataque à distância neste turno", "rounds", 1)]),
           _em_si("Atirador (A) — usar o movimento: +1 dado nos ataques à distância neste turno", "A",
                  [_fx("Atirador (A): +1 dado à distância", "rollDice", "attackRanged", 1, rodadas=1)]),
           _gasto("Atirador (A) — sem se mover no turno: acerto à distância vira crítico (1 PH)", "A", ph=1))


def _baluarte(d):
    _acoes(d, _em_si("Baluarte (A) — ação rápida: dobrar a Proteção da armadura até sofrer dano (1 PH)", "A",
                     [_marca("Baluarte: Proteção da armadura dobrada (até sofrer dano)")], ph=1))


def _cauda(d):
    _acoes(d, _gasto("Cauda (A) — tornar um acerto com a cauda um sucesso crítico (1 PH)", "A", ph=1))


def _garras(d):
    _acoes(d, _gasto("Garras (A) — tornar um acerto com as garras um sucesso crítico (1 PH)", "A", ph=1))


def _combater_as_cegas(d):
    _acoes(d,
           _rolagem("Combater às Cegas — localizar alvo que você não pode ver (Percepção +1D)", "percepcao", 1),
           _gasto("Combater às Cegas (A) — saber onde estão todas as criaturas do combate que não estejam escondidas (1 PH)", "A", ph=1))


def _defletir_projeteis(d):
    _acoes(d, action(
        "Defletir Projéteis (A) — reação: arremessar de volta o projétil aparado (Agilidade; alcance 5m × Força; dano = o do ataque aparado)",
        level="A", roll_attr="agilidade", target_mode="target", rng="5*@forca",
        defense_attr="esquiva", defense_attr2="bloqueio"))


def _desengajar(d):
    _acoes(d, _em_si("Desengajar (A) — usar a ação: mover-se sem sofrer reações de ataque", "A",
                     [_marca("Desengajando: sem reações de ataque neste movimento", "rounds", 1)]))


def _enfrentar_a_horda(d):
    _acoes(d,
           _no_alvo("Enfrentar a Horda — mover o alvo atingido por arma corpo a corpo até 2m", "B",
                    movement={"kind": "place", "who": "targets", "distance": 2}),
           _no_alvo("Enfrentar a Horda (A) — o alvo atingido fica Imobilizado (Força anula)", "A",
                    efeitos=[_cond("Imobilizado (Força anula)", "imobilizado", "forca")]))


def _etiqueta(d):
    _acoes(d, _rolagem("Etiqueta (A) — quem falhou em te provocar: devolva na mesma moeda (Mente +1D)",
                       "mente", 1, level="A"))


def _ferocidade_primitiva(d):
    _acoes(d,
           _em_si("Investida feroz (B) — 4m+ em linha reta até o alvo: -2 no ataque, +Nível de dano", "B", [
               _fx("Investida feroz: -2 no ataque corpo a corpo", "bonus", "attackMelee", -2, rodadas=1),
               _fx("Investida feroz: +Nível de dano com a arma", "damage", "arma", "@nivel", rodadas=1)]),
           _em_si("Investida feroz (A) — 4m+ em linha reta: -1 no ataque, +Nível de dano", "A", [
               _fx("Investida feroz (A): -1 no ataque corpo a corpo", "bonus", "attackMelee", -1, rodadas=1),
               _fx("Investida feroz (A): +Nível de dano com a arma", "damage", "arma", "@nivel", rodadas=1)]))


def _forca_repentina(d):
    def _f(nivel, attr, rotulo, dados, sobrevida):
        return action(
            f"Força Repentina ({nivel}) — PV = Nível: {dados}D em {rotulo} + {sobrevida} de sobrevida (cena)",
            level=nivel, can_roll=False, target_mode="self", include_self=True,
            applies_effects=[applies(f"Força Repentina: +{dados} dado(s) em {rotulo}",
                                     fx_type="rollDice", fx_target=attr, fx_value=dados,
                                     duration_mode="scene", grant_temp_hp=sobrevida)])
    _acoes(d, _f("B", "forca", "Força", 1, 2), _f("B", "agilidade", "Agilidade", 1, 2),
           _f("A", "forca", "Força", 2, 4), _f("A", "agilidade", "Agilidade", 2, 4))


def _furia(d):
    _acoes(d, _gasto("Fúria (A) — em fúria: troque um dado do ataque corpo a corpo por 6 (1 PH)", "A", ph=1))


def _furtividade(d):
    for a in d["system"]["actions"]:
        if a["label"].startswith("Finta (A)"):
            a["level"] = "A"


def _golpe_critico_brutal(d):
    _acoes(d,
           _no_alvo("Golpe Crítico Brutal — no crítico corpo a corpo: dano final +metade da Força (1 PH)", "B",
                    ph=1, damage="ceil(@forca/2)", damage_type="final"),
           _no_alvo("Golpe Crítico Brutal (A) — no crítico corpo a corpo: dano final +Força (1 PH)", "A",
                    ph=1, damage="@forca", damage_type="final"))


def _golpe_de_sorte(d):
    _acoes(d,
           _gasto("Golpe de Sorte — 1×/cena: o ataque acerta, superando a defesa por 2", "B"),
           _gasto("Golpe de Sorte (A) — o ataque vira um 12 natural (acerto crítico) (1 PH)", "A", ph=1))


def _guia_divino(d):
    _acoes(d,
           _em_si("Guia Divino — re-rolar com 1 PH: +1D na nova rolagem", "B",
                  [_fx("Guia Divino: +1 dado na re-rolagem", "rollDice", "all", 1, rodadas=1)], ph=1),
           _em_si("Guia Divino (A) — re-rolar com 1 PH: +1D e +2 na nova rolagem", "A",
                  [_fx("Guia Divino: +1 dado na re-rolagem", "rollDice", "all", 1, rodadas=1),
                   _fx("Guia Divino (A): +2 na re-rolagem", "bonus", "all", 2, rodadas=1)], ph=1))


def _impeto(d):
    _acoes(d,
           _em_si("Ímpeto — reação ao chegar a 0 PV: recupere metade do Nível e continue de pé (1×/dia)", "B",
                  [], heal="ceil(@nivel/2)"),
           _em_si("Ímpeto (A) — reação ao chegar a 0 PV: recupere PV = Nível (1×/cena)", "A",
                  [], heal="@nivel"))


def _magia_sem(rotulo):
    def _fn(d):
        _acoes(d, _gasto(f"{d['name']} — conjurar {rotulo} (+1 PM; no Avançado não há custo extra)", "B", pm=1))
    return _fn


def _manifestacao_divina(d):
    _acoes(d, _no_alvo(
        "Manifestação Divina (A) — o aliado passou da metade: inimigos adjacentes a ele ficam Atordoados (Mente Difícil anula)",
        "A", efeitos=[applies("Atordoado (Mente Difícil anula)", fx_type="condition",
                              fx_target="atordoado", duration_mode="scene", resist=True,
                              resist_attr="mente", resist_vs_cast=False, resist_dc=10)]))


def _morte_antes_da_desonra(d):
    def _f(nivel, causa, sofre):
        return _em_si(
            f"Morte Antes da Desonra ({nivel}) — apostar a vida no combate: +{causa} de dano nos seus ataques, +{sofre} no dano que sofre",
            nivel, [_fx(f"Aposta de vida: +{causa} de dano com armas (magias: some à mão)", "damage", "arma", causa),
                    _fx(f"Aposta de vida: +{sofre} em todo dano sofrido", "vuln", "all", sofre)])
    _acoes(d, _f("B", 2, 3), _f("A", 3, 2))


def _pele_de_escamas(d):
    _acoes(d, _em_si("Pele de Escamas (A) — +1 de Proteção até o fim da cena, mas fica Lento (1 PH)", "A",
                     [_fx(f"Pele de Escamas (A): +1 Proteção {t}", "rd", t, 1)
                      for t in ("corte", "perfuracao", "concussao")]
                     + [_cond("Lento (Pele de Escamas)", "lento")], ph=1))


def _prece_de_repouso(d):
    def _f(nivel, pv):
        return action(f"Prece de Repouso ({nivel}) — ao descansar: você e os aliados que ouvirem recuperam +{pv} PV",
                      level=nivel, can_roll=False, target_mode="aura", area_filter="allies",
                      include_self=True, area=20, heal=pv, heal_resource="hp")
    _acoes(d, _f("B", 1), _f("A", 3))


def _cancao_do_viajante(d):
    _acoes(d,
           action("Canção do Viajante — ao descansar: aliados recuperam +1 PV", level="B",
                  can_roll=False, target_mode="aura", area_filter="allies", area=20,
                  heal=1, heal_resource="hp"),
           action("Canção do Viajante (A) — ao descansar: aliados recuperam +2 PV e +1 PM", level="A",
                  can_roll=False, target_mode="aura", area_filter="allies", area=20,
                  heal=2, heal_resource="hp",
                  applies_effects=[applies("Canção do Viajante: +1 PM", fx_type="restore",
                                           fx_target="mp", fx_value=1)]))


def _presa_de_caca(d):
    _acoes(d,
           _no_alvo("Presa de Caça (A) — crítico contra o tipo: sangramento (Vigor anula)", "A",
                    attr="agilidade", efeitos=[_sangramento("Sangramento (Vigor anula)")]),
           _no_alvo("Presa de Caça (A) — acerto com arma em alvo sangrando: Lento (Vigor anula)", "A",
                    attr="agilidade", efeitos=[_cond("Lento (Vigor anula)", "lento", "vigor")]),
           _no_alvo("Presa de Caça (A) — segundo acerto em alvo sangrando: Imobilizado (Vigor anula)", "A",
                    attr="agilidade", efeitos=[_cond("Imobilizado (Vigor anula)", "imobilizado", "vigor")]))


def _presenca_do_leao(d):
    _passivo(d, [_sit("rollDice", "mente", 1, "A",
                      "Presença do Leão (A): +1 dado em interação social (ligue quando valer)")])

    def _f(nivel, efeitos, rotulo):
        return action(f"Presença do Leão ({nivel}) — início do combate: {rotulo} (role o seu MAIOR atributo primário vs Mente)",
                      level=nivel, roll_attr="forca", target_mode="target",
                      defense_attr="mente", applies_effects=efeitos)
    pasmo = applies("Pasmo (Mente anula)", fx_type="condition", fx_target="pasmo",
                    duration_mode="scene", resist=True, resist_attr="mente")
    abalado = applies("Abalado (Mente anula)", fx_type="condition", fx_target="abalado",
                      duration_mode="scene", resist=True, resist_attr="mente")
    _acoes(d, _f("B", [pasmo], "inimigos que o veem ficam Pasmos"),
           _f("A", [pasmo, abalado], "inimigos ficam Pasmos e Abalados"))


def _proteger(d):
    _acoes(d,
           _no_alvo("Proteger — escolher um aliado adjacente como protegido (você recebe metade do dano bruto dele)", "B",
                    efeitos=[_marca("Protegido: metade do dano bruto vai para o protetor")]),
           _no_alvo("Proteger (A) — protegido: você sofre todo o dano dele (sem limite de protegidos)", "A",
                    efeitos=[_marca("Protegido (A): todo o dano vai para o protetor")]))


def _provocar(d):
    for a in d["system"]["actions"]:
        if a["label"].startswith("Provocar") and not a["appliesEffects"]:
            a["appliesEffects"].append(_marca(
                "Provocado: deve escolher quem provocou como alvo dos ataques (Percepção anula)",
                resist=True, resist_attr="percepcao"))


def _reflexos(d):
    _acoes(d, _gasto("Reflexos (A) — Esquiva falhou: mude o resultado para um 12 natural (1 PH)", "A", ph=1))


def _sem_brechas(d):
    _acoes(d, _gasto("Sem Brechas — anular os dados de melhoria de um ataque contra você; declare antes da rolagem "
                     "(no Avançado, some os dados anulados à sua defesa) (1 PH)", "B", ph=1))


def _tenacidade(d):
    _acoes(d, _em_si("Converter bônus em sobrevida (A — o dobro: 2 de sobrevida por acúmulo, usando o movimento)", "A",
                     [], heal=2, heal_resource="hpTemp", temp_stack=True))


def _juramento(d):
    _acoes(d,
           action("Aura do Juramento (A — 3+ Pontos): aliados na aura recebem 1D nas defesas e ficam imunes a Abalado",
                  level="A", can_roll=False, target_mode="aura", area_filter="allies",
                  include_self=True, area=3,
                  applies_effects=[_fx("Aura do Juramento: +1 dado nas defesas", "rollDice", "defense", 1)]),
           action("Aura do Juramento (A — 5+ Pontos): 1D nas defesas e nos ataques (raio = Pontos)",
                  level="A", can_roll=False, target_mode="aura", area_filter="allies",
                  include_self=True, area=5,
                  applies_effects=[_fx("Aura do Juramento: +1 dado nas defesas", "rollDice", "defense", 1),
                                   _fx("Aura do Juramento: +1 dado nos ataques", "rollDice", "attack", 1)]))


# ---------------------------------------------------------------------------
# 3) Manobras com Armas (Sessão 14) — Usar Armas [x], 1 PH
# ---------------------------------------------------------------------------
_MEIO = {"forca": "ceil(@forca/2)", "agilidade": "ceil(@agilidade/2)",
         "vigor": "ceil(@vigor/2)", "percepcao": "ceil(@percepcao/2)",
         "nivel": "ceil(@nivel/2)"}
_ROT = {"forca": "metade da Força", "agilidade": "metade da Agilidade",
        "vigor": "metade do Vigor", "percepcao": "metade da Percepção",
        "nivel": "metade do Nível"}


def _manobra(nome, execucao, tag, dano=None, bonus=None, alvo=None, nota="",
             attr_alvo="forca", dano_rot=""):
    """Ações de uma manobra: o preparo (1 PH, bônus de 1 rodada na tipagem
    da arma) e, se houver, o efeito no alvo atingido (sem novo custo)."""
    def _fn(d):
        efeitos, partes = [], []
        if dano:
            formula = _MEIO.get(dano, dano)
            efeitos.append(_fx(f"{nome}: +dano com a arma", "damage", f"arma:{tag}", formula, rodadas=1))
            partes.append(dano_rot or (f"+{_ROT[dano]} de dano" if dano in _ROT else "+dano"))
        if bonus:
            efeitos.append(_fx(f"{nome}: +{bonus} no ataque", "bonus", f"arma:{tag}", bonus, rodadas=1))
            partes.append(f"+{bonus} no ataque" if not str(bonus).startswith("@") else "+Nível no ataque")
        resumo = ", ".join(partes)
        rotulo = f"Manobra: {nome} ({execucao}; 1 PH)"
        if resumo:
            rotulo += f" — {resumo}; depois ataque com a arma"
        if nota:
            rotulo += f". {nota}"
        if efeitos:
            prep = _em_si(rotulo, "B", efeitos, ph=1)
        else:
            prep = _gasto(rotulo, "B", ph=1)
        acoes = [prep]
        if alvo:
            rot_alvo, ef_alvo, extra = alvo
            acoes.append(_no_alvo(f"{nome} — no alvo atingido: {rot_alvo}", "B",
                                  attr=attr_alvo, efeitos=ef_alvo, **extra))
        d["system"]["actions"].extend(acoes)
    return _fn


_MANOBRAS = {
    "Lâminas Grandes": _manobra("Corte Cruel", "Ação", "laminas_grandes", dano="agilidade",
                                nota="Na defesa, o alvo re-rola o dado de maior resultado"),
    "Dardos": _manobra("Disparo em Recuo", "Ação e Movimento", "dardos", dano="agilidade",
                       nota="Ataque dois alvos e depois desloque-se"),
    "Chicotes": _manobra("Flagelo Constritor", "Ação", "chicotes", dano="agilidade", attr_alvo="agilidade",
                         alvo=("Agarrado até o fim da cena (Força anula)",
                               [_cond("Agarrado (Força anula)", "agarrado", "forca")], {})),
    "Bestas": _manobra("Evidenciar Fraqueza", "Ação", "bestas", dano="percepcao",
                       alvo=("Indefeso até o fim da cena (não anula)",
                             [_cond("Indefeso — ponto fraco evidente", "indefeso")], {})),
    "Martelos": _manobra("Golpe Esmagador", "Ação", "martelos", dano="vigor",
                         alvo=("derrubado (Caído)", [_cond("Caído", "caido")], {})),
    "Picaretas": _manobra("Eviscerar", "Ação", "picaretas", dano="forca",
                          alvo=("sangramento", [_sangramento("Sangramento (Vigor anula)", "perfuracao")], {})),
    "Arremesso": _manobra("Golpear e Arremessar", "Ação", "arremesso", dano="forca",
                          nota="Ataque corpo a corpo e arremesse a mesma arma em outro alvo; o bônus vale para o 2º alvo"),
    "Arcos": _manobra("Ferida Dolorosa", "Ação", "arcos", dano="nivel", attr_alvo="agilidade",
                      alvo=("penalidade nos ataques = metade da sua Percepção (só cuidados médicos anulam)",
                            [_fx("Ferida Dolorosa: penalidade nos ataques", "bonus", "attack",
                                 "-ceil(@percepcao/2)")], {})),
    "Leves": _manobra("Golpes Gêmeos", "Livre", "leve", dano="agilidade",
                      nota="Ao atacar com a mão primária, ataque também com a arma leve da secundária; o bônus vale para o 2º ataque"),
    "Maças": _manobra("Maré de Ferro", "Ação", "macas", dano="vigor",
                      alvo=("empurrado tantos metros quanto o dano adicional", [],
                            {"movement": {"kind": "push", "who": "targets",
                                          "distance": "ceil(@vigor/2)"}})),
    "Lâminas Pequenas": _manobra("Rastro de Sangue", "Ação e Movimento", "laminas_pequenas",
                                 nota="Ataque e desloque-se; quem tentar uma reação de ataque nesse trajeto ataca a si mesmo"),
    "Manguais": _manobra("Órbita de Aço", "Ação", "manguais", dano="vigor",
                         alvo=("outra criatura adjacente sofre concussão igual ao dano adicional", [],
                               {"damage": "ceil(@vigor/2)", "damage_type": "concussao"})),
    "Desarmado": _manobra("Rajada de Golpes", "Ação", "desarmado",
                          nota="Até três ataques desarmados com a mesma ação, sem penalidade"),
    "Militar": _manobra("Precisão Incontestável", "Ação", "militar", bonus=4),
    "Corpo a Corpo": _manobra("Reação Ofensiva", "Reação", "corpo_a_corpo", dano="nivel",
                              nota="Quando uma criatura adjacente desengaja: no acerto, o movimento dela termina adjacente a você"),
    "Uma Mão": _manobra("Pressão de Aço", "Ação e Movimento", "uma_mao", bonus="@nivel",
                        dano="max(ceil(@agilidade/2),ceil(@forca/2))",
                        dano_rot="+metade da Agilidade ou da Força (a maior) de dano",
                        nota="Antes, golpeie com soco/escudo/cabo da secundária (ação abaixo)",
                        alvo=("golpe da mão secundária: Força vs Esquiva, acerto deixa Pasmo", [
                            applies("Pasmo (Mente anula)", fx_type="condition", fx_target="pasmo",
                                    duration_mode="scene", resist=True, resist_attr="mente")],
                              {"can_roll": True})),
    "Simples": _manobra("Romper Defesa", "Ação", "simples",
                        nota="Se errar, o alvo sofre 1 de dano (tipo da arma) a cada 2 pontos de diferença entre ataque e defesa"),
    "Fundas": _manobra("Tiro Atordoante", "Ação", "fundas", dano="forca", attr_alvo="agilidade",
                       alvo=("Atordoado (Vigor anula)", [_cond("Atordoado (Vigor anula)", "atordoado", "vigor")], {})),
    "Artilharia": _manobra("Tiro Certeiro", "Ação", "artilharia", dano="percepcao",
                           nota="Se mirou antes, use a versão “mirado” (Percepção inteira)"),
    "Duas Mãos": _manobra("Todos Sangram", "Ação", "duas_maos",
                          nota="Contra criatura com os PV máximos: o ataque ignora a Proteção",
                          alvo=("sangramento", [_sangramento("Sangramento (Vigor anula)")], {})),
    "Haste": _manobra("Ameaça Definitiva", "Reação", "haste", dano="agilidade",
                      nota="Contra um inimigo dentro do alcance da arma de haste"),
    "Lanças": _manobra("Atravessar Armaduras", "Ação", "lancas", dano="agilidade",
                       nota="O ataque ignora a Proteção do alvo e causa 1 de dano à armadura dele"),
    "Machados": _manobra("Arauto do Terror", "Ação", "machados", dano="forca",
                         nota="Se o alvo bloquear, o escudo dele sofre 2 de dano"),
}


def _tiro_certeiro_mirado(d):
    d["system"]["actions"].append(_em_si(
        "Manobra: Tiro Certeiro mirado (Ação; 1 PH) — mirou antes: +Percepção de dano; depois ataque com a arma", "B",
        [_fx("Tiro Certeiro (mirado): +dano com a arma", "damage", "arma:artilharia", "@percepcao", rodadas=1)], ph=1))


def _arauto_do_terror(d):
    d["system"]["actions"].append(action(
        "Arauto do Terror — o alvo caiu com 0 PV: inimigos que o veem rolam Mente contra a sua Força ou ficam Abalados",
        level="B", roll_attr="forca", target_mode="target", defense_attr="mente",
        applies_effects=[applies("Abalado (Mente anula)", fx_type="condition", fx_target="abalado",
                                 duration_mode="scene", resist=True, resist_attr="mente")]))


def _usar_armas(d):
    grupo = _sub(d["name"])
    fn = _MANOBRAS.get(grupo)
    if fn:
        fn(d)
    if grupo == "Artilharia":
        _tiro_certeiro_mirado(d)
    if grupo == "Machados":
        _arauto_do_terror(d)


# ---------------------------------------------------------------------------
# Tabelas
# ---------------------------------------------------------------------------
AUDIT = {
    "Acrobacia": _acrobacia,
    "Atletismo": _atletismo,
    "Alerta": _alerta,
    "Firmeza Física": _firmeza_fisica,
    "Senso Lógico": _senso_logico,
    "Guerra Santa": _guerra_santa,
    "Sobrevivência": _sobrevivencia,
    "Corredor": _corredor,
    "Recuperar o Fôlego": _recuperar_o_folego,
    "Implacável": _implacavel,
    "Táticas de Grupo": _tatica_de_grupo,
    "Preparação Arcana": _preparacao_arcana,
    "Magia Unilateral": _magia_unilateral,
    "Operar Mecanismos": _operar_mecanismos,
    "Vontade de Ferro": _vontade_de_ferro,
    "Precisão Arcana": _precisao_arcana,
    "Marca da Mácula": _marca_da_macula,
    "Bastião de Esperança": _bastiao_de_esperanca,
    "Espírito Inovador": _espirito_inovador,
    "Alta Arcana": _alta_arcana,
    "Ameaça Invisível": _ameaca_invisivel,
    "Atirador": _atirador,
    "Baluarte": _baluarte,
    "Cauda": _cauda,
    "Garras": _garras,
    "Combater às Cegas": _combater_as_cegas,
    "Defletir Projéteis": _defletir_projeteis,
    "Desengajar": _desengajar,
    "Enfrentar a Horda": _enfrentar_a_horda,
    "Etiqueta": _etiqueta,
    "Ferocidade Primitiva": _ferocidade_primitiva,
    "Força Repentina": _forca_repentina,
    "Fúria": _furia,
    "Furtividade": _furtividade,
    "Golpe Crítico Brutal": _golpe_critico_brutal,
    "Golpe de Sorte": _golpe_de_sorte,
    "Guia Divino": _guia_divino,
    "Ímpeto": _impeto,
    "Magia Sem Gestos": _magia_sem("sem componentes gestuais"),
    "Magia Sem Materiais": _magia_sem("sem componentes materiais"),
    "Magia Silenciosa": _magia_sem("sem componentes verbais"),
    "Manifestação Divina": _manifestacao_divina,
    "Morte Antes da Desonra": _morte_antes_da_desonra,
    "Pele de Escamas": _pele_de_escamas,
    "Prece de Repouso": _prece_de_repouso,
    "Canção do Viajante": _cancao_do_viajante,
    "Presença do Leão": _presenca_do_leao,
    "Proteger": _proteger,
    "Provocar": _provocar,
    "Reflexos": _reflexos,
    "Sem Brechas": _sem_brechas,
    "Tenacidade Assustadora": _tenacidade,
}

# Sub-grupos: o nome chega aqui ainda com parênteses ("Usar Armas (Machados)").
AUDIT_PREFIXOS = [
    ("Explorador (", _explorador),
    ("Trilhador (", _trilhador),
    ("Presa de Caça (", _presa_de_caca),
    ("Juramento (", _juramento),
    ("Usar Armas (", _usar_armas),
]


def apply_audit(doc):
    """Aplica a revisão ao documento (só habilidades)."""
    if doc.get("type") != "habilidade":
        return
    nome = doc["name"]
    fn = AUDIT.get(nome)
    if fn:
        fn(doc)
    for prefixo, fn in AUDIT_PREFIXOS:
        if nome.startswith(prefixo):
            fn(doc)
