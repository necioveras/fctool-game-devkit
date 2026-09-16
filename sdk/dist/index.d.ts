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
export declare class FCToolGame {
    private options;
    private initialized;
    private context;
    private initPromise;
    constructor(options: FCToolGameOptions);
    initialize(): Promise<FCToolInitializePayload>;
    getContext(): FCToolInitializePayload | null;
    ready(data?: Record<string, unknown>): void;
    start(data?: Record<string, unknown>): void;
    pause(data?: Record<string, unknown>): void;
    resume(data?: Record<string, unknown>): void;
    score(value: number, max?: number): void;
    emit(name: string, data?: Record<string, unknown>): void;
    complete(data?: Record<string, unknown>): void;
    error(code: string, message: string, data?: Record<string, unknown>): void;
    private requireInitialized;
    private send;
}
