import { MonsterTemplate, BattleMonster, MonsterAttributes, EquippableItem } from '../types/monster';

// Helper to create battle monster from template
export function createBattleMonster(
  template: MonsterTemplate,
  team: 'player' | 'enemy',
  nickname: string = template.name,
  mergeCount: number = 0,
  equippedItem?: EquippableItem,
  upgrades: Partial<MonsterTemplate['baseAttributes']> = {}
): BattleMonster {
  const base = template.baseAttributes;
  const upg = upgrades as Record<string, number>;
  const attrs = {
    ...base,
    hp: base.hp + (upg.hp || 0),
    maxHp: base.hp + (upg.hp || 0),
    attack: base.attack + (upg.attack || 0),
    defense: base.defense + (upg.defense || 0),
    attackSpeed: base.attackSpeed + (upg.attackSpeed || 0),
    critChance: base.critChance + (upg.critChance || 0),
    critDamage: base.critDamage + (upg.critDamage || 0),
    dodgeChance: base.dodgeChance + (upg.dodgeChance || 0),
    damageReduction: base.damageReduction + (upg.damageReduction || 0),
    penetration: base.penetration + (upg.penetration || 0),
    haste: base.haste + (upg.haste || 0),
  };

  return {
    id: `${template.id}-${team}-${Math.random().toString(36).substr(2, 9)}`,
    nickname,
    template,
    attributes: attrs as MonsterAttributes,
    currentHp: attrs.maxHp,
    ultimateMeter: 0,
    abilityCooldowns: [0, 0],
    abilityDelays: [template.abilities[0].initialDelay, template.abilities[1].initialDelay],
    isAlive: true,
    team,
    lastAttackTime: 0,
    mergeCount,
    equippedItem,
    extraPassives: [],
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    totalHealing: 0,
    kills: 0,
  };
}

// ========== STARTER MONSTERS ==========

export const SHADOW_IMP: MonsterTemplate = {
  id: 'shadow_imp',
  name: 'Shadow Imp',
  tier: 1,
  emoji: '👻',
  color: '#8B5CF6',
  baseAttributes: {
    hp: 800,
    attack: 65,
    defense: 20,
    attackSpeed: 1.4,
    critChance: 0.15,
    critDamage: 1.8,
    dodgeChance: 0.12,
    damageReduction: 0.05,
    penetration: 0.1,
    haste: 0.08,
  },
  passive: {
    id: 'shadow_step',
    name: 'Shadow Step',
    description: 'Gains 15% dodge chance for 3s after using an ability',
    onAttack: (self, _target, damage) => {
      if (Math.random() < 0.25) {
        self.attributes.dodgeChance = Math.min(0.5, self.attributes.dodgeChance + 0.15);
        setTimeout(() => {
          if (self.isAlive) self.attributes.dodgeChance -= 0.15;
        }, 3000);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'shadow_bolt',
      name: 'Shadow Bolt',
      description: 'Fires a dark bolt dealing 130% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.3);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Shadow Bolt hits ${target.template.name} for ${damage} damage!` };
      },
    },
    {
      id: 'phantom_strike',
      name: 'Phantom Strike',
      description: 'Strikes 2 enemies for 90% attack damage each',
      cooldown: 7,
      initialDelay: 4,
      targetCount: 2,
      execute: (self, targets) => {
        let totalDmg = 0;
        const messages: string[] = [];
        targets.slice(0, 2).forEach(target => {
          const damage = Math.floor(self.attributes.attack * 0.9);
          target.currentHp = Math.max(0, target.currentHp - damage);
          totalDmg += damage;
          messages.push(`${target.template.name} takes ${damage}`);
        });
        return { damage: totalDmg, message: `Phantom Strike: ${messages.join(', ')}!` };
      },
    },
  ],
  ultimate: {
    id: 'void_eruption',
    name: 'Void Eruption',
    description: 'Unleashes darkness on all enemies, dealing 200% attack damage',
    meterMax: 100,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage: damage * targets.length, message: `VOID ERUPTION! ${targets.length} enemies hit for ${damage} each!` };
    },
  },
};

export const FLAME_WOLF: MonsterTemplate = {
  id: 'flame_wolf',
  name: 'Flame Wolf',
  tier: 1,
  emoji: '🔥',
  color: '#EF4444',
  baseAttributes: {
    hp: 1000,
    attack: 80,
    defense: 25,
    attackSpeed: 1.1,
    critChance: 0.1,
    critDamage: 1.6,
    dodgeChance: 0.05,
    damageReduction: 0.08,
    penetration: 0.05,
    haste: 0.05,
  },
  passive: {
    id: 'burning_soul',
    name: 'Burning Soul',
    description: 'Attacks deal 15% bonus damage as burn over 3s',
    onAttack: (self, target, damage) => {
      const burnDmg = Math.floor(damage * 0.05);
      const burnTicks = 3;
      for (let i = 0; i < burnTicks; i++) {
        setTimeout(() => {
          if (target.isAlive && self.isAlive) {
            target.currentHp = Math.max(0, target.currentHp - burnDmg);
          }
        }, (i + 1) * 1000);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'fireball',
      name: 'Fireball',
      description: 'Hurls a fireball for 150% attack damage',
      cooldown: 4,
      initialDelay: 1.5,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.5);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Fireball scorches ${target.template.name} for ${damage}!` };
      },
    },
    {
      id: 'inferno_howl',
      name: 'Inferno Howl',
      description: 'Howls, increasing team attack by 25% for 5s',
      cooldown: 10,
      initialDelay: 3,
      targetCount: 0,
      targetAllies: true,
      execute: (self, _targets, battle) => {
        const allies = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
        allies.forEach(ally => {
          if (ally.isAlive) {
            const boost = Math.floor(ally.attributes.attack * 0.25);
            ally.attributes.attack += boost;
            ally._infernoBuff = (ally._infernoBuff || 0) + boost;
            setTimeout(() => {
              if (ally.isAlive && ally._infernoBuff) {
                ally.attributes.attack -= boost;
                ally._infernoBuff -= boost;
              }
            }, 5000);
          }
        });
        return { message: `Inferno Howl! Team attack +25% for 5s!` };
      },
    },
  ],
  ultimate: {
    id: 'inferno_apocalypse',
    name: 'Inferno Apocalypse',
    description: 'Engulfs all enemies in flames for 180% attack damage and applies burn',
    meterMax: 100,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 1.8);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        // Apply burn
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.1));
          }, (i + 1) * 1000);
        }
      });
      return { damage, message: `INFERNO APOCALYPSE! All enemies burning!` };
    },
  },
};

export const STONE_TITAN: MonsterTemplate = {
  id: 'stone_titan',
  name: 'Stone Titan',
  tier: 1,
  emoji: '🗿',
  color: '#78716C',
  baseAttributes: {
    hp: 1400,
    attack: 55,
    defense: 50,
    attackSpeed: 0.7,
    critChance: 0.05,
    critDamage: 1.5,
    dodgeChance: 0.02,
    damageReduction: 0.15,
    penetration: 0,
    haste: 0.03,
  },
  passive: {
    id: 'earthen_shield',
    name: 'Earthen Shield',
    description: 'When HP drops below 30%, gain 30% damage reduction for 5s (once per battle)',
    onHit: (self, _attacker, damage) => {
      if (self.currentHp < self.attributes.maxHp * 0.3 && !self.hasShieldBonus) {
        self.hasShieldBonus = true;
        self.attributes.damageReduction += 0.3;
        setTimeout(() => {
          if (self.isAlive) self.attributes.damageReduction -= 0.3;
        }, 5000);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'boulder_throw',
      name: 'Boulder Throw',
      description: 'Throws a massive boulder for 170% attack damage',
      cooldown: 6,
      initialDelay: 3,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.7);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Boulder Throw crushes ${target.template.name} for ${damage}!` };
      },
    },
    {
      id: 'earthquake',
      name: 'Earthquake',
      description: 'Shakes the ground, hitting all enemies for 80% attack damage',
      cooldown: 8,
      initialDelay: 5,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.8);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `EARTHQUAKE! All enemies hit for ${damage}!` };
      },
    },
  ],
  ultimate: {
    id: 'titanic_slam',
    name: 'Titanic Slam',
    description: 'Devastating slam dealing 250% attack damage to all, stunning for 1s',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets, _battle, timestamp) => {
      const damage = Math.floor(self.attributes.attack * 2.5);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunnedUntil = timestamp + 1000;
      });
      return { damage: damage * targets.length, message: `TITANIC SLAM! Massive damage!` };
    },
  },
};

// ========== TIER 2 MONSTERS ==========

export const IRON_KNIGHT: MonsterTemplate = {
  id: 'iron_knight',
  name: 'Iron Knight',
  tier: 2,
  emoji: '⚔️',
  color: '#94A3B8',
  baseAttributes: {
    hp: 1200,
    attack: 65,
    defense: 45,
    attackSpeed: 0.9,
    critChance: 0.08,
    critDamage: 1.6,
    dodgeChance: 0.04,
    damageReduction: 0.12,
    penetration: 0.08,
    haste: 0.04,
  },
  passive: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'When below 50% HP, gain +25% attack and defense',
    onHit: (self) => {
      if (self.currentHp < self.attributes.maxHp * 0.5 && !self.ironWillActive) {
        self.ironWillActive = true;
        self.attributes.attack = Math.floor(self.attributes.attack * 1.25);
        self.attributes.defense = Math.floor(self.attributes.defense * 1.25);
      }
      return 0;
    },
  },
  abilities: [
    {
      id: 'power_strike',
      name: 'Power Strike',
      description: 'Delivers a crushing blow for 160% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.6);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Power Strike crushes ${target.template.name} for ${damage}!` };
      },
    },
    {
      id: 'shield_bash',
      name: 'Shield Bash',
      description: 'Slams shield dealing 100% attack damage and stuns for 1.5s',
      cooldown: 8,
      initialDelay: 4,
      targetCount: 1,
      execute: (self, targets, _battle, timestamp) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.0);
        target.currentHp = Math.max(0, target.currentHp - damage);
        target.stunnedUntil = timestamp + 1500;
        return { damage, message: `Shield Bash stuns ${target.template.name} for 1.5s!` };
      },
    },
  ],
  ultimate: {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Becomes immune to damage for 3s and reflects 50% of attempted damage',
    meterMax: 100,
    targetCount: 0,
    targetSelf: true,
    execute: (self) => {
      self.damageImmune = true;
      self.reflectDamage = 0.5;
      setTimeout(() => {
        self.damageImmune = false;
        self.reflectDamage = 0;
      }, 3000);
      return { message: `UNBREAKABLE! Iron Knight becomes invulnerable!` };
    },
  },
};

export const BLOOD_VAMPIRE: MonsterTemplate = {
  id: 'blood_vampire',
  name: 'Blood Vampire',
  tier: 2,
  emoji: '🧛',
  color: '#BE123C',
  baseAttributes: {
    hp: 950,
    attack: 70,
    defense: 24,
    attackSpeed: 1.2,
    critChance: 0.14,
    critDamage: 1.85,
    dodgeChance: 0.1,
    damageReduction: 0.06,
    penetration: 0.1,
    haste: 0.09,
  },
  passive: {
    id: 'life_drain',
    name: 'Life Drain',
    description: 'Heals for 12% of damage dealt',
    onAttack: (self, _target, damage) => {
      const heal = Math.floor(damage * 0.12);
      self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
      return damage;
    },
  },
  abilities: [
    {
      id: 'blood_frenzy',
      name: 'Blood Frenzy',
      description: 'Attacks 3 times rapidly for 60% attack damage each, healing on each hit',
      cooldown: 7,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        let totalDmg = 0;
        for (let i = 0; i < 3; i++) {
          const dmg = Math.floor(self.attributes.attack * 0.6);
          totalDmg += dmg;
          const heal = Math.floor(dmg * 0.12);
          self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
          setTimeout(() => {
            if (target.isAlive) target.currentHp = Math.max(0, target.currentHp - dmg);
          }, i * 200);
        }
        return { damage: totalDmg, message: `Blood Frenzy tears into ${target.template.name}!` };
      },
    },
    {
      id: 'dark_transformation',
      name: 'Dark Transformation',
      description: 'Transforms into bat form, gaining +50% attack speed for 6s',
      cooldown: 12,
      initialDelay: 4,
      targetCount: 0,
      execute: (self) => {
        const boost = self.attributes.attackSpeed * 0.5;
        self.attributes.attackSpeed += boost;
        setTimeout(() => {
          if (self.isAlive) self.attributes.attackSpeed -= boost;
        }, 6000);
        return { message: `Dark Transformation! Attack speed +50%!` };
      },
    },
  ],
  ultimate: {
    id: 'crimson_nightmare',
    name: 'Crimson Nightmare',
    description: 'Drains life from all enemies for 150% attack damage, healing for 25% of damage dealt',
    meterMax: 110,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 1.5);
      let totalHeal = 0;
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        totalHeal += Math.floor(damage * 0.25);
      });
      self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + totalHeal);
      return { damage, message: `CRIMSON NIGHTMARE! Drains all enemies!` };
    },
  },
};

export const FROST_WYRM: MonsterTemplate = {
  id: 'frost_wyrm',
  name: 'Frost Wyrm',
  tier: 2,
  emoji: '🐉',
  color: '#06B6D4',
  baseAttributes: {
    hp: 1100,
    attack: 75,
    defense: 30,
    attackSpeed: 1.0,
    critChance: 0.12,
    critDamage: 1.7,
    dodgeChance: 0.06,
    damageReduction: 0.1,
    penetration: 0.08,
    haste: 0.06,
  },
  passive: {
    id: 'frost_armor',
    name: 'Frost Armor',
    description: '20% chance to freeze attacker for 0.5s when hit',
    onHit: (_self, attacker, _damage) => {
      if (Math.random() < 0.2 && attacker) {
        attacker.stunnedUntil = Date.now() + 500;
      }
      return 0;
    },
  },
  abilities: [
    {
      id: 'ice_breath',
      name: 'Ice Breath',
      description: 'Breathes ice for 140% attack damage to 2 enemies',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 2,
      execute: (self, targets, _battle, timestamp) => {
        let total = 0;
        targets.slice(0, 2).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 1.4);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          t.stunnedUntil = timestamp + 500;
          total += dmg;
        });
        return { damage: total, message: `Ice Breath freezes ${Math.min(2, targets.length)} foes!` };
      },
    },
    {
      id: 'blizzard',
      name: 'Blizzard',
      description: 'Summons a blizzard hitting all enemies for 70% attack damage',
      cooldown: 9,
      initialDelay: 4,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.7);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `Blizzard sweeps the battlefield!` };
      },
    },
  ],
  ultimate: {
    id: 'absolute_zero',
    name: 'Absolute Zero',
    description: 'Freezes all enemies in place for 220% attack damage',
    meterMax: 110,
    targetCount: 0,
    execute: (self, targets, _battle, timestamp) => {
      const damage = Math.floor(self.attributes.attack * 2.2);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunnedUntil = timestamp + 1500;
      });
      return { damage: damage * targets.length, message: `ABSOLUTE ZERO! Everything freezes for 1.5s!` };
    },
  },
};

export const VENOM_SPIDER: MonsterTemplate = {
  id: 'venom_spider',
  name: 'Venom Spider',
  tier: 2,
  emoji: '🕷️',
  color: '#22C55E',
  baseAttributes: {
    hp: 750,
    attack: 70,
    defense: 18,
    attackSpeed: 1.5,
    critChance: 0.18,
    critDamage: 1.9,
    dodgeChance: 0.15,
    damageReduction: 0.04,
    penetration: 0.12,
    haste: 0.1,
  },
  passive: {
    id: 'poison_fangs',
    name: 'Poison Fangs',
    description: 'Attacks poison target for 8% of damage over 4s',
    onAttack: (self, target, damage) => {
      const poisonTick = Math.floor(damage * 0.02);
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (target.isAlive && self.isAlive) {
            target.currentHp = Math.max(0, target.currentHp - poisonTick);
          }
        }, (i + 1) * 1000);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'venom_strike',
      name: 'Venom Strike',
      description: 'Bites for 120% attack damage, applies strong poison',
      cooldown: 4,
      initialDelay: 1.5,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.2);
        target.currentHp = Math.max(0, target.currentHp - damage);
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (target.isAlive) target.currentHp = Math.max(0, target.currentHp - Math.floor(self.attributes.attack * 0.08));
          }, (i + 1) * 1000);
        }
        return { damage, message: `Venom Strike envenoms ${target.template.name}!` };
      },
    },
    {
      id: 'web_trap',
      name: 'Web Trap',
      description: 'Traps 2 enemies, stunning them for 1s',
      cooldown: 8,
      initialDelay: 3,
      targetCount: 2,
      execute: (_self, targets, _battle, timestamp) => {
        targets.slice(0, 2).forEach(t => {
          t.stunnedUntil = timestamp + 1000;
        });
        return { message: `Web Trap catches ${Math.min(2, targets.length)} enemies for 1s!` };
      },
    },
  ],
  ultimate: {
    id: 'toxic_nova',
    name: 'Toxic Nova',
    description: 'Releases poison nova for 150% attack damage + 50% DOT for 5s on all enemies',
    meterMax: 90,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 1.5);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.1));
          }, (i + 1) * 1000);
        }
      });
      return { damage, message: `TOXIC NOVA! Everything is poisoned!` };
    },
  },
};

export const THUNDER_EAGLE: MonsterTemplate = {
  id: 'thunder_eagle',
  name: 'Thunder Eagle',
  tier: 2,
  emoji: '🦅',
  color: '#EAB308',
  baseAttributes: {
    hp: 850,
    attack: 85,
    defense: 22,
    attackSpeed: 1.3,
    critChance: 0.2,
    critDamage: 2.0,
    dodgeChance: 0.1,
    damageReduction: 0.05,
    penetration: 0.15,
    haste: 0.12,
  },
  passive: {
    id: 'static_charge',
    name: 'Static Charge',
    description: 'Every 3rd attack chains lightning to a second enemy for 50% damage',
    onAttack: (self, target, damage) => {
      self.attackCount = (self.attackCount || 0) + 1;
      if (self.attackCount % 3 === 0) {
        const enemies = self.team === 'player'
          ? self._battle?.enemyMonsters.filter(m => m.isAlive && m.id !== target.id)
          : self._battle?.playerMonsters.filter(m => m.isAlive && m.id !== target.id);
        if (enemies && enemies.length > 0) {
          const secondary = enemies[Math.floor(Math.random() * enemies.length)];
          const chainDmg = Math.floor(damage * 0.5);
          secondary.currentHp = Math.max(0, secondary.currentHp - chainDmg);
        }
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'thunder_clap',
      name: 'Thunder Clap',
      description: 'Claps wings for 130% attack damage to all enemies',
      cooldown: 6,
      initialDelay: 2,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 1.3);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `Thunder Clap shocks everyone!` };
      },
    },
    {
      id: 'lightning_dive',
      name: 'Lightning Dive',
      description: 'Dives at enemy for 200% attack damage with 30% crit chance bonus',
      cooldown: 7,
      initialDelay: 4,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const isCrit = Math.random() < (self.attributes.critChance + 0.3);
        let damage = Math.floor(self.attributes.attack * 2.0);
        if (isCrit) damage = Math.floor(damage * self.attributes.critDamage);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Lightning Dive ${isCrit ? 'CRITS' : 'hits'} ${target.template.name} for ${damage}!` };
      },
    },
  ],
  ultimate: {
    id: 'storm_of_zeus',
    name: 'Storm of Zeus',
    description: 'Calls down lightning on all enemies for 190% attack damage',
    meterMax: 100,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 1.9);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage: damage * targets.length, message: `STORM OF ZEUS! Lightning strikes all!` };
    },
  },
};

// ========== TIER 3 MONSTERS ==========

export const CHAOS_HYDRA: MonsterTemplate = {
  id: 'chaos_hydra',
  name: 'Chaos Hydra',
  tier: 3,
  emoji: '🐍',
  color: '#059669',
  baseAttributes: {
    hp: 1300,
    attack: 85,
    defense: 35,
    attackSpeed: 1.0,
    critChance: 0.12,
    critDamage: 1.75,
    dodgeChance: 0.08,
    damageReduction: 0.1,
    penetration: 0.12,
    haste: 0.07,
  },
  passive: {
    id: 'regeneration',
    name: 'Regeneration',
    description: 'Heals 2% max HP every second',
    onTurnStart: (self) => {
      const heal = Math.floor(self.attributes.maxHp * 0.02);
      self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
    },
  },
  abilities: [
    {
      id: 'triple_strike',
      name: 'Triple Strike',
      description: 'Attacks 3 different enemies for 100% attack damage each',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 3,
      execute: (self, targets) => {
        let total = 0;
        targets.slice(0, 3).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 1.0);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          total += dmg;
        });
        return { damage: total, message: `Triple Strike hits ${Math.min(3, targets.length)} enemies!` };
      },
    },
    {
      id: 'venom_breath',
      name: 'Venom Breath',
      description: 'Breathes poison on all enemies for 80% damage + poison over 4s',
      cooldown: 9,
      initialDelay: 4,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.8);
        targets.forEach(t => {
          t.currentHp = Math.max(0, t.currentHp - damage);
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.05));
            }, (i + 1) * 1000);
          }
        });
        return { damage: damage * targets.length, message: `Venom Breath poisons all!` };
      },
    },
  ],
  ultimate: {
    id: 'hydra_resurrection',
    name: 'Hydra Resurrection',
    description: 'If killed, revives at 50% HP with +20% all stats (once per battle)',
    meterMax: 150,
    targetCount: 0,
    execute: (self) => {
      self.hydraResurrection = true;
      return { message: `HYDRA RESURRECTION ready! Will revive once!` };
    },
  },
};

export const STORM_ELEMENTAL: MonsterTemplate = {
  id: 'storm_elemental',
  name: 'Storm Elemental',
  tier: 3,
  emoji: '⛈️',
  color: '#6366F1',
  baseAttributes: {
    hp: 1000,
    attack: 95,
    defense: 26,
    attackSpeed: 1.4,
    critChance: 0.18,
    critDamage: 2.1,
    dodgeChance: 0.12,
    damageReduction: 0.06,
    penetration: 0.18,
    haste: 0.14,
  },
  passive: {
    id: 'lightning_speed',
    name: 'Lightning Speed',
    description: 'Attacks have 10% chance to instantly trigger again',
    onAttack: (self, target, damage) => {
      if (Math.random() < 0.1) {
        const extraDmg = Math.floor(self.attributes.attack * 0.8);
        target.currentHp = Math.max(0, target.currentHp - extraDmg);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'chain_lightning',
      name: 'Chain Lightning',
      description: 'Lightning arcs through all enemies for 90% attack damage each',
      cooldown: 5,
      initialDelay: 1.5,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.9);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `Chain Lightning strikes all enemies!` };
      },
    },
    {
      id: 'thunderstorm',
      name: 'Thunderstorm',
      description: 'Calls storm dealing 60% attack damage to all for 3 consecutive hits',
      cooldown: 10,
      initialDelay: 4,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.6);
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            targets.forEach(t => {
              if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - damage);
            });
          }, i * 500);
        }
        return { damage, message: `THUNDERSTORM! Multiple lightning strikes!` };
      },
    },
  ],
  ultimate: {
    id: 'apocalypse_storm',
    name: 'Apocalypse Storm',
    description: 'Devastating storm for 250% attack damage to all, +50% crit damage',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets) => {
      const isCrit = Math.random() < self.attributes.critChance;
      let damage = Math.floor(self.attributes.attack * 2.5);
      if (isCrit) damage = Math.floor(damage * (self.attributes.critDamage + 0.5));
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage, message: `APOCALYPSE STORM ${isCrit ? 'CRITS' : 'strikes'} for massive damage!` };
    },
  },
};

export const VOLCANIC_TITAN: MonsterTemplate = {
  id: 'volcanic_titan',
  name: 'Volcanic Titan',
  tier: 3,
  emoji: '🌋',
  color: '#DC2626',
  baseAttributes: {
    hp: 1500,
    attack: 75,
    defense: 40,
    attackSpeed: 0.85,
    critChance: 0.1,
    critDamage: 1.7,
    dodgeChance: 0.04,
    damageReduction: 0.15,
    penetration: 0.08,
    haste: 0.06,
  },
  passive: {
    id: 'magma_blood',
    name: 'Magma Blood',
    description: 'When hit, deal 8% of damage taken back to attacker as fire damage',
    onHit: (_self, attacker, damage) => {
      if (attacker && damage > 0) {
        const reflected = Math.floor(damage * 0.08);
        attacker.currentHp = Math.max(0, attacker.currentHp - reflected);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'magma_burst',
      name: 'Magma Burst',
      description: 'Erupts magma for 180% attack damage to all enemies',
      cooldown: 7,
      initialDelay: 2,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 1.8);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `MAGMA BURST! Lava everywhere!` };
      },
    },
    {
      id: 'heat_wave',
      name: 'Heat Wave',
      description: 'Releases heat, dealing 60% attack damage and reducing enemy defense by 20%',
      cooldown: 9,
      initialDelay: 5,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.6);
        targets.forEach(t => {
          t.currentHp = Math.max(0, t.currentHp - damage);
          t.attributes.defense = Math.floor(t.attributes.defense * 0.8);
        });
        return { damage: damage * targets.length, message: `Heat Wave melts enemy defenses!` };
      },
    },
  ],
  ultimate: {
    id: 'caldera_explosion',
    name: 'Caldera Explosion',
    description: 'Massive eruption for 320% attack damage to all, applies heavy burn',
    meterMax: 130,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 3.2);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.15));
          }, (i + 1) * 1000);
        }
      });
      return { damage, message: `CALDERA EXPLOSION! VOLCANIC ANNIHILATION!` };
    },
  },
};

export const VOID_REAPER: MonsterTemplate = {
  id: 'void_reaper',
  name: 'Void Reaper',
  tier: 3,
  emoji: '💀',
  color: '#7C3AED',
  baseAttributes: {
    hp: 950,
    attack: 100,
    defense: 28,
    attackSpeed: 1.2,
    critChance: 0.22,
    critDamage: 2.2,
    dodgeChance: 0.08,
    damageReduction: 0.07,
    penetration: 0.2,
    haste: 0.15,
  },
  passive: {
    id: 'soul_harvest',
    name: 'Soul Harvest',
    description: 'Kills restore 10% max HP and grant +5% attack permanently (per battle)',
    onKill: (self) => {
      self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + self.attributes.maxHp * 0.1);
      self.attributes.attack = Math.floor(self.attributes.attack * 1.05);
    },
  },
  abilities: [
    {
      id: 'reap_souls',
      name: 'Reap Souls',
      description: 'Swings scythe for 160% attack damage to 2 enemies',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 2,
      execute: (self, targets) => {
        let total = 0;
        targets.slice(0, 2).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 1.6);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          total += dmg;
        });
        return { damage: total, message: `Reap Souls harvests ${Math.min(2, targets.length)} souls!` };
      },
    },
    {
      id: 'death_mark',
      name: 'Death Mark',
      description: 'Marks enemy, next attack deals 50% bonus damage',
      cooldown: 8,
      initialDelay: 3,
      targetCount: 1,
      execute: (_self, targets) => {
        const target = targets[0];
        target.deathMarked = true;
        setTimeout(() => { target.deathMarked = false; }, 10000);
        return { message: `Death Mark placed on ${target.template.name}!` };
      },
    },
  ],
  ultimate: {
    id: 'annihilation',
    name: 'Annihilation',
    description: 'Releases void energy for 280% attack damage to all, heals 20% per kill',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.8);
      let kills = 0;
      targets.forEach(t => {
        const before = t.currentHp;
        t.currentHp = Math.max(0, t.currentHp - damage);
        if (before > 0 && t.currentHp === 0) kills++;
      });
      if (kills > 0) {
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + self.attributes.maxHp * 0.2 * kills);
      }
      return { damage, message: `ANNIHILATION! Void consumes all!` };
    },
  },
};

export const PHOENIX_LORD: MonsterTemplate = {
  id: 'phoenix_lord',
  name: 'Phoenix Lord',
  tier: 3,
  emoji: '🔶',
  color: '#F97316',
  baseAttributes: {
    hp: 1050,
    attack: 90,
    defense: 32,
    attackSpeed: 1.1,
    critChance: 0.15,
    critDamage: 1.8,
    dodgeChance: 0.07,
    damageReduction: 0.12,
    penetration: 0.1,
    haste: 0.08,
  },
  passive: {
    id: 'rebirth',
    name: 'Rebirth',
    description: 'On death, revive at 30% HP once per battle',
    onDeath: (self, _killer) => {
      if (!self.hasRevived) {
        self.hasRevived = true;
        self.currentHp = Math.floor(self.attributes.maxHp * 0.3);
        self.isAlive = true;
      }
    },
  },
  abilities: [
    {
      id: 'flame_wave',
      name: 'Flame Wave',
      description: 'Sends wave of fire for 140% attack damage to all',
      cooldown: 6,
      initialDelay: 2,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 1.4);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `Flame Wave engulfs all enemies!` };
      },
    },
    {
      id: 'healing_ash',
      name: 'Healing Ash',
      description: 'Heals self for 25% max HP',
      cooldown: 10,
      initialDelay: 5,
      targetCount: 0,
      targetSelf: true,
      execute: (self) => {
        const healing = Math.floor(self.attributes.maxHp * 0.25);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + healing);
        return { healing, message: `Healing Ash restores ${healing} HP!` };
      },
    },
  ],
  ultimate: {
    id: 'supernova',
    name: 'Supernova',
    description: 'Explodes in brilliant fire for 240% attack damage to all, heals team 15%',
    meterMax: 130,
    targetCount: 0,
    execute: (self, targets, battle) => {
      const damage = Math.floor(self.attributes.attack * 2.4);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      const allies = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
      allies.forEach(a => {
        if (a.isAlive) {
          a.currentHp = Math.min(a.attributes.maxHp, a.currentHp + Math.floor(a.attributes.maxHp * 0.15));
        }
      });
      return { damage, message: `SUPERNOVA! Explosive rebirth!` };
    },
  },
};

export const CRYSTAL_GOLEM: MonsterTemplate = {
  id: 'crystal_golem',
  name: 'Crystal Golem',
  tier: 3,
  emoji: '💎',
  color: '#0EA5E9',
  baseAttributes: {
    hp: 1600,
    attack: 60,
    defense: 55,
    attackSpeed: 0.8,
    critChance: 0.08,
    critDamage: 1.6,
    dodgeChance: 0.03,
    damageReduction: 0.2,
    penetration: 0.05,
    haste: 0.05,
  },
  passive: {
    id: 'crystal_reflection',
    name: 'Crystal Reflection',
    description: '15% chance to reflect 40% damage back to attacker',
    onHit: (_self, attacker, damage) => {
      if (Math.random() < 0.15 && attacker) {
        const reflect = Math.floor(damage * 0.4);
        attacker.currentHp = Math.max(0, attacker.currentHp - reflect);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'crystal_spike',
      name: 'Crystal Spike',
      description: 'Launches spike for 180% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.8);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Crystal Spike pierces ${target.template.name}!` };
      },
    },
    {
      id: 'diamond_shield',
      name: 'Diamond Shield',
      description: 'Creates shield absorbing 200% max HP as damage for 4s',
      cooldown: 12,
      initialDelay: 5,
      targetCount: 0,
      targetSelf: true,
      execute: (self) => {
        const shieldAmount = Math.floor(self.attributes.maxHp * 2);
        self.shield = shieldAmount;
        setTimeout(() => { if (self.isAlive) self.shield = 0; }, 4000);
        return { shield: shieldAmount, message: `Diamond Shield activated!` };
      },
    },
  ],
  ultimate: {
    id: 'shatter_world',
    name: 'Shatter World',
    description: 'Devastating punch for 300% attack damage to all, ignoring 50% defense',
    meterMax: 140,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 3.0);
      targets.forEach(t => {
        // Ignore 50% defense calculation for ultimate
        const effectiveDef = t.attributes.defense * 0.5;
        const mitigated = Math.max(0, damage - effectiveDef);
        t.currentHp = Math.max(0, t.currentHp - mitigated);
      });
      return { damage, message: `SHATTER WORLD! Crystals shatter reality!` };
    },
  },
};

// ========== TIER 1 ADDITIONAL MONSTERS ==========

export const SPECTRAL_SHADE: MonsterTemplate = {
  id: 'spectral_shade',
  name: 'Spectral Shade',
  tier: 1,
  emoji: '👁️',
  color: '#A78BFA',
  baseAttributes: {
    hp: 700,
    attack: 70,
    defense: 15,
    attackSpeed: 1.6,
    critChance: 0.2,
    critDamage: 2.0,
    dodgeChance: 0.2,
    damageReduction: 0.03,
    penetration: 0.08,
    haste: 0.1,
  },
  passive: {
    id: 'ethereal_form',
    name: 'Ethereal Form',
    description: 'Takes 20% reduced damage from physical attacks',
    onHit: (_self, _attacker, damage) => {
      return Math.floor(damage * 0.8);
    },
  },
  abilities: [
    {
      id: 'spirit_lance',
      name: 'Spirit Lance',
      description: 'Hurls ethereal lance for 145% attack damage',
      cooldown: 4,
      initialDelay: 1.5,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.45);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Spirit Lance pierces ${target.template.name}!` };
      },
    },
    {
      id: 'spectral_veil',
      name: 'Spectral Veil',
      description: 'Becomes ethereal, gaining +30% dodge for 4s',
      cooldown: 8,
      initialDelay: 3,
      targetCount: 0,
      targetAllies: true,
      execute: (self) => {
        const boost = self.attributes.dodgeChance * 0.3;
        self.attributes.dodgeChance += boost;
        self._veilBoost = boost;
        setTimeout(() => {
          if (self.isAlive && self._veilBoost) {
            self.attributes.dodgeChance -= self._veilBoost;
            self._veilBoost = 0;
          }
        }, 4000);
        return { message: `Spectral Veil! Dodge +30% for 4s!` };
      },
    },
  ],
  ultimate: {
    id: 'wraith_form',
    name: 'Wraith Form',
    description: 'Transforms into wraith for 200% attack damage, gains 50% dodge for 2s',
    meterMax: 100,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.0);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      self.attributes.dodgeChance = Math.min(0.9, self.attributes.dodgeChance + 0.5);
      setTimeout(() => {
        if (self.isAlive) self.attributes.dodgeChance = Math.max(0.1, self.attributes.dodgeChance - 0.5);
      }, 2000);
      return { damage: damage * targets.length, message: `WRAITH FORM! Intangible for 2s!` };
    },
  },
};

export const STONE_GOLEM: MonsterTemplate = {
  id: 'stone_golem',
  name: 'Stone Golem',
  tier: 1,
  emoji: '🪨',
  color: '#92400E',
  baseAttributes: {
    hp: 1200,
    attack: 50,
    defense: 45,
    attackSpeed: 0.6,
    critChance: 0.03,
    critDamage: 1.4,
    dodgeChance: 0.01,
    damageReduction: 0.2,
    penetration: 0,
    haste: 0.02,
  },
  passive: {
    id: 'rocky_skin',
    name: 'Rocky Skin',
    description: 'Every 3 hits received restores 5% max HP',
    onHit: (self, _attacker, _damage) => {
      self.hitCounter = (self.hitCounter || 0) + 1;
      if (self.hitCounter % 3 === 0) {
        const heal = Math.floor(self.attributes.maxHp * 0.05);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
      }
      return 0;
    },
  },
  abilities: [
    {
      id: 'stone_fist',
      name: 'Stone Fist',
      description: 'Punches for 160% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.6);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Stone Fist crushes ${target.template.name}!` };
      },
    },
    {
      id: 'rock_armor',
      name: 'Rock Armor',
      description: 'Hardens skin, gaining +40% defense for 5s',
      cooldown: 10,
      initialDelay: 4,
      targetCount: 0,
      targetAllies: true,
      execute: (self) => {
        const boost = Math.floor(self.attributes.defense * 0.4);
        self.attributes.defense += boost;
        self._armorBoost = boost;
        setTimeout(() => {
          if (self.isAlive && self._armorBoost) {
            self.attributes.defense -= self._armorBoost;
            self._armorBoost = 0;
          }
        }, 5000);
        return { message: `Rock Armor! Defense +40% for 5s!` };
      },
    },
  ],
  ultimate: {
    id: 'bedrock_slam',
    name: 'Bedrock Slam',
    description: 'Massive slam for 240% attack damage, stuns all for 2s',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.4);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunned = true;
        setTimeout(() => { t.stunned = false; }, 2000);
      });
      return { damage: damage * targets.length, message: `BEDROCK SLAM! Stuns all for 2s!` };
    },
  },
};

export const ACID_SLIME: MonsterTemplate = {
  id: 'acid_slime',
  name: 'Acid Slime',
  tier: 1,
  emoji: '🟢',
  color: '#84CC16',
  baseAttributes: {
    hp: 850,
    attack: 60,
    defense: 20,
    attackSpeed: 1.2,
    critChance: 0.08,
    critDamage: 1.5,
    dodgeChance: 0.06,
    damageReduction: 0.05,
    penetration: 0.15,
    haste: 0.07,
  },
  passive: {
    id: 'corrosive_body',
    name: 'Corrosive Body',
    description: 'Melee attackers take 10% of damage as acid damage',
    onHit: (_self, attacker, damage) => {
      if (attacker) {
        const acid = Math.floor(damage * 0.1);
        attacker.currentHp = Math.max(0, attacker.currentHp - acid);
      }
      return 0;
    },
  },
  abilities: [
    {
      id: 'acid_spit',
      name: 'Acid Spit',
      description: 'Spits acid for 130% attack damage',
      cooldown: 4,
      initialDelay: 1.5,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.3);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Acid Spit melts ${target.template.name}!` };
      },
    },
    {
      id: 'dissolve',
      name: 'Dissolve',
      description: 'Dissolves target armor, reducing defense by 30% for 6s',
      cooldown: 9,
      initialDelay: 3,
      targetCount: 1,
      execute: (_self, targets) => {
        const target = targets[0];
        const reduction = Math.floor(target.attributes.defense * 0.3);
        target.attributes.defense -= reduction;
        target._dissolveReduction = (target._dissolveReduction || 0) + reduction;
        setTimeout(() => {
          if (target.isAlive && target._dissolveReduction) {
            target.attributes.defense += reduction;
            target._dissolveReduction -= reduction;
          }
        }, 6000);
        return { message: `Dissolve reduces ${target.template.name}'s defense!` };
      },
    },
  ],
  ultimate: {
    id: 'toxic_flood',
    name: 'Toxic Flood',
    description: 'Floods battlefield with acid for 200% attack damage to all',
    meterMax: 110,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.0);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.12));
          }, (i + 1) * 1000);
        }
      });
      return { damage: damage * targets.length, message: `TOXIC FLOOD! Everything melts!` };
    },
  },
};

// ========== TIER 2 ADDITIONAL MONSTERS ==========

export const BONE_ARCHER: MonsterTemplate = {
  id: 'bone_archer',
  name: 'Bone Archer',
  tier: 2,
  emoji: '🏹',
  color: '#78350F',
  baseAttributes: {
    hp: 900,
    attack: 80,
    defense: 20,
    attackSpeed: 1.4,
    critChance: 0.22,
    critDamage: 2.1,
    dodgeChance: 0.08,
    damageReduction: 0.04,
    penetration: 0.15,
    haste: 0.1,
  },
  passive: {
    id: 'piercing_shots',
    name: 'Piercing Shots',
    description: 'Attacks ignore 15% of enemy defense',
    onAttack: (_self, _target, damage) => {
      return Math.floor(damage * 1.15);
    },
  },
  abilities: [
    {
      id: 'arrow_volley',
      name: 'Arrow Volley',
      description: 'Shoots 3 arrows at 2 enemies for 85% attack damage each',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 2,
      execute: (self, targets) => {
        let total = 0;
        targets.slice(0, 2).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 0.85 * 1.15);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          total += dmg;
        });
        return { damage: total, message: `Arrow Volley hits 2 enemies!` };
      },
    },
    {
      id: 'multishot',
      name: 'Multishot',
      description: 'Rapid fires for 70% attack damage to all',
      cooldown: 8,
      initialDelay: 3,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.7 * 1.15);
        targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
        return { damage: damage * targets.length, message: `Multishot rains arrows!` };
      },
    },
  ],
  ultimate: {
    id: 'ancient_barrage',
    name: 'Ancient Barrage',
    description: 'Ancient arrows rain down for 210% attack damage to all',
    meterMax: 100,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.1 * 1.15);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage: damage * targets.length, message: `ANCIENT BARRAGE! Arrows everywhere!` };
    },
  },
};

export const INFERNAL_DEMON: MonsterTemplate = {
  id: 'infernal_demon',
  name: 'Infernal Demon',
  tier: 2,
  emoji: '😈',
  color: '#EF4444',
  baseAttributes: {
    hp: 1100,
    attack: 85,
    defense: 28,
    attackSpeed: 1.2,
    critChance: 0.16,
    critDamage: 1.9,
    dodgeChance: 0.07,
    damageReduction: 0.08,
    penetration: 0.12,
    haste: 0.09,
  },
  passive: {
    id: 'hellfire_aura',
    name: 'Hellfire Aura',
    description: 'Nearby enemies take 5% extra damage from all sources',
    onAttack: (_self, target, damage) => {
      target._infernoDebuff = (target._infernoDebuff || 0) + 1;
      return damage;
    },
  },
  abilities: [
    {
      id: 'demon_strike',
      name: 'Demon Strike',
      description: 'Strikes for 155% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.55);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Demon Strike burns ${target.template.name}!` };
      },
    },
    {
      id: 'hellfire_blast',
      name: 'Hellfire Blast',
      description: 'Blasts 2 enemies for 125% attack damage each, applies burn',
      cooldown: 7,
      initialDelay: 3,
      targetCount: 2,
      execute: (self, targets) => {
        let total = 0;
        targets.slice(0, 2).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 1.25);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          for (let i = 0; i < 2; i++) {
            setTimeout(() => {
              if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.1));
            }, (i + 1) * 1000);
          }
          total += dmg;
        });
        return { damage: total, message: `Hellfire Blast incinerates enemies!` };
      },
    },
  ],
  ultimate: {
    id: 'infernal_rage',
    name: 'Infernal Rage',
    description: 'Unleashes rage for 260% attack damage to all, stuns for 1s',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets, _battle, timestamp) => {
      const damage = Math.floor(self.attributes.attack * 2.6);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunnedUntil = timestamp + 1000;
      });
      return { damage: damage * targets.length, message: `INFERNAL RAGE! Stuns all for 1s!` };
    },
  },
};

export const SHADOW_ASSASSIN: MonsterTemplate = {
  id: 'shadow_assassin',
  name: 'Shadow Assassin',
  tier: 2,
  emoji: '🗡️',
  color: '#1F2937',
  baseAttributes: {
    hp: 800,
    attack: 90,
    defense: 18,
    attackSpeed: 1.5,
    critChance: 0.25,
    critDamage: 2.3,
    dodgeChance: 0.12,
    damageReduction: 0.03,
    penetration: 0.18,
    haste: 0.13,
  },
  passive: {
    id: 'backstab',
    name: 'Backstab',
    description: '20% chance to deal 100% bonus damage on critical hits',
    onAttack: (self, _target, damage) => {
      if (Math.random() < 0.2 && Math.random() < self.attributes.critChance) {
        return Math.floor(damage * 2.0);
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'quick_strike',
      name: 'Quick Strike',
      description: 'Rapid strike for 140% attack damage',
      cooldown: 3,
      initialDelay: 1,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const isCrit = Math.random() < self.attributes.critChance;
        let damage = Math.floor(self.attributes.attack * 1.4);
        if (isCrit) damage = Math.floor(damage * self.attributes.critDamage);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Quick Strike ${isCrit ? 'CRITS' : 'hits'} ${target.template.name}!` };
      },
    },
    {
      id: 'shadow_clone',
      name: 'Shadow Clone',
      description: 'Creates clone, gaining +35% attack for 4s',
      cooldown: 10,
      initialDelay: 4,
      targetCount: 0,
      targetAllies: true,
      execute: (self) => {
        const boost = Math.floor(self.attributes.attack * 0.35);
        self.attributes.attack += boost;
        self._cloneBoost = boost;
        setTimeout(() => {
          if (self.isAlive && self._cloneBoost) {
            self.attributes.attack -= self._cloneBoost;
            self._cloneBoost = 0;
          }
        }, 4000);
        return { message: `Shadow Clone! Attack +35% for 4s!` };
      },
    },
  ],
  ultimate: {
    id: 'death_from_shadows',
    name: 'Death from Shadows',
    description: 'Emerges from shadows for 240% attack damage, +30% crit chance for 3s',
    meterMax: 100,
    targetCount: 1,
    execute: (self, targets) => {
      const target = targets[0];
      const isCrit = Math.random() < (self.attributes.critChance + 0.3);
      let damage = Math.floor(self.attributes.attack * 2.4);
      if (isCrit) damage = Math.floor(damage * self.attributes.critDamage);
      target.currentHp = Math.max(0, target.currentHp - damage);
      self.attributes.critChance = Math.min(0.9, self.attributes.critChance + 0.3);
      setTimeout(() => {
        if (self.isAlive) self.attributes.critChance = Math.max(0.1, self.attributes.critChance - 0.3);
      }, 3000);
      return { damage, message: `DEATH FROM SHADOWS! ${isCrit ? 'CRITICAL HIT' : 'Strikes'}!` };
    },
  },
};

export const ICE_ELEMENTALIST: MonsterTemplate = {
  id: 'ice_elementalist',
  name: 'Ice Elementalist',
  tier: 2,
  emoji: '❄️',
  color: '#38BDF8',
  baseAttributes: {
    hp: 900,
    attack: 78,
    defense: 24,
    attackSpeed: 1.15,
    critChance: 0.12,
    critDamage: 1.7,
    dodgeChance: 0.08,
    damageReduction: 0.09,
    penetration: 0.09,
    haste: 0.08,
  },
  passive: {
    id: 'frozen_shards',
    name: 'Frozen Shards',
    description: 'Attacks have 15% chance to freeze target for 0.5s',
    onAttack: (_self, target, _damage) => {
      if (Math.random() < 0.15) {
        target.stunnedUntil = Date.now() + 500;
      }
      return 0;
    },
  },
  abilities: [
    {
      id: 'icicle_spear',
      name: 'Icicle Spear',
      description: 'Launches spear for 145% attack damage, freezes for 1s',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets, _battle, timestamp) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.45);
        target.currentHp = Math.max(0, target.currentHp - damage);
        target.stunnedUntil = timestamp + 1000;
        return { damage, message: `Icicle Spear freezes ${target.template.name} for 1s!` };
      },
    },
    {
      id: 'polar_storm',
      name: 'Polar Storm',
      description: 'Summons storm for 75% attack damage to all, reduces attack by 25%',
      cooldown: 8,
      initialDelay: 4,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 0.75);
        targets.forEach(t => {
          t.currentHp = Math.max(0, t.currentHp - damage);
          t.attributes.attack = Math.floor(t.attributes.attack * 0.75);
          t._stormAttackReduction = (t._stormAttackReduction || 0) + 1;
          setTimeout(() => {
            if (t.isAlive && t._stormAttackReduction) {
              t.attributes.attack = Math.floor(t.attributes.attack / 0.75);
              t._stormAttackReduction--;
            }
          }, 6000);
        });
        return { damage: damage * targets.length, message: `Polar Storm freezes enemies in place!` };
      },
    },
  ],
  ultimate: {
    id: 'glacial_eruption',
    name: 'Glacial Eruption',
    description: 'Ice erupts for 230% attack damage to all, stuns for 2s',
    meterMax: 120,
    targetCount: 0,
    execute: (self, targets, _battle, timestamp) => {
      const damage = Math.floor(self.attributes.attack * 2.3);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunnedUntil = timestamp + 2000;
      });
      return { damage: damage * targets.length, message: `GLACIAL ERUPTION! Freezes all for 2s!` };
    },
  },
};

// ========== TIER 3 ADDITIONAL MONSTERS ==========

export const DRAGON_LORD: MonsterTemplate = {
  id: 'dragon_lord',
  name: 'Dragon Lord',
  tier: 3,
  emoji: '🐲',
  color: '#991B1B',
  baseAttributes: {
    hp: 1400,
    attack: 105,
    defense: 38,
    attackSpeed: 1.0,
    critChance: 0.18,
    critDamage: 2.0,
    dodgeChance: 0.06,
    damageReduction: 0.12,
    penetration: 0.15,
    haste: 0.08,
  },
  passive: {
    id: 'dragon_fury',
    name: 'Dragon Fury',
    description: 'Every 2 hits dealt increase attack by 10% (max 50%)',
    onAttack: (self, _target, damage) => {
      self.dragonHits = (self.dragonHits || 0) + 1;
      if (self.dragonHits % 2 === 0 && !self.maxFury) {
        self.furyStacks = (self.furyStacks || 0) + 1;
        if (self.furyStacks < 6) {
          self.attributes.attack = Math.floor(self.attributes.attack * 1.1);
        }
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'dragon_claw',
      name: 'Dragon Claw',
      description: 'Slashes for 165% attack damage',
      cooldown: 4,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.65);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Dragon Claw slashes ${target.template.name}!` };
      },
    },
    {
      id: 'dragon_breath',
      name: 'Dragon Breath',
      description: 'Breathes fire for 110% attack damage to all, applies burn',
      cooldown: 8,
      initialDelay: 3,
      targetCount: 0,
      execute: (self, targets) => {
        const damage = Math.floor(self.attributes.attack * 1.1);
        targets.forEach(t => {
          t.currentHp = Math.max(0, t.currentHp - damage);
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              if (t.isAlive) t.currentHp = Math.max(0, t.currentHp - Math.floor(self.attributes.attack * 0.08));
            }, (i + 1) * 1000);
          }
        });
        return { damage: damage * targets.length, message: `Dragon Breath scorches all!` };
      },
    },
  ],
  ultimate: {
    id: 'apocalyptic_wrath',
    name: 'Apocalyptic Wrath',
    description: 'Dragons crash down for 300% attack damage to all',
    meterMax: 140,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 3.0);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage: damage * targets.length, message: `APOCALYPTIC WRATH! Dragons descend!` };
    },
  },
};

export const LICH_OVERLORD: MonsterTemplate = {
  id: 'lich_overlord',
  name: 'Lich Overlord',
  tier: 3,
  emoji: '💀',
  color: '#6B21A8',
  baseAttributes: {
    hp: 1000,
    attack: 95,
    defense: 32,
    attackSpeed: 1.15,
    critChance: 0.14,
    critDamage: 1.8,
    dodgeChance: 0.08,
    damageReduction: 0.1,
    penetration: 0.12,
    haste: 0.1,
  },
  passive: {
    id: 'death_aura',
    name: 'Death Aura',
    description: 'Enemies take 8% increased damage, Lich heals for 3% of damage dealt',
    onAttack: (self, _target, damage) => {
      const heal = Math.floor(damage * 0.03);
      self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
      return damage;
    },
  },
  abilities: [
    {
      id: 'death_bolt',
      name: 'Death Bolt',
      description: 'Launches bolt for 155% attack damage, drains 10% HP to self',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.55);
        target.currentHp = Math.max(0, target.currentHp - damage);
        const drain = Math.floor(target.attributes.maxHp * 0.1);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + drain);
        return { damage, message: `Death Bolt drains ${target.template.name}!` };
      },
    },
    {
      id: 'unholy_resurrection',
      name: 'Unholy Resurrection',
      description: 'Revives fallen allies and buffs team attack by 20% for 5s',
      cooldown: 15,
      initialDelay: 5,
      targetCount: 0,
      targetAllies: true,
      execute: (self, _targets, battle) => {
        const allies = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
        let revived = 0;
        allies.forEach(ally => {
          if (!ally.isAlive && !ally._resurrected) {
            ally.isAlive = true;
            ally.currentHp = Math.floor(ally.attributes.maxHp * 0.4);
            ally._resurrected = true;
            revived++;
          }
          if (ally.isAlive) {
            const boost = Math.floor(ally.attributes.attack * 0.2);
            ally.attributes.attack += boost;
            ally._rezBoost = (ally._rezBoost || 0) + boost;
            setTimeout(() => {
              if (ally.isAlive && ally._rezBoost) {
                ally.attributes.attack -= boost;
                ally._rezBoost -= boost;
              }
            }, 5000);
          }
        });
        return { message: `Unholy Resurrection! Revived ${revived} allies, +20% attack for 5s!` };
      },
    },
  ],
  ultimate: {
    id: 'curse_of_the_lich',
    name: 'Curse of the Lich',
    description: 'Curses all for 270% attack damage, reduces defense by 40% for 4s',
    meterMax: 130,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.7);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        const defReduction = Math.floor(t.attributes.defense * 0.4);
        t.attributes.defense -= defReduction;
        t._curseDefReduction = (t._curseDefReduction || 0) + defReduction;
        setTimeout(() => {
          if (t.isAlive && t._curseDefReduction) {
            t.attributes.defense += defReduction;
            t._curseDefReduction -= defReduction;
          }
        }, 4000);
      });
      return { damage: damage * targets.length, message: `CURSE OF THE LICH! All cursed!` };
    },
  },
};

export const CELESTIAL_GUARDIAN: MonsterTemplate = {
  id: 'celestial_guardian',
  name: 'Celestial Guardian',
  tier: 3,
  emoji: '⭐',
  color: '#FCD34D',
  baseAttributes: {
    hp: 1300,
    attack: 88,
    defense: 42,
    attackSpeed: 0.95,
    critChance: 0.13,
    critDamage: 1.75,
    dodgeChance: 0.09,
    damageReduction: 0.14,
    penetration: 0.1,
    haste: 0.07,
  },
  passive: {
    id: 'divine_protection',
    name: 'Divine Protection',
    description: 'Takes 20% reduced damage from all sources',
    onHit: (_self, _attacker, damage) => {
      return Math.floor(damage * 0.8);
    },
  },
  abilities: [
    {
      id: 'holy_strike',
      name: 'Holy Strike',
      description: 'Strikes for 150% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.5);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Holy Strike smites ${target.template.name}!` };
      },
    },
    {
      id: 'divine_aegis',
      name: 'Divine Aegis',
      description: 'Protects team, gaining +35% defense for 6s',
      cooldown: 12,
      initialDelay: 4,
      targetCount: 0,
      targetAllies: true,
      execute: (self, _targets, battle) => {
        const allies = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
        allies.forEach(ally => {
          if (ally.isAlive) {
            const boost = Math.floor(ally.attributes.defense * 0.35);
            ally.attributes.defense += boost;
            ally._aegisBoost = (ally._aegisBoost || 0) + boost;
            setTimeout(() => {
              if (ally.isAlive && ally._aegisBoost) {
                ally.attributes.defense -= boost;
                ally._aegisBoost -= boost;
              }
            }, 6000);
          }
        });
        return { message: `Divine Aegis! Team defense +35% for 6s!` };
      },
    },
  ],
  ultimate: {
    id: 'celestial_judgment',
    name: 'Celestial Judgment',
    description: 'Divine judgment for 280% attack damage to all, heals team 20%',
    meterMax: 140,
    targetCount: 0,
    execute: (self, targets, battle) => {
      const damage = Math.floor(self.attributes.attack * 2.8);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      const allies = self.team === 'player' ? battle.playerMonsters : battle.enemyMonsters;
      allies.forEach(a => {
        if (a.isAlive) {
          a.currentHp = Math.min(a.attributes.maxHp, a.currentHp + Math.floor(a.attributes.maxHp * 0.2));
        }
      });
      return { damage: damage * targets.length, message: `CELESTIAL JUDGMENT! Divine light heals allies!` };
    },
  },
};

export const SHADOW_DRAGON: MonsterTemplate = {
  id: 'shadow_dragon',
  name: 'Shadow Dragon',
  tier: 3,
  emoji: '🐲',
  color: '#374151',
  baseAttributes: {
    hp: 1250,
    attack: 102,
    defense: 35,
    attackSpeed: 1.05,
    critChance: 0.19,
    critDamage: 2.1,
    dodgeChance: 0.09,
    damageReduction: 0.11,
    penetration: 0.16,
    haste: 0.1,
  },
  passive: {
    id: 'shadow_clones',
    name: 'Shadow Clones',
    description: 'Every 3rd attack hits a second random enemy for 60% damage',
    onAttack: (self, target, damage) => {
      self.shadowCount = (self.shadowCount || 0) + 1;
      if (self.shadowCount % 3 === 0) {
        const enemies = self.team === 'player'
          ? self._battle?.enemyMonsters.filter(m => m.isAlive && m.id !== target.id)
          : self._battle?.playerMonsters.filter(m => m.isAlive && m.id !== target.id);
        if (enemies && enemies.length > 0) {
          const secondary = enemies[Math.floor(Math.random() * enemies.length)];
          const cloneDmg = Math.floor(damage * 0.6);
          secondary.currentHp = Math.max(0, secondary.currentHp - cloneDmg);
        }
      }
      return damage;
    },
  },
  abilities: [
    {
      id: 'shadow_strike',
      name: 'Shadow Strike',
      description: 'Strikes from shadows for 160% attack damage',
      cooldown: 5,
      initialDelay: 2,
      targetCount: 1,
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.6);
        target.currentHp = Math.max(0, target.currentHp - damage);
        return { damage, message: `Shadow Strike materializes on ${target.template.name}!` };
      },
    },
    {
      id: 'void_aura',
      name: 'Void Aura',
      description: 'Surrounds area, reducing enemy attack by 30% for 5s',
      cooldown: 9,
      initialDelay: 4,
      targetCount: 0,
      execute: (_self, targets) => {
        targets.forEach(t => {
          const reduction = Math.floor(t.attributes.attack * 0.3);
          t.attributes.attack -= reduction;
          t._voidReduction = (t._voidReduction || 0) + reduction;
          setTimeout(() => {
            if (t.isAlive && t._voidReduction) {
              t.attributes.attack += reduction;
              t._voidReduction -= reduction;
            }
          }, 5000);
        });
        return { message: `Void Aura reduces enemy attacks!` };
      },
    },
  ],
  ultimate: {
    id: 'eternal_darkness',
    name: 'Eternal Darkness',
    description: 'Darkness consumes all for 290% attack damage to all',
    meterMax: 130,
    targetCount: 0,
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.9);
      targets.forEach(t => { t.currentHp = Math.max(0, t.currentHp - damage); });
      return { damage: damage * targets.length, message: `ETERNAL DARKNESS! Everything vanishes!` };
    },
  },
};

// Export all monsters
export const ALL_MONSTERS: MonsterTemplate[] = [
  // Tier 1
  SHADOW_IMP,
  FLAME_WOLF,
  STONE_TITAN,
  SPECTRAL_SHADE,
  STONE_GOLEM,
  ACID_SLIME,
  // Tier 2
  IRON_KNIGHT,
  BLOOD_VAMPIRE,
  FROST_WYRM,
  VENOM_SPIDER,
  THUNDER_EAGLE,
  BONE_ARCHER,
  INFERNAL_DEMON,
  SHADOW_ASSASSIN,
  ICE_ELEMENTALIST,
  // Tier 3
  CHAOS_HYDRA,
  STORM_ELEMENTAL,
  VOLCANIC_TITAN,
  VOID_REAPER,
  PHOENIX_LORD,
  CRYSTAL_GOLEM,
  DRAGON_LORD,
  LICH_OVERLORD,
  CELESTIAL_GUARDIAN,
  SHADOW_DRAGON,
];

export const STARTER_MONSTERS = [SHADOW_IMP, FLAME_WOLF, STONE_TITAN];
export const getMonsterById = (id: string) => ALL_MONSTERS.find(m => m.id === id);
