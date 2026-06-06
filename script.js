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

// DOM элементы
const attendanceSelect = document.getElementById('attendanceStatus');
const companionGroup = document.getElementById('companionGroup');
const guestsCountGroup = document.getElementById('guestsCountGroup');
const companionNamesGroup = document.getElementById('companionNamesGroup');
const accommodationGroup = document.getElementById('accommodationGroup');
const companionTypeSelect = document.getElementById('companionType');
const guestsCountInput = document.getElementById('guestsCount');

// Управление видимостью полей в зависимости от статуса присутствия
function toggleCompanionFields() {
    const status = attendanceSelect.value;
    if (status === 'exactly' || status === 'probably') {
        companionGroup.style.display = 'block';
        accommodationGroup.style.display = 'block';
        updateGuestsCountVisibility();
    } else {
        companionGroup.style.display = 'none';
        guestsCountGroup.style.display = 'none';
        companionNamesGroup.style.display = 'none';
        accommodationGroup.style.display = 'none';
    }
}

// Управление полями при выборе "один/с компанией"
function updateGuestsCountVisibility() {
    const companionVal = companionTypeSelect.value;
    if (companionVal === 'alone') {
        guestsCountGroup.style.display = 'none';
        companionNamesGroup.style.display = 'none';
        guestsCountInput.value = 1;
    } else {
        guestsCountGroup.style.display = 'block';
        companionNamesGroup.style.display = 'block';
        if (companionVal === 'couple') {
            guestsCountInput.value = 2;
        } else if (companionVal === 'family') {
            if (parseInt(guestsCountInput.value) < 2) guestsCountInput.value = 2;
        } else if (companionVal === 'friends') {
            if (parseInt(guestsCountInput.value) < 2) guestsCountInput.value = 2;
        }
    }
}

// Слушатели событий
if (attendanceSelect) {
    attendanceSelect.addEventListener('change', toggleCompanionFields);
}
if (companionTypeSelect) {
    companionTypeSelect.addEventListener('change', updateGuestsCountVisibility);
}

// Показать сообщение пользователю
function showMessage(msg, type) {
    const messageDiv = document.getElementById('formMessage');
    messageDiv.textContent = msg;
    messageDiv.className = `form-message ${type}`;
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.textContent = '';
            messageDiv.className = 'form-message';
        }
    }, 5000);
}

// Получить выбранные значения чекбоксов
function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Получить выбранное значение радио-кнопки
function getSelectedRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
}

let isSubmitting = false;

// Отправка формы
document.getElementById('weddingForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (isSubmitting) {
        showMessage('⏳ Ваш предыдущий ответ уже отправляется, пожалуйста, подождите...', 'error');
        return;
    }

    const name = document.getElementById('name').value.trim();
    const attendanceStatus = document.getElementById('attendanceStatus').value;

    if (!name || !attendanceStatus) {
        showMessage('Пожалуйста, укажите имя и статус присутствия', 'error');
        return;
    }

    // Базовые поля
    const email = document.getElementById('email').value.trim() || '';
    const phone = document.getElementById('phone').value.trim() || '';

    let companionType = null;
    let guestsCount = 1;
    let companionNames = '';
    let accommodation = 'no';

    // Дополнительные поля для подтвердивших
    if (attendanceStatus !== 'no') {
        companionType = companionTypeSelect.value;
        guestsCount = parseInt(guestsCountInput.value) || 1;
        if (guestsCount < 1) guestsCount = 1;
        companionNames = document.getElementById('companionNames').value.trim() || '';
        accommodation = document.getElementById('accommodation').value;
    }

    // Выборы
    const selectedDishes = getSelectedValues('dishes');
    const selectedAlcohol = getSelectedValues('alcohol');
    const musicPreference = document.getElementById('musicPreference').value || '';
    const favoriteSongs = document.getElementById('favoriteSongs').value.trim() || '';
    const allergies = document.getElementById('allergies').value.trim() || '';
    const wishes = document.getElementById('wishes').value.trim() || '';
    const referral = document.getElementById('referral').value || '';
    const photoshoot = getSelectedRadioValue('photoshoot');
    const toast = getSelectedRadioValue('toast');

    // Валидация для подтвердивших
    if (attendanceStatus !== 'no') {
        if (selectedDishes.length === 0) {
            showMessage('Пожалуйста, выберите хотя бы одно предпочтение по блюдам', 'error');
            return;
        }
        if (selectedAlcohol.length === 0) {
            showMessage('Пожалуйста, выберите вариант с алкоголем', 'error');
            return;
        }
    }

    // Сбор всех данных
    const guestData = {
        timestamp: new Date().toISOString(),
        fullName: name,
        email: email,
        phone: phone,
        attendance: attendanceStatus,
        companionType: companionType,
        totalGuests: guestsCount,
        companionNames: companionNames,
        dishes: selectedDishes,
        alcohol: selectedAlcohol,
        musicPreference: musicPreference,
        favoriteSongs: favoriteSongs,
        accommodation: accommodation,
        allergies: allergies,
        wishes: wishes,
        referral: referral,
        photoshoot: photoshoot,
        toast: toast
    };

    // Отправка
    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Отправка...';
    submitBtn.disabled = true;
    submitBtn.classList.add('disabled');

    showMessage('📨 Отправка данных на сервер...', 'loading-message');

    try {
        const response = await fetch('save-guest.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guestData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage(`✨ Спасибо, ${name}! Ваш ответ успешно сохранён. Мы учтём все пожелания и обязательно ответим! ✨`, 'success');
            setTimeout(() => {
                document.getElementById('weddingForm').reset();
                companionGroup.style.display = 'none';
                guestsCountGroup.style.display = 'none';
                companionNamesGroup.style.display = 'none';
                accommodationGroup.style.display = 'none';
                if (attendanceSelect) attendanceSelect.value = '';
            }, 2000);
        } else {
            throw new Error(result.error || 'Ошибка при сохранении на сервере');
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showMessage(`❌ Ошибка: ${error.message}. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.`, 'error');
    } finally {
        isSubmitting = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
    }
});

// Инициализация
toggleCompanionFields();