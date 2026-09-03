(function (global) {
  "use strict";

  const GAME_ID = "shells-virtual-escape";
  const GAME_VERSION = "1.2.0-fctool.1";
  const LEVELS = [
    { world: 1, level: 1, overallLevel: 1, structure: "stack", roomId: 0x03000010, createEvent: "gml_Room_Stack_01_Create" },
    { world: 1, level: 2, overallLevel: 2, structure: "stack", roomId: 0x03000011, createEvent: "gml_Room_Stack_02_Create" },
    { world: 1, level: 3, overallLevel: 3, structure: "stack", roomId: 0x03000012, createEvent: "gml_Room_Stack_03_Create" },
    { world: 1, level: 4, overallLevel: 4, structure: "stack", roomId: 0x03000013, createEvent: "gml_Room_Stack_04_Create" },
    { world: 1, level: 5, overallLevel: 5, structure: "stack", roomId: 0x03000014, createEvent: "gml_Room_Stack_05_Create" },
    { world: 2, level: 1, overallLevel: 6, structure: "queue", roomId: 0x03000019, createEvent: "gml_Room_Queue_01_Create" },
    { world: 2, level: 2, overallLevel: 7, structure: "queue", roomId: 0x03000015, createEvent: "gml_Room_Queue_02_Create" },
    { world: 2, level: 3, overallLevel: 8, structure: "queue", roomId: 0x03000016, createEvent: "gml_Room_Queue_03_Create" },
    { world: 2, level: 4, overallLevel: 9, structure: "queue", roomId: 0x03000017, createEvent: "gml_Room_Queue_04_Create" },
    { world: 2, level: 5, overallLevel: 10, structure: "queue", roomId: 0x03000018, createEvent: "gml_Room_Queue_05_Create" }
  ];
  const INITIAL_ROOM_ID = 0x03000000;
  const AUTH_ROOM_IDS = new Set([0x03000001, 0x03000002, 0x03000003]);
  const PHASE_SELECTION_ROOM_ID = 0x03000004;
  const CREDITS_ROOM_ID = 0x0300001A;
  const QUEUE_OBJECTS = {
    block: 0x0000000C,
    slot: 0x0000000F,
    game: 0x00000018,
    player: 0x00000034,
    terminal: 0x00000054,
    screen: 0x00000055,
    arrow: 0x00000001,
    worldBlock: 0x00000008,
    worldBox: 0x00000009
  };
  const QUEUE_PUZZLES = [
    {
      title: "Fila 1/5 — Estruturas básicas",
      description: "Monte os nós e os ponteiros de início e fim da fila.",
      blocks: ["int valor;", "struct No *proximo;", "NO;", "NO *inicio;", "NO *fim;", "FILA;"],
      slots: [[665, 145], [690, 190], [610, 235], [660, 335], [660, 380], [620, 425]],
      lines: [[470, 105, "typedef struct No {"], [470, 235, "}"], [470, 280, "typedef struct Fila {"], [470, 425, "}"]],
      arrow: [682, 54, 90]
    },
    {
      title: "Fila 2/5 — Inicialização",
      description: "Crie uma fila vazia inicializando início e fim com NULL.",
      blocks: ["FILA *f", "(FILA *)", "malloc(sizeof(FILA));", "f->inicio", "NULL;", "f->fim", "NULL;", "return f;"],
      slots: [[585, 155], [715, 155], [845, 155], [600, 230], [760, 230], [600, 300], [760, 300], [625, 385]],
      lines: [[470, 105, "FILA *criarFila() {"], [660, 150, "="], [500, 225, "="], [500, 295, "="], [500, 380, "}"]],
      arrow: [720, 304, 90]
    },
    {
      title: "Fila 3/5 — Enfileirar",
      description: "Insira no fim: o elemento que chegou primeiro permanece no início.",
      blocks: ["FILA *f", "int valor", "(NO *) malloc(sizeof(NO));", "novoNo->valor = valor;", "novoNo->proximo = NULL;", "f->fim->proximo = novoNo;", "f->inicio = novoNo;", "f->fim = novoNo;"],
      slots: [[630, 125], [800, 125], [720, 180], [680, 235], [680, 285], [690, 345], [680, 395], [660, 450]],
      lines: [[470, 120, "void enfileirar("], [735, 120, ","], [470, 175, "NO *novoNo ="], [470, 230, ""], [470, 280, ""], [470, 335, "if (f->fim != NULL)"], [470, 390, "else"], [470, 445, ""]],
      arrow: [752, 152, 0]
    },
    {
      title: "Fila 4/5 — Desenfileirar",
      description: "Remova do início para respeitar a ordem FIFO (First In, First Out).",
      blocks: ["FILA *f", "f->inicio", "NO *removido", "removido->valor", "removido->proximo", "f->inicio", "f->fim", "NULL;", "free(removido);", "return valor;"],
      slots: [[690, 110], [690, 155], [610, 220], [735, 265], [715, 310], [625, 355], [720, 400], [840, 400], [640, 445], [820, 445]],
      lines: [[470, 105, "int desenfileirar("], [470, 150, "if ("], [760, 150, "== NULL) return -1;"], [470, 215, "= f->inicio;"], [470, 260, "int valor ="], [470, 305, "f->inicio ="], [470, 350, "if ("], [700, 350, "== NULL)"], [470, 395, "="], [470, 440, ""]],
      arrow: [608, 176, 0]
    },
    {
      title: "Fila 5/5 — Limpeza",
      description: "Esvazie a fila pela frente e libere a estrutura com segurança.",
      blocks: ["FILA *f", "f->inicio", "desenfileirar(f);", "esvaziarFila(f);", "free(f);"],
      slots: [[705, 135], [655, 205], [700, 270], [680, 370], [650, 430]],
      lines: [[470, 130, "void esvaziarFila("], [470, 200, "while ("], [735, 200, "!= NULL)"], [470, 265, ""], [470, 310, "}"], [470, 365, "void destruirFila(FILA *f) {"], [470, 425, ""], [470, 470, "}"]],
      arrow: [656, 288, 90]
    }
  ];
  const state = {
    sdk: null,
    context: null,
    started: false,
    completed: false,
    totalScore: 0,
    activeLevel: null,
    transitioningLevel: null,
    abandoningLevel: false,
    pauseConfirmPressed: false,
    queueCloseRequested: false,
    completedLevels: new Set(),
    hooksInstalled: false,
    touchInputInstalled: false
  };

  const virtualKeys = {
    held: new Set(),
    pressed: new Set(),
    released: new Set(),
    pointers: new Map()
  };

  function safeNumber(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : (fallback || 0);
  }

  function currentLevel() {
    if (state.activeLevel) return state.activeLevel.level;
    try { return safeNumber(global.global && global.global.gmllevel_index, 1); }
    catch (_) { return 1; }
  }

  function levelForRoom(room) {
    if (room === undefined || room === null || typeof global.YYASSET_REF !== "function") return null;
    for (let i = 0; i < LEVELS.length; i += 1) {
      try {
        if (typeof global.yyfequal === "function" && global.yyfequal(room, global.YYASSET_REF(LEVELS[i].roomId))) {
          return LEVELS[i];
        }
      } catch (_) {}
    }
    return null;
  }

  function currentLevelContext() {
    const active = state.activeLevel;
    if (active) {
      return {
        world: active.world,
        level: active.level,
        overallLevel: active.overallLevel,
        structure: active.structure
      };
    }
    return { world: 1, level: currentLevel(), overallLevel: currentLevel(), structure: "stack" };
  }

  function withLevelContext(data, structure) {
    const context = currentLevelContext();
    if (structure) context.structure = structure;
    return Object.assign(context, data || {});
  }

  function gameInstance(inst, other, assetId) {
    try { return global.yyInst(inst, other, global.YYASSET_REF(assetId)); }
    catch (_) { return null; }
  }

  function instanceFromId(inst, other, instanceId) {
    try { return global.yyInst(inst, other, instanceId); }
    catch (_) { return null; }
  }

  function instancesForAsset(assetId) {
    try {
      const instances = global.GetWithArray(global.YYASSET_REF(assetId)) || [];
      return Object.keys(instances).map(function (key) { return instances[key]; }).filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function hasAsset(assetId) {
    try { return Boolean(global.instance_exists(global.YYASSET_REF(assetId))); }
    catch (_) { return false; }
  }

  function destroyInstances(inst, instances) {
    instances.forEach(function (instance) {
      try { global.instance_destroy(inst, instance.id); } catch (_) {}
    });
  }

  function createQueueArrow(inst, other, definition) {
    if (!definition) return;
    try {
      const arrowId = global.instance_create_layer(definition[0], definition[1], "Instances", global.YYASSET_REF(QUEUE_OBJECTS.arrow));
      const arrow = global.yyInst(inst, other, arrowId);
      arrow.image_xscale = 0.25;
      arrow.image_yscale = 0.25;
      arrow.image_angle = definition[2] || 0;
    } catch (_) {}
  }

  function createQueueWorldBlocks(inst, other) {
    const positions = global.global && global.global.gmlvalid_positions;
    if (!Array.isArray(positions)) return;
    if (!Array.isArray(global.global.gmlblocks_references)) global.global.gmlblocks_references = [];
    positions.forEach(function (position, index) {
      try {
        const blockId = global.instance_create_layer(position[0], position[1], "Instances", global.YYASSET_REF(QUEUE_OBJECTS.worldBlock));
        const boxId = global.instance_create_layer(position[0], position[1], "Instances", global.YYASSET_REF(QUEUE_OBJECTS.worldBox));
        const block = global.yyInst(inst, other, blockId);
        const box = global.yyInst(inst, other, boxId);
        block.gmlobj_block_position = index;
        box.gmlbox_position = index;
        box.image_angle = safeNumber(box.image_angle, 0) + 90;
        global.global.gmlblocks_references.push(blockId);
      } catch (_) {}
    });
  }

  function configureQueuePuzzle(inst, other, puzzleIndex) {
    const index = Math.max(0, Math.min(QUEUE_PUZZLES.length - 1, safeNumber(puzzleIndex, 0)));
    const puzzle = QUEUE_PUZZLES[index];
    inst.gmlevent_user_now = index;
    inst.gmlblocks_positions = [];
    inst.gmlblocks_text = puzzle.blocks.slice();
    inst.gmlslots_positions = puzzle.slots.map(function (position) { return position.slice(); });
    inst.gmlblocks = [];
    inst.gmlslots = [];
    inst.gmlteste_color = false;
    inst.gmlalready_dragging = false;

    puzzle.blocks.forEach(function (blockText, indexInPuzzle) {
      const displayedIndex = puzzle.blocks.length - indexInPuzzle - 1;
      const blockPosition = [145 + (displayedIndex % 2) * 190, 165 + Math.floor(displayedIndex / 2) * 58];
      inst.gmlblocks_positions.push(blockPosition);
      const blockId = global.instance_create_layer(blockPosition[0], blockPosition[1], "Instances", global.YYASSET_REF(QUEUE_OBJECTS.block));
      const slotPosition = puzzle.slots[indexInPuzzle];
      const slotId = global.instance_create_layer(slotPosition[0], slotPosition[1], "Instances", global.YYASSET_REF(QUEUE_OBJECTS.slot));
      const block = global.yyInst(inst, other, blockId);
      const slot = global.yyInst(inst, other, slotId);
      const desiredWidth = safeNumber(global.string_width(blockText), 40) + 28;
      block.depth = -2;
      block.gmlvalue = indexInPuzzle + 1;
      block.gmltext = blockText;
      block.image_xscale = desiredWidth / Math.max(1, safeNumber(block.sprite_width, desiredWidth));
      slot.depth = -2;
      slot.gmlvalue = indexInPuzzle + 1;
      slot.image_xscale = desiredWidth / Math.max(1, safeNumber(slot.sprite_width, desiredWidth));
      inst.gmlblocks.push(blockId);
      inst.gmlslots.push(slotId);
    });
  }

  function drawQueuePuzzle(inst) {
    const puzzle = QUEUE_PUZZLES[Math.max(0, Math.min(QUEUE_PUZZLES.length - 1, safeNumber(inst.gmlevent_user_now, 0)))];
    global.draw_set_halign(0);
    global.draw_set_valign(0);
    global.draw_set_font(global.YYASSET_REF(0x06000001));
    global.draw_set_color(0);
    global.draw_text(40, 35, puzzle.title);
    global.draw_text_ext(40, 70, puzzle.description, -1, 360);
    puzzle.lines.forEach(function (line) {
      global.draw_text(line[0], line[1], line[2]);
    });
  }

  function queueBlockStep(inst, other) {
    const screen = gameInstance(inst, other, QUEUE_OBJECTS.screen);
    if (!screen) return;
    const mouseDown = Boolean(global.mouse_check_button(1));
    const mouseX = global.g_pBuiltIn.get_mouse_x();
    const mouseY = global.g_pBuiltIn.get_mouse_y();

    if (mouseDown) {
      if (inst.gmldragging && inst.gmlpass) {
        inst.x = mouseX;
        inst.y = mouseY;
        if (inst.gmlsnapped_slot !== -4) {
          const oldSlot = instanceFromId(inst, other, inst.gmlsnapped_slot);
          if (oldSlot) oldSlot.gmlalready_full = false;
          inst.gmlsnapped_slot = -4;
          inst.gmlsnapped = false;
        }
      } else if (global.point_in_rectangle(mouseX, mouseY, inst.bbox_left, inst.bbox_top, inst.bbox_right, inst.bbox_bottom) && !screen.gmlalready_dragging) {
        inst.gmldragging = true;
        inst.gmlpass = true;
        screen.gmlalready_dragging = true;
      }
      return;
    }

    if (!inst.gmldragging) return;
    inst.gmldragging = false;
    inst.gmlpass = false;
    screen.gmlalready_dragging = false;
    let nearestSlot = null;
    let minimumDistance = 9999;
    instancesForAsset(QUEUE_OBJECTS.slot).forEach(function (slot) {
      if (slot.gmlalready_full) return;
      const distance = global.point_distance(slot.x, slot.y, inst.x, inst.y);
      if (distance < 40 && distance < minimumDistance) {
        minimumDistance = distance;
        nearestSlot = slot;
      }
    });
    if (!nearestSlot) return;

    inst.gmlsnapped_slot = nearestSlot.id;
    nearestSlot.gmlalready_full = true;
    inst.gmlsnapped = true;
    inst.x = nearestSlot.x;
    inst.y = nearestSlot.y;
    global.global.gmlsnap_count = safeNumber(global.global.gmlsnap_count, 0) + 1;
    const correct = safeNumber(inst.gmlvalue, 0) === safeNumber(nearestSlot.gmlvalue, -1);
    inst.gmlteste_color = correct;
    if (correct) global.global.gmlsnap_correct = safeNumber(global.global.gmlsnap_correct, 0) + 1;
    else global.global.gmlsnap_wrong = safeNumber(global.global.gmlsnap_wrong, 0) + 1;
    try {
      if (global.global.gmlplay_music) {
        global.audio_play_sound(global.YYASSET_REF(correct ? 0x02000007 : 0x02000008), correct ? 10 : 5, false, 0.5);
      }
    } catch (_) {}
    if (correct && screen.alarm) screen.alarm[0] = 1;
  }

  function finishQueuePuzzle(inst, other) {
    if (inst.gmlteste_color) return;
    const blocks = (inst.gmlblocks || []).map(function (id) { return instanceFromId(inst, other, id); }).filter(Boolean);
    if (!blocks.length || blocks.some(function (block) { return !block.gmlteste_color; })) return;
    const puzzleIndex = Math.max(0, Math.min(4, safeNumber(inst.gmlevent_user_now, 0)));
    const terminal = gameInstance(inst, other, QUEUE_OBJECTS.terminal);
    const player = gameInstance(inst, other, QUEUE_OBJECTS.player);
    const game = gameInstance(inst, other, QUEUE_OBJECTS.game);

    inst.gmlteste_color = true;
    destroyInstances(inst, blocks);
    destroyInstances(inst, (inst.gmlslots || []).map(function (id) { return instanceFromId(inst, other, id); }).filter(Boolean));
    if (puzzleIndex <= 1) createQueueWorldBlocks(inst, other);
    if (puzzleIndex === 2 && Array.isArray(global.global.gmlpush_pop)) global.global.gmlpush_pop[0] = true;
    if (puzzleIndex === 3 && Array.isArray(global.global.gmlpush_pop)) global.global.gmlpush_pop[1] = true;
    if (puzzleIndex === 4) {
      global.global.gmlhas_gun = false;
      if (Array.isArray(global.global.gmlde)) global.global.gmlde[0] = false;
      global.global.gmlpush_pop = [false, false];
      if (terminal) terminal.gmlremove_all_blocks = true;
    }
    if (terminal) {
      terminal.gmlpuzzle_solved = true;
      createQueueArrow(inst, other, QUEUE_PUZZLES[puzzleIndex].arrow);
      try { global.instance_destroy(inst, terminal.gmlarrow); } catch (_) {}
    }
    if (game) game.gml_points = safeNumber(game.gml_points, 0) + 50;
    if (player) player.gmlterminal_screen = false;
    try { global.instance_destroy(inst, global.YYASSET_REF(QUEUE_OBJECTS.screen)); } catch (_) {}
  }

  function closeQueuePuzzle(inst, other) {
    const player = gameInstance(inst, other, QUEUE_OBJECTS.player);
    if (player) player.gmlterminal_screen = false;
    destroyInstances(inst, (inst.gmlblocks || []).map(function (id) { return instanceFromId(inst, other, id); }).filter(Boolean));
    destroyInstances(inst, (inst.gmlslots || []).map(function (id) { return instanceFromId(inst, other, id); }).filter(Boolean));
    try { global.instance_destroy(inst, global.YYASSET_REF(QUEUE_OBJECTS.screen)); } catch (_) {}
  }

  function ensureQueueTerminals() {
    const rooms = global.JSON_game && global.JSON_game.GMRooms;
    if (!Array.isArray(rooms)) return;
    const terminalPositions = {
      Queue_01: [208, 368],
      Queue_02: [176, 320],
      Queue_03: [152, 352],
      Queue_04: [416, 472],
      Queue_05: [608, 64]
    };
    let nextInstanceId = 190001;
    rooms.forEach(function (room) {
      const position = terminalPositions[room && room.pName];
      if (!position || !Array.isArray(room.pInstances)) return;
      let terminal = room.pInstances.find(function (instance) {
        return instance.index === QUEUE_OBJECTS.terminal || instance.index === 0x00000057;
      });
      if (terminal) {
        terminal.index = QUEUE_OBJECTS.terminal;
        return;
      }
      terminal = {
        x: position[0], y: position[1], index: QUEUE_OBJECTS.terminal, id: nextInstanceId,
        rotation: 0, scaleX: 1, scaleY: 1, imageSpeed: 1, imageIndex: 0, colour: 4294967295
      };
      nextInstanceId += 1;
      room.pInstances.push(terminal);
      const instanceLayer = Array.isArray(room.layers) && room.layers.find(function (layer) { return layer.type === 2; });
      if (instanceLayer) {
        if (!Array.isArray(instanceLayer.iinstIDs)) instanceLayer.iinstIDs = [];
        instanceLayer.iinstIDs.push(terminal.id);
        instanceLayer.icount = instanceLayer.iinstIDs.length;
      }
    });
  }

  function installQueueWorldFixes() {
    ensureQueueTerminals();

    if (typeof global.gml_Object_obj_terminal_screen_queue_Create_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_terminal_screen_queue_Create_0", function (inst, other) {
        global.global.gmlsnap_count = 0;
        global.global.gmlsnap_correct = 0;
        global.global.gmlsnap_wrong = 0;
        configureQueuePuzzle(inst, other, global.global.gmlqueue_puzzle);
      });
    }
    if (typeof global.gml_Object_obj_terminal_screen_queue_Alarm_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_terminal_screen_queue_Alarm_0", finishQueuePuzzle);
    }
    if (typeof global.gml_Object_obj_terminal_screen_queue_Alarm_1 === "function") {
      replaceGameMakerEvent("gml_Object_obj_terminal_screen_queue_Alarm_1", closeQueuePuzzle);
    }
    if (typeof global.gml_Object_obj_terminal_screen_queue_Draw_64 === "function") {
      replaceGameMakerEvent("gml_Object_obj_terminal_screen_queue_Draw_64", function (inst) {
        drawQueuePuzzle(inst);
      });
    }
    if (typeof global.gml_Object_obj_cod_blocks_queue_Step_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_cod_blocks_queue_Step_0", queueBlockStep);
    }

    if (typeof global.gml_Object_obj_terminal_queue_Step_0 === "function") {
      const originalTerminalStep = global.gml_Object_obj_terminal_queue_Step_0;
      replaceGameMakerEvent("gml_Object_obj_terminal_queue_Step_0", function (inst, other) {
        if (!inst.gmlpuzzle_solved) return originalTerminalStep(inst, other);
        if (inst.gmlf !== -4) {
          try { global.instance_destroy(inst, inst.gmlf); } catch (_) {}
          inst.gmlf = -4;
        }
      });
    }

    // F fecha uma atividade de fila aberta e não cria telas duplicadas. Depois
    // de resolvido, o terminal deixa de aceitar novas interações.
    if (typeof global.keyboard_check_pressed === "function") {
      const originalPressed = global.keyboard_check_pressed;
      global.keyboard_check_pressed = function (key) {
        const pressed = originalPressed(key);
        if (Number(key) !== 70 || !pressed) return pressed;
        if (hasAsset(QUEUE_OBJECTS.screen)) {
          state.queueCloseRequested = true;
          return false;
        }
        if (instancesForAsset(QUEUE_OBJECTS.terminal).some(function (terminal) { return terminal.gmlpuzzle_solved; })) {
          return false;
        }
        return true;
      };
    }

    if (typeof global.gml_Object_obj_player_Step_0 === "function") {
      const originalPlayerStep = global.gml_Object_obj_player_Step_0;
      replaceGameMakerEvent("gml_Object_obj_player_Step_0", function (inst, other) {
        const queueScreenWasOpen = hasAsset(QUEUE_OBJECTS.screen);
        const previousX = inst.x;
        const previousY = inst.y;
        const previousDirectAction = queueScreenWasOpen && Array.isArray(global.global.gmlde) ? global.global.gmlde[0] : null;
        if (queueScreenWasOpen && Array.isArray(global.global.gmlde)) global.global.gmlde[0] = false;
        const result = originalPlayerStep(inst, other);
        if (previousDirectAction !== null) global.global.gmlde[0] = previousDirectAction;
        if (queueScreenWasOpen || hasAsset(QUEUE_OBJECTS.screen)) {
          inst.x = previousX;
          inst.y = previousY;
          inst.gmlhspd = 0;
          inst.gmlvspd = 0;
          inst.gmljump_key = 0;
        }
        if (state.queueCloseRequested) {
          state.queueCloseRequested = false;
          const screen = gameInstance(inst, other, QUEUE_OBJECTS.screen);
          if (screen && screen.alarm) screen.alarm[1] = 1;
        }
        return result;
      });
    }
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

  function abandonCurrentLevel(inst, other, reason) {
    if (!state.activeLevel || state.abandoningLevel) return;
    state.abandoningLevel = true;
    let time = 0;
    try {
      const game = gameInstance(inst, other, QUEUE_OBJECTS.game);
      time = safeNumber(game && game.gml_time, 0);
    } catch (_) {}
    emit("level_abandoned", withLevelContext({
      reason: reason || "menu",
      score: Math.max(0, Math.round(currentScore(inst, other))),
      timeTicks: time,
      collectibles: safeNumber(global.global && global.global.gmlcollected, 0),
      correctAnswers: safeNumber(global.global && global.global.gmlsnap_correct, 0),
      wrongAnswers: safeNumber(global.global && global.global.gmlsnap_wrong, 0)
    }));
    state.transitioningLevel = null;
    state.activeLevel = null;
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

  // O export HTML5 do GameMaker guarda as funções dentro de JSON_game assim que
  // o script é avaliado. Atualizamos objetos e salas, além da propriedade em
  // window, para que os hooks sejam usados durante GameMaker_Init().
  function replaceGameMakerEvent(name, replacement) {
    const original = global[name];
    if (typeof original !== "function") return null;
    global[name] = replacement;

    const game = global.JSON_game;
    if (!game) return original;

    function replaceReferences(value) {
      if (!value || typeof value !== "object") return;
      Object.keys(value).forEach(function (key) {
        if (value[key] === original) value[key] = replacement;
        else replaceReferences(value[key]);
      });
    }

    [game.GMObjects, game.GMRooms].forEach(function (collection) {
      if (Array.isArray(collection)) collection.forEach(replaceReferences);
    });
    return original;
  }

  function clearVirtualKeys() {
    virtualKeys.held.clear();
    virtualKeys.pressed.clear();
    virtualKeys.released.clear();
    virtualKeys.pointers.clear();
    document.querySelectorAll("#touch-controls .is-active").forEach(function (button) {
      button.classList.remove("is-active");
    });
  }

  function installTouchInput() {
    if (state.touchInputInstalled) return;
    state.touchInputInstalled = true;

    const originalCheck = global.keyboard_check;
    const originalPressed = global.keyboard_check_pressed;
    const originalReleased = global.keyboard_check_released;
    if (typeof originalCheck === "function") {
      global.keyboard_check = function (key) {
        return virtualKeys.held.has(Number(key)) || originalCheck(key);
      };
    }
    if (typeof originalPressed === "function") {
      global.keyboard_check_pressed = function (key) {
        const code = Number(key);
        // Os controles de jogo também navegam pelos menus em telas de toque.
        const aliases = { 13: 70, 37: 81, 38: 65, 39: 69, 40: 68 };
        const alias = aliases[code];
        const virtual = virtualKeys.pressed.has(code) || (alias !== undefined && virtualKeys.pressed.has(alias));
        if (virtual) {
          virtualKeys.pressed.delete(code);
          if (alias !== undefined) virtualKeys.pressed.delete(alias);
        }
        return virtual || originalPressed(key);
      };
    }
    if (typeof originalReleased === "function") {
      global.keyboard_check_released = function (key) {
        const code = Number(key);
        const virtual = virtualKeys.released.has(code);
        if (virtual) virtualKeys.released.delete(code);
        return virtual || originalReleased(key);
      };
    }

    const params = new URLSearchParams(global.location.search);
    const forceTouch = params.get("touch_controls") === "1";
    const hasTouch = forceTouch || (global.navigator && global.navigator.maxTouchPoints > 0) ||
      (typeof global.matchMedia === "function" && global.matchMedia("(pointer: coarse)").matches);
    if (hasTouch) document.body.classList.add("fctool-touch-enabled");

    const controls = document.getElementById("touch-controls");
    if (!controls) return;

    function press(event) {
      const button = event.target.closest("[data-key]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const code = Number(button.dataset.key);
      if (!virtualKeys.held.has(code)) virtualKeys.pressed.add(code);
      virtualKeys.held.add(code);
      virtualKeys.pointers.set(event.pointerId, code);
      button.classList.add("is-active");
      try { button.setPointerCapture(event.pointerId); } catch (_) {}
    }

    function release(event) {
      const code = virtualKeys.pointers.get(event.pointerId);
      if (code === undefined) return;
      event.preventDefault();
      event.stopPropagation();
      virtualKeys.pointers.delete(event.pointerId);
      const stillHeld = Array.from(virtualKeys.pointers.values()).some(function (value) { return value === code; });
      if (!stillHeld) {
        virtualKeys.held.delete(code);
        virtualKeys.released.add(code);
        const button = controls.querySelector('[data-key="' + code + '"]');
        if (button) button.classList.remove("is-active");
      }
    }

    controls.addEventListener("pointerdown", press);
    controls.addEventListener("pointerup", release);
    controls.addEventListener("pointercancel", release);
    controls.addEventListener("contextmenu", function (event) { event.preventDefault(); });
    global.addEventListener("blur", clearVirtualKeys);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) clearVirtualKeys();
    });
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

  function installOfflineNetworkGuard() {
    // As únicas chamadas às APIs HTTP do código GML eram autenticação e
    // persistência remotas. Os recursos do jogo são carregados pelo runtime do
    // GameMaker usando caminhos relativos e não passam por estas funções.
    ["http_request", "http_get", "http_post_string"].forEach(function (name) {
      if (typeof global[name] !== "function") return;
      global[name] = function () {
        console.warn("[FCTool Adapter] Requisição GML bloqueada: o jogo opera totalmente offline.");
        return -1;
      };
    });
  }

  function installHooks() {
    if (state.hooksInstalled) return;
    state.hooksInstalled = true;
    installOfflineNetworkGuard();
    installTouchInput();
    installQueueWorldFixes();

    // O conteúdo de filas já existe no export original, porém o segundo título
    // nunca era adicionado ao array e o seletor limitava o cursor ao Mundo 1.
    if (typeof global.gml_Object_obj_selecao_de_fases_Create_0 === "function") {
      const originalSelectionCreate = global.gml_Object_obj_selecao_de_fases_Create_0;
      replaceGameMakerEvent("gml_Object_obj_selecao_de_fases_Create_0", function (inst, other) {
        const result = originalSelectionCreate(inst, other);
        if (inst && inst.gmlgameTitle) inst.gmlgameTitle[1] = "Mundo 02:Fila";
        return result;
      });
    }

    // Normaliza os números das fases entre os dois mundos e registra a entrada
    // em cada sala. As salas de fila não definiam gmllevel_index no export.
    LEVELS.forEach(function (entry) {
      if (typeof global[entry.createEvent] !== "function") return;
      const originalCreate = global[entry.createEvent];
      replaceGameMakerEvent(entry.createEvent, function (inst, other) {
        const result = originalCreate(inst, other);
        state.activeLevel = entry;
        state.transitioningLevel = null;
        state.abandoningLevel = false;
        try { global.global.gmllevel_index = entry.overallLevel; } catch (_) {}
        startOnce({ source: "phase_selection", world: entry.world, structure: entry.structure });
        emit("level_started", withLevelContext({
          playthrough: safeNumber(global.global && global.global.gmlplaythrough, 1)
        }));
        return result;
      });
    });

    // A FCTool já fornece o contexto do estudante. As três salas antigas de
    // login/cadastro são sempre redirecionadas para a seleção de fases.
    if (typeof global.room_goto === "function" && typeof global.YYASSET_REF === "function") {
      const originalRoomGoto = global.room_goto;
      global.room_goto = function (room) {
        try {
          if (typeof global.yyfequal === "function") {
            AUTH_ROOM_IDS.forEach(function (authRoomId) {
              if (global.yyfequal(room, global.YYASSET_REF(authRoomId))) {
                room = global.YYASSET_REF(PHASE_SELECTION_ROOM_ID);
              }
            });
          }
        } catch (_) {}
        return originalRoomGoto(room);
      };
    }

    // Neutraliza também os eventos antigos de autenticação. Assim, mesmo uma
    // referência residual do export não pode iniciar uma requisição externa.
    [
      "gml_Script_get_user_account_info",
      "gml_Script_send_email_verification",
      "gml_Object_obj_login_Create_0",
      "gml_Object_obj_login_Alarm_0",
      "gml_Object_obj_login_Other_62",
      "gml_Object_obj_signup_Create_0",
      "gml_Object_obj_signup_Alarm_0",
      "gml_Object_obj_signup_Other_62"
    ].forEach(function (name) {
      replaceGameMakerEvent(name, function () { return -1; });
    });

    // A persistência remota deixa de ser fonte de estado no modo FCTool.
    // O selecionador de fases continua usando o próprio fluxo do jogo, mas o
    // objeto de playthrough apenas abre a fase escolhida localmente.
    if (typeof global.gml_Object_obj_get_playthrought_Create_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_get_playthrought_Create_0", function () {
        ensureTelemetryMaps();
        try { global.global.gmlplaythrough = safeNumber(global.global.gmlplaythrough, 0) + 1; } catch (_) {}
      });
    }

    if (typeof global.gml_Object_obj_get_playthrought_Alarm_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_get_playthrought_Alarm_0", function (inst, other) {
        ensureTelemetryMaps();
        try {
          const selector = global.yyInst(inst, other, global.YYASSET_REF(0x0000003C));
          const target = selector && selector.gmlroomToGo;
          if (levelForRoom(target)) global.room_goto(target);
        } catch (err) {
          console.error("[FCTool Adapter] Não foi possível iniciar a fase:", err);
          try { state.sdk.error("PHASE_START_FAILED", "Não foi possível iniciar a fase selecionada."); } catch (_) {}
        }
      });
    }

    if (typeof global.gml_Object_obj_get_playthrought_Other_62 === "function") {
      replaceGameMakerEvent("gml_Object_obj_get_playthrought_Other_62", function () {});
    }

    // Desabilita gravações remotas preservando apenas o estado local necessário
    // à lógica original das fases.
    if (typeof global.gml_Object_obj_handle_data_Create_0 === "function") {
      replaceGameMakerEvent("gml_Object_obj_handle_data_Create_0", function (inst) {
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
      });
    }
    ["gml_Object_obj_handle_data_Alarm_0", "gml_Object_obj_handle_data_Alarm_1", "gml_Object_obj_handle_data_Other_62", "gml_Object_obj_handle_data_Other_3"]
      .forEach(function (name) { replaceGameMakerEvent(name, function () {}); });

    // Captura a confirmação que o próprio Step do pause consumiu. Isso também
    // funciona com o botão F dos controles de toque, que é mapeado para Enter.
    if (typeof global.keyboard_check_pressed === "function") {
      const originalPausePressed = global.keyboard_check_pressed;
      global.keyboard_check_pressed = function (key) {
        const pressed = originalPausePressed(key);
        if (Number(key) === 13 && pressed) state.pauseConfirmPressed = true;
        return pressed;
      };
    }

    // O item "Menu" do pause dependia da confirmação de uma gravação remota.
    // No modo FCTool, a confirmação volta diretamente à tela inicial e registra
    // que o estudante desistiu da fase antes de trocar de sala.
    if (typeof global.gml_Object_obj_pause_Step_0 === "function") {
      const originalPauseStep = global.gml_Object_obj_pause_Step_0;
      replaceGameMakerEvent("gml_Object_obj_pause_Step_0", function (inst, other) {
        const dataHandler = gameInstance(inst, other, 0x0000001A);
        const menuWasSelected = Boolean(inst.gmlpause && safeNumber(inst.gmlb, 0) === 2);
        state.pauseConfirmPressed = false;
        const result = originalPauseStep(inst, other);
        if (menuWasSelected && state.pauseConfirmPressed) {
          if (dataHandler && dataHandler.alarm) dataHandler.alarm[0] = -1;
          try { global.instance_activate_all(inst); } catch (_) {}
          abandonCurrentLevel(inst, other, "pause_menu");
          global.room_goto(global.YYASSET_REF(INITIAL_ROOM_ID));
        }
        state.pauseConfirmPressed = false;
        return result;
      });
    }

    ["gml_Object_obj_menu_button_Mouse_4", "gml_Object_obj_menu_button_KeyPress_27"].forEach(function (name) {
      if (typeof global[name] !== "function") return;
      replaceGameMakerEvent(name, function (inst, other) {
        try { global.instance_activate_all(inst); } catch (_) {}
        abandonCurrentLevel(inst, other, "menu_button");
        global.room_goto(global.YYASSET_REF(INITIAL_ROOM_ID));
      });
    });

    // Coletáveis e pontuação.
    if (typeof global.gml_Object_obj_collect_Collision_obj_player === "function") {
      const originalCollect = global.gml_Object_obj_collect_Collision_obj_player;
      replaceGameMakerEvent("gml_Object_obj_collect_Collision_obj_player", function (inst, other) {
        const before = safeNumber(global.global && global.global.gmlcollected, 0);
        const result = originalCollect(inst, other);
        const collected = safeNumber(global.global && global.global.gmlcollected, before + 1);
        const score = currentScore(inst, other);
        emit("collectible_collected", withLevelContext({ collected: collected, pointsAdded: 10 }));
        sendScore(score);
        return result;
      });
    }

    // Tentativas nos puzzles de montagem de código.
    [
      "gml_Object_obj_cod_blocks_queue_Step_0",
      "gml_Object_obj_cod_blocks_stack_1_Step_0",
      "gml_Object_obj_cod_blocks_stack_Step_0"
    ].forEach(function (name) {
      if (typeof global[name] !== "function") return;
      const original = global[name];
      replaceGameMakerEvent(name, function (inst, other) {
        const beforeCorrect = safeNumber(global.global && global.global.gmlsnap_correct, 0);
        const beforeWrong = safeNumber(global.global && global.global.gmlsnap_wrong, 0);
        const result = original(inst, other);
        const afterCorrect = safeNumber(global.global && global.global.gmlsnap_correct, beforeCorrect);
        const afterWrong = safeNumber(global.global && global.global.gmlsnap_wrong, beforeWrong);
        if (afterCorrect > beforeCorrect || afterWrong > beforeWrong) {
          emit("puzzle_attempt", withLevelContext({
            success: afterCorrect > beforeCorrect,
            correctAnswers: afterCorrect,
            wrongAnswers: afterWrong
          }));
        }
        return result;
      });
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
      replaceGameMakerEvent(name, function (inst, other) {
        const wasCompleted = Boolean(inst.gmlteste_color);
        const result = original(inst, other);
        if (wasCompleted || !inst.gmlteste_color) return result;
        const score = currentScore(inst, other);
        emit("puzzle_completed", withLevelContext({
          correctAnswers: safeNumber(global.global && global.global.gmlsnap_correct, 0),
          wrongAnswers: safeNumber(global.global && global.global.gmlsnap_wrong, 0),
          score: score
        }, structure));
        sendScore(score);
        return result;
      });
    });

    // Portal = fechamento da fase. A Queue_01 foi criada fora da sequência das
    // demais salas no projeto original; por isso o avanço do Mundo 2 é explícito.
    // A GameSession só termina depois da quinta fase de filas.
    if (typeof global.gml_Object_obj_player_Collision_obj_portal === "function") {
      const originalPortal = global.gml_Object_obj_player_Collision_obj_portal;
      replaceGameMakerEvent("gml_Object_obj_player_Collision_obj_portal", function (inst, other) {
        let room = null;
        try { room = global.g_pBuiltIn.get_current_room(); } catch (_) {}
        const active = levelForRoom(room) || state.activeLevel;
        const transitionKey = active ? active.world + ":" + active.level : String(currentLevel());
        if (state.transitioningLevel === transitionKey) return originalPortal(inst, other);
        state.transitioningLevel = transitionKey;
        const isFinal = Boolean(active && active.world === 2 && active.level === 5);
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
        if (active) state.completedLevels.add(transitionKey);
        emit("level_completed", withLevelContext({
          score: roundedScore,
          timeTicks: time,
          collectibles: collected,
          correctAnswers: correct,
          wrongAnswers: wrong
        }));
        sendScore(state.totalScore);

        if (active && active.world === 1 && active.level === 5) {
          global.room_goto(global.YYASSET_REF(PHASE_SELECTION_ROOM_ID));
        } else if (active && active.world === 2) {
          const nextRoomId = active.level === 5 ? CREDITS_ROOM_ID :
            LEVELS.find(function (entry) {
              return entry.world === 2 && entry.level === active.level + 1;
            }).roomId;
          global.room_goto(global.YYASSET_REF(nextRoomId));
        }

        if (isFinal) {
          completeOnce({
            score: state.totalScore,
            result: "success",
            levelsCompleted: state.completedLevels.size
          });
        }
        return result;
      });
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
      state.sdk.ready({ engine: "GameMaker", adapter: "fctool-adapter-5", offline: true });
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
