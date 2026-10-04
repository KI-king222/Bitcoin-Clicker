/* parts3d/registry.js — maps buildPick to tier/brand for 3D builders */
(function(){
  function pickInfo(cat){
    try{
      if(window.PART_BY_ID && state && state.buildPick && state.buildPick[cat]){
        var it = PART_BY_ID[state.buildPick[cat]];
        if(it) return { tier: it.tier||1, brand: it.brand||"", model: it.model||"" };
      }
    }catch(e){}
    return { tier: 3, brand: "", model: "" };
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.pickInfo = pickInfo;
})();
