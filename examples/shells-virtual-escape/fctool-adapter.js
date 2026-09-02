(function (global) {
  "use strict";

  const GAME_ID = "shells-virtual-escape";
  const GAME_VERSION = "1.0.0-fctool.1";
  const state = {
    sdk: null,
    context: null,
    started: false,
    completed: false,
    totalScore: 0,
    hooksInstalled: false
  };

  function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function currentLevel() {
    try { return safeNumber(global.global && global.global.gmllevel_index, 1); }
    catch (_) { return 1; }
  }

  function currentScore(inst, other) {
    try {
      if (typeof global.yyInst === "function" && typeof global.YYASSET_REF === "function") {
        const game = global.yyInst(inst, other, global.YYASSET_REF(0x00000018));
        if (game && Number.isFinite(Number(game.gml_points))) return Number(game.gml_points);
      }
    } catch (_) {}
    try { return safeNumber(global.global && global.global.gmlcurrent_score, 0); }
    catch (_) { return 0; }
  }

  function emit(name, data) {
    try {
      if (state.sdk && state.sdk.initialized) state.sdk.emit(name, data || {});
    } catch (err) {
      console.warn("[FCTool Adapter] EVENT não enviado:", name, err);
    }
  }

  function sendScore(value) {
    try {
      if (state.sdk && state.sdk.initialized && Number.isFinite(Number(value))) {
        state.sdk.score(Number(value));
      }
    } catch (err) {
      console.warn("[FCTool Adapter] SCORE não enviado:", err);
    }
  }

  function startOnce(data) {
    if (state.started) return;
    state.started = true;
    try { state.sdk.start(data || {}); }
    catch (err) { console.warn("[FCTool Adapter] STARTED não enviado:", err); }
  }

  function completeOnce(data) {
    if (state.completed) return;
    state.completed = true;
    try { state.sdk.complete(data || {}); }
    catch (err) { console.warn("[FCTool Adapter] COMPLETED não enviado:", err); }
  }

  function ensureTelemetryMaps() {
    try {
      const G = global.global;
      if (!G || typeof global.ds_map_create !== "function") return;
      if (typeof global.variable_global_exists !== "function" || !global.variable_global_exists("level_time")) G.gmllevel_time = global.ds_map_create();
      if (typeof global.variable_global_exists !== "function" || !global.variable_global_exists("collected_map")) G.gmlcollected_map = global.ds_map_create();
      if (typeof global.variable_global_exists !== "function" || !global.variable_global_exists("score_map")) G.gmlscore_map = global.ds_map_create();
      if (typeof global.variable_global_exists !== "function" || !global.variable_global_exists("correct_answers_map")) G.gmlcorrect_answers_map = global.ds_map_create();
      if (typeof global.variable_global_exists !== "function" || !global.variable_global_exists("wrong_answers_map")) G.gmlwrong_answers_map = global.ds_map_create();
      if (!Number.isFinite(Number(G.gmllevel_index))) G.gmllevel_index = 1;
      if (!Number.isFinite(Number(G.gmlplaythrough))) G.gmlplaythrough = 1;
    } catch (err) {
      console.warn("[FCTool Adapter] Falha ao inicializar mapas locais:", err);
    }
  }

  function installHooks() {
    if (state.hooksInstalled) return;
    state.hooksInstalled = true;

    // A FCTool já autentica o estudante. Qualquer navegação para a tela de login
    // interna do jogo é redirecionada para a seleção de fases.
    if (typeof global.room_goto === "function" && typeof global.YYASSET_REF === "function") {
      const originalRoomGoto = global.room_goto;
      global.room_goto = function (room) {
        try {
          if (typeof global.yyfequal === "function" && global.yyfequal(room, global.YYASSET_REF(0x03000003))) {
            room = global.YYASSET_REF(0x03000004);
          }
        } catch (_) {}
        return originalRoomGoto(room);
      };
    }

    // Firebase deixa de ser fonte de identidade/persistência no modo FCTool.
    // O selecionador de fases continua usando o próprio fluxo do jogo, mas o
    // objeto de playthrough apenas abre a fase escolhida localmente.
    if (typeof global.gml_Object_obj_get_playthrought_Create_0 === "function") {
      global.gml_Object_obj_get_playthrought_Create_0 = function () {
        ensureTelemetryMaps();
        try { global.global.gmlplaythrough = safeNumber(global.global.gmlplaythrough, 0) + 1; } catch (_) {}
      };
    }

    if (typeof global.gml_Object_obj_get_playthrought_Alarm_0 === "function") {
      global.gml_Object_obj_get_playthrought_Alarm_0 = function (inst, other) {
        ensureTelemetryMaps();
        try {
          const selector = global.yyInst(inst, other, global.YYASSET_REF(0x0000003C));
          const target = selector && selector.gmlroomToGo;
          startOnce({ source: "phase_selection" });
          emit("level_started", { level: currentLevel(), playthrough: safeNumber(global.global.gmlplaythrough, 1) });
          if (target !== undefined && target !== null) global.room_goto(target);
        } catch (err) {
          console.error("[FCTool Adapter] Não foi possível iniciar a fase:", err);
          try { state.sdk.error("PHASE_START_FAILED", "Não foi possível iniciar a fase selecionada."); } catch (_) {}
        }
      };
    }

    if (typeof global.gml_Object_obj_get_playthrought_Other_62 === "function") {
      global.gml_Object_obj_get_playthrought_Other_62 = function () {};
    }

    // Desabilita gravações Firebase preservando apenas o estado local necessário
    // à lógica original das fases.
    if (typeof global.gml_Object_obj_handle_data_Create_0 === "function") {
      global.gml_Object_obj_handle_data_Create_0 = function (inst) {
        ensureTelemetryMaps();
        try {
          global.global.gmlcollected = 0;
          global.global.gmlcorrect_answers = 0;
          global.global.gmlwrong_answers = 0;
          global.global.gmlcurrent_score = 0;
          inst.gmlrequest_id = -1;
          inst.gmlget_request_id = -1;
          inst.gmlrequest_level_id = -1;
        } catch (_) {}
      };
    }
    ["gml_Object_obj_handle_data_Alarm_0", "gml_Object_obj_handle_data_Alarm_1", "gml_Object_obj_handle_data_Other_62", "gml_Object_obj_handle_data_Other_3"]
      .forEach(function (name) { if (typeof global[name] === "function") global[name] = function () {}; });

    // Coletáveis e pontuação.
    if (typeof global.gml_Object_obj_collect_Collision_obj_player === "function") {
      const originalCollect = global.gml_Object_obj_collect_Collision_obj_player;
      global.gml_Object_obj_collect_Collision_obj_player = function (inst, other) {
        const level = currentLevel();
        const before = safeNumber(global.global && global.global.gmlcollected, 0);
        const result = originalCollect(inst, other);
        const collected = safeNumber(global.global && global.global.gmlcollected, before + 1);
        const score = currentScore(inst, other);
        emit("collectible_collected", { level: level, collected: collected, pointsAdded: 10 });
        sendScore(score);
        return result;
      };
    }

    // Tentativas nos puzzles de montagem de código.
    [
      "gml_Object_obj_cod_blocks_queue_Step_0",
      "gml_Object_obj_cod_blocks_stack_1_Step_0",
      "gml_Object_obj_cod_blocks_stack_Step_0"
    ].forEach(function (name) {
      if (typeof global[name] !== "function") return;
      const original = global[name];
      global[name] = function (inst, other) {
        const beforeCorrect = safeNumber(global.global && global.global.gmlsnap_correct, 0);
        const beforeWrong = safeNumber(global.global && global.global.gmlsnap_wrong, 0);
        const result = original(inst, other);
        const afterCorrect = safeNumber(global.global && global.global.gmlsnap_correct, beforeCorrect);
        const afterWrong = safeNumber(global.global && global.global.gmlsnap_wrong, beforeWrong);
        if (afterCorrect > beforeCorrect || afterWrong > beforeWrong) {
          emit("puzzle_attempt", {
            level: currentLevel(),
            success: afterCorrect > beforeCorrect,
            correctAnswers: afterCorrect,
            wrongAnswers: afterWrong
          });
        }
        return result;
      };
    });

    // Cada conclusão de etapa do terminal concede a recompensa original e é
    // registrada como conclusão de puzzle/subpuzzle.
    [
      ["gml_Object_obj_terminal_screen_stack_Alarm_0", "stack"],
      ["gml_Object_obj_terminal_screen_queue_Alarm_0", "queue"]
    ].forEach(function (entry) {
      const name = entry[0], structure = entry[1];
      if (typeof global[name] !== "function") return;
      const original = global[name];
      global[name] = function (inst, other) {
        const result = original(inst, other);
        const score = currentScore(inst, other);
        emit("puzzle_completed", {
          level: currentLevel(),
          structure: structure,
          correctAnswers: safeNumber(global.global && global.global.gmlsnap_correct, 0),
          wrongAnswers: safeNumber(global.global && global.global.gmlsnap_wrong, 0),
          score: score
        });
        sendScore(score);
        return result;
      };
    });

    // Portal = fechamento da fase. Na última fase também conclui a GameSession.
    if (typeof global.gml_Object_obj_player_Collision_obj_portal === "function") {
      const originalPortal = global.gml_Object_obj_player_Collision_obj_portal;
      global.gml_Object_obj_player_Collision_obj_portal = function (inst, other) {
        const level = currentLevel();
        let isFinal = false;
        try { isFinal = global.yyfequal(global.g_pBuiltIn.get_current_room(), global.YYASSET_REF(0x03000014)); } catch (_) {}
        const scoreBefore = currentScore(inst, other);
        const time = (function () {
          try { return safeNumber(global.yyInst(inst, other, global.YYASSET_REF(0x00000018)).gml_time, 0); }
          catch (_) { return 0; }
        })();
        const collected = safeNumber(global.global && global.global.gmlcollected, 0);
        const correct = safeNumber(global.global && global.global.gmlsnap_correct, 0);
        const wrong = safeNumber(global.global && global.global.gmlsnap_wrong, 0);
        const result = originalPortal(inst, other);
        const roundedScore = Math.max(0, Math.round(scoreBefore));
        state.totalScore += roundedScore;
        emit("level_completed", {
          level: level,
          score: roundedScore,
          timeTicks: time,
          collectibles: collected,
          correctAnswers: correct,
          wrongAnswers: wrong
        });
        sendScore(state.totalScore);
        if (isFinal) {
          completeOnce({
            score: state.totalScore,
            result: "success",
            levelsCompleted: level
          });
        }
        return result;
      };
    }
  }

  function fitCanvas() {
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    const vw = Math.max(1, global.innerWidth || document.documentElement.clientWidth || 960);
    const vh = Math.max(1, global.innerHeight || document.documentElement.clientHeight || 540);
    const ratio = 960 / 540;
    let width = vw;
    let height = width / ratio;
    if (height > vh) {
      height = vh;
      width = height * ratio;
    }
    canvas.style.width = Math.floor(width) + "px";
    canvas.style.height = Math.floor(height) + "px";
  }

  async function boot() {
    try {
      state.sdk = new global.FCToolGameSDK.FCToolGame({
        gameId: GAME_ID,
        gameVersion: GAME_VERSION
      });
      state.context = await state.sdk.initialize();
      installHooks();
      fitCanvas();
      global.addEventListener("resize", fitCanvas);
      state.sdk.ready({ engine: "GameMaker", adapter: "fctool-adapter-1" });
      global.GameMaker_Init();
    } catch (err) {
      console.error("[FCTool Adapter] Falha na inicialização:", err);
      try { if (state.sdk) state.sdk.error("INITIALIZATION_FAILED", String(err && err.message || err)); } catch (_) {}
      const el = document.getElementById("fctool-error");
      if (el) {
        el.hidden = false;
        el.textContent = "Não foi possível inicializar o jogo no host FCTool.";
      }
    }
  }

  global.FCToolShellEscapeAdapter = { boot: boot, installHooks: installHooks };
})(window);
