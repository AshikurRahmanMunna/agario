const { io } = require("../server");
const Orb = require("./classes/Orb");
const Player = require("./classes/Player");
const PlayerConfig = require("./classes/PlayerConfig");
const PlayerData = require("./classes/PlayerData");
const { checkForOrbCollisions, checkForPlayerCollisions } = require("./checkCollisions");

let orbs = [];
let players = [];
const settings = {
    defaultOrbs: 5000,
    defaultSpeed: 6,
    defaultSize: 6,
    defaultZoom: 1.5,
    worldWidth: 5000,
    worldHeight: 5000
}

initGame();

setInterval(() => {
    if (players.length > 0) {
        io.to("game").emit("tock", {
            players,
        })
    }
}, 33);


io.sockets.on("connection", (socket) => {
    try {
        let player = {};
        socket.on("init", (data) => {
            socket.join("game");
            const playerConfig = new PlayerConfig(settings);
            const playerData = new PlayerData(data.playerName, settings);
            player = new Player(socket.id, playerConfig, playerData);
            setInterval(() => {
                socket.emit("tickTock", {
                    playerScore: player.playerData.score,
                    playerX: player.playerData.locX,
                    playerY: player.playerData.locY
                })
            }, 33);
            socket.emit("initReturn", { orbs });
            players.push(playerData);
        });
        socket.on("tick", (data) => {
            speed = player.playerConfig?.speed;
            xV = player.playerConfig.xVector = data.xVector;
            yV = player.playerConfig.yVector = data.yVector;

            if ((player.playerData.locX < 5 && player.playerData.xVector < 0) || (player.playerData.locX > settings.worldWidth) && (xV > 0)) {
                player.playerData.locY -= speed * yV;
            } else if ((player.playerData.locY < 5 && yV > 0) || (player.playerData.locY > settings.worldHeight) && (yV < 0)) {
                player.playerData.locX += speed * xV;
            } else {
                player.playerData.locX += speed * xV;
                player.playerData.locY -= speed * yV;
            }
            // orb collision
            let capturedOrb = 0;
            const captureOrb = checkForOrbCollisions(player.playerData, player.playerConfig, orbs, settings);
            captureOrb.then((data) => {
                const orbData = {
                    orbIndex: data,
                    newOrb: orbs[data]
                }
                io.sockets.emit("updateLeaderBoard", getLeaderBoard())
                io.sockets.emit("orbSwitch", orbData);
            }).catch(() => { });

            // player collision
            let playerDeath = checkForPlayerCollisions(player.playerData, player.playerConfig, players, player.socketId);
            playerDeath.then((data) => {
                io.sockets.emit("updateLeaderBoard", getLeaderBoard());
                io.sockets.emit("playerDeath", data);
            }).catch(() => { });
        })
        socket.on("disconnect", (data) => {
            if (player.playerData) {
                players.forEach((currPlayer, i) => {
                    if (currPlayer.uid == player.playerData.uid) {
                        players.splice(i, 1);
                    }
                });
            }
        })
    } catch (error) {
        console.log(error);
    }
})

function getLeaderBoard() {
    players.sort((a, b) => b.score - a.score);
    const leaderBoard = players.map((p) => {
        return {
            name: p.name, score: p.score
        }
    })
    return leaderBoard;
}


function initGame() {
    for (let i = 0; i < settings.defaultOrbs; i++) {
        orbs.push(new Orb(settings));
    }
}

module.exports = io;