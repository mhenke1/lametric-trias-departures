(() => {
  const form = document.getElementById('form');
  const input = document.getElementById('station');
  const list = document.getElementById('list');
  const status = document.getElementById('status');

  const trmnl = document.getElementById('trmnl');

  async function loadPreview(id) {
    const token = new URLSearchParams(location.search).get('token');
    const url = '/api/trmnl/' + encodeURIComponent(id) + (token ? '?token=' + encodeURIComponent(token) : '');
    trmnl.replaceChildren();
    try {
      const data = await (await fetch(url)).json();
      const rows = document.createElement('div');
      for (const l of (data.lines || []).slice(0, 3)) {
        const row = document.createElement('div');
        row.className = 'row';
        const ln = document.createElement('span');
        ln.className = 'ln';
        ln.textContent = l.line;
        const tm = document.createElement('span');
        tm.className = 'tm';
        tm.textContent = l.times.join('  ');
        row.append(ln, tm);
        rows.append(row);
      }
      if (!rows.children.length) {
        const p = document.createElement('p');
        p.className = 'empty';
        p.textContent = data.error || 'Keine Abfahrten';
        trmnl.append(p);
        return;
      }
      const bar = document.createElement('div');
      bar.className = 'bar';
      const t = document.createElement('span');
      t.textContent = 'Abfahrten';
      const st = document.createElement('span');
      st.textContent = data.station;
      bar.append(t, st);
      trmnl.append(rows, bar);
    } catch (e) {
      trmnl.textContent = 'Fehler beim Laden';
    }
  }

  async function load(id) {
    loadPreview(id);
    status.textContent = 'Lade …';
    list.replaceChildren();
    try {
      const res = await fetch('/api/departures/' + encodeURIComponent(id));
      const data = await res.json();
      status.textContent = '';
      for (const f of data.frames || []) {
        const li = document.createElement('li');
        const text = document.createElement('span');
        text.className = 'text';
        text.textContent = f.text;
        li.append(text);
        list.append(li);
      }
    } catch (e) {
      status.textContent = 'Fehler beim Laden';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = input.value.trim();
    if (!id) return;
    history.replaceState(null, '', '?station=' + encodeURIComponent(id));
    load(id);
  });

  const initial = new URLSearchParams(location.search).get('station');
  if (initial) {
    input.value = initial;
    load(initial);
  }
})();
