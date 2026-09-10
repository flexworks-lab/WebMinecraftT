import { defineConfig } from "vite";

const worldTerrainPlugin = {
    name: "webminecraft-terrain-fixes",
    transform(code, id) {
        if (!id.endsWith("/src/world.js")) return null;

        // Less sand underwater: more dirt/stone and much less random sand.
        code = code.replace(
            "if (surfaceRoll < 0.94) return BLOCK.SAND;",
            "if (surfaceRoll < 0.84) return BLOCK.SAND;"
        );
        code = code.replace(
            "if (blockRoll < 0.88) return BLOCK.SAND;",
            "if (blockRoll < 0.78) return BLOCK.SAND;"
        );
        code = code.replace(
            "if (blockRoll < 0.67) return BLOCK.SAND;",
            "if (blockRoll < 0.57) return BLOCK.SAND;"
        );

        // Make deserts mostly stone/sandstone with only a thin sand surface.
        code = code.replace(
            'if (y >= surfaceY - 4) return BLOCK.SAND;\n        if (y >= surfaceY - 7) return BLOCK.SANDSTONE;',
            'if (y >= surfaceY - 1) return BLOCK.SAND;\n        if (y >= surfaceY - 5) return BLOCK.SANDSTONE;'
        );

        // Keep every water block on the exact same plane so adjacent blocks
        // cannot form cracks or see-through gaps at their edges.
        code = code.replace(
            /const waveA = Math\.sin\(\(x \+ z\) \* 0\.19\) \* 0\.042;\n\s*const waveB = Math\.sin\(\(x \* 0\.31 - z \* 0\.17\) \+ 1\.7\) \* 0\.025;\n\s*const waveC = Math\.cos\(\(x \* 0\.13 \+ z \* 0\.27\) - 0\.6\) \* 0\.02;/,
            'const waveA = 0;\n            const waveB = 0;\n            const waveC = 0;'
        );
        code = code.replace("x - 0.5, y + waveA + waveC, z - 0.5", "x - 0.5, y, z - 0.5");
        code = code.replace("x - 0.5, y + waveB, z + 0.5", "x - 0.5, y, z + 0.5");
        code = code.replace("x + 0.5, y - waveA + waveC * 0.5, z + 0.5", "x + 0.5, y, z + 0.5");
        code = code.replace("x + 0.5, y - waveB, z - 0.5", "x + 0.5, y, z - 0.5");

        return { code, map: null };
    }
};

export default defineConfig({
    base: "/WebMinecraftT/",
    plugins: [worldTerrainPlugin]
});
