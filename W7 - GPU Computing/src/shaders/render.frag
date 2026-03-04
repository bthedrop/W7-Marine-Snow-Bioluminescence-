precision mediump float;

uniform float uTime;
uniform float uLastClickTime;

varying vec2 vUv;

// Simple 2D pseudo-random number generator
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

// 2D Rotation Matrix
mat2 rotate2d(float _angle){
    return mat2(cos(_angle),-sin(_angle),
    sin(_angle),cos(_angle));
}

void main()
{
    // ====== GEOMETRY MANIPULATION ======
    // Random angle (0 to 6.28 radians) based on particle UV
    float angle=random(vUv*1.5)*6.28;
    
    // Shift gl_PointCoord to center (-0.5 to 0.5), rotate it, shift back
    vec2 pt=gl_PointCoord-vec2(.5);
    pt=rotate2d(angle)*pt;
    pt+=vec2(.5);
    
    // Generate random width and height for this specific particle
    // E.g. width between 0.2-1.0, height between 0.1-0.4
    float w=.2+random(vUv*2.1)*.8;
    float h=.1+random(vUv*3.4)*.3;
    
    // Discard pixel if it's outside our designated random rectangle dimensions
    // Since pt is rotated, this mathematically draws a rotated rectangle!
    if(abs(pt.x-.5)>(w/2.)||abs(pt.y-.5)>(h/2.)){
        discard;
    }
    
    // ====== COLOR MANIPULATION ======
    // How long since the user clicked
    float timeSinceClick=max(0.,uTime-uLastClickTime);
    
    // Each particle gets a slightly different random offset based on its UV
    float randOffset=random(vUv)*6.28;
    
    // FLICKER EFFECT:
    // Frequency decays non-linearly over time: pow(timeSinceClick, 0.8)
    // We add the random offset so they don't all blink in unison
    float flicker=sin(15.*pow(timeSinceClick,.8)+randOffset);
    
    // Smooth it out: remap from [-1, 1] to [0, 1]
    flicker=flicker*.5+.5;
    
    // OVERALL FADE OUT:
    // Fades out using exponential decay e.g. e^(-x * speed)
    float fade=exp(-timeSinceClick*.4);
    
    // BASE COLOR: Bioluminescent Neon Blue
    vec3 baseColor=vec3(.1,.6,1.);
    
    // Mix the color with pure white during the initial click explosion (<0.2)
    float flashMix=clamp(1.-(timeSinceClick/.2),0.,1.);
    vec3 mixedColor=mix(baseColor,vec3(1.),flashMix);
    
    // Combine the base color with the flicker and the fade out
    vec3 finalColor=mixedColor*flicker*fade;
    
    // Prevent the particles from showing at all if enough time has passed
    // (Optimization/Visual cleanup to reach pure black)
    float alpha=smoothstep(6.,4.,timeSinceClick);
    
    gl_FragColor=vec4(finalColor,alpha);
}