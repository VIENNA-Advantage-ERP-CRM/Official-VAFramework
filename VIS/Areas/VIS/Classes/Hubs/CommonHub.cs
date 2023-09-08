using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace VIS.Classes.Hubs
{
	public class UserDetail
	{
		public string ConnectionId { get; set; }
		public int UserID { get; set; }
		public string UserName { get; set; }		
	}
	public class CommonHub : Hub
    {
		public static List<UserDetail> ConnectedUsers = new List<UserDetail>();

		public void Connect(string UserName, int UserID)
		{
			var id = Context.ConnectionId;
			if (ConnectedUsers.Count(x => x.ConnectionId == id) == 0)
			{
				string logintime = DateTime.Now.ToString();
				ConnectedUsers.Add(new UserDetail { ConnectionId = id, UserName = UserName, UserID = UserID });

				// send to caller
				Clients.Caller.onConnected(id, UserName, ConnectedUsers, UserID);

				// send to all except caller client
				Clients.AllExcept(id).onNewUserConnected(id, UserName, UserID);

				//Groups.Add(Context.ConnectionId, "Desig" + designationID);
			}
		}

		public override Task OnDisconnected(bool stopCalled)
		{
			var item = ConnectedUsers.FirstOrDefault(x => x.ConnectionId == Context.ConnectionId);
			if (item != null)
			{
				ConnectedUsers.Remove(item);
				var id = Context.ConnectionId;
				Clients.All.onUserDisconnected(id, item.UserName, item.UserID);
			}
			return base.OnDisconnected(stopCalled);
		}

		public void SendMessage(string name, string message)
		{
			Clients.All.broadcastMessage(name, message);
		}
		public void SendIndividual(string name, string message, string connId)
		{
			Clients.Client(connId).broadcastMessage(name, message);
		}
	}
}