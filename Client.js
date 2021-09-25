"use strict";

class Client {
	constructor(socket, jwt) {
		this.id = Client.getNewId();
		this.name = "";
		this.socket = socket;
        this.jwt = jwt;
		this.socket.clientId = this.id;
	}

	getId() {
		return this.id;
	}

	setId(id) {
		this.id = id;
	}

    getName() {
		return this.name;
	}

	setName(name) {
		this.name = name;
	}

	getSocket() {
		return this.socket;
	}

	setSocket(socket) {
		this.socket = socket;
	}

    getJwt() {
        return this.jwt;
    }

    setJwt(jwt) {
        this.jwt = jwt;
    }

	static getNewId() {
	    if (Client.counter > 2147483647) {
	        Client.counter = 1;
	    }
	    return Client.counter++ >>> 0;
	}

	toObject() {
		return {
			id: this.getId(),
			name: this.getName()
		}
	}
}

Client.counter = 1;
module.exports = Client;
