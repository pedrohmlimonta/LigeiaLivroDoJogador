# -*- coding: utf-8 -*-
"""Dano escalonado.

No Ligeia, "+N" no dano significa dano escalonado: N é o dano base e o
ataque soma +1 a cada 2 pontos acima da defesa do alvo (é o "Dano
escalonado" das ações do sistema). Um número sem o "+" é dano fixo.

- Armas (equipamentos, inclusive as naturais e o Cajado usado como arma):
  o livro dá "Dano Base: Perfuração +1" — todos os ataques escalam.
- Magias: decide a linha "Dano:" da descrição. "Fogo +1 (Esquiva)" escala;
  "Energia 1 (Indefensável, não escalonável)" e "Dano Final de Energia 1
  (Esquiva, não escalável)" não. Magias sem essa linha (dano bruto de uma
  aura ou de um terreno, PM drenados) ficam fixas.
- Habilidades: os ataques que o livro escreve com "+" ou como "dano base"
  de um ataque — armas naturais (Garras, Presas, Cauda), Artes Marciais
  (dano base dos ataques desarmados), Golpear com Escudo (Concussão +0) e
  Sopro de Dragão (dano base metade do Nível). Dano bruto, final ou
  adicional (Afinidade, Letalidade, Punição, Golpe Crítico Brutal...) é fixo.
- Dano final nunca escala.
"""
import re

_LINHA_DANO = re.compile(r"Dano:\s*([^\n(]*?)\s*\(([^)]*)\)")
_NAO_ESCALA = re.compile(r"n[ãa]o\s+escal", re.I)

# (nome da habilidade, ações escalonadas pelo rótulo)
HABILIDADES_ESCALONADAS = (
    ("Artes Marciais", r"^Ataque Desarmado Marcial"),
    ("Cauda", r"^Ataque de Cauda"),
    ("Garras", r"^Ataque de Garras"),
    ("Presas", r"^Ataque de Presas"),
    ("Golpear com Escudo", r"^Ataque com Escudo"),
    ("Sopro de Dragão", r"^Sopro de Dragão"),
)


def _texto(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html or ""))


def _tem_dano(a):
    return str(a.get("damage", "")).strip() != "" and a.get("damageResource", "hp") == "hp"


def _mesmo_item(nome, base):
    """'Sopro de Dragão (Fogo)' e 'Sopro de Dragão [Fogo]' são 'Sopro de Dragão'."""
    return nome == base or (nome.startswith(base) and nome[len(base)] in " ([")


def escalonamento_da_magia(descricao):
    """True/False pela linha "Dano:" da descrição; None se ela não existir."""
    m = _LINHA_DANO.search(_texto(descricao))
    if not m:
        return None
    return "+" in m.group(1) and not _NAO_ESCALA.search(m.group(2))


def aplicar_escalonamento(doc):
    """Liga/desliga o dano escalonado das ações conforme o livro."""
    tipo, s = doc["type"], doc["system"]
    acoes = s.get("actions", [])
    if tipo == "equipamento":
        for a in acoes:
            if _tem_dano(a) and (a.get("isWeapon") or a.get("label", "").startswith("Ataque —")):
                a["scalingDamage"] = True
    elif tipo == "magia":
        escala = escalonamento_da_magia(s.get("description", ""))
        if escala is not None:
            for a in acoes:
                if _tem_dano(a):
                    a["scalingDamage"] = escala
    elif tipo == "habilidade":
        for nome, rotulo in HABILIDADES_ESCALONADAS:
            if _mesmo_item(doc["name"], nome):
                for a in acoes:
                    if _tem_dano(a) and re.search(rotulo, a.get("label", "")):
                        a["scalingDamage"] = True
    for a in acoes:
        if a.get("damageType") == "final":
            a["scalingDamage"] = False
