interface funct {
    (): void;
}

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
    funcs: funct[];

    constructor() {
        this.users = new Array<User>();
        this.messages = new Array<Message>();
        this.chatHub = $.connection.chatHub;

        let self = this;



        this.chatHub.client.getAllUsers = ;

        this.chatHub.client.getUserMessages = function (messages: Array<Message>) {
            for (let message of messages)
            {
                self.messages.push(new Message(message['UserIdFrom'],message['UserIdTo'], message['Text'], message['Time']));
            }
        };

        
        //$.connection.hub.start();
        $.connection.hub.start().done(function () {
            self.chatHub.server.getAllUsers();
        });      
     
    }

    public subscribe(act: funct): void {
        this.funcs.push(act);
    }

    public getAllUsers(): Array<User> {
        return this.users;
    }

    public addNewUser(name: string): number {
        //console.log(name);
        let usersCounter = Math.floor(Math.random() * 6) + 1;
        this.users.push(new User(usersCounter,name));
        this.chatHub.server.joinRoom(usersCounter,name);
        return usersCounter;
    }

    public getUserById(id: number): User {
        for (let user of this.users) {
            if (user.id == id) {
                return user;
            }
        }
    }

    public getUserMessages(userIdFrom: number, userIdTo: number): Array<Message> {
        let self = this;
        $.connection.hub.start().done(function () {
            self.chatHub.server.getUserMessages(userIdFrom, userIdTo);
        }); 
        
        return this.messages;
    }

    public sendMessage(userIdFrom: number, userIdTo: number, text: string) {
        this.messages.push(new Message(userIdFrom, userIdTo, text, ""));
        this.chatHub.server.sendMessage(userIdFrom, userIdTo, text);
    }

}

class UsersController {
    users: Array<User>;
    userIdTo: number;
    userIdFrom: number;
    showInput: boolean;

    constructor(private myChatService: ChatService, private $scope: ng.IScope) {
        this.users = this.myChatService.getAllUsers();
        this.showInput = true;
        this.userIdFrom = 0;
        this.userIdTo = 0;
        //this.$scope.$apply();
    }

    addUser(name: string) {
        this.userIdFrom = this.myChatService.addNewUser(name);
        this.users = this.myChatService.getAllUsers();
        this.showInput = false;
        //this.$scope.$apply();
    }

    setUserIdTo(id: number) {
        this.userIdTo = id;
    }
}
UsersController.$inject = ['ChatService', '$scope'];

class DialogController {
    messages: Array<Message>;
    userIdTo: number;
    userIdFrom: number;

    constructor(private myChatService: ChatService, private $scope: ng.IScope) {
        this.messages = new Array<Message>();
    }

    $onChanges(obj: any) {
        console.log(obj.userIdFrom);
        console.log(obj.userIdTo);
        this.userIdFrom = obj.userIdFrom.currentValue;
        this.userIdTo = obj.userIdTo.currentValue;
        this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    }

    sendMessage(text: string)
    {
        this.myChatService.sendMessage(this.userIdFrom, this.userIdTo, text);
        this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    }
}
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