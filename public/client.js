const socket = io()
let name;
let room; // A sala que o usuário irá se conectar
let textarea = document.querySelector('#textarea')
let messageArea = document.querySelector('.message__area')

// Pergunta o nome do usuário e cria uma sala baseada no nome
do {
    name = prompt('Por favor, digite seu nome: ')
} while(!name)

room = name; // Usa o nome como identificador de sala
socket.emit('joinRoom', room); // Solicita ao servidor para adicionar o usuário à sala

textarea.addEventListener('keyup', (e) => {
    if(e.key === 'Enter') {
        sendMessage(e.target.value)
    }
})

function sendMessage(message) {
    let msg = {
        user: name,
        message: message.trim(),
        room: room // Adiciona a sala à mensagem
    }
    // Adiciona a mensagem na área de saída
    appendMessage(msg, 'outgoing')
    textarea.value = ''
    scrollToBottom()

    // Envia ao servidor
    socket.emit('message', msg)
}

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

// Recebe as mensagens da sala
socket.on('message', (msg) => {
    appendMessage(msg, 'incoming')
    scrollToBottom()
})

function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight
}
