/* partShopFix.js — clear build selection after sell / reopen */
(function(){
  function clearBuildSelectionUI(){
    try {
      if(typeof state === "undefined") return;
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
  function wrapConsume(){
    if(!window.PartShop) return;
    var prev = PartShop.consumeBuildParts;
    PartShop.clearBuildSelectionUI = clearBuildSelectionUI;
    PartShop.consumeBuildParts = function(){
      if(typeof prev === "function") prev();
      clearBuildSelectionUI();
    };
    var prevOpen = PartShop.openPicker;
    if(typeof prevOpen === "function"){
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
    }
  }
  function boot(){
    wrapConsume();
    setTimeout(wrapConsume, 500);
    setTimeout(wrapConsume, 2000);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
