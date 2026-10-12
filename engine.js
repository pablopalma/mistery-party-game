// Motor de "Tres Sabuesos": genera un caso a partir de un código.
// Todo es determinista: el mismo código produce el mismo caso en cualquier dispositivo.
(function (root) {
  'use strict';

  const PEOPLE = [
    { name: 'Amelia', role: 'la cocinera', icon: '👩‍🍳' },
    { name: 'Bruno', role: 'el mayordomo', icon: '🤵' },
    { name: 'Carmen', role: 'la pianista', icon: '👩‍🎤' },
    { name: 'Darío', role: 'el jardinero', icon: '👨‍🌾' },
    { name: 'Elena', role: 'la doctora', icon: '👩‍⚕️' },
    { name: 'Fausto', role: 'el pintor', icon: '👨‍🎨' },
    { name: 'Greta', role: 'la baronesa', icon: '👸' },
    { name: 'Hugo', role: 'el chofer', icon: '👨‍✈️' }
  ];
  const PLACES = [
    { name: 'la biblioteca', icon: '📚' },
    { name: 'la cocina', icon: '🍳' },
    { name: 'el jardín', icon: '🌿' },
    { name: 'el sótano', icon: '🕯️' },
    { name: 'el salón', icon: '🛋️' },
    { name: 'el invernadero', icon: '🪴' },
    { name: 'la torre', icon: '🗼' },
    { name: 'el garaje', icon: '🚗' }
  ];
  const OBJECTS = [
    { name: 'la linterna', icon: '🔦' },
    { name: 'la cuerda', icon: '🪢' },
    { name: 'la llave maestra', icon: '🗝️' },
    { name: 'los guantes', icon: '🧤' },
    { name: 'el martillo', icon: '🔨' },
    { name: 'la lupa', icon: '🔎' },
    { name: 'el paraguas', icon: '☂️' },
    { name: 'las tijeras', icon: '✂️' }
  ];
  const LOOT = [
    'el collar de esmeraldas',
    'el reloj de oro del abuelo',
    'la receta secreta de la abuela',
    'el retrato de la bisabuela',
    'el trofeo de la familia',
    'el diario de la tía Olga'
  ];

  // Tipos de pista: 0 = persona-lugar, 1 = lugar-objeto, 2 = persona-objeto.
  // Cada rol recibe un solo tipo, por eso nadie puede resolver sola.
  const ROLES = [
    { id: 0, name: 'Detective', icon: '🕵️', deck: 'Coartadas', about: 'Sabés quién estuvo (o no) en cada lugar.', saw: 'Viste quién entró y quién no a cada lugar.' },
    { id: 1, name: 'Forense', icon: '🔬', deck: 'Rastros', about: 'Sabés qué objeto pasó por cada lugar.', saw: 'Viste qué objeto había en cada lugar.' },
    { id: 2, name: 'Periodista', icon: '📰', deck: 'Testimonios', about: 'Sabés quién llevaba (o no) cada objeto.', saw: 'Viste qué objeto llevaba cada persona.' }
  ];

  // Personajes para interpretar: se reparten al azar, uno por rol.
  const PERSONAS = [
    { name: 'Inspector Bermúdez', style: 'Desconfía de todo el mundo, habla seco y cortante. Jamás sonríe.', tic: 'Eso no me cierra.' },
    { name: 'Tía Pilar', style: 'Habla sin parar y se va por las ramas. Todo le recuerda a un pariente.', tic: 'Como decía mi primo…' },
    { name: 'Profe Lux', style: 'Usa palabras rebuscadas y corrige a todo el mundo, aunque nadie se lo pida.', tic: 'Técnicamente…' },
    { name: 'Vidente Zoraida', style: 'Confía más en sus presentimientos que en las pruebas. Mira fijo antes de hablar.', tic: 'Lo presentía.' },
    { name: 'Sargento Rocha', style: 'Habla fuerte, da órdenes y exige respuestas cortas.', tic: '¡Al grano!' },
    { name: 'Miel Dulzura', style: 'Exageradamente amable: elogia a cada persona justo antes de sospechar de ella.', tic: 'Con todo cariño…' },
    { name: 'Agente Sombra', style: 'Susurra, mira hacia los costados y habla de sí en tercera persona.', tic: 'Sombra ya lo sabía.' },
    { name: 'Su Excelencia Altamira', style: 'De la alta sociedad: todo le parece vulgar y se ofende con facilidad.', tic: '¡Qué ordinariez!' },
    { name: 'Reloj Ruiz', style: 'Siempre con apuro. Mira la hora a cada rato y resopla.', tic: 'No tengo toda la noche.' }
  ];
  const MISSIONS = [
    'Lográ que alguien diga la palabra «imposible».',
    'Acusá a alguien de pie y señalando con el dedo, al menos una vez.',
    'Hacé que otra persona repita la misma pista tres veces.',
    'Decí «¡objeción!» y conseguí que te respondan en serio.',
    'Conseguí que alguien te pida disculpas.',
    'Usá tu muletilla cinco veces sin que nadie lo comente.',
    'Hacé una pausa dramática de cinco segundos antes de leer una pista.',
    'Convencé al grupo de votar algo, lo que sea, a mano alzada.',
    'Lográ que alguien te dé la razón diciendo «tenés razón».'
  ];

  // Para los sospechosos: un motivo que todos conocen y algo vergonzoso que estaban haciendo.
  const MOTIVES = [
    'Debe mucho dinero y lo sabe todo el pueblo.',
    'Discutió a los gritos con la familia la semana pasada.',
    'Siempre dijo que eso le correspondía por herencia.',
    'Le avisaron que este mes se queda sin trabajo.',
    'Alguien lo vio rondando la casa de madrugada hace unos días.',
    'Necesita plata urgente para irse de viaje.',
    'Juró en público que se iba a vengar de la familia.'
  ];
  const DOINGS = [
    'comiéndote a escondidas el postre de la fiesta',
    'ensayando un baile ridículo para grabar un video',
    'llorando con una telenovela',
    'escribiendo una carta de amor',
    'durmiendo una siesta en horario de trabajo',
    'practicando un discurso frente al espejo',
    'probándote ropa ajena',
    'buscando señal para chusmear el celular'
  ];

  const LEVELS = {
    F: { label: 'Fácil', n: 4, maxPos: 2, kinds: ['pos', 'neg', 'eitherY'] },
    M: { label: 'Medio', n: 5, maxPos: 1, kinds: ['pos', 'neg', 'eitherY', 'eitherX', 'neitherX'] },
    D: { label: 'Difícil', n: 5, maxPos: 0, kinds: ['neg', 'eitherY', 'eitherX', 'neitherX'] }
  };

  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(a) {
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function range(n) {
    return Array.from({ length: n }, (_, i) => i);
  }

  function perms(n) {
    const out = [];
    const cur = [];
    const used = new Array(n).fill(false);
    (function rec() {
      if (cur.length === n) return void out.push(cur.slice());
      for (let i = 0; i < n; i++) {
        if (used[i]) continue;
        used[i] = true;
        cur.push(i);
        rec();
        cur.pop();
        used[i] = false;
      }
    })();
    return out;
  }

  // Un estado es [lugar de cada persona, objeto en cada lugar, objeto de cada persona].
  const stateCache = {};
  function allStates(n) {
    if (stateCache[n]) return stateCache[n];
    const ps = perms(n);
    const out = [];
    for (const place of ps) {
      for (const lo of ps) {
        out.push([place, lo, place.map((l) => lo[l])]);
      }
    }
    return (stateCache[n] = out);
  }

  function holds(c, st) {
    const arr = st[c.t];
    switch (c.k) {
      case 'pos': return arr[c.x] === c.y;
      case 'neg': return arr[c.x] !== c.y;
      case 'eitherY': return arr[c.x] === c.y || arr[c.x] === c.y2;
      case 'eitherX': return arr[c.x] === c.y || arr[c.x2] === c.y;
      case 'neitherX': return arr[c.x] !== c.y && arr[c.x2] !== c.y;
    }
    return true;
  }

  function candidates(sol, n, kinds, rng) {
    const out = [];
    const has = (k) => kinds.indexOf(k) >= 0;
    for (let t = 0; t < 3; t++) {
      for (let x = 0; x < n; x++) {
        const y = sol[t][x];
        if (has('pos')) out.push({ t, k: 'pos', x, y });
        for (let o = 0; o < n; o++) {
          if (o !== y) {
            if (has('neg')) out.push({ t, k: 'neg', x, y: o });
            if (has('eitherY')) {
              out.push(rng() < 0.5 ? { t, k: 'eitherY', x, y, y2: o } : { t, k: 'eitherY', x, y: o, y2: y });
            }
          }
          if (o !== x && has('eitherX')) {
            out.push(rng() < 0.5 ? { t, k: 'eitherX', x, x2: o, y } : { t, k: 'eitherX', x: o, x2: x, y });
          }
        }
      }
      if (has('neitherX')) {
        for (let y = 0; y < n; y++) {
          for (let a = 0; a < n; a++) {
            for (let b = a + 1; b < n; b++) {
              if (sol[t][a] !== y && sol[t][b] !== y) out.push({ t, k: 'neitherX', x: a, x2: b, y });
            }
          }
        }
      }
    }
    return shuffle(out, rng);
  }

  function isUnique(states, clues) {
    let count = 0;
    for (const st of states) {
      let ok = true;
      for (const c of clues) {
        if (!holds(c, st)) { ok = false; break; }
      }
      if (ok && ++count > 1) return false;
    }
    return count === 1;
  }

  // ¿Las pistas dadas alcanzan para fijar la respuesta? keyOf define qué es "la respuesta".
  function determines(states, clues, keyOf) {
    let key = null;
    for (const st of states) {
      let ok = true;
      for (const c of clues) {
        if (!holds(c, st)) { ok = false; break; }
      }
      if (!ok) continue;
      const k = keyOf(st);
      if (key === null) key = k;
      else if (key !== k) return false;
    }
    return true;
  }

  function build(rng, cfg) {
    const n = cfg.n;
    const states = allStates(n);
    const place = shuffle(range(n), rng);
    const lo = shuffle(range(n), rng);
    const sol = [place, lo, place.map((l) => lo[l])];
    const crimePlace = Math.floor(rng() * n);
    const cast = {
      people: shuffle(range(PEOPLE.length), rng).slice(0, n).map((i) => PEOPLE[i]),
      places: shuffle(range(PLACES.length), rng).slice(0, n).map((i) => PLACES[i]),
      objects: shuffle(range(OBJECTS.length), rng).slice(0, n).map((i) => OBJECTS[i])
    };
    const loot = LOOT[Math.floor(rng() * LOOT.length)];

    // Se agregan pistas rotando entre los tres roles hasta que la solución sea única.
    const pool = candidates(sol, n, cfg.kinds, rng);
    let alive = states;
    let chosen = [];
    let posCount = 0;
    let turn = 0;
    while (alive.length > 1) {
      let added = false;
      for (let d = 0; d < 3 && !added; d++) {
        const t = (turn + d) % 3;
        for (let i = 0; i < pool.length; i++) {
          const c = pool[i];
          if (!c || c.t !== t) continue;
          if (c.k === 'pos' && posCount >= cfg.maxPos) continue;
          const next = alive.filter((st) => holds(c, st));
          if (next.length === alive.length) continue;
          alive = next;
          chosen.push(c);
          pool[i] = null;
          if (c.k === 'pos') posCount++;
          added = true;
          break;
        }
      }
      if (!added) return null;
      turn++;
    }

    // Se quitan las pistas redundantes, empezando por el rol que más tiene.
    const needed = new Set();
    for (;;) {
      const count = [0, 0, 0];
      chosen.forEach((c) => count[c.t]++);
      const order = shuffle(chosen, rng)
        .filter((c) => !needed.has(c) && count[c.t] > 2)
        .sort((a, b) => count[b.t] - count[a.t]);
      let removed = false;
      for (const c of order) {
        const rest = chosen.filter((o) => o !== c);
        if (isUnique(states, rest)) {
          chosen = rest;
          removed = true;
          break;
        }
        needed.add(c);
      }
      if (!removed) break;
    }

    const culprit = place.indexOf(crimePlace);
    const culpritOf = (st) => st[0].indexOf(crimePlace);
    const answerOf = (st) => culpritOf(st) * 10 + st[1][crimePlace];
    const byRole = [0, 1, 2].map((t) => chosen.filter((c) => c.t === t));

    // Calidad: 2 = hacen falta las tres; 1 = ninguna puede sola; 0 = descartar.
    let quality = 2;
    for (let t = 0; t < 3; t++) {
      if (byRole[t].length < 2 || determines(states, byRole[t], culpritOf)) quality = 0;
    }
    if (quality) {
      for (let t = 0; t < 3; t++) {
        const pair = chosen.filter((c) => c.t !== t);
        if (determines(states, pair, answerOf)) quality = 1;
      }
    }

    return {
      n, cast, loot, crimePlace, culprit, quality, sol,
      kinds: cfg.kinds,
      tool: lo[crimePlace],
      solution: { place, obj: sol[2] },
      clues: byRole.map((list) => shuffle(list, rng))
    };
  }

  function sameClue(a, b) {
    return a.t === b.t && a.k === b.k && a.x === b.x && a.y === b.y && a.x2 === b.x2 && a.y2 === b.y2;
  }

  // Modo culpable: 1 detective (rol 0) y 2 sospechosos (roles 1 y 2), uno inocente y uno culpable.
  // Al culpable se le sugiere una historia alterna: un mundo falso donde estuvo en otro lado.
  // Esa historia no choca con la evidencia del detective, así que él no puede desmentirla solo;
  // pero hay una o dos pistas del inocente que, si el detective las verifica, la vuelven imposible.
  function buildStory(game, rng) {
    const states = allStates(game.n);
    const sol = game.sol;
    const cp = game.crimePlace;
    const g = game.guilty;
    const f = 3 - g;
    const C = game.players[g];
    const F = game.players[f];
    const evidence = game.clues[0];
    const witness = game.clues[f];
    const real = game.clues[g];
    const kinds = game.kinds.filter((k) => k !== 'pos');
    const options = [];
    for (const st of states) {
      if (st[0][F] !== cp) continue;
      if (st[0][C] === sol[0][F] || st[2][C] === sol[2][F]) continue;
      if (!evidence.every((c) => holds(c, st))) continue;
      // Lo ideal es exactamente una pista falsa: da juego a las órdenes de registro sin delatarse.
      const lies = real.filter((c) => !holds(c, st)).length;
      options.push({ st, off: Math.abs(lies - 1), tie: rng() });
    }
    options.sort((a, b) => a.off - b.off || a.tie - b.tie);

    let fallback = null;
    for (const o of options.slice(0, 80)) {
      const pool = candidates(o.st, game.n, kinds, rng).filter((c) => c.t === g && !holds(c, sol));
      const hand = [];
      for (const c of real) {
        if (holds(c, o.st)) {
          hand.push({ c, real: true });
          continue;
        }
        const free = pool.filter((p) => !hand.some((h) => sameClue(h.c, p)));
        const fake = free.find((p) => p.k === c.k) || free[0];
        if (fake) hand.push({ c: fake, real: false });
      }
      const place = o.st[0][C];
      const obj = o.st[2][C];
      // Mundos en los que el culpable dice la verdad: el otro sospechoso estuvo en el lugar del hecho.
      const worlds = states.filter((st) =>
        st[0][F] === cp && st[0][C] === place && st[2][C] === obj &&
        evidence.every((c) => holds(c, st)) && hand.every((h) => holds(h.c, st)));
      let keys = [];
      witness.forEach((x, i) => {
        if (!keys.length && !worlds.some((st) => holds(x, st))) keys = [i];
      });
      for (let i = 0; i < witness.length && !keys.length; i++) {
        for (let k = i + 1; k < witness.length && !keys.length; k++) {
          if (!worlds.some((st) => holds(witness[i], st) && holds(witness[k], st))) keys = [i, k];
        }
      }
      const story = { place, obj, hand, keys };
      if (keys.length) return story;
      fallback = fallback || story;
    }
    return fallback;
  }

  // Personajes y misiones para todos; sospechosos, culpable y coartada solo en el modo culpable.
  function addExtras(game, rng, versus) {
    const personas = shuffle(PERSONAS, rng);
    const missions = shuffle(MISSIONS, rng);
    game.parts = [0, 1, 2].map((i) => ({ persona: personas[i], mission: missions[i] }));
    game.versus = false;
    if (!versus) return;

    // Sospechosos: el culpable y otra persona a la que la evidencia del detective no descarte sola.
    const motives = shuffle(MOTIVES, rng);
    const doings = shuffle(DOINGS, rng);
    for (const other of shuffle(range(game.n).filter((p) => p !== game.culprit), rng)) {
      const pair = shuffle([game.culprit, other], rng);
      game.players = [null, pair[0], pair[1]];
      game.guilty = game.players.indexOf(game.culprit);
      game.story = buildStory(game, rng);
      if (game.story && game.story.keys.length) break;
    }
    [1, 2].forEach((r) => {
      game.parts[r].motive = motives[r];
      game.parts[r].doing = doings[r];
    });
    game.versus = !!game.story;
  }

  function parseCode(raw) {
    const m = /^([FMD])(C?)-?(\d{4})$/.exec(String(raw || '').toUpperCase().replace(/\s+/g, ''));
    return m ? m[1] + m[2] + '-' + m[3] : null;
  }

  function newCode(level, versus) {
    return level + (versus ? 'C' : '') + '-' + String(1000 + Math.floor(Math.random() * 9000));
  }

  function generate(rawCode) {
    const code = parseCode(rawCode);
    if (!code) return null;
    const cfg = LEVELS[code[0]];
    const versus = code[1] === 'C';
    // Se prueban semillas derivadas del código hasta dar con un caso bien formado:
    // que hagan falta los tres roles y, en modo culpable, que la coartada tenga punto débil.
    let best = null;
    for (let attempt = 0; attempt < 60; attempt++) {
      const game = build(mulberry32(hashStr(code + '#' + attempt)), cfg);
      if (!game) continue;
      addExtras(game, mulberry32(hashStr(code + '#extras' + attempt)), versus);
      const score = game.quality + (versus && game.versus ? 3 + (game.story.keys.length ? 3 : 0) : 0);
      if (!best || score > best.score) {
        best = game;
        best.score = score;
      }
      if (score === (versus ? 8 : 2)) break;
    }
    best.code = code;
    best.level = cfg.label;
    return best;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function describe(c, cast) {
    const P = (i) => cast.people[i].name;
    const L = (i) => cast.places[i].name;
    const O = (i) => cast.objects[i].name;
    let s = '';
    if (c.t === 0) {
      if (c.k === 'pos') s = `${P(c.x)} estuvo en ${L(c.y)} toda la noche.`;
      if (c.k === 'neg') s = `${P(c.x)} no entró en ${L(c.y)}.`;
      if (c.k === 'eitherY') s = `${P(c.x)} estuvo en ${L(c.y)} o en ${L(c.y2)}.`;
      if (c.k === 'eitherX') s = `En ${L(c.y)} estuvo ${P(c.x)} o ${P(c.x2)}.`;
      if (c.k === 'neitherX') s = `Ni ${P(c.x)} ni ${P(c.x2)} entraron en ${L(c.y)}.`;
    } else if (c.t === 1) {
      if (c.k === 'pos') s = `Quien estuvo en ${L(c.x)} llevaba ${O(c.y)}.`;
      if (c.k === 'neg') s = `Quien estuvo en ${L(c.x)} no llevaba ${O(c.y)}.`;
      if (c.k === 'eitherY') s = `Quien estuvo en ${L(c.x)} llevaba ${O(c.y)} o ${O(c.y2)}.`;
      if (c.k === 'eitherX') s = `Quien llevaba ${O(c.y)} estuvo en ${L(c.x)} o en ${L(c.x2)}.`;
      if (c.k === 'neitherX') s = `Quien llevaba ${O(c.y)} no estuvo ni en ${L(c.x)} ni en ${L(c.x2)}.`;
    } else {
      if (c.k === 'pos') s = `${P(c.x)} llevaba ${O(c.y)}.`;
      if (c.k === 'neg') s = `${P(c.x)} no llevaba ${O(c.y)}.`;
      if (c.k === 'eitherY') s = `${P(c.x)} llevaba ${O(c.y)} o ${O(c.y2)}.`;
      if (c.k === 'eitherX') s = `Quien llevaba ${O(c.y)} era ${P(c.x)} o ${P(c.x2)}.`;
      if (c.k === 'neitherX') s = `Ni ${P(c.x)} ni ${P(c.x2)} llevaban ${O(c.y)}.`;
    }
    return cap(s);
  }

  const api = { ROLES, LEVELS, generate, parseCode, newCode, describe, cap, holds, allStates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
