<?php
// save-guest.php - бэкенд для сохранения ответов гостей

// Получаем данные из запроса
$input = file_get_contents('php://input');
$guestData = json_decode($input, true);

// Проверяем обязательные поля
if (!$guestData || empty($guestData['fullName']) || empty($guestData['attendance'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Имя и статус присутствия обязательны']);
    exit;
}

// Папка для хранения данных (создаётся автоматически)
$guestsDir = __DIR__ . '/гости';
if (!file_exists($guestsDir)) {
    mkdir($guestsDir, 0755, true);
}

$guestsFile = $guestsDir . '/guests.json';

// Безопасное чтение существующих данных
$guests = [];
if (file_exists($guestsFile)) {
    $content = file_get_contents($guestsFile);
    if ($content !== false && !empty($content)) {
        $guests = json_decode($content, true);
        if (!is_array($guests)) {
            $guests = [];
        }
    }
}

// Добавляем нового гостя
$guestData['timestamp'] = date('Y-m-d H:i:s');
$guests[] = $guestData;

// Сохраняем с блокировкой файла (защита от одновременной записи)
$fp = fopen($guestsFile, 'w');
if (flock($fp, LOCK_EX)) {
    fwrite($fp, json_encode($guests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    flock($fp, LOCK_UN);
    fclose($fp);

    echo json_encode(['success' => true, 'message' => 'Спасибо! Ваш ответ сохранён']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка при сохранении']);
}

exit;