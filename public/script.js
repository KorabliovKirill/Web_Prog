const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const gridSize = 20;
const players = {};
const trails = {};
const maxTrailLength = 15;
const trailWidth = 5; // Увеличена толщина линии следа

// Создаём затемняющий фон и текстовое сообщение
const overlay = document.createElement('div');
overlay.id = 'overlay';
document.body.appendChild(overlay);

const messageBox = document.createElement('div');
messageBox.style.position = 'absolute';
messageBox.style.top = '50%';
messageBox.style.left = '50%';
messageBox.style.transform = 'translate(-50%, -50%)';
messageBox.style.color = '#00ffdd';
messageBox.style.fontSize = '2rem';
messageBox.style.fontFamily = 'Orbitron, sans-serif';
messageBox.style.display = 'none';
document.body.appendChild(messageBox);

socket.on('currentPlayers', currentPlayers => {
	Object.keys(currentPlayers).forEach(id => {
		if (currentPlayers[id]) {
			players[id] = currentPlayers[id];
			trails[id] = [];
			drawPlayer(players[id]);
		}
	});
});

socket.on('newPlayer', playerInfo => {
	players[playerInfo.id] = playerInfo;
	trails[playerInfo.id] = [];
	drawPlayer(playerInfo);
});

socket.on('playerMoved', playerInfo => {
	if (players[playerInfo.id]) {
		trails[playerInfo.id].push({
			x: players[playerInfo.id].x + gridSize / 2,
			y: players[playerInfo.id].y + gridSize / 2,
		});
		if (trails[playerInfo.id].length > maxTrailLength) {
			trails[playerInfo.id].shift(); // Remove the oldest trail segment
		}
		players[playerInfo.id].x = playerInfo.x;
		players[playerInfo.id].y = playerInfo.y;
		drawPlayer(playerInfo);
	}
});

socket.on('playerLost', playerId => {
	if (players[playerId]) {
		delete players[playerId];
		delete trails[playerId];

		if (playerId === socket.id) {
			overlay.innerText = 'ВЫ ПРОИГРАЛИ!';
			overlay.classList.add('show');
		}

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		Object.values(players).forEach(player => drawPlayer(player));
	}
});

socket.on('playerWon', winnerId => {
	if (winnerId === socket.id) {
		overlay.innerText = 'ВЫ ПОБЕДИЛИ!';
		overlay.classList.add('show');
	}
});

socket.on('gameOver', () => {
	overlay.innerText = 'ИГРА ОКОНЧЕНА. ПОБЕДИТЕЛЯ НЕТ.';
	overlay.classList.add('show');
});

document.addEventListener('keydown', event => {
	socket.emit('keydown', event.key);
});

function drawPlayer(player) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	Object.values(players).forEach(p => {
		// Draw player with outline
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x, p.y, gridSize, gridSize);
		ctx.strokeStyle = 'white';
		ctx.lineWidth = 2;
		ctx.strokeRect(p.x, p.y, gridSize, gridSize);

		// Draw trail as a continuous line
		ctx.beginPath();
		ctx.lineWidth = trailWidth;
		ctx.strokeStyle = p.color;
		ctx.lineCap = 'round'; // Rounded ends for the trail
		ctx.lineJoin = 'round'; // Rounded corners for the trail

		trails[p.id].forEach((pos, index) => {
			if (index === 0) {
				ctx.moveTo(pos.x, pos.y);
			} else {
				ctx.lineTo(pos.x, pos.y);
			}
		});

		// Ensure the trail connects to the player's current position
		ctx.lineTo(p.x + gridSize / 2, p.y + gridSize / 2);
		ctx.stroke();
	});
}
