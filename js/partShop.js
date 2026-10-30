/* partShop.js — async assemble from chunks (fixes truncated GH file) */
(function(){
  var N = 11;
  var base = "https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/";
  var v = "?v=20261030i";
  var parts = new Array(N);
  var done = 0;
  function go(){
    if(done < N) return;
    try {
      (0, eval)(parts.join(""));
      console.log("[HASHPOOL] partShop full ("+parts.join("").length+"b)");
    } catch(e){ console.error("[HASHPOOL] partShop eval", e); }
  }
  for(var i=0;i<N;i++){
    (function(i){
      fetch(base + "ps_c" + i + ".js" + v, {cache:"no-store"})
        .then(function(r){ if(!r.ok) throw new Error("ps_c"+i+" "+r.status); return r.text(); })
        .then(function(t){ parts[i]=t; done++; go(); })
        .catch(function(e){ console.error(e); parts[i]=""; done++; go(); });
    })(i);
  }
})();
