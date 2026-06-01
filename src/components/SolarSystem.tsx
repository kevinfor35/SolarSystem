import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { planetsData, moonData, sunData, calculateEllipsePosition, type PlanetData } from '../data/planets';

interface SolarSystemProps {
  isPlaying: boolean;
  animationSpeed: number;
  onPlanetSelect: (planet: PlanetData | null) => void;
}

export default function SolarSystem({ isPlaying, animationSpeed, onPlanetSelect }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetsRef = useRef<Map<string, THREE.Group>>(new Map());
  const moonRef = useRef<THREE.Group | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const textureLoaderRef = useRef<THREE.TextureLoader>(new THREE.TextureLoader());

  const createStarField = useCallback((scene: THREE.Scene) => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });

    const starsVertices: number[] = [];
    const starColors: number[] = [];
    
    for (let i = 0; i < 20000; i++) {
      const x = (Math.random() - 0.5) * 3000;
      const y = (Math.random() - 0.5) * 3000;
      const z = (Math.random() - 0.5) * 3000;
      starsVertices.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.55, 0.2, 0.6 + Math.random() * 0.4);
      starColors.push(color.r, color.g, color.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
  }, []);

  const createSun = useCallback((scene: THREE.Scene) => {
    const sunGroup = new THREE.Group();
    
    const sunGeometry = new THREE.SphereGeometry(3.5, 64, 64);
    const sunTexture = textureLoaderRef.current.load(sunData.textureUrl);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);

    const glowGeometry = new THREE.SphereGeometry(3.8, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunGroup.add(glow);

    const outerGlowGeometry = new THREE.SphereGeometry(4.5, 64, 64);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    sunGroup.add(outerGlow);

    const sunLight = new THREE.PointLight(0xffffff, 2.5, 400);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    scene.add(sunGroup);
  }, []);

  const createEllipseOrbit = useCallback((scene: THREE.Scene, semiMajorAxis: number, eccentricity: number) => {
    const a = semiMajorAxis;
    const b = a * Math.sqrt(1 - eccentricity * eccentricity);
    const c = a * eccentricity;
    
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(
        a * Math.cos(angle) - c,
        0,
        b * Math.sin(angle)
      ));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.35,
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
  }, []);

  const createPlanetWithTexture = useCallback((scene: THREE.Scene, planet: PlanetData): THREE.Group => {
    const planetGroup = new THREE.Group();
    const baseSize = planet.id === 'jupiter' ? 2.2 : planet.id === 'saturn' ? 1.9 : 
                     planet.id === 'uranus' || planet.id === 'neptune' ? 1.3 : 0.9;

    const planetGeometry = new THREE.SphereGeometry(baseSize, 64, 64);
    
    let planetMaterial: THREE.MeshBasicMaterial;
    
    if (planet.textureUrl) {
      const texture = textureLoaderRef.current.load(planet.textureUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      
      planetMaterial = new THREE.MeshBasicMaterial({
        map: texture,
      });
    } else {
      planetMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(planet.color),
      });
    }

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.userData = { planet };
    planetGroup.add(planetMesh);

    if (planet.id === 'earth') {
      const atmosphereGeometry = new THREE.SphereGeometry(baseSize * 1.05, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide,
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planetGroup.add(atmosphere);
    } else if (planet.id === 'venus') {
      const atmosphereGeometry = new THREE.SphereGeometry(baseSize * 1.06, 32, 32);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0xffcc80,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planetGroup.add(atmosphere);
    }

    if (planet.hasRings) {
      if (planet.id === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(baseSize * 1.3, baseSize * 2.5, 128);
        const ringTexture = textureLoaderRef.current.load('/textures/2k_saturn_ring_alpha.png');
        ringTexture.colorSpace = THREE.SRGBColorSpace;
        const ringMaterial = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2.3;
        planetGroup.add(rings);
      } else {
        const ringGeometry = new THREE.RingGeometry(baseSize * 1.4, baseSize * 2.3, 128);
        const ringMaterial = new THREE.MeshBasicMaterial({
          color: 0xc9b896,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const rings = new THREE.Mesh(ringGeometry, ringMaterial);
        rings.rotation.x = Math.PI / 2.4;
        planetGroup.add(rings);
      }
    }

    if (planet.id === 'earth') {
      const cloudsGeometry = new THREE.SphereGeometry(baseSize * 1.02, 64, 64);
      const cloudsTexture = textureLoaderRef.current.load('/textures/2k_earth_clouds.jpg');
      cloudsTexture.colorSpace = THREE.SRGBColorSpace;
      const cloudsMaterial = new THREE.MeshBasicMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.4,
      });
      const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      planetGroup.add(clouds);
    }

    scene.add(planetGroup);
    planetsRef.current.set(planet.id, planetGroup);

    return planetGroup;
  }, []);

  const createMoonWithTexture = useCallback((scene: THREE.Scene): THREE.Group => {
    const moonGroup = new THREE.Group();
    
    const moonGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const moonTexture = textureLoaderRef.current.load('/textures/2k_moon.jpg');
    moonTexture.colorSpace = THREE.SRGBColorSpace;
    const moonMaterial = new THREE.MeshBasicMaterial({
      map: moonTexture,
    });
    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.userData = { moon: moonData };
    moonGroup.add(moonMesh);

    scene.add(moonGroup);
    return moonGroup;
  }, []);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!containerRef.current || !cameraRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    const meshes: THREE.Object3D[] = [];
    planetsRef.current.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.planet) {
          meshes.push(child);
        }
      });
    });
    
    if (moonRef.current) {
      moonRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.moon) {
          meshes.push(child);
        }
      });
    }
    
    const intersects = raycasterRef.current.intersectObjects(meshes);

    if (intersects.length > 0) {
      const obj = intersects[0].object as THREE.Mesh;
      if (obj.userData.planet) {
        onPlanetSelect(obj.userData.planet);
      } else if (obj.userData.moon) {
        onPlanetSelect({
          id: moonData.id,
          name: moonData.name,
          nameCN: moonData.nameCN,
          diameter: moonData.diameter,
          mass: 7.342e22,
          distanceFromSun: planetsData.find(p => p.id === 'earth')?.distanceFromSun || 1,
          orbitalPeriod: moonData.orbitalPeriod,
          rotationPeriod: 655.7,
          orbitalRadius: moonData.orbitalRadius,
          eccentricity: 0.0549,
          inclination: 5.145,
          color: moonData.color,
          hasRings: false,
        });
      }
    } else {
      onPlanetSelect(null);
    }
  }, [onPlanetSelect]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 50, 90);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 280;

    const ambientLight = new THREE.AmbientLight(0x404050, 0.6);
    scene.add(ambientLight);

    createStarField(scene);
    createSun(scene);

    planetsData.forEach(planet => {
      createEllipseOrbit(scene, planet.orbitalRadius, planet.eccentricity);
      createPlanetWithTexture(scene, planet);
    });

    earthRef.current = planetsRef.current.get('earth') || null;
    moonRef.current = createMoonWithTexture(scene);

    containerRef.current.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (isPlaying) {
        timeRef.current += 0.008 * animationSpeed;
      }

      planetsData.forEach(planet => {
        const planetGroup = planetsRef.current.get(planet.id);
        if (planetGroup) {
          const angle = (timeRef.current * 2 * Math.PI) / planet.orbitalPeriod;
          const pos = calculateEllipsePosition(angle, planet.orbitalRadius, planet.eccentricity);
          planetGroup.position.set(pos.x, 0, pos.z);
          
          planetGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
              const size = child.geometry.parameters.radius;
              if (size > 0.5) {
                child.rotation.y += 0.003 * animationSpeed * (24 / planet.rotationPeriod);
              }
            }
            if (planet.id === 'earth' && child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
              const radius = child.geometry.parameters.radius;
              if (radius > 1.0) {
                child.rotation.y += 0.004 * animationSpeed;
              }
            }
          });
        }
      });

      if (earthRef.current && moonRef.current) {
        const moonAngle = (timeRef.current * 2 * Math.PI) / moonData.orbitalPeriod;
        const earthPos = earthRef.current.position;
        const moonX = earthPos.x + Math.cos(moonAngle) * moonData.orbitalRadius;
        const moonZ = earthPos.z + Math.sin(moonAngle) * moonData.orbitalRadius;
        moonRef.current.position.set(moonX, 0, moonZ);
        
        moonRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.rotation.y = moonAngle;
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('click', handleClick);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, [isPlaying, animationSpeed, createStarField, createSun, createEllipseOrbit, createPlanetWithTexture, createMoonWithTexture, handleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
    />
  );
}
