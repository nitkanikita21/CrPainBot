
const { BehaviorMoveTo, BehaviorPlaceBlock } = require("mineflayer-statemachine");
const { Schematic } = require('prismarine-schematic')
const fs = require("fs/promises");
const mineflayer = require('mineflayer');
const MinecraftData = require("minecraft-data");
const { GoalNear, GoalPlaceBlock, GoalNearXZ, GoalXZ, GoalLookAtBlock, GoalCompositeAll } = require('mineflayer-pathfinder').goals
const { Vec3 } = require("vec3")


// This targets object is used to pass data between different states. It can be left empty.

/**
 * 
 * @param {import("mineflayer").Bot} bot 
 * @param {string} file 
 * @param {Vec3} startPos
 * @param {string} version
 */
module.exports.printSchem = async function (bot, file, startPos, version, readY) {
    const Item = require('prismarine-item')(version)
    const mcData = MinecraftData(version)

    const schematic = await Schematic.read(await fs.readFile(file))
    console.log("size", schematic.size)
    console.log("start", schematic.start())
    console.log("end", schematic.end())

    
    /* const block = schematic.getBlock(new Vec3(1, 0, 1))
    const item = mcData.itemsByName[mcData.blocks[block.type].name];
    console.log(item)
    console.log(JSON.stringify(new Item(item.id, 1)))
    bot.creative.setInventorySlot(5, new Item(mcData.itemsByName["lime_bed"].id, 1)); */
    //$print -566.3;-792.2 1.19 billy.schem -13
    
    let y = 86;
    let x = 0;
    let z = 0;
    
    await bot.creative.flyTo(new Vec3(startPos.x, y, startPos.z))
    const startpos = bot.entity.position;
    await bot.waitForTicks(50);
    console.log("preparing...")
    
    async function placeBlock() {
        // await bot.creative.setInventorySlot(5, new Item(mcData.itemsArray[Math.floor(Math.random()*mcData.itemsArray.length)].id, 1))
        const block = schematic.getBlock(new Vec3(x, readY, z))
        const itemForPlace = mcData.itemsByName[mcData.blocksByName[block.name].name]
        
        if (x >= schematic.size.x) {
            x = 0;
            z++;
            await bot.waitForTicks(30);
        }
        if(z >= schematic.size.z) {
            z = 0;
            return;
        }
        if(block.name?.includes("air")){
            x++;
            await bot.waitForTicks(10);
            placeBlock()
        }
        console.log(block.name)
        // bot.creative.setInventorySlot(0, itemForPlace)
        
        let item = new Item(itemForPlace.id, 1)

        try {
            await bot.creative.setInventorySlot(36, item)
        } catch (error) {
            placeBlock()
        }
        await bot.setQuickBarSlot(0)
        
        // startpos.add(new Vec3(x, y, z))
        // await bot.pathfinder.goto(new GoalXZ(startpos.x + x, startpos.z + z))
        await bot.creative.flyTo(new Vec3(startpos.x + x, y, startpos.z + z))
        await bot.waitForTicks(5);
        await bot.lookAt(new Vec3(startpos.x + x, y, startpos.z + z), true)
        // await bot.pathfinder.goto(new GoalLookAtBlock(
        //     new Vec3(startpos.x + x, y, startpos.z + z),
        //     bot.world,
        //     {
        //         reach: 2.5
        //     }
        // ))
        await bot.waitForTicks(22);
        
        await bot.activateItem()
        x++;
        placeBlock()
    }

    placeBlock()

    //bot.placeBlock(bot.entity.position.floored())
}