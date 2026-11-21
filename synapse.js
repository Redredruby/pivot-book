  (function () {
    var hero = document.querySelector('.hero'), cv = document.querySelector('.intro-canvas');
    if (!hero || !cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), W, H, cx, cy, M, TF, R;
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var phrases = ['Why do I always do this?', 'I failed again.', 'What’s wrong with me?', 'Why do I feel this way?',
      'Why can’t I just let it go?', 'They must be upset with me.', 'I should have known better.', 'Why can’t I just say it?',
      'I’m not good enough.', 'It’s always my fault.', 'Why does this keep happening?', 'What if they leave?',
      'I’m too much.', 'Why am I like this?'];
    function size() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2; M = Math.min(W, H * 1.4);
      TF = Math.max(72, Math.min(168, 32 + 0.13 * W));
      R = Math.min(W * 0.62, H * 0.56);
    }
    size();
    var seed = 11; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    var items = [];
    for (var k = 0; k < 30; k++) items.push({ p: phrases[k % phrases.length], r: 0.16 + 0.32 * rnd(), a: rnd() * 6.2832,
      s: 0.28 + 0.22 * rnd(), f: 14 + 11 * rnd(), o: 0.45 + 0.5 * rnd(), d: 0.75 + 0.5 * rnd() });
    function cl(u) { return Math.max(0, Math.min(1, u)); }
    function sm(u) { u = cl(u); return u * u * (3 - 2 * u); }
    function easeOutCubic(u) { u = cl(u); return 1 - Math.pow(1 - u, 3); }
    function easeOutBack(u, c1) { u = cl(u); c1 = c1 || 1.3; var c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); }

    /* The bloom: a living form that buds outward from the still point */
    var T = { teal: [120, 178, 206], blue: [98, 142, 200], rose: [230, 162, 184], lav: [198, 172, 226], amber: [238, 190, 124], peach: [255, 214, 196] };
    /* A neural bloom: branches grow outward from the still point like dendrites, with living cells at their tips */
    var segs = [], ends = [[], [], [], [], []], cells = [], cellBySeg = {}, tipChains = [];
    (function build() {
      var s3 = 53; function r3() { s3 = (s3 * 16807) % 2147483647; return s3 / 2147483647; }
      function grow(x, y, ang, len, depth, b, parent) {
        var x1 = x + Math.cos(ang) * len, y1 = y + Math.sin(ang) * len, dur = 200 + len * 1100, idx = segs.length;
        segs.push({ x0: x, y0: y, x1: x1, y1: y1, bd: (r3() - 0.5) * 0.45, b: b, dur: dur, depth: depth, parent: parent });
        ends[depth].push(idx);
        if (depth < 4) {
          var n = depth === 0 ? 2 : (r3() < 0.35 ? 3 : 2);
          for (var q = 0; q < n; q++) {
            var spread = n === 3 ? (q - 1) * 0.55 : (q - 0.5) * 0.8;
            grow(x1, y1, ang + spread + (r3() - 0.5) * 0.35, len * (0.66 + 0.16 * r3()), depth + 1, b + dur * 0.8, idx);
          }
        }
      }
      for (var i = 0; i < 6; i++) grow(0, 0, i * 1.0472 + (r3() - 0.5) * 0.4, 0.25 + 0.04 * r3(), 0, i * 60, -1);
      var tl = ['teal', 'lav', 'rose', 'blue'], c, s, j;
      cells.push({ k: 'floret', x: 0, y: 0, r: 0.17, b: 0, t: 'rose' });
      cells.push({ k: 'floret', x: 0.08, y: -0.06, r: 0.1, b: 350, t: 'peach' });
      cells.push({ k: 'floret', x: -0.08, y: 0.06, r: 0.085, b: 500, t: 'rose' });
      function add(segIdx, kind, rmin, rmax, inner, ti) {
        s = segs[segIdx];
        c = { k: kind, x: s.x1, y: s.y1, r: rmin + (rmax - rmin) * r3(), b: s.b + s.dur, t: tl[ti % 4], inner: inner };
        cellBySeg[segIdx] = cells.length; cells.push(c);
      }
      for (j = 0; j < ends[1].length; j += 2) add(ends[1][j], r3() < 0.4 ? 'pearl' : 'bubble', 0.075, 0.11, r3() < 0.6, j);
      for (j = 1; j < ends[2].length; j += 2) add(ends[2][j], r3() < 0.45 ? 'pearl' : 'bubble', 0.04, 0.06, r3() < 0.25, j + 1);
      for (j = 0; j < ends[4].length; j += 2) add(ends[4][j], 'drop', 0.012, 0.024, false, j);
      for (j = 0; j < ends[4].length; j++) {
        var chain = [], k = ends[4][j];
        while (k >= 0) { chain.unshift(k); k = segs[k].parent; }
        tipChains.push(chain);
      }
      for (j = 0; j < cells.length; j++) { cells[j].ph = r3() * 6.28; cells[j].flash = -1e9; }
    })();
    function rgba(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + Math.max(0, Math.min(1, a)).toFixed(3) + ')'; }
    function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); }
    function hilite(x, y, r, a) {
      var hx = x - r * 0.36, hy = y - r * 0.42, hr = r * 0.34, g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      g.addColorStop(0, 'rgba(255,255,255,' + (0.8 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; circle(hx, hy, hr); ctx.fill();
    }
    function bubble(x, y, r, c, a) {
      var g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.05, x, y, r);
      g.addColorStop(0, rgba(c, 0.07 * a)); g.addColorStop(0.7, rgba(c, 0.16 * a)); g.addColorStop(0.94, rgba(c, 0.48 * a)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; circle(x, y, r); ctx.fill();
      ctx.lineWidth = Math.max(0.8, r * 0.05); ctx.strokeStyle = rgba(T.amber, 0.55 * a); circle(x, y, r * 0.97); ctx.stroke();
      hilite(x, y, r, a);
    }
    function pearl(x, y, r, c, a) {
      var lc = [c[0] + 70, c[1] + 70, c[2] + 70], dc = [c[0] * 0.4, c[1] * 0.4, c[2] * 0.4];
      var g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
      g.addColorStop(0, rgba(lc, 0.95 * a)); g.addColorStop(0.55, rgba(c, 0.88 * a)); g.addColorStop(1, rgba(dc, 0.85 * a));
      ctx.fillStyle = g; circle(x, y, r); ctx.fill();
      ctx.lineWidth = Math.max(0.6, r * 0.04); ctx.strokeStyle = rgba(T.amber, 0.4 * a); circle(x, y, r); ctx.stroke();
      hilite(x, y, r * 0.9, a * 0.9);
    }
    function floret(x, y, r, c, a, time, rings) {
      rings = rings || 6;
      var g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.2);
      g.addColorStop(0, rgba(c, 0.4 * a)); g.addColorStop(0.6, rgba(c, 0.18 * a)); g.addColorStop(1, rgba(c, 0));
      ctx.fillStyle = g; circle(x, y, r * 1.2); ctx.fill();
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(T.amber, 0.4 * a); ctx.lineWidth = Math.max(0.6, r * 0.014);
      for (var f = 0; f < 16; f++) {
        var an = f * 0.3927 + time * 0.00008;
        ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r * 0.06, y + Math.sin(an) * r * 0.06);
        ctx.lineTo(x + Math.cos(an) * r * 0.66, y + Math.sin(an) * r * 0.66); ctx.stroke();
      }
      for (var j = 1; j <= rings; j++) {
        var rr = r * (0.06 + j * 0.86 / rings), n = 5 + j * Math.round(42 / rings), dir = j % 2 ? 1 : -1;
        var rot = dir * time * 0.00016 * (1 + j * 0.1), ds = Math.max(0.6, r * 0.032 * (1.15 - j * 0.5 / rings));
        var col = j % 3 === 0 ? T.amber : (j % 3 === 1 ? [250, 206, 214] : T.peach);
        ctx.fillStyle = rgba(col, (0.85 - j * 0.35 / rings) * a);
        for (var q = 0; q < n; q++) {
          var aq = q * 6.2832 / n + rot + j * 0.3, wob = 1 + 0.05 * Math.sin(aq * 3 + time * 0.002);
          circle(x + Math.cos(aq) * rr * wob, y + Math.sin(aq) * rr * wob, ds); ctx.fill();
        }
      }
      ctx.fillStyle = rgba([255, 240, 210], 0.9 * a); circle(x, y, Math.max(1, r * 0.05)); ctx.fill();
      ctx.restore();
    }
    var rot = 0, brth = 1;
    function sx(ux, uy) { return cx + R * brth * (ux * Math.cos(rot) - uy * Math.sin(rot)); }
    function sy(ux, uy) { return cy + R * brth * (ux * Math.sin(rot) + uy * Math.cos(rot)) * 0.9; }
    function segPt(s, p) {
      var mx = (s.x0 + s.x1) / 2 - (s.y1 - s.y0) * s.bd, my = (s.y0 + s.y1) / 2 + (s.x1 - s.x0) * s.bd;
      var a = (1 - p) * (1 - p), b = 2 * (1 - p) * p, c = p * p;
      return [a * s.x0 + b * mx + c * s.x1, a * s.y0 + b * my + c * s.y1, mx, my];
    }
    function glowDot(x, y, r, a) {
      var g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
      g.addColorStop(0, 'rgba(255,248,226,' + (0.95 * a).toFixed(3) + ')'); g.addColorStop(0.25, 'rgba(255,214,150,' + (0.5 * a).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g; circle(x, y, r * 4); ctx.fill();
    }
    var pulses = [], nextPulse = 0;
    function drawBloom(bt, time, fade) {
      if (bt <= 0) return;
      rot = time * 0.000025; brth = 1 + 0.012 * Math.sin(time * 0.0009);
      var gk = sm(bt / 1800) * fade, i, s, p, pt, c;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4);
      g.addColorStop(0, 'rgba(255,226,180,' + (0.22 * gk).toFixed(3) + ')');
      g.addColorStop(0.5, 'rgba(150,190,205,' + (0.08 * gk).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(150,190,205,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      var fronts = [];
      for (i = 0; i < segs.length; i++) {
        s = segs[i]; p = cl((bt - s.b) / s.dur); if (p <= 0) continue;
        var e = easeOutCubic(p);
        var q0x = s.x0, q0y = s.y0, mid = segPt(s, e), q1x = s.x0 + (mid[2] - s.x0) * e, q1y = s.y0 + (mid[3] - s.y0) * e;
        var w = R * 0.013 * Math.pow(0.72, s.depth);
        ctx.beginPath(); ctx.moveTo(sx(q0x, q0y), sy(q0x, q0y)); ctx.quadraticCurveTo(sx(q1x, q1y), sy(q1x, q1y), sx(mid[0], mid[1]), sy(mid[0], mid[1]));
        ctx.strokeStyle = rgba(T.amber, 0.14 * fade); ctx.lineWidth = Math.max(1.5, w * 3.2); ctx.stroke();
        ctx.strokeStyle = rgba([250, 214, 160], 0.6 * fade); ctx.lineWidth = Math.max(0.6, w); ctx.stroke();
        if (p < 1) fronts.push([sx(mid[0], mid[1]), sy(mid[0], mid[1])]);
      }
      for (i = 0; i < fronts.length; i++) glowDot(fronts[i][0], fronts[i][1], Math.max(1.6, R * 0.006), 0.9 * fade);
      if (bt > 2300 && !still) {
        if (time > nextPulse) { pulses.push({ c: tipChains[(Math.random() * tipChains.length) | 0], t0: time }); nextPulse = time + 140 + Math.random() * 220; }
        for (i = pulses.length - 1; i >= 0; i--) {
          var pu = pulses[i], el = (time - pu.t0) / 170, si = Math.floor(el);
          if (si >= pu.c.length) {
            var ci = cellBySeg[pu.c[pu.c.length - 1]]; if (ci !== undefined) cells[ci].flash = time;
            pulses.splice(i, 1); continue;
          }
          pt = segPt(segs[pu.c[si]], el - si);
          glowDot(sx(pt[0], pt[1]), sy(pt[0], pt[1]), Math.max(1.4, R * 0.0055), 0.85 * fade);
        }
      }
      ctx.restore();
      for (i = cells.length - 1; i >= 0; i--) {
        c = cells[i]; var kk = cl((bt - c.b) / 900); if (kk <= 0) continue;
        var x = sx(c.x, c.y), y = sy(c.x, c.y);
        var r = c.r * R * easeOutBack(kk, 1.1) * (1 + 0.04 * Math.sin(time * 0.0013 + c.ph));
        if (r < 0.5) continue;
        var fl = Math.exp(-(time - c.flash) / 260), a = Math.min(1, kk * 2) * fade, col = T[c.t];
        if (fl > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glowDot(x, y, r * 0.9, fl * fade); ctx.restore(); }
        if (c.k === 'floret') floret(x, y, r, col, a, time, 6);
        else if (c.k === 'pearl' || c.k === 'drop') pearl(x, y, r, col, a * (c.k === 'drop' ? 0.9 : 1));
        else { bubble(x, y, r, col, a); if (c.inner) floret(x, y + r * 0.08, r * 0.46, T.rose, a * 0.9, time, 4); }
      }
    }
    function habit(t, time, a) {
      if (a <= 0) return;
      var rx = M * 0.3, ry = M * 0.18;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = rgba(T.amber, 0.13 * a); ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = rgba(T.amber, 0.3 * a); ctx.lineWidth = 1.2; ctx.stroke();
      for (var k = 0; k < 3; k++) {
        var an = time * 0.0016 + k * 2.0944;
        glowDot(cx + rx * Math.cos(an), cy + ry * Math.sin(an), 2.4, 0.8 * a);
      }
      ctx.restore();
    }
    function wash(w) {
      if (w <= 0) return;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, TF * 3.4);
      g.addColorStop(0, 'rgba(26,32,30,' + (0.6 * w).toFixed(3) + ')'); g.addColorStop(0.6, 'rgba(26,32,30,' + (0.35 * w).toFixed(3) + ')'); g.addColorStop(1, 'rgba(26,32,30,0)');
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1.6, 1); ctx.translate(-cx, -cy);
      ctx.fillStyle = g; ctx.fillRect(cx - TF * 3.4, cy - TF * 3.4, TF * 6.8, TF * 6.8); ctx.restore();
    }
    function pivotXs(font, spacing) {
      ctx.font = font; var ws = [], tot = 0, w = 'PIVOT';
      for (var i = 0; i < 5; i++) { var m = ctx.measureText(w[i]).width; ws.push(m); tot += m; }
      tot += spacing * 4; var x = cx - tot / 2, out = [];
      for (var j = 0; j < 5; j++) { out.push(x + ws[j] / 2); x += ws[j] + spacing; }
      return out;
    }
    function drawLetters(e) {
      var font = '200 ' + TF.toFixed(0) + 'px Spectral, Georgia, serif', xs = pivotXs(font, TF * 0.14), yT = cy - TF * 0.08;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (var i = 0; i < 5; i++) {
        var u = cl((e - i * 180) / 1500); if (u <= 0) continue;
        var k = easeOutBack(u), x = cx + (xs[i] - cx) * k, y = cy + TF * 0.25 + (yT - cy - TF * 0.25) * k, s = 0.06 + 0.94 * Math.min(1, k);
        ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
        ctx.font = font; ctx.shadowColor = 'rgba(255,244,214,' + (0.35 + 0.5 * (1 - u)).toFixed(3) + ')'; ctx.shadowBlur = 24;
        ctx.fillStyle = 'rgba(240,244,240,' + Math.min(1, u * 1.6).toFixed(3) + ')'; ctx.fillText('PIVOT'[i], 0, 0); ctx.restore();
      }
    }
    function dot(rad, blur, a) {
      ctx.save(); ctx.shadowColor = 'rgba(255,244,214,0.95)'; ctx.shadowBlur = blur;
      ctx.fillStyle = 'rgba(255,250,238,' + a + ')'; circle(cx, cy, rad); ctx.fill(); ctx.restore();
    }
    var BL = 600, D = BL + 2700, DIM0 = D - 300, DIM1 = D + 1500, SUBS = D + 2100;
    function bloomFade(t) { return t < DIM0 ? 1 : 1 - 0.45 * sm((t - DIM0) / (DIM1 - DIM0)); }
    function drawStill() { ctx.clearRect(0, 0, W, H); drawBloom(99999, 0, 0.55); wash(1); drawLetters(99999); hero.classList.add('subs'); }
    var visible = true, waiting = false, start = null, last = null;
    var mouse = { x: -1e4, y: -1e4, t: -1e9 }, trail = [], links = [], lastLink = 0;
    function onMove(e) {
      var pt = e.touches ? e.touches[0] : e; if (!pt) return;
      var rc = cv.getBoundingClientRect(), px = pt.clientX - rc.left, py = pt.clientY - rc.top, now = performance.now();
      mouse.x = px; mouse.y = py; mouse.t = now;
      trail.push({ x: px, y: py, t: now }); if (trail.length > 50) trail.shift();
      if (now - lastLink > 110 && start !== null) {
        lastLink = now; var best = -1, bd = 1e9;
        for (var i = 0; i < cells.length; i++) {
          var c = cells[i]; if (now - start - BL < c.b) continue;
          var dx = sx(c.x, c.y) - px, dy = sy(c.x, c.y) - py, d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = i; }
        }
        if (best >= 0 && Math.sqrt(bd) < R * 0.75) { links.push({ c: best, x: px, y: py, t: now, bend: (Math.random() - 0.5) * 0.5 }); cells[best].flash = now; }
      }
    }
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('touchmove', onMove, { passive: true });
    function drawMouse(now) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
      for (var i = 1; i < trail.length; i++) {
        var p = trail[i - 1], q = trail[i], a = Math.exp(-(now - q.t) / 450); if (a < 0.02) continue;
        ctx.strokeStyle = rgba(T.amber, 0.55 * a); ctx.lineWidth = 0.6 + 2.4 * a;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      for (i = links.length - 1; i >= 0; i--) {
        var L = links[i], age = now - L.t; if (age > 1500) { links.splice(i, 1); continue; }
        var c = cells[L.c], x0 = sx(c.x, c.y), y0 = sy(c.x, c.y);
        var mx = (x0 + L.x) / 2 + (L.y - y0) * L.bend, my = (y0 + L.y) / 2 - (L.x - x0) * L.bend;
        var g = easeOutCubic(age / 380), fa = 1 - sm((age - 500) / 1000);
        var ex = (1 - g) * (1 - g) * x0 + 2 * (1 - g) * g * mx + g * g * L.x, ey = (1 - g) * (1 - g) * y0 + 2 * (1 - g) * g * my + g * g * L.y;
        ctx.strokeStyle = rgba([250, 214, 160], 0.6 * fa); ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + (mx - x0) * g, y0 + (my - y0) * g, ex, ey); ctx.stroke();
        var u = cl(age / 650), spx = (1 - u) * (1 - u) * L.x + 2 * (1 - u) * u * mx + u * u * x0, spy = (1 - u) * (1 - u) * L.y + 2 * (1 - u) * u * my + u * u * y0;
        if (u < 1) glowDot(spx, spy, 2.3, 0.95 * fa);
      }
      var ma = Math.exp(-(now - mouse.t) / 1400); if (ma > 0.02) glowDot(mouse.x, mouse.y, 3.2, 0.7 * ma);
      ctx.restore();
    }
    function frame(now) {
      if (!visible) { waiting = true; return; }
      if (start === null) { start = now; last = now; }
      var t = now - start; last = now;
      ctx.clearRect(0, 0, W, H);
      drawBloom(t - BL, now, bloomFade(t));
      drawMouse(now);
      var burst = Math.exp(-Math.pow((t - BL) / 300, 2));
      var da = t < BL + 300 ? Math.min(1, t / 400) : Math.max(0, 1 - (t - BL - 300) / 700);
      if (da > 0) dot(5 + 10 * burst, 20 + 70 * burst, da);
      wash(t > D - 500 ? sm((t - D + 500) / 1600) : 0);
      if (t > D) drawLetters(t - D);
      if (t > SUBS && !hero.classList.contains('subs')) hero.classList.add('subs');
      requestAnimationFrame(frame);
    }
    function run() { if (still) { drawStill(); return; } requestAnimationFrame(frame); }
    window.addEventListener('resize', function () { size(); if (still) drawStill(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (x) { visible = x.isIntersecting; if (visible && waiting) { waiting = false; last = performance.now(); requestAnimationFrame(frame); } });
      }).observe(hero);
    }
    var go = false; function begin() { if (!go) { go = true; run(); } }
    if (document.fonts && document.fonts.load) { Promise.all([document.fonts.load('200 100px Spectral'), document.fonts.load('italic 300 20px Spectral')]).then(begin, begin); }
    setTimeout(begin, 1500);
  })();
