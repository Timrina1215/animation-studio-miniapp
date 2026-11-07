# Attribution and experimental status

Vendored JavaScript modules under neural/ originate from VocoLoco:
https://github.com/Magkino/vocoloco_tts
Licensed under Apache License 2.0 (see LICENSE). Original upstream authors retain copyright.

OmniVoice model weights are **not** stored in this repository. The upstream model is subject to CC BY-NC restrictions; use must be noncommercial and comply with all upstream terms.

This branch includes a real worker-based synthesis integration, not a mock generator. It is **untested on the target iPhone** and cannot be claimed working. Hugging Face downloads previously failed on that device; this can still prevent initialization. No production deployment was performed. Generated WAV is stored locally in IndexedDB, not uploaded to a server.

The voice character 'texture' and 'pitch' presets are not yet connected to neural timbre generation. Playback speed is implemented. Voice quality must be verified empirically.
