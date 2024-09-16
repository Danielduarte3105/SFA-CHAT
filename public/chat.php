<?php
$dataFile = 'data/messages.json';

// Função para ler mensagens do JSON
function readMessages() {
    global $dataFile;
    if (file_exists($dataFile)) {
        $json = file_get_contents($dataFile);
        return json_decode($json, true);
    }
    return [];
}

// Função para salvar mensagens no JSON
function saveMessage($message) {
    global $dataFile;
    $messages = readMessages();
    $messages[] = $message;
    file_put_contents($dataFile, json_encode($messages));
}

// Manipulação de requisições POST para salvar mensagens
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $message = $_POST['message'];
    saveMessage($message);
    echo json_encode(['status' => 'success']);
    exit;
}

// Manipulação de requisições GET para recuperar mensagens
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $messages = readMessages();
    echo json_encode($messages);
    exit;
}
?>
