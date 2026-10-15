/**
 * Hand-written GLSL for the VOW. sculpture.
 * No HDR environment maps: reflections come from a procedural "couture studio"
 * (softboxes + strip light + horizon glow) so the scene ships in a few KB and
 * stays fast on iPhone GPUs.
 */

// Ashima Arts / Ian McEwan 3D simplex noise (MIT).
export const simplexNoise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

export const sculptureVertex = /* glsl */ `
uniform float uTime;
uniform float uDistort;
uniform float uFreq;
uniform float uOpen;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vNoise;
${simplexNoise}

float field(vec3 p){
  float t = uTime * 0.11;
  float n = snoise(p * uFreq + vec3(t, t * 0.8, -t * 0.6));
  n += 0.12 * snoise(p * uFreq * 2.1 - vec3(t * 1.3));
  return n;
}
vec3 displace(vec3 p){
  float amp = uDistort * (1.0 + uOpen * 1.4);
  return p + normalize(p) * field(p) * amp;
}

void main(){
  vec3 p = position;
  vec3 n = normalize(normal);
  vec3 up = abs(n.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 t = normalize(cross(n, up));
  vec3 b = normalize(cross(n, t));
  float e = 0.012;
  vec3 p0 = displace(p);
  vec3 p1 = displace(p + t * e);
  vec3 p2 = displace(p + b * e);
  vec3 dn = normalize(cross(p1 - p0, p2 - p0));
  if (dot(dn, n) < 0.0) dn = -dn;

  vNoise = field(p);
  vec4 world = modelMatrix * vec4(p0, 1.0);
  vPosW = world.xyz;
  vNormalW = normalize(mat3(modelMatrix) * dn);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

/** Procedural studio + thin-film iridescence. Output is display-referred (toneMapped=false). */
export const sculptureFragment = /* glsl */ `
uniform float uTime;
uniform float uOpen;
uniform float uIrid;
uniform float uMetal;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vNoise;

const vec3 PEARL  = vec3(0.929, 0.914, 0.894);
const vec3 IRIS   = vec3(0.769, 0.710, 0.992);
const vec3 CHROME = vec3(0.725, 0.784, 0.827);
const vec3 DEEP   = vec3(0.020, 0.020, 0.040);

vec3 studio(vec3 r){
  // key softbox, upper-left front
  vec2 k = vec2(r.x + 0.45, r.y - 0.42);
  float key = exp(-(k.x * k.x * 7.0 + k.y * k.y * 10.0)) * step(-0.2, r.z);
  // vertical strip light, right
  float strip = smoothstep(0.075, 0.0, abs(r.x - 0.72)) * smoothstep(-0.7, 0.3, r.y);
  // overhead ring
  float top = smoothstep(0.82, 0.98, r.y);
  // horizon glow
  float hor = exp(-abs(r.y + 0.05) * 7.0) * 0.32;
  // back fill
  float back = smoothstep(0.2, 1.0, -r.z) * 0.12;
  // ambient studio wash so the body never sinks into the background
  float amb = 0.05 + 0.09 * smoothstep(-1.0, 1.0, r.y);
  return PEARL * key * 2.1 + IRIS * strip * 1.5 + PEARL * top * 1.0 + CHROME * hor * 1.4 + IRIS * back + CHROME * amb;
}

void main(){
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  vec3 R = reflect(-V, N);

  float F = 0.06 + 0.94 * pow(1.0 - ndv, 2.4);

  // thin-film interference approximation
  float film = ndv * 1.7 + vNoise * 0.32 + uTime * 0.025;
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (film + vec3(0.0, 0.17, 0.41)));
  irid = mix(irid, IRIS, 0.32);

  vec3 env = studio(R);

  // glass: refracted look-through, cooler and dimmer than reflection
  vec3 T = refract(-V, N, 1.0 / 1.45);
  vec3 through = studio(T) * 0.38 * mix(IRIS, CHROME, 0.4) + DEEP;

  vec3 glass = mix(through, env * mix(vec3(1.0), irid, 0.65), F)
             + irid * pow(1.0 - ndv, 1.6) * 0.7;
  vec3 chrome = env * mix(CHROME, PEARL, 0.5) * (1.0 + 0.8 * F) + CHROME * 0.12 + irid * F * 0.2;

  vec3 col = mix(glass, chrome, uMetal);
  col = mix(col, col * mix(vec3(1.0), irid, 0.6), uIrid * 0.4);

  // opening flash: light pours through the sculpture
  col += (PEARL * 0.6 + IRIS * 0.6) * uOpen * (0.25 + F);

  // soft filmic shoulder
  col = col / (1.0 + col * 0.55);
  gl_FragColor = vec4(col, 1.0);
}
`

export const particlesVertex = /* glsl */ `
attribute float aSeed;
attribute float aSize;
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpen;
varying float vAlpha;
varying float vSeed;
void main(){
  vec3 p = position;
  float t = uTime * 0.07 + aSeed * 6.2831;
  p.x += sin(t + p.y * 0.6) * 0.22;
  p.y += cos(t * 0.8 + p.x * 0.5) * 0.28;
  p.z += sin(t * 0.6 + aSeed * 3.0) * 0.18;
  p *= 1.0 + uOpen * 0.55;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z) * (1.0 + uOpen * 0.8);
  gl_Position = projectionMatrix * mv;
  vAlpha = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 1.1 + aSeed * 41.0));
  vSeed = aSeed;
}
`

export const particlesFragment = /* glsl */ `
varying float vAlpha;
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d);
  a *= a;
  vec3 c = mix(vec3(0.93, 0.91, 0.89), vec3(0.77, 0.71, 0.99), step(0.62, vSeed));
  gl_FragColor = vec4(c, a * vAlpha * 0.85);
}
`
