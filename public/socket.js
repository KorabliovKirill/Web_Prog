// public/socket.js
const socket = io()

socket.on('gameOver', message => {
	alert(message)
	location.reload()
})

socket.on('waitingForPlayers', remaining => {
	document.getElementById(
		'waitingScreen'
	).innerText = `Ожидание ${remaining} игроков...`
})

socket.on('gameStart', () => {
	document.getElementById('waitingScreen').style.display = 'none'
	document.getElementById('gameCanvas').style.display = 'block'
})
