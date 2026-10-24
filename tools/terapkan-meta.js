/* Menerapkan pengaturan "pratinjau" dari config.js ke meta tag SEMUA model di katalog-data.js.
   Cara pakai (di terminal VS Code, di folder proyek):  node tools/terapkan-meta.js
   Jalankan lagi setiap kali mengubah baseUrl atau bagian pratinjau di config.js. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const ctx = { window: {} }; vm.createContext(ctx);
['assets/js/config.js', 'assets/js/katalog-data.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx));
const C = ctx.window.CONFIG, K = ctx.window.KATALOG, P = C.pratinjau || {};
const base = String(C.baseUrl || '').replace(/\/+$/, '');
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const besar = P.ukuran === 'besar';
const img = /^https?:\/\//.test(P.gambar || '') ? P.gambar : base + '/' + String(P.gambar || '').replace(/^\.?\//, '');

function setMeta(h, key, val) {
  const attr = (key === 'description' || key.startsWith('twitter')) ? 'name' : 'property';
  const tag = `<meta ${attr}="${key}" content="${esc(val)}">`;
  const re = new RegExp(`<meta\\s+(?:property|name)="${key}"\\s+content="[^"]*">`);
  return re.test(h) ? h.replace(re, () => tag) : h.replace('</head>', () => tag + '\n</head>');
}
let n = 0;
K.forEach(k => {
  const f = path.join(root, k.file);
  if (!fs.existsSync(f)) { console.log('LEWATI (file tidak ada): ' + k.file); return; }
  let h = fs.readFileSync(f, 'utf8');
  const url = base + '/' + (k.file === 'index.html' ? '' : k.file);
  h = h.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(P.judul)}</title>`);
  h = setMeta(h, 'description', P.deskripsi);
  h = setMeta(h, 'og:type', 'website');
  h = setMeta(h, 'og:site_name', P.judul);
  h = setMeta(h, 'og:title', P.judul);
  h = setMeta(h, 'og:description', P.deskripsi);
  h = setMeta(h, 'og:image', img);
  h = setMeta(h, 'og:image:width', besar ? 1200 : 600);
  h = setMeta(h, 'og:image:height', besar ? 630 : 600);
  h = setMeta(h, 'og:url', url);
  h = setMeta(h, 'twitter:card', besar ? 'summary_large_image' : 'summary');
  fs.writeFileSync(f, h); n++; console.log('OK  ' + k.file + '  ->  ' + url);
});
console.log(`Selesai: ${n} file diperbarui.`);
