<?php
// ===== save.php =====
// Сохраняет данные из формы в results.json (в корневой папке)

// Разрешаем запросы с любых устройств
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Если это предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$jsonFile = __DIR__ . '/results.json';

// Получаем данные из POST-запроса
$rawData = file_get_contents('php://input');
$newGuest = json_decode($rawData, true);

// Проверяем, что данные получены
if (!$newGuest || !isset($newGuest['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Неверные данные']);
    exit;
}

// Добавляем дату получения на сервере
$newGuest['server_timestamp'] = date('Y-m-d H:i:s');

// Читаем существующие данные
$existingData = [];
if (file_exists($jsonFile)) {
    $content = file_get_contents($jsonFile);
    if (!empty($content)) {
        $existingData = json_decode($content, true) ?? [];
    }
}

// Добавляем нового гостя
$existingData[] = $newGuest;

// Сохраняем обратно в файл (с красивым форматированием)
file_put_contents($jsonFile, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// Возвращаем успешный ответ
echo json_encode([
    'success' => true,
    'message' => 'Данные сохранены',
    'total' => count($existingData)
]);
?>