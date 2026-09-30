/* part 2/30 */

  function guestReset(){
    state.balance = 0; state.lifetime = 0; state.perClick = 1; state.rigsSold = 0;
    state.redeemed = {};
    UPGRADES.forEach(function(u){ state.owned[u.id] = 0; });
    CLICK_UPGRADES.forEach(function(u){ state.clickOwned[u.id] = 0; });
    PARTS.forEach(function(p){ state.buildBought[p.id]=false; state.buildInstalled[p.id]=false; });
    Object.keys(CABLES).forEach(function(k){ state.buildCablesDone[k]=false; });
    state.moboCased=false; state.pasteDone=false; state.biosDone=false;
    state.ex = exDefaults();
  }
  function acctPersistCurrent(){
    var db = acctLoadDB();
    if(!state.username) return;
    var key = acctNameKey(state.username);
    if(!db.users[key]) return;
    db.users[key].save = snapshotFromState();
    db.session = key;
    acctSaveDB(db);
  }
  function acctRegister(){
    var name = acctNormName(document.getElementById("username-input").value);
    var pass = document.getElementById("password-input").value;
    if(name.length < 3){ acctShowMsg(t("errUserShort"), "err"); return; }
    if(pass.length < 6){ acctShowMsg(t("errPassShort"), "err"); return; }
    var db = acctLoadDB();
    var key = acctNameKey(name);
    if(db.users[key]){ acctShowMsg(t("errUserTaken"), "err"); return; }
    var salt = acctSalt();
    db.users[key] = {
      name: name,
      salt: salt,
      hash: acctHash(pass, salt),
      created: Date.now(),
      save: snapshotFromState()
    };
    db.session = key;
    acctSaveDB(db);
    state.username = name;
    document.getElementById("password-input").value = "";
    acctShowMsg(t("okRegistered"), "ok");
    save();
    applyStaticText();
    render();
  }
  function acctLogin(){
    var name = acctNormName(document.getElementById("username-input").value);
    var pass = document.getElementById("password-input").value;
    if(name.length < 3){ acctShowMsg(t("errUserShort"), "err"); return; }
    if(pass.length < 6){ acctShowMsg(t("errPassShort"), "err"); return; }
    var db = acctLoadDB();
    var key = acctNameKey(name);
    var user = db.users[key];
    if(!user){ acctShowMsg(t("errNoUser"), "err"); return; }
    if(acctHash(pass, user.salt) !== user.hash){ acctShowMsg(t("errBadLogin"), "err"); return; }
    // load this user's cloudless save
    if(user.save) applySnapshot(user.save);
    state.username = user.name || name;
    db.session = key;
    acctSaveDB(db);
    document.getElementById("password-input").value = "";
    acctShowMsg(t("okLogin"), "ok");
    save();
    applyStaticText();
    render();
  }
