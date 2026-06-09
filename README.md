# react-autobattler

Generated auto-battler game using bolt.new

## Original prompt

- Create a js autobattler, themed around monsters.
- Be able to choose between three starting monsters.
- Monsters each have a special passive ability, attributes, two active abilities, and an ultimate.
- Monsters automatically attack.
- Monsters cast their active abilities after an initial delay, and then subsequently a cooldown.
- Monsters generate ultimate meter for each action they take.
- When the ultimate meter fills up, they cast their ultimate.
- Some monster active abilities and ultimates could target multiple enemies.
- The attributes for each monster include hp, attack, defense, attack speed, crit chance, crit damage, dodge chance, damage reduction, penetration, haste.
- You can have up to three monsters on your team fighting together at the same time.
- After each battle, you get gold to purchase attribute upgrades and recruit a new monster you just beat.

- Generate more monsters.
- Be able to preview a monster's skills and passives and ultimate on click.
- When you win or lose, be able to see the results, and click a button to continue.

## On Deck

- On hover of each attribute, show a tooltip explaining what the attribute does.
- When the battle is over, show stats for each team, such as how much total damage each monster did and took.
- Allow minimizing/maximizing the end of battle modal.
- When you lose, you should still get gold, but not as much as winning.
- Track how many total losses you had.
- Add speed controls during battle (1x,2x,4x).
- Fix the upgrades, as they don't appear to add to the selected monster's attributes.
- The monster targeting should favor the first enemy monster, then the second, then the third.
- You should be able to reorder your monsters.
- Skills like Inferno howl should buff your own team, not the enemy team.
- Allow having multiples of the same monster on your team
