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

// ВСЕ КОД ОБЕРНУТ В DOMContentLoaded, ЧТОБЫ HTML ТОЧНО ЗАГРУЗИЛСЯ
document.addEventListener('DOMContentLoaded', function() {

    // DOM элементы
    const attendanceSelect = document.getElementById('attendanceStatus');
    const companionGroup = document.getElementById('companionGroup');
    const guestsCountGroup = document.getElementById('guestsCountGroup');
    const companionNamesGroup = document.getElementById('companionNamesGroup');
    const accommodationGroup = document.getElementById('accommodationGroup');
    const companionTypeSelect = document.getElementById('companionType');
    const guestsCountInput = document.getElementById('guestsCount');
    const weddingForm = document.getElementById('weddingForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');

    // Проверка существования элементов (для отладки)
    if (!attendanceSelect) {
        console.error('Ошибка: элемент attendanceSelect не найден! Проверьте id="attendanceStatus" в HTML');
        return;
    }

    // Управление видимостью полей
    function toggleCompanionFields() {
        const status = attendanceSelect.value;
        if (status === 'exactly' || status === 'probably') {
            if (companionGroup) companionGroup.style.display = 'block';
            if (accommodationGroup) accommodationGroup.style.display = 'block';
            updateGuestsCountVisibility();
        } else {
            if (companionGroup) companionGroup.style.display = 'none';
            if (guestsCountGroup) guestsCountGroup.style.display = 'none';
            if (companionNamesGroup) companionNamesGroup.style.display = 'none';
            if (accommodationGroup) accommodationGroup.style.display = 'none';
        }
    }

    function updateGuestsCountVisibility() {
        if (!companionTypeSelect || !guestsCountInput) return;
        const companionVal = companionTypeSelect.value;
        if (companionVal === 'alone') {
            if (guestsCountGroup) guestsCountGroup.style.display = 'none';
            if (companionNamesGroup) companionNamesGroup.style.display = 'none';
            guestsCountInput.value = 1;
        } else {
            if (guestsCountGroup) guestsCountGroup.style.display = 'block';
            if (companionNamesGroup) companionNamesGroup.style.display = 'block';
            if (companionVal === 'couple') {
                guestsCountInput.value = 2;
            } else if (companionVal === 'family' || companionVal === 'friends') {
                if (parseInt(guestsCountInput.value) < 2) guestsCountInput.value = 2;
            }
        }
    }

    // Слушатели
    if (attendanceSelect) {
        attendanceSelect.addEventListener('change', toggleCompanionFields);
    }
    if (companionTypeSelect) {
        companionTypeSelect.addEventListener('change', updateGuestsCountVisibility);
    }

    function showMessage(msg, type) {
        if (!formMessage) return;
        formMessage.textContent = msg;
        formMessage.className = `form-message ${type}`;
        setTimeout(() => {
            if (formMessage) {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }
        }, 5000);
    }

    function getSelectedValues(name) {
        const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from(checkboxes).map(cb => cb.value);
    }

    function getSelectedRadioValue(name) {
        const radio = document.querySelector(`input[name="${name}"]:checked`);
        return radio ? radio.value : null;
    }

    let isSubmitting = false;

    // Отправка формы
    if (weddingForm) {
        weddingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (isSubmitting) {
                showMessage('⏳ Подождите, предыдущий ответ уже отправляется...', 'error');
                return;
            }

            const nameInput = document.getElementById('name');
            const attendanceSelectEl = document.getElementById('attendanceStatus');

            if (!nameInput || !attendanceSelectEl) {
                showMessage('Ошибка: не найдены поля формы', 'error');
                return;
            }

            const name = nameInput.value.trim();
            const attendanceStatus = attendanceSelectEl.value;

            if (!name || !attendanceStatus) {
                showMessage('Пожалуйста, укажите имя и статус присутствия', 'error');
                return;
            }

            // Базовые поля
            const email = document.getElementById('email')?.value.trim() || '';
            const phone = document.getElementById('phone')?.value.trim() || '';

            let companionType = null;
            let guestsCount = 1;
            let companionNames = '';
            let accommodation = 'no';

            if (attendanceStatus !== 'no') {
                companionType = companionTypeSelect ? companionTypeSelect.value : 'alone';
                guestsCount = guestsCountInput ? (parseInt(guestsCountInput.value) || 1) : 1;
                if (guestsCount < 1) guestsCount = 1;
                companionNames = document.getElementById('companionNames')?.value.trim() || '';
                accommodation = document.getElementById('accommodation')?.value || 'no';
            }

            const selectedDishes = getSelectedValues('dishes');
            const selectedAlcohol = getSelectedValues('alcohol');
            const musicPreference = document.getElementById('musicPreference')?.value || '';
            const favoriteSongs = document.getElementById('favoriteSongs')?.value.trim() || '';
            const allergies = document.getElementById('allergies')?.value.trim() || '';
            const wishes = document.getElementById('wishes')?.value.trim() || '';
            const referral = document.getElementById('referral')?.value || '';
            const photoshoot = getSelectedRadioValue('photoshoot');
            const toast = getSelectedRadioValue('toast');

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

            isSubmitting = true;
            const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Отправить';
            if (submitBtn) {
                submitBtn.innerHTML = '⏳ Отправка...';
                submitBtn.disabled = true;
                submitBtn.classList.add('disabled');
            }

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
                    showMessage(`✨ Спасибо, ${name}! Ваш ответ успешно сохранён! ✨`, 'success');
                    setTimeout(() => {
                        if (weddingForm) weddingForm.reset();
                        if (companionGroup) companionGroup.style.display = 'none';
                        if (guestsCountGroup) guestsCountGroup.style.display = 'none';
                        if (companionNamesGroup) companionNamesGroup.style.display = 'none';
                        if (accommodationGroup) accommodationGroup.style.display = 'none';
                        if (attendanceSelect) attendanceSelect.value = '';
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Ошибка при сохранении');
                }
            } catch (error) {
                console.error('Ошибка:', error);
                showMessage(`❌ Ошибка: ${error.message}. Попробуйте позже.`, 'error');
            } finally {
                isSubmitting = false;
                if (submitBtn) {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('disabled');
                }
            }
        });
    }

    // Инициализация
    toggleCompanionFields();
});