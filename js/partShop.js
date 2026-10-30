/* partShop.js — original shelves + detail scales (Tier, Leistung, Effizienz, Preis/Leistung) */
(function(){
  if(typeof PART_CATALOG === "undefined") return;
  var REQUIRED_FOR_BUILD = ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"];
  function fmt(n){
    if(typeof fmtSats === "function") return fmtSats(n);
    n = Math.floor(Number(n)||0);
    if(n >= 1e6) return (n/1e6).toFixed(2)+"M";
    if(n >= 1e3) return (n/1e3).toFixed(1)+"k";
    return String(n);
  }
  function ensureInv(){
    if(!state.partInv) state.partInv = {};
    if(!state.buildPick) state.buildPick = {};
  }
  function ownedCount(partId){ ensureInv(); return state.partInv[partId] || 0; }
  function categoryOwned(cat){
    ensureInv(); var n = 0;
    (PART_CATALOG[cat].items||[]).forEach(function(it){ n += state.partInv[it.id] || 0; });
    return n;
  }
  function hasAnyInCat(cat){ return categoryOwned(cat) > 0; }
  function canBuildPC(){ return REQUIRED_FOR_BUILD.every(hasAnyInCat); }
  function ownedItemsInCat(cat){
    ensureInv();
    return (PART_CATALOG[cat].items||[]).filter(function(it){ return (state.partInv[it.id]||0) > 0; });
  }
  function allPicked(){
    ensureInv();
    return REQUIRED_FOR_BUILD.every(function(cat){ return !!state.buildPick[cat]; });
  }
  function clearBuildSelectionUI(){
    try{
      state.buildPick = {};
      if(state.buildBought){
        REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
      }
      if(state.buildInstalled){ Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; }); }
      if(state.buildCablesDone){ Object.keys(state.buildCablesDone).forEach(function(k){ state.buildCablesDone[k] = false; }); }
      state.moboCased = false;
      state.pasteDone = false;
    } catch(e){}
    try{ state._assemblyActive = false; }catch(_a){}
    var pick = document.getElementById("ps-picker");
    if(pick && pick.classList.contains("open")) renderPicker();
  }
  function consumeBuildParts(){
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat];
      if(id && state.partInv[id]){
        state.partInv[id] -= 1;
        if(state.partInv[id] <= 0) delete state.partInv[id];
      }
      delete state.buildPick[cat];
    });
    clearBuildSelectionUI();
    if(typeof save === "function") save();
  }
  function brandChipClass(brand, tier){
    var b = (brand||"").toLowerCase().replace(/[^a-z]/g,"");
    var map = {intel:"ps-chip-intel",amd:"ps-chip-amd",nvidia:"ps-chip-nvidia",corsair:"ps-chip-corsair",samsung:"ps-chip-samsung",kingston:"ps-chip-kingston",noctua:"ps-chip-noctua",asus:"ps-chip-asus",msi:"ps-chip-msi",gigabyte:"ps-chip-gigabyte",seasonic:"ps-chip-seasonic",bequiet:"ps-chip-bequiet",deepcool:"ps-chip-default",arctic:"ps-chip-default",nzxt:"ps-chip-corsair",fractal:"ps-chip-default",lianli:"ps-chip-default",crucial:"ps-chip-kingston",wd:"ps-chip-default",seagate:"ps-chip-default",gskill:"ps-chip-corsair",stock:"ps-chip-default",asrock:"ps-chip-amd",generic:"ps-chip-default",nocturne:"ps-chip-noctua",icewing:"ps-chip-default",abyssal:"ps-chip-default",corvus:"ps-chip-corsair",samsum:"ps-chip-samsung",fjordic:"ps-chip-default",lumio:"ps-chip-default",prisma:"ps-chip-default",kingforge:"ps-chip-kingston",crux:"ps-chip-kingston",seaguard:"ps-chip-default",seasonicx:"ps-chip-seasonic",asusx:"ps-chip-asus",msx:"ps-chip-msi",asrockx:"ps-chip-amd",axiom:"ps-chip-intel",ember:"ps-chip-amd",quanta:"ps-chip-intel",blaze:"ps-chip-amd",fjord:"ps-chip-default"};
    var cls = map[b] || "ps-chip-default";
    if(tier >= 8) cls += " ps-chip-tier-hi";
    else if(tier >= 5) cls += " ps-chip-tier-mid";
    return cls;
  }
  function chipLabel(it){ return (it.brand||"").slice(0,3).toUpperCase() + "\nT" + it.tier; }
  function showToast(msg){
    var el = document.getElementById("ps-toast");
    if(!el) return;
    el.textContent = msg; el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ el.classList.remove("show"); }, 3200);
  }
  var view = { mode: "shelves", cat: null, selected: null };
  var pickerExpand = {};
  function ensurePickerDom(){
    if(document.getElementById("ps-picker")) return;
    var el = document.createElement("div");
    el.id = "ps-picker";
    el.innerHTML = '<div class="ps-picker-panel"><div class="ps-picker-head"><span id="ps-picker-title">Build</span><button type="button" id="ps-picker-close">✕</button></div><div class="ps-picker-body" id="ps-picker-body"></div></div>';
    document.body.appendChild(el);
    document.getElementById("ps-picker-close").addEventListener("click", closePicker);
  }
  function renderPicker(){
    ensurePickerDom();
    ensureInv();
    var body = document.getElementById("ps-picker-body");
    if(!body) return;
    var title = document.getElementById("ps-picker-title");
    if(title) title.textContent = (state.lang==="de") ? "PC zusammenstellen" : "Assemble PC";
    var html = "";
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var catDef = PART_CATALOG[cat];
      if(!catDef) return;
      var items = ownedItemsInCat(cat);
      var picked = state.buildPick[cat];
      var exp = !!pickerExpand[cat];
      html += '<div class="ps-picker-cat">';
      html += '<button type="button" class="ps-picker-cat-btn" data-acc-cat="'+cat+'">'+(catDef.name||cat)+(picked?" ✓":"")+(exp?" ▾":" ▸")+'</button>';
      if(exp){
        html += '<div class="ps-picker-items">';
        if(!items.length){
          html += '<div class="ps-picker-empty">'+(state.lang==="de"?"Keine Teile im Inventar":"No parts in inventory")+'</div>';
        } else {
          items.forEach(function(it){
            var sel = picked === it.id;
            html += '<button type="button" class="ps-picker-item'+(sel?" selected":"")+'" data-pick-cat="'+cat+'" data-pick-id="'+it.id+'">'+it.name+'</button>';
          });
        }
        html += '</div>';
      }
      html += '</div>';
    });
    if(allPicked()){
      html += '<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%;margin-top:12px">'+(state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    } else {
      html += '<button type="button" class="ps-buy-btn" disabled style="width:100%;margin-top:12px">'+(state.lang==="de"?"Noch nicht alle Kategorien gewählt":"Select all categories first")+'</button>';
    }
    body.innerHTML = html;
    body.querySelectorAll("[data-acc-cat]").forEach(function(el){
      el.addEventListener("click", function(){
        var c = el.getAttribute("data-acc-cat");
        pickerExpand[c] = !pickerExpand[c];
        renderPicker();
      });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click", function(){
        state.buildPick[el.getAttribute("data-pick-cat")] = el.getAttribute("data-pick-id");
        try{ if(window.PartShop && PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
        renderPicker();
      });
    });
    var go = document.getElementById("ps-picker-go");
    if(go) go.addEventListener("click", function(){
      ensureInv();
      if(!state.buildBought) state.buildBought = {};
      REQUIRED_FOR_BUILD.forEach(function(c){ state.buildBought[c] = true; });
      try{ if(typeof PARTS !== "undefined"){ PARTS.forEach(function(p){ state.buildBought[p.id] = true; }); } }catch(_p){}
      state._assemblyActive = true;
      if(typeof save === "function") save();
      closePicker();
      if(typeof openBuildOverlay === "function") openBuildOverlay();
      try{
        var sp = document.getElementById("bo-shop");
        var rp = document.getElementById("bo-rig-area");
        if(sp) sp.style.display = "none";
        if(rp) rp.style.display = "flex";
        if(typeof renderBuildOverlay === "function") renderBuildOverlay();
        if(sp) sp.style.display = "none";
        if(rp) rp.style.display = "flex";
      }catch(_force){}
    });
  }
  function openPicker(){
    if(!canBuildPC()){
      showToast(state.lang==="de"
        ? "Zuerst im Teile-Shop je 1 Teil pro Kategorie kaufen"
        : "First buy 1 part per category in the Parts Shop");
    }
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat];
      if(id && !(state.partInv[id] > 0)) delete state.buildPick[cat];
    });
    ensurePickerDom();
    document.getElementById("ps-picker").classList.add("open");
    renderPicker();
  }
  function closePicker(){
    var el = document.getElementById("ps-picker");
    if(el) el.classList.remove("open");
  }
  function updateOpenBtnLabel(){
    var el = document.getElementById("ps-open-label");
    if(el) el.textContent = (state.lang==="de") ? "Teile-Shop" : "Parts Shop";
    else {
      var btn = document.getElementById("ps-open-btn");
      if(btn) btn.innerHTML = (state.lang==="de") ? "🛒 Teile-Shop" : "🛒 Parts Shop";
    }
  }
  function openShop(){
    updateOpenBtnLabel();
    var ov = document.getElementById("ps-overlay");
    if(!ov) return;
    view.mode = "shelves"; view.cat = null; view.selected = null;
    ov.classList.add("open");
  }
