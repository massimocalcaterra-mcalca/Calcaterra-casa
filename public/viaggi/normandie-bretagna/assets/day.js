/* Mappa, posizione e meteo delle pagine di giornata. Nessun dato lascia mai
   il browser di chi legge: la posizione (se concessa) resta nella pagina,
   usata solo per calcolare distanze; il meteo e' una richiesta pubblica ad
   Open-Meteo con le sole coordinate della tappa, senza account ne' chiave. */
(function(){
"use strict";

function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

/* distanza in km fra due punti (formula dell'emisenoverso) */
function haversine(lat1,lon1,lat2,lon2){
  const R=6371, rad=Math.PI/180;
  const dLat=(lat2-lat1)*rad, dLon=(lon2-lon1)*rad;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*rad)*Math.cos(lat2*rad)*Math.sin(dLon/2)**2;
  return R*2*Math.asin(Math.sqrt(a));
}

function fmtKm(km){ return km<1 ? Math.round(km*1000)+" m" : km.toFixed(km<10?1:0)+" km"; }

/* Link a un posto su Google Maps, nel formato ufficiale che i telefoni
   riconoscono come link dell'applicazione: su Android apre (o propone)
   l'app, su iPhone apre Google Maps se e' installato, altrimenti la mappa
   nel browser. Con il nome e l'indirizzo si arriva alla scheda del posto —
   foto, orari, recensioni, indicazioni — invece che a uno spillo anonimo.
   Le coordinate restano la via di riserva quando il nome non c'e'. */
function urlPosto(nome){
  return "https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(nome);
}
function urlMappe(lat,lon){
  return "https://www.google.com/maps/search/?api=1&query="+lat+","+lon;
}
function linkMappe(href){
  return '<a class="gmaps" href="'+href+'" target="_blank" rel="noopener">Apri in mappe</a>';
}

/* --- mappa ------------------------------------------------------------ */
function initMap(containerId, opts){
  const el=document.getElementById(containerId);
  if(!el || typeof L==="undefined") return null;
  const map=L.map(containerId,{scrollWheelZoom:false}).setView(opts.center, opts.zoom||14);
  /* Il credito a Leaflet resta, la bandiera no. Dalla 1.9 Leaflet infila di
     suo una bandiera ucraina accanto al proprio nome nell'attribuzione: e'
     una presa di posizione della libreria, non nostra, e su una guida di
     viaggio non ci sta. setPrefix e' il modo previsto per sostituirla. */
  map.attributionControl.setPrefix(
    '<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
  /* Sfondo CARTO Voyager: gli stessi dati di OpenStreetMap, disegnati con
     uno stile piu' pulito e vicino a quello a cui siamo abituati. Gratuito
     con l'attribuzione, senza chiave e senza cookie. {r} lo riempie Leaflet
     con @2x sugli schermi ad alta densita', cosi' resta nitido sul telefono. */
  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",{
    maxZoom:20, subdomains:"abcd",
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors, '
      +'&copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>'
  }).addTo(map);
  const markers={};
  (opts.stops||[]).forEach(s=>{
    const icon=L.divIcon({className:"pin "+(s.kind||"tappa"), iconSize:[15,15], html:""});
    const m=L.marker([s.lat,s.lon],{icon,title:s.name,keyboard:true,alt:s.name}).addTo(map);
    /* popupHtml arriva da localiDalDOM, cioe' da markup che abbiamo scritto
       noi in pagina: e' l'unico caso in cui non ri-scappiamo il contenuto. */
    let popup=s.popupHtml;
    if(!popup){
      popup='<div class="popnome">'+esc(s.name)+"</div>";
      if(s.note) popup+='<div class="popmeta">'+esc(s.note)+"</div>";
    }
    /* ogni fumetto porta il link per aprire il punto nelle mappe del
       telefono. Le schede dei locali il loro l'hanno gia' dentro. */
    if(!/class="gmaps"/.test(popup)) popup+=linkMappe(s.maps || urlMappe(s.lat,s.lon));
    m.bindPopup(popup);
    markers[s.id]=m;
  });
  return {map,markers};
}

/* --- i locali dove mangiare, letti dalla pagina -------------------------
   La fonte unica e' l'HTML della sezione "Dove mangiare": ogni scheda porta
   le coordinate negli attributi data- e il menu dentro il suo <details>.
   La mappa rilegge da li', cosi' un prezzo corretto nel testo si corregge
   da solo anche nel fumetto, e le due cose non possono divergere. */
function localiDalDOM(sel){
  const nodi=document.querySelectorAll(sel||".locale[data-lat]");
  return Array.from(nodi).map((el,i)=>{
    const testo=c=>{ const n=el.querySelector(c); return n?n.textContent.trim():""; };
    const nome=testo(".lnome"), meta=testo(".lmeta");
    const menu=el.querySelector(".lmenu ul");
    const gm=el.querySelector(".lnome a[href]") || el.querySelector("a.gmaps");
    let html='<div class="popnome">'+esc(nome)+'</div>';
    if(meta) html+='<div class="popmeta">'+esc(meta)+'</div>';
    if(menu) html+='<ul class="popmenu">'+menu.innerHTML+'</ul>';
    if(gm) html+=linkMappe(gm.getAttribute("href"));
    return {id:el.id||("locale-"+i), name:nome, kind:"cibo",
            lat:parseFloat(el.dataset.lat), lon:parseFloat(el.dataset.lon),
            popupHtml:html};
  }).filter(s=>s.name && isFinite(s.lat) && isFinite(s.lon));
}

/* --- posizione del dispositivo e tappe vicine -------------------------- */
function wireGeolocation(cfg){
  const btn=document.getElementById(cfg.btnId);
  const msg=document.getElementById(cfg.msgId);
  const panel=document.getElementById(cfg.panelId);
  const list=document.getElementById(cfg.listId);
  if(!btn) return;

  function setMsg(t,isErr){ if(msg){ msg.textContent=t||""; msg.classList.toggle("err",!!isErr); } }

  if(!("geolocation" in navigator)){
    btn.disabled=true;
    setMsg("Il tuo browser non supporta la localizzazione.", true);
    return;
  }

  btn.addEventListener("click",()=>{
    btn.disabled=true; setMsg("Localizzazione in corso…");
    navigator.geolocation.getCurrentPosition(pos=>{
      btn.disabled=false;
      const ulat=pos.coords.latitude, ulon=pos.coords.longitude;
      const classificate=cfg.stops.map(s=>Object.assign({},s,{km:haversine(ulat,ulon,s.lat,s.lon)}))
                                   .sort((a,b)=>a.km-b.km);
      const vicine=classificate.filter(s=>s.km<=3).slice(0,6);
      const daMostrare=vicine.length?vicine:classificate.slice(0,3);

      Object.values(cfg.markers||{}).forEach(m=>{ if(m._icon) m._icon.classList.remove("vicino"); });
      daMostrare.forEach(s=>{ const m=(cfg.markers||{})[s.id]; if(m && m._icon) m._icon.classList.add("vicino"); });

      if(list){
        list.innerHTML=daMostrare.map(s=>
          '<li><span>'+(s.kind==="cibo"?'<span class="vcibo">mangiare</span>':'')
          +esc(s.name)+'</span><span class="dist">'+fmtKm(s.km)+'</span></li>'
        ).join("");
      }
      if(panel) panel.classList.add("on");
      setMsg(vicine.length
        ? "Trovate "+vicine.length+" tappe entro 3 km dalla tua posizione."
        : "Nessuna tappa qui vicino in questo momento: ecco le tre più vicine.");
    }, err=>{
      btn.disabled=false;
      const testo = err.code===1 ? "Permesso negato: puoi comunque esplorare la mappa a mano."
                  : err.code===2 ? "Posizione non disponibile in questo momento."
                  : "Richiesta scaduta, riprova.";
      setMsg(testo, true);
    },{enableHighAccuracy:false, timeout:12000, maximumAge:60000});
  });
}

/* --- meteo --------------------------------------------------------------
   Tre casi, scelti confrontando la data della giornata con oggi:
     giorno di oggi   -> il tempo che fa sul posto in questo momento,
                         piu' le minime e massime della giornata
     giorno futuro    -> la previsione per quella data, quando c'e':
                         l'orizzonte e' di circa 16 giorni, deciso da
                         Open-Meteo. Prima di allora si dice da quando
                         la previsione comparira', senza inventarla.
     giorno passato   -> il tempo che c'e' stato davvero quel giorno,
                         con la pioggia caduta in millimetri invece
                         della probabilita', che a cose fatte non serve.
   Una sola chiamata copre da 92 giorni indietro a 15 avanti; per le date
   piu' vecchie si passa all'archivio ERA5, che tiene memoria di tutto.
   Cosi' il riquadro dice sempre qualcosa di vero, e non spaccia mai una
   previsione per un ricordo. */
const WMO={
  0:"sereno",1:"prevalentemente sereno",2:"parzialmente nuvoloso",3:"coperto",
  45:"nebbia",48:"nebbia con brina",
  51:"pioviggine leggera",53:"pioviggine",55:"pioviggine fitta",
  56:"pioviggine gelata",57:"pioviggine gelata fitta",
  61:"pioggia leggera",63:"pioggia",65:"pioggia forte",
  66:"pioggia gelata",67:"pioggia gelata forte",
  71:"neve leggera",73:"neve",75:"neve forte",77:"granelli di neve",
  80:"rovesci leggeri",81:"rovesci",82:"rovesci forti",
  85:"rovesci di neve",86:"rovesci di neve forti",
  95:"temporale",96:"temporale con grandine",99:"temporale con grandine forte"
};
function wmoText(code){ return WMO[code] || "condizioni variabili"; }

function oggiISO(){
  const d=new Date(), p=n=>String(n).padStart(2,"0");
  return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());
}
/* differenza in giorni fra due date ISO: mezzogiorno UTC per non farsi
   sballare dall'ora legale */
function scartoGiorni(da,a){
  return Math.round((Date.parse(a+"T12:00:00Z")-Date.parse(da+"T12:00:00Z"))/86400000);
}
async function chiediJSON(u){
  const r=await fetch(u.toString());
  if(!r.ok) throw new Error("http "+r.status);
  return r.json();
}
const DAILY="weather_code,temperature_2m_max,temperature_2m_min," +
            "precipitation_probability_max,precipitation_sum";

async function initWeather(containerId, opts){
  const el=document.getElementById(containerId);
  if(!el) return;
  el.className="meteo loading"; el.textContent="Meteo…";

  const oggi=oggiISO(), scarto=scartoGiorni(oggi,opts.dateISO);

  try{
    let d;
    if(scarto>15){
      /* fuori orizzonte: non si inventa nulla, si dice solo da quando
         la previsione sara' disponibile */
      el.className="meteo off";
      el.innerHTML='<span class="lbl">'+esc(opts.label)+'</span>'
        +'<span>previsioni dal '+dataBreve(opts.dateISO,-15)+'</span>';
      return;
    }
    if(scarto>=-90){
      const u=new URL("https://api.open-meteo.com/v1/forecast");
      u.searchParams.set("latitude",opts.lat);
      u.searchParams.set("longitude",opts.lon);
      u.searchParams.set("daily",DAILY);
      u.searchParams.set("timezone","Europe/Paris");
      u.searchParams.set("past_days", scarto<0 ? Math.min(92,-scarto+1) : 0);
      u.searchParams.set("forecast_days", scarto>0 ? Math.min(16,scarto+1) : 1);
      if(scarto===0) u.searchParams.set("current","temperature_2m,weather_code,wind_speed_10m");
      d=await chiediJSON(u);
    }else{
      const u=new URL("https://archive-api.open-meteo.com/v1/archive");
      u.searchParams.set("latitude",opts.lat);
      u.searchParams.set("longitude",opts.lon);
      u.searchParams.set("start_date",opts.dateISO);
      u.searchParams.set("end_date",opts.dateISO);
      u.searchParams.set("daily","weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
      u.searchParams.set("timezone","Europe/Paris");
      d=await chiediJSON(u);
    }

    const i=(d.daily && d.daily.time) ? d.daily.time.indexOf(opts.dateISO) : -1;
    if(i<0 && !(scarto===0 && d.current)) throw new Error("giorno non nei dati");
    el.className="meteo";

    if(scarto===0 && d.current){
      /* oggi: quello che sta succedendo adesso, con la forbice del giorno */
      let coda=wmoText(d.current.weather_code)
             +" · vento "+Math.round(d.current.wind_speed_10m)+" km/h";
      if(i>=0) coda+=" · oggi "+Math.round(d.daily.temperature_2m_min[i])
                    +"–"+Math.round(d.daily.temperature_2m_max[i])+"°C";
      el.innerHTML='<span class="lbl">Adesso a '+esc(opts.label)+'</span>'
        +'<span class="t">'+Math.round(d.current.temperature_2m)+'°C</span>'
        +'<span>'+coda+'</span>';
      return;
    }

    const tmin=Math.round(d.daily.temperature_2m_min[i]);
    const tmax=Math.round(d.daily.temperature_2m_max[i]);
    let etichetta, coda=wmoText(d.daily.weather_code[i]);

    if(scarto<0){
      etichetta="Com'è andata il "+opts.dataLeggibile;
      const mm=d.daily.precipitation_sum ? d.daily.precipitation_sum[i] : null;
      if(mm!=null) coda+= mm>0 ? " · pioggia "+mm.toFixed(1).replace(".",",")+" mm"
                               : " · senza pioggia";
    }else{
      etichetta="Previsto per il "+opts.dataLeggibile;
      const pp=d.daily.precipitation_probability_max ? d.daily.precipitation_probability_max[i] : null;
      if(pp!=null) coda+=" · pioggia "+pp+"%";
    }
    el.innerHTML='<span class="lbl">'+etichetta+'</span>'
      +'<span class="t">'+tmin+'–'+tmax+'°C</span><span>'+coda+'</span>';

  }catch(e){
    el.className="meteo off";
    el.textContent="Meteo non disponibile al momento.";
  }
}

/* data ISO spostata di n giorni, scritta come "22 luglio" */
const MESI=["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio",
            "agosto","settembre","ottobre","novembre","dicembre"];
function dataBreve(iso,n){
  const d=new Date(Date.parse(iso+"T12:00:00Z")+(n||0)*86400000);
  return d.getUTCDate()+" "+MESI[d.getUTCMonth()];
}

/* ---------------------------------------------------------------------------
   Mare: temperatura dell'acqua e altezza delle onde, accanto al meteo.
   Solo per le giornate sulla costa — nell'entroterra l'elemento non esiste
   nemmeno e la funzione esce subito.
   L'orizzonte della previsione marina e' piu' corto di quello atmosferico:
   quando il giorno e' ancora troppo lontano l'API restituisce valori nulli, e
   in quel caso si nasconde l'elemento invece di scrivere un errore. Un dato
   sul mare che manca non e' una notizia; una riga di errore sotto la foto di
   apertura sarebbe rumore.
--------------------------------------------------------------------------- */
async function initSea(containerId, opts){
  const el=document.getElementById(containerId);
  if(!el) return;
  el.className="meteo mare loading"; el.textContent="Mare…";
  try{
    const u=new URL("https://marine-api.open-meteo.com/v1/marine");
    u.searchParams.set("latitude",opts.lat);
    u.searchParams.set("longitude",opts.lon);
    u.searchParams.set("daily","sea_surface_temperature_max,wave_height_max");
    u.searchParams.set("timezone","Europe/Paris");
    u.searchParams.set("start_date",opts.dateISO);
    u.searchParams.set("end_date",opts.dateISO);
    const d=await chiediJSON(u);
    const i=(d.daily && d.daily.time) ? d.daily.time.indexOf(opts.dateISO) : -1;
    const t=i>=0 ? d.daily.sea_surface_temperature_max[i] : null;
    const h=i>=0 ? d.daily.wave_height_max[i] : null;
    if(t==null && h==null){ el.style.display="none"; return; }

    el.className="meteo mare";
    let pezzi="";
    if(t!=null) pezzi+='<span class="t">'+Math.round(t)+'°C</span>';
    if(h!=null){
      const m=h.toFixed(1).replace(".",",");
      pezzi+='<span>onde '+m+' m'+(h<0.5?" · piatto":h<1?"":" · mosso")+'</span>';
    }
    el.innerHTML='<span class="lbl">Mare a '+esc(opts.label)+'</span>'+pezzi;
  }catch(e){
    el.style.display="none";
  }
}

/* ---------------------------------------------------------------------------
   Il pulsante "Chiedi": una domanda dalla strada, con la posizione.
   Manda a /api/chiedi la posizione del telefono, l'ora, la giornata che si sta
   leggendo e le tappe della pagina piu' vicine — che sono verificate e sono il
   contesto migliore disponibile — e mostra la risposta.
   Degrada bene per scelta: se la posizione viene negata si chiede lo stesso,
   dicendo che manca; se il servizio non e' configurato si vede il perche' e la
   guida resta intera. Niente qui e' indispensabile per usare la pagina.

   LA CONVERSAZIONE. Le domande successive sono il seguito delle precedenti:
   "dove ceno qui vicino" e poi "a che ora chiude" devono parlare dello stesso
   posto. Lo storico pero' NON sta sul server, che resta senza memoria fra una
   chiamata e l'altra: vive qui, nella pagina, e riparte con ogni domanda.
   Costa qualche centesimo di piu' per il testo in ingresso, e in cambio non
   serve ne' un database ne' un identificativo di sessione da conservare.
   Cambiare giornata azzera tutto, ed e' giusto: la conversazione riguarda dove
   sei adesso.
--------------------------------------------------------------------------- */
function initChiedi(cfg){
  const btn=document.getElementById(cfg.btnId);
  const pan=document.getElementById(cfg.panelId);
  if(!btn||!pan) return;
  const filo=pan.querySelector(".chfilo");
  const inp=pan.querySelector(".chinput");
  const reset=pan.querySelector(".chreset");
  if(!filo) return;
  let posizione=null, inCorso=false;

  /* Tre domande e tre risposte. Oltre, il testo in ingresso cresce senza che la
     risposta migliori: quello che conta davvero e' il contesto di adesso. */
  const storico=[], MAX_BATTUTE=6, MAX_CARATTERI=1200;

  function apri(v){
    pan.hidden=!v; btn.setAttribute("aria-expanded", v?"true":"false");
    if(v && inp) setTimeout(()=>inp.focus(),50);
  }
  btn.addEventListener("click", ()=>apri(pan.hidden));
  const chiudi=pan.querySelector(".chchiudi");
  if(chiudi) chiudi.addEventListener("click", ()=>{apri(false); btn.focus();});
  pan.addEventListener("keydown", e=>{ if(e.key==="Escape"){apri(false); btn.focus();} });

  /* La posizione si chiede una volta sola e si tiene per la sessione: al
     secondo "dove mangio" il telefono non deve ridomandare il permesso. */
  function posizioneOra(){
    return new Promise(res=>{
      if(posizione) return res(posizione);
      if(!navigator.geolocation) return res(null);
      navigator.geolocation.getCurrentPosition(
        p=>{ posizione={lat:p.coords.latitude, lon:p.coords.longitude}; res(posizione); },
        ()=>res(null),
        {enableHighAccuracy:true, timeout:8000, maximumAge:120000});
    });
  }

  /* Le tappe piu' vicine, calcolate qui dalla pagina: cosi' la risposta e'
     ancorata a quello che la guida dice davvero, non alla memoria del modello. */
  function viciniA(pos){
    if(!pos || !Array.isArray(cfg.stops)) return [];
    return cfg.stops
      .filter(s=>isFinite(s.lat)&&isFinite(s.lon))
      .map(s=>({nome:s.name, nota:s.note||"", km:haversine(pos.lat,pos.lon,s.lat,s.lon)}))
      .sort((a,b)=>a.km-b.km).slice(0,10);
  }

  /* Testo, non HTML: quello che torna dal modello non si inietta mai. */
  function blocco(classe, testo){
    const d=document.createElement("div");
    d.className=classe; d.textContent=testo;
    filo.appendChild(d);
    return d;
  }
  function inFondo(){ pan.scrollTop=pan.scrollHeight; }
  function aggiornaReset(){ if(reset) reset.hidden=!filo.firstChild; }

  if(reset) reset.addEventListener("click", ()=>{
    storico.length=0;
    filo.textContent="";
    aggiornaReset();
    if(inp) inp.focus();
  });

  async function chiedi(domanda){
    if(inCorso||!domanda) return;
    inCorso=true;
    blocco("chq", domanda);
    const out=blocco("chrisp attesa","Sto guardando dove sei…");
    aggiornaReset(); inFondo();
    const pos=await posizioneOra();
    out.textContent="Un momento…"; inFondo();
    try{
      const r=await fetch("/api/chiedi",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          domanda:domanda,
          lat:pos?pos.lat:null, lon:pos?pos.lon:null,
          quando:new Date().toLocaleString("it-IT",{weekday:"long",hour:"2-digit",minute:"2-digit"}),
          giorno:cfg.giorno||document.title,
          vicini:viciniA(pos),
          storico:storico
        })
      });
      const d=await r.json().catch(()=>({}));
      if(!r.ok||!d.risposta){
        out.className="chrisp errore";
        out.textContent=d.error||"Non sono riuscito a rispondere adesso.";
        /* Una domanda rimasta senza risposta non entra nello storico: alla
           prossima il modello vedrebbe una battuta sospesa nel vuoto, e l'API
           rifiuta comunque due messaggi di fila con lo stesso ruolo. */
      }else{
        out.className="chrisp";
        out.textContent=d.risposta;
        if(!pos) out.textContent+="\n\n(Senza la posizione del telefono: ho risposto in generale.)";
        storico.push({ruolo:"utente", testo:domanda.slice(0,MAX_CARATTERI)},
                     {ruolo:"guida",  testo:d.risposta.slice(0,MAX_CARATTERI)});
        /* Si tolgono a coppie: lo storico deve restare pari e cominciare da una
           domanda, altrimenti i ruoli non si alternano piu'. */
        while(storico.length>MAX_BATTUTE) storico.splice(0,2);
      }
    }catch(e){
      out.className="chrisp errore";
      out.textContent="Manca la rete, o il servizio non risponde.";
    }
    inCorso=false; inFondo();
  }

  pan.querySelectorAll("[data-chiedi]").forEach(b=>{
    b.addEventListener("click", ()=>chiedi(b.getAttribute("data-chiedi")));
  });
  const form=pan.querySelector("form");
  if(form) form.addEventListener("submit", e=>{
    e.preventDefault();
    const v=inp.value.trim();
    if(v){ chiedi(v); inp.value=""; }
  });
}

window.DayGuide={initMap, wireGeolocation, initWeather, initSea, initChiedi, haversine, localiDalDOM, urlMappe, urlPosto};
})();
