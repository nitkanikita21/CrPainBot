const readline = require("readline")

const mineflayer = require('mineflayer')
const { printSchem } = require("./printer")
const mineflayerViewer = require('prismarine-viewer').mineflayer
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals

let bot = mineflayer.createBot({
    host: 'craftoriya.com', // minecraft server ip
    username: 'jordany228', // minecraft username
    auth: 'offline', // for offline mode servers, you can set this to 'offline'
    // port: 25565,                // only set if you need a port that isn't 25565
    version: "1.20",             // only set if you need a specific version or snapshot (ie: "1.8.9" or "1.16.5"), otherwise it's set automatically
    // password: '12345678'        // set if you want to use password-based auth (may be unreliable)
})
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
bot.loadPlugin(pathfinder)

rl.on('line', (ln) => {
    const defaultMove = new Movements(bot)
    bot.pathfinder.setMovements(defaultMove)
    switch(true) {
        case /\$gotoserver/.test(ln):
            bot.pathfinder.setGoal(new GoalNear(-8, 66, 0, 1))
            setTimeout(()=> {
                bot.activateBlock(bot.blockInSight(3))
            }, 5000)
        break
        case /\$print/.test(ln):
            printSchem(bot, "./schematics/billy.schem")
        break
        case /\$goto (.+)/.test(ln):

            bot.pathfinder.setGoal(new GoalNear(
                parseFloat(ln.split(" ")[1].split(";")[0]),
                parseFloat(ln.split(" ")[1].split(";")[1]),
                parseFloat(ln.split(" ")[1].split(";")[2]),
                0.2
            ))
        break
        case /\$getpos/.test(ln):
            console.log(bot.entity.position)
        break

        default:
            bot.chat(ln)
    }
})
bot._client.on('map', (map) => {
    const size = Math.sqrt(map.data.length)

    // Make an histogram of the colors
    const h = {}
    for (const v of map.data) {
        if (!h[v]) h[v] = 0
        h[v]++
    }

    // The most popular color is background, the second is the numbers
    const colors = Object.entries(h).sort((a, b) => b[1] - a[1]).map(x => parseInt(x[0], 10))
    const fg = colors[1]

    // Display the image as a black/white ascii
    for (let i = 0; i < size; i++) {
        let line = ''
        for (let j = 0; j < size; j++) {
            let v = map.data[i * 128 + j]
            line += (v != fg) ? ' ' : '%'
        }
        console.log(line)
    }
})

bot.on('message', function (message) {
    console.log('chat> ' + message)
})

bot.once('spawn', () => {
    
})
// Log errors and kick reasons:
bot.on('kicked', (reason, loggedIn) => {
    console.log('kicked')
    console.log(reason, loggedIn)
    console.log("reconecting after 5 seconds...")
    setTimeout(()=>{
        bot._client.connect(25565, "craftoriya.com")
    }, 5000)
})
bot.on('error', err => console.log(err))

// -8 66 0