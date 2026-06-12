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

### Day 4

- After a battle, I received more than one copy of a monster. It should be one.
- Clicking the Merge button on the monster card doesn't seem to have any feedback. It also does not increase stats as described. There should also be indication on the card, maybe a star icon with tooltip, that 1 or more copies were merged.
- The battle summary stats are still potentially stale. See screenshot.  The damage dealt and damage taken, as well as healed.  Additionally, the "BATTLE STATS" for each monster should be part of the "ENEMY TEAM" and "YOUR TEAM" sections, based on which team a monster is on.
- After recruiting a monster on the battle summary screen, I no longer see it in the "Your Team" section
- After beating two of the same monsters, I should not be shown duplicates in the recruit section. I also should not be able to recruit more than one per battle. Also deduplicate the same monster in the "NEW MONSTERS UNLOCKED!" section.
- There might be a damage calculation bug where a monster deals 1 damage. See screenshot.
- I noticed my monster died while having shield. All damage taken should be deducted from shield first. Until the shield is gone, the monster should not take any HP loss.
- The shop (Items/Passives) is not being refreshed after each battle
- The shop tooltips for attributes are not showing
- The shop attributes when purchased don't appear to do anything, except deduct gold
- Buying an item from the shop doesn't appear to do anything, except deduct gold
- Buying a passive from the shop doesn't appear to do anything, except deduct gold
- When buying a passive from the shop, it is unclear to me that it did anything or persists on the monster
- In the combat log, it is unclear how much damage is dealt when a monster uses an ultimate. Indicate that in the log.
- The battle summary of enemy team and your team should show [Damage dealt, damage taken, healing done, kills]. It should not show current hp.
- The battle summary numbers appears wrong for damage taken, as the end of battle damage taken should be more or equal to the monsters hp for those that died.
- The battle summary seems to not show for a monster if there is another monster of the same type - it should show.
- On the monster summary modal, the close button x, doesn't do anything. It should close the modal.
- Explain how the ultimate bar charges. It should not scale based on damage dealt, but on actions. For example, attacking, taking damage, or using a skill.
- There seems to be a battle bug where one monster is attacking 4 times a second, when the base stats speed is 1.3/s (see screenshot)
- There is another battle bug where one monster uses multiple abilities and ultimates consecutively without delay (see screenshot)
- Show all purchased attributes, passives, and stat increases in the monster summary modal
- When a monster is equipped with an item, hovering over the item should show a tooltip of what the item does
- In the attribute shop, it is unclear what buying attack speed does. Does it increase attacks per second? Same with the other decimal point attributes. Clarify this.
- The Continue to next battle button is overlapping the minimize button
- The monster card first row is too squished (see screenshot). There is not enough space for the monster name. The item name also appears duplicated.
- The monster summary attribute tooltips are showing way right of where the attribute hover is happening (see screenshot)

### On Deck

- In the monster summary modal, show all stat increases to the right of the base stats, along with the total stat.  All in the same row.
- Tooltip text positions are still way off across the board for all tooltips (See screenshot)
- The shop attribute upgrades still show as +0.02 instead of percentages
- Fix the battle summary kill count - I see a total of 5 kills in a single battle which doesn't make sense
- In the battle summary, make the modal wider, and make each monster row more compact height-wise.
- Make the Your Team and Shop cards wider
- The HP stat on items needs to be much higher
- In the monster summary modal, the close button (x) clickable area does not match where the button is.  The clickable area is off to the right. Fix that.
- For the passive ability "Thorns", any damage dealt by this should be listed in the battle logs and tracked as damage dealt on the battle summary.
- The monster summary modal on the Battle screen is missing a lot of info compared to the monster summary modal on the Shop screen. Why aren't they using the same modal?
- In the battle logs, any actions that deal damage to multiple targets should indicate the total damage dealt per target.
- The battle summary modal should show two tabs, one where you choose to recruit a defeated enemy, and another tab for the battle stats
- In the shop passives tab, explain a monster can only equip two passives purchased from the shop
- The shop items are too underwhelming, make them much more impactful.
