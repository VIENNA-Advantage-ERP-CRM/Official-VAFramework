; (function (VIS, $) {
    function VisTrayModule() {
        // Private variables
        let visTrayBtn, visTrayPopup, toastContainer;

        // =============================
        // Helpers
        // =============================

        // Dispose form safely
        function disposeForm($toast) {
            const form = $toast.data("wform");
            if (form && typeof form.dispose === "function") {
                form.dispose();
            }
            $toast.removeData("wform").remove();
        }

        // =============================
        // Private methods
        // =============================

        // Load tray items from server
        function getSystemTray() {
            $.ajax({
                url: VIS.Application.contextUrl + "Home/GetAppTray",
                success: function (result) {
                    if (Array.isArray(result) && result.length) {
                        const html = result.map(item =>
                            item.IsImage
                                ? `<div class="vis-tray-icon" title="${item.DisplayName}" data-class="${item.ClassName}">
                                       <img src="${item.ImgPath}" />
                                   </div>`
                                : `<div class="vis-tray-icon ${item.ImgPath}" title="${item.DisplayName}" data-class="${item.ClassName}"></div>`
                        ).join("");
                        $(visTrayPopup).append(html);
                    }
                },
                error: e => console.error("Error loading tray:", e)
            });
        }

        // Toggle tray open/close
        function toggleTray() {
            visTrayPopup.classList.toggle('vis-tray-show');
        }

        // Close tray when clicking outside
        function closeTrayOnOutsideClick(e) {
            if (!visTrayPopup.contains(e.target) && !visTrayBtn.contains(e.target)) {
                visTrayPopup.classList.remove('vis-tray-show');
            }
        }

        // Handle icon click -> open form + toast
        function handleIconClick(e) {
            const icon = e.target.closest('.vis-tray-icon');
            if (!icon) return;

            const className = icon.dataset.class;
            const title = icon.getAttribute('title');

            const wform = new VIS.AForm();
            wform.openSystemTray(className, -9999);
            const $item = wform.getContentGrid();

            visTrayPopup.classList.remove('vis-tray-show');

            // Unique toast ID
            const toastId = "toast-" + Date.now();

            // Build toast HTML
            const toastHtml = `
                <div id="${toastId}" class="toast system-toast hide" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false">
                  <button type="button" class="close" data-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                  <div class='vis-divMessage'></div>
                </div>
            `;

            // Append toast
            toastContainer.insertAdjacentHTML('beforeend', toastHtml);

            const $toast = $('#' + toastId);
            $toast.find('.vis-divMessage').append($item);
            $toast.data("wform", wform);

            // Show & handle dispose
            $toast.toast('show').on('hidden.bs.toast', function () {
                disposeForm($(this));
            });

            // Handle manual close button
            $toast.find('.close').on('click', () => disposeForm($toast));
        }

        // =============================
        // Public methods (revealed)
        // =============================
        function init(trayBtnSelector, trayPopupSelector, toastContainerSelector) {
            visTrayBtn = document.querySelector(trayBtnSelector);
            visTrayPopup = document.querySelector(trayPopupSelector);
            toastContainer = document.querySelector(toastContainerSelector);

            if (!visTrayBtn || !visTrayPopup || !toastContainer) {
                console.error("VisTrayModule: Missing required elements.");
                return;
            }

            // Load tray items
            getSystemTray();

            // Bind events
            visTrayBtn.addEventListener('click', toggleTray);
            document.addEventListener('click', closeTrayOnOutsideClick);
            visTrayPopup.addEventListener('click', handleIconClick); // event delegation
        }

        // Only expose init()
        return { init };
    }

    VIS.VisTrayModule = VisTrayModule();

})(VIS, jQuery);
