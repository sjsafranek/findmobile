
function FindTracker() {
    
    this.map = new L.map('map', {zoomControl:false}).setView([22.59, -22.5], 1),
    
    this.current_location_marker = false,
    this.trackingLocations = {},

    this.findMarkerIcon = L.icon({
        iconUrl: 'images/findMarker.png',
        iconAnchor: [10, 40],
        shadowUrl: 'images/marker-shadow.png',
        shadowAnchor: [10, 40]
    }),

    this.init = function() {
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    },

    this.getFeature = function(location, callback) {
        // var results;
        var layer = location.split(":")[0];
        var feat = location.split(":")[1];
        var url = window.localStorage.getItem('geospatial') + "/api/v1/layer/" + layer + "/feature/" + feat;
        $.ajax({
            crossDomain: true,
            dataType: 'jsonp',
            type: "GET",
            async: false,
            data: {
                "apikey": window.localStorage.getItem('group'),
            },
            url: url,
            dataType: 'JSON',
            success: function (data) {
                callback(null, data);
            },
            error: function(xhr,errmsg,err) {
                callback(new Error(xhr.responseText));
            }
        });
    },

    this.placeMarker = function(location) {
        var self = this;
        try {
            if (!self.trackingLocations.hasOwnProperty(location)){
                self.getFeature(location, function(error, results) {
                    if (error) {
                        throw error;
                    } else {
                        self.trackingLocations[location] = results;
                    } 
                });
                // self.trackingLocations[location] = self.getFeature(location);
            }

            var current_location = self.trackingLocations[location];
            if (!self.current_location_marker) {
               self.current_location_marker = L.marker([
                    current_location.geometry.coordinates[1], 
                    current_location.geometry.coordinates[0]
                ], {icon: self.findMarkerIcon}).addTo(self.map);
            }
            else {
                var newLatLng = new L.LatLng(
                    current_location.geometry.coordinates[1], 
                    current_location.geometry.coordinates[0]
                );
                self.current_location_marker.setLatLng(newLatLng); 
            }
            self.map.setView(self.current_location_marker.getLatLng(), 18);
        }
        catch(err) {
            console.log(err);
        }
    }

}

function findTracker() {
    var tracker = new FindTracker();
    return tracker;
}
