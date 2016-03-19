
var map = new L.map('map', {zoomControl:false}).setView([22.59, -22.5], 1);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getFeature(location) {
    var results;
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
            try {
                results = data;
            }
            catch(err){  console.log('Error:', err);  }
        },
        error: function(xhr,errmsg,err) {
            alert(xhr.status,xhr.responseText,errmsg,err);
        }
    });
    ShowDebugMessage(url + ": " + JSON.stringify(results));
    return results;
}

var current_location_marker = false;
var timer;
var trackingLocations = {};


var myIcon = L.icon({
    iconUrl: 'images/findMarker.png',
    iconAnchor: [10, 40],
    shadowUrl: 'images/marker-shadow.png',
    shadowAnchor: [10, 40]
});

function startTracking() {
    timer = window.setInterval(function() {
        $.getJSON(
            window.localStorage.getItem('machinelearning') + '/userlocs', {
            group: window.localStorage.getItem('group'),
            user: window.localStorage.getItem('username')
        }, 
        function(data) {

            try {

                var myUser = window.localStorage.getItem('username');

                ShowDebugMessage(JSON.stringify(data));

                if (!trackingLocations.hasOwnProperty(data.users[myUser].location)){
                    trackingLocations[data.users[myUser].location] = getFeature(data.users[myUser].location);
                }
                data.users[myUser].location;

                var current_location = trackingLocations[data.users[myUser].location];
                ShowDebugMessage(JSON.stringify(current_location));
                if (!current_location_marker) {
                   current_location_marker = L.marker([
                        current_location.geometry.coordinates[1], 
                        current_location.geometry.coordinates[0]
                    ], {icon: myIcon}).addTo(map);
                }
                else {
                    var newLatLng = new L.LatLng(
                        current_location.geometry.coordinates[1], 
                        current_location.geometry.coordinates[0]
                    );
                    current_location_marker.setLatLng(newLatLng); 
                }
                map.setView(current_location_marker.getLatLng(), 18);

            }
            catch(err) { alert("map tracking:" + err)}


        });
    }, 1000);
}

function stopTracking(){
    window.clearInterval(timer);
}

startTracking();
