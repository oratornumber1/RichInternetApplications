
class User {
    id: number;
    name: string;
    
    constructor(id: number, name: string) {
        this.name = name;
        this.id = id;
    }
}

class Message{
    userIdFrom: number;
    userIdTo: number;
    text: string;
    time: string;
    constructor(userIdFrom: number, userIdTo: number, text: string, time: string) {
        this.userIdFrom = userIdFrom;
        this.userIdTo = userIdTo;
        this.text = text;
        this.time = time;
    }
}

class ChatService {
    usersCounter: number;
    users: Array<User>;
    messages: Array<Message>;
    chatHub: any;

    constructor() {
        this.users = new Array<User>();
        this.messages = new Array<Message>();
        this.usersCounter = 1;
        this.chatHub = $.connection.chatHub;

        let self = this;
        this.chatHub.client.getAllUsers = function (users: Array<User>) {
            for (let user of users)
            {
                self.users.push(new User(user['Id'], user['Name']));
            }
            //console.log(self.users);
        };

        this.chatHub.client.getUserMessages = function (messages: Array<Message>) {
            for (let message of messages)
            {
                self.messages.push(new Message(message['UserIdFrom'],message['UserIdTo'], message['Text'], message['Time']));
            }
        };

        
        $.connection.hub.start();
        $.connection.hub.start().done(function () {
            self.chatHub.server.getAllUsers();
        });      
     
    }

    public getAllUsers(): Array<User> {
        return this.users;
    }

    public addNewUser(name: string) {
        //console.log(name);
        this.users.push(new User(this.usersCounter,name));
        this.chatHub.server.joinRoom(this.usersCounter,name);
        this.usersCounter++;
    }

    public getUserById(id: number): User {
        for (let user of this.users) {
            if (user.id == id) {
                return user;
            }
        }
    }

    public sendMessage(userIdFrom: number, userIdTo: number, text: string) {
        this.messages.push(new Message(userIdFrom, userIdTo, text, ""));
        this.chatHub.server.sendMessage(userIdFrom, userIdTo, text);
    }

}

class UsersController {
    users: Array<User>;
    currentUserId: number;
    showInput: boolean;

    constructor(private myChatService: ChatService, private $scope: ng.IScope) {
        this.users = this.myChatService.getAllUsers();
        this.showInput = true;
        //this.$scope.$apply();
    }

    addUser(name: string) {
        this.myChatService.addNewUser(name);
        this.users = this.myChatService.getAllUsers();
        this.showInput = false;
        //this.$scope.$apply();
    }

    setCurrentUserId(id: number) {
        this.currentUserId = id;
    }
}
UsersController.$inject = ['ChatService', '$scope'];


var chatApp = angular.module('chatApp', []);
chatApp.service("ChatService", ChatService);
chatApp.controller("UsersController", UsersController);