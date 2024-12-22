const socket = io();

const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const userHeading = document.getElementById('user-heading');
const downloadButton = document.getElementById('download-chat');
const fileInput = document.getElementById('file-input'); // File input field


let chatHistory = [];


const validPins = {
    '3020': 'Kevin ',
    '4030': 'Jovin'
};


function getUserPin() {
    let pin;
    do {
        pin = prompt("Enter your 4-digit PIN :");
        if (validPins[pin]) {
            return pin;
        } else {
            alert("Invalid PIN. Please try again."); 
        }
    } while (true); 
}


const userPin = getUserPin();
userHeading.textContent = `Logged in as: ${validPins[userPin]}`;

form.addEventListener('submit', function(event) {
    event.preventDefault();
    if (input.value || fileInput.files.length > 0) {
        const messageData = {
            pin: userPin,
            message: input.value,
            file: fileInput.files[0] 
        };

        
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                messageData.fileData = e.target.result; 
                socket.emit('chat message', messageData);
                input.value = ''; 
                fileInput.value = '';
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            socket.emit('chat message', messageData);
            input.value = ''; 
        }
    }
});

socket.on('chat message', function(data) {
    const item = document.createElement('li');
    const userIcon = document.createElement('div');
    userIcon.classList.add('user-icon');
    userIcon.classList.add(data.pin === '3020' ? 'user1-icon' : 'user2-icon');

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    
    messageContent.textContent = `${data.pin}: ${data.message}`;
    item.appendChild(userIcon);
    item.appendChild(messageContent);
    
    
    if (data.fileData) {
        const fileLink = document.createElement('a');
        fileLink.href = data.fileData; 
        fileLink.textContent = ' [Download File]';
        fileLink.target = '_blank'; 
        item.appendChild(fileLink);
    }

    messages.appendChild(item);
    
    
    chatHistory.push(`${data.pin}: ${data.message}`);

    
    messages.scrollTop = messages.scrollHeight;
});


function downloadChat() {
    const blob = new Blob([chatHistory.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt'; 
    document.body.appendChild(a);
    a.click();  
    document.body.removeChild(a);
}


downloadButton.addEventListener('click', downloadChat);
