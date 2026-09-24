// Compatibility entry point for the active Minecraft-style water solver.
// The implementation lives in waterPhysicsMinecraft.js so older imports keep working.
export {
    setupWaterPhysics,
    updateWaterPhysics,
    notifyWaterBlockChanged
} from "./waterPhysicsMinecraft.js";
