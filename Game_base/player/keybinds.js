const STORAGE_KEY = "webminecraft-keybinds-v1";

export const defaultKeybinds = Object.freeze({
    forward: "KeyW",
    back: "KeyS",
    left: "KeyA",
    right: "KeyD",
    jump: "Space",
    sneak: "KeyC",
    sprint: "ShiftLeft",
    fly: "KeyF",
    flyDown: "ControlLeft",
});

const labels = Object.freeze({
    forward: "Move Forward",
    back: "Move Backward",
    left: "Move Left",
    right: "Move Right",
    jump: "Jump",
    sneak: "Sneak",
    sprint: "Sprint",
    fly: "Toggle Flight",
    flyDown: "Fly Down",
});

let keybinds = read();

function read() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
        const next = { ...defaultKeybinds };
        if (saved && typeof saved === "object") {
            for (const key of Object.keys(defaultKeybinds)) {
                if (typeof saved[key] === "string" && saved[key]) next[key] = saved[key];
            }
        }
        return next;
    } catch {
        return { ...defaultKeybinds };
    }
}

function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(keybinds)); } catch {}
}

function emit() {
    window.dispatchEvent(new CustomEvent("webminecraft-keybinds-changed", {
        detail: { keybinds: { ...keybinds } }
    }));
}

export function getKeybind(action) {
    return keybinds[action] || defaultKeybinds[action];
}

export function getKeybinds() {
    return { ...keybinds };
}

export function getKeybindLabel(action) {
    return labels[action] || action;
}

export function setKeybind(action, code) {
    if (!Object.prototype.hasOwnProperty.call(defaultKeybinds, action)) return false;
    if (typeof code !== "string" || !code) return false;
    keybinds[action] = code;
    save();
    emit();
    return true;
}

export function resetKeybinds() {
    keybinds = { ...defaultKeybinds };
    save();
    emit();
}

export function formatKeyCode(code) {
    if (!code) return "Unbound";
    const aliases = {
        Space: "Space",
        ShiftLeft: "Left Shift",
        ShiftRight: "Right Shift",
        ControlLeft: "Left Ctrl",
        ControlRight: "Right Ctrl",
        AltLeft: "Left Alt",
        AltRight: "Right Alt",
        ArrowUp: "Arrow Up",
        ArrowDown: "Arrow Down",
        ArrowLeft: "Arrow Left",
        ArrowRight: "Arrow Right",
        Backquote: "`",
        Minus: "-",
        Equal: "=",
        BracketLeft: "[",
        BracketRight: "]",
        Backslash: "\\",
        Semicolon: ";",
        Quote: "'",
        Comma: ",",
        Period: ".",
        Slash: "/",
};
    if (aliases[code]) return aliases[code];
    if (/^Key[A-Z]$/.test(code)) return code.slice(3);
    if (/^Digit[0-9]$/.test(code)) return code.slice(5);
    if (/^Numpad/.test(code)) return code.replace("Numpad", "Numpad ");
    return code.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/Left|Right/g, "$&").trim();
}

export const keybindLabels = labels;
