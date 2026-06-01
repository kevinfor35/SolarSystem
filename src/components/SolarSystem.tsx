import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { planetsData, moonData, sunData, type PlanetData } from '../data/planets';

interface SolarSystemProps {
  isPlaying: boolean;
  animationSpeed: number;
  onPlanetSelect: (planet: PlanetData | null) => void;
}

export default function SolarSystem({ isPlaying, animationSpeed, onPlanetSelect }: SolarSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const planetsRef = useRef<Map<string, THREE.Group>>(new Map());
  const moonRef = useRef<THREE.Group | null>(null);
  const earthRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  const createStarField = useCallback((scene: THREE.Scene) => {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8,
    });

    const starsVertices: number[] = [];
    const starColors: number[] = [];
    
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2500;
      const y = (Math.random() - 0.5) * 2500;
      const z = (Math.random() - 0.5) * 2500;
      starsVertices.push(x, y, z);
      
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.55, 0.3, 0.7 + Math.random() * 0.3);
      starColors.push(color.r, color.g, color.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
  }, []);

  const createSun = useCallback((scene: THREE.Scene) => {
    const sunGroup = new THREE.Group();
    
    const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: sunData.color,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sunGroup.add(sun);

    const glowGeometry = new THREE.SphereGeometry(3.3, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sunGroup.add(glow);

    const outerGlowGeometry = new THREE.SphereGeometry(4, 64, 64);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    sunGroup.add(outerGlow);

    const sunLight = new THREE.PointLight(0xfff5e6, 3, 300);
    sunLight.position.set(0, 0, 0);
    sunGroup.add(sunLight);

    scene.add(sunGroup);
  }, []);

  const createOrbit = useCallback((scene: THREE.Scene, radius: number, inclination: number) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x4a5568,
      transparent: true,
      opacity: 0.4,
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbit);
  }, []);

  const createPlanetWithAtmosphere = useCallback((scene: THREE.Scene, planet: PlanetData): THREE.Group => {
    const planetGroup = new THREE.Group();
    const baseSize = planet.id === 'jupiter' ? 2 : planet.id === 'saturn' ? 1.8 : 
                     planet.id === 'uranus' || planet.id === 'neptune' ? 1.2 : 0.8;

    const planetGeometry = new THREE.SphereGeometry(baseSize, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(planet.color),
      emissive: new THREE.Color(planet.emissiveColor || planet.color),
      emissiveIntensity: 0.3,
      roughness: 0.8,
      metalness: 0.1,
    });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.userData = { planet };
    planetGroup.add(planetMesh);

    const atmosphereGeometry = new THREE.SphereGeometry(baseSize * 1.08, 32, 32);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(planet.color),
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    planetGroup.add(atmosphere);

    if (planet.hasRings) {
      const innerRingGeometry = new THREE.RingGeometry(baseSize * 1.5, baseSize * 2.2, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xd4c5a9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const rings = new THREE.Mesh(innerRingGeometry, ringMaterial);
      rings.rotation.x = Math.PI / 2.5;
      planetGroup.add(rings);

      const outerRingGeometry = new THREE.RingGeometry(baseSize * 2.3, baseSize * 2.8, 64);
      const outerRingMaterial = new THREE.MeshBasicMaterial({
        color: 0xc9b896,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const outerRings = new THREE.Mesh(outerRingGeometry, outerRingMaterial);
      outerRings.rotation.x = Math.PI / 2.5;
      planetGroup.add(outerRings);
    }

    scene.add(planetGroup);
    planetsRef.current.set(planet.id, planetGroup);

    return planetGroup;
  }, []);

  const createMoonWithAtmosphere = useCallback((scene: THREE.Scene): THREE.Group => {
    const moonGroup = new THREE.Group();
    
    const moonGeometry = new THREE.SphereGeometry(0.35, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(moonData.color),
      emissive: 0x555555,
      emissiveIntensity: 0.1,
      roughness: 0.9,
      metalness: 0.1,
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
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.FogExp2(0x000814, 0.0003);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      2000
    );
    camera.position.set(0, 40, 80);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 250;
    controls.autoRotate = false;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    createStarField(scene);
    createSun(scene);

    planetsData.forEach(planet => {
      createOrbit(scene, planet.orbitalRadius, planet.inclination);
      createPlanetWithAtmosphere(scene, planet);
    });

    earthRef.current = planetsRef.current.get('earth') || null;
    moonRef.current = createMoonWithAtmosphere(scene);

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
          const x = Math.cos(angle) * planet.orbitalRadius;
          const z = Math.sin(angle) * planet.orbitalRadius;
          planetGroup.position.set(x, 0, z);
          
          planetGroup.traverse((child) => {
            if (child instanceof THREE.Mesh && child.geometry.type === 'SphereGeometry') {
              const size = child.geometry.parameters.radius;
              if (size > 1) {
                child.rotation.y += 0.003 * animationSpeed * (24 / planet.rotationPeriod);
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
            child.rotation.y += 0.002 * animationSpeed;
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
  }, [isPlaying, animationSpeed, createStarField, createSun, createOrbit, createPlanetWithAtmosphere, createMoonWithAtmosphere, handleClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
    />
  );
}
