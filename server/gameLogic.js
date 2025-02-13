const gridSize = 20;
const players = {};
const trails = {}; // Хранит следы всех игроков

function addPlayer(id) {
	const player = {
		id,
		x: Math.floor(Math.random() * 39) * gridSize,
		y: Math.floor(Math.random() * 29) * gridSize,
		color: getRandomColor(),
		lastDirection: null,
		isAlive: true,
	};
	players[id] = player;
	trails[id] = []; // Создаем пустой след
	return player;
}

function removePlayer(id) {
	delete players[id];
	delete trails[id];
}

function getPlayers() {
	return players;
}

function getPlayer(id) {
	return players[id];
}

function movePlayer(id, key) {
	const player = players[id];
	if (!player) return;

	const oppositeDirections = {
		ArrowUp: 'ArrowDown',
		ArrowDown: 'ArrowUp',
		ArrowLeft: 'ArrowRight',
		ArrowRight: 'ArrowLeft',
	};

	if (
		player.lastDirection &&
		oppositeDirections[key] === player.lastDirection
	) {
		return;
	}

	let newX = player.x;
	let newY = player.y;

	switch (key) {
		case 'ArrowUp':
			newY -= gridSize;
			break;
		case 'ArrowDown':
			newY += gridSize;
			break;
		case 'ArrowLeft':
			newX -= gridSize;
			break;
		case 'ArrowRight':
			newX += gridSize;
			break;
	}

	// Проверяем столкновение
	if (checkCollision(id, newX, newY)) {
		player.isAlive = false;
		return { id, lost: true };
	}

	// Обновляем позицию
	player.x = newX;
	player.y = newY;
	player.lastDirection = key;

	// Добавляем точку в след
	trails[id].push({ x: newX, y: newY });

	return { id, x: newX, y: newY, lost: false };
}

function getRandomColor() {
	const letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

function checkCollision(playerId, x, y) {
	// Проверяем столкновение с чужими и своим следом
	for (const [id, trail] of Object.entries(trails)) {
		if (trail.some(pos => pos.x === x && pos.y === y)) {
			return true;
		}
	}
	return false;
}

function checkVictory() {
	const alivePlayers = Object.values(players).filter(p => p.isAlive);
	return alivePlayers.length === 1 ? alivePlayers[0] : null;
}

function isGameOver() {
	return Object.values(players).every(p => !p.isAlive);
}

module.exports = {
	addPlayer,
	removePlayer,
	getPlayers,
	getPlayer,
	movePlayer,
	checkVictory,
	isGameOver,
};
