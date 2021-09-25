
const sendBtn = document.querySelector('#btnSend');
const connectBtn = document.querySelector('#btnConnect');
const txtMessageBox = document.querySelector('#txtMessageBox');
const txtName = document.querySelector('#txtName');

let ws;
let userId = -1;
let showConnectedMessage = false;

function sendMessage() {
    if (!ws) {
        showOwnMessage("No WebSocket connection :(");
        return;
    }

    let message = txtMessageBox.value;
    
    if (message.length > 0) {
            ws.send(JSON.stringify({
            idMessage: 1,
            userId: userId,
            message: escapeHtml(txtMessageBox.value),
            name: escapeHtml(document.getElementById("txtName").value)
        }));
        showOwnMessage(escapeHtml(txtMessageBox.value), userId);

    } else {
        txtMessageBox.focus();
    }
}

function sendUserInfo() {
    if (!ws) {
        showOwnMessage("No WebSocket connection :(");
        return;
    }

    let username = txtName.value;

    if (username.length > 0) {
            ws.send(JSON.stringify({
            idMessage: 2,
            message: {
                name: username
            }
        }));

    } else {
        txtName.focus();
    }
}

function showOwnMessage(message, userId) {
    console.log(message);
    const date = getDate();
    
    let messageContainer = `<div class="outgoing_msg">
    <div class="sent_msg">
        <p>${message}</p>
        <span class="time_date"> ${date}</span>
    </div>
    </div>`;

    if (userId == message.clientId) {
        messageContainer = `<div class="incoming_msg">
        <div class="incoming_msg_img"> <img src="./img/user-profile.png" alt="sunil"> </div>
        <div class="received_msg">
            <div class="received_withd_msg">
                <p>${message}</p>
                <span class="time_date"> ${date}</span>
            </div>
        </div>
        </div>`;
    }

    const messages = $("#messages");
    messages.append(messageContainer);
    messages.scrollTop(messages[0].scrollHeight);
    txtMessageBox.value = '';
    txtMessageBox.focus();
}

function showOtherMessage(objMessage) {
    const message = objMessage.message;
    const name = objMessage.name;
    const date = getDate();
    console.log(message);
    
    // Other
    let messageContainer = `<div class="incoming_msg">
    <div class="incoming_msg_img"> <img src="./img/user-profile.png" alt="sunil"> </div>
    <div class="received_msg">
        <div class="username_msg">${name}</div>
        <div class="received_withd_msg">
            <p>${message}</p>
            <span class="time_date"> ${date}</span>
        </div>
    </div>
    </div>`;

    if (userId == objMessage.userId) {
        messageContainer = `<div class="outgoing_msg">
        <div class="sent_msg">
            <p>${message}</p>
            <span class="time_date"> ${date}</span>
        </div>
        </div>`;
    }
    
    const messages = $("#messages");
    messages.append(messageContainer);
    messages.scrollTop(messages[0].scrollHeight);
    txtMessageBox.value = '';
    txtMessageBox.focus();
}


function showClientsList(objClients) {
    let clientsList = objClients.clients;
    let advice = objClients.advice;

    $("#divClientsList").empty();
    if (clientsList != null && clientsList.length > 0) {
        clientsList.forEach(client => {
            let id = client.id;
            let name = client.name;
            
            let isMe = id === userId;

            if (!isMe) {
                let username = name;
                if (!name) {
                    username = "New User";
                }
    
                const clientItemContainer = `<div id="user-${id}" class="chat_list active_chat">
                    <div class="chat_people">
                            <div class="chat_img"> <img src="./img/user-profile.png" alt="sunil"> </div>
                            <div class="chat_ib">
                                <h5>${username} <span style="display:none;" class="chat_date">Dec 25</span></h5>
                                <p style="display:none;">Test, which is a new approach to have all solutions
                                    astrology under one roof.</p>
                            </div>
                        </div>
                    </div>`;

                $("#divClientsList").append(clientItemContainer);
            }
        });
    }

    if (showConnectedMessage && advice) {
        $("#messages").append(`<div class="message-disconnected"><p>${advice} - ${getDate()}</p></div>`);
        const messages = $("#messages");
        messages.scrollTop(messages[0].scrollHeight);
    }
    showConnectedMessage = true;
}

function setClientId(message) {
    console.log(message);
    userId = message.clientId;
}

function connectoToChat() {
    disconnectToChat();

    ws = new WebSocket('ws://localhost:6969');
    ws.onopen = (evt) => { onChatOpen(evt); };
    ws.onclose = (evt) => { onChatClose(evt); };
    ws.onmessage = (evt) => { onChatMessage(evt); };
    ws.onerror = (evt) => { onChatError(evt); };
}

function disconnectToChat() {
    if (ws && ws.close && ws.readyState == 1) {
        ws.close();
        showConnectedMessage = true;
    }    
}

function onChatOpen(evt) {
    console.log('Connection opened!');
    if (ws && ws.readyState == 1) {
        $("#chatContainer").slideDown();
        $("#formUserInfo").slideUp();
        console.log("ws: ", ws);
        sendUserInfo();
        txtMessageBox.focus();
    }
}

function onChatClose(evt) {
    console.log('Connection closed!');
    ws = null;
    alert("El servidor de chat está apagado!");
}

function onChatMessage(objMessage) {
    objMessage = JSON.parse(objMessage.data);
    const messageType = objMessage.type;
    console.log(objMessage);

    switch (messageType) {
        case "chatMessage":
            showOtherMessage(objMessage);
            break;

        case "clients":
            showClientsList(objMessage.message);
            break;

        case "id":
            setClientId(objMessage.message);
            break;
    }
}

function onChatError(evt) {

}

function init() {
    if (ws) {
        ws.onerror = ws.onopen = ws.onclose = null;
        ws.close();
    }

    connectoToChat();
    txtMessageBox.focus();
}

function sendBtnAction() {
    const nombreUsuario = document.getElementById("txtName").value;
    if (nombreUsuario.length == 0) {
        alert("Ingrese nombre");
    } else {
        sendMessage();
    }
}

function connectBtnAction() {
    const nombreUsuario = document.getElementById("txtName").value;
    if (nombreUsuario.length == 0) {
        alert("Ingrese nombre");
    } else {
        connectoToChat();
    }
}

function getDate() {
    const today = new Date();
    return today.toLocaleString();
}

sendBtn.onclick = function () {
    sendBtnAction();
}

connectBtn.onclick = function() {
    connectBtnAction();
}

txtMessageBox.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        sendBtnAction();
    }
});

txtName.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
        connectBtnAction();
    }
});

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
