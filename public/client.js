document.addEventListener('DOMContentLoaded', () => {
    const textarea = document.querySelector('#textarea');
    const messageArea = document.querySelector('.message__area');
    let name;
    
    do {
        name = prompt('Por favor, digite seu nome: ');
    } while(!name);

    textarea.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') {
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
        fetch('chat.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ 'message': JSON.stringify(msg) })
        });
    }

    function appendMessage(msg, type) {
        let mainDiv = document.createElement('div');
        mainDiv.classList.add(type, 'message');

        let markup = `
            <h4>${msg.user}</h4>
            <p>${msg.message}</p>
        `;
        mainDiv.innerHTML = markup;
        messageArea.appendChild(mainDiv);
    }

    function loadMessages() {
        fetch('chat.php')
            .then(response => response.json())
            .then(messages => {
                messageArea.innerHTML = '';
                messages.forEach(msg => {
                    appendMessage(msg, 'incoming');
                });
                scrollToBottom();
            });
    }

    function scrollToBottom() {
        messageArea.scrollTop = messageArea.scrollHeight;
    }

    loadMessages();
});
