#!/usr/bin/env python3
"""Extrai o contorno vetorial do logo (assets/img/kav-logo-intro.png) a partir do canal alfa.
Gera tools/logo-contour.json com os caminhos SVG (um por contorno) usados nos traços de luz da abertura.
Uso: python3 tools/logo-contour.py"""
import json, math
import numpy as np
from PIL import Image

SRC = 'assets/img/kav-logo-intro.png'
im = Image.open(SRC).convert('RGBA')
W, H = im.size
# suaviza a máscara em 2x para contornos mais redondos
big = im.split()[3].resize((W * 2, H * 2), Image.LANCZOS)
a = np.asarray(big).astype(float) / 255.0
a = np.pad(a, 1)            # borda vazia para fechar contornos
T = 0.5

# --- marching squares: segmentos entre pontos nas arestas (com interpolação linear) ---
def interp(p0, p1, v0, v1):
    t = (T - v0) / (v1 - v0) if v1 != v0 else .5
    return (p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t)

segs = []
h, w = a.shape
for y in range(h - 1):
    for x in range(w - 1):
        v = (a[y, x], a[y, x + 1], a[y + 1, x + 1], a[y + 1, x])      # TL TR BR BL
        idx = (v[0] > T) * 8 + (v[1] > T) * 4 + (v[2] > T) * 2 + (v[3] > T) * 1
        if idx in (0, 15): continue
        tl, tr, br, bl = (x, y), (x + 1, y), (x + 1, y + 1), (x, y + 1)
        top = lambda: interp(tl, tr, v[0], v[1]); right = lambda: interp(tr, br, v[1], v[2])
        bottom = lambda: interp(bl, br, v[3], v[2]); left = lambda: interp(tl, bl, v[0], v[3])
        table = {1: [(left, bottom)], 2: [(bottom, right)], 3: [(left, right)], 4: [(top, right)],
                 5: [(top, left), (bottom, right)], 6: [(top, bottom)], 7: [(top, left)], 8: [(top, left)],
                 9: [(top, bottom)], 10: [(top, right), (left, bottom)], 11: [(top, right)], 12: [(left, right)],
                 13: [(bottom, right)], 14: [(left, bottom)]}
        for f1, f2 in table[idx]:
            segs.append((f1(), f2()))

# --- encadeia segmentos em polilinhas fechadas ---
key = lambda p: (round(p[0], 3), round(p[1], 3))
adj = {}
for s, e in segs:
    adj.setdefault(key(s), []).append((s, e)); adj.setdefault(key(e), []).append((e, s))
used = set(); loops = []
for s, e in segs:
    k = (key(s), key(e))
    if k in used: continue
    loop = [s]; cur, prev = e, s; used.add(k); used.add((key(e), key(s)))
    while key(cur) != key(loop[0]):
        loop.append(cur)
        nxt = None
        for a_, b_ in adj.get(key(cur), []):
            kk = (key(a_), key(b_))
            if kk in used: continue
            nxt = (a_, b_); break
        if not nxt: break
        used.add((key(nxt[0]), key(nxt[1]))); used.add((key(nxt[1]), key(nxt[0])))
        prev, cur = cur, nxt[1]
    if len(loop) > 20: loops.append(loop)

# --- simplifica (Douglas-Peucker) e converte para a escala original do logo ---
def dp(pts, eps):
    if len(pts) < 3: return pts
    (x1, y1), (x2, y2) = pts[0], pts[-1]
    dx, dy = x2 - x1, y2 - y1; n = math.hypot(dx, dy) or 1e-9
    dmax, im_ = 0, 0
    for i in range(1, len(pts) - 1):
        d = abs(dy * pts[i][0] - dx * pts[i][1] + x2 * y1 - y2 * x1) / n
        if d > dmax: dmax, im_ = d, i
    if dmax > eps: return dp(pts[:im_ + 1], eps)[:-1] + dp(pts[im_:], eps)
    return [pts[0], pts[-1]]

paths = []
for lp in sorted(loops, key=lambda l: -len(l)):
    pts = [((p[0] - 1) / 2, (p[1] - 1) / 2) for p in lp]       # volta a 700x343 (descontando o padding)
    # contorno fechado: divide no ponto mais distante do início antes de simplificar
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2)
    pts = dp(pts[:far + 1], .35)[:-1] + dp(pts[far:] + [pts[0]], .35)[:-1]
    # ignora ruído minúsculo
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    if (max(xs) - min(xs)) * (max(ys) - min(ys)) < 60: continue
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
    paths.append(d)

json.dump({'width': W, 'height': H, 'paths': paths}, open('tools/logo-contour.json', 'w'))
print(len(paths), 'contornos;', sum(len(p) for p in paths), 'bytes de caminho')
