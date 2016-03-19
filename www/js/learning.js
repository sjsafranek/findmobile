
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

function Calculate() {
    $.ajax({
        crossDomain: true,
        dataType: 'jsonp',
        type: "GET",
        async: false,
        data: {
            "group": window.localStorage.getItem('group')
        },
        url: window.localStorage.getItem('machinelearning') + "/calculate",
        dataType: 'JSON',
        success: function (data) {
            alert(JSON.stringify(data));
        },
        error: function(xhr,errmsg,err) {
            alert(xhr.status,xhr.responseText,errmsg,err);
        }
    });
}

function SendWifiData(network_data){
    try {
        var server = window.localStorage.getItem('machinelearning');
        server += "/learn";
        var data = {
            "group": window.localStorage.getItem('group'),
            "username": window.localStorage.getItem('username'),
            "password": window.localStorage.getItem('password'),
            "location": $("#rooms").val(),
            "floor": $("#floors").val(),
            "time": Date.now(),
            "wifi-fingerprint": network_data
        }
        var xmlhttp = getXMLHttp();
        xmlhttp.onreadystatechange=function() {
            if (xmlhttp.readyState==4 && xmlhttp.status == 200) {
                learnCounter += 1;
                if(learnCounter > config.learnLimit) {
                    TrackWifiOff();
                    learnCounter = 0;
                    $('#progress').html('Calculating...');
                    Calculate();
                    $('#progress').html(0.0);
                    alert("Location learning complete!!!");
                }
                else {
                    progress = learnCounter/config.learnLimit;
                    $('#progress').html(progress * 100);
                }
            }
        }
        xmlhttp.open("POST", server);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(data));
    }
    catch(err){
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
                text:'Learning'
        });
    }
}

function BuildRoomSelector() {
    var x = document.getElementById("rooms");
    while (x.length > 0) {
        x.remove(x.length-1);
    }
    layer = user_info.layers[document.getElementById("floors").value];
    for (var r = 0; r < layer.features.length; r++) {
        var rooms = document.getElementById("rooms");
        var option = document.createElement("option");
        option.text = layer.features[r].name;
        option.value = layer.features[r].k;
        rooms.add(option);
    }
}

function BuildFloorSelector() {
    var x = document.getElementById("floors");
    while (x.length > 0) {
        x.remove(x.length-1);
    }
    for (var l in user_info.layers){
        var floors = document.getElementById("floors");
        var option = document.createElement("option");
        option.text = user_info.layers[l].name;
        option.value = l;
        floors.add(option);
    }
    BuildRoomSelector();
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

function TrackingPage() {
    window.location = "tracking.html";
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
            BuildFloorSelector();
        }
    },
    /**
     * @Method AddUIListeners
     * Adds Event Listeners for UI elements
     */
    addUIListeners: function(){
        document.getElementById("on").addEventListener("touchstart", TrackWifiOn);
        document.getElementById("off").addEventListener("touchstart", TrackWifiOff);
        document.getElementById("floors").addEventListener("change", BuildRoomSelector);
        document.getElementById("settings").addEventListener("touchstart", ToggleOptions);
        document.getElementById("logout").addEventListener("touchstart", Logout);
        document.getElementById("calculate").addEventListener("touchstart", Calculate);
        document.getElementById("tracking").addEventListener("touchstart", TrackingPage);
    }
};

app.initialize();

document.addEventListener('deviceready', function () {
    // Android customization
    cordova.plugins.backgroundMode.setDefaults({ text:'FIND is running.'});
    // Enable background mode
    cordova.plugins.backgroundMode.disable();
    // cordova.plugins.backgroundMode.enable(); 
    // Called when background mode has been activated
    cordova.plugins.backgroundMode.onactivate = function () {
    }
}, false);
// cordova.plugins.backgroundMode.enable(); 
// alert(cordova.plugins.backgroundMode.isEnabled(););