# Game_base

This folder contains the organized WebMinecraftT game source. Keep gameplay code and game-owned assets inside these feature folders; leave repository/build entry points at the repository root because Vite, GitHub Pages, npm, and Electron expect them there.

## Folder map

- `core/` — application startup, shared runtime utilities, loading, performance.
- `world/` — terrain and block generation, chunks, water, physics, world saves.
- `player/` — player movement, controls, interaction, character model/editor.
- `multiplayer/` — rooms/server communication, player sync, chat and shared state.
- `inventory/` — inventory, hotbar, crafting, survival/mining systems and rules.
- `ui/` — menus, HUD, settings and other interface modules.
- `accounts/` — authentication, profiles, friends and account synchronization.
- `admin/` — developer controls, moderation and administration.
- `assets/` — game-owned assets and model/font/logo modules.
- `server/` — multiplayer server entry points and server-side systems.

## Build and runtime notes

- Keep ES module imports relative to the file that imports them; update import paths whenever source files move.
- The root `index.html`, `package.json`, `package-lock.json`, `vite.config.js`, Electron configuration, and deployment workflows remain at the repository root because they are project entry/configuration files, not gameplay modules.
- The root `public/` directory is Vite's static-asset source. Its files are served from the site root (for example, `/textures/...`) and copied into the production build. Do not move it unless `vite.config.js`, asset URL assumptions, and deployment verification are updated together.
- Run `npm run build` after structural changes before considering the reorganization complete.
