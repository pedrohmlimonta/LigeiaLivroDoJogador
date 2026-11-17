/**
 * LIGEIA — ANIMAÇÕES AUTOMÁTICAS DAS MAGIAS (Livro do Jogador)
 * ===========================================================================
 * Escolhe, para cada ação de uma magia, uma animação do Automated Animations
 * (efeitos do JB2A) que combine com o que a ação faz — o elemento do dano, a
 * forma (projétil, toque, área, emanação, em você) e o que ela causa (cura,
 * proteção, condição) — e, para cada condição que ela aplica, um visual que
 * fica no token enquanto a condição durar.
 *
 * ONDE FICA: exatamente onde o sistema guarda uma animação PUXADA do item —
 *   ação ............ action.aaConfig (+ aaName, aaEnabled)
 *   efeito aplicado . appliesEffects[].fxAaConfig (+ fxAaName, fxAaPersist)
 * Por isso ela aparece na ficha do item como qualquer animação puxada: ●/○
 * desliga, ✕ remove e o "🎞️ limpar animações" do cabeçalho tira todas.
 *
 * O item NÃO recebe flags.autoanimations, de propósito: o sistema toca a
 * animação do item como reserva quando a ação não tem a sua, e ela voltaria
 * a aparecer depois que você removesse a da ação.
 *
 * Cada animação automática leva metaData.origem = este módulo. É assim que a
 * Criação de Magias sabe que pode trocá-la ao montar uma magia nova; uma
 * animação que você puxou ou configurou à mão nunca é substituída.
 *
 * As chaves seguem a base de dados do Automated Animations
 * ("seção.tipo.animação.variante.cor"). Em cada lista vale a primeira que
 * existir no JB2A instalado; a última de cada lista existe tanto no JB2A
 * gratuito quanto no Patreon (os testes conferem contra o catálogo em
 * scripts/aa-chaves.json).
 *
 * Este arquivo não usa nada do Foundry: o gerador do compêndio (Node) usa as
 * mesmas regras para animar as magias do livro.
 */

export const MODULE_ID = "ligeia-livro-do-jogador";
/** Versão do formato de animação do Automated Animations (v8). */
export const AA_SCHEMA_VERSION = 5;

/* ------------------------------------------------------------------ */
/*  Elementos: animação por forma de entrega                           */
/*   projetil  ação à distância que causa dano                         */
/*   toque     no alvo (toque, ou à distância sem dano)                 */
/*   area      em cada criatura atingida pela área                     */
/*   aura      no conjurador (emanação)                                */
/*   continuo  no token enquanto durar o dano contínuo                 */
/* ------------------------------------------------------------------ */
export const ELEMENTOS = {
  fogo: {
    nome: "Fogo", continuoNome: "Chamas",
    projetil: ["range.spell.firebolt.01.orange", "range.spell.scorchingray.01.orange"],
    toque: ["static.fire.eruption.01.orange", "static.generic.impact.01.orange"],
    area: ["static.spell.fireball.explode.orange", "static.generic.explosion.01.orange"],
    aura: ["static.fire.groundcrack.01.orange", "static.generic.explosion.01.orange"],
    continuo: ["static.shieldfx.fire.01.orange"],
  },
  frio: {
    nome: "Frio", continuoNome: "Gelo",
    projetil: ["range.spell.rayoffrost.01.blue", "range.generic.iceshard.01.blue"],
    toque: ["static.impact.frost.01.white", "static.ice.snowflake.01.whiteblue"],
    area: ["static.impact.frost.01.blue", "static.spell.fireball.explode.blue", "static.ice.icespikes.01.white"],
    aura: ["static.spell.sleetstorm.01.blue", "static.ice.snowflake.01.whiteblue"],
    continuo: ["static.conditions.snowflakes.02.blue"],
  },
  raio: {
    nome: "Raio", continuoNome: "Eletricidade",
    projetil: ["range.spell.chainlightning.primary.blue", "range.spell.witchbolt.01.blue"],
    toque: ["static.lightning.staticelectricity.01.blue"],
    area: ["static.spell.calllightning.01.blue", "static.lightning.ball.01.blue"],
    aura: ["static.lightning.ball.01.blue"],
    continuo: ["static.lightning.staticelectricity.02.blue"],
  },
  acido: {
    nome: "Ácido", continuoNome: "Corrosão",
    projetil: ["range.spell.firebolt.01.green", "range.spell.eldritchblast.01.lightgreen", "range.spell.disintegrate.01.green"],
    toque: ["static.liquid.splash.01.green", "static.generic.impact.01.green", "static.energy.strands.01.green"],
    area: ["static.liquid.splash.01.green", "static.spell.fireball.explode.darkgreen", "static.energy.strands.01.green"],
    aura: ["static.liquid.splash.01.brightgreen", "static.energy.strands.01.green"],
    continuo: ["static.conditions.drop.02.green", "static.energy.strands.02.green"],
  },
  veneno: {
    nome: "Veneno", continuoNome: "Veneno",
    projetil: ["range.generic.poison.01.greenyellow", "range.spell.firebolt.01.palegreen", "range.spell.disintegrate.01.green"],
    toque: ["static.impact.poison.01.green", "static.conditions.poison.03.darkgreen"],
    area: ["static.spell.fogcloud.02.green", "static.impact.poison.01.green", "static.conditions.poison.03.darkgreen"],
    aura: ["static.spell.fogcloud.02.green", "static.conditions.poison.03.darkgreen"],
    continuo: ["static.conditions.poison.02.darkgreen"],
  },
  energia: {
    nome: "Energia", continuoNome: "Energia",
    projetil: ["range.spell.eldritchblast.01.purple", "range.spell.magicmissile.01.purple"],
    toque: ["static.generic.impact.01.blue"],
    area: ["static.generic.explosion.01.blue"],
    aura: ["static.generic.outpulse.01.whiteblue"],
    continuo: ["static.energy.sparkles.01.blue"],
  },
  necrotico: {
    nome: "Necrótico", continuoNome: "Necrose",
    projetil: ["range.spell.eldritchblast.01.darkgreen", "range.spell.firebolt.01.darkgreen", "range.spell.disintegrate.01.green"],
    toque: ["static.spell.sneakattack.01.darkgreen"],
    area: ["static.spell.tollthedead.complete.green"],
    aura: ["static.spell.armsofhadar.01.darkgreen", "static.spell.armsofhadar.01.darkpurple"],
    continuo: ["static.conditions.skull.02.darkgreen", "static.conditions.skull.02.purple"],
  },
  radiante: {
    nome: "Radiante", continuoNome: "Luz radiante",
    projetil: ["range.spell.guidingbolt.01.yellow", "range.spell.guidingbolt.01.yellowblue"],
    toque: ["static.spell.divinesmite.target.yellowblue"],
    area: ["static.spell.sacredflame.target.yellow"],
    aura: ["static.spell.spiritguardians.01.yellowblue", "static.spell.divinesmite.source.yellowblue"],
    continuo: ["static.conditions.light.pulse.yellow", "static.conditions.light.pulse.blue"],
  },
  sonico: {
    nome: "Sônico", continuoNome: "Ressonância",
    projetil: ["static.spell.shatter.01.blue"],
    toque: ["static.spell.shatter.01.blue"],
    area: ["static.spell.thunderwave.mid.blue"],
    aura: ["static.spell.thunderwave.center.blue"],
    continuo: ["static.music.notes.01.blue"],
  },
  psiquico: {
    nome: "Psíquico", continuoNome: "Tormento",
    projetil: ["range.spell.eldritchblast.01.pink", "range.generic.energystrand.01.purple"],
    toque: ["static.generic.impact.01.pink", "static.conditions.horror.01.purple"],
    area: ["static.spell.shatter.01.purple", "static.conditions.horror.01.purple"],
    aura: ["static.generic.outpulse.01.purplepink", "static.conditions.horror.01.purple"],
    continuo: ["static.conditions.horror.02.purple"],
  },
  concussao: {
    nome: "Concussão", continuoNome: "Sangramento",
    projetil: ["range.spell.eldritchblast.01.lightblue", "range.generic.energybeam.01.blue"],
    toque: ["static.generic.impact.01.yellow"],
    area: ["static.spell.shatter.01.blue"],
    aura: ["static.generic.outpulse.01.whiteblue"],
    continuo: ["static.conditions.drop.02.red"],
  },
  corte: {
    nome: "Corte", continuoNome: "Sangramento",
    projetil: ["range.weapon.dagger.01.white"],
    toque: ["static.creature.claw.01.red"],
    area: ["static.spell.cloudofdaggers.01.blue"],
    aura: ["static.spell.cloudofdaggers.01.blue"],
    continuo: ["static.conditions.drop.02.red"],
  },
  perfuracao: {
    nome: "Perfuração", continuoNome: "Sangramento",
    projetil: ["range.weapon.arrow.physical.blue", "range.weapon.dagger.01.white"],
    toque: ["static.creature.bite.01.red"],
    area: ["static.spell.cloudofdaggers.01.blue"],
    aura: ["static.spell.cloudofdaggers.01.blue"],
    continuo: ["static.conditions.drop.02.red"],
  },
};

/** Palavras cujo efeito é, antes de tudo, um elemento. */
export const PALAVRA_ELEMENTO = {
  acida: "acido", energio: "energia", fulgur: "raio", glacios: "frio",
  ignis: "fogo", menso: "concussao", mortis: "necrotico", noxia: "veneno",
  sankta: "radiante", sonigu: "sonico", traumato: "psiquico",
};

/* ------------------------------------------------------------------ */
/*  Temas das palavras: para o que não é (só) dano                     */
/*   alvo   no alvo (toque ou à distância)                             */
/*   area   em cada criatura atingida                                  */
/*   aura   no conjurador (emanação)                                   */
/*   emSi   no conjurador                                              */
/*   projetil  quando a ação da palavra causa dano à distância         */
/*   natural   tipos de dano "da própria palavra": nelas o tema         */
/*             descreve melhor a magia do que o elemento               */
/* ------------------------------------------------------------------ */
export const TEMAS = {
  augurado: {
    nome: "Adivinhação",
    alvo: ["static.magicsign.divination.02.blue"],
    aura: ["static.spell.detectmagic.01.blue"],
  },
  carmo: {
    nome: "Encantamento",
    alvo: ["static.magicsign.enchantment.02.pink"],
    aura: ["static.generic.outpulse.01.purplepink", "static.magicsign.enchantment.02.pink"],
  },
  devena: {
    nome: "Natureza", natural: ["concussao"],
    alvo: ["static.spell.entangle.01.brown"],
    area: ["static.spell.entangle.01.green"],
    aura: ["static.plants.ring.complete.greenyellow"],
    emSi: ["static.plants.ring.complete.greenyellow"],
  },
  exitium: {
    nome: "Destruição", natural: ["energia"],
    projetil: ["range.spell.magicmissile.01.purple"],
    alvo: ["static.generic.explosion.01.orange"],
    area: ["static.generic.explosion.01.orange"],
    aura: ["static.generic.explosion.01.orange"],
  },
  forjuri: {
    nome: "Proteção",
    alvo: ["static.shieldspell.complete.01.blue"],
    aura: ["static.spell.antilifeshell.01.blue"],
  },
  iluzio: {
    nome: "Ilusão", natural: ["psiquico"],
    alvo: ["static.magicsign.illusion.02.purple"],
  },
  inanis: {
    nome: "Anulação", natural: ["energia"],
    alvo: ["static.magicsign.abjuration.02.blue"],
    aura: ["static.spell.antilifeshell.01.blue"],
  },
  kreo: {
    nome: "Criação",
    alvo: ["static.magicsign.conjuration.02.yellow"],
  },
  krucigon: {
    nome: "Travessia",
    alvo: ["static.spell.mistystep.01.blue"],
  },
  lumo: {
    nome: "Luz",
    alvo: ["static.spell.moonbeam.complete.rainbow", "static.fire.fireworks.01.orangeyellow"],
    aura: ["static.generic.outpulse.01.yellowwhite", "static.generic.outpulse.01.whiteblue"],
    emSi: ["static.conditions.light.pulse.yellow", "static.conditions.light.pulse.blue"],
  },
  majesto: {
    nome: "Grandeza",
    alvo: ["static.magicsign.transmutation.02.yellow"],
  },
  menso: {
    nome: "Cinese",
    alvo: ["static.generic.whirl.loop.purple", "static.generic.whirl.loop.blue"],
  },
  pluribus: {
    nome: "Multiplicação",
    alvo: ["static.magicsign.conjuration.02.yellow"],
  },
  saeculorum: {
    nome: "Tempo",
    alvo: ["static.generic.vortex.loop.blue"],
  },
  sangon: {
    nome: "Transmutação",
    alvo: ["static.magicsign.transmutation.02.yellow"],
  },
  sorcdiron: {
    nome: "Aprimoramento",
    alvo: ["static.energy.shimmer.01.blue"],
  },
  tenebrae: {
    nome: "Trevas",
    alvo: ["static.spell.darkness.01.black"],
  },
  vitae: {
    nome: "Vida",
    alvo: ["static.spell.curewounds.01.blue"],
  },
};

/** Quando nem o elemento nem a palavra dizem nada. */
export const GENERICO = {
  nome: "Magia",
  projetil: ["range.spell.magicmissile.01.purple"],
  alvo: ["static.energy.shimmer.01.blue"],
  area: ["static.generic.explosion.01.blue"],
  aura: ["static.generic.outpulse.01.whiteblue"],
};

/** Benefícios: o que a ação dá a quem recebe. */
export const BENEFICIOS = {
  cura: { nome: "Cura", chaves: ["static.spell.curewounds.01.blue", "static.spell.generichealing.01.green"] },
  sobrevida: { nome: "Sobrevida", chaves: ["static.marker.bubble.01.blue"] },
  pm: { nome: "Pontos de Magia", chaves: ["static.energy.sparkles.01.blue"] },
  protecao: { nome: "Proteção", chaves: ["static.shieldspell.complete.01.blue"] },
  bencao: { nome: "Bênção", chaves: ["static.spell.bless.intro.yellow"] },
  dado: { nome: "Aprimoramento", chaves: ["static.energy.shimmer.01.blue"] },
  energia: { nome: "Energia", chaves: ["static.energy.sparkles.01.blue"] },
  tamanho: { nome: "Tamanho", chaves: ["static.magicsign.transmutation.02.yellow"] },
  regeneracao: { nome: "Regeneração", chaves: ["static.particles.inwardstars.01.greenyellow"] },
  restauracao: { nome: "Restauração", chaves: ["static.spell.generichealing.01.yellow"] },
};

/** Condições com visual enquanto durarem (no token de quem as sofre). */
export const CONDICOES = {
  abalado: { nome: "Medo", chaves: ["static.conditions.fear.01.darkpurple"] },
  agarrado: { nome: "Agarrado", chaves: ["static.chains.standard.loop.red"] },
  atordoado: { nome: "Atordoado", chaves: ["static.conditions.stun.02.purple"] },
  cego: { nome: "Cegueira", chaves: ["static.generic.smoke.01.grey"] },
  dominado: { nome: "Dominado", chaves: ["static.conditions.heart.01.pink"] },
  enfeiticado: { nome: "Enfeitiçado", chaves: ["static.conditions.heart.02.pink"] },
  enfraquecido: { nome: "Enfraquecido", chaves: ["static.conditions.skull.02.purple"] },
  imobilizado: { nome: "Imobilizado", chaves: ["static.chains.standard.loop.red"] },
  inconsciente: { nome: "Inconsciente", chaves: ["static.spell.sleep.symbol.pink"] },
  indefeso: { nome: "Indefeso", chaves: ["static.conditions.crackedshield.02.purple"] },
  lento: { nome: "Lento", chaves: ["static.conditions.snowflakes.02.blue"] },
  paralisado: { nome: "Paralisado", chaves: ["static.chains.standard.loop.red"] },
  pasmo: { nome: "Pasmo", chaves: ["static.conditions.dizzystars.01.blueorange"] },
  telecinese: { nome: "Telecinese", chaves: ["static.marker.energystrand.02.purpleblue"] },
};
/** Dano contínuo sem tipo conhecido. */
const CONTINUO_GENERICO = { nome: "Dano contínuo", chaves: ["static.conditions.drop.02.red"] };
/** Visual da teleportação (no ponto de partida). */
const TELEPORTE = { nome: "Teleporte", chaves: ["static.spell.mistystep.01.blue"] };

/** Condições que contam como ataque (a animação vai só em quem é atingido). */
const NEGATIVAS = new Set([...Object.keys(CONDICOES), "caido", "exausto", "surdo", "surpreso", "dano_continuo"]);

/** Ajustes por magia do livro, quando a regra geral não é a melhor. */
const POR_MAGIA = {
  // Chama Sagrada: a chama desce sobre o alvo (não é um projétil).
  "chama sagrada": { radiante: { distancia: ["static.spell.sacredflame.target.yellow"] } },
};

/**
 * Chaves das tabelas acima que existem no JB2A gratuito E no Patreon — as
 * únicas usadas no compêndio, e o plano B quando a base do Automated
 * Animations não pode ser consultada. Conferido pelos testes contra
 * scripts/aa-chaves.json (catálogo do Automated Animations v8).
 */
export const SEGURAS = new Set([
  "range.generic.energybeam.01.blue", "range.generic.energystrand.01.purple",
  "range.generic.iceshard.01.blue", "range.spell.chainlightning.primary.blue",
  "range.spell.disintegrate.01.green", "range.spell.eldritchblast.01.purple",
  "range.spell.firebolt.01.orange", "range.spell.guidingbolt.01.yellowblue",
  "range.spell.magicmissile.01.purple", "range.spell.rayoffrost.01.blue",
  "range.spell.scorchingray.01.orange", "range.spell.witchbolt.01.blue",
  "range.weapon.arrow.physical.blue", "range.weapon.dagger.01.white",
  "static.chains.standard.loop.red", "static.conditions.crackedshield.02.purple",
  "static.conditions.dizzystars.01.blueorange", "static.conditions.drop.02.red",
  "static.conditions.fear.01.darkpurple", "static.conditions.heart.01.pink",
  "static.conditions.heart.02.pink", "static.conditions.horror.01.purple",
  "static.conditions.horror.02.purple", "static.conditions.light.pulse.blue",
  "static.conditions.poison.02.darkgreen", "static.conditions.poison.03.darkgreen",
  "static.conditions.skull.02.purple", "static.conditions.snowflakes.02.blue",
  "static.conditions.stun.02.purple", "static.creature.bite.01.red",
  "static.creature.claw.01.red", "static.energy.shimmer.01.blue",
  "static.energy.sparkles.01.blue", "static.energy.strands.01.green",
  "static.energy.strands.02.green", "static.fire.eruption.01.orange",
  "static.fire.fireworks.01.orangeyellow", "static.fire.groundcrack.01.orange",
  "static.generic.explosion.01.blue", "static.generic.explosion.01.orange",
  "static.generic.impact.01.blue", "static.generic.impact.01.orange",
  "static.generic.impact.01.yellow", "static.generic.outpulse.01.whiteblue",
  "static.generic.smoke.01.grey", "static.generic.vortex.loop.blue",
  "static.generic.whirl.loop.blue", "static.ice.icespikes.01.white",
  "static.ice.snowflake.01.whiteblue", "static.lightning.ball.01.blue",
  "static.lightning.staticelectricity.01.blue", "static.lightning.staticelectricity.02.blue",
  "static.magicsign.abjuration.02.blue", "static.magicsign.conjuration.02.yellow",
  "static.magicsign.divination.02.blue", "static.magicsign.enchantment.02.pink",
  "static.magicsign.illusion.02.purple", "static.magicsign.transmutation.02.yellow",
  "static.marker.bubble.01.blue", "static.marker.energystrand.02.purpleblue",
  "static.music.notes.01.blue", "static.particles.inwardstars.01.greenyellow",
  "static.plants.ring.complete.greenyellow", "static.shieldfx.fire.01.orange",
  "static.shieldspell.complete.01.blue", "static.spell.antilifeshell.01.blue",
  "static.spell.armsofhadar.01.darkpurple", "static.spell.bless.intro.yellow",
  "static.spell.calllightning.01.blue", "static.spell.cloudofdaggers.01.blue",
  "static.spell.curewounds.01.blue", "static.spell.darkness.01.black",
  "static.spell.detectmagic.01.blue", "static.spell.divinesmite.source.yellowblue",
  "static.spell.divinesmite.target.yellowblue", "static.spell.entangle.01.brown",
  "static.spell.entangle.01.green", "static.spell.fireball.explode.orange",
  "static.spell.generichealing.01.green", "static.spell.generichealing.01.yellow",
  "static.spell.mistystep.01.blue", "static.spell.sacredflame.target.yellow",
  "static.spell.shatter.01.blue", "static.spell.sleep.symbol.pink",
  "static.spell.sleetstorm.01.blue", "static.spell.sneakattack.01.darkgreen",
  "static.spell.spiritguardians.01.yellowblue", "static.spell.thunderwave.center.blue",
  "static.spell.thunderwave.mid.blue", "static.spell.tollthedead.complete.green",
]);

/* ------------------------------------------------------------------ */
/*  Disponibilidade das chaves                                         */
/* ------------------------------------------------------------------ */

/** A chave existe no JB2A gratuito e no Patreon? */
export function chaveSegura(chave) {
  return SEGURAS.has(chave);
}

/**
 * Verificador que consulta a base do Sequencer (onde o Automated Animations
 * registra o JB2A instalado). Sem a base — módulos desligados, ou fora do
 * Foundry — usa a lista de chaves seguras.
 * @returns {(chave: string) => boolean}
 */
export function criarVerificador() {
  const db = globalThis.Sequencer?.Database;
  let base = null; // null = ainda não sei; false = sem base do AA
  const cache = new Map();
  const consulta = (caminho) => {
    const r = db.getEntry(caminho, { softFail: true });
    if (Array.isArray(r)) {
      return r.some((e) => {
        const p = e?.dbPath;
        return !p || p === caminho || String(p).startsWith(`${caminho}.`);
      });
    }
    return !!r;
  };
  return (chave) => {
    if (cache.has(chave)) return cache.get(chave);
    let ok;
    try {
      if (base === null) base = !!db?.getEntry && consulta("autoanimations.static.generic");
      ok = base ? consulta(`autoanimations.${chave}`) : chaveSegura(chave);
    } catch (e) {
      ok = chaveSegura(chave);
    }
    cache.set(chave, ok);
    return ok;
  };
}

/** A animação foi posta por este módulo (e pode ser trocada)? */
export function animacaoAutomatica(cfg) {
  return !!(cfg && typeof cfg === "object" && cfg.metaData?.origem === MODULE_ID);
}

const temConfig = (c) => !!(c && typeof c === "object" && Object.keys(c).length > 0);

/* ------------------------------------------------------------------ */
/*  Montagem da configuração do Automated Animations                   */
/* ------------------------------------------------------------------ */

const SOM = () => ({ enable: false, file: "", delay: 0, startTime: 0, volume: 0.75, repeat: 1, repeatDelay: 250 });

function opcoesComuns() {
  return {
    contrast: 0, hue: 0, saturate: 0, tint: false, tintColor: "#FFFFFF",
    delay: 0, elevation: 1000, isWait: false, opacity: 1, playbackRate: 1,
    repeat: 1, repeatDelay: 1, zIndex: 1,
  };
}

function opcoesNoToken({ playOn, size, persistent }) {
  return {
    ...opcoesComuns(),
    addTokenWidth: false, anchor: "0.5", delay: 1, fadeIn: 250, fadeOut: 500,
    isMasked: false, isRadius: false, persistent: !!persistent, playOn,
    size, unbindAlpha: false, unbindVisibility: false,
  };
}

function opcoesProjetil() {
  return {
    ...opcoesComuns(),
    animationSource: false, isReturning: false, onlyX: false, randomOffset: false, reverse: false,
  };
}

/** Identificador estável (16 caracteres) a partir de um texto. */
function idDe(texto) {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < texto.length; i++) {
    const c = texto.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
  }
  let out = "";
  for (let i = 0; i < 16; i++) {
    const h = i % 2 ? h2 : h1;
    out += abc[(h >>> ((i * 5) % 27)) % abc.length];
    if (i % 2) h2 = Math.imul(h2 ^ i, 2654435761) >>> 0; else h1 = Math.imul(h1 ^ i, 1597334677) >>> 0;
  }
  return out;
}

/**
 * Uma entrada do Automated Animations ("menu" ontoken ou range), no mesmo
 * formato que o menu dele grava num item (versão 5).
 */
export function entradaAA({ chave, playOn = "default", size = 1, persistent = false, label = "", nome = "", semente = "" }) {
  const [dbSection, menuType, animation, variant, color] = chave.split(".");
  const menu = dbSection === "range" ? "range" : "ontoken";
  return {
    id: idDe(`${semente}|${chave}`),
    label,
    menu,
    macro: { enable: false, name: "", args: "", playWhen: "0" },
    soundOnly: { sound: SOM() },
    metaData: { origem: MODULE_ID, automatica: true, chave, nome },
    isEnabled: true,
    isCustomized: true,
    fromAmmo: false,
    version: AA_SCHEMA_VERSION,
    primary: {
      video: { dbSection, menuType, animation, variant, color, enableCustom: false, customPath: "" },
      sound: SOM(),
      options: menu === "range" ? opcoesProjetil() : opcoesNoToken({ playOn, size, persistent }),
    },
    source: { enable: false },
    secondary: { enable: false },
    target: { enable: false },
  };
}

/* ------------------------------------------------------------------ */
/*  Leitura de uma ação                                                */
/* ------------------------------------------------------------------ */

const semAcento = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const preenchido = (v) => String(v ?? "").trim() !== "";
const naoZero = (v) => preenchido(v) && String(v).trim() !== "0";
const negativo = (v) => /^\s*-/.test(String(v ?? ""));

/** Forma de entrega da ação. */
function formaDe(a) {
  if (a.movement?.enabled && a.movement.kind === "teleport") return "teleporte";
  const tm = a.targetMode || "target";
  if (tm === "self" || tm === "none") return "emSi";
  if (tm === "aura") return "aura";
  if (tm === "area" || tm === "cone") return "area";
  if (tm === "line" || tm === "lineCustom") return "linha";
  return a.isMelee ? "toque" : "distancia";
}

function causaDano(a) {
  if (a.damageResource !== "mp" && (naoZero(a.damage) || a.scalingDamage)) return true;
  return (a.extraDamage ?? []).some((x) => x?.resource !== "mp" && naoZero(x?.formula));
}

function drenaPM(a) {
  if (a.damageResource === "mp" && naoZero(a.damage)) return true;
  return (a.extraDamage ?? []).some((x) => x?.resource === "mp" && naoZero(x?.formula));
}

function temTick(a) {
  return (a.appliesEffects ?? []).some((e) => naoZero(e?.tickAmount));
}

/** Elemento do dano da ação (direto, extra ou contínuo). */
function elementoDe(a) {
  if (ELEMENTOS[a.damageType] && preenchido(a.damage)) return a.damageType;
  for (const x of a.extraDamage ?? []) if (ELEMENTOS[x?.type] && naoZero(x.formula)) return x.type;
  for (const e of a.appliesEffects ?? []) if (ELEMENTOS[e?.tickType] && naoZero(e.tickAmount)) return e.tickType;
  return null;
}

function efeitoNegativo(e) {
  if (!e) return false;
  if (e.fxType === "condition") return NEGATIVAS.has(e.fxTarget);
  if (e.fxType === "vuln") return true;
  // Mudar de tamanho (Diminuir) não é ataque: é o que a magia faz.
  if (e.fxType === "size") return false;
  return negativo(e.fxValue) || naoZero(e.tickAmount);
}

/** Que benefício um efeito aplicado dá. */
function beneficioDoEfeito(e) {
  switch (e.fxType) {
    case "rd": return "protecao";
    case "dice": return "dado";
    case "stat": return "energia";
    case "size": return "tamanho";
    case "restore": return "restauracao";
    case "bonus":
      if (naoZero(e.tickHealAmount)) return "regeneracao";
      if (e.fxEnchant) return "energia";
      if (["bloqueio", "esquiva"].includes(e.fxTarget)) return "protecao";
      if (["conjuracao", "iniciativa", "deslocamento"].includes(e.fxTarget)) return "energia";
      return "bencao";
    default: return "bencao";
  }
}

/**
 * O que a ação é: teleporte, benefício (cura, proteção...) ou ataque/efeito.
 * @returns {{tipo: "teleporte"|"beneficio"|"ofensiva"|"neutra", beneficio?: string}}
 */
function naturezaDe(a, forma) {
  if (forma === "teleporte") return { tipo: "teleporte" };
  if (causaDano(a) || drenaPM(a)) return { tipo: "ofensiva" };
  if (preenchido(a.heal)) {
    const r = a.healResource;
    return { tipo: "beneficio", beneficio: r === "hpTemp" ? "sobrevida" : r === "mp" ? "pm" : "cura" };
  }
  const aps = a.appliesEffects ?? [];
  if (aps.some(efeitoNegativo)) return { tipo: "ofensiva" };
  const bom = aps.find((e) => e && e.fxType !== "condition");
  if (bom) return { tipo: "beneficio", beneficio: beneficioDoEfeito(bom) };
  if (a.canRoll && !a.vsDifficulty && forma !== "emSi") return { tipo: "ofensiva" };
  return { tipo: "neutra" };
}

/** Lista do tema da palavra para a forma. */
function deTema(T, forma, dano) {
  switch (forma) {
    case "distancia": return (dano && T.projetil) || T.alvo;
    case "toque": return T.alvo;
    case "area": case "linha": return T.area || T.alvo;
    case "aura": return T.aura || T.emSi || T.alvo;
    default: return T.emSi || T.alvo;
  }
}

/** Lista do elemento para a forma. */
function deElemento(E, forma, dano) {
  switch (forma) {
    case "distancia": return dano ? E.projetil : E.toque;
    case "linha": return dano ? E.projetil : E.area;
    case "area": return E.area;
    case "aura": return E.aura;
    default: return E.toque;
  }
}

/**
 * A animação de UMA ação.
 * @returns {{lista: string[], nome: string, playOn: string, size: number} | null}
 */
export function visualDaAcao(a, { palavra = "", base = "" } = {}) {
  const forma = formaDe(a);
  const nat = naturezaDe(a, forma);
  const noConjurador = forma === "emSi" || forma === "aura" || forma === "teleporte";
  const size = forma === "aura" ? 2.5 : (forma === "area" || forma === "linha") ? 1.25 : 1;

  if (nat.tipo === "teleporte") {
    return { lista: TELEPORTE.chaves, nome: TELEPORTE.nome, playOn: "source", size: 1 };
  }
  if (nat.tipo === "beneficio") {
    const B = BENEFICIOS[nat.beneficio] ?? BENEFICIOS.bencao;
    return { lista: B.chaves, nome: B.nome, playOn: noConjurador ? "source" : "default", size };
  }

  // Ataque ou efeito: o elemento do dano, ou o tema da palavra.
  const dano = causaDano(a) || drenaPM(a);
  const tema = TEMAS[palavra];
  let elem = elementoDe(a);
  if (elem && tema?.natural?.includes(elem)) elem = null; // o tema descreve melhor
  if (!elem && !tema) elem = PALAVRA_ELEMENTO[palavra] ?? null;
  const playOn = noConjurador ? "source" : nat.tipo === "ofensiva" ? "target" : "default";

  // Sem dano (nem contínuo), a palavra diz mais que o tipo de um dano 0.
  if (tema && (!elem || (!dano && !temTick(a)))) {
    return { lista: deTema(tema, forma, dano), nome: tema.nome, playOn, size };
  }
  if (elem) {
    const ajuste = POR_MAGIA[semAcento(base)]?.[elem]?.[forma];
    return { lista: ajuste ?? deElemento(ELEMENTOS[elem], forma, dano), nome: ELEMENTOS[elem].nome, playOn, size };
  }
  return { lista: deTema(GENERICO, forma, dano), nome: GENERICO.nome, playOn, size };
}

/** O visual de um efeito aplicado enquanto ele durar (só condições). */
export function visualDoEfeito(e) {
  if (!e || e.fxType !== "condition" || e.fxEnchant) return null;
  if (e.fxTarget === "dano_continuo") {
    const E = ELEMENTOS[e.tickType];
    return E ? { lista: E.continuo, nome: E.continuoNome } : { lista: CONTINUO_GENERICO.chaves, nome: CONTINUO_GENERICO.nome };
  }
  const C = CONDICOES[e.fxTarget];
  return C ? { lista: C.chaves, nome: C.nome } : null;
}

const escolher = (lista, existe) => (lista ?? []).find((k) => existe(k)) ?? null;

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Põe animações automáticas numa magia (dados do item, mutação in-place).
 * Ações e efeitos com animação que NÃO é deste módulo (puxada do item, ou
 * caminho digitado no "Avançado") ficam como estão.
 *
 * @param {object} data dados do item (toObject / JSON do compêndio)
 * @param {object} [opcoes]
 * @param {(chave:string)=>boolean} [opcoes.existe] a chave existe no JB2A instalado?
 * @returns {{acoes: number, efeitos: number}} quantas animações ficaram
 */
export function animarMagia(data, { existe = chaveSegura } = {}) {
  const sys = data?.system;
  const out = { acoes: 0, efeitos: 0 };
  if (!sys || !Array.isArray(sys.actions)) return out;
  const base = data.flags?.[MODULE_ID]?.receita?.base ?? data.name ?? "";
  sys.actions.forEach((a, i) => {
    if (!a || typeof a !== "object") return;
    const palavra = String(a._palavra || sys.wordId || "").toLowerCase();
    const livreAcao = !preenchido(a.animFile) && (!temConfig(a.aaConfig) || animacaoAutomatica(a.aaConfig));
    if (livreAcao) {
      const v = visualDaAcao(a, { palavra, base });
      const chave = v && escolher(v.lista, existe);
      if (chave) {
        a.aaConfig = entradaAA({ chave, playOn: v.playOn, size: v.size, label: data.name ?? "",
                                 nome: v.nome, semente: `${base}|${i}|${a.label ?? ""}` });
        a.aaName = `${data.name ?? "Magia"} (automática)`;
        a.aaEnabled = true;
        out.acoes++;
      } else if (animacaoAutomatica(a.aaConfig)) {
        a.aaConfig = null; a.aaName = "";
      }
    }
    (a.appliesEffects ?? []).forEach((e, j) => {
      if (!e || typeof e !== "object") return;
      if (preenchido(e.fxFile) || (temConfig(e.fxAaConfig) && !animacaoAutomatica(e.fxAaConfig))) return;
      const v = visualDoEfeito(e);
      const chave = v && escolher(v.lista, existe);
      if (chave) {
        e.fxAaConfig = entradaAA({ chave, playOn: "default", size: 1, persistent: true,
                                   label: data.name ?? "", nome: v.nome, semente: `${base}|${i}|${j}|${e.label ?? ""}` });
        e.fxAaName = `${v.nome} (automática)`;
        e.fxAaPersist = true;
        out.efeitos++;
      } else if (animacaoAutomatica(e.fxAaConfig)) {
        e.fxAaConfig = null; e.fxAaName = "";
      }
    });
  });
  return out;
}

/**
 * Tira as animações automáticas (deste módulo) de uma magia — mutação
 * in-place nos dados do item. As que você puxou ficam.
 * @returns {number} quantas foram removidas
 */
export function limparAnimacoesAutomaticas(data) {
  let n = 0;
  for (const a of data?.system?.actions ?? []) {
    if (animacaoAutomatica(a?.aaConfig)) { a.aaConfig = null; a.aaName = ""; n++; }
    for (const e of a?.appliesEffects ?? []) {
      if (animacaoAutomatica(e?.fxAaConfig)) { e.fxAaConfig = null; e.fxAaName = ""; n++; }
    }
  }
  return n;
}

/** Quantas animações automáticas (deste módulo) a magia tem. */
export function contarAnimacoesAutomaticas(data) {
  let n = 0;
  for (const a of data?.system?.actions ?? []) {
    if (animacaoAutomatica(a?.aaConfig)) n++;
    for (const e of a?.appliesEffects ?? []) if (animacaoAutomatica(e?.fxAaConfig)) n++;
  }
  return n;
}

/** Todas as chaves citadas nas tabelas (para os testes). */
export function chavesDasTabelas() {
  const listas = [];
  for (const E of Object.values(ELEMENTOS)) listas.push(E.projetil, E.toque, E.area, E.aura, E.continuo);
  for (const T of Object.values(TEMAS)) listas.push(T.projetil, T.alvo, T.area, T.aura, T.emSi);
  listas.push(GENERICO.projetil, GENERICO.alvo, GENERICO.area, GENERICO.aura);
  for (const B of Object.values(BENEFICIOS)) listas.push(B.chaves);
  for (const C of Object.values(CONDICOES)) listas.push(C.chaves);
  listas.push(CONTINUO_GENERICO.chaves, TELEPORTE.chaves);
  for (const porElem of Object.values(POR_MAGIA)) {
    for (const porForma of Object.values(porElem)) listas.push(...Object.values(porForma));
  }
  return listas.filter(Array.isArray);
}
