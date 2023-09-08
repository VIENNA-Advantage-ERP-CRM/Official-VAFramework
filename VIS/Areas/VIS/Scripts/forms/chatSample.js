
; (function (VIS, $) {
    VIS.Chats = VIS.Chats || {};
 

    //Form Class function fullnamespace
    VIS.Chats.ChatForm = function () {
        this.frame;
        this.windowNo;

        var $root
        
        var cPanel = null;
        var self = this;

        function initializeComponent() {
            $root = $("<div class='vis-height-full'>");

            var chatSection = '<fieldset> ' +
                '    <legend style="color:orangered">Welcome To signalR MVC Group Chat Club</legend>  ' +
                '</fieldset>  ' +
                '<div class="form-group col-xl-12">  ' +
                '    <label style="color: blue; font-style: oblique;font-size: medium" id="label1">Write Your Message Here!</label><br />  ' +
                '    <textarea class="form-control" rows="4" cols="40" id="message" placeholder="Share whats in your mind..."></textarea>  ' +
                '    <br /> ' +
                '    <input type="button" class="btn btn-primary" id="sendmessage" value="Send" />  ' +
                '    <br />  ' +
                '    <br /> ' +
                '    <label style="color: blue;font-style:oblique;font-size:medium" id="label2">Group Chat Conversations History</label>  ' +
                '    <div class="container chatArea"> ' +
                '        <input type="textt" id="displayname" />  ' +
                '        <ul id="discussion"></ul>  ' +
                '    </div>  ' +
                '</div>';
            $root.append(chatSection);
            //$.connection.hub.url = "http://localhost:59136/signalr";
            var chat = $.connection.commonHub;
            chat.client.broadcastMessage = function (name, message) {
                $('#discussion').append('<ul style="list-style-type:square"><li><strong style="color:red;font-style:normal;font-size:medium;text-transform:uppercase">' + htmlEncode(name) + '  ' + '<strong style="color:black;font-style:normal;font-size:medium;text-transform:lowercase">said</strong>'
                    + '</strong>: ' + '<strong style="color:blue;font-style:oblique;font-size:medium">' + htmlEncode(message) + '</strong>' + '</li></ul>');
            };

            $('#displayname').val(prompt('Your Good Name Please:', ''));
            $('#message').focus();

            $.connection.hub.start().done(function () {
                $('#sendmessage').click(function () {
                    chat.server.sendMessage($('#displayname').val(), $('#message').val());
                    $('#message').val('').focus();
                });
            });
            function htmlEncode(value) {
                var encodedValue = $('<div />').text(value).html();
                return encodedValue;
            }
        }

        initializeComponent();

        var self = this; //scoped self pointer

       
        //Privilized function
        this.getRoot = function () {
            return $root;
        };

       

        this.disposeComponent = function () {

            self = null;
            if ($root)
                $root.remove();
            $root = null;

           

            this.getRoot = null;
            this.disposeComponent = null;
        };


    };

    //Must Implement with same parameter
    VIS.Chats.ChatForm.prototype.init = function (windowNo, frame) {
        //Assign to this Varable
        this.frame = frame;
        // frame.hideHeader(true);

        this.frame.getContentGrid().append(this.getRoot());
    };

    VIS.Chats.ChatForm.prototype.sizeChanged = function (height, width) {

    };

    //Must implement dispose
    VIS.Chats.ChatForm.prototype.dispose = function () {
        /*CleanUp Code */
        //dispose this component
        this.disposeComponent();

        //call frame dispose function
        if (this.frame)
            this.frame.dispose();
        this.frame = null;
    };




})(VIS, jQuery);