import { EquippableItem, ShopPassiveEntry, BattleMonster } from '../types/monster';

export const ALL_ITEMS: EquippableItem[] = [
  // ===== TIER 1 WEAPONS (7) =====
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A basic iron blade. Reliable and sturdy.',
    emoji: '⚔️',
    tier: 1,
    cost: 30,
    statBonus: { attack: 8 }
  },
  {
    id: 'bronze_axe',
    name: 'Bronze Axe',
    description: 'A heavy bronze weapon with good swing power.',
    emoji: '🪓',
    tier: 1,
    cost: 37,
    statBonus: { attack: 10, defense: 2 }
  },
  {
    id: 'wooden_bow',
    name: 'Wooden Bow',
    description: 'A simple bow for ranged attacks.',
    emoji: '🏹',
    tier: 1,
    cost: 25,
    statBonus: { attack: 6, attackSpeed: 2 }
  },
  {
    id: 'copper_dagger',
    name: 'Copper Dagger',
    description: 'A quick-striking copper weapon.',
    emoji: '🗡️',
    tier: 1,
    cost: 27,
    statBonus: { attack: 5, attackSpeed: 3 }
  },
  {
    id: 'stone_club',
    name: 'Stone Club',
    description: 'Crude but effective blunt weapon.',
    emoji: '🪨',
    tier: 1,
    cost: 32,
    statBonus: { attack: 9, defense: 1 }
  },
  {
    id: 'iron_spear',
    name: 'Iron Spear',
    description: 'A piercing weapon with good reach.',
    emoji: '🔱',
    tier: 1,
    cost: 35,
    statBonus: { attack: 7, penetration: 2 }
  },
  {
    id: 'starter_mace',
    name: 'Starter Mace',
    description: 'A basic mace for balanced combat.',
    emoji: '🔨',
    tier: 1,
    cost: 30,
    statBonus: { attack: 8, defense: 2 }
  },

  // ===== TIER 1 ARMOR (8) =====
  {
    id: 'leather_vest',
    name: 'Leather Vest',
    description: 'Light leather protection for the torso.',
    emoji: '🧥',
    tier: 1,
    cost: 25,
    statBonus: { defense: 5 }
  },
  {
    id: 'cloth_robe',
    name: 'Cloth Robe',
    description: 'A simple robe providing minimal protection.',
    emoji: '👚',
    tier: 1,
    cost: 22,
    statBonus: { defense: 3, hp: 5 }
  },
  {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    description: 'Protects the head from blows.',
    emoji: '⚔️',
    tier: 1,
    cost: 27,
    statBonus: { defense: 6, hp: 3 }
  },
  {
    id: 'bronze_shield',
    name: 'Bronze Shield',
    description: 'A reliable shield for defense.',
    emoji: '🛡️',
    tier: 1,
    cost: 32,
    statBonus: { defense: 8, dodgeChance: 2 }
  },
  {
    id: 'leather_gloves',
    name: 'Leather Gloves',
    description: 'Protective gloves for the hands.',
    emoji: '🧤',
    tier: 1,
    cost: 20,
    statBonus: { defense: 2, attack: 2 }
  },
  {
    id: 'iron_boots',
    name: 'Iron Boots',
    description: 'Heavy boots that increase stability.',
    emoji: '👢',
    tier: 1,
    cost: 25,
    statBonus: { defense: 4, dodgeChance: 1 }
  },
  {
    id: 'wool_cloak',
    name: 'Wool Cloak',
    description: 'A warm cloak with light protection.',
    emoji: '🧛',
    tier: 1,
    cost: 22,
    statBonus: { defense: 3, hp: 8 }
  },
  {
    id: 'chain_mail',
    name: 'Chain Mail',
    description: 'Interlocking metal rings for protection.',
    emoji: '⛓️',
    tier: 1,
    cost: 37,
    statBonus: { defense: 7, hp: 5 }
  },

  // ===== TIER 1 ACCESSORIES (9) =====
  {
    id: 'ruby_ring',
    name: 'Ruby Ring',
    description: 'A red gem ring that boosts vitality.',
    emoji: '💍',
    tier: 1,
    cost: 25,
    statBonus: { hp: 10, maxHp: 10 }
  },
  {
    id: 'sapphire_ring',
    name: 'Sapphire Ring',
    description: 'A blue gem ring that sharpens the mind.',
    emoji: '💍',
    tier: 1,
    cost: 27,
    statBonus: { critChance: 5, attack: 2 }
  },
  {
    id: 'emerald_amulet',
    name: 'Emerald Amulet',
    description: 'A green gem amulet for balanced growth.',
    emoji: '📿',
    tier: 1,
    cost: 30,
    statBonus: { attack: 3, defense: 3 }
  },
  {
    id: 'amber_charm',
    name: 'Amber Charm',
    description: 'A warm charm that increases speed.',
    emoji: '✨',
    tier: 1,
    cost: 25,
    statBonus: { attackSpeed: 3, haste: 2 }
  },
  {
    id: 'silver_locket',
    name: 'Silver Locket',
    description: 'An ornate locket for memory and luck.',
    emoji: '🔓',
    tier: 1,
    cost: 27,
    statBonus: { dodgeChance: 4, critChance: 2 }
  },
  {
    id: 'copper_crest',
    name: 'Copper Crest',
    description: 'A badge of copper for minor bonuses.',
    emoji: '🎖️',
    tier: 1,
    cost: 22,
    statBonus: { hp: 5, attack: 2 }
  },
  {
    id: 'jade_ornament',
    name: 'Jade Ornament',
    description: 'A smooth jade piece for balance.',
    emoji: '🪨',
    tier: 1,
    cost: 25,
    statBonus: { defense: 4, hp: 5 }
  },
  {
    id: 'pearl_bracelet',
    name: 'Pearl Bracelet',
    description: 'A lustrous pearl bracelet for grace.',
    emoji: '💎',
    tier: 1,
    cost: 30,
    statBonus: { dodgeChance: 5, attackSpeed: 2 }
  },
  {
    id: 'bronze_buckle',
    name: 'Bronze Buckle',
    description: 'A sturdy bronze fastening.',
    emoji: '🧿',
    tier: 1,
    cost: 24,
    statBonus: { defense: 3, hp: 3 }
  },

  // ===== TIER 1 TOMES (2) =====
  {
    id: 'fire_spellbook',
    name: 'Fire Spellbook',
    description: 'Contains basic fire magic knowledge.',
    emoji: '📕',
    tier: 1,
    cost: 35,
    statBonus: { attack: 10, defense: 1 }
  },
  {
    id: 'frost_grimoire',
    name: 'Frost Grimoire',
    description: 'Teaches the ways of ice magic.',
    emoji: '📗',
    tier: 1,
    cost: 35,
    statBonus: { defense: 4, attackSpeed: 3 }
  },

  // ===== TIER 2 WEAPONS (11) =====
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    description: 'A well-forged steel blade.',
    emoji: '⚔️',
    tier: 2,
    cost: 60,
    statBonus: { attack: 18 }
  },
  {
    id: 'vampiric_blade',
    name: 'Vampiric Blade',
    description: 'Drains the life force of enemies.',
    emoji: '🩸',
    tier: 2,
    cost: 75,
    statBonus: { attack: 16, hp: 5 },
    specialEffect: {
      id: 'vampiric_blade_passive',
      name: 'Vampiric',
      description: 'Heal 15% of damage dealt',
      onAttack: (_self: BattleMonster, _target: BattleMonster, damage: number) => {
        return damage;
      }
    }
  },
  {
    id: 'silver_greatsword',
    name: 'Silver Greatsword',
    description: 'A massive sword effective against dark forces.',
    emoji: '🗡️',
    tier: 2,
    cost: 70,
    statBonus: { attack: 20, penetration: 3 }
  },
  {
    id: 'obsidian_dagger',
    name: 'Obsidian Dagger',
    description: 'Sharp and deadly, strikes with precision.',
    emoji: '🗡️',
    tier: 2,
    cost: 55,
    statBonus: { attack: 14, critChance: 8, attackSpeed: 4 }
  },
  {
    id: 'war_axe',
    name: 'War Axe',
    description: 'A devastating weapon of war.',
    emoji: '🪓',
    tier: 2,
    cost: 67,
    statBonus: { attack: 22, penetration: 2 }
  },
  {
    id: 'lightning_staff',
    name: 'Lightning Staff',
    description: 'Channels the power of thunder.',
    emoji: '⚡',
    tier: 2,
    cost: 65,
    statBonus: { attack: 17, attackSpeed: 2, haste: 3 }
  },
  {
    id: 'berserkers_axe',
    name: 'Berserker\'s Axe',
    description: 'Grants fury in battle.',
    emoji: '🔥',
    tier: 2,
    cost: 72,
    statBonus: { attack: 19, defense: -2 },
    specialEffect: {
      id: 'berserkers_axe_passive',
      name: 'Berserker Fury',
      description: '+30% attack when below 50% HP',
      onAttack: (self: BattleMonster, _target: BattleMonster, _damage: number) => {
        // +30% attack when below 50% HP
        if ((self.attributes.hp || 0) < ((self.attributes.maxHp || 1) * 0.5)) {
          return _damage * 1.3;
        }
        return _damage;
      }
    }
  },
  {
    id: 'holy_lance',
    name: 'Holy Lance',
    description: 'Blessed by the divine powers.',
    emoji: '✨',
    tier: 2,
    cost: 70,
    statBonus: { attack: 16, defense: 4, penetration: 2 }
  },
  {
    id: 'cursed_scythe',
    name: 'Cursed Scythe',
    description: 'Reaps souls with dark magic.',
    emoji: '💀',
    tier: 2,
    cost: 77,
    statBonus: { attack: 21, critChance: 10 }
  },
  {
    id: 'mithril_claymore',
    name: 'Mithril Claymore',
    description: 'An excellent two-handed sword.',
    emoji: '⚔️',
    tier: 2,
    cost: 80,
    statBonus: { attack: 23, defense: 2 }
  },
  {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    description: 'Forged to pierce dragon scales.',
    emoji: '🐉',
    tier: 2,
    cost: 75,
    statBonus: { attack: 20, penetration: 5 }
  },

  // ===== TIER 2 ARMOR (12) =====
  {
    id: 'steel_armor',
    name: 'Steel Armor',
    description: 'Heavy steel plating for protection.',
    emoji: '🦾',
    tier: 2,
    cost: 62,
    statBonus: { defense: 12, hp: 10 }
  },
  {
    id: 'thorns_armor',
    name: 'Thorns Armor',
    description: 'Studded with sharp spikes.',
    emoji: '🌹',
    tier: 2,
    cost: 70,
    statBonus: { defense: 10, hp: 8 },
    specialEffect: {
      id: 'thorns_armor_passive',
      name: 'Thorns',
      description: 'Reflect 20% of damage taken',
      onHit: (_self: BattleMonster, _attacker: BattleMonster, damage: number) => {
        return damage;
      }
    }
  },
  {
    id: 'frost_cloak',
    name: 'Frost Cloak',
    description: 'Cloaked in the power of ice.',
    emoji: '❄️',
    tier: 2,
    cost: 67,
    statBonus: { defense: 8, hp: 15, dodgeChance: 3 },
    specialEffect: {
      id: 'frost_cloak_passive',
      name: 'Frost Aura',
      description: '25% chance to stun attacker for 0.5s',
      onHit: (_self: BattleMonster, _attacker: BattleMonster, damage: number) => {
        return damage;
      }
    }
  },
  {
    id: 'dragon_scales',
    name: 'Dragon Scales',
    description: 'Armor made from legendary dragon scales.',
    emoji: '🐲',
    tier: 2,
    cost: 85,
    statBonus: { defense: 14, hp: 20, damageReduction: 5 }
  },
  {
    id: 'mystic_robes',
    name: 'Mystic Robes',
    description: 'Enchanted garments with protective magic.',
    emoji: '🧙',
    tier: 2,
    cost: 60,
    statBonus: { defense: 9, attack: 5, haste: 2 }
  },
  {
    id: 'blessed_plate',
    name: 'Blessed Plate',
    description: 'Holy armor blessed by priests.',
    emoji: '⛪',
    tier: 2,
    cost: 72,
    statBonus: { defense: 13, hp: 12, damageReduction: 3 }
  },
  {
    id: 'shadow_shroud',
    name: 'Shadow Shroud',
    description: 'Cloaked in darkness and concealment.',
    emoji: '🌑',
    tier: 2,
    cost: 65,
    statBonus: { defense: 7, dodgeChance: 8, hp: 5 }
  },
  {
    id: 'golem_carapace',
    name: 'Golem Carapace',
    description: 'Hard as stone, nearly unbreakable.',
    emoji: '🪨',
    tier: 2,
    cost: 77,
    statBonus: { defense: 16, hp: 8, damageReduction: 4 }
  },
  {
    id: 'phoenix_mail',
    name: 'Phoenix Mail',
    description: 'Armor infused with resurrection power.',
    emoji: '🔥',
    tier: 2,
    cost: 75,
    statBonus: { defense: 11, hp: 18, attack: 3 }
  },
  {
    id: 'void_mantle',
    name: 'Void Mantle',
    description: 'A cloak that bends reality around you.',
    emoji: '🌀',
    tier: 2,
    cost: 70,
    statBonus: { defense: 10, dodgeChance: 6, damageReduction: 2 }
  },
  {
    id: 'ironwood_plate',
    name: 'Ironwood Plate',
    description: 'Combines steel and living wood.',
    emoji: '🌳',
    tier: 2,
    cost: 67,
    statBonus: { defense: 11, hp: 15, attack: 2 }
  },

  // ===== TIER 2 ACCESSORIES (11) =====
  {
    id: 'opal_ring',
    name: 'Opal Ring',
    description: 'An iridescent gem ring for luck.',
    emoji: '💍',
    tier: 2,
    cost: 55,
    statBonus: { critChance: 8, dodgeChance: 5 }
  },
  {
    id: 'diamond_amulet',
    name: 'Diamond Amulet',
    description: 'The hardest gem for ultimate protection.',
    emoji: '💎',
    tier: 2,
    cost: 67,
    statBonus: { defense: 8, hp: 15 }
  },
  {
    id: 'topaz_charm',
    name: 'Topaz Charm',
    description: 'Increases combat awareness.',
    emoji: '✨',
    tier: 2,
    cost: 57,
    statBonus: { attack: 6, attackSpeed: 4 }
  },
  {
    id: 'moonstone_ring',
    name: 'Moonstone Ring',
    description: 'Glows with lunar power.',
    emoji: '🌙',
    tier: 2,
    cost: 62,
    statBonus: { hp: 12, dodgeChance: 6, haste: 2 }
  },
  {
    id: 'dragon_heart',
    name: 'Dragon Heart',
    description: 'Contains the essence of a dragon.',
    emoji: '💛',
    tier: 2,
    cost: 77,
    statBonus: { hp: 25, attack: 8, defense: 4 }
  },
  {
    id: 'void_sigil',
    name: 'Void Sigil',
    description: 'A mark of the void itself.',
    emoji: '🌑',
    tier: 2,
    cost: 65,
    statBonus: { attack: 10, penetration: 3, haste: 1 }
  },
  {
    id: 'sunburst_pendant',
    name: 'Sunburst Pendant',
    description: 'Radiates the power of the sun.',
    emoji: '☀️',
    tier: 2,
    cost: 60,
    statBonus: { attack: 8, defense: 5, hp: 8 }
  },
  {
    id: 'crystal_circlet',
    name: 'Crystal Circlet',
    description: 'A circlet of pure crystal.',
    emoji: '👑',
    tier: 2,
    cost: 70,
    statBonus: { hp: 18, defense: 6, haste: 3 }
  },
  {
    id: 'arcane_talisman',
    name: 'Arcane Talisman',
    description: 'Channels magical forces.',
    emoji: '🔮',
    tier: 2,
    cost: 62,
    statBonus: { attack: 9, attackSpeed: 3, penetration: 2 }
  },
  {
    id: 'eternal_flame_brooch',
    name: 'Eternal Flame Brooch',
    description: 'Burns with undying fire.',
    emoji: '🔥',
    tier: 2,
    cost: 67,
    statBonus: { attack: 10, hp: 10, defense: 3 }
  },
  {
    id: 'starlight_locket',
    name: 'Starlight Locket',
    description: 'Contains captured starlight.',
    emoji: '⭐',
    tier: 2,
    cost: 62,
    statBonus: { hp: 15, critChance: 7, defense: 4 }
  },

  // ===== TIER 2 TOMES (2) =====
  {
    id: 'inferno_tome',
    name: 'Inferno Tome',
    description: 'Advanced fire magic compendium.',
    emoji: '📕',
    tier: 2,
    cost: 65,
    statBonus: { attack: 18, haste: 2 }
  },
  {
    id: 'blizzard_codex',
    name: 'Blizzard Codex',
    description: 'Master-level ice magic knowledge.',
    emoji: '📗',
    tier: 2,
    cost: 65,
    statBonus: { defense: 8, attack: 12, attackSpeed: 3 }
  },

  // ===== TIER 3 WEAPONS (11) =====
  {
    id: 'excalibur',
    name: 'Excalibur',
    description: 'The legendary sword of kings.',
    emoji: '⚔️',
    tier: 3,
    cost: 150,
    statBonus: { attack: 35, defense: 5, penetration: 5 }
  },
  {
    id: 'phoenix_talisman',
    name: 'Phoenix Talisman',
    description: 'Grants resurrection power.',
    emoji: '🔥',
    tier: 3,
    cost: 160,
    statBonus: { attack: 25, hp: 30 },
    specialEffect: {
      id: 'phoenix_talisman_passive',
      name: 'Phoenix Resurrection',
      description: 'Revive once at 30% HP',
      onDeath: (_self: BattleMonster, _killer: BattleMonster) => {
      }
    }
  },
  {
    id: 'shadowbane',
    name: 'Shadowbane',
    description: 'Cuts through darkness itself.',
    emoji: '💀',
    tier: 3,
    cost: 140,
    statBonus: { attack: 32, penetration: 7, critChance: 12 }
  },
  {
    id: 'godslayer_sword',
    name: 'Godslayer Sword',
    description: 'A weapon capable of slaying gods.',
    emoji: '⚡',
    tier: 3,
    cost: 175,
    statBonus: { attack: 40, penetration: 8, critDamage: 40 }
  },
  {
    id: 'eternal_halberd',
    name: 'Eternal Halberd',
    description: 'An immortal polearm of incredible power.',
    emoji: '🔱',
    tier: 3,
    cost: 155,
    statBonus: { attack: 38, defense: 3, penetration: 6 }
  },
  {
    id: 'chaos_blade',
    name: 'Chaos Blade',
    description: 'A sword of pure chaos and power.',
    emoji: '⚫',
    tier: 3,
    cost: 145,
    statBonus: { attack: 36, attackSpeed: 5, critChance: 10 }
  },
  {
    id: 'heavens_judgment',
    name: 'Heaven\'s Judgment',
    description: 'Divine retribution in weapon form.',
    emoji: '✨',
    tier: 3,
    cost: 165,
    statBonus: { attack: 33, defense: 8, penetration: 4, hp: 15 }
  },
  {
    id: 'abyss_reaper',
    name: 'Abyss Reaper',
    description: 'Harvests souls from the depths.',
    emoji: '🌑',
    tier: 3,
    cost: 150,
    statBonus: { attack: 37, critChance: 14, attackSpeed: 2 }
  },
  {
    id: 'twilight_sword',
    name: 'Twilight Sword',
    description: 'Balanced between light and dark.',
    emoji: '🌅',
    tier: 3,
    cost: 155,
    statBonus: { attack: 32, defense: 6, hp: 12, penetration: 4 }
  },
  {
    id: 'world_ender',
    name: 'World Ender',
    description: 'A blade of apocalyptic power.',
    emoji: '💥',
    tier: 3,
    cost: 170,
    statBonus: { attack: 42, penetration: 6, critDamage: 50 }
  },
  {
    id: 'ancient_grimoire_staff',
    name: 'Ancient Grimoire Staff',
    description: 'A staff containing primordial magic.',
    emoji: '🔮',
    tier: 3,
    cost: 160,
    statBonus: { attack: 28, attackSpeed: 4, haste: 5, penetration: 3 }
  },

  // ===== TIER 3 ARMOR (11) =====
  {
    id: 'adamantite_plate',
    name: 'Adamantite Plate',
    description: 'The hardest metal armor in existence.',
    emoji: '🛡️',
    tier: 3,
    cost: 150,
    statBonus: { defense: 22, hp: 25, damageReduction: 10 }
  },
  {
    id: 'immortal_mantle',
    name: 'Immortal Mantle',
    description: 'Grants the wearer near-immortality.',
    emoji: '👑',
    tier: 3,
    cost: 170,
    statBonus: { defense: 18, hp: 40, damageReduction: 8 }
  },
  {
    id: 'celestial_armor',
    name: 'Celestial Armor',
    description: 'Forged in heavenly fires.',
    emoji: '✨',
    tier: 3,
    cost: 165,
    statBonus: { defense: 20, hp: 35, attack: 8, damageReduction: 7 }
  },
  {
    id: 'void_walker_cloak',
    name: 'Void Walker Cloak',
    description: 'Allows passage through any realm.',
    emoji: '🌀',
    tier: 3,
    cost: 155,
    statBonus: { defense: 14, dodgeChance: 12, damageReduction: 6, hp: 20 }
  },
  {
    id: 'infernal_hide',
    name: 'Infernal Hide',
    description: 'Armor of a demon lord.',
    emoji: '🔥',
    tier: 3,
    cost: 160,
    statBonus: { defense: 19, hp: 30, attack: 12, damageReduction: 5 }
  },
  {
    id: 'titan_plate',
    name: 'Titan Plate',
    description: 'The legendary armor of titans.',
    emoji: '⛓️',
    tier: 3,
    cost: 175,
    statBonus: { defense: 24, hp: 28, damageReduction: 9 }
  },
  {
    id: 'crystal_aegis',
    name: 'Crystal Aegis',
    description: 'A shield of unbreakable crystal.',
    emoji: '💎',
    tier: 3,
    cost: 152,
    statBonus: { defense: 21, hp: 18, dodgeChance: 4, damageReduction: 8 }
  },
  {
    id: 'twilight_garb',
    name: 'Twilight Garb',
    description: 'Mystical robes of twilight magic.',
    emoji: '🌅',
    tier: 3,
    cost: 157,
    statBonus: { defense: 16, hp: 32, attack: 6, haste: 3 }
  },
  {
    id: 'abyss_touched_mail',
    name: 'Abyss-Touched Mail',
    description: 'Armor touched by the abyss itself.',
    emoji: '⚫',
    tier: 3,
    cost: 162,
    statBonus: { defense: 17, hp: 38, penetration: 4, damageReduction: 7 }
  },
  {
    id: 'divine_protection',
    name: 'Divine Protection',
    description: 'Protected by the blessing of gods.',
    emoji: '⛪',
    tier: 3,
    cost: 167,
    statBonus: { defense: 20, hp: 42, damageReduction: 8 }
  },
  {
    id: 'eternal_plate',
    name: 'Eternal Plate',
    description: 'Armor that has existed since time began.',
    emoji: '⌚',
    tier: 3,
    cost: 172,
    statBonus: { defense: 23, hp: 30, damageReduction: 9, haste: 2 }
  },

  // ===== TIER 3 ACCESSORIES (11) =====
  {
    id: 'chaos_orb',
    name: 'Chaos Orb',
    description: 'Contains pure chaotic energy.',
    emoji: '🔴',
    tier: 3,
    cost: 140,
    statBonus: { attack: 20, critChance: 15, attackSpeed: 6 }
  },
  {
    id: 'eternal_crown',
    name: 'Eternal Crown',
    description: 'Crown of an eternal ruler.',
    emoji: '👑',
    tier: 3,
    cost: 160,
    statBonus: { attack: 15, defense: 12, hp: 30, haste: 4 }
  },
  {
    id: 'soul_stone',
    name: 'Soul Stone',
    description: 'Contains the essence of a soul.',
    emoji: '💜',
    tier: 3,
    cost: 155,
    statBonus: { hp: 50, defense: 8, attack: 10 }
  },
  {
    id: 'void_heart',
    name: 'Void Heart',
    description: 'The heart of the void itself.',
    emoji: '🖤',
    tier: 3,
    cost: 150,
    statBonus: { attack: 22, penetration: 6, damageReduction: 5 }
  },
  {
    id: 'celestial_star',
    name: 'Celestial Star',
    description: 'A fallen star with immense power.',
    emoji: '⭐',
    tier: 3,
    cost: 157,
    statBonus: { attack: 16, defense: 10, hp: 25, haste: 5 }
  },
  {
    id: 'essence_of_flame',
    name: 'Essence of Flame',
    description: 'The burning essence of fire.',
    emoji: '🔥',
    tier: 3,
    cost: 152,
    statBonus: { attack: 20, hp: 20, critChance: 12 }
  },
  {
    id: 'essence_of_ice',
    name: 'Essence of Ice',
    description: 'The frozen essence of winter.',
    emoji: '❄️',
    tier: 3,
    cost: 152,
    statBonus: { defense: 15, dodgeChance: 10, hp: 20 }
  },
  {
    id: 'moonlit_pearl',
    name: 'Moonlit Pearl',
    description: 'A pearl that glows with moonlight.',
    emoji: '🌙',
    tier: 3,
    cost: 155,
    statBonus: { hp: 35, dodgeChance: 8, defense: 6, haste: 3 }
  },
  {
    id: 'godlike_rune',
    name: 'Godlike Rune',
    description: 'A rune of godlike power.',
    emoji: '✨',
    tier: 3,
    cost: 165,
    statBonus: { attack: 18, defense: 14, hp: 28, attackSpeed: 4 }
  },
  {
    id: 'infinity_stone',
    name: 'Infinity Stone',
    description: 'A stone containing infinite power.',
    emoji: '🌌',
    tier: 3,
    cost: 175,
    statBonus: { attack: 25, defense: 18, hp: 40, penetration: 5 }
  },
  {
    id: 'judgment_seal',
    name: 'Judgment Seal',
    description: 'Sealed with divine judgment.',
    emoji: '⚡',
    tier: 3,
    cost: 162,
    statBonus: { attack: 19, defense: 11, hp: 32, critChance: 14 }
  }
];

export const SHOP_PASSIVE_ENTRIES: ShopPassiveEntry[] = [
  {
    passive: {
      id: 'lifesteal',
      name: 'Lifesteal',
      description: 'Heal 25% of damage dealt on each attack',
      onAttack: (self: BattleMonster, _target: BattleMonster, damage: number) => {
        const heal = Math.floor(damage * 0.25);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + heal);
        self.totalHealing = (self.totalHealing || 0) + heal;
        return damage;
      }
    },
    cost: 100
  },
  {
    passive: {
      id: 'thorns',
      name: 'Thorns',
      description: 'Reflect 35% damage back',
      onHit: (_self: BattleMonster, _attacker: BattleMonster, damage: number) => {
        _attacker.currentHp = Math.max(0, _attacker.currentHp - Math.floor(damage * 0.35));
        return damage;
      }
    },
    cost: 90
  },
  {
    passive: {
      id: 'adrenaline',
      name: 'Adrenaline',
      description: '+50% damage when below 50% HP',
      onAttack: (self: BattleMonster, target: BattleMonster, damage: number) => {
        if (self.currentHp < self.attributes.maxHp * 0.5) {
          target.currentHp = Math.max(0, target.currentHp - Math.floor(damage * 0.5));
        }
        return damage;
      }
    },
    cost: 75
  },
  {
    passive: {
      id: 'death_defiance',
      name: 'Death Defiance',
      description: 'Revive once at 30% HP',
      onDeath: (self: BattleMonster, _killer: BattleMonster) => {
        if (!self.hasRevived) {
          self.isAlive = true;
          self.currentHp = Math.floor(self.attributes.maxHp * 0.3);
          self.hasRevived = true;
        }
      }
    },
    cost: 125
  },
  {
    passive: {
      id: 'crit_mastery',
      name: 'Crit Mastery',
      description: '+75% crit damage',
      onApply: (self: BattleMonster) => {
        self.attributes.critDamage += 0.75;
      }
    },
    cost: 100
  },
  {
    passive: {
      id: 'poisoned_weapons',
      name: 'Poisoned Weapons',
      description: 'Deal 8% of target max HP as bonus damage',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        target.currentHp = Math.max(0, target.currentHp - Math.floor(target.attributes.maxHp * 0.08));
        return damage;
      }
    },
    cost: 80
  },
  {
    passive: {
      id: 'second_wind',
      name: 'Second Wind',
      description: 'Regenerate 5% HP each turn',
      onTurnStart: (self: BattleMonster) => {
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + Math.floor(self.attributes.maxHp * 0.05));
      }
    },
    cost: 70
  },
  {
    passive: {
      id: 'ricochet',
      name: 'Ricochet',
      description: '20% chance deal damage again',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        if (Math.random() < 0.2) {
          target.currentHp = Math.max(0, target.currentHp - damage);
        }
        return damage;
      }
    },
    cost: 95
  },
  {
    passive: {
      id: 'unstoppable_force',
      name: 'Unstoppable Force',
      description: '+30% damage when at full HP',
      onAttack: (self: BattleMonster, target: BattleMonster, damage: number) => {
        if (self.currentHp >= self.attributes.maxHp) {
          target.currentHp = Math.max(0, target.currentHp - Math.floor(damage * 0.3));
        }
        return damage;
      }
    },
    cost: 85
  },
  {
    passive: {
      id: 'drain',
      name: 'Drain',
      description: 'Heal 15% of damage dealt',
      onAttack: (self: BattleMonster, _target: BattleMonster, damage: number) => {
        const h = Math.floor(damage * 0.15);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + h);
        self.totalHealing = (self.totalHealing || 0) + h;
        return damage;
      }
    },
    cost: 90
  },
  {
    passive: {
      id: 'precision',
      name: 'Precision',
      description: '+25% crit chance',
      onApply: (self: BattleMonster) => {
        self.attributes.critChance = Math.min(0.9, self.attributes.critChance + 0.25);
      }
    },
    cost: 65
  },
  {
    passive: {
      id: 'shockwave',
      name: 'Shockwave',
      description: '15% chance deal 60% damage again',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        if (Math.random() < 0.15) {
          target.currentHp = Math.max(0, target.currentHp - Math.floor(damage * 0.6));
        }
        return damage;
      }
    },
    cost: 105
  },
  {
    passive: {
      id: 'executioner',
      name: 'Executioner',
      description: 'Deal bonus damage equal to 10% of target missing HP',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        const missing = target.attributes.maxHp - target.currentHp;
        target.currentHp = Math.max(0, target.currentHp - Math.floor(missing * 0.1));
        return damage;
      }
    },
    cost: 90
  },
  {
    passive: {
      id: 'berserk',
      name: 'Berserk',
      description: 'Gain +3 attack per hit (max 30 stacks)',
      onAttack: (self: BattleMonster, _target: BattleMonster, damage: number) => {
        if ((self.attackCount || 0) < 10) {
          self.attackCount = (self.attackCount || 0) + 1;
          self.attributes.attack += 3;
        }
        return damage;
      }
    },
    cost: 95
  },
  {
    passive: {
      id: 'guardian',
      name: 'Guardian',
      description: '+30% defense',
      onApply: (self: BattleMonster) => {
        self.attributes.defense = Math.floor(self.attributes.defense * 1.3);
      }
    },
    cost: 70
  },
  {
    passive: {
      id: 'corruption',
      name: 'Corruption',
      description: 'Reduce target defense by 15% once',
      onAttack: (self: BattleMonster, target: BattleMonster, damage: number) => {
        if (!self._dissolveReduction) {
          self._dissolveReduction = 1;
          target.attributes.defense = Math.floor(target.attributes.defense * 0.85);
        }
        return damage;
      }
    },
    cost: 110
  },
  {
    passive: {
      id: 'momentum',
      name: 'Momentum',
      description: 'Gain +5% attack speed per attack (max 30%)',
      onAttack: (self: BattleMonster, _target: BattleMonster, damage: number) => {
        if (!self._cloneBoost || self._cloneBoost < 6) {
          self._cloneBoost = (self._cloneBoost || 0) + 1;
          self.attributes.attackSpeed += self.attributes.attackSpeed * 0.05;
        }
        return damage;
      }
    },
    cost: 75
  },
  {
    passive: {
      id: 'weakening_strike',
      name: 'Weakening Strike',
      description: 'Reduce target defense by 20%',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        if (!target._curseDefReduction) {
          target._curseDefReduction = 1;
          target.attributes.defense = Math.floor(target.attributes.defense * 0.8);
        }
        return damage;
      }
    },
    cost: 70
  },
  {
    passive: {
      id: 'lucky',
      name: 'Lucky',
      description: '+20% crit chance',
      onApply: (self: BattleMonster) => {
        self.attributes.critChance = Math.min(0.9, self.attributes.critChance + 0.20);
      }
    },
    cost: 75
  },
  {
    passive: {
      id: 'siphon',
      name: 'Siphon',
      description: 'Heal 15% of damage dealt',
      onAttack: (self: BattleMonster, _target: BattleMonster, damage: number) => {
        const h = Math.floor(damage * 0.15);
        self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + h);
        self.totalHealing = (self.totalHealing || 0) + h;
        return damage;
      }
    },
    cost: 80
  },
  {
    passive: {
      id: 'fortress',
      name: 'Fortress',
      description: '+20% damage reduction',
      onApply: (self: BattleMonster) => {
        self.attributes.damageReduction = Math.min(0.8, self.attributes.damageReduction + 0.20);
      }
    },
    cost: 55
  },
  {
    passive: {
      id: 'stun_strike',
      name: 'Stun Strike',
      description: '20% chance stun target for 1000ms',
      onAttack: (_self: BattleMonster, target: BattleMonster, damage: number) => {
        if (Math.random() < 0.2) {
          target.stunnedUntil = (target.stunnedUntil || 0) + 1000;
        }
        return damage;
      }
    },
    cost: 90
  },
  {
    passive: {
      id: 'desperate_strength',
      name: 'Desperate Strength',
      description: '+60% damage when below 25% HP',
      onAttack: (self: BattleMonster, target: BattleMonster, damage: number) => {
        if (self.currentHp < self.attributes.maxHp * 0.25) {
          target.currentHp = Math.max(0, target.currentHp - Math.floor(damage * 0.6));
        }
        return damage;
      }
    },
    cost: 80
  },
  {
    passive: {
      id: 'combo',
      name: 'Combo',
      description: 'Each attack gains +10% damage stacking',
      onAttack: (self: BattleMonster, target: BattleMonster, damage: number) => {
        self.hitCounter = (self.hitCounter || 0) + 1;
        const bonus = Math.floor(damage * (self.hitCounter * 0.1));
        target.currentHp = Math.max(0, target.currentHp - bonus);
        return damage;
      }
    },
    cost: 100
  },
  {
    passive: {
      id: 'evasion',
      name: 'Evasion',
      description: '+20% dodge chance',
      onApply: (self: BattleMonster) => {
        self.attributes.dodgeChance = Math.min(0.6, self.attributes.dodgeChance + 0.20);
      }
    },
    cost: 60
  },
  {
    passive: {
      id: 'bloodlust',
      name: 'Bloodlust',
      description: 'Gain +25% attack on kill',
      onKill: (self: BattleMonster, _victim: BattleMonster) => {
        self.attributes.attack = Math.floor(self.attributes.attack * 1.25);
      }
    },
    cost: 100
  },
  {
    passive: {
      id: 'focus',
      name: 'Focus',
      description: '+25% attack',
      onApply: (self: BattleMonster) => {
        self.attributes.attack = Math.floor(self.attributes.attack * 1.25);
      }
    },
    cost: 75
  },
  {
    passive: {
      id: 'parry',
      name: 'Parry',
      description: '30% chance take 0 damage',
      onHit: (self: BattleMonster, _attacker: BattleMonster, damage: number) => {
        if (Math.random() < 0.3) {
          self.currentHp = Math.min(self.attributes.maxHp, self.currentHp + damage);
        }
        return damage;
      }
    },
    cost: 90
  },
  {
    passive: {
      id: 'vitality',
      name: 'Vitality',
      description: '+30% max HP',
      onApply: (self: BattleMonster) => {
        const bonus = Math.floor(self.attributes.maxHp * 0.3);
        self.attributes.maxHp += bonus;
        self.currentHp += bonus;
      }
    },
    cost: 80
  }
];

export function getItemById(id: string): EquippableItem | undefined {
  return ALL_ITEMS.find(item => item.id === id);
}
