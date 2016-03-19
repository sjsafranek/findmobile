
var user_info;
var id = null;
var learnCounter = 0;
var progress = 0.0;

var config = {
    frequency: 2 * 1000,
    learnLimit: 100,
};



function getXMLHttp(){
    var xmlhttp;
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=  new XMLHttpRequest();
        }
    else {// code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    return xmlhttp;
}

function SendWifiData(network_data){
    try {
        var server = window.localStorage.getItem('machinelearning') + "/track";
        var data = {
            "group": window.localStorage.getItem('group'),
            "username": window.localStorage.getItem('username'),
            "password": window.localStorage.getItem('password'),
            "location": "",
            "floor": "",
            "time": Date.now(),
            "wifi-fingerprint": network_data
        }
        var xmlhttp = getXMLHttp();
        xmlhttp.onreadystatechange=function() {
            message = xmlhttp.responseText;
            ShowDebugMessage(message);
            if (xmlhttp.readyState==4 && xmlhttp.status == 200) {
                try {
                    response = message.replace("NaN","0");
                    var response = JSON.parse(response);
                    var _currentLocation = response.position[0][0];
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
                    alert("tracking:" + err);
                }
            }
        }
        xmlhttp.open("POST", server);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(data));
    }
    catch(err) {
        alert(err);
        TrackWifiOff();
    }
}

function successCallback(networks) {
    var network_data = []
    for (var i=0; i < networks.length; i++){
        network_data.push({"mac": networks[i].BSSID,"rssi": networks[i].level})
    }
    SendWifiData(network_data);
}

function errorCallback(response) {
    var output = '';
    for (var property in response) {
      output += property + ': ' + response[property]+'; ';
    }
    ShowDebugMessage("error callback: " + output);
}

function TrackWifiOff() {
    if (id != null) {
        navigator.wifi.clearWatch(id);
        ShowDebugMessage("tracking off: " + id);
        id = null;
        document.getElementById('wifiOn').setAttribute('style','display:none;');
        document.getElementById('wifiOff').setAttribute('style','display:block;');
        cordova.plugins.backgroundMode.disable(); 
        cordova.plugins.backgroundMode.configure({
                text:'FIND is running.'
        });
    }
}

function TrackWifiOn() {
    TrackWifiOff();
    if (id == null) {
        document.getElementById('wifiOn').setAttribute('style','display:block;');
        document.getElementById('wifiOff').setAttribute('style','display:none;');
        id = navigator.wifi.watchAccessPoints(successCallback, errorCallback, {"frequency":config.frequency});
        ShowDebugMessage("tracking on: " + id);
        cordova.plugins.backgroundMode.enable(); 
        cordova.plugins.backgroundMode.configure({
                text:'Tracking'
        });
    }
}

function Logout() {
    window.localStorage.setItem('data', false)
    TrackWifiOff();
    window.location = "index.html";
}

function ToggleOptions() {
    if (document.getElementById("options").style.display == "none"){
        document.getElementById("options").style.display = "inline";
    }
    else {
        document.getElementById("options").style.display = "none";
    }
}

function ShowDebugMessage(message) {
    if (document.getElementById("debugOn").checked) {
        alert(message);
    }
}

function LearningPage() {
    window.location = "learning.html";
}


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        app.addUIListeners();
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
    addUIListeners: function(){
        document.getElementById("on").addEventListener("touchstart", TrackWifiOn);
        document.getElementById("off").addEventListener("touchstart", TrackWifiOff);
        document.getElementById("settings").addEventListener("touchstart", ToggleOptions);
        document.getElementById("logout").addEventListener("touchstart", Logout);
        document.getElementById("learning").addEventListener("touchstart", LearningPage);
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
    cordova.plugins.backgroundMode.onactivate = function () {
    }
}, false);
// cordova.plugins.backgroundMode.enable(); 