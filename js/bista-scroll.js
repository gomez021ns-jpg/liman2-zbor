(() => {
  const main = document.querySelector('main:has(> .hero)');
  const footer = document.querySelector('body > .podnozje');
  const hero = main && main.querySelector('.hero');
  const header = document.querySelector('body > .header');
  if (!main || !footer || !hero || !header) return;
  let frame = 0;
  function update() {
    frame = 0;
    const overlap = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
    main.style.setProperty('--footer-vidljiv', `${overlap}px`);
    const boundary = Math.max(header.getBoundingClientRect().bottom, hero.getBoundingClientRect().bottom);
    const available = Math.max(0, window.innerHeight - overlap - boundary);
    main.style.setProperty('--bista-prostor', `${available}px`);
    const maxSize = window.innerWidth <= 760 ? Math.min(window.innerWidth * .95, 650) : Math.min(window.innerWidth * .68, 1050);
    const offset = window.innerWidth > 1200 ? Math.min((window.innerWidth - 1200) / 2 + 90, maxSize * .43) * Math.min(1, available / maxSize) : 0;
    main.style.setProperty('--bista-desno', `${offset}px`);
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  const observer = new ResizeObserver(schedule);
  observer.observe(footer);
  observer.observe(hero);
  observer.observe(header);
  update();
})();
