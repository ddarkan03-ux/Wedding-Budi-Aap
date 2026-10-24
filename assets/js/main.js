/* Logika undangan. Semua data diambil dari config.js - tidak perlu diedit. */
(function () {
  'use strict';
  var C = window.CONFIG || {}, P = C.pengaturan || {}, B = C.bagian || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var e = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  };
  var PH = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9E2D6"/><stop offset="1" stop-color="#B9B09F"/></linearGradient></defs><rect width="600" height="800" fill="url(#g)"/></svg>');
  window.__PH = PH;
  var img = function (src, alt, extra) {
    return '<img src="' + e(src || PH) + '" alt="' + e(alt) + '" ' + (extra || '') + ' onerror="this.onerror=null;this.src=window.__PH">';
  };

  /* ---------- Tanggal (zona WIB) ---------- */
  var valid = function (iso) { return !isNaN(new Date(iso)); };
  var D = function (iso, o) {
    if (!valid(iso)) return '';
    o.timeZone = 'Asia/Jakarta';
    return new Date(iso).toLocaleDateString('id-ID', o);
  };
  var T = function (iso) {
    if (!valid(iso)) return '';
    return new Date(iso).toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':') + ' WIB';
  };

  /* ---------- Potongan HTML ---------- */
  var LEAF = '<svg class="leaf %c" viewBox="0 0 40 60" aria-hidden="true"><path d="M20 58V8M20 40C8 36 6 24 8 16c10 2 14 12 12 24zM20 30c10-3 14-12 12-20-10 2-14 10-12 20z" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>';
  var leaf = function (c) { return LEAF.replace('%c', c); };
  var A = function (t, d) { return 'data-anim="' + t + '"' + (d ? ' data-delay="' + d + '"' : ''); };

  function mempelai(o, i) {
    return '<div class="mp' + (i % 2 ? ' alt' : '') + '" ' + A(i % 2 ? 'fade-right' : 'fade-left') + '>' +
      '<div class="ph"><div class="ph-in">' + img(o.foto, o.nama, 'loading="lazy"') + '</div></div>' +
      '<h3>' + e(o.nama) + '</h3><p class="sm">' + e(o.anak) + '</p><p class="sm">' + e(o.ortu) + '</p></div>';
  }

  function acara(a, judul, delay) {
    a = a || {};
    var maps = a.tampilkanMaps === true && /^https:\/\//.test(a.linkMaps || '');
    return '<div class="ev" ' + A('fade-up', delay) + '>' +
      '<div class="ev-d"><small>' + e(D(a.tanggalISO, { weekday: 'long' }).toUpperCase()) + '</small><b>' + e(D(a.tanggalISO, { day: 'numeric' })) + '</b>' +
      '<span>' + e(D(a.tanggalISO, { month: 'short' }).toUpperCase()) + '</span><small>' + e(D(a.tanggalISO, { year: 'numeric' })) + '</small></div>' +
      '<div class="ev-i"><h3>' + e(judul) + '</h3><span class="t">' + e(T(a.tanggalISO)) + '</span>' +
      '<p><strong>' + e(a.tempat) + '</strong><br>' + e(a.alamat) + '</p>' +
      (maps ? '<a class="btn" href="' + e(a.linkMaps) + '" target="_blank" rel="noopener">Lihat Maps</a>' : '') + '</div></div>';
  }

  function bank(r) {
    return '<div class="bank"><div><b>' + e(r.bank) + '</b><span>' + e(r.nomor) + '</span><small>a.n. ' + e(r.atasNama) + '</small></div>' +
      '<button type="button" class="btn ghost" data-copy="' + e(r.nomor) + '">Salin</button></div>';
  }

  /* ---------- Susun halaman ---------- */
  var h = '', pr = C.pria || {}, wn = C.wanita || {};
  var fotos = (C.fotoCover && C.fotoCover.length) ? C.fotoCover : [''];

  h += '<section class="cover" id="cover"><div class="slides">' +
    fotos.map(function (f, i) { return img(f, 'Foto cover', i === 0 ? 'class="on"' : ''); }).join('') +
    '</div><div class="veil"></div><div class="parts"></div>' +
    '<div class="wave"><svg viewBox="0 0 2400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M0 23C300 0 600 46 1200 23C1500 0 1800 46 2400 23V46H0Z" fill="#F6F3EE"/></svg></div>' +
    '<div class="cover-body"><small ' + A('fade-up') + '>THE WEDDING OF</small>' +
    '<h1 ' + A('fade-up', 150) + '>' + e(pr.panggilan) + ' &amp; ' + e(wn.panggilan) + '</h1>' +
    '<p class="sm" ' + A('fade-up', 300) + '>' + e(D((C.akad || {}).tanggalISO, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })) + '</p>' +
    '<p class="guest" ' + A('fade-up', 450) + '>Kepada Yth. Bapak/Ibu/Saudara/i<b id="guest"></b></p>' +
    '<div class="row" ' + A('fade-up', 600) + '><button type="button" class="btn" id="buka">Buka Undangan</button><a class="btn ghost" id="sdate" href="#" target="_blank" rel="noopener" hidden>Save The Date</a></div></div></section>';

  if (B.hitungMundur !== false) {
    h += '<section class="sec taupe" id="hitung">' + leaf('a') + '<h2 ' + A('fade-up') + '>Our Special Day</h2>' +
      '<p class="sm" ' + A('fade-up', 100) + '>' + e(C.pembuka) + '</p>' +
      '<div class="cd" id="cd" ' + A('zoom-in', 200) + '>' + ['Hari', 'Jam', 'Menit', 'Detik'].map(function (l) { return '<div><b>00</b><small>' + l + '</small></div>'; }).join('') + '</div></section>';
  }

  var urut = (C.urutanMempelai || ['wanita', 'pria']).filter(function (k) { return k === 'pria' || k === 'wanita'; });
  h += '<section class="sec">' + leaf('b') + urut.map(function (k, i) {
    return mempelai(k === 'pria' ? pr : wn, i) + (i < urut.length - 1 ? '<div class="amp" ' + A('fade-up') + '>&amp;</div>' : '');
  }).join('') + '</section>';

  if (B.loveStory !== false && C.loveStory && C.loveStory.length) {
    h += '<section class="sec sand"><h2 ' + A('fade-up') + '>Love Story</h2>' +
      img(C.loveStoryFoto, 'Foto Love Story', 'class="story" loading="lazy" ' + A('blur-in')) +
      '<div class="glass">' + C.loveStory.map(function (s, i) {
        return '<div class="ls" ' + A('fade-up', i * 120) + '><h3>' + e(s.judul) + '</h3><p>' + e(s.teks) + '</p></div>';
      }).join('') + '</div></section>';
  }

  h += '<section class="sec">' + leaf('a') + '<h2 ' + A('fade-up') + '>Rangkaian Acara</h2>' +
    acara(C.akad, 'Akad Nikah', 0) + acara(C.resepsi, 'Resepsi', 150) + '</section>';

  if (B.liveStreaming !== false && (C.liveStreaming || {}).link) {
    h += '<section class="sec taupe"><div class="glass" ' + A('fade-up') + '><h2>Live Streaming</h2><p>' + e(C.liveStreaming.teks) + '</p>' +
      '<a class="btn" href="' + e(C.liveStreaming.link) + '" target="_blank" rel="noopener">Klik di sini</a></div></section>';
  }

  if (B.galeri !== false && C.galeri && C.galeri.length) {
    h += '<section class="sec"><h2 ' + A('fade-up') + '>Galeri Foto</h2><div class="gal" id="gal">' +
      C.galeri.map(function (g, i) { return img(g, 'Galeri ' + (i + 1), 'loading="lazy" data-i="' + i + '" ' + A('zoom-in', (i % 2) * 100)); }).join('') + '</div></section>';
  }

  var rek = (C.rekening || []).filter(function (r) { return r && r.aktif === true; });
  var kh = C.kirimHadiah || {};
  if (B.weddingGift !== false && (rek.length || kh.aktif === true)) {
    h += '<section class="sec sand"><div class="glass" ' + A('fade-up') + '><h2>Wedding Gift</h2><p>' + e(C.teksGift) + '</p>' +
      '<button type="button" class="btn" id="giftBtn" aria-expanded="false">Klik di sini</button>' +
      '<div class="acc" id="acc"><div>' + rek.map(bank).join('') +
      (kh.aktif === true ? '<div class="bank"><div><b>Kirim Hadiah</b><span>' + e(kh.penerima) + ' - ' + e(kh.hp) + '</span><small>' + e(kh.alamat) + '</small></div></div>' : '') +
      '</div></div></div></section>';
  }

  if (B.rsvp !== false) {
    h += '<section class="sec taupe"><h2 ' + A('fade-up') + '>Ucapan &amp; Doa</h2>' +
      '<form id="rsvp" ' + A('fade-up', 100) + '><input name="nama" placeholder="Nama" maxlength="50" required>' +
      '<textarea name="ucapan" placeholder="Ucapan" maxlength="300" required></textarea>' +
      '<select name="hadir" required><option value="">Konfirmasi Kehadiran</option><option value="Hadir">Hadir</option><option value="Tidak Hadir">Tidak Hadir</option><option value="Masih Ragu">Masih Ragu</option></select>' +
      '<button class="btn" type="submit">Kirim</button>' +
      (C.rsvpKeWhatsApp ? '<button class="btn ghost" type="button" id="kirimWA" style="color:#fff;border-color:#fff">Kirim juga ke WhatsApp</button>' : '') +
      '</form><div id="ucapan"></div></section>';
  }

  var tm = C.turutMengundang || {};
  var tmList = (tm.daftar || []).filter(function (n) { return String(n || '').trim(); });
  if (B.turutMengundang !== false && tmList.length) {
    h += '<section class="sec sand"><h2 ' + A('fade-up') + '>' + e(tm.judul || 'Turut Mengundang') + '</h2>' +
      (tm.teks ? '<p class="sm" ' + A('fade-up', 100) + '>' + e(tm.teks) + '</p>' : '') +
      '<div class="tm">' + tmList.map(function (n, i) { return '<p ' + A('fade-up', 150 + i * 100) + '>' + e(n) + '</p>'; }).join('') + '</div></section>';
  }

  h += '<section class="sec closing">' + leaf('a') + '<p class="sm" ' + A('fade-up') + '>' + e(C.penutup) + '</p>' +
    img(C.fotoCover && C.fotoCover[0], 'Foto penutup', 'loading="lazy" ' + A('blur-in')) +
    '<h2 ' + A('fade-up') + '>Terima kasih</h2><h3 ' + A('fade-up', 100) + '>' + e(pr.panggilan) + ' &amp; ' + e(wn.panggilan) + '</h3>' +
    '<p class="sm" ' + A('fade-up', 200) + '>' + e(C.salamKeluarga) + '</p></section>';

  h += '<button type="button" class="music" id="music" aria-label="Musik">&#9834;</button>';
  h += '<div class="lb" id="lb"><button class="x" aria-label="Tutup">&times;</button><button class="p" aria-label="Sebelumnya">&#8249;</button><img alt=""><button class="n" aria-label="Berikutnya">&#8250;</button></div>';
  h += '<div class="toast" id="toast" role="status"></div>';

  var app = $('#app');
  app.innerHTML = h;
  document.title = C.judulHalaman || document.title;

  /* ---------- Util ---------- */
  var tt;
  function toast(m) {
    var t = $('#toast'); t.textContent = m; t.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  function salin(txt) {
    var done = function () { toast('Berhasil disalin'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done, fallback);
    } else fallback();
    function fallback() {
      var x = document.createElement('textarea'); x.value = txt; x.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(x); x.select();
      try { document.execCommand('copy'); } catch (_) { }
      x.remove(); done();
    }
  }

  /* ---------- Nama tamu (?to=Nama) ---------- */
  var g = ''; try { g = new URLSearchParams(location.search).get('to') || ''; } catch (_) { }
  $('#guest').textContent = g.replace(/\s+/g, ' ').trim().slice(0, 60) || 'Tamu Undangan';

  /* ---------- Animasi ---------- */
  var speed = { lambat: '1.4s', normal: '.9s', cepat: '.5s' }[P.kecepatan] || '.9s';
  document.documentElement.style.setProperty('--d', speed);
  var els = [].slice.call(document.querySelectorAll('[data-anim]'));
  var noAnim = P.animasi === false || !('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (noAnim) document.documentElement.classList.add('no-anim');
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: .12 });
    els.forEach(function (el) { el.style.transitionDelay = (el.getAttribute('data-delay') || 0) + 'ms'; io.observe(el); });
    // Pengaman: bila ada elemen di layar yang belum muncul (mis. efek clip-path), tampilkan paksa
    setTimeout(function () {
      els.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (!el.classList.contains('is-visible') && r.bottom > 0 && r.top < window.innerHeight) el.classList.add('is-visible');
      });
    }, 2500);
  }

  /* ---------- Cover: slideshow & partikel ---------- */
  var sl = [].slice.call(document.querySelectorAll('.slides img'));
  if (P.slideshowCover !== false && sl.length > 1) {
    var cur = 0;
    setInterval(function () {
      if (document.hidden) return;
      sl[cur].classList.remove('on'); cur = (cur + 1) % sl.length; sl[cur].classList.add('on');
    }, 5500);
  }
  if (P.partikelCover !== false && !noAnim) {
    var pw = $('.parts');
    for (var i = 0; i < 16; i++) {
      var s = document.createElement('i'), z = 3 + Math.random() * 5;
      s.style.cssText = 'left:' + Math.random() * 100 + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (9 + Math.random() * 8) + 's;animation-delay:-' + Math.random() * 10 + 's';
      pw.appendChild(s);
    }
  }

  /* ---------- Save The Date ---------- */
  var ak = C.akad || {};
  if (valid(ak.tanggalISO)) {
    var st = new Date(ak.tanggalISO), en = new Date(+st + 2 * 36e5);
    var f = function (d) { return d.toISOString().replace(/[-:]|\.\d{3}/g, ''); };
    var sd = $('#sdate');
    sd.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(C.judulHalaman || 'Pernikahan') + '&dates=' + f(st) + '/' + f(en) + '&location=' + encodeURIComponent(ak.tempat || '');
    sd.hidden = false;
  }

  /* ---------- Musik ---------- */
  var mb = $('#music'), audio = null;
  if (C.fileMusik) {
    try {
      audio = new Audio(C.fileMusik); audio.loop = true;
      audio.addEventListener('error', function () { audio = null; mb.classList.remove('show'); mb.hidden = true; });
    } catch (_) { audio = null; }
  }
  function play() {
    if (!audio) return;
    try { var p = audio.play(); if (p && p.then) p.then(function () { mb.classList.add('on'); }, function () { }); } catch (_) { }
  }
  mb.addEventListener('click', function () {
    if (!audio) return;
    if (audio.paused) play(); else { audio.pause(); mb.classList.remove('on'); }
  });

  /* ---------- Buka undangan ---------- */
  $('#buka').addEventListener('click', function () {
    document.body.classList.remove('locked');
    if (audio) mb.classList.add('show');
    play();
    var nx = $('#cover').nextElementSibling;
    if (nx) nx.scrollIntoView({ behavior: noAnim ? 'auto' : 'smooth' });
  });

  /* ---------- Hitung mundur ---------- */
  var cd = $('#cd');
  if (cd) {
    var iv = setInterval(tick, 1000); tick();
  }
  function tick() {
    var t = new Date(ak.tanggalISO) - Date.now();
    if (isNaN(t)) { clearInterval(iv); return; }
    if (t <= 0) { cd.innerHTML = '<p style="grid-column:1/-1">Acara telah dimulai</p>'; clearInterval(iv); return; }
    var v = [Math.floor(t / 864e5), Math.floor(t / 36e5) % 24, Math.floor(t / 6e4) % 60, Math.floor(t / 1e3) % 60];
    [].forEach.call(cd.querySelectorAll('b'), function (b, i) { b.textContent = String(v[i]).padStart(2, '0'); });
  }

  /* ---------- Gift ---------- */
  var gb = $('#giftBtn');
  if (gb) gb.addEventListener('click', function () {
    var o = $('#acc').classList.toggle('open'); gb.setAttribute('aria-expanded', o);
  });
  app.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-copy]');
    if (b) salin(b.getAttribute('data-copy'));
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lb'), li = lb.querySelector('img'), gi = 0, gs = C.galeri || [];
  function show(i) { gi = (i + gs.length) % gs.length; li.src = gs[gi]; li.onerror = function () { li.onerror = null; li.src = PH; }; lb.classList.add('open'); }
  var gal = $('#gal');
  if (gal) gal.addEventListener('click', function (ev) {
    var t = ev.target; if (t.tagName === 'IMG') show(+t.getAttribute('data-i'));
  });
  lb.querySelector('.x').onclick = function () { lb.classList.remove('open'); };
  lb.querySelector('.p').onclick = function () { show(gi - 1); };
  lb.querySelector('.n').onclick = function () { show(gi + 1); };
  lb.addEventListener('click', function (ev) { if (ev.target === lb) lb.classList.remove('open'); });
  document.addEventListener('keydown', function (ev) {
    if (!lb.classList.contains('open')) return;
    if (ev.key === 'Escape') lb.classList.remove('open');
    if (ev.key === 'ArrowLeft') show(gi - 1);
    if (ev.key === 'ArrowRight') show(gi + 1);
  });

  /* ---------- RSVP & ucapan (online bila firebaseUrl diisi di config.js) ---------- */
  var O = C.ucapanOnline || {};
  var DB = String(O.firebaseUrl || '').replace(/\/+$/, '');
  var ONLINE = /^https:\/\//.test(DB);
  var ID = String(C.idUndangan || 'undangan').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'undangan';
  var S = {
    get: function () { try { return JSON.parse(localStorage.getItem('rsvp_v1_' + ID)) || []; } catch (_) { return []; } },
    set: function (v) { try { localStorage.setItem('rsvp_v1_' + ID, JSON.stringify(v)); } catch (_) { } }
  };
  function ago(ts) {
    var s = (Date.now() - ts) / 1000;
    if (s < 60) return 'baru saja';
    if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
    if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
    return Math.floor(s / 86400) + ' hari lalu';
  }
  function pesanValid(m) { return m && typeof m.n === 'string' && typeof m.u === 'string' && typeof m.t === 'number'; }
  var last = [];
  function render(list) {
    var box = $('#ucapan'); if (!box) return;
    box.innerHTML = list.length ? list.map(function (m) {
      var c = m.h === 'Hadir' ? 'ok' : m.h === 'Tidak Hadir' ? 'no' : 'rg';
      return '<div class="msg"><b>' + e(m.n) + '</b> <span class="' + c + '">&bull; ' + e(m.h) + '</span><p>' + e(m.u) + '</p><small>' + ago(m.t) + '</small></div>';
    }).join('') : '<p class="sm" style="margin-top:14px">Belum ada ucapan. Jadilah yang pertama.</p>';
  }
  function muat() {
    if (!ONLINE) { render(S.get()); return; }
    fetch(DB + '/ucapan/' + ID + '.json')
      .then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); })
      .then(function (d) {
        last = Object.keys(d || {}).map(function (k) { return d[k]; }).filter(pesanValid)
          .sort(function (a, b) { return b.t - a.t; }).slice(0, 100);
        render(last);
      })
      .catch(function () { render(last.length ? last : S.get()); });
  }
  var fm = $('#rsvp');
  if (fm) {
    muat();
    if (ONLINE) setInterval(function () { if (!document.hidden) muat(); }, Math.max(10, +O.perbaruiDetik || 25) * 1000);
    fm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var n = fm.nama.value.trim(), u = fm.ucapan.value.trim(), hd = fm.hadir.value;
      if (!n || !u || !hd) { toast('Lengkapi semua kolom'); return; }
      var jeda = Math.max(5, +O.jedaKirimDetik || 20) * 1000, lt = 0;
      try { lt = +localStorage.getItem('rsvp_last') || 0; } catch (_) { }
      if (Date.now() - lt < jeda) { toast('Mohon tunggu sebentar sebelum mengirim lagi'); return; }
      var item = { n: n.slice(0, 50), u: u.slice(0, 300), h: hd, t: Date.now() };
      var btn = fm.querySelector('button[type=submit]');
      var selesai = function () {
        try { localStorage.setItem('rsvp_last', String(Date.now())); } catch (_) { }
        fm.reset(); toast('Terima kasih atas ucapannya');
      };
      if (!ONLINE) { var l = S.get(); l.unshift(item); S.set(l.slice(0, 100)); selesai(); render(S.get()); return; }
      btn.disabled = true;
      fetch(DB + '/ucapan/' + ID + '.json', { method: 'POST', body: JSON.stringify(item) })
        .then(function (r) { if (!r.ok) throw new Error('http'); last.unshift(item); render(last); selesai(); })
        .catch(function () { toast('Gagal mengirim. Periksa koneksi lalu coba lagi.'); })
        .then(function () { btn.disabled = false; });
    });
    var wa = $('#kirimWA');
    if (wa) wa.addEventListener('click', function () {
      var n = fm.nama.value.trim();
      if (!n || !fm.hadir.value) { toast('Isi nama dan kehadiran dulu'); return; }
      var t = 'Assalamu\'alaikum. Saya ' + n + ' (' + fm.hadir.value + '). ' + fm.ucapan.value.trim();
      window.open('https://wa.me/' + String(C.nomorWhatsAppClient || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });
  }
})();
