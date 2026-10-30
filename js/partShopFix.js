/* partShopFix.js — clear build selection after sell / reopen (soft: keep during active assembly) */
(function(){
  function hasActiveAssembly(){
    try {
      if(typeof state === "undefined") return false;
      if(state._assemblyActive || state.moboCased || state.pasteDone || state.biosDone) return true;
      if(state.buildInstalled){
        for(var k in state.buildInstalled){ if(state.buildInstalled[k]) return true; }
      }
    } catch(e){}
    return false;
  }
  function clearBuildSelectionUI(){
    try {
      if(typeof state === "undefined") return;
      if(hasActiveAssembly()) return; /* soft: don't wipe mid-build */
      state._assemblyActive = false;
      state.buildPick = {};
      if(state.buildBought){
        ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"].forEach(function(cat){
          delete state.buildBought[cat];
        });
      }
      if(state.buildInstalled){
        Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; });
      }
      if(state.buildCablesDone){
        Object.keys(state.buildCablesDone).forEach(function(k){ state.buildCablesDone[k] = false; });
      }
      state.moboCased = false;
      state.pasteDone = false;
    } catch(e){}
  }
  function forceClearBuildSelectionUI(){
    try {
      if(typeof state === "undefined") return;
      state._assemblyActive = false;
      state.buildPick = {};
      if(state.buildBought){
        ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"].forEach(function(cat){
          delete state.buildBought[cat];
        });
        if(typeof PARTS !== "undefined"){
          PARTS.forEach(function(p){ state.buildBought[p.id] = false; });
        }
      }
      if(state.buildInstalled){
        Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; });
        if(typeof PARTS !== "undefined"){
          PARTS.forEach(function(p){ state.buildInstalled[p.id] = false; });
        }
      }
      if(state.buildCablesDone){
        Object.keys(state.buildCablesDone).forEach(function(k){ state.buildCablesDone[k] = false; });
      }
      state.moboCased = false;
      state.pasteDone = false;
      state.biosDone = false;
    } catch(e){}
  }
  function wrapConsume(){
    if(!window.PartShop) return;
    var prev = PartShop.consumeBuildParts;
    PartShop.clearBuildSelectionUI = clearBuildSelectionUI;
    PartShop.forceClearBuildSelectionUI = forceClearBuildSelectionUI;
    PartShop.consumeBuildParts = function(){
      if(typeof prev === "function") prev();
      forceClearBuildSelectionUI();
    };
    var prevOpen = PartShop.openPicker;
    if(typeof prevOpen === "function" && !PartShop.openPicker._hpClear){
      PartShop.openPicker = function(){
        try {
          if(state && state.buildPick){
            Object.keys(state.buildPick).forEach(function(cat){
              var id = state.buildPick[cat];
              if(id && !(state.partInv && state.partInv[id] > 0)) delete state.buildPick[cat];
            });
          }
        } catch(e){}
        return prevOpen.apply(this, arguments);
      };
      PartShop.openPicker._hpClear = true;
    }
  }
  function wireOverlayClose(){
    var ov = document.getElementById("build-overlay");
    if(!ov || ov._hpClearWired) return;
    ov._hpClearWired = true;
    var obs = new MutationObserver(function(){
      if(ov.style.display === "none"){
        try {
          if(!hasActiveAssembly()){
            clearBuildSelectionUI();
            if(typeof save==="function") save();
          }
        } catch(e){}
      }
    });
    try { obs.observe(ov, { attributes:true, attributeFilter:["style"] }); } catch(e){}
  }
  function boot(){
    wrapConsume();
    wireOverlayClose();
    setTimeout(function(){ wrapConsume(); wireOverlayClose(); }, 500);
    setTimeout(function(){ wrapConsume(); wireOverlayClose(); }, 2000);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
