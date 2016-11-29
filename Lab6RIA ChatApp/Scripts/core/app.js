var User = (function () {
    function User(id, name) {
        this.name = name;
        this.id = id;
    }
    return User;
}());
var ChatService = (function () {
    function ChatService() {
        this.users = new Array();
        this.usersCounter = 1;
        this.chatHub = $.connection.chatHub;
        $.connection.hub.start();
        $.connection.hub.start().done(function () {
            this.chatHub.client.getAllUsers = function (users) {
                console.log(users);
            };
            this.chatHub.server.getAllUsers();
        });
    }
    ChatService.prototype.getAllUsers = function () {
        return this.users;
    };
    ChatService.prototype.addNewUser = function (name) {
        //console.log(name);
        this.users.push(new User(this.usersCounter, name));
        this.chatHub.server.joinRoom(this.usersCounter, name);
        this.usersCounter++;
    };
    ChatService.prototype.getUserById = function (id) {
        for (var _i = 0, _a = this.users; _i < _a.length; _i++) {
            var user = _a[_i];
            if (user.id == id) {
                return user;
            }
        }
    };
    return ChatService;
}());
var UsersController = (function () {
    function UsersController(myChatService) {
        this.myChatService = myChatService;
        this.users = this.myChatService.getAllUsers();
        this.showInput = true;
    }
    UsersController.prototype.addUser = function (name) {
        this.myChatService.addNewUser(name);
        this.users = this.myChatService.getAllUsers();
        this.showInput = false;
    };
    UsersController.prototype.setCurrentUserId = function (id) {
        this.currentUserId = id;
    };
    return UsersController;
}());
UsersController.$inject = ['ChatService'];
var chatApp = angular.module('chatApp', []);
chatApp.service("ChatService", ChatService);
chatApp.controller("UsersController", UsersController);
