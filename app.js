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
    return { icon: p.icon, name: p.name, about: 'Sospechoso: ' + p.role + '. Puede tocarte ser inocente o culpable.', deck: 'Lo que viste' };
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
        <div class="logo">🔎</div>
        <h1>Tres Sabuesos</h1>
        <p>Misterio, deducción y un poco de teatro para exactamente 3.</p>
      </div>
      <div class="card">
        <h2>Nuevo caso</h2>
        <div class="modes">
          <button class="mode ${ui.versus ? 'on' : ''}" data-act="mode" data-v="1">
            <b>🎭 Culpable entre nosotros</b>
            <span>1 detective y 2 sospechosos. Uno miente para salvarse.</span></button>
          <button class="mode ${ui.versus ? '' : 'on'}" data-act="mode" data-v="">
            <b>🤝 En equipo</b>
            <span>Los tres investigan juntos, cada uno con pistas distintas.</span></button>
        </div>
        <div class="levels">${levels}</div>
        <button class="btn primary" data-act="create">Crear caso</button>
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
      ['Presentación', 'El detective cuenta el caso en voz alta. Cada sospechoso se presenta en personaje, con su forma de hablar.'],
      ['Coartadas', 'El detective pregunta a cada sospechoso dónde pasó la noche, qué objeto llevaba y qué estaba haciendo.'],
      ['Testimonios', 'Por turnos, cada sospechoso cuenta lo que vio, una pista por vez. El detective anota y compara con su evidencia, que no está obligado a revelar.'],
      ['Careo', `Los sospechosos se acusan y se defienden. El detective repregunta y puede usar sus ${ORDERS} órdenes de registro: exige que le muestren en pantalla una pista que le dijeron. Una pista inventada no se puede mostrar.`],
      ['Veredicto', 'El detective acusa a uno. Si acierta, ganan el detective y el inocente. Si se equivoca, el culpable se salva y gana.']
    ] : [
      ['Presentación', 'Cada investigador se presenta en personaje, con su forma de hablar.'],
      ['Declaraciones', 'Por turnos, cada uno lee sus pistas en voz alta. Los demás anotan.'],
      ['Careo', 'Crucen datos y discutan hasta saber quién estuvo dónde y con qué objeto.'],
      ['Acusación', 'Voten a la cuenta de tres. Una sola persona carga la acusación. Hay 2 intentos.']
    ];
    return `<details class="card guide" ${save.tries || save.done.length ? '' : 'open'}>
      <summary>Guía de la partida</summary>
      <ol class="steps">${steps.map((s) => `<li><b>${s[0]}.</b> ${s[1]}</li>`).join('')}</ol>
    </details>`;
  }

  function viewCaso() {
    const c = game.cast;
    const chips = (list, fmt) => `<div class="chips">${list.map((x, i) => `<span class="chip">${fmt(x, i)}</span>`).join('')}</div>`;
    const spot = `<b>${c.places[game.crimePlace].name}</b> ${c.places[game.crimePlace].icon}`;
    let scene;
    let people;
    if (game.versus) {
      const sus = [1, 2].map((r) => {
        const p = person(game.players[r]);
        return `<li><b>${p.icon} ${p.name}</b>, ${p.role}. <span class="muted">${game.parts[r].motive}</span></li>`;
      }).join('');
      const rest = c.people.filter((p, i) => game.players.indexOf(i) < 0);
      scene = `Anoche desapareció <b>${game.loot}</b>. Estaba en ${spot}. Hay dos sospechosos, y uno de los dos pasó la noche allí.`;
      people = `<h3>Sospechosos</h3><ul class="steps">${sus}</ul>
        <h3>También estaban en la casa</h3>
        ${chips(rest, (p) => `${p.icon} ${p.name}, ${p.role}`)}
        <p class="muted small" style="margin-top:6px">No están bajo sospecha, pero ocuparon un lugar y llevaban un objeto.</p>`;
    } else {
      scene = `Anoche desapareció <b>${game.loot}</b>. Estaba en ${spot}. Quien pasó la noche allí es culpable.`;
      people = `<h3>Sospechosos</h3>${chips(c.people, (p) => `${p.icon} ${p.name}, ${p.role}`)}`;
    }
    return `
      ${guide()}
      <div class="card">
        <p class="scene">${scene}</p>
        <h3>Lo que saben todos</h3>
        <ul class="steps">
          <li>Cada persona pasó la noche en un lugar distinto.</li>
          <li>Cada persona llevaba un objeto distinto.</li>
          <li>${game.versus ? 'El inocente no miente sobre dónde estuvo, qué llevaba ni qué vio. El culpable puede mentir en todo.' : 'Todas las pistas son verdaderas.'}</li>
        </ul>
        ${people}
        <h3>Lugares</h3>
        ${chips(c.places, (p) => `${p.icon} ${E.cap(p.name)}`)}
        <h3>Objetos</h3>
        ${chips(c.objects, (o) => `${o.icon} ${E.cap(o.name)}`)}
      </div>`;
  }

  function viewPapel() {
    const part = game.parts[ui.role];
    const info = roleInfo(ui.role);
    const suspect = game.versus && ui.role > 0;
    let who;
    let secret = '';
    if (suspect) {
      const me = game.players[ui.role];
      const p = person(me);
      who = `<h2>${p.icon} Sos ${p.name}, ${p.role}</h2>`;
      if (isGuilty()) {
        const s = game.story;
        secret = `<div class="card verdict bad">
          <h2>Sos culpable</h2>
          <p>Te llevaste ${game.loot}. Pasaste la noche en <b>${placeName(game.crimePlace)}</b> y llevabas <b>${objName(game.tool)}</b>.</p>
          <h3>Tu coartada sugerida</h3>
          <p>Decí que estuviste en <b>${placeName(s.place)}</b>, que llevabas <b>${objName(s.obj)}</b> y que estabas ${part.doing}.</p>
          <p class="muted small">Podés mentir en todo e inventar lo que quieras, pero sostené la historia: si te contradecís, te hundís. En <b>Pistas</b> está qué decir y qué podés probar. Tu mejor defensa es que el detective sospeche del otro.</p>
        </div>`;
      } else {
        secret = `<div class="card verdict good">
          <h2>Sos inocente</h2>
          <p>Pasaste la noche en <b>${placeName(game.sol[0][me])}</b> y llevabas <b>${objName(game.sol[2][me])}</b>. Estabas ${part.doing}.</p>
          <p class="muted small">No podés mentir sobre el lugar, el objeto ni lo que viste. Lo que estabas haciendo te da vergüenza: podés esquivar la pregunta o inventar otra cosa. El otro sospechoso es culpable y va a mentir: convencé al detective.</p>
        </div>`;
      }
      secret += `<div class="card"><h3 style="margin-top:0">Lo que todos saben de vos</h3><p>${part.motive}</p></div>`;
    } else {
      who = `<h2>${info.icon} ${part.persona.name}, ${info.name.toLowerCase()}</h2>`;
      if (game.versus) {
        const left = ORDERS - save.orders;
        secret = `<div class="card">
          <h3 style="margin-top:0">Tu trabajo</h3>
          <p>Uno de los dos sospechosos miente. Interrogalos, compará lo que dicen con tu evidencia y acusá a uno. Tenés una sola acusación.</p>
          <h3>Órdenes de registro: ${left} de ${ORDERS}</h3>
          <p class="muted small">Con una orden obligás a un sospechoso a mostrarte en pantalla una pista que te dijo. Si la muestra, esa pista es verdadera. Si no puede, la inventó.</p>
          <button class="btn" data-act="order" ${left ? '' : 'disabled'}>Usar una orden</button>
        </div>`;
      }
    }
    return `
      <div class="card persona">
        ${who}
        <p>${part.persona.style}</p>
        <p class="tic">Tu muletilla: «${part.persona.tic}»</p>
      </div>
      ${secret}
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
    const fact = `Fue <b>${guilty.name}</b>, con ${objName(game.tool)}.`;
    let head;
    let extra = '';
    if (game.versus) {
      if (save.tries) {
        head = save.won
          ? `<div class="stars">⚖️</div><h2>¡Culpable atrapado!</h2><p>${fact} Ganan el detective y el inocente.</p>`
          : `<div class="stars">🏃</div><h2>El culpable se salvó</h2><p>Acusaron a un inocente. ${fact}</p>`;
      } else {
        head = `<div class="stars">📂</div><h2>Desenlace</h2><p>${fact}</p>`;
      }
      const s = game.story;
      const fakes = s.hand.filter((h) => !h.real).map((h) => `<li>${E.describe(h.c, game.cast)}</li>`).join('');
      const keys = s.keys.map((k) => `<li>${E.describe(game.clues[3 - game.guilty][k], game.cast)}</li>`).join('');
      extra = `<h3>La coartada sugerida</h3>
        <p class="left">Decir que estuvo en ${placeName(s.place)} con ${objName(s.obj)}.</p>
        ${fakes ? `<p class="left">Pista inventada:</p><ul class="steps left">${fakes}</ul>` : ''}
        ${keys ? `<p class="left">Lo que la desarmaba, si el detective verificaba esta pista del inocente:</p><ul class="steps left">${keys}</ul>` : ''}`;
    } else if (save.won) {
      const stars = save.tries === 1 ? 3 : 2;
      head = `<div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2>¡Caso resuelto!</h2>
        <p>${fact} Tiempo: ${fmtTime(elapsed())}.</p>`;
    } else {
      head = `<div class="stars">🕸️</div><h2>${save.tries ? 'El culpable escapó' : 'Desenlace'}</h2><p>${fact}</p>`;
    }
    return `
      <div class="card result">${head}${extra}${viewSolution()}</div>
      <div class="card">
        <h3 style="margin-top:0">Misiones secretas</h3>
        <p class="muted small">Cada uno lee la suya en voz alta y cuenta si la cumplió. Los otros dos deciden si vale.</p>
        <p>${game.parts[ui.role].mission} ${save.mission ? '<b>✓</b>' : ''}</p>
      </div>
      <button class="btn primary" data-act="home">Jugar otro caso</button>`;
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
          <p class="muted small">Tenés <b>una sola</b> acusación. Si señalás al inocente, el culpable se salva y gana.</p>
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
        <h3>¿Qué objeto llevaba?</h3><div class="chips">${what}</div>
      </div>
      <button class="btn primary" data-act="accuse" ${ui.pickWho === null || ui.pickWhat === null ? 'disabled' : ''}>Acusar</button>
      ${reveal}`;
  }

  function viewProof() {
    const info = roleInfo(ui.role);
    return `<div class="overlay" data-act="closeProof">
      <div class="proof">
        <div class="stamp">Prueba auténtica</div>
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
