/* partShop.js — restored; see also partShopFix.js for clearBuildSelectionUI */
/* Full file restored from last good + selection clear on sell */
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
      return !!id && ownedCount(id) > 0;
    });
  }
  function avgPickedTier(){
    ensureInv(); var sum=0,n=0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id=state.buildPick[cat]; var it=id&&PART_BY_ID[id];
      if(it){ sum+=Number(it.tier)||1; n++; }
    });
    return n? sum/n : 1;
  }
  function sellMult(){
    var t = avgPickedTier();
    return Math.min(1.32, 1.12 + (t-1)*0.018);
  }
  function selectedBuildCost(){
    ensureInv(); var total=0;
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id=state.buildPick[cat]; var it=id&&PART_BY_ID[id];
      if(it) total += Number(it.cost)||0;
    });
    return total;
  }
  function clearBuildSelectionUI(){
    ensureInv();
    state.buildPick = {};
    pickerExpand = {};
    if(state.buildBought){
      REQUIRED_FOR_BUILD.forEach(function(cat){ delete state.buildBought[cat]; });
      if(state.buildBought.case) delete state.buildBought.case;
    }
    try{
      if(state.buildInstalled){
        Object.keys(state.buildInstalled).forEach(function(k){ state.buildInstalled[k]=false; });
      }
      state.moboCased=false; state.pasteDone=false;
    }catch(e){}
    var pick=document.getElementById("ps-picker");
    if(pick && pick.classList.contains("open")) renderPicker();
  }
  function consumeBuildParts(){
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(cat){
      var id=state.buildPick[cat];
      if(id && state.partInv[id]){
        state.partInv[id]-=1;
        if(state.partInv[id]<=0) delete state.partInv[id];
      }
      delete state.buildPick[cat];
    });
    if(state.buildPick.case){
      var cid=state.buildPick.case;
      if(cid && state.partInv[cid]){
        state.partInv[cid]-=1;
        if(state.partInv[cid]<=0) delete state.partInv[cid];
      }
      delete state.buildPick.case;
    }
    clearBuildSelectionUI();
    if(typeof save==="function") save();
  }
  function brandChipClass(brand){
    var b=(brand||"").toLowerCase();
    if(b.indexOf("axiom")>=0||b.indexOf("quanta")>=0) return "ps-chip-blue";
    if(b.indexOf("ember")>=0||b.indexOf("blaze")>=0) return "ps-chip-red";
    if(b.indexOf("fjord")>=0||b.indexOf("lumio")>=0) return "ps-chip-teal";
    if(b.indexOf("corvus")>=0||b.indexOf("prisma")>=0) return "ps-chip-purple";
    return "ps-chip-gray";
  }
  function partBaseName(it){
    return ((it.brand||"")+" "+(it.model||"")).trim();
  }
  function partTierLabel(it){
    var t=Number(it.tier)||1;
    if(state.lang==="de"){
      if(t<=2) return "Einstieg";
      if(t<=4) return "Mittelklasse";
      if(t<=6) return "Oberklasse";
      if(t<=8) return "High-End";
      return "Flaggschiff";
    }
    if(t<=2) return "Entry";
    if(t<=4) return "Mid";
    if(t<=6) return "Upper";
    if(t<=8) return "High-End";
    return "Flagship";
  }
  function chipLabel(it){
    return partBaseName(it)+" · "+partTierLabel(it);
  }
  function showToast(msg){
    var t=document.getElementById("ps-toast");
    if(!t) return;
    t.textContent=msg; t.classList.add("show");
    setTimeout(function(){ t.classList.remove("show"); },1800);
  }
  function scaleRow(it){
    var keys=["power","efficiency","value"];
    var labels=state.lang==="de"?["Leistung","Effizienz","Wert"]:["Power","Efficiency","Value"];
    var html='<div class="ps-scales">';
    keys.forEach(function(k,i){
      var v=Math.max(1,Math.min(10,Number(it[k])||1));
      html+='<div class="ps-scale"><span>'+labels[i]+'</span><div class="ps-scale-bar"><i style="width:'+(v*10)+'%"></i></div><b>'+v+'/10</b></div>';
    });
    html+='</div>';
    return html;
  }
  var view="home", cat=null, selected=null;
  function render(){
    var body=document.getElementById("ps-body");
    var title=document.getElementById("ps-title");
    var sats=document.getElementById("ps-sats");
    var back=document.getElementById("ps-back");
    if(!body) return;
    ensureInv();
    if(sats) sats.textContent=fmt(state.balance)+" sats";
    if(view==="home"){
      if(title) title.textContent=state.lang==="de"?"Teile-Shop":"Parts Shop";
      if(back) back.style.visibility="hidden";
      var html='<div class="ps-shelf">';
      Object.keys(PART_CATALOG).forEach(function(c){
        var info=PART_CATALOG[c];
        var nm=(info.name&&(info.name[state.lang]||info.name.en))||c;
        var own=categoryOwned(c);
        html+='<button type="button" class="ps-shelf-item" data-cat="'+c+'">';
        html+='<span class="ps-shelf-icon">'+(info.icon||"📦")+'</span>';
        html+='<span class="ps-shelf-name">'+nm+'</span>';
        html+='<span class="ps-shelf-own">x'+own+'</span></button>';
      });
      html+='</div>';
      if(canBuildPC()){
        html+='<button type="button" class="ps-buy-btn" id="ps-go-build" style="width:100%;margin-top:12px">'+(state.lang==="de"?"Zum Zusammenbauen":"Go to assembly")+'</button>';
      }
      body.innerHTML=html;
      body.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click",function(){ cat=el.getAttribute("data-cat"); view="list"; selected=null; render(); });
      });
      var gb=document.getElementById("ps-go-build");
      if(gb) gb.addEventListener("click",function(){ closeShop(); openPicker(); });
    } else if(view==="list"){
      var info=PART_CATALOG[cat]||{};
      if(title) title.textContent=(info.name&&(info.name[state.lang]||info.name.en))||cat;
      if(back){ back.style.visibility="visible"; back.onclick=function(){ view="home"; selected=null; render(); }; }
      var html='';
      (info.items||[]).forEach(function(it){
        var on=selected===it.id?" on":"";
        html+='<button type="button" class="ps-row'+on+'" data-id="'+it.id+'">';
        html+='<span class="ps-chip '+brandChipClass(it.brand)+'">'+chipLabel(it)+'</span>';
        html+='<span class="ps-row-meta">'+fmt(it.cost)+' · x'+(state.partInv[it.id]||0)+'</span></button>';
      });
      if(selected){
        var it=PART_BY_ID[selected];
        if(it){
          html+=scaleRow(it);
          html+='<button type="button" class="ps-buy-btn" id="ps-buy" style="width:100%">'+(state.lang==="de"?"Kaufen":"Buy")+' '+fmt(it.cost)+'</button>';
        }
      }
      body.innerHTML=html;
      body.querySelectorAll("[data-id]").forEach(function(el){
        el.addEventListener("click",function(){
          selected=el.getAttribute("data-id");
          try{ if(window.PartShop&&PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
          render();
        });
      });
      var buy=document.getElementById("ps-buy");
      if(buy) buy.addEventListener("click",function(e){ e.stopPropagation(); buySelected(); });
    }
  }
  function buySelected(){
    ensureInv();
    if(!selected) return;
    var it=PART_BY_ID[selected];
    if(!it) return;
    var cost=Number(it.cost)||0;
    if(state.balance<cost){ showToast(state.lang==="de"?"Nicht genug sats":"Not enough sats"); return; }
    state.balance-=cost;
    state.partInv[it.id]=(state.partInv[it.id]||0)+1;
    try{ if(window.PartShop&&PartShop.sfxBuy) PartShop.sfxBuy(); }catch(e){}
    if(typeof save==="function") save();
    showToast((state.lang==="de"?"Gekauft: ":"Bought: ")+partBaseName(it));
    if(typeof updateBalanceUI==="function") updateBalanceUI();
    render();
  }
  var pickerExpand={};
  function ensurePickerDom(){
    if(document.getElementById("ps-picker")) return;
    var d=document.createElement("div");
    d.id="ps-picker"; d.className="ps-overlay";
    d.innerHTML='<div class="ps-top"><button type="button" class="ps-back" id="ps-picker-back" style="visibility:hidden">←</button><h2 id="ps-picker-title">Build</h2><div class="ps-sats" id="ps-picker-cost">—</div><button type="button" class="ps-close" id="ps-picker-close">✕</button></div><div class="ps-body" id="ps-picker-body"></div>';
    document.body.appendChild(d);
    document.getElementById("ps-picker-close").addEventListener("click",closePicker);
  }
  function renderPicker(){
    ensurePickerDom(); ensureInv();
    var body=document.getElementById("ps-picker-body");
    var title=document.getElementById("ps-picker-title");
    var costEl=document.getElementById("ps-picker-cost");
    if(title) title.textContent=state.lang==="de"?"Teile für den Bau":"Parts for this build";
    if(costEl) costEl.textContent=fmt(selectedBuildCost())+" sats";
    var html='<p class="ps-inv-hint">'+(state.lang==="de"
      ? "Tippe eine Kategorie, um sie auszuklappen. Wähle je ein Teil aus deinem Inventar."
      : "Tap a category to expand. Pick one owned part per category.")+'</p>';
    REQUIRED_FOR_BUILD.forEach(function(c){
      var info=PART_CATALOG[c]||{name:{en:c,de:c},icon:"📦"};
      var nm=(info.name&&(info.name[state.lang]||info.name.en))||c;
      var owned=ownedItemsInCat(c);
      var open=!!pickerExpand[c];
      var pickedId=state.buildPick[c];
      var pickedIt=pickedId&&PART_BY_ID[pickedId];
      var summary=pickedIt
        ? (partBaseName(pickedIt)+" · "+partTierLabel(pickedIt))
        : (owned.length
            ? (owned.length+(state.lang==="de"?" im Inventar":" owned"))
            : (state.lang==="de"?"leer":"empty"));
      html+='<div class="ps-acc'+(open?" open":"")+(pickedIt?" has-pick":"")+'">';
      html+='<button type="button" class="ps-acc-head" data-acc="'+c+'">'+(info.icon||"")+' '+nm+' <span class="ps-acc-sum">'+summary+'</span> '+(open?"▾":"▸")+'</button>';
      if(open){
        if(!owned.length){
          html+='<div class="ps-row ps-muted">'+(state.lang==="de"?"Keine Teile — im Shop kaufen":"No parts — buy in shop")+'</div>';
        } else {
          owned.forEach(function(it){
            var on=state.buildPick[c]===it.id?" on":"";
            html+='<button type="button" class="ps-row'+on+'" data-pick-cat="'+c+'" data-pick-id="'+it.id+'">';
            html+='<span class="ps-chip '+brandChipClass(it.brand)+'">'+chipLabel(it)+'</span>';
            html+='<span class="ps-row-meta">x'+(state.partInv[it.id]||0)+'</span></button>';
          });
        }
      }
      html+='</div>';
    });
    if(allPicked()){
      html+='<button type="button" class="ps-buy-btn" id="ps-picker-go" style="width:100%;margin-top:12px">'+(state.lang==="de"?"Zusammenbauen starten":"Start assembly")+'</button>';
    } else {
      html+='<button type="button" class="ps-buy-btn" disabled style="width:100%;margin-top:12px">'+(state.lang==="de"?"Noch nicht alle Kategorien gewählt":"Select all categories first")+'</button>';
    }
    body.innerHTML=html;
    body.querySelectorAll("[data-acc]").forEach(function(el){
      el.addEventListener("click",function(){
        var c=el.getAttribute("data-acc");
        pickerExpand[c]=!pickerExpand[c];
        renderPicker();
      });
    });
    body.querySelectorAll("[data-pick-id]").forEach(function(el){
      el.addEventListener("click",function(){
        state.buildPick[el.getAttribute("data-pick-cat")]=el.getAttribute("data-pick-id");
        try{ if(window.PartShop&&PartShop.sfxSelect) PartShop.sfxSelect(); }catch(e){}
        renderPicker();
      });
    });
    var go=document.getElementById("ps-picker-go");
    if(go) go.addEventListener("click",function(){
      REQUIRED_FOR_BUILD.forEach(function(c){ if(state.buildBought) state.buildBought[c]=true; });
      if(typeof save==="function") save();
      closePicker();
      if(typeof openBuildOverlay==="function") openBuildOverlay();
    });
  }
  function openPicker(){
    if(!canBuildPC()){
      showToast(state.lang==="de"?"Zuerst je 1 Teil pro Kategorie kaufen":"Buy 1 part per category first");
      openShop(); return;
    }
    ensureInv();
    REQUIRED_FOR_BUILD.forEach(function(c){
      var id=state.buildPick[c];
      if(id && !(state.partInv[id]>0)) delete state.buildPick[c];
    });
    ensurePickerDom();
    document.getElementById("ps-picker").classList.add("open");
    renderPicker();
  }
  function closePicker(){
    var el=document.getElementById("ps-picker");
    if(el) el.classList.remove("open");
  }
  function openShop(){
    var ov=document.getElementById("ps-overlay");
    if(!ov) return;
    view="home"; cat=null; selected=null;
    ov.classList.add("open");
    render();
  }
  function closeShop(){
    var ov=document.getElementById("ps-overlay");
    if(ov) ov.classList.remove("open");
  }
  function wire(){
    var openBtn=document.getElementById("ps-open-btn");
    if(openBtn) openBtn.addEventListener("click",openShop);
    var closeBtn=document.getElementById("ps-close");
    if(closeBtn) closeBtn.addEventListener("click",closeShop);
    var buildBtn=document.getElementById("open-build-btn");
    if(buildBtn){
      buildBtn.addEventListener("click",function(e){ e.preventDefault(); e.stopPropagation(); openPicker(); },true);
    }
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",wire);
  else setTimeout(wire,0);
  window.PartShop=window.PartShop||{};
  Object.assign(window.PartShop,{
    open:openShop, close:closeShop, openPicker:openPicker, closePicker:closePicker,
    canBuildPC:canBuildPC, selectedBuildCost:selectedBuildCost, sellMult:sellMult,
    consumeBuildParts:consumeBuildParts, clearBuildSelectionUI:clearBuildSelectionUI,
    REQUIRED:REQUIRED_FOR_BUILD, ensureInv:ensureInv
  });
})();
