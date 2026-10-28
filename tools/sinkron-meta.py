#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sinkronkan pratinjau link WhatsApp: membuat foto/og.jpg (1200x630)
dan menulis ulang blok <!--OG--> ... <!--/OG--> di index.html.
Jalankan:  python tools/sinkron-meta.py   (butuh:  pip install pillow)"""
import json, os, re, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
BLN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus',
       'September', 'Oktober', 'November', 'Desember']


def baca_data():
    t = open(os.path.join(ROOT, 'data', 'data-undangan.js'), encoding='utf-8').read()
    m = re.search(r'window\.DATA\s*=\s*(\{.*\})\s*;?\s*$', t, re.S)
    if not m:
        sys.exit('GAGAL: format data/data-undangan.js tidak dikenali.')
    try:
        return json.loads(m.group(1))
    except ValueError as e:
        sys.exit('GAGAL: ada tanda kutip/koma yang salah di data-undangan.js -> %s' % e)


def tgl(s):
    from datetime import date
    y, m, d = [int(x) for x in s.split('-')]
    return '%s, %d %s %d' % (HARI[date(y, m, d).weekday()], d, BLN[m - 1], y)


def font(size):
    from PIL import ImageFont
    for p in ['C:/Windows/Fonts/georgia.ttf', 'C:/Windows/Fonts/times.ttf', '/Library/Fonts/Georgia.ttf',
              '/System/Library/Fonts/Supplemental/Georgia.ttf',
              '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf']:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return None


def buat_og(d, nama, tanggal):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print('PERINGATAN: Pillow belum terpasang (pip install pillow). og.jpg tidak dibuat.')
        return
    f = d.get('foto', {})
    sumber = None
    for k in ('pratinjau', 'sampul', 'pria'):
        if f.get(k) and os.path.exists(os.path.join(ROOT, f[k])):
            sumber = os.path.join(ROOT, f[k]); break
    if not sumber:
        print('PERINGATAN: foto sumber tidak ditemukan, og.jpg tidak dibuat.'); return
    im = Image.open(sumber).convert('RGB')
    W, H = 1200, 630
    sc = max(W / im.width, H / im.height)
    im = im.resize((int(im.width * sc) + 1, int(im.height * sc) + 1))
    top = int((im.height - H) * 0.28)
    left = (im.width - W) // 2
    im = im.crop((left, top, left + W, top + H))
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(ov)
    for y in range(H):
        a = int(max(0, (y - H * 0.25) / (H * 0.75)) ** 1.3 * 215)
        dr.line([(0, y), (W, y)], fill=(16, 28, 21, a))
    im = Image.alpha_composite(im.convert('RGBA'), ov)
    dr = ImageDraw.Draw(im)
    f1, f2, f3 = font(34), font(86), font(34)
    if f1 and f2:
        def mid(txt, y, ft, col):
            w = dr.textlength(txt, font=ft)
            dr.text(((W - w) / 2, y), txt, font=ft, fill=col)
        mid('THE WEDDING OF', 365, f1, (229, 211, 173, 255))
        mid(nama, 410, f2, (255, 255, 255, 255))
        if tanggal:
            mid(tanggal, 530, f3, (255, 255, 255, 255))
    im.convert('RGB').save(os.path.join(ROOT, 'foto', 'og.jpg'), quality=84, optimize=True)


def main():
    d = baca_data()
    p, w = d.get('pria', {}), d.get('wanita', {})
    nama = '%s & %s' % (p.get('panggilan', ''), w.get('panggilan', ''))
    ev = d.get('resepsi') or d.get('akad') or {}
    ak = d.get('akad') or ev
    tanggal = tgl(ak['tanggal']) if ak.get('tanggal') else ''
    judul = 'Undangan Pernikahan %s' % nama
    desk = 'Kami mengundang Anda ke pernikahan %s' % nama
    if tanggal:
        desk += ' - %s' % tanggal
    if ev.get('tempat'):
        desk += ' di %s' % ev['tempat']
    desk += '.'
    url = (d.get('siteUrl') or '').strip()
    if not url or '...' in url or not url.endswith('/'):
        print('PERINGATAN: "siteUrl" belum diisi dengan benar (harus alamat live dan berakhir /). '
              'Ulangi alat ini setelah Tahap 9.')
        gambar, alamat = 'foto/og.jpg', None
    else:
        gambar, alamat = url + 'foto/og.jpg', url
    buat_og(d, nama, tanggal)
    e = lambda s: html.escape(s, quote=True)
    blok = ['<!--OG-->', '<title>%s</title>' % e(judul),
            '<meta name="description" content="%s">' % e(desk),
            '<meta property="og:type" content="website">',
            '<meta property="og:title" content="%s">' % e(judul),
            '<meta property="og:description" content="%s">' % e(desk),
            '<meta property="og:image" content="%s">' % e(gambar),
            '<meta property="og:image:width" content="1200">',
            '<meta property="og:image:height" content="630">']
    if alamat:
        blok.append('<meta property="og:url" content="%s">' % e(alamat))
    blok += ['<meta name="twitter:card" content="summary_large_image">', '<!--/OG-->']
    path = os.path.join(ROOT, 'index.html')
    t = open(path, encoding='utf-8').read()
    n, c = re.subn(r'<!--OG-->.*?<!--/OG-->', lambda m: '\n'.join(blok), t, flags=re.S)
    if not c:
        sys.exit('GAGAL: penanda <!--OG--> tidak ditemukan di index.html.')
    open(path, 'w', encoding='utf-8', newline='\n').write(n)
    print('OK: %s | %s' % (judul, desk))


if __name__ == '__main__':
    main()
