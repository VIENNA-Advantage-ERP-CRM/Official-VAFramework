using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Reflection;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.SessionState;

namespace VIS.Areas.VIS.Classes
{
    /// <summary>
    /// Lets an action override its controller's session behavior with [ActionSessionState].
    /// MVC only reads [SessionState] per controller; this picks it per action, so read-only
    /// AJAX calls stop queueing behind the user's exclusive session lock without changing URLs.
    /// </summary>
    public class ActionSessionControllerFactory : DefaultControllerFactory
    {
        private static readonly ConcurrentDictionary<string, SessionStateBehavior?> s_actionBehavior =
            new ConcurrentDictionary<string, SessionStateBehavior?>(StringComparer.OrdinalIgnoreCase);

        protected override SessionStateBehavior GetControllerSessionBehavior(RequestContext requestContext, Type controllerType)
        {
            if (controllerType != null && requestContext != null)
            {
                string action = requestContext.RouteData.Values["action"] as string;
                if (!string.IsNullOrEmpty(action))
                {
                    SessionStateBehavior? behavior = s_actionBehavior.GetOrAdd(controllerType.FullName + "|" + action,
                        k => FindActionBehavior(controllerType, action));
                    if (behavior.HasValue)
                        return behavior.Value;
                }
            }
            return base.GetControllerSessionBehavior(requestContext, controllerType);
        }

        /// <summary>
        /// Behavior from [ActionSessionState] on the action's methods, or null when none is set.
        /// Overloads that disagree get the exclusive lock.
        /// </summary>
        private static SessionStateBehavior? FindActionBehavior(Type controllerType, string action)
        {
            SessionStateBehavior? result = null;
            foreach (MethodInfo m in controllerType.GetMethods(BindingFlags.Public | BindingFlags.Instance))
            {
                ActionNameAttribute alias = m.GetCustomAttributes(typeof(ActionNameAttribute), true)
                    .OfType<ActionNameAttribute>().FirstOrDefault();
                string name = alias != null ? alias.Name : m.Name;
                if (!string.Equals(name, action, StringComparison.OrdinalIgnoreCase))
                    continue;

                ActionSessionStateAttribute attr = m.GetCustomAttributes(typeof(ActionSessionStateAttribute), true)
                    .OfType<ActionSessionStateAttribute>().FirstOrDefault();
                if (attr == null)
                    continue;
                if (result.HasValue && result.Value != attr.Behavior)
                    return SessionStateBehavior.Required;
                result = attr.Behavior;
            }
            return result;
        }
    }
}
