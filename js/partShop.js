/* partShop.js — parts shop + build picker (incl. case/Gehäuse) */
(function(){
  var REQUIRED_FOR_BUILD = ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"]; /*CaseInPicker*/
  function fmt(n){
    if(typeof fmtSats === "function") return fmtSats(n);
    n = Number(n)||0;
    if(n < 1e6) return String(Math.floor(n));
    return (n/1e6).toFixed(2)+"M";
  }
  function showToast(msg){
    var t = document.getElementById("ps-toast");
    if(!t){ t = document.createElement("div"); t.id = "ps-toast"; t.className = "ps-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show"); }, 1800);
  }
  function ensureInv(){
    if(typeof state === "undefined") return;
    if(!state.partInv) state.partInv = {};
    if(!state.buildPick) state.buildPick = {};
  }
  function hasAnyInCat(cat){
    ensureInv();
    if(!window.PART_CATALOG || !PART_CATALOG[cat]) return false;
    return (PART_CATALOG[cat].items||[]).some(function(it){ return (state.partInv[it.id]||0) > 0; });
  }
  function canBuildPC(){ return REQUIRED_FOR_BUILD.every(hasAnyInCat); }
  function ownedItemsInCat(cat){
    ensureInv();
    return (PART_CATALOG[cat].items||[]).filter(function(it){ return (state.partInv[it.id]||0) > 0; });
  }
  function allPicked(){
    ensureInv();
    return REQUIRED_FOR_BUILD.every(function(cat){
      var id = state.buildPick[cat];
      return id && (state.partInv[id]||0) > 0;
    });
  }
  function selectedBuildCost(){
    ensureInv();
    var total = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it) total += it.cost||0;
    });
    return total;
  }
  function sellMult(){
    ensureInv();
    var sum = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it){ sum += (it.tier||1); n++; }
    });
    if(!n) return 1.22;
    var avg = sum / n;
    return 1.12 + Math.min(0.25, avg * 0.02);
  }
  function clearBuildSelectionUI(){
    ensureInv();
    state.buildPick = {};
    pickerExpand = {};
    if(state.buildBought){
      REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
      if(state.buildBought.case) delete state.buildBought.case;
    }
    if(state.buildInstalled){
      Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; });
    }
    try{
      state.moboCased = false;
      state.pasteDone = false;
    }catch(e){}
    var pick = document.getElementById("ps-picker");
    if(pick && pick.classList.contains("open")) renderPicker();
    else if(document.getElementById("ps-picker-body")) renderPicker();
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
    if(state.buildPick.case){
      var cid = state.buildPick.case;
      if(cid && state.partInv[cid]){
        state.partInv[cid] -= 1;
        if(state.partInv[cid] <= 0) delete state.partInv[cid];
      }
      delete state.buildPick.case;
    }
    clearBuildSelectionUI();
    if(typeof save === "function") save();
  }
  var pickerExpand = {};
  function openShop(){
    var ov = document.getElementById("ps-overlay");
    if(ov) ov.classList.add("open");
  }
  function ensurePicker(){
    if(document.getElementById("ps-picker")) return;
    var d = document.createElement("div");
    d.id = "ps-picker"; d.className = "ps-overlay";
    d.innerHTML = '<div class="ps-top"><button type="button" class="ps-back" id="ps-picker-back" style="visibility:hidden">←</button><h2 id="ps-picker-title">Build</h2><div class="ps-sats" id="ps-picker-cost">—</div><button type="button" class="ps-close" id="ps-picker-close">✕</button></div><div class="ps-body" id="ps-picker-body"></div>';
    document.body.appendChild(d);
    document.getElementById("ps-picker-close").addEventListener("click", closePicker);
  }
  function renderPicker(){
    ensureInv(); ensurePicker();
    var body = document.getElementById("ps-picker-body");
    var title = document.getElementById("ps-picker-title");
    var costEl = document.getElementById("ps-picker-cost");
    if(title) title.textContent = state.lang==="de" ? "Teile wählen" : "Pick parts";
    if(costEl) costEl.textContent = fmt(selectedBuildCost()) + " sats";
    var html = '';
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var catInfo = PART_CATALOG[cat] || {name:{en:cat,de:cat}, icon:"📦"};
      var open = !!pickerExpand[cat];
      var pickedId = state.buildPick[cat];
      var picked = pickedId && PART_BY_ID[pickedId];
      var label = (catInfo.name && (catInfo.name[state.lang]||catInfo.name.en)) || cat;
      html += '<div class="ps-acc">';
      html += '<button type="button" class="ps-acc-head" data-acc-cat="'+cat+'">'+
        (catInfo.icon||"")+' '+label+
        (picked ? ' · '+(picked.brand||'')+' '+(picked.model||'') : '')+
        (open?' ▾':' ▸')+'</button>';
      if(open){
        var items = ownedItemsInCat(cat);
        if(!items.length){
          html += '<div class="ps-row"><span class="ps-muted">'+(state.lang==="de"?"Keine Teile im Inventar":"No parts in inventory")+'</span></div>';
        } else {
          items.forEach(function(it){
            var isPicked = state.buildPick[cat] === it.id;
            html += '<button type="button" class="ps-row'+(isPicked?' on':'')+'" data-pick-cat="'+cat+'" data-pick-id="'+it.id+'">'+'
              '<span>'+(it.brand||'')+' '+(it.model||'')+' · T'+(it.tier||'?')+' · x'+(state.partInv[it.id]||0)+'</span>'+
              (isPicked?' ✓':'')+
            '</button>';
          });
        }
      }
      html += '</div>';
    });
    if(allPicked()){
      html += '<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%">'+
        (state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    } else {
      html += '<button type="button" class="ps-buy-btn" disabled style="width:100%">'+
        (state.lang==="de"?"Noch nicht alle Kategorien gewählt":"Select all categories first")+'</button>';
    }
    body.innerHTML = html;
    body.querySelectorAll("[data-acc-cat]").forEach(function(el){
      el.addEventListener("click", function(){
        var cat = el.getAttribute("data-acc-cat");
        pickerExpand[cat] = !pickerExpand[cat];
        renderPicker();
      });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click", function(){
        var cat = el.getAttribute("data-pick-cat");
        var id = el.getAttribute("data-pick-id");
        state.buildPick[cat] = id;
        if(window.PartShop && PartShop.sfxSelect) try{ PartShop.sfxSelect(); }catch(e){}
        renderPicker();
      });
    });
    var go = document.getElementById("ps-picker-go");
    if(go) go.addEventListener("click", function(){
      REQUIRED_FOR_BUILD.forEach(function(cat){ if(state.buildBought) state.buildBought[cat] = true; });
      if(typeof save === "function") save();
      closePicker();
      if(typeof openBuildOverlay === "function") openBuildOverlay();
    });
  }
  function openPicker(){
    if(!canBuildPC()){
      showToast(state.lang==="de" ? "Zuerst je 1 Teil pro Kategorie im Teile-Shop kaufen (inkl. Gehäuse)" : "Buy 1 part per category in Parts Shop first (incl. case)");
      openShop(); return;
    }
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat];
      if(id && !(state.partInv[id] > 0)) delete state.buildPick[cat];
    });
    ensurePicker();
    document.getElementById("ps-picker").classList.add("open");
    renderPicker();
  }
  function closePicker(){
    var el = document.getElementById("ps-picker");
    if(el) el.classList.remove("open");
  }
  window.PartShop = window.PartShop || {};
  Object.assign(window.PartShop, {
    openPicker: openPicker,
    closePicker: closePicker,
    openShop: openShop,
    canBuildPC: canBuildPC,
    selectedBuildCost: selectedBuildCost,
    sellMult: sellMult,
    consumeBuildParts: consumeBuildParts,
    clearBuildSelectionUI: clearBuildSelectionUI,
    REQUIRED: REQUIRED_FOR_BUILD,
    ensureInv: ensureInv
  });
})();
