/* partShop.js — shop + build picker; case/Gehäuse required for build */
(function(){
  if(typeof PART_CATALOG === "undefined") return;
  var REQUIRED_FOR_BUILD = ["cpu","gpu","ram","ssd","psu","mobo","cooler","case"]; /*CaseInPicker*/
  function fmt(n){
    if(typeof fmtSats === "function") return fmtSats(n);
    n = Math.floor(Number(n)||0);
    if(n >= 1e6) return (n/1e6).toFixed(2)+"M";
    if(n >= 1e3) return (n/1e3).toFixed(1)+"k";
    return String(n);
  }
  function ensureInv(){
    if(typeof state === "undefined") return;
    if(!state.partInv) state.partInv = {};
    if(!state.buildPick) state.buildPick = {};
  }
  function ownedCount(partId){ ensureInv(); return state.partInv[partId] || 0; }
  function categoryOwned(cat){
    ensureInv(); var n = 0;
    if(!PART_CATALOG[cat]) return 0;
    (PART_CATALOG[cat].items||[]).forEach(function(it){ n += state.partInv[it.id] || 0; });
    return n;
  }
  function hasAnyInCat(cat){ return categoryOwned(cat) > 0; }
  function canBuildPC(){ return REQUIRED_FOR_BUILD.every(hasAnyInCat); }
  function ownedItemsInCat(cat){
    ensureInv();
    if(!PART_CATALOG[cat]) return [];
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
    ensureInv(); var total = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && window.PART_BY_ID && PART_BY_ID[id];
      if(it) total += it.cost||0;
    });
    return total;
  }
  function sellMult(){
    ensureInv(); var sum = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && window.PART_BY_ID && PART_BY_ID[id];
      if(it){ sum += (it.tier||1); n++; }
    });
    if(!n) return 1.22;
    return 1.12 + Math.min(0.25, (sum/n) * 0.02);
  }
  function clearBuildSelectionUI(){
    ensureInv();
    state.buildPick = {};
    pickerExpand = {};
    if(state.buildBought){
      REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
    }
    if(state.buildInstalled){
      Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k] = false; });
    }
    try{ state.moboCased = false; state.pasteDone = false; }catch(e){}
    if(document.getElementById("ps-picker-body")) try{ renderPicker(); }catch(e){}
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
  function showToast(msg){
    var t = document.getElementById("ps-toast");
    if(!t){ t=document.createElement("div"); t.id="ps-toast"; t.className="ps-toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show"); }, 1800);
  }
  var shopView = "cats", shopCat = null, shopSel = null, pickerExpand = {};
  function buySelected(){
    ensureInv();
    if(!shopSel || !window.PART_BY_ID) return;
    var it = PART_BY_ID[shopSel];
    if(!it) return;
    var cost = it.cost||0;
    if(state.balance < cost){ showToast(state.lang==="de"?"Nicht genug sats":"Not enough sats"); return; }
    state.balance -= cost;
    state.partInv[it.id] = (state.partInv[it.id]||0) + 1;
    try{ if(PartShop.sfxBuy) PartShop.sfxBuy(); }catch(e){}
    if(typeof save === "function") save();
    showToast((state.lang==="de"?"Gekauft: ":"Bought: ")+(it.brand||"")+" "+(it.model||""));
    render();
  }
  function render(){
    var body = document.getElementById("ps-body");
    var title = document.getElementById("ps-title");
    var sats = document.getElementById("ps-sats");
    var back = document.getElementById("ps-back");
    if(!body) return;
    ensureInv();
    if(sats) sats.textContent = fmt(state.balance)+" sats";
    if(shopView === "cats"){
      if(title) title.textContent = state.lang==="de"?"Teile-Shop":"Parts Shop";
      if(back) back.style.visibility = "hidden";
      var html = "";
      Object.keys(PART_CATALOG).forEach(function(cat){
        var c = PART_CATALOG[cat];
        var nm = (c.name && (c.name[state.lang]||c.name.en))||cat;
        html += '<button type="button" class="ps-acc-head" data-shop-cat="'+cat+'">'+(c.icon||"")+" "+nm+" · x"+categoryOwned(cat)+"</button>";
      });
      body.innerHTML = html;
      body.querySelectorAll("[data-shop-cat]").forEach(function(el){
        el.addEventListener("click", function(){
          shopCat = el.getAttribute("data-shop-cat"); shopView = "items"; shopSel = null; render();
        });
      });
    } else {
      var c = PART_CATALOG[shopCat]||{};
      if(title) title.textContent = (c.name && (c.name[state.lang]||c.name.en))||shopCat;
      if(back){ back.style.visibility = "visible"; back.onclick = function(){ shopView="cats"; shopSel=null; render(); }; }
      var html = "";
      (c.items||[]).forEach(function(it){
        var on = shopSel===it.id ? " on" : "";
        html += '<button type="button" class="ps-row'+on+'" data-shop-id="'+it.id+'"><span>'+(it.brand||'')+' '+(it.model||'')+' · T'+(it.tier||'?')+'</span><span>'+fmt(it.cost)+' · x'+(state.partInv[it.id]||0)+'</span></button>';
      });
      if(shopSel) html += '<button type="button" class="ps-buy-btn" id="ps-buy-go" style="width:100%">'+(state.lang==="de"?"Kaufen":"Buy")+'</button>';
      body.innerHTML = html;
      body.querySelectorAll("[data-shop-id]").forEach(function(el){
        el.addEventListener("click", function(){
          shopSel = el.getAttribute("data-shop-id");
          try{ if(PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
          render();
        });
      });
      var buy = document.getElementById("ps-buy-go");
      if(buy) buy.addEventListener("click", function(e){ e.stopPropagation(); buySelected(); });
    }
  }
  function openShop(){
    var ov = document.getElementById("ps-overlay");
    if(!ov) return;
    shopView = "cats"; shopCat = null; shopSel = null;
    ov.classList.add("open");
    render();
  }
  function closeShop(){
    var ov = document.getElementById("ps-overlay");
    if(ov) ov.classList.remove("open");
  }
  function ensurePickerDom(){
    if(document.getElementById("ps-picker")) return;
    var d = document.createElement("div");
    d.id = "ps-picker"; d.className = "ps-overlay";
    d.innerHTML = '<div class="ps-top"><button type="button" class="ps-back" id="ps-picker-back" style="visibility:hidden">←</button><h2 id="ps-picker-title">Build</h2><div class="ps-sats" id="ps-picker-cost">—</div><button type="button" class="ps-close" id="ps-picker-close">✕</button></div><div class="ps-body" id="ps-picker-body"></div>';
    document.body.appendChild(d);
    document.getElementById("ps-picker-close").addEventListener("click", closePicker);
  }
  function renderPicker(){
    ensureInv(); ensurePickerDom();
    var body = document.getElementById("ps-picker-body");
    var title = document.getElementById("ps-picker-title");
    var costEl = document.getElementById("ps-picker-cost");
    if(title) title.textContent = state.lang==="de" ? "Teile wählen" : "Pick parts";
    if(costEl) costEl.textContent = fmt(selectedBuildCost()) + " sats";
    var html = "";
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var catInfo = PART_CATALOG[cat] || {name:{en:cat,de:cat}, icon:"📦"};
      var open = !!pickerExpand[cat];
      var pickedId = state.buildPick[cat];
      var picked = pickedId && window.PART_BY_ID && PART_BY_ID[pickedId];
      var label = (catInfo.name && (catInfo.name[state.lang]||catInfo.name.en)) || cat;
      html += '<div class="ps-acc"><button type="button" class="ps-acc-head" data-acc-cat="'+cat+'">'+(catInfo.icon||"")+' '+label+(picked ? ' · '+(picked.brand||'')+' '+(picked.model||'') : '')+(open?' ▾':' ▸')+'</button>';
      if(open){
        var items = ownedItemsInCat(cat);
        if(!items.length) html += '<div class="ps-row"><span class="ps-muted">'+(state.lang==="de"?"Keine Teile im Inventar":"No parts in inventory")+'</span></div>';
        else items.forEach(function(it){
          var isPicked = state.buildPick[cat] === it.id;
          html += '<button type="button" class="ps-row'+(isPicked?' on':'')+'" data-pick-cat="'+cat+'" data-pick-id="'+it.id+'"><span>'+(it.brand||'')+' '+(it.model||'')+' · T'+(it.tier||'?')+' · x'+(state.partInv[it.id]||0)+'</span>'+(isPicked?' ✓':'')+'</button>';
        });
      }
      html += '</div>';
    });
    if(allPicked()) html += '<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%">'+(state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    else html += '<button type="button" class="ps-buy-btn" disabled style="width:100%">'+(state.lang==="de"?"Noch nicht alle Kategorien gewählt":"Select all categories first")+'</button>';
    body.innerHTML = html;
    body.querySelectorAll("[data-acc-cat]").forEach(function(el){
      el.addEventListener("click", function(){ pickerExpand[el.getAttribute("data-acc-cat")] = !pickerExpand[el.getAttribute("data-acc-cat")]; renderPicker(); });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click", function(){
        state.buildPick[el.getAttribute("data-pick-cat")] = el.getAttribute("data-pick-id");
        try{ if(PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
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
      showToast(state.lang==="de" ? "Zuerst je 1 Teil pro Kategorie kaufen (inkl. Gehäuse)" : "Buy 1 part per category first (incl. case)");
      openShop(); return;
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
  function wire(){
    var openBtn = document.getElementById("ps-open-btn");
    if(openBtn) openBtn.addEventListener("click", openShop);
    var closeBtn = document.getElementById("ps-close");
    if(closeBtn) closeBtn.addEventListener("click", closeShop);
    var buildBtn = document.getElementById("open-build-btn");
    if(buildBtn){
      buildBtn.addEventListener("click", function(e){ e.preventDefault(); e.stopPropagation(); openPicker(); }, true);
    }
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else setTimeout(wire, 0);
  window.PartShop = window.PartShop || {};
  Object.assign(window.PartShop, {
    open: openShop, close: closeShop, openPicker: openPicker, closePicker: closePicker,
    canBuildPC: canBuildPC, selectedBuildCost: selectedBuildCost, sellMult: sellMult,
    consumeBuildParts: consumeBuildParts, clearBuildSelectionUI: clearBuildSelectionUI,
    REQUIRED: REQUIRED_FOR_BUILD, ensureInv: ensureInv
  });
})();
