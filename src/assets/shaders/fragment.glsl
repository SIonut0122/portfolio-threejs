
uniform float time;
uniform sampler2D landscape;
varying vec2 vUv;
uniform vec4 resolution;
varying vec3 vNormal;
float PI = 3.141592653589793238;
void main() {
vec2 uv = gl_FragCoord/vec2(1000.);
vec3 x = dFdx(vNormal);
vec3 y = dFdy(vNormal);
vec3 normal=normalize(cross(x,y)); 

  float diffuse = dot(normal, vec3(1.));
  vec4 t = texture2D(landscape,uv);

  gl_fragColor = t;
  gl_fragColor = vec4(diffuse);
}