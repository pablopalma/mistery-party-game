(function () {
  'use strict';

  const E = window.Engine;
  const app = document.getElementById('app');
  const ORDERS = 2;

  const ui = {
    screen: 'home', level: 'F', versus: true, code: null, role: null, tab: 'caso',
    pickWho: null, pickWhat: null, flash: null, error: null, proof: null
  };
  let game = null;
  let save = null;

  // --- almacenamiento ---
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* modo privado: se juega igual, sin guardar */ }
    return null;
  }

  function saveKey() {
    return 'ts2:' + ui.code + ':' + ui.role;
  }

  function loadSave() {
    const n = game.n;
    const blank = () => Array.from({ length: n }, () => new Array(n).fill(0));
    save = Object.assign(
      { start: Date.now(), end: null, tries: 0, won: false, revealed: false, orders: 0, mission: false, notes: [blank(), blank(), blank()], done: [] },
      store(saveKey()) || {}
    );
    persist();
  }

  function persist() {
    store(saveKey(), save);
  }

  // --- utilidades ---
  function fmtTime(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function elapsed() {
    return (save.end || Date.now()) - save.start;
  }

  function maxTries() {
    return game.versus ? 1 : 2;
  }

  function finished() {
    return save.won || save.revealed || save.tries >= maxTries();
  }

  function shareUrl() {
    return location.origin + location.pathname + '?caso=' + ui.code;
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
  }

  function person(i) {
    return game.cast.people[i];
  }

  function placeName(i) {
    return game.cast.places[i].name;
  }

  function objName(i) {
    return game.cast.objects[i].name;
  }

  // Cómo se llama y se ve cada rol: investigadores en equipo; detective y dos sospechosos en modo culpable.
  function roleInfo(r) {
    const base = E.ROLES[r];
    if (!game.versus) return { icon: base.icon, name: base.name, about: base.about, deck: base.deck };
    if (r === 0) return { icon: '🕵️', name: 'Detective', about: 'Interrogás a los dos sospechosos y decidís a quién acusar.', deck: 'Tu evidencia' };
    const p = person(game.players[r]);
    return { icon: p.icon, name: p.name + ' ' + p.last, about: E.cap(p.role) + '. ' + E.cap(p.origin) + '. Puede tocarte ser inocente o culpable.', deck: 'Lo que viste' };
  }

  function isGuilty() {
    return game.versus && ui.role === game.guilty;
  }

  function openCase(raw) {
    const code = E.parseCode(raw);
    if (!code) {
      ui.error = 'Ese código no es válido. Tiene una o dos letras y 4 números, por ejemplo MC-4821.';
      return render();
    }
    ui.error = null;
    ui.code = code;
    game = E.generate(code);
    ui.role = null;
    ui.screen = 'roles';
    history.replaceState(null, '', '?caso=' + code);
    render();
  }

  function enterRole(role) {
    ui.role = role;
    ui.screen = 'game';
    ui.tab = 'caso';
    ui.pickWho = ui.pickWhat = ui.flash = ui.proof = null;
    loadSave();
    store('ts2:last', { code: ui.code, role: role });
    render();
  }

  // --- pantallas ---
  function viewHome() {
    const levels = Object.keys(E.LEVELS).map((k) => {
      const lv = E.LEVELS[k];
      return `<button class="level ${ui.level === k ? 'on' : ''}" data-act="level" data-v="${k}">
        <b>${lv.label}</b><span>${lv.n} personas</span></button>`;
    }).join('');
    return `
      <div class="hero">
        <div class="stamp red">Homicidios</div>
        <h1>Tres Sabuesos</h1>
        <p>Expedientes de homicidio para exactamente 3 personas.</p>
      </div>
      <div class="card">
        <h2>Abrir expediente</h2>
        <div class="modes">
          <button class="mode ${ui.versus ? 'on' : ''}" data-act="mode" data-v="1">
            <b>🎭 Culpable entre nosotros</b>
            <span>1 detective y 2 sospechosos. Uno mató y miente para salvarse.</span></button>
          <button class="mode ${ui.versus ? '' : 'on'}" data-act="mode" data-v="">
            <b>🤝 En equipo</b>
            <span>Los tres investigan juntos, cada uno con pistas distintas.</span></button>
        </div>
        <div class="levels">${levels}</div>
        <button class="btn primary" data-act="create">Abrir caso nuevo</button>
      </div>
      <div class="card">
        <h2>Unirse a un caso</h2>
        ${ui.error ? `<div class="alert bad">${ui.error}</div>` : ''}
        <input type="text" id="code" inputmode="text" autocomplete="off" maxlength="8" placeholder="Código, ej. MC-4821">
        <button class="btn" data-act="join">Entrar</button>
      </div>
      <div class="card">
        <h2>Cómo se juega</h2>
        <ol class="steps">
          <li>Alguien crea el caso y comparte el código. Los tres entran al mismo caso, cada cual en su celular.</li>
          <li>Cada jugador elige un papel distinto y lee <b>Mi papel</b> en secreto.</li>
          <li><b>Prohibido mostrar la pantalla</b>, salvo cuando el juego lo pide. Todo se dice en voz alta y en personaje.</li>
          <li>La pestaña <b>Caso</b> trae una guía ronda por ronda.</li>
        </ol>
        <p class="muted small" style="margin-top:10px">Con un solo celular también se puede: pásenlo de mano en mano con «Cambiar papel».</p>
      </div>`;
  }

  function viewRoles() {
    const roles = [0, 1, 2].map((r) => {
      const info = roleInfo(r);
      return `<button class="role" data-act="role" data-v="${r}">
        <span class="big">${info.icon}</span>
        <span><b>${info.name}</b><span>${info.about}</span></span>
      </button>`;
    }).join('');
    return `
      <div class="card center" style="margin-top:14px">
        <p class="muted small">${game.versus ? 'Culpable entre nosotros' : 'En equipo'} · nivel ${game.level}</p>
        <div class="code-badge">${ui.code}</div>
        <button class="btn" data-act="share">Compartir con los otros dos</button>
      </div>
      <h2 style="margin:18px 0 10px">Elegí tu papel</h2>
      <p class="muted small">Pónganse de acuerdo: uno por papel, sin repetir.
        ${game.versus ? 'Recién al entrar cada sospechoso se entera si es inocente o culpable.' : ''}</p>
      ${roles}
      <p class="center"><button class="link" data-act="home">← Volver al inicio</button></p>`;
  }

  function guide() {
    const steps = game.versus ? [
      ['Presentación', 'El detective lee el expediente en voz alta. Cada sospechoso se presenta en personaje, con su acento y su muletilla.'],
      ['Coartadas', 'El detective pregunta a cada sospechoso dónde estaba a la hora del crimen, qué objeto tenía y qué estaba haciendo.'],
      ['Testimonios', 'Por turnos, cada sospechoso cuenta lo que vio, una pista por vez. El detective anota y compara con su evidencia, que no está obligado a revelar.'],
      ['Careo', `Los sospechosos se acusan y se defienden. El detective repregunta y puede usar sus ${ORDERS} órdenes de registro: exige que le muestren en pantalla una pista que le dijeron. Una pista inventada no se puede mostrar.`],
      ['Veredicto', 'El detective acusa a uno. Si acierta, ganan el detective y el inocente. Si se equivoca, el asesino queda libre y gana.']
    ] : [
      ['Presentación', 'Cada investigador se presenta en personaje, con su acento y su muletilla.'],
      ['Declaraciones', 'Por turnos, cada uno lee sus pistas en voz alta. Los demás anotan.'],
      ['Careo', 'Crucen datos y discutan hasta saber quién estuvo dónde y con qué objeto. Hay que dar con el asesino y con el arma.'],
      ['Acusación', 'Voten a la cuenta de tres. Una sola persona carga la acusación. Hay 2 intentos.']
    ];
    return `<details class="card guide" ${save.tries || save.done.length ? '' : 'open'}>
      <summary>Procedimiento</summary>
      <ol class="steps">${steps.map((s) => `<li><b>${s[0]}.</b> ${s[1]}</li>`).join('')}</ol>
    </details>`;
  }

  function fileNo() {
    return ui.code.slice(-4) + '/' + game.file.year;
  }

  function viewCaso() {
    const c = game.cast;
    const f = game.file;
    const chips = (list, fmt) => `<div class="chips">${list.map((x, i) => `<span class="chip">${fmt(x, i)}</span>`).join('')}</div>`;
    const spot = c.places[game.crimePlace];
    let people;
    if (game.versus) {
      const sus = [1, 2].map((r) => {
        const p = person(game.players[r]);
        return `<li><b>${p.icon} ${p.name} ${p.last}</b>, ${p.role}. ${E.cap(p.origin)}.<br><span class="muted">Móvil: ${game.parts[r].motive}</span></li>`;
      }).join('');
      const rest = c.people.filter((p, i) => game.players.indexOf(i) < 0);
      people = `<h3>Sospechosos</h3><ul class="steps">${sus}</ul>
        <h3>También estaban en el lugar</h3>
        ${chips(rest, (p) => `${p.icon} ${p.name} ${p.last}, ${p.role}`)}
        <p class="muted small" style="margin-top:6px">Descartados como autores, pero cada uno ocupó un lugar y tuvo un objeto.</p>`;
    } else {
      people = `<h3>Sospechosos</h3>${chips(c.people, (p) => `${p.icon} ${p.name} ${p.last}, ${p.role}`)}`;
    }
    return `
      <div class="card file">
        <div class="stamp red">Confidencial</div>
        <p class="file-no">Expediente N.º ${fileNo()}</p>
        <p class="file-title">Homicidio</p>
        <table class="facts">
          <tr><th>Fecha</th><td>${f.date}</td></tr>
          <tr><th>Lugar</th><td>${game.scenario.icon} ${game.scenario.name}</td></tr>
          <tr><th>Víctima</th><td>${game.victim.name}</td></tr>
          <tr><th>Hallazgo</th><td>${spot.icon} ${E.cap(spot.name)}</td></tr>
          <tr><th>Hora de muerte</th><td>entre las ${f.from} y las ${f.to}</td></tr>
          <tr><th>Arma</th><td>sin determinar</td></tr>
        </table>
        <p class="scene">${game.scenario.intro}</p>
        <p>${game.victim.bio}</p>
        <p>El cuerpo apareció en <b>${spot.name}</b>. ${game.versus
          ? 'Hay dos sospechosos, y uno de los dos pasó allí la hora del crimen.'
          : 'Quien pasó allí la hora del crimen es el asesino, y el objeto que tenía es el arma.'}</p>
      </div>
      ${guide()}
      <div class="card">
        <h3 style="margin-top:0">Hechos comprobados</h3>
        <ul class="steps">
          <li>Entre las ${f.from} y las ${f.to}, cada persona estuvo en un lugar distinto y no se movió de ahí.</li>
          <li>Cada persona tuvo en su poder un objeto distinto. Uno de ellos es el arma.</li>
          <li>${game.versus ? 'El inocente no miente sobre dónde estuvo, qué tenía ni qué vio. El asesino puede mentir en todo.' : 'Todas las pistas son verdaderas.'}</li>
        </ul>
        ${people}
        <h3>Lugares</h3>
        ${chips(c.places, (x) => `${x.icon} ${E.cap(x.name)}`)}
        <h3>Objetos secuestrados</h3>
        ${chips(c.objects, (o) => `${o.icon} ${E.cap(o.name)}`)}
      </div>`;
  }

  function listNames(names) {
    return names.length > 1 ? names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1] : names[0];
  }

  // Mini guion: frases para arrancar cada ronda, armadas con los datos del caso.
  // "say" son líneas para decir tal cual; "tip" son consejos que no se leen en voz alta.
  function script() {
    const part = game.parts[ui.role];
    const crime = placeName(game.crimePlace);
    const victim = game.victim.name;
    const f = game.file;

    if (!game.versus) {
      return [
        { title: '1. Presentarte', say: [
          `${part.persona.name}. Me mandaron porque este caso no lo quiere nadie.`,
          `${part.persona.tic} A ${victim} no le llegó la muerte por casualidad.`,
          'No vine a hacer amigos. Vine a cerrar un expediente.'
        ] },
        { title: '2. Declarar lo tuyo', say: [
          'Esto es lo que encontré. Anoten, que no lo repito.',
          'De esto estoy seguro. Lo demás son suposiciones.',
          '¿Alguien tiene algo que contradiga lo que acabo de decir?'
        ] },
        { title: '3. Cruzar datos', say: [
          'Eso no encaja con lo mío. Repetilo despacio.',
          'Si esa persona estuvo ahí, entonces no pudo estar acá. ¿Estamos de acuerdo?',
          'Recapitulemos. ¿Qué sabemos con certeza y qué estamos suponiendo?',
          'Nos falta un dato. ¿Quién tiene algo sobre esa persona?',
          'Descartemos primero a quienes seguro no fueron.'
        ], tip: 'Cada vez que confirman algo, relean las pistas: una que antes no servía ahora puede cerrar otra casilla.' },
        { title: '4. Acusar', say: [
          'A la cuenta de tres, cada uno dice un nombre.',
          'Antes de acusar: ¿alguien tiene una sola duda? Hablen ahora.',
          `El asesino de ${victim} es…`
        ] }
      ];
    }

    if (ui.role === 0) {
      const a = person(game.players[1]).name;
      const b = person(game.players[2]).name;
      const known = [];
      game.clues[0].forEach((c) => [c.x, c.x2].forEach((x) => {
        if (x !== undefined && known.indexOf(person(x).name) < 0) known.push(person(x).name);
      }));
      return [
        { title: '1. Abrir el caso', say: [
          `Expediente ${fileNo()}. ${E.cap(f.date)}. ${game.scenario.name}.`,
          `Esta noche mataron a ${victim}. El cuerpo apareció en ${crime}. Murió entre las ${f.from} y las ${f.to}.`,
          `${a}, ${b}: uno de ustedes dos estuvo ahí a esa hora. De acá no se va nadie hasta que yo sepa quién.`,
          'Preséntense. Nombre, de dónde vienen y qué eran de la víctima.'
        ] },
        { title: '2. Romper el hielo', say: [
          `¿Cuándo fue la última vez que viste a ${victim} con vida?`,
          '¿Cómo te llevabas con la víctima? La verdad, no la versión para el velorio.',
          'Describime a la víctima en tres palabras.',
          '¿Quién de los que estaban esta noche ganaba algo con esta muerte?',
          '¿Te sorprendió? No parecés una persona sorprendida.'
        ], tip: 'Estas preguntas no resuelven el caso, pero hacen hablar. Quien inventa suele dar demasiados detalles, o ninguno.' },
        { title: '3. Coartadas (a cada uno, por separado)', say: [
          `Entre las ${f.from} y las ${f.to}, ¿dónde estabas? ¿Entraste en algún otro lugar?`,
          '¿Qué tenías en la mano? ¿De dónde lo sacaste y para qué lo querías?',
          '¿Qué estabas haciendo exactamente? ¿Alguien puede confirmarlo?',
          '¿Escuchaste algo? ¿Un grito, un golpe, pasos?',
          `Hay algo que todos comentan de vos, ${a}: «${game.parts[1].motive}» ¿Qué tenés para decir?`,
          `Y de vos, ${b}, se dice esto: «${game.parts[2].motive}» Explicate.`
        ], tip: 'Anotá el lugar y el objeto que dice cada uno. El asesino miente justo ahí.' },
        { title: '4. Testimonios', say: [
          'Contame qué viste esa noche. De a una cosa por vez.',
          'Repetímelo, palabra por palabra.',
          '¿Eso lo viste vos, o te lo contaron?',
          '¿Quién más andaba por ahí? ¿Con qué?',
          `¿Y vos qué opinás de lo que acaba de decir ${b}?`
        ], tip: `Tu evidencia habla de ${listNames(known)}. Preguntales por esas personas sin avisar que ya sabés algo, y fijate quién dice algo que no encaja. Pedir que repitan una pista más tarde sirve: a quien la inventó le cuesta decirla igual.` },
        { title: '5. Preguntas trampa', say: [
          'Hace un rato dijiste otra cosa. ¿Cuál de las dos es la verdad?',
          'Ya sé más de lo que creés. ¿Querés agregar algo antes de que lo diga yo?',
          'Supongamos que no fuiste vos. Entonces contame cómo lo hizo el otro, paso a paso.',
          '¿A qué hora dijiste que…? No, dejá. ¿Dónde era que estabas?',
          'Si te pido que me muestres eso en pantalla ahora mismo, ¿podés?'
        ], tip: 'Vos sí podés mentir y hacer de cuenta que sabés más. Amenazar con una orden de registro sin gastarla también da información: mirá quién se pone nervioso.' },
        { title: '6. Careo', say: [
          `${a}, mirá a ${b} a los ojos y decile en qué miente.`,
          'Si vos sos inocente, entonces el otro mató. ¿En qué miente, exactamente?',
          '¿Cuál de tus pistas hunde la historia del otro? ¿Por qué?',
          'Los dos no pueden tener razón. Alguien acá es un asesino.',
          'Uso una orden de registro. Mostrame en pantalla la pista que dice que…'
        ], tip: 'Cómo gastar las órdenes: buscá una pista que, de ser verdadera, vuelva imposible lo que dice el otro, y exigí verla. Si te la muestran, ya sabés quién miente. Desconfiá de quien te ofrece mostrar una pista que no pediste: puede querer que gastes la orden.' },
        { title: '7. Veredicto', say: [
          'Ya escuché suficiente. Última oportunidad: ¿alguien quiere cambiar su declaración?',
          `Voy a contar lo que pasó esa noche. Entre las ${f.from} y las ${f.to}, alguien entró en ${crime}…`,
          'Uno de ustedes me mintió desde el principio. Y fue…'
        ], tip: 'Antes de acusar, reconstruí el crimen en voz alta: si alguno te corrige un detalle que no debería conocer, ahí lo tenés.' }
      ];
    }

    const meIdx = game.players[ui.role];
    const me = person(meIdx);
    const otherRole = 3 - ui.role;
    const other = person(game.players[otherRole]).name;
    const otherMotive = game.parts[otherRole].motive;
    const sees = ui.role === 1 ? 'qué objeto había en cada lugar' : 'qué objeto tenía cada persona';
    const intro = { title: '1. Presentarte', say: [
      `${me.name} ${me.last}, ${me.role}.`,
      `${me.tic} Yo no tengo nada que ver con esto.`,
      'No pienso quedarme mucho tiempo, así que pregunte rápido.'
    ], tip: 'Hablá siempre como tu personaje: acento, muletilla y carácter. Usá tu trasfondo si te preguntan por tu vida.' };
    const aboutVictim = { title: '2. Sobre la víctima', say: [
      `${victim} tenía enemigos por todos lados. Yo era de las pocas personas que todavía le hablaban.`,
      'No voy a fingir que lloro. Pero de ahí a matar hay un abismo.',
      'La última vez que hablamos tenía miedo. Miraba la puerta todo el tiempo.',
      'Si quiere saber quién ganaba con esto, mire para otro lado.'
    ] };
    const aboutMotive = { title: '4. Cuando te tiren tu móvil en la cara', say: [
      'Es cierto. ¿Y? Con ese criterio media ciudad tenía motivos.',
      'Justamente por eso habría que ser idiota para hacerlo: soy el primer sospechoso.',
      'Eso es un chisme viejo. Y quien lo repite sabrá por qué lo repite.',
      'Una cosa es tener problemas con alguien y otra muy distinta es matar.'
    ], tip: `Lo que todos saben de vos: «${part.motive}» Tené una respuesta lista.` };

    if (isGuilty()) {
      const st = game.story;
      const realOne = st.hand.find((h) => h.real);
      const npc = game.cast.people.filter((p, i) => game.players.indexOf(i) < 0)[0];
      return [
        intro,
        aboutVictim,
        { title: '3. Tu coartada', say: [
          `A esa hora estaba en ${placeName(st.place)}. No me moví de ahí.`,
          `Tenía ${objName(st.obj)}. ¿Qué tiene de raro? Estaba ahí.`,
          'Lo que hacía… prefiero no decirlo. Está bien, lo digo, pero que no salga de acá.',
          'No escuché nada. Y si hubiera escuchado, habría ido a ver.'
        ], tip: `Contá que estabas ${part.doing}. Confesar algo turbio hace creíble el resto. Decí siempre el mismo lugar y el mismo objeto: no los cambies nunca.` },
        aboutMotive,
        { title: '5. Tu testimonio', say: [
          `Yo vi ${sees}. Y lo que vi no deja bien parado a ${other}.`,
          realOne ? `Te lo puedo probar: ${E.describe(realOne.c, game.cast)} Pedime que te lo muestre.` : 'Lo vi con mis propios ojos.',
          'Anotá bien, porque después no quiero que digan que cambié la versión.'
        ], tip: 'Empezá por las pistas verdaderas y ofrecé mostrarlas: ganás confianza y, con suerte, el detective gasta una orden en vos. La inventada decila al pasar, con las mismas palabras cada vez.' },
        { title: '6. Atacar', say: [
          `Preguntale a ${other} por lo que todos saben: «${otherMotive}»`,
          `¿Por qué ${other} no quiere contar qué estaba haciendo? Yo ya lo dije.`,
          `¿Vas a creerle a ${other}? Mirá cómo transpira.`,
          'Yo colaboré desde el primer minuto. ¿Quién es el que se pone nervioso acá?',
          `${other}, decí la verdad de una vez. Te va a ir mejor.`
        ], tip: 'Tu mejor defensa es que el detective dude del otro. Acusá primero y con detalles.' },
        { title: '7. Si te exigen mostrar la pista inventada', say: [
          `Esa no la vi yo: me la contó ${npc.name}. Pero es cierta.`,
          '¿Otra vez? Ya te mostré una. ¿Y al otro no le pedís nada?',
          'Se me debe haber mezclado con otra cosa. Lo importante es dónde estaba cada uno.',
          'Me estás presionando y así cualquiera se confunde.'
        ], tip: 'Si no hay salida, admití un error chico («me confundí») antes que quedarte en silencio. Y contraatacá enseguida.' },
        { title: '8. Si te acorralan', say: [
          'Muy bien. Supongamos que fui yo. ¿Con qué prueba? Porque hasta ahora solo hay palabras.',
          'Están buscando un culpable fácil. Y yo soy el más fácil.',
          'Si me acusás y te equivocás, el asesino sale caminando por esa puerta. Pensalo.'
        ] }
      ];
    }

    return [
      intro,
      aboutVictim,
      { title: '3. Tu coartada', say: [
        `A esa hora estaba en ${placeName(game.sol[0][meIdx])}. No me moví de ahí.`,
        `Tenía ${objName(game.sol[2][meIdx])}. No lo usé contra nadie.`,
        'Lo que hacía ahí es asunto mío y no tiene nada que ver con el crimen.',
        'No escuché nada. Ojalá hubiera escuchado.'
      ], tip: `Estabas ${part.doing}. Podés esquivarlo o inventar otra cosa, pero ojo: si te ven dudar, vas a parecer culpable. A veces conviene confesarlo y listo.` },
      aboutMotive,
      { title: '5. Tu testimonio', say: [
        `Yo vi ${sees}. Anotá bien, porque todo esto es verdad.`,
        'Lo vi con mis propios ojos. Pedime que te lo muestre cuando quieras.',
        'No tengo nada que esconder: usá una orden conmigo.'
      ], tip: 'Contá tus pistas de a una y siempre con las mismas palabras. Todas las tuyas se pueden mostrar en pantalla: esa es tu ventaja.' },
      { title: '6. Atacar', say: [
        `${other} miente. Preguntale otra vez dónde estuvo y con qué objeto.`,
        `Pedile a ${other} que te muestre en pantalla lo que acaba de decir. A ver si puede.`,
        `Lo que dice ${other} no puede ser, porque yo vi otra cosa.`,
        `Y no nos olvidemos de lo que todos saben: «${otherMotive}»`,
        `${other}, estás hablando con alguien que sabe que fuiste vos.`
      ], tip: `Vos sabés que ${other} es culpable, así que algo de lo que dice es falso. Escuchá su coartada y buscá cuál de tus pistas la contradice: esa es la que tenés que lograr que el detective verifique.` },
      { title: '7. Si no te creen', say: [
        'Estoy diciendo la verdad y me tratan como a un criminal. ¿Así funciona esto?',
        'Usá la orden conmigo. Ahora. Elegí la pista que quieras.',
        'Mientras me interrogás a mí, quien lo hizo se está riendo.'
      ] },
      { title: '8. Antes del veredicto', say: [
        'Repasá: ¿quién te mostró todo lo que le pediste y quién puso excusas?',
        `Yo dije lo mismo de principio a fin. ¿${other} también?`,
        'Si te equivocás, un asesino queda libre y yo voy preso. Pensalo bien.'
      ] }
    ];
  }

  function viewScript() {
    const blocks = script().map((b) => `
      <h3>${b.title}</h3>
      ${b.say.map((line) => `<p class="say">«${line}»</p>`).join('')}
      ${b.tip ? `<p class="tip">💡 ${b.tip}</p>` : ''}`).join('');
    return `<details class="card guide script">
      <summary>Tu guion</summary>
      <p class="muted small">Frases para arrancar cada ronda. Usalas tal cual o como punto de partida, con la voz y el acento de tu personaje.</p>
      ${blocks}
    </details>`;
  }

  function viewPapel() {
    const part = game.parts[ui.role];
    const info = roleInfo(ui.role);
    const suspect = game.versus && ui.role > 0;
    const me = suspect ? game.players[ui.role] : null;
    const who = suspect ? person(me) : part.persona;
    const title = suspect ? `${who.icon} ${who.name} ${who.last}` : `${info.icon} ${who.name}`;
    const job = suspect ? who.role : (game.versus ? 'detective a cargo' : 'especialista en ' + info.deck.toLowerCase());
    let secret = '';
    if (suspect) {
      if (isGuilty()) {
        const st = game.story;
        secret = `<div class="card verdict bad">
          <div class="stamp red">Culpable</div>
          <h2>Fuiste vos</h2>
          <p>Mataste a ${game.victim.name}. A la hora del crimen estabas en <b>${placeName(game.crimePlace)}</b> y tenías <b>${objName(game.tool)}</b>.</p>
          <h3>Tu coartada sugerida</h3>
          <p>Decí que estuviste en <b>${placeName(st.place)}</b>, que tenías <b>${objName(st.obj)}</b> y que estabas ${part.doing}.</p>
          <p class="muted small">Podés mentir en todo e inventar lo que quieras, pero sostené la historia: si te contradecís, te hundís. En <b>Pistas</b> está qué decir y qué podés probar. Tu mejor defensa es que el detective sospeche del otro.</p>
        </div>`;
      } else {
        secret = `<div class="card verdict good">
          <div class="stamp green">Inocente</div>
          <h2>No fuiste vos</h2>
          <p>A la hora del crimen estabas en <b>${placeName(game.sol[0][me])}</b> y tenías <b>${objName(game.sol[2][me])}</b>. Estabas ${part.doing}.</p>
          <p class="muted small">No podés mentir sobre el lugar, el objeto ni lo que viste. Lo que estabas haciendo te compromete: podés esquivar la pregunta o inventar otra cosa. El otro sospechoso es el asesino y va a mentir: convencé al detective.</p>
        </div>`;
      }
      secret += `<div class="card"><h3 style="margin-top:0">Tu móvil, según todos</h3><p>${part.motive}</p></div>`;
    } else if (game.versus) {
      const left = ORDERS - save.orders;
      secret = `<div class="card">
        <h3 style="margin-top:0">Tu trabajo</h3>
        <p>Uno de los dos sospechosos mató a ${game.victim.name} y miente. Interrogalos, compará lo que dicen con tu evidencia y acusá a uno. Tenés una sola acusación.</p>
        <h3>Órdenes de registro: ${left} de ${ORDERS}</h3>
        <p class="muted small">Con una orden obligás a un sospechoso a mostrarte en pantalla una pista que te dijo. Si la muestra, esa pista es verdadera. Si no puede, la inventó.</p>
        <button class="btn" data-act="order" ${left ? '' : 'disabled'}>Usar una orden</button>
      </div>`;
    }
    return `
      <div class="card persona">
        <p class="file-no">Ficha personal</p>
        <h2>${title}</h2>
        <table class="facts">
          <tr><th>Papel</th><td>${E.cap(job)}</td></tr>
          <tr><th>Origen</th><td>${E.cap(who.origin)}</td></tr>
          <tr><th>Muletilla</th><td>«${who.tic}»</td></tr>
        </table>
        <h3>Cómo hablar</h3>
        <p>${who.accent}</p>
        <h3>Carácter</h3>
        <p>${who.style}</p>
        <h3>Trasfondo</h3>
        <p>${who.bg}</p>
      </div>
      ${secret}
      ${viewScript()}
      <div class="card">
        <h3 style="margin-top:0">Misión secreta</h3>
        <p>${part.mission}</p>
        <p class="muted small">No tiene que ver con el caso: es para actuar. Al final contá si la cumpliste.</p>
        <button class="btn ${save.mission ? 'primary' : ''}" data-act="mission">${save.mission ? '✓ Misión cumplida' : 'Marcar como cumplida'}</button>
      </div>`;
  }

  function clueCard(text, i, opts) {
    const done = save.done.indexOf(i) >= 0;
    return `<div class="clue ${done ? 'done' : ''} ${opts.fake ? 'fake' : ''}">
      <span class="num">${i + 1}</span>
      <div class="body">
        <button class="text" data-act="done" data-v="${i}">${text}</button>
        ${opts.tag ? `<span class="tag ${opts.fake ? 'bad' : 'good'}">${opts.tag}</span>` : ''}
        ${opts.proof ? `<button class="mini" data-act="proof" data-v="${i}">Mostrar como prueba</button>` : ''}
      </div>
    </div>`;
  }

  // Las pistas que este jugador tiene para decir: en modo culpable, el culpable ve su historia alterna.
  function myHand() {
    if (isGuilty()) return game.story.hand.map((h) => ({ c: h.c, real: h.real }));
    return game.clues[ui.role].map((c) => ({ c, real: true }));
  }

  function viewPistas() {
    const info = roleInfo(ui.role);
    const suspect = game.versus && ui.role > 0;
    const hand = myHand();
    const cards = hand.map((h, i) => clueCard(E.describe(h.c, game.cast), i, {
      proof: suspect && h.real,
      fake: !h.real,
      tag: isGuilty() ? (h.real ? 'Verdadera: la podés mostrar' : 'Inventada: no la podés mostrar') : ''
    })).join('');
    let intro;
    let extra = '';
    if (isGuilty()) {
      intro = 'Esto es lo que te conviene contar. Las verdaderas sostienen tu coartada; la inventada la completa. Si el detective te exige mostrar la inventada, buscá una excusa.';
      const real = game.clues[ui.role].filter((c) => !hand.some((h) => h.c === c));
      if (real.length) {
        extra = `<h3>Lo que viste de verdad y mejor callar</h3>
          ${real.map((c) => `<div class="clue hidden-truth"><div class="body"><span class="text">${E.describe(c, game.cast)}</span></div></div>`).join('')}`;
      }
    } else if (suspect) {
      intro = 'Todo esto es verdad y lo podés probar. Contalo de a una pista. Si el detective usa una orden de registro, tocá «Mostrar como prueba» y enseñale la pantalla.';
    } else if (game.versus) {
      intro = 'Tu evidencia es verdadera y solo vos la ves. Usala para poner a prueba a los sospechosos. No estás obligado a revelarla: si la contás, el culpable puede acomodar su historia.';
    } else {
      intro = 'Solo vos ves estas pistas. Leelas en voz alta cuando haga falta, pero no muestres la pantalla.';
    }
    return `
      <h2>${info.icon} ${info.deck}</h2>
      <p class="muted small">${intro} Tocá el texto de una pista para tacharla.</p>
      ${cards}${extra}`;
  }

  function viewNotas() {
    const c = game.cast;
    const defs = [
      { title: 'Persona · Lugar', rows: c.people, cols: c.places },
      { title: 'Persona · Objeto', rows: c.people, cols: c.objects },
      { title: 'Lugar · Objeto', rows: c.places, cols: c.objects }
    ];
    const grids = defs.map((d, g) => {
      const head = d.cols.map((x) => `<th title="${x.name}">${x.icon}</th>`).join('');
      const body = d.rows.map((row, i) => {
        const cells = d.cols.map((col, j) => {
          const v = save.notes[g][i][j];
          return `<td><button class="cell ${v === 1 ? 'no' : v === 2 ? 'yes' : ''}" data-act="note" data-v="${g},${i},${j}"
            aria-label="${row.name} / ${col.name}">${v === 1 ? '✗' : v === 2 ? '✓' : ''}</button></td>`;
        }).join('');
        return `<tr><th class="side">${E.cap(row.name)} ${row.icon}</th>${cells}</tr>`;
      }).join('');
      return `<h3>${d.title}</h3><div class="grid-wrap"><table class="grid"><tr><th></th>${head}</tr>${body}</table></div>`;
    }).join('');
    return `
      <p class="muted small">Tu cuaderno privado. Tocá una casilla: ✗ descartado, ✓ confirmado, otra vez para borrar.</p>
      ${grids}
      <p class="center"><button class="link" data-act="clear">Borrar notas</button></p>`;
  }

  function viewSolution() {
    const c = game.cast;
    const rows = c.people.map((p, i) => `
      <tr class="${i === game.culprit ? 'guilty' : ''}">
        <td>${p.icon} ${p.name}</td>
        <td>${c.places[game.sol[0][i]].icon} ${E.cap(c.places[game.sol[0][i]].name)}</td>
        <td>${c.objects[game.sol[2][i]].icon} ${E.cap(c.objects[game.sol[2][i]].name)}</td>
      </tr>`).join('');
    return `<h3>Lo que pasó esa noche</h3><table class="sol">${rows}</table>`;
  }

  function viewResult() {
    const guilty = person(game.culprit);
    const fact = `Quien mató a ${game.victim.name} fue <b>${guilty.name} ${guilty.last}</b>. Causa de muerte: ${game.cast.objects[game.tool].cause}.`;
    let head;
    let extra = '';
    if (game.versus) {
      if (save.tries) {
        head = save.won
          ? `<div class="stamp green">Caso cerrado</div><h2>Asesino atrapado</h2><p>${fact} Ganan el detective y el inocente.</p>`
          : `<div class="stamp red">Error judicial</div><h2>El asesino quedó libre</h2><p>Acusaron a un inocente. ${fact}</p>`;
      } else {
        head = `<div class="stamp red">Desenlace</div><h2>Expediente ${fileNo()}</h2><p>${fact}</p>`;
      }
      const st = game.story;
      const fakes = st.hand.filter((h) => !h.real).map((h) => `<li>${E.describe(h.c, game.cast)}</li>`).join('');
      const keys = st.keys.map((k) => `<li>${E.describe(game.clues[3 - game.guilty][k], game.cast)}</li>`).join('');
      extra = `<h3>La coartada sugerida</h3>
        <p class="left">Decir que estuvo en ${placeName(st.place)} con ${objName(st.obj)}.</p>
        ${fakes ? `<p class="left">Pista inventada:</p><ul class="steps left">${fakes}</ul>` : ''}
        ${keys ? `<p class="left">Lo que la desarmaba, si el detective verificaba esta pista del inocente:</p><ul class="steps left">${keys}</ul>` : ''}`;
    } else if (save.won) {
      const stars = save.tries === 1 ? 3 : 2;
      head = `<div class="stamp green">Caso cerrado</div><div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        <p>${fact} Tiempo: ${fmtTime(elapsed())}.</p>`;
    } else {
      head = `<div class="stamp red">${save.tries ? 'Sin resolver' : 'Desenlace'}</div><h2>${save.tries ? 'El asesino escapó' : 'Expediente ' + fileNo()}</h2><p>${fact}</p>`;
    }
    return `
      <div class="card result">${head}${extra}${viewSolution()}</div>
      <div class="card">
        <h3 style="margin-top:0">Misiones secretas</h3>
        <p class="muted small">Cada uno lee la suya en voz alta y cuenta si la cumplió. Los otros dos deciden si vale.</p>
        <p>${game.parts[ui.role].mission} ${save.mission ? '<b>✓</b>' : ''}</p>
      </div>
      <button class="btn primary" data-act="home">Abrir otro expediente</button>`;
  }

  function viewAcusar() {
    if (finished()) return viewResult();
    const c = game.cast;
    const reveal = `<p class="center"><button class="link" data-act="reveal">Ya acusaron en otro celular: ver el desenlace</button></p>`;
    if (game.versus) {
      if (ui.role !== 0) {
        return `<div class="card">
          <h2>Veredicto</h2>
          <p>Solo el detective acusa. Hasta entonces, defendete en personaje.</p>
        </div>${reveal}`;
      }
      const who = [1, 2].map((r) => {
        const p = person(game.players[r]);
        return `<button class="chip ${ui.pickWho === r ? 'on' : ''}" data-act="who" data-v="${r}">${p.icon} ${p.name}</button>`;
      }).join('');
      return `
        <div class="card">
          <h2>Veredicto</h2>
          <p class="muted small">Tenés <b>una sola</b> acusación. Si señalás al inocente, el asesino queda libre y gana.</p>
          <h3>¿Quién fue?</h3><div class="chips">${who}</div>
        </div>
        <button class="btn primary" data-act="accuse" ${ui.pickWho === null ? 'disabled' : ''}>Acusar</button>`;
    }
    const left = maxTries() - save.tries;
    const who = c.people.map((p, i) => `<button class="chip ${ui.pickWho === i ? 'on' : ''}" data-act="who" data-v="${i}">${p.icon} ${p.name}</button>`).join('');
    const what = c.objects.map((o, i) => `<button class="chip ${ui.pickWhat === i ? 'on' : ''}" data-act="what" data-v="${i}">${o.icon} ${E.cap(o.name)}</button>`).join('');
    return `
      ${ui.flash ? `<div class="alert bad">${ui.flash}</div>` : ''}
      <div class="card">
        <h2>Acusación</h2>
        <p class="muted small">Decidan entre los tres antes de acusar. ${left === 1 ? 'Queda <b>1</b> intento.' : `Quedan <b>${left}</b> intentos.`}
        Carga la acusación una sola persona.</p>
        <h3>¿Quién fue?</h3><div class="chips">${who}</div>
        <h3>¿Con qué arma?</h3><div class="chips">${what}</div>
      </div>
      <button class="btn primary" data-act="accuse" ${ui.pickWho === null || ui.pickWhat === null ? 'disabled' : ''}>Acusar</button>
      ${reveal}`;
  }

  function viewProof() {
    const info = roleInfo(ui.role);
    return `<div class="overlay" data-act="closeProof">
      <div class="proof">
        <div class="stamp green">Prueba auténtica</div>
        <p class="text">${ui.proof}</p>
        <p class="muted small">Caso ${ui.code} · declaración de ${info.name}</p>
        <button class="btn" data-act="closeProof">Cerrar</button>
      </div>
    </div>`;
  }

  function viewGame() {
    const info = roleInfo(ui.role);
    const tabs = [['caso', 'Caso'], ['papel', 'Mi papel'], ['pistas', 'Pistas'], ['notas', 'Notas'], ['acusar', game.versus ? 'Veredicto' : 'Acusar']]
      .map(([id, label]) => `<button class="tab ${ui.tab === id ? 'on' : ''}" data-act="tab" data-v="${id}">${label}</button>`).join('');
    const body = { caso: viewCaso, papel: viewPapel, pistas: viewPistas, notas: viewNotas, acusar: viewAcusar }[ui.tab]();
    return `
      <div class="topbar">
        <div><div class="who">${info.icon} ${info.name}</div>
          <div class="meta">Caso ${ui.code} · ⏱ <span id="clock">${fmtTime(elapsed())}</span></div></div>
        <button class="link" data-act="switch">Cambiar papel</button>
      </div>
      <div class="tabs">${tabs}</div>
      ${body}
      ${ui.proof ? viewProof() : ''}`;
  }

  function render() {
    app.innerHTML = { home: viewHome, roles: viewRoles, game: viewGame }[ui.screen]();
  }

  // --- acciones ---
  const actions = {
    level: (v) => { ui.level = v; render(); },
    mode: (v) => { ui.versus = !!v; render(); },
    create: () => openCase(E.newCode(ui.level, ui.versus)),
    join: () => openCase(document.getElementById('code').value),
    home: () => {
      ui.screen = 'home';
      ui.error = null;
      history.replaceState(null, '', location.pathname);
      render();
    },
    share: () => {
      const text = 'Sumate a mi caso de Tres Sabuesos. Código: ' + ui.code;
      if (navigator.share) {
        navigator.share({ title: 'Tres Sabuesos', text: text, url: shareUrl() }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl()).then(() => toast('Enlace copiado'), () => toast('Código: ' + ui.code));
      } else {
        toast('Código: ' + ui.code);
      }
    },
    role: (v) => enterRole(Number(v)),
    switch: () => { ui.screen = 'roles'; render(); },
    tab: (v) => { ui.tab = v; ui.flash = null; render(); window.scrollTo(0, 0); },
    done: (v) => {
      const i = Number(v);
      const at = save.done.indexOf(i);
      if (at >= 0) save.done.splice(at, 1); else save.done.push(i);
      persist();
      render();
    },
    proof: (v) => { ui.proof = E.describe(myHand()[Number(v)].c, game.cast); render(); },
    closeProof: () => { ui.proof = null; render(); },
    order: () => {
      if (save.orders >= ORDERS || !confirm('¿Usar una orden de registro? Decile al sospechoso qué pista querés ver.')) return;
      save.orders++;
      persist();
      render();
    },
    mission: () => { save.mission = !save.mission; persist(); render(); },
    note: (v) => {
      const [g, i, j] = v.split(',').map(Number);
      save.notes[g][i][j] = (save.notes[g][i][j] + 1) % 3;
      persist();
      render();
    },
    clear: () => {
      if (!confirm('¿Borrar todas tus notas?')) return;
      save.notes.forEach((g) => g.forEach((row) => row.fill(0)));
      persist();
      render();
    },
    who: (v) => { ui.pickWho = Number(v); render(); },
    what: (v) => { ui.pickWhat = Number(v); render(); },
    reveal: () => {
      if (!confirm('Esto muestra la solución. ¿Ya se hizo la acusación?')) return;
      save.revealed = true;
      save.end = Date.now();
      persist();
      render();
    },
    accuse: () => {
      if (game.versus) {
        if (!confirm(`¿Acusar a ${person(game.players[ui.pickWho]).name}? No hay vuelta atrás.`)) return;
        save.won = ui.pickWho === game.guilty;
      } else {
        if (!confirm(`¿Acusar a ${person(ui.pickWho).name} con ${objName(ui.pickWhat)}?`)) return;
        save.won = ui.pickWho === game.culprit && ui.pickWhat === game.tool;
      }
      save.tries++;
      if (finished()) save.end = Date.now();
      else ui.flash = 'Esa acusación no es correcta. Revisen las pistas: algo no cierra.';
      ui.pickWho = ui.pickWhat = null;
      persist();
      render();
    }
  };

  app.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (!el || !actions[el.dataset.act]) return;
    // Dentro de la prueba a pantalla completa, solo el fondo y el botón la cierran.
    if (el.classList.contains('overlay') && ev.target !== el) return;
    actions[el.dataset.act](el.dataset.v);
  });

  app.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.id === 'code') actions.join();
  });

  setInterval(() => {
    const clock = document.getElementById('clock');
    if (clock && save) clock.textContent = fmtTime(elapsed());
  }, 1000);

  // --- arranque: enlace compartido o partida anterior ---
  const fromUrl = E.parseCode(new URLSearchParams(location.search).get('caso'));
  if (fromUrl) {
    const last = store('ts2:last');
    openCase(fromUrl);
    if (last && last.code === fromUrl) enterRole(last.role);
  } else {
    render();
  }
})();
