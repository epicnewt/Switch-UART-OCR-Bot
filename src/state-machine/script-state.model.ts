
export interface DraftScriptState {
    name: string;
    next?: string,
    onError?: string,
    action: () => Promise<void>
}

export interface ScriptState {
    name: string;
    next?: () => (ScriptState | undefined),
    onError?: () => (ScriptState | undefined)
}
