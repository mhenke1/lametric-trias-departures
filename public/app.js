(() => {
  const form = document.getElementById('form');
  const input = document.getElementById('station');
  const list = document.getElementById('list');
  const status = document.getElementById('status');

  async function load(id) {
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
