const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const GUESTS_DIR = path.join(__dirname, 'гости');
const GUESTS_FILE = path.join(GUESTS_DIR, 'guests.json');

if (!fs.existsSync(GUESTS_DIR)) {
    fs.mkdirSync(GUESTS_DIR, { recursive: true });
}

// Атомарная запись с временным файлом (защита от конфликтов)
function appendGuestData(newGuest, callback) {
    fs.readFile(GUESTS_FILE, 'utf8', (err, data) => {
        let guests = [];
        if (!err && data) {
            try {
                guests = JSON.parse(data);
            } catch(e) {
                guests = [];
            }
        }
        guests.push(newGuest);

        const tempFile = GUESTS_FILE + '.tmp';
        fs.writeFile(tempFile, JSON.stringify(guests, null, 2), 'utf8', (writeErr) => {
            if (writeErr) return callback(writeErr);
            fs.rename(tempFile, GUESTS_FILE, (renameErr) => {
                callback(renameErr);
            });
        });
    });
}

app.post('/save-guest', (req, res) => {
    const guest = req.body;
    if (!guest.fullName || !guest.attendance) {
        return res.status(400).json({ success: false, error: 'Имя и статус обязательны' });
    }

    appendGuestData(guest, (err) => {
        if (err) {
            console.error('Ошибка записи:', err);
            return res.status(500).json({ success: false, error: 'Не удалось сохранить данные' });
        }
        console.log(`✅ Сохранён гость: ${guest.fullName} (${guest.attendance})`);
        res.json({ success: true, message: 'Гость добавлен' });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});