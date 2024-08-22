; (function (VIS, $) {
    /* Map View */

    function VMapView(lstCols) {

        var map = null;
        var root = $('<div class="vis-mv-main">');
        var mapDiv = "";
        var busyDiv = "";
        var markers = [];
        var mapProp;
        var bounds = null;
        var cmbLoc = null;
        var cmbDiv = null;
        var geocoder = null;
        var searchText = $('<Input id="pac-input" class="controls" type="text" placeholder="Search Box"/>');
        var self = this;
        this.locationID = '';

        var isMapAvail = window.google && google.maps ? true : false;
        if (isMapAvail) {
            geocoder = new google.maps.Geocoder();
        }



        function addMarker(location, msg, lid, colName) {
            var marker = new google.maps.Marker({
                position: location,
                animation: google.maps.Animation.DROP,
                map: map,
                title: msg,
                draggable: true,

            });
            marker.info = new google.maps.InfoWindow({
                content: msg
            });

            marker.lid = lid;
            marker.ColName = colName;

            marker.info.open(map, marker);//(map, this);  

            google.maps.event.addListener(marker, 'click', function (point) {
                //this = marker  
                this.info.open(map, this);//(map, this);  
            });

            //google.maps.event.addListener(marker, 'dragend', function (e) {

            //    geocoder.geocode({
            //        latLng: marker.getPosition()
            //    }, function (responses) {
            //        if (responses && responses.length > 0) {
            //            // updateMarkerAddress(responses[0].formatted_address);
            //            console.log(responses[0].formatted_address);
            //            var address = getAddressObject(responses[0].address_components);
            //            console.log(address);
            //            updateLocationInDB(address, marker.lid, marker.ColName);
            //        }
            //    });
            //});

            markers.push(marker);






        };

        /**
         * Not Used for now
         * @param {any} address
         * @param {any} lid
         * @param {any} colName
         */
        function updateLocationInDB(address, lid, colName) {
            //this.mapFields[0].getValue()
            //var that = this;
            $.ajax({
                url: VIS.Application.contextUrl + "Location/UpdateLocation",
                data: { Address: address, C_Location_ID: lid },
                success: function (result) {
                    var field = jQuery.grep(self.mapFields, function (item, i) {
                        if (item.getColumnName() == colName)
                            return item;
                    });

                    if (field) {
                        field[0].lookup.refreshLocation(lid);
                        self.gc.refreshUI();
                    }
                },
                error: function (e) {
                    console.log(e)
                }
            });
        }

    /**
    * Not Used for now
    * @param {any} address
    * @param {any} lid
    * @param {any} colName
    */
        function getAddressObject(address_components) {
            var ShouldBeComponent = {
                home: ["premise", "street_number"],
                postal_code: ["postal_code"],
                street: ["street_address", "route", "political"],
                region: [
                    "administrative_area_level_1",
                    //"administrative_area_level_2",
                    //"administrative_area_level_3",
                    //"administrative_area_level_4",
                    //"administrative_area_level_5"
                ],
                city: [
                    "locality",
                    "sublocality",
                    "sublocality_level_1",
                    "sublocality_level_2",
                    "sublocality_level_3",
                    "sublocality_level_4"
                ],
                country: ["country"]
            };

            var address = {
                home: "",
                postal_code: "",
                street: "",
                region: "",
                city: "",
                country: ""
            };
            address_components.forEach(component => {
                for (var shouldBe in ShouldBeComponent) {
                    if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
                        //if (shouldBe === "country") {
                        //    address[shouldBe] = component.short_name;
                        //} else {

                        if (address[shouldBe].length > 0) {
                            address[shouldBe] = address[shouldBe] + " , " + component.long_name;
                        }
                        else {
                            address[shouldBe] = component.long_name;
                        }
                    }
                }
            });
            return address;
        };


        function addMarkerWithTimeout(location, msg, timeout, lid, colName) {
            window.setTimeout(function () {
                addMarker(location, msg, lid, colName);
            }
                , timeout);
        };


        // Sets the map on all markers in the array.
        function setAllMap(map) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(map);
                google.maps.event.clearListeners(markers[i], 'click');
                markers[i].info = null;
            }
        };
        // Removes the markers from the map, but keeps them in the array.
        function clearMarkers() {
            setAllMap(null);
        };

        // Shows any markers currently in the array.
        function showMarkers() {
            setAllMap(map);
        };

        // Deletes all markers in the array by removing references to them.
        function deleteMarkers() {
            clearMarkers();
            markers = [];
        };

        function removeMap() {
            deleteMarkers();
            //mapDiv.remove();
            map = null;
        };

        this.renderMap = function () {
            if (!map) {

                if (this.mapp)
                    map = this.mapp;
                map = new google.maps.Map(mapDiv[0], mapProp);

                // Create the search box and link it to the UI element.
                // const input = document.getElementById("pac-input");

                //map.controls[google.maps.ControlPosition.TOP_LEFT].push(searchText);
                //// Bias the SearchBox results towards current map's viewport.

                //const searchBox = new google.maps.places.SearchBox(searchText);

                //map.addListener("bounds_changed", () => {
                //    searchBox.setBounds(map.getBounds());
                //});


                //const searchBox = new google.maps.places.SearchBox(searchText);

                //map.controls[google.maps.ControlPosition.TOP_RIGHT].push(searchText);
                //// Bias the SearchBox results towards current map's viewport.
                //map.addListener("bounds_changed", () => {
                //    searchBox.setBounds(map.getBounds());
                //});


                //searchBox.addListener("places_changed", () => {
                //    const places = searchBox.getPlaces();

                //    if (places.length == 0) {
                //        return;
                //    }

                //    // Clear out the old markers.
                //    markers.forEach((marker) => {
                //        marker.setMap(null);
                //    });
                //    markers = [];

                //    // For each place, get the icon, name and location.
                //    const bounds = new google.maps.LatLngBounds();

                //    places.forEach((place) => {
                //        if (!place.geometry || !place.geometry.location) {
                //            console.log("Returned place contains no geometry");
                //            return;
                //        }

                //        const icon = {
                //            url: place.icon,
                //            size: new google.maps.Size(71, 71),
                //            origin: new google.maps.Point(0, 0),
                //            anchor: new google.maps.Point(17, 34),
                //            scaledSize: new google.maps.Size(25, 25),
                //        };

                //        // Create a marker for each place.
                //        markers.push(
                //            new google.maps.Marker({
                //                map,
                //                icon,
                //                title: place.name,
                //                position: place.geometry.location,
                //            })
                //        );
                //        if (place.geometry.viewport) {
                //            // Only geocodes have viewport.
                //            bounds.union(place.geometry.viewport);
                //        } else {
                //            bounds.extend(place.geometry.location);
                //        }
                //    });
                //    map.fitBounds(bounds);
                //});

                fillCombo();


            }
        };

        function fillCombo() {
            var html = '';
            var f = self.mapFields;
            if (f.length > 1) {
                html += '<option data-index="-1" value="-1"> </option>';
                for (var i = 0; i < f.length; i++) {
                    html += '<option data-index=' + i + ' value=' + f[i].getColumnName() + ' >' + f[i].getHeader() + '</option>';
                }
                cmbLoc.html(html);
                cmbLoc[0].selectedIndex = 0;
                bindEvent();
            }
            else {
                cmbDiv.hide();
                mapDiv.css('top', '0');
            }
        };

        function initialize() {

            mapDiv = $('<div id="map" class="vis-mv-map">');
            busyDiv = $('<div class="vis-apanel-busy vis-full-height">').hide();
            cmbDiv = $('<div class="vis-mv-header"> <select class="vis-mv-select vis-pull-right" /> </div>');
            cmbLoc = cmbDiv.find(".vis-mv-select");
            root.append(cmbDiv).append(searchText).append(mapDiv).append(busyDiv);
            if (isMapAvail) {
                mapProp = {
                    center: new google.maps.LatLng(26, 76),
                    zoom: 4,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
            }
        };

        initialize();

        function bindEvent() {
            cmbLoc.on("change", function (e) {
                self.setBusy(true);
                //self.curIndex = this.selectedIndex;
                self.curIndex = $(e.target).find('option:selected').data('index');

                //If no address field selected in map view , then sow all locations, otherwise selected field's location
                if (self.curIndex == -1)
                    self.setMapData(self.mapcols);
                else
                    self.setMapData(self.mapcols[self.curIndex]);
            });
        };

        this.ResetCombo = function () {
            cmbLoc.val(-1);
            this.curIndex = -1;
        }


        this.setBusy = function (busy) {
            if (busy)
                busyDiv.show();
            else
                busyDiv.hide();
        };

        this.getRoot = function () {
            return root;
        };

        this.sizeChanged = function (h, w) {

        };

        this.setMapData = function (LatLng) {
            if (!isMapAvail)
                return;

            this.renderMap();
            deleteMarkers();
            bounds = null;
            bounds = new google.maps.LatLngBounds();


            google.maps.event.trigger(map, 'resize');
            // window.setTimeout(function () {
            // var len = lstLatLng.length;


            if (self.curIndex == -1) {// Show all address of selected records
                var len = Object.keys(LatLng).length;
                var keys = Object.keys(LatLng);
                for (var i = 0; i < len; i++) {
                    var lstLatLng = LatLng[keys[i]];

                    if (!lstLatLng || lstLatLng.length == 0)
                        continue;

                    for (var j = 0; j < lstLatLng.length; j++) {
                        try {
                            if ((self.locationID && self.locationID == lstLatLng[j].lid) || !self.locationID)
                                self.setLatLong(lstLatLng[j].Latitude, lstLatLng[j].Longitude, lstLatLng[j].msg, lstLatLng[j].lid, lstLatLng[j].ColName);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
            else { //Show current field's location in map
                if (LatLng.length > 0)
                    for (var i = 0; i < LatLng.length; i++) {
                        self.setLatLong(LatLng[i].Latitude, LatLng[i].Longitude, LatLng[i].msg, LatLng[i].lid, LatLng[i].ColName);
                    }
            }
            map.fitBounds(bounds);
            self.setBusy(false);
            //}, 10);
        };

        this.setLatLong = function (Latitude, Longitude, msg, lid, colName) {
            if (!Latitude || !Longitude)
                return;

            var ll = null;

            ll = new google.maps.LatLng(Number(Latitude), Number(Longitude));
            addMarkerWithTimeout(ll, msg, 1 * 100, lid, colName);

            bounds.extend(ll);
            map.fitBounds(bounds);
        };

        this.dc = function () {
            removeMap();
            root.remove();

            this.cols = this.gc = this.aPanel = this.mapcols = null;
            this.mapFields = null;
            this.curIndex = -1;

            this.getRoot = null;
            this.dc = null;
        };

    };

    VMapView.prototype.setupMapView = function (aPanel, GC, mTab, mapContainer, vMapId) {

        this.mapFields = [];


        var cols = mTab.getMapColumns();

        for (var i = 0; i < cols.length; i++) {
            var f = mTab.getField(cols[i]);
            if (f)
                this.mapFields.push(f);
        }
        this.cols = cols;

        this.gc = GC;
        this.aPanel = aPanel;
        this.mapcols = {};
        this.curIndex = -1;

        mapContainer.append(this.getRoot());
    };

    VMapView.prototype.refreshUI = function (width, locID) {

        this.locationID = locID;
        var records = this.gc.getSelectedRows();
        var len = records.length;
        if (records.length < 1 || this.cols.length < 1)
            return;
        var mapcols = [[]];

        for (var i = 0; i < this.cols.length; i++) {
            var colName = this.cols[i];
            var l = this.mapFields[i].getLookup();
            if (this.locationID && this.locationID != this.mapFields[i].getValue())
                continue;

            var locIds = [];
            for (var j = 0; j < len; j++) {
                var lid = records[j][colName.toLowerCase()];
                if (lid) {
                    var ll = l.getLatLng(lid);
                    if (ll) {
                        ll.msg = l.getDisplay(lid);
                        ll.lid = lid;
                        ll.ColName = colName;
                        locIds.push(ll);
                    }
                }
            }
            this.mapcols[i] = locIds;
        }

        this.ResetCombo();

        if (this.curIndex == -1)
            this.setMapData(this.mapcols);
        else
            this.setMapData(this.mapcols[this.curIndex]);


    };

    VMapView.prototype.dispose = function () {
        this.dc();
    };

    //VMapView.prototype.CreateMap = function () {
    //  // this.map = new google.maps.Map(mapDiv[0], mapProp);

    //};


    VIS.VMapView = VMapView;
    // window.initMAPAutocomplete = VIS.VMapView.prototype.CreateMap();

}(VIS, jQuery));