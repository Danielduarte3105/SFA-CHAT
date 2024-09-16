const express = require('express');
const app = express();
const http = require('http').createServer(app);
const fs = require('fs');
const path = require('path');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3000;
const messagesFilePath = path.join(__dirname, 'messages.json');

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const io = socketIo(http);

io.on('connection', (socket) => {
    console.log('Connected...');

    // Load previous messages
    fs.readFile(messagesFilePath, (err, data) => {
        if (err) {
            console.error('Error reading messages file:', err);
            return;
        }
        const messages = JSON.parse(data || '[]');
        socket.emit('previousMessages', messages);
    });

    // Handle incoming messages
    socket.on('message', (msg) => {
        // Save message to file
        fs.readFile(messagesFilePath, (err, data) => {
            if (err) {
                console.error('Error reading messages file:', err);
                return;
            }
            const messages = JSON.parse(data || '[]');
            messages.push(msg);
            fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), (err) => {
                if (err) {
                    console.error('Error writing messages file:', err);
                }
            });
        });

        io.emit('message', msg);
    });
});
