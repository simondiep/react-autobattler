import { BattleMonster, BattleState, GameState } from '../types/monster';
import { createBattleMonster, getMonsterById } from '../data/monsters';

const GAME_STORAGE_KEY = 'monster_autobattler_save';

export function loadGameState(): GameState {
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    // Add default for missing fields (backwards compatibility)
    return {
      gold: 0,
      team: [],
      unlockedMonsters: [],
      upgrades: {},
      battleCount: 0,
      totalLosses: 0,
      ...parsed,
    };
  }
  return {
    gold: 0,
    team: [],
    unlockedMonsters: [],
    upgrades: {},
    battleCount: 0,
    totalLosses: 0,
  };
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
}

export function initializeGame(): GameState {
  const state = loadGameState();
  if (state.unlockedMonsters.length === 0) {
    return state;
  }
  return state;
}

export function startNewGame(starterId: string): GameState {
  const state: GameState = {
    gold: 100,
    team: [starterId],
    unlockedMonsters: [starterId],
    upgrades: {},
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
      const enemy = createBattleMonster(template, 'enemy');
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

export function createPlayerTeam(state: GameState): BattleMonster[] {
  return state.team.map((id, index) => {
    const template = getMonsterById(id);
    if (!template) return null;

    // Get unique upgrades key (index-based for duplicates)
    const upgradeKey = `${id}_${index}`;
    const upgrades = state.upgrades[upgradeKey] || state.upgrades[id] || {};

    const monster = createBattleMonster(template, 'player', upgrades);
    monster.id = `${id}-${index}-player`; // Unique ID for duplicates
    return monster;
  }).filter(Boolean) as BattleMonster[];
}

export function calculateDamage(
  attacker: BattleMonster,
  defender: BattleMonster,
  currentTimestamp: number
): { damage: number; isCrit: boolean; isDodged: boolean } {
  // Check if stunned
  if (attacker.stunnedUntil && attacker.stunnedUntil > currentTimestamp) {
    return { damage: 0, isCrit: false, isDodged: false };
  }

  // Check dodge
  if (Math.random() < defender.attributes.dodgeChance) {
    return { damage: 0, isCrit: false, isDodged: true };
  }

  // Check damage immune
  if (defender.damageImmune) {
    return { damage: 0, isCrit: false, isDodged: false };
  }

  let baseDamage = attacker.attributes.attack;

  const effectiveDefense = defender.attributes.defense * (1 - attacker.attributes.penetration);
  const damageReduction = defender.attributes.damageReduction;
  const mitigation = effectiveDefense * 0.5 + baseDamage * damageReduction;
  let finalDamage = Math.max(1, baseDamage - mitigation);

  const isCrit = Math.random() < attacker.attributes.critChance;
  if (isCrit) {
    finalDamage *= attacker.attributes.critDamage;
  }

  if (defender.shield && defender.shield > 0) {
    const shieldAbsorb = Math.min(defender.shield, finalDamage);
    defender.shield -= shieldAbsorb;
    finalDamage -= shieldAbsorb;
  }

  // Track damage dealt/taken
  attacker.totalDamageDealt += Math.floor(finalDamage);
  defender.totalDamageTaken += Math.floor(finalDamage);

  return { damage: Math.floor(finalDamage), isCrit, isDodged: false };
}

export function getAliveMonsters(battle: BattleState, team: 'player' | 'enemy'): BattleMonster[] {
  return (team === 'player' ? battle.playerMonsters : battle.enemyMonsters).filter(m => m.isAlive);
}

export function selectTargets(
  self: BattleMonster,
  battle: BattleState,
  count: number,
  targetAllies: boolean = false
): BattleMonster[] {
  // Determine which team to target
  let targetTeam: BattleMonster[];
  if (targetAllies) {
    targetTeam = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
  } else {
    targetTeam = self.team === 'player' ? battle.enemyMonsters : battle.playerMonsters;
  }

  const aliveTargets = targetTeam.filter(m => m.isAlive);

  if (count === 0) {
    return aliveTargets;
  }

  // Target selection: favor first enemy, then second, then third (by position)
  // This means targeting the front-most positions first
  return aliveTargets.slice(0, count);
}

export function selectAllyTargets(
  self: BattleMonster,
  battle: BattleState,
  count: number
): BattleMonster[] {
  const allyTeam = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
  const aliveAllies = allyTeam.filter(m => m.isAlive);

  if (count === 0) {
    return aliveAllies;
  }

  return aliveAllies.slice(0, count);
}

export function processAttack(monster: BattleMonster, battle: BattleState, timestamp: number): string | null {
  if (!monster.isAlive) return null;

  // Check stun using timestamp
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) {
    return null;
  }

  const attackInterval = 1000 / monster.attributes.attackSpeed;

  if (timestamp - monster.lastAttackTime < attackInterval) {
    return null;
  }

  const targets = selectTargets(monster, battle, 1);
  if (targets.length === 0) return null;

  const target = targets[0];
  const { damage, isCrit, isDodged } = calculateDamage(monster, target, timestamp);

  if (isDodged) {
    monster.lastAttackTime = timestamp;
    return `${monster.template.name} attacks ${target.template.name} but they dodge!`;
  }

  if (damage === 0) {
    monster.lastAttackTime = timestamp;
    return null;
  }

  target.currentHp = Math.max(0, target.currentHp - damage);

  // Trigger passive on hit
  if (monster.template.passive.onAttack) {
    monster.template.passive.onAttack(monster, target, damage);
  }
  if (target.template.passive.onHit) {
    target.template.passive.onHit(target, monster, damage);
  }

  // Generate ultimate meter
  monster.ultimateMeter = Math.min(
    monster.template.ultimate.meterMax,
    monster.ultimateMeter + 5 + damage * 0.05
  );

  monster.lastAttackTime = timestamp;

  // Track kill
  if (target.currentHp <= 0) {
    target.isAlive = false;
    monster.kills++;
    if (monster.template.passive.onKill) {
      monster.template.passive.onKill(monster, target);
    }
    if (target.template.passive.onDeath && !target.hasRevived) {
      target.template.passive.onDeath(target, monster);
    }
    return `${monster.template.name} ${isCrit ? 'CRITS' : 'attacks'} ${target.template.name} for ${damage} damage (SLAIN)!`;
  }

  return `${monster.template.name} ${isCrit ? 'CRITS' : 'attacks'} ${target.template.name} for ${damage} damage!`;
}

export function processAbility(monster: BattleMonster, battle: BattleState, abilityIndex: number, timestamp: number): string | null {
  if (!monster.isAlive) return null;

  // Check stun
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) {
    return null;
  }

  const ability = monster.template.abilities[abilityIndex];

  if (monster.abilityDelays[abilityIndex] > 0) {
    return null;
  }

  if (monster.abilityCooldowns[abilityIndex] > 0) {
    return null;
  }

  // Select targets - check if ability targets allies
  const targets = selectTargets(monster, battle, ability.targetCount, ability.targetAllies);
  if (targets.length === 0) return null;

  monster._battle = battle;

  const result = ability.execute(monster, targets, battle, timestamp);

  // Track damage dealt from abilities
  if (result.damage) {
    monster.totalDamageDealt += result.damage;
  }
  if (result.healing) {
    monster.totalHealing += result.healing;
  }

  const actualCooldown = ability.cooldown * (1 - monster.attributes.haste);
  monster.abilityCooldowns[abilityIndex] = actualCooldown;

  monster.ultimateMeter = Math.min(
    monster.template.ultimate.meterMax,
    monster.ultimateMeter + 15 + (result.damage || 0) * 0.1
  );

  return result.message;
}

export function processUltimate(monster: BattleMonster, battle: BattleState, timestamp: number): string | null {
  if (!monster.isAlive) return null;

  // Check stun
  if (monster.stunnedUntil && monster.stunnedUntil > timestamp) {
    return null;
  }

  if (monster.ultimateMeter < monster.template.ultimate.meterMax) {
    return null;
  }

  const targets = selectTargets(monster, battle, monster.template.ultimate.targetCount, monster.template.ultimate.targetAllies);
  if (targets.length === 0) return null;

  monster._battle = battle;

  const result = monster.template.ultimate.execute(monster, targets, battle, timestamp);

  monster.ultimateMeter = 0;

  // Track damage
  if (result.damage) {
    monster.totalDamageDealt += result.damage;
  }
  if (result.healing) {
    monster.totalHealing += result.healing;
  }

  // Check for kills
  targets.forEach(target => {
    if (target.currentHp <= 0 && target.isAlive) {
      target.isAlive = false;
      monster.kills++;
      if (monster.template.passive.onKill) {
        monster.template.passive.onKill(monster, target);
      }
      if (target.template.passive.onDeath && !target.hasRevived) {
        target.template.passive.onDeath(target, monster);
      }
    }
  });

  return `*** ${monster.template.name} uses ${monster.template.ultimate.name.toUpperCase()}! ***\n${result.message}`;
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
    log: ['Battle begins!'],
    isOver: false,
    startTime: Date.now(),
  };

  playerTeam.concat(enemyTeam).forEach(m => {
    if (m.template.passive.onApply) {
      m.template.passive.onApply(m);
    }
  });

  return battle;
}

// Helper to apply stun with proper duration
export function applyStun(monster: BattleMonster, durationMs: number, currentTimestamp: number): void {
  monster.stunned = true;
  monster.stunnedUntil = currentTimestamp + durationMs;
}

// Helper to apply healing
export function applyHealing(monster: BattleMonster, amount: number): number {
  const actualHeal = Math.min(amount, monster.attributes.maxHp - monster.currentHp);
  monster.currentHp += actualHeal;
  monster.totalHealing += actualHeal;
  return actualHeal;
}
