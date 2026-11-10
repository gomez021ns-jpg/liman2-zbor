(() => {
  const hero = document.querySelector('.hero');
  const grid = document.querySelector('.hero-mozaik');
  if (!hero || !grid) return;
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let columns = 0, size = 0, tiles = [], active = new Set(), frame = 0, point = null;

  function build() {
    const width = hero.clientWidth;
    if (!width) return;
    columns = Math.max(1, Math.floor(width / 20));
    size = width / columns;
    const rows = Math.ceil(hero.clientHeight / size);
    grid.style.setProperty('--mozaik-kolone', columns);
    const fragment = document.createDocumentFragment();
    tiles = Array.from({ length: columns * rows }, () => {
      const tile = document.createElement('span');
      const tone = Math.random();
      const opacity = tone < .25 ? -(Math.random() * .055) : .05 + Math.random() * .25;
      tile.style.setProperty('--mirno', opacity < 0
        ? `rgb(255 255 255 / ${(-opacity).toFixed(3)})`
        : `rgb(0 0 0 / ${opacity.toFixed(3)})`);
      fragment.appendChild(tile);
      return tile;
    });
    grid.replaceChildren(fragment);
    active.clear();
    if (point && hover.matches) draw();
  }

  function draw() {
    frame = 0;
    if (!point) return;
    const rect = hero.getBoundingClientRect();
    const x = point.clientX - rect.left, y = point.clientY - rect.top;
    const radius = 100;
    const cx = Math.floor(x / size), cy = Math.floor(y / size);
    const reach = Math.ceil(radius / size);
    const next = new Set();
    for (let row = Math.max(0, cy - reach); row <= cy + reach; row++) {
      for (let col = Math.max(0, cx - reach); col <= Math.min(columns - 1, cx + reach); col++) {
        const tile = tiles[row * columns + col];
        if (!tile) continue;
        const distance = Math.hypot((col + .5) * size - x, (row + .5) * size - y);
        if (distance >= radius) continue;
        tile.style.setProperty('--sjaj', (.16 + .48 * (1 - distance / radius)).toFixed(3));
        tile.classList.add('mozaik-sjaj');
        next.add(tile);
      }
    }
    active.forEach(tile => { if (!next.has(tile)) tile.classList.remove('mozaik-sjaj'); });
    active = next;
  }
  hero.addEventListener('pointermove', event => {
    if (!hover.matches || event.pointerType === 'touch') return;
    point = { clientX: event.clientX, clientY: event.clientY };
    if (!frame) frame = requestAnimationFrame(draw);
  });
  hero.addEventListener('pointerleave', () => {
    point = null;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    active.forEach(tile => tile.classList.remove('mozaik-sjaj'));
    active.clear();
  });
  new ResizeObserver(build).observe(hero);
  build();
})();
