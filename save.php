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
$data = json_decode($rawData, true);

// Проверяем, что данные получены
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Неверный формат данных']);
    exit;
}

// Определяем, что пришло: один гость или массив гостей
$isArray = array_keys($data) === range(0, count($data) - 1);

// Читаем существующие данные
$existingData = [];
if (file_exists($jsonFile)) {
    $content = file_get_contents($jsonFile);
    if (!empty($content)) {
        $existingData = json_decode($content, true) ?? [];
    }
}

if ($isArray) {
    // Если пришёл массив — сохраняем его целиком (используется админкой)
    $existingData = $data;
} else {
    // Если пришёл один гость — добавляем его в массив (используется формой)
    // Проверяем обязательное поле
    if (!isset($data['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Отсутствует имя гостя']);
        exit;
    }

    // Добавляем дату получения на сервере
    $data['server_timestamp'] = date('Y-m-d H:i:s');

    // Добавляем нового гостя
    $existingData[] = $data;
}

// Сохраняем обратно в файл (с красивым форматированием)
$result = file_put_contents($jsonFile, json_encode($existingData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

if ($result === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Не удалось сохранить файл']);
    exit;
}

// Возвращаем успешный ответ
echo json_encode([
    'success' => true,
    'message' => 'Данные сохранены',
    'total' => count($existingData)
]);