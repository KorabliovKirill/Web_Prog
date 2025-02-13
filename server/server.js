const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const gameLogic = require('./gameLogic');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', socket => {
	console.log('New player connected:', socket.id);

	const player = gameLogic.addPlayer(socket.id);
	socket.emit('currentPlayers', gameLogic.getPlayers());
	socket.broadcast.emit('newPlayer', player);

	socket.on('keydown', key => {
		const moveResult = gameLogic.movePlayer(socket.id, key);

		if (moveResult) {
			if (moveResult.lost) {
				io.emit('playerLost', moveResult.id);
				const winner = gameLogic.checkVictory();
				if (winner) {
					io.emit('playerWon', winner.id);
				}
			} else {
				io.emit('playerMoved', moveResult);
			}
		}
	});

	socket.on('disconnect', () => {
		console.log('Player disconnected:', socket.id);
		gameLogic.removePlayer(socket.id);
		io.emit('playerDisconnected', socket.id);

		if (gameLogic.isGameOver()) {
			io.emit('gameOver', null);
		} else {
			const winnerId = gameLogic.checkVictory();
			if (winnerId) {
				io.emit('playerWon', winnerId);
			}
		}
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
