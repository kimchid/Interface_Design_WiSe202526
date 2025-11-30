## Purpose

This repository is a small static frontend interactive prototype called "Zwischen den Zeilen". The app is a single-page static site (HTML/CSS/JS) that layers a rub-off canvas over solution images and stores user text answers in `localStorage`.

## Big picture

- **Single-page frontend:** `index.html` contains five scene screens (`scene-1`..`scene-5`) and a `reflection-screen`.
- **Scratch mechanic:** `script.js` implements the rub-off behavior via HTML `<canvas>` elements with IDs `scratch-1`..`scratch-5`. The canvas is drawn with a scene image and user interaction sets `globalCompositeOperation = 'destination-out'` to reveal the underlying image.
- **Data flow:** user text entries are saved to `localStorage` under the key `zwischenDenZeilenAnswers` as a JSON object keyed by scene id (e.g., `{"scene-1":"..."}`).

## Key files to reference

- `index.html` — layout and the canonical DOM IDs and class names used by the JS (e.g., `scratch-N`, `solution-text-N`, `input-N`, `submit-N`, `scene-N`).
- `script.js` — core logic: `setupScratchScene(sceneNumber)`, `showScreen(screenId)`, `saveAnswer(sceneId, answer)`, and the reveal threshold logic.
- `style.css` — visual layout and responsive rules; note `.screen` uses opacity and transforms (not `display:none`) so canvases are present in the DOM.
- `images/` — contains starting images referenced by `script.js` (`images/ausgangsbild_*.jpg`) and some solution images referenced in `index.html`.

## Project-specific conventions & patterns

- Scene naming: every scene follows the pattern `scene-N` where N is 1..5. Related elements use the same numeric suffix: `scratch-N`, `solution-text-N`, `input-N`, `submit-N`.
- Canvas sizing: the script sets `canvas.width = canvas.offsetWidth` and `canvas.height = canvas.offsetHeight` in `initCanvas()`; keep CSS layout for `.scratch-canvas` in sync so `offsetWidth`/`offsetHeight` are meaningful.
- Reveal logic: `revealIfEnoughRemoved()` samples a 20x20 area in the canvas center and treats alpha < 50 as 'removed'. The threshold is `ratio > 0.3` (30%). If changing this behavior, update both sampling size and threshold together.
- Reset architecture: `setupScratchScene` returns a `{ resetCanvas }` object; all reset functions are stored in `sceneResetFunctions` and called by the `#restart-btn` click handler.
- localStorage shape: stored under `zwischenDenZeilenAnswers` as an object with keys `scene-1`..`scene-5`. Code expects string answers and uses `.trim()` when checking emptiness.

## Important gotchas and guidance for an AI agent

- Image path inconsistencies: `index.html` uses a mix of `images/solution_1.jpg` and `solution_2.jpg` (missing the `images/` prefix for some scenes). Verify and normalize image paths before editing or adding images.
- `backgroundImage.crossOrigin = 'anonymous'` is set; when testing locally prefer serving the site over HTTP (see Run/debug below). Loading images via `file://` can cause CORS or tainting issues that break canvas operations and `getImageData` checks.
- Because screens are stacked (absolute positioning + opacity) canvases exist even when not active. When changing visibility or switching to `display:none` you must call `initCanvas()` after the element is visible so `offsetWidth/height` are computed correctly.
- The script uses `console.log` extensively for navigation and state — follow those messages when debugging flows like auto-advance after reveal, or why a submit button remains disabled.

## How to run / debug locally

No build step or dependencies are present. Recommended local dev server to avoid CORS issues:

Windows PowerShell example (from repo root):

```powershell
python -m http.server 8000
```

Or, if Node is available:

```powershell
npx http-server -p 8000
```

Open `http://localhost:8000` in your browser. Use DevTools console to watch `console.log` traces from `script.js`.

## Common edits and examples

- Add a new scene: duplicate the `scene` block in `index.html`, follow naming `scene-6`, `scratch-6`, `solution-text-6`, `input-6`, `submit-6`; then in `script.js` add the start image mapping and call `setupScratchScene(6)` (increment the loop limit if needed).
- Change reveal threshold: in `script.js` edit `revealIfEnoughRemoved()` — update the `testCanvas` size and the `ratio > 0.3` threshold consistently.
- Fix image paths: prefer `images/<filename>` for all assets; keep filenames and references consistent between `index.html` and `script.js` `startImages` mapping.

## External integrations

- No backend or external APIs are used. The app stores results purely in browser `localStorage`.

## Tests and CI

- There are no automated tests or CI configurations in the repo. When adding tests, prefer small DOM-level unit tests that mock `localStorage` and simulate canvas interactions where possible.

---

If anything here is unclear or you'd like example edits (e.g., normalizing image paths, adding scene 6, or changing the reveal logic), tell me which change and I will apply it and run a quick verification.
