(function() {
    // Carousel with drag/swipe support
    var track = document.getElementById('carouselTrack');
    var dots = document.querySelectorAll('#carouselDots span');
    var carousel = document.getElementById('carousel');
    var current = 0;
    var total = 3;
    var isDragging = false;
    var startPos = 0;
    var currentTranslate = 0;
    var prevTranslate = 0;
    var animationID = 0;
    var startTime = 0;

    function goTo(index) {
        if (index < 0) index = total - 1;
        if (index >= total) index = 0;
        current = index;
        var translateX = -current * 100;
        track.style.transform = 'translateX(' + translateX + '%)';
        dots.forEach(function(dot, i) {
            dot.classList.toggle('active', i === current);
        });
    }

    // Auto play
    var autoPlayInterval = setInterval(function() {
        goTo(current + 1);
    }, 3000);

    // Stop auto play on user interaction
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(function() {
            goTo(current + 1);
        }, 3000);
    }

    // Touch events for mobile
    carousel.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        startPos = touch.clientX;
        isDragging = true;
        startTime = Date.now();
        track.style.transition = 'none';
    }, { passive: true });

    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        var touch = e.touches[0];
        var diff = touch.clientX - startPos;
        var percent = (diff / carousel.offsetWidth) * 100;
        var currentPercent = -current * 100;
        track.style.transform = 'translateX(' + (currentPercent + percent) + '%)';
    }, { passive: true });

    carousel.addEventListener('touchend', function(e) {
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
    }, { passive: true });

    // Mouse events for desktop
    carousel.addEventListener('mousedown', function(e) {
        isDragging = true;
        startPos = e.clientX;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
        e.preventDefault();
    });

    carousel.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var diff = e.clientX - startPos;
        var percent = (diff / carousel.offsetWidth) * 100;
        var currentPercent = -current * 100;
        track.style.transform = 'translateX(' + (currentPercent + percent) + '%)';
    });

    carousel.addEventListener('mouseup', function(e) {
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

    carousel.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            track.style.transition = 'transform 0.5s ease';
            track.style.cursor = 'grab';
            goTo(current);
        }
    });

    // Dot click handlers
    dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() {
            goTo(i);
            stopAutoPlay();
        });
    });

    // Form logic
    var form = document.getElementById('weddingForm');
    var nameInput = document.getElementById('name');
    var attendanceRadios = document.querySelectorAll('input[name="attendance"]');
    var extraFields = document.getElementById('extraFields');
    var messageDiv = document.getElementById('formMessage');

    attendanceRadios.forEach(function(radio) {
        radio.addEventListener('change', function() {
            extraFields.style.display = (this.value === 'exactly') ? 'block' : 'none';
        });
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var name = nameInput.value.trim();
        if (!name) {
            showMessage('Пожалуйста, укажите ваше имя', 'error');
            return;
        }
        var attendance = null;
        for (var i = 0; i < attendanceRadios.length; i++) {
            if (attendanceRadios[i].checked) {
                attendance = attendanceRadios[i].value;
                break;
            }
        }
        if (!attendance) {
            showMessage('Пожалуйста, подтвердите присутствие', 'error');
            return;
        }

        var guest = {
            name: name,
            attendance: attendance,
            allergy: document.getElementById('allergy') ? document.getElementById('allergy').value : '',
            food: document.getElementById('food') ? document.getElementById('food').value : '',
            alcohol: document.querySelector('input[name="alcohol"]:checked') ? document.querySelector('input[name="alcohol"]:checked').value : '',
            photo: document.querySelector('input[name="photo"]:checked') ? document.querySelector('input[name="photo"]:checked').value : '',
            message: document.getElementById('message') ? document.getElementById('message').value : '',
            timestamp: new Date().toISOString()
        };

        var all = JSON.parse(localStorage.getItem('wedding_guests_data') || '[]');
        all.push(guest);
        localStorage.setItem('wedding_guests_data', JSON.stringify(all, null, 2));

        showMessage('Спасибо, ' + name + '! Ваш ответ сохранён.', 'success');
        form.reset();
        extraFields.style.display = 'none';
        setTimeout(function() {
            messageDiv.className = 'form-message';
            messageDiv.style.display = 'none';
        }, 4000);
    });

    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = 'form-message ' + type;
        messageDiv.style.display = 'block';
    }

    // Desktop notice close
    window.addEventListener('resize', function() {
        var notice = document.getElementById('desktopNotice');
        if (window.innerWidth <= 800) {
            notice.style.display = 'none';
        } else {
            notice.style.display = 'flex';
        }
    });
})();