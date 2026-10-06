/* parts3d/registry.js — maps buildPick to { id, tier, brand, model }
 * Mesh designs MUST key off part id (cpu-7, gpu-3, …), never only tier.
 */
(function(){
  function pickInfo(cat){
    try{
      if(window.PART_BY_ID && state && state.buildPick && state.buildPick[cat]){
        var id = state.buildPick[cat];
        var it = PART_BY_ID[id];
        if(it) return {
          id: id,
          tier: Number(it.tier)||1,
          brand: it.brand||"",
          model: it.model||"",
          power: Number(it.power)||1,
          efficiency: Number(it.efficiency)||1
        };
      }
    }catch(e){}
    return { id: "", tier: 3, brand: "", model: "", power: 5, efficiency: 5 };
  }
  window.Parts3D = window.Parts3D || {};
  window.Parts3D.pickInfo = pickInfo;
})();
