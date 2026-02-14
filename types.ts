
export enum WeaponType {
  NONE = 'NONE',
  SWORD = 'SWORD',
  DAGGER = 'DAGGER',
  ATLAS = 'ATLAS',
  FIBONACCI = 'FIBONACCI',
  RATIO = 'RATIO',
  ALGEBRA = 'ALGEBRA',
  KENDRICK = 'KENDRICK',
  GOLDEN_RATIO = 'GOLDEN_RATIO',
  E_MC2 = 'E_MC2',
  DR_WHO = 'DR_WHO',
  THEORIZATION = 'THEORIZATION',
  TIME_ITSELF = 'TIME_ITSELF'
}

export interface CharacterConfig {
  id: WeaponType;
  name: string;
  color: string;
  description: string;
  weaponName: string;
  baseDamage: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  friction: number;
  gravity: number;
}

export interface DamagePopup {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

export interface TrailPoint {
  x: number;
  y: number;
}

export interface BallState {
  id: 'player1' | 'player2';
  config: CharacterConfig;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  health: number;
  maxHealth: number;
  weaponAngle: number;
  weaponRotationSpeed: number;
  lastHitTime: number;
  currentDamageModifier: number;
  hitCount: number;
  trails: TrailPoint[];
}

export interface GameState {
  status: 'selection' | 'fighting' | 'ended';
  player1: BallState | null;
  player2: BallState | null;
  winner: string | null;
}
