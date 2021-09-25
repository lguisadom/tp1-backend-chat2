const { Console } = require('console');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const Client = require("./Client");

const PORT = 6969;
const server = http.createServer(express);
const webSocketServer = new WebSocket.Server({server});

let clients = [];
let connections = 0;

// 1. Connect
webSocketServer.on('connection', function(ws) {
    let client = new Client(ws);
    connections++;
    clients.push(client);
    console.log("Client Connected id#: ", client.getId());
    sendClientId(ws, client.getId());

    // 2. MESSAGES
    ws.on('message', function(message) {
        // Actualizar nombre en caso que venga
        let objMessage = JSON.parse(message);
        let idMessage = objMessage.idMessage;

        console.log("objMessage: ", objMessage);

        if (idMessage === 1) { // chat
            let strMessage = escapeHtml(objMessage.message);
            let chatId = objMessage.chatId;
            let userId = objMessage.userId;
            let time = objMessage.time;
            let name = escapeHtml(objMessage.name);
            let id = objMessage.id;
            let status = objMessage.status;
            let avatar = objMessage.avatar;
            
            webSocketServer.clients.forEach(function(client) {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(
                        JSON.stringify({
                            "type": "chatMessage",
                            "message": strMessage,
                            chatId,
                            userId,
                            time,
                            name,
                            id,
                            status,
                            avatar
                        })
                    );
                }
            });
        } else if (idMessage === 2) { // userInfo
            updateUserInfo(objMessage, ws.clientId);
            // Send list clients

            let client = findClientById(ws.clientId);
            const name = client.getName();
            const advice = name + ' se ha conectado';
            sendClientsInfo(advice);

        } else {
            console.log("other");
        }
    })

    // 3. CLOSE CONNECTION
    ws.on("close", function(code, desc) {
        var id = ws.clientId;
        let client = findClientById(id);
        const name = client.getName();
        const advice = name + ' se ha desconectado';
        deleteClients(id);
        sendClientsInfo(advice);
    });
});

server.listen(PORT, function() {
    console.log(`Server is listening on ${PORT}`);
});

function sendClientsInfo(advice) {
    let objClients = clientsToObject();
	for (let i = 0; i < clients.length; ++i) {
		let client = clients[i];
		let socket = client.getSocket();
        socket.send(JSON.stringify({
            type: "clients",
            message: {
                clients: objClients,
                advice: advice
            }
        }), function(error) {
            
        });
	}
}

function sendClientId(socket, clientId) {
    console.log("function sendClientId");
    socket.send(JSON.stringify({
        type: "id",
        message: {
            clientId: clientId,
        }
    }), function(error) {
        
    });
}

function clientsToObject() {
    let objClients = [];
    for (let i = 0; i < clients.length; ++i) {
        let client = clients[i];
        objClients.push(client.toObject());
    }

    return objClients;
}

function deleteClients(id) {
	let counter = 0;
    for (let i = clients.length - 1; i >= 0; --i) {
    	var client = clients[i];
    	if (client.getId() == id) {
    		clients.splice(i, 1);
    		counter++;
    	}
    }
}

function updateUserInfo(objMessage, clientId) {
    let userInfo = objMessage.message;
    let name = userInfo.name;
    for (let i = 0; i < clients.length; ++i) {
        let client = clients[i];
        if (client.id == clientId) {
            client.setName(name);
        }
    }
}

function findClientById(id) {
    let client = null;

    for (let i = 0; i < clients.length; ++i) {
        if (clients[i].getId() == id) {
            client = clients[i];
        }
    }
    return client;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
