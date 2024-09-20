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

// Upload de Arquivo
document.getElementById('uploadFileBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click(); // Abre o seletor de arquivos
});

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0]; // Captura o arquivo selecionado
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        // Faz o upload do arquivo para o servidor
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.filePath) {
                // Envia a URL do arquivo como uma mensagem para o servidor
                sendMessage(`Arquivo enviado: <a href="${data.filePath}" target="_blank">${data.fileName}</a>`);
            }
        })
        .catch(error => {
            console.error('Erro ao fazer upload do arquivo:', error);
        });
    }
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
