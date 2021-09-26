const { Console } = require('console');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const User = require("./User");

const PORT = 6969;
const server = http.createServer(express);
const webSocketServer = new WebSocket.Server({server});

let users = [];

let consultants = [];
let clients = [];
let connections = 0;

// ROLES
const USER = "user";
const CONSULTANT = "consultant";

// MESSAGES
const WS_USER_INFO = 2;
const WS_USER_MESSAGE = 1;

// 1. Connect
webSocketServer.on('connection', function(ws) {
    let user = new User(ws);
    connections++;
    users.push(user);
    console.log("User Connected id#: ", user.getId());
    sendSocketId(ws, user.getId());

    // 2. MESSAGES
    ws.on('message', function(message) {
        const objMessage = JSON.parse(message);
        const idMessage = objMessage.idMessage;
        console.log("Mensaje entrante =>>>>>>>>>>>>> ", objMessage);
        switch (idMessage) {
            case WS_USER_INFO:
                updateUserInfo(objMessage);
                sendUsersInfo(/*advice*/);
                break;
            case WS_USER_MESSAGE:
                sendMessageTo(ws, webSocketServer, objMessage);
                break;
            default:
                console.log("Other message");
        }
    })

    // 3. CLOSE CONNECTION
    ws.on("close", function(code, desc) {
        console.log("=>>> Se desconectó.......<====");
        var id = ws.userId;
        console.log("socket id desconecntado => ", id);
        let user = findUserById(id);
        if (user) {
            console.log("Se encontró al usere: ");
            const email = user.getEmail();
            console.log("Se va a eliminar al usuario: ", email);
            const advice = email + ' se ha desconectado';
            deleteUsers(id);
            sendUsersInfo();
            infoConnected();
        } else {
            console.log("No Se encontró user: ", id, " ya fue eliminado");
        }
    });
});

server.listen(PORT, function() {
    console.log(`Server is listening on ${PORT}`);
});

function sendSocketId(socket, socketId) {
    console.log("function sendUserId socketId: ", socketId);
    socket.send(JSON.stringify({
        type: "id",
        message: {
            socketId: socketId,
        }
    }), function(error) {
        
    });
}

function sendUsersInfo() {
    console.log("Sending users info...");
    let objUsers = usersToObject();
	for (let i = 0; i < users.length; ++i) {
		let user = users[i];
		let socket = user.getSocket();
        socket.send(JSON.stringify({
            type: "users",
            message: {
                users: objUsers,
            }
        }), function(error) {
            
        });
	}
}

function sendMessageTo(ws, webSocketServer, objMessage) {
    webSocketServer.clients.forEach(function(user) {
        if (/*user !== ws && */user.readyState === WebSocket.OPEN /*&& ws === objOpponentUser.getSocket()*/) {
            user.send(
                JSON.stringify({
                    "type": "chatMessage",
                    "message": objMessage
                })
            );
        }
    });
}

function usersToObject() {
    let objUsers = [];
    for (let i = 0; i < users.length; ++i) {
        let user = users[i];
        objUsers.push(user.toObject());
    }

    return objUsers;
}

function deleteUsers(id) {
	let counter = 0;
    for (let i = users.length - 1; i >= 0; --i) {
    	var user = users[i];
    	if (user.getId() == id) {
    		users.splice(i, 1);
    		counter++;

            if (user.getRole() == CONSULTANT) {
                deleteConsultant(id);
            } else {
                deleteClient(id);
            }
    	}
    }
}

function deleteClient(id) {
    let counter = 0;
    for (let i = clients.length - 1; i >= 0; --i) {
    	var client = clients[i];
    	if (client.getId() == id) {
    		clients.splice(i, 1);
    		counter++;
    	}
    }
}

function deleteConsultant(id) {
    let counter = 0;
    for (let i = consultants.length - 1; i >= 0; --i) {
    	var consultant = consultants[i];
    	if (consultant.getId() == id) {
    		consultants.splice(i, 1);
    		counter++;
    	}
    }
}

function updateUserInfo(objMessage) {
    console.log("Update user info: ", objMessage);
    let loggedUser = objMessage.message;
    
    const {displayName, email, role, socketId, token, userId, category, avatar } = loggedUser;
    console.log("socketId: ", socketId);

    let currentUser = null;
    for (let i = 0; i < users.length; ++i) {
        currentUser = users[i];
        if (currentUser.id == socketId) {
            currentUser.setDisplayName(displayName);
            currentUser.setEmail(email);
            currentUser.setRole(role);
            currentUser.setToken(token);
            currentUser.setUserId(userId);
            currentUser.setCategory(category);
            currentUser.setAvatar(avatar);

            console.log("currentUser: ", currentUser.toObject());

            if (role === CONSULTANT) {
                consultants.push(currentUser);
            } else {
                clients.push(currentUser);
            }

            infoConnected();
        }
    }

    // validar si es el mismo usuario que se vuelve a conectar, cierra la conexión al anterior
    users.forEach((user, index) => {
        console.log("index-------------------------------------: ", index);
        console.log("user.getUserId(): ", user.getUserId());
        console.log("current userId: ", userId);
        console.log("user.getUserId() == userId && user.getId() != socketId: ", user.getUserId() == userId && user.getId() != socketId);
        if (user.getUserId() == userId && user.getId() != socketId) {
            console.log("Se detectó el mismo usuario con sockets diferentes");
            let socketId = user.getId();
            user.getSocket().close(); // Desconectamos
            deleteUsers(socketId); // Borramos
        }
    });
    infoConnected();
}

function findUserById(id) {
    let user = null;

    for (let i = 0; i < users.length; ++i) {
        if (users[i].getId() == id) {
            user = users[i];
        }
    }
    return user;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function infoConnected() {
    console.log("Total: ",users,  users.length);
    console.log("Total clients: ", clients.length);
    console.log("Total consultants: ", consultants.length);
}