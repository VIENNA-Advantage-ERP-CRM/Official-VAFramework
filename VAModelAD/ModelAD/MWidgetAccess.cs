using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using ViennaAdvantage.Model;

namespace VAdvantage.Model
{
    public class MWidgetAccess : X_AD_Widget_Access
    {
        public MWidgetAccess(Ctx ctx, DataRow rs, Trx trxName)
          : base(ctx, rs, trxName)
        {
        }

        public MWidgetAccess(Ctx ctx, int AD_Widget_ID, Trx trxName)
           : base(ctx, AD_Widget_ID, trxName)
        {

        }

        /// <summary>
        ///Parent Constructor
        /// </summary>
        /// <param name="parent">parent</param>
        /// <param name="AD_Role_ID">role id</param>
        public MWidgetAccess(MWidget parent, int AD_Role_ID)
            : base(parent.GetCtx(), 0, parent.Get_TrxName())
        {
            SetClientOrg(parent);
            SetAD_Widget_ID(parent.GetAD_Widget_ID());
            SetAD_Role_ID(AD_Role_ID);
        }
    }
}
