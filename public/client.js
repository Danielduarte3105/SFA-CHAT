const socket = io()
let name;
let room; // Variável para armazenar a sala atual
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')
let userList = document.querySelectorAll('.list-friends li');

// Pergunta o nome do usuário ao entrar
do {
    name = prompt('Por favor, digite seu nome: ')
} while(!name)

// Adiciona evento de clique para cada usuário na lista
userList.forEach(user => {
    user.addEventListener('click', () => {
        let selectedUser = user.getAttribute('data-user');
        room = selectedUser; // Define a sala como o nome do usuário clicado

        // Entra na sala correspondente
        socket.emit('joinRoom', room);
        
        // Limpa a área de mensagens
        messageArea.innerHTML = '';
        console.log(`Você entrou na sala de ${room}`);
    });
});

textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') {
        sendMessage(e.target.value)
    }
})

function sendMessage(message) {
    if (room) {
        let msg = {
            user: name,
            message: message.trim(),
            room: room // Adiciona a sala à mensagem
        }

        // Adiciona a mensagem na área de saída como "enviada"
        appendMessage(msg, 'outgoing')
        textarea.value = ''
        scrollToBottom()

        // Envia ao servidor
        socket.emit('message', msg)
    } else {
        alert('Por favor, selecione um usuário para conversar.');
    }
}

// Recebe a mensagem e mostra apenas a versão "incoming" (recebida)
socket.on('message', (msg) => {
    // Só exibe a mensagem recebida se for de outro usuário
    if (msg.user !== name && msg.room === room) {
        appendMessage(msg, 'incoming');
    }
    scrollToBottom();
})

function appendMessage(msg, type) {
    let mainDiv = document.createElement('div')
    let className = type
    mainDiv.classList.add(className, 'message')

    let markup = `
        <h4>${msg.user}</h4>
        <p>${msg.message}</p>
    `
    mainDiv.innerHTML = markup
    messageArea.appendChild(mainDiv)
}

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
