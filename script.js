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

// Функция для сохранения ответа в localStorage
function saveGuestToLocalStorage(guestData) {
    // Получаем существующие ответы
    let responses = localStorage.getItem('wedding_responses');
    let responsesArray = [];

    if (responses) {
        try {
            responsesArray = JSON.parse(responses);
        } catch(e) {
            responsesArray = [];
        }
    }

    // Добавляем новый ответ
    responsesArray.push(guestData);

    // Сохраняем обратно
    localStorage.setItem('wedding_responses', JSON.stringify(responsesArray, null, 2));

    // Также сохраняем отдельно как последний ответ
    localStorage.setItem('last_response', JSON.stringify(guestData, null, 2));

    return responsesArray.length;
}

// Функция для показа всех ответов (админская)
function showResponses() {
    const responses = localStorage.getItem('wedding_responses');
    if (!responses) {
        alert('Пока нет ни одного ответа');
        return;
    }

    try {
        const data = JSON.parse(responses);
        const count = data.length;

        // Создаём окно с ответами
        let message = `📊 Всего ответов: ${count}\n\n`;
        data.forEach((guest, index) => {
            message += `${index + 1}. ${guest.fullName} - ${guest.attendance === 'exactly' ? '✅ Точно придёт' : guest.attendance === 'probably' ? '🤔 Скорее всего' : '❌ Не придёт'}\n`;
            if (guest.totalGuests > 1) {
                message += `   👥 С ним ${guest.totalGuests} человек\n`;
            }
        });
        message += `\n💾 Все данные сохранены в localStorage браузера`;
        message += `\n📋 Чтобы скачать JSON, откройте консоль (F12) и введите: downloadData()`;

        alert(message);

        // Также выводим в консоль для разработчиков
        console.log('Все ответы гостей:', data);
    } catch(e) {
        alert('Ошибка при чтении данных');
    }
}

// Функция для скачивания JSON файла (для администратора)
function downloadData() {
    const responses = localStorage.getItem('wedding_responses');
    if (!responses) {
        alert('Нет данных для скачивания');
        return;
    }

    const data = JSON.parse(responses);
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_guests_${new Date().toISOString().slice(0,19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Добавляем функцию скачивания в глобальный объект
window.downloadData = downloadData;

// Ждём загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, инициализация формы...');

    const attendanceSelect = document.getElementById('attendanceStatus');
    const guestsGroup = document.getElementById('guestsGroup');
    const dishesGroup = document.getElementById('dishesGroup');
    const alcoholGroup = document.getElementById('alcoholGroup');
    const wishesGroup = document.getElementById('wishesGroup');
    const allergiesGroup = document.getElementById('allergiesGroup');
    const form = document.getElementById('weddingForm');
    const messageDiv = document.getElementById('formMessage');

    if (!attendanceSelect) {
        console.error('Элемент attendanceStatus не найден!');
        return;
    }

    // Функция показа/скрытия полей в зависимости от статуса присутствия
    function toggleFormFields() {
        const status = attendanceSelect.value;
        const show = (status === 'exactly' || status === 'probably');

        if (guestsGroup) guestsGroup.style.display = show ? 'block' : 'none';
        if (dishesGroup) dishesGroup.style.display = show ? 'block' : 'none';
        if (alcoholGroup) alcoholGroup.style.display = show ? 'block' : 'none';
        if (wishesGroup) wishesGroup.style.display = show ? 'block' : 'none';
        if (allergiesGroup) allergiesGroup.style.display = show ? 'block' : 'none';
    }

    attendanceSelect.addEventListener('change', toggleFormFields);

    function showMessage(msg, type) {
        if (!messageDiv) return;
        messageDiv.textContent = msg;
        messageDiv.className = `form-message ${type}`;
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }
        }, 4000);
    }

    // Обработка отправки формы
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('name')?.value.trim();
            const attendanceStatus = attendanceSelect.value;

            if (!name) {
                showMessage('Пожалуйста, укажите ваше имя', 'error');
                return;
            }

            if (!attendanceStatus) {
                showMessage('Пожалуйста, укажите, сможете ли вы присутствовать', 'error');
                return;
            }

            const email = document.getElementById('email')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';

            let guestsCount = 1;
            let selectedDishes = [];
            let selectedAlcohol = [];
            let wishes = '';
            let allergies = '';

            if (attendanceStatus !== 'no') {
                guestsCount = parseInt(document.getElementById('guestsCount')?.value) || 1;

                // Сбор выбранных блюд
                const dishesCheckboxes = document.querySelectorAll('input[name="dishes"]:checked');
                selectedDishes = Array.from(dishesCheckboxes).map(cb => cb.value);

                // Сбор выбранного алкоголя
                const alcoholCheckboxes = document.querySelectorAll('input[name="alcohol"]:checked');
                selectedAlcohol = Array.from(alcoholCheckboxes).map(cb => cb.value);

                wishes = document.getElementById('wishes')?.value.trim() || '';
                allergies = document.getElementById('allergies')?.value.trim() || '';

                if (selectedDishes.length === 0) {
                    showMessage('Пожалуйста, выберите хотя бы одно блюдо', 'error');
                    return;
                }

                if (selectedAlcohol.length === 0) {
                    showMessage('Пожалуйста, выберите вариант с алкоголем', 'error');
                    return;
                }
            }

            // Формируем данные гостя
            const guestData = {
                id: Date.now(),
                timestamp: new Date().toLocaleString('ru-RU'),
                fullName: name,
                email: email,
                phone: phone,
                attendance: attendanceStatus,
                totalGuests: guestsCount,
                dishes: selectedDishes,
                alcohol: selectedAlcohol,
                wishes: wishes,
                allergies: allergies
            };

            // Сохраняем в localStorage
            const total = saveGuestToLocalStorage(guestData);

            // Показываем успешное сообщение
            showMessage(`✨ Спасибо, ${name}! Ваш ответ сохранён. Всего ответов: ${total} ✨`, 'success');

            // Очищаем форму
            form.reset();
            if (guestsGroup) guestsGroup.style.display = 'none';
            if (dishesGroup) dishesGroup.style.display = 'none';
            if (alcoholGroup) alcoholGroup.style.display = 'none';
            if (wishesGroup) wishesGroup.style.display = 'none';
            if (allergiesGroup) allergiesGroup.style.display = 'none';
            if (attendanceSelect) attendanceSelect.value = '';

            // Выводим в консоль для администратора
            console.log('Новый ответ от гостя:', guestData);
            console.log('Все ответы в localStorage:', localStorage.getItem('wedding_responses'));
        });
    }

    // Инициализация: скрываем поля, если статус не выбран
    toggleFormFields();

    console.log('Форма инициализирована. ready!');
});