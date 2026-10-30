/* partShop.js — catalog on window + chunk assemble */
(function(){
  var N=11, base="https://raw.githubusercontent.com/KI-king222/Bitcoin-Clicker/main/js/", v="?v=20261030m";
  var booted=false;
  function boot(){
    if(booted) return;
    function run(){
      booted=true;
      var parts=new Array(N), done=0;
      function go(){
        if(done<N) return;
        try{
          (0,eval)("var PART_CATALOG=window.PART_CATALOG;var PART_CATEGORIES=window.PART_CATEGORIES;var PART_BY_ID=window.PART_BY_ID;var state=window.state;var save=window.save;var fmtSats=window.fmtSats;var updateBalanceUI=window.updateBalanceUI;var openBuildOverlay=window.openBuildOverlay;var renderBuildOverlay=window.renderBuildOverlay;"+parts.join(""));
          console.log("[HASHPOOL] partShop open=", !!(window.PartShop&&window.PartShop.open));
        }catch(e){console.error("[HASHPOOL] partShop",e);}
      }
      for(var i=0;i<N;i++)(function(i){
        fetch(base+"ps_c"+i+".js"+v,{cache:"no-store"}).then(function(r){return r.text();}).then(function(t){parts[i]=t;done++;go();}).catch(function(){parts[i]="";done++;go();});
      })(i);
    }
    if(window.PART_CATALOG){ run(); return; }
    if(typeof PART_CATALOG!=="undefined"){
      window.PART_CATALOG=PART_CATALOG;
      window.PART_CATEGORIES=typeof PART_CATEGORIES!=="undefined"?PART_CATEGORIES:Object.keys(PART_CATALOG);
      window.PART_BY_ID=typeof PART_BY_ID!=="undefined"?PART_BY_ID:{};
      run(); return;
    }
    fetch(base+"partCatalog.js"+v,{cache:"no-store"}).then(function(r){return r.text();}).then(function(t){
      (0,eval)(t);
      window.PART_CATALOG=PART_CATALOG;
      window.PART_CATEGORIES=PART_CATEGORIES;
      window.PART_BY_ID=PART_BY_ID;
      run();
    }).catch(function(e){console.error(e);run();});
  }
  setTimeout(boot,100);
  setTimeout(boot,600);
  setTimeout(boot,1500);
})();
