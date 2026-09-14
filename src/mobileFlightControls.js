import { keys, touchInput, isFlying } from "./controls.js";

function addFlightButton(actions, id, label, property, keyCode = null) {
    if (document.getElementById(id)) return;
    const button = document.createElement("button");
    button.id = id;
    button.className = "touchControl flightVerticalButton";
    button.type = "button";
    button.textContent = label;
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
    addFlightButton(actions, "touchFlyDown", "DOWN", "flyDown", "ControlLeft");

    const style = document.createElement("style");
    style.id = "mobileFlightControlsStyles";
    style.textContent = `
#touchFlyUp,#touchFlyDown{display:none}
body.mobile-mode #touchFlyUp,body.mobile-mode #touchFlyDown{display:none}
body.mobile-mode #touchFlyUp.flightVisible,body.mobile-mode #touchFlyDown.flightVisible{display:block}
#touchFlyUp{left:0;top:0}
#touchFlyDown{left:0;top:58px}
`;
    document.head.appendChild(style);

    const sync = () => {
        const visible = document.body.classList.contains("mobile-mode") && isFlying;
        document.getElementById("touchFlyUp")?.classList.toggle("flightVisible", visible);
        document.getElementById("touchFlyDown")?.classList.toggle("flightVisible", visible);
        if (!visible) {
            touchInput.jump = false;
            keys.ControlLeft = false;
        }
    };

    sync();
    setInterval(sync, 50);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once:true });
else init();
