# Multiplayer

Room management, multiplayer clients, networking, events, and player synchronization.

> Organization note: files should only be moved here after their imports, asset paths, build configuration, and deployment references have been updated and tested.


## Player-hosted multiplayer (P2P beta)

The P2P beta uses WebRTC DataChannels for game traffic. Firestore is used only for public
room discovery, player presence, and exchanging WebRTC offer/answer/ICE messages.

### One-time Firebase setup

1. In Firebase Console → Authentication → Sign-in method, enable **Anonymous**.
2. Publish the updated repository `firestore.rules` in Firebase Console → Firestore
   Database → Rules. This rules change is committed to GitHub but is not automatically
   published to Firebase.
3. Reload WebMinecraft and open Multiplayer → Player-hosted worlds.

### Beta limits

- Public rooms only; private/friends-only P2P rooms are not enabled in this first test.
- Maximum six players per room.
- Direct WebRTC uses public STUN servers. Networks that require TURN relay may not connect.
- A browser must remain open for a room to stay available.
- The first joining player is selected as backup host. When the owner leaves, the backup
  takes over and other players reconnect. A crash can cause a pause during heartbeat detection.
- The backup stores the block-change log locally; only changes it has received can be recovered.
- The existing dedicated-server room list remains available as a fallback.
