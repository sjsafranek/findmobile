
var user_info,
    learnCounter = 0,
    progress     = 0.0,
    ffp          = findFingerPrinting()
    tracker      = findTracker();

function reportLocation(response) {
    var message = JSON.stringify({
        "response": response,
        "type": typeof(response)
    });
    $("#messages").html(message);
    
    try {
        var response = JSON.parse(response);
        var _currentLocation = response.location;
        if (_currentLocation == "") {
            return;
        } 
        tracker.placeMarker(_currentLocation);
        var _floor = user_info.layers[_currentLocation.split(":")[0]];
        for (var i = 0; i < _floor.features.length; i++) {
            if (_floor.features[i].k == _currentLocation) {
                var _current = _floor.name + " - " + _floor.features[i].name;
                $('#current').html(_current);
                break;
            }
        }
    }
    catch(err){
        console.log(err);
        console.log(JSON.stringify({
            "data": {
                "response": response,
                "type": typeof(response),
            },
            "error": err,
            "function": "reportLocation"
        }));
    }
}

function TrackWifiOff() {
    try {
        document.getElementById('wifiOn').setAttribute('style','display:none;');
        document.getElementById('wifiOff').setAttribute('style','display:block;');
        ffp.stop();
    }
    catch(err) {
        alert(JSON.stringify({
            "data": null,
            "error": err,
            "function": "TrackWifiOff"
        }));
    }
}

function TrackWifiOn() {
    TrackWifiOff();
    try {
        document.getElementById('wifiOn').setAttribute('style','display:block;');
        document.getElementById('wifiOff').setAttribute('style','display:none;');
        ffp.track(reportLocation);
    }
    catch(err) {
        alert(JSON.stringify({
            "data": null,
            "error": err,
            "function": "TrackWifiOn"
        }));
    }
}

function ToggleOptions() {
    if (document.getElementById("options").style.display == "none"){
        document.getElementById("options").style.display = "inline";
    }
    else {
        document.getElementById("options").style.display = "none";
    }
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.addUIListeners();
        tracker.init();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /* Already logged in */
        if (window.localStorage.getItem('data')) {
            user_info = JSON.parse(window.localStorage.getItem('data'));
        }
    },
    /**
     * @Method AddUIListeners
     * Adds Event Listeners for UI elements
     */
    addUIListeners: function() {
        var isMobile = (/(android|ipad|iphone|ipod)/i.test(navigator.userAgent));
        var press = isMobile ? 'touchstart' : 'mousedown';
        document.getElementById("on").addEventListener(press, TrackWifiOn);
        document.getElementById("off").addEventListener(press, TrackWifiOff);
        document.getElementById("settings").addEventListener(press, ToggleOptions);
        document.getElementById("logout").addEventListener(press, function(){
            window.localStorage.setItem('data', false)
            TrackWifiOff();
            window.location = "index.html";
        });
        document.getElementById("learning").addEventListener(press, function(){
            window.location = "learning.html";
        });
    }
};

app.initialize();

document.addEventListener('deviceready', function () {
    // Android customization
    cordova.plugins.backgroundMode.setDefaults({ text:'FIND is running.'});
    // Enable background mode
    // cordova.plugins.backgroundMode.enable(); 
    cordova.plugins.backgroundMode.disable();
    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () {}
}, false);

