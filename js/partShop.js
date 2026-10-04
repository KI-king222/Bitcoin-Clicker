/* partShop.js — Fullscreen Parts Shop UI (Phase 1) */
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
  function showToast(msg){
    var el = document.getElementById("ps-toast");
    if(!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function(){ el.classList.remove("show"); }, 3200);
  }
  function scaleRow(label, score, cls){
    score = Math.max(1, Math.min(10, Number(score)||1));
    return '<div class="ps-scale"><div class="ps-scale-label"><span>'+label+'</span><span>'+score+'/10</span></div><div class="ps-scale-bar"><div class="ps-scale-fill '+(cls||'')+'" style="width:'+(score*10)+'%"></div></div></div>';
  }
  var view = { mode:"shelves", cat:null, selected:null };
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
      var html = '<p class="ps-inv-hint">'+(state.lang==="de" ? "Tippe ein Regal an · wähle ein Teil · siehe Bewertung · kaufen" : "Tap a shelf · pick a part · see ratings · buy")+'</p><div class="ps-shelves">';
      PART_CATEGORIES.forEach(function(cat){
        var c = PART_CATALOG[cat];
        var nm = (c.name && c.name[state.lang]) || (c.name && c.name.en) || cat;
        var own = categoryOwned(cat);
        html += '<div class="ps-shelf" data-cat="'+cat+'"><span class="ps-shelf-icon">'+(c.icon||"📦")+'</span><div class="ps-shelf-name">'+nm+'</div><div class="ps-shelf-count">'+(own? (state.lang==="de"?"Im Inventar: "+own:"Owned: "+own) : (c.items.length+" models"))+'</div></div>';
      });
      html += '</div>';
      if(canBuildPC()){
        html += '<p class="ps-inv-hint" style="color:#78d505;margin-top:16px;font-weight:700;">' + (state.lang==="de" ? "✓ Du hast genug Teile fuer einen PC — nutze PC bauen." : "✓ You have enough parts to build a PC — use Build a PC.") + '</p>';
      }
      body.innerHTML = html;
      body.querySelectorAll(".ps-shelf").forEach(function(el){
        el.addEventListener("click", function(){
          view.mode = "list"; view.cat = el.getAttribute("data-cat"); view.selected = null; render();
        });
      });
      return;
    }
    var cat = view.cat;
    var c = PART_CATALOG[cat];
    var nm = (c.name && c.name[state.lang]) || cat;
    if(title) title.textContent = (c.icon||"") + " " + nm;
    var html = '<div class="ps-list-wrap"><p class="ps-list-title">' + (state.lang==="de" ? "Wähle ein Modell" : "Choose a model") + '</p>';
    c.items.forEach(function(it){
      var own = ownedCount(it.id);
      var sel = view.selected === it.id;
      html += '<div class="ps-row'+(sel?" selected":"")+'" data-id="'+it.id+'"><div class="ps-row-icon">'+(c.icon||"📦")+'</div><div class="ps-row-main"><div class="ps-row-brand">'+it.brand+'</div><div class="ps-row-model">'+it.model+'</div><div class="ps-row-tier">Tier '+it.tier+'/10'+(own? ' <span class="ps-row-owned">×'+own+'</span>':'')+'</div></div><div class="ps-row-price">'+fmt(it.cost)+'</div></div>';
      if(sel){
        var canBuy = state.balance >= it.cost;
        html += '<div class="ps-detail open"><div class="ps-detail-name">'+partDisplayName(it)+'</div><div class="ps-detail-brand">'+it.brand+' · Tier '+it.tier+'</div>' +
          scaleRow(state.lang==="de"?"Leistung":"Performance", it.power, "") +
          scaleRow(state.lang==="de"?"Effizienz":"Efficiency", it.efficiency, "eff") +
          scaleRow(state.lang==="de"?"Preis/Leistung":"Value", it.value, "val") +
          '<div class="ps-detail-actions"><div class="ps-price-big">'+fmt(it.cost)+' sats</div><button class="ps-buy-btn" id="ps-buy"'+(canBuy?"":" disabled")+'>'+(state.lang==="de"?"Kaufen":"Buy")+'</button></div></div>';
      }
    });
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll(".ps-row").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.getAttribute("data-id");
        view.selected = (view.selected === id) ? null : id;
        render();
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
    showToast((state.lang==="de"?"Gekauft: ":"Bought: ") + partDisplayName(it));
    if(canBuildPC()){
      setTimeout(function(){
        showToast(state.lang==="de" ? "Du hast genug Teile, um einen PC zu bauen!" : "You have enough parts to build a PC!");
      }, 900);
    }
    var sats = document.getElementById("ps-sats");
    if(sats) sats.textContent = fmt(state.balance) + " sats";
    render();
  }
  function openShop(){
    var ov = document.getElementById("ps-overlay");
    if(!ov) return;
    view = { mode:"shelves", cat:null, selected:null };
    ov.classList.add("open");
    render();
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
  }
  window.PartShop = { open: openShop, close: closeShop, canBuildPC: canBuildPC, ownedCount: ownedCount, categoryOwned: categoryOwned, REQUIRED: REQUIRED_FOR_BUILD, ensureInv: ensureInv };
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
