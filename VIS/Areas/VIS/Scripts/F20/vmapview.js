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
        var searchText = $('<Input id="pac-input" class="controls" type="text" placeholder="Search Box"/>');
        var self = this;

        var isMapAvail = window.google && google.maps ? true : false;
        var geocoder = new google.maps.Geocoder();



        function addMarker(location, msg) {
            var marker = new google.maps.Marker({
                position: location,
                animation: google.maps.Animation.DROP,
                map: map,
                title: msg,
                draggable: true
            });
            marker.info = new google.maps.InfoWindow({
                content: msg
            });

            marker.info.open(map, marker);//(map, this);  

            google.maps.event.addListener(marker, 'click', function (point) {
                //this = marker  
                this.info.open(map, this);//(map, this);  
            });

            google.maps.event.addListener(marker, 'dragend', function (e) {

                geocoder.geocode({
                    latLng: marker.getPosition()
                }, function (responses) {
                    if (responses && responses.length > 0) {
                        // updateMarkerAddress(responses[0].formatted_address);
                        console.log(responses[0].formatted_address);
                        var address = getAddressObject(responses[0].address_components);
                        console.log(address);
                        updateLocationInDB(address);
                    }
                });
            });

            markers.push(marker);

            




        };


        function updateLocationInDB(address) {
            //this.mapFields[0].getValue()
            //var that = this;
            $.ajax({
                url: VIS.Application.contextUrl + "Location/UpdateLocation",
                data: { Address: address, C_Location_ID: self.mapFields[self.curIndex].getValue() },
                success: function (result) {
                    self.mapFields[self.curIndex].lookup.refreshLocation(self.mapFields[self.curIndex].value);
                    self.gc.refreshUI();
                },
                error: function (e) {
                    console.log(e)
                }
            });
        }

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


        function addMarkerWithTimeout(location, msg, timeout) {
            window.setTimeout(function () {
                addMarker(location, msg);
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

                for (var i = 0; i < f.length; i++) {
                    html += '<option value=' + f[i].getColumnName() + ' >' + f[i].getHeader() + '</option>';
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

            mapDiv = $('<div class="vis-mv-map">');
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
                self.curIndex = this.selectedIndex;
                self.setMapData(self.mapcols[self.curIndex]);
            });
        };

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

        this.setMapData = function (lstLatLng) {
            if (!isMapAvail)
                return;

            this.renderMap();
            deleteMarkers();
            bounds = null;
            bounds = new google.maps.LatLngBounds();


            google.maps.event.trigger(map, 'resize');
            // window.setTimeout(function () {
            var len = lstLatLng.length;
            for (var i = 0; i < len; i++) {
                if (!lstLatLng[i].Latitude || !lstLatLng[i].Longitude)
                    continue;
                var ll = null;
                try {

                    ll = new google.maps.LatLng(Number(lstLatLng[i].Latitude), Number(lstLatLng[i].Longitude));
                     addMarkerWithTimeout(ll, lstLatLng[i].msg, 1 * 100);

                   //addMarker(ll, lstLatLng[i].msg);
                    bounds.extend(ll);
                    map.fitBounds(bounds);
                }
                catch (e) {
                    console.log(e);
                }
            }
            map.fitBounds(bounds);
            self.setBusy(false);
            //}, 10);
        };

        this.dc = function () {
            removeMap();
            root.remove();

            this.cols = this.gc = this.aPanel = this.mapcols = null;
            this.mapFields = null;
            this.curIndex = 0;

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
        this.curIndex = 0;

        mapContainer.append(this.getRoot());
    };

    VMapView.prototype.refreshUI = function (width) {

        var records = this.gc.getSelectedRows();
        var len = records.length;
        if (records.length < 1 || this.cols.length < 1)
            return;
        var mapcols = [[]];

        for (var i = 0; i < this.cols.length; i++) {
            var colName = this.cols[i];
            var l = this.mapFields[i].getLookup();
            var locIds = [];
            for (var j = 0; j < len; j++) {
                var lid = records[j][colName.toLowerCase()];
                if (lid) {
                    var ll = l.getLatLng(lid);
                    if (ll) {
                        ll.msg = l.getDisplay(lid);
                        locIds.push(ll);
                    }
                }
            }
            this.mapcols[i] = locIds;
        }
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