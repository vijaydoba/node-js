document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const startChatButton = document.getElementById('startChat');
    const newChatButton = document.getElementById('newChat');
    const chatBox = document.getElementById('chatBox');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const chatActions = document.querySelector('.chat-actions');
    const chatStart = document.querySelector('.chat-start');
    const joinUsButton = document.getElementById('join-us');
    
    let pairedUser = null;

    startChatButton.addEventListener('click', () => {
        socket.emit('startChat');
        chatMessages.innerHTML = '';  // Clear previous chat messages
        addMessage('System', 'Waiting for another user to join...');
        chatStart.classList.add('hidden');
        chatBox.classList.remove('hidden');
    });

    newChatButton.addEventListener('click', () => {
        socket.emit('newChat');
        chatMessages.innerHTML = '';  // Clear previous chat messages
        chatBox.classList.add('hidden');
        chatActions.classList.add('hidden');
        chatStart.classList.remove('hidden');
        pairedUser = null; // Reset pairedUser
        window.location.href = '/'; // Redirect to home page
    });

    sendButton.addEventListener('click', sendMessage);

    chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = chatInput.value;
        if (message && pairedUser) {
            socket.emit('message', { to: pairedUser, message });
            addMessage('You', message);
            chatInput.value = '';
        }
    }

    socket.on('paired', (userId) => {
        pairedUser = userId;
        chatBox.classList.remove('hidden');
        chatActions.classList.remove('hidden');
        addMessage('System', 'You are paired with a stranger. Start chatting!');
    });

    socket.on('waiting', () => {
        addMessage('System', 'Waiting for another user to join...');
    });

    socket.on('message', ({ from, message }) => {
        addMessage('Stranger', message);
    });

    socket.on('opponentLeft', () => {
        alert('Your chat partner has left. Redirecting to the home page.');
        // Implement redirection logic to home page here
        window.location.href = '/'; // Replace with your home page URL
    });

    socket.on('newChat', () => {
        alert('Starting new chat. Redirecting to the home page.');
        // Implement redirection logic to home page here
        window.location.href = '/'; // Replace with your home page URL
    });

    function addMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = `${sender}: ${message}`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

  


});
