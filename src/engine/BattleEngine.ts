import { BattleMonster, BattleState, GameState } from '../types/monster';
import { createBattleMonster, getMonsterById } from '../data/monsters';

const GAME_STORAGE_KEY = 'monster_autobattler_save';

export function loadGameState(): GameState {
  const saved = localStorage.getItem(GAME_STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    gold: 0,
    team: [],
    unlockedMonsters: [],
    upgrades: {},
    battleCount: 0,
  };
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(state));
}

export function initializeGame(): GameState {
  const state = loadGameState();
  if (state.unlockedMonsters.length === 0) {
    // No saved game, show starter selection
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
  };
  saveGameState(state);
  return state;
}

export function generateEnemies(battleCount: number): BattleMonster[] {
  const enemies: BattleMonster[] = [];
  const tier = Math.min(3, 1 + Math.floor(battleCount / 3));
  const count = Math.min(3, 1 + Math.floor(battleCount / 2));

  const availableMonsters = [
    ...Array(2).fill(null).map(() => {
      const templates = [
        getMonsterById('shadow_imp'),
        getMonsterById('flame_wolf'),
        getMonsterById('stone_titan'),
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }),
    ...Array(4).fill(null).map(() => {
      const templates = [
        getMonsterById('iron_knight'),
        getMonsterById('blood_vampire'),
        getMonsterById('frost_wyrm'),
        getMonsterById('venom_spider'),
        getMonsterById('thunder_eagle'),
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    }),
    ...Array(6).fill(null).map(() => {
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

  // Scale enemy stats based on battle count
  const statMultiplier = 1 + (battleCount * 0.08);

  for (let i = 0; i < count; i++) {
    const pool = availableMonsters.filter(m => m && m.tier <= tier);
    const template = pool[Math.floor(Math.random() * pool.length)];
    if (template) {
      const enemy = createBattleMonster(template, 'enemy');
      // Scale up enemy stats
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
  return state.team.map(id => {
    const template = getMonsterById(id);
    if (!template) return null;
    const upgrades = state.upgrades[id] || {};
    return createBattleMonster(template, 'player', upgrades);
  }).filter(Boolean) as BattleMonster[];
}

export function calculateDamage(
  attacker: BattleMonster,
  defender: BattleMonster
): { damage: number; isCrit: boolean; isDodged: boolean } {
  // Check dodge
  if (Math.random() < defender.attributes.dodgeChance) {
    return { damage: 0, isCrit: false, isDodged: true };
  }

  // Calculate base damage
  const baseDamage = attacker.attributes.attack;

  // Apply defense with penetration
  const effectiveDefense = defender.attributes.defense * (1 - attacker.attributes.penetration);
  const damageReduction = defender.attributes.damageReduction;
  const mitigation = effectiveDefense * 0.5 + baseDamage * damageReduction;
  let finalDamage = Math.max(1, baseDamage - mitigation);

  // Check crit
  const isCrit = Math.random() < attacker.attributes.critChance;
  if (isCrit) {
    finalDamage *= attacker.attributes.critDamage;
  }

  // Apply shield first if present
  if (defender.shield && defender.shield > 0) {
    const shieldAbsorb = Math.min(defender.shield, finalDamage);
    defender.shield -= shieldAbsorb;
    finalDamage -= shieldAbsorb;
  }

  return { damage: Math.floor(finalDamage), isCrit, isDodged: false };
}

export function getAliveMonsters(battle: BattleState, team: 'player' | 'enemy'): BattleMonster[] {
  return (team === 'player' ? battle.playerMonsters : battle.enemyMonsters).filter(m => m.isAlive);
}

export function selectTargets(
  self: BattleMonster,
  battle: BattleState,
  count: number
): BattleMonster[] {
  const enemyTeam = self.team === 'player' ? battle.enemyMonsters : battle.playerMonsters;
  const aliveEnemies = enemyTeam.filter(m => m.isAlive);

  if (count === 0) {
    return aliveEnemies;
  }

  // Target selection: prioritize low HP enemies
  const sorted = [...aliveEnemies].sort((a, b) => a.currentHp - b.currentHp);
  return sorted.slice(0, count);
}

export function processAttack(monster: BattleMonster, battle: BattleState, timestamp: number): string | null {
  if (!monster.isAlive || monster.stunned) return null;

  const attackInterval = 1000 / monster.attributes.attackSpeed;

  if (timestamp - monster.lastAttackTime < attackInterval) {
    return null;
  }

  const targets = selectTargets(monster, battle, 1);
  if (targets.length === 0) return null;

  const target = targets[0];
  const { damage, isCrit, isDodged } = calculateDamage(monster, target);

  if (isDodged) {
    monster.lastAttackTime = timestamp;
    return `${monster.template.name} attacks ${target.template.name} but they dodge!`;
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

  if (target.currentHp <= 0) {
    target.isAlive = false;
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

export function processAbility(monster: BattleMonster, battle: BattleState, abilityIndex: number): string | null {
  if (!monster.isAlive || monster.stunned) return null;

  const ability = monster.template.abilities[abilityIndex];

  // Check if still in initial delay
  if (monster.abilityDelays[abilityIndex] > 0) {
    return null;
  }

  // Check cooldown
  if (monster.abilityCooldowns[abilityIndex] > 0) {
    return null;
  }

  const targets = selectTargets(monster, battle, ability.targetCount);
  if (targets.length === 0) return null;

  // Store reference to battle for passive abilities
  monster._battle = battle;

  const result = ability.execute(monster, targets, battle);

  // Set cooldown with haste reduction
  const actualCooldown = ability.cooldown * (1 - monster.attributes.haste);
  monster.abilityCooldowns[abilityIndex] = actualCooldown;

  // Generate ultimate meter
  monster.ultimateMeter = Math.min(
    monster.template.ultimate.meterMax,
    monster.ultimateMeter + 15 + (result.damage || 0) * 0.1
  );

  return result.message;
}

export function processUltimate(monster: BattleMonster, battle: BattleState): string | null {
  if (!monster.isAlive || monster.stunned) return null;

  if (monster.ultimateMeter < monster.template.ultimate.meterMax) {
    return null;
  }

  const targets = selectTargets(monster, battle, monster.template.ultimate.targetCount);
  if (targets.length === 0) return null;

  monster._battle = battle;

  const result = monster.template.ultimate.execute(monster, targets, battle);

  // Reset meter and check for kills
  monster.ultimateMeter = 0;

  targets.forEach(target => {
    if (target.currentHp <= 0 && target.isAlive) {
      target.isAlive = false;
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

  // Apply passive start effects
  playerTeam.concat(enemyTeam).forEach(m => {
    if (m.template.passive.onApply) {
      m.template.passive.onApply(m);
    }
  });

  return battle;
}

export function checkBattleEnd(battle: BattleState): { isOver: boolean; winner?: 'player' | 'enemy' } {
  const playerAlive = battle.playerMonsters.some(m => m.isAlive);
  const enemyAlive = battle.enemyMonsters.some(m => m.isAlive);

  if (!playerAlive || !enemyAlive) {
    battle.isOver = true;
    battle.winner = playerAlive ? 'player' : 'enemy';
    return { isOver: true, winner: battle.winner };
  }

  return { isOver: false };
}
