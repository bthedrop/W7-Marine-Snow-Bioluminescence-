# Depth Counter and Interaction Constraints

## Goal Description
1. Prevent the bioluminescent flash from triggering during a camera pan/drag specifically when holding `Cmd` + `Click`.
2. Introduce a visual "Depth Counter" in the bottom right corner (0 - 1000 ft).
3. The camera starts at 0 depth and navigates downwards. The bioluminescence (and flash) should ONLY be capable of triggering when the camera's depth is between 600 and 800 feet.

## Proposed Changes

### HTML/CSS
#### [MODIFY] [index.html](file:///Users/2b/Library/CloudStorage/GoogleDrive-brian.rio11@gmail.com/My%20Drive/%F0%9F%94%B5/01%20Grad%20School/02%20SP26/03%20It%27s%20Shader%20Time/W8%20-%20GPU%20Computing/index.html)
- Add a `<div id="depth-counter">Depth: 0 ft</div>` overlay inside the `<body>` above the canvas.

#### [MODIFY] [src/styles.css](file:///Users/2b/Library/CloudStorage/GoogleDrive-brian.rio11@gmail.com/My%20Drive/%F0%9F%94%B5/01%20Grad%20School/02%20SP26/03%20It%27s%20Shader%20Time/W8%20-%20GPU%20Computing/src/styles.css)
- Add styles for `#depth-counter` to position it `absolute` at the bottom right (`bottom: 20px; right: 20px;`). Use a clean, monospace, monospace neon-styled font to fit the submarine aesthetic.

### Javascript
#### [MODIFY] [index.js](file:///Users/2b/Library/CloudStorage/GoogleDrive-brian.rio11@gmail.com/My%20Drive/%F0%9F%94%B5/01%20Grad%20School/02%20SP26/03%20It%27s%20Shader%20Time/W8%20-%20GPU%20Computing/src/index.js)
- **Depth Calculation**: In the `tick()` animation loop, calculate depth: `let depth = Math.max(0, -camera.position.y * 50);`. Update `document.getElementById("depth-counter").innerText = \`Depth: ${Math.floor(depth)} ft\`;`.
- **Pass Depth to Shader**: Add `uDepth` into `pointsMat.uniforms` and update it on every `tick` with the calculated depth value.
- **Interaction Constraint**: Update the `mousedown` event listener to simply ignore the click if `event.metaKey || event.ctrlKey` is true (blocking Cmd+Click). No depth check here, meaning the white screen flash will happen anywhere!

#### [MODIFY] [src/shaders/render.frag](file:///Users/2b/Library/CloudStorage/GoogleDrive-brian.rio11@gmail.com/My%20Drive/%F0%9F%94%B5/01%20Grad%20School/02%20SP26/03%20It%27s%20Shader%20Time/W8%20-%20GPU%20Computing/src/shaders/render.frag)
- **Depth restriction**: Add `uniform float uDepth;`. Use an `alphaModifier` that checks the bounds of `uDepth` (e.g. `smoothstep(550.0, 600.0, uDepth) * (1.0 - smoothstep(800.0, 850.0, uDepth))`). Multiply the final pixel alpha by this modifier. If the depth is < 600 or > 800, the particles will render completely invisible (alpha 0.0), even though the screen background still flashes white behind them.

## Verification
- Load `http://localhost:8000`.
- Verify the depth counter appears in the bottom right corner at `0 ft`.
- Click the screen at 0 depth. Verify the screen flashes white, but **no blue particles** appear.
- Hold Right-Click (or Shift+Left Click) to Pan the OrbitControls downward past 600 ft.
- Click the screen. Verify the screen flashes white AND the blue bioluminescent particles now appear.
- Hold `Cmd` and click. Verify that absolutely nothing happens.
