
class User {
    id: number;
    name: string;
    
    constructor(id: number, name: string) {
        this.name = name;
        this.id = id;
    }
}

class ChatService {
    usersCounter: number;
    users: Array<User>;
    chatHub: any;

    constructor() {
        this.users = new Array<User>();
        this.usersCounter = 1;
        this.chatHub = $.connection.chatHub;
        $.connection.hub.start();

        $.connection.hub.start().done(function () {
            this.chatHub.client.getAllUsers = function (users: Array<User>) {
                console.log(users);
            };
            this.chatHub.server.getAllUsers();
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
}

class UsersController {
    users: Array<User>;
    currentUserId: number;
    showInput: boolean;

    constructor(private myChatService: ChatService) {
        this.users = this.myChatService.getAllUsers();
        this.showInput = true;
    }

    addUser(name: string) {
        this.myChatService.addNewUser(name);
        this.users = this.myChatService.getAllUsers();
        this.showInput = false;
    }

    setCurrentUserId(id: number) {
        this.currentUserId = id;
    }
}
UsersController.$inject = ['ChatService'];


var chatApp = angular.module('chatApp', []);
chatApp.service("ChatService", ChatService);
chatApp.controller("UsersController", UsersController);