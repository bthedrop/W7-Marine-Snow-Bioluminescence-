# W7-Marine-Snow-Bioluminescence

This project is an interactive, GPU-accelerated web simulation built with **Three.js** and **WebGL Shaders** that replicates the experience of navigating a submersible through the deep ocean's "Midnight Zone."

At its core, the project leverages General-Purpose computing on Graphics Processing Units (GPGPU) using Data Textures and Framebuffer Objects (FBO) to efficiently simulate thousands of pieces of "marine snow." To maximize performance, the particles are rendered as Point Sprites rather than 3D meshes. A custom fragment shader uses 2D rotation matrices and boundary clipping (`discard`) to procedurally shape each flat sprite into randomly sized, uniquely rotated rectangles, giving the snow a natural, organic variety.

**Interactive Features:**

- **Bioluminescent Flash:** Clicking the screen triggers an instantaneous, blinding white "Submersible Flash." This illuminates the marine snow, causing each particle to dynamically react with a bright, neon-blue bioluminescent glow.
- **Procedural Decay:** Rather than flashing uniformly, every particle uses its own UV coordinates as a seed for a pseudo-random number generator, creating a desynchronized flicker effect. The frequency of the sine-wave flickering slows down non-linearly over time while the brightness simultaneously decays exponentially back into total pitch black geometry
