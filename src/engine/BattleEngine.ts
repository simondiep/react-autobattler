import { BattleMonster, BattleState, GameState, BattleLogEntry, EquippableItem } from '../types/monster';
import { createBattleMonster, getMonsterById } from '../data/monsters';
import { getItemById, SHOP_PASSIVE_ENTRIES } from '../data/items';

const GAME_STORAGE_KEY = 'monster_autobattler_save';

const ADJECTIVES = [
  'Shadow', 'Flame', 'Frost', 'Storm', 'Void', 'Crystal', 'Iron', 'Mystic',
  'Primal', 'Blazing', 'Icy', 'Lightning', 'Ancient', 'Cursed', 'Holy',
  'Dark', 'Bright', 'Raging', 'Silent', 'Savage'
];

const SUFFIXES = [
  'Fang', 'Claw', 'Strike', 'Wing', 'Blade', 'Heart', 'Mind', 'Soul',
  'Breaker', 'Slayer', 'Wrath', 'Guardian', 'Seeker', 'Caller', 'Master'
];

export function generateNickname(_templateName: string): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
  return `${adjective} ${suffix}`;
}

export function loadGameState(): GameState {
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      gold: 0,
      team: [],
      monsterInventory: {},
      unlockedMonsters: [],
      ownedItemIds: [],
      battleCount: 0,
      totalLosses: 0,
      ...parsed,
    };
  }
  return {
    gold: 0,
    team: [],
    monsterInventory: {},
    unlockedMonsters: [],
    ownedItemIds: [],
    battleCount: 0,
    totalLosses: 0,
  };
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
}

export function initializeGame(): GameState {
  return loadGameState();
}

export function startNewGame(starterId: string): GameState {
  const template = getMonsterById(starterId);
  if (!template) throw new Error(`Monster ${starterId} not found`);

  const state: GameState = {
    gold: 100,
    team: [{
      templateId: starterId,
      nickname: generateNickname(template.name),
      upgrades: {},
      mergeCount: 0,
      extraPassiveIds: [],
    }],
    monsterInventory: { [starterId]: 1 },
    unlockedMonsters: [starterId],
    ownedItemIds: [],
    battleCount: 0,
    totalLosses: 0,
  };
  saveGameState(state);
  return state;
}

export function generateEnemies(battleCount: number, _playerTeamSize: number): BattleMonster[] {
  const enemies: BattleMonster[] = [];
  const tier = Math.min(3, 1 + Math.floor(battleCount / 3));
  const count = Math.min(3, 1 + Math.floor(battleCount / 2));

  const availableMonsters = [
    ...Array(3).fill(null).map(() => {
      const templates = [
        getMonsterById('shadow_imp'),
        getMonsterById('flame_wolf'),
        getMonsterById('stone_titan'),
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }),
    ...Array(5).fill(null).map(() => {
      const templates = [
        getMonsterById('iron_knight'),
        getMonsterById('blood_vampire'),
        getMonsterById('frost_wyrm'),
        getMonsterById('venom_spider'),
        getMonsterById('thunder_eagle'),
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }),
    ...Array(8).fill(null).map(() => {
      const templates = [
        getMonsterById('chaos_hydra'),
        getMonsterById('storm_elemental'),
        getMonsterById('volcanic_titan'),
        getMonsterById('void_reaper'),
        getMonsterById('phoenix_lord'),
        getMonsterById('crystal_golem'),
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }),
  ].filter(Boolean);

  const statMultiplier = 1 + (battleCount * 0.08);

  for (let i = 0; i < count; i++) {
    const pool = availableMonsters.filter(m => m && m.tier <= tier);
    const template = pool[Math.floor(Math.random() * pool.length)];
    if (template) {
      const enemy = createBattleMonster(template, 'enemy', generateNickname(template.name));
      enemy.attributes.maxHp = Math.floor(enemy.attributes.maxHp * statMultiplier);
      enemy.attributes.hp = enemy.attributes.maxHp;
      enemy.attributes.attack = Math.floor(enemy.attributes.attack * statMultiplier);
      enemy.attributes.defense = Math.floor(enemy.attributes.defense * statMultiplier);
      enemy.currentHp = enemy.attributes.maxHp;
      enemies.push(enemy);
    }
  }

  return enemies;
}

// Stats stored as decimal fractions (0-1) in attributes but as integers in item data
const PCT_STATS = new Set(['critChance', 'critDamage', 'dodgeChance', 'damageReduction', 'penetration', 'haste']);

function normalizeItemBonus(key: string, value: number): number {
  if (PCT_STATS.has(key)) return value / 100;
  if (key === 'attackSpeed') return value / 10;
  return value;
}

export function createPlayerTeam(state: GameState): BattleMonster[] {
  return state.team.map((teamMonster, index) => {
    const template = getMonsterById(teamMonster.templateId);
    if (!template) return null;

    let equippedItem: EquippableItem | undefined;
    if (teamMonster.equippedItemId) {
      equippedItem = getItemById(teamMonster.equippedItemId);
    }

    const monster = createBattleMonster(
      template, 'player', teamMonster.nickname,
      teamMonster.mergeCount, equippedItem, teamMonster.upgrades
    );

    // Apply merge bonus (+10% per merge)
    if (teamMonster.mergeCount > 0) {
      const mult = 1 + (0.1 * teamMonster.mergeCount);
      monster.attributes.maxHp = Math.floor(monster.attributes.maxHp * mult);
      monster.attributes.hp = monster.attributes.maxHp;
      monster.attributes.attack = Math.floor(monster.attributes.attack * mult);
      monster.attributes.defense = Math.floor(monster.attributes.defense * mult);
      monster.currentHp = monster.attributes.maxHp;
    }

    // Apply item stat bonuses (normalized to attribute scale)
    if (equippedItem?.statBonus) {
      Object.entries(equippedItem.statBonus).forEach(([key, value]) => {
        if (value !== undefined) {
          const normalizedValue = normalizeItemBonus(key, value);
          if (key === 'hp' || key === 'maxHp') {
            monster.attributes.maxHp += normalizedValue;
            monster.currentHp = monster.attributes.maxHp;
          } else if (key in monster.attributes) {
            (monster.attributes as unknown as Record<string, number>)[key] += normalizedValue;
          }
        }
      });
    }

    // Load extra passives from IDs
    if (teamMonster.extraPassiveIds.length > 0) {
      monster.extraPassives = teamMonster.extraPassiveIds
        .map(id => SHOP_PASSIVE_ENTRIES.find(e => e.passive.id === id)?.passive)
        .filter(Boolean) as BattleMonster['extraPassives'];
    }

    monster.id = `${teamMonster.templateId}-${index}-player`;
    return monster;
  }).filter(Boolean) as BattleMonster[];
}

export function triggerTurnStart(monster: BattleMonster): void {
  const allPassives = [
    monster.template.passive,
    ...monster.extraPassives,
    ...(monster.equippedItem?.specialEffect ? [monster.equippedItem.specialEffect] : [])
  ];
  for (const passive of allPassives) {
    if (passive.onTurnStart) passive.onTurnStart(monster);
  }
}

export function calculateDamage(
  attacker: BattleMonster,
  defender: BattleMonster,
  currentTimestamp: number
): { damage: number; isCrit: boolean; isDodged: boolean } {
  if (attacker.stunnedUntil && attacker.stunnedUntil > currentTimestamp) {
    return { damage: 0, isCrit: false, isDodged: false };
  }

  if (Math.random() < defender.attributes.dodgeChance) {
    return { damage: 0, isCrit: false, isDodged: true };
  }

  if (defender.damageImmune) {
    return { damage: 0, isCrit: false, isDodged: false };
  }

  let baseDamage = attacker.attributes.attack;

  const effectiveDefense = defender.attributes.defense * (1 - attacker.attributes.penetration);
  const damageReduction = defender.attributes.damageReduction;
  const mitigation = effectiveDefense * 0.5 + baseDamage * damageReduction;
  let finalDamage = Math.max(0, baseDamage - mitigation);

  const isCrit = Math.random() < attacker.attributes.critChance;
  if (isCrit) {
    finalDamage *= attacker.attributes.critDamage;
  }

  finalDamage = Math.floor(finalDamage);

  // Shield absorbs damage first
  const preShieldDamage = finalDamage;
  if (defender.shield && defender.shield > 0) {
    const shieldAbsorb = Math.min(defender.shield, finalDamage);
    defender.shield -= shieldAbsorb;
    finalDamage -= shieldAbsorb;
  }

  // Track damage dealt (full amount before shield)
  attacker.totalDamageDealt += preShieldDamage;
  // Track HP damage taken (after shield)
  defender.totalDamageTaken += finalDamage;

  return { damage: finalDamage, isCrit, isDodged: false };
}

export function selectTargets(
  self: BattleMonster,
  battle: BattleState,
  count: number,
  targetAllies: boolean = false,
  targetSelf: boolean = false
): BattleMonster[] {
  if (targetSelf) return [self];

  let targetTeam: BattleMonster[];
  if (targetAllies) {
    targetTeam = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
  } else {
    targetTeam = self.team === 'player' ? battle.enemyMonsters : battle.playerMonsters;
  }

  const aliveTargets = targetTeam.filter(m => m.isAlive);
  if (count === 0) return aliveTargets;
  return aliveTargets.slice(0, count);
}

function triggerAllPassives(
  monster: BattleMonster,
  event: 'onAttack' | 'onHit' | 'onKill' | 'onDeath',
  other: BattleMonster,
  damage: number = 0
): void {
  const allPassives = [
    monster.template.passive,
    ...monster.extraPassives,
    ...(monster.equippedItem?.specialEffect ? [monster.equippedItem.specialEffect] : [])
  ];

  for (const passive of allPassives) {
    if (event === 'onAttack' && passive.onAttack) passive.onAttack(monster, other, damage);
    if (event === 'onHit' && passive.onHit) passive.onHit(monster, other, damage);
    if (event === 'onKill' && passive.onKill) passive.onKill(monster, other);
    if (event === 'onDeath' && passive.onDeath) passive.onDeath(monster, other);
  }
}

export function processAttack(monster: BattleMonster, battle: BattleState, timestamp: number): BattleLogEntry | null {
  if (!monster.isAlive) return null;
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) return null;

  const attackInterval = 1000 / monster.attributes.attackSpeed;
  if (timestamp - monster.lastAttackTime < attackInterval) return null;

  const targets = selectTargets(monster, battle, 1);
  if (targets.length === 0) return null;

  const target = targets[0];
  const { damage, isCrit, isDodged } = calculateDamage(monster, target, timestamp);

  monster.lastAttackTime = timestamp;

  if (isDodged) {
    return {
      timestamp: battle.elapsedTime,
      message: `${monster.nickname} attacks ${target.nickname} but they dodge!`,
      actorTeam: monster.team,
    };
  }

  if (damage === 0) return null;

  target.currentHp = Math.max(0, target.currentHp - damage);

  triggerAllPassives(monster, 'onAttack', target, damage);
  triggerAllPassives(target, 'onHit', monster, damage);

  // Flat action-based ultimate charging: +10 per attack, +8 for taking a hit
  monster.ultimateMeter = Math.min(monster.template.ultimate.meterMax, monster.ultimateMeter + 10);
  target.ultimateMeter = Math.min(target.template.ultimate.meterMax, target.ultimateMeter + 8);

  if (target.currentHp <= 0) {
    target.isAlive = false;
    monster.kills++;
    triggerAllPassives(monster, 'onKill', target);
    if (!target.hasRevived) triggerAllPassives(target, 'onDeath', monster);

    return {
      timestamp: battle.elapsedTime,
      message: `${monster.nickname} ${isCrit ? 'CRITS' : 'attacks'} ${target.nickname} for ${damage} damage (SLAIN)!`,
      actorTeam: monster.team,
      isCrit,
      isKill: true,
    };
  }

  return {
    timestamp: battle.elapsedTime,
    message: `${monster.nickname} ${isCrit ? 'CRITS' : 'attacks'} ${target.nickname} for ${damage} damage!`,
    actorTeam: monster.team,
    isCrit,
  };
}

export function processAbility(monster: BattleMonster, battle: BattleState, abilityIndex: number, timestamp: number): BattleLogEntry | null {
  if (!monster.isAlive) return null;
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) return null;

  const ability = monster.template.abilities[abilityIndex];

  if (monster.abilityDelays[abilityIndex] > 0) return null;
  if (monster.abilityCooldowns[abilityIndex] > 0) return null;

  const targets = selectTargets(monster, battle, ability.targetCount, ability.targetAllies, ability.targetSelf);
  if (targets.length === 0) return null;

  const preHp = targets.map(t => t.currentHp);
  monster._battle = battle;
  const result = ability.execute(monster, targets, battle, timestamp);

  // Track actual HP reduction on targets
  let totalDamageFromAbility = 0;
  targets.forEach((target, i) => {
    const hpDmg = Math.max(0, preHp[i] - target.currentHp);
    if (hpDmg > 0) {
      target.totalDamageTaken += hpDmg;
      totalDamageFromAbility += hpDmg;
    }
  });
  if (totalDamageFromAbility > 0) monster.totalDamageDealt += totalDamageFromAbility;
  if (result.healing) monster.totalHealing += result.healing;

  const actualCooldown = ability.cooldown * (1 - monster.attributes.haste);
  monster.abilityCooldowns[abilityIndex] = actualCooldown;

  // Flat +15 per ability use
  monster.ultimateMeter = Math.min(monster.template.ultimate.meterMax, monster.ultimateMeter + 15);

  return {
    timestamp: battle.elapsedTime,
    message: `${monster.nickname} uses ${ability.name} on ${targets.map(t => t.nickname).join(', ')}! ${result.message}`,
    actorTeam: monster.team,
  };
}

export function processUltimate(monster: BattleMonster, battle: BattleState, timestamp: number): BattleLogEntry | null {
  if (!monster.isAlive) return null;
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) return null;
  if (monster.ultimateMeter < monster.template.ultimate.meterMax) return null;

  const targets = selectTargets(monster, battle, monster.template.ultimate.targetCount, monster.template.ultimate.targetAllies, monster.template.ultimate.targetSelf);
  if (targets.length === 0) return null;

  // Capture HP before to calculate actual damage dealt by the ultimate
  const preHp = targets.map(t => t.currentHp);

  monster._battle = battle;
  const result = monster.template.ultimate.execute(monster, targets, battle, timestamp);
  monster.ultimateMeter = 0;

  // Calculate actual damage applied to targets
  let totalUltiDamage = 0;
  targets.forEach((target, i) => {
    const hpDamage = Math.max(0, preHp[i] - target.currentHp);
    totalUltiDamage += hpDamage;
    target.totalDamageTaken += hpDamage;
  });

  if (result.healing) monster.totalHealing += result.healing;
  monster.totalDamageDealt += totalUltiDamage;

  targets.forEach(target => {
    if (target.currentHp <= 0 && target.isAlive) {
      target.isAlive = false;
      monster.kills++;
      triggerAllPassives(monster, 'onKill', target);
      if (!target.hasRevived) triggerAllPassives(target, 'onDeath', monster);
    }
  });

  const dmgStr = totalUltiDamage > 0 ? ` (${totalUltiDamage} total damage)` : '';
  return {
    timestamp: battle.elapsedTime,
    message: `${monster.nickname} uses ${monster.template.ultimate.name.toUpperCase()}! ${result.message}${dmgStr}`,
    actorTeam: monster.team,
    isUltimate: true,
  };
}

export function updateCooldowns(deltaTime: number, monster: BattleMonster): void {
  monster.abilityDelays[0] = Math.max(0, monster.abilityDelays[0] - deltaTime);
  monster.abilityDelays[1] = Math.max(0, monster.abilityDelays[1] - deltaTime);
  monster.abilityCooldowns[0] = Math.max(0, monster.abilityCooldowns[0] - deltaTime);
  monster.abilityCooldowns[1] = Math.max(0, monster.abilityCooldowns[1] - deltaTime);
}

export function createBattle(playerTeam: BattleMonster[], enemyTeam: BattleMonster[]): BattleState {
  const battle: BattleState = {
    playerMonsters: playerTeam,
    enemyMonsters: enemyTeam,
    log: [{ timestamp: 0, message: 'Battle begins!', actorTeam: 'player' }],
    isOver: false,
    startTime: Date.now(),
    elapsedTime: 0,
  };

  playerTeam.concat(enemyTeam).forEach(m => {
    const allPassives = [
      m.template.passive,
      ...m.extraPassives,
      ...(m.equippedItem?.specialEffect ? [m.equippedItem.specialEffect] : [])
    ];
    for (const passive of allPassives) {
      if (passive.onApply) passive.onApply(m);
    }
  });

  return battle;
}

export function applyStun(monster: BattleMonster, durationMs: number, currentTimestamp: number): void {
  monster.stunned = true;
  monster.stunnedUntil = currentTimestamp + durationMs;
}

export function applyHealing(monster: BattleMonster, amount: number): number {
  const actualHeal = Math.min(amount, monster.attributes.maxHp - monster.currentHp);
  monster.currentHp += actualHeal;
  monster.totalHealing += actualHeal;
  return actualHeal;
}
