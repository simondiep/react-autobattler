export interface MonsterAttributes {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  attackSpeed: number;
  critChance: number;
  critDamage: number;
  dodgeChance: number;
  damageReduction: number;
  penetration: number;
  haste: number;
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  initialDelay: number;
  targetCount: number;
  targetSelf?: boolean;
  targetAllies?: boolean;
  execute: (self: BattleMonster, targets: BattleMonster[], battle: BattleState, timestamp: number) => AbilityResult;
}

export interface Ultimate {
  id: string;
  name: string;
  description: string;
  meterMax: number;
  targetCount: number;
  targetSelf?: boolean;
  targetAllies?: boolean;
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

export interface EquippableItem {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: number;
  statBonus?: Partial<MonsterAttributes>;
  specialEffect?: PassiveAbility;
  cost: number;
}

export interface ShopPassiveEntry {
  passive: PassiveAbility;
  cost: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  tier: number;
  baseAttributes: Omit<MonsterAttributes, 'hp' | 'maxHp'> & { hp: number };
  passive: PassiveAbility;
  abilities: [Ability, Ability];
  ultimate: Ultimate;
  emoji: string;
  color: string;
}

export interface BattleMonster {
  id: string;
  nickname: string;
  template: MonsterTemplate;
  attributes: MonsterAttributes;
  currentHp: number;
  ultimateMeter: number;
  abilityCooldowns: [number, number];
  abilityDelays: [number, number];
  isAlive: boolean;
  team: 'player' | 'enemy';
  lastAttackTime: number;
  mergeCount: number;
  equippedItem?: EquippableItem;
  extraPassives: PassiveAbility[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalHealing: number;
  kills: number;
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
  shield?: number;
  buff?: Partial<MonsterAttributes>;
  message: string;
}

export interface BattleLogEntry {
  timestamp: number;
  message: string;
  actorTeam: 'player' | 'enemy';
  isCrit?: boolean;
  isKill?: boolean;
  isUltimate?: boolean;
}

export interface BattleState {
  playerMonsters: BattleMonster[];
  enemyMonsters: BattleMonster[];
  log: BattleLogEntry[];
  isOver: boolean;
  winner?: 'player' | 'enemy';
  startTime: number;
  elapsedTime: number;
}

export interface TeamMonster {
  templateId: string;
  nickname: string;
  upgrades: Partial<MonsterAttributes>;
  mergeCount: number;
  equippedItemId?: string;
  extraPassiveIds: string[];
}

export interface GameState {
  gold: number;
  team: TeamMonster[];
  monsterInventory: Record<string, number>;
  unlockedMonsters: string[];
  ownedItemIds: string[];
  battleCount: number;
  totalLosses: number;
}
