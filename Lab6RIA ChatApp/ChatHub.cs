using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Lab6RIA_ChatApp.Models;

namespace Lab6RIA_ChatApp
{
    public class ChatHub : Hub
    {
        public static List<User> _users = new List<User>();
        public static List<Message> _messages = new List<Message>();
        
        public void JoinRoom(int id, string name)
        {
            var newUser = new User { Id = id, Name = name, ConnectionId = Context.ConnectionId };
            _users.Add(newUser);
            Groups.Add(Context.ConnectionId, id.ToString());
            Clients.All.addNewUser(newUser);
        }

        public void LeaveRoom(int id)
        {
            _users.Remove(_users.FirstOrDefault(u => u.Id == id));
            Groups.Remove(Context.ConnectionId, id.ToString());
        }

        public void GetAllUsers()
        {
            Clients.All.getAllUsers(_users);
        }

        public void SendMessage(int userIdFrom, int userIdTo, string text)
        {
            var message = new Message { UserIdFrom = userIdFrom, UserIdTo = userIdTo, Text = text, Time = DateTime.Now.ToString("dd-MM-yyyy hh:mm") };
            _messages.Add(message);
            Clients.Group(userIdTo.ToString()).sendMessage(message);
            Clients.Caller.sendMessage(message);
        }

        public void GetUserMessages(int userIdFrom, int userIdTo)
        {
            //var user = _users.FirstOrDefault(u => u.ConnectionId == Context.ConnectionId);
            var list = _messages.Where(m => (m.UserIdFrom == userIdFrom && m.UserIdTo == userIdTo) || (m.UserIdFrom == userIdTo && m.UserIdTo == userIdFrom)).ToList();
            Clients.Caller.getUserMessages(list);
        }
    }
}