﻿/********************************************************
 * Module Name    : VIS
 * Purpose        : Assign roles to user and windows, forms, processes to Roles
 * Chronological Development
 * Karan          3-June-2015
 ******************************************************/


using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using VAdvantage.Model;
using VAdvantage.Utility;
using VAdvantage.WF;
using VIS.DBase;

namespace VIS.Models
{
    public class Group
    {
        private Ctx ctx = null;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="ctx"></param>
        public Group(Ctx ctx)
        {
            this.ctx = ctx;
        }

        /// <summary>
        /// Get All Users of current client and org
        /// </summary>
        /// <param name="searchText"></param>
        /// <param name="sortBy"></param>
        /// <param name="pageNo"></param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        public List<UserInfo> GetUserInfo(string searchText, int sortBy, int pageNo, int pageSize)
        {
            List<UserInfo> uInfo = new List<UserInfo>();
            int UserTableID = MTable.Get_Table_ID("AD_User");
            int UserWindowID = Convert.ToInt32(DB.ExecuteScalar("SELECT AD_Window_ID from AD_Window WHERE Name='User'", null, null));

            if (!(bool)MRole.GetDefault(ctx).GetWindowAccess(UserWindowID))
            {
                return uInfo;
            }

            if (!MRole.GetDefault(ctx).IsTableAccess(UserTableID, false))
            {
                return uInfo;
            }


            string sql = @"SELECT AD_User.Name,
                                      AD_User.Email,
                                      AD_User.AD_User_ID,
                                      AD_User.IsActive,
                                      AD_User.AD_Image_ID,
                                        AD_User.AD_Client_ID,
                                        AD_User.AD_Org_ID,
                                      C_Country.Name as CName
                                    FROM AD_User
                                    LEFT OUTER JOIN C_LOcation
                                    ON AD_User.C_Location_ID=C_Location.C_Location_ID
                                    LEFT OUTER JOIN C_Country
                                    ON C_Country.C_Country_ID=C_Location.C_Country_ID WHERE IsLoginUser='Y' ";
            if (!String.IsNullOrEmpty(searchText))
            {
                sql += " AND ( upper(AD_User.Value) like Upper('%" + searchText + "%') OR upper(AD_User.Name) like Upper('%" + searchText + "%')  OR  upper(AD_User.Email) like Upper('%" + searchText + "%'))";
            }
            sql += " ORDER BY  AD_User.IsActive desc";

            if (sortBy == -1 || sortBy == 1)
            {
                sql += " , upper(AD_User.Name) ASC";
            }
            else if (sortBy == 2)
            {
                sql += " , upper(AD_User.Value) ASC";
            }
            else if (sortBy == 3)
            {
                sql += " , upper(AD_User.Email) ASC";
            }

            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_User", true, false);

            DataSet ds = DB.ExecuteDatasetPaging(sql, pageNo, pageSize);

            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    UserInfo userInfo = new UserInfo();

                    userInfo.HasAccess = MRole.GetDefault(ctx).IsRecordAccess(UserTableID, Convert.ToInt32(ds.Tables[0].Rows[i]["AD_User_ID"]), true);
                    userInfo.Username = Convert.ToString(ds.Tables[0].Rows[i]["Name"]);
                    userInfo.Email = Convert.ToString(ds.Tables[0].Rows[i]["Email"]);
                    userInfo.AD_UserID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_User_ID"]);
                    userInfo.AD_OrgID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Org_ID"]);
                    userInfo.AD_ClientID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Client_ID"]);
                    userInfo.Country = Convert.ToString(ds.Tables[0].Rows[i]["CName"]);
                    userInfo.UserTableID = UserTableID;
                    userInfo.UserWindowID = UserWindowID;
                    userInfo.IsActive = ds.Tables[0].Rows[i]["IsActive"].ToString() == "Y" ? true : false;

                    userInfo.IsUpdate = MRole.GetDefault(ctx).CanUpdate(userInfo.AD_ClientID, userInfo.AD_OrgID, userInfo.UserTableID, userInfo.AD_UserID, false);

                    if (ds.Tables[0].Rows[i]["AD_Image_ID"] != DBNull.Value && ds.Tables[0].Rows[i]["AD_Image_ID"] != null && Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Image_ID"]) > 0)
                    {
                        MImage mimg = new MImage(ctx, Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Image_ID"]), null);
                        var imgfll = mimg.GetThumbnailURL(46, 46);
                        userInfo.UserImage = imgfll;

                        if (userInfo.UserImage == "FileDoesn'tExist" || userInfo.UserImage == "NoRecordFound")
                        {
                            userInfo.UserImage = "";
                        }
                    }
                    else
                    {
                        userInfo.UserImage = "";
                    }
                    uInfo.Add(userInfo);
                }
            }

            return uInfo;

        }

        /// <summary>
        /// Set current user Active
        /// </summary>
        /// <param name="AD_User_ID"></param>
        /// <returns></returns>
        public int ActiveUser(int AD_User_ID)
        {
            return DB.ExecuteQuery("Update AD_User Set IsActive='Y' WHERE AD_User_ID=" + AD_User_ID, null, null);
        }

        /// <summary>
        /// Set current user inActive
        /// </summary>
        /// <param name="AD_User_ID"></param>
        /// <returns></returns>
        public int InActiveUser(int AD_User_ID)
        {
            return DB.ExecuteQuery("Update AD_User Set IsActive='N' WHERE AD_User_ID=" + AD_User_ID, null, null);
        }

        /// <summary>
        /// Get all the roles of current User. if a role is assigned then it will be shown as checked otherwise unchecked
        /// </summary>
        /// <param name="AD_User_ID"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public List<RolesInfo> GetRoleInfo(int AD_User_ID, string name)
        {
            List<RolesInfo> rInfo = new List<RolesInfo>();

            int RoleWindowID = Convert.ToInt32(DB.ExecuteScalar("SELECT AD_Window_ID from AD_Window WHERE Name='Role'", null, null));

            if (!(bool)MRole.GetDefault(ctx).GetWindowAccess(RoleWindowID))
            {
                return rInfo;
            }

            int UserTableID = MTable.Get_Table_ID("AD_User");
            bool IsUpdate = true;
            String sql = "SELECT AD_Client_ID, AD_ORg_ID from AD_User WHERE AD_User_ID=" + AD_User_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                IsUpdate = MRole.GetDefault(ctx).CanUpdate(Convert.ToInt32(ds.Tables[0].Rows[0]["AD_Client_ID"]), Convert.ToInt32(ds.Tables[0].Rows[0]["AD_Org_ID"]), UserTableID, AD_User_ID, false);
            }






            sql = @"Select AD_Role.AD_Role_ID, AD_Role.Name from AD_Role WHERE AD_Role.AD_Client_ID=" + ctx.GetAD_Client_ID() + " AND AD_Role.AD_Role_ID > 0 AND  IsActive='Y'";


            //            string sql = @"SELECT AD_Role.AD_Role_ID,
            //                          AD_Role.Name
            //                        FROM AD_Role
            //                        JOIN ad_user_roles
            //
            //                        on AD_Role.AD_role_ID=ad_user_roles.AD_Role_ID
            //                    WHERE AD_User_Roles.IsActive='Y' AND AD_Role.IsActive='Y' AND  AD_User_Roles.AD_User_ID=" + ctx.GetAD_User_ID();

            if (name != null && name.Length > 0)
            {
                sql += " AND upper(AD_Role.Name) like ('%" + name.ToUpper() + "%')";
            }

            sql += " ORDER BY upper(AD_Role.Name)";
            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_Role", true, false);
            ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {

                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    RolesInfo roleInfo = new RolesInfo();
                    roleInfo.AD_Role_ID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Role_ID"]);
                    roleInfo.Name = Convert.ToString(ds.Tables[0].Rows[i]["Name"]);
                    roleInfo.IsAssignedToUser = false;
                    roleInfo.roleWindowID = RoleWindowID;
                    roleInfo.IsUpdate = IsUpdate;
                    rInfo.Add(roleInfo);
                }


                sql = "Select AD_Role_ID, IsActive from ad_user_roles where AD_User_ID=" + AD_User_ID;
                DataSet dsURoles = DB.ExecuteDataset(sql);
                if (dsURoles != null && dsURoles.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < dsURoles.Tables[0].Rows.Count; i++)
                    {
                        RolesInfo rrinfo = rInfo.Where(a => a.AD_Role_ID == Convert.ToInt32(dsURoles.Tables[0].Rows[i]["AD_Role_ID"])).FirstOrDefault();
                        if (rrinfo != null)
                        {
                            if (dsURoles.Tables[0].Rows[i]["IsActive"].ToString().Equals("Y"))
                            {
                                rrinfo.IsAssignedToUser = true;
                            }
                            else
                            {
                                rrinfo.IsAssignedToUser = false;
                            }
                        }
                    }
                }
            }

            rInfo = rInfo.OrderBy(a => !a.IsAssignedToUser).ToList();

            return rInfo;
        }

        /// <summary>
        /// Set User's Role Active/InActive in AD_User_Roles if already exist. If not exist for current role and user then create new entry.
        /// </summary>
        /// <param name="AD_User_ID"></param>
        /// <param name="roles"></param>
        public void UpdateUserRoles(int AD_User_ID, List<RolesInfo> roles)
        {
            string sql = "SELECT isActive, AD_Role_ID FROM AD_User_Roles WHERE AD_User_ID= " + AD_User_ID;
            DataSet ds = DB.ExecuteDataset(sql);

            StringBuilder setActive = new StringBuilder();
            StringBuilder setInActive = new StringBuilder();

            for (int i = 0; i < roles.Count; i++)
            {
                if (roles[i].IsAssignedToUser)
                {
                    if (ds != null && ds.Tables[0].Rows.Count > 0)
                    {
                        DataRow[] dr = ds.Tables[0].Select("AD_Role_ID=" + roles[i].AD_Role_ID);
                        if (dr != null && dr.Length > 0)
                        {
                            if (setActive.Length > 0)
                            {
                                setActive.Append(" OR ");
                            }
                            setActive.Append("(AD_Role_ID=" + roles[i].AD_Role_ID + " AND AD_User_ID=" + AD_User_ID + ")");
                        }
                        else
                        {
                            CreateNewUserRole(roles[i].AD_Role_ID, AD_User_ID);
                        }
                    }
                    else
                    {
                        CreateNewUserRole(roles[i].AD_Role_ID, AD_User_ID);
                    }
                }
                else
                {
                    DataRow[] dr = ds.Tables[0].Select("AD_Role_ID=" + roles[i].AD_Role_ID);
                    if (dr != null && dr.Length > 0)
                    {
                        if (setInActive.Length > 0)
                        {
                            setInActive.Append(" OR ");
                        }
                        setInActive.Append("(AD_Role_ID=" + roles[i].AD_Role_ID + " AND AD_User_ID=" + AD_User_ID + ")");
                    }
                }

            }

            if (setActive.Length > 0)
            {
                DB.ExecuteQuery("Update AD_User_Roles Set IsActive='Y' WHERE " + setActive.ToString(), null, null);
            }
            if (setInActive.Length > 0)
            {
                DB.ExecuteQuery("Update AD_User_Roles Set IsActive='N' WHERE " + setInActive.ToString(), null, null);
            }


        }

        /// <summary>
        /// Assign New Role to Current User.
        /// </summary>
        /// <param name="AD_Role_ID"></param>
        /// <param name="AD_User_ID"></param>
        private void CreateNewUserRole(int AD_Role_ID, int AD_User_ID)
        {
            MUserRoles role = new MUserRoles(ctx, 0, null);
            role.SetAD_Org_ID(ctx.GetAD_Org_ID());
            role.SetAD_Client_ID(ctx.GetAD_Client_ID());
            role.SetAD_User_ID(AD_User_ID);
            role.SetAD_Role_ID(AD_Role_ID);
            role.Save();
        }

        /// <summary>
        /// Get All the groups of current client. If a group is assigned to current role then it will be checked otherwise unchecked.
        /// </summary>
        /// <param name="AD_Role_ID"></param>
        /// <param name="name"></param>
        /// <returns></returns>
        public List<GroupInfo> GetGroupInfo(int AD_Role_ID, string name)
        {
            List<GroupInfo> gInfo = new List<GroupInfo>();
            int groupWindowID = Convert.ToInt32(DB.ExecuteScalar("SELECT AD_Window_ID from AD_Window WHERE Name='Group Rights'", null, null));

            if (MRole.GetDefault(ctx).GetWindowAccess(groupWindowID) == null || !(bool)MRole.GetDefault(ctx).GetWindowAccess(groupWindowID))
            {
                return gInfo;
            }

            string sql = @"SELECT Name, AD_GroupInfo_ID FROM AD_GroupInfo WHERE IsActive='Y'";

            if (!string.IsNullOrEmpty(name))
            {
                sql += " AND upper(Name) like ('%" + name.ToUpper() + "%')";
            }

            sql += " ORDER BY upper(name) ";
            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_GroupInfo", true, false);

            DataSet ds = DB.ExecuteDataset(sql);        // get All Groups.
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    GroupInfo roleInfo = new GroupInfo();
                    roleInfo.AD_Group_ID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_GroupInfo_ID"]);
                    roleInfo.Name = Convert.ToString(ds.Tables[0].Rows[i]["Name"]);
                    roleInfo.IsAssignedToUser = false;
                    roleInfo.GroupWindowID = groupWindowID;
                    gInfo.Add(roleInfo);
                }
            }

            sql = "select ad_role_group.AD_GroupInfo_ID,ad_role_group.IsActive from ad_role_group join AD_GroupInfo on ad_role_group.AD_GroupInfo_ID=AD_GroupInfo.AD_GroupInfo_ID WHERE  ad_role_group.AD_Role_ID=" + AD_Role_ID;
            if (!string.IsNullOrEmpty(name))
            {
                sql += " AND upper(AD_GroupInfo.Name) like ('%" + name.ToUpper() + "%')";
            }

            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_GroupInfo", true, false);

            DataSet dsURoles = DB.ExecuteDataset(sql);                  // Get All groups that are assigned to current Role...
            if (dsURoles != null && dsURoles.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < dsURoles.Tables[0].Rows.Count; i++)
                {
                    GroupInfo ginofs = gInfo.Where(a => a.AD_Group_ID == Convert.ToInt32(dsURoles.Tables[0].Rows[i]["AD_GroupInfo_ID"])).FirstOrDefault();

                    if (ginofs != null)
                    {
                        if (dsURoles.Tables[0].Rows[i]["IsActive"].ToString().Equals("Y"))      // if a group is assigned to current role, then show it as checked
                        {
                            ginofs.IsAssignedToUser = true;
                        }
                        else
                        {
                            ginofs.IsAssignedToUser = false;
                        }
                    }
                }
            }

            gInfo = gInfo.OrderBy(a => !a.IsAssignedToUser).ToList();       // Show assigned Users on the Top.

            return gInfo;
        }

        /// <summary>
        /// Assign/UnAssign group to roles.
        /// </summary>
        /// <param name="AD_Role_ID"></param>
        /// <param name="groups"></param>
        public void UpdateUserGroup(int AD_Role_ID, List<GroupInfo> groups)
        {
            string sql = " select isActive,ad_groupinfo_id from ad_role_group where AD_Role_ID =" + AD_Role_ID;
            DataSet ds = DB.ExecuteDataset(sql);

            StringBuilder setActive = new StringBuilder();
            StringBuilder setInActive = new StringBuilder();

            for (int i = 0; i < groups.Count; i++)
            {
                bool newGroupCreated = false;
                if (groups[i].IsAssignedToUser)
                {
                    if (ds != null && ds.Tables[0].Rows.Count > 0)      // if current group is assigned to role 
                    {
                        DataRow[] dr = ds.Tables[0].Select("AD_GroupInfo_ID=" + groups[i].AD_Group_ID);
                        if (dr != null && dr.Length > 0)            // check if assigned group was inActive AD_Role_Group then Active it.
                        {
                            if (setActive.Length > 0)
                            {
                                setActive.Append(" OR ");
                            }
                            setActive.Append("(AD_GroupInfo_ID=" + groups[i].AD_Group_ID + " AND AD_Role_ID=" + AD_Role_ID + ")");
                        }
                        else
                        {
                            CreateNewUserGroup(AD_Role_ID, groups[i].AD_Group_ID);  // else create new role group
                            newGroupCreated = true;
                        }
                    }
                    else
                    {
                        CreateNewUserGroup(AD_Role_ID, groups[i].AD_Group_ID);  // else create new role group
                        newGroupCreated = true;
                    }
                }
                else// if current is group is unchecked..
                {
                    DataRow[] dr = ds.Tables[0].Select("AD_GroupInfo_ID=" + groups[i].AD_Group_ID);
                    if (dr != null && dr.Length > 0)        // if group is already assigned and now marked unchecked, then delete it from AD_Role_Group
                    {
                        if (setInActive.Length > 0)
                        {
                            setInActive.Append(" OR ");
                        }
                        setInActive.Append("(AD_GroupInfo_ID=" + groups[i].AD_Group_ID + " AND AD_Role_ID=" + AD_Role_ID + ")");
                    }
                }

                DataRow[] drr = ds.Tables[0].Select("AD_GroupInfo_ID=" + groups[i].AD_Group_ID);
                if ((drr != null && drr.Length > 0) || newGroupCreated)     // update group's window/ form/process/workflow    OR      window Create new entry in window/ form/process/workflow
                {
                    ProvideWindowAccessToRole(groups[i].AD_Group_ID, AD_Role_ID, groups[i].IsAssignedToUser);
                    ProvideFormAccessToRole(groups[i].AD_Group_ID, AD_Role_ID, groups[i].IsAssignedToUser);
                    ProvideProcessAccessToRole(groups[i].AD_Group_ID, AD_Role_ID, groups[i].IsAssignedToUser);
                    ProvideWidgetAccessToRole(groups[i].AD_Group_ID, AD_Role_ID, groups[i].IsAssignedToUser);
                    ProvideWorkflowAccessToRole(groups[i].AD_Group_ID, AD_Role_ID, groups[i].IsAssignedToUser);
                }

            }

            if (setActive.Length > 0)
            {
                DB.ExecuteQuery("Update AD_Role_Group Set IsActive='Y' WHERE " + setActive.ToString(), null, null);
            }
            if (setInActive.Length > 0)
            {
                //DB.ExecuteQuery("Update AD_Role_Group Set IsActive='N' WHERE " + setInActive.ToString(), null, null);
                DB.ExecuteQuery("DELETE FROM AD_Role_Group WHERE " + setInActive.ToString(), null, null);
            }
            //}


        }

        /// <summary>
        /// Assign Role to group
        /// </summary>
        /// <param name="AD_Role_ID"></param>
        /// <param name="AD_Group_ID"></param>
        private void CreateNewUserGroup(int AD_Role_ID, int AD_Group_ID)
        {
            X_AD_Role_Group role = new X_AD_Role_Group(ctx, 0, null);
            role.SetAD_Org_ID(ctx.GetAD_Org_ID());
            role.SetAD_Client_ID(ctx.GetAD_Client_ID());
            role.SetAD_Role_ID(AD_Role_ID);
            role.SetAD_GroupInfo_ID(AD_Group_ID);
            role.Save();
        }

        /// <summary>
        /// Assign/UnAssign windows from group to role
        /// </summary>
        /// <param name="AD_Group_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="grantAccess"></param>
        private void ProvideWindowAccessToRole(int AD_Group_ID, int AD_Role_ID, bool grantAccess)
        {
            //Added new checkbox Read write on Group Rights Window Tab to save access on group window. 
            string sql = "SELECT AD_Window_ID, IsReadWrite, IsActive FROM AD_Group_Window WHERE IsActive='Y' AND AD_GroupInfo_ID=" + AD_Group_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            List<int> groupWindowIDs = new List<int>();     // will contains all windows of group
            Dictionary<int, bool> roleWindowIDsDictinary = new Dictionary<int, bool>();     // this will contain all windows access for current role...
            Dictionary<int, WindowRole> groupWindowIDsDictinary = new Dictionary<int, WindowRole>();  // this will contain all windows access for current group...
            string readwrite = "N", active = "N";
            StringBuilder winIDs = new StringBuilder();
            WindowRole _winRole = null;
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ds.Tables[0].Rows[i]["AD_Window_ID"] != null && ds.Tables[0].Rows[i]["AD_Window_ID"] != DBNull.Value)
                    {
                        if (winIDs.Length > 0)
                        {
                            winIDs.Append(",");
                        }
                        winIDs.Append(ds.Tables[0].Rows[i]["AD_Window_ID"].ToString());
                        groupWindowIDs.Add(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"]));
                        _winRole = new WindowRole();
                        _winRole.IsActive = ds.Tables[0].Rows[i]["IsActive"].ToString() == "Y" ? true : false;
                        _winRole.IsReadWrite = ds.Tables[0].Rows[i]["IsReadWrite"].ToString() == "Y" ? true : false;
                        groupWindowIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"])] = _winRole;
                    }
                }

                groupWindowIDs.Sort();

                // get windowsID from WIndow Access for current role and windows in group 
                sql = "SELECT AD_Window_ID,IsReadWrite FROM AD_Window_Access WHERE AD_Role_ID=" + AD_Role_ID + " AND AD_Window_ID IN(" + winIDs.ToString() + ")";
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        roleWindowIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"])] = ds.Tables[0].Rows[i]["IsReadWrite"].ToString() == "Y" ? true : false;
                    }
                }

                for (int i = 0; i < groupWindowIDs.Count(); i++)
                {
                    //Check Group window access need to update the access on Role window.
                    _winRole = groupWindowIDsDictinary[groupWindowIDs[i]];
                    if (_winRole.IsReadWrite)
                        readwrite = "Y";
                    else readwrite = "N";
                    if (_winRole.IsActive)
                        active = "Y";
                    else active = "N";
                    if (roleWindowIDsDictinary.ContainsKey(groupWindowIDs[i]))      // if Role window access already have current window then set window active/ inactive in window access.
                    {
                        //if (roleWindowIDsDictinary[groupWindowIDs[i]] != grantAccess)
                        //{
                        //wAccess.SetIsReadWrite(grantAccess);
                        //bool savenew = wAccess.Save();                           
                        if (grantAccess)
                        {
                            //update read write access from the groups right window 
                            sql = "UPDATE AD_Window_Access Set IsReadWrite='" + readwrite + "',IsActive='" + active + "' WHERE AD_Window_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                        }
                        else
                        {
                            sql = "UPDATE AD_Window_Access Set IsReadWrite='N',IsActive='N' WHERE AD_Window_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                        }
                        DB.ExecuteQuery(sql, null, null);
                        //}
                    }
                    else                // Else create new entry....
                    {
                        MWindow wind = new MWindow(ctx, groupWindowIDs[i], null);
                        MWindowAccess wAccess = new MWindowAccess(wind, AD_Role_ID);
                        wAccess.SetAD_Client_ID(ctx.GetAD_Client_ID());
                        wAccess.SetAD_Org_ID(ctx.GetAD_Org_ID());
                        wAccess.SetAD_Role_ID(AD_Role_ID);
                        wAccess.SetAD_Window_ID(groupWindowIDs[i]);
                        wAccess.SetIsActive(_winRole.IsActive);
                        wAccess.SetIsReadWrite(_winRole.IsReadWrite); //update read write access from the groups right window 
                        bool savenew = wAccess.Save();
                    }
                }
            }
        }

        /// <summary>
        /// Assign/UnAssign Forms from group to role
        /// </summary>
        /// <param name="AD_Group_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="grantAccess"></param>
        private void ProvideFormAccessToRole(int AD_Group_ID, int AD_Role_ID, bool grantAccess)
        {
            string sql = "SELECT AD_Form_ID from AD_Group_Form WHERE IsActive='Y' AND AD_GroupInfo_ID=" + AD_Group_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            List<int> groupWindowIDs = new List<int>();
            Dictionary<int, bool> roleWindowIDsDictinary = new Dictionary<int, bool>();
            StringBuilder winIDs = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ds.Tables[0].Rows[i]["AD_Form_ID"] != null && ds.Tables[0].Rows[i]["AD_Form_ID"] != DBNull.Value)
                    {
                        if (winIDs.Length > 0)
                        {
                            winIDs.Append(",");
                        }
                        winIDs.Append(ds.Tables[0].Rows[i]["AD_Form_ID"].ToString());
                        groupWindowIDs.Add(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Form_ID"]));
                    }
                }

                groupWindowIDs.Sort();

                sql = "SELECT AD_Form_ID,IsReadWrite FROM AD_Form_Access WHERE AD_Role_ID=" + AD_Role_ID + " AND AD_Form_ID IN(" + winIDs.ToString() + ")";
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        roleWindowIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Form_ID"])] = ds.Tables[0].Rows[i]["IsReadWrite"].ToString() == "Y" ? true : false;
                    }
                }

                for (int i = 0; i < groupWindowIDs.Count(); i++)
                {
                    MForm wind = new MForm(ctx, groupWindowIDs[i], null);
                    MFormAccess wAccess = new MFormAccess(wind, AD_Role_ID);
                    if (roleWindowIDsDictinary.ContainsKey(groupWindowIDs[i]))
                    {
                        if (roleWindowIDsDictinary[groupWindowIDs[i]] != grantAccess)
                        {
                            //wAccess.SetIsReadWrite(grantAccess);
                            //wAccess.Save();
                            if (grantAccess)
                            {
                                sql = "UPDATE AD_Form_Access Set IsReadWrite='Y',IsActive='Y' WHERE AD_Form_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            else
                            {
                                sql = "UPDATE AD_Form_Access Set IsReadWrite='N',IsActive='N' WHERE AD_Form_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            DB.ExecuteQuery(sql, null, null);
                        }
                    }
                    else
                    {

                        wAccess.SetAD_Client_ID(ctx.GetAD_Client_ID());
                        wAccess.SetAD_Org_ID(ctx.GetAD_Org_ID());
                        wAccess.SetAD_Role_ID(AD_Role_ID);
                        wAccess.SetAD_Form_ID(groupWindowIDs[i]);
                        wAccess.SetIsReadWrite(grantAccess);
                        wAccess.Save();
                    }
                }
            }
        }

        /// <summary>
        /// Assign/UnAssign process from group to role
        /// </summary>
        /// <param name="AD_Group_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="grantAccess"></param>
        private void ProvideProcessAccessToRole(int AD_Group_ID, int AD_Role_ID, bool grantAccess)
        {
            string sql = "SELECT AD_Process_ID from AD_Group_Process WHERE IsActive='Y' AND AD_GroupInfo_ID=" + AD_Group_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            List<int> groupWindowIDs = new List<int>();
            Dictionary<int, bool> roleWindowIDsDictinary = new Dictionary<int, bool>();
            StringBuilder winIDs = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ds.Tables[0].Rows[i]["AD_Process_ID"] != null && ds.Tables[0].Rows[i]["AD_Process_ID"] != DBNull.Value)
                    {
                        if (winIDs.Length > 0)
                        {
                            winIDs.Append(",");
                        }
                        winIDs.Append(ds.Tables[0].Rows[i]["AD_Process_ID"].ToString());
                        groupWindowIDs.Add(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Process_ID"]));
                    }
                }

                groupWindowIDs.Sort();

                sql = "SELECT AD_Process_ID,IsReadWrite FROM AD_Process_Access WHERE AD_Role_ID=" + AD_Role_ID + " AND AD_Process_ID IN(" + winIDs.ToString() + ")";
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        roleWindowIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Process_ID"])] = ds.Tables[0].Rows[i]["IsReadWrite"].ToString() == "Y" ? true : false;
                    }
                }

                for (int i = 0; i < groupWindowIDs.Count(); i++)
                {
                    MProcess wind = new MProcess(ctx, groupWindowIDs[i], null);
                    MProcessAccess wAccess = new MProcessAccess(wind, AD_Role_ID);
                    if (roleWindowIDsDictinary.ContainsKey(groupWindowIDs[i]))
                    {
                        if (roleWindowIDsDictinary[groupWindowIDs[i]] != grantAccess)
                        {
                            //wAccess.SetIsReadWrite(grantAccess);
                            //wAccess.Save();
                            if (grantAccess)
                            {
                                sql = "UPDATE AD_Process_Access Set IsReadWrite='Y',IsActive='Y' WHERE AD_Process_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            else
                            {
                                sql = "UPDATE AD_Process_Access Set IsReadWrite='N',IsActive='N' WHERE AD_Process_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            DB.ExecuteQuery(sql, null, null);
                        }
                    }
                    else
                    {

                        wAccess.SetAD_Client_ID(ctx.GetAD_Client_ID());
                        wAccess.SetAD_Org_ID(ctx.GetAD_Org_ID());
                        wAccess.SetAD_Role_ID(AD_Role_ID);
                        wAccess.SetAD_Process_ID(groupWindowIDs[i]);
                        wAccess.SetIsReadWrite(grantAccess);
                        wAccess.Save();
                    }
                }
            }
        }

        /// <summary>
        /// Assign/UnAssign widget from group to role
        /// </summary>
        /// <param name="AD_Group_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="grantAccess"></param>
        private void ProvideWidgetAccessToRole(int AD_Group_ID, int AD_Role_ID, bool grantAccess)
        {
            string sql = "SELECT AD_Widget_ID from AD_Group_Widget WHERE IsActive='Y' AND AD_GroupInfo_ID=" + AD_Group_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            List<int> groupWidgetIDs = new List<int>();
            Dictionary<int, bool> roleWidgetIDsDictinary = new Dictionary<int, bool>();
            StringBuilder widIDs = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ds.Tables[0].Rows[i]["AD_Widget_ID"] != null && ds.Tables[0].Rows[i]["AD_Widget_ID"] != DBNull.Value)
                    {
                        if (widIDs.Length > 0)
                        {
                            widIDs.Append(",");
                        }
                        widIDs.Append(ds.Tables[0].Rows[i]["AD_Widget_ID"].ToString());
                        groupWidgetIDs.Add(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Widget_ID"]));
                    }
                }

                groupWidgetIDs.Sort();

                sql = "SELECT AD_Widget_ID,IsActive FROM AD_Widget_Access WHERE AD_Role_ID=" + AD_Role_ID + " AND AD_Widget_ID IN(" + widIDs.ToString() + ")";
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        roleWidgetIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Widget_ID"])] = ds.Tables[0].Rows[i]["IsActive"].ToString() == "Y" ? true : false;
                    }
                }

                for (int i = 0; i < groupWidgetIDs.Count(); i++)
                {
                    MWidget wind = new MWidget(ctx, groupWidgetIDs[i], null);
                    MWidgetAccess wAccess = new MWidgetAccess(wind, AD_Role_ID);
                    if (roleWidgetIDsDictinary.ContainsKey(groupWidgetIDs[i]))
                    {
                        if (roleWidgetIDsDictinary[groupWidgetIDs[i]] != grantAccess)
                        {
                            //wAccess.SetIsReadWrite(grantAccess);
                            //wAccess.Save();
                            if (grantAccess)
                            {
                                sql = "UPDATE AD_Widget_Access Set IsActive='Y' WHERE AD_Widget_ID=" + groupWidgetIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            else
                            {
                                sql = "UPDATE AD_Widget_Access Set IsActive='N' WHERE AD_Widget_ID=" + groupWidgetIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            DB.ExecuteQuery(sql, null, null);
                        }
                    }
                    else
                    {

                        wAccess.SetAD_Client_ID(ctx.GetAD_Client_ID());
                        wAccess.SetAD_Org_ID(ctx.GetAD_Org_ID());
                        wAccess.SetAD_Role_ID(AD_Role_ID);
                        wAccess.SetAD_Widget_ID(groupWidgetIDs[i]);
                        wAccess.SetIsActive(grantAccess);
                        wAccess.Save();
                    }
                }
            }
        }

        /// <summary>
        /// Assign/UnAssign workflow from group to role
        /// </summary>
        /// <param name="AD_Group_ID"></param>
        /// <param name="AD_Role_ID"></param>
        /// <param name="grantAccess"></param>
        private void ProvideWorkflowAccessToRole(int AD_Group_ID, int AD_Role_ID, bool grantAccess)
        {
            string sql = "SELECT AD_Workflow_ID from AD_Group_Workflow WHERE IsActive='Y' AND AD_GroupInfo_ID=" + AD_Group_ID;
            DataSet ds = DB.ExecuteDataset(sql);
            List<int> groupWindowIDs = new List<int>();
            Dictionary<int, bool> roleWindowIDsDictinary = new Dictionary<int, bool>();
            StringBuilder winIDs = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ds.Tables[0].Rows[i]["AD_Workflow_ID"] != null && ds.Tables[0].Rows[i]["AD_Workflow_ID"] != DBNull.Value)
                    {
                        if (winIDs.Length > 0)
                        {
                            winIDs.Append(",");
                        }
                        winIDs.Append(ds.Tables[0].Rows[i]["AD_Workflow_ID"].ToString());
                        groupWindowIDs.Add(Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Workflow_ID"]));
                    }
                }

                groupWindowIDs.Sort();

                sql = "SELECT AD_Workflow_ID,IsReadWrite FROM AD_workflow_Access WHERE AD_Role_ID=" + AD_Role_ID + " AND AD_Workflow_ID IN(" + winIDs.ToString() + ")";
                ds = DB.ExecuteDataset(sql);
                if (ds != null && ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        roleWindowIDsDictinary[Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Workflow_ID"])] = ds.Tables[0].Rows[i]["IsReadWrite"].ToString() == "Y" ? true : false;
                    }
                }

                for (int i = 0; i < groupWindowIDs.Count(); i++)
                {
                    MWorkflow wind = new MWorkflow(ctx, groupWindowIDs[i], null);
                    MWorkflowAccess wAccess = new MWorkflowAccess(wind, AD_Role_ID);
                    if (roleWindowIDsDictinary.ContainsKey(groupWindowIDs[i]))
                    {
                        if (roleWindowIDsDictinary[groupWindowIDs[i]] != grantAccess)
                        {
                            //wAccess.SetIsReadWrite(grantAccess);
                            //wAccess.Save();
                            if (grantAccess)
                            {
                                sql = "UPDATE AD_Workflow_Access Set IsReadWrite='Y',IsActive='Y' WHERE AD_Workflow_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            else
                            {
                                sql = "UPDATE AD_Workflow_Access Set IsReadWrite='N',IsActive='N' WHERE AD_Workflow_ID=" + groupWindowIDs[i] + " AND AD_Role_ID=" + AD_Role_ID;
                            }
                            DB.ExecuteQuery(sql, null, null);
                        }
                    }
                    else
                    {

                        wAccess.SetAD_Client_ID(ctx.GetAD_Client_ID());
                        wAccess.SetAD_Org_ID(ctx.GetAD_Org_ID());
                        wAccess.SetAD_Role_ID(AD_Role_ID);
                        wAccess.SetAD_Workflow_ID(groupWindowIDs[i]);
                        wAccess.SetIsReadWrite(grantAccess);
                        wAccess.Save();
                    }
                }
            }
        }

        /// <summary>
        /// Gets Name and ID of windows('User','Role', 'Group Rights')
        /// </summary>
        /// <returns></returns>
        public WindowID GetWindowIds()
        {
            WindowID wID = new WindowID();

            DataSet ds = DB.ExecuteDataset("SELECT name,AD_Window_ID from AD_Window where Name  In ( 'User','Role', 'Group Rights')");
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if ("User".Equals(ds.Tables[0].Rows[i]["Name"].ToString()))
                    {
                        wID.UserWindowID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"]);
                    }
                    else if ("Role".Equals(ds.Tables[0].Rows[i]["Name"].ToString()))
                    {
                        wID.RoleWindowID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"]);
                    }
                    if ("Group Rights".Equals(ds.Tables[0].Rows[i]["Name"].ToString()))
                    {
                        wID.GroupWindowID = Convert.ToInt32(ds.Tables[0].Rows[i]["AD_Window_ID"]);
                    }
                }
            }
            return wID;
        }

        /// <summary>
        /// Get Information of group like windows, forms, processes,Widgets, workflows it contained.
        /// </summary>
        /// <param name="groupID"></param>
        /// <returns></returns>
        public GroupChildInfo GetGroupInfo(int groupID)
        {
            GroupChildInfo gInfo = new GroupChildInfo();

            string sql = "SELECT Name, Description from AD_GroupInfo WHERE AD_GroupInfo_ID=" + groupID;
            sql = MRole.GetDefault(ctx).AddAccessSQL(sql, "AD_GroupInfo", true, false);

            DataSet ds = DB.ExecuteDataset(sql);
            if (ds == null || ds.Tables[0].Rows.Count == 0)
            {
                return gInfo;
            }
            if (ds.Tables[0].Rows[0]["Name"] != null)
            {
                gInfo.GroupName = ds.Tables[0].Rows[0]["Name"].ToString();
            }
            if (ds.Tables[0].Rows[0]["Description"] != null)
            {
                gInfo.Description = ds.Tables[0].Rows[0]["Description"].ToString();
            }


            sql = @"SELECT AD_WIndow.Name,AD_WIndow.AD_Window_ID FROM AD_Group_Window  JOIN AD_WIndow
                         ON AD_Group_Window.AD_Window_ID=AD_Window.AD_Window_ID
                         WHERE AD_Group_Window.IsActive='Y' AND AD_Group_Window.AD_GroupInfo_ID=" + groupID + " ORDER BY AD_WIndow.Name";

            ds = DB.ExecuteDataset(sql);

            StringBuilder windows = new StringBuilder();
            StringBuilder windowID = new StringBuilder();

            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (windows.Length > 0)
                    {
                        windows.Append(",  ");
                        windowID.Append(",  ");
                    }
                    windows.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    windowID.Append(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Window_ID"]));
                }
            }
            gInfo.WindowName = windows.ToString();

            sql = @"SELECT AD_Form.Name,AD_Form.AD_Form_ID FROM AD_Group_Form JOIN AD_Form
                     ON AD_Group_Form.AD_Form_ID=AD_Form.AD_Form_ID
                     WHERE AD_Group_Form.IsActive='Y' AND  AD_Group_Form.AD_GroupInfo_ID=" + groupID + " ORDER BY AD_Form.Name";



            ds = DB.ExecuteDataset(sql);

            StringBuilder forms = new StringBuilder();
            StringBuilder formID = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (forms.Length > 0)
                    {
                        forms.Append(",  ");
                        formID.Append(",  ");
                    }
                    forms.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    formID.Append(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Form_ID"]));
                }
            }

            gInfo.FormName = forms.ToString();

            sql = @"SELECT AD_Process.Name,AD_Process.AD_Process_ID FROM AD_Group_Process  JOIN AD_Process
                     ON AD_Group_Process.AD_Process_ID=AD_Process.AD_Process_ID
                     WHERE AD_Group_Process.IsActive='Y' AND AD_Group_Process.AD_GroupInfo_ID=" + groupID + " ORDER BY AD_Process.Name";

            ds = DB.ExecuteDataset(sql);

            StringBuilder processes = new StringBuilder();
            StringBuilder processID = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (processes.Length > 0)
                    {
                        processes.Append(",  ");
                        processID.Append(",  ");
                    }
                    processes.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    processID.Append(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Process_ID"]));
                }
            }
            gInfo.ProcessName = processes.ToString();

            sql = @"SELECT AD_Widget.Name,AD_Widget.AD_Widget_ID FROM AD_Group_Widget JOIN AD_Widget
                     ON AD_Group_Widget.AD_Widget_ID=AD_Widget.AD_Widget_ID
                     WHERE AD_Group_Widget.IsActive='Y' AND AD_Group_Widget.AD_GroupInfo_ID=" + groupID + " ORDER BY AD_Widget.Name";

            ds = DB.ExecuteDataset(sql);

            StringBuilder widgets = new StringBuilder();
            StringBuilder widgetID = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (widgets.Length > 0)
                    {
                        widgets.Append(",  ");
                        widgetID.Append(",  ");
                    }
                    widgets.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    widgetID.Append(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_Widget_ID"]));
                }
            }
            gInfo.WidgetName = widgets.ToString();


            sql = @"SELECT AD_workflow.Name,AD_workflow.AD_workflow_ID FROM AD_Group_workflow  JOIN AD_workflow
                     ON AD_Group_workflow.AD_workflow_ID=AD_workflow.AD_workflow_ID
                     WHERE AD_Group_workflow.IsActive='Y' AND AD_Group_workflow.AD_GroupInfo_ID=" + groupID + " ORDER BY AD_workflow.Name";

            ds = DB.ExecuteDataset(sql);

            StringBuilder workflows = new StringBuilder();
            StringBuilder workflowsID = new StringBuilder();
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (workflows.Length > 0)
                    {
                        workflows.Append(",  ");
                        workflowsID.Append(",  ");
                    }
                    workflows.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    workflowsID.Append(Util.GetValueOfInt(ds.Tables[0].Rows[i]["AD_workflow_ID"]));
                }
            }
            gInfo.WorkflowName = workflows.ToString();

            //Getting the processes, forms and workflows which is available but not displaying on window.

            if (windowID.Length > 0)
            {
                sql = $@"SELECT DISTINCT PR.Name FROM AD_Process PR
                      INNER JOIN AD_Column CM ON (CM.AD_Process_ID=PR.AD_Process_ID)
                      INNER JOIN AD_Table TB ON (CM.AD_Table_ID = TB.AD_Table_ID)
                      INNER JOIN AD_Tab TL ON (TB.AD_Table_ID = TL.AD_Table_ID)
                      INNER JOIN AD_Window WD ON (TL.AD_Window_ID = WD.AD_Window_ID)
                      WHERE WD.AD_Window_ID IN ({ windowID }) AND CM.IsActive='Y'";

                if (processID.Length > 0)
                {
                    sql += " AND CM.AD_Process_ID NOT IN (" + processID + ")";
                }

                sql += $@" UNION
                            SELECT DISTINCT PR.Name FROM AD_Process PR
                               INNER JOIN AD_WF_Node ND ON (PR.AD_Process_ID = ND.AD_Process_ID)
                               INNER JOIN AD_Workflow WF ON (ND.AD_Workflow_ID = WF.AD_Workflow_ID)
                               INNER JOIN AD_Table TL ON (TL.AD_Table_ID = WF.AD_Table_ID)
                               INNER JOIN AD_Tab TB ON (TB.AD_Table_ID = TL.AD_Table_ID)
                               INNER JOIN AD_Window WD ON (TL.AD_Window_ID = WD.AD_Window_ID)
                               WHERE WF.AD_Workflow_ID > 0 AND ND.IsActive ='Y'
                               AND WD.AD_Window_ID IN ({ windowID })";
                if (processID.Length > 0)
                {
                    sql += " AND PR.AD_Process_ID NOT IN (" + processID + ")";
                }

                ds = DB.ExecuteDataset(sql);

                StringBuilder processNotBind = new StringBuilder();
                if (ds == null || ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (processNotBind.Length > 0)
                        {
                            processNotBind.Append(",  ");
                        }
                        processNotBind.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    }
                }
                gInfo.processNotBinded = processNotBind.ToString();

                sql = $@"SELECT DISTINCT FM.Name FROM AD_Form FM
                      INNER JOIN AD_Column CM ON(CM.AD_Form_ID = FM.AD_Form_ID)
                      INNER JOIN AD_Table TB ON(CM.AD_Table_ID = TB.AD_Table_ID)
                      INNER JOIN AD_Tab TL ON(TB.AD_Table_ID = TL.AD_Table_ID)
                      INNER JOIN AD_Window WD ON(TL.AD_Window_ID = WD.AD_Window_ID)
                      WHERE WD.AD_Window_ID IN ({ windowID }) AND CM.IsActive='Y'";
                if (formID.Length > 0)
                {
                    sql += " AND CM.AD_Form_ID NOT IN (" + formID + ")";
                }

                ds = DB.ExecuteDataset(sql);

                StringBuilder fromNotBind = new StringBuilder();
                if (ds == null || ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (fromNotBind.Length > 0)
                        {
                            fromNotBind.Append(",  ");
                        }
                        fromNotBind.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    }
                }
                gInfo.formNotBinded = fromNotBind.ToString();

                string[] parts = windowID.ToString().Split(',');
                for (int i = 0; i < parts.Length; i++)
                {
                    parts[i] = parts[i].Trim();
                }

                string strWinID = string.Join("|", parts);

                sql = $@"SELECT DISTINCT WG.Name FROM AD_Widget WG
                       LEFT JOIN AD_Window WD ON (CAST(WD.AD_Window_ID AS NVARCHAR2(1000)) = WG.AD_Window_ID) 
                      WHERE REGEXP_LIKE(WG.AD_Window_ID, '(^|,)({strWinID})(,|$)') AND WG.IsActive='Y'";

                if (VAdvantage.DataBase.DB.IsPostgreSQL())
                {
                    sql = $@"SELECT DISTINCT WG.Name FROM AD_Widget WG 
                          LEFT JOIN AD_Window WD ON (CAST(WD.AD_Window_ID AS TEXT) = WG.AD_Window_ID)
                           WHERE WG.AD_Window_ID ~ '(^|,)({strWinID})(,|$)'AND WG.IsActive = 'Y'";
                }
                    if (widgetID.Length > 0)
                {
                    sql += " AND WG.AD_Widget_ID NOT IN (" + widgetID + ")";
                }

                ds = DB.ExecuteDataset(sql);

                StringBuilder widgetNotBind = new StringBuilder();
                if (ds == null || ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (widgetNotBind.Length > 0)
                        {
                            widgetNotBind.Append(",  ");
                        }
                        widgetNotBind.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    }
                }
                gInfo.WidgetNotBinded = widgetNotBind.ToString();


                sql = $@"SELECT DISTINCT WF.Name FROM AD_Workflow WF
                      INNER JOIN AD_Table TL ON (TL.AD_Table_ID = WF.AD_Table_ID)
                      INNER JOIN AD_Tab TB ON (TB.AD_Table_ID = TL.AD_Table_ID)
                      INNER JOIN AD_Window WD ON (TL.AD_Window_ID = WD.AD_Window_ID)
                      WHERE WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'
                      AND WD.AD_Window_ID IN ({ windowID })";
                if (workflowsID.Length > 0)
                {
                    sql += " AND WF.AD_Workflow_ID NOT IN (" + workflowsID + ")";
                }

                sql += $@" UNION
                            SELECT DISTINCT WF.Name FROM AD_Workflow WF
                               INNER JOIN AD_Process PR ON(PR.AD_Workflow_ID = WF.AD_Workflow_ID)
                               INNER JOIN AD_Column CM ON(CM.AD_Process_ID = PR.AD_Process_ID)
                               INNER JOIN AD_Table TL ON (TL.AD_Table_ID = WF.AD_Table_ID)
                               INNER JOIN AD_Tab TB ON (TB.AD_Table_ID = TL.AD_Table_ID)
                               INNER JOIN AD_Window WD ON (TL.AD_Window_ID = WD.AD_Window_ID)
                               WHERE WF.AD_Workflow_ID > 0 AND WD.IsActive ='Y'
                               AND WD.AD_Window_ID IN ({ windowID })";
                if (workflowsID.Length > 0)
                {
                    sql += " AND WF.AD_Workflow_ID NOT IN (" + workflowsID + ")";
                }

                ds = DB.ExecuteDataset(sql);

                StringBuilder workflowNotBind = new StringBuilder();
                if (ds == null || ds.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                    {
                        if (workflowNotBind.Length > 0)
                        {
                            workflowNotBind.Append(",  ");
                        }
                        workflowNotBind.Append(ds.Tables[0].Rows[i]["Name"].ToString());
                    }
                }
                gInfo.workflowNotBinded = workflowNotBind.ToString();

            }

            return gInfo;

        }

        /// <summary>
        /// Create New Role
        /// </summary>
        /// <param name="Name"></param>
        /// <param name="userLevel"></param>
        /// <param name="OrgID"></param>
        /// <returns></returns>
        public String AddNewRole(string Name, string userLevel, List<int> OrgID)
        {

            string info = "";
            string msg;
            int AD_Role_Table_ID = Convert.ToInt32(DB.ExecuteScalar("SELECT AD_Table_ID FROM AD_Table WHERE TableName='AD_Role'", null, null));

            try
            {
                string sql = @"SELECT AD_Column_ID,ColumnName,
                                  defaultvalue
                                FROM AD_Column
                                WHERE AD_Table_ID =" + AD_Role_Table_ID + @"
                                AND isActive      ='Y'
                                AND defaultvalue IS NOT NULL";

                DataSet ds = DB.ExecuteDataset(sql);                    // Get Default Values
                if (ds == null || ds.Tables[0].Rows.Count == 0)
                {
                    return VAdvantage.Utility.Msg.GetMsg(ctx, "DefaultValueNotFound");
                }

                MRole role = new MRole(ctx, 0, null);

                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)           // Setting Default Values 
                {
                    string value = ds.Tables[0].Rows[i]["DefaultValue"].ToString();

                    if (value.StartsWith("@"))
                    {
                        value = value.Substring(0, value.Length - 1);
                        string columnName = value.Substring(value.IndexOf("@") + 1);
                        value = ctx.GetContext(columnName);	// get global context
                    }
                    role.Set_Value(ds.Tables[0].Rows[i]["ColumnName"].ToString(), value);
                }
                role.SetIsManual(true);
                role.SetName(Name);
                role.SetUserLevel(userLevel);
                if (role.Save())
                {
                    if (OrgID != null)
                    {
                        for (int i = 0; i < OrgID.Count; i++)           // Assigning org access to role
                        {
                            MOrg org = new MOrg(ctx, OrgID[i], null);
                            MRoleOrgAccess roles = new MRoleOrgAccess(org, role.GetAD_Role_ID());
                            roles.SetAD_Client_ID(ctx.GetAD_Client_ID());
                            roles.SetAD_Org_ID(OrgID[i]);
                            roles.SetIsReadOnly(false);
                            roles.Save();
                        }

                    }

                }
                else
                {
                    ValueNamePair ppE = VAdvantage.Logging.VLogger.RetrieveError();

                    if (ppE != null)
                    {
                        msg = ppE.GetValue();
                        info = ppE.GetName();
                    }
                }



                return info;
            }
            catch (Exception ex)
            {

                return ex.Message;
            }


            //rr.Set_Value(




        }

        /// <summary>
        /// Get User levels to assign to role.
        /// </summary>
        /// <returns></returns>
        public List<KeyVal> GetUserLevel()
        {
            List<KeyVal> keyval = new List<KeyVal>();

            string sql = @"SELECT AD_Ref_List.value,
                                      AD_Ref_List.Name
                                    FROM AD_Ref_List
                                    JOIN ad_reference
                                    ON ad_reference.ad_reference_id = ad_ref_list.ad_reference_id
                                    WHERE ad_reference.Name         ='AD_Role User Level'
                                    ORDER BY AD_Ref_List_ID";
            DataSet ds = DB.ExecuteDataset(sql);
            if (ds != null && ds.Tables[0].Rows.Count > 0)
            {
                for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                {
                    if (ctx.GetAD_Client_ID() > 0 && ds.Tables[0].Rows[i]["value"].ToString() == "S  ")
                    {
                        continue;
                    }
                    KeyVal ke = new KeyVal()
                    {
                        ID = ds.Tables[0].Rows[i]["value"].ToString(),
                        Name = ds.Tables[0].Rows[i]["Name"].ToString()
                    };
                    keyval.Add(ke);
                }
            }
            return keyval;
        }


    }

    public class UserData
    {
        public List<UserInfo> UserInfo { get; set; }

    }

    public class UserInfo
    {
        public string Username { get; set; }
        public int AD_UserID { get; set; }
        public int AD_OrgID { get; set; }
        public int AD_ClientID { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public bool IsActive { get; set; }
        public bool IsUpdate { get; set; }
        public string UserImage { get; set; }
        public int UserTableID { get; set; }
        public int UserWindowID { get; set; }
        public bool HasAccess { get; set; }
    }

    public class RolesInfo
    {
        public int AD_Role_ID { get; set; }
        public string Name { get; set; }
        public bool IsAssignedToUser { get; set; }
        public int roleWindowID { get; set; }
        public bool IsUpdate { get; set; }

        /*  These will be used for Gmail Contacts Settings */
        public int UserID { get; set; }
        public string Password { get; set; }
        public string ConnectionProfile { get; set; }
        /*      */
    }

    public class GroupInfo
    {
        public int AD_Group_ID { get; set; }
        public string Name { get; set; }
        public bool IsAssignedToUser { get; set; }
        public int GroupWindowID { get; set; }
    }

    public class WindowID
    {
        public int UserWindowID { get; set; }
        public int RoleWindowID { get; set; }
        public int GroupWindowID { get; set; }
    }

    public class GroupChildInfo
    {
        public string GroupName { get; set; }
        public string Description { get; set; }
        public string WindowName { get; set; }
        public string FormName { get; set; }
        public string ProcessName { get; set; }
        public string WidgetName { get; set; }
        public string WorkflowName { get; set; }
        public string processNotBinded { get; set; }
        public string formNotBinded { get; set; }
        public string WidgetNotBinded { get; set; }
        public string workflowNotBinded { get; set; }
    }

    public class KeyVal
    {
        public string Name { get; set; }
        public string ID { get; set; }
    }

    public class WindowRole
    {
        public bool IsActive { get; set; }
        public bool IsReadWrite { get; set; }
    }

}