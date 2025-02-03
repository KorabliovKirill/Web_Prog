const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
canvas.width = 800
canvas.height = 600

let players = {}

socket.on('updatePlayers', serverPlayers => {
	players = serverPlayers
	drawGame()
})

document.addEventListener('keydown', event => {
	const keyMap = {
		ArrowUp: 'up',
		ArrowDown: 'down',
		ArrowLeft: 'left',
		ArrowRight: 'right',
	}
	if (keyMap[event.key]) {
		socket.emit('move', keyMap[event.key])
	}
})

function drawGame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	for (let id in players) {
		let player = players[id]
		if (player.alive) {
			ctx.fillStyle = player.color
			ctx.fillRect(player.x, player.y, 10, 10)
			ctx.beginPath()
			ctx.strokeStyle = player.color
			ctx.lineWidth = 2
			if (player.path.length > 0) {
				ctx.moveTo(player.path[0].x, player.path[0].y)
				for (let p of player.path) {
					ctx.lineTo(p.x, p.y)
				}
			}
			ctx.stroke()
		}
	}
}
