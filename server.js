const express = require('express');
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

// Socket.IO 
const io = require('socket.io')(http);

// Armazena os usuários conectados
let users = [];

io.on('connection', (socket) => {
    console.log('Novo usuário conectado...');

    // Quando um usuário faz login
    socket.on('login', (username) => {
        const user = { id: socket.id, username };
        users.push(user); // Adiciona o usuário à lista

        // Envia a lista atualizada de usuários para todos
        io.emit('userList', users);
    });

    // Quando um usuário envia uma mensagem pública
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg); // Envia para todos, exceto o remetente
    });

    // Quando um usuário envia uma mensagem privada
    socket.on('privateMessage', (msg) => {
        const recipientSocket = io.sockets.sockets.get(msg.to); // Encontra o socket de destino
        if (recipientSocket) {
            recipientSocket.emit('privateMessage', msg); // Envia a mensagem privada ao destinatário
        }
    });

    // Quando um usuário desconecta
    socket.on('disconnect', () => {
        users = users.filter(user => user.id !== socket.id); // Remove o usuário da lista
        io.emit('userList', users); // Atualiza a lista de usuários conectados
        console.log('Usuário desconectado...');
    });
});
