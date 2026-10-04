/* partShop.js — inventory, accordion build picker, modest tier sell */
(function(){
  if(typeof PART_CATALOG === "undefined") return;
  var REQUIRED_FOR_BUILD = ["cpu","gpu","ram","ssd","psu","mobo","cooler"];
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
    return REQUIRED_FOR_BUILD.every(function(cat){
      var id = state.buildPick[cat];
      return id && (state.partInv[id]||0) > 0;
    });
  }
  function avgPickedTier(){
    ensureInv(); var sum = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it){ sum += it.tier; n++; }
    });
    return n ? sum / n : 1;
  }
  function sellMult(){
    var t = avgPickedTier();
    return 1.12 + Math.min(0.15, (t - 1) * 0.0167);
  }
  function selectedBuildCost(){
    ensureInv(); var total = 0, n = 0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id = state.buildPick[cat]; var it = id && PART_BY_ID[id];
      if(it){ total += it.cost; n++; }
    });
    return n ? total : 0;
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
  }
  function brandChipClass(brand, tier){
    var b = (brand||"").toLowerCase().replace(/[^a-z]/g,"");
    var map = {intel:"ps-chip-intel",amd:"ps-chip-amd",nvidia:"ps-chip-nvidia",corsair:"ps-chip-corsair",samsung:"ps-chip-samsung",kingston:"ps-chip-kingston",noctua:"ps-chip-noctua",asus:"ps-chip-asus",msi:"ps-chip-msi",gigabyte:"ps-chip-gigabyte",seasonic:"ps-chip-seasonic",bequiet:"ps-chip-bequiet",deepcool:"ps-chip-default",arctic:"ps-chip-default",nzxt:"ps-chip-corsair",fractal:"ps-chip-default",lianli:"ps-chip-default",crucial:"ps-chip-kingston",wd:"ps-chip-default",seagate:"ps-chip-default",gskill:"ps-chip-corsair",stock:"ps-chip-default",asrock:"ps-chip-amd",generic:"ps-chip-default"};
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
  function scaleRow(label, score, cls){
    score = Math.max(1, Math.min(10, Number(score)||1));
    return '<div class="ps-scale"><div class="ps-scale-label"><span>'+label+'</span><span>'+score+'/10</span></div><div class="ps-scale-bar"><div class="ps-scale-fill '+(cls||'')+'" style="width:'+(score*10)+'%"></div></div></div>';
  }
  var view = { mode:"shelves", cat:null, selected:null };
  var pickerExpand = {};
  function render(){
    var body = document.getElementById("ps-body");
    var title = document.getElementById("ps-title");
    var back = document.getElementById("ps-back");
    var sats = document.getElementById("ps-sats");
    if(!body) return;
    ensureInv();
    if(sats) sats.textContent = fmt(state.balance) + " sats";
    if(back) back.style.visibility = view.mode === "shelves" ? "hidden" : "visible";
    if(view.mode === "shelves"){
      if(title) title.textContent = (state.lang==="de") ? "Teile-Shop" : "Parts Shop";
      var html = '<p class="ps-inv-hint">'+(state.lang==="de"
        ? "Kaufen · spaeter im Bau-Menue aus dem Inventar waehlen. Nur gewaehlte Teile werden verbraucht."
        : "Buy · later pick from inventory in build menu. Only selected parts are used up.")+'</p><div class="ps-shelves">';
      PART_CATEGORIES.forEach(function(cat){
        var c = PART_CATALOG[cat];
        var nm = (c.name && c.name[state.lang]) || (c.name && c.name.en) || cat;
        var own = categoryOwned(cat);
        html += '<div class="ps-shelf" data-cat="'+cat+'"><span class="ps-shelf-icon">'+(c.icon||"📦")+'</span><div class="ps-shelf-name">'+nm+'</div><div class="ps-shelf-count">'+(own? (state.lang==="de"?"Inventar: "+own:"Owned: "+own) : (c.items.length+" models"))+'</div></div>';
      });
      html += '</div><div class="ps-floor"></div>';
      if(canBuildPC()){
        html += '<p class="ps-inv-hint" style="color:#78d505;margin-top:16px;font-weight:700;">' +
          (state.lang==="de" ? "✓ Inventar reicht — oeffne PC bauen und waehle die Teile." : "✓ Inventory ready — open Build and choose parts.") + '</p>';
      }
      body.innerHTML = html;
      body.querySelectorAll(".ps-shelf").forEach(function(el){
        el.addEventListener("click", function(){
          view.mode = "list"; view.cat = el.getAttribute("data-cat"); view.selected = null; render();
        });
      });
      return;
    }
    var cat = view.cat; var c = PART_CATALOG[cat];
    var nm = (c.name && c.name[state.lang]) || cat;
    if(title) title.textContent = (c.icon||"") + " " + nm;
    var html = '<div class="ps-list-wrap"><p class="ps-list-title">' + (state.lang==="de" ? "Waehle ein Modell" : "Choose a model") + '</p>';
    c.items.forEach(function(it){
      var own = ownedCount(it.id); var sel = view.selected === it.id;
      var chip = brandChipClass(it.brand, it.tier);
      html += '<div class="ps-row'+(sel?" selected":"")+'" data-id="'+it.id+'">' +
        '<div class="ps-row-icon '+chip+'">'+chipLabel(it).replace("\n","<br>")+'</div>' +
        '<div class="ps-row-main"><div class="ps-row-brand">'+it.brand+'</div><div class="ps-row-model">'+it.model+'</div><div class="ps-row-tier">Tier '+it.tier+'/10'+(own? ' <span class="ps-row-owned">x'+own+'</span>':'')+'</div></div>' +
        '<div class="ps-row-price">'+fmt(it.cost)+'</div></div>';
      if(sel){
        var canBuy = state.balance >= it.cost;
        html += '<div class="ps-detail open"><div class="ps-detail-name">'+partDisplayName(it)+'</div><div class="ps-detail-brand">'+it.brand+' · Tier '+it.tier+'</div>' +
          scaleRow(state.lang==="de"?"Leistung":"Performance", it.power, "") +
          scaleRow(state.lang==="de"?"Effizienz":"Efficiency", it.efficiency, "eff") +
          scaleRow(state.lang==="de"?"Preis/Leistung":"Value", it.value, "val") +
          '<div class="ps-detail-actions"><div class="ps-price-big">'+fmt(it.cost)+' sats</div><button class="ps-buy-btn" id="ps-buy"'+(canBuy?"":" disabled")+'>'+(state.lang==="de"?"Kaufen":"Buy")+'</button></div></div>';
      }
    });
    html += '</div>'; body.innerHTML = html;
    body.querySelectorAll(".ps-row").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.getAttribute("data-id");
        view.selected = (view.selected === id) ? null : id; render();
      });
    });
    var buy = document.getElementById("ps-buy");
    if(buy) buy.addEventListener("click", function(e){ e.stopPropagation(); buySelected(); });
  }
  function buySelected(){
    ensureInv();
    var it = PART_BY_ID[view.selected];
    if(!it) return;
    if(state.balance < it.cost){ showToast(state.lang==="de" ? "Nicht genug Sats" : "Not enough sats"); return; }
    state.balance -= it.cost;
    state.partInv[it.id] = (state.partInv[it.id]||0) + 1;
    if(state.buildBought && it.cat) state.buildBought[it.cat] = true;
    if(typeof save === "function") save();
    if(typeof updateBalanceUI === "function") updateBalanceUI();
    showToast((state.lang==="de"?"Gekauft: ":"Bought: ") + partDisplayName(it) + " (x"+state.partInv[it.id]+")");
    var sats = document.getElementById("ps-sats");
    if(sats) sats.textContent = fmt(state.balance) + " sats";
    render();
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
    ensurePickerDom(); ensureInv();
    var body = document.getElementById("ps-picker-body");
    var title = document.getElementById("ps-picker-title");
    var costEl = document.getElementById("ps-picker-cost");
    if(title) title.textContent = state.lang==="de" ? "Teile fuer den Bau" : "Parts for this build";
    var html = '<p class="ps-inv-hint">'+(state.lang==="de"
      ? "Tippe eine Kategorie, um sie auszuklappen. Waehle je ein Teil aus deinem Inventar."
      : "Tap a category to expand. Pick one owned part per category.")+'</p>';
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var c = PART_CATALOG[cat];
      var nm = (c.name && c.name[state.lang]) || cat;
      var owned = ownedItemsInCat(cat);
      var open = !!pickerExpand[cat];
      var pickedId = state.buildPick[cat];
      var pickedIt = pickedId && PART_BY_ID[pickedId];
      var summary = pickedIt
        ? (pickedIt.brand + " " + pickedIt.model)
        : (owned.length
            ? (owned.length + (state.lang==="de" ? " im Inventar" : " owned"))
            : (state.lang==="de" ? "leer" : "empty"));
      html += '<div class="ps-acc'+(open?" open":"")+(pickedIt?" has-pick":"")+'">';
      html += '<button type="button" class="ps-acc-head" data-acc-cat="'+cat+'">';
      html += '<span class="ps-acc-left">'+(c.icon||"")+' <strong>'+nm+'</strong></span>';
      html += '<span class="ps-acc-mid">'+summary+'</span>';
      html += '<span class="ps-acc-arrow" aria-hidden="true">'+(open?"▾":"▸")+'</span>';
      html += '</button>';
      if(open){
        html += '<div class="ps-acc-body">';
        if(!owned.length){
          html += '<p class="ps-inv-hint" style="color:#f7931a;margin:8px 0">'+(state.lang==="de"?"Keine Teile — im Shop kaufen":"None owned — buy in shop")+'</p>';
        } else {
          owned.forEach(function(it){
            var picked = state.buildPick[cat] === it.id;
            var chip = brandChipClass(it.brand, it.tier);
            html += '<div class="ps-row'+(picked?" selected":"")+'" data-pick-cat="'+cat+'" data-pick-id="'+it.id+'">' +
              '<div class="ps-row-icon '+chip+'">'+chipLabel(it).replace("\n","<br>")+'</div>' +
              '<div class="ps-row-main"><div class="ps-row-brand">'+it.brand+'</div><div class="ps-row-model">'+it.model+'</div>' +
              '<div class="ps-row-tier">Tier '+it.tier+'/10 · x'+ownedCount(it.id)+'</div></div></div>';
          });
        }
        html += '</div>';
      }
      html += '</div>';
    });
    var ready = allPicked(); var cost = selectedBuildCost(); var mult = sellMult();
    var est = Math.round(cost * mult);
    if(costEl) costEl.textContent = ready ? ("~"+fmt(est)+" sats") : "—";
    html += '<div class="ps-list-wrap" style="margin-top:12px">';
    if(ready){
      html += '<p class="ps-inv-hint" style="color:#8b95a5">'+(state.lang==="de"
        ? ("Kosten "+fmt(cost)+" · Verkauf ca. "+fmt(est)+" (+"+Math.round((mult-1)*100)+"%)")
        : ("Cost "+fmt(cost)+" · est. sale "+fmt(est)+" (+"+Math.round((mult-1)*100)+"%)"))+'</p>';
      html += '<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%">'+
        (state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    } else {
      html += '<button type="button" class="ps-buy-btn" disabled style="width:100%">'+
        (state.lang==="de"?"Noch nicht alle Kategorien gewaehlt":"Select all categories first")+'</button>';
    }
    html += '</div>'; body.innerHTML = html;
    body.querySelectorAll("[data-acc-cat]").forEach(function(el){
      el.addEventListener("click", function(){
        var cat = el.getAttribute("data-acc-cat");
        pickerExpand[cat] = !pickerExpand[cat];
        renderPicker();
      });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click", function(){
        var cat = el.getAttribute("data-pick-cat"); var id = el.getAttribute("data-pick-id");
        state.buildPick[cat] = id;
        if(state.buildBought) state.buildBought[cat] = true;
        if(typeof save === "function") save();
        renderPicker();
      });
    });
    var go = document.getElementById("ps-picker-go");
    if(go) go.addEventListener("click", function(){
      closePicker();
      REQUIRED_FOR_BUILD.forEach(function(cat){ if(state.buildBought) state.buildBought[cat] = true; });
      if(typeof save === "function") save();
      if(typeof openBuildOverlay === "function") openBuildOverlay();
    });
  }
  function openPicker(){
    if(!canBuildPC()){
      showToast(state.lang==="de" ? "Zuerst je 1 Teil pro Kategorie im Parts Shop kaufen" : "Buy 1 part per category in Parts Shop first");
      openShop(); return;
    }
    ensurePickerDom();
    document.getElementById("ps-picker").classList.add("open");
    renderPicker();
  }
  function closePicker(){
    var el = document.getElementById("ps-picker");
    if(el) el.classList.remove("open");
  }
  function openShop(){
    var ov = document.getElementById("ps-overlay");
    if(!ov) return;
    view = { mode:"shelves", cat:null, selected:null };
    ov.classList.add("open"); render();
  }
  function closeShop(){
    var ov = document.getElementById("ps-overlay");
    if(ov) ov.classList.remove("open");
  }
  function wire(){
    var openBtn = document.getElementById("ps-open-btn");
    var closeBtn = document.getElementById("ps-close");
    var backBtn = document.getElementById("ps-back");
    if(openBtn) openBtn.addEventListener("click", openShop);
    if(closeBtn) closeBtn.addEventListener("click", closeShop);
    if(backBtn) backBtn.addEventListener("click", function(){
      if(view.mode === "list"){ view.mode = "shelves"; view.cat = null; view.selected = null; render(); }
    });
    var buildBtn = document.getElementById("open-build-btn");
    if(buildBtn && !buildBtn._psWired){
      buildBtn._psWired = true;
      buildBtn.addEventListener("click", function(e){
        if(canBuildPC() || Object.keys(state.partInv||{}).length){
          e.stopImmediatePropagation(); e.preventDefault(); openPicker();
        }
      }, true);
    }
  }
  window.PartShop = {
    open: openShop, close: closeShop, openPicker: openPicker,
    canBuildPC: canBuildPC, ownedCount: ownedCount, categoryOwned: categoryOwned,
    consumeBuildParts: consumeBuildParts, selectedBuildCost: selectedBuildCost,
    sellMult: sellMult, avgPickedTier: avgPickedTier, allPicked: allPicked,
    REQUIRED: REQUIRED_FOR_BUILD, ensureInv: ensureInv
  };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
