uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec2 uv;

uniform sampler2D uTexPositions;

varying vec2 vUv;

// Simple 2D pseudo-random number generator
float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main()
{
    vec4 modelPos=texture2D(uTexPositions,uv);
    modelPos.w=1.;
    
    // Base size of 20px, up to 60px depending on random factor
    gl_PointSize=20.+random(uv)*40.;
    gl_Position=projectionMatrix*viewMatrix*modelMatrix*modelPos;
    
    vUv=uv;
}