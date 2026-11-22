/* Main page opening: the compass, dusk to dawn.
   The needle rests at five o'clock, sweeps slowly clockwise to twelve (true north), the centre of the pin turns white,
   then it drifts gently around north. PIVOT and the subtitle follow. */
(function () {
  var hero = document.querySelector('.hero'), cv = document.querySelector('.intro-canvas');
  if (!hero || !cv || !cv.getContext) return;
  var ctx = cv.getContext('2d'), W, H, TF, cx, cyC, R, pivY;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SP = 2.2, SW0 = 1.1, SW1 = 7.7, DS = 2.6, DD = 5.5;
  hero.style.background = '#0B1533';
  var sub = hero.querySelector('.i-sub'), by = hero.querySelector('.i-by'), wh = hero.querySelector('.i-when');
  if (sub) sub.style.color = '#1A2A5C';
  if (by) by.style.color = '#3A4670';
  if (wh) wh.style.color = '#A86E14';
  function sm(u) { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); }
  function eio(u) { u = Math.max(0, Math.min(1, u)); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; }
  function mixc(a, b, k) { return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ')'; }
  function mixa(a, b, k, al) { return 'rgba(' + Math.round(a[0] + (b[0] - a[0]) * k) + ',' + Math.round(a[1] + (b[1] - a[1]) * k) + ',' + Math.round(a[2] + (b[2] - a[2]) * k) + ',' + al + ')'; }
  function size() {
    var d = Math.min(2, window.devicePixelRatio || 1);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * d; cv.height = H * d; cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(d, 0, 0, d, 0, 0);
    TF = Math.max(72, Math.min(168, 32 + 0.13 * W));
    pivY = H / 2; cx = W / 2;
    var avail = pivY - TF * 0.55 - 16;
    R = Math.min(Math.min(W, H) * 0.15, avail / 2.4);
    cyC = 8 + avail / 2;
  }
  function light(t) { return sm((t - DS) / DD); }
  function drawPivot(a, rise) {
    if (a <= 0) return;
    var font = '300 ' + TF.toFixed(0) + 'px Spectral, Georgia, serif', sp = TF * 0.14, w = 'PIVOT', ws = [], tot = 0, i;
    ctx.font = font;
    for (i = 0; i < 5; i++) { ws.push(ctx.measureText(w[i]).width); tot += ws[i]; }
    tot += sp * 4;
    var x = cx - tot / 2, y = pivY + rise;
    var g = ctx.createLinearGradient(x, 0, x + tot, 0);
    g.addColorStop(0, '#7A4E0E'); g.addColorStop(0.35, '#C8901F'); g.addColorStop(0.5, '#E9B949'); g.addColorStop(0.7, '#A86E14'); g.addColorStop(1, '#7A4E0E');
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = g; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    for (i = 0; i < 5; i++) { ctx.fillText(w[i], x, y); x += ws[i] + sp; }
    ctx.restore();
  }
  function draw(t) {
    var k = light(t), i, a;
    var bg = ctx.createRadialGradient(cx, H * 0.4, 0, cx, H * 0.4, Math.max(W, H) * 0.75);
    bg.addColorStop(0, mixc([22, 40, 92], [255, 250, 238], k)); bg.addColorStop(1, mixc([11, 21, 51], [236, 225, 200], k));
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    var ink = mixc([200, 210, 240], [26, 42, 92], k), cy = cyC;
    ctx.strokeStyle = '#C8901F'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R * 0.9, 0, 6.2832); ctx.stroke();
    for (i = 0; i < 72; i++) { a = i / 72 * 6.2832; var l = i % 18 === 0 ? 0.14 : (i % 6 === 0 ? 0.08 : 0.04); ctx.strokeStyle = i % 18 === 0 ? '#C8901F' : ink; ctx.lineWidth = i % 18 === 0 ? 2 : 1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9); ctx.lineTo(cx + Math.cos(a) * R * (0.9 - l), cy + Math.sin(a) * R * (0.9 - l)); ctx.stroke(); }
    for (i = 0; i < 8; i++) { a = i * Math.PI / 4 - Math.PI / 2; var L = i % 2 ? R * 0.42 : R * 0.7, w = R * 0.07; ctx.fillStyle = i % 2 ? mixa([110, 150, 240], [47, 91, 208], k, 0.3) : 'rgba(200,144,31,0.3)'; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * L, cy + Math.sin(a) * L); ctx.lineTo(cx + Math.cos(a + 1.5708) * w, cy + Math.sin(a + 1.5708) * w); ctx.lineTo(cx - Math.cos(a + 1.5708) * w, cy - Math.sin(a + 1.5708) * w); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#A86E14'; ctx.font = '300 ' + Math.round(R * 0.16) + 'px Spectral, Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('N', cx, cy - R * 1.13);
    var ang = Math.PI / 3 + (1.5 * Math.PI - Math.PI / 3) * eio((t - SW0) / (SW1 - SW0));
    if (t > SW1) { var tr = (t - SW1) / SP; ang += sm(tr / 2) * (0.07 * Math.sin(tr * 0.8) + 0.035 * Math.sin(tr * 0.33 + 1)); }
    var c = Math.cos(ang), s = Math.sin(ang), NL = R * 0.78, nw = R * 0.075, px = -s, py = c;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,20,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
    var g = ctx.createLinearGradient(cx, cy, cx + c * NL, cy + s * NL); g.addColorStop(0, '#A86E14'); g.addColorStop(1, '#F2CF72');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx + c * NL, cy + s * NL); ctx.lineTo(cx + px * nw, cy + py * nw); ctx.lineTo(cx - px * nw, cy - py * nw); ctx.closePath(); ctx.fill();
    g = ctx.createLinearGradient(cx, cy, cx - c * NL, cy - s * NL); g.addColorStop(0, '#1B3C9E'); g.addColorStop(1, '#4A78E8');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - c * NL, cy - s * NL); ctx.lineTo(cx + px * nw, cy + py * nw); ctx.lineTo(cx - px * nw, cy - py * nw); ctx.closePath(); ctx.fill();
    ctx.restore();
    var on = sm((t - SW1 + 0.2) / 0.6);
    ctx.fillStyle = '#C8901F'; ctx.beginPath(); ctx.arc(cx, cy, R * 0.045, 0, 6.2832); ctx.fill();
    ctx.fillStyle = mixc([238, 214, 160], [255, 255, 255], on); ctx.beginPath(); ctx.arc(cx, cy, R * 0.02, 0, 6.2832); ctx.fill();
    var pa = sm((t - SW1 - 0.3) / (1.6 * SP));
    drawPivot(pa, 12 * (1 - pa));
    if (t > SW1 + 0.3 + 0.5 * SP && !hero.classList.contains('subs')) hero.classList.add('subs');
  }
  var start = null;
  function frame(now) {
    if (start === null) start = now;
    draw((now - start) / 1000 * SP);
    requestAnimationFrame(frame);
  }
  function run() { size(); if (still) { draw(SW1 + 30); hero.classList.add('subs'); return; } requestAnimationFrame(frame); }
  window.addEventListener('resize', function () { size(); if (still) draw(SW1 + 30); });
  var go = false; function begin() { if (!go) { go = true; run(); } }
  if (document.fonts && document.fonts.load) { document.fonts.load('300 100px Spectral').then(begin, begin); }
  setTimeout(begin, 1500);
})();
