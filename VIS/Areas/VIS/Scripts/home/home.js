; (function (VIS, $) {
    "use strict";
    function HomeMgr() {
        var $home = null;
        var htmlArray = [
            {
                seqno: 10,
                html: '<div>Column 1</div>',
                row: 1,
                col: 2
            },
            {
                seqno: 15,
                html: '<div>Column 1.5</div>',
                row: 5,
                col: 2
            },
            {
                seqno: 20,
                html: '<div>Column 2</div>',
                row: 2,
                col: 1
            },
            {
                seqno: 30,
                html: '<div>Column 3</div>',
                row: 1,
                col: 3
            }
            ,
            {
                seqno: 40,
                html: '<div>Column 3</div>',
                row: 2,
                col: 2
            }
            ,
            {
                seqno: 50,
                html: '<div>Column 3</div>',
                row: 1,
                col: 1
            }
        ];
       
        htmlArray.sort((a, b) => a.seqno - b.seqno);
        function initHome(home) {
            $home = home;
            $home.empty();
            var $container = $('<div class="vis-widget-container">');            

            htmlArray.forEach(function (obj) {
                var $item = $(obj.html);
                $item.text(obj.seqno);
                $item.addClass("vis-widget-item");

                var hue = Math.floor(Math.random() * (360 - 0)) + 0;
                var v = Math.floor(Math.random() * (75 - 60 + 1)) + 60; //Math.floor(Math.random() * 16) + 75;
                var pastel = 'hsl(' + hue + ', 100%,' + v + '%)';    
               
                $item.css({
                    gridRow: "span " + obj.row,
                    gridColumn: "span " + obj.col,
                    backgroundColor: pastel
                });

                $container.append($item);
            });
            $home.append($container)
        }



        return {
            initHome: initHome
        }
    }
    VIS.HomeMgr = HomeMgr();
})(VIS, jQuery);