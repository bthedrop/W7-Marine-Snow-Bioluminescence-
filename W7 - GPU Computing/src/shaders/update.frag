precision mediump float;

uniform sampler2D uTexPositions;
uniform float uTime;

varying vec2 vUv;

void main()
{
    vec4 modelPos=texture2D(uTexPositions,vUv);
    // modelPos.x+=sin(uTime)*vUv.x;
    // modelPos.y+=cos(uTime)*vUv.y;
    
    gl_FragColor=modelPos;
    //gl_FragColor = vec4(vUv, 0.0, 1.0);
}