﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using VAdvantage.DataBase;
using VAdvantage.Utility;
using VIS.Filters;

namespace VIS.Controllers
{
    [AjaxAuthorizeAttribute] // redirect to login page if reques`t is not Authorized
    [AjaxSessionFilterAttribute] // redirect to Login/Home page if session expire
    [AjaxValidateAntiForgeryToken] // validate antiforgery token 
    public class CalloutColumnController : Controller
    {
        // GET: VIS/CalloutTable
        public ActionResult Index()
        {
            return View();
        }

        public ContentResult GetDBColunName(int AD_Element_ID)
        {
            string sql = "SELECT ColumnName from AD_Element WHERE AD_Element_ID="+AD_Element_ID;
            return Content(DB.ExecuteScalar(sql).ToString());
        }

        // Check organisation access for user.If IsUseUserOrgAccess is true user uses User Org Access otherwise use Role Org Access.
        public int CheckOrgAccessByRole(int AD_Role_ID, int AD_User_ID)
        {
            string sql = @"SELECT CASE WHEN AD_Role.IsUseUserOrgAccess = 'Y' 
                          THEN (SELECT COUNT(AD_User_OrgAccess_ID) FROM AD_User_OrgAccess WHERE IsActive='Y' AND AD_User_ID = " + AD_User_ID + @")
                          ELSE (SELECT COUNT(AD_Role_OrgAccess_ID) FROM AD_Role_OrgAccess WHERE IsActive='Y' AND AD_Role_ID = " + AD_Role_ID + @") END AS Count 
                          FROM AD_User_Roles
                          RIGHT OUTER JOIN AD_Role ON (AD_User_Roles.AD_Role_ID = AD_Role.AD_Role_ID)
                          WHERE AD_Role.IsActive='Y' AND  AD_Role.AD_Role_ID = " + AD_Role_ID;
            return Util.GetValueOfInt(DB.ExecuteScalar(sql));
        }
    }
}