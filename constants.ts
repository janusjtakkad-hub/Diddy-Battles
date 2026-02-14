
import { WeaponType, CharacterConfig } from './types';

export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;
export const BALL_RADIUS = 22;
export const WEAPON_OFFSET = 38;
export const INITIAL_SPEED = 19.0; // Pushing the limit for hyper-fast action
export const MAX_TRAIL_POINTS = 25; // More trails for better motion blur at high speeds

export const CHARACTERS: Record<WeaponType, CharacterConfig> = {
  [WeaponType.NONE]: {
    id: WeaponType.NONE,
    name: 'Unarmed',
    color: '#94a3b8',
    description: 'Deals damage based on speed. Minimalist combat.',
    weaponName: 'Fists',
    baseDamage: 0
  },
  [WeaponType.SWORD]: {
    id: WeaponType.SWORD,
    name: 'Sword',
    color: '#ff3333',
    description: 'Relentless. Damage scales with every successful strike.',
    weaponName: 'Claymore',
    baseDamage: 2
  },
  [WeaponType.DAGGER]: {
    id: WeaponType.DAGGER,
    name: 'Dagger',
    color: '#33ff88',
    description: 'Lightweight. Standard rules apply.',
    weaponName: 'Stiletto',
    baseDamage: 5
  },
  [WeaponType.ATLAS]: {
    id: WeaponType.ATLAS,
    name: 'The Atlas',
    color: '#3388ff',
    description: 'Heavy knockback. Crushing power near walls.',
    weaponName: 'Globe',
    baseDamage: 8
  },
  [WeaponType.FIBONACCI]: {
    id: WeaponType.FIBONACCI,
    name: 'Fibonacci',
    color: '#cc33ff',
    description: 'Sequence-based damage: 1, 1, 2, 3, 5, 8, 13...',
    weaponName: 'Spiral',
    baseDamage: 1
  },
  [WeaponType.RATIO]: {
    id: WeaponType.RATIO,
    name: 'Ratio',
    color: '#ffcc33',
    description: 'Deals 12% of remaining HP. Merciless.',
    weaponName: 'Percentage',
    baseDamage: 0
  },
  [WeaponType.ALGEBRA]: {
    id: WeaponType.ALGEBRA,
    name: 'Algebra',
    color: '#33ccff',
    description: 'Damage = 2x + 6, where x is bounces.',
    weaponName: 'Variable X',
    baseDamage: 5
  },
  [WeaponType.KENDRICK]: {
    id: WeaponType.KENDRICK,
    name: 'Kendrick',
    color: '#ff3366',
    description: 'Pulitzer precision. 4th hit drops a massive burst.',
    weaponName: 'Crown',
    baseDamage: 4
  },
  [WeaponType.GOLDEN_RATIO]: {
    id: WeaponType.GOLDEN_RATIO,
    name: 'Golden Ratio',
    color: '#fbbf24',
    description: 'Precision. Damage scales by Φ (1.618) every hit.',
    weaponName: 'Phi Core',
    baseDamage: 6
  },
  [WeaponType.E_MC2]: {
    id: WeaponType.E_MC2,
    name: 'Einstein',
    color: '#ef4444',
    description: 'Relativity. Damage = Mass * Speed^2. High energy.',
    weaponName: 'Nuclear Core',
    baseDamage: 2
  },
  [WeaponType.DR_WHO]: {
    id: WeaponType.DR_WHO,
    name: 'The Doctor',
    color: '#2563eb',
    description: 'Timelord. Regenerates 15% HP every 5 hits.',
    weaponName: 'TARDIS',
    baseDamage: 12
  },
  [WeaponType.THEORIZATION]: {
    id: WeaponType.THEORIZATION,
    name: 'Universal Theory',
    color: '#8b5cf6',
    description: 'Conceptual. Damage increases with every elapsed second.',
    weaponName: 'Singularity',
    baseDamage: 4
  },
  [WeaponType.TIME_ITSELF]: {
    id: WeaponType.TIME_ITSELF,
    name: 'Time Itself',
    color: '#10b981',
    description: 'Unavoidable. Freezes the opponent for 0.5s on hit.',
    weaponName: 'Chronos',
    baseDamage: 10
  }
};

export const FIBONACCI_SEQ = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
