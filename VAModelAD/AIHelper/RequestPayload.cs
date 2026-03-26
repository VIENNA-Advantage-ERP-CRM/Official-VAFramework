using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VAModelAD.Classes;

namespace VAModelAD.AIHelper
{
    public class RequestPayload
    {
        private static RequestPayload _obj = null;
        private static string _endPoints = "";

        private RequestPayload()
        {
            //Get And setEndPoints Here
            //_endPoints = "https://aiapi.viennaadvantage.com/";
        }

        public void SetEndPoints(string endPoints)
        {
            _endPoints = endPoints;
        }

        public static  RequestPayload Get()
        {
            if(_obj ==null)
            _obj = new RequestPayload();
            return _obj;
        }

        /// <summary>
        /// Set Defaultparameterin outgoing request
        /// </summary>
        /// <param name="data"></param>
        public void SetDefaultParameters(dynamic data)
        {
            data.token = TokenManager.GenerateToken();
            data.endPoints = _endPoints;
        }
    }
}
