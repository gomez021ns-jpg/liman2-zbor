(async function () {
  const status = document.getElementById('potvrda-status');
  const token = location.hash.slice(1);
  history.replaceState(null, '', location.pathname);
  if (!token) { status.textContent = 'Link za potvrdu nije potpun.'; return; }
  try {
    const response = await fetch('/api/support/verify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({token}) });
    const data = await response.json();
    status.textContent = data.message || data.error || 'Potvrda nije uspela.';
  } catch (_) { status.textContent = 'Potvrda trenutno nije dostupna. Otvori link ponovo kasnije.'; }
})();
