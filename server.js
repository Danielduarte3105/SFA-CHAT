const express = require('express');
const fs = require('fs'); // Para manipular arquivos
const app = express();
const http = require('http').createServer(app);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Socket
const io = require('socket.io')(http);

// Carrega o histórico de mensagens de um arquivo JSON
function loadMessageHistory(room) {
    try {
        const data = fs.readFileSync(`./history_${room}.json`, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return []; // Se o arquivo não existir, retorna um array vazio
    }
}

// Salva o histórico de mensagens em um arquivo JSON
function saveMessageHistory(room, messages) {
    fs.writeFileSync(`./history_${room}.json`, JSON.stringify(messages, null, 2));
}

// Função para limpar o histórico de mensagens de uma sala
function clearMessageHistory(room) {
    fs.writeFileSync(`./history_${room}.json`, JSON.stringify([], null, 2)); // Sobrescreve com um array vazio
    console.log(`O histórico da sala ${room} foi limpo.`);
}

io.on('connection', (socket) => {
    console.log('Connected...');

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);

        // Carrega o histórico da sala e envia ao usuário
        const history = loadMessageHistory(room);
        socket.emit('history', history);
    });

    socket.on('message', (msg) => {
        const room = msg.room;

        // Carrega o histórico de mensagens, adiciona a nova mensagem, e salva
        const history = loadMessageHistory(room);
        history.push(msg);
        saveMessageHistory(room, history);

        // Envia a mensagem para todos na sala
        io.to(room).emit('message', msg);
    });

    // Limpa o histórico de uma sala quando solicitado
    socket.on('clearHistory', (room) => {
        clearMessageHistory(room);
        io.to(room).emit('historyCleared'); // Informa os clientes que o histórico foi limpo
    });
});
