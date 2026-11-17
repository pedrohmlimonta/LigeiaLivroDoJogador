/**
 * LIGEIA — PROPRIEDADES PARA ITENS MÁGICOS (Livro de Regras, Sessão 11)
 * ===========================================================================
 * Transcrição das propriedades de itens mágicos de cada palavra arcana, usada
 * pelo Encantamento de Itens (encantamento.mjs). É dado, não código: para
 * corrigir um texto ou um preço do livro, edite aqui.
 *
 * Campos de cada propriedade:
 *   id          palavra + nome, sem acento (identificador estável)
 *   palavra     palavra arcana dona da propriedade
 *   nome        nome da propriedade no livro
 *   itens       tipos de item, como o livro escreve
 *   tipos       os mesmos tipos, normalizados (comparados com o item escolhido)
 *   ativacao    Constante, Ação, Ação Rápida, Ação Livre, Reação, Movimento, Cena
 *   consumivel  poções, bombas e óleos: gastos ao usar
 *   corrupcao   regra de Corrupção do item, quando há
 *   variantes   cada preço do livro: { rotulo, preco (Vo), nivel (1 Menor,
 *               2 Intermediário, 3 Maior — pela escala de preço dos círculos),
 *               grau (posição no tipo), valor (número do rótulo), cd
 *               (Normal 10, Difícil 12, Muito Difícil 14), tipo (quando o
 *               preço depende do tipo de item) }
 *   texto       descrição da propriedade
 *   pagina      página do livro
 */

export const PROPRIEDADES = [
  {
    id: "acida-absorcao-acida", palavra: "acida", nome: "Absorção Ácida",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 115,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo ácido que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "acida-caminhar-na-agua-e-acido", palavra: "acida", nome: "Caminhar na Água e Ácido",
    itens: "Botas e Cintos", tipos: ["cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 115,
    variantes: [
      {"preco": 3500, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode caminhar em superfícies de água ou ácido como se fossem sólidas, sem nenhuma penalidade.",
  },
  {
    id: "acida-caustifices", palavra: "acida", nome: "Caustífices",
    itens: "Lentes", tipos: ["lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 115,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando lentes com essa propriedade, você recebe 1D na identificação de itens que tenham propriedades da palavra acida.",
  },
  {
    id: "acida-corrosiva", palavra: "acida", nome: "Corrosiva",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"rotulo": "Armas", "preco": 30000, "nivel": 2, "grau": 1, "tipo": "arma"},
      {"rotulo": "Munições", "preco": 1000, "nivel": 1, "grau": 1, "tipo": "municao"},
      {"rotulo": "Braçadeiras", "preco": 200000, "nivel": 3, "grau": 1, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição ou enquanto estiver usando braçadeiras com essa propriedade, alvos atingidos por você, que sofrerem dano, deverão ser bem sucedidos em uma rolagem de Vigor (Normal). Caso falhem, sofrerão dano contínuo de ácido pelo resto da cena (Vigor anula).",
  },
  {
    id: "acida-dano-acido", palavra: "acida", nome: "Dano Ácido",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de ácido, de acordo com o valor do item.",
  },
  {
    id: "acida-erosao", palavra: "acida", nome: "Erosão",
    itens: "Varinhas, Totens ou Símbolos Sagrados/Profanos", tipos: ["simbolo", "varinha", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"rotulo": "Dano Ácido 1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Dano Ácido 2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Dano Ácido 3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana acida usando esse item como foco. Se esta magia causar dano, ela irá causar dano adicional de ácido, dependendo do valor do item.",
  },
  {
    id: "acida-explosao-corrosiva", palavra: "acida", nome: "Explosão Corrosiva",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 116,
    variantes: [
      {"preco": 300, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação e rolando Agilidade. Quando atinge o espaço alvo, cria uma área de 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de ácido até o fim da cena (Vigor anula).",
  },
  {
    id: "acida-imunidade-a-acido", palavra: "acida", nome: "Imunidade a Ácido",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de ácido.",
  },
  {
    id: "acida-penetracao-acida", palavra: "acida", nome: "Penetração Ácida",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques e magias ignoram proteção contra ácido.",
  },
  {
    id: "acida-protecao-contra-acido", palavra: "acida", nome: "Proteção Contra Ácido",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de ácido.",
  },
  {
    id: "acida-respirar-na-agua", palavra: "acida", nome: "Respirar na Água",
    itens: "Máscaras e Colares", tipos: ["colar", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"preco": 3500, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode respirar na água livremente, sem nenhuma penalidade.",
  },
  {
    id: "acida-guia-das-aguas", palavra: "acida", nome: "Guia das Águas",
    itens: "Bússola", tipos: ["bussola"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 116,
    variantes: [
      {"preco": 1500, "nivel": 1, "grau": 1},
    ],
    texto: "Pode ser ativada ou desativada com a palavra chave. Enquanto ativada, ela sempre apontará na direção do local mais próximo onde houver grandes quantidades de água. Enquanto desativada, funciona como uma bússola comum.",
  },
  {
    id: "augurado-adivinhacao", palavra: "augurado", nome: "Adivinhação",
    itens: "Orbes, Totens ou Símbolos Sagrados/Profanos", tipos: ["simbolo", "orbe", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana augurado usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "augurado-augurio", palavra: "augurado", nome: "Augúrio",
    itens: "Espelhos", tipos: ["espelho"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Quando você ativa esse espelho, você vê através dele, uma cena de seis segundos, que ainda irá acontecer até o fim do dia. O narrador pode descrever qualquer cena na qual o usuário esteja presente, mesmo as mais casuais e insignificantes. Caso o usuário utilize o espelho mais de uma vez no mesmo dia, ele verá a mesma cena, até que o dia acabe.",
  },
  {
    id: "augurado-cacadora-temporal", palavra: "augurado", nome: "Caçadora Temporal",
    itens: "Armas, Luvas e Braçadeiras", tipos: ["bracadeira", "luva", "arma"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 1500000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo braçadeiras ou luvas encantadas com essa propriedade, ou quando atacar com uma arma com essa propriedade, você pode re-rolar suas rolagens de ataque, pagando 1 ponto de magia cada vez que o fizer.",
  },
  {
    id: "augurado-guardiao-temporal", palavra: "augurado", nome: "Guardião Temporal",
    itens: "Escudos", tipos: ["escudo"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver empunhando um escudo encantado com essa propriedade, você pode re-rolar suas rolagens de Bloqueio, pagando 1 ponto de magia cada vez que o fizer.",
  },
  {
    id: "augurado-percepcao", palavra: "augurado", nome: "Percepção",
    itens: "Lentes", tipos: ["lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando essas lentes, você recebe 1D no seu atributo de Percepção.",
  },
  {
    id: "augurado-vigilante-temporal", palavra: "augurado", nome: "Vigilante Temporal",
    itens: "Cintos, Botas e Capas", tipos: ["capa", "cinto", "bota"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um cinto, capa ou botas encantadas com essa propriedade, você pode re-rolar suas rolagens de Esquiva, pagando 1 ponto de magia cada vez que o fizer.",
  },
  {
    id: "augurado-visao-da-verdade", palavra: "augurado", nome: "Visão da Verdade",
    itens: "Tiaras, Bandanas, Lentes, Coroas, Elmos e Máscaras", tipos: ["elmo", "mascara", "tiara", "bandana", "coroa", "lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com este item, você pode ver criaturas invisíveis e recebe 1D em rolagens contra magias compostas pela palavra arcana iluzio.",
  },
  {
    id: "augurado-visao-no-escuro", palavra: "augurado", nome: "Visão no Escuro",
    itens: "Lentes, Elmos ou Máscaras", tipos: ["elmo", "mascara", "lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com este item, você terá visão no escuro (10m).",
  },
  {
    id: "augurado-visao-do-perigo", palavra: "augurado", nome: "Visão do Perigo",
    itens: "Tiaras, Bandanas, Coroas e Elmos", tipos: ["elmo", "tiara", "bandana", "coroa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 119,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com este item, você recebe +1 em Esquiva e Bloqueio.",
  },
  {
    id: "carmo-mente", palavra: "carmo", nome: "Mente",
    itens: "Colares", tipos: ["colar"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 122,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando esse colar, você recebe 1D no seu atributo de Mente.",
  },
  {
    id: "carmo-aterradora", palavra: "carmo", nome: "Aterradora",
    itens: "Máscaras, Elmos e Escudos", tipos: ["escudo", "elmo", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 122,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com um item encantado com essa propriedade, toda criatura que puder vê-lo, deve ser bem sucedida em uma rolagem de Mente (Normal) ou ficará abalada até o fim da cena (Mente anula). Uma mesma criatura não pode ser afetada por essa propriedade mais de uma vez no mesmo dia. Você pode ativar o item ou desativá-lo usando uma ação livre.",
  },
  {
    id: "carmo-atordoante", palavra: "carmo", nome: "Atordoante",
    itens: "Máscaras e Colares", tipos: ["colar", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 122,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com um item encantado com essa propriedade, toda criatura que puder vê-lo, deve ser bem sucedida em uma rolagem de Mente (Normal) ou ficará atordoada até o fim da cena (Mente anula). Uma mesma criatura não pode ser afetada por essa propriedade mais de uma vez no mesmo dia. Você pode ativar o item ou desativá-lo usando uma ação livre.",
  },
  {
    id: "carmo-atracao", palavra: "carmo", nome: "Atração",
    itens: "Lanternas", tipos: ["lanterna"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 122,
    variantes: [
      {"rotulo": "Normal", "preco": 700, "nivel": 1, "grau": 1, "cd": 10},
      {"rotulo": "Difícil", "preco": 14000, "nivel": 2, "grau": 2, "cd": 12},
      {"rotulo": "Muito Difícil", "preco": 400000, "nivel": 3, "grau": 3, "cd": 14},
    ],
    texto: "Essa lanterna, quando acesa, atrai criaturas que percebam sua luz, caso elas não sejam bem sucedidas em uma rolagem de Mente, cuja dificuldade depende do valor do item. O usuário pode escolher quem não é afetado por ela. As criaturas atraídas irão tentar se apoderar da lanterna e lutarão por ela até a morte ou até que o efeito cesse. O efeito dura até o fim da cena (Mente anula).",
  },
  {
    id: "carmo-dreno-mental", palavra: "carmo", nome: "Dreno Mental",
    itens: "Máscaras e Colares", tipos: ["colar", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 122,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com um item encantado com essa propriedade, toda criatura que puder vê-lo, deve ser bem sucedida em uma rolagem de Mente (Normal) ou ficará pasma até o fim da cena (Mente anula). Uma mesma criatura não pode ser afetada por essa propriedade mais de uma vez no mesmo dia. Você pode ativar o item ou desativá-lo usando uma ação livre.",
  },
  {
    id: "carmo-dominacao", palavra: "carmo", nome: "Dominação",
    itens: "Coroas, Elmos e Tiaras", tipos: ["elmo", "tiara", "coroa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 123,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com um item encantado com essa propriedade, toda criatura que puder vê-lo, deve ser bem sucedida em uma rolagem de Mente (Normal) ou ficará dominada até o fim da cena (Mente anula). Uma mesma criatura não pode ser afetada por essa propriedade mais de uma vez no mesmo dia. Você pode ativar o item ou desativá-lo usando uma ação livre.",
  },
  {
    id: "carmo-encantamento", palavra: "carmo", nome: "Encantamento",
    itens: "Instrumentos Musicais, Bastões e Símbolos Sagrados/Profanos", tipos: ["instrumento", "simbolo", "bastao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 123,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana carmo usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "devena-camuflagem", palavra: "devena", nome: "Camuflagem",
    itens: "Armadura, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 126,
    variantes: [
      {"preco": 60000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo esse item, você recebe 1D em rolagens para se manter escondido.",
  },
  {
    id: "devena-carvalho", palavra: "devena", nome: "Carvalho",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 2500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 60000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 1500000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para receber um valor de Proteção (dependendo do valor do item) contra Corte, Perfuração e Concussão até o fim da cena.",
  },
  {
    id: "devena-face-feral", palavra: "devena", nome: "Face Feral",
    itens: "Máscaras e Elmos", tipos: ["elmo", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando essa máscara ou elmo. Você recebe 1D em rolagens para lidar com criaturas do tipo fera. Além disso, pagando 1 ponto de magia, você pode falar com animais até o fim da cena.",
  },
  {
    id: "devena-invocacao-animal", palavra: "devena", nome: "Invocação Animal",
    itens: "Estatueta", tipos: ["estatueta"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"rotulo": "Desafio até 2", "preco": 3500, "nivel": 1, "grau": 1, "valor": 2},
      {"rotulo": "Desafio até 4", "preco": 120000, "nivel": 2, "grau": 2, "valor": 4},
      {"rotulo": "Desafio até 6", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 6},
    ],
    texto: "Esta estatueta possui a forma de uma criatura do tipo fera cujo Desafio depende do valor do item. Ao dizer a palavra de comando, a estatueta é ativada e se tranforma no animal relacionado a sua forma. Ela permanece ativada por uma hora, até que o animal perca todos os pontos de vida ou até que a palavra de comando seja dita novamente. O animal é amigável a você e seus aliados e hostil a seus inimigos.",
  },
  {
    id: "devena-pele-de-arvore", palavra: "devena", nome: "Pele de Árvore",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 127,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 50, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 200, "nivel": 1, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 500, "nivel": 1, "grau": 3, "valor": 3},
    ],
    texto: "Quando você usa esse item, você recebe um valor de Proteção (dependendo do valor do item) contra Corte, Perfuração, Concussão e Veneno, mas também recebe Vulnerabilidade de mesmo valor contra Fogo. Os efeitos duram até o fim da cena.",
  },
  {
    id: "devena-primitivo", palavra: "devena", nome: "Primitivo",
    itens: "Totens e Símbolo Sagrados/Profanos", tipos: ["simbolo", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana devena usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "devena-peregrino", palavra: "devena", nome: "Peregrino",
    itens: "Sandálias", tipos: ["sandalia"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"preco": 700, "nivel": 1, "grau": 1},
    ],
    texto: "Este item foi encantado para se viajar em um tipo de terreno. Enquanto estiver usando um item com esta propriedade, você não fica lento por se mover em terreno dificil e recebe 1D para mover-se em silêncio enquanto estiver dentro desse tipo de terreno.",
  },
  {
    id: "devena-predador", palavra: "devena", nome: "Predador",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"rotulo": "Dano Base +1", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Dano Base +2", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Dano Base +3", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Esta arma foi encantada para a caça de um tipo de criatura (ou raça de humanóide). Quando você ataca uma criatura do tipo especificado, o dano base causado é aumentado em uma quantidade de pontos, dependendo do valor do item.",
  },
  {
    id: "devena-raizes", palavra: "devena", nome: "Raízes",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"preco": 700, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você não pode ser derrubado.",
  },
  {
    id: "devena-sobrevivente", palavra: "devena", nome: "Sobrevivente",
    itens: "Colares e Cajados", tipos: ["colar", "cajado"],
    ativacao: "Cena", consumivel: false, corrupcao: "", pagina: 127,
    variantes: [
      {"preco": 2500, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver usando esse colar ou empunhando esse cajado, gastando uma cena, você descobre fonte de comida (frutos e animais) e água, num raio de 300m.",
  },
  {
    id: "energio-absorcao-de-energia", palavra: "energio", nome: "Absorção de Energia",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 129,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo energia que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "energio-dano-de-energia", palavra: "energio", nome: "Dano de Energia",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 129,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de energia, de acordo com o valor do item.",
  },
  {
    id: "energio-emanacao", palavra: "energio", nome: "Emanação",
    itens: "Capa ou Robe", tipos: ["robe", "capa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 129,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Você pode gastar uma quantidade de pontos de magia (definida por você) para ativar uma aura em torno de si mesmo, que dura até o fim da cena. Criaturas que entrarem na aura ou iniciarem seus turnos nela, sofrerão 1 ponto de dano bruto de energia. O tamanho da área da aura é igual a quantidade de pontos de magia gastos, em metros.",
  },
  {
    id: "energio-evocacao", palavra: "energio", nome: "Evocação",
    itens: "Cajados, Varinhas, Bastões e Símbolos Sagrados/Profanos", tipos: ["simbolo", "bastao", "cajado", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana energio usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de energia, dependendo do valor do item.",
  },
  {
    id: "energio-fonte-arcana", palavra: "energio", nome: "Fonte Arcana",
    itens: "Cajados, Varinhas e Bastões", tipos: ["bastao", "cajado", "varinha"],
    ativacao: "Cena", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"rotulo": "1 Ponto de Magia", "preco": 2500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Magia", "preco": 60000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Magia", "preco": 1500000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Este item armazena 1/2/3 pontos de magia (dependendo do preço do item) dos seus pontos excedentes de magia, durante o seu descanso. Você pode usá-los normalmente em suas conjurações, como se contassem como seus pontos de magia normais.",
  },
  {
    id: "energio-imunidade-a-energia", palavra: "energio", nome: "Imunidade a Energia",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de energia.",
  },
  {
    id: "energio-mana", palavra: "energio", nome: "Mana",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 130,
    variantes: [
      {"rotulo": "1 Ponto de Magia", "preco": 300, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Magia", "preco": 500, "nivel": 1, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Magia", "preco": 1000, "nivel": 1, "grau": 3, "valor": 3},
    ],
    texto: "Quando você usa um item com essa propriedade, você recupera uma quantidade de pontos de magia, dependendo do preço do item.",
  },
  {
    id: "energio-penetracao-de-energia", palavra: "energio", nome: "Penetração de Energia",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques e magias ignoram proteção contra energia.",
  },
  {
    id: "energio-protecao-contra-energia", palavra: "energio", nome: "Proteção Contra Energia",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de energia.",
  },
  {
    id: "energio-regeneracao-arcana", palavra: "energio", nome: "Regeneração Arcana",
    itens: "Robes, Colares, Periaptos e Faixas", tipos: ["robe", "colar", "periapto", "faixa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, no turno em que você não se mover, você recuperará 1 ponto de magia.",
  },
  {
    id: "energio-explosao-de-energia", palavra: "energio", nome: "Explosão de Energia",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 130,
    variantes: [
      {"preco": 300, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação e rolando Agilidade. Quando atinge o espaço alvo, cria uma área de 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de energia até o fim da cena (Vigor anula).",
  },
  {
    id: "energio-forma-de-energia", palavra: "energio", nome: "Forma de Energia",
    itens: "Robes", tipos: ["robe"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 130,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando esse item, todo o dano que você sofrer, será subtraído de seus pontos de magia, até que não lhe reste nenhum. Adicionalmente, enquanto estiver usando um item com essa propriedade, você não fica exausto por ficar sem pontos de magia.",
  },
  {
    id: "exitium-aniquilacao", palavra: "exitium", nome: "Aniquilação",
    itens: "Orbes", tipos: ["orbe"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 132,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 pontos de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 pontos de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana exitium usando esse item como foco. Se esta magia causar dano, ela irá causar dano final adicional de energia, dependendo do valor do item. Você perde 1 ponto de vida sempre que conjura uma magia usando esse orbe.",
  },
  {
    id: "exitium-demolicao", palavra: "exitium", nome: "Demolição",
    itens: "Cubo", tipos: ["cubo"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 132,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Você pode pagar 1 ponto de magia, pronunciar uma palavra chave e tocar uma parede, porta ou cela usando esse cubo. A superfície tocada é imediatamente destruída por completo.",
  },
  {
    id: "exitium-esmagador", palavra: "exitium", nome: "Esmagador",
    itens: "Armas de dano Concussão", tipos: ["arma_concussao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 132,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você ataca usando uma arma com essa propriedade, todo o dano base da arma é considerado dano final. Adicionalmente, todos os acertos críticos conseguidos com essa arma atordoam o alvo.",
  },
  {
    id: "exitium-explosivo", palavra: "exitium", nome: "Explosivo",
    itens: "Munições, Adagas e Dardos", tipos: ["municao", "adaga", "dardo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 133,
    variantes: [
      {"rotulo": "1 de Dano - Normal", "preco": 700, "nivel": 1, "grau": 1, "valor": 1, "cd": 10},
      {"rotulo": "2 de Dano - Difícil", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2, "cd": 12},
      {"rotulo": "3 de Dano - Muito Difícil", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3, "cd": 14},
    ],
    texto: "Quando você ataca um alvo à distância com um item com essa propriedade e acerta, o alvo deve realizar uma rolagem de Agilidade para não sofrer dano de energia. A dificuldade na rolagem e a quantidade de dano sofrido variam de acordo com o valor do item.",
  },
  {
    id: "exitium-forca", palavra: "exitium", nome: "Força",
    itens: "Cinturão", tipos: ["cinto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 133,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando esse cinturão, você recebe 1D no seu atributo de Força.",
  },
  {
    id: "exitium-lamina-afiada", palavra: "exitium", nome: "Lâmina Afiada",
    itens: "Armas de dano Cortante", tipos: ["arma_corte"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 133,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você ataca usando uma arma com essa propriedade, todo o dano base da arma é considerado dano final. Adicionalmente, o dano adicional de todos os acertos críticos causados com essa arma são dobrados.",
  },
  {
    id: "exitium-penetrante", palavra: "exitium", nome: "Penetrante",
    itens: "Armas de dano Perfuração", tipos: ["arma_perfuracao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 133,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você ataca usando uma arma com essa propriedade, todo o dano base da arma é considerado dano final. Adicionalmente, todos os acertos críticos conseguidos com essa arma causam dano contínuo de Sangramento.",
  },
  {
    id: "exitium-potencializador", palavra: "exitium", nome: "Potencializador",
    itens: "Orbes e Bastões", tipos: ["orbe", "bastao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 133,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você conjura uma magia que cause dano, utilizando um foco com essa propriedade, o dano base da magia é considerado dano final. Adicionalmente, todos os acertos críticos das magias conjuradas com esse item causam dano contínuo aos alvos do mesmo tipo que o dano base da magia até o fim da cena (Vigor anula).",
  },
  {
    id: "forjuri-abjuracao", palavra: "forjuri", nome: "Abjuração",
    itens: "Bastões, Cajados e Símbolo Sagrados/Profanos", tipos: ["simbolo", "bastao", "cajado"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana forjuri usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "forjuri-atencao", palavra: "forjuri", nome: "Atenção",
    itens: "Capa", tipos: ["capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"preco": 21000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você fica imune a Indefeso, Cego e Surdo.",
  },
  {
    id: "forjuri-couraca", palavra: "forjuri", nome: "Couraça",
    itens: "Armaduras", tipos: ["armadura"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"rotulo": "Proteção +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para que uma couraça rígida surja em torno de você, aumentando uma quantidade de pontos de todos os seus valores de Proteção, dependendo do valor do item.",
  },
  {
    id: "forjuri-determinacao", palavra: "forjuri", nome: "Determinação",
    itens: "Elmos", tipos: ["elmo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"preco": 120000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você fica imune às condições Abalado, Pasmo, Dominado, Atordoado e Enfeitiçado.",
  },
  {
    id: "forjuri-egide", palavra: "forjuri", nome: "Égide",
    itens: "Amuleto", tipos: ["amuleto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"rotulo": "Bloqueio +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bloqueio +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bloqueio +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você pode bloquear ataques como se empunhasse um escudo, usando sua Mente, em vez da Força, recebendo um bônus nas rolagens de Bloqueio dependendo do valor do item.",
  },
  {
    id: "forjuri-espelho", palavra: "forjuri", nome: "Espelho",
    itens: "Escudos", tipos: ["escudo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 136,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Quando você consegue uma deflexão em uma rolagem de Bloqueio usando este escudo, o dano defletido é subtraído dos pontos de vida do atacante.",
  },
  {
    id: "forjuri-fortificacao", palavra: "forjuri", nome: "Fortificação",
    itens: "Armaduras", tipos: ["armadura"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 137,
    variantes: [
      {"preco": 1500000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você fica imune a pontos de danos finais quaisquer que não sejam resultados do dano bruto subtraído da Proteção.",
  },
  {
    id: "forjuri-obstinacao", palavra: "forjuri", nome: "Obstinação",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 137,
    variantes: [
      {"preco": 60000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você fica imune a Lentidão, Imobilização e Paralizia.",
  },
  {
    id: "forjuri-contramagica", palavra: "forjuri", nome: "Contramágica",
    itens: "Sinete", tipos: ["sinete"],
    ativacao: "Reação", consumivel: false, corrupcao: "", pagina: 137,
    variantes: [
      {"rotulo": "1 Palavra, Normal", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "cd": 10},
      {"rotulo": "2 Palavras, Difícil", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "cd": 12},
      {"rotulo": "3 Palavras, Muito Difícil", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "cd": 14},
    ],
    texto: "Esse sinete possui o entalhe de até três palavras arcanas dependendo do seu valor. Se você for alvo de uma magia composta por uma dessas palavras arcanas enquanto estiver empunhando esse sinete com uma das mãos, você pode usar sua reação para ativá-lo. Caso o faça, o conjurador da magia precisa que sua rolagem de Conjuração supere uma dificuldade, que depende do valor do item, ou ele próprio se tornará alvo da magia em seu lugar.",
  },
  {
    id: "forjuri-rigidez", palavra: "forjuri", nome: "Rigidez",
    itens: "Cintos", tipos: ["cinto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 137,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você fica imune a tentativas de derrubá-lo ou agarrá-lo.",
  },
  {
    id: "forjuri-tenacidade", palavra: "forjuri", nome: "Tenacidade",
    itens: "Colares", tipos: ["colar"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 137,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você fica imune a Exaustão e Enfraquecimento.",
  },
  {
    id: "fulgur-absorcao-eletrica", palavra: "fulgur", nome: "Absorção Elétrica",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 139,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo raio que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "fulgur-chocante", palavra: "fulgur", nome: "Chocante",
    itens: "Munições, Armas e Braçadeiras", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 139,
    variantes: [
      {"rotulo": "Munições", "preco": 1000, "nivel": 1, "grau": 1, "tipo": "municao"},
      {"rotulo": "Armas", "preco": 30000, "nivel": 2, "grau": 1, "tipo": "arma"},
      {"rotulo": "Braçadeiras", "preco": 200000, "nivel": 3, "grau": 1, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, alvos atingidos por você, que sofrerem dano, deverão realizar uma rolagem de Vigor (Normal). Caso falhem, ficarão imobilizados até o fim da cena (Vigor anula).",
  },
  {
    id: "fulgur-dano-de-raio", palavra: "fulgur", nome: "Dano de Raio",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de raio, de acordo com o valor do item.",
  },
  {
    id: "fulgur-explosao-eletrica", palavra: "fulgur", nome: "Explosão Elétrica",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 140,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação, rolando Agilidade. Quando atinge o espaço alvo, cria uma área 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de raio e ficarão paralisados até o fim da cena (Vigor anula).",
  },
  {
    id: "fulgur-imunidade-a-raio", palavra: "fulgur", nome: "Imunidade a Raio",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de raio.",
  },
  {
    id: "fulgur-penetracao-eletrica", palavra: "fulgur", nome: "Penetração Elétrica",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra raio.",
  },
  {
    id: "fulgur-protecao-contra-raio", palavra: "fulgur", nome: "Proteção Contra Raio",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de raio.",
  },
  {
    id: "fulgur-receptor", palavra: "fulgur", nome: "Receptor",
    itens: "Cubo", tipos: ["cubo"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"rotulo": "1 de dano / magia", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 de dano / magia", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 de dano / magia", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Este cubo de cobre do tamanho de um punho pode ser acionado através de um botão contido em um de seus lados e arremessado em seguida (alcance de 5m). Se isso ocorrer enquanto houver núvens no céu, as mesmas ficarão carregadas e um raio será atraído das núvens para o cubo, quebrando tetos (se houver) e causando 1/2/3 de dano bruto de raio (dependendo do valor do item) a todas as criaturas até 4m e carregando o cubo com energia. Enquanto ele estiver carregado, ele funciona como um foco para magias compostas por fulgur e concede 1/2/3 pontos de magia para a conjuração das mesmas, dependendo do valor do item. Quando o último ponto de magia do cubo é gasto, ele descarrega e não pode mais ser usado como foco até ser carregado novamente.",
  },
  {
    id: "fulgur-tempestade", palavra: "fulgur", nome: "Tempestade",
    itens: "Cajados, Totens, Varinhas e Símbolos Sagrados/Profanos", tipos: ["simbolo", "cajado", "varinha", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 140,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana fulgur usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de raio, dependendo do valor do item.",
  },
  {
    id: "glacios-absorcao-glacial", palavra: "glacios", nome: "Absorção Glacial",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 142,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo frio que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "glacios-caminhar-no-gelo", palavra: "glacios", nome: "Caminhar no Gelo",
    itens: "Botas e Cintos", tipos: ["cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 142,
    variantes: [
      {"preco": 700, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode caminhar em supercífies escorregadias normalmente, sem sofrer o risco de deslizar, nem penalidades de terreno difícil.",
  },
  {
    id: "glacios-congelante", palavra: "glacios", nome: "Congelante",
    itens: "Munições, Armas e Braçadeiras", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 142,
    variantes: [
      {"rotulo": "Munições", "preco": 1000, "nivel": 1, "grau": 1, "tipo": "municao"},
      {"rotulo": "Armas", "preco": 30000, "nivel": 2, "grau": 1, "tipo": "arma"},
      {"rotulo": "Braçadeiras", "preco": 200000, "nivel": 3, "grau": 1, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição ou enquanto estiver usando braçadeiras com essa propriedade, alvos que sofrerem dano de seus ataques, deverão realizar uma rolagem de Agilidade (Normal). Caso falhem, ficarão imobilizados pelo resto da cena (Força anula).",
  },
  {
    id: "glacios-dano-congelante", palavra: "glacios", nome: "Dano Congelante",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de frio, de acordo com o valor do item.",
  },
  {
    id: "glacios-explosao-congelante", palavra: "glacios", nome: "Explosão Congelante",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 143,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação, rolando Agilidade. Quando atinge o espaço alvo, cria uma área 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de frio e ficarão lentos até o fim da cena (Vigor anula).",
  },
  {
    id: "glacios-imunidade-a-frio", palavra: "glacios", nome: "Imunidade a Frio",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de frio. Baixas temperaturas de um ambiente naturalmente frio não o afetam.",
  },
  {
    id: "glacios-nevasca", palavra: "glacios", nome: "Nevasca",
    itens: "Cajados, Totens, Varinhas e Símbolos Sagrados/Profanos", tipos: ["simbolo", "cajado", "varinha", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana glacios usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de frio, dependendo do valor do item.",
  },
  {
    id: "glacios-penetracao-gelida", palavra: "glacios", nome: "Penetração Gélida",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra frio.",
  },
  {
    id: "glacios-protecao-contra-frio", palavra: "glacios", nome: "Proteção Contra Frio",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de frio. Baixas temperaturas de um ambiente naturalmente frio não o afetam.",
  },
  {
    id: "glacios-protecao-invernal", palavra: "glacios", nome: "Proteção Invernal",
    itens: "Lanterna", tipos: ["lanterna"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 143,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Empunhando essa lanterna com uma das mãos, você pode ativá-la com uma palavra chave, fazendo com que uma luz fraca azulada emane num raio de 10m. Dentro desse alcance, todos as criaturas recebem Proteção contra dano de frio dependendo do valor do item.",
  },
  {
    id: "ignis-absorcao-ignea", palavra: "ignis", nome: "Absorção Ígnea",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 145,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo fogo que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "ignis-ardente", palavra: "ignis", nome: "Ardente",
    itens: "Munições, Armas e Braçadeiras", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 145,
    variantes: [
      {"rotulo": "Munições", "preco": 1000, "nivel": 1, "grau": 1, "tipo": "municao"},
      {"rotulo": "Armas", "preco": 30000, "nivel": 2, "grau": 1, "tipo": "arma"},
      {"rotulo": "Braçadeiras", "preco": 200000, "nivel": 3, "grau": 1, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição ou enquanto estiver usando braçadeiras com essa propriedade, alvos atingidos por você, que sofrerem dano, deverão ser bem sucedidos em uma rolagem de Vigor (Normal) ou sofrerão dano contínuo de fogo pelo resto da cena (Vigor anula).",
  },
  {
    id: "ignis-caminhar-em-lava-e-brasa", palavra: "ignis", nome: "Caminhar em Lava e Brasa",
    itens: "Botas e Cintos", tipos: ["cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 145,
    variantes: [
      {"preco": 2500, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode caminhar em supercífies de lava como se fosse sólida ou caminhar na brasa, sem sofrer dano ou penalidade.",
  },
  {
    id: "ignis-conflagracao", palavra: "ignis", nome: "Conflagração",
    itens: "Capas e Robes", tipos: ["robe", "capa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"rotulo": "Dano 1", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Dano 2", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Dano 3", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode gastar 1 ponto de magia, para criar uma aura de chamas de 1m de raio (2 para 2m de raio e 3 para 3m de raio) que causa a todos dentro dela 1, 2 ou 3 pontos de dano bruto de fogo por rodada (dependendo do preço do item). A aura dura uma cena.",
  },
  {
    id: "ignis-dano-flamejante", palavra: "ignis", nome: "Dano Flamejante",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de fogo, de acordo com o valor do item.",
  },
  {
    id: "ignis-imunidade-a-fogo", palavra: "ignis", nome: "Imunidade a Fogo",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de fogo.",
  },
  {
    id: "ignis-incandescente", palavra: "ignis", nome: "Incandescente",
    itens: "Bastões, Orbes, Varinhas e Símbolos Sagrados/Profanos", tipos: ["simbolo", "orbe", "bastao", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana ígnis usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de fogo, dependendo do valor do item.",
  },
  {
    id: "ignis-vaporizacao", palavra: "ignis", nome: "Vaporização",
    itens: "Cantís", tipos: ["cantil"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"rotulo": "2m", "preco": 1500, "nivel": 1, "grau": 1, "valor": 2},
      {"rotulo": "4m", "preco": 30000, "nivel": 2, "grau": 2, "valor": 4},
      {"rotulo": "6m", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 6},
    ],
    texto: "Quando você armazena qualquer líquido ingerível nesse cantil por uma hora, ele ferve magicamente o líquido, tornando-o em vapores. Usando uma ação rápida, você pode abrir o cantil. Quando aberto, o cantil dispersa os vapores, ficando vazio e cria uma emanação em torno de si, cujo raio depende do valor do item em metros. Todas as criaturas dentro da emanação recebem os benefícios, como se tivessem ingerido o líquido armazenado nele.",
  },
  {
    id: "ignis-incendiaria", palavra: "ignis", nome: "Incendiária",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 146,
    variantes: [
      {"preco": 300, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação e rolando Agilidade. Quando atinge o espaço alvo, cria uma área 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de fogo até o fim da cena (Vigor anula).",
  },
  {
    id: "ignis-penetracao-ignea", palavra: "ignis", nome: "Penetração Ígnea",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra fogo.",
  },
  {
    id: "ignis-protecao-contra-fogo", palavra: "ignis", nome: "Proteção Contra Fogo",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 146,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de fogo.",
  },
  {
    id: "iluzio-camaleao", palavra: "iluzio", nome: "Camaleão",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para assumir a aparência de um humanóide pequeno, médio ou grande, que você já tenha visto. Você recebe 1D para tentar se passar por essa criatura. O efeito dura até o fim da cena.",
  },
  {
    id: "iluzio-deslocamento", palavra: "iluzio", nome: "Deslocamento",
    itens: "Botas, Cintos, Faixas, Amuletos", tipos: ["amuleto", "faixa", "cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver equipado com um item encantado com essa propriedade, você não pode ser alvos de reações de ataque.",
  },
  {
    id: "iluzio-invisibilidade", palavra: "iluzio", nome: "Invisibilidade",
    itens: "Anéis, Cintos e Capas", tipos: ["capa", "anel", "cinto"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para ficar invisível. Esse efeito dura até que você ataque uma criatura ou até o fim da cena.",
  },
  {
    id: "iluzio-ocultacao", palavra: "iluzio", nome: "Ocultação",
    itens: "Robes e Capas", tipos: ["robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você recebe 1D em rolagens de atividades furtivas.",
  },
  {
    id: "iluzio-nebulosa", palavra: "iluzio", nome: "Nebulosa",
    itens: "Poção", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 149,
    variantes: [
      {"preco": 200, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você usa um item com essa propriedade, você se torna invisivel até o fim da cena ou até que ataque ou conjure magias.",
  },
  {
    id: "iluzio-enganacao", palavra: "iluzio", nome: "Enganação",
    itens: "Espelhos e Símbolo Sagrados/Profanos", tipos: ["simbolo", "espelho"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana iluzio usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "iluzio-quarto-fantasma", palavra: "iluzio", nome: "Quarto Fantasma",
    itens: "Chave", tipos: ["chave"],
    ativacao: "Cena", consumivel: false, corrupcao: "", pagina: 149,
    variantes: [
      {"rotulo": "Normal", "preco": 700, "nivel": 1, "grau": 1, "cd": 10},
      {"rotulo": "Difícil", "preco": 14000, "nivel": 2, "grau": 2, "cd": 12},
      {"rotulo": "Muito Difícil", "preco": 400000, "nivel": 3, "grau": 3, "cd": 14},
    ],
    texto: "Você pode gastar 1 ponto de magia enquanto empunha esta chave, para criar uma área de 12m² coberta de uma ilusão de invisibilidade. Apenas criaturas a sua escolha perceberão que se trata de uma ilusão e poderão se esconder em seu interior. Demais criaturas devem ser bem sucedidas em uma rolagem de Percepção, cuja dificuldade depende do valor do item, ou não perceperão que se trata de uma ilusão. A área é invisível aos olhos de quem a vê de fora, a menos que tenha passado no teste. Quando atravessada, não é possível ver as criaturas dentro dele.",
  },
  {
    id: "inanis-antimagia", palavra: "inanis", nome: "Antimagia",
    itens: "Algemas", tipos: ["algemas"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 151,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Uma criatura algemada com esse item fica incapaz de conjurar magias. Algemar uma criatura é uma ação que só pode ser executada contra criaturas indefesas.",
  },
  {
    id: "inanis-anulacao", palavra: "inanis", nome: "Anulação",
    itens: "Capas e Robes", tipos: ["robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 151,
    variantes: [
      {"rotulo": "Círculo Menor", "preco": 1000, "nivel": 1, "grau": 1},
      {"rotulo": "Círculo Intermediário", "preco": 21000, "nivel": 2, "grau": 2},
      {"rotulo": "Círculo Maior", "preco": 600000, "nivel": 3, "grau": 3},
    ],
    texto: "Enquanto estiver usando esse item, você não pode ser afetado por áreas de efeito de magias de um determinado círculo ou inferior, dependendo do valor do item.",
  },
  {
    id: "inanis-ferida-arcana", palavra: "inanis", nome: "Ferida Arcana",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 151,
    variantes: [
      {"rotulo": "1 Ponto de Magia", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Magia", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Magia", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando você acerta um ataque em uma criatura com essa propriedade, a criatura perde uma quantidade de pontos de magia dependendo do valor do item.",
  },
  {
    id: "inanis-magia-neutra", palavra: "inanis", nome: "Magia Neutra",
    itens: "Baralho", tipos: ["baralho"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 152,
    variantes: [
      {"preco": 21000, "nivel": 2, "grau": 1},
    ],
    texto: "Esse baralho possui 26 cartas. Quando embaralhado, usando as duas mãos, você pode sacar uma carta desse baralho com uma ação, ativar seu efeito e descartá-la, guardando-a fora do baralho. Cada carta possui o desenho da runa de uma palavra arcana (exceto inanis e menso). Quando uma carta é sacada do baralho, magias compostas pela palavra da carta não funcionam em um raio de até 1km até que a carta seja devolvida ao baralho, ou até o fim da cena (o que vier primeiro). Se o baralho estiver guardado em uma algibeira, é possível sacar uma carta usando apenas uma mão e uma ação rápida. É possível devolver as cartas já sacadas ao baralho, mas isso cancelará seu efeito mágico e ele precisará ser embaralhado de novo. Embaralhar o baralho leva uma rodada e requer o uso das duas mãos.",
  },
  {
    id: "inanis-rompimento", palavra: "inanis", nome: "Rompimento",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 152,
    variantes: [
      {"preco": 1500, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você acerta uma criatura com uma arma com essa propriedade e causa dano a ela, todas as condições benéficas à criatura são canceladas.",
  },
  {
    id: "inanis-sangramento-arcano", palavra: "inanis", nome: "Sangramento Arcano",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 152,
    variantes: [
      {"rotulo": "Normal", "preco": 2500, "nivel": 1, "grau": 1, "cd": 10},
      {"rotulo": "Difícil", "preco": 60000, "nivel": 2, "grau": 2, "cd": 12},
      {"rotulo": "Muito Difícil", "preco": 1500000, "nivel": 3, "grau": 3, "cd": 14},
    ],
    texto: "Quando você acerta uma criatura com uma arma com essa propriedade e causa dano a ela, criatura deve ser bem sucedida em uma rolagem de Vigor, cuja dificuldade depende do valor do item, ou perderá 1 ponto de magia por rodada até o fim da cena (Vigor anula).",
  },
  {
    id: "inanis-vacuo", palavra: "inanis", nome: "Vácuo",
    itens: "Orbes, Bastões e Símbolo Sagrados/Profanos", tipos: ["simbolo", "orbe", "bastao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 152,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana inanis usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "inanis-vazio", palavra: "inanis", nome: "Vazio",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 152,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Você pode ativar um item com essa propriedade pagando 1 ponto de magia. A cada rodada ele exigirá 1 ponto de magia seu para continuar ativo. Se você iniciar seu turno sem pontos de magia, o efeito se encerra. Enquanto esta aura durar, nenhuma magia ou item mágico num raio de 10m funcionará (apenas este).",
  },
  {
    id: "kreo-artesao", palavra: "kreo", nome: "Artesão",
    itens: "Luvas e Cintos", tipos: ["cinto", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 154,
    variantes: [
      {"rotulo": "1 ponto heróico", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 pontos heróicos", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 pontos heróicos", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando este item, você cria itens como se tivesse uma quantidade de pontos heróicos diários a mais para gastar na criação do item, dependendo do valor do item.",
  },
  {
    id: "kreo-absorcao-material", palavra: "kreo", nome: "Absorção Material",
    itens: "Armaduras", tipos: ["armadura"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 154,
    variantes: [
      {"rotulo": "1 de Dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 de Dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 de Dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, sempre que você sofrer dano proveniente de uma arma. A arma deve ter sua dureza testada. Numa falha, a arma perderá uma quantidade de pontos de Dureza dependendo do valor do item.",
  },
  {
    id: "kreo-criacao", palavra: "kreo", nome: "Criação",
    itens: "Varinhas, Cajados, Totens e Símbolo Sagrados/Profanos", tipos: ["simbolo", "cajado", "varinha", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 154,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana kreo usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "kreo-fortaleza", palavra: "kreo", nome: "Fortaleza",
    itens: "Chaves", tipos: ["chave"],
    ativacao: "Cena", consumivel: false, corrupcao: "", pagina: 155,
    variantes: [
      {"rotulo": "10m², 1 Andar", "preco": 700, "nivel": 1, "grau": 1, "valor": 10},
      {"rotulo": "20m², 2 Andares", "preco": 14000, "nivel": 2, "grau": 2, "valor": 20},
      {"rotulo": "30m², 3 Andares", "preco": 400000, "nivel": 3, "grau": 3, "valor": 30},
    ],
    texto: "Você pode gastar 1 ponto de magia enquanto empunha esta chave, para criar uma construção de alvenaria, cuja área ocupada e a quantidade de andares depende do preço do item. Essa construção possui portas e janelas à sua escolha e podem ser trancadas e destrancadas usando a própria chave. A construção dura 8 horas. No fim das 8 horas ela desaparece e as criaturas que estiverem em qualquer de seus andares são teleportadas para o chão firme.",
  },
  {
    id: "kreo-identificacao", palavra: "kreo", nome: "Identificação",
    itens: "Lentes", tipos: ["lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 155,
    variantes: [
      {"preco": 1000, "nivel": 1, "grau": 1},
    ],
    texto: "Você recebe 1D na identificação de propriedades de itens mágicos.",
  },
  {
    id: "kreo-indestrutivel", palavra: "kreo", nome: "Indestrutível",
    itens: "Qualquer", tipos: ["qualquer"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 155,
    variantes: [
      {"rotulo": "Dureza +1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Dureza +2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Dureza +3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Um item com esta propriedade possui pontos de Dureza além do normal, dependendo do valor do item. Quando quebrado, seu portador pode trazê-lo de volta em um dia gastando 1 ponto de magia, em uma hora gastando 2 pontos heróicos, ou em uma rodada gastando 3 pontos heróicos.",
  },
  {
    id: "kreo-laminas-infinitas", palavra: "kreo", nome: "Lâminas Infinitas",
    itens: "Baínhas", tipos: ["bainha"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 155,
    variantes: [
      {"rotulo": "Lâminas Grandes", "preco": 400, "nivel": 1, "grau": 1},
      {"rotulo": "Lâminas Pequenas", "preco": 1000, "nivel": 1, "grau": 2},
    ],
    texto: "Enquanto estiver usando este item e ele estiver vazio, você pode gastar 1 ponto de magia para que ele crie dentro dele uma arma do tipo Lâminas Pequenas ou Lâminas Grandes (dependendo do valor do item). Os itens criados desaparecem no fim da cena.",
  },
  {
    id: "kreo-reparacao", palavra: "kreo", nome: "Reparação",
    itens: "Óleos", tipos: ["oleo"],
    ativacao: "Cena", consumivel: true, corrupcao: "", pagina: 155,
    variantes: [
      {"rotulo": "+1 Dureza", "preco": 50, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 Dureza", "preco": 100, "nivel": 1, "grau": 2, "valor": 2},
      {"rotulo": "+3 Dureza", "preco": 150, "nivel": 1, "grau": 3, "valor": 3},
    ],
    texto: "Este item pode ser aplicado sobre um objeto danificado, recuperando pontos da dureza do objeto, dependendo do valor do item.",
  },
  {
    id: "krucigon-arrombar-portais", palavra: "krucigon", nome: "Arrombar Portais",
    itens: "Chaves", tipos: ["chave"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 158,
    variantes: [
      {"preco": 60000, "nivel": 2, "grau": 1},
    ],
    texto: "Usando esse item, você pode abrir portais planares trancados, tornando possível a travessia através dele. O portal permanecerá aberto até ser trancado novamente. Essas chaves são consideradas perigosas e seus usuários normalmente são mal vistos.",
  },
  {
    id: "krucigon-intangibilidade", palavra: "krucigon", nome: "Intangibilidade",
    itens: "Capas", tipos: ["capa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 158,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você pode gastar 2 pontos de magia para ficar intangível até o fim da cena.",
  },
  {
    id: "krucigon-planos", palavra: "krucigon", nome: "Planos",
    itens: "Orbe, Bastão, Varinhas e Símbolo Sagrados/Profanos", tipos: ["simbolo", "orbe", "bastao", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 158,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana krucigon usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "krucigon-teletransporte", palavra: "krucigon", nome: "Teletransporte",
    itens: "Braçadeiras, Botas e Cintos", tipos: ["cinto", "bota", "bracadeira"],
    ativacao: "Movimento", consumivel: false, corrupcao: "", pagina: 158,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você pode usar sua ação de movimento para se teleportar metade do seu valor de Deslocamento (arredondado para baixo) para um lugar que você possa ver.",
  },
  {
    id: "krucigon-toque-planar", palavra: "krucigon", nome: "Toque Planar",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 158,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, suas magias e ataques ignoram a intangibilidade dos seus alvos.",
  },
  {
    id: "lumo-brilhante", palavra: "lumo", nome: "Brilhante",
    itens: "Qualquer", tipos: ["qualquer"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 160,
    variantes: [
      {"preco": 1000, "nivel": 1, "grau": 1},
    ],
    texto: "Itens que possuem esse efeito, podem irradiar uma luz ao alcance de 10m com um simples comando do portador, forte o suficiente para que qualquer criatura com visão possa ver dentro do alcance.",
  },
  {
    id: "lumo-cores-cintilantes", palavra: "lumo", nome: "Cores Cintilantes",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 160,
    variantes: [
      {"rotulo": "Normal", "preco": 1000, "nivel": 1, "grau": 1, "cd": 10},
      {"rotulo": "Difícil", "preco": 21000, "nivel": 2, "grau": 2, "cd": 12},
      {"rotulo": "Muito Difícil", "preco": 600000, "nivel": 3, "grau": 3, "cd": 14},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você pode gastar 1 ponto de magia para que o item brilhe até o fim da cena. Enquanto brilha, o item ilumina uma área de 3m ao redor dele. Quando a luz é ativada, todas as criaturas dentro da área devem ser bem sucedidas em uma rolagem de Percepção, cuja dificuldade depende do valor do item, ou ficarão atordoadas até o fim da cena (Percepção anula).",
  },
  {
    id: "lumo-marca-luminosa", palavra: "lumo", nome: "Marca Luminosa",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 161,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você acerta um ataque com uma arma com essa propriedade, o alvo emite uma luz fraca, porém suficiente para que ele seja facilmente mirado. Este alvo falha automaticamente em tentar se esconder e ataques contra ele recebem 1D.",
  },
  {
    id: "lumo-orientacao", palavra: "lumo", nome: "Orientação",
    itens: "Mapa", tipos: ["mapa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 161,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Você pode gastar um ponto de magia para ativar o poder mágico desse mapa quando ele estiver completamente aberto. Enquanto ativo, o usuário pode perguntar ao mapa a localização de um lugar específico, dentro do mesmo plano que o portador do mapa. Linhas luminosas surgem no mapa para mostrar ao usuário um caminho reto até o local em questão, independente do trajeto ser viável, perigoso ou bloqueado. Depois de mostrado o caminho, as linhas permanece no mapa por 1 hora.",
  },
  {
    id: "lumo-prismatico", palavra: "lumo", nome: "Prismático",
    itens: "Espelhos, Cajados, Varinhas e Símbolo Sagrados/Profanos", tipos: ["simbolo", "cajado", "varinha", "espelho"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 161,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana lumo usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "lumo-solar", palavra: "lumo", nome: "Solar",
    itens: "Pedra", tipos: ["pedra"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 161,
    variantes: [
      {"rotulo": "5m", "preco": 50, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10m", "preco": 100, "nivel": 1, "grau": 2, "valor": 10},
      {"rotulo": "15m", "preco": 150, "nivel": 1, "grau": 3, "valor": 15},
    ],
    texto: "Ativando este item, ele irradia uma luz cujo alcance depende do valor do item. O item permanece ativo por 1 dia ou até ser desativado.",
  },
  {
    id: "lumo-visao-clara", palavra: "lumo", nome: "Visão Clara",
    itens: "Lentes", tipos: ["lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 161,
    variantes: [
      {"preco": 200000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você recebe 1D em rolagens fora de combate que dependem da visão para ter sucesso.",
  },
  {
    id: "majesto-amplificador", palavra: "majesto", nome: "Amplificador",
    itens: "Bastões, Orbes e Símbolo Sagrados/Profanos", tipos: ["simbolo", "orbe", "bastao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 163,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana majesto usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "majesto-aumento", palavra: "majesto", nome: "Aumento",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Constante", consumivel: true, corrupcao: "", pagina: 163,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você usa um item com essa propriedade, você tem sua categoria de tamanho aumentada em um, pelo resto da cena.",
  },
  {
    id: "majesto-atalho", palavra: "majesto", nome: "Atalho",
    itens: "Mapa", tipos: ["mapa"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"preco": 60000, "nivel": 2, "grau": 1},
    ],
    texto: "Quando o mapa é aberto, uma ou mais criaturas podem apontar um destino no mapa e pagar 1 ponto de magia. Quando a criatura viaja para o destino apontado, a distância até o destino é reduzida à metade. Cada criatura pode apontar um destino diferente ou o mesmo destino. Depois de decididos os destinos, o mapa pode ser fechado e guardado. A distância permanece reduzida enquanto a criatura viajar na direção apontada. Quando o destino é alcançado, o efeito cessa.",
  },
  {
    id: "majesto-crescimento", palavra: "majesto", nome: "Crescimento",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"preco": 1500000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando esse anel, você pode gastar 1 ponto de magia para aumentar seu próprio tamanho em uma categoria, pelo resto da cena.",
  },
  {
    id: "majesto-dimensoes", palavra: "majesto", nome: "Dimensões",
    itens: "Bastões, Orbes e Varinhas", tipos: ["orbe", "bastao", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"rotulo": "5m", "preco": 400, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10m", "preco": 7000, "nivel": 2, "grau": 2, "valor": 10},
      {"rotulo": "20m", "preco": 200000, "nivel": 3, "grau": 3, "valor": 20},
    ],
    texto: "Quando você conjura uma magia de alcance maior que toque, usando esse foco, o alcance da magia aumenta uma quantidade de metros, dependendo do preço do item.",
  },
  {
    id: "majesto-diminuicao", palavra: "majesto", nome: "Diminuição",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 164,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você usa um item com essa propriedade, você tem sua categoria de tamanho diminuida em um, pelo resto da cena.",
  },
  {
    id: "majesto-encolhimento", palavra: "majesto", nome: "Encolhimento",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"preco": 1500000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando esse anel, você pode gastar 1 ponto de magia para diminuir seu próprio tamanho em uma categoria, pelo resto da cena.",
  },
  {
    id: "majesto-extradimensional", palavra: "majesto", nome: "Extradimensional",
    itens: "Mochilas", tipos: ["mochila"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"rotulo": "5 Pontos de Peso", "preco": 700, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10 Pontos de Peso", "preco": 14000, "nivel": 2, "grau": 2, "valor": 10},
      {"rotulo": "15 Pontos de Peso", "preco": 400000, "nivel": 3, "grau": 3, "valor": 15},
    ],
    texto: "As dimensões dentro desse item foram magicamente alteradas para que dentro dele coubesse muito mais que o normal, sem que pesasse nada mais que seu próprio peso. Você pode guardar dentro desse item, uma quantidade de peso que depende do preço do item. Esse peso não é somado a sua carga.",
  },
  {
    id: "majesto-passo-dimensional", palavra: "majesto", nome: "Passo Dimensional",
    itens: "Botas e Cintos", tipos: ["cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"rotulo": "+1 Deslocamento", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 Deslocamento", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 Deslocamento", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto você estiver usando esse item, você recebe um bônus no Deslocamento, dependendo do preço do item.",
  },
  {
    id: "majesto-toque-dimensional", palavra: "majesto", nome: "Toque Dimensional",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 164,
    variantes: [
      {"rotulo": "3m", "preco": 1000, "nivel": 1, "grau": 1, "valor": 3},
      {"rotulo": "5m", "preco": 21000, "nivel": 2, "grau": 2, "valor": 5},
      {"rotulo": "10m", "preco": 600000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Enquanto você estiver usando esse item, você pode conjurar magias de alcance de toque como se elas tivessem um alcance em metros, dependendo do preço do item.",
  },
  {
    id: "menso-disciplina-mental", palavra: "menso", nome: "Disciplina Mental",
    itens: "Cristais", tipos: ["cristal"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana menso usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "menso-equilibrio", palavra: "menso", nome: "Equilíbrio",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens acrobáticas enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-flutuante", palavra: "menso", nome: "Flutuante",
    itens: "Discos e Tapetes", tipos: ["disco", "tapete"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Carga 5", "preco": 400, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "Carga 7", "preco": 7000, "nivel": 2, "grau": 2, "valor": 7},
      {"rotulo": "Carga 10", "preco": 200000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Você pode gastar 1 ponto de magia para ativar este item por 1 dia. Enquanto ativado, o item flutua a 1m acima do chão e se move junto com você, se mantendo sempre adjacente. O total de carga suportado pelo item depende do valor do mesmo.",
  },
  {
    id: "menso-forca-mental", palavra: "menso", nome: "Força Mental",
    itens: "Cristais", tipos: ["cristal"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana menso usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de concussão, dependendo do valor do item.",
  },
  {
    id: "menso-influencia", palavra: "menso", nome: "Influência",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens de interação social enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-mensagem-telepatica", palavra: "menso", nome: "Mensagem Telepática",
    itens: "Tiaras, Coroas, Máscaras e Elmos", tipos: ["elmo", "mascara", "tiara", "coroa"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Até 300km", "preco": 400, "nivel": 1, "grau": 1, "valor": 300},
      {"rotulo": "No mesmo plano", "preco": 7000, "nivel": 2, "grau": 2},
      {"rotulo": "Outro plano", "preco": 200000, "nivel": 3, "grau": 3},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode gastar 1 ponto de magia para enviar como uma ação rápida uma mensagem mentalmente para uma criatura com a qual já tenha interagido a uma certa distância (dependendo do valor do item).",
  },
  {
    id: "menso-potencia", palavra: "menso", nome: "Potência",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 167,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens atléticas enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-raciocinio", palavra: "menso", nome: "Raciocínio",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 168,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens de conhecimento e investigação enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-resistencia", palavra: "menso", nome: "Resistência",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 168,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens de resistência a condições negativas físicas enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-salto-telecinetico", palavra: "menso", nome: "Salto Telecinético",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 168,
    variantes: [
      {"preco": 400, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você recebe 1D em rolagens para saltar.",
  },
  {
    id: "menso-sentidos-agucados", palavra: "menso", nome: "Sentidos Aguçados",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 168,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens de ouvir e observar enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "menso-vontade", palavra: "menso", nome: "Vontade",
    itens: "Pedra Iônica", tipos: ["pedra_ionica"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 168,
    variantes: [
      {"rotulo": "Bônus de +1", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Bônus de +2", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Bônus de +3", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Ao segurar essa pequena pedra por um instante, apertada em sua mão, e soltá-la, ela entrará em órbita em torno da sua cabeça, te concedendo um bônus em rolagens de resistência a condições negativas mentais enquanto estiver em órbita, que depende do valor do item. A pedra permanece em órbita até que seja apanhada de volta. Você pode ter até três pedras iônicas em órbita, mas bônus em um mesmo tipo de rolagem não se acumulam.",
  },
  {
    id: "mortis-absorcao-necrotica", palavra: "mortis", nome: "Absorção Necrótica",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 171,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo necrótico que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "mortis-dano-necrotico", palavra: "mortis", nome: "Dano Necrótico",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 171,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto necrótico adicional, de acordo com o valor do item.",
  },
  {
    id: "mortis-dreno", palavra: "mortis", nome: "Dreno",
    itens: "Orbes, Varinhas e Cajados", tipos: ["orbe", "cajado", "varinha"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 171,
    variantes: [
      {"rotulo": "5m", "preco": 1000, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "7m", "preco": 21000, "nivel": 2, "grau": 2, "valor": 7},
      {"rotulo": "10m", "preco": 600000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Enquanto estiver empunhando esse foco, você pode gastar 1 ponto de magia e usar sua ação rápida para drenar a força vital de criaturas próximas. Todas as criaturas a uma certa distância (dependendo do valor do item) devem realizar uma rolagem de Vigor (Normal), ou ficarão enfraquecidos até o fim da cena (Vigor anula). Para cada criatura que ficar enfraquecida desta forma, você recupera 1 ponto de vida.",
  },
  {
    id: "mortis-esqueletica", palavra: "mortis", nome: "Esquelética",
    itens: "Máscaras, Coroas, Tiaras", tipos: ["mascara", "tiara", "coroa"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 5 dias portando.", pagina: 171,
    variantes: [
      {"preco": 3500, "nivel": 1, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você recebe 1D em rolagens de Conjuração de magias que pasmem, atordoem, abalem ou dominem criaturas do tipo Morto-vivo.",
  },
  {
    id: "mortis-funebre", palavra: "mortis", nome: "Fúnebre",
    itens: "Orbes, Cajados e Símbolos Profanos", tipos: ["simbolo", "orbe", "cajado"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 171,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana mortis usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto necrótico adicional, dependendo do valor do item.",
  },
  {
    id: "mortis-imunidade-necrotica", palavra: "mortis", nome: "Imunidade Necrótica",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 172,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos necróticos.",
  },
  {
    id: "mortis-lamina-vampirica", palavra: "mortis", nome: "Lâmina Vampírica",
    itens: "Lâminas Pequenas", tipos: ["laminas_pequenas"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 172,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando atacar com esta arma e causar dano escalonado, você recupera pontos de vida igual ao dano escalonado causado.",
  },
  {
    id: "mortis-macula", palavra: "mortis", nome: "Mácula",
    itens: "Lanterna", tipos: ["lanterna"],
    ativacao: "Ação", consumivel: false, corrupcao: "+1 depois de 5 dias portando.", pagina: 172,
    variantes: [
      {"rotulo": "5m", "preco": 1500, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10m", "preco": 30000, "nivel": 2, "grau": 2, "valor": 10},
      {"rotulo": "15m", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 15},
    ],
    texto: "Quando você ativa essa lanterna usando uma palavra chave, ela emana uma aura de luz púrpura. Todas as criaturas com Corrupção 4 ou menor, que iniciarem seus turnos dentro do alcance da aura, sofrem 1 ponto de dano bruto necrótico. O alcance da aura depende do valor do item.",
  },
  {
    id: "mortis-penetracao-necrotica", palavra: "mortis", nome: "Penetração Necrótica",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 172,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra necrótico.",
  },
  {
    id: "mortis-protecao-contra-necrotico", palavra: "mortis", nome: "Proteção Contra Necrótico",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 172,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de necrótico.",
  },
  {
    id: "mortis-perversao", palavra: "mortis", nome: "Perversão",
    itens: "Ídolo (Estatueta)", tipos: ["estatueta"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 172,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Gastando 1 ponto de magia, você ativa essa estatueta enquanto pronuncia a palavra chave. Ela emana uma energia corrupta enquanto expele sangue e podridão de sua superfície Qualquer criatura em contato com a estatueta quando ativada sofre 1 ponto de dano bruto necrótico por rodada. A cada rodada em que ela estiver ativa, todas as criaturas que tiverem a estatueta ao alcance da visão devem ser bem sucedidas em uma rolagem de Mente, para não receberem 1 ponto de Corrupção obrigatório. A dificuldade depende da Corrupção atual do afetado: Corrupção 0 - 4 (Difícil), Corrupção 5-7 (Normal), Corrupção 8 - 9 (Fácil).",
  },
  {
    id: "mortis-pragas", palavra: "mortis", nome: "Pragas",
    itens: "Cubos", tipos: ["cubo"],
    ativacao: "Ação", consumivel: false, corrupcao: "+1 depois de 3 dias portando.", pagina: 172,
    variantes: [
      {"rotulo": "Desafio 3", "preco": 700, "nivel": 1, "grau": 1, "valor": 3},
      {"rotulo": "Desafio 6", "preco": 3500, "nivel": 1, "grau": 2, "valor": 6},
      {"rotulo": "Desafio 9", "preco": 14000, "nivel": 2, "grau": 3, "valor": 9},
      {"rotulo": "Desafio 12", "preco": 120000, "nivel": 2, "grau": 4, "valor": 12},
      {"rotulo": "Desafio 15", "preco": 400000, "nivel": 3, "grau": 5, "valor": 15},
      {"rotulo": "Desafio 18", "preco": 2000000, "nivel": 3, "grau": 6, "valor": 18},
    ],
    texto: "Este cubo do tamanho de um punho possui entalhes de pragas em cada um de seus lados. Você pode gastar uma quantidade de pontos de magia e colocá-lo no chão enquanto pronuncia a palavra ou frase chave para ativá-lo. Quando ativado, o cubo libera uma praga que alcança uma quantidade de metros igual a 100 multiplicado pela quantidade de pontos de magia gastos. Todas as criaturas dentro do alcance, exceto você, são testadas contra uma doença cujo desafio depende do valor do item.",
  },
  {
    id: "noxia-absorcao-toxica", palavra: "noxia", nome: "Absorção Tóxica",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 174,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo veneno que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "noxia-apotecarios", palavra: "noxia", nome: "Apotecários",
    itens: "Lentes", tipos: ["lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você recebe 1D na identificação de itens que tenham propriedades da palavra noxia e na rolagens de manipulação de venenos.",
  },
  {
    id: "noxia-dano-de-veneno", palavra: "noxia", nome: "Dano de Veneno",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto adicional de veneno, de acordo com o valor do item.",
  },
  {
    id: "noxia-explosao-toxica", palavra: "noxia", nome: "Explosão Tóxica",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 175,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação e rolando Agilidade. Quando atinge o espaço alvo, cria uma área 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano contínuo de veneno até o fim da cena (Vigor anula).",
  },
  {
    id: "noxia-imunidade-a-veneno", palavra: "noxia", nome: "Imunidade a Veneno",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos de veneno.",
  },
  {
    id: "noxia-nocivo", palavra: "noxia", nome: "Nocivo",
    itens: "Munições", tipos: ["municao"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"preco": 1000, "nivel": 1, "grau": 1},
    ],
    texto: "Quando atacar com uma munição com essas propriedade, alvos atingidos por você, que sofrerem dano, deverão realizar uma rolagem de Vigor (Normal). Caso falhem, sofrerão dano contínuo de veneno até o fim da cena (Vigor anula).",
  },
  {
    id: "noxia-nevoa-sufocante", palavra: "noxia", nome: "Névoa Sufocante",
    itens: "Incensório", tipos: ["incensorio"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"rotulo": "5m, Lento, Normal", "preco": 3500, "nivel": 1, "grau": 1, "valor": 5, "cd": 10},
      {"rotulo": "10m, Lento e Pasmo, Difícil", "preco": 120000, "nivel": 2, "grau": 2, "valor": 10, "cd": 12},
      {"rotulo": "15m, Lento, Pasmo e Enfraquecido, Muito Difícil", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 15, "cd": 14},
    ],
    texto: "Você pode gastar 1 ponto de magia para ativar esse incensório, enquanto estiver empunhando ele, fazendo com que ele libere uma aura de névoa. Criaturas dentro da aura, exceto você, sofrem 1 ponto de dano bruto de veneno e uma ou mais condições (Vigor anula cada uma), caso não sejam bem sucedidas em uma rolagem de Vigor. O raio da aura de névoa, as condições e a dificuldade do teste dependendo valor do item.",
  },
  {
    id: "noxia-penetracao-toxica", palavra: "noxia", nome: "Penetração Tóxica",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra veneno.",
  },
  {
    id: "noxia-perfido", palavra: "noxia", nome: "Pérfido",
    itens: "Totens, Cajados e Símbolos Sagrados/Profanos", tipos: ["simbolo", "cajado", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana noxia usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional de veneno, dependendo do valor do item.",
  },
  {
    id: "noxia-protecao-contra-veneno", palavra: "noxia", nome: "Proteção Contra Veneno",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 175,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano de veneno.",
  },
  {
    id: "pluribus-duplicacao", palavra: "pluribus", nome: "Duplicação",
    itens: "Bolsa", tipos: ["bolsa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 177,
    variantes: [
      {"rotulo": "10 dias, nível 3", "preco": 3500, "nivel": 1, "grau": 1, "valor": 10},
      {"rotulo": "20 dias, nível 6", "preco": 120000, "nivel": 2, "grau": 2, "valor": 20},
      {"rotulo": "30 dias, nível 12", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 30},
    ],
    texto: "Quando você coloca um item nessa bolsa, ela se fecha e permanece fechada por uma quantidade de dias, dependendo do valor da bolsa. Quando a bolsa é aberta depois do prazo, o item colocado nela estará duplicado. Caso o item seja mágico, a cópia só terá as propriedades do original caso sejam de um nível igual ou inferior ao declarado no valor desta bolsa. Caso contrário, a cópia será apenas uma versão comum da original.",
  },
  {
    id: "pluribus-mimico", palavra: "pluribus", nome: "Mímico",
    itens: "Máscara", tipos: ["mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 177,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Você recebe 1D em na rolagem de uma ação fora de combate quando alguém ja tiver tentado a mesma ação na mesma cena.",
  },
  {
    id: "pluribus-laminas-espelho", palavra: "pluribus", nome: "Lâminas Espelho",
    itens: "Lâminas Pequenas", tipos: ["laminas_pequenas"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 178,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver empunhando um item com essa propriedade, você pode gastar 1 ponto de magia para criar uma cópia de si mesmo. Esta copia compartilha todas as suas características (Ex.: se ela sofrer dano, o dano será descontado dos seus pontos de vida). Quando você faz seu turno, você pode dividir suas ações entre ela e você. A cópia permanece até o fim da cena.",
  },
  {
    id: "pluribus-paradoxal", palavra: "pluribus", nome: "Paradoxal",
    itens: "Espelhos, Bastões e Orbes", tipos: ["orbe", "bastao", "espelho"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 178,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana pluribus usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "pluribus-recuperacao-replicada", palavra: "pluribus", nome: "Recuperação Replicada",
    itens: "Armaduras e Robes", tipos: ["armadura", "robe"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 178,
    variantes: [
      {"preco": 200000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, quando você recuperar pontos de vida de qualquer forma (exceto por descanso), a criatura mais próxima dentro de 3m de você recuperará a mesma quantidade de pontos de vida.",
  },
  {
    id: "pluribus-seta-fantasma", palavra: "pluribus", nome: "Seta Fantasma",
    itens: "Bestas, Dardos e Arcos", tipos: ["dardo", "arco", "besta"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 178,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você ataca com uma arma com essa propriedade, você pode gastar 1 ponto de magia para fazer um segundo ataque contra um alvo adicional até 3m do primeiro.",
  },
  {
    id: "saeculorum-aceleracao", palavra: "saeculorum", nome: "Aceleração",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 181,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você pode gastar 3 pontos de magia para fazer um turno adicional. Você só pode usar essa propriedade uma vez por rodada.",
  },
  {
    id: "saeculorum-agilidade", palavra: "saeculorum", nome: "Agilidade",
    itens: "Luvas", tipos: ["luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 181,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando essas luvas, você recebe 1D no seu atributo de Agilidade.",
  },
  {
    id: "saeculorum-corrida", palavra: "saeculorum", nome: "Corrida",
    itens: "Sela", tipos: ["sela"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 181,
    variantes: [
      {"rotulo": "2m", "preco": 1000, "nivel": 1, "grau": 1, "valor": 2},
      {"rotulo": "5m", "preco": 21000, "nivel": 2, "grau": 2, "valor": 5},
      {"rotulo": "10m", "preco": 600000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Uma montaria equipada com essa sela recebe um bônus de Deslocamento, dependendo do valor do item.",
  },
  {
    id: "saeculorum-desaceleracao", palavra: "saeculorum", nome: "Desaceleração",
    itens: "Arcos, Bestas e Armas de Arremesso", tipos: ["arremesso", "arco", "besta"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 181,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando atacar usando esta arma e o alvo sofrer dano, você pode gastar 1 ponto de magia para deixar seu alvo lento, 2 pontos de magia para deixar o alvo imobilizado ou 3 pontos de magia para deixar o alvo paralisado, até o fim da cena (Força anula), caso o alvo não seja bem sucedido em uma rolagem de Força.",
  },
  {
    id: "saeculorum-eras", palavra: "saeculorum", nome: "Eras",
    itens: "Bastões, Cajados, Varinhas e Símbolos Sagrados/Profanos", tipos: ["simbolo", "bastao", "cajado", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 181,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana saeculorum usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "saeculorum-letargia-temporal", palavra: "saeculorum", nome: "Letargia Temporal",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 182,
    variantes: [
      {"preco": 200, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação, rolando Agilidade. Quando atinge o espaço alvo, cria uma área 2m de raio centrada no espaço. Todos dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou ficarão lentos e incapazes de fazer reações, até o fim da cena (Força anula).",
  },
  {
    id: "saeculorum-movimento-rapido", palavra: "saeculorum", nome: "Movimento Rápido",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 182,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para fazer um movimento adicional. Você só pode usar essa propriedade uma vez por rodada.",
  },
  {
    id: "saeculorum-preservacao", palavra: "saeculorum", nome: "Preservação",
    itens: "Invólucro", tipos: ["involucro"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 182,
    variantes: [
      {"preco": 21000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto o corpo de uma criatura estiver envolvido por esse tecido, ele resistirá mais aos efeitos do tempo. Cada 10 dias passados contarão como 1 para questões de efeitos da magia Reviver.",
  },
  {
    id: "saeculorum-rapidez", palavra: "saeculorum", nome: "Rapidez",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 182,
    variantes: [
      {"rotulo": "Ação Rápida", "preco": 100, "nivel": 1, "grau": 1},
      {"rotulo": "Movimento", "preco": 300, "nivel": 1, "grau": 2},
      {"rotulo": "Ação", "preco": 1000, "nivel": 1, "grau": 3},
    ],
    texto: "Quando você usa um item com essa propriedade, você recebe um tipo de ação adicional por turno, dependendo do valor do item, até o fim da cena.",
  },
  {
    id: "saeculorum-reflexos-rapidos", palavra: "saeculorum", nome: "Reflexos Rápidos",
    itens: "Cintos", tipos: ["cinto"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 182,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você pode gastar 1 ponto de magia para fazer uma reação adicional. Você só pode usar essa propriedade uma vez por rodada.",
  },
  {
    id: "saeculorum-veloz", palavra: "saeculorum", nome: "Veloz",
    itens: "Arcos e Lâminas Pequenas", tipos: ["laminas_pequenas", "arco"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 182,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Você pode gastar 2 pontos de magia para fazer um ataque adicional com essa arma sem sofrer nenhuma penalidade. Você só pode usar essa propriedade uma vez por rodada.",
  },
  {
    id: "sangon-alado", palavra: "sangon", nome: "Alado",
    itens: "Capas, Robes, Máscaras, Elmos e Botas", tipos: ["robe", "capa", "bota", "elmo", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 60000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode usar a habilidade Asas (Avançado) como se tivesse comprado ela.",
  },
  {
    id: "sangon-anfibia", palavra: "sangon", nome: "Anfíbia",
    itens: "Armaduras e Robes", tipos: ["armadura", "robe"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode usar a habilidade Movimento de Natação (Avançado) como se tivesse comprado ela. Adicionalmente você não sofre penalidade pelo uso de armadura enquanto estiver vestindo esse item dentro d'água.",
  },
  {
    id: "sangon-aracnideo", palavra: "sangon", nome: "Aracnídeo",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode mover-se por paredes e tetos como se fossem o chão, sem a necessidade de nenhuma rolagem.",
  },
  {
    id: "sangon-bestial", palavra: "sangon", nome: "Bestial",
    itens: "Lentes, Máscaras e Elmos", tipos: ["elmo", "mascara", "lente"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 120000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode usar a habilidade Predador Astuto (Avançado) como se tivesse comprado ela.",
  },
  {
    id: "sangon-fundamental", palavra: "sangon", nome: "Fundamental",
    itens: "Orbes, Cajados, Varinhas e Símbolos Sagrados/Profanos", tipos: ["simbolo", "orbe", "cajado", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"rotulo": "Conjuração +1", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Conjuração +2", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Conjuração +3", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana sangon usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "sangon-garras-afiadas", palavra: "sangon", nome: "Garras Afiadas",
    itens: "Manoplas e Luvas", tipos: ["luva", "manopla"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 21000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode usar a habilidade Garras (Avançado) como se tivesse comprado ela.",
  },
  {
    id: "sangon-joia", palavra: "sangon", nome: "Jóia",
    itens: "Armas", tipos: ["arma"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 1000, "nivel": 1, "grau": 1},
    ],
    texto: "Pronunciando uma palavra secreta, você pode transformar um item com essa propriedade em uma jóia que caiba na palma da mão e vice-versa, usando uma ação simples. A palavra secreta é definida quando este item é criado.",
  },
  {
    id: "sangon-presas-vorazes", palavra: "sangon", nome: "Presas Vorazes",
    itens: "Máscaras e Elmos", tipos: ["elmo", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 185,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com esta propriedade, você pode usar a habilidade Presas (Avançado) como se tivesse comprado ela.",
  },
  {
    id: "sankta-absorcao-radiante", palavra: "sankta", nome: "Absorção Radiante",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 187,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo radiante que você sofrer, será convertido em recuperação de pontos de vida.",
  },
  {
    id: "sankta-dano-radiante", palavra: "sankta", nome: "Dano Radiante",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 187,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano bruto radiante adicional, de acordo com o valor do item.",
  },
  {
    id: "sankta-destruicao-sagrada", palavra: "sankta", nome: "Destruição Sagrada",
    itens: "Totens, Cajados e Símbolos Sagrados", tipos: ["simbolo", "cajado", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 188,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana sankta usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto adicional radiante, dependendo do valor do item.",
  },
  {
    id: "sankta-esplendor", palavra: "sankta", nome: "Esplendor",
    itens: "Lanterna", tipos: ["lanterna"],
    ativacao: "Ação", consumivel: false, corrupcao: "-1 depois de 5 dias portando.", pagina: 188,
    variantes: [
      {"rotulo": "5m", "preco": 1500, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10m", "preco": 30000, "nivel": 2, "grau": 2, "valor": 10},
      {"rotulo": "15m", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 15},
    ],
    texto: "Quando você ativa essa lanterna usando uma palavra chave, ela emana uma aura de luz dourada. Todas as criaturas com Corrupção 6 ou maior, que iniciarem seus turnos dentro do alcance da aura, sofrem 1 ponto de dano bruto radiante. O alcance da aura depende do valor do item.",
  },
  {
    id: "sankta-expurgo", palavra: "sankta", nome: "Expurgo",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 188,
    variantes: [
      {"rotulo": "Munições", "preco": 1000, "nivel": 1, "grau": 1, "tipo": "municao"},
      {"rotulo": "Armas", "preco": 30000, "nivel": 2, "grau": 1, "tipo": "arma"},
      {"rotulo": "Braçadeiras", "preco": 1000000, "nivel": 3, "grau": 1, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com uma arma ou munição, ou enquanto estiver usando uma braçadeira, com essa propriedade, alvos atingidos por você, que sofrerem dano, deverão realizar uma rolagem de Mente (Normal). Caso falhem, sofrerão dano contínuo sagrado até o fim da cena (Mente anula).",
  },
  {
    id: "sankta-imunidade-radiante", palavra: "sankta", nome: "Imunidade Radiante",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 188,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais de radiante.",
  },
  {
    id: "sankta-penetracao-radiante", palavra: "sankta", nome: "Penetração Radiante",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 188,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra radiante.",
  },
  {
    id: "sankta-protecao-contra-radiante", palavra: "sankta", nome: "Proteção Contra Radiante",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 188,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano radiante.",
  },
  {
    id: "sonigu-abertura", palavra: "sonigu", nome: "Abertura",
    itens: "Sinete", tipos: ["sinete"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"preco": 30000, "nivel": 2, "grau": 1},
    ],
    texto: "Quando você soa esse pequeno sino de mão, travas, trancas, portas, válvulas, cancelas, algemas, correntes e ferrolhos se abrem automaticamente. Ele não funciona contra dispositivos trancados magicamente.",
  },
  {
    id: "sonigu-absorcao-sonica", palavra: "sonigu", nome: "Absorção Sônica",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo sônico que você sofrer, será convertido em pontos de vida.",
  },
  {
    id: "sonigu-atuacao", palavra: "sonigu", nome: "Atuação",
    itens: "Máscaras", tipos: ["mascara"],
    ativacao: "Constante / Ação Rápida", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"rotulo": "3m", "preco": 400, "nivel": 1, "grau": 1, "valor": 3},
      {"rotulo": "5m", "preco": 7000, "nivel": 2, "grau": 2, "valor": 5},
      {"rotulo": "10m", "preco": 200000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Enquanto estiver usando esse item, você recebe 1D em rolagens relacionadas a atuação e performance (canto, oratória, tocar um instrumento, etc). Adicionamente, você pode gastar 1 ponto de magia quando atua, para dar a seus aliados 1D na próxima rolagem de cada um. Essa rolagem precisa ser feita até o fim da cena ou o benefício é perdido.",
  },
  {
    id: "sonigu-dano-sonico", palavra: "sonigu", nome: "Dano Sônico",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano sônico bruto adicional, de acordo com o valor do item.",
  },
  {
    id: "sonigu-ecoante", palavra: "sonigu", nome: "Ecoante",
    itens: "Instrumentos Musicais e Símbolos Sagrados/Profanos", tipos: ["instrumento", "simbolo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 ponto de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 ponto de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana sonigu usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto sônico adicional, dependendo do valor do item.",
  },
  {
    id: "sonigu-estrondante", palavra: "sonigu", nome: "Estrondante",
    itens: "Maças e Martelos", tipos: ["maca", "martelo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"preco": 1500, "nivel": 1, "grau": 1},
    ],
    texto: "Quando atacar com a arma, alvos atingidos por você deverão realizar uma rolagem de Vigor (Normal). Caso falhem, ficarão surdos até o fim da cena (Vigor anula).",
  },
  {
    id: "sonigu-explosao-sonica", palavra: "sonigu", nome: "Explosão Sônica",
    itens: "Bombas Alquímicas", tipos: ["bomba"],
    ativacao: "Ação", consumivel: true, corrupcao: "", pagina: 192,
    variantes: [
      {"preco": 500, "nivel": 1, "grau": 1},
    ],
    texto: "Você pode arremessar este item num espaço até 10m de distância, usando uma ação, rolando Agilidade. Quando atinge o espaço alvo, cria uma área com 2m de raio centrada no espaço. Todas as criaturas dentro da área devem ser bem sucedidos em uma rolagem de Esquiva oposta a sua Agilidade, ou sofrerão dano sônico contínuo e ficarão surdos até o fim da cena (Percepção anula).",
  },
  {
    id: "sonigu-imunidade-sonica", palavra: "sonigu", nome: "Imunidade Sônica",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 192,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos sônicos.",
  },
  {
    id: "sonigu-murmurante", palavra: "sonigu", nome: "Murmurante",
    itens: "Amuletos, Colares e Periaptos", tipos: ["amuleto", "colar", "periapto"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 193,
    variantes: [
      {"rotulo": "3m", "preco": 400, "nivel": 1, "grau": 1, "valor": 3},
      {"rotulo": "5m", "preco": 7000, "nivel": 2, "grau": 2, "valor": 5},
      {"rotulo": "10m", "preco": 200000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Enquanto estiver usando um item com esta propriedade, você pode gastar 1 ponto de magia para ativá-lo. O item emite um som que pode ser ouvido dentro de um alcance, que depende do valor do item. Criaturas que puderem ouvir o som, devem realizar uma rolagem de Percepção (Normal), ou sofrerão -1/-2/-3 (dependendo do valor do item) em suas rolagens de Mente, até o fim da cena (Percepção anula). O portador do item não é afetado.",
  },
  {
    id: "sonigu-penetracao-sonica", palavra: "sonigu", nome: "Penetração Sônica",
    itens: "Luvas e Braçadeiras", tipos: ["bracadeira", "luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 193,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra dano sônico.",
  },
  {
    id: "sonigu-protecao-contra-som", palavra: "sonigu", nome: "Proteção Contra Som",
    itens: "Armaduras, Robes e Capas", tipos: ["armadura", "robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 193,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano sônico.",
  },
  {
    id: "sorcdiron-agilidade-relampago", palavra: "sorcdiron", nome: "Agilidade Relâmpago",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Agilidade", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Agilidade", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Agilidade", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando estas botas, você recebe 1/2/3 pontos em Agilidade (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-arcanista", palavra: "sorcdiron", nome: "Arcanista",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Conjuração", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Conjuração", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Conjuração", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Você pode gastar 1 ponto de magia para receber um bônus em suas rolagens de Conjuração até o fim da cena, dependendo do valor do item.",
  },
  {
    id: "sorcdiron-atirador", palavra: "sorcdiron", nome: "Atirador",
    itens: "Luvas", tipos: ["luva"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Ataque", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Ataque", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Ataque", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando estas luvas, você recebe 1/2/3 pontos em seus ataques com armas de Alcance (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-ataque-certeiro", palavra: "sorcdiron", nome: "Ataque Certeiro",
    itens: "Óleos", tipos: ["oleo"],
    ativacao: "Constante", consumivel: true, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Ataque", "preco": 50, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Ataque", "preco": 100, "nivel": 1, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Ataque", "preco": 200, "nivel": 1, "grau": 3, "valor": 3},
    ],
    texto: "Quando aplicado sobre uma arma, este item dá a arma um bônus nos ataques feitos com ela até o fim do próximo combate, dependendo do valor do item.",
  },
  {
    id: "sorcdiron-batalha", palavra: "sorcdiron", nome: "Batalha",
    itens: "Manoplas", tipos: ["manopla"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Ataque", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Ataque", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Ataque", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando estas manoplas, você recebe 1/2/3 pontos em seus ataques com armas corpo a corpo (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-bloqueio-absoluto", palavra: "sorcdiron", nome: "Bloqueio Absoluto",
    itens: "Escudos", tipos: ["escudo"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 196,
    variantes: [
      {"rotulo": "+1 em Bloqueio", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Bloqueio", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Bloqueio", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando este escudo, você recebe 1/2/3 pontos em Bloqueio (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-corredor", palavra: "sorcdiron", nome: "Corredor",
    itens: "Botas", tipos: ["bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Deslocamento", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Deslocamento", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Deslocamento", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando estas botas, você recebe 1/2/3 pontos em seu Deslocamento (dependendo do preço do item) e 1D em Esquiva contra reações de ataque.",
  },
  {
    id: "sorcdiron-esquiva-ardilosa", palavra: "sorcdiron", nome: "Esquiva Ardilosa",
    itens: "Capas", tipos: ["capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Esquiva", "preco": 2500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Esquiva", "preco": 60000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Esquiva", "preco": 1500000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando esta capa, você recebe 1/2/3 pontos em Esquiva (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-excelencia", palavra: "sorcdiron", nome: "Excelência",
    itens: "Bastões, Instrumentos Musicais, Varinhas e Símbolos Sagrados/Profanos", tipos: ["instrumento", "simbolo", "bastao", "varinha"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Conjuração", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Conjuração", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Conjuração", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana sorcdiron usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "sorcdiron-forca-do-gigante", palavra: "sorcdiron", nome: "Força do Gigante",
    itens: "Manoplas", tipos: ["manopla"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Força", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Força", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Força", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando estas manoplas, você recebe 1/2/3 pontos em Força (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-mente-plena", palavra: "sorcdiron", nome: "Mente Plena",
    itens: "Bandanas", tipos: ["bandana"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Mente", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Mente", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Mente", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando esta bandana, você recebe 1/2/3 pontos em Mente (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-percepcao-apurada", palavra: "sorcdiron", nome: "Percepção Apurada",
    itens: "Colares", tipos: ["colar"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Percepção", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Percepção", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Percepção", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você recebe 1/2/3 pontos em Percepção (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-reacao-rapida", palavra: "sorcdiron", nome: "Reação Rápida",
    itens: "Braçadeiras", tipos: ["bracadeira"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+3 em Iniciativa", "preco": 1500, "nivel": 1, "grau": 1, "valor": 3},
      {"rotulo": "+5 em Iniciativa", "preco": 30000, "nivel": 2, "grau": 2, "valor": 5},
      {"rotulo": "+10 em Iniciativa", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 10},
    ],
    texto: "Enquanto estiver usando estas braçadeiras, você recebe 1/2/3 pontos em Iniciativa (dependendo do preço do item) e 1D em suas reações de ataque.",
  },
  {
    id: "sorcdiron-saltitantes", palavra: "sorcdiron", nome: "Saltitantes",
    itens: "Estrepes", tipos: ["estrepes"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "1m", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2m", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3m", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Esses estrepes possuem todas as propriedades de estrepes comuns, exceto que a área que cobrem quando arremessados nunca diminui quando recuperados após o combate. Quando uma criatura falha em uma rolagem de Agilidade a entrar uma área ocupada por eles, além da lentidão que o item causa, a criatura sofrerá 1 ponto de dano perfurante final. Adicionalmente, uma vez por rodada, os estrepes que estejam em espaços desocupados se movem até alcançar espaços ocupados por criaturas. A quantidade de metros que eles se movem por rodada depende do valor do item.",
  },
  {
    id: "sorcdiron-sobrevida", palavra: "sorcdiron", nome: "Sobrevida",
    itens: "Armaduras", tipos: ["armadura"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+2 de Sobrevida", "preco": 2500, "nivel": 1, "grau": 1, "valor": 2},
      {"rotulo": "+3 de Sobrevida", "preco": 60000, "nivel": 2, "grau": 2, "valor": 3},
      {"rotulo": "+5 de Sobrevida", "preco": 1500000, "nivel": 3, "grau": 3, "valor": 5},
    ],
    texto: "Enquanto estiver usando esta armadura, você pode gastar 1 ponto de magia para receber 2/3/5 pontos de sobrevida (dependendo do preço do item).",
  },
  {
    id: "sorcdiron-vigor-da-rocha", palavra: "sorcdiron", nome: "Vigor da Rocha",
    itens: "Cinto", tipos: ["cinto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 197,
    variantes: [
      {"rotulo": "+1 em Vigor", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Vigor", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Vigor", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando este cinto, você recebe 1/2/3 pontos em Vigor (dependendo do preço do item).",
  },
  {
    id: "tenebrae-crepusculo", palavra: "tenebrae", nome: "Crepúsculo",
    itens: "Lanterna", tipos: ["lanterna"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 199,
    variantes: [
      {"rotulo": "5m", "preco": 400, "nivel": 1, "grau": 1, "valor": 5},
      {"rotulo": "10m", "preco": 7000, "nivel": 2, "grau": 2, "valor": 10},
      {"rotulo": "15m", "preco": 200000, "nivel": 3, "grau": 3, "valor": 15},
    ],
    texto: "Você pode ativar essa lanterna gastando 1 ponto de magia e pronunciando a palavra chave. Enquanto ativada, a lanterna emite uma aura de escuridão. Todas as criaturas dentro da aura ficam cegas enquanto estiverem dentro dela. Nenhuma fonte de luz não mágica funciona dentro da aura. Fontes de luz mágicas vindas de itens, devem ser de um nível superior ao da lanterna. Fontes de luz mágicas vinda de magias devem ser bem sucedidas em uma rolagem de Conjuração (Difícil) para superarem a escuridão da lanterna. O alcance da aura depende do valor do item.",
  },
  {
    id: "tenebrae-lugubre", palavra: "tenebrae", nome: "Lúgubre",
    itens: "Capas e Robes", tipos: ["robe", "capa"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 199,
    variantes: [
      {"preco": 14000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você recebe 1D em rolagens para evitar ser notado e recebe 1 ponto de proteção contra dano radiante.",
  },
  {
    id: "tenebrae-macabra", palavra: "tenebrae", nome: "Macabra",
    itens: "Lâminas Pequenas", tipos: ["laminas_pequenas"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 200,
    variantes: [
      {"rotulo": "1m, Normal", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "cd": 10},
      {"rotulo": "2m, Difícil", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "cd": 12},
      {"rotulo": "3m, Muito Difícil", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "cd": 14},
    ],
    texto: "Enquanto estiver empunhando este item, você pode gastar 1 ponto de magia para ganhar uma aura de escuridão com um raio que depende do valor do item, dentro da qual apenas você e quem for bem sucedido em uma rolagem de Perceção enxergam. A dificuldade na rolagem depende do valor do item. A aura dura até o fim da cena.",
  },
  {
    id: "tenebrae-tentaculos-negros", palavra: "tenebrae", nome: "Tentáculos Negros",
    itens: "Robes e Capas", tipos: ["robe", "capa"],
    ativacao: "Ação Rápida", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 200,
    variantes: [
      {"rotulo": "Alcance 1m", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Alcance 2m", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Alcance 3m", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, você pode gastar 1/2/3 pontos de magia para fazer com que surjam tentáculos de sombras ao seu redor, que duram até o fim da cena. Eles agarram criaturas que entrarem ou iniciarem seus turnos dentro do alcance deles (que varia de acordo com o valor do item), caso eles falhem numa rolagem de Agilidade, cuja dificuldade depende da quantidade de pontos de magia gastos: 1 (Normal), 2 (Difícil) e 3 (Muito Difícil).",
  },
  {
    id: "tenebrae-passo-umbral", palavra: "tenebrae", nome: "Passo Umbral",
    itens: "Botas e Cintos", tipos: ["cinto", "bota"],
    ativacao: "Constante", consumivel: false, corrupcao: "+1 depois de 10 dias portando.", pagina: 200,
    variantes: [
      {"preco": 7000, "nivel": 2, "grau": 1},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você fica envolto de escuridão quando se move, recebendo 1D em Esquiva contra reações de ataque sofridas quando se move.",
  },
  {
    id: "tenebrae-sombras", palavra: "tenebrae", nome: "Sombras",
    itens: "Orbes, Cajados e Símbolos Profanos", tipos: ["simbolo", "orbe", "cajado"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 200,
    variantes: [
      {"rotulo": "+1 em Conjuração", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Conjuração", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Conjuração", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana tenebrae usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "traumato-absorcao-psiquica", palavra: "traumato", nome: "Absorção Psíquica",
    itens: "Periaptos", tipos: ["periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 202,
    variantes: [
      {"preco": 1000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um item com essa propriedade, todo o dano final do tipo psíquico que você sofrer, será convertido em pontos de magia.",
  },
  {
    id: "traumato-dano-psiquico", palavra: "traumato", nome: "Dano Psíquico",
    itens: "Braçadeiras, Armas e Munições", tipos: ["bracadeira", "municao", "arma"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 202,
    variantes: [
      {"rotulo": "Armas — 1 de dano", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1, "tipo": "arma"},
      {"rotulo": "Armas — 2 de dano", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "arma"},
      {"rotulo": "Armas — 3 de dano", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "arma"},
      {"rotulo": "Munições — 1 de dano", "preco": 400, "nivel": 1, "grau": 1, "valor": 1, "tipo": "municao"},
      {"rotulo": "Munições — 2 de dano", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "municao"},
      {"rotulo": "Munições — 3 de dano", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "municao"},
      {"rotulo": "Braçadeiras — 1 de dano", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 2 de dano", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2, "tipo": "bracadeira"},
      {"rotulo": "Braçadeiras — 3 de dano", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3, "tipo": "bracadeira"},
    ],
    texto: "Quando atacar com arma, munição, ou enquanto estiver usando braçadeiras com essa propriedade, seus ataques causarão 1/2/3 de dano psíquico bruto adicional, de acordo com o valor do item.",
  },
  {
    id: "traumato-imunidade-psiquica", palavra: "traumato", nome: "Imunidade Psíquica",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 202,
    variantes: [
      {"preco": 600000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver usando um anel com essa propriedade, você ignora danos finais e danos contínuos psíquicos.",
  },
  {
    id: "traumato-penetracao-psiquica", palavra: "traumato", nome: "Penetração Psíquica",
    itens: "Colares", tipos: ["colar"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 203,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, seus ataques ignoram proteção contra dano psíquico.",
  },
  {
    id: "traumato-pesadelos", palavra: "traumato", nome: "Pesadelos",
    itens: "Instrumentos Musicais, Orbes e Símbolos Sagrados/Profanos", tipos: ["instrumento", "simbolo", "orbe"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 203,
    variantes: [
      {"rotulo": "1 ponto de dano", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 pontos de dano", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 pontos de dano", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana traumato usando esse item como foco. Se esta magia causar dano, ela irá causar dano bruto psíquico adicional, dependendo do valor do item.",
  },
  {
    id: "traumato-protecao-contra-psiquico", palavra: "traumato", nome: "Proteção Contra Psíquico",
    itens: "Elmos, Máscaras", tipos: ["elmo", "mascara"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 203,
    variantes: [
      {"rotulo": "Proteção 1", "preco": 400, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "Proteção 2", "preco": 7000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "Proteção 3", "preco": 200000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto estiver vestindo um item com essa propriedade, você recebe Proteção 1, 2 ou 3 contra dano psíquico.",
  },
  {
    id: "traumato-tormento", palavra: "traumato", nome: "Tormento",
    itens: "Cubos", tipos: ["cubo"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 203,
    variantes: [
      {"rotulo": "1 de Dano, 5m", "preco": 1500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 de Dano, 10m", "preco": 30000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 de Dano, 15m", "preco": 1000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Você pode ativar este cubo pagando 1 ponto de magia e colocando-o sobre uma superfície sólida. O cubo libera uma aura que atormenta as mentes de todas as criaturas dentro dela, sempre que se movem. Qualquer criatura que se deslocar dentro da aura, seja para entrar ou sair, sofre 1/2/3 pontos de dano bruto psíquico (exceto o portador do cubo). O cubo permanece ativo até o fim da cena. O alcance da aura depende do valor do item.",
  },
  {
    id: "vitae-bastiao", palavra: "vitae", nome: "Bastião",
    itens: "Escudos", tipos: ["escudo"],
    ativacao: "Ação", consumivel: false, corrupcao: "", pagina: 206,
    variantes: [
      {"rotulo": "1 Ponto de Vida", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Vida", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Vida", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando você é acertado por um golpe crítico e está empunhando esse escudo, você pode usar sua reação para recuperar uma quantidade de pontos de vida, dependendo do preço do item.",
  },
  {
    id: "vitae-bom-descanso", palavra: "vitae", nome: "Bom Descanso",
    itens: "Saco de Dormir", tipos: ["saco_de_dormir"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 206,
    variantes: [
      {"rotulo": "1 Ponto de Vida", "preco": 700, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Vida", "preco": 14000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Vida", "preco": 400000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando você descansa nesse saco de dormir, você recupera uma quantidade adicional de pontos de vida, dependendo do valor do item.",
  },
  {
    id: "vitae-curandeiro", palavra: "vitae", nome: "Curandeiro",
    itens: "Capas e Armaduras", tipos: ["armadura", "capa"],
    ativacao: "Ação Livre", consumivel: false, corrupcao: "", pagina: 206,
    variantes: [
      {"rotulo": "1 Ponto de Vida", "preco": 1000, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Vida", "preco": 21000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Vida", "preco": 600000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando usar magias que curam pontos de vida e estiver usando um item com essa propriedade, as magias irão curar pontos de vida adicionais, dependendo do preço do item.",
  },
  {
    id: "vitae-cura", palavra: "vitae", nome: "Cura",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 206,
    variantes: [
      {"rotulo": "1 Ponto de Vida", "preco": 50, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Vida", "preco": 100, "nivel": 1, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Vida", "preco": 200, "nivel": 1, "grau": 3, "valor": 3},
    ],
    texto: "Quando você usa um item com essa propriedade, você recupera uma quantidade de pontos de vida, dependendo do preço do item.",
  },
  {
    id: "vitae-essencia", palavra: "vitae", nome: "Essência",
    itens: "Totens, Cajados e Símbolos Sagrados", tipos: ["simbolo", "cajado", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 206,
    variantes: [
      {"rotulo": "+1 em Conjuração", "preco": 3500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "+2 em Conjuração", "preco": 120000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "+3 em Conjuração", "preco": 2000000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Quando conjura uma magia composta pela palavra arcana vitae usando esse item como foco, você recebe um bônus para a rolagem de conjuração, dependendo do valor do item.",
  },
  {
    id: "vitae-forca-de-espirito", palavra: "vitae", nome: "Força de Espírito",
    itens: "Armaduras", tipos: ["armadura"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 207,
    variantes: [
      {"preco": 400000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você sofrer dano o suficiente para ficar inconsciente e estiver usando essa armadura, você ainda permanece consciente até o fim da cena ou até morrer, podendo fazer ações normalmente.",
  },
  {
    id: "vitae-regeneracao", palavra: "vitae", nome: "Regeneração",
    itens: "Anéis", tipos: ["anel"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 207,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Quando você perder metade ou mais dos pontos de vida e estiver usando esse anel, você ganha regeneração até o fim da cena.",
  },
  {
    id: "vitae-restauracao", palavra: "vitae", nome: "Restauração",
    itens: "Poções", tipos: ["pocao"],
    ativacao: "Ação Rápida", consumivel: true, corrupcao: "", pagina: 207,
    variantes: [
      {"preco": 200, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você usa um item com essa propriedade, você cancela automaticamente uma condição mental ou física que o estiver afetando.",
  },
  {
    id: "vitae-vivido", palavra: "vitae", nome: "Vívido",
    itens: "Cajados, Totens e Varinhas", tipos: ["cajado", "varinha", "totem"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 207,
    variantes: [
      {"preco": 1000, "nivel": 1, "grau": 1},
    ],
    texto: "Quando você conjurar uma magia usando esse foco, aliados que possam vê-lo, recuperam 1 ponto de vida.",
  },
  {
    id: "vitae-vitalidade", palavra: "vitae", nome: "Vitalidade",
    itens: "Colares, Amuletos ou Periáptos", tipos: ["amuleto", "colar", "periapto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 207,
    variantes: [
      {"rotulo": "1 Ponto de Vida", "preco": 2500, "nivel": 1, "grau": 1, "valor": 1},
      {"rotulo": "2 Pontos de Vida", "preco": 60000, "nivel": 2, "grau": 2, "valor": 2},
      {"rotulo": "3 Pontos de Vida", "preco": 1500000, "nivel": 3, "grau": 3, "valor": 3},
    ],
    texto: "Enquanto você estiver usando um item com essa propriedade, você possui pontos de vida adicionais, dependendo do preço do item.",
  },
  {
    id: "vitae-vigor", palavra: "vitae", nome: "Vigor",
    itens: "Amuletos", tipos: ["amuleto"],
    ativacao: "Constante", consumivel: false, corrupcao: "", pagina: 207,
    variantes: [
      {"preco": 2000000, "nivel": 3, "grau": 1},
    ],
    texto: "Enquanto você estiver usando esse amuleto, você recebe 1D no seu atributo de Vigor.",
  },
];
