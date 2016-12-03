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
var SignalRService = (function () {
    function SignalRService() {
        var _this = this;
        this.connection = $.hubConnection();
        this.proxy = this.connection.createHubProxy('chatHub');
        this.proxy.on('getAllUsers', function (users) {
            _this.callbackGetAllUsers(users);
        });
        this.proxy.on('getUserMessages', function (messages) {
            _this.callbackGetUserMessages(messages);
        });
        this.proxy.on('sendMessage', function (message) {
            _this.callbackGetNewMessage(message);
        });
        this.proxy.on('addNewUser', function (user) {
            _this.callbackReceiveNewUser(user);
        });
        this.connection.start().done(function () {
            _this.proxy.invoke('getAllUsers');
            _this.proxy.invoke('getUserMessages', 0, 0);
        });
    }
    SignalRService.prototype.GetAllUsers = function () {
        this.proxy.invoke('getAllUsers');
    };
    SignalRService.prototype.AddUser = function (user) {
        this.proxy.invoke('joinRoom', user.id, user.name);
    };
    SignalRService.prototype.GetAllMessages = function (userIdFrom, userIdTo) {
        this.proxy.invoke('getUserMessages', userIdFrom, userIdTo);
    };
    SignalRService.prototype.SendMessage = function (userIdFrom, userIdTo, text) {
        this.proxy.invoke('sendMessage', userIdFrom, userIdTo, text);
    };
    return SignalRService;
}());
var UsersController = (function () {
    function UsersController(SignalRService, $scope) {
        var _this = this;
        this.SignalRService = SignalRService;
        this.$scope = $scope;
        this.callback = function (users) {
            _this.users = [];
            users.forEach(function (u) {
                _this.users.push(new User(u['Id'], u['Name']));
            });
            _this.$scope.$apply();
        };
        this.callbackAllMessages = function (messages) {
            _this.messages = [];
            messages.forEach(function (m) {
                _this.messages.push(new Message(m['UserIdFrom'], m['UserIdTo'], m['Text'], m['Time']));
            });
            _this.$scope.$apply();
        };
        this.callbackReceiveMessage = function (message) {
            _this.messages.push(new Message(message['UserIdFrom'], message['UserIdTo'], message['Text'], message['Time']));
            _this.$scope.$apply();
        };
        this.callbackReceiveNewUser = function (user) {
            _this.users.push(new User(user['Id'], user['Name']));
            _this.$scope.$apply();
        };
        this.SignalRService.callbackGetAllUsers = this.callback;
        this.SignalRService.callbackGetUserMessages = this.callbackAllMessages;
        this.SignalRService.callbackGetNewMessage = this.callbackReceiveMessage;
        this.SignalRService.callbackReceiveNewUser = this.callbackReceiveNewUser;
        //this.SignalRService.GetAllUsers();
        this.showInput = true;
        this.userIdFrom = 0;
        this.userIdTo = 0;
    }
    UsersController.prototype.addUser = function (name) {
        var usersCounter = Math.floor(Math.random() * 6) + 1;
        this.userIdFrom = usersCounter;
        var newUser = new User(usersCounter, name);
        //this.users.push(newUser);
        this.SignalRService.AddUser(newUser);
        this.showInput = false;
        //this.$scope.$apply();
    };
    UsersController.prototype.setUserIdTo = function (id) {
        this.userIdTo = id;
        this.messages = [];
        this.SignalRService.GetAllMessages(this.userIdFrom, this.userIdTo);
    };
    UsersController.prototype.sendMessage = function (text) {
        this.SignalRService.SendMessage(this.userIdFrom, this.userIdTo, text);
    };
    return UsersController;
}());
UsersController.$inject = ['SignalRService', '$scope'];
var DialogController = (function () {
    function DialogController(SignalRService, $scope) {
        this.SignalRService = SignalRService;
        this.$scope = $scope;
        this.messages = new Array();
    }
    DialogController.prototype.$onChanges = function (obj) {
        console.log(obj.useridfrom.currentValue);
        console.log(obj.useridto.currentValue);
        //this.userIdFrom = obj.userIdFrom.currentValue;
        //this.userIdTo = obj.userIdTo.currentValue;
        //this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    };
    return DialogController;
}());
DialogController.$inject = ['SignalRService', '$scope'];
var chatApp = angular.module('chatApp', []);
chatApp.controller("UsersController", UsersController);
chatApp.service("SignalRService", SignalRService);
chatApp.controller("DialogController", DialogController);
chatApp.component('dialog', {
    bindings: {
        useridfrom: '<',
        useridto: '<'
    },
    controller: DialogController,
    templateUrl: '../../../DialogTemplate.html',
    controllerAs: 'ctrlDialog'
});
//# sourceMappingURL=app.js.map