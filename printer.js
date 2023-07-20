const { BehaviorMoveTo, BehaviorPlaceBlock } = require("mineflayer-statemachine");
const { Schematic } = require('prismarine-schematic')
const fs = require("fs/promises");
const Item = require('prismarine-item')('1.20')
const mineflayer = require('mineflayer');
const MinecraftData = require("minecraft-data");
const { GoalNear, GoalPlaceBlock, GoalNearXZ, GoalXZ, GoalLookAtBlock, GoalCompositeAll } = require('mineflayer-pathfinder').goals
const { Vec3 } = require("vec3")

const sleep = ms => new Promise(r => setTimeout(r, ms));

// This targets object is used to pass data between different states. It can be left empty.

/**
 * 
 * @param {import("mineflayer").Bot} bot 
 * @param {string} file 
 */
module.exports.printSchem = async function (bot, file) {
    const schematic = await Schematic.read(await fs.readFile(file))

    const mcData = MinecraftData("1.20")

    const startpos = bot.entity.position;

    /* const block = schematic.getBlock(new Vec3(1, 0, 1))
    const item = mcData.itemsByName[mcData.blocks[block.type].name];
    console.log(item)
    console.log(JSON.stringify(new Item(item.id, 1)))
    bot.creative.setInventorySlot(5, new Item(mcData.itemsByName["lime_bed"].id, 1)); */
    bot.creative.setInventorySlot(5, new Item(mcData.itemsByName["lime_bed"].id, 1))

    let y = 86;
    let x = 1;
    let z = 1;

    async function placeBlock() {
        const block = schematic.getBlock(new Vec3(x, 0, z))
        console.log(block)
        const itemForPlace = mcData.itemsByName[mcData.blocks[block.type].name]

        // bot.creative.setInventorySlot(0, itemForPlace)

        let item = new Item(itemForPlace.id, 1)
        console.log("a ", item)

        await bot.creative.setInventorySlot(36, item)
        await bot.setQuickBarSlot(0)
        bot.inventory.slots.forEach((it, i) => {
            if(it != null) {
                console.log(`${i} ${JSON.stringify(it)}`)
            }
        })
        
        // startpos.add(new Vec3(x, y, z))
        await bot.pathfinder.goto(new GoalXZ(startpos.x + x, startpos.z + z))
        await bot.lookAt(new Vec3(startpos.x + x, y-1, startpos.z + z))
        await bot.activateItem()
        x++;
        if (x >= 128) {
            x = 0;
            z++;
        }
        await bot.waitForTicks(20*2);
        placeBlock()
    }

    placeBlock()

    //bot.placeBlock(bot.entity.position.floored())
}