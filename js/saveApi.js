/* saveApi.js — unified save payload for localStorage today, cloud later
 *
 * Later (Phase 1): set HashpoolSave.adapter = HashpoolSave.cloudAdapter
 * and implement cloudAdapter.load/save with Cloudflare Worker / Supabase.
 * UI (export/import) and PartShop keep using getPayload / applyPayload.
 */
(function () {
  var SAVE_VERSION = 2;

  function safeState() {
    return typeof state !== "undefined" && state ? state : null;
  }

  /** Full portable save object (no passwords). */
  function getPayload() {
    var s = safeState();
    if (!s) return { v: SAVE_VERSION, lastSeen: Date.now() };
    return {
      v: SAVE_VERSION,
      balance: s.balance,
      owned: s.owned,
      clickOwned: s.clickOwned,
      lang: s.lang,
      username: s.username || "",
      redeemed: s.redeemed || {},
      lifetime: s.lifetime || 0,
      halvings: s.halvings || 0,
      muted: !!s.muted,
      buildBought: s.buildBought || {},
      buildInstalled: s.buildInstalled || {},
      buildCablesDone: s.buildCablesDone || {},
      buildMode: s.buildMode || "quick",
      moboCased: !!s.moboCased,
      pasteQuality: s.pasteQuality,
      pasteDone: !!s.pasteDone,
      biosDone: !!s.biosDone,
      biosQuality: s.biosQuality,
      ex: s.ex,
      rigsSold: s.rigsSold || 0,
      partInv: s.partInv || {},
      buildPick: s.buildPick || {},
      lastSeen: Date.now()
    };
  }

  /** Apply payload into global state (merge-safe). */
  function applyPayload(saved) {
    var s = safeState();
    if (!s || !saved || typeof saved !== "object") return false;
    if (typeof saved.balance === "number") s.balance = saved.balance;
    if (saved.owned) s.owned = saved.owned;
    if (saved.clickOwned) s.clickOwned = saved.clickOwned;
    if (saved.lang) s.lang = saved.lang;
    if (typeof saved.username === "string") s.username = saved.username;
    s.redeemed = saved.redeemed || s.redeemed || {};
    if (typeof saved.lifetime === "number") s.lifetime = saved.lifetime;
    if (typeof saved.halvings === "number") s.halvings = saved.halvings;
    s.muted = !!saved.muted;
    if (saved.buildBought) s.buildBought = saved.buildBought;
    if (saved.buildInstalled) s.buildInstalled = saved.buildInstalled;
    if (saved.buildCablesDone) s.buildCablesDone = saved.buildCablesDone;
    if (saved.buildMode) s.buildMode = saved.buildMode;
    s.moboCased = !!saved.moboCased;
    if (typeof saved.pasteQuality === "number") s.pasteQuality = saved.pasteQuality;
    s.pasteDone = !!saved.pasteDone;
    s.biosDone = !!saved.biosDone;
    if (typeof saved.biosQuality === "number") s.biosQuality = saved.biosQuality;
    if (saved.ex && typeof exDefaults === "function") {
      try { s.ex = Object.assign(exDefaults(), saved.ex); } catch (e) { s.ex = saved.ex; }
    } else if (saved.ex) s.ex = saved.ex;
    if (typeof saved.rigsSold === "number") s.rigsSold = saved.rigsSold;
    s.partInv = saved.partInv || s.partInv || {};
    s.buildPick = saved.buildPick || s.buildPick || {};
    return true;
  }

  var localAdapter = {
    name: "local",
    async load(key) {
      try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    async save(key, payload) {
      localStorage.setItem(key, JSON.stringify(payload));
    }
  };

  /** Stub for later cloud (Workers / Supabase). Not used until assigned. */
  var cloudAdapter = {
    name: "cloud",
    endpoint: "",
    async load(userToken) {
      if (!this.endpoint) throw new Error("Cloud endpoint not configured");
      var r = await fetch(this.endpoint + "/save", {
        headers: { Authorization: "Bearer " + userToken }
      });
      if (!r.ok) throw new Error("cloud load " + r.status);
      return await r.json();
    },
    async save(userToken, payload) {
      if (!this.endpoint) throw new Error("Cloud endpoint not configured");
      var r = await fetch(this.endpoint + "/save", {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + userToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!r.ok) throw new Error("cloud save " + r.status);
    }
  };

  var adapter = localAdapter;

  function storageKey() {
    return typeof KEY !== "undefined" ? KEY : "hashpool_save_v1";
  }

  async function persist() {
    var payload = getPayload();
    await adapter.save(storageKey(), payload);
    return payload;
  }

  async function restore() {
    var saved = await adapter.load(storageKey());
    if (saved) applyPayload(saved);
    return saved;
  }

  function exportJson() {
    return JSON.stringify(getPayload(), null, 2);
  }

  function importJson(text) {
    var data = typeof text === "string" ? JSON.parse(text) : text;
    if (!data || typeof data !== "object") throw new Error("invalid save");
    if (typeof data.balance !== "number" && !data.owned) throw new Error("invalid save");
    applyPayload(data);
    return data;
  }

  function bindGameHooks() {
    if (typeof currentSaveData === "function" && !currentSaveData._hpBound) {
      currentSaveData = function () {
        return getPayload();
      };
      currentSaveData._hpBound = true;
    }
    if (typeof snapshotFromState === "function" && !snapshotFromState._hpBound) {
      snapshotFromState = function () {
        return getPayload();
      };
      snapshotFromState._hpBound = true;
    }
    if (typeof applySnapshot === "function" && !applySnapshot._hpBound) {
      var _as = applySnapshot;
      applySnapshot = function (saved) {
        applyPayload(saved);
        try { _as(saved); } catch (e) {}
      };
      applySnapshot._hpBound = true;
    }
  }

  window.HashpoolSave = {
    version: SAVE_VERSION,
    getPayload: getPayload,
    applyPayload: applyPayload,
    exportJson: exportJson,
    importJson: importJson,
    persist: persist,
    restore: restore,
    localAdapter: localAdapter,
    cloudAdapter: cloudAdapter,
    get adapter() { return adapter; },
    set adapter(a) { if (a) adapter = a; },
    bindGameHooks: bindGameHooks
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindGameHooks);
  } else {
    setTimeout(bindGameHooks, 0);
  }
})();
