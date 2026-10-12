(function () {
  'use strict';

  const E = window.Engine;
  const app = document.getElementById('app');
  const MAX_TRIES = 2;

  const ui = { screen: 'home', level: 'F', code: null, role: null, tab: 'caso', pickWho: null, pickWhat: null, flash: null, error: null };
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
    return 'ts:' + ui.code + ':' + ui.role;
  }

  function loadSave() {
    const n = game.n;
    const blank = () => Array.from({ length: n }, () => new Array(n).fill(0));
    save = store(saveKey()) || { start: Date.now(), end: null, tries: 0, won: false, notes: [blank(), blank(), blank()], done: [] };
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

  function finished() {
    return save.won || save.tries >= MAX_TRIES;
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

  function openCase(raw) {
    const code = E.parseCode(raw);
    if (!code) {
      ui.error = 'Ese código no es válido. Tiene una letra y 4 números, por ejemplo M-4821.';
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
    ui.pickWho = ui.pickWhat = ui.flash = null;
    loadSave();
    store('ts:last', { code: ui.code, role: role });
    render();
  }

  // --- pantallas ---
  function viewHome() {
    const levels = Object.keys(E.LEVELS).map((k) => {
      const lv = E.LEVELS[k];
      return `<button class="level ${ui.level === k ? 'on' : ''}" data-act="level" data-v="${k}">
        <b>${lv.label}</b><span>${lv.n} sospechosos</span></button>`;
    }).join('');
    return `
      <div class="hero">
        <div class="logo">🔎</div>
        <h1>Tres Sabuesos</h1>
        <p>Un misterio cooperativo para exactamente 3 personas.</p>
      </div>
      <div class="card">
        <h2>Nuevo caso</h2>
        <div class="levels">${levels}</div>
        <button class="btn primary" data-act="create">Crear caso</button>
      </div>
      <div class="card">
        <h2>Unirse a un caso</h2>
        ${ui.error ? `<div class="alert bad">${ui.error}</div>` : ''}
        <input type="text" id="code" inputmode="text" autocomplete="off" maxlength="6" placeholder="Código, ej. M-4821">
        <button class="btn" data-act="join">Entrar</button>
      </div>
      <div class="card">
        <h2>Cómo se juega</h2>
        <ol class="steps">
          <li>Una crea el caso y comparte el código. Las tres entran al mismo caso, cada una en su celular.</li>
          <li>Cada una elige un rol distinto: <b>Detective</b>, <b>Forense</b> o <b>Periodista</b>. Cada rol tiene pistas que las otras no ven.</li>
          <li><b>Prohibido mostrar la pantalla.</b> Las pistas solo se pueden decir en voz alta.</li>
          <li>Entre las tres deduzcan quién fue y qué objeto usó. Tienen ${MAX_TRIES} acusaciones.</li>
        </ol>
        <p class="muted small" style="margin-top:10px">¿Un solo celular? También sirve: pásenlo de mano en mano y cada una entra con su rol.</p>
      </div>`;
  }

  function viewRoles() {
    const roles = E.ROLES.map((r) => `
      <button class="role" data-act="role" data-v="${r.id}">
        <span class="big">${r.icon}</span>
        <span><b>${r.name}</b><span>${r.about}</span></span>
      </button>`).join('');
    return `
      <div class="card center" style="margin-top:14px">
        <p class="muted small">Caso · nivel ${game.level}</p>
        <div class="code-badge">${ui.code}</div>
        <button class="btn" data-act="share">Compartir con las otras dos</button>
      </div>
      <h2 style="margin:18px 0 10px">Elegí tu rol</h2>
      <p class="muted small">Pónganse de acuerdo: una por rol, sin repetir.</p>
      ${roles}
      <p class="center"><button class="link" data-act="home">← Volver al inicio</button></p>`;
  }

  function viewCaso() {
    const c = game.cast;
    const chips = (list, fmt) => `<div class="chips">${list.map((x) => `<span class="chip">${fmt(x)}</span>`).join('')}</div>`;
    return `
      <div class="card">
        <p class="scene">Anoche desapareció <b>${game.loot}</b>. Estaba en <b>${c.places[game.crimePlace].name}</b>
        ${c.places[game.crimePlace].icon}. Quien pasó la noche allí es culpable.</p>
        <h3>Lo que saben las tres</h3>
        <ul class="steps">
          <li>Cada sospechoso pasó la noche en un lugar distinto.</li>
          <li>Cada sospechoso llevaba un objeto distinto.</li>
          <li>Todas las pistas son verdaderas.</li>
        </ul>
        <h3>Sospechosos</h3>
        ${chips(c.people, (p) => `${p.icon} ${p.name}, ${p.role}`)}
        <h3>Lugares</h3>
        ${chips(c.places, (p) => `${p.icon} ${E.cap(p.name)}`)}
        <h3>Objetos</h3>
        ${chips(c.objects, (o) => `${o.icon} ${E.cap(o.name)}`)}
      </div>
      <p class="muted small center">Misión: descubrir <b>quién</b> fue y <b>qué objeto</b> llevaba.</p>`;
  }

  function viewPistas() {
    const r = E.ROLES[ui.role];
    const clues = game.clues[ui.role].map((c, i) => `
      <button class="clue ${save.done.indexOf(i) >= 0 ? 'done' : ''}" data-act="done" data-v="${i}" style="width:100%;border:0;text-align:left">
        <span class="num">${i + 1}</span><span>${E.describe(c, game.cast)}</span>
      </button>`).join('');
    return `
      <h2>${r.icon} ${r.deck}</h2>
      <p class="muted small">Solo vos ves estas pistas. Leelas en voz alta cuando haga falta, pero no muestres la pantalla. Tocá una para tacharla.</p>
      ${clues}`;
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
        <td>${c.places[game.solution.place[i]].icon} ${E.cap(c.places[game.solution.place[i]].name)}</td>
        <td>${c.objects[game.solution.obj[i]].icon} ${E.cap(c.objects[game.solution.obj[i]].name)}</td>
      </tr>`).join('');
    return `<h3>Lo que pasó esa noche</h3><table class="sol">${rows}</table>`;
  }

  function viewAcusar() {
    const c = game.cast;
    if (finished()) {
      const stars = save.won ? (save.tries === 1 ? 3 : 2) : 0;
      const guilty = c.people[game.culprit];
      return `
        <div class="card result">
          ${save.won
            ? `<div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2>¡Caso resuelto!</h2>
               <p>Fue <b>${guilty.name}</b>, con ${c.objects[game.tool].name}. Tiempo: ${fmtTime(elapsed())}.</p>`
            : `<div class="stars">🕸️</div><h2>El culpable escapó</h2>
               <p>Era <b>${guilty.name}</b>, con ${c.objects[game.tool].name}.</p>`}
          ${viewSolution()}
        </div>
        <button class="btn primary" data-act="home">Jugar otro caso</button>`;
    }
    const left = MAX_TRIES - save.tries;
    const who = c.people.map((p, i) => `<button class="chip ${ui.pickWho === i ? 'on' : ''}" data-act="who" data-v="${i}">${p.icon} ${p.name}</button>`).join('');
    const what = c.objects.map((o, i) => `<button class="chip ${ui.pickWhat === i ? 'on' : ''}" data-act="what" data-v="${i}">${o.icon} ${E.cap(o.name)}</button>`).join('');
    return `
      ${ui.flash ? `<div class="alert bad">${ui.flash}</div>` : ''}
      <div class="card">
        <h2>Acusación</h2>
        <p class="muted small">Decidan entre las tres antes de acusar. ${left === 1 ? 'Queda <b>1</b> intento.' : `Quedan <b>${left}</b> intentos.`}
        Si juegan en varios celulares, acusa una sola.</p>
        <h3>¿Quién fue?</h3><div class="chips">${who}</div>
        <h3>¿Qué objeto llevaba?</h3><div class="chips">${what}</div>
      </div>
      <button class="btn primary" data-act="accuse" ${ui.pickWho === null || ui.pickWhat === null ? 'disabled' : ''}>Acusar</button>`;
  }

  function viewGame() {
    const r = E.ROLES[ui.role];
    const tabs = [['caso', 'Caso'], ['pistas', 'Mis pistas'], ['notas', 'Notas'], ['acusar', 'Acusar']]
      .map(([id, label]) => `<button class="tab ${ui.tab === id ? 'on' : ''}" data-act="tab" data-v="${id}">${label}</button>`).join('');
    const body = { caso: viewCaso, pistas: viewPistas, notas: viewNotas, acusar: viewAcusar }[ui.tab]();
    return `
      <div class="topbar">
        <div><div class="who">${r.icon} ${r.name}</div>
          <div class="meta">Caso ${ui.code} · ⏱ <span id="clock">${fmtTime(elapsed())}</span></div></div>
        <button class="link" data-act="switch">Cambiar rol</button>
      </div>
      <div class="tabs">${tabs}</div>
      ${body}`;
  }

  function render() {
    app.innerHTML = { home: viewHome, roles: viewRoles, game: viewGame }[ui.screen]();
  }

  // --- acciones ---
  const actions = {
    level: (v) => { ui.level = v; render(); },
    create: () => openCase(E.newCode(ui.level)),
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
    accuse: () => {
      const p = game.cast.people[ui.pickWho].name;
      const o = game.cast.objects[ui.pickWhat].name;
      if (!confirm(`¿Acusar a ${p} con ${o}?`)) return;
      save.tries++;
      save.won = ui.pickWho === game.culprit && ui.pickWhat === game.tool;
      if (finished()) save.end = Date.now();
      else ui.flash = 'Esa acusación no es correcta. Revisen las pistas: algo no cierra.';
      ui.pickWho = ui.pickWhat = null;
      persist();
      render();
    }
  };

  app.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (el && actions[el.dataset.act]) actions[el.dataset.act](el.dataset.v);
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
    const last = store('ts:last');
    openCase(fromUrl);
    if (last && last.code === fromUrl) enterRole(last.role);
  } else {
    render();
  }
})();
