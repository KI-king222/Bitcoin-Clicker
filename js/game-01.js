/* part 1/30 */
var KEY = "hashpool-save-v2";

  var ACCT_KEY = "hashpool-accounts-v1";

  function acctLoadDB(){
    try {
      var raw = localStorage.getItem(ACCT_KEY);
      if(!raw) return { users:{}, session:null };
      var db = JSON.parse(raw);
      if(!db.users) db.users = {};
      return db;
    } catch(e){ return { users:{}, session:null }; }
  }
  function acctSaveDB(db){
    try { localStorage.setItem(ACCT_KEY, JSON.stringify(db)); } catch(e){}
  }
  function acctNormName(n){
    return String(n || "").trim().slice(0, 18);
  }
  function acctNameKey(n){
    return acctNormName(n).toLowerCase();
  }
  // Lightweight client hash (not bank-grade — local game only)
  function acctHash(pass, salt){
    var s = salt + ":" + pass + ":hashpool";
    var h = 2166136261;
    for(var i=0;i<s.length;i++){
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // second mix
    var h2 = 0;
    for(var j=0;j<s.length;j++){ h2 = ((h2 << 5) - h2) + s.charCodeAt(j); h2 |= 0; }
    return (h >>> 0).toString(16) + ":" + (h2 >>> 0).toString(16);
  }
  function acctSalt(){
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  function acctShowMsg(msg, kind){
    var el = document.getElementById("account-msg");
    if(!el) return;
    el.textContent = msg || "";
    el.className = "account-msg" + (kind ? " " + kind : "");
  }
  function snapshotFromState(){
    return {
      balance:state.balance, owned:state.owned, clickOwned:state.clickOwned, lang:state.lang,
      redeemed:state.redeemed, lifetime:state.lifetime, halvings:state.halvings, muted:state.muted,
      buildBought:state.buildBought, buildInstalled:state.buildInstalled, buildCablesDone:state.buildCablesDone,
      buildMode:state.buildMode, moboCased:state.moboCased, pasteQuality:state.pasteQuality, pasteDone:state.pasteDone,
      biosDone:state.biosDone, biosQuality:state.biosQuality, ex:state.ex, rigsSold:state.rigsSold,
      lastSeen:Date.now()
    };
  }
  function applySnapshot(saved){
    if(!saved) return;
    state.balance = saved.balance || 0;
    state.owned = saved.owned || state.owned;
    state.clickOwned = saved.clickOwned || state.clickOwned;
    if(saved.lang) state.lang = saved.lang;
    state.redeemed = saved.redeemed || {};
    state.lifetime = saved.lifetime || 0;
    state.halvings = saved.halvings || 0;
    state.muted = !!saved.muted;
    state.buildBought = saved.buildBought || state.buildBought;
    state.buildInstalled = saved.buildInstalled || state.buildInstalled;
    state.buildCablesDone = saved.buildCablesDone || state.buildCablesDone;
    state.buildMode = saved.buildMode || state.buildMode;
    state.moboCased = !!saved.moboCased;
    if(typeof saved.pasteQuality === "number") state.pasteQuality = saved.pasteQuality;
    state.pasteDone = !!saved.pasteDone;
    state.biosDone = !!saved.biosDone;
    if(typeof saved.biosQuality === "number") state.biosQuality = saved.biosQuality;
    if(saved.ex){ state.ex = Object.assign(exDefaults(), saved.ex); }
    state.rigsSold = saved.rigsSold || 0;
  }
