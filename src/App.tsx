import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BattleMonster, BattleState, MonsterTemplate, TeamMonster, BattleLogEntry } from './types/monster';
import { STARTER_MONSTERS, ALL_MONSTERS, getMonsterById } from './data/monsters';
import { ALL_ITEMS, SHOP_PASSIVE_ENTRIES, getItemById } from './data/items';
import {
  startNewGame,
  saveGameState,
  initializeGame,
  generateEnemies,
  createPlayerTeam,
  processAttack,
  processAbility,
  processUltimate,
  updateCooldowns,
  createBattle,
  generateNickname,
  triggerTurnStart,
} from './engine/BattleEngine';
import { Sword, Shield, Heart, Zap, Coins, ShoppingBag, Users, ChevronUp, ChevronDown, Trash2, RefreshCw, Play, Skull, X, Sparkles, Target, TrendingUp, Award, Minimize2, Maximize2, Package } from 'lucide-react';

// ========== STYLES ==========
const styles = {
  page: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4',
  card: 'bg-slate-800/90 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl',
  button: 'px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2',
  buttonPrimary: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25',
  buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
  buttonDanger: 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white',
  input: 'bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500',
};

const statDescriptions: Record<string, string> = {
  hp: 'Maximum health points. +25 HP per upgrade.',
  attack: 'Base damage added to each attack. +3 per upgrade.',
  defense: 'Reduces incoming damage by 0.5 × defense. +3 per upgrade.',
  attackSpeed: 'Attacks per second. Base is 0.8–1.5. +0.02 attacks/s per upgrade.',
  critChance: 'Chance to deal critical hit damage. +2% per upgrade.',
  critDamage: 'Damage multiplier on crits (e.g. 1.5 = 150%). +5% per upgrade.',
  dodgeChance: 'Chance to completely avoid an attack. +2% per upgrade.',
  damageReduction: 'Flat % of damage blocked before defense. +2% per upgrade.',
  penetration: '% of enemy defense ignored when dealing damage. +2% per upgrade.',
  haste: 'Reduces ability cooldown durations. +2% per upgrade.',
};

const upgradeCosts: Record<string, number> = {
  hp: 15,
  attack: 15,
  defense: 15,
  attackSpeed: 20,
  critChance: 25,
  critDamage: 30,
  dodgeChance: 20,
  damageReduction: 25,
  penetration: 20,
  haste: 20,
};

const upgradeAmounts: Record<string, number> = {
  hp: 25,
  attack: 3,
  defense: 3,
  attackSpeed: 0.02,
  critChance: 0.02,
  critDamage: 0.05,
  dodgeChance: 0.02,
  damageReduction: 0.02,
  penetration: 0.02,
  haste: 0.02,
};

const PCT_STAT_LABELS: Record<string, string> = {
  critChance: 'Crit Chance', critDamage: 'Crit DMG', dodgeChance: 'Dodge',
  damageReduction: 'DMG Red.', penetration: 'Penetration', haste: 'Haste',
  attack: 'Attack', defense: 'Defense', hp: 'HP', maxHp: 'HP', attackSpeed: 'Atk Speed',
};
function formatItemStat(key: string, rawValue: number): string {
  const pctStats = new Set(['critChance', 'critDamage', 'dodgeChance', 'damageReduction', 'penetration', 'haste']);
  const label = PCT_STAT_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1');
  if (pctStats.has(key)) return `+${rawValue}% ${label}`;
  if (key === 'attackSpeed') return `+${(rawValue / 10).toFixed(1)} ${label}`;
  return `+${rawValue} ${label}`;
}

// ========== TOOLTIP COMPONENT ==========
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div
      className="inline-block w-full"
      onMouseEnter={(e) => { setIsVisible(true); setPosition({ x: e.clientX, y: e.clientY }); }}
      onMouseLeave={() => setIsVisible(false)}
      onMouseMove={(e) => setPosition({ x: e.clientX, y: e.clientY })}
    >
      {children}
      {isVisible && (
        <div
          className="fixed px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-200 z-[100] pointer-events-none shadow-xl max-w-xs"
          style={{
            left: Math.min(position.x + 15, window.innerWidth - 220),
            top: position.y - 10,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

// ========== MONSTER PREVIEW MODAL ==========
function MonsterPreviewModal({
  monster,
  teamMonster,
  onClose,
}: {
  monster: MonsterTemplate;
  teamMonster?: TeamMonster;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${styles.card} p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: monster.color }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="text-6xl mb-3"
            style={{ filter: `drop-shadow(0 0 30px ${monster.color})` }}
          >
            {monster.emoji}
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{monster.name}</h2>
          <p className="text-sm text-slate-400">Tier {monster.tier}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Attributes */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">BASE STATS</h3>
            </div>
            <div className="space-y-2">
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Maximum health points">
                  <span className="text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> HP</span>
                </Tooltip>
                <span className="text-red-400 font-semibold">{monster.baseAttributes.hp}</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Base damage per attack">
                  <span className="text-slate-400 flex items-center gap-1"><Sword className="w-3 h-3 text-orange-400" /> Attack</span>
                </Tooltip>
                <span className="text-orange-400 font-semibold">{monster.baseAttributes.attack}</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Reduces incoming damage">
                  <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> Defense</span>
                </Tooltip>
                <span className="text-blue-400 font-semibold">{monster.baseAttributes.defense}</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Attacks per second">
                  <span className="text-slate-400">Speed</span>
                </Tooltip>
                <span className="text-cyan-400 font-semibold">{monster.baseAttributes.attackSpeed.toFixed(1)}/s</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Chance to deal critical damage">
                  <span className="text-slate-400">Crit %</span>
                </Tooltip>
                <span className="text-amber-400 font-semibold">{(monster.baseAttributes.critChance * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Damage multiplier on critical hits">
                  <span className="text-slate-400">Crit DMG</span>
                </Tooltip>
                <span className="text-amber-400 font-semibold">{(monster.baseAttributes.critDamage * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Chance to avoid attacks completely">
                  <span className="text-slate-400">Dodge</span>
                </Tooltip>
                <span className="text-green-400 font-semibold">{(monster.baseAttributes.dodgeChance * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Percentage of damage ignored">
                  <span className="text-slate-400">DMG Red.</span>
                </Tooltip>
                <span className="text-blue-400 font-semibold">{(monster.baseAttributes.damageReduction * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Ignores enemy defense percentage">
                  <span className="text-slate-400">Penetration</span>
                </Tooltip>
                <span className="text-purple-400 font-semibold">{(monster.baseAttributes.penetration * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between items-center text-sm">
                <Tooltip text="Reduces ability cooldowns">
                  <span className="text-slate-400">Haste</span>
                </Tooltip>
                <span className="text-pink-400 font-semibold">{(monster.baseAttributes.haste * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Passive */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-purple-400">PASSIVE: {monster.passive.name}</h3>
              </div>
              <p className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-xl">{monster.passive.description}</p>
            </div>
          </div>

          {/* Right: Abilities */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-cyan-400">ABILITIES</h3>
            </div>
            <div className="space-y-3 mb-6">
              {monster.abilities.map((ability) => (
                <div key={ability.id} className="bg-slate-700/50 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-cyan-300">{ability.name}</span>
                    <div className="text-xs text-slate-400">
                      {ability.cooldown}s CD
                    </div>
                  </div>
                  <p className="text-sm text-slate-300">{ability.description}</p>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-slate-600 rounded text-slate-300">
                      {ability.targetCount === 0 ? 'All Enemies' : ability.targetCount === 1 ? 'Single Target' : `${ability.targetCount} Targets`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Ultimate */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-400">ULTIMATE: {monster.ultimate.name}</h3>
              </div>
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 p-3 rounded-xl">
                <p className="text-sm text-slate-200">{monster.ultimate.description}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 bg-yellow-700/30 rounded text-yellow-300">
                    {monster.ultimate.targetCount === 0 ? 'All Enemies' : monster.ultimate.targetCount === 1 ? 'Single Target' : `${monster.ultimate.targetCount} Targets`}
                  </span>
                  <span className="text-xs px-2 py-1 bg-yellow-700/30 rounded text-yellow-300">
                    Charge: {monster.ultimate.meterMax}
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-400">
                    Charges on attacks, hits, and abilities
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team-specific upgrades and passives */}
        {teamMonster && (
          <div className="mt-6 space-y-4 border-t border-slate-700 pt-4">
            {/* Stat upgrades */}
            {Object.keys(teamMonster.upgrades).length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-400">PURCHASED UPGRADES</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(teamMonster.upgrades).map(([stat, val]) => (
                    <span key={stat} className="text-xs px-2 py-1 bg-emerald-900/30 border border-emerald-700/30 rounded text-emerald-300">
                      {stat.replace(/([A-Z])/g, ' $1')}: +{(val as number)}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {/* Merge count */}
            {teamMonster.mergeCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400">★ Merged {teamMonster.mergeCount}×</span>
                <span className="text-slate-400 text-xs">({(teamMonster.mergeCount * 10)}% stat bonus)</span>
              </div>
            )}
            {/* Equipped item */}
            {teamMonster.equippedItemId && (() => {
              const item = getItemById(teamMonster.equippedItemId);
              if (!item) return null;
              return (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-cyan-400">EQUIPPED ITEM</h3>
                  </div>
                  <div className="bg-slate-700/50 p-3 rounded-xl text-sm">
                    <p className="font-semibold text-slate-100 mb-1">{item.emoji} {item.name}</p>
                    <p className="text-slate-400 text-xs mb-2">{item.description}</p>
                    {item.statBonus && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(item.statBonus).map(([k, v]) => (
                          <span key={k} className="text-xs px-2 py-0.5 bg-cyan-900/30 rounded text-cyan-300">
                            {formatItemStat(k, v as number)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
            {/* Extra passives */}
            {teamMonster.extraPassiveIds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-purple-400">PURCHASED PASSIVES</h3>
                </div>
                <div className="space-y-2">
                  {teamMonster.extraPassiveIds.map(pid => {
                    const entry = SHOP_PASSIVE_ENTRIES.find(e => e.passive.id === pid);
                    if (!entry) return null;
                    return (
                      <div key={pid} className="bg-slate-700/50 p-2 rounded-lg text-xs">
                        <p className="font-semibold text-purple-300">{entry.passive.name}</p>
                        <p className="text-slate-400 mt-0.5">{entry.passive.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ========== BATTLE RESULTS SCREEN ==========
function BattleResultsScreen({
  winner,
  goldReward,
  defeatedEnemies,
  allEnemies,
  newUnlocks,
  battleCount,
  playerTeam,
  battleStats,
  onRecruitMonster,
  onContinue,
}: {
  winner: 'player' | 'enemy';
  goldReward: number;
  defeatedEnemies: BattleMonster[];
  allEnemies: BattleMonster[];
  newUnlocks: string[];
  battleCount: number;
  playerTeam: BattleMonster[];
  battleStats?: Record<string, { damageDealt: number; damageTaken: number; healing: number; kills: number; nickname: string }>;
  onRecruitMonster: (monsterId: string) => void;
  onContinue: () => void;
}) {
  const isVictory = winner === 'player';
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasRecruited, setHasRecruited] = useState(false);
  const [recruitedTemplateId, setRecruitedTemplateId] = useState<string | null>(null);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className={`${styles.card} p-4 flex items-center gap-3 hover:border-cyan-500 transition-colors`}
        >
          <span className={`text-2xl ${isVictory ? 'animate-bounce' : 'animate-pulse'}`}>
            {isVictory ? '🏆' : '💀'}
          </span>
          <div className="text-left">
            <p className={`font-bold ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
              {isVictory ? 'VICTORY!' : 'DEFEAT!'}
            </p>
            <p className="text-sm text-slate-400">Battle {battleCount}</p>
          </div>
          <Maximize2 className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${styles.card} p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto relative`}>
        {/* Continue + Minimize row */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onContinue}
            className={`${styles.button} ${styles.buttonPrimary} px-8 py-3 text-lg flex-1`}
          >
            {isVictory ? 'Continue to Next Battle' : 'Return to Team'}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>

        {/* Victory/Defeat Banner */}
        <div className={`text-6xl mb-4 text-center ${isVictory ? 'animate-bounce' : 'animate-pulse'}`}>
          {isVictory ? '🏆' : '💀'}
        </div>
        <h1 className={`text-4xl font-bold mb-2 text-center ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
          {isVictory ? 'VICTORY!' : 'DEFEAT!'}
        </h1>
        <p className="text-slate-400 mb-6 text-center">
          Battle {battleCount} {isVictory ? 'completed' : 'failed'}
        </p>

        {/* Rewards and Recruitment (if victory) */}
        {isVictory && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">+{goldReward}</span>
            </div>

            {/* Defeated Enemies - Recruitment */}
            {defeatedEnemies.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase mb-2">Recruit one defeated enemy</p>
                <div className="flex justify-center gap-3 flex-wrap">
                  {defeatedEnemies.map((enemy) => {
                    const isThisRecruited = recruitedTemplateId === enemy.template.id;
                    const isDisabled = hasRecruited && !isThisRecruited;
                    return (
                      <button
                        key={enemy.id}
                        onClick={() => {
                          if (!hasRecruited) {
                            onRecruitMonster(enemy.template.id);
                            setHasRecruited(true);
                            setRecruitedTemplateId(enemy.template.id);
                          }
                        }}
                        disabled={isDisabled || isThisRecruited}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                          isThisRecruited
                            ? 'border-emerald-500/50 bg-emerald-900/20 cursor-not-allowed'
                            : isDisabled
                              ? 'border-slate-700 opacity-40 cursor-not-allowed'
                              : 'border-slate-600 hover:border-cyan-500 hover:bg-slate-700/50 cursor-pointer'
                        }`}
                        title={isThisRecruited ? 'Recruited!' : `Recruit ${enemy.template.name}`}
                      >
                        <span className="text-3xl" style={{ filter: `drop-shadow(0 0 10px ${enemy.template.color})` }}>
                          {enemy.template.emoji}
                        </span>
                        <span className="text-xs text-slate-300">{enemy.template.name}</span>
                        {isThisRecruited && (
                          <span className="text-xs text-emerald-400 font-semibold">Recruited!</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Unlocks */}
            {newUnlocks.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <p className="text-sm font-semibold text-purple-400">NEW MONSTERS UNLOCKED!</p>
                </div>
                <div className="flex justify-center flex-wrap gap-2">
                  {newUnlocks.map((id) => {
                    const template = getMonsterById(id);
                    if (!template) return null;
                    return (
                      <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 border border-purple-500/30 rounded-lg">
                        <span className="text-xl">{template.emoji}</span>
                        <span className="text-sm text-purple-200">{template.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Defeat message */}
        {!isVictory && (
          <p className="text-slate-400 mb-6 text-center">
            Your monsters have fallen. Upgrade your team and try again!
          </p>
        )}

        {/* Enemy Team Stats */}
        {allEnemies.length > 0 && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-red-400 mb-3">ENEMY TEAM</p>
            <div className="space-y-2">
              {allEnemies.map((enemy) => {
                const stats = battleStats?.[enemy.id];
                return (
                  <div key={enemy.id} className="bg-slate-800/50 p-3 rounded-lg text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{enemy.template.emoji}</span>
                      <span className={`font-semibold ${enemy.isAlive ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{enemy.nickname}</span>
                      {!enemy.isAlive && <span className="text-xs text-red-500">DEFEATED</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Damage Dealt</p>
                        <p className="text-orange-400 font-semibold">{Math.floor(stats?.damageDealt ?? enemy.totalDamageDealt)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Damage Taken</p>
                        <p className="text-red-400 font-semibold">{Math.floor(stats?.damageTaken ?? enemy.totalDamageTaken)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Healing Done</p>
                        <p className="text-green-400 font-semibold">{Math.floor(stats?.healing ?? enemy.totalHealing)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Kills</p>
                        <p className="text-yellow-400 font-semibold">{stats?.kills ?? enemy.kills}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Player Team Stats */}
        {playerTeam.length > 0 && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <p className="text-sm font-semibold text-cyan-400 mb-3">YOUR TEAM</p>
            <div className="space-y-2">
              {playerTeam.map((monster) => {
                const stats = battleStats?.[monster.id];
                return (
                  <div key={monster.id} className="bg-slate-800/50 p-3 rounded-lg text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{monster.template.emoji}</span>
                      <span className={`font-semibold ${monster.isAlive ? 'text-slate-200' : 'text-slate-500 line-through'}`}>{monster.nickname}</span>
                      {!monster.isAlive && <span className="text-xs text-red-500">DEFEATED</span>}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Damage Dealt</p>
                        <p className="text-orange-400 font-semibold">{Math.floor(stats?.damageDealt ?? monster.totalDamageDealt)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Damage Taken</p>
                        <p className="text-red-400 font-semibold">{Math.floor(stats?.damageTaken ?? monster.totalDamageTaken)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Healing Done</p>
                        <p className="text-green-400 font-semibold">{Math.floor(stats?.healing ?? monster.totalHealing)}</p>
                      </div>
                      <div className="bg-slate-700/50 rounded p-1.5 text-center">
                        <p className="text-slate-500 mb-0.5">Kills</p>
                        <p className="text-yellow-400 font-semibold">{stats?.kills ?? monster.kills}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== STARTER SELECTION SCREEN ==========
function StarterSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className={styles.page}>
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-transparent bg-clip-text mb-4">
          Monster Autobattler
        </h1>
        <p className="text-slate-400 text-lg">Choose your first monster to begin your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl">
        {STARTER_MONSTERS.map((monster) => (
          <div
            key={monster.id}
            className={`${styles.card} p-6 cursor-pointer transform hover:scale-105 hover:border-cyan-500 transition-all duration-300 group`}
            onClick={() => onSelect(monster.id)}
          >
            <div className="text-center">
              <div
                className="text-7xl mb-4 transform group-hover:scale-125 transition-transform duration-300"
                style={{ filter: `drop-shadow(0 0 20px ${monster.color})` }}
              >
                {monster.emoji}
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2">{monster.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{monster.passive.description}</p>

              <div className="space-y-2 text-left mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">HP</span>
                  <span className="text-red-400 font-semibold">{monster.baseAttributes.hp}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Attack</span>
                  <span className="text-orange-400 font-semibold">{monster.baseAttributes.attack}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Defense</span>
                  <span className="text-blue-400 font-semibold">{monster.baseAttributes.defense}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Speed</span>
                  <span className="text-cyan-400 font-semibold">{monster.baseAttributes.attackSpeed.toFixed(1)}/s</span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-500 mb-2">ABILITIES</p>
                {monster.abilities.map((ability) => (
                  <div key={ability.id} className="text-xs text-slate-400 mb-1">
                    <span className="text-cyan-400">{ability.name}:</span> {ability.description}
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4 mt-4">
                <p className="text-xs text-slate-500 mb-2">ULTIMATE</p>
                <p className="text-xs text-slate-400">
                  <span className="text-yellow-400">{monster.ultimate.name}:</span> {monster.ultimate.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== MONSTER CARD COMPONENT ==========
function MonsterCard({
  monster,
  showActions = false,
  onRemove,
  onPreview,
  isEnemy = false,
  aggroLabel,
}: {
  monster: BattleMonster;
  showActions?: boolean;
  onRemove?: () => void;
  onPreview?: () => void;
  isEnemy?: boolean;
  aggroLabel?: string;
}) {
  const hpPercent = (monster.currentHp / monster.attributes.maxHp) * 100;
  const ultiPercent = (monster.ultimateMeter / monster.template.ultimate.meterMax) * 100;
  const shieldValue = (monster as BattleMonster & { shield?: number }).shield || 0;
  const mergeStars = monster.mergeCount > 0 ? `★×${monster.mergeCount}` : '';

  return (
    <div
      className={`${styles.card} p-4 relative overflow-hidden ${!monster.isAlive ? 'opacity-50 grayscale' : ''} ${onPreview ? 'cursor-pointer hover:border-cyan-500' : ''}`}
      style={{ borderColor: monster.isAlive ? monster.template.color : undefined }}
      onClick={onPreview}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-2xl" style={{ background: monster.template.color }} />

      <div className="flex items-start gap-3">
        <div className="relative">
          <div className={`text-4xl ${monster.isAlive ? '' : 'opacity-50'}`} style={{ filter: `drop-shadow(0 0 10px ${monster.template.color})` }}>
            {monster.template.emoji}
          </div>
          {(monster as BattleMonster & { stunned?: boolean }).stunned && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-yellow-400 text-xs animate-pulse">STUNNED</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
            <h4 className="font-semibold text-slate-100 truncate text-sm leading-tight">{monster.nickname}</h4>
            {mergeStars && <span className="text-yellow-400 text-xs whitespace-nowrap shrink-0">{mergeStars}</span>}
            {isEnemy && <span className="text-xs text-red-400 font-bold shrink-0">ENEMY</span>}
          </div>
          {/* Aggro label on its own row */}
          {aggroLabel && (
            <div className="mb-1">
              <span className="text-xs px-1.5 py-0.5 bg-red-900/50 border border-red-700/50 rounded text-red-300">
                {aggroLabel}
              </span>
            </div>
          )}

          {/* Shield bar if present */}
          {shieldValue > 0 && (
            <div className="mb-1">
              <div className="flex items-center justify-between text-xs mb-0.5">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-slate-400">{Math.floor(shieldValue)}</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-400"
                  style={{ width: `${Math.min(100, (shieldValue / monster.attributes.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* HP bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-slate-400">{Math.floor(monster.currentHp)} / {monster.attributes.maxHp}</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 bg-gradient-to-r from-red-600 to-red-400"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Ultimate bar */}
          <div className="mb-2">
            <Tooltip text={`Ultimate: ${monster.template.ultimate.name}. Charges by attacking (+10), taking hits (+8), or using abilities (+15).`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-slate-400">{Math.floor(monster.ultimateMeter)} / {monster.template.ultimate.meterMax}</span>
              </div>
            </Tooltip>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-400"
                style={{ width: `${ultiPercent}%` }}
              />
            </div>
          </div>

          {/* Equipped item — only shown in battle view; team management shows it in the equipment section */}
          {monster.equippedItem && !showActions && (
            <Tooltip text={`${monster.equippedItem.name}: ${monster.equippedItem.description}`}>
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1 cursor-help">
                <Package className="w-3 h-3 text-cyan-400" />
                {monster.equippedItem.emoji} {monster.equippedItem.name}
              </div>
            </Tooltip>
          )}

          {/* Extra passives */}
          {monster.extraPassives.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1">
              {monster.extraPassives.map(p => (
                <Tooltip key={p.id} text={p.description}>
                  <span className="text-xs px-1.5 py-0.5 bg-purple-900/40 border border-purple-700/40 rounded text-purple-300 cursor-help">
                    {p.name}
                  </span>
                </Tooltip>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <Sword className="w-3 h-3 text-orange-400" />
              <span className="text-slate-300">{monster.attributes.attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-slate-300">{monster.attributes.defense}</span>
            </div>
          </div>
        </div>
      </div>

      {showActions && onRemove && (
        <Tooltip text="Remove from team">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

// ========== BATTLE LOG COMPONENT ==========
function BattleLog({ log }: { log: BattleLogEntry[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div
      ref={containerRef}
      className="h-36 overflow-y-auto bg-slate-900/50 rounded-xl p-3 text-xs font-mono border border-slate-700"
    >
      {log.map((entry, i) => {
        const timeStr = (entry.timestamp / 1000).toFixed(1);
        const isPlayer = entry.actorTeam === 'player';
        const color = isPlayer ? 'text-cyan-400' : 'text-red-400';
        const isCrit = entry.isCrit ? 'font-bold text-orange-400' : '';
        const isKill = entry.isKill ? 'font-bold text-yellow-400' : '';
        const isUltimate = entry.isUltimate ? 'font-bold text-yellow-300' : '';

        return (
          <div key={i} className={`${color} ${isCrit} ${isKill} ${isUltimate}`}>
            <span className="text-slate-600 mr-2">[{timeStr}s]</span>
            {entry.message}
          </div>
        );
      })}
    </div>
  );
}

// ========== SHOP COMPONENT ==========
function Shop({
  gold,
  gameState,
  onPurchaseMonster,
  onPurchaseItem,
  onPurchasePassive,
  onPurchaseUpgrade,
  onPreviewMonster,
  battleCount,
}: {
  gold: number;
  gameState: GameState;
  onPurchaseMonster: (templateId: string, cost: number) => void;
  onPurchaseItem: (itemId: string, cost: number) => void;
  onPurchasePassive: (passiveId: string, cost: number, teamMonsterIndex: number) => void;
  onPurchaseUpgrade: (teamMonsterIndex: number, stat: string) => void;
  onPreviewMonster: (template: MonsterTemplate) => void;
  battleCount: number;
}) {
  const [tab, setTab] = useState<'monsters' | 'upgrades' | 'items' | 'passives'>('monsters');
  const [selectedTeamMonsterForPassive, setSelectedTeamMonsterForPassive] = useState<number>(0);

  const lockedMonsters = ALL_MONSTERS.filter(m => !gameState.unlockedMonsters.includes(m.id));

  // Simple deterministic shuffle based on battleCount
  const seededShuffle = <T,>(arr: T[], seed: number): T[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = ((seed * 31 + i * 17) % (i + 1) + i + 1) % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const displayedMonsters = seededShuffle(lockedMonsters, battleCount).slice(0, 6);
  const displayedItems = seededShuffle(ALL_ITEMS, battleCount + 1).slice(0, 6);
  const displayedPassives = seededShuffle(SHOP_PASSIVE_ENTRIES, battleCount + 2).slice(0, 3);

  return (
    <div className={`${styles.card} p-6 w-full max-w-4xl`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-cyan-400" />
          Shop
        </h2>
        <div className="flex items-center gap-2 text-xl font-bold text-yellow-400">
          <Coins className="w-6 h-6" />
          {gold}
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setTab('monsters')}
          className={`${styles.button} ${tab === 'monsters' ? styles.buttonPrimary : styles.buttonSecondary} text-sm`}
        >
          <Users className="w-4 h-4" />
          Monsters
        </button>
        <button
          onClick={() => setTab('upgrades')}
          className={`${styles.button} ${tab === 'upgrades' ? styles.buttonPrimary : styles.buttonSecondary} text-sm`}
        >
          <TrendingUp className="w-4 h-4" />
          Upgrades
        </button>
        <button
          onClick={() => setTab('items')}
          className={`${styles.button} ${tab === 'items' ? styles.buttonPrimary : styles.buttonSecondary} text-sm`}
        >
          <Package className="w-4 h-4" />
          Items
        </button>
        <button
          onClick={() => setTab('passives')}
          className={`${styles.button} ${tab === 'passives' ? styles.buttonPrimary : styles.buttonSecondary} text-sm`}
        >
          <Sparkles className="w-4 h-4" />
          Passives
        </button>
      </div>

      {/* Monsters Tab */}
      {tab === 'monsters' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">Showing 6 random monsters. Changes after each battle.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedMonsters.map((monster) => {
              const tierCosts: Record<number, number> = { 1: 50, 2: 150, 3: 300 };
              const cost = tierCosts[monster.tier] || 50;
              const canAfford = gold >= cost;
              const inInventory = gameState.monsterInventory[monster.id] || 0;
              const inTeam = gameState.team.filter(tm => tm.templateId === monster.id).length;

              return (
                <div
                  key={monster.id}
                  className={`${styles.card} p-4 cursor-pointer hover:border-cyan-500 transition-colors`}
                  onClick={() => onPreviewMonster(monster)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl" style={{ filter: `drop-shadow(0 0 10px ${monster.color})` }}>
                      {monster.emoji}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-100">{monster.name}</h4>
                      <p className="text-xs text-slate-400">Tier {monster.tier}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{monster.passive.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-yellow-400 font-semibold flex items-center gap-1 text-sm">
                        <Coins className="w-4 h-4" />
                        {cost}
                      </span>
                      <span className="text-xs text-slate-500">Owned: {inInventory} (Team: {inTeam})</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPurchaseMonster(monster.id, cost); }}
                      disabled={!canAfford}
                      className={`${styles.button} ${canAfford ? styles.buttonPrimary : 'bg-slate-600 text-slate-400 cursor-not-allowed'} text-sm`}
                    >
                      Recruit
                    </button>
                  </div>
                </div>
              );
            })}
            {lockedMonsters.length === 0 && (
              <div className="col-span-full">
                <p className="text-slate-400 text-center py-4 mb-4">All monsters unlocked!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrades Tab */}
      {tab === 'upgrades' && (
        <div className="space-y-6">
          {gameState.team.map((teamMonster, index) => {
            const template = getMonsterById(teamMonster.templateId);
            if (!template) return null;

            return (
              <div key={`${teamMonster.templateId}_${index}`} className={`${styles.card} p-4 border border-slate-700`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{template.emoji}</span>
                  <div>
                    <h4 className="font-semibold text-slate-100">{teamMonster.nickname}</h4>
                    <p className="text-xs text-slate-500">Slot {index + 1}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(upgradeCosts).map(([stat, cost]) => {
                    const canAfford = gold >= cost;

                    return (
                      <Tooltip key={stat} text={statDescriptions[stat] || stat}>
                        <button
                          onClick={() => onPurchaseUpgrade(index, stat)}
                          disabled={!canAfford}
                          className={`p-3 rounded-xl text-left transition-all w-full ${canAfford ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 opacity-50 cursor-not-allowed'}`}
                        >
                          <p className="text-xs text-slate-400 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-semibold text-emerald-400">+{upgradeAmounts[stat]}</p>
                          <p className="text-xs text-slate-500">{((teamMonster.upgrades as Record<string, number>)[stat] || 0).toFixed(2).replace(/\.?0+$/, '')} bonus</p>
                          <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                            <Coins className="w-3 h-3" />
                            {cost}
                          </p>
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {gameState.team.length === 0 && (
            <p className="text-slate-400 text-center py-8">Add monsters to your team to upgrade them.</p>
          )}
        </div>
      )}

      {/* Items Tab */}
      {tab === 'items' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">Showing 6 random items. Buy and equip from team management.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => {
              const canAfford = gold >= item.cost;

              return (
                <div key={item.id} className={`${styles.card} p-4`}>
                  <div className="mb-3">
                    <h4 className="font-semibold text-slate-100">{item.name}</h4>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                  <div className="space-y-2 mb-3 text-xs">
                    {item.statBonus && Object.entries(item.statBonus).map(([stat, value]) => (
                      <div key={stat} className="text-emerald-400">
                        {formatItemStat(stat, value as number)}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400 font-semibold flex items-center gap-1">
                      <Coins className="w-4 h-4" />
                      {item.cost}
                    </span>
                    <button
                      onClick={() => onPurchaseItem(item.id, item.cost)}
                      disabled={!canAfford}
                      className={`${styles.button} ${canAfford ? styles.buttonPrimary : 'bg-slate-600 text-slate-400 cursor-not-allowed'} text-sm`}
                    >
                      Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Passives Tab */}
      {tab === 'passives' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">Showing 3 random passives. Select a team member to assign.</p>
          {gameState.team.length > 0 ? (
            <>
              <div className="mb-4 flex gap-2 flex-wrap">
                {gameState.team.map((tm, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTeamMonsterForPassive(idx)}
                    className={`${styles.button} text-sm ${selectedTeamMonsterForPassive === idx ? styles.buttonPrimary : styles.buttonSecondary}`}
                  >
                    {tm.nickname}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedPassives.map((entry) => {
                  const canAfford = gold >= entry.cost;
                  const teamMonster = gameState.team[selectedTeamMonsterForPassive];
                  const alreadyHas = teamMonster?.extraPassiveIds.includes(entry.passive.id);
                  const canAdd = !alreadyHas && teamMonster?.extraPassiveIds.length < 2;

                  return (
                    <div key={entry.passive.id} className={`${styles.card} p-4`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <h4 className="font-semibold text-slate-100">{entry.passive.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">{entry.passive.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400 font-semibold flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          {entry.cost}
                        </span>
                        <button
                          onClick={() => onPurchasePassive(entry.passive.id, entry.cost, selectedTeamMonsterForPassive)}
                          disabled={!canAfford || !canAdd || alreadyHas}
                          className={`${styles.button} ${(canAfford && canAdd && !alreadyHas) ? styles.buttonPrimary : 'bg-slate-600 text-slate-400 cursor-not-allowed'} text-sm`}
                        >
                          {alreadyHas ? 'Owned' : canAdd ? 'Buy' : 'Full'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-center py-8">Add monsters to your team to buy passives for them.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ========== TEAM MANAGEMENT COMPONENT ==========
function TeamManagement({
  gameState,
  onAddMonster,
  onRemoveMonster,
  onPreviewMonster,
  onReorderMonster,
  onMergeMonster,
  onEquipItem,
  ownedItemIds = [],
}: {
  gameState: GameState;
  onAddMonster: (templateId: string) => void;
  onRemoveMonster: (index: number) => void;
  onPreviewMonster: (template: MonsterTemplate, teamMonster?: TeamMonster) => void;
  onReorderMonster?: (fromIndex: number, toIndex: number) => void;
  onMergeMonster: (teamMonsterIndex: number) => void;
  onEquipItem: (teamMonsterIndex: number, itemId: string | undefined) => void;
  ownedItemIds?: string[];
}) {
  const createDisplayMonster = (teamMonster: TeamMonster): BattleMonster | null => {
    const template = getMonsterById(teamMonster.templateId);
    if (!template) return null;

    // Build attributes applying upgrades
    const baseAttrs = template.baseAttributes;
    const upgrades = teamMonster.upgrades as Record<string, number>;
    let maxHp = baseAttrs.hp + (upgrades['hp'] || 0);
    let attack = baseAttrs.attack + (upgrades['attack'] || 0);
    let defense = baseAttrs.defense + (upgrades['defense'] || 0);
    let attackSpeed = baseAttrs.attackSpeed + (upgrades['attackSpeed'] || 0);
    let critChance = baseAttrs.critChance + (upgrades['critChance'] || 0);
    let critDamage = baseAttrs.critDamage + (upgrades['critDamage'] || 0);
    let dodgeChance = baseAttrs.dodgeChance + (upgrades['dodgeChance'] || 0);
    let damageReduction = baseAttrs.damageReduction + (upgrades['damageReduction'] || 0);
    let penetration = baseAttrs.penetration + (upgrades['penetration'] || 0);
    let haste = baseAttrs.haste + (upgrades['haste'] || 0);

    // Apply merge bonus (+10% per merge)
    if (teamMonster.mergeCount > 0) {
      const mult = 1 + (0.1 * teamMonster.mergeCount);
      maxHp = Math.floor(maxHp * mult);
      attack = Math.floor(attack * mult);
      defense = Math.floor(defense * mult);
    }

    // Apply item stat bonuses (normalized to attribute scale)
    const equippedItem = teamMonster.equippedItemId ? getItemById(teamMonster.equippedItemId) : undefined;
    if (equippedItem?.statBonus) {
      const pctStats = new Set(['critChance', 'critDamage', 'dodgeChance', 'damageReduction', 'penetration', 'haste']);
      Object.entries(equippedItem.statBonus).forEach(([key, value]) => {
        if (value === undefined) return;
        const normalized = pctStats.has(key) ? value / 100 : key === 'attackSpeed' ? value / 10 : value;
        if (key === 'hp' || key === 'maxHp') maxHp += normalized;
        else if (key === 'attack') attack += normalized;
        else if (key === 'defense') defense += normalized;
        else if (key === 'attackSpeed') attackSpeed += normalized;
        else if (key === 'critChance') critChance += normalized;
        else if (key === 'critDamage') critDamage += normalized;
        else if (key === 'dodgeChance') dodgeChance += normalized;
        else if (key === 'damageReduction') damageReduction += normalized;
        else if (key === 'penetration') penetration += normalized;
        else if (key === 'haste') haste += normalized;
      });
    }

    return {
      id: `display-${teamMonster.templateId}-${Math.random()}`,
      template,
      nickname: teamMonster.nickname,
      mergeCount: teamMonster.mergeCount,
      attributes: { hp: maxHp, maxHp, attack, defense, attackSpeed, critChance, critDamage, dodgeChance, damageReduction, penetration, haste },
      currentHp: maxHp,
      ultimateMeter: 0,
      abilityCooldowns: [0, 0] as [number, number],
      abilityDelays: [0, 0] as [number, number],
      isAlive: true,
      team: 'player' as const,
      lastAttackTime: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalHealing: 0,
      kills: 0,
      equippedItem,
      extraPassives: teamMonster.extraPassiveIds
        .map(id => SHOP_PASSIVE_ENTRIES.find(e => e.passive.id === id)?.passive)
        .filter(Boolean) as BattleMonster['extraPassives'],
      shield: 0,
    };
  };

  // Show all monsters in inventory (not just those already in team)
  const uniqueMonsters = Object.keys(gameState.monsterInventory).filter(id => (gameState.monsterInventory[id] || 0) > 0);

  return (
    <div className={`${styles.card} p-6 w-full max-w-4xl`}>
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-2">
        <Users className="w-6 h-6 text-cyan-400" />
        Your Team ({gameState.team.length}/3)
      </h2>
      <p className="text-xs text-slate-500 mb-4">Position matters: Front monsters (Slot 1) are targeted first. Rearrange using the arrow buttons.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {gameState.team.map((teamMonster, index) => {
          const monster = createDisplayMonster(teamMonster);
          if (!monster) return null;
          const canMerge = (gameState.monsterInventory[teamMonster.templateId] || 0) > gameState.team.filter(tm => tm.templateId === teamMonster.templateId).length;

          return (
            <div key={`${teamMonster.templateId}_${index}`} className="relative">
              <MonsterCard
                monster={monster}
                showActions
                onRemove={() => onRemoveMonster(index)}
                onPreview={() => onPreviewMonster(monster.template, teamMonster)}
                aggroLabel={`Aggro: ${index === 0 ? 'High' : index === 1 ? 'Med' : 'Low'}`}
              />
              {/* Reordering buttons */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {index > 0 && (
                  <button
                    onClick={() => onReorderMonster?.(index, index - 1)}
                    className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                    title="Move up (higher aggro)"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}
                {index < gameState.team.length - 1 && (
                  <button
                    onClick={() => onReorderMonster?.(index, index + 1)}
                    className="p-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-300 transition-colors"
                    title="Move down (lower aggro)"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
              {/* Merge button */}
              {canMerge && (
                <button
                  onClick={() => onMergeMonster(index)}
                  className={`${styles.button} ${styles.buttonSecondary} absolute bottom-2 left-2 text-xs`}
                  title="Merge with duplicate to gain +10% stats"
                >
                  <Sparkles className="w-3 h-3" />
                  Merge
                </button>
              )}
              {/* Equipment section */}
              <div className="mt-2 px-1">
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                  <Package className="w-3 h-3" />
                  <span>Item:</span>
                  {teamMonster.equippedItemId ? (() => {
                    const eqItem = getItemById(teamMonster.equippedItemId);
                    if (!eqItem) return null;
                    const statStr = eqItem.statBonus ? Object.entries(eqItem.statBonus).map(([k,v]) => formatItemStat(k, v as number)).join(', ') : '';
                    return (
                      <Tooltip text={`${eqItem.name}: ${eqItem.description}${statStr ? ' | ' + statStr : ''}`}>
                        <span className="text-cyan-400 flex items-center gap-1 cursor-help">
                          {eqItem.emoji} {eqItem.name}
                          <button
                            onClick={(e) => { e.stopPropagation(); onEquipItem(index, undefined); }}
                            className="ml-1 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      </Tooltip>
                    );
                  })() : (
                    <span className="text-slate-600">None</span>
                  )}
                </div>
                {!teamMonster.equippedItemId && ownedItemIds.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ownedItemIds
                      .filter(id => {
                        // Don't show items already equipped by other team members
                        const equippedBy = gameState.team.find(tm => tm.equippedItemId === id);
                        return !equippedBy;
                      })
                      .map(itemId => {
                        const item = getItemById(itemId);
                        if (!item) return null;
                        return (
                          <Tooltip key={itemId} text={`${item.name}: ${item.description}${item.statBonus ? ' | ' + Object.entries(item.statBonus).map(([k,v]) => formatItemStat(k, v as number)).join(', ') : ''}`}>
                            <button
                              onClick={() => onEquipItem(index, itemId)}
                              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
                            >
                              {item.emoji} {item.name}
                            </button>
                          </Tooltip>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {gameState.team.length < 3 && (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 flex items-center justify-center min-h-[180px]">
            <p className="text-slate-500">Add a monster</p>
          </div>
        )}
      </div>

      {/* Add Monster Section */}
      {uniqueMonsters.length > 0 && gameState.team.length < 3 && (
        <div>
          <p className="text-sm text-slate-400 mb-3">Available monsters (can add duplicates):</p>
          <div className="flex flex-wrap gap-2">
            {uniqueMonsters.map((templateId) => {
              const template = getMonsterById(templateId);
              if (!template) return null;
              const inInventory = gameState.monsterInventory[templateId] || 0;
              const inTeam = gameState.team.filter(tm => tm.templateId === templateId).length;
              const canAdd = inInventory > inTeam;

              return (
                <button
                  key={templateId}
                  onClick={() => onAddMonster(templateId)}
                  onContextMenu={(e) => { e.preventDefault(); onPreviewMonster(template); }}
                  disabled={!canAdd}
                  className={`${styles.button} ${canAdd ? styles.buttonSecondary : 'bg-slate-700 text-slate-400 cursor-not-allowed'} text-sm`}
                  title={`Own: ${inInventory}, In Team: ${inTeam}`}
                >
                  <span>{template.emoji}</span>
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Monsters in Reserve */}
      {gameState.unlockedMonsters.length > gameState.team.length && (
        <div className="mt-4 text-xs text-slate-500">
          You have {gameState.monsterInventory[uniqueMonsters[0]] || 0} monsters in reserve
        </div>
      )}
    </div>
  );
}

// ========== MAIN GAME COMPONENT ==========
function Game() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const state = initializeGame();
    return state;
  });
  const [showStarterSelect, setShowStarterSelect] = useState(false);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [previewMonster, setPreviewMonster] = useState<MonsterTemplate | null>(null);
  const [previewTeamMonster, setPreviewTeamMonster] = useState<TeamMonster | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState(1);
  const [battleStats, setBattleStats] = useState<Record<string, { damageDealt: number; damageTaken: number; healing: number; kills: number }>>({});
  const [resultsData, setResultsData] = useState<{
    winner: 'player' | 'enemy';
    goldReward: number;
    defeatedEnemies: BattleMonster[];
    allEnemies: BattleMonster[];
    playerTeam: BattleMonster[];
    newUnlocks: string[];
    battleNumber: number;
  } | null>(null);
  const battleLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const latestBattleRef = useRef<BattleState | null>(null);

  useEffect(() => {
    if (gameState.unlockedMonsters.length === 0) {
      setShowStarterSelect(true);
    }
  }, [gameState.unlockedMonsters.length]);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const handleStarterSelect = (id: string) => {
    const newState = startNewGame(id);
    setGameState(newState);
    setShowStarterSelect(false);
  };

  const startBattle = useCallback(() => {
    const playerTeam = createPlayerTeam(gameState);
    if (playerTeam.length === 0) return;

    const enemyTeam = generateEnemies(gameState.battleCount, playerTeam.length);
    const newBattle = createBattle(playerTeam, enemyTeam);
    setBattle(newBattle);
    setIsBattleActive(true);
    lastTimeRef.current = performance.now();
  }, [gameState]);

  const endBattle = useCallback((playerWon: boolean) => {
    setIsBattleActive(false);
    if (battleLoopRef.current) {
      cancelAnimationFrame(battleLoopRef.current);
    }

    const finalBattle = latestBattleRef.current || battle;
    if (finalBattle) {
      const battleNumber = gameState.battleCount + 1;
      const goldReward = playerWon ? 50 + (gameState.battleCount * 25) + finalBattle.enemyMonsters.length * 20 : 0;
      // Zero out HP for dead monsters so results show accurate HP
      const defeatedEnemies = finalBattle.enemyMonsters.map(m => ({
        ...m,
        currentHp: m.isAlive ? m.currentHp : 0,
      }));
      // Deduplicate by template ID — show only one of each monster type
      const seenTemplateIds = new Set<string>();
      const dedupedEnemies = defeatedEnemies.filter(m => {
        if (seenTemplateIds.has(m.template.id)) return false;
        seenTemplateIds.add(m.template.id);
        return true;
      });
      const defeatedMonsterIds = dedupedEnemies.map(m => m.template.id);
      const newUnlocks = playerWon ? [...new Set(defeatedMonsterIds.filter(id => !gameState.unlockedMonsters.includes(id)))] : [];

      // Build battle stats keyed by unique monster id (not template id)
      const stats: Record<string, { damageDealt: number; damageTaken: number; healing: number; kills: number; nickname: string }> = {};
      finalBattle.playerMonsters.forEach(m => {
        stats[m.id] = {
          damageDealt: m.totalDamageDealt || 0,
          damageTaken: m.totalDamageTaken || 0,
          healing: m.totalHealing || 0,
          kills: m.kills || 0,
          nickname: m.nickname,
        };
      });
      finalBattle.enemyMonsters.forEach(m => {
        stats[m.id] = {
          damageDealt: m.totalDamageDealt || 0,
          damageTaken: m.totalDamageTaken || 0,
          healing: m.totalHealing || 0,
          kills: m.kills || 0,
          nickname: m.nickname,
        };
      });
      setBattleStats(stats);

      // Update game state
      setGameState(prev => ({
        ...prev,
        gold: prev.gold + goldReward,
        battleCount: prev.battleCount + (playerWon ? 1 : 0),
        totalLosses: prev.totalLosses + (playerWon ? 0 : 1),
        unlockedMonsters: playerWon ? [...new Set([...prev.unlockedMonsters, ...newUnlocks])] : prev.unlockedMonsters,
      }));

      // Show results screen
      setResultsData({
        winner: playerWon ? 'player' : 'enemy',
        goldReward,
        defeatedEnemies: dedupedEnemies,
        allEnemies: finalBattle.enemyMonsters,
        playerTeam: finalBattle.playerMonsters,
        newUnlocks,
        battleNumber,
      });
      setShowResults(true);
    }
  }, [gameState.battleCount, gameState.unlockedMonsters, battle]);

  const handleContinue = () => {
    setShowResults(false);
    setResultsData(null);
    setBattle(null);
  };

  // Main battle loop
  useEffect(() => {
    if (!isBattleActive || !battle) return;

    const tick = (timestamp: number) => {
      let deltaTime = (timestamp - lastTimeRef.current) / 1000;
      deltaTime *= battleSpeed;
      lastTimeRef.current = timestamp;

      setBattle(prevBattle => {
        if (!prevBattle || prevBattle.isOver) return prevBattle;

        const newLog = [...prevBattle.log];

        const playerMonsters = prevBattle.playerMonsters.map(m => ({ ...m }));
        const enemyMonsters = prevBattle.enemyMonsters.map(m => ({ ...m }));

        [...playerMonsters, ...enemyMonsters].forEach((monster) => {
          if (!monster.isAlive) return;

          triggerTurnStart(monster);
          updateCooldowns(deltaTime, monster);

          if ((monster as BattleMonster & { stunned?: boolean }).stunned) return;

          const mutableBattle: BattleState = {
            ...prevBattle,
            playerMonsters,
            enemyMonsters,
            elapsedTime: prevBattle.elapsedTime + (deltaTime * 1000),
          };

          const attackResult = processAttack(monster, mutableBattle, mutableBattle.elapsedTime);
          if (attackResult) {
            newLog.push(attackResult);
          }

          // Only allow one ability OR ultimate per tick to prevent spam
          let specialFired = false;
          for (let i = 0; i < monster.template.abilities.length; i++) {
            if (!specialFired) {
              const abilityResult = processAbility(monster, mutableBattle, i, mutableBattle.elapsedTime);
              if (abilityResult) {
                newLog.push(abilityResult);
                specialFired = true;
              }
            }
          }

          if (!specialFired) {
            const ultiResult = processUltimate(monster, mutableBattle, mutableBattle.elapsedTime);
            if (ultiResult) {
              newLog.push(ultiResult);
            }
          }
        });

        const playerAlive = playerMonsters.some(m => m.isAlive);
        const enemyAlive = enemyMonsters.some(m => m.isAlive);

        let isOver = false;
        let winner: 'player' | 'enemy' | undefined;
        if (!playerAlive || !enemyAlive) {
          isOver = true;
          winner = playerAlive ? 'player' : 'enemy';
          newLog.push({ timestamp: (prevBattle.elapsedTime + deltaTime * 1000), message: winner === 'player' ? 'VICTORY!' : 'DEFEAT!', actorTeam: winner === 'player' ? 'player' : 'enemy' });
          setTimeout(() => endBattle(winner === 'player'), 1500);
        }

        while (newLog.length > 100) {
          newLog.shift();
        }

        const nextBattle = {
          ...prevBattle,
          log: newLog,
          isOver,
          winner,
          playerMonsters,
          enemyMonsters,
          elapsedTime: prevBattle.elapsedTime + (deltaTime * 1000),
        };
        latestBattleRef.current = nextBattle;
        return nextBattle;
      });

      battleLoopRef.current = requestAnimationFrame(tick);
    };

    battleLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (battleLoopRef.current) {
        cancelAnimationFrame(battleLoopRef.current);
      }
    };
  }, [isBattleActive, endBattle, battle, battleSpeed]);

  const handlePurchaseMonster = (templateId: string, cost: number) => {
    if (gameState.gold < cost) return;

    setGameState(prev => {
      const nickname = generateNickname(getMonsterById(templateId)?.name || 'Monster');
      return {
        ...prev,
        gold: prev.gold - cost,
        unlockedMonsters: prev.unlockedMonsters.includes(templateId) ? prev.unlockedMonsters : [...prev.unlockedMonsters, templateId],
        monsterInventory: {
          ...prev.monsterInventory,
          [templateId]: (prev.monsterInventory[templateId] || 0) + 1,
        },
        team: prev.team.length < 3 ? [...prev.team, {
          templateId,
          nickname,
          upgrades: {},
          mergeCount: 0,
          equippedItemId: undefined,
          extraPassiveIds: [],
        }] : prev.team,
      };
    });
  };

  const handlePurchaseItem = (itemId: string, cost: number) => {
    if (gameState.gold < cost) return;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      ownedItemIds: [...(prev.ownedItemIds || []), itemId],
    }));
  };

  const handlePurchasePassive = (passiveId: string, cost: number, teamMonsterIndex: number) => {
    if (gameState.gold < cost || !gameState.team[teamMonsterIndex]) return;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      team: prev.team.map((tm, idx) =>
        idx === teamMonsterIndex && tm.extraPassiveIds.length < 2
          ? { ...tm, extraPassiveIds: [...tm.extraPassiveIds, passiveId] }
          : tm
      ),
    }));
  };

  const handlePurchaseUpgrade = (teamMonsterIndex: number, stat: string) => {
    const cost = upgradeCosts[stat];
    if (gameState.gold < cost || !gameState.team[teamMonsterIndex]) return;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      team: prev.team.map((tm, idx) =>
        idx === teamMonsterIndex
          ? {
              ...tm,
              upgrades: {
                ...tm.upgrades,
                [stat]: ((tm.upgrades as Record<string, number>)[stat] || 0) + upgradeAmounts[stat],
              },
            }
          : tm
      ),
    }));
  };

  const handleAddToTeam = (templateId: string) => {
    if (gameState.team.length >= 3) return;
    const inInventory = gameState.monsterInventory[templateId] || 0;
    const inTeam = gameState.team.filter(tm => tm.templateId === templateId).length;
    if (inInventory <= inTeam) return;

    setGameState(prev => {
      const nickname = generateNickname(getMonsterById(templateId)?.name || 'Monster');
      return {
        ...prev,
        team: [...prev.team, {
          templateId,
          nickname,
          upgrades: {},
          mergeCount: 0,
          equippedItemId: undefined,
          extraPassiveIds: [],
        }],
      };
    });
  };

  const handleRemoveFromTeam = (index: number) => {
    setGameState(prev => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }));
  };

  const handleReorderTeam = (fromIndex: number, toIndex: number) => {
    setGameState(prev => {
      const newTeam = [...prev.team];
      [newTeam[fromIndex], newTeam[toIndex]] = [newTeam[toIndex], newTeam[fromIndex]];
      return {
        ...prev,
        team: newTeam,
      };
    });
  };

  const handleMergeMonster = (index: number) => {
    const teamMonster = gameState.team[index];
    if (!teamMonster) return;

    const inInventory = gameState.monsterInventory[teamMonster.templateId] || 0;
    const inTeam = gameState.team.filter(tm => tm.templateId === teamMonster.templateId).length;
    if (inInventory <= inTeam) return;

    setGameState(prev => ({
      ...prev,
      team: prev.team.map((tm, idx) =>
        idx === index
          ? { ...tm, mergeCount: tm.mergeCount + 1 }
          : tm
      ),
      monsterInventory: {
        ...prev.monsterInventory,
        [teamMonster.templateId]: inInventory - 1,
      },
    }));
  };

  const handleEquipItem = (teamMonsterIndex: number, itemId: string | undefined) => {
    setGameState(prev => ({
      ...prev,
      team: prev.team.map((tm, idx) =>
        idx === teamMonsterIndex
          ? { ...tm, equippedItemId: itemId }
          : tm
      ),
    }));
  };

  const handleRecruitMonster = (templateId: string) => {
    setGameState(prev => ({
      ...prev,
      unlockedMonsters: prev.unlockedMonsters.includes(templateId) ? prev.unlockedMonsters : [...prev.unlockedMonsters, templateId],
      monsterInventory: {
        ...prev.monsterInventory,
        [templateId]: (prev.monsterInventory[templateId] || 0) + 1,
      },
    }));
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset all progress and start over?')) {
      localStorage.removeItem('monster_autobattler_save');
      const newState = initializeGame();
      setGameState(newState);
      setShowStarterSelect(true);
      setBattle(null);
    }
  };

  if (showStarterSelect) {
    return <StarterSelection onSelect={handleStarterSelect} />;
  }

  return (
    <div className={styles.page}>
      {/* Monster Preview Modal */}
      {previewMonster && (
        <MonsterPreviewModal
          monster={previewMonster}
          teamMonster={previewTeamMonster ?? undefined}
          onClose={() => { setPreviewMonster(null); setPreviewTeamMonster(null); }}
        />
      )}

      {/* Battle Results Screen */}
      {showResults && resultsData && (
        <BattleResultsScreen
          winner={resultsData.winner}
          goldReward={resultsData.goldReward}
          defeatedEnemies={resultsData.defeatedEnemies}
          allEnemies={resultsData.allEnemies}
          newUnlocks={resultsData.newUnlocks}
          battleCount={resultsData.battleNumber}
          playerTeam={resultsData.playerTeam}
          battleStats={battleStats}
          onRecruitMonster={handleRecruitMonster}
          onContinue={handleContinue}
        />
      )}

      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Monster Autobattler</h1>
            <p className="text-slate-400">Wins: {gameState.battleCount} | Losses: {gameState.totalLosses}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xl font-bold text-yellow-400">
              <Coins className="w-6 h-6" />
              {gameState.gold}
            </div>
            <button onClick={resetGame} className={`${styles.button} ${styles.buttonSecondary}`}>
              <RefreshCw className="w-4 h-4" />
              Reset All Progress and Start Over
            </button>
          </div>
        </div>

        {/* Battle Screen or Team Management */}
        {battle ? (
          <div className={`${styles.card} p-6`}>
            {/* Speed Controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-300">Battle in Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">Speed:</span>
                  <div className="flex gap-1">
                    {[1, 2, 4].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setBattleSpeed(speed)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${battleSpeed === speed ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Enemy Team (Top) */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                <Skull className="w-4 h-4" />
                Enemies
              </h3>
              <div className="flex gap-4 flex-wrap">
                {battle.enemyMonsters.map(m => (
                  <div key={m.id} className="flex-1 min-w-[200px] max-w-[300px]">
                    <MonsterCard monster={m} isEnemy onPreview={() => { setPreviewMonster(m.template); setPreviewTeamMonster(null); }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Battle Log (Middle) */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Sword className="w-4 h-4" />
                Combat Log
              </h3>
              <BattleLog log={battle.log} />
            </div>

            {/* Player Team (Bottom) */}
            <div>
              <h3 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Your Team
              </h3>
              <div className="flex gap-4 flex-wrap">
                {battle.playerMonsters.map(m => (
                  <div key={m.id} className="flex-1 min-w-[200px] max-w-[300px]">
                    <MonsterCard monster={m} onPreview={() => { setPreviewMonster(m.template); setPreviewTeamMonster(null); }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Management */}
            <TeamManagement
              gameState={gameState}
              onAddMonster={handleAddToTeam}
              onRemoveMonster={handleRemoveFromTeam}
              onPreviewMonster={(template, tm) => { setPreviewMonster(template); setPreviewTeamMonster(tm ?? null); }}
              onReorderMonster={handleReorderTeam}
              onMergeMonster={handleMergeMonster}
              onEquipItem={handleEquipItem}
              ownedItemIds={gameState.ownedItemIds}
            />

            {/* Start Battle Button */}
            <div className="text-center">
              <button
                onClick={startBattle}
                disabled={gameState.team.length === 0}
                className={`${styles.button} ${gameState.team.length > 0 ? styles.buttonPrimary : 'bg-slate-600 text-slate-400 cursor-not-allowed'} px-8 py-4 text-xl`}
              >
                <Play className="w-6 h-6" />
                Start Battle
              </button>
              {gameState.team.length === 0 && (
                <p className="text-sm text-slate-400 mt-2">Add monsters to your team to battle!</p>
              )}
            </div>

            {/* Shop */}
            <Shop
              gold={gameState.gold}
              gameState={gameState}
              onPurchaseMonster={handlePurchaseMonster}
              onPurchaseItem={handlePurchaseItem}
              onPurchasePassive={handlePurchasePassive}
              onPurchaseUpgrade={handlePurchaseUpgrade}
              onPreviewMonster={(t) => { setPreviewMonster(t); setPreviewTeamMonster(null); }}
              battleCount={gameState.battleCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <Game />;
}
