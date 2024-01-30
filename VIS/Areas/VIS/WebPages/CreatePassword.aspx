<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="CreatePassword.aspx.cs" Inherits="VIS.Areas.VIS.WebPages.CreatePassword" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <title></title>
    <link type="text/css" rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" />
    <link href="../Content/css/font-awesome.min.css" rel="stylesheet" />
    <link type="text/css" rel="stylesheet" href="../Content/VIS.all.min.css" />
    <meta name="description" content="ERP " />
    <meta name="author" content="Vienna" />
    <meta http-equiv="cache-control" content="max-age=0" />
    <meta http-equiv="cache-control" content="no-cache" />
    <meta http-equiv="expires" content="0" />
    <meta http-equiv="expires" content="Tue, 01 Jan 1980 1:00:00 GMT" />
    <meta http-equiv="pragma" content="no-cache" />

    <link href="~/favicon.ico" rel="shortcut icon" type="image/x-icon" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0, minimum-scale=1.0, maximum-scale=1.0" />
</head>
<body>
    <form id="form1" runat="server">
        <div class="VIS-main-container d-flex h-100">
             <div class="VIS-sidebar-wrap">
                <div class="VIS-sidebarBgImg"></div>
                <div class="VIS-sidebarInnerWrap">
                    <div class="VIS-logo-wrap">
                        <img src="../Images/V-logo.png" alt="Logo" />
                    </div>
                    <div class="VIS-SideTextWrap">                        
                    </div>
                    <%--<div class="VIS-poweredBy">
					<small>Powered By:</small>
					<img src="../Content/Images/logo.png" alt="Logo">
				</div>--%>
                </div>
                <!-- CMS02-sidebarInnerWrap -->

            </div>
            <!-- sidebar-wrap -->
            <div class="VIS-content-wrap VIS-middle-align">
                <div class="VIS-confirmation-wrap VIS-setpass-wrap">
                    <div class="VIS-confirm-text-wrap" runat="server" id="divSetPassword">
                        <%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"VIS_EmailVerified") %>
                        <div >
                                  <h2 runat="server" id="lblHeader">Setup Your Password</h2>
                          </div>
                        <div class="VIS-setpass-form">
                            <div class="VIS-frm-row">
                                <div class="VIS-frm-data">
                                    <label runat="server" id="lblCreatePass">Create Password</label>
                                    <sup>*</sup>
                                    <input runat="server" id="txtCreatePass" type="password" autocomplete="new-password" />
                                </div>
                            </div>
                            <div class="VIS-frm-row">
                                <div class="VIS-frm-data">
                                    <label runat="server" id="lblConfirmPass">Confirm Password</label>
                                    <sup>*</sup>
                                    <input runat="server" id="txtConfirmPass" type="password" autocomplete="off" />
                                </div>
                            </div>

                            <div class="VIS-frm-btnwrap">
                                <asp:Button class="VIS-submit-btn" ID="btnSave" runat="server" Text="Submit" OnClientClick="return validate()" OnClick="btnSave_Click" />
                            </div>
                            <!-- frm-btnwrap -->
                        </div>
                        <!-- end of form-content -->
                    </div>
                    <div runat="server" id="passwordMsg">
                               <h4> <%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"PasswordReset") %></h4><br/>
                                 <a  href="<%=((HttpRequest)Request)["path"] %>" id="homeLink">Click Here To Login</a>      
                    </div>
                    <div class="VIS-mail-img-wrap">
                        <div class="VIS-mail-img w">
                            <img src="../Content/Images/set-pass.svg" />
                        </div>
                    </div>

                    <label runat="server" id="lblMsg"></label>
                    <!-- end of form-wrap -->
                </div>
            </div>
        </div>
    </form>
    <script>       
        function validate() {
            var txtCreatePass = document.getElementById("txtCreatePass");
            if (txtCreatePass.value.length == 0) {
                alert("<%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"VIS_CreatePassValidation") %>");
                txtCreatePass.focus();
                return false;
            } else {                
                var regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{5,}$/
                var isValidPattern = regex.test(txtCreatePass.value);
                if (!isValidPattern) {
                    alert("<%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"mustMatchCriteria") %>");                    
                    txtCreatePass.focus();
                    return false;
                }
            }          
            

            var txtConfirmPass = document.getElementById("txtConfirmPass");
            if (txtConfirmPass.value == 0) {
                alert("<%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"VIS_ConfirmPassValidation") %>");
                txtConfirmPass.focus();
                return false;
            }

            if (txtCreatePass.value != txtConfirmPass.value) {
                alert("<%= VAdvantage.Utility.Msg.GetMsg(((HttpRequest)Request)["lang"],"VIS_samePassword") %>");
                txtConfirmPass.focus();
                return false;
            }
        }
    </script>
</body>
</html>
