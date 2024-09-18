const socket = io();
let name;
let room = null; // Inicializa a variável room como null
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');
let userList = document.querySelectorAll('.list-friends li');

// Pergunta o nome do usuário ao entrar
do {
    name = prompt('Por favor, digite seu nome: ')
} while(!name);

// Adiciona evento de clique para cada usuário na lista
userList.forEach(user => {
    user.addEventListener('click', () => {
        let selectedUser = user.getAttribute('data-user');
        if (selectedUser) {
            room = selectedUser; // Define a sala como o nome do usuário clicado
            socket.emit('joinRoom', room); // Envia o nome da sala para o servidor
            messageArea.innerHTML = ''; // Limpa a área de mensagens
            console.log(`Você entrou na sala de ${room}`);
        } else {
            console.error('Usuário ou sala não encontrado.');
        }
    });
});

textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    if (room) {
        let msg = {
            user: name,
            message: message.trim(),
            room: room
        };

        // Adiciona a mensagem na área de saída como "enviada"
        appendMessage(msg, 'outgoing');
        textarea.value = '';
        scrollToBottom();

        // Envia ao servidor
        socket.emit('message', msg);
    } else {
        alert('Por favor, selecione um usuário para conversar.');
    }
}

// Recebe a mensagem e mostra apenas a versão "incoming" (recebida)
socket.on('message', (msg) => {
    if (msg.user !== name && msg.room === room) {
        appendMessage(msg, 'incoming');
    }
    scrollToBottom();
});

// Carrega o histórico de mensagens ao entrar na sala
socket.on('history', (messages) => {
    messages.forEach(msg => {
        const messageType = msg.user === name ? 'outgoing' : 'incoming';
        appendMessage(msg, messageType);
    });
    scrollToBottom();
});

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

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

document.getElementById('clearHistoryBtn').addEventListener('click', () => {
    if (room) {
        socket.emit('clearHistory', room); // Solicita ao servidor para limpar o histórico da sala atual
    } else {
        alert('Por favor, selecione uma sala antes de limpar o histórico.');
    }
});

// Recebe a notificação de que o histórico foi limpo
socket.on('historyCleared', () => {
    messageArea.innerHTML = ''; // Limpa a área de mensagens na interface
    alert('O histórico foi limpo.');
});

