import { MonsterTemplate, BattleMonster, MonsterAttributes } from '../types/monster';

// Helper to create battle monster from template
export function createBattleMonster(
  template: MonsterTemplate,
  team: 'player' | 'enemy',
  upgrades: Partial<MonsterTemplate['baseAttributes']> = {}
): BattleMonster {
  const attrs = {
    ...template.baseAttributes,
    ...upgrades,
    maxHp: (template.baseAttributes.hp + (upgrades.hp || 0)),
  };
  attrs.hp = attrs.maxHp;

  return {
    id: `${template.id}-${team}-${Math.random().toString(36).substr(2, 9)}`,
    template,
    attributes: attrs as MonsterAttributes,
    currentHp: attrs.maxHp,
    ultimateMeter: 0,
    abilityCooldowns: [0, 0],
    abilityDelays: [template.abilities[0].initialDelay, template.abilities[1].initialDelay],
    isAlive: true,
    team,
    lastAttackTime: 0,
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
      description: 'Howls, increasing attack by 25% for 5s',
      cooldown: 10,
      initialDelay: 3,
      targetCount: 0,
      execute: (self) => {
        const boost = Math.floor(self.attributes.attack * 0.25);
        self.attributes.attack += boost;
        setTimeout(() => {
          if (self.isAlive) self.attributes.attack -= boost;
        }, 5000);
        return { message: `Inferno Howl! Attack +25% for 5s!` };
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
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.5);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunned = true;
        setTimeout(() => { t.stunned = false; }, 1000);
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
      execute: (self, targets) => {
        const target = targets[0];
        const damage = Math.floor(self.attributes.attack * 1.0);
        target.currentHp = Math.max(0, target.currentHp - damage);
        target.stunned = true;
        setTimeout(() => { target.stunned = false; }, 1500);
        return { damage, message: `Shield Bash stuns ${target.template.name}!` };
      },
    },
  ],
  ultimate: {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Becomes immune to damage for 3s and reflects 50% of attempted damage',
    meterMax: 100,
    targetCount: 0,
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
    onHit: (_self, attacker) => {
      if (Math.random() < 0.2 && attacker) {
        attacker.stunned = true;
        setTimeout(() => { attacker.stunned = false; }, 500);
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
      execute: (self, targets) => {
        let total = 0;
        targets.slice(0, 2).forEach(t => {
          const dmg = Math.floor(self.attributes.attack * 1.4);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          t.stunned = true;
          setTimeout(() => { t.stunned = false; }, 500);
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
    execute: (self, targets) => {
      const damage = Math.floor(self.attributes.attack * 2.2);
      targets.forEach(t => {
        t.currentHp = Math.max(0, t.currentHp - damage);
        t.stunned = true;
        setTimeout(() => { t.stunned = false; }, 1500);
      });
      return { damage: damage * targets.length, message: `ABSOLUTE ZERO! Everything freezes!` };
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
      execute: (_self, targets) => {
        targets.slice(0, 2).forEach(t => {
          t.stunned = true;
          setTimeout(() => { t.stunned = false; }, 1000);
        });
        return { message: `Web Trap catches ${Math.min(2, targets.length)} enemies!` };
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
    onDeath: (self) => {
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
      execute: (self) => {
        const shieldAmount = Math.floor(self.attributes.maxHp * 2);
        self.shield = shieldAmount;
        setTimeout(() => { if (self.isAlive) self.shield = 0; }, 4000);
        return { message: `Diamond Shield activated!` };
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

// Export all monsters
export const ALL_MONSTERS: MonsterTemplate[] = [
  SHADOW_IMP,
  FLAME_WOLF,
  STONE_TITAN,
  IRON_KNIGHT,
  BLOOD_VAMPIRE,
  FROST_WYRM,
  VENOM_SPIDER,
  THUNDER_EAGLE,
  CHAOS_HYDRA,
  STORM_ELEMENTAL,
  VOLCANIC_TITAN,
  VOID_REAPER,
  PHOENIX_LORD,
  CRYSTAL_GOLEM,
];

export const STARTER_MONSTERS = [SHADOW_IMP, FLAME_WOLF, STONE_TITAN];
export const getMonsterById = (id: string) => ALL_MONSTERS.find(m => m.id === id);
