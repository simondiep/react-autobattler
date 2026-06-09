import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BattleMonster, BattleState, MonsterTemplate } from './types/monster';
import { STARTER_MONSTERS, ALL_MONSTERS, getMonsterById } from './data/monsters';
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
} from './engine/BattleEngine';
import { Sword, Shield, Heart, Zap, Coins, ShoppingBag, Users, ChevronUp, Trash2, RefreshCw, Play, Skull, X, Sparkles, Target, Timer, TrendingUp, Award } from 'lucide-react';

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

// ========== MONSTER PREVIEW MODAL ==========
function MonsterPreviewModal({
  monster,
  onClose,
}: {
  monster: MonsterTemplate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className={`${styles.card} p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto`}
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

        {/* Passive */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-purple-400">PASSIVE: {monster.passive.name}</h3>
          </div>
          <p className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-xl">{monster.passive.description}</p>
        </div>

        {/* Abilities */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-cyan-400">ABILITIES</h3>
          </div>
          <div className="space-y-3">
            {monster.abilities.map((ability) => (
              <div key={ability.id} className="bg-slate-700/50 p-3 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-cyan-300">{ability.name}</span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Timer className="w-3 h-3" />
                    {ability.cooldown}s CD
                  </div>
                </div>
                <p className="text-sm text-slate-300">{ability.description}</p>
                <div className="mt-2 flex gap-2">
                  <span className="text-xs px-2 py-1 bg-slate-600 rounded text-slate-300">
                    {ability.targetCount === 0 ? 'All Enemies' : ability.targetCount === 1 ? 'Single Target' : `${ability.targetCount} Targets`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ultimate */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400">ULTIMATE: {monster.ultimate.name}</h3>
          </div>
          <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-700/50 p-3 rounded-xl">
            <p className="text-sm text-slate-200">{monster.ultimate.description}</p>
            <div className="mt-2 flex gap-2">
              <span className="text-xs px-2 py-1 bg-yellow-700/30 rounded text-yellow-300">
                {monster.ultimate.targetCount === 0 ? 'All Enemies' : monster.ultimate.targetCount === 1 ? 'Single Target' : `${monster.ultimate.targetCount} Targets`}
              </span>
              <span className="text-xs px-2 py-1 bg-yellow-700/30 rounded text-yellow-300">
                Charge: {monster.ultimate.meterMax}
              </span>
            </div>
          </div>
        </div>

        {/* Attributes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-emerald-400">BASE STATS</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /> HP</span>
              <span className="text-red-400 font-semibold">{monster.baseAttributes.hp}</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1"><Sword className="w-3 h-3 text-orange-400" /> Attack</span>
              <span className="text-orange-400 font-semibold">{monster.baseAttributes.attack}</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400 flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /> Defense</span>
              <span className="text-blue-400 font-semibold">{monster.baseAttributes.defense}</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Speed</span>
              <span className="text-cyan-400 font-semibold">{monster.baseAttributes.attackSpeed.toFixed(1)}/s</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Crit %</span>
              <span className="text-amber-400 font-semibold">{(monster.baseAttributes.critChance * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Crit DMG</span>
              <span className="text-amber-400 font-semibold">{(monster.baseAttributes.critDamage * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Dodge</span>
              <span className="text-green-400 font-semibold">{(monster.baseAttributes.dodgeChance * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">DMG Red.</span>
              <span className="text-blue-400 font-semibold">{(monster.baseAttributes.damageReduction * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Penetration</span>
              <span className="text-purple-400 font-semibold">{(monster.baseAttributes.penetration * 100).toFixed(0)}%</span>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg flex justify-between text-sm">
              <span className="text-slate-400">Haste</span>
              <span className="text-pink-400 font-semibold">{(monster.baseAttributes.haste * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== BATTLE RESULTS SCREEN ==========
function BattleResultsScreen({
  winner,
  goldReward,
  defeatedMonsters,
  newUnlocks,
  battleCount,
  onContinue,
}: {
  winner: 'player' | 'enemy';
  goldReward: number;
  defeatedMonsters: MonsterTemplate[];
  newUnlocks: string[];
  battleCount: number;
  onContinue: () => void;
}) {
  const isVictory = winner === 'player';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${styles.card} p-8 max-w-lg w-full text-center`}>
        {/* Victory/Defeat Banner */}
        <div className={`text-6xl mb-4 ${isVictory ? 'animate-bounce' : 'animate-pulse'}`}>
          {isVictory ? '🏆' : '💀'}
        </div>
        <h1 className={`text-4xl font-bold mb-2 ${isVictory ? 'text-emerald-400' : 'text-red-400'}`}>
          {isVictory ? 'VICTORY!' : 'DEFEAT!'}
        </h1>
        <p className="text-slate-400 mb-6">
          Battle {battleCount} {isVictory ? 'completed' : 'failed'}
        </p>

        {/* Rewards (if victory) */}
        {isVictory && (
          <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Coins className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">+{goldReward}</span>
            </div>

            {/* Defeated Monsters */}
            {defeatedMonsters.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 uppercase mb-2">Enemies Defeated</p>
                <div className="flex justify-center gap-3">
                  {defeatedMonsters.map((m) => (
                    <div key={m.id} className="text-3xl" title={m.name} style={{ filter: `drop-shadow(0 0 10px ${m.color})` }}>
                      {m.emoji}
                    </div>
                  ))}
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
          <p className="text-slate-400 mb-6">
            Your monsters have fallen. Upgrade your team and try again!
          </p>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className={`${styles.button} ${styles.buttonPrimary} px-8 py-4 text-lg w-full`}
        >
          {isVictory ? 'Continue to Next Battle' : 'Return to Team'}
        </button>
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
}: {
  monster: BattleMonster;
  showActions?: boolean;
  onRemove?: () => void;
  onPreview?: () => void;
  isEnemy?: boolean;
}) {
  const hpPercent = (monster.currentHp / monster.attributes.maxHp) * 100;
  const ultiPercent = (monster.ultimateMeter / monster.template.ultimate.meterMax) * 100;

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
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-slate-100 truncate">{monster.template.name}</h4>
            {isEnemy && (
              <span className="text-xs text-red-400 font-bold">ENEMY</span>
            )}
          </div>

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

          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-slate-400">Ultimate</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300 bg-gradient-to-r from-yellow-500 to-orange-400"
                style={{ width: `${ultiPercent}%` }}
              />
            </div>
          </div>

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
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {(monster as BattleMonster & { shield?: number }).shield && (monster as BattleMonster & { shield?: number }).shield! > 0 && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded text-xs text-blue-300">
          Shield: {Math.floor((monster as BattleMonster & { shield?: number }).shield!)}
        </div>
      )}
    </div>
  );
}

// ========== BATTLE LOG COMPONENT ==========
function BattleLog({ log }: { log: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div
      ref={containerRef}
      className="h-48 overflow-y-auto bg-slate-900/50 rounded-xl p-3 text-xs font-mono border border-slate-700"
    >
      {log.map((entry, i) => (
        <div key={i} className={`${
          entry.includes('CRIT') ? 'text-orange-400' :
          entry.includes('DODGE') ? 'text-cyan-400' :
          entry.includes('***') || entry.includes('VICTORY') ? 'text-yellow-400 font-bold' :
          entry.includes('DEFEAT') ? 'text-red-400 font-bold' :
          entry.includes('SLAIN') ? 'text-red-300' :
          'text-slate-400'
        }`}>
          {entry}
        </div>
      ))}
    </div>
  );
}

// ========== SHOP COMPONENT ==========
function Shop({
  gold,
  unlockedMonsters,
  team,
  upgrades,
  onPurchaseMonster,
  onPurchaseUpgrade,
  onPreviewMonster,
}: {
  gold: number;
  unlockedMonsters: string[];
  team: string[];
  upgrades: Record<string, Partial<GameState['upgrades'][string]>>;
  onPurchaseMonster: (id: string, cost: number) => void;
  onPurchaseUpgrade: (monsterId: string, stat: string, cost: number) => void;
  onPreviewMonster: (template: MonsterTemplate) => void;
}) {
  const [tab, setTab] = useState<'monsters' | 'upgrades'>('monsters');

  const upgradeCosts: Record<string, number> = {
    hp: 50,
    attack: 40,
    defense: 40,
    attackSpeed: 60,
    critChance: 80,
    critDamage: 100,
    dodgeChance: 60,
    damageReduction: 80,
    penetration: 70,
    haste: 70,
  };

  const lockedMonsters = ALL_MONSTERS.filter(m => !unlockedMonsters.includes(m.id));

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

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('monsters')}
          className={`${styles.button} ${tab === 'monsters' ? styles.buttonPrimary : styles.buttonSecondary}`}
        >
          <Users className="w-4 h-4" />
          Monsters
        </button>
        <button
          onClick={() => setTab('upgrades')}
          className={`${styles.button} ${tab === 'upgrades' ? styles.buttonPrimary : styles.buttonSecondary}`}
        >
          <ChevronUp className="w-4 h-4" />
          Upgrades
        </button>
      </div>

      {tab === 'monsters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lockedMonsters.map((monster) => {
            const cost = monster.tier * 150;
            const canAfford = gold >= cost;
            const teamFull = team.length >= 3;

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
                  <span className="text-yellow-400 font-semibold flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {cost}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onPurchaseMonster(monster.id, cost); }}
                    disabled={!canAfford || teamFull}
                    className={`${styles.button} ${canAfford && !teamFull ? styles.buttonPrimary : 'bg-slate-600 text-slate-400 cursor-not-allowed'} text-sm`}
                  >
                    {teamFull ? 'Team Full' : 'Recruit'}
                  </button>
                </div>
              </div>
            );
          })}
          {lockedMonsters.length === 0 && (
            <p className="text-slate-400 col-span-full text-center py-8">All monsters unlocked!</p>
          )}
        </div>
      )}

      {tab === 'upgrades' && (
        <div className="space-y-6">
          {team.map((monsterId) => {
            const template = getMonsterById(monsterId);
            if (!template) return null;
            const currentUpgrades = upgrades[monsterId] || {};

            return (
              <div key={monsterId} className={`${styles.card} p-4 border border-slate-700`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{template.emoji}</span>
                  <h4 className="font-semibold text-slate-100">{template.name}</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(upgradeCosts).map(([stat, baseCost]) => {
                    const timesUpgraded = (currentUpgrades as Record<string, number>)[stat] || 0;
                    const cost = baseCost + (timesUpgraded * 20);
                    const canAfford = gold >= cost;

                    return (
                      <button
                        key={stat}
                        onClick={() => onPurchaseUpgrade(monsterId, stat, cost)}
                        disabled={!canAfford}
                        className={`p-3 rounded-xl text-left transition-all ${canAfford ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 opacity-50 cursor-not-allowed'}`}
                      >
                        <p className="text-xs text-slate-400 capitalize">{stat.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-sm font-semibold text-slate-200">
                          +{stat === 'attackSpeed' || stat === 'critChance' || stat === 'dodgeChance' || stat === 'damageReduction' || stat === 'penetration' || stat === 'haste' ? '0.01' : '5'}
                        </p>
                        <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                          <Coins className="w-3 h-3" />
                          {cost}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {team.length === 0 && (
            <p className="text-slate-400 text-center py-8">Add monsters to your team to upgrade them.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ========== TEAM MANAGEMENT COMPONENT ==========
function TeamManagement({
  team,
  unlockedMonsters,
  onAddMonster,
  onRemoveMonster,
  onPreviewMonster,
}: {
  team: string[];
  unlockedMonsters: string[];
  onAddMonster: (id: string) => void;
  onRemoveMonster: (id: string) => void;
  onPreviewMonster: (template: MonsterTemplate) => void;
}) {
  const availableMonsters = unlockedMonsters.filter(id => !team.includes(id));

  const createDisplayMonster = (templateId: string) => {
    const template = getMonsterById(templateId);
    if (!template) return null;
    return {
      id: `display-${templateId}`,
      template,
      attributes: { ...template.baseAttributes, maxHp: template.baseAttributes.hp, hp: template.baseAttributes.hp } as BattleMonster['attributes'],
      currentHp: template.baseAttributes.hp,
      ultimateMeter: 0,
      abilityCooldowns: [0, 0] as [number, number],
      abilityDelays: [0, 0] as [number, number],
      isAlive: true,
      team: 'player' as const,
      lastAttackTime: 0,
    };
  };

  return (
    <div className={`${styles.card} p-6 w-full max-w-4xl`}>
      <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-cyan-400" />
        Your Team ({team.length}/3)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {team.map((monsterId) => {
          const monster = createDisplayMonster(monsterId);
          if (!monster) return null;
          return (
            <MonsterCard
              key={monsterId}
              monster={monster}
              showActions
              onRemove={() => onRemoveMonster(monsterId)}
              onPreview={() => onPreviewMonster(monster.template)}
            />
          );
        })}

        {team.length < 3 && (
          <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 flex items-center justify-center min-h-[180px]">
            <p className="text-slate-500">Add a monster</p>
          </div>
        )}
      </div>

      {availableMonsters.length > 0 && team.length < 3 && (
        <div>
          <p className="text-sm text-slate-400 mb-3">Available monsters:</p>
          <div className="flex flex-wrap gap-2">
            {availableMonsters.map((id) => {
              const template = getMonsterById(id);
              if (!template) return null;
              return (
                <button
                  key={id}
                  onClick={() => onAddMonster(id)}
                  onContextMenu={(e) => { e.preventDefault(); onPreviewMonster(template); }}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  <span>{template.emoji}</span>
                  {template.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ========== MAIN GAME COMPONENT ==========
function Game() {
  const [gameState, setGameState] = useState<GameState>(initializeGame);
  const [showStarterSelect, setShowStarterSelect] = useState(false);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [isBattleActive, setIsBattleActive] = useState(false);
  const [previewMonster, setPreviewMonster] = useState<MonsterTemplate | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState<{
    winner: 'player' | 'enemy';
    goldReward: number;
    defeatedMonsters: MonsterTemplate[];
    newUnlocks: string[];
  } | null>(null);
  const battleLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

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

    if (battle) {
      const goldReward = playerWon ? 50 + (gameState.battleCount * 25) + battle.enemyMonsters.length * 20 : 0;
      const defeatedMonsters = battle.enemyMonsters.map(m => m.template);
      const defeatedMonsterIds = battle.enemyMonsters.map(m => m.template.id);
      const newUnlocks = playerWon ? defeatedMonsterIds.filter(id => !gameState.unlockedMonsters.includes(id)) : [];

      // Update game state
      setGameState(prev => ({
        ...prev,
        gold: prev.gold + goldReward,
        battleCount: prev.battleCount + (playerWon ? 1 : 0),
        unlockedMonsters: playerWon ? [...prev.unlockedMonsters, ...newUnlocks] : prev.unlockedMonsters,
      }));

      // Show results screen
      setResultsData({
        winner: playerWon ? 'player' : 'enemy',
        goldReward,
        defeatedMonsters,
        newUnlocks,
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
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setBattle(prevBattle => {
        if (!prevBattle || prevBattle.isOver) return prevBattle;

        const newLog = [...prevBattle.log];

        // Create copies for state update
        const playerMonsters = prevBattle.playerMonsters.map(m => ({ ...m }));
        const enemyMonsters = prevBattle.enemyMonsters.map(m => ({ ...m }));

        // Process all monsters
        [...playerMonsters, ...enemyMonsters].forEach((monster) => {
          if (!monster.isAlive) return;

          // Update cooldowns
          updateCooldowns(deltaTime, monster);

          // Check for stun
          if ((monster as BattleMonster & { stunned?: boolean }).stunned) return;

          // Create a mutable battle reference for abilities
          const mutableBattle: BattleState = {
            ...prevBattle,
            playerMonsters,
            enemyMonsters,
          };

          // Auto attack
          const attackResult = processAttack(monster, mutableBattle, timestamp);
          if (attackResult) {
            newLog.push(attackResult);
          }

          // Abilities
          for (let i = 0; i < monster.template.abilities.length; i++) {
            const abilityResult = processAbility(monster, mutableBattle, i, timestamp);
            if (abilityResult) {
              newLog.push(abilityResult);
            }
          }

          // Ultimate
          const ultiResult = processUltimate(monster, mutableBattle);
          if (ultiResult) {
            newLog.push(ultiResult);
          }
        });

        // Check for end
        const playerAlive = playerMonsters.some(m => m.isAlive);
        const enemyAlive = enemyMonsters.some(m => m.isAlive);

        let isOver = false;
        let winner: 'player' | 'enemy' | undefined;
        if (!playerAlive || !enemyAlive) {
          isOver = true;
          winner = playerAlive ? 'player' : 'enemy';
          newLog.push(winner === 'player' ? 'VICTORY!' : 'DEFEAT!');
          setTimeout(() => endBattle(winner === 'player'), 1500);
        }

        // Keep log manageable
        while (newLog.length > 100) {
          newLog.shift();
        }

        return {
          ...prevBattle,
          log: newLog,
          isOver,
          winner,
          playerMonsters,
          enemyMonsters,
        };
      });

      battleLoopRef.current = requestAnimationFrame(tick);
    };

    battleLoopRef.current = requestAnimationFrame(tick);

    return () => {
      if (battleLoopRef.current) {
        cancelAnimationFrame(battleLoopRef.current);
      }
    };
  }, [isBattleActive, endBattle, battle]);

  const handlePurchaseMonster = (monsterId: string, cost: number) => {
    if (gameState.gold < cost || gameState.team.length >= 3) return;
    if (gameState.team.includes(monsterId)) return;

    setGameState(prev => ({
      ...prev,
      gold: prev.gold - cost,
      unlockedMonsters: [...prev.unlockedMonsters, monsterId],
      team: prev.team.length < 3 ? [...prev.team, monsterId] : prev.team,
    }));
  };

  const handlePurchaseUpgrade = (monsterId: string, stat: string, cost: number) => {
    if (gameState.gold < cost) return;

    setGameState(prev => {
      const currentUpgrades = prev.upgrades[monsterId] || {};
      const currentValue = (currentUpgrades as Record<string, number>)[stat] || 0;

      // Calculate upgrade amount
      const isPercent = ['critChance', 'dodgeChance', 'damageReduction', 'penetration', 'haste', 'attackSpeed'].includes(stat);
      const upgradeAmount = isPercent ? 0.01 : 5;

      return {
        ...prev,
        gold: prev.gold - cost,
        upgrades: {
          ...prev.upgrades,
          [monsterId]: {
            ...currentUpgrades,
            [stat]: currentValue + upgradeAmount,
          },
        },
      };
    });
  };

  const handleAddToTeam = (monsterId: string) => {
    if (gameState.team.length >= 3 || !gameState.unlockedMonsters.includes(monsterId)) return;
    setGameState(prev => ({
      ...prev,
      team: [...prev.team, monsterId],
    }));
  };

  const handleRemoveFromTeam = (monsterId: string) => {
    setGameState(prev => ({
      ...prev,
      team: prev.team.filter(id => id !== monsterId),
    }));
  };

  const resetGame = () => {
    if (confirm('Are you sure you want to reset your progress?')) {
      localStorage.removeItem('monster_autobattler_save');
      setGameState({
        gold: 0,
        team: [],
        unlockedMonsters: [],
        upgrades: {},
        battleCount: 0,
      });
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
          onClose={() => setPreviewMonster(null)}
        />
      )}

      {/* Battle Results Screen */}
      {showResults && resultsData && (
        <BattleResultsScreen
          winner={resultsData.winner}
          goldReward={resultsData.goldReward}
          defeatedMonsters={resultsData.defeatedMonsters}
          newUnlocks={resultsData.newUnlocks}
          battleCount={gameState.battleCount}
          onContinue={handleContinue}
        />
      )}

      <div className="w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Monster Autobattler</h1>
            <p className="text-slate-400">Battle {gameState.battleCount + 1}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xl font-bold text-yellow-400">
              <Coins className="w-6 h-6" />
              {gameState.gold}
            </div>
            <button onClick={resetGame} className={`${styles.button} ${styles.buttonSecondary}`}>
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Battle Screen or Team Management */}
        {battle ? (
          <div className={`${styles.card} p-6`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player Team */}
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Your Team
                </h3>
                <div className="space-y-3">
                  {battle.playerMonsters.map(m => (
                    <MonsterCard key={m.id} monster={m} onPreview={() => setPreviewMonster(m.template)} />
                  ))}
                </div>
              </div>

              {/* Battle Log */}
              <div>
                <h3 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Sword className="w-5 h-5" />
                  Combat Log
                </h3>
                <BattleLog log={battle.log} />
              </div>

              {/* Enemy Team */}
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <Skull className="w-5 h-5" />
                  Enemies
                </h3>
                <div className="space-y-3">
                  {battle.enemyMonsters.map(m => (
                    <MonsterCard key={m.id} monster={m} isEnemy onPreview={() => setPreviewMonster(m.template)} />
                  ))}
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-6">
            {/* Team Management */}
            <TeamManagement
              team={gameState.team}
              unlockedMonsters={gameState.unlockedMonsters}
              onAddMonster={handleAddToTeam}
              onRemoveMonster={handleRemoveFromTeam}
              onPreviewMonster={setPreviewMonster}
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
              unlockedMonsters={gameState.unlockedMonsters}
              team={gameState.team}
              upgrades={gameState.upgrades}
              onPurchaseMonster={handlePurchaseMonster}
              onPurchaseUpgrade={handlePurchaseUpgrade}
              onPreviewMonster={setPreviewMonster}
            />

            {/* Unlocked Monsters List */}
            {gameState.unlockedMonsters.length > 0 && (
              <div className={`${styles.card} p-4`}>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Unlocked Monsters (click to preview)</h3>
                <div className="flex flex-wrap gap-2">
                  {gameState.unlockedMonsters.map(id => {
                    const template = getMonsterById(id);
                    if (!template) return null;
                    return (
                      <button
                        key={id}
                        onClick={() => setPreviewMonster(template)}
                        className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-sm text-slate-300 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>{template.emoji}</span>
                        {template.name}
                      </button>
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

export default function App() {
  return <Game />;
}
