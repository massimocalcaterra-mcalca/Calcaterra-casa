/* Le voci del menu in alto seguono lo scorrimento, non solo il clic: si
   accende quella della sezione che si sta leggendo, e sotto di essa un bordo
   si riempie da sinistra a destra mano a mano che la sezione scorre, così si
   vede anche a che punto della sezione ci si trova.

   Legge la posizione a ogni scorrimento invece di usare IntersectionObserver
   perché serve una frazione continua — quanto della sezione è passato — e non
   soltanto l'entrata e l'uscita. Il calcolo sta dentro requestAnimationFrame,
   quindi gira una volta per fotogramma e non a ogni evento.

   Senza JavaScript non si perde niente: le voci restano link che funzionano. */
(function(){
"use strict";

function avvia(){
  const nav=document.querySelector(".topnav");
  if(!nav) return;
  const barra=document.querySelector(".topbar");

  /* solo le voci che puntano a una sezione esistente in questa pagina:
     i link esterni e quelli ad altre pagine restano fuori */
  const voci=Array.from(nav.querySelectorAll('a[href^="#"]'))
    .map(a=>{
      let sez=null;
      try{ sez=document.getElementById(decodeURIComponent(a.hash.slice(1))); }catch(e){}
      return {a, sez};
    })
    .filter(v=>v.sez);
  if(!voci.length) return;

  /* Ordinate per posizione nel documento, non per ordine nel menu: nella guida
     principale i due ordini non coincidono, e calcolando il confine di una
     sezione sulla voce successiva del menu si finiva per accendere quella
     sbagliata. Il confine giusto e' l'inizio della sezione che viene dopo
     nella pagina. */
  voci.sort((x,y)=>
    x.sez.compareDocumentPosition(y.sez) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

  let inAttesa=false, ultima=-1;

  function misura(){
    inAttesa=false;
    const alto=(barra?barra.getBoundingClientRect().height:0)+8;
    const y=window.scrollY+alto+1;

    /* una sezione arriva fino all'inizio della successiva; l'ultima fino in
       fondo al documento */
    const limiti=voci.map((v,i)=>{
      const cima=v.sez.getBoundingClientRect().top+window.scrollY;
      const succ=voci[i+1];
      const fondo=succ
        ? succ.sez.getBoundingClientRect().top+window.scrollY
        : document.documentElement.scrollHeight;
      return {v, cima, fondo};
    });

    let corrente=-1;
    for(let i=0;i<limiti.length;i++) if(y>=limiti[i].cima) corrente=i;

    voci.forEach(v=>{
      v.a.classList.remove("qui");
      v.a.removeAttribute("aria-current");
      v.a.style.removeProperty("--avanzamento");
    });
    if(corrente<0){ ultima=-1; return; }

    const {v,cima,fondo}=limiti[corrente];
    const quanto=Math.min(1,Math.max(0,(y-cima)/Math.max(1,fondo-cima)));
    v.a.classList.add("qui");
    v.a.setAttribute("aria-current","true");
    v.a.style.setProperty("--avanzamento", quanto.toFixed(4));

    /* sul telefono il menu scorre di lato: quando cambia sezione si porta la
       voce accesa dentro la vista, ma solo al cambio — non a ogni fotogramma,
       o si combatterebbe con chi lo sta scorrendo a mano */
    if(corrente!==ultima){
      ultima=corrente;
      if(nav.scrollWidth>nav.clientWidth+4){
        const r=v.a.getBoundingClientRect(), n=nav.getBoundingClientRect();
        if(r.left<n.left+4 || r.right>n.right-4)
          nav.scrollTo({left:v.a.offsetLeft-nav.clientWidth/2+v.a.offsetWidth/2,
                        behavior:"smooth"});
      }
    }
  }

  function chiedi(){ if(!inAttesa){ inAttesa=true; requestAnimationFrame(misura); } }

  addEventListener("scroll", chiedi, {passive:true});
  addEventListener("resize", chiedi);
  window.addEventListener("load", chiedi);
  misura();
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",avvia);
else avvia();
})();
