// comments.js - Управление комментариями

document.addEventListener('DOMContentLoaded', () => {
	loadComments();
});

const commentForm = document.getElementById('comment-form');
const commentList = document.getElementById('comment-list');

// Отправка комментария
commentForm.addEventListener('submit', async e => {
	e.preventDefault();
	const author = document.getElementById('author').value.trim();
	const text = document.getElementById('text').value.trim();

	// Проверяем, использовал ли пользователь другое имя
	const savedAuthor = localStorage.getItem('commentAuthor');
	if (savedAuthor && savedAuthor !== author) {
		alert(
			'Вы можете оставлять комментарии только под своим именем! Ваше имя: ' +
				savedAuthor
		);
		return;
	}

	if (author && text) {
		const comment = { author, text, id: Date.now() };
		addCommentToDOM(comment);
		await saveCommentToServer(comment);
		// Сохраняем имя в localStorage
		localStorage.setItem('commentAuthor', author);
	}
	commentForm.reset();
});

// Добавление комментария в DOM
function addCommentToDOM(comment) {
	const commentItem = document.createElement('div');
	commentItem.classList.add('comment-item');
	commentItem.dataset.id = comment.id;
	commentItem.innerHTML = `
    <p><strong>${comment.author}:</strong> <span class="comment-text">${comment.text}</span></p>
    <button onclick="editComment(${comment.id})">Редактировать</button>
    <button onclick="deleteComment(${comment.id})">Удалить</button>
  `;
	commentList.appendChild(commentItem);
}

// Удаление комментария
async function deleteComment(id) {
	const commentItem = document.querySelector(`[data-id='${id}']`);
	if (commentItem) {
		commentItem.remove();
		await fetch(`/delete-comment/${id}`, { method: 'DELETE' });
	}
}

// Редактирование комментария
async function editComment(id) {
	const commentItem = document.querySelector(`[data-id='${id}']`);
	const commentText = commentItem.querySelector('.comment-text');
	const newText = prompt(
		'Введите новый текст комментария:',
		commentText.textContent
	);

	if (newText && newText.trim() !== '') {
		commentText.textContent = newText.trim();
		await fetch(`/edit-comment/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: newText.trim() }),
		});
	}
}

// Сохранение комментария на сервере
async function saveCommentToServer(comment) {
	await fetch('/add-comment', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(comment),
	});
}

// Загрузка комментариев с сервера
async function loadComments() {
	const response = await fetch('/get-comments');
	const comments = await response.json();
	comments.forEach(addCommentToDOM);
}
