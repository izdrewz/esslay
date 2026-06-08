(function () {
  var SAVE_KEY = "esslay-study-cave-simple-v1";

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clean(v, n) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, n || 500); }
  function arr(v) { return Array.isArray(v) ? v.filter(Boolean) : []; }
  function uid() { return "id-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8); }
  function stamp() { try { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); } catch (e) { return new Date().toISOString(); } }

  function load() {
    var s = null