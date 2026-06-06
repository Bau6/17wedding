// Плавный скролл к форме
window.scrollToRSVP = function() {
    const rsvpSection = document.getElementById('rsvp');
    if (rsvpSection) {
        rsvpSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Открыть карту
window.openMap = function() {
    window.open('https://yandex.ru/maps/?text=Санкт-Петербург, Колпино, Балканская дорога, 10к2с1', '_blank');
};

// Функция для скачивания JSON
window.downloadGuestData = function() {
    const data = localStorage.getItem('wedding_guests_data');
    if (!data) {
        alert('Нет сохранённых данных');
        return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guests_${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Функция для показа ответов
window.showGuestResponses = function() {
    const data = localStorage.getItem('wedding_guests_data');
    if (!data) {
        alert('Пока нет ни одного ответа');
        return;
    }
    try {
        const guests = JSON.parse(data);
        if (!guests.length) {
            alert('Список гостей пуст');
            return;
        }
        let message = `📊 Всего ответов: ${guests.length}\n\n`;
        guests.forEach((guest, i) => {
            let statusText = '';
            if (guest.attendance === 'exactly') statusText = '✅ Точно придёт';
            else if (guest.attendance === 'probably') statusText = '🤔 Возможно придёт';
            else statusText = '❌ Не придёт';

            message += `${i + 1}. ${guest.name} - ${statusText}\n`;
            if (guest.guestsCount && guest.guestsCount > 1) {
                message += `   👥 Всего человек: ${guest.guestsCount}\n`;
            }
        });
        message += `\n💾 Данные сохранены в браузере`;
        message += `\n📥 Скачать JSON: в консоли введите downloadGuestData()`;
        alert(message);
        console.log('Все ответы:', guests);
    } catch(e) {
        alert('Ошибка чтения данных');
    }
};

// Ждём полной загрузки страницы
document.addEventListener('DOMContentLoaded', function() {

    // === ПОЛУЧАЕМ ВСЕ ЭЛЕМЕНТЫ С ПРОВЕРКАМИ ===
    const form = document.getElementById('weddingForm');
    if (!form) {
        console.error('Форма не найдена!');
        return;
    }

    // Поля ввода (основные)
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const attendanceSelect = document.getElementById('attendanceStatus');
    const guestsCountInput = document.getElementById('guestsCount');
    const wishesTextarea = document.getElementById('wishes');
    const allergiesTextarea = document.getElementById('allergies');
    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('formMessage');

    // Группы полей для показа/скрытия
    const guestsGroup = document.getElementById('guestsGroup');
    const dishesGroup = document.getElementById('dishesGroup');
    const alcoholGroup = document.getElementById('alcoholGroup');
    const wishesGroup = document.getElementById('wishesGroup');
    const allergiesGroup = document.getElementById('allergiesGroup');

    // Функция показа сообщения
    function showMessage(text, type) {
        if (!messageDiv) return;
        messageDiv.textContent = text;
        messageDiv.className = `form-message ${type}`;
        setTimeout(() => {
            if (messageDiv) {
                messageDiv.textContent = '';
                messageDiv.className = 'form-message';
            }
        }, 4000);
    }

    // Функция получения выбранных чекбоксов
    function getCheckedValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        if (!checkboxes.length) return [];
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // Функция показа/скрытия полей
    function toggleConditionalFields() {
        if (!attendanceSelect) return;
        const status = attendanceSelect.value;
        const show = (status === 'exactly' || status === 'probably');

        if (guestsGroup) guestsGroup.style.display = show ? 'block' : 'none';
        if (dishesGroup) dishesGroup.style.display = show ? 'block' : 'none';
        if (alcoholGroup) alcoholGroup.style.display = show ? 'block' : 'none';
        if (wishesGroup) wishesGroup.style.display = show ? 'block' : 'none';
        if (allergiesGroup) allergiesGroup.style.display = show ? 'block' : 'none';
    }

    // Функция сохранения в localStorage
    function saveToLocalStorage(guestData) {
        let existing = localStorage.getItem('wedding_guests_data');
        let guests = [];

        if (existing) {
            try {
                guests = JSON.parse(existing);
                if (!Array.isArray(guests)) guests = [];
            } catch(e) {
                guests = [];
            }
        }

        guests.push(guestData);
        localStorage.setItem('wedding_guests_data', JSON.stringify(guests, null, 2));
        return guests.length;
    }

    // Вешаем обработчик на изменение статуса присутствия
    if (attendanceSelect) {
        attendanceSelect.addEventListener('change', toggleConditionalFields);
    }

    // Обработчик отправки формы
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // === 1. ПРОВЕРКА ОБЯЗАТЕЛЬНЫХ ПОЛЕЙ ===
        if (!nameInput || !nameInput.value.trim()) {
            showMessage('❌ Пожалуйста, укажите ваше имя', 'error');
            return;
        }

        if (!attendanceSelect || !attendanceSelect.value) {
            showMessage('❌ Пожалуйста, укажите, сможете ли вы присутствовать', 'error');
            return;
        }

        const name = nameInput.value.trim();
        const attendance = attendanceSelect.value;

        // === 2. БАЗОВЫЕ ДАННЫЕ (всегда) ===
        const guest = {
            id: Date.now(),
            timestamp: new Date().toLocaleString('ru-RU'),
            name: name,
            email: emailInput ? emailInput.value.trim() : '',
            phone: phoneInput ? phoneInput.value.trim() : '',
            attendance: attendance
        };

        // === 3. ЕСЛИ ГОСТЬ ПРИХОДИТ (exactly или probably) ===
        if (attendance === 'exactly' || attendance === 'probably') {

            // Количество гостей
            let guestsCount = 1;
            if (guestsCountInput) {
                const val = parseInt(guestsCountInput.value);
                if (!isNaN(val) && val >= 1) {
                    guestsCount = val;
                }
            }
            guest.guestsCount = guestsCount;

            // Выбранные блюда
            const dishes = getCheckedValues('dishes');
            if (!dishes.length) {
                showMessage('❌ Пожалуйста, выберите хотя бы одно блюдо', 'error');
                return;
            }
            guest.dishes = dishes;

            // Выбранный алкоголь
            const alcohol = getCheckedValues('alcohol');
            if (!alcohol.length) {
                showMessage('❌ Пожалуйста, выберите вариант с алкоголем', 'error');
                return;
            }
            guest.alcohol = alcohol;

            // Пожелания (необязательно)
            if (wishesTextarea) {
                const wishes = wishesTextarea.value.trim();
                if (wishes) guest.wishes = wishes;
            }

            // Аллергии (необязательно)
            if (allergiesTextarea) {
                const allergies = allergiesTextarea.value.trim();
                if (allergies) guest.allergies = allergies;
            }
        }

        // === 4. ЕСЛИ ГОСТЬ НЕ ПРИХОДИТ ===
        if (attendance === 'no') {
            guest.guestsCount = 0;
            guest.dishes = [];
            guest.alcohol = [];
            if (wishesTextarea && wishesTextarea.value.trim()) {
                guest.wishes = wishesTextarea.value.trim();
            }
        }

        // === 5. СОХРАНЯЕМ ===
        const totalCount = saveToLocalStorage(guest);

        // === 6. ПОКАЗЫВАЕМ УСПЕХ ===
        let successMessage = `✨ Спасибо, ${name}! `;
        if (attendance === 'exactly') {
            successMessage += `Ждём вас с нетерпением! `;
        } else if (attendance === 'probably') {
            successMessage += `Надеемся, что у вас всё получится! `;
        } else {
            successMessage += `Жаль, что не сможете прийти. `;
        }
        successMessage += `Всего ответов: ${totalCount} ✨`;
        showMessage(successMessage, 'success');

        // === 7. ОЧИЩАЕМ ФОРМУ ===
        form.reset();

        // Скрываем условные поля
        if (guestsGroup) guestsGroup.style.display = 'none';
        if (dishesGroup) dishesGroup.style.display = 'none';
        if (alcoholGroup) alcoholGroup.style.display = 'none';
        if (wishesGroup) wishesGroup.style.display = 'none';
        if (allergiesGroup) allergiesGroup.style.display = 'none';

        // Сбрасываем select на пустое значение
        if (attendanceSelect) attendanceSelect.value = '';

        // Лог в консоль для администратора
        console.log('✅ Новый ответ сохранён:', guest);
        console.log('📊 Всего ответов:', totalCount);
    });

    // Начальное состояние полей
    toggleConditionalFields();

    console.log('🎉 Форма готова к работе!');
});