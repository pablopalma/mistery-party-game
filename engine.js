// Motor de "Tres Sabuesos": genera un caso a partir de un código.
// Todo es determinista: el mismo código produce el mismo caso en cualquier dispositivo.
(function (root) {
  'use strict';

  // Sospechosos: cada uno trae nacionalidad, acento para imitar, carácter, muletilla y trasfondo.
  const PEOPLE = [
    { name: 'Amelia', last: 'Duarte', role: 'abogada de la víctima', icon: '👩‍💼', origin: 'española, de Madrid',
      accent: 'Pronunciá la «z» y la «c» con la lengua entre los dientes. Decí «vale», «tío», «vosotros» y «joder».',
      style: 'Fría y precisa. Responde con otra pregunta y nunca levanta la voz.', tic: 'Vamos a ver…',
      bg: 'Una vez falsificó una firma y casi pierde la matrícula. Lo niega hasta hoy, y cada vez que alguien dice «documento» se le tensa la mandíbula.' },
    { name: 'Bruno', last: 'Kessler', role: 'socio de la víctima', icon: '🧔', origin: 'alemán, de Hamburgo',
      accent: 'Erres fuertes y raspadas, la «v» como «f». Frases cortas, sin adornos. Soltá «ja», «nein» y «genau».',
      style: 'Rígido y obsesivo con el orden. Le molesta que lo interrumpan y corrige los horarios de los demás.', tic: 'Eso no es correcto.',
      bg: 'Llegó al país sin un peso. Jura que todo lo ganó trabajando, pero nadie pudo explicar nunca de dónde salió su primer millón.' },
    { name: 'Carmen', last: 'Ríos', role: 'ex pareja de la víctima', icon: '💃', origin: 'mexicana, de Guadalajara',
      accent: 'Tono cantadito, alargando el final de las frases. Decí «órale», «ahorita», «no manches» y «güey».',
      style: 'Dramática. Todo le pasa a ella, se lleva la mano al pecho y suspira antes de contestar.', tic: '¡No manches!',
      bg: 'Fue actriz de telenovelas. Todavía puede llorar a pedido, y lo sabe usar. La víctima la dejó por carta, el día de su cumpleaños.' },
    { name: 'Darío', last: 'Conti', role: 'chofer de la víctima', icon: '🧑‍✈️', origin: 'italiano, de Nápoles',
      accent: 'Terminá las palabras en vocal y hablá con las manos. Decí «mamma mia», «capisci», «allora» y «ma dai».',
      style: 'Simpático y charlatán hasta que le preguntan por su pasado; ahí se pone serio de golpe.', tic: 'Ma che dici!',
      bg: 'En Nápoles manejaba para gente peligrosa. Vino escapando de algo que no cuenta, y duerme con la luz prendida.' },
    { name: 'Elena', last: 'Petrova', role: 'médica personal de la víctima', icon: '👩‍⚕️', origin: 'rusa, de San Petersburgo',
      accent: 'Erres marcadas y voz grave. Comete los artículos: «yo ver hombre en pasillo». Decí «da» y «niet».',
      style: 'Seria, sin gestos. Habla de la muerte como quien habla del clima.', tic: 'En mi país esto se resuelve rápido.',
      bg: 'Fue médica militar. Vio demasiados cadáveres como para impresionarse con uno más, y esa calma pone nerviosos a todos.' },
    { name: 'Fausto', last: 'Beaumont', role: 'marchand de arte y amigo de la víctima', icon: '👨‍🎨', origin: 'francés, de Lyon',
      accent: 'Erre gutural, desde la garganta, y acento en la última sílaba. Decí «oh là là», «mon Dieu» y «voilà».',
      style: 'Elegante y despectivo. Todo le parece de mal gusto y lo dice.', tic: 'C\'est la vie.',
      bg: 'Vende cuadros que quizás no sean auténticos y vive de aparentar una fortuna que no tiene. La víctima le había comprado tres.' },
    { name: 'Greta', last: 'Silva', role: 'amiga de la infancia de la víctima', icon: '👩‍🦱', origin: 'brasileña, de Río de Janeiro',
      accent: 'Hablá en portuñol: «você», «muito», «tudo bem», terminaciones en «-ão» y «-inho». Decí «nossa!».',
      style: 'Cálida y pegajosa. Toca el brazo de quien le habla y se ríe en los peores momentos.', tic: 'Nossa senhora!',
      bg: 'Conoce todos los secretos de la víctima desde los seis años. Dice que la quería con el alma; otros dicen que la envidió toda la vida.' },
    { name: 'Hugo', last: 'Miller', role: 'inversor extranjero', icon: '🤠', origin: 'estadounidense, de Texas',
      accent: 'Erres blandas, verbos en infinitivo y palabras en inglés mezcladas: «yo no saber nada, okay?». Decí «oh my God».',
      style: 'Sonriente y ruidoso. Da palmadas en la espalda y habla de plata aunque nadie pregunte.', tic: 'Time is money, amigo.',
      bg: 'Compra empresas quebradas y las desarma. Tres de sus ex socios terminaron en la ruina y uno, en un hospital.' }
  ];

  // Escenarios: cada uno con sus lugares y dos víctimas posibles.
  const SCENARIOS = [
    { name: 'Casona Villalba', icon: '🏚️',
      intro: 'Una casona de campo a cuarenta kilómetros del pueblo. La tormenta cortó el camino y el teléfono: nadie pudo entrar ni salir.',
      places: [
        { name: 'la biblioteca', icon: '📚' }, { name: 'la cocina', icon: '🍳' }, { name: 'el sótano', icon: '🕯️' },
        { name: 'el invernadero', icon: '🪴' }, { name: 'el salón', icon: '🛋️' }, { name: 'el altillo', icon: '🪜' }
      ],
      victims: [
        { name: 'Ernesto Villalba', bio: 'Patriarca de la familia, 71 años. Esa tarde anunció en la sobremesa que cambiaba el testamento. Lo encontraron muerto antes de firmarlo, con el documento hecho cenizas en la chimenea.' },
        { name: 'Lucía Villalba', bio: 'La heredera, 34 años. Volvió después de diez años de ausencia diciendo que sabía quién había matado a su madre. Prometió decir el nombre en el desayuno. No llegó.' }
      ] },
    { name: 'Cabaña del lago Espejo', icon: '🏔️',
      intro: 'Una cabaña aislada por la nevada, sin señal. Por la mañana, las cuatro cubiertas de la única camioneta aparecieron tajeadas.',
      places: [
        { name: 'el muelle', icon: '🛶' }, { name: 'la leñera', icon: '🪵' }, { name: 'el altillo', icon: '🪜' },
        { name: 'la cocina', icon: '🍳' }, { name: 'el cobertizo', icon: '🛖' }, { name: 'el living', icon: '🔥' }
      ],
      victims: [
        { name: 'Iván Roldán', bio: 'Guía de montaña, 45 años. Hace un año volvió solo de una expedición de la que habían salido cuatro. Esa noche, con unas copas de más, dijo que por fin iba a contar lo que pasó allá arriba.' },
        { name: 'Mara Quiroga', bio: 'Organizó el reencuentro, 29 años. Cada invitado había recibido una carta suya con la misma frase: «Sé lo que hiciste aquel verano». Nadie sabe qué pensaba hacer con lo que sabía.' }
      ] },
    { name: 'Edificio Mirador', icon: '🏢',
      intro: 'Un edificio de catorce pisos durante un apagón. La puerta de calle quedó trabada y la cámara de la vereda confirma que nadie entró ni salió.',
      places: [
        { name: 'el ascensor', icon: '🛗' }, { name: 'la terraza', icon: '🌃' }, { name: 'el palier', icon: '🚪' },
        { name: 'la cochera', icon: '🚗' }, { name: 'la sala de máquinas', icon: '⚙️' }, { name: 'el departamento 12B', icon: '🔑' }
      ],
      victims: [
        { name: 'Raúl Ferreyra', bio: 'Administrador del consorcio, 58 años. Cobraba expensas de departamentos vacíos y anotaba en una libreta negra los secretos de cada vecino. La libreta no aparece.' },
        { name: 'Elsa Morán', bio: 'Jueza jubilada, 63 años. Vivía encerrada desde que liberó por error a un hombre que volvió a matar. Esa semana recibió tres sobres con una sola palabra adentro: «Pronto».' }
      ] },
    { name: 'Aseguradora Fénix, piso 9', icon: '🏬',
      intro: 'Unas oficinas un viernes a la noche, en pleno cierre de balance. Los molinetes de la entrada registran que nadie abandonó el piso.',
      places: [
        { name: 'la sala de reuniones', icon: '📊' }, { name: 'el archivo', icon: '🗄️' }, { name: 'el depósito', icon: '📦' },
        { name: 'la recepción', icon: '🛎️' }, { name: 'la cocina del piso', icon: '☕' }, { name: 'el despacho del director', icon: '🪑' }
      ],
      victims: [
        { name: 'Marcos Leiva', bio: 'Director, 49 años. El lunes iba a despedir a medio piso. En su escritorio había una lista de nombres tachados; el último tachado era el suyo, escrito con otra letra.' },
        { name: 'Paula Sosa', bio: 'Auditora, 31 años. Había encontrado un desvío de millones y pidió una reunión urgente para el lunes. Alguien se enteró antes de tiempo.' }
      ] },
    { name: 'Hotel Las Brumas', icon: '🏨',
      intro: 'Un hotel de ruta fuera de temporada. La niebla cerró la ruta al anochecer y los únicos huéspedes quedaron atrapados hasta el amanecer.',
      places: [
        { name: 'el bar', icon: '🥃' }, { name: 'la lavandería', icon: '🧺' }, { name: 'la suite 7', icon: '🛏️' },
        { name: 'la pileta', icon: '🏊' }, { name: 'el depósito', icon: '📦' }, { name: 'la recepción', icon: '🛎️' }
      ],
      victims: [
        { name: 'Aurelio Bianchi', bio: 'Dueño del hotel, 66 años. Todos los huéspedes de esa noche le debían dinero. Guardaba los pagarés en la caja fuerte, que apareció abierta y vacía.' },
        { name: 'Nina Vidal', bio: 'Cantante, 27 años. Se registró con nombre falso. En su valija había fotos de cada uno de los presentes, tomadas a escondidas durante meses.' }
      ] },
    { name: 'Teatro Odeón', icon: '🎭',
      intro: 'Un teatro cerrado por reformas, durante un ensayo general a puertas trabadas. El sereno jura que no le abrió a nadie.',
      places: [
        { name: 'el camarín', icon: '💄' }, { name: 'el foso', icon: '🎻' }, { name: 'la utilería', icon: '🎩' },
        { name: 'la platea', icon: '💺' }, { name: 'la cabina de luces', icon: '💡' }, { name: 'el escenario', icon: '🎬' }
      ],
      victims: [
        { name: 'Octavio Reyes', bio: 'Director de la obra, 60 años. Humillaba al elenco hasta hacerlo llorar. Esa noche anunció que el estreno se cancelaba y que una de las personas presentes «sabía muy bien por qué».' },
        { name: 'Celeste Arana', bio: 'Primera actriz, 38 años. Las tres mujeres que hicieron ese papel antes que ella murieron en accidentes. Ella decía que no habían sido accidentes y que tenía cómo probarlo.' }
      ] }
  ];

  // Objetos: todos pudieron ser el arma. "cause" se revela recién al final.
  const OBJECTS = [
    { name: 'el cuchillo de caza', icon: '🔪', cause: 'una puñalada por la espalda' },
    { name: 'la pistola', icon: '🔫', cause: 'un disparo a quemarropa' },
    { name: 'la soga', icon: '🪢', cause: 'estrangulamiento con una soga' },
    { name: 'el frasco de veneno', icon: '🧪', cause: 'envenenamiento' },
    { name: 'el martillo', icon: '🔨', cause: 'un golpe de martillo en la nuca' },
    { name: 'las tijeras', icon: '✂️', cause: 'una herida de tijeras en el cuello' },
    { name: 'la jeringa', icon: '💉', cause: 'una inyección letal' },
    { name: 'el hacha', icon: '🪓', cause: 'un hachazo' },
    { name: 'el candelabro', icon: '🕯️', cause: 'un golpe de candelabro en la sien' },
    { name: 'el abrecartas', icon: '🗡️', cause: 'una herida de abrecartas en el pecho' }
  ];

  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  // Tipos de pista: 0 = persona-lugar, 1 = lugar-objeto, 2 = persona-objeto.
  // Cada rol recibe un solo tipo, por eso nadie puede resolver sola.
  const ROLES = [
    { id: 0, name: 'Detective', icon: '🕵️', deck: 'Coartadas', about: 'Sabés quién estuvo (o no) en cada lugar.', saw: 'Viste quién entró y quién no a cada lugar.' },
    { id: 1, name: 'Forense', icon: '🔬', deck: 'Rastros', about: 'Sabés qué objeto pasó por cada lugar.', saw: 'Viste qué objeto había en cada lugar.' },
    { id: 2, name: 'Periodista', icon: '📰', deck: 'Testimonios', about: 'Sabés quién tenía (o no) cada objeto.', saw: 'Viste qué objeto tenía cada persona.' }
  ];

  // Investigadores para interpretar: se reparten al azar entre quienes no son sospechosos.
  const PERSONAS = [
    { name: 'Inspector Bermúdez', origin: 'andaluz, de Sevilla',
      accent: 'Comete las eses finales y aspirá las jotas: «loh sospechosoh». Decí «quillo», «mi arma» y «ozú».',
      style: 'Desconfía de todo el mundo, habla seco y cortante. Jamás sonríe.', tic: 'Eso no me cierra.',
      bg: 'Veinte años en homicidios. Una vez mandó preso a un inocente que murió en la cárcel, y desde entonces no duerme más de tres horas.' },
    { name: 'Comisario Rossi', origin: 'italiano, de Palermo',
      accent: 'Terminá las palabras en vocal y gesticulá mucho. Decí «interessante», «allora», «bene» y «mamma mia».',
      style: 'Teatral. Se pasea mientras habla y hace pausas larguísimas antes de la pregunta importante.', tic: 'Interessante…',
      bg: 'Su padre era de la mafia. Se hizo policía para limpiar el apellido y todavía le llegan postales sin remitente.' },
    { name: 'Sargento Rocha', origin: 'cubano, de La Habana',
      accent: 'Rápido y con ritmo, comiéndote las eses y cambiando la «r» por «l»: «¿qué tú dice, mi helmano?». Decí «asere».',
      style: 'Habla fuerte, da órdenes y exige respuestas cortas.', tic: '¡Al grano!',
      bg: 'Fue boxeador. Dejó el ring después de una pelea que terminó muy mal y de la que no habla nunca.' },
    { name: 'Agente Sombra', origin: 'inglés, de Londres',
      accent: 'Muy cortés, pronunciando cada letra como si leyeras. Erres suaves. Decí «indeed», «my dear» y «I see».',
      style: 'Susurra, mira hacia los costados y habla de sí en tercera persona.', tic: 'Sombra ya lo sabía.',
      bg: 'Trabajó para un servicio secreto que niega su existencia. Nadie conoce su nombre real, ni siquiera su familia.' },
    { name: 'Profe Lux', origin: 'chileno, de Valparaíso',
      accent: 'Rápido y hacia arriba al final. Agregá «po» a todo: «sí po», «no po». Decí «cachái» y «al tiro».',
      style: 'Usa palabras rebuscadas y corrige a todo el mundo, aunque nadie se lo pida.', tic: 'Técnicamente…',
      bg: 'Enseñaba criminología hasta que un alumno usó sus clases para cometer un crimen casi perfecto. Renunció para atraparlo.' },
    { name: 'Vidente Zoraida', origin: 'rumana, de Transilvania',
      accent: 'Erres largas y arrastradas, voz baja, palabras lentas. Alargá las vocales: «yo veeeo cosas».',
      style: 'Confía más en sus presentimientos que en las pruebas. Mira fijo antes de hablar.', tic: 'Lo presentía.',
      bg: 'Dice que su abuela muerta le habla en sueños. Acertó tres casos seguidos y nadie pudo explicar cómo.' },
    { name: 'Detective Dupont', origin: 'francés, de París',
      accent: 'Erre gutural y acento en la última sílaba. Decí «mon ami», «bien sûr», «oh là là» y «mais non».',
      style: 'Refinado y vanidoso. Se ofende con facilidad y se acomoda la ropa antes de acusar.', tic: '¡Qué ordinariez!',
      bg: 'Lo echaron de la policía de París por un escándalo. Insiste en que fue una trampa y sueña con volver con un caso resonante.' },
    { name: 'Detective O\'Hara', origin: 'irlandés criado en Nueva York',
      accent: 'Erres blandas, palabras en inglés mezcladas y verbos mal conjugados: «tú estar mintiendo, pal». Decí «listen» y «c\'mon».',
      style: 'Cansado y sarcástico. Habla como quien ya escuchó todas las excusas del mundo.', tic: 'Ya vi esta película.',
      bg: 'Su compañero murió en un caso que nunca resolvió. Lleva su placa en el bolsillo y la toca cuando duda.' },
    { name: 'Doña Pilar', origin: 'gallega, de Vigo',
      accent: 'Cantadito, terminando en «-iño» y «-iña»: «un momentiño». Contestá una pregunta con otra. Decí «home», «carallo» y «¿e logo?».',
      style: 'Habla sin parar y se va por las ramas. Todo le recuerda a un pariente.', tic: 'Como decía mi primo…',
      bg: 'Era la portera que lo veía todo. Resolvió su primer crimen desde la ventana y la policía terminó contratándola.' }
  ];
  const MISSIONS = [
    'Lográ que alguien diga la palabra «imposible».',
    'Acusá a alguien de pie y señalando con el dedo, al menos una vez.',
    'Hacé que otra persona repita la misma frase tres veces.',
    'Decí «¡objeción!» y conseguí que te respondan en serio.',
    'Conseguí que alguien te pida disculpas.',
    'Usá tu muletilla cinco veces sin que nadie lo comente.',
    'Hacé una pausa dramática de cinco segundos antes de decir algo importante.',
    'Convencé al grupo de votar algo, lo que sea, a mano alzada.',
    'Lográ que alguien te dé la razón diciendo «tenés razón».',
    'Contá una anécdota inventada de tu país y que nadie la ponga en duda.',
    'Sostené el acento toda la partida: si lo perdés y alguien lo nota, fallaste.',
    'Lográ que alguien imite tu acento.'
  ];

  // Para los sospechosos: un motivo que todos conocen y algo turbio que hacían a la hora del crimen.
  const MOTIVES = [
    'La víctima tenía pruebas de una estafa suya y pensaba ir a la policía.',
    'Cobra el seguro de vida de la víctima.',
    'Hace un mes juró en público que la víctima «iba a pagar por lo que hizo».',
    'La víctima le arruinó la carrera con una sola llamada.',
    'Le debía a la víctima una suma imposible de devolver.',
    'La víctima conocía un secreto suyo de hace veinte años y amenazaba con contarlo.',
    'Discutieron a los gritos horas antes del crimen; los oyó todo el mundo.',
    'Fue la última persona que vio a la víctima con vida.'
  ];
  const DOINGS = [
    'revisando a escondidas los papeles de la víctima',
    'borrando mensajes comprometedores del teléfono',
    'llorando a solas por algo que no pensás contar',
    'tomando de más para juntar coraje',
    'buscando plata escondida que no era tuya',
    'escribiendo una carta de despedida',
    'escuchando detrás de una puerta',
    'quemando unas fotos viejas'
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
    const scenario = SCENARIOS[Math.floor(rng() * SCENARIOS.length)];
    const victim = scenario.victims[Math.floor(rng() * scenario.victims.length)];
    const cast = {
      people: shuffle(range(PEOPLE.length), rng).slice(0, n).map((i) => PEOPLE[i]),
      places: shuffle(scenario.places, rng).slice(0, n),
      objects: shuffle(range(OBJECTS.length), rng).slice(0, n).map((i) => OBJECTS[i])
    };
    // Datos del expediente: fecha, número y ventana horaria de la muerte.
    const year = 1948 + Math.floor(rng() * 30);
    const hour = [22, 23, 0, 1, 2][Math.floor(rng() * 5)];
    const file = {
      date: (1 + Math.floor(rng() * 28)) + ' de ' + MONTHS[Math.floor(rng() * 12)] + ' de ' + year,
      year: String(year).slice(2),
      from: hour + ':00',
      to: ((hour + 2) % 24) + ':00'
    };

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
      n, cast, file, victim, crimePlace, culprit, quality, sol,
      scenario: { name: scenario.name, icon: scenario.icon, intro: scenario.intro },
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
      if (c.k === 'pos') s = `Quien estuvo en ${L(c.x)} tenía ${O(c.y)}.`;
      if (c.k === 'neg') s = `Quien estuvo en ${L(c.x)} no tenía ${O(c.y)}.`;
      if (c.k === 'eitherY') s = `Quien estuvo en ${L(c.x)} tenía ${O(c.y)} o ${O(c.y2)}.`;
      if (c.k === 'eitherX') s = `Quien tenía ${O(c.y)} estuvo en ${L(c.x)} o en ${L(c.x2)}.`;
      if (c.k === 'neitherX') s = `Quien tenía ${O(c.y)} no estuvo ni en ${L(c.x)} ni en ${L(c.x2)}.`;
    } else {
      if (c.k === 'pos') s = `${P(c.x)} tenía ${O(c.y)}.`;
      if (c.k === 'neg') s = `${P(c.x)} no tenía ${O(c.y)}.`;
      if (c.k === 'eitherY') s = `${P(c.x)} tenía ${O(c.y)} o ${O(c.y2)}.`;
      if (c.k === 'eitherX') s = `Quien tenía ${O(c.y)} era ${P(c.x)} o ${P(c.x2)}.`;
      if (c.k === 'neitherX') s = `Ni ${P(c.x)} ni ${P(c.x2)} tenían ${O(c.y)}.`;
    }
    return cap(s);
  }

  const api = { ROLES, LEVELS, generate, parseCode, newCode, describe, cap, holds, allStates };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof window !== 'undefined' ? window : globalThis);
