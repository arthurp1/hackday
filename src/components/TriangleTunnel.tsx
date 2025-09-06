import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export interface SpeedSettings {
  portalIntroSpeed: number;
  portalIntroTime: number;
  portalAccelSpeed: number;
  portalAccelTime: number;
  portalIdleSpeed: number;
}

// Define tunnel stops with futuristic colors
const TUNNEL_STOPS = [
  { name: 'Genesis Portal', colors: [0x87CEEB, 0xDDA0DD, 0xF0E68C] },
  { name: 'Neon Dreams', colors: [0xFF69B4, 0x00CED1, 0xDA70D6] },
  { name: 'Crystal Depths', colors: [0x9370DB, 0x8A2BE2, 0xBA55D3] },
  { name: 'Ocean Abyss', colors: [0x4169E1, 0x6495ED, 0x87CEFA] },
  { name: 'Fire Realm', colors: [0xFF6347, 0xFF4500, 0xFFA500] },
  { name: 'Crystal Cave', colors: [0xBA55D3, 0x9932CC, 0x8A2BE2] },
  { name: 'Solar Flare', colors: [0xFFD700, 0xFFA500, 0xFF8C00] },
  { name: 'Void Space', colors: [0x6A5ACD, 0x483D8B, 0x2F4F4F] },
  { name: 'Aurora Fields', colors: [0x00FFFF, 0x40E0D0, 0x48D1CC] },
  { name: 'Quantum Core', colors: [0x9370DB, 0x8A2BE2, 0x9400D3] }
];

interface TriangleTunnelProps {
  isAccelerating: boolean;
  onSpeedChange: (speed: number) => void;
  speedSettings: SpeedSettings;
}

// Create Penrose triangle geometry
let cachedGeometry: THREE.ShapeGeometry | null = null;
const createPenroseTriangle = () => {
  if (cachedGeometry) return cachedGeometry.clone();
  
  const shape = new THREE.Shape();
  
  // Outer triangle
  const outerRadius = 3;
  const height = outerRadius * Math.sqrt(3) / 2;
  
  shape.moveTo(0, height);
  shape.lineTo(-outerRadius / 2, -height / 2);
  shape.lineTo(outerRadius / 2, -height / 2);
  shape.lineTo(0, height);
  
  // Inner triangle hole
  const innerRadius = 1.5;
  const innerHeight = innerRadius * Math.sqrt(3) / 2;
  
  const hole = new THREE.Path();
  hole.moveTo(0, innerHeight);
  hole.lineTo(-innerRadius / 2, -innerHeight / 2);
  hole.lineTo(innerRadius / 2, -innerHeight / 2);
  hole.lineTo(0, innerHeight);
  
  shape.holes.push(hole);
  
  cachedGeometry = new THREE.ShapeGeometry(shape);
  return cachedGeometry.clone();
};

const TriangleTunnel: React.FC<TriangleTunnelProps> = ({ 
  isAccelerating, 
  onSpeedChange, 
  speedSettings
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const trianglesRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number>();
  const isInitializedRef = useRef(false);
  const lastFrameTimeRef = useRef(0);
  
  const currentSpeedRef = useRef(0.02); // Base speed
  const targetSpeedRef = useRef(0.02);
  const speedBoostRef = useRef(1); // Speed multiplier for G-force boosts
  const glowIntensityRef = useRef(0); // Glow intensity for speed boosts
  const timeRef = useRef(0);
  const cameraOffsetRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });
  const acceleratingRef = useRef(false);
  const targetRotationRef = useRef({ x: 0, y: 0 });
  const currentRotationRef = useRef({ x: 0, y: 0 });
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);

  // Constants
  const numTriangles = 200;
  const triangleSpacing = 8;

  // Update speed based on acceleration state
  useEffect(() => {
    if (isAccelerating) {
      targetSpeedRef.current = speedSettings.portalAccelSpeed;
      // Apply intense G-force speed boost with glow
      speedBoostRef.current = Math.min(5, speedBoostRef.current + 1.5);
      glowIntensityRef.current = Math.min(2, glowIntensityRef.current + 0.8);
      setTimeout(() => {
        // Gradual decay for realistic G-force feeling
        const decayInterval = setInterval(() => {
          speedBoostRef.current = Math.max(1.2, speedBoostRef.current * 0.95);
          glowIntensityRef.current = Math.max(0, glowIntensityRef.current * 0.92);
          if (speedBoostRef.current <= 1.2 && glowIntensityRef.current <= 0.1) {
            speedBoostRef.current = 1.2;
            glowIntensityRef.current = 0;
            clearInterval(decayInterval);
          }
        }, 50);
      }, 300);
    } else {
      targetSpeedRef.current = speedSettings.portalIdleSpeed;
      speedBoostRef.current = 1.2; // Slightly faster base speed after boost
      glowIntensityRef.current = 0;
    }
  }, [isAccelerating, speedSettings.portalAccelSpeed, speedSettings.portalIdleSpeed]);

  // Keep accelerating state in a ref for event handlers
  useEffect(() => {
    acceleratingRef.current = isAccelerating;
  }, [isAccelerating]);

  // Optimized mouse move handler
  const handleMouseMove = useCallback((event: MouseEvent) => {
    // Normalize mouse coordinates to -1 to 1
    mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Set target rotation based on mouse position
    const base = 0.1;
    const boost = acceleratingRef.current ? 0.25 : base; // wider angle when accelerating
    targetRotationRef.current.x = mouseRef.current.y * boost; // Tilt up/down
    targetRotationRef.current.y = mouseRef.current.x * boost; // Tilt left/right
  }, []);

  // Optimized resize handler
  const handleResize = useCallback(() => {
    if (cameraRef.current && rendererRef.current) {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current || isInitializedRef.current) return;
    
    isInitializedRef.current = true;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 5, 150);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // WebGL Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create shader materials
    const createRegularMaterial = (colors: number[]) => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: new THREE.Color(colors[0]) },
          colorB: { value: new THREE.Color(colors[1]) },
          colorC: { value: new THREE.Color(colors[2]) },
          glowIntensity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform vec3 colorC;
          uniform float glowIntensity;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            float noise = sin(uv.x * 6.0 + time) * sin(uv.y * 6.0 + time * 0.5);
            noise += sin(uv.x * 12.0 + time * 1.2) * sin(uv.y * 12.0 + time * 0.7) * 0.4;
            
            float pattern = sin(noise + time) * 0.5 + 0.5;
            vec3 color = mix(colorA, colorB, pattern);
            color = mix(color, colorC, cos(noise * 1.8 + time) * 0.3 + 0.5);
            
            // Enhanced glow
            float glow = smoothstep(0.2, 0.8, pattern);
            color += colorC * 0.4 * glow;
            
            // Shimmer effect
            float shimmer = sin(time * 3.0 + uv.x * 20.0 + uv.y * 15.0) * 0.1 + 0.9;
            color *= shimmer;
            
            // G-force glow effect during speed boosts
            color += vec3(0.0, 0.8, 1.0) * glowIntensity * 0.5;
            color += colorC * glowIntensity * 0.3;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });
      materialsRef.current.push(material);
      return material;
    };

    const createLavaMaterial = () => {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: new THREE.Color(0xFF4500) },
          colorB: { value: new THREE.Color(0xFF6347) },
          colorC: { value: new THREE.Color(0xFFD700) },
          glowIntensity: { value: 0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          uniform vec3 colorA;
          uniform vec3 colorB;
          uniform vec3 colorC;
          uniform float glowIntensity;
          varying vec2 vUv;
          
          void main() {
            vec2 uv = vUv;
            
            // Lava-like flowing animation
            float lava1 = sin(uv.x * 8.0 + time * 3.0) * 0.5 + 0.5;
            float lava2 = cos(uv.y * 6.0 + time * 2.5) * 0.5 + 0.5;
            float lava3 = sin((uv.x + uv.y) * 10.0 + time * 4.0) * 0.5 + 0.5;
            
            // Create flowing lava effect
            float lavaFlow = lava1 * lava2 * lava3;
            vec3 color = mix(colorA, colorB, lavaFlow);
            color = mix(color, colorC, sin(lavaFlow * 3.14159 + time * 2.0) * 0.5 + 0.5);
            
            // Add intense glow and heat effect
            float heat = sin(time * 5.0 + uv.x * 12.0) * cos(time * 4.0 + uv.y * 10.0);
            color += vec3(0.3, 0.1, 0.0) * heat * 0.5;
            
            // Pulsing intensity
            float pulse = sin(time * 6.0) * 0.2 + 0.8;
            color *= pulse;
            
            // Intense lava glow during G-force
            color += vec3(1.0, 0.3, 0.0) * glowIntensity * 0.7;
            color += vec3(1.0, 0.8, 0.0) * glowIntensity * 0.4;
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });
      materialsRef.current.push(material);
      return material;
    };

    // Create triangular tunnel
    for (let i = 0; i < numTriangles; i++) {
      const penroseGeometry = createPenroseTriangle();
      
      // Every 10th triangle gets lava material
      const isLavaTriangle = i % 10 === 0;
      const stopIndex = Math.floor(i / (numTriangles / TUNNEL_STOPS.length));
      const currentStop = TUNNEL_STOPS[Math.min(stopIndex, TUNNEL_STOPS.length - 1)];
      
      const material = isLavaTriangle ? createLavaMaterial() : createRegularMaterial(currentStop.colors);
      const triangle = new THREE.Mesh(penroseGeometry, material);
      
      triangle.position.z = -i * triangleSpacing;
      
      // Scale triangles to create tunnel effect
      const scale = 1 + i * 0.1;
      triangle.scale.set(scale, scale, 1);
      
      // Optimize rendering
      triangle.matrixAutoUpdate = false;
      triangle.updateMatrix();
      
      scene.add(triangle);
      trianglesRef.current.push(triangle);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0, 10);
    scene.add(directionalLight);

    // Add mouse event listener
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = (currentTime: number) => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Calculate delta time for consistent animation
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      
      // Cap delta time to prevent large jumps
      const cappedDelta = Math.min(deltaTime * 0.001, 0.033); // Max 33ms (30fps minimum)
      timeRef.current += cappedDelta;

      // Smooth speed interpolation
      const boostedTargetSpeed = targetSpeedRef.current * speedBoostRef.current;
      currentSpeedRef.current += (boostedTargetSpeed - currentSpeedRef.current) * 0.05;
      
      // Report speed to parent for UI synchronization
      onSpeedChange(currentSpeedRef.current);

      // Smooth rotation interpolation
      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.05;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.05;

      // Camera gentle bounce movement
      if (cameraRef.current) {
        cameraOffsetRef.current.x = Math.sin(timeRef.current * 0.3) * 0.1;
        cameraOffsetRef.current.y = Math.cos(timeRef.current * 0.4) * 0.08;
        
        cameraRef.current.position.x = cameraOffsetRef.current.x;
        cameraRef.current.position.y = cameraOffsetRef.current.y;
        
        // Apply mouse-based rotation
        cameraRef.current.rotation.x = currentRotationRef.current.x;
        cameraRef.current.rotation.y = currentRotationRef.current.y;
      }

      // Update shader uniforms and move triangles
      trianglesRef.current.forEach((triangle, index) => {
        // Update shader time
        if (triangle.material instanceof THREE.ShaderMaterial) {
          triangle.material.uniforms.time.value = timeRef.current;
          triangle.material.uniforms.glowIntensity.value = glowIntensityRef.current;
        }
        
        // Move triangle forward only
        triangle.position.z += currentSpeedRef.current;
        
        // Reset triangle position for infinite tunnel
        if (triangle.position.z > 20) {
          triangle.position.z = -numTriangles * triangleSpacing;
        }
        
        // Update matrix for optimized rendering
        triangle.updateMatrix();
      });

      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(scene, cameraRef.current);
      }
    };

    // Start animation loop
    lastFrameTimeRef.current = performance.now();
    animate(lastFrameTimeRef.current);

    // Cleanup
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose of Three.js objects
      trianglesRef.current.forEach(triangle => {
        triangle.geometry.dispose();
      });
      
      // Dispose materials
      materialsRef.current.forEach(material => {
        material.dispose();
      });
      materialsRef.current.length = 0;
      
      rendererRef.current?.dispose();
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array to prevent re-initialization

  return (
    <div 
      ref={mountRef} 
      className="triangle-tunnel-container"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none'
      }} 
    />
  );
};

export default TriangleTunnel;