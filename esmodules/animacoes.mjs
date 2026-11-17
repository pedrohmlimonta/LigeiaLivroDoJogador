/**
 * LIGEIA — ANIMAÇÕES AUTOMÁTICAS (Livro do Jogador)
 * ===========================================================================
 * Escolhe, para cada ação de uma magia, arma, habilidade ou traço, uma
 * animação do Automated Animations (efeitos do JB2A) que combine com o que a
 * ação faz — o golpe da arma, o elemento do dano, a forma (projétil, toque,
 * área, emanação, em você) e o que ela causa (cura, proteção, condição) — e,
 * para cada condição que ela aplica, um visual que fica no token enquanto a
 * condição durar.
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
  "melee.creature.bite.01.red", "melee.creature.claw.01.red", "melee.generic.slashing.01.orange",
  "melee.weapon.club.01.white", "melee.weapon.dagger.01.white",
  "melee.weapon.flurryofblows.physical.blue", "melee.weapon.glaive.01.white",
  "melee.weapon.greataxe.01.white", "melee.weapon.greatclub.01.white",
  "melee.weapon.greatsword.01.white", "melee.weapon.halberd.01.white",
  "melee.weapon.hammer.01.white", "melee.weapon.handaxe.01.white", "melee.weapon.mace.01.white",
  "melee.weapon.mace.02.white", "melee.weapon.maul.01.white", "melee.weapon.rapier.01.white",
  "melee.weapon.scimitar.01.white", "melee.weapon.shortsword.01.white",
  "melee.weapon.spear.01.white", "melee.weapon.sword.01.white",
  "melee.weapon.unarmedstrike.physical.blue", "melee.weapon.warhammer.01.white",
  "range.generic.energybeam.01.blue", "range.generic.energystrand.01.purple",
  "range.generic.iceshard.01.blue", "range.spell.chainlightning.primary.blue",
  "range.spell.disintegrate.01.green", "range.spell.eldritchblast.01.purple",
  "range.spell.fireballbeam.01.orange", "range.spell.firebolt.01.orange",
  "range.spell.guidingbolt.01.yellowblue", "range.spell.magicmissile.01.purple",
  "range.spell.rayoffrost.01.blue", "range.spell.scorchingray.01.orange",
  "range.spell.witchbolt.01.blue", "range.weapon.arrow.physical.blue",
  "range.weapon.arrow.regular.regular", "range.weapon.bolt.physical.orange",
  "range.weapon.bullet.1.orange", "range.weapon.dagger.01.white",
  "static.chains.standard.loop.red", "static.conditions.crackedshield.02.purple",
  "static.conditions.dizzystars.01.blueorange", "static.conditions.drop.02.red",
  "static.conditions.fear.01.darkpurple", "static.conditions.heart.01.pink",
  "static.conditions.heart.02.pink", "static.conditions.horror.01.purple",
  "static.conditions.horror.02.purple", "static.conditions.light.pulse.blue",
  "static.conditions.poison.02.darkgreen", "static.conditions.poison.03.darkgreen",
  "static.conditions.skull.02.purple", "static.conditions.snowflakes.02.blue",
  "static.conditions.stun.02.purple", "static.creature.bite.01.red",
  "static.creature.claw.01.red", "static.energy.circle.complete.orange",
  "static.energy.shimmer.01.blue", "static.energy.sparkles.01.blue",
  "static.energy.strands.01.green", "static.energy.strands.02.green",
  "static.fire.eruption.01.orange", "static.fire.fireworks.01.orangeyellow",
  "static.fire.groundcrack.01.orange", "static.generic.explosion.01.blue",
  "static.generic.explosion.01.orange", "static.generic.impact.01.blue",
  "static.generic.impact.01.orange", "static.generic.impact.01.yellow",
  "static.generic.outpulse.01.whiteblue", "static.generic.outpulse.02.whiteblue",
  "static.generic.smoke.01.grey", "static.generic.smoke.02.grey", "static.generic.smoke.03.grey",
  "static.generic.ui.crackedshield.purple", "static.generic.ui.drop.red",
  "static.generic.ui.fear.darkpurple", "static.generic.ui.heart.pink",
  "static.generic.ui.poison.darkgreen", "static.generic.ui.skull.purple",
  "static.generic.ui.snowflake.blue", "static.generic.ui.stun.purple",
  "static.generic.vortex.loop.blue", "static.generic.whirl.loop.blue",
  "static.ice.icespikes.01.white", "static.ice.snowflake.01.whiteblue",
  "static.leaves.outburst.01.pink", "static.lightning.ball.01.blue",
  "static.lightning.staticelectricity.01.blue", "static.lightning.staticelectricity.02.blue",
  "static.liquid.splash.01.blue", "static.magicsign.abjuration.02.blue",
  "static.magicsign.conjuration.02.yellow", "static.magicsign.divination.02.blue",
  "static.magicsign.enchantment.02.pink", "static.magicsign.illusion.02.purple",
  "static.magicsign.transmutation.02.yellow", "static.marker.bubble.01.blue",
  "static.marker.circleofstars.01.blue", "static.marker.energystrand.02.purpleblue",
  "static.marker.music.01.greenorange", "static.marker.roundshield.complete.orange",
  "static.marker.smokering.loop.purpleblue", "static.music.notes.01.blue",
  "static.nature.feathers.outburst.textured", "static.particles.inwardstars.01.greenyellow",
  "static.plants.ring.complete.greenyellow", "static.shieldfx.earth.01.orange",
  "static.shieldfx.fire.01.orange", "static.shieldspell.complete.01.blue",
  "static.spell.antilifeshell.01.blue", "static.spell.armsofhadar.01.darkpurple",
  "static.spell.bardicinspiration.inspire.greenorange", "static.spell.bless.intro.yellow",
  "static.spell.calllightning.01.blue", "static.spell.cloudofdaggers.01.blue",
  "static.spell.curewounds.01.blue", "static.spell.darkness.01.black",
  "static.spell.detectmagic.01.blue", "static.spell.divinesmite.source.yellowblue",
  "static.spell.divinesmite.target.yellowblue", "static.spell.entangle.01.brown",
  "static.spell.entangle.01.green", "static.spell.fireball.explode.orange",
  "static.spell.generichealing.01.green", "static.spell.generichealing.01.yellow",
  "static.spell.generichealing.02.greenorange", "static.spell.huntersmark.eye.green",
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

function opcoesGolpe() {
  return { ...opcoesComuns(), size: 1 };
}

/**
 * Troca do golpe pelo projétil quando o alvo está longe (armas de arremesso).
 * Sem projétil, a troca fica desligada: o golpe vai até o alvo. Precisa ser
 * explícito — o padrão do Automated Animations ("on") procuraria um
 * arremesso que pode não existir no JB2A gratuito.
 */
function trocaPorDistancia(chave) {
  const [, menuType, animation, variant, color] = (chave || "range.weapon.arrow.regular.regular").split(".");
  return {
    video: { dbSection: "range", menuType, animation, variant, color, enableCustom: false, customPath: "" },
    sound: SOM(),
    options: { detect: "automatic", range: 2, isReturning: false, switchType: chave ? "custom" : "off" },
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
 * Uma entrada do Automated Animations ("menu" melee, range ou ontoken), no
 * mesmo formato que o menu dele grava num item (versão 5).
 * @param {string|null} [arremesso] projétil do golpe quando o alvo está longe
 */
export function entradaAA({ chave, playOn = "default", size = 1, persistent = false, label = "", nome = "",
                            semente = "", arremesso = null }) {
  const [dbSection, menuType, animation, variant, color] = chave.split(".");
  const menu = dbSection === "range" ? "range" : dbSection === "melee" ? "melee" : "ontoken";
  const opcoes = menu === "range" ? opcoesProjetil()
    : menu === "melee" ? opcoesGolpe()
    : opcoesNoToken({ playOn, size, persistent });
  const entrada = {
    id: idDe(`${semente}|${chave}`),
    label,
    menu,
    macro: { enable: false, name: "", args: "", playWhen: "0" },
    soundOnly: { sound: SOM() },
    metaData: { origem: MODULE_ID, automatica: true, chave, nome, ...(arremesso ? { arremesso } : {}) },
    isEnabled: true,
    isCustomized: true,
    fromAmmo: false,
    version: AA_SCHEMA_VERSION,
    primary: {
      video: { dbSection, menuType, animation, variant, color, enableCustom: false, customPath: "" },
      sound: SOM(),
      options: opcoes,
    },
    source: { enable: false },
    secondary: { enable: false },
    target: { enable: false },
  };
  if (menu === "melee") entrada.meleeSwitch = trocaPorDistancia(arremesso);
  return entrada;
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
/*  Equipamentos, habilidades e traços                                 */
/* ------------------------------------------------------------------ */

const FLECHA = ["range.weapon.arrow.physical.white", "range.weapon.arrow.regular.regular"];
const VIROTE = ["range.weapon.bolt.physical.white", "range.weapon.bolt.physical.orange"];
const SOCO = ["melee.weapon.unarmedstrike.physical.blue"];
const MARCIAL = ["melee.weapon.flurryofblows.physical.blue"];
const CAJADO = ["melee.weapon.quarterstaff.01.white", "melee.weapon.club.01.white"];
const LANCA = ["melee.weapon.spear.01.white"];
const LANCA_ARREMESSO = ["range.weapon.spear.01.white", "range.weapon.javelin.01.white"];

/**
 * Armas do livro, pelo nome do equipamento (sem acento):
 *   golpe      corpo a corpo (do atacante até o alvo)
 *   tiro       à distância (projétil)
 *   arremesso  projétil quando o alvo está longe — o Automated Animations
 *              troca o golpe por ele sozinho, pela distância
 *   marcial    golpe das ações de Artes Marciais (Soco, Chute)
 */
export const ARMAS = {
  "adaga": { golpe: ["melee.weapon.dagger.01.white"], arremesso: ["range.weapon.dagger.01.white"] },
  "alabarda": { golpe: ["melee.weapon.halberd.01.white"] },
  "arco curto": { tiro: FLECHA },
  "arco longo": { tiro: FLECHA },
  "ataque desarmado": { golpe: SOCO },
  "azagaia": { tiro: ["range.weapon.javelin.01.white", "range.weapon.arrow.regular.regular"] },
  "besta de mao": { tiro: VIROTE },
  "besta leve": { tiro: VIROTE },
  "besta pesada": { tiro: VIROTE },
  "bordao": { golpe: CAJADO },
  "cajado": { golpe: CAJADO },
  "cauda": { golpe: ["melee.weapon.greatclub.01.white"] },
  "chicote longo": { golpe: ["melee.generic.slashing.01.orange"] },
  "chute": { golpe: SOCO, marcial: MARCIAL },
  "cimitarra": { golpe: ["melee.weapon.scimitar.01.white"] },
  "clava": { golpe: ["melee.weapon.club.01.white"] },
  "clava grande": { golpe: ["melee.weapon.greatclub.01.white"] },
  "dardo": { tiro: ["range.weapon.dart.01.white", "range.weapon.dagger.01.white"] },
  "espada curta": { golpe: ["melee.weapon.shortsword.01.white"] },
  "espada grande": { golpe: ["melee.weapon.greatsword.01.white"] },
  "espada longa": { golpe: ["melee.weapon.sword.01.white"] },
  "florete": { golpe: ["melee.weapon.rapier.01.white"] },
  "foice curta": { golpe: ["melee.weapon.scimitar.01.white"] },
  "foice longa": { golpe: ["melee.weapon.glaive.01.white"] },
  "funda": { tiro: ["range.weapon.sling.01.white", "range.weapon.bullet.1.orange"] },
  "garras": { golpe: ["melee.creature.claw.01.red"] },
  "glaive": { golpe: ["melee.weapon.glaive.01.white"] },
  "lanca curta": { golpe: LANCA, arremesso: LANCA_ARREMESSO },
  "lanca longa": { golpe: LANCA },
  "maca": { golpe: ["melee.weapon.mace.01.white"] },
  "maca estrela": { golpe: ["melee.weapon.mace.02.white"] },
  "machado de batalha": { golpe: ["melee.weapon.greataxe.01.white"] },
  "machado de mao": { golpe: ["melee.weapon.handaxe.01.white"], arremesso: ["range.weapon.handaxe.01.white"] },
  "machado grande": { golpe: ["melee.weapon.greataxe.01.white"] },
  "malho": { golpe: ["melee.weapon.maul.01.white"] },
  "mangual": { golpe: ["melee.weapon.mace.01.white"] },
  "martelo de arremesso": { golpe: ["melee.weapon.hammer.01.white"], arremesso: ["range.weapon.hammer.01.white"] },
  "martelo de guerra": { golpe: ["melee.weapon.warhammer.01.white"] },
  "mordida": { golpe: ["melee.creature.bite.01.red"] },
  "picareta": { golpe: ["melee.weapon.warhammer.01.white"] },
  "pique": { golpe: LANCA },
  "presas": { golpe: ["melee.creature.bite.01.red"] },
  "soco": { golpe: SOCO, marcial: MARCIAL },
  "tridente": { golpe: LANCA, arremesso: LANCA_ARREMESSO },
};

/** Arma fora da tabela: pela tipagem (a primeira que bater). */
const POR_TIPAGEM = [
  ["arcos", { tiro: FLECHA }],
  ["bestas", { tiro: VIROTE }],
  ["fundas", { tiro: ["range.weapon.sling.01.white", "range.weapon.bullet.1.orange"] }],
  ["dardos", { tiro: ["range.weapon.dart.01.white", "range.weapon.dagger.01.white"] }],
  ["laminas_pequenas", { golpe: ["melee.weapon.shortsword.01.white"] }],
  ["laminas_grandes", { golpe: ["melee.weapon.sword.01.white"] }],
  ["machados", { golpe: ["melee.weapon.handaxe.01.white"] }],
  ["macas", { golpe: ["melee.weapon.mace.01.white"] }],
  ["manguais", { golpe: ["melee.weapon.mace.01.white"] }],
  ["martelos", { golpe: ["melee.weapon.warhammer.01.white"] }],
  ["picaretas", { golpe: ["melee.weapon.warhammer.01.white"] }],
  ["lancas", { golpe: LANCA }],
  ["chicotes", { golpe: ["melee.generic.slashing.01.orange"] }],
  ["cajados", { golpe: CAJADO }],
  ["naturais", { golpe: SOCO }],
  ["desarmado", { golpe: SOCO }],
];
/** Arma sem tipagem conhecida: pelo tipo de dano. */
const POR_DANO = {
  corte: { golpe: ["melee.weapon.sword.01.white"] },
  perfuracao: { golpe: ["melee.weapon.rapier.01.white"] },
  concussao: { golpe: ["melee.weapon.mace.01.white"] },
};

/** Ícone da condição imposta por um golpe (o visual que dura vem depois). */
const ICONES_CONDICAO = {
  abalado: ["static.generic.ui.fear.darkpurple"],
  atordoado: ["static.generic.ui.stun.purple"],
  pasmo: ["static.generic.ui.stun.purple"],
  indefeso: ["static.generic.ui.crackedshield.purple"],
  enfraquecido: ["static.generic.ui.skull.purple"],
  lento: ["static.generic.ui.snowflake.blue"],
  dominado: ["static.generic.ui.heart.pink"],
  enfeiticado: ["static.generic.ui.heart.pink"],
  cego: ["static.generic.smoke.02.grey"],
};
/** Sangramento e afins (dano contínuo físico). */
const ICONE_SANGRAMENTO = ["static.generic.ui.drop.red"];
/** O golpe em si, quando não há nada mais específico. */
const IMPACTO = { nome: "Impacto", chaves: ["static.generic.impact.01.yellow"] };
/** Cura sem magia (Medicina, Recuperar o Fôlego...). */
const CURA_FISICA = { nome: "Cura", chaves: ["static.spell.generichealing.01.green"] };
const FISICOS = new Set(["corte", "perfuracao", "concussao"]);

/** Sopro de Dragão: um jato do dragão até cada criatura atingida. */
const SOPRO = {
  fogo: ["range.spell.fireballbeam.01.orange", "range.spell.firebolt.01.orange"],
  frio: ["range.spell.rayoffrost.01.blue"],
  raio: ["range.spell.witchbolt.01.blue"],
  acido: ["range.spell.firebolt.01.green", "range.spell.disintegrate.01.green"],
  veneno: ["range.generic.poison.01.greenyellow", "range.spell.disintegrate.01.green"],
};

const FURIA = [{ nome: "Fúria", chaves: ["static.energy.strands.01.red", "static.energy.circle.complete.orange"] }];
const FERA = ["static.spell.huntersmark.paw.green", "static.spell.spiritguardians.01.lightgreen", "static.plants.ring.complete.greenyellow"];
const DIVINO = ["static.spell.divinesmite.target.yellowblue"];
const ESCUDO = ["static.marker.towershield.complete.blue", "static.marker.roundshield.complete.orange"];

/**
 * Habilidades e traços com animação escolhida à mão (nome sem acento; vale o
 * nome exato e, depois, o começo do nome — "pacto" cobre todos os pactos).
 * Cada regra vale para as ações cujo rótulo bate com `rotulo` (ou todas):
 *   chaves     a animação (a primeira que existir)
 *   pular      a ação fica sem animação
 *   triviais   anima também ações que só rolam/registram (rituais, reações)
 *   porElemento  lista por tipo de dano da ação
 *   playOn, size  quando o padrão da forma da ação não serve
 * Fora daqui, um efeito que você aplica EM VOCÊ só ganha animação se curar;
 * rolagens de perícia e ativações sem efeito ficam sem.
 */
const POR_ITEM = {
  "artes marciais": [{ nome: "Golpes marciais", chaves: MARCIAL }],
  "autoridade divina": [{ nome: "Autoridade divina", chaves: ["static.spell.bless.intro.yellow"] }],
  "baluarte": [{ nome: "Baluarte", chaves: ESCUDO }],
  "cancao do viajante": [{ nome: "Canção", chaves: ["static.marker.music.01.greenorange"] }],
  "cauda": [{ nome: "Cauda", chaves: ["melee.weapon.greatclub.01.white"] }],
  "combater sem armadura": [{ nome: "Defesa sem armadura", chaves: ["static.energy.shimmer.01.blue"] }],
  "defletir projeteis": [{ rotulo: /arremessar/i, nome: "Projétil devolvido", chaves: ["range.weapon.arrow.regular.regular"], triviais: true },
                         { pular: true }],
  "desaparecer": [{ nome: "Desaparecer", chaves: ["static.generic.smoke.02.grey"] }],
  "espirito guardiao": [{ nome: "Espírito Guardião", size: 1.5,
    chaves: ["static.spell.spiritguardians.01.lightgreen", "static.plants.ring.complete.greenyellow"] }],
  "espirito guardiao [carpa]": [{ nome: "Espírito da Carpa", chaves: ["static.liquid.splash.01.blue"] }],
  "espirito guardiao [falcao]": [{ nome: "Espírito do Falcão", chaves: ["static.nature.feathers.outburst.textured"] }],
  "espirito guardiao [leao]": [{ nome: "Espírito do Leão", chaves: FERA, size: 1.5 }],
  "espirito guardiao [lobo]": [{ nome: "Espírito do Lobo", chaves: FERA, size: 1.5 }],
  "espirito guardiao [urso]": [{ nome: "Espírito do Urso", chaves: FERA, size: 1.5 }],
  "espirito guardiao [tartaruga]": [{ nome: "Espírito da Tartaruga", chaves: ["static.shieldfx.earth.01.orange"] }],
  "fluxo arcano": [{ nome: "Fluxo Arcano", chaves: ["static.energy.sparkles.01.blue"] }],
  "forca repentina": [{ nome: "Força Repentina", chaves: ["static.particles.inwarddots.01.red", "static.generic.outpulse.02.whiteblue"] }],
  "forma animal": [{ rotulo: /^forma animal/i, nome: "Transformação", chaves: ["static.generic.smoke.03.grey"] }, { pular: true }],
  "furia": FURIA,
  "garras": [{ rotulo: /^ataque/i, nome: "Garras", chaves: ["melee.creature.claw.01.red"] },
             { nome: "Garras", chaves: ["static.creature.claw.01.red"] }],
  "golpe critico brutal": [{ nome: "Golpe brutal", chaves: ["static.generic.boulderimpact.01.white", "static.generic.impact.01.orange"] }],
  "golpe letal": [{ nome: "Golpe letal", chaves: ["static.spell.sneakattack.01.darkgreen"] }],
  "golpear com escudo": [{ nome: "Golpe de escudo", chaves: IMPACTO.chaves }],
  "grito de guerra": [{ nome: "Grito de guerra", chaves: ["static.generic.outpulse.02.whiteblue"] }],
  "guerra santa": [{ nome: "Guerra santa", chaves: DIVINO }],
  "guia divino": [{ nome: "Guia divino", chaves: ["static.spell.bless.intro.yellow"] }],
  "impulso de combate": [{ nome: "Impulso de combate", triviais: true,
    chaves: ["static.particles.inwarddots.01.orange", "static.generic.outpulse.02.whiteblue"] }],
  "inspirar": [{ nome: "Inspiração", chaves: ["static.spell.bardicinspiration.inspire.greenorange"] }],
  "juramento": [{ nome: "Aura do juramento", chaves: ["static.spell.spiritguardians.01.yellowblue"] }],
  "letalidade": [{ nome: "Letalidade", chaves: ["static.spell.sneakattack.01.darkgreen"] }],
  "manifestacao divina": [{ rotulo: /inimig/i, nome: "Manifestação divina", chaves: DIVINO },
                          { nome: "Manifestação divina", chaves: ["static.spell.generichealing.01.yellow"] }],
  "pacto": [{ nome: "Ritual do pacto", chaves: ["static.marker.smokering.loop.purpleblue"], triviais: true }],
  "pacto [abissal]": [{ nome: "Pacto abissal", chaves: ["static.spell.armsofhadar.01.darkpurple"], triviais: true }],
  "pacto [celestial]": [{ nome: "Pacto celestial", chaves: ["static.spell.divinesmite.source.yellowblue"], triviais: true }],
  "pacto [elemental]": [{ nome: "Pacto elemental", chaves: ["static.energy.circle.complete.orange"], triviais: true }],
  "pacto [faerian]": [{ nome: "Pacto faérian", chaves: ["static.leaves.outburst.01.pink"], triviais: true }],
  "pacto [infernal]": [{ nome: "Pacto infernal", chaves: ["static.generic.fire.ring.red", "static.fire.groundcrack.01.orange"], triviais: true }],
  "pacto [sombrio]": [{ nome: "Pacto sombrio", chaves: ["static.marker.smokering.loop.purpleblue"], triviais: true }],
  "pele de escamas": [{ nome: "Escamas", chaves: ["static.shieldfx.earth.01.orange"] }],
  "prece de repouso": [{ nome: "Prece", chaves: ["static.spell.generichealing.01.yellow"] }],
  "presa de caca": [{ nome: "Presa de caça", chaves: ["static.spell.huntersmark.eye.green"] }],
  "presas": [{ rotulo: /^ataque/i, nome: "Presas", chaves: ["melee.creature.bite.01.red"] },
             { nome: "Presas", chaves: ["static.creature.bite.01.red"] }],
  "presenca aterradora": [{ nome: "Presença aterradora", chaves: ["static.generic.outpulse.01.purplepink", "static.spell.armsofhadar.01.darkpurple"] }],
  "protecao dos espiritos": [{ nome: "Proteção dos espíritos", chaves: ["static.marker.circleofstars.01.greenorange", "static.marker.circleofstars.01.blue"] }],
  "proteger": [{ nome: "Proteger", chaves: ESCUDO }],
  "provocar": [{ nome: "Provocação", chaves: ["static.generic.outpulse.02.whiteblue"] }],
  "punicao": [{ nome: "Punição", chaves: DIVINO }],
  "reacao furiosa": FURIA,
  "sopro de dragao": [{ nome: "Sopro de Dragão", porElemento: SOPRO }],
  // Traços
  "filhos de auralia": [{ nome: "Teleporte faérian", chaves: ["static.leaves.outburst.01.pink", "static.spell.mistystep.01.blue"] }],
  "moldar energia": [{ nome: "Moldar energia", chaves: ["static.energy.shimmer.01.purple", "static.energy.shimmer.01.blue"], triviais: true }],
  "sangue aagn": [{ nome: "Sangue Aagn", chaves: ["static.particles.inwardstars.01.red", "static.spell.generichealing.02.greenorange"] }],
};

/** Regras de um item: nome exato, ou o começo de nome mais longo. */
function regrasDoItem(nome) {
  const n = semAcento(nome);
  if (POR_ITEM[n]) return POR_ITEM[n];
  let melhor = null;
  for (const k of Object.keys(POR_ITEM)) {
    if ((n.startsWith(`${k} `) || n.startsWith(`${k}[`)) && (!melhor || k.length > melhor.length)) melhor = k;
  }
  return melhor ? POR_ITEM[melhor] : null;
}

/** Um ataque que rola contra um alvo (mesmo com dano base 0, como os de arma). */
function ataqueDeArma(a) {
  return !!a.canRoll && (a.targetMode || "target") === "target" && preenchido(a.damage) && !!a.damageType;
}

/** A ação só rola ou registra algo (perícia, ativação sem efeito). */
function acaoTrivial(a) {
  if (causaDano(a) || drenaPM(a) || preenchido(a.heal) || ataqueDeArma(a)) return false;
  if ((a.appliesEffects ?? []).length || a.movement?.enabled) return false;
  return true;
}

const playOnPadrao = (forma, ofensiva) =>
  ["emSi", "aura", "teleporte"].includes(forma) ? "source" : ofensiva ? "target" : "default";
const tamanhoPadrao = (forma) => (forma === "aura" ? 2.5 : forma === "area" || forma === "linha" ? 1.25 : 1);

/** Arma do equipamento: golpe, tiro ou arremesso. */
function visualDeArma(a, data) {
  if (!(a.isWeapon || /^ataque\b/i.test(a.label ?? ""))) return null;
  if (!ataqueDeArma(a) && !causaDano(a)) return null;
  const nome = semAcento(data.name);
  const tags = (data.system?.tags ?? []).map((t) => semAcento(t));
  const A = ARMAS[nome] ?? POR_TIPAGEM.find(([t]) => tags.includes(t))?.[1] ?? POR_DANO[a.damageType] ?? null;
  if (!A) return null;
  const marcial = A.marcial && /artes marciais/i.test(a.label ?? "");
  const lista = marcial ? A.marcial : (A.golpe && (a.isMelee || !A.tiro)) ? A.golpe : A.tiro ?? A.golpe;
  return { lista, nome: data.name, playOn: "target", size: 1, arremesso: lista === A.golpe ? A.arremesso : null };
}

/** Ícone da primeira condição negativa que a ação impõe. */
function iconeDaCondicao(a) {
  for (const e of a.appliesEffects ?? []) {
    if (e?.fxType !== "condition" || !NEGATIVAS.has(e.fxTarget)) continue;
    if (e.fxTarget === "dano_continuo") {
      if (FISICOS.has(e.tickType) || !e.tickType) return { lista: ICONE_SANGRAMENTO, nome: "Sangramento" };
      if (e.tickType === "veneno") return { lista: ["static.generic.ui.poison.darkgreen"], nome: "Veneno" };
      continue;
    }
    const lista = ICONES_CONDICAO[e.fxTarget];
    if (lista) return { lista, nome: CONDICOES[e.fxTarget]?.nome ?? e.fxTarget };
  }
  return null;
}

/**
 * A animação de UMA ação de equipamento, habilidade ou traço.
 * @returns {{lista: string[], nome: string, playOn: string, size: number, arremesso?: string[]} | null}
 */
export function visualDeItem(a, data) {
  const forma = formaDe(a);
  const nat = naturezaDe(a, forma);
  // Empurrar, puxar ou mover o alvo também é coisa que se faz CONTRA alguém.
  const moveOutro = !!a.movement?.enabled && a.movement.who !== "self" && forma !== "emSi";
  const ofensiva = nat.tipo === "ofensiva" || moveOutro;
  const trivial = acaoTrivial(a);

  const regra = regrasDoItem(data?.name ?? "")?.find((r) => !r.rotulo || r.rotulo.test(a.label ?? ""));
  if (regra) {
    if (regra.pular || (trivial && !regra.triviais)) return null;
    const lista = regra.porElemento ? regra.porElemento[elementoDe(a)] : regra.chaves;
    if (lista) {
      return { lista, nome: regra.nome ?? data.name, playOn: regra.playOn ?? playOnPadrao(forma, ofensiva || trivial),
               size: regra.size ?? tamanhoPadrao(forma) };
    }
  }
  if (trivial) return null;
  if (data?.type === "equipamento") {
    const arma = visualDeArma(a, data);
    if (arma) return arma;
  }

  const size = tamanhoPadrao(forma);
  if (nat.tipo === "teleporte") return { lista: TELEPORTE.chaves, nome: TELEPORTE.nome, playOn: "source", size: 1 };
  if (nat.tipo === "beneficio") {
    // Em você, só a cura (e a sobrevida, os PM) pede animação; os ajustes de
    // número que você liga em si mesmo ficam quietos.
    if (forma === "emSi" && !["cura", "sobrevida", "pm"].includes(nat.beneficio)) return null;
    const B = nat.beneficio === "cura" ? CURA_FISICA : (BENEFICIOS[nat.beneficio] ?? BENEFICIOS.bencao);
    return { lista: B.chaves, nome: B.nome, playOn: playOnPadrao(forma, false), size };
  }
  if (forma === "emSi") return null;

  const playOn = playOnPadrao(forma, ofensiva);
  const elem = elementoDe(a);
  const depoisDoAcerto = !a.canRoll; // complemento de um golpe que já acertou
  if (elem && !FISICOS.has(elem)) {
    const dano = (causaDano(a) || drenaPM(a)) && !depoisDoAcerto;
    return { lista: deElemento(ELEMENTOS[elem], forma, dano), nome: ELEMENTOS[elem].nome, playOn, size };
  }
  if (forma === "aura") return { lista: GENERICO.aura, nome: "Presença", playOn, size };
  const icone = iconeDaCondicao(a);
  if (icone) return { lista: icone.lista, nome: icone.nome, playOn, size };
  if (elem && !depoisDoAcerto) return { lista: ELEMENTOS[elem].toque, nome: ELEMENTOS[elem].nome, playOn, size };
  return { lista: IMPACTO.chaves, nome: IMPACTO.nome, playOn, size };
}

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

/**
 * Grava as animações escolhidas nas ações e nos efeitos aplicáveis de um
 * item. O que tem animação que NÃO é deste módulo (puxada do item, ou
 * caminho digitado no "Avançado") fica como está.
 */
function animarAcoes(data, visualDe, { existe, base }) {
  const sys = data?.system;
  const out = { acoes: 0, efeitos: 0 };
  if (!sys || !Array.isArray(sys.actions)) return out;
  sys.actions.forEach((a, i) => {
    if (!a || typeof a !== "object") return;
    const livreAcao = !preenchido(a.animFile) && (!temConfig(a.aaConfig) || animacaoAutomatica(a.aaConfig));
    if (livreAcao) {
      const v = visualDe(a);
      const chave = v && escolher(v.lista, existe);
      if (chave) {
        a.aaConfig = entradaAA({ chave, playOn: v.playOn, size: v.size, label: data.name ?? "",
                                 nome: v.nome, semente: `${base}|${i}|${a.label ?? ""}`,
                                 arremesso: v.arremesso ? escolher(v.arremesso, existe) : null });
        a.aaName = `${data.name ?? "Item"} (automática)`;
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
  const sys = data?.system ?? {};
  const base = data?.flags?.[MODULE_ID]?.receita?.base ?? data?.name ?? "";
  return animarAcoes(data, (a) => visualDaAcao(a, {
    palavra: String(a._palavra || sys.wordId || "").toLowerCase(), base,
  }), { existe, base });
}

/**
 * Põe animações automáticas em qualquer item do Ligeia: magia, arma,
 * habilidade, traço, complicação... (dados do item, mutação in-place).
 * @returns {{acoes: number, efeitos: number}}
 */
export function animarItem(data, { existe = chaveSegura } = {}) {
  if (data?.type === "magia") return animarMagia(data, { existe });
  return animarAcoes(data, (a) => visualDeItem(a, data), { existe, base: data?.name ?? "" });
}

/**
 * Tira as animações automáticas (deste módulo) de um item — mutação
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

/**
 * Todas as listas de chaves das tabelas (para os testes). Sem `comOpcionais`,
 * deixa de fora as de arremesso: sem uma delas, o golpe simplesmente vai até
 * o alvo, então elas não precisam de plano B no JB2A gratuito.
 */
export function chavesDasTabelas({ comOpcionais = true } = {}) {
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
  for (const A of [...Object.values(ARMAS), ...POR_TIPAGEM.map(([, x]) => x), ...Object.values(POR_DANO)]) {
    listas.push(A.golpe, A.tiro, A.marcial);
    if (comOpcionais) listas.push(A.arremesso);
  }
  for (const regras of Object.values(POR_ITEM)) {
    for (const r of regras) {
      listas.push(r.chaves);
      if (r.porElemento) listas.push(...Object.values(r.porElemento));
    }
  }
  listas.push(...Object.values(ICONES_CONDICAO), ICONE_SANGRAMENTO, ["static.generic.ui.poison.darkgreen"],
              IMPACTO.chaves, CURA_FISICA.chaves);
  return listas.filter(Array.isArray);
}
