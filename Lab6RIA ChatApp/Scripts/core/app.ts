class User {
    id: number;
    name: string;

    constructor(id: number, name: string) {
        this.name = name;
        this.id = id;
    }
}

class Message {
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


class SignalRService {
    private connection: SignalR.Hub.Connection;
    public proxy: SignalR.Hub.Proxy;
    public callbackGetAllUsers;
    public callbackReceiveNewUser;
    public callbackGetUserMessages;
    public callbackGetNewMessage;

    constructor() {
        this.connection = $.hubConnection();
        this.proxy = this.connection.createHubProxy('chatHub');

        this.proxy.on('getAllUsers', (users: Array<User>) => {
            this.callbackGetAllUsers(users);
        });

        this.proxy.on('getUserMessages', (messages: Array<Message>) => {
            this.callbackGetUserMessages(messages);
        });

        this.proxy.on('sendMessage', (message: Message) => {
            this.callbackGetNewMessage(message);
        });

        this.proxy.on('addNewUser', (user: User) => {
            this.callbackReceiveNewUser(user);
        });

        this.connection.start().done(() => {
            this.proxy.invoke('getAllUsers');
            this.proxy.invoke('getUserMessages', 0, 0)
        });
    }

    public GetAllUsers() {
        this.proxy.invoke('getAllUsers');
    }

    public AddUser(user: User) {
        this.proxy.invoke('joinRoom', user.id, user.name);
    }

    public GetAllMessages(userIdFrom:number, userIdTo:number) {
        this.proxy.invoke('getUserMessages', userIdFrom, userIdTo);
    }

    public SendMessage(userIdFrom: number, userIdTo: number, text: string) {
        this.proxy.invoke('sendMessage', userIdFrom, userIdTo, text);
    }
}




class UsersController {
    users: Array<User>;
    messages: Array<Message>;

    callback: (users: Array<User>) => void  = (users) => {
        this.users = [];
        users.forEach(u => {
            this.users.push(new User(u['Id'], u['Name']));
        });
        this.$scope.$apply();
    };
    callbackAllMessages: (messages: Array<Message>) => void = (messages) => {
        this.messages = [];
        messages.forEach(m => {
            this.messages.push(new Message(m['UserIdFrom'], m['UserIdTo'], m['Text'], m['Time']));
        });
        this.$scope.$apply();
    };
    callbackReceiveMessage: (message: Message) => void = (message) => {
        this.messages.push(new Message(message['UserIdFrom'], message['UserIdTo'], message['Text'], message['Time']));
        this.$scope.$apply();
    };
    callbackReceiveNewUser: (user: User) => void = (user) => {
        this.users.push(new User(user['Id'], user['Name']));
        this.$scope.$apply();
    };


    userIdTo: number;
    userIdFrom: number;
    showInput: boolean;

    constructor(private SignalRService, private $scope: ng.IScope) {
        this.SignalRService.callbackGetAllUsers = this.callback;
        this.SignalRService.callbackGetUserMessages = this.callbackAllMessages;
        this.SignalRService.callbackGetNewMessage = this.callbackReceiveMessage;
        this.SignalRService.callbackReceiveNewUser = this.callbackReceiveNewUser;
        //this.SignalRService.GetAllUsers();

        this.showInput = true;
        this.userIdFrom = 0;
        this.userIdTo = 0;

    }

    addUser(name: string) {
        let usersCounter = Math.floor(Math.random() * 6) + 1;
        this.userIdFrom = usersCounter;
        var newUser = new User(usersCounter, name);
        //this.users.push(newUser);
        this.SignalRService.AddUser(newUser);
        this.showInput = false;
        
        //this.$scope.$apply();
    }

    setUserIdTo(id: number) {
        this.userIdTo = id;
        this.messages = [];
        this.SignalRService.GetAllMessages(this.userIdFrom, this.userIdTo);
    }

    sendMessage(text: string) {
        this.SignalRService.SendMessage(this.userIdFrom, this.userIdTo, text);
    }
}
UsersController.$inject = ['SignalRService', '$scope'];

class DialogController {
    messages: Array<Message>;
    userIdTo: number;
    userIdFrom: number;

    constructor(private SignalRService, private $scope: ng.IScope) {
        this.messages = new Array<Message>();
    }

    $onChanges(obj: any) {
        console.log(obj.useridfrom.currentValue);
        console.log(obj.useridto.currentValue);
        //this.userIdFrom = obj.userIdFrom.currentValue;
        //this.userIdTo = obj.userIdTo.currentValue;
        //this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    }

    //sendMessage(text: string) {
    //    this.myChatService.sendMessage(this.userIdFrom, this.userIdTo, text);
    //    this.messages = this.myChatService.getUserMessages(this.userIdFrom, this.userIdTo);
    //}
}
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