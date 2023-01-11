const url = window.location;
const socket = io(url.origin);

function init() {
    draw();
    // console.log(orbs);
    socket.emit("init", {
        playerName: player.name
    });
}

socket.on("initReturn", (data) => {
    orbs = data.orbs;
    setInterval(() => {
        socket.emit("tick", {
            xVector: player.xVector,
            yVector: player.yVector
        })
    }, 33)
})

socket.on("tock", (data) => {
    players = data.players;
})


socket.on("orbSwitch", (data) => {
    orbs.splice(data.orbIndex, 1, data.newOrb);
})
socket.on("tickTock", (data) => {
    document.querySelector(".player-score").innerText = data.playerScore
    player.locX = data.playerX;
    player.locY = data.playerY;
})

socket.on("updateLeaderBoard", (data) => {
    document.querySelector(".leader-board").innerHTML = "";
    data.forEach((l) => {
        document.querySelector(".leader-board").innerHTML += `<li class="leaderboard-player">${l.name} - ${l.score}</li>`;
    })
})

socket.on("playerDeath", (data) => {
    const gameMessage = document.querySelector("#game-message");
    gameMessage.innerHTML = `${data.died.name} absorbed by ${data.killedBy.name}`;
    $("#game-message").css({ "background-color": "#00e6e6", "opacity": 1 });
    $("#game-message").show();
    $("#game-message").fadeOut(5000);
})