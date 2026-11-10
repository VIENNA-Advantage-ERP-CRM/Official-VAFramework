using System;
using System.Web.SessionState;

namespace VIS.Areas.VIS.Classes
{
    /// <summary>
    /// Overrides the controller's [SessionState] for a single action.
    /// Read by ActionSessionControllerFactory, so a ReadOnly controller can keep
    /// the exclusive session lock only for the actions that change the session or the session Ctx.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class ActionSessionStateAttribute : Attribute
    {
        public ActionSessionStateAttribute(SessionStateBehavior behavior)
        {
            Behavior = behavior;
        }

        public SessionStateBehavior Behavior { get; private set; }
    }
}
