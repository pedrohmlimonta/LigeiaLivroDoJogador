# Ligeia RPG — Livro do Jogador (Compêndios)

Módulo de compêndios para o sistema não-oficial [`ligeia-rpg`](https://github.com/pedrohmlimonta) do Foundry VTT (v13/v14), com o conteúdo de jogador do **Livro de Regras do Ligeia RPG** pronto para arrastar e soltar nas fichas.

## Conteúdo

| Pack | Documentos | Fonte no livro |
| --- | --- | --- |
| **Habilidades** | 266 | Sessão 9 — cada sub-grupo é um item próprio (ex.: `Usar Armas (Machados)`, `Palavra Arcana (ignis)`, `Espírito Guardião (Urso)`), com descrições dos níveis Básico e Avançado, custos, pré-requisitos, listas e, quando aplicável, ações, efeitos e custos de ativação já configurados |
| **Magias** | 70 | Sessão 11 — todas as magias de exemplo (Círculo Menor) das 28 palavras arcanas, com características, dano, efeitos aplicáveis (condições com rolagem de resistência), peculiaridades de criação e custo de 1 PM nas ações |
| **Equipamentos** | 110 | Sessão 10 — armaduras (com efeitos de Proteção/penalidade), todas as armas (com ações de ataque, dano e alcance), escudos, munições, ferramentas, itens gerais, montarias e serviços |
| **Traços** | 41 | Sessões 4 e 5 — traços de todas as raças e das cinco heranças, com efeitos mecânicos onde cabível |
| **Raças** | 15 | Sessão 4 — cada raça com descrição, características (dado de melhoria, tamanho, idiomas, corrupção), bônus de deslocamento, lista de habilidades iniciais e os traços raciais embutidos (grantedTraits) |
| **Heranças** | 5 | Sessão 5 — custo, restrições, corrupção, lista de habilidades e traços da herança embutidos |
| **Vocações** | 12 | Sessão 6 — bônus de PV/PM e lista completa de habilidades iniciais |
| **Carreiras** | 4 | Sessão 16 — pré-requisitos, lista de progressão (com habilidades de nível Épico) e a característica como traço embutido (ex.: Arquimago +2 PM) |

### Convenções mecânicas

- **Efeitos com nível**: efeitos marcados `(B)` valem desde o nível Básico; efeitos `(A)` somam-se ao mudar o item para Avançado (ex.: Corredor: +3m no B e +2m no A, totalizando +5m).
- **Valores "metade do Nível"**: o sistema não escala efeitos por nível automaticamente, então esses efeitos foram registrados com valor 1 e rótulo `(metade do Nível — ajuste)`. Ajuste o valor na ficha conforme o nível do personagem.
- **Dano "+Nível"** (Cauda, Garras, Presas, Artes Marciais, Sopro de Dragão): a fórmula de dano da ação vem com o valor base 1 e a instrução no rótulo — edite o número conforme o nível.
- **Habilidades de modo ativo** (Fúria, Espírito Guardião, Forma Animal, Pacto...) já vêm com `mode: active` e custos de ativação configurados; ligue/desligue na ficha.
- **Condições aplicáveis**: ações que impõem condições (Abalado, Cego, Dano Contínuo...) usam `appliesEffects` com a rolagem de resistência indicada no livro (ex.: *Vigor anula*).

## Instalação

**Pelo manifesto** (após publicar uma release):

```
https://github.com/pedrohmlimonta/LigeiaLivroDoJogador/releases/latest/download/module.json
```

**Manual**: clone/extraia esta pasta em `Data/modules/ligeia-livro-do-jogador/`. Os packs compilados (`packs/`) já acompanham o repositório.

Requer o sistema `ligeia-rpg` (mínimo 0.2.0, incluindo a versão com o tipo de item **Complicação**; Foundry v13/v14). Observação: o Livro de Regras não possui uma lista de complicações, então o módulo não inclui esse pack — o pipeline (`scripts/data_complicacoes.py`) já está pronto para gerar um pack "Complicações" caso você adicione as da sua mesa. Ative o módulo no mundo e os quatro compêndios aparecem na pasta **Ligeia — Livro do Jogador**.

## Arquitetura e build

Os documentos são gerados por scripts Python (mesma abordagem do gerador do sistema):

```
scripts/
  builders.py            # construtores de Item/ação/efeito/custo no schema do ligeia-rpg
  data_habilidades_*.py  # dados transcritos do livro (Sessão 9)
  data_magias_*.py       # magias de exemplo (Sessão 11)
  data_equipamentos.py   # Sessão 10
  data_tracos.py         # Sessões 4 e 5
  generate.py            # escreve packs-source/**/*.json (IDs determinísticos)
  compile-packs.mjs      # compila packs-source/ -> packs/ (LevelDB, foundryvtt-cli)
```

Para rebuildar após editar os dados:

```bash
python3 scripts/generate.py
npm install
node scripts/compile-packs.mjs
```

A action de release (`.github/workflows/release.yml`) recompila os packs e anexa `module.json` + `ligeia-livro-do-jogador.zip` à release quando uma tag `v*` é publicada.

## Licença e distribuição — leia antes de tornar público

O texto das habilidades, magias, equipamentos e traços pertence ao **Livro de Regras do Ligeia RPG** (Dinho Reis, CC-BY-NC-ND). A licença ND (sem derivações) **não cobre automaticamente** a redistribuição do texto do livro convertido em compêndios. Recomendações:

- Mantenha este repositório **privado**, ou
- Publique apenas com **autorização expressa do autor** (registre a autorização neste README), e sempre sem fins comerciais e com atribuição.

Este módulo pressupõe que cada mesa que o utilize **possua o Livro de Regras**. Nenhum conteúdo aqui substitui a compra do livro — os capítulos de regras, criação de personagem, vocações, carreiras, divindades e bestiário permanecem exclusivos do livro.

Observação: o traço *Presença Ardente* (herança psiônica) está com o texto interrompido na edição do livro usada como fonte (fim da pág. 45); o item correspondente sinaliza isso.
