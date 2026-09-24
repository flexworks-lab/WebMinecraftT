import { keys, touchInput, isFlying } from "./controls.js";

function addFlightButton(actions, id, label, property, keyCode = null) {
    if (document.getElementById(id)) return;
    const button = document.createElement("button");
    button.id = id;
    button.className = "touchControl flightVerticalButton";
    button.type = "button";
    const icon = id === "touchFlyUp" ? "↑" : "↓";
    button.innerHTML = `<span class="touchIcon" aria-hidden="true">${icon}</span><span class="touchLabel">${label}</span>`;
    button.setAttribute("aria-label", label);

    const press = event => {
        event.preventDefault();
        event.stopPropagation();
        button.setPointerCapture?.(event.pointerId);
        if (keyCode) keys[keyCode] = true;
        else touchInput[property] = true;
        button.classList.add("pressed");
    };
    const release = () => {
        if (keyCode) keys[keyCode] = false;
        else touchInput[property] = false;
        button.classList.remove("pressed");
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
    actions.appendChild(button);
}

function init() {
    const actions = document.getElementById("touchActions");
    if (!actions) return;

    addFlightButton(actions, "touchFlyUp", "UP", "jump");

    const style = document.createElement("style");
    style.id = "mobileFlightControlsStyles";
    style.textContent = `
#touchFlyUp{display:none}
body.mobile-mode #touchFlyUp.flightVisible{display:block}
#touchFlyUp{left:0;top:0}
`;
    document.head.appendChild(style);

    const sync = () => {
        const visible = document.body.classList.contains("mobile-mode") && isFlying;
        document.getElementById("touchFlyUp")?.classList.toggle("flightVisible", visible);
        if (!visible) {
            touchInput.jump = false;
            keys.ControlLeft = false;
            touchInput.flyDown = false;
        }
    };

    sync();
    setInterval(sync, 50);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
