(function () {
    // Carousel with drag/swipe support
    var track = document.getElementById('carouselTrack');
    var dots = document.querySelectorAll('#carouselDots span');
    var carousel = document.getElementById('carousel');
    var current = 0;
    var total = 3;
    var isDragging = false;
    var startPos = 0;
    var startTime = 0;

    function goTo(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        var translateX = -current * 100;
        track.style.transform = 'translateX(' + translateX + '%)';
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    // Auto play
    var autoPlayInterval = setInterval(function () {
        goTo(current + 1);
    }, 8000);

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(function () {
            goTo(current + 1);
        }, 8000);
    }

    // Touch events
    carousel.addEventListener('touchstart', function (e) {
        var touch = e.touches[0];
        startPos = touch.clientX;
        isDragging = true;
        startTime = Date.now();
        track.style.transition = 'none';
    }, {passive: true});

    carousel.addEventListener('touchmove', function (e) {
        if (!isDragging) return;
        var touch = e.touches[0];
        var diff = touch.clientX - startPos;
        var percent = (diff / carousel.offsetWidth) * 100;
        var currentPercent = -current * 100;
        track.style.transform = 'translateX(' + (currentPercent + percent) + '%)';
    }, {passive: true});

    carousel.addEventListener('touchend', function (e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.5s ease';
        var touch = e.changedTouches[0];
        var diff = touch.clientX - startPos;
        var elapsed = Date.now() - startTime;
        var velocity = Math.abs(diff / elapsed);

        if (Math.abs(diff) > 50 || velocity > 0.5) {
            if (diff < 0) {
                goTo(current + 1);
            } else {
                goTo(current - 1);
            }
        } else {
            goTo(current);
        }
        stopAutoPlay();
    }, {passive: true});

    // Mouse events
    carousel.addEventListener('mousedown', function (e) {
        isDragging = true;
        startPos = e.clientX;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
        e.preventDefault();
    });

    carousel.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        var diff = e.clientX - startPos;
        var percent = (diff / carousel.offsetWidth) * 100;
        var currentPercent = -current * 100;
        track.style.transform = 'translateX(' + (currentPercent + percent) + '%)';
    });

    carousel.addEventListener('mouseup', function (e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.5s ease';
        track.style.cursor = 'grab';
        var diff = e.clientX - startPos;
        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                goTo(current + 1);
            } else {
                goTo(current - 1);
            }
        } else {
            goTo(current);
        }
        stopAutoPlay();
    });

    carousel.addEventListener('mouseleave', function () {
        if (isDragging) {
            isDragging = false;
            track.style.transition = 'transform 0.5s ease';
            track.style.cursor = 'grab';
            goTo(current);
        }
    });

    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            goTo(i);
            stopAutoPlay();
        });
    });

    // ===== FORM LOGIC =====
    var form = document.getElementById('weddingForm');
    var nameInput = document.getElementById('name');
    var attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    var extraFields = document.getElementById('extraFields');
    var messageDiv = document.getElementById('formMessage');

    attendanceRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            extraFields.style.display = (this.value === 'exactly') ? 'block' : 'none';
        });
    });

    // Функция для получения выбранных чекбоксов
    function getCheckedValues(name) {
        var checkboxes = document.querySelectorAll('input[name="' + name + '"]:checked');
        var values = [];
        checkboxes.forEach(function (cb) {
            values.push(cb.value);
        });
        return values;
    }

    // ===== ОТПРАВКА ФОРМЫ НА СЕРВЕР =====
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        if (!name) {
            showMessage('Пожалуйста, укажите ваше имя', 'error');
            return;
        }

        let attendance = null;
        for (let i = 0; i < attendanceRadios.length; i++) {
            if (attendanceRadios[i].checked) {
                attendance = attendanceRadios[i].value;
                break;
            }
        }
        if (!attendance) {
            showMessage('Пожалуйста, подтвердите присутствие', 'error');
            return;
        }

        // Собираем данные
        const guestData = {
            id: Date.now(),
            name: name,
            attendance: attendance,
            allergy: document.getElementById('allergy')?.value || '',
            food: document.getElementById('food')?.value || '',
            alcohol: getCheckedValues('alcohol'),
            photo: document.querySelector('input[name="photo"]:checked')?.value || '',
            message: document.getElementById('message')?.value || '',
            timestamp: new Date().toLocaleString('ru-RU')
        };

        try {
            // Отправляем на сервер
            const response = await fetch('save.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(guestData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Спасибо, ' + name + '! Ваш ответ сохранён. ❤️', 'success');
                form.reset();
                extraFields.style.display = 'none';

                // Сбрасываем чекбоксы
                document.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
                    cb.checked = false;
                });

                setTimeout(function () {
                    messageDiv.className = 'form-message';
                    messageDiv.style.display = 'none';
                }, 4000);
            } else {
                showMessage('Ошибка: ' + (result.error || 'неизвестная'), 'error');
            }
        } catch (error) {
            showMessage('Ошибка соединения. Попробуйте позже.', 'error');
            console.error('Error:', error);
        }
    });

// Функция для получения выбранных чекбоксов
    function getCheckedValues(name) {
        var checkboxes = document.querySelectorAll('input[name="' + name + '"]:checked');
        var values = [];
        checkboxes.forEach(function (cb) {
            values.push(cb.value);
        });
        return values;
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'form-message ' + type;
        messageDiv.style.display = 'block';
    }

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'form-message ' + type;
        messageDiv.style.display = 'block';
    }

    // ===== ФУНКЦИЯ ДЛЯ СКАЧИВАНИЯ JSON =====
    window.downloadGuestData = function () {
        var data = localStorage.getItem('wedding_guests_data');
        if (!data) {
            alert('Нет сохранённых данных');
            return;
        }
        try {
            var guests = JSON.parse(data);
            if (!guests.length) {
                alert('Нет данных для скачивания');
                return;
            }
            var blob = new Blob([JSON.stringify(guests, null, 2)], {type: 'application/json'});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'guests_' + new Date().toISOString().slice(0, 10) + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Ошибка при скачивании');
        }
    };

    // ===== ФУНКЦИЯ ДЛЯ ПРОСМОТРА ОТВЕТОВ =====
    window.showGuestResponses = function () {
        var data = localStorage.getItem('wedding_guests_data');
        if (!data) {
            alert('Пока нет ни одного ответа');
            return;
        }
        try {
            var guests = JSON.parse(data);
            if (!guests.length) {
                alert('Список гостей пуст');
                return;
            }
            var message = '📊 Всего ответов: ' + guests.length + '\n\n';
            guests.forEach(function (guest, i) {
                var statusText = '';
                if (guest.attendance === 'exactly') statusText = '✅ Точно придёт';
                else if (guest.attendance === 'probably') statusText = '🤔 Возможно придёт';
                else statusText = '❌ Не придёт';

                message += (i + 1) + '. ' + guest.name + ' - ' + statusText + '\n';
                if (guest.guestsCount && guest.guestsCount > 1) {
                    message += '   👥 Всего человек: ' + guest.guestsCount + '\n';
                }
                if (guest.alcohol && guest.alcohol.length) {
                    message += '   🍷 Алкоголь: ' + guest.alcohol.join(', ') + '\n';
                }
            });
            message += '\n💾 Данные сохранены в браузере';
            message += '\n📥 Скачать JSON: введите в консоли downloadGuestData()';
            alert(message);
            console.log('Все ответы:', guests);
        } catch (e) {
            alert('Ошибка чтения данных');
        }
    };

    // Desktop notice
    window.addEventListener('resize', function () {
        var notice = document.getElementById('desktopNotice');
        if (window.innerWidth <= 800) {
            notice.style.display = 'none';
        } else {
            notice.style.display = 'flex';
        }
    });
})();