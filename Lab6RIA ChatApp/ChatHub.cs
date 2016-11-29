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
        
        public void JoinRoom(int id, string name)
        {
            _users.Add(new User { Id = id, Name = name });
            Groups.Add(Context.ConnectionId, id.ToString());
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

        public void SendMessage(int userId, string message)
        {
            Clients.Group(userId.ToString()).addChatMessage(message);
        }

        public void SendMessageToAll(string name, string message)
        {
            Clients.All.broadcastMessage(name, message);

            //comment
        }
    }
}