const socket = io();
let username;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
let userList = document.querySelector('.user-list'); // Elemento do menu de usuários

// Simulação de login (substitua com seu sistema real)
username = localStorage.getItem('username'); // Para persistência de sessão
if (!username) {
    username = prompt('Por favor, digite seu nome: ');
    localStorage.setItem('username', username);
}

// Enviar a identificação do usuário ao servidor
socket.emit('login', username);

textarea.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    let msg = {
        user: username,
        message: message.trim()
    };
    appendMessage(msg, 'outgoing');
    textarea.value = '';
    scrollToBottom();

    // Envia mensagem ao servidor (pública)
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div');
    let className = type;
    mainDiv.classList.add(className, 'message');

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `;
    mainDiv.innerHTML = markup;
    messageArea.appendChild(mainDiv);
}

// Receber mensagens públicas do servidor
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    scrollToBottom();
});

// Atualizar a lista de usuários conectados
socket.on('userList', (users) => {
    userList.innerHTML = ''; // Limpar a lista
    users.forEach(user => {
        let userItem = document.createElement('li');
        userItem.innerText = user.username;
        userItem.addEventListener('click', () => openPrivateChat(user)); // Para mensagens privadas
        userList.appendChild(userItem);
    });
});

// Função para abrir chat privado com um usuário
function openPrivateChat(user) {
    let privateMessage = prompt(`Digite sua mensagem para ${user.username}:`);
    if (privateMessage) {
        let msg = {
            user: username,
            message: privateMessage.trim(),
            to: user.id // Enviar diretamente para o ID do usuário selecionado
        };
        appendMessage(msg, 'outgoing'); // Exibe no chat
        socket.emit('privateMessage', msg); // Envia para o servidor
    }
}

// Receber mensagens privadas
socket.on('privateMessage', (msg) => {
    appendMessage(msg, 'incoming'); // Exibe mensagem privada recebida
});

// Scroll automático para o final da área de mensagens
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}
