export * from "./worldsV2.js";

// Prevent the News button from ever entering the old menu-flow position.
// Its final fixed coordinates are applied before insertBefore() adds it to the DOM.
(function patchNewsButtonInsertion(){
    if (window.__webminecraftNewsInsertionPatched) return;
    window.__webminecraftNewsInsertionPatched = true;
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(newNode, referenceNode){
        if (newNode && newNode.id === "newsButton") {
            const mobile = window.innerWidth <= 560;
            newNode.style.position = "fixed";
            newNode.style.left = mobile ? "12px" : "28px";
            newNode.style.bottom = mobile ? "18px" : "28px";
            newNode.style.width = mobile ? "calc(50vw - 18px)" : "118px";
            newNode.style.margin = "0";
            newNode.style.zIndex = "97";
        }
        return originalInsertBefore.call(this, newNode, referenceNode);
    };
})();
