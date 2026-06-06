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

// Управление полями
const attendanceSelect = document.getElementById('attendanceStatus');
const companionGroup = document.getElementById('companionGroup');
const guestsCountGroup = document.getElementById('guestsCountGroup');
const companionTypeSelect = document.getElementById('companionType');
const guestsCountInput = document.getElementById('guestsCount');

function toggleCompanionFields() {
    const status = attendanceSelect.value;
    if (status === 'exactly' || status === 'probably') {
        companionGroup.style.display = 'block';
        updateGuestsCountVisibility();
    } else {
        companionGroup.style.display = 'none';
        guestsCountGroup.style.display = 'none';
    }
}

function updateGuestsCountVisibility() {
    const companionVal = companionTypeSelect.value;
    if (companionVal === 'alone') {
        guestsCountGroup.style.display = 'none';
        guestsCountInput.value = 1;
    } else if (companionVal === 'couple') {
        guestsCountGroup.style.display = 'block';
        guestsCountInput.value = 2;
    } else if (companionVal === 'family') {
        guestsCountGroup.style.display = 'block';
        if (parseInt(guestsCountInput.value) < 2) guestsCountInput.value = 2;
    }
}

if (attendanceSelect) {
    attendanceSelect.addEventListener('change', toggleCompanionFields);
}
if (companionTypeSelect) {
    companionTypeSelect.addEventListener('change', updateGuestsCountVisibility);
}

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

function getSelectedValues(name) {
    const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

let isSubmitting = false;

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

    let companionType = null;
    let guestsCount = 1;
    let selectedDishes = [];
    let selectedAlcohol = [];
    let specialWishes = '';

    if (attendanceStatus !== 'no') {
        companionType = companionTypeSelect.value;
        guestsCount = parseInt(guestsCountInput.value) || 1;
        if (guestsCount < 1) guestsCount = 1;

        selectedDishes = getSelectedValues('dishes');
        selectedAlcohol = getSelectedValues('alcohol');
        specialWishes = document.getElementById('specialWishes').value.trim();

        if (selectedDishes.length === 0) {
            showMessage('Пожалуйста, выберите хотя бы одно предпочтение по блюдам', 'error');
            return;
        }
        if (selectedAlcohol.length === 0) {
            showMessage('Пожалуйста, выберите вариант с алкоголем', 'error');
            return;
        }
    } else {
        companionType = 'absent';
        guestsCount = 0;
        selectedDishes = [];
        selectedAlcohol = [];
        specialWishes = document.getElementById('specialWishes').value.trim() || 'Не сможет присутствовать';
    }

    const guestData = {
        timestamp: new Date().toISOString(),
        fullName: name,
        attendance: attendanceStatus,
        companionType: companionType,
        totalGuests: guestsCount,
        dishes: selectedDishes,
        alcohol: selectedAlcohol,
        specialWishes: specialWishes
    };

    isSubmitting = true;
    const submitBtn = document.getElementById('submitBtn');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Отправка...';
    submitBtn.disabled = true;
    submitBtn.classList.add('disabled');

    showMessage('📨 Отправка данных на сервер...', 'loading-message');

    try {
        const response = await fetch('/save-guest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(guestData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showMessage(`✨ Спасибо, ${name}! Ваш ответ успешно сохранён. Мы учтём все пожелания! ✨`, 'success');
            setTimeout(() => {
                document.getElementById('weddingForm').reset();
                companionGroup.style.display = 'none';
                guestsCountGroup.style.display = 'none';
                if (attendanceSelect) attendanceSelect.value = '';
            }, 1500);
        } else {
            throw new Error(result.error || 'Ошибка при сохранении на сервере');
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showMessage(`❌ Ошибка: ${error.message}. Попробуйте позже.`, 'error');
    } finally {
        isSubmitting = false;
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
    }
});

toggleCompanionFields();