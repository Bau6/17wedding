<?php
// save-guest.php - бэкенд для сохранения ответов гостей
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Получаем данные из запроса
$input = file_get_contents('php://input');
$guestData = json_decode($input, true);

// Проверяем обязательные поля
if (!$guestData || empty($guestData['fullName']) || empty($guestData['attendance'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Имя и статус присутствия обязательны']);
    exit;
}

// Папка для хранения данных
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

// Добавляем timestamp в понятном формате
$guestData['timestamp_readable'] = date('Y-m-d H:i:s');
$guestData['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? 'unknown';

// Добавляем в массив
$guests[] = $guestData;

// Сохраняем с блокировкой файла (защита от одновременной записи)
$fp = fopen($guestsFile, 'w');
if (flock($fp, LOCK_EX)) {
    fwrite($fp, json_encode($guests, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    flock($fp, LOCK_UN);
    fclose($fp);

    // Создаём отдельный файл с последним ответом для удобства
    $lastFile = $guestsDir . '/last_response.json';
    file_put_contents($lastFile, json_encode($guestData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(['success' => true, 'message' => 'Спасибо! Ваш ответ сохранён']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Ошибка при сохранении данных']);
}

exit;
?>