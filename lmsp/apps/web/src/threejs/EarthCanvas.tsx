import React, { useEffect, useRef } from "react";
import * as THREE from "three";

import dayMapImg from "./textures/earth-daymap-4k.jpg";
import nightMapImg from "./textures/earth-nightmap-4k.jpg";
import cloudsMapImg from "./textures/earth-clouds-4k.jpg";
import bumpMapImg from "./textures/earth-bump-4k.jpg";
import specularMapImg from "./textures/earth-specular-4k.jpg";
import starCircleImg from "./textures/stars/circle.png";

// ============================================================================
// 1. Photorealistic Earth Surface Shader
// Features:
// - High-res day texture with Rayleigh atmospheric haze
// - Topographic bump mapping for mountain relief
// - Realistic ocean specular glint (water reflections)
// - Warm twilight / sunset terminator (orange/golden sunrise band)
// - Crisp NASA Black Marble city lights only on night side
// - Cloud shadow casting onto the earth surface for true 3D depth
// ============================================================================
function createEarthSurfaceMaterial(
  sunDirection: THREE.Vector3,
  textures: {
    dayMap: THREE.Texture;
    nightMap: THREE.Texture;
    cloudsMap: THREE.Texture;
    specularMap: THREE.Texture;
    bumpMap: THREE.Texture;
  }
) {
  const uniforms = {
    dayTexture: { value: textures.dayMap },
    nightTexture: { value: textures.nightMap },
    cloudsTexture: { value: textures.cloudsMap },
    specularTexture: { value: textures.specularMap },
    bumpTexture: { value: textures.bumpMap },
    sunDirection: { value: sunDirection },
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform sampler2D cloudsTexture;
    uniform sampler2D specularTexture;
    uniform sampler2D bumpTexture;
    uniform vec3 sunDirection;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 sunDir = normalize(sunDirection);

      // 1. Surface Bump Perturbation (topography elevation relief)
      vec2 bumpOffset = vec2(0.0008, 0.0);
      float hCenter = texture2D(bumpTexture, vUv).r;
      float hRight  = texture2D(bumpTexture, vUv + bumpOffset.xy).r;
      float hUp     = texture2D(bumpTexture, vUv + bumpOffset.yx).r;
      vec3 perturbedNormal = normalize(normal + vec3((hCenter - hRight) * 0.35, (hCenter - hUp) * 0.35, 0.0));

      // 2. Solar orientation
      float NdotL = dot(perturbedNormal, sunDir);
      float geomNdotL = dot(normal, sunDir);

      // Smooth day / night transition
      float dayMix = smoothstep(-0.12, 0.22, NdotL);

      // 3. Sample Textures
      vec3 dayColor = texture2D(dayTexture, vUv).rgb;
      vec3 nightColor = texture2D(nightTexture, vUv).rgb;
      float oceanMask = texture2D(specularTexture, vUv).r; // 1.0 = ocean, 0.0 = land

      // Dynamic cloud offset for cloud shadow simulation
      vec2 cloudUv = vUv + vec2(uTime * 0.0003, 0.0);
      vec2 shadowOffset = -sunDir.xy * 0.0045;
      float cloudShadow = texture2D(cloudsTexture, cloudUv + shadowOffset).r;
      
      // Cloud shadow darkens ground under daytime sun
      float shadowFactor = 1.0 - (cloudShadow * 0.65 * max(0.0, geomNdotL));
      dayColor *= shadowFactor;

      // 4. Ocean Specular Sun Reflection (Glint)
      vec3 halfVector = normalize(sunDir + viewDir);
      float NdotH = max(0.0, dot(perturbedNormal, halfVector));
      float specular = pow(NdotH, 64.0) * oceanMask * smoothstep(0.0, 0.3, NdotL);
      vec3 sunGlint = vec3(1.0, 0.95, 0.88) * specular * 1.8;

      // 5. Twilight / Sunset color band at terminator (Rayleigh dispersion)
      float twilightFactor = smoothstep(-0.18, 0.02, NdotL) * (1.0 - smoothstep(0.02, 0.24, NdotL));
      vec3 sunsetColor = vec3(1.0, 0.42, 0.12) * twilightFactor * 0.55;

      // 6. City Night Lights (Warm golden glow, only visible on the dark side)
      float nightLightMask = smoothstep(0.12, -0.15, NdotL);
      vec3 warmCityLights = nightColor * vec3(1.35, 1.15, 0.82) * 2.2 * nightLightMask;

      // 7. Base Surface composite
      vec3 surfaceColor = mix(warmCityLights, dayColor + sunsetColor, dayMix);
      surfaceColor += sunGlint;

      // 8. Realistic Atmospheric Haze over Earth surface (soft blue limb scattering)
      float fresnel = 1.0 - max(0.0, dot(viewDir, normal));
      float surfaceAtmosphere = pow(fresnel, 3.8) * max(0.0, geomNdotL + 0.15);
      vec3 atmosphereBlue = vec3(0.28, 0.62, 1.0) * surfaceAtmosphere * 0.9;
      surfaceColor += atmosphereBlue;

      gl_FragColor = vec4(surfaceColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
  });
}

// ============================================================================
// 2. Photorealistic 3D Cloud Layer Shader
// Features:
// - Subtle independent rotational drift
// - Backlit sun scattering (forward scattering glow)
// - Twilight golden sunset rim on cloud tops
// - Gentle self-shadowing and dark silhouettes over night-side
// ============================================================================
function createCloudsMaterial(
  sunDirection: THREE.Vector3,
  cloudsMap: THREE.Texture
) {
  const uniforms = {
    cloudsTexture: { value: cloudsMap },
    sunDirection: { value: sunDirection },
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform sampler2D cloudsTexture;
    uniform vec3 sunDirection;
    uniform float uTime;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 sunDir = normalize(sunDirection);

      // Drift clouds slowly
      vec2 cloudUv = vUv + vec2(uTime * 0.0003, 0.0);
      float cloudCoverage = texture2D(cloudsTexture, cloudUv).r;

      if (cloudCoverage < 0.03) {
        discard;
      }

      float NdotL = dot(normal, sunDir);

      // Cloud day lighting
      float dayFactor = smoothstep(-0.1, 0.3, NdotL);
      
      // Twilight golden tint on cloud tops at the day/night terminator
      float twilight = smoothstep(-0.15, 0.02, NdotL) * (1.0 - smoothstep(0.02, 0.22, NdotL));
      vec3 cloudDayColor = vec3(1.02, 1.04, 1.08);
      vec3 cloudSunsetColor = vec3(1.0, 0.52, 0.22);
      vec3 litCloudColor = mix(cloudDayColor, cloudSunsetColor, twilight * 0.85);

      // Forward scattering (clouds glow when lit towards sun angle)
      float forwardScatter = pow(max(0.0, dot(viewDir, -sunDir)), 2.5) * 0.35 * max(0.0, NdotL);
      litCloudColor += vec3(0.9, 0.95, 1.0) * forwardScatter;

      // Dark night side cloud silhouette
      vec3 nightCloudColor = vec3(0.015, 0.025, 0.045);
      vec3 finalCloudColor = mix(nightCloudColor, litCloudColor, dayFactor);

      // Cloud density / alpha
      float alpha = smoothstep(0.05, 0.75, cloudCoverage) * 0.88;
      // Soften clouds slightly on night side to reveal sparkling city lights
      alpha *= mix(0.4, 1.0, dayFactor);

      gl_FragColor = vec4(finalCloudColor, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

// ============================================================================
// 3. Physically-Inspired Rayleigh Atmospheric Limb Shader
// Features:
// - Single thin outer shell (scale 1.018) tightly wrapping Earth
// - Sun-directional scattering (bright blue on the sunlit limb, fading smoothly into deep space)
// - Golden sunset scattering along terminator horizon
// - Zero artificial neon rings or floating halos
// ============================================================================
function createAtmosphereShaderMaterial(sunDirection: THREE.Vector3) {
  const uniforms = {
    sunDirection: { value: sunDirection },
  };

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

  const fragmentShader = `
    uniform vec3 sunDirection;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 sunDir = normalize(sunDirection);

      // Angle between view direction and sphere normal (grazing rim)
      float viewDot = max(0.0, dot(viewDir, normal));
      float rim = 1.0 - viewDot;
      
      // Sharp realistic atmospheric falloff
      float intensity = pow(rim, 4.2);

      // Light modulation: scattering only occurs where sunlight reaches the atmosphere
      float sunAlignment = dot(normal, sunDir);
      float sunLit = smoothstep(-0.25, 0.35, sunAlignment);

      // Sunset/terminator horizon warmth in atmosphere
      float terminatorGlow = smoothstep(-0.28, -0.02, sunAlignment) * (1.0 - smoothstep(-0.02, 0.28, sunAlignment));
      vec3 sunsetAtmosphere = vec3(1.0, 0.48, 0.18) * terminatorGlow * 0.7;

      // Realistic Rayleigh blue atmosphere color palette
      vec3 deepBlue = vec3(0.12, 0.45, 0.95);
      vec3 cyanGlow = vec3(0.42, 0.78, 1.0);
      vec3 atmosphereColor = mix(deepBlue, cyanGlow, pow(rim, 2.0));
      atmosphereColor += sunsetAtmosphere;

      float alpha = intensity * sunLit * 0.95;

      if (alpha < 0.005) {
        discard;
      }

      gl_FragColor = vec4(atmosphereColor, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

// ============================================================================
// 4. Cinematic Orbital Sun Glare & Anamorphic Lens Flare System
// Features:
// - Brilliant white-hot sunrise core with soft atmospheric bloom
// - Razor-sharp diagonal anamorphic lens flare streak across the horizon
// - Radiating crepuscular starburst light rays streaming into space
// - Chromatic cyan-white-violet diffraction & lens fringes
// ============================================================================

// 4a. Anamorphic Lens Flare Streak (Diagonal light beam)
function createAnamorphicStreakMaterial() {
  const uniforms = {
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      // Distance from center along X (length) and Y (thickness)
      float distX = abs(vUv.x - 0.5) * 2.0;
      float distY = abs(vUv.y - 0.5) * 2.0;

      // Ultra-fine core laser line + soft surrounding beam
      float coreLine = exp(-distY * 65.0) * pow(1.0 - distX, 1.4);
      float softGlow = exp(-distY * 16.0) * pow(1.0 - distX, 2.8) * 0.45;
      float outerGlow = exp(-distY * 5.0) * pow(1.0 - distX, 4.0) * 0.18;
      
      float intensity = coreLine + softGlow + outerGlow;

      // Cinematic anamorphic color: pure white center, electric cyan-blue body, violet fringe
      vec3 coreCol = vec3(1.0, 1.0, 1.0);
      vec3 cyanCol = vec3(0.4, 0.75, 1.0);
      vec3 violetCol = vec3(0.68, 0.45, 0.98);

      vec3 color = mix(cyanCol, coreCol, exp(-distY * 50.0));
      color = mix(violetCol, color, 1.0 - distX * 0.6);

      float alpha = intensity * 0.95;
      if (alpha < 0.002) discard;

      gl_FragColor = vec4(color * intensity * 1.5, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// 4b. Radiating Crepuscular Sunburst Light Rays
function createSunRaysMaterial() {
  const uniforms = {
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float dist = length(p);
      if (dist > 1.0) discard;

      float angle = atan(p.y, p.x);

      // Multi-harmonic sun ray frequencies
      float r1 = sin(angle * 14.0 + uTime * 0.03) * 0.25;
      float r2 = sin(angle * 28.0 - uTime * 0.05) * 0.2;
      float r3 = sin(angle * 56.0 + 1.2) * 0.15;
      float r4 = sin(angle * 8.0 + uTime * 0.02) * 0.3;
      
      float rayPattern = max(0.0, r1 + r2 + r3 + r4 + 0.55);
      rayPattern = pow(rayPattern, 2.4);

      // Radial attenuation
      float falloff = pow(1.0 - dist, 1.8) / (dist * 2.2 + 0.12);
      float intensity = rayPattern * falloff * 0.38;

      // Color gradient: warm golden-white near sun, electric blue/cyan at distance
      vec3 innerColor = vec3(1.0, 0.96, 0.9);
      vec3 midColor   = vec3(0.48, 0.78, 1.0);
      vec3 outerColor = vec3(0.55, 0.4, 0.95);

      vec3 color = mix(midColor, innerColor, clamp(1.0 - dist * 2.0, 0.0, 1.0));
      color = mix(outerColor, color, clamp(1.0 - dist * 0.8, 0.0, 1.0));

      float alpha = min(1.0, intensity * 0.9);
      if (alpha < 0.002) discard;

      gl_FragColor = vec4(color * intensity * 1.6, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// 4c. White-Hot Sunrise Core & Bloom
function createSunCoreMaterial() {
  const uniforms = {
    uTime: { value: 0 },
  };

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv * 2.0 - 1.0;
      float dist = length(p);
      if (dist > 1.0) discard;

      // Intense white core
      float core = 0.07 / (dist + 0.025);
      
      // Soft ambient bloom halo
      float bloom = pow(1.0 - dist, 2.8) * 1.2;

      // Subtle 4-point cross diffraction
      float crossSpikes = (exp(-abs(p.x) * 24.0) * exp(-abs(p.y) * 4.0) + exp(-abs(p.y) * 24.0) * exp(-abs(p.x) * 4.0)) * 0.4;

      float total = core * 0.6 + bloom + crossSpikes;

      vec3 coreColor = vec3(1.0, 1.0, 1.0);
      vec3 bloomColor = vec3(0.5, 0.8, 1.0);
      vec3 warmHalo = vec3(1.0, 0.85, 0.65);

      vec3 color = mix(bloomColor, warmHalo, clamp(1.0 - dist * 2.5, 0.0, 1.0));
      color = mix(color, coreColor, min(1.0, core * 0.7));

      float alpha = min(1.0, total * 0.95);
      if (alpha < 0.002) discard;

      gl_FragColor = vec4(color * total * 1.8, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// 4d. Celestial Deep-Space Purple Nebula
function createNebulaSprites() {
  const group = new THREE.Group();

  // Create a canvas texture for smooth soft nebula cloud
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.3, "rgba(200, 180, 255, 0.7)");
    grad.addColorStop(0.65, "rgba(120, 80, 220, 0.25)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const texture = new THREE.CanvasTexture(canvas);

  const colors = [0x7c3aed, 0x6366f1, 0x8b5cf6, 0x4338ca, 0xa855f7];
  const positions = [
    { x: -0.2, y: 1.2, z: -4.0, scale: 6.0, col: colors[0], opacity: 0.16 },
    { x: 0.5, y: 1.6, z: -3.5, scale: 7.5, col: colors[1], opacity: 0.13 },
    { x: -0.8, y: 0.8, z: -4.2, scale: 5.5, col: colors[2], opacity: 0.12 },
    { x: 1.2, y: 1.0, z: -3.8, scale: 6.5, col: colors[3], opacity: 0.14 },
    { x: 0.2, y: 2.0, z: -4.5, scale: 8.0, col: colors[4], opacity: 0.11 },
  ];

  positions.forEach((p) => {
    const mat = new THREE.SpriteMaterial({
      map: texture,
      color: new THREE.Color(p.col),
      transparent: true,
      opacity: p.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(p.x, p.y, p.z);
    sprite.scale.set(p.scale, p.scale, 1);
    group.add(sprite);
  });

  return group;
}

// ============================================================================
// 5. Subtle Starfield
// ============================================================================
function createStarfield(numStars: number, starTexture: THREE.Texture) {
  const verts: number[] = [];
  const colors: number[] = [];
  const positions: Array<{ pos: THREE.Vector3; update: (t: number) => number }> = [];

  for (let i = 0; i < numStars; i++) {
    const radius = Math.random() * 50 + 25;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    const rate = Math.random() * 0.003 + 0.001;
    const baseLight = Math.random() * 0.45 + 0.25;
    const prob = Math.random();

    const update = (t: number) => {
      return prob > 0.65 ? baseLight + Math.sin(t * rate) * 0.25 : baseLight;
    };

    const pos = new THREE.Vector3(x, y, z);
    positions.push({ pos, update });

    const col = new THREE.Color().setHSL(0.6 + (Math.random() - 0.5) * 0.15, 0.35, baseLight);
    verts.push(x, y, z);
    colors.push(col.r, col.g, col.b);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    map: starTexture,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geo, mat);

  const update = (t: number) => {
    points.rotation.y = t * 0.000015;
    points.rotation.x = t * 0.000008;
    const colorAttr = geo.attributes.color as THREE.BufferAttribute;
    const colorArr = colorAttr.array as Float32Array;

    for (let i = 0; i < numStars; i++) {
      const p = positions[i];
      const bright = p.update(t);
      const col = new THREE.Color().setHSL(0.6, 0.25, bright);
      colorArr[i * 3] = col.r;
      colorArr[i * 3 + 1] = col.g;
      colorArr[i * 3 + 2] = col.b;
    }
    colorAttr.needsUpdate = true;
  };

  return { points, update };
}

export const EarthCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.3, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    const dayMap = textureLoader.load(dayMapImg);
    const nightMap = textureLoader.load(nightMapImg);
    const cloudsMap = textureLoader.load(cloudsMapImg);
    const bumpMap = textureLoader.load(bumpMapImg);
    const specularMap = textureLoader.load(specularMapImg);
    const starCircle = textureLoader.load(starCircleImg);

    // Setup high-quality texture parameters & color spaces
    [dayMap, nightMap, cloudsMap, specularMap, bumpMap].forEach((tex) => {
      tex.anisotropy = maxAnisotropy;
    });

    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;

    // Sun direction: Sun positioned on horizon at the upper-left limb of Earth
    const sunDirection = new THREE.Vector3(-1.45, 0.55, 0.95).normalize();

    // Earth Root Group
    const earthGroup = new THREE.Group();

    const updateEarthTransform = (w: number, h: number) => {
      const isMobile = w < 768;
      const isTablet = w >= 768 && w < 1024;

      if (isMobile) {
        earthGroup.position.set(0.15, -2.4, 0.5);
        earthGroup.scale.setScalar(2.6);
      } else if (isTablet) {
        earthGroup.position.set(1.0, -2.6, 0.5);
        earthGroup.scale.setScalar(3.2);
      } else {
        // Desktop: Majestic curvature on bottom right
        earthGroup.position.set(1.4, -2.75, 0.4);
        earthGroup.scale.setScalar(3.55);
      }
    };

    updateEarthTransform(width, height);
    // Real Earth axial tilt (23.44°)
    earthGroup.rotation.z = (-23.44 * Math.PI) / 180;
    earthGroup.rotation.x = 0.16;
    scene.add(earthGroup);

    // Sphere Geometry (High tessellation for smooth curvature)
    const earthGeometry = new THREE.SphereGeometry(1, 96, 96);

    // 1. Earth Surface Mesh
    const earthSurfaceMat = createEarthSurfaceMaterial(sunDirection, {
      dayMap,
      nightMap,
      cloudsMap,
      specularMap,
      bumpMap,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthSurfaceMat);
    earthGroup.add(earthMesh);

    // 2. Realistic Cloud Layer (closely wrapped at 1.004 scale)
    const cloudsMat = createCloudsMaterial(sunDirection, cloudsMap);
    const cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMat);
    cloudsMesh.scale.setScalar(1.004);
    earthGroup.add(cloudsMesh);

    // 3. Physically-Inspired Atmosphere Shell (scale 1.016)
    const atmosphereMat = createAtmosphereShaderMaterial(sunDirection);
    const atmosphereMesh = new THREE.Mesh(earthGeometry, atmosphereMat);
    atmosphereMesh.scale.setScalar(1.016);
    earthGroup.add(atmosphereMesh);

    // =========================================================================
    // 4. Cinematic Sunrise Flare Group (Pinned right to Earth horizon)
    // =========================================================================
    const sunFlareGroup = new THREE.Group();

    // Position the flare precisely on the upper-left horizon limb
    const updateSunFlarePos = (w: number) => {
      const isMobile = w < 768;
      if (isMobile) {
        sunFlareGroup.position.set(-0.35, 0.15, 0.6);
      } else {
        // Desktop / Tablet position right on the horizon curvature
        sunFlareGroup.position.set(0.18, 0.52, 0.65);
      }
    };
    updateSunFlarePos(width);

    // 4a. White-Hot Core & Bloom Halo
    const sunCoreMat = createSunCoreMaterial();
    const sunCoreMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), sunCoreMat);
    sunFlareGroup.add(sunCoreMesh);

    // 4b. Radiating Crepuscular Sun Rays
    const sunRaysMat = createSunRaysMaterial();
    const sunRaysMesh = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 6.5), sunRaysMat);
    sunRaysMesh.position.z = -0.05;
    sunFlareGroup.add(sunRaysMesh);

    // 4c. Ultra-Wide Anamorphic Diagonal Lens Flare Streak
    const streakMat = createAnamorphicStreakMaterial();
    const streakMesh = new THREE.Mesh(new THREE.PlaneGeometry(12.0, 1.2), streakMat);
    // Angle streak across the scene (around 38 degrees diagonal)
    streakMesh.rotation.z = (38 * Math.PI) / 180;
    streakMesh.position.z = 0.05;
    sunFlareGroup.add(streakMesh);

    // Secondary subtle cross flare streak
    const secondaryStreakMat = createAnamorphicStreakMaterial();
    const secondaryStreakMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 0.7), secondaryStreakMat);
    secondaryStreakMesh.rotation.z = (-52 * Math.PI) / 180;
    secondaryStreakMesh.position.z = 0.02;
    sunFlareGroup.add(secondaryStreakMesh);

    scene.add(sunFlareGroup);

    // 5. Deep Space Celestial Purple Nebula
    const nebulaGroup = createNebulaSprites();
    scene.add(nebulaGroup);

    // 6. Starfield Background
    const { points: stars, update: updateStars } = createStarfield(500, starCircle);
    scene.add(stars);

    // Directional Light corresponding to Sun
    const dirLight = new THREE.DirectionalLight(0xfff8ee, 0.2);
    dirLight.position.copy(sunDirection).multiplyScalar(10);
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0x0a1020, 0.4);
    scene.add(ambientLight);

    // Mouse Parallax Interaction
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      targetMouseX = (e.clientX / innerWidth - 0.5) * 0.12;
      targetMouseY = (e.clientY / innerHeight - 0.5) * 0.08;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation Loop
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      const tSec = time * 0.001;

      // Update shader time uniforms
      earthSurfaceMat.uniforms.uTime.value = tSec;
      cloudsMat.uniforms.uTime.value = tSec;
      sunRaysMat.uniforms.uTime.value = tSec;
      sunCoreMat.uniforms.uTime.value = tSec;
      streakMat.uniforms.uTime.value = tSec;
      secondaryStreakMat.uniforms.uTime.value = tSec;

      // Continuous Earth Spin
      const spinSpeed = 0.035;
      earthMesh.rotation.y += spinSpeed * delta;
      cloudsMesh.rotation.y += spinSpeed * 1.12 * delta; // Realistic independent cloud drift
      atmosphereMesh.rotation.y += spinSpeed * delta;

      // Gentle pulse & subtle shimmer on sun rays
      sunRaysMesh.rotation.z = tSec * 0.015;

      // Sun flare faces camera
      sunFlareGroup.quaternion.copy(camera.quaternion);

      // Smooth mouse lerp for subtle camera parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.04;
      currentMouseY += (targetMouseY - currentMouseY) * 0.04;

      camera.position.x = currentMouseX;
      camera.position.y = 0.3 - currentMouseY;
      camera.lookAt(0, -0.35, 0);

      // Starfield twinkle
      updateStars(time);

      renderer.render(scene, camera);
    };

    animate(performance.now());

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      updateEarthTransform(w, h);
      updateSunFlarePos(w);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      earthGeometry.dispose();
      earthSurfaceMat.dispose();
      cloudsMat.dispose();
      atmosphereMat.dispose();
      sunCoreMat.dispose();
      sunRaysMat.dispose();
      streakMat.dispose();
      secondaryStreakMat.dispose();
      stars.geometry.dispose();
      (stars.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "hidden" }}
    />
  );
};

export default EarthCanvas;

