/* Panel admin untuk daftar tamu, ucapan, dan pengaturan undangan. */
(function () {
  'use strict';
  var C = window.CONFIG || {}, K = window.KATALOG || [], P = C.pratinjau || {};
  var $ = function (s) { return document.querySelector(s); };
  var login = $('#login'), panel = $('#admin-panel'), form = $('#login-form');
  var status = $('#login-status'), loginButton = $('#login-button');
  var authConfig = C.firebaseAuth || {};
  var adminCode = String(C.kode || '').trim().toLowerCase();
  var adminEmail = adminCode + '@admin.undangan';
  var requiredConfig = ['apiKey', 'authDomain', 'projectId', 'appId'];
  var configured = requiredConfig.every(function (key) {
    return typeof authConfig[key] === 'string' && authConfig[key].trim() !== '';
  });
  var validAdminCode = /^[a-z0-9][a-z0-9-]*$/.test(adminCode);

  function showLogin(message) {
    login.hidden = false;
    panel.hidden = true;
    status.textContent = message || '';
  }

  if (!configured || !validAdminCode) {
    loginButton.disabled = true;
    showLogin('Konfigurasi belum lengkap. Isi firebaseAuth dan kode (huruf kecil, angka, atau tanda hubung) di assets/js/config.js.');
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
    auth.signInWithEmailAndPassword(adminEmail, $('#password').value)
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
  async function startAdmin() {
    if (started) return;
    started = true;
  var db = String((C.ucapanOnline || {}).firebaseUrl || '').replace(/\/+$/, '');
  var invitationId = String(C.idUndangan || 'undangan').toLowerCase().replace(/[^a-z0-9-]/g, '') || 'undangan';
  var ONLINE = /^https:\/\//.test(db);
  var defaultTeksWA = C.teksWA || '';
  if (ONLINE) {
    try {
      var response = await fetch(db + '/pengaturan/' + encodeURIComponent(invitationId) + '.json');
      if (!response.ok) throw new Error('HTTP ' + response.status);
      var remoteSettings = await response.json();
      C = window.applyAdminSettings(C, remoteSettings);
    } catch (error) {
      console.error('Gagal memuat pengaturan online panel admin.', error);
      $('#settings-status').textContent = 'Gagal memuat pengaturan online. Periksa koneksi dan aturan Firebase.';
      C = window.applyAdminSettings(C);
    }
  } else {
    C = window.applyAdminSettings(C);
  }
  var base = String(C.baseUrl || location.origin).replace(/\/+$/, '');
  var guestKey = 'undangan_admin_guests_v1_' + invitationId;
  var localMessageKey = 'rsvp_v1_' + invitationId;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); };
  var halaman = function (f) { return (!f || f === 'index.html') ? '' : f; };
  var sel = $('#versi');
  K.forEach(function (item) {
    var option = document.createElement('option');
    option.value = item.file;
    option.textContent = item.nama;
    sel.appendChild(option);
  });
  sel.value = C.halamanUndangan || 'index.html';
  if (!sel.value && K.length) sel.value = K[0].file;
  var messageRows = [];

  function readStored(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error('Gagal membaca data panel dari penyimpanan browser.', error);
      return fallback;
    }
  }
  function noWA(n) { n = String(n || '').replace(/\D/g, ''); if (n.indexOf('0') === 0) n = '62' + n.slice(1); return n; }
  function teks(nama, link, template) {
    var a = C.akad || {}, d = new Date(a.tanggalISO);
    var tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    var map = { nama: nama, link: link, tempat: a.tempat || '', tanggal: tgl, mempelai: ((C.pria || {}).nama || '') + ' & ' + ((C.wanita || {}).nama || '') };
    return String(template == null ? C.teksWA || '' : template).replace(/\{(\w+)\}/g, function (m, k) { return k in map ? map[k] : m; });
  }
  function salin(t, b) {
    var ok = function () { var o = b.textContent; b.textContent = 'Tersalin'; setTimeout(function () { b.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fb); else fb();
    function fb() { var x = document.createElement('textarea'); x.value = t; x.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(x); x.select(); try { document.execCommand('copy'); } catch (_) { } x.remove(); ok(); }
  }
  function btn(label, fn, cls) { var b = document.createElement('button'); b.type = 'button'; b.textContent = label; if (cls) b.className = cls; b.onclick = function () { fn(b); }; return b; }
  function format(t) {
    var u = [];
    t = esc(t).replace(/https?:\/\/[^\s<]+/g, function (m) { u.push(m); return '\u0001' + (u.length - 1) + '\u0001'; });
    t = t.replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, '$1<i>$2</i>');
    t = t.replace(/\u0001(\d+)\u0001/g, function (m, i) { return '<span class="lnk">' + u[i] + '</span>'; });
    return t.replace(/\n/g, '<br>');
  }
  function gambarUrl() { var g = P.gambar || ''; return /^https?:\/\//.test(g) ? g : '../' + g.replace(/^\.?\//, ''); }
  function renderSettingsPreview() {
    var link = base + '/' + halaman(sel.value || C.halamanUndangan);
    var message = teks('Nama Tamu', link, $('#teks-wa').value);
    var host = '';
    try { host = new URL(link).hostname; } catch (_) { }
    $('#link-preview-image').src = gambarUrl();
    $('#link-preview-title').textContent = P.judul || C.judulHalaman || 'Undangan';
    $('#link-preview-description').textContent = (P.deskripsi || '') + (host ? ' · ' + host : '');
    $('#settings-preview').innerHTML =
      '<div class="card"><img src="' + esc(gambarUrl()) + '" alt=""><div><b>' + esc(P.judul || C.judulHalaman || 'Undangan') +
      '</b><span>' + esc(host) + '</span></div></div><div class="txt">' + format(message) + '</div>';
  }
  function guestList() {
    var guests = readStored(guestKey, []);
    return Array.isArray(guests) ? guests.filter(function (guest) { return guest && typeof guest.name === 'string'; }) : [];
  }
  function saveGuests(guests) {
    try {
      localStorage.setItem(guestKey, JSON.stringify(guests));
      renderGuests();
    } catch (error) {
      console.error('Gagal menyimpan daftar tamu.', error);
      $('#guest-status').textContent = 'Gagal menyimpan daftar. Periksa ruang penyimpanan browser.';
    }
  }
  function guestLink(guest) {
    return base + '/' + halaman(sel.value || C.halamanUndangan) + '?to=' + encodeURIComponent(guest.name);
  }
  function renderGuests() {
    var guests = guestList(), query = $('#guest-search').value.trim().toLowerCase();
    var shown = guests.filter(function (guest) { return guest.name.toLowerCase().indexOf(query) !== -1; });
    $('#count-guests').textContent = String(guests.length);
    $('#count-sent').textContent = String(guests.filter(function (guest) { return guest.sent === true; }).length);
    var out = $('#hasil');
    out.textContent = '';
    if (!shown.length) {
      var empty = document.createElement('div');
      empty.className = 'cardbox empty';
      empty.textContent = query ? 'Nama tamu tidak ditemukan.' : 'Belum ada tamu.';
      out.appendChild(empty);
      return;
    }
    shown.forEach(function (guest) {
      var row = document.createElement('div');
      row.className = 'item';
      var top = document.createElement('div');
      top.className = 'guest-row';
      var name = document.createElement('strong');
      name.textContent = guest.name;
      var phone = document.createElement('small');
      phone.textContent = guest.phone || 'Nomor WhatsApp belum diisi';
      top.appendChild(name);
      top.appendChild(phone);
      row.appendChild(top);
      var link = guestLink(guest);
      var linkText = document.createElement('small');
      linkText.textContent = link;
      row.appendChild(linkText);
      var actions = document.createElement('div');
      actions.className = 'guest-actions';
      var share = document.createElement('a');
      share.className = 'b';
      share.target = '_blank';
      share.rel = 'noopener';
      share.textContent = guest.sent ? 'Kirim ulang' : 'Kirim WhatsApp';
      share.href = 'https://wa.me/' + noWA(guest.phone) + '?text=' + encodeURIComponent(teks(guest.name, link));
      share.addEventListener('click', function () {
        var all = guestList(), target = all.find(function (item) { return item.id === guest.id; });
        if (target) { target.sent = true; saveGuests(all); }
      });
      actions.appendChild(share);
      actions.appendChild(btn('Salin tautan', function (button) { salin(link, button); }, 'o'));
      actions.appendChild(btn('Hapus', function () {
        if (!window.confirm('Hapus tamu ' + guest.name + '?')) return;
        saveGuests(guestList().filter(function (item) { return item.id !== guest.id; }));
      }, 'danger'));
      row.appendChild(actions);
      out.appendChild(row);
    });
  }

  function addGuests(lines) {
    var guests = guestList(), added = 0;
    lines.forEach(function (line) {
      var parts = line.split('|');
      var name = parts[0].replace(/\s+/g, ' ').trim().slice(0, 60);
      if (!name) return;
      guests.push({ id: String(Date.now()) + '-' + Math.random().toString(36).slice(2, 8), name: name, phone: String(parts[1] || '').trim(), sent: false });
      added++;
    });
    if (!added) {
      $('#guest-status').textContent = 'Masukkan setidaknya satu nama tamu.';
      return;
    }
    $('#guest-status').textContent = added + ' tamu berhasil ditambahkan.';
    saveGuests(guests);
  }

  function localMessages() {
    var list = readStored(localMessageKey, []);
    return Array.isArray(list) ? list.filter(function (item) { return item && typeof item.n === 'string'; }) : [];
  }
  function attendanceLabel(value) {
    return value === 'Hadir' ? 'hadir' : value === 'Tidak Hadir' ? 'tidak' : value === 'Masih Ragu' ? 'ragu' : '';
  }
  function renderMessages() {
    var out = $('#message-list');
    out.textContent = '';
    var counts = { 'Hadir': 0, 'Tidak Hadir': 0, 'Masih Ragu': 0 };
    messageRows.forEach(function (row) { if (counts[row.item.h] !== undefined) counts[row.item.h]++; });
    $('#count-messages').textContent = String(messageRows.length);
    $('#count-hadir').textContent = String(counts.Hadir);
    $('#count-tidak').textContent = String(counts['Tidak Hadir']);
    $('#count-ragu').textContent = String(counts['Masih Ragu']);
    if (!messageRows.length) {
      var empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'Belum ada ucapan.';
      out.appendChild(empty);
      return;
    }
    messageRows.forEach(function (row) {
      var card = document.createElement('article');
      card.className = 'item';
      var heading = document.createElement('div');
      heading.className = 'guest-row';
      var name = document.createElement('strong');
      name.textContent = row.item.n || 'Tamu';
      var attendance = document.createElement('span');
      attendance.className = 'badge ' + attendanceLabel(row.item.h);
      attendance.textContent = row.item.h || 'Kehadiran tidak diketahui';
      heading.appendChild(name);
      heading.appendChild(attendance);
      card.appendChild(heading);
      var message = document.createElement('p');
      message.className = 'message';
      message.textContent = row.item.u || '';
      card.appendChild(message);
      var date = document.createElement('small');
      date.textContent = row.item.t ? new Date(row.item.t).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '';
      card.appendChild(date);
      card.appendChild(btn('Hapus ucapan', function (button) { deleteMessage(row, button); }, 'danger'));
      out.appendChild(card);
    });
  }
  function messageEndpoint(id) {
    return db + '/ucapan/' + encodeURIComponent(invitationId) + '/' + encodeURIComponent(id) + '.json';
  }
  function loadMessages() {
    var status = $('#message-status');
    status.textContent = 'Memuat ucapan...';
    if (!ONLINE) {
      messageRows = localMessages().map(function (item, index) { return { id: String(index), item: item, local: true }; })
        .sort(function (a, b) { return (+b.item.t || 0) - (+a.item.t || 0); });
      renderMessages();
      status.textContent = 'Ucapan tersimpan hanya di browser ini.';
      return Promise.resolve();
    }
    return fetch(db + '/ucapan/' + encodeURIComponent(invitationId) + '.json')
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        messageRows = Object.keys(data || {}).map(function (id) { return { id: id, item: data[id], local: false }; })
          .filter(function (row) { return row.item && typeof row.item.n === 'string' && typeof row.item.u === 'string'; })
          .sort(function (a, b) { return (+b.item.t || 0) - (+a.item.t || 0); });
        renderMessages();
        status.textContent = '';
      })
      .catch(function (error) {
        console.error('Gagal memuat ucapan Firebase.', error);
        status.textContent = 'Gagal memuat ucapan online. Periksa koneksi dan aturan Firebase.';
        messageRows = [];
        renderMessages();
      });
  }
  function deleteMessage(row, button) {
    if (!window.confirm('Hapus ucapan dari ' + (row.item.n || 'tamu') + '?')) return;
    button.disabled = true;
    if (row.local) {
      var locals = localMessages();
      locals.splice(+row.id, 1);
      try {
        localStorage.setItem(localMessageKey, JSON.stringify(locals));
        loadMessages();
      } catch (error) {
        console.error('Gagal menghapus ucapan lokal.', error);
        $('#message-status').textContent = 'Gagal menghapus ucapan lokal.';
        button.disabled = false;
      }
      return;
    }
    var user = auth.currentUser;
    if (!user) {
      $('#message-status').textContent = 'Sesi admin berakhir. Masuk kembali untuk menghapus ucapan.';
      button.disabled = false;
      return;
    }
    user.getIdToken().then(function (token) {
      return fetch(messageEndpoint(row.id) + '?auth=' + encodeURIComponent(token), { method: 'DELETE' });
    }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      messageRows = messageRows.filter(function (item) { return item.id !== row.id; });
      renderMessages();
      $('#message-status').textContent = 'Ucapan berhasil dihapus.';
    }).catch(function (error) {
      console.error('Gagal menghapus ucapan Firebase.', error);
      $('#message-status').textContent = 'Gagal menghapus. Periksa aturan Firebase dan pastikan email admin diizinkan.';
      button.disabled = false;
    });
  }

  $('#wedding-title').textContent = C.judulHalaman || 'Pengaturan undangan';

  var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (item) {
        var active = item === tab;
        item.setAttribute('aria-selected', String(active));
        $('#' + item.getAttribute('aria-controls')).hidden = !active;
      });
      if (tab.id === 'tab-ucapan') loadMessages();
    });
  });
  $('#refresh-messages').addEventListener('click', loadMessages);
  $('#guest-search').addEventListener('input', renderGuests);
  $('#toggle-bulk').addEventListener('click', function () {
    $('#bulk-box').hidden = !$('#bulk-box').hidden;
    this.textContent = $('#bulk-box').hidden ? 'Tambah banyak sekaligus' : 'Tutup tambah banyak';
  });
  $('#add-guest').addEventListener('click', function () {
    addGuests([$('#guest-name').value + '|' + $('#guest-phone').value]);
    if ($('#guest-name').value.trim()) { $('#guest-name').value = ''; $('#guest-phone').value = ''; }
  });
  $('#guest-name').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); $('#add-guest').click(); }
  });
  $('#add-bulk').addEventListener('click', function () {
    addGuests($('#bulk-guests').value.split(/\r?\n/));
    $('#bulk-guests').value = '';
  });

  var rekeningList = $('#rekening-list');
  (C.rekening || []).forEach(function (rekening, index) {
    var label = document.createElement('label');
    label.className = 'switchrow';
    label.appendChild(document.createTextNode('Tampilkan rekening ' + (index + 1)));
    var input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = rekening.aktif === true;
    input.setAttribute('data-rekening-index', index);
    label.appendChild(input);
    rekeningList.appendChild(label);
  });
  $('#show-rsvp').checked = (C.bagian || {}).rsvp !== false;
  $('#show-turut').checked = (C.bagian || {}).turutMengundang !== false;
  $('#teks-wa').value = C.teksWA || '';
  renderGuests();
  renderSettingsPreview();
  $('#teks-wa').addEventListener('input', renderSettingsPreview);
  $('#restore-message').addEventListener('click', function () {
    $('#teks-wa').value = defaultTeksWA;
    renderSettingsPreview();
    $('#settings-status').textContent = 'Pesan bawaan dipulihkan. Tekan Simpan pengaturan untuk menerapkannya.';
  });
  sel.addEventListener('change', function () {
    renderGuests();
    renderSettingsPreview();
    isiMeta();
  });
  $('#save-settings').addEventListener('click', async function () {
    var rekeningAktif = [].slice.call(rekeningList.querySelectorAll('input')).map(function (input) {
      return input.checked;
    });
    var settings = {
      bagian: {
        rsvp: $('#show-rsvp').checked,
        turutMengundang: $('#show-turut').checked
      },
      rekeningAktif: rekeningAktif,
      teksWA: $('#teks-wa').value
    };
    var saveButton = this;
    saveButton.disabled = true;
    try {
      window.saveAdminSettings(settings, C);
      if (!ONLINE) {
        $('#settings-status').textContent = 'Tersimpan di browser ini saja; Firebase belum dikonfigurasi.';
        return;
      }
      var user = auth.currentUser;
      if (!user) throw new Error('Sesi admin berakhir.');
      var token = await user.getIdToken();
      var response = await fetch(db + '/pengaturan/' + encodeURIComponent(invitationId) + '.json?auth=' + encodeURIComponent(token), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      $('#settings-status').textContent = 'Pengaturan berhasil disimpan dan diterapkan ke undangan.';
    } catch (error) {
      console.error('Gagal menyimpan pengaturan panel admin.', error);
      $('#settings-status').textContent = 'Tersimpan di browser ini, tetapi gagal disinkronkan. Periksa aturan Firebase dan koneksi.';
    } finally {
      saveButton.disabled = false;
    }
    renderSettingsPreview();
  });
  loadMessages();

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
  isiMeta();
  $('#salinMeta').addEventListener('click', function (e) { salin($('#meta').value, e.target); });
  }
})();
