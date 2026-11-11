const MAX_SCREENSHOT_BYTES = 340 * 1024;
const MAX_RECORDING_BYTES = 220 * 1024;
const MAX_ATTACHMENT_CHARS = 820000;
const MAX_RECORDING_MS = 8000;

let reportModal;
let captureLayer;
let reportButton;
let descriptionInput;
let categoryInput;
let submitButton;
let reportStatus;
let screenshotBlob = null;
let recordingBlob = null;
let screenshotUrl = "";
let recordingUrl = "";
let activeRecorder = null;
let activeStream = null;
let recordingTimer = null;
let recordingAutoStopTimer = null;
let recordingStartedAt = 0;
let recordingCancelled = false;
let firebaseWaitPromise = null;

function waitForFirebase(timeout = 15000) {
    if (firebaseWaitPromise) return firebaseWaitPromise;
    firebaseWaitPromise = new Promise(resolve => {
        const started = Date.now();
        const check = () => {
            const firebase = window.firebase;
            try {
                if (firebase?.auth && firebase?.firestore && firebase.firestore()?.collection) {
                    resolve(firebase);
                    return;
                }
            } catch {}
            if (Date.now() - started >= timeout) {
                resolve(null);
                return;
            }
            window.setTimeout(check, 150);
        };
        check();
    });
    return firebaseWaitPromise;
}

function installStyles() {
    if (document.getElementById("webMinecraftBugReportStyles")) return;
    const style = document.createElement("style");
    style.id = "webMinecraftBugReportStyles";
    style.textContent = [
        "#bugReportButton{position:fixed;top:max(18px,env(safe-area-inset-top));right:82px;width:48px;height:48px;display:none;align-items:center;justify-content:center;padding:0;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:linear-gradient(#737373,#555);color:#fff;z-index:500000;box-shadow:inset 2px 2px rgba(255,255,255,.14),inset -2px -2px rgba(0,0,0,.3),0 3px 0 #171717;cursor:pointer}",
        "#bugReportButton svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:square;stroke-linejoin:miter;shape-rendering:crispEdges}",
        "#bugReportButton:hover{filter:brightness(1.14)}",
        "body.webminecraft-in-world:not(.webminecraft-report-capture) #bugReportButton{display:flex!important}",
        "body.mobile-mode.webminecraft-in-world:not(.webminecraft-report-capture) #bugReportButton{right:max(72px,calc(env(safe-area-inset-right) + 72px));top:max(10px,env(safe-area-inset-top));width:48px;height:48px}",
        "#bugReportModal{position:fixed;inset:0;z-index:1000001;display:none;overflow:auto;background:rgba(12,14,12,.97);color:#fff;font-family:Arial,sans-serif}",
        "#bugReportModal.open{display:block}",
        "#bugReportModal *{box-sizing:border-box}",
        ".bugReportShell{width:min(920px,100%);min-height:100%;margin:0 auto;padding:clamp(18px,4vh,42px) clamp(16px,4vw,44px) 34px;display:flex;flex-direction:column}",
        ".bugReportTop{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:18px;border-bottom:2px solid #080808;box-shadow:0 1px #707070}",
        ".bugReportTitle{font-family:MinecraftFont,monospace;font-size:clamp(22px,3vw,31px);text-shadow:2px 2px #222;letter-spacing:.4px}",
        "#bugReportClose{width:42px;height:42px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;background:linear-gradient(#777,#555);color:#fff;font-size:25px;cursor:pointer}",
        ".bugReportIntro{margin:23px 0 20px;color:#c7c7c7;font-size:13px;line-height:1.65}",
        ".bugReportForm{display:flex;flex-direction:column;gap:14px}",
        ".bugReportField{display:flex;flex-direction:column;gap:7px}",
        ".bugReportField label{color:#e7e7e7;font-family:MinecraftFont,monospace;font-size:12px;letter-spacing:.25px}",
        ".bugReportField select,.bugReportField textarea{width:100%;border:2px solid #090909;border-top-color:#888;border-left-color:#888;border-radius:0;background:#242424;color:#fff;padding:12px;font:13px Arial,sans-serif;outline:none}",
        ".bugReportField select{height:44px}",
        ".bugReportField textarea{min-height:145px;resize:vertical;line-height:1.5}",
        ".bugReportField select:focus,.bugReportField textarea:focus{border-color:#89ad5b}",
        ".bugReportHelp{color:#999;font-size:11px;line-height:1.5}",
        ".bugReportCaptureActions{display:flex;flex-wrap:wrap;gap:10px;margin-top:2px}",
        ".bugReportAction{min-height:44px;padding:9px 16px;border:2px solid #111;border-top-color:#aaa;border-left-color:#aaa;border-radius:0;background:linear-gradient(#707070,#515151);color:#fff;font:12px MinecraftFont,monospace;text-shadow:2px 2px #222;cursor:pointer;box-shadow:inset 2px 2px rgba(255,255,255,.12),inset -2px -2px rgba(0,0,0,.3),0 2px #111}",
        ".bugReportAction:hover:not(:disabled){filter:brightness(1.14)}",
        ".bugReportAction:disabled{opacity:.45;cursor:not-allowed}",
        ".bugReportAction.primary{background:linear-gradient(#789a4e,#526e36);border-top-color:#bed49e;border-left-color:#bed49e}",
        ".bugReportAction.record{background:linear-gradient(#8b5555,#643d3d);border-top-color:#d39a9a;border-left-color:#d39a9a}",
        "#bugReportAttachments{display:flex;flex-wrap:wrap;gap:10px;min-height:0}",
        ".bugReportAttachment{display:flex;align-items:center;gap:9px;min-width:0;padding:7px 9px;border:1px solid #555;background:#202020;color:#ddd;font-size:11px}",
        ".bugReportAttachment img,.bugReportAttachment video{width:72px;height:48px;object-fit:cover;background:#080808;border:1px solid #444}",
        ".bugReportAttachment button{border:1px solid #777;background:#383838;color:#fff;padding:5px 7px;font-size:10px;cursor:pointer}",
        ".bugReportFooter{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid #444}",
        "#bugReportStatus{min-height:18px;color:#b6cf91;font-size:12px;line-height:1.4}",
        "#bugReportSubmit{min-width:180px;min-height:46px}",
        "#bugReportCaptureLayer{position:fixed;inset:0;z-index:1000003;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.18);color:#fff;font-family:Arial,sans-serif}",
        ".bugCapturePanel{width:min(440px,calc(100vw - 28px));padding:22px;background:rgba(13,15,13,.94);border:2px solid #080808;border-top-color:#aaa;border-left-color:#aaa;box-shadow:0 12px 45px #000b;text-align:center}",
        ".bugCapturePanel h2{margin:0 0 10px;font-family:MinecraftFont,monospace;font-size:20px;text-shadow:2px 2px #222}",
        ".bugCapturePanel p{margin:0 0 18px;color:#c9c9c9;font-size:13px;line-height:1.55}",
        ".bugCapturePanel .bugReportCaptureActions{justify-content:center}",
        ".bugCaptureRecordStatus{margin:0 0 12px;color:#ffb3b3;font-size:13px;font-weight:700}",
        ".bugReviewLayer{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:18px;background:#050505}",
        ".bugReviewTitle{font-family:MinecraftFont,monospace;font-size:clamp(17px,2.5vw,24px);text-align:center;text-shadow:2px 2px #222}",
        ".bugReviewMedia{display:flex;align-items:center;justify-content:center;width:100%;height:min(72vh,calc(100dvh - 170px));min-height:160px;background:#111;border:1px solid #454545}",
        ".bugReviewMedia img,.bugReviewMedia video{display:block;max-width:100%;max-height:100%;object-fit:contain}",
        ".bugReviewLayer .bugReportCaptureActions{justify-content:center}",
        "body.webminecraft-report-capture{cursor:default!important}",
        "body.webminecraft-report-capture> :not(canvas):not(#bugReportCaptureLayer){visibility:hidden!important;pointer-events:none!important}",
        "body.webminecraft-report-capture>canvas{visibility:visible!important;display:block!important;position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:0!important}",
        "#bugReportCaptureLayer{pointer-events:auto}",
        "@media(max-width:620px){.bugReportShell{padding:16px 13px 24px}.bugReportIntro{margin:16px 0}.bugReportField textarea{min-height:125px}.bugReportFooter{align-items:stretch;flex-direction:column-reverse}#bugReportSubmit{width:100%}.bugReportCaptureActions{display:grid;grid-template-columns:1fr}.bugReportAction{width:100%}.bugReviewMedia{height:calc(100dvh - 190px)}}"
    ].join("\n");
    document.head.appendChild(style);
}

function createUI() {
    if (document.getElementById("bugReportModal")) return;
    reportButton = document.createElement("button");
    reportButton.id = "bugReportButton";
    reportButton.type = "button";
    reportButton.title = "Report a bug";
    reportButton.setAttribute("aria-label", "Report a bug");
    reportButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8 5 5M16 8l3-3M5 12H2M22 12h-3M6 16l-3 3M18 16l3 3M8 7h8l2 4v5a6 6 0 0 1-12 0v-5z"/><path d="M9 11v2M15 11v2M12 15v2"/></svg>';
    document.body.appendChild(reportButton);

    reportModal = document.createElement("section");
    reportModal.id = "bugReportModal";
    reportModal.setAttribute("role", "dialog");
    reportModal.setAttribute("aria-modal", "true");
    reportModal.setAttribute("aria-label", "Report a bug");
    reportModal.innerHTML = '<div class="bugReportShell">' +
        '<header class="bugReportTop"><div class="bugReportTitle">REPORT A BUG</div><button id="bugReportClose" type="button" aria-label="Close report">×</button></header>' +
        '<div class="bugReportIntro">Found something broken? Tell us what happened and attach a screenshot of the game. The screenshot is captured by WebMinecraftT itself, with the game HUD hidden. You can also attach a short in-game recording.</div>' +
        '<form class="bugReportForm" id="bugReportForm">' +
        '<div class="bugReportField"><label for="bugReportCategory">WHAT KIND OF ISSUE?</label><select id="bugReportCategory"><option value="Gameplay">Gameplay</option><option value="World generation">World generation</option><option value="Controls">Controls</option><option value="Multiplayer">Multiplayer</option><option value="Interface">Interface</option><option value="Performance">Performance</option><option value="Other">Other</option></select></div>' +
        '<div class="bugReportField"><label for="bugReportDescription">WHAT HAPPENED?</label><textarea id="bugReportDescription" maxlength="850" required placeholder="Describe what went wrong, what you were doing, and how to reproduce it (if you know)."></textarea><div class="bugReportHelp">Please avoid including passwords or private information. Up to 850 characters.</div></div>' +
        '<div class="bugReportField"><label>CAPTURE THE ISSUE</label><div class="bugReportCaptureActions"><button class="bugReportAction primary" id="bugReportScreenshot" type="button">SCREENSHOT</button><button class="bugReportAction record" id="bugReportRecord" type="button">RECORD GAMEPLAY (OPTIONAL)</button></div><div class="bugReportHelp">Screenshot is required to submit. Recording is optional and captures only the game view, not your desktop or other apps.</div></div>' +
        '<div id="bugReportAttachments" aria-live="polite"></div>' +
        '<div class="bugReportFooter"><div id="bugReportStatus" role="status" aria-live="polite">Attach a screenshot to continue.</div><button class="bugReportAction primary" id="bugReportSubmit" type="submit" disabled>SUBMIT REPORT</button></div>' +
        '</form></div>';
    document.body.appendChild(reportModal);

    captureLayer = document.createElement("div");
    captureLayer.id = "bugReportCaptureLayer";
    captureLayer.setAttribute("aria-live", "polite");
    document.body.appendChild(captureLayer);

    descriptionInput = reportModal.querySelector("#bugReportDescription");
    descriptionInput.addEventListener("input", refreshAttachments);
    categoryInput = reportModal.querySelector("#bugReportCategory");
    submitButton = reportModal.querySelector("#bugReportSubmit");
    reportStatus = reportModal.querySelector("#bugReportStatus");

    reportButton.addEventListener("click", openReport);
    reportModal.querySelector("#bugReportClose").addEventListener("click", closeReport);
    reportModal.querySelector("#bugReportScreenshot").addEventListener("click", startScreenshotCapture);
    reportModal.querySelector("#bugReportRecord").addEventListener("click", startRecordingCapture);
    reportModal.querySelector("#bugReportForm").addEventListener("submit", event => {
        event.preventDefault();
        void submitReport();
    });
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        if (document.body.classList.contains("webminecraft-report-capture")) {
            event.preventDefault();
            cancelCapture();
        } else if (reportModal.classList.contains("open")) {
            closeReport();
        }
    });
    refreshAttachments();
}

function openReport() {
    if (!document.body.classList.contains("webminecraft-in-world")) return;
    document.exitPointerLock?.();
    reportModal.classList.add("open");
    reportModal.style.display = "block";
    reportStatus.textContent = screenshotBlob ? "Screenshot attached. Describe the issue and submit." : "Attach a screenshot to continue.";
    refreshAttachments();
    descriptionInput.focus({ preventScroll: true });
}

function closeReport() {
    if (document.body.classList.contains("webminecraft-report-capture")) {
        cancelCapture();
        return;
    }
    reportModal.classList.remove("open");
    reportModal.style.display = "none";
    if (reportStatus) reportStatus.textContent = screenshotBlob ? "Screenshot attached." : "Attach a screenshot to continue.";
}

function refreshAttachments() {
    const host = reportModal?.querySelector("#bugReportAttachments");
    if (!host) return;
    host.replaceChildren();
    if (screenshotUrl) {
        const item = document.createElement("div");
        item.className = "bugReportAttachment";
        const image = document.createElement("img");
        image.src = screenshotUrl;
        image.alt = "Screenshot attached to report";
        const label = document.createElement("span");
        label.textContent = "Screenshot attached";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Retake";
        remove.addEventListener("click", startScreenshotCapture);
        item.append(image, label, remove);
        host.appendChild(item);
    }
    if (recordingUrl) {
        const item = document.createElement("div");
        item.className = "bugReportAttachment";
        const video = document.createElement("video");
        video.src = recordingUrl;
        video.muted = true;
        video.playsInline = true;
        const label = document.createElement("span");
        label.textContent = "Gameplay clip attached";
        const remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        remove.addEventListener("click", () => {
            recordingBlob = null;
            URL.revokeObjectURL(recordingUrl);
            recordingUrl = "";
            refreshAttachments();
        });
        item.append(video, label, remove);
        host.appendChild(item);
    }
    submitButton.disabled = !screenshotBlob || !descriptionInput.value.trim();
}

function showCapturePrompt(kind) {
    captureLayer.style.display = "flex";
    if (kind === "screenshot") {
        captureLayer.innerHTML = '<div class="bugCapturePanel"><h2>SCREENSHOT MODE</h2><p>The game HUD and menus are hidden. Move your view to the moment you want to show, then take the screenshot. The capture button disappears before the image is made.</p><div class="bugReportCaptureActions"><button class="bugReportAction primary" id="bugCaptureNow" type="button">TAKE SCREENSHOT</button><button class="bugReportAction" id="bugCaptureCancel" type="button">CANCEL</button></div></div>';
        captureLayer.querySelector("#bugCaptureNow").addEventListener("click", captureScreenshot);
    } else {
        captureLayer.innerHTML = '<div class="bugCapturePanel"><h2>RECORDING GAMEPLAY</h2><div class="bugCaptureRecordStatus" id="bugCaptureTimer">00:00 / 00:08</div><p>Only the live WebMinecraftT game view is being recorded. The recording stops automatically after 8 seconds.</p><div class="bugReportCaptureActions"><button class="bugReportAction record" id="bugRecordStop" type="button">STOP RECORDING</button><button class="bugReportAction" id="bugCaptureCancel" type="button">CANCEL</button></div></div>';
        captureLayer.querySelector("#bugRecordStop").addEventListener("click", stopRecordingCapture);
    }
    captureLayer.querySelector("#bugCaptureCancel").addEventListener("click", cancelCapture);
}

function enterCaptureMode(kind) {
    reportModal.classList.remove("open");
    reportModal.style.display = "none";
    document.exitPointerLock?.();
    document.body.classList.add("webminecraft-report-capture");
    showCapturePrompt(kind);
}

function startScreenshotCapture() {
    if (typeof window.__webminecraftCaptureFrame !== "function") {
        reportStatus.textContent = "The game capture system is not ready. Close this report and try again.";
        return;
    }
    enterCaptureMode("screenshot");
}

function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

async function captureScreenshot() {
    const button = captureLayer.querySelector("#bugCaptureNow");
    if (button) button.disabled = true;
    captureLayer.style.display = "none";
    try {
        await nextFrame();
        await nextFrame();
        const blob = await window.__webminecraftCaptureFrame({ maxWidth: 1280, quality: 0.74 });
        if (!(blob instanceof Blob) || !blob.size) throw new Error("The game did not return a screenshot.");
        const optimized = await optimizeScreenshot(blob);
        if (optimized.size > MAX_SCREENSHOT_BYTES) throw new Error("The screenshot is too large to attach. Please try another view.");
        showReview("screenshot", optimized);
    } catch (error) {
        console.warn("In-game screenshot failed:", error);
        cancelCapture();
        reportModal.classList.add("open");
        reportModal.style.display = "block";
        reportStatus.textContent = error.message || "Screenshot failed. Please try again.";
    }
}

async function optimizeScreenshot(blob) {
    if (blob.size <= MAX_SCREENSHOT_BYTES * 0.82) return blob;
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, 1120 / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d", { alpha: false });
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.62));
}

async function startRecordingCapture() {
    const canvas = window.__webminecraftRenderer?.domElement;
    if (!canvas?.captureStream || typeof MediaRecorder === "undefined") {
        reportStatus.textContent = "This browser does not support in-game recording. You can still attach a screenshot.";
        return;
    }
    enterCaptureMode("record");
    recordingCancelled = false;
    try {
        activeStream = canvas.captureStream(24);
        const mimeType = ["video/webm;codecs=vp8", "video/webm", "video/mp4"].find(type => MediaRecorder.isTypeSupported?.(type));
        activeRecorder = mimeType
            ? new MediaRecorder(activeStream, { mimeType, videoBitsPerSecond: 165000 })
            : new MediaRecorder(activeStream, { videoBitsPerSecond: 165000 });
        const chunks = [];
        activeRecorder.addEventListener("dataavailable", event => {
            if (event.data?.size) chunks.push(event.data);
        });
        activeRecorder.addEventListener("stop", () => {
            clearInterval(recordingTimer);
            recordingTimer = null;
            clearTimeout(recordingAutoStopTimer);
            recordingAutoStopTimer = null;
            activeStream?.getTracks?.().forEach(track => track.stop());
            activeStream = null;
            const recorder = activeRecorder;
            activeRecorder = null;
            if (recordingCancelled) {
                document.body.classList.remove("webminecraft-report-capture");
                captureLayer.style.display = "none";
                reportModal.classList.add("open");
                reportModal.style.display = "block";
                reportStatus.textContent = "Recording cancelled.";
                return;
            }
            const type = recorder?.mimeType || "video/webm";
            const blob = new Blob(chunks, { type });
            if (!blob.size || blob.size > MAX_RECORDING_BYTES) {
                document.body.classList.remove("webminecraft-report-capture");
                captureLayer.style.display = "none";
                reportModal.classList.add("open");
                reportModal.style.display = "block";
                reportStatus.textContent = "That clip was too large to attach. Try recording a shorter moment.";
                return;
            }
            showReview("recording", blob);
        }, { once: true });
        activeRecorder.addEventListener("error", () => {
            recordingCancelled = true;
            try { activeRecorder?.stop(); } catch {}
        }, { once: true });
        activeRecorder.start(250);
        recordingStartedAt = Date.now();
        showCapturePrompt("record");
        recordingTimer = window.setInterval(updateRecordingTimer, 200);
        updateRecordingTimer();
        recordingAutoStopTimer = window.setTimeout(() => {
            if (activeRecorder?.state === "recording") stopRecordingCapture();
        }, MAX_RECORDING_MS);
    } catch (error) {
        console.warn("In-game recording could not start:", error);
        activeStream?.getTracks?.().forEach(track => track.stop());
        activeStream = null;
        activeRecorder = null;
        cancelCapture();
        reportModal.classList.add("open");
        reportModal.style.display = "block";
        reportStatus.textContent = "Recording could not start in this browser. You can still use a screenshot.";
    }
}

function updateRecordingTimer() {
    const timer = captureLayer.querySelector("#bugCaptureTimer");
    if (!timer) return;
    const elapsed = Math.min(MAX_RECORDING_MS, Date.now() - recordingStartedAt);
    const seconds = Math.floor(elapsed / 1000);
    timer.textContent = "00:" + String(seconds).padStart(2, "0") + " / 00:08";
}

function stopRecordingCapture() {
    if (!activeRecorder || activeRecorder.state !== "recording") return;
    const button = captureLayer.querySelector("#bugRecordStop");
    if (button) {
        button.disabled = true;
        button.textContent = "FINISHING...";
    }
    clearInterval(recordingTimer);
    recordingTimer = null;
    activeRecorder.stop();
}

function showReview(kind, blob) {
    captureLayer.style.display = "flex";
    const url = URL.createObjectURL(blob);
    const media = kind === "screenshot"
        ? '<img id="bugReviewPreview" alt="Captured game screenshot">'
        : '<video id="bugReviewPreview" controls playsinline></video>';
    captureLayer.innerHTML = '<div class="bugReviewLayer"><div class="bugReviewTitle">' +
        (kind === "screenshot" ? "USE THIS SCREENSHOT IN YOUR REPORT?" : "USE THIS GAMEPLAY CLIP?") +
        '</div><div class="bugReviewMedia">' + media + '</div><div class="bugReportCaptureActions">' +
        '<button class="bugReportAction primary" id="bugReviewUse" type="button">USE IN REPORT</button>' +
        '<button class="bugReportAction" id="bugReviewRetake" type="button">' +
        (kind === "screenshot" ? "TAKE ANOTHER" : "RECORD AGAIN") +
        '</button><button class="bugReportAction" id="bugReviewCancel" type="button">CANCEL</button></div></div>';
    const preview = captureLayer.querySelector("#bugReviewPreview");
    preview.src = url;
    captureLayer.querySelector("#bugReviewUse").addEventListener("click", () => {
        if (kind === "screenshot") {
            screenshotBlob = blob;
            if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
            screenshotUrl = URL.createObjectURL(blob);
        } else {
            recordingBlob = blob;
            if (recordingUrl) URL.revokeObjectURL(recordingUrl);
            recordingUrl = URL.createObjectURL(blob);
        }
        URL.revokeObjectURL(url);
        document.body.classList.remove("webminecraft-report-capture");
        captureLayer.style.display = "none";
        reportModal.classList.add("open");
        reportModal.style.display = "block";
        reportStatus.textContent = screenshotBlob ? "Screenshot attached. You can now submit the report." : "Attach a screenshot to continue.";
        refreshAttachments();
    });
    captureLayer.querySelector("#bugReviewRetake").addEventListener("click", () => {
        URL.revokeObjectURL(url);
        showCapturePrompt(kind);
    });
    captureLayer.querySelector("#bugReviewCancel").addEventListener("click", () => {
        URL.revokeObjectURL(url);
        cancelCapture();
    });
}

function cancelCapture() {
    recordingCancelled = true;
    clearInterval(recordingTimer);
    recordingTimer = null;
    clearTimeout(recordingAutoStopTimer);
    recordingAutoStopTimer = null;
    if (activeRecorder?.state === "recording") {
        try { activeRecorder.stop(); } catch {}
    } else {
        activeStream?.getTracks?.().forEach(track => track.stop());
        activeStream = null;
        activeRecorder = null;
        document.body.classList.remove("webminecraft-report-capture");
        captureLayer.style.display = "none";
        reportModal.classList.add("open");
        reportModal.style.display = "block";
        refreshAttachments();
    }
}

function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error || new Error("Could not read the attachment."));
        reader.readAsDataURL(blob);
    });
}

async function submitReport() {
    const description = descriptionInput.value.trim();
    if (!screenshotBlob) {
        reportStatus.textContent = "Take and accept a screenshot before submitting.";
        return;
    }
    if (!description) {
        reportStatus.textContent = "Describe what happened before submitting.";
        descriptionInput.focus();
        return;
    }
    submitButton.disabled = true;
    submitButton.textContent = "SENDING...";
    reportStatus.textContent = "Sending your report securely...";
    try {
        const firebase = await waitForFirebase();
        if (!firebase) throw new Error("The report service is unavailable. Check your connection and try again.");
        const auth = firebase.auth();
        let user = auth.currentUser;
        if (!user && typeof auth.signInAnonymously === "function") {
            try { user = (await auth.signInAnonymously()).user; } catch {}
        }
        if (!user) throw new Error("Sign in before submitting a bug report.");
        const screenshotData = await blobToDataUrl(screenshotBlob);
        const recordingData = recordingBlob ? await blobToDataUrl(recordingBlob) : null;
        if (screenshotData.length + (recordingData?.length || 0) > MAX_ATTACHMENT_CHARS) {
            throw new Error("The attachments are too large together. Remove the recording or take a smaller screenshot.");
        }
        const localName = localStorage.getItem("webminecraft-account-username")
            || localStorage.getItem("webminecraft-player-name")
            || user.displayName
            || "Player";
        const name = String(localName).trim().slice(0, 40) || "Player";
        const now = Date.now();
        const category = categoryInput.value;
        const text = ("[IN-GAME BUG REPORT] " + category + ": " + description).slice(0, 1000);
        await firebase.firestore().collection("discussions").doc("bugs").collection("messages").add({
            uid: user.uid,
            name,
            text,
            category,
            reportType: "in-game",
            screenshotDataUrl: screenshotData,
            recordingDataUrl: recordingData,
            captureSource: "webminecraft-game-canvas",
            createdAt: new Date(now),
            expiresAt: new Date(now + 2 * 24 * 60 * 60 * 1000)
        });
        reportStatus.textContent = "Report sent. Thank you for helping improve WebMinecraftT!";
        submitButton.textContent = "REPORT SENT";
        descriptionInput.value = "";
        categoryInput.value = "Gameplay";
        screenshotBlob = null;
        recordingBlob = null;
        if (screenshotUrl) URL.revokeObjectURL(screenshotUrl);
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        screenshotUrl = "";
        recordingUrl = "";
        refreshAttachments();
        submitButton.disabled = true;
        window.setTimeout(closeReport, 1800);
    } catch (error) {
        console.warn("Bug report submission failed:", error);
        reportStatus.textContent = error.message || "Report could not be sent. Please try again.";
        submitButton.textContent = "RETRY SUBMIT";
        submitButton.disabled = !screenshotBlob || !descriptionInput.value.trim();
    }
}

function init() {
    if (window.__webMinecraftBugReportReady || !document.body) return;
    if (typeof window.__webminecraftCaptureFrame !== "function") return;
    window.__webMinecraftBugReportReady = true;
    installStyles();
    createUI();
}

window.addEventListener("webminecraft:runtime-ready", init, { once: true });
