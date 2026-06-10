export interface MonsterAttributes {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  attackSpeed: number; // attacks per second
  critChance: number; // 0-1
  critDamage: number; // multiplier e.g. 1.5 = 150%
  dodgeChance: number; // 0-1
  damageReduction: number; // 0-1
  penetration: number; // 0-1, ignores % defense
  haste: number; // reduces cooldowns by %
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number; // seconds
  initialDelay: number; // seconds before first cast
  targetCount: number; // 0 = all enemies, 1 = single, 2+ = multi
  targetAllies?: boolean; // if true, targets allies instead of enemies
  execute: (self: BattleMonster, targets: BattleMonster[], battle: BattleState, timestamp: number) => AbilityResult;
}

export interface Ultimate {
  id: string;
  name: string;
  description: string;
  meterMax: number;
  targetCount: number;
  targetAllies?: boolean; // if true, targets allies instead of enemies
  execute: (self: BattleMonster, targets: BattleMonster[], battle: BattleState, timestamp: number) => AbilityResult;
}

export interface PassiveAbility {
  id: string;
  name: string;
  description: string;
  onApply?: (self: BattleMonster) => void;
  onAttack?: (self: BattleMonster, target: BattleMonster, damage: number) => number;
  onHit?: (self: BattleMonster, attacker: BattleMonster, damage: number) => number;
  onKill?: (self: BattleMonster, victim: BattleMonster) => void;
  onDeath?: (self: BattleMonster, killer: BattleMonster) => void;
  onTurnStart?: (self: BattleMonster) => void;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  tier: number; // 1 = starter, 2, 3
  baseAttributes: Omit<MonsterAttributes, 'hp' | 'maxHp'> & { hp: number };
  passive: PassiveAbility;
  abilities: [Ability, Ability];
  ultimate: Ultimate;
  emoji: string;
  color: string;
}

export interface BattleMonster {
  id: string;
  template: MonsterTemplate;
  attributes: MonsterAttributes;
  currentHp: number;
  ultimateMeter: number;
  abilityCooldowns: [number, number]; // remaining cooldown for each ability
  abilityDelays: [number, number]; // initial delay remaining
  isAlive: boolean;
  team: 'player' | 'enemy';
  lastAttackTime: number;
  // Battle stats
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  kills: number;
  // Dynamic properties used by abilities
  stunned?: boolean;
  stunnedUntil?: number;
  shield?: number;
  hasShieldBonus?: boolean;
  hasRevived?: boolean;
  deathMarked?: boolean;
  attackCount?: number;
  _battle?: BattleState;
  ironWillActive?: boolean;
  damageImmune?: boolean;
  reflectDamage?: number;
  hydraResurrection?: boolean;
  // Buff tracking properties
  _infernoBuff?: number;
  _veilBoost?: number;
  _armorBoost?: number;
  _dissolveReduction?: number;
  _infernoDebuff?: number;
  _cloneBoost?: number;
  _stormAttackReduction?: number;
  dragonHits?: number;
  maxFury?: number;
  furyStacks?: number;
  _resurrected?: boolean;
  _rezBoost?: number;
  _curseDefReduction?: number;
  _aegisBoost?: number;
  shadowCount?: number;
  _voidReduction?: number;
  hitCounter?: number;
}

export interface AbilityResult {
  damage?: number;
  healing?: number;
  buff?: Partial<MonsterAttributes>;
  message: string;
}

export interface BattleState {
  playerMonsters: BattleMonster[];
  enemyMonsters: BattleMonster[];
  log: string[];
  isOver: boolean;
  winner?: 'player' | 'enemy';
  startTime: number;
}

export interface GameState {
  gold: number;
  team: string[]; // monster template ids (can have duplicates)
  unlockedMonsters: string[];
  upgrades: Record<string, Partial<MonsterAttributes>>;
  battleCount: number;
  totalLosses: number;
}
