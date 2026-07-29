#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera due mappe SVG statiche (nessun JS) degli itinerari Bretagna / Normandia+Bretagna.
Dati costa: Natural Earth (public domain). Proiezione: Mercatore, calcolata qui.
"""
import json, math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/home/user/Calcaterra-casa/public/viaggi/img"

VB_W, VB_H = 1000.0, 520.0
MARGIN = 0.06          # 6% attorno alle tappe
SIMPL_TOL = 0.30       # tolleranza Douglas-Peucker in px di viewBox
COAST_TOL = 0.35       # idem per la linea di costa 1:10m
MIN_AREA = 1.5         # px^2: scarta isolotti irrilevanti
CLIP_PAD = 24.0        # px oltre il viewBox tenuti in geometria (poi clip-path)

# ---------------------------------------------------------------- tappe

A_STOPS = [
    ("Beauvais",                  49.4544,  2.1128, "g1",  "gateway"),
    ("Mont-Saint-Michel",         48.6361, -1.5115, "g1",  ""),
    ("Saint-Malo",                48.6493, -2.0257, "g2",  ""),
    ("Cancale",                   48.6767, -1.8508, "g2",  ""),
    ("Dinan",                     48.4553, -2.0475, "g3",  ""),
    ("Cap Fréhel",           48.6853, -2.3153, "g3",  ""),
    ("Ploumanac'h",               48.8300, -3.4800, "g4",  ""),
    ("Pointe de Pen-Hir",         48.2569, -4.6236, "g5",  ""),
    ("Locronan",                  48.0972, -4.2081, "g6",  ""),
    ("Pointe du Raz",             48.0386, -4.7361, "g6",  ""),
    ("Penmarc'h",                 47.7986, -4.3736, "g7",  "eclipse"),
    ("Quimper",                   47.9960, -4.1024, "g7",  ""),
    ("Concarneau",                47.8756, -3.9203, "g8",  ""),
    ("Pont-Aven",                 47.8556, -3.7472, "g8",  ""),
    ("Lorient",                   47.7483, -3.3702, "g8",  ""),
    ("Carnac",                    47.5850, -3.0800, "g9",  ""),
    ("Vannes",                    47.6559, -2.7603, "g9",  ""),
    ("Brocéliande",          48.0197, -2.1725, "g10", ""),
    ("Rouen",                     49.4432,  1.0993, "g10", ""),
]
# indici (0-based) dei segmenti "trasferimento" (i -> i+1); -1 = ultimo -> ritorno a Beauvais
A_TRANSFER = {0, 17, 18}

B_STOPS = [
    ("Beauvais",                  49.4544,  2.1128, "g1",  "gateway"),
    ("Rouen",                     49.4432,  1.0993, "g1",  ""),
    ("Étretat",                   49.7072,  0.2039, "g2",  ""),
    ("Le Havre",                  49.4944,  0.1079, "g2",  ""),
    ("Bayeux",                    49.2764, -0.7024, "g3",  ""),
    ("Pointe du Hoc",             49.3939, -0.9892, "g3",  ""),
    ("Colleville-sur-Mer",        49.3597, -0.8508, "g3",  ""),
    ("Arromanches",               49.3397, -0.6222, "g3",  ""),
    ("Mont-Saint-Michel",         48.6361, -1.5115, "g4",  ""),
    ("Champ-Dolent",              48.5292, -1.7525, "g4",  ""),
    ("Saint-Malo",                48.6493, -2.0257, "g5",  ""),
    ("Cap Fréhel",                48.6853, -2.3153, "g5",  ""),
    ("Ploumanac'h",               48.8300, -3.4800, "g6",  ""),
    ("Roscoff",                   48.7261, -3.9847, "g6",  ""),
    ("Le Conquet",                48.3606, -4.7708, "g6",  ""),
    ("Pointe Saint-Mathieu",      48.3300, -4.7719, "g6",  ""),
    ("Pointe de Pen-Hir",         48.2569, -4.6236, "g7",  ""),
    ("Pointe du Raz",             48.0386, -4.7361, "g7",  ""),
    ("Pointe du Van",             48.0553, -4.7042, "g7",  "eclipse"),
    ("Baie des Trépassés",        48.0355, -4.6790, "g7",  ""),
    ("Locronan",                  48.0972, -4.2081, "g8",  ""),
    ("Raguénez",                  47.7960, -3.7875, "g8",  ""),
    ("Lorient",                   47.7483, -3.3702, "g8",  ""),
    ("Quiberon",                  47.4830, -3.1210, "g8",  ""),
    ("Carnac",                    47.5850, -3.0800, "g8",  ""),
    ("Rochefort-en-Terre",        47.6944, -2.3392, "g9",  ""),
    ("Brocéliande",               48.0186, -2.1725, "g9",  ""),
    ("Le Mans",                   48.0061,  0.1996, "g9",  ""),
    ("Giverny",                   49.0758,  1.5333, "g10", ""),
]

# Tappe opzionali: disegnate ma NON collegate alla rotta, perche' sono alternative
# o deviazioni, non tappe fisse. (nome, lat, lon, giornata, testo del tooltip)
A_OPTIONS = [
    ("Champ-Dolent", 48.5292, -1.7525, "g2",
     "Menhir du Champ-Dolent — opzione del Giorno 2: 9,3 metri di granito, il secondo menhir "
     "piu' alto della Bretagna, accesso libero"),
    ("Bécherel", 48.2953, -1.9469, "g10",
     "Becherel — opzione del Giorno 10: la prima Cite du Livre di Francia, +10 km e +25 minuti"),
]

B_OPTIONS = [
    ("Concarneau", 47.8757, -3.9199, "g8",
     "Concarneau — da valutare sul Giorno 8: la Ville Close costa +11 minuti sulla strada, "
     "ma il 13 agosto e' in corso il Festival des Filets Bleus"),
    ("Bécherel", 48.2953, -1.9469, "g4",
     "Bécherel — opzione del Giorno 4: la prima Cite du Livre di Francia, una quindicina di librerie"),
]
B_TRANSFER = {0, 26, 28}

DAY_TITLES = {
    "A": {
        "g1": "Giorno 1 · arrivo a Beauvais e trasferimento in Bretagna",
        "g2": "Giorno 2 · Saint-Malo e le ostriche di Cancale",
        "g3": "Giorno 3 · Dinan, Cap Fréhel e Fort la Latte",
        "g4": "Giorno 4 · la Côte de Granit Rose",
        "g5": "Giorno 5 · la Presqu'île de Crozon",
        "g6": "Giorno 6 · Locronan e il Cap Sizun",
        "g7": "Giorno 7 · Quimper e l'eclissi sull'Atlantico",
        "g8": "Giorno 8 · Concarneau, Pont-Aven e la base sottomarina di Lorient",
        "g9": "Giorno 9 · i megaliti di Carnac e il Golfo del Morbihan",
        "g10": "Giorno 10 · Brocéliande, poi verso est",
        "g11": "Giorno 11 · rientro a Parigi-Beauvais",
    },
    "B": {
        "g1": "Giorno 1 · arrivo a Beauvais e prima tappa normanna",
        "g2": "Giorno 2 · Étretat e Le Havre, la Costa d'Alabastro",
        "g3": "Giorno 3 · le spiagge dello Sbarco",
        "g4": "Giorno 4 · Mont-Saint-Michel e il Menhir du Champ-Dolent",
        "g5": "Giorno 5 · Cap Fréhel, Fort la Latte e la costa nord",
        "g6": "Giorno 6 · Ploumanac'h, Roscoff e la Pointe Saint-Mathieu",
        "g7": "Giorno 7 · Crozon, la Pointe du Raz e l'eclissi alla Pointe du Van",
        "g8": "Giorno 8 · Raguénez, i sottomarini di Lorient, i menhir di Carnac",
        "g9": "Giorno 9 · Rochefort-en-Terre, Brocéliande e Le Mans",
        "g10": "Giorno 10 · Giverny, il giardino di Monet",
        "g11": "Giorno 11 · rientro a Parigi-Beauvais",
    },
}

# nomi da etichettare, in ordine di priorità: chi viene prima si aggiudica
# la posizione migliore, chi resta senza spazio semplicemente non compare
A_LABELS = ["Beauvais", "Mont-Saint-Michel", "Penmarc'h", "Pointe du Raz",
            "Saint-Malo", "Ploumanac'h", "Carnac", "Lorient", "Quimper", "Vannes",
            "Brocéliande", "Cap Fréhel", "Pointe de Pen-Hir", "Rouen", "Locronan"]
B_LABELS = ["Beauvais", "Étretat", "Mont-Saint-Michel", "Pointe du Van",
            "Pointe Saint-Mathieu",
            "Pointe du Raz", "Carnac", "Lorient", "Bayeux", "Saint-Malo",
            "Ploumanac'h", "Giverny", "Rouen", "Le Havre", "Le Mans",
            "Roscoff", "Brocéliande", "Locronan",
            "Quiberon", "Pointe de Pen-Hir", "Champ-Dolent"]


LABEL_FS = 16.0          # px, come .mp-label
CHAR_W = 0.545           # larghezza media di un carattere in em, misurata sul font di sistema

# nelle punte più affollate il nome per esteso non entra: si abbrevia
ALIAS = {"Pointe du Raz": "Pte du Raz", "Pointe de Pen-Hir": "Pte de Pen-Hir",
         "Pointe du Van": "Pte du Van", "Pointe Saint-Mathieu": "St-Mathieu"}


def text_w(t):
    return len(t) * LABEL_FS * CHAR_W

# candidate: (text-anchor, dx, dy) in ordine di preferenza
CANDIDATES = [
    ("start",  11,  -8), ("end",   -11,  -8),
    ("start",  11,  17), ("end",   -11,  17),
    ("middle",   0, -14), ("middle",   0,  24),
    ("start",  13,   5), ("end",   -13,   5),
    ("middle",  0, -26), ("middle",   0,  36),
]

def label_box(x, y, anc, dx, dy, w):
    lx = x + dx
    x0 = lx if anc == "start" else (lx - w if anc == "end" else lx - w / 2.0)
    return (x0 - 2, y + dy - LABEL_FS + 1, x0 + w + 2, y + dy + 4)

def overlaps(a, b):
    return not (a[2] < b[0] or b[2] < a[0] or a[3] < b[1] or b[3] < a[1])

def auto_labels(stops, pts, wanted, reserved, boxes=None):
    """Restituisce {nome: (anchor, dx, dy, testo)} evitando sovrapposizioni con le altre
    etichette, con i cerchi delle tappe e con i rettangoli riservati (legenda).
    Se `boxes` e' una lista, viene riempita con i rettangoli occupati: serve a chi
    disegna dopo (le tappe opzionali) per non finirci sopra."""
    boxes = boxes if boxes is not None else []
    boxes.extend(reserved)
    for (x, y) in pts:                       # i cerchi delle tappe sono ostacoli
        boxes.append((x - 9, y - 9, x + 9, y + 9))
    out = {}
    order = [i for i, s in enumerate(stops) if s[0] in wanted]
    for i in order:
        name = stops[i][0]
        x, y = pts[i]
        w = text_w(name)
        shown = name
        chosen = None
        for anc, dx, dy in CANDIDATES:
            bx = label_box(x, y, anc, dx, dy, w)
            if bx[0] < 6 or bx[2] > VB_W - 6 or bx[1] < 4 or bx[3] > VB_H - 4:
                continue
            if any(overlaps(bx, b) for b in boxes):
                continue
            chosen = (anc, dx, dy, bx)
            break
        if chosen is None and name in ALIAS:
            shown = ALIAS[name]               # secondo tentativo con il nome abbreviato
            w = text_w(shown)
            for anc, dx, dy in CANDIDATES:
                bx = label_box(x, y, anc, dx, dy, w)
                if bx[0] < 6 or bx[2] > VB_W - 6 or bx[1] < 4 or bx[3] > VB_H - 4:
                    continue
                if any(overlaps(bx, b) for b in boxes):
                    continue
                chosen = (anc, dx, dy, bx)
                break
        if chosen is None:
            continue                          # nessuna posizione libera: niente etichetta
        out[name] = (chosen[0], chosen[1], chosen[2], shown)
        boxes.append(chosen[3])
    return out


def check_labels(nome, stops, labels):
    """Un nome da etichettare che non e' fra le tappe e' un residuo: va segnalato,
    altrimenti resta silenzioso come e' successo con Quimper sulla mappa B."""
    assert isinstance(labels, list), nome + ": le etichette devono essere una lista ordinata"
    noti = {s[0] for s in stops}
    orfani = [n for n in labels if n not in noti]
    assert not orfani, "%s: etichette che non corrispondono a nessuna tappa: %s" % (nome, orfani)

# ---------------------------------------------------------------- proiezione

def merc_y(lat):
    return math.log(math.tan(math.pi / 4.0 + math.radians(lat) / 2.0))

def merc_x(lon):
    return math.radians(lon)

def build_projection(stops):
    """viewBox fisso 1000x620: lon dai punti +6%, lat derivata per rispettare l'aspetto."""
    lons = [s[2] for s in stops]
    lats = [s[1] for s in stops]
    x0, x1 = merc_x(min(lons)), merc_x(max(lons))
    pad = (x1 - x0) * MARGIN
    x0 -= pad
    x1 += pad
    yc = (merc_y(min(lats)) + merc_y(max(lats))) / 2.0
    yspan = (x1 - x0) * VB_H / VB_W
    y0, y1 = yc - yspan / 2.0, yc + yspan / 2.0
    # verifica copertura minima richiesta dal brief
    scale = VB_W / (x1 - x0)

    def proj(lat, lon):
        return ((merc_x(lon) - x0) * scale, (y1 - merc_y(lat)) * scale)

    return proj, (x0, x1, y0, y1)

def inv_lonlat(x0, x1, y0, y1):
    """bbox geografico corrispondente, per il filtro dei dati."""
    lon0, lon1 = math.degrees(x0), math.degrees(x1)
    lat0 = math.degrees(2 * math.atan(math.exp(y0)) - math.pi / 2)
    lat1 = math.degrees(2 * math.atan(math.exp(y1)) - math.pi / 2)
    return lon0, lon1, lat0, lat1

# ---------------------------------------------------------------- geometria

def sutherland_hodgman(ring, xmin, ymin, xmax, ymax):
    """clip di un anello (chiuso, in px) contro un rettangolo convesso."""
    def clip_edge(pts, inside, isect):
        if not pts:
            return []
        out = []
        n = len(pts)
        for i in range(n):
            cur, nxt = pts[i], pts[(i + 1) % n]
            ci, ni = inside(cur), inside(nxt)
            if ci:
                out.append(cur)
                if not ni:
                    out.append(isect(cur, nxt))
            elif ni:
                out.append(isect(cur, nxt))
        return out

    def ix_x(a, b, xv):
        t = (xv - a[0]) / (b[0] - a[0])
        return (xv, a[1] + t * (b[1] - a[1]))

    def ix_y(a, b, yv):
        t = (yv - a[1]) / (b[1] - a[1])
        return (a[0] + t * (b[0] - a[0]), yv)

    p = ring
    p = clip_edge(p, lambda q: q[0] >= xmin, lambda a, b: ix_x(a, b, xmin))
    p = clip_edge(p, lambda q: q[0] <= xmax, lambda a, b: ix_x(a, b, xmax))
    p = clip_edge(p, lambda q: q[1] >= ymin, lambda a, b: ix_y(a, b, ymin))
    p = clip_edge(p, lambda q: q[1] <= ymax, lambda a, b: ix_y(a, b, ymax))
    return p

def dp_simplify(pts, tol):
    """Douglas-Peucker iterativo."""
    n = len(pts)
    if n < 3:
        return pts
    keep = [False] * n
    keep[0] = keep[n - 1] = True
    stack = [(0, n - 1)]
    t2 = tol * tol
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = pts[i]
        bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        seg2 = dx * dx + dy * dy
        best, bi = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            if seg2 == 0.0:
                d2 = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / seg2
                t = 0.0 if t < 0.0 else (1.0 if t > 1.0 else t)
                d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d2 > best:
                best, bi = d2, k
        if best > t2:
            keep[bi] = True
            stack.append((i, bi))
            stack.append((bi, j))
    return [pts[i] for i in range(n) if keep[i]]

def ring_area(pts):
    a = 0.0
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        a += x1 * y2 - x2 * y1
    return abs(a) / 2.0

def fmt(v):
    s = "%.1f" % v
    if s.endswith(".0"):
        s = s[:-2]
    return "-0" if s == "-0" else s

def ring_to_d(pts):
    out = []
    last = None
    for p in pts:
        t = (fmt(p[0]), fmt(p[1]))
        if t != last:
            out.append(t)
            last = t
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    if len(out) < 3:
        return ""
    d = "M" + out[0][0] + " " + out[0][1]
    for t in out[1:]:
        d += "L" + t[0] + " " + t[1]
    return d + "Z"

# ---------------------------------------------------------------- costa

def load_land():
    for name in ("ne10_land.geojson", "ne50_land.geojson"):
        p = os.path.join(HERE, name)
        if os.path.exists(p) and os.path.getsize(p) > 10000:
            with open(p, encoding="utf-8") as fh:
                return name, json.load(fh)
    raise SystemExit("nessun dato Natural Earth trovato")


def coast_path(proj, geo_bbox):
    """Linea di costa 1:10m (LineString): il disegno di dettaglio sopra il
    riempimento generalizzato 1:50m. Restituisce ("", 0) se il file manca."""
    p = os.path.join(HERE, "ne10_coastline.geojson")
    if not os.path.exists(p):
        return "", 0
    with open(p, encoding="utf-8") as fh:
        gj = json.load(fh)
    lon0, lon1, lat0, lat1 = geo_bbox
    glon0, glon1, glat0, glat1 = lon0 - .6, lon1 + .6, lat0 - .6, lat1 + .6
    cx0, cy0, cx1, cy1 = -CLIP_PAD, -CLIP_PAD, VB_W + CLIP_PAD, VB_H + CLIP_PAD
    out, n = [], 0
    for feat in gj["features"]:
        g = feat["geometry"]
        parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        for line in parts:
            xs = [c[0] for c in line]
            ys = [c[1] for c in line]
            if max(xs) < glon0 or min(xs) > glon1 or max(ys) < glat0 or min(ys) > glat1:
                continue
            # spezzo la polilinea nei tratti interni al riquadro di clip
            run = []
            for c in line:
                x, y = proj(c[1], c[0])
                if cx0 <= x <= cx1 and cy0 <= y <= cy1:
                    run.append((x, y))
                else:
                    if len(run) > 1:
                        out.append(run)
                    run = []
            if len(run) > 1:
                out.append(run)
    d = []
    for run in out:
        pts = dp_simplify(run, COAST_TOL)
        if len(pts) < 2:
            continue
        n += 1
        d.append("M" + " L".join("%s %s" % (fmt(a), fmt(b)) for a, b in pts))
    return "".join(d), n

def land_path(gj, proj, geo_bbox):
    lon0, lon1, lat0, lat1 = geo_bbox
    # margine geografico generoso: il clip vero avviene in px
    glon0, glon1 = lon0 - 1.0, lon1 + 1.0
    glat0, glat1 = lat0 - 1.0, lat1 + 1.0
    cx0, cy0 = -CLIP_PAD, -CLIP_PAD
    cx1, cy1 = VB_W + CLIP_PAD, VB_H + CLIP_PAD

    rings = []
    for feat in gj["features"]:
        g = feat["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poly in polys:
            for ring in poly:
                # scarto rapido: l'anello interseca il bbox geografico?
                xs = [c[0] for c in ring]
                ys = [c[1] for c in ring]
                if max(xs) < glon0 or min(xs) > glon1 or max(ys) < glat0 or min(ys) > glat1:
                    continue
                px = [proj(c[1], c[0]) for c in ring]
                cl = sutherland_hodgman(px, cx0, cy0, cx1, cy1)
                if len(cl) < 3:
                    continue
                if ring_area(cl) < MIN_AREA:
                    continue
                rings.append(dp_simplify(cl, SIMPL_TOL))
    rings.sort(key=ring_area, reverse=True)
    return "".join(filter(None, (ring_to_d(r) for r in rings))), len(rings)

# ---------------------------------------------------------------- SVG

STYLE = """
.mp-sea{fill:var(--map-sea,#f2f6f5)}
.mp-coast{fill:none;stroke:var(--map-coast,#93a9a4);stroke-width:1.1;stroke-linejoin:round;stroke-linecap:round}
.mp-route{fill:none;stroke:var(--map-route,#1f6f6b);stroke-width:3;stroke-linejoin:round;stroke-linecap:round}
.mp-transfer{stroke:var(--map-transfer,#8aa3a1);stroke-width:2.4;stroke-dasharray:9 7}
.mp-stop{fill:var(--map-stop,#f7fafa);stroke:var(--map-route,#1f6f6b);stroke-width:2.2}
.mp-gateway{fill:var(--map-gateway,#1f6f6b);stroke:var(--map-stop,#f7fafa);stroke-width:2}
.mp-eclipse{fill:var(--map-eclipse,#c4531d);stroke:var(--map-stop,#f7fafa);stroke-width:2.4}
.mp-eclipse-ring{fill:none;stroke:var(--map-eclipse,#c4531d);stroke-width:1.6;stroke-dasharray:4 4;opacity:.85}
.mp-label{fill:var(--map-label,#26332f);stroke:var(--map-halo,#eef4f5);stroke-width:3.2;
  font-family:var(--map-font,system-ui,sans-serif);font-size:16px;font-weight:600}
.mp-a{cursor:pointer}
.mp-a:focus-visible .mp-stop,.mp-a:focus-visible .mp-eclipse{stroke:var(--map-focus,#0b4f8a);stroke-width:3.4}
.mp-a:hover .mp-stop{fill:var(--map-route,#1f6f6b)}
.mp-opt{fill:var(--map-stop,#f7fafa);stroke:var(--map-route,#1f6f6b);stroke-width:1.8;
  stroke-dasharray:3 2.4}
.mp-opt-label{fill:var(--map-label,#26332f);stroke:var(--map-halo,#eef4f5);stroke-width:3.2;
  font-family:var(--map-font,system-ui,sans-serif);font-size:15px;font-weight:600;font-style:italic}
.mp-t{fill:none;stroke:var(--map-target,#c4531d);stroke-width:0}
.mp-t:target{stroke-width:3}
.mp-legend{font-family:var(--map-font,system-ui,sans-serif);font-size:14px;fill:var(--map-label,#26332f)}
.mp-legend rect{fill:var(--map-halo,#eef4f5);opacity:.86}
"""


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
             .replace('"', "&quot;"))


def build_svg(key, stops, transfers, labels, pid, title, desc, land_d, note, options=None):
    proj, _ = PROJ[key]
    pts = [proj(s[1], s[2]) for s in stops]
    days = DAY_TITLES[key]

    L = []
    L.append('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %s %s" '
             'preserveAspectRatio="xMidYMid meet" role="img" '
             'aria-labelledby="%st %sd" class="mappa-itinerario">'
             % (fmt(VB_W), fmt(VB_H), pid, pid))
    L.append('<title id="%st">%s</title>' % (pid, esc(title)))
    L.append('<desc id="%sd">%s</desc>' % (pid, esc(desc)))
    L.append("<style>%s</style>" % STYLE.strip())
    L.append('<defs><clipPath id="%sc"><rect width="%s" height="%s"/></clipPath></defs>'
             % (pid, fmt(VB_W), fmt(VB_H)))
    L.append('<rect class="mp-sea" width="%s" height="%s"/>' % (fmt(VB_W), fmt(VB_H)))
    if COAST_D:
        L.append('<path class="mp-coast" clip-path="url(#%sc)" d="%s"/>' % (pid, COAST_D))

    # --- rotta: raggruppo i segmenti consecutivi dello stesso tipo
    n = len(pts)
    closed = list(range(n)) + [0]          # torna a Beauvais
    segs = []
    for i in range(n):
        a, b = closed[i], closed[i + 1]
        t = i in transfers
        if segs and segs[-1][0] == t:
            segs[-1][1].append(b)
        else:
            segs.append([t, [a, b]])
    for is_tr, idxs in segs:
        d = "M" + " L".join("%s %s" % (fmt(pts[i][0]), fmt(pts[i][1])) for i in idxs)
        cls = "mp-route mp-transfer" if is_tr else "mp-route"
        L.append('<path class="%s" d="%s"/>' % (cls, d))

    # --- tappe
    L.append('<g>')
    for (name, lat, lon, day, kind), (x, y) in zip(stops, pts):
        X, Y = fmt(x), fmt(y)
        if kind == "eclipse":
            tt = "%s — 12 agosto, 20:19 — massimo dell'eclissi (%s)" % (name, days[day])
            body = ('<circle class="mp-eclipse-ring" cx="%s" cy="%s" r="13"/>'
                    '<circle class="mp-eclipse" cx="%s" cy="%s" r="8"><title>%s</title></circle>'
                    % (X, Y, X, Y, esc(tt)))
        elif kind == "gateway":
            tt = ("%s — aeroporto di arrivo e di partenza: %s, %s"
                  % (name, days["g1"], days["g11"]))
            body = ('<circle class="mp-gateway" cx="%s" cy="%s" r="6.5">'
                    '<title>%s</title></circle>' % (X, Y, esc(tt)))
        else:
            tt = "%s — %s" % (name, days[day])
            body = ('<circle class="mp-stop" cx="%s" cy="%s" r="5">'
                    '<title>%s</title></circle>' % (X, Y, esc(tt)))
        L.append('<a class="mp-a" href="#%s" aria-label="%s">%s</a>' % (day, esc(tt), body))
    L.append('</g>')

    # --- tappe opzionali: cerchio tratteggiato, non collegato alla rotta
    if options:
        L.append('<g>')
        for name, lat, lon, day, tt in options:
            x, y = proj(lat, lon)
            L.append('<a class="mp-a" href="#%s" aria-label="%s">'
                     '<circle class="mp-opt" cx="%s" cy="%s" r="5.5"><title>%s</title></circle></a>'
                     % (day, esc(tt), fmt(x), fmt(y), esc(tt)))
        L.append('</g>')

    # --- evidenziazione via :target (anello attorno alla tappa della giornata aperta)
    L.append('<g>')
    seen = set()
    for (name, lat, lon, day, kind), (x, y) in zip(stops, pts):
        if day in seen:
            continue
        seen.add(day)
        L.append('<circle class="mp-t" id="%s-map" cx="%s" cy="%s" r="11"/>'
                 % (day, fmt(x), fmt(y)))
    L.append('</g>')

    # --- etichette (posizioni calcolate, non a mano)
    occupati = []
    riservati = [(6, 6, 274, 106 if options else 92)]          # riquadro legenda
    placed = auto_labels(stops, pts, labels, riservati, occupati)
    skipped = [n for n in labels if n not in placed]
    L.append('<g class="mp-labels" paint-order="stroke" aria-hidden="true">')
    for (name, lat, lon, day, kind), (x, y) in zip(stops, pts):
        if name not in placed:
            continue
        anc, dx, dy, shown = placed[name]
        L.append('<text class="mp-label" x="%s" y="%s" text-anchor="%s">%s</text>'
                 % (fmt(x + dx), fmt(y + dy), anc, esc(shown)))
    L.append('</g>')
    if skipped:
        print("   etichette senza spazio: %s" % ", ".join(skipped))
    if options:
        L.append('<g class="mp-labels" paint-order="stroke" aria-hidden="true">')
        for name, lat, lon, day, tt in options:
            x, y = proj(lat, lon)
            occupati.append((x - 9, y - 9, x + 9, y + 9))
        for name, lat, lon, day, tt in options:
            x, y = proj(lat, lon)
            w = text_w(name)
            scelta = None
            for anc, dx, dy in CANDIDATES:
                bx = label_box(x, y, anc, dx, dy, w)
                if bx[0] < 6 or bx[2] > VB_W - 6 or bx[1] < 4 or bx[3] > VB_H - 4:
                    continue
                if any(overlaps(bx, b) for b in occupati):
                    continue
                scelta = (anc, dx, dy, bx)
                break
            if scelta is None:
                print("   etichetta opzionale senza spazio: %s" % name)
                continue
            occupati.append(scelta[3])
            L.append('<text class="mp-opt-label" x="%s" y="%s" text-anchor="%s">%s</text>'
                     % (fmt(x + scelta[1]), fmt(y + scelta[2]), scelta[0], esc(name)))
        L.append('</g>')

    # --- legenda
    ly = 14
    L.append('<g class="mp-legend" aria-hidden="true">')
    L.append('<rect x="12" y="%s" width="248" height="%s" rx="10"/>'
             % (fmt(ly), "92" if options else "70"))
    L.append('<path class="mp-route" d="M28 %s L62 %s"/>' % (fmt(ly + 18), fmt(ly + 18)))
    L.append('<text x="72" y="%s">giornata sul posto</text>' % fmt(ly + 23))
    L.append('<path class="mp-route mp-transfer" d="M28 %s L62 %s"/>' % (fmt(ly + 40), fmt(ly + 40)))
    L.append('<text x="72" y="%s">trasferimento lungo</text>' % fmt(ly + 45))
    L.append('<circle class="mp-eclipse" cx="45" cy="%s" r="6"/>' % fmt(ly + 60))
    L.append('<text x="72" y="%s">%s</text>' % (fmt(ly + 65), esc(note)))
    if options:
        L.append('<circle class="mp-opt" cx="45" cy="%s" r="5.5"/>' % fmt(ly + 80))
        L.append('<text x="72" y="%s">tappa opzionale</text>' % fmt(ly + 85))
    L.append('</g>')

    L.append('</svg>')
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------- main

PROJ = {}
COAST_D = ""

def main():
    src, gj = load_land()
    print("dati costa:", src)

    check_labels("A", A_STOPS, A_LABELS)
    check_labels("B", B_STOPS, B_LABELS)

    allstops = A_STOPS + B_STOPS
    proj, box = build_projection(allstops)   # STESSA proiezione per le due mappe
    PROJ["A"] = (proj, box)
    PROJ["B"] = (proj, box)
    geo = inv_lonlat(*box)
    print("bbox geografico: lon %.3f .. %.3f  lat %.3f .. %.3f" % geo)

    land_d, nrings = land_path(gj, proj, geo)
    print("anelli terra: %d, lunghezza path: %d char" % (nrings, len(land_d)))
    global COAST_D
    COAST_D, nlines = coast_path(proj, geo)
    print("linea di costa 1:10m: %d tratti, %d char" % (nlines, len(COAST_D)))

    specs = [
        ("A", "mappa-bretagna.svg", A_STOPS, A_TRANSFER, A_LABELS, "mba",
         "Mappa dell'itinerario in Bretagna: 11 giorni da Parigi-Beauvais lungo la "
         "costa nord fino al Finistère e ritorno",
         "Mappa schematica della Francia nord-occidentale. Dall'aeroporto di "
         "Parigi-Beauvais, in alto a destra, un lungo trasferimento tratteggiato "
         "raggiunge il Mont-Saint-Michel; da qui la rotta continua a ovest lungo la "
         "costa bretone — Saint-Malo e Cancale, Dinan e Cap Fréhel, la Côte de "
         "Granit Rose a Ploumanac'h — fino all'estremità occidentale della penisola "
         "con la Presqu'île de Crozon, Locronan e la Pointe du Raz. A Penmarc'h, "
         "sulla punta sud-occidentale, un cerchio più grande con anello concentrico "
         "segna il punto di osservazione dell'eclissi solare del 12 agosto 2026. "
         "La rotta risale poi verso est lungo la costa meridionale — Quimper, "
         "Concarneau e Pont-Aven, la base sottomarina di Lorient, i megaliti di "
         "Carnac e il Golfo del Morbihan a Vannes, la foresta di Brocéliande — e si "
         "chiude con un secondo "
         "trasferimento tratteggiato via Rouen fino a Beauvais. In totale circa "
         "1.950 chilometri. Ogni cerchio è un collegamento alla giornata "
         "corrispondente della guida."),
        ("B", "mappa-normandia-bretagna.svg", B_STOPS, B_TRANSFER, B_LABELS, "mbb",
         "Mappa dell'itinerario Normandia e Bretagna: 11 giorni da Parigi-Beauvais "
         "lungo la Manica e la costa bretone fino al Finistère e ritorno lungo la Senna",
         "Mappa schematica della Francia nord-occidentale. Dall'aeroporto di "
         "Parigi-Beauvais, in alto a destra, la rotta scende su Rouen e prosegue "
         "verso nord-ovest lungo la Costa d'Alabastro fino a Étretat e a Le Havre, "
         "all'estuario della Senna. Segue il tratto normanno delle spiagge dello "
         "Sbarco — Bayeux, Arromanches, Colleville-sur-Mer e la Pointe du Hoc — "
         "quindi il Mont-Saint-Michel e il Menhir du Champ-Dolent, appena passato il "
         "confine con la Bretagna. La rotta continua "
         "a ovest per Saint-Malo, Cap Fréhel e la Côte de Granit Rose a Ploumanac'h, "
         "poi Roscoff, Le Conquet e la Pointe Saint-Mathieu, alla punta estrema del "
         "Finistère. Scende quindi "
         "lungo la costa atlantica alla Pointe de Pen-Hir e alla Pointe du Raz: alla "
         "Pointe du Van, accanto a quest'ultima, un cerchio più grande con anello "
         "concentrico segna il punto di osservazione dell'eclissi solare del 12 agosto "
         "2026. Seguono Locronan, la spiaggia di Raguénez, la base sottomarina di "
         "Lorient, la penisola di Quiberon e i megaliti di Carnac; poi Rochefort-en-Terre "
         "e la foresta di Brocéliande, un trasferimento tratteggiato verso est fino a "
         "Le Mans, e infine Giverny sulla Senna prima del rientro a Beauvais. In totale "
         "2.016 chilometri misurati. Ogni cerchio è un collegamento alla giornata "
         "corrispondente della guida."),
    ]

    for key, fname, stops, tr, labels, pid, title, desc in specs:
        svg = build_svg(key, stops, tr, labels, pid, title, desc, land_d,
                        "eclissi del 12 agosto",
                        options=(B_OPTIONS if key == "B" else A_OPTIONS))
        path = os.path.join(OUT, fname)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        # verifica coordinate dentro il viewBox
        pj = PROJ[key][0]
        bad = []
        for s in stops:
            x, y = pj(s[1], s[2])
            if not (0 <= x <= VB_W and 0 <= y <= VB_H):
                bad.append((s[0], round(x, 1), round(y, 1)))
        print("%-34s %6.1f KB  tappe fuori viewBox: %s"
              % (fname, os.path.getsize(path) / 1024.0, bad or "nessuna"))

    # tabella coordinate per il controllo di plausibilita'
    print("\ncontrollo plausibilita' (px):")
    pj = PROJ["A"][0]
    for nm, lat, lon in [("Pointe du Raz", 48.0386, -4.7361), ("Beauvais", 49.4544, 2.1128),
                         ("Étretat", 49.7072, 0.2039), ("Penmarc'h", 47.7986, -4.3736),
                         ("Carnac", 47.5850, -3.0800)]:
        x, y = pj(lat, lon)
        print("   %-16s x=%6.1f y=%6.1f" % (nm, x, y))


if __name__ == "__main__":
    main()
