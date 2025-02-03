// server.js - Серверная часть на Node.js с Express

const express = require('express')
const fs = require('fs')
const cors = require('cors')
const path = require('path')
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

const COMMENTS_FILE = 'server/comments.json'

// Функция загрузки комментариев из файла
function loadComments() {
	if (!fs.existsSync(COMMENTS_FILE)) {
		fs.writeFileSync(COMMENTS_FILE, '[]', 'utf8') // Создание файла, если его нет
	}
	const data = fs.readFileSync(COMMENTS_FILE, 'utf8')
	return data ? JSON.parse(data) : []
}

// Функция сохранения комментариев в файл
function saveComments(comments) {
	fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2))
}

app.use(express.static(path.join(__dirname, '../')))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../index.html'))
})

// Получение всех комментариев
app.get('/get-comments', (req, res) => {
	res.json(loadComments())
})

// Добавление нового комментария
app.post('/add-comment', (req, res) => {
	const comments = loadComments()
	const newComment = req.body
	comments.push(newComment)
	saveComments(comments)
	res.status(201).json({ message: 'Комментарий добавлен' })
})

// Удаление комментария
app.delete('/delete-comment/:id', (req, res) => {
	let comments = loadComments()
	const commentId = parseInt(req.params.id)
	comments = comments.filter(comment => comment.id !== commentId)
	saveComments(comments)
	res.json({ message: 'Комментарий удалён' })
})

// Редактирование комментария
app.put('/edit-comment/:id', (req, res) => {
	let comments = loadComments()
	const commentId = parseInt(req.params.id)
	const newText = req.body.text

	comments = comments.map(comment =>
		comment.id === commentId ? { ...comment, text: newText } : comment
	)

	saveComments(comments)
	res.json({ message: 'Комментарий обновлён' })
})

app.listen(PORT, () => {
	console.log(`Сервер запущен на http://localhost:${PORT}`)
})
