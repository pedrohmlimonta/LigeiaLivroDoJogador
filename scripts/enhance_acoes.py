# -*- coding: utf-8 -*-
"""ECONOMIA DE AÇÕES (sistema ligeia-rpg build 31) — passada sobre todos os
documentos do compêndio, rodada no fim do enhance.enhance().

O sistema passou a contar, por rodada, 1 ação padrão, 1 de movimento, 1
simples (a "ação rápida" do livro), 1 reação e ações livres à vontade — tudo
opcional, ligado pelo Narrador. Cada ação de item diz qual delas gasta
(`actionCost`) e o que precisa de ação para continuar de pé é SUSTENTADO
(um vínculo na ficha de quem sustenta cobra a ação a cada turno).

O que esta passada faz:

1. CUSTO DE CADA AÇÃO — toda ação do compêndio sai com `actionCost`:
     · o que os dados já disseram fica;
     · ações disparadas por outra (em cadeia, ativação prévia) não cobram:
       a principal já pagou;
     · magias: o tempo de conjuração (Ação → padrão, Ação Rápida → simples,
       Movimento, Reação; Cena/Hora → nenhuma);
     · ataques com arma → padrão;
     · o rótulo e a ativação da habilidade ("Ação rápida", "Reação (nível
       A)", "Livre"...), o texto do nível ("usando sua ação rápida", "usar
       sua reação", "gastar seu movimento", "ação livre", "usar sua ação");
     · rolagens prontas de perícia, complementos de um ataque ("no alvo
       atingido", "no crítico") e o que não é ação de combate → nenhuma.
   A tabela CUSTOS cobre o que o texto não diz direito.

2. COBERTURA — todo item de jogo (habilidade, traço, magia, equipamento,
   complicação) tem ao menos uma ação: a que executa o efeito ou a que faz a
   rolagem; o que é só regra vira uma ação que anuncia a regra no chat (o
   rótulo resume). EXTRAS traz as ações feitas à mão.

3. SUSTENTAÇÃO — magias "Sustentável/Sustentação — X": efeitos postos em
   alguém sustentam pelo efeito (fxSustain), áreas e auras persistentes pela
   área (persistSustain, até o fim da cena enquanto sustentadas) e criaturas
   invocadas pela criatura (summons[].sustain).

4. BÔNUS DE UMA HABILIDADE EM OUTRA — "Carisma concede +1 em Conjuração
   para esta conjuração" (nas magias), Presença Ardente nas três habilidades
   que cita, Mestre do Conhecimento nos Conhecimentos...: o efeito passivo já
   vem na habilidade que dá o bônus, mirado no item que o recebe
   ("item:<nome>").
"""
import re
import unicodedata

from builders import action, applies, effect, summon

CUSTOS_VALIDOS = ("none", "standard", "movement", "simple", "reaction", "free")
ROTULO_CUSTO = {"none": "nenhuma", "standard": "ação padrão", "movement": "ação de movimento",
                "simple": "ação simples", "reaction": "reação", "free": "ação livre"}


def _norm(s):
    s = re.sub(r"<[^>]+>", " ", str(s or ""))
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", s.lower()).strip()


def _chave(nome):
    """Nome sem colchetes/parênteses: "Explorador (Florestas)" e
    "Explorador [Florestas]" casam igual (a passada roda antes dos colchetes)."""
    return re.sub(r"[\[\]()]", "", _norm(nome)).strip()


# ---------------------------------------------------------------------------
# 1) Inferência pelo texto
# ---------------------------------------------------------------------------
_VERBO = r"(?:usa(?:r|ndo)?|gasta(?:r|ndo)?|com|como|em|abdicar\s+de)"
_PADROES_TEXTO = [
    ("simple", rf"\b{_VERBO}\s+(?:a\s+|uma\s+|sua\s+)?acao\s+(?:rapida|simples)\b|\bacao\s+(?:rapida|simples)\s+para\b"),
    ("reaction", rf"\b{_VERBO}\s+(?:a\s+|uma\s+|sua\s+)?reacao\b(?!\s+de\s+ataque)"),
    ("movement", rf"\b{_VERBO}\s+(?:o\s+|um\s+|seu\s+)?movimento\b|\bacao\s+de\s+movimento\b"),
    ("free", r"\bacao\s+livre\b"),
    ("standard", rf"\b{_VERBO}\s+(?:a\s+|uma\s+|sua\s+)?acao\b(?!\s+(?:rapida|simples|livre|de\s+movimento))"),
]


def custo_pelo_texto(texto):
    """A primeira menção a uma ação no texto ("usando sua ação rápida (em vez
    do seu movimento)" → simples). None se o texto não diz."""
    t = _norm(texto)
    melhor = None
    for custo, padrao in _PADROES_TEXTO:
        m = re.search(padrao, t)
        if m and (melhor is None or m.start() < melhor[1]):
            melhor = (custo, m.start())
    return melhor[0] if melhor else None


# Tempo de conjuração das magias.
CONJURACAO = {"acao": "standard", "acao rapida": "simple", "acao simples": "simple",
              "movimento": "movement", "reacao": "reaction", "acao livre": "free",
              "cena": "none", "hora": "none", "uma hora": "none", "ritual": "none"}


def custo_da_conjuracao(casting):
    t = _norm(casting)
    if t in CONJURACAO:
        return CONJURACAO[t]
    if t.startswith("acao rapida") or t.startswith("acao simples"):
        return "simple"
    if t.startswith("reacao"):
        return "reaction"
    if t.startswith("movimento"):
        return "movement"
    if t.startswith("acao"):
        return "standard"
    return "none"


def custo_da_ativacao(ativacao, nivel):
    """O campo "Ativação" das habilidades ("Ação rápida", "Reação (nível A)",
    "Livre (ao acertar...)", "Ritual após descanso"). Um "(nível X)" restringe
    ao nível dito (e aos acima dele)."""
    t = _norm(ativacao)
    if not t:
        return None
    m = re.search(r"nivel\s+([bae])\b", t)
    if m:
        ordem = {"B": 0, "A": 1, "E": 2}
        if ordem.get(nivel, 0) < ordem[m.group(1).upper()] or nivel == "all":
            return None
    if t.startswith(("acao rapida", "acao simples")):
        return "simple"
    if t.startswith("reacao"):
        return "reaction"
    if t.startswith("movimento"):
        return "movement"
    if t.startswith("livre"):
        return "free"
    if t.startswith("ritual"):
        return "none"
    if t.startswith("acao"):
        return "standard"
    return None


# Rolagens prontas ("Acrobacia — rolar Agilidade +1D"): a rolagem acompanha o
# que o personagem está fazendo — quem cobra é a ação que ele faz.
_ROLAGEM_PRONTA = re.compile(r"— rolar [a-zçãéêíóú]+(?: \+\d+d)?(?: \(a\))?$")

# Complementos: o que vem junto de um ataque/magia que já pagou a ação, os
# gatilhos (início do combate, ao descansar...) e as viradas com ponto
# heróico.
_COMPLEMENTO = re.compile(
    r"no alvo atingido|o alvo atingido|alvo atingido|no critico|critico contra|ao acertar"
    r"|acerto com|segundo acerto|alvo sangrando|ao descansar|inicio do combate|quem te impos"
    r"|o aliado passou|em furia:|tornar um acerto|vira (?:um )?(?:sucesso )?critico|vira um 12"
    r"|acerto (?:a distancia |enquanto escondido )?vira|ao usar um poder divino|abateu o alvo"
    r"|errou ou o alvo|1x/cena: o ataque|o ataque vira|re-rolar com 1 ph|conjurar sem componentes"
    r"|adicionar (?:uma|a) metamagia|anular os dados de melhoria|ataques extras|letalidade"
    r"|sucesso critico em uma atividade|criar um .fato|comunicar-se com|manobra arriscada"
    r"|pv = nivel|reacao ao chegar|dano continuo necrotico|uma cena ajustando|ph recupera"
    r"|apostar a vida|4m\+ em linha reta|saber onde estao|permanecer escondido|1 pm re-rola"
)


def _manobra(lbl):
    """Manobras com Armas: "Manobra: X (Ação; 1 PH) — ...; depois ataque com a
    arma". O ataque com a arma paga a ação padrão; a manobra cobra só o que
    passa disso (o movimento, a reação, a livre)."""
    m = re.match(r"manobra: [^(]*\(([^;)]*)", lbl)
    if not m:
        return None
    tipo = m.group(1).strip()
    if "movimento" in tipo:
        return "movement"
    if tipo.startswith("reacao"):
        return "reaction"
    if tipo.startswith("livre"):
        return "free"
    return "none"


def _rotulo(lbl):
    """O que o próprio rótulo diz ("— reação: ...", "ação rápida:", "usar o
    movimento: ...", "usar a ação: ...")."""
    if re.search(r"\breacao\b(?!\s+(?:de ataque|furiosa|ofensiva))|\(reacao\)", lbl):
        return "reaction"
    if re.search(r"acao (?:rapida|simples)", lbl):
        return "simple"
    if re.search(r"usar o movimento|usando o movimento|\(movimento\b", lbl):
        return "movement"
    if re.search(r"\bacao livre\b|\(livre\b", lbl):
        return "free"
    if re.search(r"usar a acao\b|usando a acao\b", lbl):
        return "standard"
    return None


def _texto_do_nivel(tipo, sysd, nivel):
    if tipo in ("habilidade", "complicacao"):
        campo = {"A": "descAdvanced", "E": "descSpecial"}.get(nivel, "descBasic")
        return sysd.get(campo) or ""
    return sysd.get("description") or ""


def _internas(acoes):
    """Índices das ações que outra ação do mesmo item dispara (em cadeia ou
    antes da rolagem): elas não cobram ação de novo."""
    out = set()
    for a in acoes:
        for elo in list(a.get("chainActions") or []) + list(a.get("preActivations") or []):
            partes = str(elo.get("ref") or "").split("|")
            if len(partes) >= 3 and partes[0] == "action":
                try:
                    out.add(int(partes[2] or 0))
                except ValueError:
                    pass
    return out


def decidir_custo(doc_tipo, nome, sysd, a, i, internas=frozenset()):
    """(custo, motivo) de uma ação — ver o cabeçalho do arquivo."""
    if a.get("actionCost") in CUSTOS_VALIDOS:
        return a["actionCost"], "dados"
    lbl = _norm(a.get("label"))
    especial = _custo_especial(nome, lbl)
    if especial:
        return especial, "tabela"
    if i in internas or lbl.startswith("↳"):
        return "none", "disparada por outra ação"
    if doc_tipo == "magia":
        return custo_da_conjuracao(sysd.get("casting")), "tempo de conjuração"
    m = _manobra(lbl)
    if m:
        return m, "manobra (o ataque com a arma paga a ação padrão)"
    if a.get("isWeapon") or lbl.startswith("ataque"):
        return "standard", "ataque"
    if _ROLAGEM_PRONTA.search(lbl):
        return "none", "rolagem pronta"
    r = _rotulo(lbl)
    if r:
        return r, "rótulo"
    if _COMPLEMENTO.search(lbl):
        return "none", "complemento/gatilho"
    nivel = a.get("level", "all")
    at = custo_da_ativacao(sysd.get("activation"), "B" if nivel == "all" else nivel)
    if at:
        # "Ação (ataque)": o que rola é o ataque; o resto vem junto dele.
        if "(ataque)" in _norm(sysd.get("activation")) and not a.get("canRoll"):
            return "none", "complemento do ataque"
        return at, "ativação"
    t = custo_pelo_texto(_texto_do_nivel(doc_tipo, sysd, nivel))
    if t:
        return t, "texto do nível"
    return "none", "padrão"


# ---------------------------------------------------------------------------
# Tabela: o que o texto não diz direito (nome do item → [(trecho do rótulo,
# custo)]; trecho vazio = todas as ações do item).
# ---------------------------------------------------------------------------
CUSTOS = {
    # "sempre que sofrer dano, pode gastar 1 PM" (livre); converter: ação
    # (B) ou movimento (A).
    "tenacidade assustadora": [("acumular", "free"), ("(a ", "movement"), ("converter", "standard")],
    # Forma Animal: transformar-se é a ação rápida; os benefícios do Avançado
    # vêm junto da transformação.
    "forma animal": [("beneficio", "none"), ("forma animal", "simple")],
    # Espírito Guardião: invocar é a ação rápida (campo Ativação).
    # Fúria: entrar é livre, no seu turno; o 6 no dado vem com o ataque.
    "furia": [("entrar", "free"), ("troque", "none")],
    # Manifestação Divina: a reação é a cura; o atordoamento vem junto.
    "manifestacao divina": [("passou da metade", "none"), ("", "reaction")],
    # Carisma: a Presença é livre (nível A).
    # Proteger: escolher o protegido no seu turno, sem ação.
    "proteger": [("", "free")],
    # Investida feroz: vem com o ataque corpo a corpo.
    "ferocidade primitiva": [("", "none")],
    # Postura incauta: livre no seu turno.
    "guerreiro incauto": [("", "free")],
    # Presença do Leão / Presença Aterradora: começam com o combate (livre).
    "presenca do leao": [("", "free")],
    "presenca aterradora": [("", "free")],
    # Canção e Prece: no descanso.
    "cancao do viajante": [("", "none")],
    "prece de repouso": [("", "none")],
    # Inspirar: ação (campo Ativação); Grito de Guerra e Provocar: ação rápida.
    # Medicina: prestar cuidados médicos é uma ação.
    "medicina": [("cuidados", "standard")],
    # Golpe Cegante: o golpe é o ataque; o Avançado muda a condição dele.
    "golpe cegante": [("(a ", "none"), ("", "standard")],
    # Cauda, Garras, Presas, Artes Marciais: ataque; o resto vem junto.
    "presas": [("ataque", "standard"), ("", "none")],
    "garras": [("ataque", "standard"), ("", "none")],
    "cauda": [("ataque", "standard"), ("agarrar", "standard"), ("", "none")],
    "artes marciais": [("", "standard")],
    # Golpear com Escudo: o ataque com o escudo sai com o movimento.
    "golpear com escudo": [("", "movement")],
    # Defletir Projéteis (A): a devolução é a reação.
    "defletir projeteis": [("arremessar de volta", "reaction")],
    # Desengajar (A): gastar a ação para se mover sem reações de ataque.
    "desengajar": [("usar a acao", "standard")],
    # Zona de Ameaça: o ataque é a reação; o Indefeso vem junto.
    "zona de ameaca": [("o alvo atingido", "none"), ("", "reaction")],
    # Ímpeto e Reflexos: reação.
    "impeto": [("", "reaction")],
    "reflexos": [("", "reaction")],
    # Acrobacia (A): pagar 1 PH e usar a reação.
    "acrobacia": [("reacao", "reaction")],
    # Firmeza Física (A): reação.
    "firmeza fisica": [("reacao", "reaction")],
    # Baluarte (A): ação rápida.
    "baluarte": [("", "simple")],
    # Atirador: gastar o movimento (B) — no Avançado, a ação rápida também.
    "atirador": [("sem se mover", "none"), ("acao rapida", "simple"), ("usar o movimento", "movement")],
    # Etiqueta (A): devolver a provocação na hora (livre).
    "etiqueta": [("devolva", "free")],
    # Furtividade (A): a finta é o movimento.
    "furtividade": [("finta", "movement")],
    # Juramento (A): a aura existe enquanto houver pontos — sem ação.
    "juramento": [("", "none")],
    # Pele de Escamas (A): 1 PH, sem ação.
    "pele de escamas": [("", "free")],
    # Tornar-se invisível na penumbra, regeneração da cena: sem ação.
    "desaparecer": [("", "free")],
    "fluxo arcano": [("", "free")],
    # Ritual de Proteção (uma cena) e Pacto (ritual após descanso).
    "protecao dos espiritos": [("", "none")],
    # Morte Antes da Desonra: declarado quando o combate começa.
    "morte antes da desonra": [("", "free")],
    # Força Repentina: gatilho (chegar a PV = Nível).
    "forca repentina": [("", "none")],
    # Recuperar o Fôlego: gastar o ponto heróico para se curar (livre).
    "recuperar o folego": [("", "free")],
    # Impulso de Combate: vem com o ataque corpo a corpo.
    "impulso de combate": [("", "none")],
    # Guia Divino: vem com a re-rolagem.
    "guia divino": [("", "none")],
    # Sem Brechas: declarado antes da rolagem do atacante (livre).
    "sem brechas": [("", "free")],
    # Golpe de Sorte / Golpe Crítico Brutal / Letalidade / Golpe Letal: vêm
    # com o ataque.
    "golpe de sorte": [("", "none")],
    "golpe critico brutal": [("", "none")],
    "letalidade": [("", "none")],
    "golpe letal": [("", "none")],
    # Enfrentar a Horda: vem com o ataque.
    "enfrentar a horda": [("", "none")],
    # Marca da Mácula: gatilho.
    "marca da macula": [("", "none")],
    # Espírito Inovador: uma cena ajustando o equipamento.
    "espirito inovador": [("", "none")],
    # Ameaça Invisível: vem com o ataque escondido.
    "ameaca invisivel": [("", "none")],
    # Combater às Cegas (A): 1 PH, sem ação.
    "combater as cegas": [("1 ph", "free")],
    # Afinidade: livre, ao acertar a magia.
    "afinidade magica elemental": [("", "free")],
    # Punição: livre, ao acertar o ataque corpo a corpo.
    "punicao": [("", "free")],
    # Alta Arcana e as Magias sem componentes: vêm com a conjuração.
    "alta arcana": [("", "none")],
    # Moldar Energia (traço do Deus da Forja?): a moldagem é uma ação.
    "moldar energia": [("", "standard")],
    # Sangue Aagn: "Usando sua ação rápida".
    "sangue aagn": [("", "simple")],
    # Filhos de Ruff: a re-rolagem vem com a rolagem.
    "filhos de ruff": [("", "none")],
    # Teleporte Faérian: é o deslocamento de teletransporte (o movimento que a
    # ação faz no token não é cobrado de novo — ver esmodules/economia.mjs).
    "filhos de auralia": [("", "movement")],
    # Natação e voo: o deslocamento é cobrado quando o token se move.
    "movimento de natacao": [("", "none")],
}


def _custo_especial(nome, lbl):
    regras = CUSTOS.get(_chave(nome))
    if regras is None:
        # Famílias com sub-grupo: "Afinidade Mágica Elemental [Fogo]" etc.
        base = re.sub(r"\s*[\[(].*$", "", str(nome or ""))
        regras = CUSTOS.get(_chave(base))
    if not regras:
        return None
    for trecho, custo in regras:
        if not trecho or trecho in lbl:
            return custo
    return None


def atribuir_custos(doc_tipo, nome, sysd):
    """Grava actionCost em cada ação do item (e devolve as decisões)."""
    acoes = sysd.get("actions") or []
    internas = _internas(acoes)
    out = []
    for i, a in enumerate(acoes):
        custo, motivo = decidir_custo(doc_tipo, nome, sysd, a, i, internas)
        a["actionCost"] = custo
        out.append((i, a.get("label", ""), custo, motivo))
    return out


# ---------------------------------------------------------------------------
# 2) Cobertura: as ações feitas à mão (EXTRAS) e as geradas pelo texto
# ---------------------------------------------------------------------------
def _info(label, level="all", custo="none", **kw):
    """Ação que anuncia a regra no chat (o rótulo resume o que ela faz)."""
    kw.setdefault("target_mode", "none")
    return action(label, level=level, can_roll=False, action_cost=custo, **kw)


def _rolar(label, attr, level="all", dice=0, bonus=0, custo="none", **kw):
    """Rolagem pronta (o atributo, com o dado/bônus que a regra dá)."""
    kw.setdefault("target_mode", "none")
    return action(label, level=level, roll_attr=attr, roll_dice=dice, roll_bonus=bonus,
                  action_cost=custo, **kw)


def _em_si(label, efeito, fx_type, fx_target, fx_value, level="all", custo="none",
           rodadas=None, **kw):
    """Ação que põe um efeito em você (1 rodada, N rodadas ou a cena)."""
    ap = applies(efeito, fx_type=fx_type, fx_target=fx_target, fx_value=fx_value,
                 duration_mode="rounds" if rodadas else "scene",
                 duration_rounds=rodadas or 1)
    return action(label, level=level, can_roll=False, target_mode="self", include_self=True,
                  applies_effects=[ap], action_cost=custo, **kw)


def _sit(etype, target, value, label, level="all"):
    """Efeito situacional: começa desligado (ligue-o na ficha quando valer)."""
    e = effect(etype, target, value, level=level, label=label)
    e["enabled"] = False
    return e


_ATTR_ROTULO = {"forca": "Força", "agilidade": "Agilidade", "vigor": "Vigor", "mente": "Mente",
                "percepcao": "Percepção", "conjuracao": "Conjuração", "esquiva": "Esquiva",
                "bloqueio": "Bloqueio"}


def _mirar(label, bonus, level, custo):
    return _em_si(label, f"Mirando (+{bonus} no próximo ataque à distância)", "bonus",
                  "attackRanged", bonus, level=level, custo=custo, rodadas=1)


# --- Habilidades ------------------------------------------------------------
def _x_asas(nome, s):
    return [_info("Asas — voar em vez de andar, com o seu movimento (termine em solo firme)", "B"),
            _em_si("Asas (A) — voando, o dobro do Deslocamento: correr sem gastar a ação padrão",
                   "Voando (correr sem a ação padrão)", "action", "corrida", 1, level="A", rodadas=1)]


def _x_atirador_mov(nome, s):
    return [_mirar("Atirador em Movimento — mirar com o movimento e ainda andar metade do Deslocamento: +1 no próximo ataque à distância", 1, "B", "movement"),
            _mirar("Atirador em Movimento (A) — mirar com a ação rápida: +1 no próximo ataque à distância", 1, "A", "simple")]


def _x_eximio(nome, s):
    return [_mirar("Exímio Atirador — mirar sem se mover no turno: +2 no próximo ataque à distância", 2, "B", "movement"),
            _mirar("Exímio Atirador (A) — mirar sem se mover no turno: +3 no próximo ataque à distância", 3, "A", "movement")]


def _x_companheiro(nome, s):
    return [_info("Companheiro Animal — ordenar a Ação de Companheiro (ação rápida)", "B", "simple"),
            _info("Companheiro Animal (A) — ordenar a Ação de Companheiro com a ação livre", "A", "free")]


def _x_familiar(nome, s):
    return [_info("Familiar — ordenar que o familiar ataque (sua ação)", "B", "standard"),
            _info("Familiar — ordenar que o familiar se desloque (seu movimento)", "B", "movement"),
            _info("Familiar (A) — conjurar a partir da posição do familiar", "A", "none")]


def _x_contragolpe(nome, s):
    return [_info("Contragolpe — reação: atacar quem errou um ataque contra você", "B", "reaction"),
            _info("Contragolpe (A) — reação: atacar quem fez um ataque contra você (acertando ou não)", "A", "reaction")]


def _x_recarga(nome, s):
    return [_info("Recarga Rápida — recarregar uma arma de Recarga com a ação rápida", "B", "simple"),
            _info("Recarga Rápida (A) — recarregar uma arma de Recarga com a ação livre", "A", "free")]


def _x_saque(nome, s):
    return [_info("Saque Rápido — trocar de arma com o movimento", "B", "movement"),
            _info("Saque Rápido (A) — trocar de arma com a ação rápida", "A", "simple")]


def _x_predador(nome, s):
    return [_info("Predador Astuto — marcar um inimigo visível: seus ataques com arma contra ele recebem os dados de melhoria de Percepção (cena)", "B", "free"),
            _info("Predador Astuto (A) — os ataques contra a presa recebem também os dados de melhoria de Mente", "A", "free")]


def _x_sismico(nome, s):
    return [action("Sentido Sísmico — criaturas tocando o solo no raio (2× Percepção)", level="B",
                   can_roll=False, target_mode="aura", area="2*@percepcao", action_cost="none"),
            action("Sentido Sísmico (A) — criaturas tocando o solo no raio (3× Percepção): tipo e tamanho", level="A",
                   can_roll=False, target_mode="aura", area="3*@percepcao", action_cost="none")]


def _x_melhorar(nome, s):
    m = re.search(r"[\[(](.+?)[\])]", nome)
    attr = {"forca": "forca", "agilidade": "agilidade", "vigor": "vigor", "mente": "mente",
            "percepcao": "percepcao"}.get(_norm(m.group(1)) if m else "", "forca")
    return [_rolar(f"{nome} — rolar {_ATTR_ROTULO[attr]} (com o dado do atributo)", attr, "B")]


def _x_palavra(nome, s):
    m = re.search(r"[\[(](.+?)[\])]", nome)
    palavra = m.group(1) if m else "a palavra"
    return [_rolar(f"{nome} — rolar Conjuração (magias de {palavra})", "conjuracao", "B")]


def _x_mercado(nome, s):
    return [_rolar("Mercado Negro — informações dos mercados proibidos (Mente)", "mente", "B")]


EXTRAS_HAB = [
    (r"^asas$", _x_asas),
    (r"^atirador em movimento$", _x_atirador_mov),
    (r"^eximio atirador$", _x_eximio),
    (r"^companheiro animal$", _x_companheiro),
    (r"^familiar$", _x_familiar),
    (r"^contragolpe$", _x_contragolpe),
    (r"^recarga rapida$", _x_recarga),
    (r"^saque rapido$", _x_saque),
    (r"^predador astuto$", _x_predador),
    (r"^sentido sismico$", _x_sismico),
    (r"^melhorar atributo ", _x_melhorar),
    (r"^palavra arcana ", _x_palavra),
    (r"^mercado negro$", _x_mercado),
]

# --- Traços ------------------------------------------------------------------
_COND_VONTADE = (("abalado", "Abalado"), ("dominado", "Dominado"), ("enfeiticado", "Enfeitiçado"),
                 ("atordoado", "Atordoado"), ("pasmo", "Pasmo"), ("dano_continuo", "Dano Contínuo Psíquico"))


def _x_presenca_ardente(nome, s):
    s["effects"] += [effect("bonus", f"item:{h}", "ceil(@nivel/2)",
                            label=f"Presença Ardente: +metade do Nível em {h}")
                     for h in ("Presença Aterradora", "Provocar", "Grito de Guerra")]
    return [_info("Presença Ardente — +metade do Nível nas rolagens de Presença Aterradora, Provocar e Grito de Guerra (já somado nelas)")]


def _x_vontade_diamante(nome, s):
    s["effects"] += [effect("bonus", f"resistir:{c}", 1,
                            label=f"Vontade de Diamante: +1 contra {r} (Vontade de Ferro Básico)")
                     for c, r in _COND_VONTADE]
    s["effects"] += [_sit("bonus", f"resistir:{c}", 1,
                          f"Vontade de Diamante: +1 contra {r} (Vontade de Ferro Avançado — ligue)")
                     for c, r in _COND_VONTADE]
    return [_rolar("Vontade de Diamante — resistir (Mente; o bônus já entra nas rolagens contra as condições)", "mente")]


def _x_ancestral_faerian(nome, s):
    s["effects"] += [effect("rollDice", f"resistir:{c}", 1, label=f"Ancestral Faerian: 1D contra {r}")
                     for c, r in (("dominado", "Dominado"), ("enfeiticado", "Enfeitiçado"), ("abalado", "Abalado"))]
    return [_rolar("Ancestral Faerian — resistir a Dominado, Enfeitiçado e Abalado (Mente +1D)", "mente", dice=1)]


def _x_contra_magia(nome, s):
    s["effects"] += [effect("rollDice", "defenseMagia", 1, label=f"{nome}: 1D para se defender de magias"),
                     _sit("rollDice", "all", 1, f"{nome}: 1D para evitar e resistir a magias (ligue quando valer)")]
    return [_info(f"{nome} — 1D para se defender, evitar e resistir a magias")]


def _x_illain(nome, s):
    s["effects"] += [_sit("rollDice", "item:Furtividade", 1, "Filhos de Illain: 1D em Furtividade (ambiente selvagem — ligue)"),
                     _sit("rollDice", "esquiva", 1, "Filhos de Illain: 1D em Esquiva (ambiente selvagem — ligue)")]
    return [_rolar("Filhos de Illain — furtividade em ambiente selvagem (Agilidade +1D)", "agilidade", dice=1)]


def _x_cacada(nome, s):
    s["effects"] += [_sit("rollDice", "attack", 1, "Caçada de Sangue: 1D nos ataques contra criaturas feridas (ligue)")]
    return [_em_si("Caçada de Sangue — atacar uma criatura ferida: 1D no ataque",
                   "Caçada de Sangue (1D no ataque)", "rollDice", "attack", 1, rodadas=1)]


def _x_furia_draconiana(nome, s):
    s["effects"] += [_sit("bonus", "attack", 1, "Fúria Draconiana: +1 nos ataques (mais da metade dos PV perdidos — ligue)")]
    return [_info("Fúria Draconiana — com mais da metade dos PV perdidos, +1 nos ataques (ligue o efeito)")]


def _x_resist_veneno(nome, s):
    alvo = "venenos e doenças" if "pequeninos" in _norm(nome) else "envenenamento"
    s["effects"] += [_sit("rollDice", "vigor", 1, f"{nome}: 1D contra {alvo} (ligue)")]
    return [_rolar(f"{nome} — resistir a {alvo} (Vigor +1D)", "vigor", dice=1)]


def _x_sangue_ruim(nome, s):
    s["effects"] += [_sit("rollDice", "vigor", 1, "Sangue Ruim: 1D contra fome, sede, sono e clima (ligue)")]
    return [_rolar("Sangue Ruim — resistir a fome, sede, sono ou clima (Vigor +1D)", "vigor", dice=1)]


def _x_rolagem_traco(attr, texto):
    def f(nome, s):
        return [_rolar(f"{nome} — {texto} ({_ATTR_ROTULO[attr]} +1D)", attr, dice=1)]
    return f


EXTRAS_TRACO = [
    (r"^presenca ardente$", _x_presenca_ardente),
    (r"^vontade de diamante$", _x_vontade_diamante),
    (r"^ancestral faerian$", _x_ancestral_faerian),
    (r"^filhos de (?:agalard|ellon)$", _x_contra_magia),
    (r"^filhos de illain$", _x_illain),
    (r"^cacada de sangue$", _x_cacada),
    (r"^furia draconiana$", _x_furia_draconiana),
    (r"^resistencia (?:ana|dos pequeninos)$", _x_resist_veneno),
    (r"^sangue ruim$", _x_sangue_ruim),
    (r"^camuflagem natural$", _x_rolagem_traco("agilidade", "esconder-se em terreno rochoso")),
    (r"^filhos de palim$", _x_rolagem_traco("mente", "lidar com minerais")),
    (r"^inventor de engenhocas$", _x_rolagem_traco("mente", "identificar, reparar e criar itens mecânicos")),
]

# --- Equipamentos --------------------------------------------------------------
def _ref_item(doc_id, nome):
    return {"ref": f"item|{doc_id}|0|{str(nome).replace('|', '/')}", "enabled": True}


def _x_equip(doc, nome, s):
    """Ações dos equipamentos pela categoria e pela propriedade do livro."""
    cat = _norm(s.get("category"))
    desc = _norm(s.get("description"))
    acoes = []
    if cat.startswith("armadura") or cat.startswith("manoplas"):
        acoes.append(action(f"Vestir {nome} (liga o item)", can_roll=False, target_mode="none",
                            pre_activations=[_ref_item(doc["_id"], nome)], action_cost="none"))
    elif cat.startswith("escudo"):
        acoes.append(action(f"Empunhar {nome} (liga o item)", can_roll=False, target_mode="none",
                            pre_activations=[_ref_item(doc["_id"], nome)], action_cost="standard"))
    elif cat.startswith("montaria"):
        m = re.search(r"deslocamento: (\d+)m", desc)
        desl = int(m.group(1)) if m else 12
        acoes.append(_em_si(f"Montar {nome} (Deslocamento {desl}m enquanto montado)",
                            f"Montado: {nome} (Deslocamento {desl}m)", "set", "deslocamento", desl,
                            custo="movement"))
    return acoes


_EQUIP = {
    "ferramentas de ladrao": lambda n: [_rolar("Arrombar uma fechadura (Agilidade +1)", "agilidade", bonus=1, custo="standard")],
    "ferramentas de navegacao": lambda n: [_rolar("Traçar um curso / não se perder no mar (Mente +1)", "mente", bonus=1)],
    "kit de disfarces": lambda n: [_rolar("Disfarçar-se (Mente +1)", "mente", bonus=1)],
    "arpeu": lambda n: [_rolar("Escalar com o arpéu e a corda (Força +1)", "forca", bonus=1)],
    "ariete de mao": lambda n: [_rolar("Derrubar a porta com o aríete (Força; até três aliados prestam auxílio)", "forca", custo="standard")],
    "caixa de fogo": lambda n: [_info("Acender uma tocha ou objeto com combustível (ação; sem combustível, uma cena)", custo="standard")],
    "propulsor de ar": lambda n: [_info("Saltar com o propulsor (+10m na distância do salto; gasta as duas cápsulas)")],
    "kit de primeiros socorros": lambda n: [action("Cuidados médicos com o kit (Mente +1 — cura 1 PV) (consumível)",
                                                   roll_attr="mente", roll_bonus=1, vs_difficulty=True,
                                                   fixed_difficulty=10, target_mode="target", include_self=True,
                                                   is_melee=True, heal=1, action_cost="standard")],
    "remedio": lambda n: [action("Tomar o remédio (equivale a cuidados médicos bem sucedidos — cura 1 PV) (consumível)",
                                 can_roll=False, target_mode="self", include_self=True, heal=1,
                                 action_cost="simple")],
    "estrepes": lambda n: [action("Espalhar os estrepes (até 6 espaços — quem entrar rola Agilidade Difícil ou fica Lento)",
                                  can_roll=False, target_mode="area", area="1.5", rng=5, persist_area=True,
                                  persist_rounds=0, persist_trigger="enter", action_cost="standard",
                                  applies_effects=[applies("Lento (estrepes — Agilidade Difícil anula)",
                                                           fx_type="condition", fx_target="lento",
                                                           duration_mode="rounds", duration_rounds=1,
                                                           resist=True, resist_attr="agilidade",
                                                           resist_vs_cast=False, resist_dc=12)])],
    "tocha": lambda n: [_em_si("Acender a tocha (ilumina 5m por 1 hora)", "Tocha acesa (luz 5m)", "emanation",
                               "emanacao:", 5, custo="standard")],
    "lanterna": lambda n: [_em_si("Acender a lanterna (ilumina 10m; um frasco de óleo dura 1 hora)",
                                  "Lanterna acesa (luz 10m)", "emanation", "emanacao:", 10, custo="standard")],
}

# --- Complicações ------------------------------------------------------------
# Efeito Colateral [palavra]: o que acontece com você (ou em volta) quando a
# Conjuração sai 12 ou menos. Dano final em você, condição até o fim da cena
# (com a anulação do livro) ou aviso ao Narrador.
_COLATERAL = {
    "acida": ("dano", "acido", 1), "ignis": ("dano", "fogo", 1), "sankta": ("dano", "radiante", 1),
    "carmo": ("pv", 1), "vitae": ("pv", 1), "inanis": ("pm", 1),
    "energio": ("aura", "energia", 1),
    "augurado": ("cond", "pasmo", "mente"), "forjuri": ("cond", "paralisado", "vigor"),
    "glacios": ("cond", "lento", "forca"), "iluzio": ("cond", "pasmo", "vigor"),
    "lumo": ("cond", "pasmo", "percepcao"), "noxia": ("cond", "enfraquecido", "vigor"),
    "saeculorum": ("cond", "lento", None), "tenebrae": ("cond", "cego", "percepcao"),
    "traumato": ("cond", "atordoado", "mente"), "sonigu": ("cond_aura", "surdo", "percepcao"),
    "sorcdiron": ("menos2", "mente"),
}
_ROTULO_COND = {"pasmo": "Pasmo", "paralisado": "Paralisado", "lento": "Lento", "enfraquecido": "Enfraquecido",
                "cego": "Cego", "atordoado": "Atordoado", "surdo": "Surdo"}


def _x_colateral(nome, s):
    m = re.search(r"[\[(](.+?)[\])]", nome)
    palavra = _norm(m.group(1)) if m else ""
    txt = re.sub(r"<[^>]+>", " ", s.get("descBasic") or "")
    t = re.search(r"Efeito Colateral — ([^:]+):\s*(.*?)(?:\s*Regra:|$)", txt, re.S)
    titulo = t.group(1).strip() if t else "Efeito Colateral"
    o_que = re.sub(r"\s+", " ", t.group(2)).strip().rstrip(".") if t else ""
    rot = f"{titulo} — {o_que}"
    spec = _COLATERAL.get(palavra)
    base = dict(level="B", action_cost="none", can_roll=False)
    if not spec:
        return [_info(f"Efeito Colateral: {rot} (Narrador)", "B")]
    k = spec[0]
    if k == "dano":
        return [action(f"Efeito Colateral: {rot}", target_mode="self", include_self=True,
                       damage=str(spec[2]), damage_type="final", **base)]
    if k == "pv":
        return [action(f"Efeito Colateral: {rot}", target_mode="none", cost_hp=spec[1], **base)]
    if k == "pm":
        return [action(f"Efeito Colateral: {rot}", target_mode="none", cost_mp=spec[1], **base)]
    if k == "aura":
        return [action(f"Efeito Colateral: {rot}", target_mode="aura", area=1, include_self=True,
                       damage=str(spec[2]), damage_type="final", **base)]
    if k in ("cond", "cond_aura"):
        cond, attr = spec[1], spec[2]
        anula = f"{_ATTR_ROTULO[attr]} anula" if attr else "não anula"
        ap = applies(f"{_ROTULO_COND[cond]} até o fim da cena ({anula})", fx_type="condition",
                     fx_target=cond, duration_mode="scene", resist=bool(attr),
                     resist_attr=attr or "vigor", resist_vs_cast=False, resist_dc=10)
        if k == "cond_aura":
            return [action(f"Efeito Colateral: {rot}", target_mode="aura", area=1, include_self=True,
                           applies_effects=[ap], **base)]
        return [action(f"Efeito Colateral: {rot}", target_mode="self", include_self=True,
                       applies_effects=[ap], **base)]
    if k == "menos2":
        ap = applies("Reversão: -2 em todas as rolagens até o fim da cena (Mente anula)", fx_type="bonus",
                     fx_target="all", fx_value=-2, duration_mode="scene", resist=True,
                     resist_attr="mente", resist_vs_cast=False, resist_dc=10)
        return [action(f"Efeito Colateral: {rot}", target_mode="self", include_self=True,
                       applies_effects=[ap], **base)]
    return [_info(f"Efeito Colateral: {rot}", "B")]


def _x_teste_mente(rotulo, dificuldade=None, bonus=0):
    def f(nome, s):
        kw = {}
        if dificuldade:
            kw = dict(vs_difficulty=True, fixed_difficulty=dificuldade)
        return [_rolar(f"{nome} — {rotulo}", "mente", "B", bonus=bonus, **kw)]
    return f


def _x_reroll6(nome, s):
    attr = next((e["target"] for e in s.get("effects", []) if e.get("type") == "reroll6"), "mente")
    return [_rolar(f"{nome} — rolar {_ATTR_ROTULO.get(attr, attr)} (re-role os 6; sem dados de melhoria)", attr, "B")]


def _x_social(pen):
    def f(nome, s):
        return [_rolar(f"{nome} — interação social (Mente {pen})", "mente", "B", bonus=pen)]
    return f


def _x_insanidade(nome, s):
    m = re.search(r"[\[(](.+?)[\])]", nome)
    qual = m.group(1) if m else ""
    txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s.get("descBasic") or ""))
    r = re.search(re.escape(qual) + r":\s*(.*?)(?:\s*Regra:|$)", txt)
    regra = _resumo(r.group(1)) if r else _resumo(txt)
    return [_info(f"{nome} — {regra}", "B")]


EXTRAS_COMPLICACAO = [
    (r"^efeito colateral ", _x_colateral),
    (r"^(?:debil|desajeitado|distraido|doenca grave|fraco)$", _x_reroll6),
    (r"^deformacao$", _x_social(-3)),
    (r"^(?:mudo|surdo)$", _x_social(-2)),
    (r"^pacifista$", _x_teste_mente("manter-se pacífico ao sofrer dano (Mente vs 10 + o dano sofrido)")),
    (r"^insanidade fobia$", _x_teste_mente("contato visual com a criatura temida (Mente, ou Abalado até o fim da cena)")),
    (r"^insanidade homicidio$", _x_teste_mente("conter o impulso (Mente Difícil)", 12)),
    (r"^insanidade (?:megalomania|suicidio)$", _x_teste_mente("início do turno: resistir ao impulso (Mente vs 8 + PV perdidos)", "8+@pvmax-@pv")),
    (r"^insanidade (?:cleptomania|compulsividade)$", _x_teste_mente("resistir nesta cena (Mente)")),
    (r"^insanidade ", _x_insanidade),
]


# --- Gerador pelo texto (o que sobra) ---------------------------------------
_FRASES = re.compile(r"[^.!?]+[.!?]?")
# Frase que diz a REGRA (e não a ambientação): números, rolagens, recursos,
# ações, condições, "você recebe/tem acesso/é incapaz"...
_MECANICA = re.compile(
    r"\d|rolage|\brola|dano|b[oô]nus|\bPV\b|\bPM\b|pontos? de (?:vida|magia)|her[oó]ic|condi[cç][aã]o"
    r"|Deslocamento|Prote[cç][aã]o|\ba[cç][aã]o\b|rea[cç][aã]o|movimento|ataque|defesa|Esquiva|Bloqueio"
    r"|Conjura[cç][aã]o|incapaz|imune|\brecebe\b|n[aã]o pode|n[aã]o precisa|acesso|permite|ilumina|enxerga"
    r"|consegue|sacad",
    re.I)


def _resumo(texto, limite=140):
    """A frase que diz a regra, curta: a primeira com mecânica (a ambientação
    fica de fora); "Escolha ..." leva junto a frase seguinte; nos
    equipamentos, o que vem depois de "Propriedade:"."""
    t = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", str(texto or ""))).strip()
    t = re.split(r"\s*(?:Regra:|Raças?:|Herança:|Para se livrar dela:|\(Diário do Oráculo)", t)[0].strip()
    if "Propriedade:" in t:
        t = t.split("Propriedade:", 1)[1].strip()
    t = re.sub(r"^\((?:Épica|Épico)\)\s*", "", t)
    frases = [f.strip() for f in _FRASES.findall(t) if f.strip()]
    if not frases:
        return ""
    i = next((k for k, f in enumerate(frases) if _MECANICA.search(f)), 0)
    frase = frases[i].rstrip(".")
    if frase.startswith("Escolha") and i + 1 < len(frases):
        frase = f"{frase}; {frases[i + 1].rstrip('.')}"
    frase = frase[:1].upper() + frase[1:]
    if len(frase) > limite:
        frase = frase[:limite].rsplit(" ", 1)[0].rstrip(",;:") + "…"
    return frase


def _niveis_com_texto(doc_tipo, s):
    if doc_tipo in ("habilidade", "complicacao"):
        out = []
        for nivel, campo in (("B", "descBasic"), ("A", "descAdvanced"), ("E", "descSpecial")):
            t = _norm(s.get(campo))
            if t and t not in ("—", "-"):
                out.append((nivel, s.get(campo)))
        return out
    return [("all", s.get("description") or "")]


def acoes_pelo_texto(doc_tipo, nome, s):
    """Uma ação por nível com texto: anuncia a regra (o rótulo resume) e gasta
    o que o texto disser."""
    out = []
    for nivel, texto in _niveis_com_texto(doc_tipo, s):
        resumo = _resumo(texto)
        if not resumo:
            continue
        suf = f" ({nivel})" if nivel in ("A", "E") else ""
        rotulo = f"{nome}{suf} — {resumo}"
        custo = _custo_especial(nome, _norm(rotulo)) or custo_pelo_texto(texto) or "none"
        # O rótulo diz a ação que gasta, quando gasta (a regra pode ter ficado
        # de fora do resumo: "...sacados com uma ação livre").
        if custo != "none" and ROTULO_CUSTO[custo] not in _norm(rotulo).replace("rapida", "simples"):
            rotulo = f"{rotulo} ({ROTULO_CUSTO[custo]})"
        out.append(_info(rotulo, nivel if doc_tipo in ("habilidade", "complicacao") else "all", custo))
    if not out:
        out.append(_info(f"{nome} — anunciar no chat", "B" if doc_tipo in ("habilidade", "complicacao") else "all"))
    return out


def _extras(tabela, nome):
    k = _chave(nome)
    for padrao, f in tabela:
        if re.search(padrao, k):
            return f
    return None


def garantir_acoes(doc_tipo, nome, s, doc_id=""):
    """Todo item de jogo sai com ação. Devolve quantas acrescentou."""
    if s.get("actions"):
        # Equipamentos com ações (armas) ganham as de categoria (mirar, etc.).
        return 0
    novas = []
    if doc_tipo == "habilidade":
        f = _extras(EXTRAS_HAB, nome)
        novas = f(nome, s) if f else []
    elif doc_tipo == "traco":
        f = _extras(EXTRAS_TRACO, nome)
        novas = f(nome, s) if f else []
    elif doc_tipo == "complicacao":
        f = _extras(EXTRAS_COMPLICACAO, nome)
        novas = f(nome, s) if f else []
    elif doc_tipo == "equipamento":
        f = _EQUIP.get(_chave(nome))
        novas = f(nome) if f else _x_equip({"_id": doc_id}, nome, s)
    if not novas:
        novas = acoes_pelo_texto(doc_tipo, nome, s)
    s["actions"] = novas
    return len(novas)


def acoes_das_armas(nome, s):
    """Armas à distância ganham Mirar (o livro: abdicar do movimento para +1
    no próximo ataque com a arma); as de Recarga, a recarga (movimento)."""
    acoes = s.get("actions") or []
    if not any(a.get("isWeapon") for a in acoes):
        return
    tags = {_norm(t) for t in s.get("tags") or []}
    rotulos = {_norm(a.get("label")) for a in acoes}
    distancia = any(a.get("isWeapon") and not a.get("isMelee") for a in acoes)
    if distancia and not any(r.startswith("mirar") for r in rotulos):
        acoes.append(_mirar(f"Mirar com {nome} (abdica do movimento: +1 no próximo ataque à distância)", 1, "all", "movement"))
    if "recarga" in tags and not any(r.startswith("recarregar") for r in rotulos):
        acoes.append(_info(f"Recarregar {nome} (movimento; Recarga Rápida: ação rápida ou livre)", custo="movement"))


# ---------------------------------------------------------------------------
# 3) Sustentação das magias
# ---------------------------------------------------------------------------
_RE_SUSTENTA = re.compile(r"^sustent(?:avel|acao)\s*[—-]\s*(.+)$")


def custo_de_sustentar(duracao):
    """"Sustentável — Ação Rápida" → "simple"; None se não é sustentável."""
    m = _RE_SUSTENTA.match(_norm(duracao))
    if not m:
        return None
    c = custo_da_conjuracao(m.group(1))
    return c if c != "none" else None


def sustentar(acoes, custo):
    """Marca o que a ação deixa de pé como sustentado por `custo`:
      · área/aura persistente → a área (até o fim da cena, enquanto sustentada);
      · criaturas invocadas → as criaturas;
      · senão, os efeitos postos nos alvos — com UM vínculo por ação: o
        sistema junta os efeitos pelo rótulo, então os de uma mesma ação
        passam a ter o mesmo rótulo (senão seriam dois vínculos, duas ações
        por turno)."""
    for a in acoes:
        if a.get("actionCost") == "none" and a.get("_interna"):
            continue
        if a.get("persistArea"):
            a["persistSustain"] = custo
            a["persistRounds"] = "0"
            continue
        if a.get("summons"):
            for sm in a["summons"]:
                sm["sustain"] = custo
                sm["rounds"] = "0"
            continue
        aps = a.get("appliesEffects") or []
        if not aps:
            continue
        if len(aps) > 1:
            rotulos = list(dict.fromkeys(ap.get("label", "") for ap in aps if ap.get("label")))
            junto = " · ".join(rotulos)
            for ap in aps:
                ap["label"] = junto
        for ap in aps:
            ap["fxSustain"] = custo
            ap["durationMode"] = "scene"


# ---------------------------------------------------------------------------
# 4) Bônus de uma habilidade em outra
# ---------------------------------------------------------------------------
_RE_CONCEDE = re.compile(r"([A-ZÁ-Ú][\wÀ-ú]*(?: (?:de|do|da|com|\([^)]*\)|[A-ZÁ-Ú][\wÀ-ú]*))*)"
                         r" concede \+1 em Conjuração para esta conjuração")
_BONUS_MAGIAS = None


def _bonus_das_magias():
    """{habilidade (nome do livro, com parênteses): [magias]} — "Carisma
    concede +1 em Conjuração para esta conjuração"."""
    global _BONUS_MAGIAS
    if _BONUS_MAGIAS is None:
        from data_magias_1 import MAGIAS_1
        from data_magias_2 import MAGIAS_2
        mapa = {}
        for d in MAGIAS_1 + MAGIAS_2:
            texto = re.sub(r"<[^>]+>", " ", d["system"].get("description", ""))
            for m in _RE_CONCEDE.finditer(texto):
                mapa.setdefault(_chave(m.group(1)), []).append(d["name"])
        _BONUS_MAGIAS = mapa
    return _BONUS_MAGIAS


_CONHECIMENTOS = ("Arcano", "Guerra", "História", "Natureza", "Ocultismo", "Religião")


def bonus_cruzados(doc_tipo, nome, s):
    """Acrescenta os efeitos passivos que esta habilidade dá a OUTROS itens.
    Devolve quantos acrescentou."""
    if doc_tipo != "habilidade":
        return 0
    novos = []
    for magia in _bonus_das_magias().get(_chave(nome), []):
        novos.append(effect("bonus", f"item:{magia}", 1, level="B",
                            label=f"{_nome_colchetes(nome)}: +1 em Conjuração de {magia}"))
    if _chave(nome) == "mestre do conhecimento":
        for c in _CONHECIMENTOS:
            novos.append(effect("rollDice", f"item:Conhecimento [{c}]", 1, level="B",
                                label=f"Mestre do Conhecimento: 1D em Conhecimento [{c}]"))
            novos.append(effect("rollDice", f"item:Conhecimento [{c}]", 1, level="A",
                                label=f"Mestre do Conhecimento (A): 2D em Conhecimento [{c}]"))
    if not novos:
        return 0
    # Um item ativável só vale ligado: os bônus que sempre valem pedem o item
    # PASSIVO, com o que era situacional virando interruptor (desligado, como
    # nas perícias do enhance_audit).
    if s.get("mode") == "active" and not [c for c in s.get("costs", []) if c.get("value") not in ("0", "")]:
        from enhance import _efeito_incondicional
        for e in s.get("effects", []):
            if e.get("enabled", True) and not _efeito_incondicional(e):
                e["enabled"] = False
        s["mode"] = "passive"
        s["active"] = False
    s["effects"] = list(s.get("effects", [])) + novos
    return len(novos)


def _nome_colchetes(nome):
    return re.sub(r"\s\(([^()]*)\)$", r" [\1]", str(nome))


# ---------------------------------------------------------------------------
# Entrada: chamada pelo enhance.enhance() em cada documento (e instantâneo)
# ---------------------------------------------------------------------------
TIPOS_DE_JOGO = ("habilidade", "magia", "equipamento", "traco", "complicacao")


def aplicar(doc_tipo, nome, s, doc_id="", doc=None):
    if doc_tipo not in TIPOS_DE_JOGO:
        return
    garantir_acoes(doc_tipo, nome, s, doc_id)
    if doc_tipo == "equipamento":
        acoes_das_armas(nome, s)
        # "Este item é consumido quando utilizado": a ação "(consumível)" tira
        # 1 da pilha ao ser usada (esmodules/consumiveis.mjs).
        if doc is not None and any(re.search(r"\(consumível\)$", a.get("label", "")) for a in s.get("actions", [])):
            doc.setdefault("flags", {}).setdefault("ligeia-livro-do-jogador", {})["consumivel"] = True
    bonus_cruzados(doc_tipo, nome, s)
    atribuir_custos(doc_tipo, nome, s)
    if doc_tipo == "magia":
        custo = custo_de_sustentar(s.get("duration"))
        if custo:
            internas = _internas(s.get("actions") or [])
            sustentar([a for i, a in enumerate(s.get("actions") or []) if i not in internas], custo)
    # Nenhum item do compêndio cobra ação para ser LIGADO: os ativáveis daqui
    # são situações (sem armadura, no terreno escolhido...) — quem gasta é a
    # ação que o item tem.
    s.setdefault("actionCost", "none")
    s.setdefault("sustain", {"enabled": False, "action": "simple"})
