"use strict";

class User {
	constructor(socket, jwt) {
		this.id = User.getNewId();
		this.socket = socket;
        this.jwt = jwt;
		this.socket.userId = this.id;
		this.displayName = ""; // from siteweb
		this.email = ""; // from siteweb
		this.role = ""; // from siteweb
		this.token = ""; // from siteweb
		this.userId = ""; // from siteweb
		this.category = ""; // from siteweb
		this.avatar = "";
	}

	getId() {
		return this.id;
	}

	setId(id) {
		this.id = id;
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

	getDisplayName() {
		return this.displayName;
	}

	setDisplayName(displayName) {
		this.displayName = displayName;
	}

	getEmail() {
		return this.email;
	}

	setEmail(email) {
		this.email = email; 
	}

	getRole() {
		return this.role;
	}

	setRole(role) {
		this.role = role;
	}

	getToken() {
		return this.token;
	}

	setToken(token) {
		this.token = token;
	}

	getUserId() {
		return this.userId;
	}

	setUserId(userId) {
		this.userId = userId;
	}

	getCategory() {
		return this.category;
	}

	setCategory(category) {
		this.category = category;
	}

	getAvatar() {
		return this.avatar;
	}

	setAvatar(avatar) {
		this.avatar = avatar;
	}

	static getNewId() {
	    if (User.counter > 2147483647) {
	        User.counter = 1;
	    }
	    return User.counter++ >>> 0;
	}

	toObject() {
		return {
			id: this.getId(),
			displayName: this.getDisplayName(),
			email: this.getEmail(),
			role: this.getRole(),
			token: this.getToken(),
			userId: this.getUserId(),
			category: this.getCategory(),
			avatar: this.getAvatar()
		}
	}
}

User.counter = 1;
module.exports = User;
