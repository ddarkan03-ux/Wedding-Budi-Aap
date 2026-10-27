/* ==========================================================
   KONFIGURASI UNDANGAN - EDIT FILE INI SAJA
   Semua nama di bawah adalah CONTOH. Ganti dengan data client.
   true = tampil, false = sembunyi
   ========================================================== */
window.CONFIG = {

  /* === UMUM === */
  judulHalaman: "The Wedding of Raka & Alya",
  baseUrl: "https://ddarkan03-ux.github.io/undangan-katalog-darkan",        // alamat website (tanpa garis miring di akhir)
  nomorWhatsAppClient: "6285716300907",      // format 62xxxx, tanpa + dan tanpa 0 di depan
  halamanUndangan: "",                       // "" = Versi 1 (index.html); "versi-2.html" sampai "versi-7.html" = versi lain
  fileMusik: "assets/audio/musik.mp3",        // kosongkan "" bila tanpa musik
  /* Firebase Authentication untuk panel admin.
     Isi dari Project settings > General > Your apps. Jangan isi dengan sandi. */
  firebaseAuth: {
    apiKey: "AIzaSyBEA92p-xAjSyvDTWT09-zsuEDyjZg2dZw",
    authDomain: "undangan-saya.firebaseapp.com",
    projectId: "undangan-saya",
    appId: "1:996120910513:web:5df1e68b5e496fd899e090"
  },
  kode: "darkan",                             // kode admin; akun Firebase memakai email darkan@admin.undangan

  /* === PENGATURAN TAMPILAN === */
  pengaturan: {
    animasi: true,          // false = semua animasi mati
    kecepatan: "normal",    // "lambat" | "normal" | "cepat"
    partikelCover: true,    // titik cahaya melayang di cover
    slideshowCover: true    // foto cover berganti otomatis
  },

  /* === BAGIAN YANG DITAMPILKAN === */
  bagian: {
    hitungMundur: true,
    loveStory: true,
    liveStreaming: true,
    galeri: true,
    weddingGift: true,
    rsvp: true,
    turutMengundang: true   // false = bagian "Turut Mengundang" disembunyikan
  },

  /* === FOTO (simpan di assets/img/, format .webp atau .jpg) === */
  fotoCover: ["assets/img/cover1.webp", "assets/img/cover2.webp"],

  /* === PEMBUKA === */
  pembuka: "Assalamu'alaikum Warahmatullahi Wabarakatuh. Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.",

  /* === MEMPELAI === */
  urutanMempelai: ["wanita", "pria"],        // ubah urutan bila perlu
  pria: {
    panggilan: "Budi",
    nama: "Budiyanto",
    anak: "Putra pertama dari",
    ortu: "Bapak Nama Ayah & Ibu Nama Ibu",
    foto: "assets/img/pria.webp"
  },
  wanita: {
    panggilan: "Aap",
    nama: "Neng Aap",
    anak: "Putri kedua dari",
    ortu: "Bapak Nama Ayah & Ibu Nama Ibu",
    foto: "assets/img/wanita.webp"
  },

  /* === AKAD NIKAH ===
     tanggalISO: tahun-bulan-tanggalTjam:menit:detik+07:00 (WIB)
     tampilkanMaps: true/false untuk tombol "Lihat Maps" */
  akad: {
    tanggalISO: "2027-02-14T09:00:00+07:00",
    tempat: "Nama Tempat Akad",
    alamat: "Alamat lengkap tempat akad",
    linkMaps: "https://maps.google.com/",
    tampilkanMaps: true
  },

  /* === RESEPSI === */
  resepsi: {
    tanggalISO: "2027-02-14T11:00:00+07:00",
    tempat: "Nama Tempat Resepsi",
    alamat: "Alamat lengkap tempat resepsi",
    linkMaps: "https://maps.google.com/",
    tampilkanMaps: true
  },

  /* === LIVE STREAMING === */
  liveStreaming: {
    teks: "Kami mengundang Bapak/Ibu/Saudara/i untuk menyaksikan pernikahan kami secara virtual melalui tautan di bawah ini.",
    link: "https://youtube.com/"
  },

  /* === LOVE STORY (bisa tambah/kurangi blok) === */
  loveStoryFoto: "assets/img/momen.webp",
  loveStory: [
    { judul: "Pertemuan", teks: "Kami dipertemukan lewat cara yang sederhana. Dari perkenalan singkat, kami mulai saling bercerita dan menemukan banyak kecocokan yang tidak pernah kami duga." },
    { judul: "Lamaran", teks: "Seiring waktu, kami yakin untuk melangkah lebih serius. Dengan niat baik dan restu kedua orang tua, kami memutuskan untuk saling mengikat janji." },
    { judul: "Pernikahan", teks: "Atas izin Allah SWT, kami akan menyempurnakan separuh agama dalam ikatan pernikahan. Mohon doa restu agar menjadi keluarga yang sakinah, mawaddah, warahmah." }
  ],

  /* === GALERI === */
  galeri: [
    "assets/img/galeri.webp", "assets/img/galeri2.webp", "assets/img/galeri3.webp",
    "assets/img/galeri4.webp", "assets/img/galeri5.webp", "assets/img/galeri6.webp"
  ],

  /* === WEDDING GIFT ===
     aktif: false = kartu tidak ditampilkan. Kartu selalu rata tengah. */
  teksGift: "Bagi Bapak/Ibu/Saudara/i yang ingin mengirimkan hadiah pernikahan, dapat melalui rekening atau e-wallet di bawah ini.",
  rekening: [
    { aktif: true,  bank: "BCA",  nomor: "1234567890",   atasNama: "Budiyanto" },
    { aktif: true,  bank: "DANA", nomor: "777777777777", atasNama: "Neng Aap" },
    { aktif: false, bank: "BRI",  nomor: "0000000000",   atasNama: "Nama Pemilik" }
  ],
  kirimHadiah: {
    aktif: true,
    penerima: "Neng Aap",
    hp: "085716300907",
    alamat: "Alamat lengkap pengiriman hadiah"
  },

  /* === ID UNDANGAN ===
     Pembeda data ucapan antar client (huruf kecil, angka, tanda minus). Wajib unik tiap client. */
  idUndangan: "aap-budi",

  /* === UCAPAN ONLINE (terlihat oleh semua tamu) ===
     Isi firebaseUrl agar ucapan tampil untuk semua tamu. Kosong = ucapan hanya tersimpan di HP masing-masing.
     Langkah lengkap ada di README.md bagian "Ucapan online". */
  ucapanOnline: {
    firebaseUrl: "https://undangan-saya-default-rtdb.asia-southeast1.firebasedatabase.app",        // contoh: "https://nama-proyek-default-rtdb.firebaseio.com"
    perbaruiDetik: 25,      // seberapa sering daftar ucapan diperbarui otomatis
    jedaKirimDetik: 20      // jeda minimal antar pengiriman dari satu HP (anti spam)
  },

  /* === PRATINJAU WHATSAPP (kartu kecil yang muncul saat tautan dikirim) ===
     Setelah mengubah bagian ini, jalankan: node tools/terapkan-meta.js
     atau gunakan "Generator meta tag" di panel admin. */
  pratinjau: {
    judul: "Neng Aap & Budiyanto - Undangan Pernikahan",
    deskripsi: "Kami mengundang Anda untuk hadir di hari bahagia kami.",
    gambar: "assets/img/og.jpg",
    ukuran: "kecil"         // "kecil" = persegi 600x600 (thumbnail di kiri) | "besar" = banner 1200x630
  },

  /* === RSVP === */
  rsvpKeWhatsApp: true,    // tombol kirim konfirmasi ke WhatsApp client

  /* === TURUT MENGUNDANG ===
     Aktifkan/nonaktifkan lewat bagian.turutMengundang di atas.
     Tambah atau hapus nama pada daftar sesuai kebutuhan. */
  turutMengundang: {
    judul: "Turut Mengundang",
    teks: "Kami yang turut berbahagia dan mengundang Bapak/Ibu/Saudara/i:",
    daftar: [
      "Keluarga Besar Bapak Nama Kakek & Ibu Nama Nenek",
      "Keluarga Besar Bapak Nama Kakek & Ibu Nama Nenek",
      "Seluruh Keluarga dan Sahabat"
    ]
  },

  /* === PENUTUP === */
  penutup: "Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu. Wassalamu'alaikum Warahmatullahi Wabarakatuh.",
  salamKeluarga: "Kami yang berbahagia, Keluarga Besar Neng Aap & Budiyanto",

  /* === TEKS PESAN WHATSAPP (dipakai panel admin) ===
     Variabel: {nama} {link} {mempelai} {tanggal} {tempat}
     Format WhatsApp: *tebal*  _miring_   Setiap baris = satu baris pesan ("" = baris kosong). */
  teksWA: [
    "_Assalamualaikum Warahmatullahi Wabarakatuh_",
    "",
    "Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i *{nama}* untuk menghadiri acara kami.",
    "",
    "*Berikut link undangan kami*, untuk info lengkap dari acara bisa kunjungi :",
    "",
    "{link}",
    "",
    "Merupakan suatu kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan untuk hadir dan memberikan doa restu.",
    "",
    "*Mohon maaf perihal undangan hanya dibagikan melalui pesan ini.*",
    "",
    "Dan agar selalu menjaga kesehatan bersama serta datang pada waktu yang telah ditentukan.",
    "",
    "Terima kasih banyak atas perhatiannya.",
    "",
    "_Wassalamualaikum Warahmatullahi Wabarakatuh_"
  ].join("\n")
};
