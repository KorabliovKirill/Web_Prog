// server/server.js
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

app.use(express.static('public'))

let players = {} // Хранение игроков
const gameWidth = 800
const gameHeight = 600
const requiredPlayers = 2 // Количество игроков для старта игры
let gameStarted = false

function getRandomColor() {
	const colors = ['cyan', 'magenta', 'yellow', 'lime', 'red', 'blue', 'white']
	return colors[Math.floor(Math.random() * colors.length)]
}

io.on('connection', socket => {
	console.log(`Игрок подключился: ${socket.id}`)

	players[socket.id] = {
		x: Math.floor(Math.random() * gameWidth),
		y: Math.floor(Math.random() * gameHeight),
		direction: ['up', 'down', 'left', 'right'][Math.floor(Math.random() * 4)],
		alive: true,
		path: [],
		color: getRandomColor(),
	}

	if (Object.keys(players).length >= requiredPlayers && !gameStarted) {
		gameStarted = true
		io.emit('gameStart')
	} else {
		io.emit('waitingForPlayers', requiredPlayers - Object.keys(players).length)
	}

	socket.on('move', direction => {
		if (players[socket.id] && players[socket.id].alive) {
			players[socket.id].direction = direction
		}
	})

	function checkCollisions() {
		for (let id in players) {
			let player = players[id]
			if (!player.alive) continue

			if (
				player.x < 0 ||
				player.x >= gameWidth ||
				player.y < 0 ||
				player.y >= gameHeight
			) {
				player.alive = false
				io.to(id).emit('gameOver', 'Вы проиграли!')
				delete players[id]
			}

			for (let otherId in players) {
				if (
					otherId !== id &&
					players[otherId].path.some(p => p.x === player.x && p.y === player.y)
				) {
					player.alive = false
					io.to(id).emit('gameOver', 'Вы проиграли!')
					delete players[id]
				}
			}
		}
		io.emit('updatePlayers', players)

		let alivePlayers = Object.keys(players)
		if (alivePlayers.length === 1) {
			io.to(alivePlayers[0]).emit('gameOver', 'Вы победили!')
			delete players[alivePlayers[0]]
			gameStarted = false
		}
	}

	setInterval(() => {
		if (!gameStarted) return
		for (let id in players) {
			let player = players[id]
			if (player.alive) {
				if (player.direction === 'up') player.y -= 5
				if (player.direction === 'down') player.y += 5
				if (player.direction === 'left') player.x -= 5
				if (player.direction === 'right') player.x += 5
				player.path.push({ x: player.x, y: player.y })
				if (player.path.length > 50) player.path.shift()
			}
		}
		checkCollisions()
	}, 100)

	socket.on('disconnect', () => {
		console.log(`Игрок отключился: ${socket.id}`)
		delete players[socket.id]
		io.emit('updatePlayers', players)
		if (Object.keys(players).length < requiredPlayers) {
			gameStarted = false
			io.emit(
				'waitingForPlayers',
				requiredPlayers - Object.keys(players).length
			)
		}
	})
})

server.listen(3000, '0.0.0.0', () => {
	console.log('Сервер запущен на порту 3000')
})
