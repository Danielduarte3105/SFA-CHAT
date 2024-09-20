const express = require('express');
const fs = require('fs');
const multer = require('multer'); // Adiciona multer para upload de arquivos
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

// Configura o armazenamento para o multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Define a pasta para salvar os arquivos
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nomeia o arquivo com a data atual para evitar duplicatas
    }
});

const upload = multer({ storage: storage }); // Inicia o multer com a configuração de armazenamento

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

// Rota para upload de arquivos
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        // Quando o arquivo é recebido com sucesso, envia uma resposta
        res.json({ fileName: req.file.filename, filePath: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).send('Erro ao enviar o arquivo');
    }
});

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
});
