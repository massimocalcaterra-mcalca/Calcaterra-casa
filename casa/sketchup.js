/* Genera i dati geometrici per il modello SketchUp a partire da `modello.js`.
 *
 *   node casa/sketchup.js
 *
 * Stampa tre tabelle Python — MURI, SOLAI, ARREDO — da incollare nello script
 * che costruisce il modello (connettore SketchUp). Si passa da qui e non si
 * scrivono le coordinate a mano, cosi' il 3D non puo' divergere dalla pianta:
 * cambia il modello, si rigenera, e il file .skp torna d'accordo con il disegno.
 *
 * Conversioni fatte qui: metri -> pollici (SketchUp lavora in pollici) e
 * ribaltamento dell'asse Y, perche' nel modello Y cresce verso la strada
 * mentre in SketchUp conviene che il cortile stia in alto.
 *
 * I muri sono elencati sotto come rettangoli affiancati che non si
 * sovrappongono: e' l'unico pezzo che non viene dal modello, perche' il
 * modello descrive i vani e non la massa muraria.
 */
global.window = {};
require(__dirname + '/modello.js');
const M = window.MODELLO;
const YMAX = 14.50, IN = 39.3701;            // metri -> pollici, e ribaltamento dell'asse Y
const ap = {}; M.aperture.forEach(a => ap[a.id] = a);
const f = n => (n * IN).toFixed(2);

// finestre: davanzale e architrave stimati; porte e passaggi da terra
const Z = { finestra: [0.95, 2.70], porta: [0, 2.10], arco: [0, 2.40], passaggio: [0, 2.20] };
function z(id){ return Z[ap[id].tipo] || Z.porta; }

// muri: nome, direzione, rettangolo in pianta, altezza, aperture (in coordinata locale)
const W = [
 ["Muro_Nord_cortile","x",0.73,0.00,5.57,0.74,3.20,[["fin-cucina",1.22,2.44],["fin-bagno",3.60,4.90]]],
 ["Muro_Sud_strada","x",0.00,13.84,5.57,14.50,3.20,[["fin-camera-ovest",0.75,1.98],["fin-camera-est",3.43,4.90]]],
 ["Muro_Ovest","y",0.00,2.46,0.31,14.50,3.20,[]],
 ["Muro_Ovest_alto","y",0.73,0.74,0.87,2.09,3.20,[]],
 ["Muro_Ovest_risvolto","x",0.00,2.09,0.87,2.46,3.20,[]],
 ["Muro_Est_vano_scale","y",5.34,0.74,5.57,13.84,3.20,[["porta-ingresso",5.86,6.76]]],
 ["Muro_di_spina","x",0.31,7.05,5.34,7.63,3.20,[["passaggio-camera",3.79,4.89]]],
 ["Tramezza_cucina_bagno","y",3.17,0.74,3.34,7.05,3.20,[["arco-cucina",5.67,6.57]]],
 ["Tramezza_bagno_ingresso","x",3.34,5.23,5.34,5.38,3.20,[["porta-bagno",3.91,4.76]]],
 ["Tramezza_camere","y",3.20,7.63,3.32,13.84,3.20,[["porta-camera-ovest",7.95,8.75]]],
 ["Tramezza_disimpegno","x",3.32,8.93,5.34,9.05,3.20,[["porta-camera-est",3.80,4.60]]]
];

const righe = W.map(([nome,dir,x0,y0,x1,y1,h,aperture]) => {
  const L = dir === "x" ? (x1 - x0) : (y1 - y0);
  const T = dir === "x" ? (y1 - y0) : (x1 - x0);
  const ops = aperture.map(([id,a,b]) => {
    const [u0,u1] = dir === "x" ? [a - x0, b - x0] : [y1 - b, y1 - a];
    const [za,zb] = z(id);
    return `(${f(u0)},${f(u1)},${f(za)},${f(zb)})`;
  }).join(",");
  // origine del gruppo: angolo a minori X e minori Y in coordinate SketchUp
  const ox = dir === "x" ? x0 : x0;
  const oy = dir === "x" ? (YMAX - y1) : (YMAX - y1);
  return `  ("${nome}","${dir}",${f(L)},${f(T)},${f(h)},[${ops}],${f(ox)},${f(oy)}),`;
});

const arr = M.arredo.filter(a => a.tipo !== "ingombro").map(a => {
  const st = M.stanze.find(s => s.id === a.stanza);
  const nome = (a.nome || a.id).replace(/"/g,"'");
  return `  ("${a.id}","${nome}","${a.tipo}",${f(a.x)},${f(YMAX - (a.y + a.h))},${f(a.w)},${f(a.h)},${f(a.alt)}),`;
});

const solai = [["Solaio_sud",0.00,2.09,5.57,14.50],["Solaio_nord",0.73,0.00,5.57,2.09]]
  .map(([n,x0,y0,x1,y1]) => `  ("${n}",${f(x0)},${f(YMAX-y1)},${f(x1-x0)},${f(y1-y0)}),`);

console.log("MURI = [\n" + righe.join("\n") + "\n]\n");
console.log("SOLAI = [\n" + solai.join("\n") + "\n]\n");
console.log("ARREDO = [\n" + arr.join("\n") + "\n]");
