# Animation Studio 🎬

Standalone 2D animation editor for browsers and Telegram Mini Apps. No Render, Python or backend required.

## Features
- Auto mode: one script line per scene, keyword-based action selection
- Director mode: choose background, action, clothing color and scene duration
- Animated canvas preview and local project saving
- Mobile responsive interface

## Cloudflare Pages deployment
Connect this GitHub repository in Cloudflare **Workers & Pages → Create → Pages → Connect to Git**. Select `main`, use **no framework**, leave build command empty, and set output directory to `/` (repository root). Deploy. `index.html` is at the root.

## Telegram
After deployment, connect the resulting HTTPS URL through @BotFather's Mini App settings. For production Telegram authentication, verify `initData` on a trusted backend before granting access to private data. This prototype stores projects locally and does not authenticate users.

## Limitations
This version is a procedural 2D prototype, not AI-generated video. It does not yet export MP4 or generate speech.
