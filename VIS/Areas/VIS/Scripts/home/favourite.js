; (function (VIS, $) {

    function favMgr() {

        var favDivList;
        var favContainer;
        var ul, atab;
        var _homeFavCount;

        var mgr = {
            init: init,
            addFavourite: addFavouriteMenu,
            removeFavourite: removeFavourite
        };

        return mgr;

        function init(_favDivCont) {
            favContainer = _favDivCont;
            favDivList = favContainer.find(".vis-nm-fav-favourite-lising");
            getFavouriteNode();
            atab = $('#vis_home_favourites');
            _homeFavCount = $(".vis_home-total-count");
            favContainer.on("click", function (e) {
                var $target = $(e.target);
                if ($target.data('btn') == 'remove') {
                    // e.stopPropagation()
                    removeFav($target.data("id"));
                    $target.closest(".vis-nm-fav-tile").remove();
                    setCount(favDivList.find(".vis-nm-fav-tile").length);
                    var ele = $($(".vis-subnav-links > [data-value='" + $target.data("id") + "'] [data-action='" + $target.data("action") + "']")[0]);
                    ele.attr("data-isfav", "no");
                    ele.removeClass("vis-star-full").addClass("vis-star-empty");
                }
                else {
                    var tgt = $target;
                    if (!$target.hasClass("vis-nm-fav-tile")) {
                        tgt = $target.closest(".vis-nm-fav-tile");
                    }
                    if (tgt.length > 0) {
                        VIS.viewManager.startAction(tgt.data("action"), tgt.data("id"));
                        atab.attr('style', 'display: none !important');
                    }
                    else {
                        if ($target.hasClass("vis-grid-view") && !favDivList.hasClass("vis-nm-fav-grid-view")) {
                            favDivList.addClass("vis-nm-fav-grid-view");
                            favContainer.find(".vis-grid-view").hide();
                            favContainer.find(".vis-list-view").show();
                        }
                        else {
                            if ($target.hasClass("vis-list-view")) {
                                favDivList.removeClass("vis-nm-fav-grid-view");
                                favContainer.find(".vis-grid-view").show();
                                favContainer.find(".vis-list-view").hide();
                            }
                        }
                    }
                }
            });
        };

        function getFavouriteNode() {
            $.ajax({
                url: VIS.Application.contextUrl + "Home/GetFavouriteNode",
                dataType: "json",
                error: function () {
                    alert(VIS.Msg.getMsg('ERRORGetFavouriteNode'));
                },
                success: function (data) {
                    favDivList.empty();
                    if (data.result) {
                        for (var itm = 0, j = data.result.length; itm < j; itm++) {
                            addFavourite(data.result[itm]);
                        }
                    }
                    setCount(data.result.length);
                }
            });
        };

        function addFavouriteMenu(barNode) {
            addFavourite(barNode);
            setCount(favDivList.find(".vis-nm-fav-tile").length);
        };

        function addFavourite(barNode) {
            var id = 0;
            var clsWinProPg = "fa fa-window-maximize";
            if (barNode.Action == "W") {
                id = barNode.WindowID;
            }
            else if (barNode.Action == "X") {
                id = barNode.FormID;
                clsWinProPg = "fa fa-list-alt";
            }
            else if (barNode.Action == "P" || barNode.Action == "R") {
                id = barNode.ProcessID;
                clsWinProPg = "fa fa-cog";
            }


            var favItemDiv = $('<div title="' + barNode.Name + '" data-id="' + id + '" data-action="' + barNode.Action + '" data-nodeid="' + barNode.NodeID + '" data-btn="action" class="vis-nm-fav-tile"><div class="vis-nm-fav-ico-w-txt"><span class="' + clsWinProPg + '"></span><div class="vis-nm-fav-tile-txt">' + barNode.Name + '</div></div><span class="vis vis-star-empty" title="' + VIS.Msg.getMsg('RemoveFav') +'" data-action="' + barNode.Action + '" data-id=' + barNode.NodeID + '  data-btn="remove"></span></div>');

            favDivList.append(favItemDiv);
        };

        function removeFavourite(nodeID) {
            var arr = favDivList.find('.vis-nm-fav-tile');
            var current = null;
            for (var itm = 0, len = arr.length; itm < len; itm++) {
                current = $(arr[itm]);
                if (current.data('nodeid') === nodeID) {
                    current.remove();
                }
            }
            arr = current = null;
            setCount(favDivList.find(".vis-nm-fav-tile").length);
        };

        function removeFav(nodeID) {
            VIS.FavouriteHelper.removeFavourite(nodeID);
            $.ajax({
                url: VIS.Application.contextUrl + "Home/RemoveNodeFavourite/?nodeID=" + nodeID,
                dataType: "json"
            });
        };

        function setCount(count) {
            atab.find(".vis-nm-fav-FavouriteCount").text(VIS.Msg.getMsg('Favourites') + " (" + count + ")");
            _homeFavCount.text(count);
        };
    };

    VIS.favMgr = favMgr();
}(VIS, jQuery));