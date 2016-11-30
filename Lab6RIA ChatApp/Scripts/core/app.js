var User = (function () {
    function User(id, name) {
        this.name = name;
        this.id = id;
    }
    return User;
}());
var Message = (function () {
    function Message(userIdFrom, userIdTo, text, time) {
        this.userIdFrom = userIdFrom;
        this.userIdTo = userIdTo;
        this.text = text;
        this.time = time;
    }
    return Message;
}());
var ChatService = (function () {
    function ChatService() {
        this.users = new Array();
        this.messages = new Array();
        this.chatHub = $.connection.chatHub;
        var self = this;
        this.chatHub.client.getAllUsers = function (users) {
            for (var _i = 0, users_1 = users; _i < users_1.length; _i++) {
                var user = users_1[_i];
                self.users.push(new User(user['Id'], user['Name']));
            }
            //console.log(self.users);
        };
        this.chatHub.client.getUserMessages = function (messages) {
            for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                var message = messages_1[_i];
                self.messages.push(new Message(message['UserIdFrom'], message['UserIdTo'], message['Text'], message['Time']));
            }
        };
        //$.connection.hub.start();
        $.connection.hub.start().done(function () {
            self.chatHub.server.getAllUsers();
        });
    }
    ChatService.prototype.getAllUsers = function () {
        return this.users;
    };
    ChatService.prototype.addNewUser = function (name) {
        //console.log(name);
        var usersCounter = Math.floor(Math.random() * 6) + 1;
        this.users.push(new User(usersCounter, name));
        this.chatHub.server.joinRoom(usersCounter, name);
        return usersCounter;
    };
    ChatService.prototype.getUserById = function (id) {
        for (var _i = 0, _a = this.users; _i < _a.length; _i++) {
            var user = _a[_i];
            if (user.id == id) {
                return user;
            }
        }
    };
    ChatService.prototype.getUserMessages = function (userIdFrom, userIdTo) {
        var self = this;
        $.connection.hub.start().done(function () {
            self.chatHub.server.getUserMessages(userIdFrom, userIdTo);
        });
        return this.messages;
    };
    ChatService.prototype.sendMessage = function (userIdFrom, userIdTo, text) {
        this.messages.push(new Message(userIdFrom, userIdTo, text, ""));
        this.chatHub.server.sendMessage(userIdFrom, userIdTo, text);
    };
    return ChatService;
}());
var UsersController = (function () {
    function UsersController(myChatService, $scope) {
        this.myChatService = myChatService;
        this.$scope = $scope;
        this.users = this.myChatService.getAllUsers();
        this.showInput = true;
        this.userIdFrom = 0;
        this.userIdTo = 0;
        //this.$scope.$apply();
    }
    UsersController.prototype.addUser = function (name) {
        this.userIdFrom = this.myChatService.addNewUser(name);
        this.users = this.myChatService.getAllUsers();
        this.showInput = false;
        //this.$scope.$apply();
    };
    UsersController.prototype.setUserIdTo = function (id) {
        this.userIdTo = id;
    };
    return UsersController;
}());
UsersController.$inject = ['ChatService', '$scope'];
var DialogController = (function () {
    function DialogController(myChatService, $scope) {
        this.myChatService = myChatService;
        this.$scope = $scope;
        this.messages = new Array();
    }
    DialogController.prototype.$onChanges = function (obj) {
        console.log(obj.userIdFrom);
        console.log(obj.userIdTo);
        this.userIdFrom = obj.userIdFrom.currentValue;
        this.userIdTo = obj.userIdTo.currentValue;
        this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    };
    DialogController.prototype.sendMessage = function (text) {
        this.myChatService.sendMessage(this.userIdFrom, this.userIdTo, text);
        this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    };
    return DialogController;
}());
DialogController.$inject = ['ChatService', '$scope'];
var chatApp = angular.module('chatApp', []);
chatApp.service("ChatService", ChatService);
chatApp.controller("UsersController", UsersController);
chatApp.controller("DialogController", DialogController);
chatApp.component('dialog', {
    bindings: {
        userIdFrom: '<',
        userIdTo: '<'
    },
    controller: DialogController,
    templateUrl: '../../DialogTemplate.html',
    controllerAs: 'ctrlDialog'
});
//# sourceMappingURL=app.js.map