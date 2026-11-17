# Ligeia RPG — Livro do Jogador (Compêndios)

Módulo de compêndios para o sistema não-oficial [`ligeia-rpg`](https://github.com/pedrohmlimonta) do Foundry VTT (v13/v14), com o conteúdo de jogador do **Livro de Regras do Ligeia RPG** pronto para arrastar e soltar nas fichas.

## Conteúdo

| Pack | Documentos | Fonte no livro |
| --- | --- | --- |
| **Habilidades** | 267 | Sessão 9 — cada sub-grupo é um item próprio (ex.: `Usar Armas [Machados]`, `Palavra Arcana [ignis]`, `Espírito Guardião [Urso]`), com descrições dos níveis Básico e Avançado, custos, pré-requisitos, listas e, quando aplicável, ações, efeitos e custos de ativação já configurados |
| **Magias** | 70 | Sessão 11 — todas as magias de exemplo (Círculo Menor) das 28 palavras arcanas, com características, dano, efeitos aplicáveis (condições com rolagem de resistência), peculiaridades de criação, custo de 1 PM nas ações e animações automáticas (Automated Animations + JB2A, removíveis na ficha) |
| **Equipamentos** | 110 | Sessão 10 — armaduras (com efeitos de Proteção/penalidade), todas as armas (com ações de ataque, dano e alcance), escudos, munições, ferramentas, itens gerais, montarias e serviços |
| **Traços** | 41 | Sessões 4 e 5 — traços de todas as raças e das cinco heranças, com efeitos mecânicos onde cabível |
| **Raças** | 15 | Sessão 4 — cada raça com descrição, características (dado de melhoria, tamanho, idiomas, corrupção), bônus de deslocamento, lista de habilidades iniciais e os traços raciais embutidos (grantedTraits) |
| **Heranças** | 5 | Sessão 5 — custo, restrições, corrupção, lista de habilidades e traços da herança embutidos |
| **Vocações** | 12 | Sessão 6 (edição revisada) — bônus de PV/PM, a **habilidade-chave** embutida (`keySkills`: vem com o personagem sem custo de XP, ex.: Fúria no Bárbaro, Artes Marciais no Monge) e a lista completa com habilidades **iniciais + de progressão** |
| **Carreiras** | 4 | Sessão 16 — pré-requisitos, lista de progressão (com habilidades de nível Épico) e a característica como traço embutido (ex.: Arquimago +2 PM) |
| **Organizações** | 14 | Sessão 7 — as Nações de Ligeia, cada uma com a lista de Habilidades Regionais (Sei Yang inclui a tabela de Clãs) |
| **Complicações** | 50 | Avulso 09 (Complicações, Playtest v0.1) — 12 complicações avulsas, Efeito Colateral expandido por palavra arcana (×28) e Insanidade por tipo (×10), com XP concedido em xpBasic e efeitos configurados (reroll6 nos atributos; demais como info) |

### Convenções mecânicas (sistema 0.2.x, build 23+)

- **Fórmulas automáticas**: valores "metade do Nível", "+Nível", "dobro do Vigor" etc. usam fórmulas `@variáveis` resolvidas pela ficha (`ceil(@nivel/2)`, `@nivel`, `2*@vigor`) — nada de ajustar números na mão. Vale para efeitos, danos, curas, alcances, áreas e durações.
- **Passivo × ativável**: efeitos incondicionais (Usar Armas, Vigor de Aço, RDs raciais, Palavra Arcana [A], características de carreira, complicações) são `passive` — valem sempre. Efeitos situacionais (perícias, posturas, Reação Furiosa) são `active` com a checkbox desligada — ligue quando a situação valer.
- **Perícias com as duas opções**: habilidades de "1D em rolagens de X" (Ofícios, Carisma, Conhecimento...) têm um efeito ativável *e* uma ação de rolagem pronta com o dado já somado (ex.: "Ofícios — rolar Mente +1D"). Use **uma ou outra** — com o efeito ligado, a ação de rolagem somaria o dado duas vezes.
- **Benefício permanente + situacional na mesma habilidade**: quando a habilidade mistura os dois (Acrobacia [A] +1 Esquiva e crítico, Atletismo [A], Alerta [A] +4 Iniciativa, Firmeza Física +PV, Senso Lógico Proteção psíquica, Corredor, Marca da Mácula...) ela fica **passiva**: o permanente vale sempre e cada efeito situacional começa **desligado (○)** — ligue só aquele efeito, direto na lista de efeitos do item na ficha, quando a situação valer. O mesmo vale para efeitos de situações diferentes (Explorador fora × dentro de combate, Guerra Santa, Sobrevivência, Trilhador, Táticas de Grupo, Magia Unilateral).
- **Efeitos e ações por nível (B/A/E)**: passam a valer no nível correspondente da habilidade e a ficha mostra só os do nível atingido — Artes Marciais tem ataque Básico (metade do Nível) e Avançado (= Nível); Medicina cura 1/2; Conhecimento ganha “Criar um fato” no A. Todas as ações e efeitos de habilidades e complicações vêm com o nível definido (Básico/Avançado/Épico) para o **seletor de nível de ativação** da ficha: ao ativar no Básico aparecem só as do Básico; no Avançado, as dos dois. Ativáveis sem ação própria ganham ações “Ativar (Básico/Avançado/Épico)” com os custos daquele nível (mesma regra do sistema, incluindo custos A+/E+ cumulativos).
- **Posturas e transformações por ação**: Fúria, Espírito Guardião, Guerreiro Incauto, Proteção dos Espíritos, buffs de magia (Armadura Arcana, Aumento Arcano...) são ações que aplicam efeitos com a duração correta (rodadas ou cena) — inclusive sobrevida vinculada (Fúria, Urso) e regeneração por rodada (Fluxo Arcano, Manifestação Divina).
- **Dano adicional**: o sistema soma dano bônus de efeitos apenas por tipagem de arma, então “+N de dano nos ataques” (Guerreiro Incauto [A], Espírito do Lobo) mira `arma` (qualquer arma tipada). Danos adicionais de magia (Afinidade Mágica Elemental, Punição, Letalidade) são ações de dano extra para usar ao acertar.
- **Tipagens de arma**: as armas carregam as tipagens do livro (`tags`) e Usar Armas [Grupo] dá o bônus apenas às armas daquele grupo, automaticamente. Ações de arma usam `isWeapon`/`isMelee` (bônus de tamanho e alcance corpo a corpo).
- **Palavras arcanas**: Palavra Arcana [x] no Avançado soma +1 de Conjuração só às magias compostas pela palavra; alcances e áreas das magias Menores vêm com as fórmulas do livro (`5*@nivel` etc.) e toque vira alcance corpo a corpo.
- **Encantamentos**: Encantar Objeto pergunta qual item do alvo encantar e grava o bônus nas ações daquele item. Encantamento sem rodadas é permanente no sistema (não existe “cena” para itens), então tire-o do item no fim da cena — o rótulo da ação lembra. Espírito Inovador usa o mesmo mecanismo (o ajuste no equipamento fica até você removê-lo).
- **Cura nativa**: Curar, Recuperar o Fôlego, Sangue Aagn, Manifestação Divina usam o campo de cura das ações (com escalonamento "+1 por 2 acima" onde o livro manda).
- **Custos de XP**: seguem o sistema — vazio usa a tabela padrão, `0` é grátis. Níveis marcados “-” no livro valem `0` (nunca cobram por um nível inexistente); habilidades só Épicas (- / - / 60) já entram no nível Épico. Complicações concedem o XP do livro no Básico e `0` nos demais níveis.
- **Listas de habilidades e colchetes**: o sistema compara nomes exatos quando o subgrupo está entre colchetes, então as entradas genéricas do livro (`[Qualquer]`, `[Único]`, `[Ancestralidade]`, clãs de Sei Yang) são expandidas para as variantes reais do compêndio — o Druida recebe os 12 Espíritos Guardiões, Sael as 28 palavras etc. O build falha se alguma entrada de lista não existir no compêndio.
- **Habilidades-chave de escolha**: Pacto [Único] (Bruxo), Juramento [Qualquer] (Paladino) e Presa de Caça [Qualquer] (Patrulheiro) são chaves completas (todas as opções na descrição, com as ações/efeitos da habilidade) — gratuitas, porque o nome bate exatamente com a chave da vocação. Anote no item a opção escolhida.
- **Condições aplicáveis**: ações que impõem condições (Abalado, Cego, Dano Contínuo...) usam `appliesEffects` com duração e a rolagem de resistência do livro (ex.: *Vigor anula*), incluindo dano contínuo por rodada. Quando a condição vem de um **complemento depois do acerto** (a ação não rola — Garras [A], Presas [A], Presa de Caça [A], manobras), a resistência usa o modo **“refazer a cada rodada”**: quem aplicou rola de novo o atributo da ação para gerar a CD, em vez de uma CD 0 que cairia no primeiro teste.
- **Gastos por nível**: tudo que o texto manda pagar ou escolher em combate virou ação com o custo daquele nível — Alta Arcana (B 1 PH · A 2 PM · E grátis), Magia Sem Gestos/Materiais/Silenciosa (+1 PM no Básico), Golpe Crítico Brutal, Golpe de Sorte, Reflexos, Sem Brechas, Combater às Cegas, Pele de Escamas, Fúria [A], Guia Divino, Ímpeto, Força Repentina (1D/2D + sobrevida), Morte Antes da Desonra, Prece de Repouso e Canção do Viajante (cura em área ao descansar), Presença do Leão, Proteger, Enfrentar a Horda, Manifestação Divina [A], Juramento [A] (auras), entre outras.
- **Manobras com Armas (Sessão 14)**: cada Usar Armas [x] que tem manobra no livro ganha a ação de **1 PH** — ela aplica em você, por 1 rodada, o bônus da manobra na tipagem daquela arma (`arma:<tipagem>`); em seguida ataque com a arma, e o dano extra entra no próprio ataque, com o tipo de dano e a Proteção do alvo corretos. Manobras com efeito no alvo (Flagelo Constritor, Golpe Esmagador, Tiro Atordoante, Maré de Ferro...) têm uma segunda ação, sem custo, para aplicar depois do acerto. Bastões, Armas de Fogo, Naturais, Orientais e Superior não têm manobra no livro.

## Criação de Magias (exclusivo do módulo)

O módulo adiciona um botão **varinha** no cabeçalho da ficha do personagem que abre a oficina de **criação de magias por sistema de criação** (Sessão 11):

1. **Círculo**: Menor (1 PM), Intermediária (2 PM) ou Maior (3 PM) — o custo de mana é aplicado às ações da magia criada.
2. **Palavra principal**: somente palavras que o personagem possui na ficha como habilidade `Palavra Arcana [x]` (qualquer nível) aparecem; escolha então a **magia Menor de base** daquela palavra (as 70 do compêndio + magias de mundo).
3. **Peculiaridades**: marque quantas quiser — os modificadores `(+N)`/`(-N)` do livro são somados e entram como **bônus/penalidade fixa na rolagem de Conjuração** da magia criada (há um campo de ajuste manual para casos fora da lista).
4. **Intermediária**: segunda palavra (também na ficha) + **uma metamagia** dela; **Maior**: terceira palavra + mais uma metamagia. Metamagias estão catalogadas para as 28 palavras com automação: as de **dano trocam o tipo do dano da base sem somar** (base sem dano ganha +1/+2/+3 pelo círculo), as de condição acrescentam o efeito aplicável com resistência, Ampliada/Dimensional/Vórtica alteram área/alcance/forma, e as de aprimoramento geram ações de buff. **Em conflito, a metamagia da 3ª palavra prevalece** (ex.: energio + ignis + fulgur → o dano vira Raio).
5. **Palavras repetidas**: a mesma palavra pode entrar mais de uma vez — ignis + majesto + majesto faz uma Esfera Ígnea em área (Magia Ampliada) e com o dobro do alcance (Magia Dimensional). A **mesma metamagia duas vezes** também vale: área, alcance e alvos somam o valor da base de novo (2× na primeira, 3× na segunda), a regra que o livro dá para a Magia Múltipla — uma magia de alvo vira área na primeira Ampliada e dobra essa área na segunda. Condições repetidas não se aplicam duas vezes.

Ao trocar de círculo, o **alcance e a área escalam** (“5m x Círculo x Nível” vira `10*@nivel` na Intermediária), os **aprimoramentos gratuitos “(-)” do círculo** são aplicados (ex.: “Dano: Ácido +2 (apenas Círculo Intermediário)”) e as peculiaridades restritas a outro círculo ficam desabilitadas. Palavras concedidas por traço racial (Prole de Mizra, Filhos de Kalael, Ilusionista Natural) também contam.

A magia criada entra na ficha com a receita registrada na descrição (palavras, aprimoramentos, peculiaridades e metamagias) e também em `flags` do item. API: `game.modules.get("ligeia-livro-do-jogador").api.abrirCriacaoDeMagia(actor)`.

## Animações automáticas das magias

Com o **Automated Animations**, o **Sequencer** e o **JB2A** (gratuito ou Patreon) ativos, as magias tocam uma animação que combina com o que fazem:

- **Como ela é escolhida**: pelo **elemento do dano** (fogo, frio, raio, ácido, necrótico...) e pela **forma** da ação — projétil até o alvo, no alvo tocado, em cada criatura atingida pela área, no conjurador nas emanações, em você nas magias pessoais. Cura, sobrevida, proteção e bônus têm a sua (curewounds, bolha, escudo, bênção...); sem dano, vale o **tema da palavra** (trevas para tenebrae, encantamento para carmo, adivinhação para augurado, travessia para krucigon...). As **condições** aplicadas ganham um visual que fica no token **enquanto durarem** (medo, atordoado, pasmo, correntes, chamas ou corrosão do dano contínuo...).
- **Compêndio**: as 53 magias com ações já vêm animadas (57 ações e 22 condições); as 17 só descritivas, sem ação, não têm onde tocar. O compêndio usa apenas animações que existem **nas duas** versões do JB2A.
- **Criação de Magias**: a animação é escolhida de novo para a magia criada, de acordo com o que ela ficou fazendo — a Esfera Ígnea Ampliada deixa de ser projétil e explode em cada atingido, a Magia Flamejante troca o raio por fogo, e as ações criadas por uma metamagia seguem a palavra dela (Magia Furtiva de iluzio numa magia de ignis: ilusão em você). Com o JB2A Patreon instalado, a oficina usa as versões mais caprichadas (nuvem verde na Nuvem Tóxica, raio verde-escuro no Raio Necrótico...).
- **Para remover**: elas ficam guardadas como **animação puxada** do sistema, nada de novo. Na ficha do item, em cada ação, **●/○** desliga e **✕** remove; em cada efeito aplicável, **✕** remove o visual; e o botão **🎞️ limpar animações** do cabeçalho tira todas do item de uma vez. Nada é gravado no menu do Automated Animations do item, então, removida, ela não volta tocando como reserva. Para a oficina criar magias sem animação, desmarque **Animações automáticas nas magias criadas** nas configurações do módulo. Uma animação que você puxou ou digitou (no "Avançado") nunca é trocada — nem na magia de base de uma criação.
- **Trocar por outra**: configure a animação no menu do Automated Animations do item (botão A-A no cabeçalho) e use **↻** / **🎞️ Puxar animação do item** na ação — o fluxo normal do sistema.
- **Áreas**: o sistema entrega ao Automated Animations as criaturas atingidas, não o ponto do template, então a explosão de uma área toca em cada atingido.
- O módulo *Automated Animations For All* não é necessário com o sistema Ligeia (o sistema já chama o Automated Animations); se ele estiver ligado e alguma animação sair dobrada, desligue-o.

As regras ficam em `esmodules/animacoes.mjs` — as mesmas para o compêndio e para a oficina. API: `animarMagia(dados)` e `limparAnimacoesAutomaticas(dados)` em `game.modules.get("ligeia-livro-do-jogador").api`, sobre os dados de um item (`item.toObject()`).

## Validação e testes

O build (`python3 scripts/generate.py`) termina conferindo os 588 documentos contra o schema do sistema (`scripts/validate.py`): todas as opções enumeradas (tipos de efeito, níveis, modos de alvo, recursos, condições, tipos de dano), campos string × número, fórmulas e `@variáveis`, e armadilhas conhecidas do motor (ex.: `restore` é instantâneo e não sustenta regeneração; dano bônus só soma por tipagem de arma; resistência “contra a rolagem” numa ação que não rola teria CD 0). Também confere que cada traço concedido e cada habilidade-chave embutidos nas definições são idênticos ao item do compêndio para o qual apontam, e que cada animação automática está no formato que o Automated Animations lê (versão 5, ligada, no token e persistente nos visuais de efeito) e cita uma animação presente no JB2A gratuito **e** no Patreon (catálogo em `scripts/aa-chaves.json`, extraído da base do Automated Animations v8, MIT). Qualquer erro interrompe o build — inclusive na Action de release.

A oficina de magias tem testes em `tests/spellforge.test.mjs` (`node tests/spellforge.test.mjs`), cobrindo prioridade das metamagias, escala por círculo, aprimoramentos gratuitos, peculiaridades por círculo, as animações da magia criada e a própria janela: ela é aberta sobre um ApplicationV2 de teste com os mesmos getters do Foundry v13 (`state`, `element`, `title`...), lista as palavras da ficha e cria a magia no personagem. As tabelas de animação têm testes próprios em `tests/animacoes.test.mjs` (chaves reais, plano B do JB2A gratuito em toda lista, consulta à base do Sequencer, preservação das animações que você puxou e remoção).

## Instalação

**Pelo manifesto** (após publicar uma release):

```
https://github.com/pedrohmlimonta/LigeiaLivroDoJogador/releases/latest/download/module.json
```

**Manual**: clone/extraia esta pasta em `Data/modules/ligeia-livro-do-jogador/`. Os packs compilados (`packs/`) já acompanham o repositório.

Requer o sistema `ligeia-rpg` (mínimo 0.2.0, incluindo a versão com o tipo de item **Complicação**; Foundry v13/v14). O pack Complicações usa como fonte o suplemento oficial Avulso 09 — Complicações (Dinho Reis, CC-BY-NC-ND), mesma observação de licença do Livro de Regras. Ative o módulo no mundo e os compêndios aparecem na pasta **Ligeia — Livro do Jogador**. Opcional, para as animações das magias: Automated Animations + Sequencer + JB2A.

## Arquitetura e build

Os documentos são gerados por scripts Python (mesma abordagem do gerador do sistema):

```
scripts/
  builders.py            # construtores de Item/ação/efeito/custo no schema do ligeia-rpg
  enhance.py             # automação transversal (perícias, fórmulas, passivo × ativável)
  enhance_levels.py      # ações/efeitos por nível (B/A/E) e ações "Ativar" dos ativáveis
  enhance_audit.py       # revisão de todas as habilidades: gastos por nível, manobras, perícias mistas
  animar-compendio.mjs   # animações automáticas nas magias (Node; chamado pelo generate.py)
  aa-chaves.json         # catálogo das animações do JB2A gratuito e Patreon (Automated Animations v8)
  validate.py            # validação contra o schema do sistema (roda no fim do build)
  data_habilidades_*.py  # dados transcritos do livro (Sessão 9)
  data_magias_*.py       # magias de exemplo (Sessão 11)
  data_equipamentos.py   # Sessão 10
  data_tracos.py         # Sessões 4 e 5
  generate.py            # escreve packs-source/**/*.json (IDs determinísticos)
  compile-packs.mjs      # compila packs-source/ -> packs/ (LevelDB, foundryvtt-cli)
esmodules/
  spellforge.mjs         # Criação de Magias (botão na ficha)
  animacoes.mjs          # regras das animações automáticas (compêndio e oficina)
```

O `generate.py` precisa do Node.js para animar as magias (sem ele, avisa e gera as magias sem animação).

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
