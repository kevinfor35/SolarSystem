export interface PlanetData {
  id: string;
  name: string;
  nameCN: string;
  diameter: number;
  mass: number;
  distanceFromSun: number;
  orbitalPeriod: number;
  rotationPeriod: number;
  orbitalRadius: number;
  eccentricity: number;
  inclination: number;
  color: string;
  emissiveColor?: string;
  hasRings: boolean;
  textureUrl?: string;
  normalMapUrl?: string;
  specularMapUrl?: string;
}

export interface MoonData {
  id: string;
  name: string;
  nameCN: string;
  diameter: number;
  orbitalRadius: number;
  orbitalPeriod: number;
  color: string;
}

export const planetsData: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    nameCN: '水星',
    diameter: 4879,
    mass: 3.285e23,
    distanceFromSun: 0.39,
    orbitalPeriod: 88,
    rotationPeriod: 1407.6,
    orbitalRadius: 6,
    eccentricity: 0.2056,
    inclination: 7.005,
    color: '#9E9E9E',
    emissiveColor: '#424242',
    hasRings: false,
    textureUrl: '/textures/2k_mercury.jpg',
  },
  {
    id: 'venus',
    name: 'Venus',
    nameCN: '金星',
    diameter: 12104,
    mass: 4.867e24,
    distanceFromSun: 0.72,
    orbitalPeriod: 224.7,
    rotationPeriod: 5832.5,
    orbitalRadius: 9,
    eccentricity: 0.0067,
    inclination: 3.3947,
    color: '#FFCC80',
    emissiveColor: '#FF9800',
    hasRings: false,
    textureUrl: '/textures/2k_venus_surface.jpg',
  },
  {
    id: 'earth',
    name: 'Earth',
    nameCN: '地球',
    diameter: 12742,
    mass: 5.972e24,
    distanceFromSun: 1,
    orbitalPeriod: 365.25,
    rotationPeriod: 24,
    orbitalRadius: 12,
    eccentricity: 0.0167,
    inclination: 0,
    color: '#64B5F6',
    emissiveColor: '#2196F3',
    hasRings: false,
    textureUrl: '/textures/2k_earth_daymap.jpg',
  },
  {
    id: 'mars',
    name: 'Mars',
    nameCN: '火星',
    diameter: 6779,
    mass: 6.39e23,
    distanceFromSun: 1.52,
    orbitalPeriod: 687,
    rotationPeriod: 24.6,
    orbitalRadius: 15,
    eccentricity: 0.0934,
    inclination: 1.8506,
    color: '#EF5350',
    emissiveColor: '#D32F2F',
    hasRings: false,
    textureUrl: '/textures/2k_mars.jpg',
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    nameCN: '木星',
    diameter: 139820,
    mass: 1.898e27,
    distanceFromSun: 5.2,
    orbitalPeriod: 4331,
    rotationPeriod: 9.9,
    orbitalRadius: 22,
    eccentricity: 0.0484,
    inclination: 1.3053,
    color: '#FFB74D',
    emissiveColor: '#FF9800',
    hasRings: false,
    textureUrl: '/textures/2k_jupiter.jpg',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    nameCN: '土星',
    diameter: 116460,
    mass: 5.683e26,
    distanceFromSun: 9.5,
    orbitalPeriod: 10747,
    rotationPeriod: 10.7,
    orbitalRadius: 30,
    eccentricity: 0.0542,
    inclination: 2.4845,
    color: '#FFE082',
    emissiveColor: '#FFCA28',
    hasRings: true,
    textureUrl: '/textures/2k_saturn.jpg',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    nameCN: '天王星',
    diameter: 50724,
    mass: 8.681e25,
    distanceFromSun: 19.2,
    orbitalPeriod: 30589,
    rotationPeriod: 17.2,
    orbitalRadius: 38,
    eccentricity: 0.0472,
    inclination: 0.7726,
    color: '#80DEEA',
    emissiveColor: '#26C6DA',
    hasRings: true,
    textureUrl: '/textures/2k_uranus.jpg',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    nameCN: '海王星',
    diameter: 49244,
    mass: 1.024e26,
    distanceFromSun: 30.1,
    orbitalPeriod: 59800,
    rotationPeriod: 16.1,
    orbitalRadius: 45,
    eccentricity: 0.0086,
    inclination: 1.7692,
    color: '#7E57C2',
    emissiveColor: '#5E35B1',
    hasRings: true,
    textureUrl: '/textures/2k_neptune.jpg',
  },
];

export const moonData: MoonData = {
  id: 'moon',
  name: 'Moon',
  nameCN: '月球',
  diameter: 3475,
  orbitalRadius: 2.2,
  orbitalPeriod: 27.3,
  color: '#BDBDBD',
};

export const sunData = {
  diameter: 1392700,
  mass: 1.989e30,
  color: '#FFD54F',
  textureUrl: '/textures/2k_sun.jpg',
};

export const starsTextureUrl = '/textures/2k_stars_milky_way.jpg';

export function formatNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + ' 亿';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + ' 百万';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'k';
  }
  return num.toString();
}

export function formatScientific(num: number): string {
  if (num === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const coefficient = num / Math.pow(10, exponent);
  return `${coefficient.toFixed(2)} × 10^${exponent}`;
}

export function calculateEllipsePosition(angle: number, semiMajorAxis: number, eccentricity: number): { x: number; z: number } {
  const a = semiMajorAxis;
  const b = a * Math.sqrt(1 - eccentricity * eccentricity);
  const c = a * eccentricity;
  
  const x = a * Math.cos(angle) - c;
  const z = b * Math.sin(angle);
  
  return { x, z };
}
