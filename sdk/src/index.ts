export type FCToolGameConfiguration = Record<string, unknown>;

export interface FCToolInitializePayload {
  sessionId: string;
  configuration: FCToolGameConfiguration;
  [key: string]: unknown;
}

export interface FCToolGameOptions {
  gameId: string;
  gameVersion: string;
  targetOrigin?: string;
  initializeTimeoutMs?: number;
}

interface Envelope {
  namespace: "fctool.game";
  protocolVersion: "1.0";
  type: string;
  messageId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

const NS = "fctool.game" as const;
const PROTOCOL_VERSION = "1.0" as const;

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `msg_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function queryOrigin(): string | null {
  try {
    return new URLSearchParams(window.location.search).get("fctool_origin");
  } catch {
    return null;
  }
}

export class FCToolGame {
  private options: Required<Omit<FCToolGameOptions, "targetOrigin">> & { targetOrigin: string };
  private initialized = false;
  private context: FCToolInitializePayload | null = null;
  private initPromise: Promise<FCToolInitializePayload> | null = null;

  constructor(options: FCToolGameOptions) {
    if (!options?.gameId || !options?.gameVersion) {
      throw new Error("FCToolGame requer gameId e gameVersion.");
    }

    this.options = {
      gameId: options.gameId,
      gameVersion: options.gameVersion,
      targetOrigin: options.targetOrigin || queryOrigin() || "*",
      initializeTimeoutMs: options.initializeTimeoutMs ?? 10000
    };
  }

  initialize(): Promise<FCToolInitializePayload> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Timeout aguardando INITIALIZE do FCTool."));
      }, this.options.initializeTimeoutMs);

      const onMessage = (event: MessageEvent) => {
        if (event.source !== window.parent) return;
        if (this.options.targetOrigin !== "*" && event.origin !== this.options.targetOrigin) return;

        const msg = event.data as Partial<Envelope>;
        if (!msg || msg.namespace !== NS || msg.protocolVersion !== PROTOCOL_VERSION) return;
        if (msg.type !== "INITIALIZE") return;

        window.clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        this.initialized = true;
        this.context = msg.payload as unknown as FCToolInitializePayload;
        resolve(this.context);
      };

      window.addEventListener("message", onMessage);
      this.send("HELLO", {
        gameId: this.options.gameId,
        gameVersion: this.options.gameVersion
      }, true);
    });

    return this.initPromise;
  }

  getContext(): FCToolInitializePayload | null {
    return this.context;
  }

  ready(data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    this.send("READY", data);
  }

  start(data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    this.send("STARTED", data);
  }

  pause(data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    this.send("PAUSED", data);
  }

  resume(data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    this.send("RESUMED", data);
  }

  score(value: number, max?: number): void {
    this.requireInitialized();
    if (!Number.isFinite(value)) throw new Error("score(value) requer número finito.");
    const payload: Record<string, unknown> = { value };
    if (max !== undefined) payload.max = max;
    this.send("SCORE", payload);
  }

  emit(name: string, data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    if (!name || typeof name !== "string") throw new Error("emit(name) requer um nome.");
    this.send("EVENT", { name, data });
  }

  complete(data: Record<string, unknown> = {}): void {
    this.requireInitialized();
    this.send("COMPLETED", data);
  }

  error(code: string, message: string, data: Record<string, unknown> = {}): void {
    this.send("ERROR", { code, message, data }, true);
  }

  private requireInitialized(): void {
    if (!this.initialized) {
      throw new Error("FCToolGame ainda não foi inicializado. Aguarde initialize().");
    }
  }

  private send(type: string, payload: Record<string, unknown>, allowBeforeInit = false): void {
    if (!allowBeforeInit) this.requireInitialized();
    if (window.parent === window) {
      throw new Error("O jogo deve ser executado dentro de um host/iframe FCTool ou mock host.");
    }

    const envelope: Envelope = {
      namespace: NS,
      protocolVersion: PROTOCOL_VERSION,
      type,
      messageId: uid(),
      timestamp: new Date().toISOString(),
      payload
    };

    window.parent.postMessage(envelope, this.options.targetOrigin);
  }
}
