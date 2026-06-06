// Плавный скролл к форме
function scrollToRSVP() {
    document.getElementById('rsvp').scrollIntoView({
        behavior: 'smooth'
    });
}

// Открыть карту
function openMap() {
    window.open('https://yandex.ru/maps/?text=Санкт-Петербург, Колпино, Балканская дорога, 10к2с1', '_blank');
}

// Обработка формы
document.getElementById('weddingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const attending = document.getElementById('attending').value;
    const guests = document.getElementById('guests').value;
    const message = document.getElementById('message').value;

    // Простая валидация
    if (!name || !attending) {
        showMessage('Пожалуйста, заполните имя и статус присутствия', 'error');
        return;
    }

    // Здесь можно отправить данные на сервер
    // Пока просто показываем успешное сообщение
    const formData = { name, attending, guests, message };
    console.log('Отправлено:', formData);

    // Имитация отправки на сервер
    showMessage(`Спасибо, ${name}! Ваш ответ сохранен. Ждем вас на свадьбе! 🎉`, 'success');

    // Очистить форму
    setTimeout(() => {
        document.getElementById('weddingForm').reset();
    }, 2000);
});

function showMessage(msg, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = msg;
    messageDiv.className = `form-message ${type}`;

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'form-message';
    }, 5000);
}