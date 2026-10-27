/* Panel admin: tautan per tamu, teks & pratinjau WhatsApp, generator meta tag. Data dari config.js */
(function () {
  'use strict';
  var C = window.CONFIG || {}, K = window.KATALOG || [], P = C.pratinjau || {};
  var $ = function (s) { return document.querySelector(s); };
  var login = $('#login'), panel = $('#admin-panel'), form = $('#login-form');
  var status = $('#login-status'), loginButton = $('#login-button');
  var authConfig = C.firebaseAuth || {};
  var adminEmail = String(C.adminEmail || '').trim().toLowerCase();
  var requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
  var configured = requiredConfig.every(function (key) {
    return typeof authConfig[key] === 'string' && authConfig[key].trim() !== '';
  });

  function showLogin(message) {
    login.hidden = false;
    panel.hidden = true;
    status.textContent = message || '';
  }

  if (!configured || !adminEmail) {
    loginButton.disabled = true;
    showLogin('Konfigurasi Firebase belum lengkap. Isi firebaseAuth dan adminEmail di assets/js/config.js.');
    return;
  }
  if (!window.firebase || !firebase.auth) {
    loginButton.disabled = true;
    showLogin('Firebase Authentication tidak dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.');
    return;
  }

  var app = firebase.apps.length ? firebase.app() : firebase.initializeApp(authConfig);
  var auth = app.auth();
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    loginButton.disabled = true;
    status.textContent = 'Memeriksa akun...';
    auth.signInWithEmailAndPassword($('#email').value.trim(), $('#password').value)
      .then(function () { $('#password').value = ''; })
      .catch(function (error) {
        var messages = {
          'auth/invalid-email': 'Format email tidak valid.',
          'auth/user-disabled': 'Akun ini dinonaktifkan.',
          'auth/user-not-found': 'Email atau kata sandi salah.',
          'auth/wrong-password': 'Email atau kata sandi salah.',
          'auth/invalid-credential': 'Email atau kata sandi salah.',
          'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.'
        };
        showLogin(messages[error.code] || 'Gagal masuk: ' + error.message);
      })
      .then(function () { loginButton.disabled = false; });
  });

  $('#logout').addEventListener('click', function () {
    auth.signOut().catch(function (error) {
      showLogin('Gagal keluar: ' + error.message);
    });
  });

  auth.onAuthStateChanged(function (user) {
    if (!user) {
      loginButton.disabled = false;
      showLogin('');
      return;
    }
    if (String(user.email || '').trim().toLowerCase() !== adminEmail) {
      auth.signOut().then(function () {
        showLogin('Akun ini tidak diizinkan membuka panel admin.');
      }).catch(function (error) {
        showLogin('Akun tidak diizinkan dan gagal dikeluarkan: ' + error.message);
      });
      return;
    }
    login.hidden = true;
    panel.hidden = false;
    startAdmin();
  });

  var started = false;
  function startAdmin() {
    if (started) return;
    started = true;
  /* Mode developer: buka /admin/?dev untuk menampilkan pilihan model & generator meta tag. Client cukup buka /admin/ */
  if (/[?&]dev(=|&|$)/.test(location.search)) document.body.classList.add('modedev');
  var base = String(C.baseUrl || location.origin).replace(/\/+$/, '');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var halaman = function (f) { return (!f || f === 'index.html') ? '' : f; };

  /* pilihan model dari katalog-data.js */
  var sel = $('#versi');
  K.forEach(function (k) { var o = document.createElement('option'); o.value = k.file; o.textContent = k.nama; sel.appendChild(o); });
  sel.value = C.halamanUndangan || 'index.html';
  if (!sel.value && K.length) sel.value = K[0].file;

  function noWA(n) { n = String(n || '').replace(/\D/g, ''); if (n.indexOf('0') === 0) n = '62' + n.slice(1); return n; }
  function teks(nama, link) {
    var a = C.akad || {}, d = new Date(a.tanggalISO);
    var tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var map = { nama: nama, link: link, tempat: a.tempat || '', tanggal: tgl, mempelai: ((C.pria || {}).nama || '') + ' & ' + ((C.wanita || {}).nama || '') };
    return String(C.teksWA || '').replace(/\{(\w+)\}/g, function (m, k) { return k in map ? map[k] : m; });
  }
  function salin(t, b) {
    var ok = function () { var o = b.textContent; b.textContent = 'Tersalin'; setTimeout(function () { b.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
    function fb() { var x = document.createElement('textarea'); x.value = t; x.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); } catch (_) { } x.remove(); ok(); }
  }
  function btn(label, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.onclick = function () { fn(b); }; return b; }

  /* format WhatsApp: *tebal* dan _miring_ */
  function format(t) {
    var u = [];
    t = esc(t).replace(/https?:\/\/[^\s<]+/g, function (m) { u.push(m); return '\u0001' + (u.length - 1) + '\u0001'; });
    t = t.replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, '$1<i>$2</i>');
    t = t.replace(/\u0001(\d+)\u0001/g, function (m, i) { return '<span class="lnk">' + u[i] + '</span>'; });
    return t.replace(/\n/g, '<br>');
  }
  function gambarUrl() { var g = P.gambar || ''; return /^https?:\/\//.test(g) ? g : '../' + g.replace(/^\.?\//, ''); }
  function pratinjau(pesan, link) {
    var dom = ''; try { dom = new URL(link).hostname; } catch (_) { }
    var besar = P.ukuran === 'besar';
    var kartu = besar
      ? '<div class="card" style="display:block"><img class="big" src="' + esc(gambarUrl()) + '" alt="" onerror="this.style.minHeight=\'120px\'"><div style="padding:8px"><b>' + esc(P.judul) + '</b><span>' + esc(dom) + '</span></div></div>'
      : '<div class="card"><img src="' + esc(gambarUrl()) + '" alt=""><div><b>' + esc(P.judul) + '</b><span>&#128279; ' + esc(dom) + '</span></div></div>';
    $('#pv').innerHTML = kartu + '<div class="txt">' + format(pesan) + '</div>';
    $('#pvbox').hidden = false;
  }

  $('#buat').addEventListener('click', function () {
    var out = $('#hasil'); out.textContent = '';
    var ver = sel.value, first = true;
    $('#daftar').value.split('\n').forEach(function (baris) {
      var p = baris.split('|'), nama = p[0].replace(/\s+/g, ' ').trim();
      if (!nama) return;
      var link = base + '/' + halaman(ver) + '?to=' + encodeURIComponent(nama), pesan = teks(nama, link), no = noWA(p[1]);
      if (first) { pratinjau(pesan, link); first = false; }
      var it = document.createElement('div'); it.className = 'item';
      var b = document.createElement('b'); b.textContent = nama;
      var s = document.createElement('small'); s.textContent = link;
      it.appendChild(b); it.appendChild(s);
      var wa = document.createElement('a'); wa.className = 'b'; wa.target = '_blank'; wa.rel = 'noopener'; wa.textContent = 'Bagikan via WhatsApp';
      wa.href = 'https://wa.me/' + no + '?text=' + encodeURIComponent(pesan);
      it.appendChild(wa);
      it.appendChild(btn('Salin tautan', function (x) { salin(link, x); }, 'o'));
      it.appendChild(btn('Salin teks pesan', function (x) { salin(pesan, x); }, 'o'));
      out.appendChild(it);
    });
    if (!out.children.length) { out.textContent = 'Isi minimal satu nama tamu.'; $('#pvbox').hidden = true; }
  });

  /* generator meta tag */
  function meta() {
    var besar = P.ukuran === 'besar', w = besar ? 1200 : 600, h = besar ? 630 : 600;
    var g = P.gambar || '', img = /^https?:\/\//.test(g) ? g : base + '/' + g.replace(/^\.?\//, '');
    var url = base + '/' + halaman(sel.value);
    var q = function (s) { return esc(s); };
    return ['<title>' + q(P.judul) + '</title>',
      '<meta name="description" content="' + q(P.deskripsi) + '">',
      '<meta property="og:type" content="website">',
      '<meta property="og:site_name" content="' + q(P.judul) + '">',
      '<meta property="og:title" content="' + q(P.judul) + '">',
      '<meta property="og:description" content="' + q(P.deskripsi) + '">',
      '<meta property="og:image" content="' + q(img) + '">',
      '<meta property="og:image:width" content="' + w + '">',
      '<meta property="og:image:height" content="' + h + '">',
      '<meta property="og:url" content="' + q(url) + '">',
      '<meta name="twitter:card" content="' + (besar ? 'summary_large_image' : 'summary') + '">'].join('\n');
  }
  function isiMeta() { $('#meta').value = meta(); }
  sel.addEventListener('change', isiMeta); isiMeta();
  $('#salinMeta').addEventListener('click', function (e) { salin($('#meta').value, e.target); });
  }
})();
