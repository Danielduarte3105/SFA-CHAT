const socket = io();
let name;
let textarea = document.querySelector('#textarea');
let messageArea = document.querySelector('.message__area');

// Função para carregar usuários do JSON
async function loadUsers() {
    try {
        const response = await fetch('users.json');
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        return [];
    }
}

// Função para verificar se o usuário está registrado
async function checkUser(username) {
    const users = await loadUsers();
    return users.some(user => user.username === username);
}

// Função principal para obter o nome de usuário
async function getUserName() {
    let username;
    while (true) {
        username = prompt('Por favor, digite seu nome de usuário: ');
        if (username && await checkUser(username)) {
            name = username;
            break;
        } else {
            window.location.href = 'user.html';
        }
    }
}

getUserName().then(() => {
    textarea.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            sendMessage(e.target.value);
        }
    });

    function sendMessage(message) {
        let msg = {
            user: name,
            message: message.trim()
        };
        // Append 
        appendMessage(msg, 'outgoing');
        textarea.value = '';
        scrollToBottom();

        // Send to server 
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

    // Receive messages 
    socket.on('message', (msg) => {
        appendMessage(msg, 'incoming');
        scrollToBottom();
    });

    function scrollToBottom() {
        messageArea.scrollTop = messageArea.scrollHeight;
    }
});
