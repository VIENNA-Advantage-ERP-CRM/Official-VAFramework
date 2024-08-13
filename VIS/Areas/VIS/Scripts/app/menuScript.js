(function (VIS) {
    var t = 0;
    var HorizontalNav = function (selector) {
        this.nav = window.document.querySelector(selector);
        this.options = {
            items: { attribute: "data-page" },
            submenu: {
                selector: ".vis-nav-horizontal-scroll-onhover-items",
                show: "vis-nav-show"
            },
            page: { nav: "nav-active", show: "page-active" }
        };
        this.init();
        return this;
    };

    HorizontalNav.prototype = {
        active: undefined,
        mouseLeaveEvent: undefined,
        init: function () {
            let self = this;
            this.mouseLeaveEvent = self.mouseLeave.bind(self);
            if ("ontouchstart" in window) {
                this.nav.addEventListener("touchstart", self.hoverEvent.bind(self));
            } else {
                this.nav.addEventListener("mouseover", self.hoverEvent.bind(self));
                this.nav.addEventListener("mouseleave", self.mouseLeaveEvent);
            }
            this.nav.addEventListener("click", function (evt) {
                evt.preventDefault();
                evt.stopPropagation();
                let item = self.item(evt.target);
                self.showPage(item);
            });
        },
        item: function (target) {
            let self = this;
            if (self.options.items.attribute) {
                if (target) {
                    while (

                        target.getAttribute(self.options.items.attribute) == undefined ||
                        target == self.nav

                    )
                        target = target.parentNode;
                }
            }
            return target == self.nav ? undefined : target;
        },
        hideSubNavs: function () {
            let self = this;
            (
                this.nav.querySelectorAll("." + self.options.submenu.show) || []
            ).forEach(function (n) {
                n.classList.remove(self.options.submenu.show);
            });
        },
        showSubNav: function (item) {
            let self = this;
            //console.dir(item);
            let submenu = item.querySelector(self.options.submenu.selector);
            if (submenu) {
                submenu.classList.add(self.options.submenu.show);
                submenu.style.top = item.scrollHeight + 10 + "px";

                if (item.getBoundingClientRect().left < (window.innerWidth / 2)) {
                    submenu.style.left = item.offsetLeft - item.parentNode.scrollLeft - 270 + "px";
                }
                else {
                    submenu.style.left = item.offsetLeft - item.parentNode.scrollLeft - 620 + "px";
                }
                //if (item.dataset.page >= 5) {
                //    submenu.style.left =
                //        item.offsetLeft - item.parentNode.scrollLeft - 620 + "px";
                //}
                //else if (item.dataset.page >= 3) {
                //    submenu.style.left =
                //        item.offsetLeft - item.parentNode.scrollLeft - 400 + "px";
                //}
                //else {
                //    submenu.style.left =
                //        item.offsetLeft - item.parentNode.scrollLeft - 250 + "px";
                //}
                submenu.removeEventListener("mouseleave", self.mouseLeaveEvent);
                submenu.addEventListener("mouseleave", self.mouseLeaveEvent);
            }
        },
        hoverEvent: function (evt) {
            let self = this;
            let item = self.item(evt.target);
            if (self.active) {
                if (self.active == item) return;
                else if (self.active.contains(item)) return;
                else self.hideSubNavs();
            }
            self.active = item;
            self.showSubNav(item);
        },
        mouseLeave: function (evt) {
            let self = this;
            if (self.active)
                self.active
                    .querySelector(self.options.submenu.selector)
                    .classList.remove(self.options.submenu.show);
            self.active = undefined;
        },
        showPage: function (item) {
            let self = this;
            let page = item.getAttribute(self.options.items.attribute);
            (
                document.querySelectorAll("." + self.options.page.show) || []
            ).forEach((n) => n.classList.remove(self.options.page.show));
            (
                document.querySelectorAll("." + self.options.page.nav) || []
            ).forEach((n) => n.classList.remove(self.options.page.nav));
            if (document)
                //document.querySelector("#" + page).classList.add(self.options.page.show);
                document.querySelector("[data-page='" + page + "']").classList.add(self.options.page.show);
            if (self.active) self.active.classList.add(self.options.page.nav);
            if (item != self.active) item.classList.add(self.options.page.nav);
            //self.hideSubNavs();
        }
    };

    new HorizontalNav("nav");

})(VIS);