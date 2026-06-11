# react-autobattler

Generated auto-battler game using bolt.new

## Prompts

### Day 1
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

### Day 2
- On hover of each attribute, show a tooltip explaining what the attribute does.
- When the battle is over, show stats for each team, such as how much total damage each monster did and took.
- Allow minimizing/maximizing the end of battle modal.
- The stun abilities seem to stun for longer than described.
- Track how many total losses you had.
- Add speed controls during battle (1x,2x,4x).
- Fix the upgrades, as they don't appear to add to the selected monster's attributes.
- The monster targeting should favor the first enemy monster, then the second, then the third.
- You should be able to reorder your monsters.
- Skills like Inferno howl should buff your own team, not the enemy team.
- Allow having multiples of the same monster on your team
- Generate a lot more monsters.

- The end of battle stats all show as 0.  They should be populated instead.
- The loss counter incremented by 2 instead of 1. Fix that.
- The attribute tooltips are cut off when shown inside a modal. Fix that.
- Show numbers for the Ultimate bar.
- On the battle screen, show the teams layed out horizontally (top and bottom).
- Have the combat log show timestamps based on seconds after battle starts.
- The stun duration still seems to last longer than described on skills.

- The attribute tooltips are now showing in a way different spot than where it is hovering from.
- Show attribute tooltips on the shop upgrades as well.
- On the battle screen, I now see 5 monsters battling on my team. The max should be 3.
- The after battle stats appear to be wrong. For example, I lost the battle, but the damage taken doesn't match the max hp for each monster.
- The after battle stats should show both teams' stats, not just my team.
- The "Return to Team" button should be visible on top, rather than the bottom of the modal.
- On the preparation screen, move the "Unlocked Monsters" section to below the "Your Team" section.
- The "Unlocked Monsters" section should be renamed to "Monsters in Reserve".
- The Shop that shows monsters, should only show 6 monsters at a time (randomly picked after each battle).
- Provide more clear labels that the team formation affects who is targeted more, and also show the targeted percentage, maybe call it aggro.

### Day 3

- Track the count of each monster you own. You should not start with any monsters besides the single monster you chose. Duplicate copies should not exist at the start.
- Generate unique nicknames for each monster and use those along with the regular name in battle logs.
- Allow buying multiples of the same monster.
- Provide the option to merge two of the same monster to get increased attributes.  The purchased attributes should be included. Indicate the number of merged monsters with stars.
- Reduce the cost of attribute upgrades in the shop.
- The HP attribute upgrade should provide 25 HP.
- Higher tier monsters should cost more gold.
- The attribute tooltips are not showing.
- Shop attribute upgrades should not increase in price each time you buy them.
- The purchased attribute upgrades should be tied to the monster and not the slot. The upgrades should reflect on the monster summary as well
- After each battle victory, provide the choice to recruit one of the enemies defeated.
- The Return to Team button should not overlap the minimize modal button.
- The battle log should color code each log entry to differentiate your team vs the enemy team actions.
- The battle log timestamps are wrong. The timestamps are all the same. They should be not all be linked.
- For each battle log entry, the monster performing the action should always be mentioned first.  Then the action name. Then the targets. For damaging moves, list the damage dealt to each target.
- The battle summary modal should show both teams' stats, layed out like how the battle screen is, with top and bottom rows.
- The battle summary stats are wrong. Sometimes 0s are shown when they should not be 0.
- Rename the Reset Button to "Reset All Progress and Start Over".
- Add a tooltip to the Trash icon next to each monster.
- The "Monsters in Reserve" section seems redundant with the "Available monsters" section. Remove the "Monsters in Reserve" section and just indicate you have monsters in reserve.
- The aggro label should not be overlapping other text.
- On the monster summary modal, make it wider, and show the attributes to the left and abilities to the right.
- Fix abilities like Diamond Shield that provide a self buff to target self instead of all enemies.
- Fix Diamond Shield ability and other shield providing abilities, such that the shield takes damage instead of health until the shield is removed.
- Implement an equippable item system. Each monster can equip a single item that can raise stats or provide special passive effects.
- The shop sells equippable items (6 random items that change after each battle).
- Generate 100 different equippable items
- Monsters can have up to 3 passive abilities. They only start with one and can add more via the shop.
- The shop sells passive abilities (3 random passives that change after each battle).
- Make passive abilities more impactful
- There are three bugs in the screenshot of the battle summary modal.
  - The Battle number indicates 2, when it should be 1.
  - When clicking the icon to recruit, nothing happens.
  - The HPs for each team are both above 0. The enemy team lost, so their HP should be 0.
- Lower the cost of items in the shop
- Make the passives more impactful. Currently they barely make any difference.
- The layout of a monster card should not have overlapping elements (see screenshot)

### On Deck

- After a battle, I received more than one copy of a monster. It should be one.
- Clicking the Merge button on the monster card doesn't seem to have any feedback. It also does not increase stats as described. There should also be indication on the card, maybe a star icon with tooltip, that 1 or more copies were merged.
