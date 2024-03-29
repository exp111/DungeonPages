Global = {
    dice: null,
    map: null,
    character: null,
    phases: null,
    debug: null,
    help: null, //TODO: instead merge these next ones somehow
    selectedBonus: null,
    selectedAbility: null,
    selectedItem: null,
    selectedRelic: null,
    selectedDice: []
};
// Phase
Global.phases = new Phases();
let p = document.getElementById("phases");
p.parentNode.replaceChild(Global.phases.DOMObject, p);
Global.phases.CanSwitchPhase = (e) => CanSwitchPhase(e.current, e.phase);
Global.phases.OnPhaseStart = (e) => OnPhaseStart(e.phase);
Global.phases.OnPhaseEnd = (e) => OnPhaseEnd(e.phase, e.next);
// Dice
Global.dice = new DicePool();
let d = document.getElementById("dice");
d.parentNode.replaceChild(Global.dice.DOMObject, d);
Global.dice.OnDiceClick = (e) => OnDiceClick(e.dice);
// Character
loadCharacterJson("zafinn.json").then((json) => {
    let char = Character.FromJson(json);
    let c = document.getElementById("character");
    c.parentNode.replaceChild(char.DOMObject, c);
    Global.character = char;
    Global.character.OnAbilityClick = (e) => OnAbilityClick(e.ability);
    Global.character.OnRelicClick = (e) => OnRelicClick(e.relic);
    Global.character.OnBonusClick = (e) => OnBonusClick(e.bonus);
    Global.character.OnWeaponRelicUnlock = (e) => OnWeaponRelicUnlock(e);
    console.log(Global.character);
});
// Map
loadMapJson("highmountVillage.json").then((json) => {
    let map = Map.FromJson(json);
    let m = document.getElementById("map");
    m.parentNode.replaceChild(map.DOMObject, m);
    Global.map = map;
    Global.map.OnDungeonClick = (e) => OnDungeonClick(e.dungeon);
    Global.map.OnTileClick = (e) => OnTileClick(e.dungeon, e.tile);
    console.log(Global.map);
});
// Debug
Global.debug = new Debug();
let deb = document.getElementById("debug");
deb.parentNode.replaceChild(Global.debug.DOMObject, deb);
Global.debug.UnlockAll = () => Global.character.UnlockAll();
Global.debug.GiveXP = (xp) => Global.character.GotExperience(xp);
Global.debug.GiveDmg = (dmg) => DoDamage(dmg);
// Help
Global.help = new Help();
let help = document.getElementById("help");
let helpButton = document.getElementById("help-button");
let tutWindow = document.getElementById("tutorial-window");
help.parentNode.replaceChild(Global.help.DOMObject, help);
helpButton.parentNode.replaceChild(Global.help.ButtonDOMObject, helpButton);
tutWindow.parentNode.replaceChild(Global.help.TutorialWindowObject, tutWindow);

function UnselectItem() {
    let item = Global.selectedItem;
    if (item == null)
        return;

    Global.selectedItem = null;
    item.Selected = false;
    item.UpdateUI();
}

function UnselectAbility() {
    let ability = Global.selectedAbility;
    if (ability == null)
        return;
    Global.selectedAbility = null;
    ability.Selected = false;
    ability.UpdateUI();
}

function UnselectDice() {
    let dice = Global.selectedDice;
    if (dice.length == 0)
        return;
    // clear dice buttons
    Global.dice.Buttons.innerHTML = "";
    // unselect dice
    dice.forEach((d) => {
        d.Selected = false;
        d.UpdateUI();
    })
    // clear array
    Global.selectedDice.length = 0;
}

function UnselectRelic() {
    let relic = Global.selectedRelic;
    if (relic == null)
        return;
    Global.selectedRelic = null;
    relic.Selected = false;
    relic.UpdateUI();
}

function UnselectBonus() {
    let bonus = Global.selectedBonus;
    if (bonus == null)
        return;
    Global.selectedBonus = null;
    bonus.Selected = false;
    bonus.UpdateUI();
}

function EndGame(status) {
    Global.phases.SwitchPhase("End");
    Global.phases.SetStatus(status);
}

function HasWanderingMonsters() {
    let map = Global.map;
    let results = Global.dice.GetRollResults();
    return map.CheckWanderingMonsters(results);
}

function WanderingMonsters() {
    let damage = 0;
    if (HasWanderingMonsters()) {
        console.log("Natural Doubles activated Wandering Monsters effect.");
        damage += 1;
    }
    CalculateDamage(damage);
}

function DoMonsterAttack() {
    let map = Global.map;
    let results = Global.dice.GetRollResults();
    if (results == null)
        return false;
    let damage = map.CheckMonsterAttack(results);
    CalculateDamage(damage);
    return true;
}

function CheckDungeon(dungeon, tile) {
    // check for item collection/monster defeat
    dungeon.CheckForCollection(tile, Global.map.Monsters);

    // Need to recheck fully everytime
    if (dungeon.IsFinished()) {
        console.log(`Finished Dungeon ${dungeon.Name}`);
        Global.phases.SwitchPhase("Finish");
        return true;
    }
    return false;
}

function RecalculateDamage() {
    let phases = Global.phases;
    if (phases.Phase == "Monster")
        DoMonsterAttack();
}

function CalculateDamage(damage) {
    let phases = Global.phases;
    phases.SetDamage(damage);
}

// Returns false if the player died
function DoDamage(damage) {
    if (damage > 0) {
        console.log(`Received ${damage} damage`);
        // give the player damage
        Global.character.GotDamage(damage);
        // check for death
        if (Global.character.IsDead()) {
            Global.map.UnselectDungeon();
            // notify the user
            EndGame("You're dead");
            //alert("You're dead.");
            return false;
        }
    }
    return true;
}

function CanSwitchPhase(current, phase) {
    switch (phase) {
        case "SelectDungeon":
            return current == "Finish";
        case "Roll":
            if (current != "Explore" && current != "SelectDungeon")
                return false;
            let map = Global.map;
            if (!map.HasActiveDungeon()) {
                return false;
            }
            let pool = Global.dice;
            let results = pool.Reroll();
            if (Global.debug.IsDebug && Global.debug.ForceDiceResults) {
                pool.SetDice(Global.debug.GetRollResults());
            }
            if (!results) {
                console.log("Can't reroll dice.");
                return false;
            }
            Global.map.OnReroll(); //TODO: do this as an event, also change it to OnTurnStart
            Global.character.OnReroll();
            return true;
        case "Monster":
            return current == "Roll";
        case "Explore":
            return current == "Monster";
        case "Finish":
            return current == "Roll" || current == "Monster" || current == "Explore";
        case "End":
            return true;
    }
    console.error(`Unknown Phase: ${phase}`);
}

function OnPhaseStart(phase) {
    switch (phase) {
        case "Roll": {
            // Wandering monsters
            WanderingMonsters();
            // check phase switch
            /// if we need to protect from wandering monsters
            if (Global.phases.GetDamage() > 0) {
                // if we can ignore the damage somehow
                if (Global.character.CanBlockDamage()) {
                    return;
                }
            }
            Global.phases.SwitchPhase("Monster");
            break;
        }
        case "Monster": {
            DoMonsterAttack();
            // check phase switch
            /// if we need to protect from monster attacks
            if (Global.phases.GetDamage() > 0) {
                // if we can block the damage or change
                if (Global.character.CanBlockDamage())
                    return;

                // check dice changing effects like items or ability/weapons/relics
                if (Global.map.CanChangeMonsterAttacks() ||
                    Global.character.CanChangeMonsterAttacks())
                    return;
            }
            Global.phases.SwitchPhase("Explore");
            break;
        }
        case "Finish": {
            let map = Global.map;
            let dungeon = map.SelectedDungeon;
            let char = Global.character;
            let dice = Global.dice;

            map.FinishDungeon();
            // check if there is a sequential path
            if (dungeon.IsFinished(true)) {
                //TODO: move this into the map?
                let rewards = dungeon.CalculateXP();
                let xp = rewards.xp;
                let enemies = rewards.enemies;
                let monsterXP = map.GetMonsterXP(enemies);
                let total = xp + monsterXP;
                console.log(`Got ${total} experience. (${xp} + ${monsterXP})`);
                // give rewards to the player
                char.GotExperience(total);
                if (map.HasFinishedGame()) {
                    EndGame("You've won.");
                    console.log("Won");
                    //TODO: score?
                    break;
                }
                dice.SetAvailableDice(char.GoodDice, 0);
                // allow player to choose weapon/relic
                if (char.CanUnlockWeaponRelics())
                    char.AllowWeaponSelection(true);
                else // switch to next phase if not possible
                    Global.phases.SwitchPhase("SelectDungeon");
            } else {
                console.log("Dungeon did not finish with a sequential path");
                Global.phases.SwitchPhase("SelectDungeon");
            }
            break;
        }
        case "End": {
            // disable all dice
            let pool = Global.dice;
            for (let i in pool.Dice) {
                let dice = pool.Dice[i];
                dice.Used = true;
                dice.UpdateUI();
            }
            break;
        }
    }
}

function OnPhaseEnd(phase, nextPhase) {
    switch (phase) {
        case "Monster": {
            if (nextPhase == "End")
                return true;
            // Recalc the monster attack
            DoMonsterAttack();
            // Then do the Roll stuff
        }
        case "Roll": {
            if (nextPhase == "End")
                return true;
            // take the cached dmg
            let dmg = Global.phases.GetDamage();
            if (dmg > 0) {
                if (!DoDamage(dmg))
                    return false;
            }
            // reset status
            Global.phases.SetStatus("");
            break;
        }
        case "Explore":
            Global.character.OnTurnEnd();
            break;
        case "Finish":
            Global.character.AllowWeaponSelection(false);
            break;
        default:
            break;
    }
    return true;
}

function OnWeaponRelicUnlock() {
    // switch to the next phase
    Global.phases.SwitchPhase("SelectDungeon");
}

function OnBonusClick(bonus) {
    console.log(`Clicked bonus ${bonus.Type}`);
    // check if it can be clicked
    if (!bonus.CanBeUsed())
        return;
    // unselect everything else
    let prev = Global.selectedBonus;
    UnselectItem();
    UnselectAbility();
    UnselectDice();
    UnselectRelic();
    UnselectBonus();
    Global.dice.UnselectDice();
    if (prev == bonus) // toggle
        return;

    //TODO: instant activation bonus?
    /*switch (bonus.Type) {

    }*/
    Global.selectedBonus = bonus;
    bonus.Selected = true;
    bonus.UpdateUI();
}

function OnRelicClick(relic) {
    console.log(`Clicked relic ${relic.Name}`);
    let prev = Global.selectedRelic;
    UnselectItem();
    UnselectAbility();
    UnselectDice();
    UnselectRelic();
    UnselectBonus();
    Global.dice.UnselectDice();
    if (prev == relic) // toggle
        return;

    // instant activation relics
    switch (relic.Effect) {
        case "ignoreDmg":
            let phases = Global.phases;
            if (phases.DamageToDeal <= 0)
                return;

            Global.phases.AddDamageReduction(relic.Amount);
            relic.Use();
            return;
        case "discardEvil":
            let pool = Global.dice;
            let counter = 0;
            for (let i in pool.EvilDice) {
                let dice = pool.EvilDice[i];
                if (dice.Disabled || dice.Used)
                    continue;
                counter++;
                dice.Used = true;
                dice.UpdateUI();
            }
            if (counter == 0) // we did nothing
                return;
            relic.Use();
            return;
        default:
            break;
    }
    Global.selectedRelic = relic;
    relic.Selected = true;
    relic.UpdateUI();
}

function OnAbilityClick(ability) {
    console.log(`Clicked ability ${ability.Name}`);
    let prev = Global.selectedAbility;
    UnselectItem();
    UnselectAbility();
    UnselectDice();
    UnselectRelic();
    UnselectBonus();
    Global.dice.UnselectDice();
    if (prev == ability) // toggle
        return;

    Global.selectedAbility = ability;
    ability.Selected = true;
    ability.UpdateUI();
}

function OnDungeonClick(dungeon) {
    console.log(`Clicked dungeon ${dungeon.Name}`);
    let map = Global.map;
    let character = Global.character;
    if (Global.phases.Phase != "SelectDungeon")
        return;

    if (map.CanSelectDungeon(dungeon) && !character.IsDead()) {
        map.SelectDungeon(dungeon);
        let pool = Global.dice;
        pool.SetAvailableDice(pool.AvailableGood, dungeon.Dice);
        // Run roll phase
        if (!Global.phases.SwitchPhase("Roll")) {
            console.error("Could not start Roll phase");
        }
    }
}

function OnTileClick(dungeon, tile) {
    console.log(`Clicked tile ${tile.Type} (${tile.GetID()}) in dungeon ${dungeon.Name}`);
    // Activate item?
    if (tile.Type == "item" && tile.CanBeUsed()) {
        console.debug(`Use item ${tile.Subtype}`);
        let prev = Global.selectedItem;
        UnselectItem();
        UnselectAbility();
        UnselectDice();
        UnselectRelic();
        UnselectBonus();
        Global.dice.UnselectDice();
        if (prev == tile) // just deselected
            return;
        switch (tile.Subtype) {
            case "potion":
                Global.character.GotPotion(1);
                tile.Use();
                tile.UpdateUI();
                break;
            case "poison":
            case "teleportPotion":
            case "key":
            case "coin":
                // select coin
                Global.selectedItem = tile;
                tile.Selected = true;
                tile.UpdateUI();
                break;
            //TODO: other items
        }
        return;
    }

    if (!dungeon.Active) {
        console.error(`Dungeon ${dungeon.Name} is not active`);
        return;
    }

    // use item?
    if (Global.selectedItem != null) {
        let item = Global.selectedItem;
        switch (item.Subtype) {
            //TODO: merge them pls?
            case "teleportPotion":
                // dont unlock unlocked tiles
                if (tile.Unlocked)
                    break;
                // useable on locks + doors
                if ((tile.Type != "toggleable" || tile.Subtype != "lock") &&
                    (tile.Type != "wall"))
                    break;
                // only useable on reachable tiles
                if (!dungeon.CanReachTile(tile, Global.character))
                    break;
                tile.Unlocked = true;
                tile.UpdateUI();
                item.Use();
                UnselectItem();
            case "key":
                // dont unlock unlocked tiles
                if (tile.Unlocked)
                    break;
                // only useable on locks
                if (tile.Type != "toggleable" || tile.Subtype != "lock")
                    break;
                // only useable on reachable tiles
                if (!dungeon.CanReachTile(tile, Global.character))
                    break;
                tile.Unlocked = true;
                tile.UpdateUI();
                item.Use();
                UnselectItem();
                break;
            case "poison":
                // normal tile rules
                if (!tile.CanBeMarked())
                    break;
                // check if its orthogonally
                if (!dungeon.CheckTileReachable(tile, 1, Tile.GetOrthogonalNeighbours))
                    break;
                tile.Value = 4;
                tile.UpdateUI();
                item.Use();
                UnselectItem();
                if (CheckDungeon(dungeon, tile))
                    return;
                RecalculateDamage();
                break;
            default:
                break;
        }
        // let items that do nothing fall through?
    }
    if (Global.selectedRelic != null) {
        let relic = Global.selectedRelic;
        switch (relic.Effect) {
            case "markDice":
                let dice = Global.selectedDice;
                if (dice.length == 0)
                    return;
                // normal tile rules
                if (!tile.CanBeMarked())
                    break;
                // check if its reachable
                let char = Global.character;
                if (!dungeon.CanReachTile(tile, char))
                    return;
                tile.Value = dice[0].Value;
                tile.UpdateUI();
                relic.Use();
                UnselectRelic();
                UnselectDice();
                if (CheckDungeon(dungeon, tile))
                    return;
                RecalculateDamage();
                break;
            default:
                break;
        }
        // let items that do nothing fall through?
    }
    // Use dice
    if (Global.phases.Phase != "Explore")
        return;

    let dice = Global.dice;
    if (!dice.CanUseDice(dice.SelectedDice))
        return;

    if (!tile.CanBeMarked())
        return;

    let char = Global.character;
    if (!dungeon.CanReachTile(tile, char))
        return;

    // use dice
    if (!dice.UseDice(tile))
        return;

    if (CheckDungeon(dungeon, tile)) {
        return;
    }

    // check for trap, needs to be done after item collection + dungeon finish
    Global.map.CheckTrap(tile);
}

function OnDiceClick(dice) {
    console.log(`Clicked dice ${dice}`);
    // Use item on dice?
    if (Global.selectedItem != null) {
        let item = Global.selectedItem;
        switch (item.Subtype) {
            case "coin": {
                if (!Global.dice.CanUseDice(dice))
                    break;
                let prev = Global.selectedDice[0] ?? null;
                // unselect old one, if selected
                UnselectDice();
                if (prev == dice) { // if it was selected, toggle
                    return;
                }
                // select dice
                Global.selectedDice.push(dice);
                dice.Selected = true;
                dice.UpdateUI();
                // create buttons
                Global.dice.Buttons.innerHTML = `<button>+1</button><button>-1</button>`;
                let buttons = Global.dice.Buttons.querySelectorAll("button");
                let plus = buttons[0];
                let minus = buttons[1];
                plus.disabled = dice.Value + 1 > 6;
                minus.disabled = dice.Value - 1 < 1;

                function action(mod) {
                    let newRes = dice.Value + mod;
                    if (newRes > 6 || newRes < 1) {
                        alert("Dice Value can't go lower than 1 or higher 6.")
                        return;
                    }
                    dice.Value = newRes;
                    UnselectDice();
                    // unselect item
                    UnselectItem();
                    item.Use();
                    item.UpdateUI();
                    RecalculateDamage();
                }

                plus.onclick = () => action(1);
                minus.onclick = () => action(-1);
                return;
            }
        }
    }
    if (Global.selectedAbility != null) {
        let ability = Global.selectedAbility;
        switch (ability.Type) {
            case "sacrificeDouble": {
                // only use it on dice
                if (!Global.dice.CanUseDice(dice))
                    return;

                if (Global.selectedDice.length == 0) {
                    // only good dice can be selected
                    if (dice.IsEvil)
                        return;
                    // select
                    Global.selectedDice.push(dice);
                    dice.Selected = true;
                    dice.UpdateUI();
                } else {
                    let sacrifice = Global.selectedDice[0];
                    // dont sacrifice yourself, toggle instead
                    if (sacrifice == dice) {
                        UnselectDice();
                        return;
                    }
                    // only dice values
                    if (dice.Value > 3)
                        return;

                    // double selected dice
                    dice.Value *= 2;
                    dice.UpdateUI();
                    // sacrifice dice
                    sacrifice.Used = true;
                    // unselect other stuff
                    UnselectDice();
                    UnselectAbility();
                    RecalculateDamage();
                }
                return;
            }
        }
    }
    if (Global.selectedRelic != null) {
        let relic = Global.selectedRelic;
        switch (relic.Effect) {
            case "rerollGood": {
                if (dice.IsEvil)
                    return;
                if (!Global.dice.CanUseDice(dice))
                    return;
                dice.Reroll();
                relic.Use();
                UnselectRelic();
                return;
            }
            case "markDice": {
                if (!Global.dice.CanUseDice(dice))
                    return;
                let prev = Global.selectedDice[0] ?? null;
                // unselect old one, if selected
                UnselectDice();
                if (prev == dice) { // if it was selected, toggle
                    return;
                }
                Global.selectedDice.push(dice);
                dice.Selected = true;
                dice.UpdateUI();
                return;
            }
        }
    }
    if (Global.selectedBonus != null) {
        let bonus = Global.selectedBonus;
        switch (bonus.Type) {
            case "rerollAny": {
                //TODO: multi dice selection
                if (!Global.dice.CanUseDice(dice))
                    break;
                let index = Global.selectedDice.indexOf(dice);
                if (index > -1) {
                    Global.selectedDice.splice(index, 1); // toggle dice
                    if (Global.selectedDice.length == 0) {
                        UnselectDice(); // clear everything
                    } else {
                        dice.Selected = false;
                        dice.UpdateUI();
                    }
                    return;
                }
                // select dice
                Global.selectedDice.push(dice);
                dice.Selected = true;
                dice.UpdateUI();
                // create buttons
                Global.dice.Buttons.innerHTML = `<button>Reroll</button>`;
                let button = Global.dice.Buttons.querySelector("button");
                button.onclick = () => {
                    for (let i in Global.selectedDice) {
                        let dice = Global.selectedDice[i];
                        dice.Reroll();
                    }
                    UnselectDice();
                    UnselectBonus();
                    bonus.Use();
                    bonus.UpdateUI();

                    // recalculate monster dmg
                    RecalculateDamage();
                }
                return;
            }
        }
    }

    if (Global.phases.Phase != "Explore")
        return;

    if (!Global.dice.SelectDice(dice))
        return;
    UnselectDice();
    UnselectItem();
    UnselectAbility();
    UnselectRelic();
    UnselectBonus();
}