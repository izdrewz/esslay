(function () {
  "use strict";

  var core = window.EsslayTaskScrollCore;
  if (!core || window.__esslayTaskScrollAutoFogLoaded) return;
  window.__esslayTaskScrollAutoFogLoaded = true;

  var VERSION = 1;
  var STOP = {
    the:1, and:1, for:1, with:1, this:1, that:1, from:1, your:1, you:1, are:1,
    use:1, using:1, into:1, about:1, have:1, has:1, will:1, should:1, can:1,
    not:1, only:1, part:1, task:1, brief:1, assignment:1, essay:1, response:1,
    text:1, each:1, then:1, than:1, when:1, where:1, which:1, what:1, why:1,
    write:1, writing:1, page:1, source:1, sources:1, material:1, materials:1
  };

  var RULES = {
    "current-boss": [
      ["to what extent", 5], ["write a", 4], ["answer the question", 4], ["evaluate", 4],
      ["analyse", 4], ["analyze", 4], ["compare", 4], ["discuss", 4], ["respond to", 4],
      ["current boss", 8], ["main task", 6], ["question:", 3]
    ],
    "quest-part": [
      ["part 1", 5], ["part 2", 5], ["part 3", 5], ["section 1", 4], ["section 2", 4],
      ["separate task", 5], ["separate quest", 6], ["reflection", 5], ["optional", 3],
      ["planning sketch", 5], ["extension task", 5]
    ],
    "required-evidence": [
      ["must use", 5], ["must include", 5], ["at least one", 4], ["at least two", 4],
      ["required source", 6], ["provided source", 5], ["supplied source", 5], ["use the source", 4],
      ["evidence crystal", 5], ["evidence about", 5], ["reading", 2], ["article", 2],
      ["case study", 4], ["transcript", 4], ["video", 3], ["data set", 4]
    ],
    "key-scope": [
      ["biological", 5], ["neurological", 5], ["psychological", 5], ["social context", 5],
      ["ethical", 4], ["legal", 4], ["historical", 4], ["theoretical", 4], ["stakeholder", 4],
      ["key concept", 5], ["focus on", 3], ["consider the role", 3], ["context", 2]
    ],
    "crafting-rule": [
      ["word count", 4], ["words", 2], ["third person", 5], ["first person", 5],
      ["objective", 4], ["academic style", 5], ["introduction", 4], ["conclusion", 4],
      ["paragraph", 3], ["structure", 4], ["opening answer", 4], ["connected points", 4],
      ["weigh up", 5], ["clear position", 4], ["explain how", 4], ["do not simply list", 5]
    ],
    "reference-rule": [
      ["reference rule", 7], ["references", 5], ["reference list", 6], ["citation", 6],
      ["bibliography", 6], ["harvard", 5], ["apa", 5], ["own words", 5], ["paraphrase", 5],
      ["quotation", 4], ["quote", 3], ["source title", 2], ["page number", 2]
    ],
    "boss-success-condition": [
      ["marking grid", 8], ["marking criteria", 8], ["success condition", 7], ["assessment criteria", 7],
      ["learning outcome", 6], ["focus on the task", 5], ["quality of writing", 5], ["use of evidence", 5],
      ["evaluation", 4], ["organisation", 3], ["source care", 5], ["grade", 2]
    ],
    "admin-detail": [
      ["deadline", 7], ["due date", 7], ["submission", 5], ["submit by", 6], ["weighting", 6],
      ["resubmission", 6], ["late work", 5], ["no grade", 5], ["practice only", 5], ["no deadline", 6],
      ["module pass", 5], ["percentage", 4]
    ]
  };

  function text(value, limit) { return core.text(value, limit); }
  function list(value) { return core.list(value); }

  function ensureLearning(state) {
    state.briefFog = state.briefFog || {};
    var learning = state.briefFog.taskScrollLearning;
    if (!learning || typeof learning !== "object") learning = {};
    learning.version = VERSION;
    learning.corrections = Number(learning.corrections || 0);
    learning.weights = learning.weights && typeof learning.weights === "object" ? learning.weights : {};
    learning.history = list(learning.history);
    Object.keys(core.ROLES).forEach(function (role) {
      if (!role) return;
      if (!learning.weights[role] || typeof learning.weights[role] !== "object") learning.weights[role] = {};
    });
    state.briefFog.taskScrollLearning = learning;
    return learning;
  }

  function tokens(raw) {
    var words = String(raw || "").toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || [];
    var seen = {};
    return words.filter(function (word) {
      if (STOP[word] || seen[word]) return false;
      seen[word] = true;
      return true;
    }).slice(0, 32);
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function analyse(fragment, learning) {
    var raw = String(fragment && fragment.text || "");
    var lower = raw.toLowerCase();
    var scores = {};
    var signals = {};
    Object.keys(core.ROLES).forEach(function (role) {
      if (!role || !RULES[role]) return;
      scores[role] = 0;
      signals[role] = [];
      RULES[role].forEach(function (rule) {
        if (lower.indexOf(rule[0]) !== -1) {
          scores[role] += rule[1];
          signals[role].push(rule[0]);
        }
      });
    });

    tokens(raw).forEach(function (word) {
      Object.keys(core.ROLES).forEach(function (role) {
        if (!role || !RULES[role]) return;
        var weight = Number(learning.weights[role] && learning.weights[role][word] || 0);
        if (weight) {
          scores[role] += weight;
          if (signals[role].indexOf(word) === -1) signals[role].push(word);
        }
      });
    });

    var ranked = Object.keys(scores).map(function (role) {
      return { role: role, score: Math.round(scores[role] * 10) / 10, signals: signals[role].slice(0, 7) };
    }).sort(function (a, b) { return b.score - a.score; });

    var top = ranked[0];
    var second = ranked[1];
    var confidence = "low";
    if (top.score >= 7 && top.score - second.score >= 3) confidence = "high";
    else if (top.score >= 3 && top.score - second.score >= 1.5) confidence = "medium";

    if (!top.score) {
      top = { role: "", score: 0, signals: [] };
      confidence = "low";
    }

    return {
      version: VERSION,
      role: top.role,
      score: top.score,
      confidence: confidence,
      signals: top.signals,
      alternatives: ranked.slice(1, 3).filter(function (item) { return item.score > 0; }),
      analysedAt: core.iso()
    };
  }

  function analyseAll(state) {
    var learning = ensureLearning(state);
    var scroll = state.briefFog && state.briefFog.taskScroll;
    if (!scroll || !Array.isArray(scroll.fragments)) return state;
    scroll.fragments.forEach(function (fragment) {
      fragment.auto = analyse(fragment, learning);
      if (!fragment.suggestedRole && fragment.auto.role) fragment.suggestedRole = fragment.auto.role;
    });
    return state;
  }

  function updateLearning(state) {
    var learning = ensureLearning(state);
    var scroll = state.briefFog && state.briefFog.taskScroll;
    if (!scroll || !Array.isArray(scroll.fragments)) return;

    scroll.fragments.forEach(function (fragment) {
      if (!fragment || !fragment.role || !fragment.auto || !fragment.auto.role) return;
      if (fragment.role === fragment.auto.role) return;
      if (fragment.learningAppliedRole === fragment.role) return;
      if (!Object.prototype.hasOwnProperty.call(core.ROLES, fragment.role)) return;

      var learnedTokens = tokens(fragment.text).slice(0, 14);
      learnedTokens.forEach(function (word) {
        var target = Number(learning.weights[fragment.role][word] || 0);
        learning.weights[fragment.role][word] = clamp(target + 1, -4, 6);
        var guessed = Number(learning.weights[fragment.auto.role][word] || 0);
        learning.weights[fragment.auto.role][word] = clamp(guessed - 0.35, -4, 6);
      });
      learning.corrections += 1;
      learning.history.unshift({
        at: core.iso(),
        from: fragment.auto.role,
        to: fragment.role,
        signals: learnedTokens.slice(0, 6)
      });
      learning.history = learning.history.slice(0, 80);
      fragment.learningAppliedRole = fragment.role;
    });
  }

  function savePrepared(state, message) {
    updateLearning(state);
    analyseAll(state);
    return rawSave(state, message);
  }

  function group(state) {
    analyseAll(state);
    var fragments = list(state.briefFog && state.briefFog.taskScroll && state.briefFog.taskScroll.fragments);
    var bright = [];
    var knots = [];
    var placed = [];
    var parked = [];
    fragments.forEach(function (fragment) {
      if (fragment.role === "parked") { parked.push(fragment); return; }
      if (fragment.role) { placed.push(fragment); return; }
      if (fragment.auto && fragment.auto.confidence === "high" && fragment.auto.role) bright.push(fragment);
      else knots.push(fragment);
    });
    return { bright: bright, knots: knots, placed: placed, parked: parked, total: fragments.length };
  }

  function choose(state, fragmentId, role, note, source) {
    var scroll = state.briefFog && state.briefFog.taskScroll;
    if (!scroll || !Array.isArray(scroll.fragments)) return false;
    var fragment = scroll.fragments.find(function (item) { return item.id === fragmentId; });
    if (!fragment || !Object.prototype.hasOwnProperty.call(core.ROLES, role)) return false;
    fragment.role = role;
    fragment.status = role === "parked" ? "parked" : (source === "auto" ? "auto-confirmed" : "kept");
    fragment.note = text(note != null ? note : fragment.note, 900);
    fragment.decidedAt = core.iso();
    scroll.recipeConfirmedAt = "";
    return true;
  }

  function acceptBright(state) {
    var data = group(state);
    data.bright.forEach(function (fragment) {
      choose(state, fragment.id, fragment.auto.role, fragment.note, "auto");
    });
    return data.bright.length;
  }

  var rawSave = core.save;
  core.save = function (state, message) {
    return savePrepared(state, message);
  };

  var rawCreate = core.createScroll;
  core.createScroll = function (data) {
    var result = rawCreate(data);
    var state = core.load();
    analyseAll(state);
    rawSave(state, "Quest Scroll read by the Fog");
    return state;
  };

  var rawExtract = core.extractPdf;
  core.extractPdf = async function (file, progress) {
    var result = await rawExtract(file, progress);
    var state = core.load();
    var learning = ensureLearning(state);
    if (result && Array.isArray(result.fragments)) {
      result.fragments.forEach(function (fragment) {
        fragment.auto = analyse(fragment, learning);
        if (!fragment.suggestedRole && fragment.auto.role) fragment.suggestedRole = fragment.auto.role;
      });
    }
    return result;
  };

  var state = core.load();
  analyseAll(state);
  rawSave(state, "Fog readings prepared");

  window.EsslayTaskScrollAutoFog = {
    VERSION: VERSION,
    analyse: analyse,
    analyseAll: analyseAll,
    group: group,
    choose: choose,
    acceptBright: acceptBright,
    ensureLearning: ensureLearning,
    roleLabel: function (role) { return core.ROLES[role] || "Uncertain"; },
    state: function () { return core.load(); },
    save: function (state, message) { return core.save(state, message); }
  };
})();
