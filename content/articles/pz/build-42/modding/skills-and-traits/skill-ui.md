---
id: build-42-skill-ui
slug: skill-ui
title: Skill UI
game: pz
version: build-42
section: modding
category: skills-and-traits
difficulty: intermediate
tags:
  - skills
  - traits
  - professions
  - xp
  - craftrecipe-gating
excerpt: >-
  How the Build 42.22 skills tab is built: how to open it, what the bar, the name color and the arrows mean, what a mod skill needs to appear, and how the crafting window shows a skill requirement.
last_updated: '2026-11-15'
related_articles:
  - the-mental-model
  - xp-level-thresholds-multipliers
  - learning-paths
  - modding-add-a-skill
  - recipe-gating-in-b42-scripts
  - the-xp-grant-skill-query-lua-api
  - how-fast-skills-level
---
::field-notes

> Source: Project Zomboid 42.22 (capture B42_3d39148846), read 2026-11-15.

:::callout[The 1-minute version]{kind=key}
- The skills tab is one of five tabs of the character window. The key "Toggle Skill Panel" opens it, and L is the default. The heart icon opens the Health tab, not Skills.
- Each skill is a row of ten squares. A full square is a level you have, the half-filled one is your progress, and the dark ones are levels to come.
- The color of a skill's name is the starting level the character has for it: dark gray for 0, light gray for 1, white for 2 and gold for 3.
- Hover a square to read its tooltip: the level, your XP, a multiplier from a skill book, a description and an "XP Boost" line.
- A skill from a mod appears only when it has a parent skill other than `None`.
:::

:::facts
- **Tabs in the character window** Info, Skills, Health, Protection and Temperature
- **Squares per skill** 10, one per level
- **Name colors** dark gray (starting level 0), light gray (1), white (2), gold (3)
- **Tooltip boost lines** +75%, +100% and +125% for starting levels 1, 2 and 3
:::

## 1. Opening the skills tab

**The skills tab lives in the character window next to four other tabs, and its own key opens it.**

The window holds the tabs Info, Skills, Health, Protection and Temperature, and the Skills tab is the character's skill list. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfoWindow.lua:129-148`, `media/lua/server/XpSystem/XpSystem_text.lua:1-10`, `media/lua/shared/Translate/EN/IG_UI.json:185-188`, `media/lua/shared/Translate/EN/IG_UI.json:1655`)]

The key binding "Toggle Skill Panel" opens or closes it, and its default key is L. :cite[(`media/lua/shared/keyBinding.lua:162-164`, `media/lua/server/XpSystem/XpUpdate.lua:150-153`)] The heart icon of the side bar toggles the Health tab. :cite[(`media/lua/client/ISUI/ISEquippedItem.lua:429-430`)] The older page said the Skills tab lives in the health panel behind the heart icon, which is not what the code does.

When the tab opens, the window shows a help line for it, and for this tab that line is the game's text `UI_SkillPanel`. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfoWindow.lua:131-134`, `media/lua/client/XpSystem/ISUI/ISCharacterInfoWindow.lua:39-59`)]

## 2. What a row shows

**A row is a skill name and ten squares, and each square is one level.**

The tab groups skills under headings. Each heading has a button that collapses or expands its rows. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:47-55`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:222-235`)] The rows come from the skills that have a parent other than `None`, and the heading is the parent's name. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:124-134`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-285`)]

The bar is ten squares wide. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:228-230`)] Each square tells one of three things about its level.
- **A level you have:** a filled square, in gold-yellow, that flashes in a good-highlight color for a moment after a level up.
- **The level in progress:** a gray square filled by the share of this level's XP you hold.
- **A level to come:** a dark empty square.

:cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:147-170`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:177-209`)] The fill is the XP you hold minus the totals of the earlier levels, divided by the cost of this level. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:140-145`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:254-296`)] The level comes from the character's stored level, and the bar redraws when that number changes. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:129-138`)]

Clicking a square can call the level-up, but only for a skill that is not passive, whose bar is full and whose level equals the square clicked. Levels normally rise by themselves when XP arrives, so this click is a leftover path. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:44-58`, `zombie/characters/IsoGameCharacter.java:17897-17901`)]

## 3. The color of the name, the arrows and the tooltip

**The name color is the starting level, the arrows show a stored skill-book multiplier, and the tooltip puts the numbers in words.**

The name is drawn dark gray when the character's starting level for the skill is 0, light gray for 1, gold for 3, and white for 2 or any other value. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:135-152`)] The starting level is the value the character's boost map holds for the skill, and the value stored when the character is created is at most 3. :cite[(`zombie/characters/IsoGameCharacter.java:17716-17718`, `zombie/characters/IsoGameCharacter.java:11594-11599`)]

Three animated arrows appear left of the name while a skill has a stored multiplier above 0. The animation steps every half second. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:104-118`, `media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:155-168`)] The arrows show for any value above 0, but the XP code applies a stored multiplier only when it is above 1. :cite[(`zombie/characters/IsoGameCharacter.java:17862-17865`)]

The older page said hovering the arrows shows the multiplier. The multiplier line is in the tooltip of the square in progress. :cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:67-73`)]

The tooltip of a square reads, in order:
- the skill name and the level number;
- "Unlocked" for a level you have, your XP over the cost for the level in progress, and "Locked" for a later level;
- the multiplier, for the level in progress;
- the skill's description, and a second description for that level when the text file has one;
- an "XP Boost: +75%", "+100%" or "+125%" line for a starting level of 1, 2 or 3.

:cite[(`media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:60-95`, `media/lua/shared/Translate/EN/IG_UI.json:178-181`)] Those percentages are text in the Lua. The factors the engine applies for those starting levels are different, and are in [XP, level thresholds and multipliers](/pz/build-42/modding/skills-and-traits/xp-level-thresholds-multipliers).

## 4. What a mod skill needs to appear

**A mod skill needs a parent other than `None`, a name key, and, for a clean tooltip, a description key.**

The tab skips a skill whose parent is `None`, so a mod skill that sets no parent is never listed. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:265-285`)] The name is the text for `IGUI_perks_` plus the skill's `translation`, and the description key uses the skill's id. :cite[(`zombie/characters/skills/PerkFactory.java:83-84`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:77-81`)] [Modding: add a SKILL](/pz/build-42/modding/skills-and-traits/modding-add-a-skill) writes the file and the text.

The passive flag is read in this tab only. A passive heading sorts first, and a full bar of a passive skill is drawn without the white border. :cite[(`media/lua/client/XpSystem/ISUI/ISCharacterInfo.lua:33-45`, `media/lua/client/XpSystem/ISUI/ISSkillProgressBar.lua:188-195`)] The older page said passive skills "use the steep passive curve" in this tab, but the curve is the costs the skill was registered with, not a property of the tab.

## 5. How the crafting window shows a skill requirement

**The recipe list and the recipe's info box print each required skill in green or red, and mark a recipe that has to be learned.**

For every `SkillRequired` entry, the recipe list prints "Requires", the skill's name, "Level" and the number, in a good or a bad color by whether the character's level is high enough. That color ignores the magazine rule, so a recipe the one-level-short rule still allows can show in red. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:174-184`, `media/lua/shared/Translate/EN/IG_UI.json:5473-5475`, `zombie/entity/components/crafting/recipe/CraftRecipeManager.java:390-392`)] The recipe header and the info box do the same. :cite[(`media/lua/client/Entity/ISUI/Controls/ISWidgetTitleHeader.lua:144-157`, `media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:80-89`)]

A recipe with `NeedToBeLearn` gets a book icon in the list, drawn at half strength while the character does not know the recipe. That icon asks the known-recipe question with the sandbox option ignored. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISRecipeScrollingListBox.lua:122-130`)]

The info box prints a line labeled "You have not learned this recipe." whose value is Yes when the recipe needs learning, and for such a recipe it adds a "Has learned:" line with Yes or No. The second line asks `hasPlayerLearnedRecipe`, which does not ignore the sandbox option. With "See Not Known Recipes" enabled, which is the default, the question passes for every recipe, so we expect the line to read Yes for a recipe the character has not learned. :cite[(`media/lua/client/Entity/ISUI/CraftRecipe/ISCraftRecipeInfoBox.lua:73-78`, `zombie/scripting/entity/components/crafting/CraftRecipe.java:1570-1572`, `zombie/characters/IsoGameCharacter.java:11720-11731`, `zombie/SandboxOptions.java:224`)] This is read from the code, not seen on screen. The known-recipe rules are in [Learning](/pz/build-42/modding/skills-and-traits/learning-paths).

:::callout[How we know]{kind=proof}
Everything above is read from the 42.22 Lua and Java in the lines cited. We did not open the skills tab in a game, so the colors, the arrow animation and the "Has learned" quirk are read from the code, not observed. The default key L is read from the binding table, and a player can rebind it.

Dropped from the older page: the claim that the crafting menu was "overhauled" with search by input or output, a choice of which ingredients to consume, a craft-multiple option and right-click shortcuts (it came from a wiki, and the crafting window beyond skill requirements is not rechecked here); the "[CONFIRMED via pzwiki]" tags; and "passive perks render differently and use the steep passive XP curve". Corrected: the heart icon opens the Health tab, the arrows do not show the multiplier on hover, and the starting-level colors are now exact (the older page gave only the percentages).
:::
