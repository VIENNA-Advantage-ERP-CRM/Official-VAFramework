; (function (VIS, $) {
    //****************************************************//
    //**             userSession                            **//
    //****************************************************//

    function UserSession() {
        var shown = false;
        var main = $("<div class='vis-chatOverlay'></div>");
        $("body").append(main);
        var ul = null;
        main.append(ul);
        var btn = null;
        var txt = null;

        function init() {
            main.append($('<ul class="list-unstyled m-0">'
                + '</ul><div class="d-flex vis-chatBoxInputWrap"><textarea></textarea>' +
                '<button><i class="fa fa-paper-plane"></i></button></div>'));
            ul = main.find('ul');
            btn = main.find("button");
            txt = main.find("textarea");
            btn.on('click', onBtnClick);
        };
        init();

        function onBtnClick(e) {
            var d = { sessionid: VIS.context.getContext('#AD_Session_ID'),   txt: txt.val() };
            VIS.dataContext.postJSONData(VIS.Application.contextUrl + "Message/PushMessage", d, function (data) {
                txt.val('');
            });
        };
       
        function addItem(key,obj) {
                       // ul.append("<li key='" + key + "'>" + obj.Name + "</li>");
            ul.append('<li key="' + key + '"><div class="vis-app-user-img-wrap">' +
                '<i class="fa fa-user"></i>' +
                '<img src="" alt="profile image">' +
                '</div><p>' + obj.Name + '</p><span class="vis-chatLoginStatus"></span> </li>');
        }

        function removeItem(key) {
            ul.find("li[key='" + key + "']").remove();
        }

        function fetch() {
            VIS.dataContext.getJSONData(VIS.Application.contextUrl + "Message/GetSessionList", null, function (data) {
                if (data !== null) {
                    for (var obj in data) {
                        addItem(obj,data[obj]);
                    }
                }
            });
        };

        function show() {
            if (!shown) {
                ul.empty();
                main.css("visibility", "visible");
                fetch();
                shown = true;
            }
            else {
                main.css("visibility", "hidden");
                shown = false;
            }
        };

        function onmessage(item) {
            if (item.Event === "LOGIN") {
                //toastr.success(item.Message, '', { timeOut: 4000, "positionClass": "toast-top-center", "closeButton": true, });
                data = JSON.parse(item.Message);
                    addItem(data.Key, data);
            }
            else if (item.Event === "LOGOFF") {
                //toastr.success(item.Message, '', { timeOut: 4000, "positionClass": "toast-top-center", "closeButton": true, });
                data = JSON.parse(item.Message);
                    removeItem(data.Key);
            }
        }

        return {
            show: show,
            onmessage: onmessage
        }
    };

    VIS.UserSession = UserSession();
    //Register SSE
    VIS.sseManager.register(VIS.UserSession);
})(VIS, jQuery);