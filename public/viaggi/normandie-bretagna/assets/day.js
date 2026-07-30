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

/* --- mappa ------------------------------------------------------------ */
function initMap(containerId, opts){
  const el=document.getElementById(containerId);
  if(!el || typeof L==="undefined") return null;
  const map=L.map(containerId,{scrollWheelZoom:false}).setView(opts.center, opts.zoom||14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);
  const markers={};
  (opts.stops||[]).forEach(s=>{
    const icon=L.divIcon({className:"pin "+(s.kind||"tappa"), iconSize:[15,15], html:""});
    const m=L.marker([s.lat,s.lon],{icon,title:s.name,keyboard:true,alt:s.name}).addTo(map);
    let popup="<strong>"+esc(s.name)+"</strong>";
    if(s.note) popup+="<br>"+esc(s.note);
    m.bindPopup(popup);
    markers[s.id]=m;
  });
  return {map,markers};
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
          '<li><span>'+esc(s.name)+'</span><span class="dist">'+fmtKm(s.km)+'</span></li>'
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

/* --- meteo in tempo reale ----------------------------------------------
   Con la data del giorno ancora dentro l'orizzonte di previsione (~16 giorni,
   deciso da Open-Meteo, non da noi) mostra la previsione per quella data.
   Fuori da quell'orizzonte — troppo presto o perche' il giorno e' gia'
   passato — mostra il meteo attuale sul posto, cosi' il riquadro ha sempre
   qualcosa di vero da dire, mai un dato inventato o una data sbagliata. */
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

async function initWeather(containerId, opts){
  const el=document.getElementById(containerId);
  if(!el) return;
  el.className="meteo loading"; el.textContent="Meteo…";
  try{
    const u=new URL("https://api.open-meteo.com/v1/forecast");
    u.searchParams.set("latitude",opts.lat);
    u.searchParams.set("longitude",opts.lon);
    u.searchParams.set("daily","weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max");
    u.searchParams.set("current","temperature_2m,weather_code,wind_speed_10m");
    u.searchParams.set("timezone","Europe/Paris");
    u.searchParams.set("forecast_days","16");
    const r=await fetch(u.toString());
    if(!r.ok) throw new Error("http "+r.status);
    const d=await r.json();
    const i=(d.daily && d.daily.time) ? d.daily.time.indexOf(opts.dateISO) : -1;
    el.className="meteo";
    if(i>=0){
      const tmax=Math.round(d.daily.temperature_2m_max[i]), tmin=Math.round(d.daily.temperature_2m_min[i]);
      const pp=d.daily.precipitation_probability_max[i];
      el.innerHTML='<span class="lbl">Previsto per il '+opts.dataLeggibile+'</span>'
        +'<span class="t">'+tmin+'–'+tmax+'°C</span>'
        +'<span>'+wmoText(d.daily.weather_code[i])+(pp!=null?" · pioggia "+pp+"%":"")+"</span>";
    } else if(d.current){
      el.innerHTML='<span class="lbl">Adesso a '+esc(opts.label)+'</span>'
        +'<span class="t">'+Math.round(d.current.temperature_2m)+'°C</span>'
        +'<span>'+wmoText(d.current.weather_code)+" · vento "+Math.round(d.current.wind_speed_10m)+" km/h</span>";
    } else {
      throw new Error("dati mancanti");
    }
  }catch(e){
    el.className="meteo off";
    el.textContent="Meteo non disponibile al momento.";
  }
}

window.DayGuide={initMap, wireGeolocation, initWeather, haversine};
})();
