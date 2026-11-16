# Ligeia RPG — Livro do Jogador (Compêndios)

Módulo de compêndios para o sistema não-oficial [`ligeia-rpg`](https://github.com/pedrohmlimonta) do Foundry VTT (v13/v14), com o conteúdo de jogador do **Livro de Regras do Ligeia RPG** pronto para arrastar e soltar nas fichas.

## Conteúdo

| Pack | Documentos | Fonte no livro |
| --- | --- | --- |
| **Habilidades** | 266 | Sessão 9 — cada sub-grupo é um item próprio (ex.: `Usar Armas [Machados]`, `Palavra Arcana [ignis]`, `Espírito Guardião [Urso]`), com descrições dos níveis Básico e Avançado, custos, pré-requisitos, listas e, quando aplicável, ações, efeitos e custos de ativação já configurados |
| **Magias** | 70 | Sessão 11 — todas as magias de exemplo (Círculo Menor) das 28 palavras arcanas, com características, dano, efeitos aplicáveis (condições com rolagem de resistência), peculiaridades de criação e custo de 1 PM nas ações |
| **Equipamentos** | 110 | Sessão 10 — armaduras (com efeitos de Proteção/penalidade), todas as armas (com ações de ataque, dano e alcance), escudos, munições, ferramentas, itens gerais, montarias e serviços |
| **Traços** | 41 | Sessões 4 e 5 — traços de todas as raças e das cinco heranças, com efeitos mecânicos onde cabível |
| **Raças** | 15 | Sessão 4 — cada raça com descrição, características (dado de melhoria, tamanho, idiomas, corrupção), bônus de deslocamento, lista de habilidades iniciais e os traços raciais embutidos (grantedTraits) |
| **Heranças** | 5 | Sessão 5 — custo, restrições, corrupção, lista de habilidades e traços da herança embutidos |
| **Vocações** | 12 | Sessão 6 — bônus de PV/PM e lista completa de habilidades iniciais |
| **Carreiras** | 4 | Sessão 16 — pré-requisitos, lista de progressão (com habilidades de nível Épico) e a característica como traço embutido (ex.: Arquimago +2 PM) |
| **Organizações** | 14 | Sessão 7 — as Nações de Ligeia, cada uma com a lista de Habilidades Regionais (Sei Yang inclui a tabela de Clãs) |
| **Complicações** | 50 | Avulso 09 (Complicações, Playtest v0.1) — 12 complicações avulsas, Efeito Colateral expandido por palavra arcana (×28) e Insanidade por tipo (×10), com XP concedido em xpBasic e efeitos configurados (reroll6 nos atributos; demais como info) |

### Convenções mecânicas (sistema 0.2.x, build 22+)

- **Fórmulas automáticas**: valores "metade do Nível", "+Nível", "dobro do Vigor" etc. usam fórmulas `@variáveis` resolvidas pela ficha (`ceil(@nivel/2)`, `@nivel`, `2*@vigor`) — nada de ajustar números na mão. Vale para efeitos, danos, curas, alcances, áreas e durações.
- **Passivo × ativável**: efeitos incondicionais (Usar Armas, Vigor de Aço, RDs raciais, Palavra Arcana [A], características de carreira, complicações) são `passive` — valem sempre. Efeitos situacionais (perícias, posturas, Reação Furiosa) são `active` com a checkbox desligada — ligue quando a situação valer.
- **Perícias com as duas opções**: habilidades de "1D em rolagens de X" (Ofícios, Carisma, Conhecimento...) têm um efeito ativável *e* uma ação de rolagem pronta com o dado já somado (ex.: "Ofícios — rolar Mente +1D"). Use a que preferir.
- **Efeitos com nível**: efeitos e ações marcados B/A/E passam a valer no nível correspondente da habilidade (ex.: Usar Armas dá +1 no B e crítico 11-12 no A; Fúria tem ação própria de Avançado).
- **Posturas e transformações por ação**: Fúria, Espírito Guardião, Guerreiro Incauto, Proteção dos Espíritos, buffs de magia (Armadura Arcana, Aumento Arcano...) são ações que aplicam efeitos com a duração correta (rodadas ou cena) — inclusive sobrevida vinculada (Fúria, Urso) e regeneração por rodada (Fluxo Arcano, Manifestação Divina).
- **Tipagens de arma**: as armas carregam as tipagens do livro (`tags`) e Usar Armas [Grupo] dá o bônus apenas às armas daquele grupo, automaticamente. Ações de arma usam `isWeapon`/`isMelee` (bônus de tamanho e alcance corpo a corpo).
- **Palavras arcanas**: Palavra Arcana [x] no Avançado soma +1 de Conjuração só às magias compostas pela palavra; alcances e áreas das magias Menores vêm com as fórmulas do livro (`5*@nivel` etc.) e toque vira alcance corpo a corpo.
- **Encantamentos**: Encantar Objeto pergunta qual item do alvo encantar e grava o bônus nas ações daquele item pela cena.
- **Cura nativa**: Curar, Recuperar o Fôlego, Sangue Aagn, Manifestação Divina usam o campo de cura das ações (com escalonamento "+1 por 2 acima" onde o livro manda).
- **Condições aplicáveis**: ações que impõem condições (Abalado, Cego, Dano Contínuo...) usam `appliesEffects` com duração e a rolagem de resistência do livro (ex.: *Vigor anula*), incluindo dano contínuo por rodada.

## Instalação

**Pelo manifesto** (após publicar uma release):

```
https://github.com/pedrohmlimonta/LigeiaLivroDoJogador/releases/latest/download/module.json
```

**Manual**: clone/extraia esta pasta em `Data/modules/ligeia-livro-do-jogador/`. Os packs compilados (`packs/`) já acompanham o repositório.

Requer o sistema `ligeia-rpg` (mínimo 0.2.0, incluindo a versão com o tipo de item **Complicação**; Foundry v13/v14). O pack Complicações usa como fonte o suplemento oficial Avulso 09 — Complicações (Dinho Reis, CC-BY-NC-ND), mesma observação de licença do Livro de Regras. Ative o módulo no mundo e os quatro compêndios aparecem na pasta **Ligeia — Livro do Jogador**.

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
