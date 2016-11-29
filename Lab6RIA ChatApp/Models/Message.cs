using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Lab6RIA_ChatApp.Models
{
    public class Message
    {
        public int UserIdFrom { get; set; }
        public int UserIdTo { get; set; }
        public string Text { get; set; }
        public string Time { get; set; }
    }
}