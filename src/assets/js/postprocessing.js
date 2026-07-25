let PostProcessingMod = {

    uniforms: {

        "tDiffuse": { value: null },
        "howmuchrgbshifticanhaz": { value: 0.0 },
        "resolution": { value: null },
        "pixelSize": { value: 1. },
        "time": { value: 0 },
    },

    vertexShader: [
        "varying highp vec2 vUv;",

        "void main() {",
        "vUv = uv;",
        "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);",
        "}"
    ].join( "\n" ),

    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float pixelSize;
        uniform vec2 resolution;
        uniform float time;
        uniform float howmuchrgbshifticanhaz;
        varying highp vec2 vUv;
        
        float hash(vec2 p) { 
            return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); 
        }

        void main() {
            vec4 t = texture2D(tDiffuse, vUv);
            vec3 color = t.rgb;
            float val = hash(vUv + time) * 0.1;
            float grain = hash(vUv * resolution.xy + time * 0.5) * 0.03;
            vec3 finalColor = color + vec3(val + grain);
            vec2 uvCentered = vUv - 0.5;
            float vignette = 1.0 - dot(uvCentered, uvCentered) * 0.3;
            finalColor *= vignette;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
        
        `
}

export default PostProcessingMod;